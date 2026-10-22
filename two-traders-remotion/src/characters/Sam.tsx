import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brow, Eye, Glow, Hand, HandShape, Limb, Mouth, Nose} from './parts';
import {Keyboard, Monitor, Mug, Notebook, Phone} from './props';
import {
  blink,
  breathing,
  clamp01,
  current,
  deg,
  evalTrack,
  hangArm,
  headSway,
  ik,
  lerp,
  Params,
  seg,
  Talking,
  Track,
  viseme,
} from './rig';
import {fonts, lighting} from '../theme';
import type {Look} from './Ray';

export type SamExpression = 'neutral' | 'focused' | 'calm' | 'smile';
export type SamPose = 'idle' | 'read-phone' | 'copy-trade' | 'write-notes' | 'wait';
export type PhoneMode = 'feed' | 'post' | 'waiting';

export type SamProps = {
  uid?: string;
  expression?: Track<SamExpression>;
  pose?: Track<SamPose>;
  look?: Track<Look>;
  talking?: Talking;
  intensity?: number; // kept for API symmetry; Sam stays steady
  screen?: React.ReactNode;
  phoneMode?: Track<PhoneMode>;
  phoneText?: {waiting: string; rtl: boolean};
  /** the notebook line already written (0..1) outside a write-notes pose */
  notes?: number;
  frameOffset?: number;
  /** Sam faces left (toward the divider) in the reel */
  mirror?: boolean;
};

const L = lighting.sam;
const C = {
  skin: '#D9A27C',
  skinShade: '#9C6B4D',
  skinDeep: '#6A4431',
  lip: '#8E5443',
  hair: '#2A1D15',
  hairHi: '#6A4C34',
  sweater: '#E8DAC0',
  sweaterShade: '#A8916E',
  sweaterDeep: '#7D6A4E',
  iris: '#3B2A1E',
  frame: '#6B4E2E',
};

const EXPR: Record<SamExpression, Params> = {
  neutral: {bIn: 0, bOut: 0, lid: 0.22, lower: 0.1, pupil: 1, curve: 0.08, open: 0, width: 0.95, skew: 0},
  focused: {bIn: -3, bOut: 1, lid: 0.3, lower: 0.22, pupil: 0.95, curve: 0, open: 0, width: 0.88, skew: 0},
  calm: {bIn: 1, bOut: 1, lid: 0.4, lower: 0.12, pupil: 1, curve: 0.25, open: 0, width: 0.95, skew: 0},
  smile: {bIn: 2, bOut: 2, lid: 0.26, lower: 0.38, pupil: 1.05, curve: 0.8, open: 0.04, width: 1.1, skew: -0.15},
};

const LOOK: Record<Look, Params> = {
  screen: {turn: 1, nod: 0.12, tilt: 2, gx: 0.8, gy: 0.3},
  down: {turn: 0.55, nod: 0.9, tilt: -1, gx: 0.1, gy: 1},
  viewer: {turn: 0.35, nod: 0, tilt: 0, gx: -0.35, gy: 0},
};

type PoseOut = {p: Params; f: HandShape; b: HandShape; fb?: 1 | -1; bb?: 1 | -1};
const BASE: Params = {
  lean: 0, drop: 0,
  fx: 252, fy: 716, fr: 0, bx: 100, by: 776, br: 0,
  tiltAdd: 0, nodAdd: 0, gxAdd: 0, gyAdd: 0,
  phone: 0, mug: 0, pen: 0, write: 0, sip: 0, fHang: 1, bHang: 1,
};

const SIP = (t: number) => {
  const c = t % 320;
  return seg(c, 70, 92) * (1 - seg(c, 118, 140));
};

const pose = (name: SamPose, t: number): PoseOut => {
  switch (name) {
    case 'idle':
      return {p: {...BASE, fy: 716 + Math.sin(t / 8) * 1}, f: 'flat', b: 'flat'};
    case 'read-phone':
      return {p: {...BASE, bx: 152, by: 636, br: -70, phone: 1, nodAdd: 0.1, gxAdd: -0.4}, f: 'flat', b: 'grip'};
    case 'copy-trade': {
      const toPhone = seg(t, 0, 14);
      const tap = Math.max(0, 1 - Math.abs(t - 18) / 4);
      const toKeys = seg(t, 30, 46);
      const keyTap = Math.max(0, 1 - Math.abs(t - 52) / 3, 1 - Math.abs(t - 60) / 3);
      return {
        p: {
          ...BASE,
          bx: 152,
          by: 636,
          br: -70,
          phone: 1,
          fx: lerp(lerp(252, 178, toPhone), 268, toKeys),
          fy: lerp(lerp(716, 592 + tap * 8, toPhone), 702 + keyTap * 10, toKeys),
          fr: lerp(-60 * toPhone, 10, toKeys),
          gxAdd: lerp(-0.5, 0.1, toKeys),
          nodAdd: 0.1 * (1 - toKeys),
        },
        f: toPhone > 0.3 ? 'point' : 'flat',
        b: 'grip',
      };
    }
    case 'write-notes': {
      const w = seg(t, 10, 90);
      return {
        p: {
          ...BASE,
          fx: lerp(70, 132, w) + Math.sin(t / 2.2) * 2,
          fy: 806 + Math.sin(t / 1.7) * 2.5 - w * 4,
          fr: -10,
          bx: 40,
          by: 800,
          pen: 1,
          write: w,
          gxAdd: -0.9,
          nodAdd: 0.25,
        },
        f: 'pen',
        b: 'flat',
      };
    }
    case 'wait': {
      const sip = SIP(t);
      return {
        p: {
          ...BASE,
          lean: -5,
          drop: -3,
          fx: lerp(236, 178, sip),
          fy: lerp(662, 430, sip),
          fr: lerp(-80, -110, sip),
          bx: 106,
          by: 800,
          mug: 1,
          sip,
          fHang: 1 - sip,
          tiltAdd: -2 - sip * 6,
          nodAdd: -0.1,
        },
        f: 'grip',
        b: 'flat',
        fb: 1,
      };
    }
  }
};

const poseDur = () => 16;

const PIVOT = {x: 105, y: 760};
const torsoPoint = (x: number, y: number, rotDeg: number, dx: number, dy: number, sy: number) => {
  const a = (rotDeg * Math.PI) / 180;
  const px = x - PIVOT.x;
  const py = (y - PIVOT.y) * sy;
  return [PIVOT.x + px * Math.cos(a) - py * Math.sin(a) + dx, PIVOT.y + px * Math.sin(a) + py * Math.cos(a) + dy] as [number, number];
};

const PHONE_DOCK = {x: 16, y: 690};
const MUG_SPOT = {x: 362, y: 826};

// Miran Gold channel feed: gold avatar, post cards, a new post sliding in, or a waiting pulse
const ChannelFeed: React.FC<{mode: PhoneMode; local: number; frame: number; text?: {waiting: string; rtl: boolean}}> = ({mode, local, frame, text}) => {
  const slide = mode === 'post' ? seg(local, 0, 24) : 1;
  const cards = mode === 'post' ? [0, 1, 2] : [1, 2];
  return (
    <g>
      <rect width={136} height={264} fill="#151109" />
      <rect width={136} height={40} fill="#1F190E" />
      <circle cx={20} cy={20} r={11} fill="url(#samGoldAvatar)" />
      <defs>
        <linearGradient id="samGoldAvatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3D27A" />
          <stop offset="100%" stopColor="#B07F2E" />
        </linearGradient>
      </defs>
      <text x={38} y={25} fontFamily={fonts.en} fontWeight={600} fontSize={13} fill="#E8C877">
        Miran Gold
      </text>
      {mode === 'waiting' ? (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={50 + i * 18} cy={150} r={6} fill="#D4A24C" opacity={0.3 + 0.7 * Math.max(0, Math.sin(frame / 9 - i * 0.9))} />
          ))}
          <text
            x={68}
            y={186}
            textAnchor="middle"
            fontFamily={text?.rtl ? fonts.ar : fonts.en}
            fontSize={text?.rtl ? 12 : 11}
            fill="rgba(245,241,232,0.7)"
            direction={text?.rtl ? 'rtl' : 'ltr'}
          >
            {text?.waiting ?? 'Waiting for next update'}
          </text>
        </g>
      ) : (
        cards.map((c, i) => {
          const y = 52 + i * 70 + (mode === 'post' ? (1 - slide) * -70 : 0);
          const fresh = mode === 'post' && c === 0;
          return (
            <g key={c} transform={`translate(0 ${y})`} opacity={fresh ? slide : 1}>
              <rect x={8} y={0} width={120} height={60} rx={9} fill={fresh ? '#2A2212' : '#201A10'} stroke={fresh ? '#D4A24C' : 'none'} strokeOpacity={0.6} />
              <rect x={8} y={0} width={4} height={60} rx={2} fill="#D4A24C" />
              <rect x={20} y={12} width={58} height={6} rx={3} fill="#5A4A2E" />
              <rect x={20} y={26} width={86} height={5} rx={2.5} fill="#3D3220" />
              <rect x={20} y={38} width={70} height={5} rx={2.5} fill="#3D3220" />
              <path d="M 92 18 L 100 12 L 108 16 L 118 6" fill="none" stroke="#3FB68B" strokeWidth={2.5} strokeLinecap="round" />
            </g>
          );
        })
      )}
    </g>
  );
};

export const Sam: React.FC<SamProps> = ({
  uid = 'sam',
  expression = 'neutral',
  pose: poseTrack = 'idle',
  look: lookTrack = 'screen',
  talking = false,
  screen,
  phoneMode = 'feed',
  phoneText,
  notes = 0,
  frameOffset = 0,
  mirror = false,
}) => {
  const frame = useCurrentFrame() + frameOffset;
  const stateAt = (f: number) => {
    const body = evalTrack(poseTrack, f, (v, t) => pose(v, t).p, poseDur);
    const look = evalTrack(lookTrack, f, (v) => LOOK[v], 12);
    const sway = headSway(f, uid);
    return {body, look, sway, headRot: look.tilt + body.tiltAdd + sway.rot * 0.7};
  };
  const now = stateAt(frame);
  const lag6 = stateAt(frame - 6);
  const {body, look} = now;
  const ex = evalTrack(expression, frame, (v) => EXPR[v], 8);
  const vis = viseme(frame, talking, `${uid}-talk`);
  const lidBlink = blink(frame, uid);
  const breath = breathing(frame, uid);

  const cur = current(poseTrack, frame);
  const shapes = pose(cur.v, cur.local);
  const pm = current(phoneMode, frame);

  const sp = (x: number, y: number) => torsoPoint(x, y, body.lean, 0, body.drop, breath);
  const shoulderF = sp(190, 500);
  const shoulderB = sp(34, 496);
  const neck = sp(112, 446);
  const front = hangArm(ik(shoulderF[0], shoulderF[1], body.fx, body.fy, 134, 124, shapes.fb ?? -1), shoulderF[0], shoulderF[1], body.fHang, 12);
  const back = hangArm(ik(shoulderB[0], shoulderB[1], body.bx, body.by, 134, 124, shapes.bb ?? 1), shoulderB[0], shoulderB[1], body.bHang, -6);
  const hairLag = (lag6.headRot - now.headRot) * 1.2;

  const turn = look.turn;
  const nod = clamp01(look.nod + body.nodAdd);
  const gx = Math.max(-1, Math.min(1, look.gx + body.gxAdd));
  const gy = Math.max(-1, Math.min(1, look.gy + body.gyAdd));
  const nearX = lerp(24, 40, turn);
  const farX = lerp(-22, -4, turn);
  const eyeY = -8 + nod * 9;
  const lid = Math.max(clamp01(ex.lid + nod * 0.3 - body.sip * 0.2), lidBlink);
  const mouthOpen = ex.open + vis.open;
  const mouthW = 32 * ex.width * vis.width;
  const mouthX = lerp(10, 28, turn);
  const mouthY = 50 + nod * 7;

  const phoneHold = clamp01(body.phone);
  const phonePos = {x: lerp(PHONE_DOCK.x, back.hx + 10, phoneHold), y: lerp(PHONE_DOCK.y, back.hy - 36, phoneHold)};
  const mugHold = clamp01(body.mug);
  const mugPos = {
    x: lerp(MUG_SPOT.x, front.hx + Math.cos(front.foreAngle) * 26, mugHold),
    y: lerp(MUG_SPOT.y, front.hy + Math.sin(front.foreAngle) * 26 + 18, mugHold),
  };
  const penOnDesk = 1 - clamp01(body.pen);
  const written = Math.max(notes, body.write);

  const rimDx = -4;
  const handProps = {skin: C.skin, shade: C.skinShade, rim: L.rim, rimDx};
  const torso = 'M 74 458 C 44 462 20 478 12 506 C 2 550 -2 640 0 760 L 222 760 C 224 650 222 562 212 516 C 204 488 180 466 150 458 Z';
  const face = 'M -60 -20 C -64 -76 -28 -100 6 -100 C 50 -100 72 -70 72 -26 C 74 -6 78 10 74 24 C 72 50 58 76 34 86 C 18 92 2 92 -12 84 C -36 72 -54 48 -58 18 Z';
  const hairCap =
    'M -62 12 C -72 -50 -48 -110 6 -114 C 52 -118 84 -94 84 -60 C 84 -52 80 -48 76 -48 C 66 -58 50 -64 30 -64 C 12 -64 -6 -60 -20 -56 C -30 -46 -36 -30 -40 -14 C -42 -4 -44 4 -46 10 C -52 14 -58 16 -62 12 Z';
  const hairBack = 'M -62 8 C -72 -46 -50 -98 2 -106 C 46 -112 80 -88 80 -54 C 72 -62 54 -68 34 -68 C 14 -66 -6 -62 -22 -58 C -36 -44 -42 -16 -50 8 Z';

  const art = (
    <g>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={L.wallTop} />
          <stop offset="100%" stopColor={L.wallBottom} />
        </linearGradient>
        <linearGradient id={`${uid}-sweater`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.sweaterShade} />
          <stop offset="65%" stopColor={C.sweater} />
          <stop offset="100%" stopColor="#F4EAD6" />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor={C.skinShade} />
          <stop offset="55%" stopColor={C.skin} />
          <stop offset="100%" stopColor="#E8B994" />
        </linearGradient>
        <linearGradient id={`${uid}-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1F12" />
          <stop offset="100%" stopColor="#4A3820" />
        </linearGradient>
        <pattern id={`${uid}-knit`} width={9} height={12} patternUnits="userSpaceOnUse">
          <path d="M 1 0 Q 4.5 6 1 12 M 5.5 0 Q 9 6 5.5 12" fill="none" stroke={C.sweaterDeep} strokeWidth={1} opacity={0.22} />
        </pattern>
        <radialGradient id={`${uid}-lamp`} cx="0.15" cy="0.25" r="0.8">
          <stop offset="0%" stopColor="#F3C774" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#F3C774" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ── Room ── */}
      <rect x={-160} y={-40} width={600} height={760} fill={`url(#${uid}-wall)`} />
      <rect x={-160} y={-40} width={600} height={760} fill={`url(#${uid}-lamp)`} />
      {/* window with blinds: soft warm daylight */}
      <g>
        <rect x={-120} y={70} width={150} height={330} rx={4} fill="#5A4426" opacity={0.55} />
        {Array.from({length: 15}, (_, i) => (
          <rect key={i} x={-120} y={76 + i * 22} width={150} height={10} fill="#F3D9A0" opacity={0.22} />
        ))}
        <rect x={-120} y={70} width={150} height={330} rx={4} fill="none" stroke="#3A2C18" strokeWidth={4} />
      </g>
      {/* shelf with a plant and books */}
      <rect x={250} y={170} width={180} height={8} fill="#3A2B17" />
      <rect x={268} y={124} width={16} height={46} fill="#7A5A30" />
      <rect x={286} y={132} width={12} height={38} fill="#A07840" />
      <path d="M 352 170 L 348 150 L 376 150 L 372 170 Z" fill="#B88A4A" />
      <path d="M 362 150 C 350 128 340 120 334 112 M 362 150 C 366 124 374 112 386 106 M 362 150 C 360 132 362 118 362 104" fill="none" stroke="#6E8A4A" strokeWidth={5} strokeLinecap="round" />
      <rect x={-160} y={58} width={600} height={2} fill={L.rim} opacity={0.35} />

      {/* ── Monitor ── */}
      <Monitor uid={`${uid}-mon`} bezel="#1E1710" bezelEdge="#5A4528" screenBg={['#17120A', '#100C07']} glow={L.screenGlow} mirror={mirror}>
        {screen}
      </Monitor>

      {/* ── Back upper arm ── */}
      <Limb s={shoulderB} e={[back.ex, back.ey]} h={[back.ex, back.ey]} upper={54} fore={48} fill={C.sweater} shade={C.sweaterShade} rim={L.rim} rimDx={rimDx} />

      {/* ── Torso ── */}
      <g transform={`translate(0 ${body.drop}) rotate(${body.lean} ${PIVOT.x} ${PIVOT.y}) translate(${PIVOT.x} ${PIVOT.y}) scale(1 ${breath}) translate(${-PIVOT.x} ${-PIVOT.y})`}>
        <path d={torso} fill={L.rim} transform="translate(-4 -2)" />
        <path d={torso} fill={`url(#${uid}-sweater)`} />
        <path d={torso} fill={`url(#${uid}-knit)`} />
        <path d="M 10 540 C 4 600 2 680 2 760 L 30 760 C 26 680 26 600 34 540 Z" fill={C.sweaterDeep} opacity={0.25} />
        {/* neck */}
        <path d="M 88 410 L 136 410 L 142 466 C 124 476 102 476 86 464 Z" fill={`url(#${uid}-skin)`} />
        <path d="M 94 430 C 108 446 124 446 134 436 L 134 452 C 120 460 104 458 94 450 Z" fill={C.skinDeep} opacity={0.4} />
        {/* ribbed crew neck */}
        <path d="M 86 458 C 100 478 132 480 150 458 L 156 468 C 136 492 98 492 80 468 Z" fill={C.sweaterShade} />
        <path d="M 86 458 C 100 478 132 480 150 458" fill="none" stroke={C.sweaterDeep} strokeWidth={1.2} opacity={0.5} />
        {Array.from({length: 9}, (_, i) => (
          <line key={i} x1={86 + i * 8} y1={468 + Math.sin(i / 2.6) * 6} x2={88 + i * 8} y2={478 + Math.sin(i / 2.6) * 7} stroke={C.sweaterDeep} strokeWidth={1} opacity={0.35} />
        ))}
      </g>

      {/* ── Head ── */}
      <g transform={`translate(${neck[0] + now.sway.x * 0.6} ${neck[1] + now.sway.y * 0.6}) rotate(${now.headRot}) translate(0 -98)`}>
        <path d={hairBack} fill={L.rim} transform="translate(-4 -2)" />
        <path d={hairBack} fill={C.hair} />
        <path d={face} fill={L.rim} transform="translate(-3 0)" />
        <path d={face} fill={`url(#${uid}-skin)`} />
        <path d="M -58 -10 C -56 30 -40 62 -12 84 C -34 76 -52 54 -58 18 Z" fill={C.skinDeep} opacity={0.3} />
        <path d={hairCap} fill={C.hair} />
        <Glow id={`${uid}-faceglow`} cx={70} cy={10} r={70} color={L.screenGlow} opacity={0.18} />
        {/* ear */}
        <ellipse cx={lerp(-56, -44, turn)} cy={8} rx={11} ry={18} fill={C.skinShade} />
        <path d={`M ${lerp(-56, -44, turn) - 2} -4 C ${lerp(-56, -44, turn) + 5} 2 ${lerp(-56, -44, turn) + 4} 14 ${lerp(-56, -44, turn) - 2} 18`} fill="none" stroke={C.skinDeep} strokeWidth={2} opacity={0.6} />
        {/* cheeks warm when smiling */}
        <ellipse cx={nearX + 6} cy={eyeY + 26} rx={12} ry={7} fill="#E07A5F" opacity={0.12 + ex.lower * 0.15} />
        <Eye id={`${uid}-eyeF`} cx={farX} cy={eyeY} w={lerp(23, 18, turn)} h={11.5} lid={lid} lower={ex.lower} gazeX={gx} gazeY={gy} pupil={ex.pupil} iris={C.iris} lidFill={C.skinShade} />
        <Eye id={`${uid}-eyeN`} cx={nearX} cy={eyeY} w={25} h={12.5} lid={lid} lower={ex.lower} gazeX={gx} gazeY={gy} pupil={ex.pupil} iris={C.iris} lidFill={C.skin} />
        <Brow ix={nearX - 12} ox={nearX + 16} y={eyeY - 19} inner={ex.bIn} outer={ex.bOut} color={C.hair} width={5} />
        <Brow ix={farX + 10} ox={farX - 12} y={eyeY - 18} inner={ex.bIn} outer={ex.bOut} color={C.hair} width={4.5} />
        {/* thin round glasses */}
        <g fill="none" stroke={C.frame} strokeWidth={2.4}>
          <ellipse cx={nearX + 1} cy={eyeY + 1} rx={17} ry={16} fill="#fff" fillOpacity={0.05} />
          <ellipse cx={farX} cy={eyeY + 1} rx={lerp(16, 12.5, turn)} ry={15} fill="#fff" fillOpacity={0.05} />
          <path d={`M ${farX + lerp(16, 12.5, turn)} ${eyeY - 2} Q ${(farX + nearX) / 2 + 2} ${eyeY - 7} ${nearX - 16} ${eyeY - 2}`} />
          <path d={`M ${farX - lerp(16, 12.5, turn)} ${eyeY - 2} L ${lerp(-52, -42, turn)} ${eyeY - 4}`} />
          <path d={`M ${nearX - 6} ${eyeY - 12} A 14 14 0 0 1 ${nearX + 12} ${eyeY - 8}`} stroke="#F3D27A" strokeOpacity={0.55} strokeWidth={1.4} />
        </g>
        {/* nose */}
        <Nose x={lerp(40, 66, turn)} y={-4 + nod * 6} skin={C.skin} shade={C.skinShade} deep={C.skinDeep} />
        <Mouth id={`${uid}-mouth`} cx={mouthX} cy={mouthY} w={mouthW} open={mouthOpen} curve={ex.curve} skew={ex.skew} lip={C.lip} />
        {/* neat short hair with a side part */}
        <path d="M -30 -98 C 0 -112 50 -108 76 -74 C 80 -64 80 -56 78 -50 C 66 -62 50 -70 30 -70 C 10 -66 -12 -64 -30 -60 Z" fill={C.hair} />
        <g transform={`rotate(${hairLag * 0.6} 20 -70)`}>
          <path d="M 30 -70 C 50 -72 68 -62 78 -50 C 66 -58 50 -62 34 -62 Z" fill={C.hair} />
          <path d="M -8 -96 C 20 -104 50 -98 70 -80" fill="none" stroke={C.hairHi} strokeWidth={2.5} opacity={0.6} strokeLinecap="round" />
        </g>
        <path d="M -20 -102 C -16 -90 -14 -76 -14 -62" fill="none" stroke="#120C08" strokeWidth={1.8} opacity={0.6} />
      </g>

      {/* ── Desk ── */}
      <path d="M -160 690 L 440 690 L 440 950 L -160 950 Z" fill={`url(#${uid}-desk)`} />
      <path d="M -160 690 L 440 690" stroke={L.rim} strokeOpacity={0.4} strokeWidth={1.5} />
      <Glow id={`${uid}-deskglow`} cx={300} cy={720} r={170} color={L.screenGlow} opacity={0.14} />
      <Keyboard body="#2E2416" key1="#4A3B26" glow={L.screenGlow} />
      {/* phone dock */}
      <path d={`M ${PHONE_DOCK.x - 22} ${PHONE_DOCK.y + 40} L ${PHONE_DOCK.x + 22} ${PHONE_DOCK.y + 40} L ${PHONE_DOCK.x + 16} ${PHONE_DOCK.y + 30} L ${PHONE_DOCK.x - 16} ${PHONE_DOCK.y + 30} Z`} fill="#1C150C" />
      <Notebook x={34} y={762} progress={written} paper="#EFE6D2" cover="#5A3A22" />
      {penOnDesk > 0.5 && (
        <g transform="translate(172 836) rotate(-24)">
          <path d="M 0 0 L 52 0" stroke="#1E1E24" strokeWidth={5} strokeLinecap="round" />
          <path d="M 0 0 L 8 0" stroke="#D4A24C" strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
      {mugHold < 0.5 && <Mug x={mugPos.x} y={mugPos.y} frame={frame} body="#EFE4CF" shade="#B5A27E" rim={L.rim} />}

      {/* ── Arms ── */}
      <Limb s={[back.ex, back.ey]} e={[back.ex, back.ey]} h={[back.hx, back.hy]} upper={54} fore={48} fill={C.sweater} shade={C.sweaterShade} rim={L.rim} rimDx={rimDx} cuff={C.sweaterShade} />
      <Phone uid={`${uid}-ph`} x={phonePos.x} y={phonePos.y} angle={lerp(0, -8, phoneHold)} hold={1} case="#2A2216" mirror={mirror}>
        <ChannelFeed mode={pm.v} local={pm.local} frame={frame} text={phoneText} />
      </Phone>
      <Hand x={back.hx} y={back.hy} angle={deg(back.foreAngle) + body.br} shape={shapes.b} {...handProps} />
      <Limb s={shoulderF} e={[front.ex, front.ey]} h={[front.hx, front.hy]} upper={56} fore={50} fill={C.sweater} shade={C.sweaterShade} rim={L.rim} rimDx={rimDx} cuff={C.sweaterShade} />
      <Hand x={front.hx} y={front.hy} angle={deg(front.foreAngle) + body.fr} shape={shapes.f} {...handProps} />
      {mugHold >= 0.5 && <Mug x={mugPos.x} y={mugPos.y} frame={frame} body="#EFE4CF" shade="#B5A27E" rim={L.rim} tilt={-body.sip * 35} />}

      <path d="M -160 950 L 440 950 L 440 1060 L -160 1060 Z" fill="#1A130A" />
      <path d="M -160 950 L 440 950" stroke="#6A5030" strokeWidth={2} />
    </g>
  );

  return mirror ? <g transform="translate(392 0) scale(-1 1)">{art}</g> : art;
};
