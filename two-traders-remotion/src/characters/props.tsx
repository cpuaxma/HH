import React from 'react';
import {random} from 'remotion';
import {lerp} from './rig';

// Mirrors content about its own vertical centre line. Sam's art is authored facing
// the divider and flipped as a whole, so anything with text or a chart un-flips here.
const Unflip: React.FC<{on?: boolean; x: number; w: number; children: React.ReactNode}> = ({on, x, w, children}) =>
  on ? <g transform={`translate(${2 * x + w} 0) scale(-1 1)`}>{children}</g> : <>{children}</>;

// ── Monitor ───────────────────────────────────────────────────────────────
export const MONITOR = {x: 200, y: 386, w: 190, h: 128};

export const Monitor: React.FC<{
  uid: string;
  bezel: string;
  bezelEdge: string;
  screenBg: [string, string];
  glow: string;
  mirror?: boolean;
  pulse?: number; // red pulse 0..1
  children?: React.ReactNode;
}> = ({uid, bezel, bezelEdge, screenBg, glow, mirror, pulse = 0, children}) => {
  const {x, y, w, h} = MONITOR;
  const b = 7;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-scr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={screenBg[0]} />
          <stop offset="100%" stopColor={screenBg[1]} />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.1} />
          <stop offset="45%" stopColor="#fff" stopOpacity={0.02} />
          <stop offset="46%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x={x} y={y} width={w} height={h} rx={3} />
        </clipPath>
      </defs>
      {/* stand */}
      <path d={`M ${x + w / 2 - 9} ${y + h + b} L ${x + w / 2 + 9} ${y + h + b} L ${x + w / 2 + 12} 700 L ${x + w / 2 - 12} 700 Z`} fill={bezel} />
      <ellipse cx={x + w / 2} cy={702} rx={46} ry={9} fill={bezel} />
      <ellipse cx={x + w / 2} cy={700} rx={44} ry={6} fill={bezelEdge} opacity={0.5} />
      {/* depth: the far side of the angled monitor */}
      <path d={`M ${x + w + b} ${y - b} L ${x + w + b + 9} ${y - b + 6} L ${x + w + b + 9} ${y + h + b - 4} L ${x + w + b} ${y + h + b} Z`} fill={bezelEdge} opacity={0.7} />
      <rect x={x - b} y={y - b} width={w + b * 2} height={h + b * 2} rx={8} fill={bezel} />
      <rect x={x - b + 1} y={y - b + 1} width={w + b * 2 - 2} height={h + b * 2 - 2} rx={7} fill="none" stroke={bezelEdge} strokeWidth={1.2} />
      <rect x={x} y={y} width={w} height={h} rx={3} fill={`url(#${uid}-scr)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        {/* faint grid */}
        {Array.from({length: 5}, (_, i) => (
          <line key={i} x1={x} x2={x + w} y1={y + (h / 5) * (i + 0.5)} y2={y + (h / 5) * (i + 0.5)} stroke="#fff" strokeOpacity={0.05} strokeWidth={1} />
        ))}
        <Unflip on={mirror} x={x} w={w}>
          <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w * 2} ${h * 2}`} overflow="hidden">
            {children}
          </svg>
        </Unflip>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-gloss)`} />
        <rect x={x} y={y} width={w} height={h} fill="#D9534F" opacity={pulse * 0.32} />
      </g>
      {/* screen spill */}
      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={4} fill="none" stroke={glow} strokeOpacity={0.25 + pulse * 0.4} strokeWidth={2} style={{filter: 'blur(3px)'}} />
    </g>
  );
};

// ── Keyboard ──────────────────────────────────────────────────────────────
export const Keyboard: React.FC<{body: string; key1: string; glow?: string}> = ({body, key1, glow}) => {
  const rows = 4;
  const cols = 13;
  const keys: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = (r + 0.5) / rows;
      const y = 726 + r * 7.2;
      const x0 = lerp(186, 178, t);
      const x1 = lerp(352, 362, t);
      const kw = (x1 - x0) / cols;
      keys.push(<rect key={`${r}-${c}`} x={x0 + c * kw + 0.8} y={y} width={kw - 1.6} height={5} rx={1} fill={key1} />);
    }
  }
  return (
    <g>
      <path d="M 180 720 L 358 720 L 372 760 L 168 760 Z" fill={body} />
      <path d="M 168 760 L 372 760 L 372 765 L 168 765 Z" fill="rgba(0,0,0,0.45)" />
      {keys}
      {glow && <path d="M 180 720 L 358 720" stroke={glow} strokeOpacity={0.4} strokeWidth={1.2} />}
    </g>
  );
};

// ── Phone ─────────────────────────────────────────────────────────────────
// `hold` 0 lies flat on the desk (foreshortened) → 1 upright in a hand
export const Phone: React.FC<{
  uid: string;
  x: number;
  y: number;
  angle: number;
  hold: number;
  case?: string;
  mirror?: boolean;
  children?: React.ReactNode;
}> = ({uid, x, y, angle, hold, case: caseColor = '#14161C', mirror, children}) => {
  const sy = lerp(0.42, 1, hold);
  const W = 40;
  const H = 74;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${sy})`}>
      <defs>
        <clipPath id={`${uid}-pc`}>
          <rect x={-W / 2 + 3} y={-H / 2 + 4} width={W - 6} height={H - 8} rx={4} />
        </clipPath>
      </defs>
      <rect x={-W / 2 - 1} y={-H / 2 + 3} width={W + 2} height={H} rx={8} fill="rgba(0,0,0,0.35)" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={7} fill={caseColor} />
      <rect x={-W / 2 + 3} y={-H / 2 + 4} width={W - 6} height={H - 8} rx={4} fill="#0A0D14" />
      <g clipPath={`url(#${uid}-pc)`}>
        <Unflip on={mirror} x={-W / 2 + 3} w={W - 6}>
          <svg x={-W / 2 + 3} y={-H / 2 + 4} width={W - 6} height={H - 8} viewBox="0 0 136 264" overflow="hidden">
            {children}
          </svg>
        </Unflip>
      </g>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={7} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
    </g>
  );
};

// Generic social feed with random up/down arrows (no logos, no text)
export const NoiseFeed: React.FC<{seed: string; scroll: number}> = ({seed, scroll}) => {
  const cardH = 92;
  const base = Math.floor(scroll / cardH);
  const off = scroll % cardH;
  return (
    <g>
      <rect width={136} height={264} fill="#0E121B" />
      {Array.from({length: 4}, (_, i) => {
        const idx = base + i;
        const up = random(`${seed}-a${idx}`) > 0.5;
        return (
          <g key={idx} transform={`translate(0 ${i * cardH - off + 8})`}>
            <rect x={8} y={0} width={120} height={cardH - 10} rx={10} fill="#1A2030" />
            <circle cx={24} cy={16} r={8} fill={random(`${seed}-c${idx}`) > 0.5 ? '#5A6478' : '#7A5C68'} />
            <rect x={38} y={10} width={44 + random(`${seed}-w${idx}`) * 30} height={6} rx={3} fill="#3A4256" />
            <rect x={16} y={34} width={66} height={5} rx={2.5} fill="#2C3346" />
            <rect x={16} y={46} width={50} height={5} rx={2.5} fill="#2C3346" />
            <path d={up ? 'M 108 34 L 122 56 L 94 56 Z' : 'M 108 58 L 122 36 L 94 36 Z'} fill={up ? '#3FB68B' : '#D9534F'} />
          </g>
        );
      })}
    </g>
  );
};

// ── Can ───────────────────────────────────────────────────────────────────
export const Can: React.FC<{x: number; y: number; tipped?: boolean; band: string; rim: string}> = ({x, y, tipped, band, rim}) => (
  <g transform={`translate(${x} ${y}) ${tipped ? 'rotate(84)' : ''}`}>
    <ellipse cx={0} cy={2} rx={17} ry={5} fill="rgba(0,0,0,0.4)" />
    <rect x={-13} y={-48} width={26} height={50} rx={4} fill="#1B1E26" />
    <rect x={-13} y={-36} width={26} height={14} fill={band} />
    <path d="M -13 -30 L 13 -36 L 13 -32 L -13 -26 Z" fill="#0F1116" opacity={0.6} />
    <rect x={-9} y={-46} width={4} height={46} fill="#fff" opacity={0.12} />
    <rect x={9} y={-46} width={3} height={46} fill={rim} opacity={0.35} />
    <ellipse cx={0} cy={-48} rx={13} ry={4} fill="#8A90A0" />
    <ellipse cx={0} cy={-48} rx={9} ry={2.5} fill="#5A6070" />
  </g>
);

// ── Sticky note ───────────────────────────────────────────────────────────
export const Sticky: React.FC<{x: number; y: number; rot: number; color: string; flat?: boolean}> = ({x, y, rot, color, flat}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${flat ? 0.55 : 1})`}>
    <rect x={-14} y={-13} width={30} height={28} fill="rgba(0,0,0,0.35)" />
    <rect x={-15} y={-15} width={30} height={30} fill={color} />
    <path d="M 15 9 L 15 15 L 9 15 Z" fill="rgba(0,0,0,0.18)" />
    <path d="M -9 -6 L 8 -6 M -9 0 L 5 0 M -9 6 L 7 6" stroke="rgba(30,20,20,0.45)" strokeWidth={1.6} strokeLinecap="round" />
  </g>
);

// ── Mug with a thin steam curl ────────────────────────────────────────────
export const Mug: React.FC<{x: number; y: number; frame: number; body: string; shade: string; rim: string; tilt?: number}> = ({
  x,
  y,
  frame,
  body,
  shade,
  rim,
  tilt = 0,
}) => {
  const steam = (k: number) => {
    const t = (frame / 70 + k * 0.5) % 1;
    const sway = Math.sin(frame / 18 + k * 2) * 5;
    const yy = -44 - t * 34;
    return (
      <path
        key={k}
        d={`M ${-4 + k * 8} -42 C ${-12 + sway + k * 8} ${-56} ${6 + sway + k * 8} ${-66} ${-2 + sway * 1.3 + k * 8} ${yy - 14}`}
        fill="none"
        stroke="#F5F1E8"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="40 80"
        strokeDashoffset={-t * 60}
        opacity={(1 - t) * 0.5}
      />
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <ellipse cx={0} cy={2} rx={22} ry={6} fill="rgba(0,0,0,0.35)" />
      <path d="M 16 -30 C 32 -30 32 -10 16 -10" fill="none" stroke={shade} strokeWidth={6} />
      <path d="M -18 -40 L 18 -40 L 16 0 C 10 4 -10 4 -16 0 Z" fill={shade} />
      <path d="M -18 -40 L 12 -40 L 10 0 C 4 3 -10 3 -16 0 Z" fill={body} />
      <rect x={-17} y={-40} width={3} height={38} fill={rim} opacity={0.6} />
      <ellipse cx={0} cy={-40} rx={18} ry={5} fill={shade} />
      <ellipse cx={0} cy={-39.5} rx={15} ry={3.6} fill="#3B2414" />
      {Math.abs(tilt) < 30 && [0, 1].map(steam)}
    </g>
  );
};

// ── Notebook ──────────────────────────────────────────────────────────────
// `progress` 0..1 draws the newest handwritten line with strokeDashoffset
export const Notebook: React.FC<{x: number; y: number; progress: number; paper: string; cover: string}> = ({x, y, progress, paper, cover}) => {
  const line = 'M 10 52 C 18 44 22 58 30 50 C 36 44 40 56 48 50 C 54 45 58 55 66 49 C 72 45 76 54 84 48 C 90 44 94 52 100 48';
  const len = 140;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -4 6 L 124 0 L 134 74 L 2 82 Z" fill="rgba(0,0,0,0.35)" />
      <path d="M -6 2 L 122 -4 L 130 70 L -2 78 Z" fill={cover} />
      <path d="M -2 0 L 118 -5 L 125 66 L 2 73 Z" fill={paper} />
      <path d="M 58 -3 L 62 69" stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
      {[14, 26, 38].map((yy) => (
        <path key={yy} d={`M 8 ${yy + 4} C 20 ${yy - 2} 26 ${yy + 8} 38 ${yy + 2} C 44 ${yy - 2} 48 ${yy + 5} 54 ${yy + 1}`} fill="none" stroke="#3A3A48" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
      ))}
      <path d={line} fill="none" stroke="#2B2B3A" strokeWidth={2} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)} transform="translate(-2 4) scale(1 0.9)" />
      {[12, 24, 36, 48, 60].map((yy) => (
        <path key={`r${yy}`} d={`M 66 ${yy} L 118 ${yy - 2}`} stroke="rgba(60,80,120,0.18)" strokeWidth={1} />
      ))}
    </g>
  );
};
