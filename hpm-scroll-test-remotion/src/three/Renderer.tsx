// The renderer: for every video frame it renders several sub-frame samples across a
// 180° shutter, each re-posed from the pure timing functions (camera, phone, scroll),
// and averages them in a half-float buffer: real motion blur, plus sub-pixel jitter
// for anti-aliasing. Still moments have all samples at the same instant, so no blur.
// Then one pass grades, vignettes and adds grain. No useFrame anywhere.
import {useThree} from '@react-three/fiber';
import {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {useCurrentFrame, useDelayRender} from 'remotion';
import * as THREE from 'three';
import {LOOK} from '../data';
import {fontsReady} from '../fonts';
import {desatAt, flashAt, neonAt} from '../lib/look';
import {feedScroll, feedSpeed, heroLift, heroScroll, heroTop, touchAt} from '../lib/scroll';
import {applyCamera, cameraAt, phoneAt, shotRange} from '../lib/shots';
import {accumulateFrag, fullscreenVert, presentFrag} from './shaders';
import {World, buildWorld} from './world';

const halton = (i: number, b: number) => {
  let f = 1;
  let r = 0;
  while (i > 0) {
    f /= b;
    r += f * (i % b);
    i = Math.floor(i / b);
  }
  return r;
};

const quad = new THREE.PlaneGeometry(2, 2);
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fullscreen = (frag: string, uniforms: Record<string, THREE.IUniform>, blending?: THREE.Blending) => {
  const m = new THREE.ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: frag,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  if (blending !== undefined) {
    m.blending = THREE.CustomBlending;
    m.blendEquation = THREE.AddEquation;
    m.blendSrc = THREE.OneFactor;
    m.blendDst = THREE.OneFactor;
  }
  const mesh = new THREE.Mesh(quad, m);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return {scene, material: m};
};

/**
 * The phone's on-screen motion over [a, b] as an affine field (px, y up from the frame centre):
 * motion(p) = m0 + A·(p − c). Fitted from three points on the phone, so it captures
 * pans, dolly zooms, rolls and the phone's own moves. `max` is the largest corner motion.
 */
const PHONE_PTS = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.38, 0, 0), new THREE.Vector3(0, 0.8, 0)];
const CORNERS = [
  new THREE.Vector3(0.38, 0.8, 0),
  new THREE.Vector3(-0.38, 0.8, 0),
  new THREE.Vector3(0.38, -0.8, 0),
  new THREE.Vector3(-0.38, -0.8, 0),
];
const motionCam = new THREE.PerspectiveCamera();
const projectPts = (t: number, pts: THREE.Vector3[], w: number, h: number) => {
  const ph = phoneAt(t);
  applyCamera(motionCam, cameraAt(t), w / h);
  return pts.map((v) => {
    const p = v.clone().applyMatrix4(ph.matrix).project(motionCam);
    return new THREE.Vector2(p.x * 0.5 * w, p.y * 0.5 * h);
  });
};
export const motionField = (a: number, b: number, w: number, h: number) => {
  const pa = projectPts(a, PHONE_PTS, w, h);
  const pb = projectPts(b, PHONE_PTS, w, h);
  const m = pb.map((p, i) => p.clone().sub(pa[i]));
  const c = pa[0].clone().add(pb[0]).multiplyScalar(0.5);
  const d1 = pa[1].clone().add(pb[1]).multiplyScalar(0.5).sub(c);
  const d2 = pa[2].clone().add(pb[2]).multiplyScalar(0.5).sub(c);
  const e1 = m[1].clone().sub(m[0]);
  const e2 = m[2].clone().sub(m[0]);
  // Solve A·[d1 d2] = [e1 e2].
  const det = d1.x * d2.y - d2.x * d1.y;
  let A = [0, 0, 0, 0];
  if (Math.abs(det) > 1e-6) {
    const inv = [d2.y / det, -d2.x / det, -d1.y / det, d1.x / det]; // rows of [d1 d2]^-1
    A = [e1.x * inv[0] + e2.x * inv[2], e1.x * inv[1] + e2.x * inv[3], e1.y * inv[0] + e2.y * inv[2], e1.y * inv[1] + e2.y * inv[3]];
  }
  const ca = projectPts(a, CORNERS, w, h);
  const cb = projectPts(b, CORNERS, w, h);
  const max = Math.max(m[0].length(), ...ca.map((p, i) => cb[i].clone().sub(p).length()));
  return {c, m0: m[0], A, max};
};

/** How many samples a frame gets: more when things move fast on screen. */
export const samplesFor = (frame: number) => {
  const [lo, hi] = shotRange(frame);
  const a = Math.max(lo === 0 ? -10 : lo, frame - LOOK.shutter / 2);
  const b = Math.min(hi - 1e-3, frame + LOOK.shutter / 2);
  const m = motionField(a, b, 1080, 1920).max;
  if (m < 1.5) return 4;
  if (m < 30) return 6;
  if (m < 120) return 8;
  return 12;
};

const applyState = (world: World, cam: THREE.PerspectiveCamera, t: number, k: number, jitter: [number, number], size: [number, number]) => {
  const ph = phoneAt(t);
  world.phone.matrix.copy(ph.matrix);
  world.phone.matrixWorldNeedsUpdate = true;
  applyCamera(cam, cameraAt(t), size[0] / size[1], jitter, size);
  const u = world.screen.uniforms;
  const slice = LOOK.shutter / k;
  u.uScroll.value = feedScroll(t);
  u.uHeroTop.value = heroTop(t);
  u.uLift.value = heroLift(t);
  u.uBlur.value = Math.abs(feedSpeed(t)) * slice;
  u.uHeroBlur.value = Math.abs((heroScroll(t + 0.25) - heroScroll(t - 0.25)) * 2) * slice;
  u.uDesat.value = desatAt(t);
  const touch = touchAt(t);
  (u.uTouch.value as THREE.Vector4).set(touch.x, touch.y, touch.alpha, touch.press);
  u.uNeon.value = neonAt(t);
  const spheres = world.studio.uniforms.uSpheres.value as THREE.Vector3[];
  world.sphereLocal.forEach((v, i) => spheres[i].copy(v).applyMatrix4(ph.matrix));
  (world.studio.uniforms.uPhoneC.value as THREE.Vector3).copy(ph.position);
};

export const Renderer: React.FC<{draft?: boolean}> = ({draft}) => {
  const frame = useCurrentFrame();
  const {gl} = useThree();
  const {delayRender, continueRender} = useDelayRender();
  const [handle] = useState(() => delayRender('Building the 3D world (fonts, textures)'));
  const [world, setWorld] = useState<World | null>(null);

  useEffect(() => {
    let alive = true;
    fontsReady()
      .then(() => {
        if (alive) setWorld(buildWorld(gl));
      })
      .catch((e) => {
        console.error(e);
      });
    return () => {
      alive = false;
    };
  }, [gl]);

  const passes = useMemo(() => {
    const acc = fullscreen(accumulateFrag, {
      tSample: {value: null},
      uWeight: {value: 1},
      uDir: {value: new THREE.Vector2()},
      uC: {value: new THREE.Vector2()},
      uJac: {value: new THREE.Matrix2()},
      uTaps: {value: 1},
    }, THREE.CustomBlending);
    const present = fullscreen(presentFrag, {
      tAcc: {value: null},
      uFlash: {value: 0},
      uVignette: {value: 0},
      // Only a tiny dither here: the visible grain is the HTML finish layer, over the type too.
      uGrain: {value: 0.006},
      uSeed: {value: 0},
    });
    return {acc, present, cam: new THREE.PerspectiveCamera(), targets: null as null | {w: number; h: number; sample: THREE.WebGLRenderTarget; accum: THREE.WebGLRenderTarget}};
  }, []);

  useLayoutEffect(() => {
    if (!world) return;
    gl.autoClear = false;
    const size = gl.getDrawingBufferSize(new THREE.Vector2());
    const w = size.x;
    const h = size.y;
    if (!passes.targets || passes.targets.w !== w || passes.targets.h !== h) {
      passes.targets?.sample.dispose();
      passes.targets?.accum.dispose();
      const opts = {type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false};
      passes.targets = {
        w,
        h,
        sample: new THREE.WebGLRenderTarget(w, h, {...opts, depthBuffer: true}),
        accum: new THREE.WebGLRenderTarget(w, h, {...opts, depthBuffer: false}),
      };
    }
    const {sample, accum} = passes.targets;
    const k = draft ? 1 : samplesFor(frame);
    const [lo, hi] = shotRange(frame);
    const a = Math.max(lo === 0 ? -10 : lo, frame - LOOK.shutter / 2);
    const b = Math.min(hi - 1e-3, frame + LOOK.shutter / 2);
    // Never blur across a hard cut: samples stay inside the current shot.

    gl.setRenderTarget(accum);
    gl.setClearColor(0x000000, 1);
    gl.clear(true, true, true);
    const au = passes.acc.material.uniforms;
    for (let i = 0; i < k; i++) {
      const t = a + ((i + 0.5) / k) * (b - a);
      const jitter: [number, number] = [halton(i + 1, 2) - 0.5, halton(i + 1, 3) - 0.5];
      applyState(world, passes.cam, t, k, jitter, [w, h]);
      gl.setRenderTarget(sample);
      gl.clear(true, true, true);
      gl.render(world.scene, passes.cam);
      // Fill the gap to the next sample with a short blur along the on-screen motion.
      const slice = (b - a) / k;
      au.tSample.value = sample.texture;
      au.uWeight.value = 1 / k;
      if (slice > 1e-4) {
        const f = motionField(t - slice / 2, t + slice / 2, w, h);
        (au.uDir.value as THREE.Vector2).set(f.m0.x / w, f.m0.y / h);
        (au.uC.value as THREE.Vector2).set(f.c.x / w + 0.5, f.c.y / h + 0.5);
        // Jacobian in uv units: d(motion_uv)/d(uv).
        (au.uJac.value as THREE.Matrix2).set(f.A[0], (f.A[1] * h) / w, (f.A[2] * w) / h, f.A[3]);
        au.uTaps.value = f.max < 1.5 ? 1 : Math.min(16, Math.ceil(f.max / 1.5));
      } else {
        au.uTaps.value = 1;
      }
      gl.setRenderTarget(accum);
      gl.render(passes.acc.scene, ortho);
    }
    const pu = passes.present.material.uniforms;
    pu.tAcc.value = accum.texture;
    pu.uFlash.value = flashAt(frame);
    pu.uSeed.value = (frame * 7.31) % 101;
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 1);
    gl.clear(true, true, true);
    gl.render(passes.present.scene, ortho);
  }, [world, frame, gl, passes, draft]);

  useEffect(() => {
    if (world) continueRender(handle);
  }, [world, continueRender, handle]);

  return null;
};
