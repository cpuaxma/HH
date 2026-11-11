import {useMemo} from 'react';
import * as THREE from 'three';
import {buildChili} from '../lib/chiliGeometry';
import {easeInQuad, landingDip, prog, smooth, spring} from '../lib/math';
import {makeChiliMaps} from '../lib/textures';
import {CHILI_END, END_CAM, IMPACT_WORLD, SCREEN_NORMAL, T, useTime} from '../timeline';

const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const N = V(SCREEN_NORMAL);
/** Chili centre at the moment it touches the glass. */
/** Smaller during the drop than in the hero shot. */
export const DROP_SCALE = 0.8;
export const CHILI_AT_IMPACT = V(IMPACT_WORLD).addScaledVector(N, 1.22 * DROP_SCALE);
const DROP_FROM = CHILI_AT_IMPACT.clone().add(new THREE.Vector3(1.4, 13.5, 4.2));
const BOUNCE_DIR = new THREE.Vector3(-0.45, 0.75, 1.0).normalize();

const qe = (x: number, y: number, z: number, order: THREE.EulerOrder = 'XYZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, order));

const endYaw = Math.atan2(CHILI_END[0] - END_CAM[0], -(CHILI_END[2] - END_CAM[2]));

export const chiliState = (t: number) => {
  const pos = new THREE.Vector3();
  let quat = new THREE.Quaternion();
  let visible = false;
  if (t >= T.chiliDropStart && t < 5.1) {
    visible = true;
    const x = t - T.impact;
    if (x < 0) {
      const u = prog(T.chiliDropStart, T.impact, t);
      const k = 0.3 * u + 0.7 * u * u;
      pos.lerpVectors(DROP_FROM, CHILI_AT_IMPACT, k);
      pos.x = DROP_FROM.x + (CHILI_AT_IMPACT.x - DROP_FROM.x) * easeInQuad(u);
    } else {
      pos
        .copy(CHILI_AT_IMPACT)
        .addScaledVector(BOUNCE_DIR, 4.2 * (1 - Math.exp(-1.6 * x)))
        .add(new THREE.Vector3(0, 2.8 * Math.pow(Math.max(0, x - 0.35), 2), 0));
    }
    // Slow roll about its long axis plus a gentle yaw; at the impact it lies across the screen.
    const roll = 1.1 * x + (x > 0 ? 0.9 * (1 - Math.exp(-2 * x)) : 0);
    quat = qe(0, 0, -0.1).multiply(qe(roll, 0.35 * x, 0, 'YXZ'));
  } else if (t >= T.chiliEndStart) {
    visible = true;
    const d = t - T.chiliEndStart;
    const drop = 7 * (1 - spring(d, 0.9, 0.74));
    const float = 0.028 * Math.sin(1.5 * (t - T.chiliSettle)) * smooth(prog(T.chiliSettle, T.chiliSettle + 0.8, t));
    pos.set(CHILI_END[0], CHILI_END[1] + drop + float + landingDip(t - T.chiliSettle, 0.0), CHILI_END[2]);
    const turn = spring(t - T.turnStart, 1.0, 0.8);
    const yaw = -endYaw + (Math.PI / 2) * (1 - turn) + 0.25 * (1 - spring(d, 0.6, 0.8));
    quat = qe(0, yaw, 0).multiply(qe(0, 0, 0.1)).multiply(qe(-0.32, 0, 0));
  }
  return {visible, pos, quat, scale: t < 6 ? DROP_SCALE : 1};
};

export const Chili: React.FC = () => {
  const t = useTime();
  const r = useMemo(() => {
    const g = buildChili();
    const {normal, rough} = makeChiliMaps();
    const skin = new THREE.MeshPhysicalMaterial({
      color: '#a3100a',
      roughness: 0.42,
      roughnessMap: rough,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.32, 0.32),
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      sheen: 0.35,
      sheenColor: new THREE.Color('#ff3a1c'),
      sheenRoughness: 0.45,
      emissive: new THREE.Color('#2a0300'),
      emissiveIntensity: 0.5,
      envMapIntensity: 1.15,
    });
    const calyx = new THREE.MeshPhysicalMaterial({
      color: '#2b211c',
      roughness: 0.55,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide,
    });
    return {g, skin, calyx};
  }, []);
  const s = chiliState(t);
  const capQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), r.g.cap.dir);
  return (
    <group visible={s.visible} position={s.pos} quaternion={s.quat} scale={s.scale}>
      <mesh geometry={r.g.body} material={r.skin} castShadow />
      <mesh geometry={r.g.calyx} material={r.calyx} castShadow />
      <mesh geometry={r.g.stem} material={r.calyx} castShadow />
      <mesh material={r.calyx} position={r.g.cap.pos} quaternion={capQ}>
        <cylinderGeometry args={[0.15, 0.17, 0.04, 18]} />
      </mesh>
    </group>
  );
};
