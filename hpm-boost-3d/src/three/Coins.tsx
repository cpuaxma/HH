import {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {makeRandom} from '../lib/math';
import {COIN, FLOOR_Y, FUNNEL, T, useTime} from '../timeline';

const G = 72;
const OUT_Y = FUNNEL.yBot - 0.55;

const coinGeometry = () => {
  const R = COIN.r;
  const h = COIN.h / 2;
  // Profile (r, y) from the centre of the top face out over the rim and down the edge.
  const top: [number, number][] = [
    [0, h * 0.62],
    [R * 0.5, h * 0.62],
    [R * 0.52, h * 0.7],
    [R * 0.54, h * 0.62],
    [R * 0.8, h * 0.62],
    [R * 0.84, h * 0.98],
    [R * 0.96, h],
    [R, h * 0.82],
  ];
  const pts = [...top, ...top.slice().reverse().map(([r, y]) => [r, -y] as [number, number])].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
};

type CoinDef = {emerge: number; land: number; restY: number; dx: number; dz: number; yaw: number; spin: number; tilt: number};
export const COINS: CoinDef[] = (() => {
  const rnd = makeRandom(31);
  return Array.from({length: T.coinCount}, (_, i) => {
    const restY = FLOOR_Y + COIN.h * (i + 0.5);
    const emerge = T.coinStart + i * T.coinInterval;
    return {
      emerge,
      land: emerge + Math.sqrt((2 * (OUT_Y - restY)) / G),
      restY,
      dx: rnd.range(-0.06, 0.06),
      dz: rnd.range(-0.06, 0.06),
      yaw: rnd.range(0, Math.PI * 2),
      spin: rnd.range(2, 5) * rnd.sign(),
      tilt: rnd.range(-0.25, 0.25),
    };
  });
})();

export const Coins: React.FC = () => {
  const t = useTime();
  const r = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#e3ad62',
      metalness: 1,
      roughness: 0.17,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
    });
    const inst = new THREE.InstancedMesh(coinGeometry(), mat, COINS.length);
    inst.castShadow = true;
    inst.receiveShadow = true;
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return {inst};
  }, []);
  const ref = useRef<THREE.InstancedMesh>(r.inst);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    COINS.forEach((c, i) => {
      const a = t - c.emerge;
      if (a < 0) {
        m.makeScale(1e-4, 1e-4, 1e-4);
        ref.current.setMatrixAt(i, m);
        return;
      }
      const fallDur = c.land - c.emerge;
      let y: number;
      let flip: number;
      let yaw: number;
      let tilt: number;
      if (t < c.land) {
        y = OUT_Y - 0.5 * G * a * a;
        const u = a / fallDur;
        // One full flip on the way down, easing out to land flat.
        flip = Math.PI * 2 * (1 - Math.pow(1 - u, 1.6));
        yaw = c.yaw + c.spin * a;
        tilt = c.tilt * (1 - u);
      } else {
        const b = t - c.land;
        // A tiny hop and settle on the stack.
        y = c.restY + 0.07 * Math.exp(-9 * b) * Math.abs(Math.sin(20 * b));
        flip = Math.PI * 2;
        yaw = c.yaw + c.spin * fallDur + c.spin * 0.12 * (1 - Math.exp(-6 * b));
        tilt = 0.05 * Math.exp(-7 * b) * Math.sin(26 * b);
      }
      const grow = Math.min(1, 0.25 + a / 0.09);
      const spread = Math.min(1, a / Math.max(0.01, fallDur));
      p.set(FUNNEL.x + c.dx * spread, y, FUNNEL.z + c.dz * spread);
      e.set(flip + tilt, yaw, tilt * 0.6, 'YXZ');
      q.setFromEuler(e);
      s.setScalar(grow);
      m.compose(p, q, s);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={r.inst} ref={ref} frustumCulled={false} visible={t > T.coinStart - 0.05} />;
};
