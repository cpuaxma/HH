// The render pipeline: real (accumulation) motion blur, then SMAA, depth of field,
// bloom, tone mapping and the grade.
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
  DepthOfFieldEffect,
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
import {FormatId, TIMING} from '../data';
import {applyCamera} from '../lib/projection';
import {DBG} from '../debug';
import {impact} from '../lib/story';

/** Frames where HDR elements need bloom. */
const bloomNeeded = (t: number) =>
  (t >= TIMING.streakStart - 2 && t <= TIMING.streakEnd + 12) || (t >= TIMING.impactAt - 2 && t <= TIMING.impactAt + 24);

export const MOTION_BLUR = {
  /** Shutter in frames (0.5 = 180° shutter). */
  shutter: 0.5,
  /** One sample per this many pixels of on-screen travel during the shutter. */
  pxPerSample: 2.2,
  maxSamples: 16,
};

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

/** The grade: a warm lift, a gentle S-curve, and the red/white impact frame. */
class GradeEffect extends Effect {
  constructor() {
    super(
      'GradeEffect',
      /* glsl */ `
      uniform float impact;
      uniform float warmth;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = clamp(inputColor.rgb, 0.0, 1.0);
        // Warm grade: highlights a touch creamy, shadows lifted towards amber.
        c *= vec3(1.0 + 0.025 * warmth, 1.0 + 0.004 * warmth, 1.0 - 0.035 * warmth);
        c += vec3(0.012, 0.007, 0.0) * warmth * (1.0 - c);
        // Gentle S-curve for depth.
        c = mix(c, c * c * (3.0 - 2.0 * c), 0.14);
        // Impact frame: a two-tone red/off-white silhouette.
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        vec3 hit = mix(vec3(0.79, 0.045, 0.016), vec3(0.906, 0.89, 0.855), smoothstep(0.38, 0.46, l));
        c = mix(c, hit, impact);
        outputColor = vec4(c, inputColor.a);
      }`,
      {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, THREE.Uniform>([
          ['impact', new THREE.Uniform(0)],
          ['warmth', new THREE.Uniform(1)],
        ]),
      },
    );
  }
}

export const Pipeline: React.FC<{children: React.ReactNode; fmt: FormatId}> = ({children, fmt}) => {
  const frame = useCurrentFrame();
  const {gl, size} = useThree();
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.PerspectiveCamera(30, size.width / size.height, 0.05, 60), [size.width, size.height]);
  const registry = useMemo<Registry>(() => ({animators: new Set(), probes: new Set()}), []);

  const pipe = useMemo(() => {
    gl.autoClear = false;
    const composer = new EffectComposer(gl, {frameBufferType: DBG.has('ldr') ? THREE.UnsignedByteType : THREE.HalfFloatType, multisampling: 0});
    const accum = new AccumulatePass(scene, camera);
    const smaaEffect = new SMAAEffect({preset: SMAAPreset.HIGH});
    const smaa = new EffectPass(camera, smaaEffect);
    const dof = new DepthOfFieldEffect(camera, {worldFocusRange: 0.6, bokehScale: 0, resolutionScale: 0.25});
    dof.target = new THREE.Vector3();
    const dofPass = new EffectPass(camera, dof);
    const bloom = new BloomEffect({mipmapBlur: true, luminanceThreshold: 1.15, luminanceSmoothing: 0.1, intensity: 0.6, radius: 0.6, resolutionScale: 0.5});
    const grade = new GradeEffect();
    const bloomPass = new EffectPass(camera, bloom);
    const finalPass = new EffectPass(camera, new ToneMappingEffect({mode: ToneMappingMode.NEUTRAL}), grade);
    composer.addPass(accum);
    if (DBG.has('noPost')) { accum.renderToScreen = true; }
    // Depth of field first (it samples the depth attached to the first buffer), then SMAA.
    if (!DBG.has('noPost')) {
    composer.addPass(dofPass);
    composer.addPass(smaa);
    composer.addPass(bloomPass);
    composer.addPass(finalPass);
    }
    composer.setSize(size.width, size.height, false);
    accum.setSize(size.width, size.height);
    return {composer, accum, dof, dofPass, grade, smaaEffect, bloomPass};
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
    const applyCam = (t: number) => applyCamera(camera, t, fmt, size.width, size.height);
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
    const samples = Math.max(1, Math.min(MOTION_BLUR.maxSamples, Math.ceil(travel / MOTION_BLUR.pxPerSample)));
    const times = samples === 1 ? [t0] : Array.from({length: samples}, (_, i) => t0 + MOTION_BLUR.shutter * ((i + 0.5) / samples - 0.5));

    const c = applyAll(t0);
    if (DBG.has('empty')) scene.children.forEach((o) => (o.visible = false));
    pipe.accum.times = times;
    pipe.accum.centre = t0;
    pipe.accum.apply = applyAll;
    const dofOn = c.dof > 0.02;
    pipe.dofPass.enabled = dofOn;
    pipe.accum.depthNeeded = dofOn;
    pipe.dof.target!.set(...c.target);
    pipe.dof.bokehScale = 2.6 * c.dof;
    // Bloom only runs while something is bright enough to bloom (the streak, the impact, the pulses).
    pipe.bloomPass.enabled = bloomNeeded(t0);
    (pipe.grade.uniforms.get('impact') as THREE.Uniform).value = impact(t0);
    const tr = performance.now();
    pipe.composer.render();
    const px = new Uint8Array(4);
    const glc = gl.getContext();
    glc.readPixels(0, 0, 1, 1, glc.RGBA, glc.UNSIGNED_BYTE, px);
    console.log(`[pipe] frame ${t0} samples ${samples} render ${(performance.now() - tr).toFixed(0)}ms`);
    (window as unknown as {__mbSamples?: number}).__mbSamples = samples;
  }, [frame, fmt, pipe, scene, camera, registry, size.width, size.height, smaaReady]);

  return <RegistryContext.Provider value={registry}>{createPortal(children, scene)}</RegistryContext.Provider>;
};
