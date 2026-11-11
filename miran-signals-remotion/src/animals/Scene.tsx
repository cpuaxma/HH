// The animals reel's 3D studio: the same navy studio as the other Miran Gold reels (the shared
// Studio: cyclorama, key and gold rim lights, softbox, room reflections), with the gold chart on
// a panel behind, a pool of light on the floor and the Miran Gold phone for the tie-in. The
// animals themselves are line art drawn over this (art/AnimalArt.tsx).
import {useThree} from '@react-three/fiber';
import {useCallback, useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Phone} from '../three/Phone';
import {useAnimator} from '../three/Pipeline';
import {GOLD, ORB_COOL, ORB_GOLD, OrbFn, PhoneGlow, Studio, radialTexture} from '../three/Studio';
import {useScreenTexture} from '../three/useScreenTexture';
import {mixHex} from '../screens/draw';
import {CHART_TEX, chartBrightness, chartKey, drawChart} from './chart';
import {CHART, COLORS, T} from './data';
import {alertScreenKey, drawAlertScreen} from './screen';
import {PHONE_BASE, phonePose, phoneVisible, rings, stageGlow, tintMix} from './story';

const ORB_SILVER = new THREE.Color('#7F93BE');
/** The backdrop orbs follow the beat: warm gold for the bull, whale and dove; cool silver for the bear and hawk. */
const orbs: OrbFn = (t, left, right) => {
  const m = tintMix(t);
  const warm = (id: string) => (id === COLORS.tint.bear || id === COLORS.tint.hawk ? 0 : 1);
  const w = warm(m.a) * (1 - m.k) + warm(m.b) * m.k;
  const g = stageGlow(t).strength;
  left.copy(ORB_COOL).lerp(ORB_SILVER, 1 - w).lerp(ORB_GOLD, 0.7 * w).multiplyScalar(0.075 * g);
  right.copy(ORB_COOL).lerp(ORB_SILVER, 1 - w).lerp(ORB_GOLD, 0.9 * w).multiplyScalar(0.08 * g);
};

/** The chart on its panel: redrawn once per frame (not per motion-blur sample). */
const ChartPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const {gl} = useThree();
  const last = useRef<string | null>(null);
  const tex = useMemo(() => {
    const dpr = typeof window === 'undefined' ? 1 : Math.min(1, window.devicePixelRatio || 1);
    const c = document.createElement('canvas');
    c.width = Math.round(CHART_TEX.w * dpr);
    c.height = Math.round(CHART_TEX.h * dpr);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    return {t, ctx: c.getContext('2d')!, dpr};
  }, [gl]);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({map: tex.t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}),
    [tex],
  );
  useLayoutEffect(() => {
    const k = chartKey(frame);
    if (last.current !== k) {
      tex.ctx.save();
      tex.ctx.setTransform(tex.dpr, 0, 0, tex.dpr, 0, 0);
      drawChart(tex.ctx, Math.min(frame, T.endCardStart + 60));
      tex.ctx.restore();
      tex.t.needsUpdate = true;
      last.current = k;
    }
    mat.color.setScalar(chartBrightness(frame));
  }, [frame, tex, mat]);
  const p = CHART.panel;
  return (
    <mesh position={[p.x, p.y, p.z]} material={mat} renderOrder={3}>
      <planeGeometry args={[p.w, p.h]} />
    </mesh>
  );
};

/** A ring of light (an annulus) for the floor. */
const ringTexture = (inner: number, width: number, fill = 0.35) => {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.hypot((x + 0.5) / size - 0.5, (y + 0.5) / size - 0.5) * 2;
      const d = (r - inner) / width;
      const v = Math.exp(-d * d * 4) + fill * Math.exp(-Math.pow((r - inner * 0.6) / 0.35, 2)) * (r < inner ? 1 : 0);
      const k = (y * size + x) * 4;
      img.data[k] = 255;
      img.data[k + 1] = 255;
      img.data[k + 2] = 255;
      img.data[k + 3] = Math.round(Math.min(1, v) * 255 * (r < 1 ? 1 : 0));
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
};

const additive = (map: THREE.Texture) => new THREE.MeshBasicMaterial({map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});

const MAX_RINGS = 1;

/** The pool of light on the floor in the beat's colour, and the ring the phone comes up through. */
const Floor: React.FC = () => {
  const poolTex = useMemo(() => radialTexture(1.8), []);
  const ringTex = useMemo(() => ringTexture(0.72, 0.09), []);
  const pool = useRef<THREE.Mesh>(null);
  const poolMat = useMemo(() => additive(poolTex), [poolTex]);
  const ringMats = useMemo(() => Array.from({length: MAX_RINGS}, () => additive(ringTex)), [ringTex]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);

  useAnimator((t) => {
    const m = tintMix(t);
    const g = stageGlow(t);
    if (pool.current) {
      pool.current.position.set(0, 0.004, 0.35);
      pool.current.scale.set(4.2, 3.4, 1);
      poolMat.color.set(mixHex(m.a, m.b, m.k)).multiplyScalar(0.28 * g.strength);
    }
    const rs = rings(t);
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const r = rs[i];
      mesh.visible = !!r && r.strength > 0.001;
      if (!r) return;
      mesh.position.set(r.x, 0.006, r.z);
      mesh.scale.set(r.r * 2.4, r.r * 2.4, 1);
      ringMats[i].color.set(r.color).multiplyScalar(1.1 * r.strength);
    });
  });

  return (
    <>
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} material={poolMat} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {ringMats.map((m, i) => (
        <mesh key={`r${i}`} ref={(r) => {
            ringRefs.current[i] = r;
          }} rotation={[-Math.PI / 2, 0, 0]} material={m} renderOrder={2}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </>
  );
};

const PHONE_FINISH = {frame: new THREE.Color(COLORS.phoneFrame), back: new THREE.Color(COLORS.phoneBack)};
const phoneFinish = () => PHONE_FINISH;

const AlertPhone: React.FC = () => {
  const screen = useScreenTexture(useCallback(drawAlertScreen, []), alertScreenKey, PHONE_BASE.pos);
  return (
    <>
      <PhoneGlow pose={phonePose} glow={(t) => ({color: GOLD, strength: Math.max(0, Math.min(1, (t - T.phoneAt - 20) / 40))})} />
      <Phone texture={screen} pose={phonePose} brightness={() => 1} finish={phoneFinish} />
    </>
  );
};

export const AnimalsScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Studio orbs={orbs} />
      <ChartPanel />
      <Floor />
      {phoneVisible(frame) ? <AlertPhone /> : null}
    </>
  );
};
