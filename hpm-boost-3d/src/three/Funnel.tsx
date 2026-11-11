import {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {SPHERES, SPHERE_DEFS, sphereAt, LEAD_OUT} from '../lib/flow';
import {prog, spring, springCross} from '../lib/math';
import {FUNNEL, T, TIERS, funnelR, useTime} from '../timeline';

const SLIDE = {dist: 30, freq: 1.25, zeta: 0.62};
const CROSS = springCross(SLIDE.freq, SLIDE.zeta);
/** Each tier slides in from alternating sides; its spring first crosses home on its lock time. */
export const tierOffset = (i: number, t: number) => {
  const start = T.tierLocks[i] - CROSS;
  const k = spring(t - start, SLIDE.freq, SLIDE.zeta);
  const side = i % 2 === 0 ? -1 : 1;
  return {x: side * SLIDE.dist * (1 - k), y: 1.2 * (1 - k), spin: side * 0.6 * (1 - k), visible: t >= start - 0.02};
};

/** Closed lathe profile of one glass tier: outer wall up, rounded lips, inner wall down. */
const tierGeometry = (top: number, bot: number) => {
  const th = FUNNEL.wall;
  const pts: THREE.Vector2[] = [];
  const N = 40;
  const lip = (y: number, up: boolean) => {
    const r = funnelR(y);
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      pts.push(new THREE.Vector2(r + (th / 2) * Math.cos(up ? a : a + Math.PI), y + (up ? 1 : -1) * (th / 2) * Math.sin(a) * 0.9));
    }
  };
  // Outer wall bottom → top (outward normals), top lip, inner wall top → bottom, bottom lip.
  for (let k = 0; k <= N; k++) {
    const y = bot + ((top - bot) * k) / N;
    pts.push(new THREE.Vector2(funnelR(y) + th / 2, y));
  }
  lip(top, true);
  for (let k = N; k >= 0; k--) {
    const y = bot + ((top - bot) * k) / N;
    pts.push(new THREE.Vector2(funnelR(y) - th / 2, y));
  }
  lip(bot, false);
  const g = new THREE.LatheGeometry(pts, 96);
  g.computeVertexNormals();
  return g;
};

export const Funnel: React.FC = () => {
  const t = useTime();
  const r = useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#f4e7dc',
      metalness: 0,
      roughness: 0.34,
      transmission: 0.6,
      thickness: 0.6,
      ior: 1.46,
      attenuationColor: new THREE.Color('#ffd9c0'),
      attenuationDistance: 6,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.1,
      side: THREE.FrontSide,
    });
    // Frosted edges glow: a warm fresnel term, brightest where the glass turns away from the lens.
    glass.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float fres = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
        totalEmissiveRadiance += vec3(1.0, 0.42, 0.16) * fres * 1.3 + vec3(0.06, 0.045, 0.04);`,
      );
    };
    const tiers = TIERS.map((ti) => tierGeometry(ti.top, ti.bot));
    const rimMats = TIERS.map(() => new THREE.MeshBasicMaterial({color: new THREE.Color(1, 0.36, 0.1)}));
    const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
    const sphereMat = new THREE.MeshBasicMaterial({color: '#ffffff'});
    const inst = new THREE.InstancedMesh(sphereGeo, sphereMat, SPHERES);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new THREE.Color();
    SPHERE_DEFS.forEach((s, j) => {
      // Ember orange to warm white, HDR so they bloom.
      if (s.warm < 0.72) c.setRGB(1, 0.3 + 0.12 * s.warm, 0.06).multiplyScalar(2.6);
      else c.setRGB(1, 0.78, 0.55).multiplyScalar(2.2);
      inst.setColorAt(j, c);
    });
    const outletMat = new THREE.MeshBasicMaterial({color: new THREE.Color(1, 0.5, 0.2)});
    const flowLight = new THREE.PointLight('#ff7a30', 0, 18, 2);
    const outletLight = new THREE.PointLight('#ffc89a', 0, 12, 2);
    outletLight.position.set(FUNNEL.x, FUNNEL.yBot - 1.2, FUNNEL.z);
    return {glass, tiers, rimMats, inst, outletMat, flowLight, outletLight};
  }, []);
  const instRef = useRef<THREE.InstancedMesh>(r.inst);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    let n = 0;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let j = 0; j < SPHERES; j++) {
      const s = sphereAt(j, t);
      p.set(s.x, s.y, s.z);
      sc.setScalar(s.visible ? Math.max(1e-4, s.scale) : 1e-4);
      m.compose(p, q, sc);
      instRef.current.setMatrixAt(j, m);
      if (s.visible && s.y < 14 && s.y > -13) {
        n++;
        cx += s.x;
        cy += s.y;
        cz += s.z;
      }
    }
    instRef.current.instanceMatrix.needsUpdate = true;
    if (n > 0) r.flowLight.position.set(cx / n, cy / n, cz / n);
    r.flowLight.intensity = n > 0 ? 70 * Math.min(1, n / 30) : 0;
  });

  // Glow on each tier: steady low ember, a pulse when it locks.
  TIERS.forEach((_, i) => {
    const x = t - T.tierLocks[i];
    const pulse = x > 0 ? Math.exp(-x / 0.22) * 7 : 0;
    const base = 1.4 * prog(T.tierLocks[i] - 0.3, T.tierLocks[i], t);
    r.rimMats[i].color.setRGB(1, 0.36, 0.1).multiplyScalar(base + pulse);
  });
  const outletOn = prog(LEAD_OUT - 0.25, LEAD_OUT, t);
  const coinFlash = t > T.coinStart ? 0.6 + 0.4 * Math.cos(((t - T.coinStart) / T.coinInterval) * Math.PI * 2) : 0;
  r.outletMat.color.setRGB(1, 0.5, 0.2).multiplyScalar(0.3 + outletOn * (3 + coinFlash * 2));
  r.outletLight.intensity = outletOn * (14 + coinFlash * 10);
  const visible = t > T.tierLocks[0] - 1.2 && t > 4.6;

  return (
    <group visible={visible}>
      {TIERS.map((ti, i) => {
        const o = tierOffset(i, t);
        return (
          <group key={i} position={[FUNNEL.x + o.x, o.y, FUNNEL.z + o.x * 0.25]} rotation={[0, o.spin, 0]} visible={o.visible}>
            <mesh geometry={r.tiers[i]} material={r.glass} castShadow receiveShadow />
            <mesh material={r.rimMats[i]} position={[0, ti.top + FUNNEL.wall * 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[funnelR(ti.top), 0.055, 10, 120]} />
            </mesh>
            <mesh material={r.rimMats[i]} position={[0, ti.bot - FUNNEL.wall * 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[funnelR(ti.bot), 0.05, 10, 96]} />
            </mesh>
          </group>
        );
      })}
      <primitive object={r.inst} ref={instRef} frustumCulled={false} visible={t > T.pourStart - 0.05 && t < 9.6} />
      <mesh material={r.outletMat} position={[FUNNEL.x, FUNNEL.yBot - 0.25, FUNNEL.z]} rotation={[Math.PI / 2, 0, 0]} visible={t >= T.tierLocks[3]}>
        <torusGeometry args={[FUNNEL.rBot + 0.05, 0.08, 10, 64]} />
      </mesh>
      <primitive object={r.flowLight} />
      <primitive object={r.outletLight} />
    </group>
  );
};
