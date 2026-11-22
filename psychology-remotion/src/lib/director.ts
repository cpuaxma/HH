/**
 * The director: one pure function of the frame that decides everything the world does.
 * Camera, orb, color grade, morph weights, HUD values and effects all come from getWorld(frame),
 * so the 3D canvas and the DOM overlays (labels, pins, HUD) always agree.
 */
import * as THREE from 'three';
import {CUES, IMPACTS, ORB_PATH, SCENES, STAGES, StageKey, VIDEO} from '../config';
import {EASE, clamp01, ease, lerp, monotoneCubic, smoothstep, windowed, wobble} from './motion';
import {
  CHART_CENTER,
  RING_CENTER,
  STAGE_S,
  ShapeWeights,
  TRACK_LENGTH,
  V3,
  pointAtS,
  shapeAtU,
  tangentAtS,
} from './track';

// ---------------------------------------------------------------------------------------------
// Orb position along the track (arc length) over time
// ---------------------------------------------------------------------------------------------
const orbPath = monotoneCubic(ORB_PATH.map((k) => ({x: k.f, y: STAGE_S[k.at] + (k.off ?? 0)})));
export const orbS = (f: number) => orbPath(f);

// ---------------------------------------------------------------------------------------------
// Stage blending: every numeric field of STAGES, blended by arc length
// ---------------------------------------------------------------------------------------------
type StageNum = Omit<(typeof STAGES)[number], 'key' | 'word' | 'color'> & {color: THREE.Color};
const STAGE_POS = STAGES.map((st) => ({st, s: STAGE_S[st.key], color: new THREE.Color(st.color)}));

export const stageAt = (s: number): StageNum => {
  let i = 0;
  while (i < STAGE_POS.length - 2 && s > STAGE_POS[i + 1].s) i++;
  const a = STAGE_POS[i];
  const b = STAGE_POS[i + 1];
  const t = smoothstep(a.s, b.s, s);
  const out = {color: a.color.clone().lerp(b.color, t)} as StageNum;
  for (const k of ['sat', 'tint', 'exposure', 'bpm', 'greed', 'shake', 'split', 'vignette', 'fog', 'drift'] as const) {
    out[k] = lerp(a.st[k], b.st[k], t);
  }
  return out;
};

/** The stage whose color the track has at arc length s (used per vertex). */
export const stageColorAtS = (s: number) => stageAt(s).color;

// ---------------------------------------------------------------------------------------------
// Shape morph weights
// ---------------------------------------------------------------------------------------------
export const shapeWeights = (f: number): ShapeWeights => ({
  flatten: ease(f, CUES.reveal.flatten, [0, 1], EASE.inOut),
  wave: ease(f, CUES.quote.morph, [0, 1], EASE.inOut),
  ecg: ease(f, CUES.lesson.morph, [0, 1], EASE.inOut),
  ring: ease(f, CUES.cta.coil, [0, 1], EASE.inOut),
});

// ---------------------------------------------------------------------------------------------
// Where the main orb is (u along the current shape) after the ride
// ---------------------------------------------------------------------------------------------
const orbU = (f: number) => {
  if (f < SCENES.quote.from) return orbS(f) / TRACK_LENGTH;
  if (f < SCENES.lesson.from) return lerp(0.12, 0.5, ease(f, [990, 1125], [0, 1], EASE.sine));
  if (f < SCENES.cta.from) return ease(f, CUES.lesson.sweep, [0.02, 0.985], EASE.inOut);
  return 0.0 + ease(f, [1206, 1350], [0, 0.88], EASE.out);
};

const getOrbPos = (f: number): V3 => shapeAtU(orbU(f), shapeWeights(f), f);

// ---------------------------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------------------------
export type Pose = {pos: V3; target: V3; fov: number; roll: number};

/** Chase-cam distances along the ride (blended by arc length, like the stages). */
const CAM_BY_STAGE: Partial<Record<StageKey, {back: number; h: number; ahead: number; fov: number; focus: number}>> = {
  // focus: how much the camera aims at the orb (1) rather than the track ahead (0)
  calm: {back: 4.6, h: 1.55, ahead: 7, fov: 54, focus: 0.45},
  optimism: {back: 4.4, h: 1.5, ahead: 7.5, fov: 56, focus: 0.45},
  excitement: {back: 4.1, h: 1.35, ahead: 8, fov: 60, focus: 0.3},
  thrill: {back: 3.8, h: 1.25, ahead: 8, fov: 65, focus: 0.4},
  euphoria: {back: 3.6, h: 1.3, ahead: 7, fov: 70, focus: 0.6},
  peak: {back: 3.4, h: 1.5, ahead: 7, fov: 64, focus: 0.6},
  anxiety: {back: 3.4, h: 1.3, ahead: 6.5, fov: 66, focus: 0.55},
  denial: {back: 3.3, h: 1.2, ahead: 6, fov: 68, focus: 0.55},
  fear: {back: 3.2, h: 1.1, ahead: 6, fov: 72, focus: 0.4},
  panic: {back: 3.0, h: 1.0, ahead: 5.5, fov: 76, focus: 0.3},
  capitulation: {back: 3.4, h: 1.2, ahead: 6, fov: 70, focus: 0.5},
  despondency: {back: 5.4, h: 1.6, ahead: 8, fov: 52, focus: 0.8},
  hope: {back: 5.0, h: 1.5, ahead: 8.5, fov: 54, focus: 0.6},
  relief: {back: 4.6, h: 1.45, ahead: 8.5, fov: 56, focus: 0.45},
  optimism2: {back: 4.4, h: 1.45, ahead: 8, fov: 57, focus: 0.45},
  end: {back: 4.4, h: 1.45, ahead: 8, fov: 57, focus: 0.45},
};
const CAM_KEYS = Object.entries(CAM_BY_STAGE).map(([k, v]) => ({s: STAGE_S[k as StageKey], ...v!}));
const camParams = (s: number) => {
  let i = 0;
  while (i < CAM_KEYS.length - 2 && s > CAM_KEYS[i + 1].s) i++;
  const a = CAM_KEYS[i];
  const b = CAM_KEYS[i + 1];
  const t = smoothstep(a.s, b.s, s);
  return {
    back: lerp(a.back, b.back, t),
    h: lerp(a.h, b.h, t),
    ahead: lerp(a.ahead, b.ahead, t),
    fov: lerp(a.fov, b.fov, t),
    focus: lerp(a.focus, b.focus, t),
  };
};

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const mix = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Peak hang time: 0..1 while the camera rises and tilts down to look at the drop. */
const hangAt = (f: number) => windowed(f, 362, 398, 440, 458, EASE.inOut);

/** Track-local up (perpendicular to the track, in its vertical plane). */
const normalAtS = (s: number): V3 => {
  const t = new THREE.Vector3(...tangentAtS(s));
  const lat = new THREE.Vector3().crossVectors(t, new THREE.Vector3(0, 1, 0)).normalize();
  const n = new THREE.Vector3().crossVectors(lat, t).normalize();
  // mostly the track's own up, a little world up so steep drops still feel like falling
  n.lerp(new THREE.Vector3(0, 1, 0), 0.25).normalize();
  return [n.x, n.y, n.z];
};

const rawChase = (f: number): Pose => {
  const s = orbS(f);
  const p = camParams(s);
  const hang = hangAt(f);
  const behind = pointAtS(s - p.back);
  const ride = add(behind, scale(normalAtS(s - p.back), p.h));
  const orb = pointAtS(s);
  // look ahead along the track, but keep the orb near the middle of the frame on curves
  const ahead = s + p.ahead;
  const lookAhead = add(pointAtS(ahead), scale(normalAtS(ahead), 0.3));
  const rideTarget = mix(lookAhead, orb, p.focus);
  if (hang <= 0) return {pos: ride, target: rideTarget, fov: p.fov, roll: 0};
  // hang time: rise up behind the orb and tilt down past it to the whole drop below
  // creep forward a little during the hang so the shot is never static, then tilt down to the drop
  const creep = ease(f, [370, 446], [0, 1], EASE.sine);
  const hb = pointAtS(STAGE_S.peak - 4 + creep * 0.8);
  const hangPos = add(hb, [-4, 6 - creep * 0.5, 0]);
  const drop = pointAtS(STAGE_S.peak + 34);
  const tilt = ease(f, CUES.ride.tiltDown, [0.04, 0.3], EASE.inOut);
  const hangTarget = mix(add(orb, [0, 0.4, 0]), drop, tilt);
  return {
    pos: mix(ride, hangPos, hang),
    target: mix(rideTarget, hangTarget, hang),
    fov: lerp(p.fov, 64, hang),
    roll: 0,
  };
};

/** Chase cam with a little inertia (weighted average of recent raw poses). */
const chasePose = (f: number, lag = 5): Pose => {
  let wsum = 0;
  let pos: V3 = [0, 0, 0];
  let target: V3 = [0, 0, 0];
  let fov = 0;
  for (let i = 0; i <= lag; i++) {
    const w = Math.exp(-i / 2.2);
    const r = rawChase(f - i);
    pos = add(pos, scale(r.pos, w));
    target = add(target, scale(r.target, w));
    fov += r.fov * w;
    wsum += w;
  }
  return {pos: scale(pos, 1 / wsum), target: scale(target, 1 / wsum), fov: fov / wsum, roll: 0};
};

/** Bank into the track's sideways swing. */
const bankAt = (f: number) => {
  const s = orbS(f);
  const t0 = tangentAtS(s - 2);
  const t1 = tangentAtS(s + 2);
  return THREE.MathUtils.clamp((t1[2] - t0[2]) * -1.2, -0.25, 0.25);
};

/** The question: orbit the still orb, ending exactly behind it when the ride starts. */
const orbitPose = (f: number): Pose => {
  const c = pointAtS(STAGE_S.calm);
  const th = ease(f, [132, 240], [-1.25, 0], EASE.inOut);
  const R = ease(f, [132, 240], [6.2, 4.6], EASE.inOut);
  const h = ease(f, [132, 240], [1.0, 1.55], EASE.inOut);
  const chase = rawChase(239);
  const orbitPos: V3 = [c[0] - Math.cos(th) * R, c[1] + h, c[2] + Math.sin(th) * R];
  // land exactly on the chase position at the end of the orbit
  const pos = mix(orbitPos, chase.pos, ease(f, [190, 240], [0, 1], EASE.inOut));
  const target = mix(add(c, [0, 0.4, 0]), chase.target, 1 - Math.abs(th) / 1.25);
  return {pos, target, fov: lerp(46, 54, 1 - Math.abs(th) / 1.25), roll: 0};
};

/** Front-on chart view: far away with a long lens, so the track reads as a flat 2D chart. */
const FRONT_DIST = 505;
const frontPose = (target: V3, dist: number, fov = 30, yaw = 0): Pose => {
  const pos: V3 = [target[0] + Math.sin(yaw) * dist, target[1] + dist * 0.02, target[2] + Math.cos(yaw) * dist];
  return {pos, target, fov, roll: 0};
};
// the chart sits a little below the middle of the frame, leaving room for text above
const CHART_TARGET: V3 = [CHART_CENTER[0], CHART_CENTER[1] + 16, 0];

const slerpDir = (a: V3, b: V3, t: number): V3 => {
  const va = new THREE.Vector3(...a).normalize();
  const vb = new THREE.Vector3(...b).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(va, vb);
  const qi = new THREE.Quaternion().slerp(q, t);
  const r = va.applyQuaternion(qi);
  return [r.x, r.y, r.z];
};

/**
 * The reveal: pull far back and rotate until the track faces the camera flat. Everything is driven
 * by the (log) camera distance, so the shot stays coherent: close up it looks at the orb, it turns
 * to face the chart as it pulls back, and it re-centres on the whole chart only once the chart fits.
 */
const revealPose = (f: number): Pose => {
  const from = chasePose(f);
  const yawK = windowed(f, 836, 856, 862, 880, EASE.inOut);
  const to = frontPose(add(CHART_TARGET, [yawK * 26, yawK * 3, 0]), FRONT_DIST + yawK * 40, 30, -0.42 * yawK);
  const fromDir = sub(from.pos, from.target);
  const toDir = sub(to.pos, to.target);
  const kd = ease(f, CUES.reveal.pullBack, [0, 1], EASE.inOut);
  const l0 = Math.log(len(fromDir));
  const l1 = Math.log(len(toDir));
  const logD = lerp(l0, l1, kd);
  const dist = Math.exp(logD);
  const turn = smoothstep(Math.log(6), Math.log(70), logD);
  const recentre = smoothstep(Math.log(45), Math.log(420), logD);
  const dir = slerpDir(fromDir, toDir, turn);
  const orb = getOrbPos(f);
  const target = mix(mix(add(orb, [0, 0.3, 0]), from.target, 1 - turn), to.target, recentre);
  const pos = add(target, scale(new THREE.Vector3(...dir).normalize().toArray() as V3, dist));
  const fov = Math.exp(lerp(Math.log(from.fov), Math.log(to.fov), smoothstep(Math.log(10), Math.log(400), logD)));
  return {pos, target, fov, roll: 0};
};

const latePose = (f: number): Pose => {
  // crowd -> quote -> lesson -> cta: slow, calm drift on the flat line
  const push = ease(f, [870, 1350], [0, 1], EASE.sine);
  const ctaK = ease(f, [1196, 1250], [0, 1], EASE.inOut);
  const target = mix(add(CHART_TARGET, [0, 0, 0]), add(RING_CENTER, [0, -20, 0]), ctaK);
  const dist = lerp(FRONT_DIST, 420, push);
  const yaw = Math.sin(f * 0.012) * 0.035;
  return frontPose(target, dist, 30, yaw);
};

const blendPose = (a: Pose, b: Pose, t: number): Pose => ({
  pos: mix(a.pos, b.pos, t),
  target: mix(a.target, b.target, t),
  fov: lerp(a.fov, b.fov, t),
  roll: lerp(a.roll, b.roll, t),
});

/** Camera shake amplitude at a frame (base from the emotion + impacts). */
const shakeAmp = (f: number, stageShake: number) => {
  let a = stageShake;
  if (f < 90) a = Math.max(a, 0.55);
  if (f >= 90 && f < 140) a = Math.max(a, 0.25 * (1 - ease(f, [100, 140])));
  for (const imp of IMPACTS) {
    const t = f - imp.frame;
    if (t >= 0 && t < 30) a += imp.shake * Math.exp(-t / 5);
  }
  // shake only during the ride and before
  return a * (1 - ease(f, [748, 790]));
};

const basePose = (f: number): Pose => {
  if (f < 132) return chasePose(f, f < 88 ? 3 : 0);
  if (f < 160) return blendPose(chasePose(f, 0), orbitPose(f), ease(f, [132, 160], [0, 1], EASE.inOut));
  if (f < 240) return orbitPose(f);
  if (f < 256) return blendPose(orbitPose(f), chasePose(f), ease(f, [240, 256], [0, 1], EASE.inOut));
  if (f < CUES.reveal.pullBack[0]) return chasePose(f);
  if (f < 880) return revealPose(f);
  return latePose(f);
};

export const cameraAt = (f: number, stageShake: number): Pose => {
  const p = basePose(f);
  const amp = shakeAmp(f, stageShake);
  // violent shakes are faster
  const sp = f < 90 || (f > 500 && f < 580) ? 1.9 : 1.1;
  const sx = wobble(f * sp, 1.3) * amp * 0.32;
  const sy = wobble(f * sp, 7.9) * amp * 0.26;
  const sr = wobble(f * sp * 0.8, 4.4) * amp * 0.05;
  const rideK = f < 748 ? 1 : 1 - ease(f, [748, 790]);
  const bank = bankAt(f) * rideK;
  return {
    pos: add(p.pos, [0, sy, sx]),
    target: add(p.target, [0, sy * 0.6, sx * 0.6]),
    fov: p.fov,
    roll: p.roll + sr + bank,
  };
};

// ---------------------------------------------------------------------------------------------
// Heart rate: integrated phase, so the beat speeds up and slows down smoothly
// ---------------------------------------------------------------------------------------------
const bpmRaw = (f: number) => {
  if (f < 88) return 140 + Math.round(wobble(f * 0.9, 2) * 3);
  if (f < 140) return lerp(140, 62, ease(f, [88, 140], [0, 1], EASE.inOut));
  if (f < 240) return 62;
  if (f < 760) return stageAt(orbS(f)).bpm;
  return lerp(stageAt(orbS(f)).bpm, 60, ease(f, [760, 900]));
};
export const BPM: number[] = [];
export const HEART_PHASE: number[] = [];
{
  let ph = 0.75; // first beat lands on frame ~2
  for (let f = 0; f < VIDEO.durationInFrames + 2; f++) {
    // smooth the bpm a little so the HUD never jumps (except the cold-open flicker)
    const b = f < 88 ? bpmRaw(f) : (bpmRaw(f) + bpmRaw(f - 4) + bpmRaw(f - 8)) / 3;
    BPM.push(b);
    HEART_PHASE.push(ph);
    ph += b / 60 / VIDEO.fps;
  }
}
/** Frames on which a heartbeat starts (for heartbeat.mp3). */
export const BEAT_FRAMES: number[] = [];
for (let f = 1; f < HEART_PHASE.length; f++) {
  if (Math.floor(HEART_PHASE[f]) > Math.floor(HEART_PHASE[f - 1])) BEAT_FRAMES.push(f);
}

// ---------------------------------------------------------------------------------------------
// Particle drift (integrated, so particles never jump)
// ---------------------------------------------------------------------------------------------
export const DRIFT: number[] = [];
{
  let d = 0;
  for (let f = 0; f < VIDEO.durationInFrames + 2; f++) {
    DRIFT.push(d);
    let v = f < 760 ? stageAt(orbS(f)).drift : 0.01;
    if (f >= 88 && f < 140) v = -0.5 * windowed(f, 88, 96, 128, 140); // everything rewinds
    if (f >= 380 && f < 446) v *= 0.15; // time slows at the summit
    d += v;
  }
}

// ---------------------------------------------------------------------------------------------
// The world at a frame
// ---------------------------------------------------------------------------------------------
export type World = {
  frame: number;
  cam: Pose;
  orb: {u: number; pos: V3; color: THREE.Color; opacity: number; scale: number; pulse: number};
  stage: StageNum;
  shape: ShapeWeights;
  rails: number; // 1 = two rails + ties, 0 = one line
  ties: number;
  trackGold: number; // 0 = emotion colors along the track, 1 = all gold
  trackBright: number;
  trackOpacity: number;
  priceDraw: number;
  candles: number;
  ghosts: number[];
  fogDensity: number;
  fogBanks: number;
  ray: number;
  grade: {
    tint: THREE.Color;
    tintAmt: number;
    sat: number;
    exposure: number;
    split: number;
    radial: number;
    vignette: number;
    vigColor: THREE.Color;
    grain: number;
    flash: number;
    flashColor: THREE.Color;
    bloom: number;
  };
  bpm: number;
  heart: number; // beat phase
  greed: number;
  hud: number;
  drift: number;
  timeSlow: number;
  hang: number;
  pulse: {u: number; amt: number};
  trail: number;
};

const GOLD = new THREE.Color('#D4AF37');
const BLACK = new THREE.Color('#000000');
const ALARM = new THREE.Color('#5A0008');

const cache = new Map<number, World>();

const camSpeed = (f: number) => {
  const a = basePose(f).pos;
  const b = basePose(f - 1).pos;
  return len(sub(a, b));
};

export const getWorld = (frame: number): World => {
  const hit = cache.get(frame);
  if (hit) return hit;
  const f = frame;
  const s = orbS(f);
  const rideStage = stageAt(s);
  // after the ride, ease the world back to a neutral gold look
  const late = ease(f, [760, 860], [0, 1], EASE.inOut);
  const calmStage = stageAt(STAGE_S.end);
  const stage = {...rideStage, color: rideStage.color.clone()};
  for (const k of ['sat', 'tint', 'exposure', 'shake', 'split', 'vignette', 'fog'] as const) {
    stage[k] = lerp(rideStage[k], calmStage[k], late);
  }
  stage.color.lerp(GOLD, late);

  const cam = cameraAt(f, stage.shake);
  const shape = shapeWeights(f);
  const u = orbU(f);

  // --- orb
  const heart = HEART_PHASE[Math.max(0, Math.min(HEART_PHASE.length - 1, f))];
  const pulse = Math.max(0, Math.min(1.6, (() => {
    const p = heart - Math.floor(heart);
    return Math.exp(-(((p - 0.06) / 0.05) ** 2)) + 0.55 * Math.exp(-(((p - 0.26) / 0.06) ** 2));
  })()));
  const orbOpacity =
    f < 872 ? 1 : f < 990 ? 1 - ease(f, [866, 880]) : ease(f, [1000, 1024]);
  const orbScale = lerp(1, 6.5, ease(f, [760, 830], [0, 1], EASE.inOut));

  // --- grade
  const speed = camSpeed(f);
  const rewindK = windowed(f, 88, 96, 126, 140);
  const radial = THREE.MathUtils.clamp((speed - 0.25) * 0.03, 0, 0.09) * (1 - late) + rewindK * 0.06;
  let flash = 0;
  const flashColor = new THREE.Color('#FFFFFF');
  for (const imp of IMPACTS) {
    const t = f - imp.frame;
    if (t >= 0 && t < 20 && imp.flash > 0) {
      const v = imp.flash * Math.exp(-t / 1.6);
      if (v > flash) {
        flash = v;
        flashColor.set(imp.color ?? '#FFFFFF');
      }
    }
  }
  // the alarm: red pulses on each heartbeat during the cold open and the panic
  const alarmK = f < 90 ? 1 : windowed(f, 512, 524, 560, 580);
  const beat = heartbeatPulse(heart);
  const vignette = stage.vignette + alarmK * beat * 0.12 + (f < 90 ? 0.1 : 0);
  const vigColor = BLACK.clone().lerp(ALARM, Math.max(alarmK * (0.3 + 0.6 * Math.min(1, beat)), clamp01((stage.vignette - 0.6) * 4) * (1 - late) * 0.7));
  const hang = hangAt(f);
  const bottomK = windowed(f, 576, 596, 650, 672);
  const exposure = stage.exposure * (1 + alarmK * beat * 0.08) * (1 - ease(f, [1330, 1350]) * 0.0);
  const split = stage.split * (1 - late) + rewindK * 0.006 + (f < 90 ? 0.006 : 0) + flash * 0.004;

  // bloom: white-hot at euphoria, low at the bottom
  const bloom = lerp(0.85, 1.4, smoothstep(STAGE_S.thrill, STAGE_S.euphoria, s) * (1 - smoothstep(STAGE_S.peak, STAGE_S.anxiety + 4, s))) * (1 - bottomK * 0.45) * lerp(1, 0.9, late);

  // --- line / chart
  const flat = shape.flatten;
  const ghostsBase = (start: number) => ease(f, [start, start + 18], [0, 1], EASE.out) * (1 - ease(f, [868, 890]));

  const world: World = {
    frame: f,
    cam,
    orb: {u, pos: shapeAtU(u, shape, f), color: stage.color.clone(), opacity: orbOpacity, scale: orbScale, pulse: pulse * (1 + bottomK * 1.6)},
    stage,
    shape,
    rails: 1 - ease(f, [760, 812], [0, 1], EASE.inOut),
    ties: 1 - ease(f, [756, 790], [0, 1], EASE.inOut),
    trackGold: ease(f, [990, 1024], [0, 1], EASE.inOut),
    trackBright: 1 + hang * 0.4 - bottomK * 0.35,
    trackOpacity: 1,
    priceDraw: ease(f, CUES.reveal.draw, [0, 1], EASE.inOut),
    candles: ease(f, [CUES.reveal.draw[0], CUES.reveal.draw[0] + 6]) * (1 - ease(f, [992, 1008])),
    ghosts: CUES.reveal.ghosts.map((g) => ghostsBase(g) * 0.55),
    fogDensity: lerp(0.016, 0, ease(f, [750, 800])) * (1 + bottomK * 1.2),
    fogBanks: stage.fog * (1 - ease(f, [756, 800])),
    ray: windowed(f, CUES.ride.hopeRay, CUES.ride.hopeRay + 22, 720, 760, EASE.inOut),
    grade: {
      tint: stage.color.clone(),
      tintAmt: stage.tint,
      sat: stage.sat,
      exposure,
      split,
      radial,
      vignette,
      vigColor,
      grain: 0.05 + (f < 140 ? 0.03 : 0) + bottomK * 0.04,
      flash,
      flashColor,
      bloom,
    },
    bpm: BPM[Math.max(0, Math.min(BPM.length - 1, f))],
    heart,
    greed: f < 88 ? -0.92 + wobble(f * 0.7, 3) * 0.05 : f < 240 ? lerp(-0.92, 0.05, ease(f, [88, 150])) : rideStage.greed,
    hud: f < CUES.ride.hudExit ? 1 : 1 - ease(f, [CUES.ride.hudExit - 4, CUES.ride.hudExit + 14]),
    drift: DRIFT[Math.max(0, Math.min(DRIFT.length - 1, f))],
    timeSlow: Math.max(hang, bottomK),
    hang,
    pulse: pulseAt(f),
    trail: f >= 1125 && f < 1210 ? 0.16 : 0.012,
  };
  void flat;
  cache.set(frame, world);
  return world;
};

/** A soft light pulse travelling along the line (quote and CTA). */
const pulseAt = (f: number) => {
  for (const p of [...CUES.quote.pulses, ...CUES.cta.pulses]) {
    if (f >= p && f < p + 34) return {u: ease(f, [p, p + 34], [-0.05, 1.05], EASE.inOut), amt: 2.2 * Math.sin(Math.PI * ((f - p) / 34))};
  }
  return {u: -1, amt: 0};
};

/** 0..1 heartbeat pulse for a beat phase. */
export const heartbeatPulse = (phase: number) => {
  const p = phase - Math.floor(phase);
  return Math.exp(-(((p - 0.06) / 0.05) ** 2)) + 0.55 * Math.exp(-(((p - 0.26) / 0.06) ** 2));
};

// ---------------------------------------------------------------------------------------------
// Projection (for DOM overlays anchored to 3D points)
// ---------------------------------------------------------------------------------------------
const projCam = new THREE.PerspectiveCamera(50, VIDEO.width / VIDEO.height, 0.1, 5000);

export const applyPose = (camera: THREE.PerspectiveCamera, pose: Pose) => {
  camera.fov = pose.fov;
  camera.near = 0.1;
  camera.far = 5000;
  camera.position.set(...pose.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...pose.target);
  camera.rotateZ(pose.roll);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
};

/** Screen position (px in the 1080x1920 frame) of a world point at a frame. */
export const project = (frame: number, p: V3) => {
  const w = getWorld(frame);
  applyPose(projCam, w.cam);
  const v = new THREE.Vector3(...p);
  const camSpace = v.clone().applyMatrix4(projCam.matrixWorldInverse);
  v.project(projCam);
  return {
    x: (v.x * 0.5 + 0.5) * VIDEO.width,
    y: (-v.y * 0.5 + 0.5) * VIDEO.height,
    depth: -camSpace.z,
    visible: camSpace.z < 0,
  };
};
