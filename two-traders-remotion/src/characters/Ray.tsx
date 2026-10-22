import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brow, Eye, Glow, Hand, HandShape, Limb, Mouth, Nose} from './parts';
import {Can, Keyboard, Monitor, NoiseFeed, Phone, Sticky} from './props';
import {
  blink,
  breathing,
  clamp01,
  current,
  deg,
  evalNumber,
  evalTrack,
  hangArm,
  headSway,
  ik,
  lerp,
  Params,
  seg,
  shake,
  Talking,
  Track,
  viseme,
} from './rig';
import {lighting} from '../theme';

export type RayExpression = 'neutral' | 'excited' | 'panic' | 'confused' | 'despair' | 'shocked';
export type RayPose = 'idle' | 'slam' | 'double-down' | 'hair-pull' | 'phone-juggle' | 'frozen';
export type Look = 'screen' | 'down' | 'viewer';

export type RayProps = {
  uid?: string;
  expression?: Track<RayExpression>;
  pose?: Track<RayPose>;
  look?: Track<Look>;
  talking?: Talking;
  intensity?: Track<number>; // 0..6 → shake px, faster blinks
  clutter?: Track<number>; // 0..3: cans and sticky notes pile up
  screen?: React.ReactNode;
  screenPulse?: number;
  /** frame offset so a still can show any moment of a pose */
  frameOffset?: number;
};

const L = lighting.ray;
const C = {
  skin: '#E2BC9B',
  skinShade: '#9C7A78',
  skinDeep: '#5E4A58',
  lip: '#9A5E5C',
  hair: '#17141A',
  hairHi: '#3A3846',
  jacket: '#2A2E37',
  jacketShade: '#111318',
  jacketSheen: '#7C8496',
  tee: '#B8322F',
  teeShade: '#6E1D1D',
  iris: '#4A3526',
};

// ── Expressions ───────────────────────────────────────────────────────────
const EXPR: Record<RayExpression, Params> = {
  neutral: {bIn: 0, bOut: 0, bAsym: 0, lid: 0.22, lower: 0.1, pupil: 1, curve: 0, open: 0, width: 1, skew: 0, sweat: 0},
  excited: {bIn: 5, bOut: 7, bAsym: 0, lid: 0.02, lower: 0.2, pupil: 1.15, curve: 0.85, open: 0.32, width: 1.18, skew: 0, sweat: 0},
  panic: {bIn: 10, bOut: -3, bAsym: 0, lid: 0, lower: 0, pupil: 0.72, curve: -0.6, open: 0.42, width: 0.95, skew: 0.2, sweat: 1},
  confused: {bIn: 2, bOut: 2, bAsym: 7, lid: 0.18, lower: 0.25, pupil: 1, curve: -0.25, open: 0.06, width: 0.82, skew: 0.9, sweat: 0},
  despair: {bIn: 9, bOut: -6, bAsym: 0, lid: 0.5, lower: 0, pupil: 0.9, curve: -0.95, open: 0.14, width: 0.92, skew: 0, sweat: 0.6},
  shocked: {bIn: 11, bOut: 11, bAsym: 0, lid: 0, lower: 0, pupil: 0.58, curve: -0.15, open: 1.05, width: 0.78, skew: 0, sweat: 0.3},
};

const LOOK: Record<Look, Params> = {
  screen: {turn: 1, nod: 0.15, tilt: 3, gx: 0.85, gy: 0.35},
  down: {turn: 0.45, nod: 1, tilt: -2, gx: 0.15, gy: 1},
  viewer: {turn: 0.35, nod: 0, tilt: 0, gx: -0.35, gy: 0},
};

// ── Poses ─────────────────────────────────────────────────────────────────
// Hand targets are in box space. Each pose may carry internal motion over `t`.
type PoseOut = {p: Params; f: HandShape; b: HandShape; fb?: 1 | -1; bb?: 1 | -1};
const BASE: Params = {
  lean: 0, drop: 0, tx: 0,
  fx: 252, fy: 716, fr: 0, bx: 132, by: 728, br: 0,
  tiltAdd: 0, nodAdd: 0, gxAdd: 0, gyAdd: 0, juggle: 0, fHang: 1, bHang: 1,
};

const pose = (name: RayPose, t: number): PoseOut => {
  switch (name) {
    case 'idle':
      return {p: {...BASE, fy: 716 + Math.sin(t / 6) * 1.5}, f: 'flat', b: 'flat'};
    case 'slam': {
      const up = seg(t, 0, 14);
      const down = seg(t, 14, 19, (x) => x * x * x);
      const bounce = Math.sin(seg(t, 19, 34) * Math.PI) * (1 - seg(t, 19, 34)) * 10;
      const handY = lerp(lerp(716, 470, up), 726, down) - bounce;
      const handX = lerp(lerp(252, 300, up), 262, down);
      return {
        p: {
          ...BASE,
          fx: handX,
          fy: handY,
          fr: lerp(-30, 10, down),
          lean: lerp(-3 * up, 6, down),
          drop: 7 * down,
          nodAdd: 0.35 * down,
          tiltAdd: -4 * up + 6 * down,
          fHang: clamp01(1 - up + down),
        },
        f: 'fist',
        b: 'flat',
      };
    }
    case 'double-down': {
      const jab = (a: number) => Math.max(0, 1 - Math.abs(t - a) / 4);
      const j = Math.max(jab(6), jab(18), jab(30) * 0.8, t > 40 ? jab(40 + ((t - 40) % 14)) * 0.5 : 0);
      return {
        p: {...BASE, fx: 276, fy: 694 + j * 32, fr: 20, lean: 4 + j * 2, nodAdd: 0.25, drop: 3},
        f: 'point',
        b: 'fist',
      };
    }
    case 'hair-pull': {
      const tug = Math.sin(t / 4.5) * 4;
      return {
        p: {
          ...BASE,
          fx: 176 + tug * 0.5,
          fy: 276 + tug,
          fr: -150,
          bx: 46 - tug * 0.5,
          by: 282 - tug,
          br: -40,
          fHang: 0,
          bHang: 0,
          lean: 3,
          nodAdd: 0.35,
          tiltAdd: Math.sin(t / 7) * 4,
          gyAdd: 0.4,
        },
        f: 'claw',
        b: 'claw',
        fb: 1,
        bb: -1,
      };
    }
    case 'phone-juggle': {
      const c = Math.sin((t / 36) * Math.PI * 2);
      return {
        p: {
          ...BASE,
          fx: 236 + c * 6,
          fy: 622 + c * 16,
          fr: -80,
          bx: 66 - c * 6,
          by: 636 - c * 16,
          br: -60,
          lean: 2,
          nodAdd: 0.4,
          gxAdd: Math.sin(t / 9) * 1.1,
          tiltAdd: Math.sin(t / 11) * 3,
          juggle: 1,
          fHang: 0.55,
          bHang: 0.55,
        },
        f: 'grip',
        b: 'grip',
      };
    }
    case 'frozen':
      return {
        p: {...BASE, lean: -4, drop: 22, fx: 246, fy: 760, fr: 10, bx: 122, by: 768, tiltAdd: 5, nodAdd: -0.1},
        f: 'flat',
        b: 'flat',
      };
  }
};

const poseDur = (p: RayPose) => (p === 'slam' || p === 'double-down' ? 8 : 16);

// ── State ─────────────────────────────────────────────────────────────────
const stateAt = (f: number, props: Required<Pick<RayProps, 'pose' | 'look' | 'intensity'>>) => {
  const body = evalTrack(props.pose, f, (v, t) => pose(v, t).p, poseDur);
  const look = evalTrack(props.look, f, (v) => LOOK[v], 10);
  const intensity = evalNumber(props.intensity, f, 24);
  const sway = headSway(f, 'ray');
  const sh = shake(f, intensity, 'ray-shake');
  const torsoRot = body.lean + sh.r;
  const headRot = look.tilt + body.tiltAdd + sway.rot + sh.r * 2;
  return {body, look, intensity, sway, sh, torsoRot, headRot};
};

// Rotate a point around the torso pivot, then apply drop/shake
const PIVOT = {x: 105, y: 760};
const torsoPoint = (x: number, y: number, rotDeg: number, dx: number, dy: number, sy: number) => {
  const a = (rotDeg * Math.PI) / 180;
  const px = x - PIVOT.x;
  const py = (y - PIVOT.y) * sy;
  return [PIVOT.x + px * Math.cos(a) - py * Math.sin(a) + dx, PIVOT.y + px * Math.sin(a) + py * Math.cos(a) + dy] as [number, number];
};

const CANS: Array<[number, number, boolean?]> = [
  [18, 800], [52, 822], [372, 812], [-40, 866], [96, 902, true], [330, 905], [-80, 820], [150, 935, true],
];
const NOTES: Array<[number, number, number, string, boolean]> = [
  [330, 300, -8, '#E8D36A', false], [388, 470, 10, '#E58BA0', false], [-10, 880, 14, '#E8D36A', true], [250, 860, -20, '#8FD1B8', true],
  [180, 812, 30, '#E8D36A', true], [-60, 790, -6, '#E58BA0', true], [-120, 470, -14, '#E8D36A', false],
  [60, 930, 8, '#8FD1B8', true], [300, 935, -12, '#E58BA0', true], [-110, 900, 20, '#E8D36A', true],
  [392, 520, 6, '#E58BA0', false], [120, 860, -30, '#E8D36A', true], [-90, 700, 4, '#8FD1B8', false], [400, 860, 18, '#E8D36A', true],
];
// Hairline sweeps from the temple, across the forehead, down past the ear
const HAIR_CAP =
  'M -66 12 C -76 -48 -52 -110 4 -116 C 52 -120 86 -98 88 -64 C 90 -52 86 -42 80 -38 L 72 -50 L 66 -34 L 56 -52 L 48 -38 L 38 -56 L 28 -44 L 18 -58 L 8 -50 L -4 -60 C -18 -54 -28 -40 -34 -20 C -38 -6 -40 4 -44 10 C -50 14 -58 16 -66 12 Z';
const COUNTS = {cans: [3, 4, 6, 8], notes: [4, 7, 10, 14]};

export const Ray: React.FC<RayProps> = ({
  uid = 'ray',
  expression = 'neutral',
  pose: poseTrack = 'idle',
  look: lookTrack = 'screen',
  talking = false,
  intensity: intensityTrack = 0,
  clutter = 0,
  screen,
  screenPulse = 0,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame() + frameOffset;
  const tracks = {pose: poseTrack, look: lookTrack, intensity: intensityTrack};
  const now = stateAt(frame, tracks);
  const lag4 = stateAt(frame - 4, tracks);
  const lag8 = stateAt(frame - 8, tracks);
  const {body, look, intensity, sh} = now;

  const ex = evalTrack(expression, frame, (v) => EXPR[v], 8);
  const vis = viseme(frame, talking, `${uid}-talk`);
  const lidBlink = blink(frame, uid, (f) => 1 + (evalNumber(intensityTrack, f, 24) / 6) * 1.6);
  const breath = breathing(frame, uid) + Math.sin(frame / 9) * 0.004 * (intensity / 6);

  // Discrete hand shapes follow whichever pose dominates
  const cur = current(poseTrack, frame);
  const shapes = cur.local < poseDur(cur.v) / 2 && Array.isArray(poseTrack)
    ? (() => {
        const keys = poseTrack;
        const i = keys.findIndex((k) => k.v === cur.v && k.at === frame - cur.local);
        return i > 0 ? pose(keys[i - 1].v, frame - keys[i - 1].at) : pose(cur.v, cur.local);
      })()
    : pose(cur.v, cur.local);

  const dx = body.tx + sh.x;
  const dy = body.drop + sh.y;
  const sp = (x: number, y: number) => torsoPoint(x, y, now.torsoRot, dx, dy, breath);
  const shoulderF = sp(192, 498);
  const shoulderB = sp(32, 494);
  const neck = sp(112, 446);

  const front = hangArm(ik(shoulderF[0], shoulderF[1], body.fx + sh.x, body.fy + sh.y, 134, 124, shapes.fb ?? -1), shoulderF[0], shoulderF[1], body.fHang, 12);
  const back = hangArm(ik(shoulderB[0], shoulderB[1], body.bx + sh.x, body.by + sh.y, 134, 124, shapes.bb ?? 1), shoulderB[0], shoulderB[1], body.bHang, -6);

  // Secondary motion: hair and collar lag behind head/torso
  const hairLag = (lag4.headRot - now.headRot) * 1.6 + (lag8.headRot - now.headRot) * 0.8 + (lag4.sh.x - sh.x) * 0.6;
  const collarLag = (lag8.torsoRot - now.torsoRot) * 1.2 + (lag8.body.drop - body.drop) * 0.15;
  const flutter = (k: number) => Math.sin(frame / (13 + k * 3) + k) * (1.5 + intensity * 0.4);

  const turn = look.turn;
  const nod = clamp01(look.nod + body.nodAdd);
  const gx = Math.max(-1, Math.min(1, look.gx + body.gxAdd));
  const gy = Math.max(-1, Math.min(1, look.gy + body.gyAdd));

  const nearX = lerp(24, 40, turn);
  const farX = lerp(-22, -4, turn);
  const eyeY = -8 + nod * 9;
  const lid = Math.max(clamp01(ex.lid + nod * 0.32), lidBlink);
  const mouthOpen = ex.open + vis.open * (1 - ex.open * 0.45);
  const mouthW = 34 * ex.width * vis.width;
  const mouthX = lerp(10, 28, turn);
  const mouthY = 50 + nod * 7;
  const cl = Math.round(evalNumber(clutter, frame, 1));

  // Phones: desk spots → juggled in hands
  const hold = clamp01(body.juggle);
  const jugT = (frame % 36) / 36;
  const leg = Math.floor(frame / 36) % 2;
  const fromP = leg ? [front.hx, front.hy - 30] : [back.hx, back.hy - 30];
  const toP = leg ? [back.hx, back.hy - 30] : [front.hx, front.hy - 30];
  const air = [lerp(fromP[0], toP[0], jugT), lerp(fromP[1], toP[1], jugT) - Math.sin(jugT * Math.PI) * 120];
  const phones: Array<{x: number; y: number; a: number}> = [
    {x: lerp(32, back.hx + 6, hold), y: lerp(904, back.hy - 34, hold), a: lerp(-14, -6, hold)},
    {x: lerp(196, front.hx + 6, hold), y: lerp(930, front.hy - 34, hold), a: lerp(10, 8, hold)},
    {x: lerp(-70, air[0], hold), y: lerp(940, air[1], hold), a: lerp(-24, jugT * 360 * (leg ? -1 : 1), hold)},
  ];
  const scroll = frame * (2 + hold * 10);

  const rimDx = -4;
  const handProps = {skin: C.skin, shade: C.skinShade, rim: L.rim, rimDx};

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={L.wallTop} />
          <stop offset="100%" stopColor={L.wallBottom} />
        </linearGradient>
        <linearGradient id={`${uid}-jacket`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.jacketShade} />
          <stop offset="70%" stopColor={C.jacket} />
          <stop offset="100%" stopColor="#3A404D" />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor={C.skinShade} />
          <stop offset="55%" stopColor={C.skin} />
          <stop offset="100%" stopColor="#EED2BA" />
        </linearGradient>
        <linearGradient id={`${uid}-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E1320" />
          <stop offset="100%" stopColor="#1C2436" />
        </linearGradient>
        <radialGradient id={`${uid}-rimglow`} cx="0" cy="0.4" r="0.9">
          <stop offset="0%" stopColor={L.rim} stopOpacity={0.35} />
          <stop offset="100%" stopColor={L.rim} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ── Room ── */}
      <rect x={-160} y={-40} width={600} height={760} fill={`url(#${uid}-wall)`} />
      <rect x={-160} y={-40} width={600} height={760} fill={`url(#${uid}-rimglow)`} />
      {/* night window with cold bokeh */}
      <g opacity={0.9}>
        <rect x={-120} y={70} width={150} height={330} rx={4} fill="#0A0F1B" stroke="#202B42" strokeWidth={4} />
        <line x1={-45} x2={-45} y1={70} y2={400} stroke="#202B42" strokeWidth={3} />
        {Array.from({length: 14}, (_, i) => (
          <circle
            key={i}
            cx={-110 + ((i * 37) % 140)}
            cy={110 + ((i * 53) % 270)}
            r={3 + (i % 3) * 2}
            fill={i % 4 === 0 ? '#D9534F' : '#5B7BC4'}
            opacity={0.18 + 0.12 * Math.sin(frame / 40 + i)}
          />
        ))}
      </g>
      {/* red LED strip */}
      <rect x={-160} y={58} width={600} height={3} fill={L.rim} opacity={0.55} />
      <rect x={-160} y={52} width={600} height={14} fill={L.rim} opacity={0.12} style={{filter: 'blur(6px)'}} />
      {/* shelf */}
      <rect x={250} y={170} width={180} height={8} fill="#121A2B" />
      <rect x={270} y={128} width={18} height={42} fill="#232E46" />
      <rect x={292} y={136} width={14} height={34} fill="#2A2232" />
      <rect x={340} y={146} width={40} height={24} rx={3} fill="#1B2438" />
      {NOTES.slice(0, COUNTS.notes[cl]).filter((n) => !n[4] && n[1] < 380).map((n, i) => (
        <Sticky key={`w${i}`} x={n[0]} y={n[1]} rot={n[2]} color={n[3]} />
      ))}

      {/* ── Monitor (behind the character) ── */}
      <Monitor uid={`${uid}-mon`} bezel="#0C0F16" bezelEdge="#2A3448" screenBg={['#0D1424', '#120E16']} glow={L.screenGlow} pulse={screenPulse}>
        {screen}
      </Monitor>
      {NOTES.slice(0, COUNTS.notes[cl]).filter((n) => !n[4] && n[1] >= 380).map((n, i) => (
        <Sticky key={`m${i}`} x={n[0]} y={n[1]} rot={n[2]} color={n[3]} />
      ))}

      {/* ── Back upper arm (behind torso) ── */}
      <Limb s={shoulderB} e={[back.ex, back.ey]} h={[back.ex, back.ey]} upper={52} fore={46} fill={C.jacket} shade={C.jacketShade} rim={L.rim} rimDx={rimDx} />

      {/* ── Torso ── */}
      <g transform={`translate(${dx} ${dy}) rotate(${now.torsoRot} ${PIVOT.x} ${PIVOT.y}) translate(${PIVOT.x} ${PIVOT.y}) scale(1 ${breath}) translate(${-PIVOT.x} ${-PIVOT.y})`}>
        <path d="M 76 458 C 46 462 20 476 10 504 C 0 548 -4 640 0 760 L 222 760 C 224 650 224 560 214 514 C 206 486 180 466 148 458 Z" fill={L.rim} transform="translate(-4 -2)" />
        <path d="M 76 458 C 46 462 20 476 10 504 C 0 548 -4 640 0 760 L 222 760 C 224 650 224 560 214 514 C 206 486 180 466 148 458 Z" fill={`url(#${uid}-jacket)`} />
        {/* red tee */}
        <path d="M 96 462 C 110 474 132 474 150 462 L 160 560 L 166 760 L 104 760 L 100 600 Z" fill={C.tee} />
        <path d="M 96 462 C 110 474 132 474 150 462 L 152 486 C 136 494 112 494 98 484 Z" fill={C.teeShade} opacity={0.7} />
        <path d="M 100 600 L 104 760 L 120 760 L 114 560 Z" fill={C.teeShade} opacity={0.5} />
        {/* lapels + collar lag behind the torso */}
        <g transform={`rotate(${collarLag} 112 470)`}>
          <path d="M 96 462 L 70 452 L 62 476 L 90 520 L 104 620 L 100 600 Z" fill="#1A1D24" />
          <path d="M 150 462 L 172 448 L 182 470 L 166 530 L 160 600 L 160 560 Z" fill="#30353F" />
          <path d="M 172 448 L 182 470 L 166 530" fill="none" stroke={C.jacketSheen} strokeWidth={1.5} opacity={0.5} />
          <path d="M 70 452 L 62 476 L 90 520" fill="none" stroke={L.rim} strokeWidth={2} opacity={0.7} />
        </g>
        {/* leather sheen + zip */}
        <path d="M 196 520 C 204 580 206 650 204 740" stroke={C.jacketSheen} strokeWidth={3} opacity={0.35} fill="none" strokeLinecap="round" />
        <path d="M 30 540 C 24 600 22 660 22 740" stroke="#fff" strokeWidth={2} opacity={0.08} fill="none" />
        <path d="M 166 600 L 168 760" stroke="#8A90A0" strokeWidth={1.5} opacity={0.5} strokeDasharray="3 3" />
        {/* neck */}
        <path d="M 88 410 L 136 410 L 142 466 C 124 476 102 476 86 464 Z" fill={`url(#${uid}-skin)`} />
        <path d="M 94 430 C 108 446 124 446 134 436 L 134 452 C 120 460 104 458 94 450 Z" fill={C.skinDeep} opacity={0.45} />
      </g>

      {/* ── Head ── */}
      <g transform={`translate(${neck[0] + now.sway.x} ${neck[1] + now.sway.y}) rotate(${now.headRot}) translate(0 -98)`}>
        {/* hair back mass */}
        <path d="M -64 12 C -76 -40 -60 -94 -8 -108 C 32 -118 72 -102 84 -62 C 88 -46 80 -38 72 -42 C 64 -60 48 -70 28 -68 C 8 -62 -10 -62 -28 -58 C -40 -40 -46 -10 -52 14 Z" fill={L.rim} transform="translate(-4 -2)" />
        <path d="M -64 12 C -76 -40 -60 -94 -8 -108 C 32 -118 72 -102 84 -62 C 88 -46 80 -38 72 -42 C 64 -60 48 -70 28 -68 C 8 -62 -10 -62 -28 -58 C -40 -40 -46 -10 -52 14 Z" fill={C.hair} />
        {/* face */}
        <path d="M -62 -20 C -66 -75 -30 -100 5 -100 C 50 -100 72 -70 72 -25 C 74 -5 80 10 76 22 C 74 45 64 70 40 84 C 25 92 8 92 -8 86 C -35 76 -55 50 -60 20 Z" fill={L.rim} transform="translate(-3 0)" />
        <path d="M -62 -20 C -66 -75 -30 -100 5 -100 C 50 -100 72 -70 72 -25 C 74 -5 80 10 76 22 C 74 45 64 70 40 84 C 25 92 8 92 -8 86 C -35 76 -55 50 -60 20 Z" fill={`url(#${uid}-skin)`} />
        {/* far-cheek shadow + jaw */}
        <path d="M -60 -10 C -58 30 -40 64 -8 86 C -30 80 -54 56 -60 20 Z" fill={C.skinDeep} opacity={0.35} />
        <path d="M -40 30 C -30 64 -6 86 14 88 C 36 86 58 68 70 40 C 60 56 48 62 36 62 C 20 72 0 70 -10 62 C -24 54 -34 44 -40 30 Z" fill="#2A2232" opacity={0.28} />
        <path d={`M ${mouthX - 18} ${mouthY - 12} C ${mouthX - 6} ${mouthY - 17} ${mouthX + 10} ${mouthY - 17} ${mouthX + 22} ${mouthY - 11} L ${mouthX + 20} ${mouthY - 6} C ${mouthX + 8} ${mouthY - 10} ${mouthX - 6} ${mouthY - 10} ${mouthX - 16} ${mouthY - 6} Z`} fill="#2A2232" opacity={0.18} />
        <path d={HAIR_CAP} fill={C.hair} />
        <Glow id={`${uid}-faceglow`} cx={70} cy={10} r={70} color={screenPulse > 0.05 ? L.rim : L.screenGlow} opacity={0.22 + screenPulse * 0.3} />
        {/* ear */}
        <ellipse cx={lerp(-58, -46, turn)} cy={8} rx={11} ry={18} fill={C.skinShade} />
        <path d={`M ${lerp(-58, -46, turn) - 2} -4 C ${lerp(-58, -46, turn) + 5} 2 ${lerp(-58, -46, turn) + 4} 14 ${lerp(-58, -46, turn) - 2} 18`} fill="none" stroke={C.skinDeep} strokeWidth={2} opacity={0.6} />
        {/* dark circles */}
        <path d={`M ${nearX - 12} ${eyeY + 9} Q ${nearX} ${eyeY + 17} ${nearX + 13} ${eyeY + 8}`} fill="none" stroke="#6A4A6E" strokeWidth={4} opacity={0.22} strokeLinecap="round" />
        <path d={`M ${farX - 10} ${eyeY + 9} Q ${farX} ${eyeY + 15} ${farX + 10} ${eyeY + 8}`} fill="none" stroke="#6A4A6E" strokeWidth={3.5} opacity={0.2} strokeLinecap="round" />
        {/* eyes */}
        <Eye id={`${uid}-eyeF`} cx={farX} cy={eyeY} w={lerp(24, 19, turn)} h={12} lid={lid} lower={ex.lower} gazeX={gx} gazeY={gy} pupil={ex.pupil} iris={C.iris} lidFill={C.skinShade} />
        <Eye id={`${uid}-eyeN`} cx={nearX} cy={eyeY} w={26} h={13} lid={lid} lower={ex.lower} gazeX={gx} gazeY={gy} pupil={ex.pupil} iris={C.iris} lidFill={C.skin} />
        {/* brows */}
        <Brow ix={nearX - 13} ox={nearX + 16} y={eyeY - 17} inner={ex.bIn + ex.bAsym} outer={ex.bOut + ex.bAsym} color={C.hair} width={6.5} />
        <Brow ix={farX + 11} ox={farX - 12} y={eyeY - 16} inner={ex.bIn - ex.bAsym * 0.6} outer={ex.bOut - ex.bAsym * 0.6} color={C.hair} width={5.5} />
        {/* nose */}
        <Nose x={lerp(40, 66, turn)} y={-4 + nod * 6} skin={C.skin} shade={C.skinShade} deep={C.skinDeep} />
        {/* mouth */}
        <Mouth id={`${uid}-mouth`} cx={mouthX} cy={mouthY} w={mouthW} open={mouthOpen} curve={ex.curve} skew={ex.skew} lip={C.lip} />
        {/* stubble speckle */}
        {Array.from({length: 26}, (_, i) => (
          <circle key={i} cx={-30 + ((i * 29) % 96)} cy={56 + ((i * 17) % 26)} r={0.9} fill="#2A2232" opacity={0.35} />
        ))}
        {/* sweat drop */}
        {ex.sweat > 0.05 && (
          <path d={`M -44 ${-48 + ((frame % 50) / 50) * 30} c 4 6 6 10 0 12 c -6 -2 -4 -6 0 -12 Z`} fill="#BFD8F2" opacity={ex.sweat * 0.8 * (1 - (frame % 50) / 60)} />
        )}
        {/* hair front: cap over the skull, hairline, spikes, short fringe tufts */}
        <path d="M -44 -96 L -40 -122 L -26 -104 L -12 -128 L 0 -108 L 18 -130 L 28 -108 L 48 -124 L 54 -102 L 76 -108 L 72 -86 C 50 -100 0 -104 -44 -96 Z" fill={C.hair} />
                <path d="M -30 -104 C -8 -114 24 -116 52 -106" fill="none" stroke={C.hairHi} strokeWidth={3} opacity={0.55} strokeLinecap="round" />
        <path d="M -60 -40 C -62 -20 -60 -4 -56 8" fill="none" stroke={C.hairHi} strokeWidth={2} opacity={0.35} strokeLinecap="round" />
        {/* flyaway strands with lag */}
        {[
          {r: [-20, -106], d: 'M 0 0 C -6 -20 6 -32 18 -28'},
          {r: [10, -112], d: 'M 0 0 C 4 -22 22 -28 28 -16'},
          {r: [46, -102], d: 'M 0 0 C 16 -14 34 -10 36 2'},
          {r: [-50, -80], d: 'M 0 0 C -18 -12 -26 2 -22 14'},
          {r: [68, -84], d: 'M 0 0 C 18 -4 28 10 22 22'},
        ].map((s, i) => (
          <path
            key={i}
            d={s.d}
            transform={`translate(${s.r[0]} ${s.r[1]}) rotate(${hairLag * (1.2 + i * 0.25) + flutter(i)})`}
            fill="none"
            stroke={i === 2 ? C.hairHi : C.hair}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ── Desk ── */}
      <path d="M -160 690 L 440 690 L 440 950 L -160 950 Z" fill={`url(#${uid}-desk)`} />
      <path d="M -160 690 L 440 690" stroke={L.rim} strokeOpacity={0.35} strokeWidth={1.5} />
      <Glow id={`${uid}-deskglow`} cx={300} cy={720} r={170} color={screenPulse > 0.05 ? L.rim : L.screenGlow} opacity={0.18 + screenPulse * 0.25} />
      <Keyboard body="#151B29" key1="#232C40" glow={L.screenGlow} />
      {NOTES.slice(0, COUNTS.notes[cl]).filter((n) => n[4]).map((n, i) => (
        <Sticky key={`d${i}`} x={n[0]} y={n[1]} rot={n[2]} color={n[3]} flat />
      ))}
      {CANS.slice(0, COUNTS.cans[cl]).filter((c) => c[1] < 860).map((c, i) => (
        <Can key={`c${i}`} x={c[0]} y={c[1]} tipped={c[2]} band="#C23B3B" rim={L.rim} />
      ))}

      {/* ── Arms ── */}
      <Limb s={[back.ex, back.ey]} e={[back.ex, back.ey]} h={[back.hx, back.hy]} upper={52} fore={46} fill={C.jacket} shade={C.jacketShade} rim={L.rim} rimDx={rimDx} cuff="#0C0E12" />
      <Hand x={back.hx} y={back.hy} angle={deg(back.foreAngle) + body.br} shape={shapes.b} {...handProps} />
      <Limb s={shoulderF} e={[front.ex, front.ey]} h={[front.hx, front.hy]} upper={56} fore={48} fill={C.jacket} shade={C.jacketShade} rim={L.rim} rimDx={rimDx} sheen={C.jacketSheen} cuff="#0C0E12" />
      <Hand x={front.hx} y={front.hy} angle={deg(front.foreAngle) + body.fr} shape={shapes.f} {...handProps} />

      {/* ── Phones ── */}
      {phones.map((p, i) => (
        <Phone key={i} uid={`${uid}-ph${i}`} x={p.x} y={p.y} angle={p.a} hold={hold} case={['#14161C', '#2A1416', '#161A24'][i]}>
          <NoiseFeed seed={`${uid}-feed${i}`} scroll={scroll + i * 40} />
        </Phone>
      ))}

      {/* ── Front clutter + desk front ── */}
      {CANS.slice(0, COUNTS.cans[cl]).filter((c) => c[1] >= 860).map((c, i) => (
        <Can key={`cf${i}`} x={c[0]} y={c[1]} tipped={c[2]} band="#C23B3B" rim={L.rim} />
      ))}
      <path d="M -160 950 L 440 950 L 440 1060 L -160 1060 Z" fill="#090D16" />
      <path d="M -160 950 L 440 950" stroke="#2A3448" strokeWidth={2} />
    </g>
  );
};
