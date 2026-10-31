import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND, HUBS, MODULES, TIMING, arrivalFrame, moduleHub} from '../data';
import {computeCamera} from '../lib/camera';
import {hubPos, norm} from '../lib/geo';
import {hubReachedFrame} from '../lib/timeline';

const PULSE_LEN = 50;

/** Every ring pulse: which hub, when it starts, how big it grows (screen px). */
export const pulseEvents = () => {
  const ev: {hub: number; at: number; size: number}[] = [];
  // The hook pin's heartbeat after it lands.
  const land = TIMING.pinDrop + 40;
  for (let k = 0; k < 3; k++) ev.push({hub: 0, at: land + k * 34, size: 150});
  HUBS.forEach((_, i) => {
    if (i > 0) ev.push({hub: i, at: hubReachedFrame(i), size: 90});
  });
  MODULES.forEach((_, i) => {
    ev.push({hub: moduleHub(i), at: arrivalFrame(i) - 2, size: 150});
    ev.push({hub: moduleHub(i), at: arrivalFrame(i) + 28, size: 150});
  });
  return ev;
};

const ringGeo = new THREE.RingGeometry(0.82, 1, 64);
const up = new THREE.Vector3(0, 0, 1);

/** Navy rings that ripple out across the globe's surface from a hub. */
export const Pulses: React.FC = () => {
  const frame = useCurrentFrame();
  const px = computeCamera(frame).surfacePx;
  return (
    <group>
      {pulseEvents().map((e, k) => {
        const t = (frame - e.at) / PULSE_LEN;
        if (t <= 0 || t >= 1) return null;
        const ease = 1 - (1 - t) ** 3;
        const n = new THREE.Vector3(...norm(hubPos(e.hub)));
        const q = new THREE.Quaternion().setFromUnitVectors(up, n);
        const radius = Math.max(0.01, (e.size / 2 / px) * ease);
        return (
          <mesh key={k} geometry={ringGeo} position={n.clone().multiplyScalar(100.35)} quaternion={q} scale={radius} renderOrder={5}>
            <meshBasicMaterial color={BRAND.navy} transparent opacity={0.55 * (1 - t)} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};
