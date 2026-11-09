// The render pipeline: real (accumulation) motion blur, then SMAA, bloom (only while
// something bright is on screen), tone mapping and the warm-gold grade. No depth of field:
// it softened the screen text in the close-ups.
//
// The scene lives in its own THREE.Scene (an R3F portal), so R3F's own per-frame render
// draws nothing; this component draws the frame in an effect, after every screen texture
// has been redrawn in a layout effect. No useFrame anywhere.
//
// Motion blur: everything that moves registers an "animator" (t → set transforms) and
// optional probe points. For each frame the pipeline measures how far the probes travel
// on screen during the shutter, picks a sample count (1 when nothing moves, so still
// moments stay perfectly sharp), renders the scene at that many sub-frame times and
// averages them in a half-float buffer.
import {createPortal, useThree} from '@react-three/fiber';
import {
  BloomEffect,
  BlendFunction,
  Effect,
  EffectComposer,
  EffectPass,
  Pass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';
import {createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useCurrentFrame, useDelayRender} from 'remotion';
import * as THREE from 'three';
import {BRAND, FormatId, TIMING} from '../data';
import {CameraFn, applyCamera} from '../lib/projection';
import {computeCamera} from '../lib/camera';
import {CameraContext} from './useScreenTexture';
import {MOTION_BLUR_RULE as MOTION_BLUR} from './motionBlurRule';
import {impact} from '../lib/story';

/** Frames where HDR elements need bloom. */
const bloomNeeded = (t: number) =>
  (t >= TIMING.streakStart - 2 && t <= TIMING.streakEnd + 12) || (t >= TIMING.impactAt - 2 && t <= TIMING.impactAt + 24);

/** Navy and gold for the two-tone impact frame (sRGB → linear-ish for the shader). */
const NAVY = new THREE.Color(BRAND.bgTop);
const GOLD = new THREE.Color(BRAND.goldA);

export {MOTION_BLUR_RULE as MOTION_BLUR} from './motionBlurRule';

type Animator = (t: number) => void;
type Probe = {object: THREE.Object3D; points: THREE.Vector3[]};

type Registry = {
  animators: Set<Animator>;
  probes: Set<Probe>;
};

const RegistryContext = createContext<Registry | null>(null);

/** Register a function that poses part of the scene at time t (frames, fractional). */
export const useAnimator = (fn: Animator) => {
  const reg = useContext(RegistryContext)!;
  const ref = useRef(fn);
  ref.current = fn;
  useLayoutEffect(() => {
    const a: Animator = (t) => ref.current(t);
    reg.animators.add(a);
    return () => {
      reg.animators.delete(a);
    };
  }, [reg]);
};

/** Register points (in an object's local space) whose screen motion decides the blur samples. */
export const useProbe = (object: React.RefObject<THREE.Object3D | null>, points: THREE.Vector3[]) => {
  const reg = useContext(RegistryContext)!;
  useLayoutEffect(() => {
    if (!object.current) return;
    const p = {object: object.current, points};
    reg.probes.add(p);
    return () => {
      reg.probes.delete(p);
    };
  }, [reg, object, points]);
};

const fullscreenVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/** Renders the scene at N sub-frame times and averages them into the input buffer. */
class AccumulatePass extends Pass {
  sub: THREE.WebGLRenderTarget;
  quad: THREE.Mesh;
  quadScene: THREE.Scene;
  quadCam: THREE.OrthographicCamera;
  mat: THREE.ShaderMaterial;
  times: number[] = [0];
  depthNeeded = false;
  apply: (t: number) => void = () => undefined;
  centre = 0;

  constructor(
    public scene3d: THREE.Scene,
    public cam: THREE.PerspectiveCamera,
  ) {
    super('AccumulatePass');
    this.needsSwap = false;
    this.sub = new THREE.WebGLRenderTarget(1, 1, {type: THREE.HalfFloatType, depthBuffer: true});
    this.mat = new THREE.ShaderMaterial({
      uniforms: {tex: {value: null}, weight: {value: 1}},
      vertexShader: fullscreenVert,
      fragmentShader: /* glsl */ `
        uniform sampler2D tex; uniform float weight; varying vec2 vUv;
        void main() { gl_FragColor = texture2D(tex, vUv) * weight; }`,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.quad = new THREE.Mesh(geo, this.mat);
    this.quad.frustumCulled = false;
    this.quadScene = new THREE.Scene();
    this.quadScene.add(this.quad);
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  setSize(w: number, h: number) {
    this.sub.setSize(w, h);
  }

  render(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget) {
    const n = this.times.length;
    if (n === 1) {
      this.apply(this.times[0]);
      renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
      renderer.clear(true, true, false);
      renderer.render(this.scene3d, this.cam);
      return;
    }
    renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, false);
    for (const t of this.times) {
      this.apply(t);
      renderer.setRenderTarget(this.sub);
      renderer.clear(true, true, false);
      renderer.render(this.scene3d, this.cam);
      this.mat.uniforms.tex.value = this.sub.texture;
      this.mat.uniforms.weight.value = 1 / n;
      renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
      renderer.render(this.quadScene, this.quadCam);
    }
    // Depth for the depth of field comes from the centre of the shutter.
    this.apply(this.centre);
    if (this.depthNeeded) {
      const gl = renderer.getContext();
      renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
      renderer.clearDepth();
      gl.colorMask(false, false, false, false);
      renderer.state.buffers.color.setLocked(true);
      renderer.render(this.scene3d, this.cam);
      renderer.state.buffers.color.setLocked(false);
      gl.colorMask(true, true, true, true);
    }
  }
}

/** The grade: a warm-gold lift, cool navy shadows, a gentle S-curve, and the navy/gold impact frame. */
class GradeEffect extends Effect {
  constructor() {
    super(
      'GradeEffect',
      /* glsl */ `
      uniform float impact;
      uniform vec3 navy;
      uniform vec3 gold;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = clamp(inputColor.rgb, 0.0, 1.0);
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        // Warm gold highlights, cool navy shadows (split tone), then a gentle S-curve.
        c += vec3(0.022, 0.012, -0.012) * smoothstep(0.35, 1.0, l);
        c += vec3(-0.004, 0.0, 0.010) * (1.0 - smoothstep(0.0, 0.3, l));
        c = mix(c, c * c * (3.0 - 2.0 * c), 0.12);
        // Impact frame: a two-tone navy/gold silhouette.
        vec3 hit = mix(navy, gold, smoothstep(0.045, 0.085, l));
        c = mix(c, hit, impact);
        outputColor = vec4(c, inputColor.a);
      }`,
      {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ['impact', new THREE.Uniform(0)],
          ['navy', new THREE.Uniform(new THREE.Vector3(NAVY.r, NAVY.g, NAVY.b))],
          ['gold', new THREE.Uniform(new THREE.Vector3(GOLD.r, GOLD.g, GOLD.b))],
        ]),
      },
    );
  }
}

export type PipelineProps = {
  children: React.ReactNode;
  fmt: FormatId;
  /** The reel's camera (this reel's by default). */
  camera?: CameraFn;
  /** Frames that need bloom (this reel's by default). */
  bloom?: (t: number) => boolean;
  /** Strength of the two-tone impact frame, 0–1 (this reel's by default). */
  impactAt?: (t: number) => number;
};

export const Pipeline: React.FC<PipelineProps> = ({children, fmt, camera: cameraFn = computeCamera, bloom = bloomNeeded, impactAt = impact}) => {
  const frame = useCurrentFrame();
  const {gl, size} = useThree();
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.PerspectiveCamera(30, size.width / size.height, 0.05, 60), [size.width, size.height]);
  const registry = useMemo<Registry>(() => ({animators: new Set(), probes: new Set()}), []);

  const pipe = useMemo(() => {
    gl.autoClear = false;
    const composer = new EffectComposer(gl, {frameBufferType: THREE.HalfFloatType, multisampling: 0});
    const accum = new AccumulatePass(scene, camera);
    const smaaEffect = new SMAAEffect({preset: SMAAPreset.HIGH});
    const smaa = new EffectPass(camera, smaaEffect);
    const bloom = new BloomEffect({mipmapBlur: true, luminanceThreshold: 1.15, luminanceSmoothing: 0.1, intensity: 0.6, radius: 0.6, resolutionScale: 0.5});
    const grade = new GradeEffect();
    const bloomPass = new EffectPass(camera, bloom);
    const finalPass = new EffectPass(camera, new ToneMappingEffect({mode: ToneMappingMode.NEUTRAL}), grade);
    composer.addPass(accum);
    composer.addPass(smaa);
    composer.addPass(bloomPass);
    composer.addPass(finalPass);
    composer.setSize(size.width, size.height, false);
    accum.setSize(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    return {composer, accum, grade, smaaEffect, bloomPass};
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => () => pipe.composer.dispose(), [pipe]);

  // SMAA decodes its two lookup images asynchronously: hold the render until they are in.
  const {delayRender, continueRender} = useDelayRender();
  const [smaaReady, setSmaaReady] = useState(false);
  useLayoutEffect(() => {
    const handle = delayRender('Loading SMAA lookup textures');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setSmaaReady(true);
      continueRender(handle);
    };
    const w = (pipe.smaaEffect as unknown as {weightsMaterial: {searchTexture: unknown; areaTexture: unknown}}).weightsMaterial;
    if (w.searchTexture && w.areaTexture) finish();
    else (pipe.smaaEffect as unknown as THREE.EventDispatcher<{load: object}>).addEventListener('load', finish);
    return () => {
      if (!done) continueRender(handle);
    };
  }, [pipe, delayRender, continueRender]);

  useEffect(() => {
    if (!smaaReady) return;
    const t0 = frame;
    const applyCam = (t: number) => applyCamera(camera, t, fmt, size.width, size.height, cameraFn);
    const applyAll = (t: number) => {
      for (const a of registry.animators) a(t);
      scene.updateMatrixWorld();
      return applyCam(t);
    };

    // How far do the probes move on screen during the shutter?
    const project = (t: number) => {
      applyAll(t);
      const out: THREE.Vector2[] = [];
      const v = new THREE.Vector3();
      for (const p of registry.probes) {
        for (const pt of p.points) {
          v.copy(pt).applyMatrix4(p.object.matrixWorld).project(camera);
          if (v.z < -1 || v.z > 1) continue;
          out.push(new THREE.Vector2((v.x * 0.5 + 0.5) * size.width, (0.5 - v.y * 0.5) * size.height));
        }
      }
      return out;
    };
    const half = MOTION_BLUR.shutter / 2;
    const a = project(t0 - half);
    const b = project(t0 + half);
    let travel = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const pa = a[i];
      const pb = b[i];
      // Only count points that are on (or near) the frame.
      const on = (p: THREE.Vector2) => p.x > -200 && p.x < size.width + 200 && p.y > -200 && p.y < size.height + 200;
      if (on(pa) || on(pb)) travel = Math.max(travel, pa.distanceTo(pb));
    }
    const samples = MOTION_BLUR.samples(travel);
    const times = samples === 1 ? [t0] : Array.from({length: samples}, (_, i) => t0 + MOTION_BLUR.shutter * ((i + 0.5) / samples - 0.5));

    applyAll(t0);
    pipe.accum.times = times;
    pipe.accum.centre = t0;
    pipe.accum.apply = applyAll;
    pipe.accum.depthNeeded = false;
    // Bloom only runs while something is bright enough to bloom (the streak, the impact, the pulses).
    pipe.bloomPass.enabled = bloom(t0);
    (pipe.grade.uniforms.get('impact') as THREE.Uniform).value = impactAt(t0);
    pipe.composer.render();
    if (samples > 1) console.log(`[mb] frame ${t0} samples ${samples}`);
  }, [frame, fmt, pipe, scene, camera, registry, size.width, size.height, smaaReady, cameraFn, bloom, impactAt]);

  return (
    <CameraContext.Provider value={cameraFn}>
      <RegistryContext.Provider value={registry}>{createPortal(children, scene)}</RegistryContext.Provider>
    </CameraContext.Provider>
  );
};
