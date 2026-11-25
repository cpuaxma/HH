import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {COLORS} from '../config';
import {EASE, clamp, impulse, prog, rnd} from '../lib/anim';
import {qrot} from './fall';
import {CELLS, PILLAR_H} from './grid';
import {leverAngle, leverInfo} from './mechanisms/lever';
import {peakState} from './mechanisms/fomo';
import {rippleRadius, rumorOrigin} from './mechanisms/rumor';
import {PLAN} from './plan';
import {worldAt} from './world';

/** Radial-gradient sprite texture (shared by every glow). */
const glowTexture = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    grd.addColorStop(0.45, 'rgba(255,255,255,0.12)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

const additive = (color: THREE.Color | string, opacity = 1) =>
  new THREE.MeshBasicMaterial({color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: true});

const topOf = (i: number, f: number) => {
  const p = worldAt(f).pillars[i];
  const [x, y, z] = qrot({x: p.qx, y: p.qy, z: p.qz, w: p.qw}, [0, PILLAR_H * p.sy, 0]);
  return new THREE.Vector3(p.x + x, p.y + y, p.z + z);
};

// ── Revenge chain: jagged red arcs leaping pillar to pillar ──
const SEGS = 9;
const MAX_ARCS = 4;
const ChainArcs: React.FC<{t: (typeof PLAN.traps)[number]}> = ({t}) => {
  const frame = useCurrentFrame();
  const core = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const sprites = useRef<THREE.Group>(null);
  const mats = useMemo(
    () => ({
      core: additive(new THREE.Color(COLORS.red).multiplyScalar(5).add(new THREE.Color(0.6, 0.25, 0.15))),
      halo: additive(new THREE.Color(COLORS.red).multiplyScalar(1.4), 0.55),
      geo: new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5),
      sprite: new THREE.SpriteMaterial({map: glowTexture(), color: new THREE.Color(COLORS.red).multiplyScalar(3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}),
    }),
    [],
  );
  const d = t.prepared.data as {strike: number[]};
  useLayoutEffect(() => {
    const lt = frame - t.start;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    let n = 0;
    const spr = sprites.current!.children as THREE.Sprite[];
    spr.forEach((s) => (s.visible = false));
    for (let k = 1; k < d.strike.length && n < MAX_ARCS; k++) {
      const s = d.strike[k];
      const travel = Math.min(4, (s - d.strike[k - 1]) * 0.75);
      if (lt < s - travel || lt > s + 6) continue;
      const head = EASE.out(prog(lt, s - travel, s));
      const fade = 1 - prog(lt, s + 1, s + 6);
      const A = topOf(t.prepared.victims[k - 1], frame);
      const B = topOf(t.prepared.victims[k], frame);
      const jitterSeed = Math.floor(frame / 2);
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= SEGS; j++) {
        const u = (j / SEGS) * head;
        const p = A.clone().lerp(B, u);
        const env = Math.sin(Math.PI * (j / SEGS));
        p.y += env * (0.55 + 0.25 * rnd(`arc-h-${k}`));
        p.x += (rnd(`arc-x-${k}-${j}-${jitterSeed}`) - 0.5) * 0.32 * env;
        p.y += (rnd(`arc-y-${k}-${j}-${jitterSeed}`) - 0.5) * 0.24 * env;
        p.z += (rnd(`arc-z-${k}-${j}-${jitterSeed}`) - 0.5) * 0.32 * env;
        pts.push(p);
      }
      for (let j = 0; j < SEGS; j++) {
        const a = pts[j];
        const b = pts[j + 1];
        const len = a.distanceTo(b);
        const w = 0.035 * fade + 0.01;
        // Matrix4.lookAt(eye, target) aims +z along eye − target, so (b, a) runs +z from a to b.
        const rot = new THREE.Matrix4().lookAt(b, a, new THREE.Vector3(0, 1, 0));
        const mm = new THREE.Matrix4().compose(a, new THREE.Quaternion().setFromRotationMatrix(rot), new THREE.Vector3(w, w, len));
        core.current!.setMatrixAt(n * SEGS + j, fade > 0.02 ? mm : zero);
        const mh = new THREE.Matrix4().compose(a, new THREE.Quaternion().setFromRotationMatrix(rot), new THREE.Vector3(w * 5, w * 5, len));
        halo.current!.setMatrixAt(n * SEGS + j, fade > 0.02 ? mh : zero);
      }
      const sp = spr[n];
      sp.visible = true;
      sp.position.copy(pts[pts.length - 1]);
      sp.scale.setScalar(1.6 * fade * (0.8 + 0.4 * head));
      n++;
    }
    for (let k = n; k < MAX_ARCS; k++)
      for (let j = 0; j < SEGS; j++) {
        core.current!.setMatrixAt(k * SEGS + j, zero);
        halo.current!.setMatrixAt(k * SEGS + j, zero);
      }
    core.current!.instanceMatrix.needsUpdate = true;
    halo.current!.instanceMatrix.needsUpdate = true;
  }, [frame, t, d]);

  // The first pillar's rage glow.
  const lt = frame - t.start;
  const first = topOf(t.prepared.victims[0], frame);
  const rage = prog(lt, 4, d.strike[0]) * (1 - prog(lt, d.strike[0] + 2, d.strike[0] + 14));
  return (
    <>
      <instancedMesh ref={core} args={[mats.geo, mats.core, MAX_ARCS * SEGS]} frustumCulled={false} renderOrder={8} />
      <instancedMesh ref={halo} args={[mats.geo, mats.halo, MAX_ARCS * SEGS]} frustumCulled={false} renderOrder={7} />
      <group ref={sprites}>
        {Array.from({length: MAX_ARCS}, (_, i) => (
          <sprite key={i} material={mats.sprite} renderOrder={9} />
        ))}
      </group>
      {rage > 0.01 ? <sprite material={mats.sprite} position={first} scale={2.4 * rage * (0.85 + 0.15 * Math.sin(lt * 1.3))} renderOrder={9} /> : null}
    </>
  );
};

// ── Lever: a red-hot fulcrum line under the plank ──
const Fulcrum: React.FC<{t: (typeof PLAN.traps)[number]}> = ({t}) => {
  const frame = useCurrentFrame();
  const lt = frame - t.start;
  const d = leverInfo(t.prepared);
  const cells = d.cells.map((i) => CELLS[i]);
  const zs = cells.map((c) => c.z);
  const z0 = Math.min(...zs) - 0.5;
  const z1 = Math.max(...zs) + 0.5;
  const mat = useMemo(() => additive(new THREE.Color(COLORS.red).multiplyScalar(4)), []);
  const spriteMat = useMemo(() => new THREE.SpriteMaterial({map: glowTexture(), color: new THREE.Color(COLORS.red).multiplyScalar(2.5), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}), []);
  const on = prog(lt, 4, 16) * (1 - prog(lt, d.snap + 2, d.snap + 22));
  const strain = Math.abs(leverAngle(lt)) / 0.42;
  const snap = impulse(lt, d.snap, 20);
  const i = on * (0.5 + 0.5 * strain) + 2.5 * snap;
  if (i < 0.01) return null;
  mat.opacity = clamp(i);
  return (
    <group position={[d.pivotX, -0.16, (z0 + z1) / 2]}>
      <mesh material={mat} renderOrder={7}>
        <boxGeometry args={[0.05 + 0.05 * snap, 0.05, z1 - z0]} />
      </mesh>
      <sprite material={spriteMat} scale={[1.2 + 3 * snap, 1.2 + 3 * snap, 1]} renderOrder={9} />
    </group>
  );
};

// ── FOMO: the glowing peak beyond the far edge ──
const peakMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {uI: {value: 1}, uA: {value: new THREE.Color(COLORS.goldDark)}, uB: {value: new THREE.Color('#FFF4D6')}},
    vertexShader: /* glsl */ `varying float vY; varying float vF;
      void main(){ vY = position.y + 0.5; vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 n = normalize(mat3(modelMatrix) * normal); vec3 v = normalize(cameraPosition - wp.xyz);
        vF = 0.35 + 0.65 * pow(1.0 - abs(dot(n, v)), 1.5);
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `uniform float uI; uniform vec3 uA; uniform vec3 uB; varying float vY; varying float vF;
      void main(){ vec3 c = mix(uA, uB, pow(vY, 1.4)) * (0.4 + 2.6 * pow(vY, 3.0)) * vF;
        gl_FragColor = vec4(c * uI * smoothstep(0.0, 0.25, vY), 1.0); }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

const Peak: React.FC<{t: (typeof PLAN.traps)[number]}> = ({t}) => {
  const frame = useCurrentFrame();
  const ps = peakState(t.prepared, frame - t.start);
  const mats = useMemo(
    () => ({
      peak: peakMaterial(),
      beam: additive(new THREE.Color('#FFE9B8').multiplyScalar(0.35), 0.5),
      glow: new THREE.SpriteMaterial({map: glowTexture(), color: new THREE.Color('#FFE6B0').multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}),
      halo: new THREE.SpriteMaterial({map: glowTexture(), color: new THREE.Color(COLORS.gold).multiplyScalar(0.9), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}),
    }),
    [],
  );
  if (ps.h < 0.005 && ps.glow < 0.005) return null;
  const H = 6.2 * ps.h;
  const base = -3.2;
  const tipY = base + H;
  mats.peak.uniforms.uI.value = ps.glow * 1.3;
  mats.beam.opacity = 0.4 * ps.glow;
  mats.glow.opacity = ps.glow;
  mats.halo.opacity = ps.glow * 0.7;
  return (
    <group position={[ps.x, 0, ps.z]}>
      <mesh material={mats.peak} position={[0, base + H / 2, 0]} scale={[1, H, 1]} renderOrder={7}>
        <coneGeometry args={[1.05, 1, 4, 1, true]} />
      </mesh>
      <mesh material={mats.beam} position={[0, tipY + 6, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.05, 0.4, 12, 16, 1, true]} />
      </mesh>
      <sprite material={mats.glow} position={[0, tipY, 0]} scale={[3.2, 3.2, 1]} renderOrder={9} />
      <sprite material={mats.halo} position={[0, tipY - H * 0.3, 0]} scale={[9, 9, 1]} renderOrder={9} />
    </group>
  );
};

// ── Expanding floor rings: the hook's gold light-up ripple and the rumour's whisper ripple ──
const Ring: React.FC<{x: number; z: number; r: number; color: string | THREE.Color; o: number; w?: number}> = ({x, z, r, color, o, w = 0.04}) => {
  const mat = useMemo(() => additive(color), [color]);
  mat.opacity = clamp(o);
  if (r <= 0.01 || o <= 0.005) return null;
  return (
    <mesh material={mat} position={[x, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
      <ringGeometry args={[Math.max(0.001, r - w), r, 160]} />
    </mesh>
  );
};

export const TrapFx: React.FC = () => {
  const frame = useCurrentFrame();
  const rumor = PLAN.traps.find((t) => t.def.mechanism === 'rumor');
  const hookR = (frame - 5) / 2.7;
  const hookO = (1 - prog(frame, 14, 30)) * prog(frame, 4, 7);
  const goldRing = useMemo(() => new THREE.Color(COLORS.goldLight).multiplyScalar(2.2), []);
  const whisperRing = useMemo(() => new THREE.Color(COLORS.whisper).multiplyScalar(0.9), []);
  return (
    <>
      <Ring x={0} z={0} r={hookR} color={goldRing} o={hookO} w={0.12} />
      <Ring x={0} z={0} r={hookR - 0.7} color={goldRing} o={hookO * 0.4} w={0.05} />
      {PLAN.traps.map((t) => {
        const lt = frame - t.start;
        if (lt < -5 || lt > t.len + 30) return null;
        if (t.def.mechanism === 'chain') return <ChainArcs key={t.k} t={t} />;
        if (t.def.mechanism === 'lever') return <Fulcrum key={t.k} t={t} />;
        if (t.def.mechanism === 'fomo') return <Peak key={t.k} t={t} />;
        return null;
      })}
      {rumor
        ? (() => {
            const lt = frame - rumor.start;
            const R = rippleRadius(rumor.prepared, lt);
            const o = rumorOrigin(rumor.prepared);
            const fade = prog(lt, 10, 14) * (1 - prog(lt, rumor.len - 30, rumor.len));
            return (
              <>
                <Ring x={o.x} z={o.z} r={R} color={whisperRing} o={0.5 * fade} w={0.06} />
                <Ring x={o.x} z={o.z} r={R - 0.6} color={whisperRing} o={0.22 * fade} w={0.03} />
                <Ring x={o.x} z={o.z} r={R - 1.3} color={whisperRing} o={0.1 * fade} w={0.03} />
              </>
            );
          })()
        : null}
    </>
  );
};
