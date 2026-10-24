import React from 'react';

// Nine flat café illustrations on a 100×100 artboard. Every one takes a palette, so the
// same artwork can be shown clashing (BEFORE) or cohesive in Bean & Bloom tones (AFTER).
//   bg: background · a: main object · b: surface / shadow · c: secondary highlight · d: warm detail
export type Palette = {bg: string; a: string; b: string; c: string; d: string; accent: string; font: string};
type Art = React.FC<{p: Palette}>;

const CoffeeCup: Art = ({p}) => (
  <>
    <ellipse cx="50" cy="80" rx="34" ry="7" fill={p.b} />
    <path d="M27 42h46l-4 27c-1.2 7-5 10-12 10H43c-7 0-10.8-3-12-10z" fill={p.a} />
    <path d="M71 49c11-1 14 4 13 9-1 6-7 9-16 8" stroke={p.a} strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="42" rx="23" ry="4.6" fill={p.d} />
    {[40, 50, 60].map((x, i) => (
      <path key={x} d={`M${x} ${34 - i % 2 * 3}c-4-5 4-8 0-13s4-8 0-12`} stroke={p.c} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
    ))}
  </>
);

const Croissant: Art = ({p}) => (
  <>
    <ellipse cx="50" cy="74" rx="38" ry="8" fill={p.b} />
    {[
      {cx: 21, cy: 60, rx: 6, ry: 10, r: -62},
      {cx: 79, cy: 60, rx: 6, ry: 10, r: 62},
      {cx: 32, cy: 52, rx: 9, ry: 14, r: -38},
      {cx: 68, cy: 52, rx: 9, ry: 14, r: 38},
      {cx: 50, cy: 47, rx: 12, ry: 17, r: 0},
    ].map((l, i) => (
      <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill={i === 4 ? p.d : p.a} stroke={p.bg} strokeWidth="1.6"
        transform={`rotate(${l.r} ${l.cx} ${l.cy})`} />
    ))}
    <path d="M44 38c4 3 8 3 12 0M42 48c5 3 11 3 16 0" stroke={p.c} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
  </>
);

const LatteArt: Art = ({p}) => (
  <>
    <circle cx="50" cy="52" r="40" fill={p.b} />
    <rect x="80" y="46" width="14" height="10" rx="5" fill={p.a} />
    <circle cx="50" cy="52" r="31" fill={p.a} />
    <circle cx="50" cy="52" r="26" fill={p.d} />
    <path d="M50 70C34 60 33 44 43 43c4-.4 6 3 7 6 1-3 3-6.4 7-6 10 1 9 17-7 27z" fill={p.c} />
    <path d="M50 70V36" stroke={p.d} strokeWidth="1.6" />
    <circle cx="50" cy="35" r="3" fill={p.c} />
  </>
);

const Storefront: Art = ({p}) => (
  <>
    <rect x="14" y="30" width="72" height="62" fill={p.b} />
    <rect x="18" y="14" width="64" height="12" rx="2" fill={p.a} />
    <rect x="32" y="18" width="36" height="4" rx="2" fill={p.bg} opacity="0.8" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M${12 + i * 12.67} 28h12.67v10a6.33 6.33 0 0 1-12.67 0z`} fill={i % 2 ? p.c : p.a} />
    ))}
    <rect x="21" y="50" width="30" height="24" rx="2" fill={p.d} opacity="0.9" />
    <path d="M21 62h30M36 50v24" stroke={p.b} strokeWidth="1.6" />
    <rect x="58" y="50" width="20" height="42" rx="2" fill={p.a} />
    <circle cx="74" cy="72" r="1.6" fill={p.b} />
    <rect x="22" y="80" width="28" height="8" rx="2" fill={p.c} opacity="0.8" />
  </>
);

const Beans: Art = ({p}) => (
  <>
    {[
      {x: 30, y: 30, r: -30, c: p.a},
      {x: 66, y: 26, r: 25, c: p.d},
      {x: 50, y: 54, r: 70, c: p.a},
      {x: 24, y: 72, r: 15, c: p.d},
      {x: 74, y: 68, r: -40, c: p.a},
      {x: 50, y: 84, r: 100, c: p.c},
    ].map((b, i) => (
      <g key={i} transform={`rotate(${b.r} ${b.x} ${b.y})`}>
        <ellipse cx={b.x} cy={b.y} rx="10" ry="14" fill={b.c} />
        <path d={`M${b.x} ${b.y - 12}c-5 6 5 10 0 12s5 8 0 12`} stroke={p.bg} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    ))}
  </>
);

const PastryCase: Art = ({p}) => (
  <>
    <rect x="10" y="18" width="80" height="70" rx="5" fill={p.b} />
    <rect x="14" y="22" width="72" height="56" rx="3" fill={p.c} opacity="0.35" />
    <path d="M14 50h72M14 78h72" stroke={p.a} strokeWidth="2.4" />
    {[24, 42, 60, 76].map((x, i) => (
      <path key={x} d={`M${x - 7} 50a7 7 0 0 1 14 0z`} fill={i % 2 ? p.d : p.a} />
    ))}
    {[26, 50, 74].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy="71" r="7" fill={i === 1 ? p.a : p.d} />
        <circle cx={x} cy="71" r="2.4" fill={i === 1 ? p.d : p.a} />
      </g>
    ))}
    <rect x="10" y="84" width="80" height="6" rx="2" fill={p.a} />
  </>
);

const IcedCoffee: Art = ({p}) => (
  <>
    <ellipse cx="50" cy="88" rx="24" ry="4" fill={p.b} />
    <path d="M58 6l-10 40" stroke={p.d} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M30 24h40l-5 60a4 4 0 0 1-4 4H39a4 4 0 0 1-4-4z" fill={p.b} opacity="0.55" />
    <path d="M32 46h36l-3 38a4 4 0 0 1-4 4H39a4 4 0 0 1-4-4z" fill={p.a} />
    <path d="M32.5 46c6 5 12-3 18 1s12 2 17-1l-.6 9c-6 3-11-2-17 1s-12 1-17-2z" fill={p.c} opacity="0.95" />
    {[
      [38, 30, 12],
      [53, 33, 11],
      [44, 38, 10],
    ].map(([x, y, s], i) => (
      <rect key={i} x={x} y={y} width={s} height={s} rx="2.5" fill={p.c} opacity="0.7" transform={`rotate(${i * 14 - 10} ${x + s / 2} ${y + s / 2})`} />
    ))}
  </>
);

const BaristaHands: Art = ({p}) => (
  <>
    <ellipse cx="50" cy="56" rx="17" ry="5" fill={p.d} />
    <path d="M33 56h34l-3 22a8 8 0 0 1-8 7H44a8 8 0 0 1-8-7z" fill={p.c} />
    <path d="M4 70c10-6 20-8 30-5l5 10c-10 4-22 8-35 6z" fill={p.a} />
    <path d="M96 70c-10-6-20-8-30-5l-5 10c10 4 22 8 35 6z" fill={p.a} />
    <path d="M30 66c2 2 4 5 6 9M70 66c-2 2-4 5-6 9" stroke={p.bg} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M58 18c8 2 12 8 10 16l-3 6-12-3 2-6c1-4 0-8-3-11z" fill={p.a} />
    <path d="M54 36c-2 5-3 10-4 16" stroke={p.c} strokeWidth="3" strokeLinecap="round" />
  </>
);

const MenuBoard: Art = ({p}) => (
  <>
    <path d="M30 12l20-6 20 6" stroke={p.d} strokeWidth="2" fill="none" />
    <rect x="16" y="12" width="68" height="80" rx="4" fill={p.d} />
    <rect x="20" y="16" width="60" height="72" rx="2" fill={p.a} />
    <text x="50" y="33" textAnchor="middle" fontFamily={p.font} fontWeight={800} fontSize="11" letterSpacing="1" fill={p.c}>
      MENU
    </text>
    {[45, 56, 67, 78].map((y, i) => (
      <g key={y}>
        <rect x="26" y={y - 2} width={22 - (i % 2) * 6} height="3.4" rx="1.7" fill={p.c} opacity="0.9" />
        <path d={`M${52 - (i % 2) * 6} ${y}h12`} stroke={p.c} strokeWidth="1" strokeDasharray="1 2.4" opacity="0.6" />
        <rect x="68" y={y - 2} width="7" height="3.4" rx="1.7" fill={p.b} />
      </g>
    ))}
  </>
);

export const ILLUSTRATIONS: Art[] = [CoffeeCup, Croissant, LatteArt, Storefront, Beans, PastryCase, IcedCoffee, BaristaHands, MenuBoard];

export const FeedArt: React.FC<{index: number; palette: Palette}> = ({index, palette}) => {
  const Comp = ILLUSTRATIONS[index];
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
      <rect width="100" height="100" fill={palette.bg} />
      <Comp p={palette} />
    </svg>
  );
};
