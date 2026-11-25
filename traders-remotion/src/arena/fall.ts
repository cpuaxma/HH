import {EASE, clamp, prog} from '../lib/anim';
import {G} from './grid';
import type {PillarState} from './types';

const tmpQ = {x: 0, y: 0, z: 0, w: 1};

/** Quaternion from axis (normalised internally) and angle. */
export const axisAngle = (ax: number, ay: number, az: number, a: number, out = tmpQ) => {
  const l = Math.hypot(ax, ay, az) || 1;
  const s = Math.sin(a / 2) / l;
  out.x = ax * s;
  out.y = ay * s;
  out.z = az * s;
  out.w = Math.cos(a / 2);
  return out;
};

/** out = a * b (quaternions). */
export const qmul = (a: {x: number; y: number; z: number; w: number}, b: {x: number; y: number; z: number; w: number}) => ({
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
});

/** Rotate vector v by quaternion q. */
export const qrot = (q: {x: number; y: number; z: number; w: number}, v: [number, number, number]): [number, number, number] => {
  const [vx, vy, vz] = v;
  const tx = 2 * (q.y * vz - q.z * vy);
  const ty = 2 * (q.z * vx - q.x * vz);
  const tz = 2 * (q.x * vy - q.y * vx);
  return [vx + q.w * tx + (q.y * tz - q.z * ty), vy + q.w * ty + (q.z * tx - q.x * tz), vz + q.w * tz + (q.x * ty - q.y * tx)];
};

export const setQ = (out: PillarState, q: {x: number; y: number; z: number; w: number}) => {
  out.qx = q.x;
  out.qy = q.y;
  out.qz = q.z;
  out.qw = q.w;
};

/**
 * Tilt a pillar by `angle` toward horizontal direction (dx, dz), pivoting on the edge of its base
 * (so it rocks/topples like a real object instead of sinking into the tile).
 */
export const tiltOnEdge = (out: PillarState, dx: number, dz: number, angle: number, radius: number, yaw = 0) => {
  const l = Math.hypot(dx, dz) || 1;
  const ux = dx / l;
  const uz = dz / l;
  // Axis perpendicular to the direction, in the floor plane: tilting toward +u rotates about (uz, 0, -ux).
  const qt = axisAngle(uz, 0, -ux, angle, {x: 0, y: 0, z: 0, w: 1});
  const qy = axisAngle(0, 1, 0, yaw, {x: 0, y: 0, z: 0, w: 1});
  const q = qmul(qt, qy);
  setQ(out, q);
  // Pivot = base edge in the tilt direction. New base = pivot + R(base - pivot).
  const sign = angle >= 0 ? 1 : -1;
  const px = ux * radius * sign;
  const pz = uz * radius * sign;
  const [rx, ry, rz] = qrot(qt, [-px, 0, -pz]);
  out.x += px + rx;
  out.y += ry;
  out.z += pz + rz;
};

/**
 * The shared "lost into the dark" motion: from a release point with a velocity, gravity pulls it
 * down while it tumbles, turns loss-red, cracks and dissolves into the fog.
 * `dt` = frames since release. Velocity in units/frame.
 */
export const fallAway = (
  out: PillarState,
  dt: number,
  o: {x: number; y: number; z: number; vx: number; vy: number; vz: number; spin: number; dirX: number; dirZ: number; tilt0?: number; g?: number; redIn?: number},
) => {
  const t = Math.max(0, dt);
  const g = o.g ?? G;
  out.x = o.x + o.vx * t;
  out.z = o.z + o.vz * t;
  out.y = o.y + o.vy * t - 0.5 * g * t * t;
  const l = Math.hypot(o.dirX, o.dirZ) || 1;
  const angle = (o.tilt0 ?? 0) + o.spin * t + 0.0009 * t * t;
  setQ(out, axisAngle(o.dirZ / l, 0, -o.dirX / l, angle, {x: 0, y: 0, z: 0, w: 1}));
  const redIn = o.redIn ?? 7;
  out.red = Math.max(out.red, EASE.out(prog(t, 0, redIn)));
  out.crack = Math.max(out.crack, EASE.out(prog(t, 2, 16)));
  out.dissolve = Math.max(out.dissolve, EASE.in(prog(t, 10, 44)));
  out.glow = out.glow * (1 - prog(t, 0, 10)) + 0.4 * clamp(1 - t / 30);
  out.heat = Math.max(out.heat, Math.exp(-t / 3) * 0.12);
  out.reflect = 0;
};
