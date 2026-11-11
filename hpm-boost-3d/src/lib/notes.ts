// Banknote choreography: where each note is at simulation time s, how it bends and how
// far it has burned. Pure functions so the embers can be born exactly on the burn front.
import * as THREE from 'three';
import {BUTTON_LOCAL, PHONE, T} from '../timeline';
import {clamp, easeOutCubic, makeRandom, prog, wobble} from './math';
import {sampleNoise} from './noise';

export const NOTE = {w: 6.2, h: 2.71};
export const EMERGE = 0.34;

export type NoteDef = {
  birth: number;
  burnStart: number;
  x0: number;
  lift: number;
  phase: number;
  spin: number;
  seedU: number;
  seedV: number;
};

export const NOTES: NoteDef[] = (() => {
  const rnd = makeRandom(77);
  const out: NoteDef[] = [];
  T.presses.forEach((p, k) => {
    for (let j = 0; j < T.notesPerPress; j++) {
      const birth = p + 0.05 + j * T.noteStagger;
      out.push({
        birth,
        burnStart: birth + T.noteBurnDelay + rnd.range(-0.08, 0.06),
        x0: (j - 1) * 2.5 + rnd.range(-0.4, 0.4) + (k - 1) * 0.3,
        lift: rnd.range(0.6, 1.5),
        phase: rnd.range(0, Math.PI * 2),
        spin: rnd.sign() * rnd.range(0.3, 0.7),
        seedU: rnd.next(),
        seedV: rnd.next(),
      });
    }
  });
  return out;
})();

const PHONE_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(PHONE.tilt, 0, 0));
const tmpE = new THREE.Euler();
const tmpQ = new THREE.Quaternion();

export type NoteState = {
  visible: boolean;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  curl: number;
  flutter: number;
  burn: number;
  time: number;
};

const emergeLocal = (n: NoteDef, u: number) => {
  const e = easeOutCubic(u);
  const p = new THREE.Vector3(
    BUTTON_LOCAL[0] + n.x0 * 0.22 * e,
    BUTTON_LOCAL[1] + 0.55 * e + 0.5 * e * e,
    PHONE.d / 2 - 1.5 + 3.5 * e,
  );
  tmpE.set(-1.42 + 0.85 * e, 0.08 * n.spin * e, n.x0 * 0.05 * e);
  const q = new THREE.Quaternion().setFromEuler(tmpE);
  return {p: p.applyQuaternion(PHONE_Q), q: PHONE_Q.clone().multiply(q)};
};

export const noteState = (i: number, s: number): NoteState => {
  const n = NOTES[i];
  const burn = prog(n.burnStart, n.burnStart + T.noteBurnDur, s);
  const visible = s >= n.birth && burn < 1;
  const age = s - n.birth;
  if (age <= EMERGE) {
    const {p, q} = emergeLocal(n, clamp(age / EMERGE));
    return {visible, position: p, quaternion: q, curl: 0.12, flutter: 0.15 * clamp(age / EMERGE), burn, time: s};
  }
  const tau = age - EMERGE;
  const {p, q} = emergeLocal(n, 1);
  const ramp = Math.min(1, tau * 2);
  const pos = p.add(
    new THREE.Vector3(
      n.x0 * 0.9 * (1 - Math.exp(-0.8 * tau)) + 0.5 * wobble(tau * 1.5, n.phase) * Math.min(1, tau),
      n.lift * (4.6 * (1 - Math.exp(-1.1 * tau)) + 1.3 * tau),
      2.6 * (1 - Math.exp(-1.2 * tau)) + 0.35 * tau,
    ),
  );
  tmpE.set(
    0.55 * Math.sin(2.1 * tau + n.phase) * ramp + 0.3 * tau,
    n.spin * tau * 0.6,
    0.35 * Math.sin(2.7 * tau + n.phase * 1.3) * ramp,
  );
  tmpQ.setFromEuler(tmpE);
  return {
    visible,
    position: pos,
    quaternion: q.multiply(tmpQ),
    curl: 0.12 + 0.55 * burn,
    flutter: 0.15 + 0.75 * ramp,
    burn,
    time: s,
  };
};

/** Out-of-plane bend at local (x, y); mirrors the vertex shader exactly. */
export const bendZ = (x: number, y: number, st: NoteState, phase: number) => {
  const hx = x / (NOTE.w / 2);
  return (
    st.curl * hx * hx * 0.9 +
    st.flutter * (0.22 * Math.sin(1.3 * x + 4.6 * st.time + phase) * hx + 0.12 * Math.sin(2.2 * y + 3.1 * st.time + phase))
  );
};

/** Burn mask at uv; the paper is gone where mask < burn threshold. Mirrors the fragment shader. */
export const burnMask = (u: number, v: number, n: NoteDef) => {
  const dx = Math.min(u, 1 - u) * NOTE.w;
  const dy = Math.min(v, 1 - v) * NOTE.h;
  const d = Math.min(dx, dy) / (NOTE.h * 0.5);
  const a = NOTE.w / NOTE.h;
  const nz =
    sampleNoise(u * a * 0.085 + n.seedU, v * 0.085 + n.seedV) * 0.65 +
    sampleNoise(u * a * 0.24 + n.seedU * 1.7, v * 0.24 + n.seedV * 1.7) * 0.35;
  return d * 0.7 + nz * 0.55;
};
export const burnThreshold = (burn: number) => burn * 1.3 - 0.02;
/** Simulation time at which the burn front reaches mask value m. */
export const burnTimeFor = (m: number, n: NoteDef) => n.burnStart + T.noteBurnDur * clamp((m + 0.02) / 1.3);
