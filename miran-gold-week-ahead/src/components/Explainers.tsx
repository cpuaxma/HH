import React from 'react';
import {C, FONT} from '../brand';
import {Coin} from './CauseChain';

/* ───────────── Thermometer ───────────── */

/**
 * Inflation thermometer. The part of the column above `target` turns red so the viewer
 * sees "above target" without reading a number. `level` and `target` share units (%).
 */
export const Thermometer: React.FC<{
  level: number;
  max: number;
  target: number;
  height: number;
  f: number;
  targetIn: number; // 0→1 target line draw
  hot: number; // 0→1 how strongly the over-target part glows
}> = ({level, max, target, height, f, targetIn, hot}) => {
  const W = 64;
  const bulbR = 50;
  const x = 90; // tube centre within the svg
  const top = 20;
  const bottom = height - bulbR * 2 + 10;
  const yOf = (v: number) => bottom - (Math.max(0, Math.min(max, v)) / max) * (bottom - top);
  const yL = yOf(level);
  const yT = yOf(target);
  const shimmer = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <svg width={180} height={height + 20} viewBox={`0 0 180 ${height + 20}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id="merc" x1="0" x2="1">
          <stop offset="0%" stopColor={C.gold2} />
          <stop offset="50%" stopColor={C.gold0} />
          <stop offset="100%" stopColor={C.gold2} />
        </linearGradient>
        <linearGradient id="mercHot" x1="0" x2="1">
          <stop offset="0%" stopColor="#B83A3E" />
          <stop offset="50%" stopColor="#FF8A8D" />
          <stop offset="100%" stopColor="#B83A3E" />
        </linearGradient>
        <clipPath id="tubeClip">
          <rect x={x - W / 2 + 10} y={top} width={W - 20} height={bottom - top + 30} rx={(W - 20) / 2} />
          <circle cx={x} cy={bottom + bulbR - 6} r={bulbR - 10} />
        </clipPath>
      </defs>
      {/* glass */}
      <rect x={x - W / 2} y={top - 10} width={W} height={bottom - top + 40} rx={W / 2} fill="rgba(11,24,56,0.85)" stroke="rgba(212,175,55,0.35)" strokeWidth={2} />
      <circle cx={x} cy={bottom + bulbR - 6} r={bulbR} fill="rgba(11,24,56,0.85)" stroke="rgba(212,175,55,0.35)" strokeWidth={2} />
      {/* liquid */}
      <g clipPath="url(#tubeClip)">
        <circle cx={x} cy={bottom + bulbR - 6} r={bulbR} fill="url(#merc)" />
        <rect x={x - W / 2} y={Math.max(yL, yT)} width={W} height={bottom - Math.max(yL, yT) + 40} fill="url(#merc)" />
        {level > target ? <rect x={x - W / 2} y={yL} width={W} height={yT - yL} fill="url(#mercHot)" opacity={0.35 + 0.65 * hot} /> : null}
        {/* surface highlight */}
        <rect x={x - W / 2} y={yL - 2} width={W} height={5} fill="#fff" opacity={0.5} />
      </g>
      {level > target && hot > 0 ? (
        <rect x={x - W / 2 - 6} y={yL - 6} width={W + 12} height={yT - yL + 12} rx={20} fill="none" stroke={C.red} strokeOpacity={0.5 * hot * shimmer} strokeWidth={3} />
      ) : null}
      {/* glass shine */}
      <rect x={x - W / 2 + 12} y={top} width={6} height={bottom - top} rx={3} fill="#fff" opacity={0.12} />
      {/* target line */}
      <line x1={x - 80} x2={x - 80 + 160 * targetIn} y1={yT} y2={yT} stroke={C.text} strokeWidth={3} strokeDasharray="10 8" opacity={0.9} />
    </svg>
  );
};

/** y (in px from the svg top) of a value in the thermometer — so labels can follow the column. */
export const thermoY = (v: number, max: number, height: number) => {
  const top = 20;
  const bottom = height - 100 + 10;
  return bottom - (Math.max(0, Math.min(max, v)) / max) * (bottom - top);
};

/* ───────────── Seesaw (dollar ⇄ gold) ───────────── */

const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size?: number}> = ({dir, color, size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: dir === 'down' ? 'rotate(180deg)' : undefined, display: 'block'}}>
    <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={color} />
  </svg>
);

const DollarCoin: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="usdG" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#F4F7FB" />
        <stop offset="50%" stopColor="#B9C2D3" />
        <stop offset="100%" stopColor="#6E7891" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#usdG)" stroke="#5B647C" strokeWidth="3" />
    <circle cx="50" cy="50" r="36" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
    <text x="50" y="66" textAnchor="middle" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="46" fill="#3D4559">
      $
    </text>
  </svg>
);

/**
 * A seesaw with the dollar on the right (read first in RTL) and gold on the left.
 * `angle` > 0 tips the right side down. Arrows/glows show which side wins.
 */
export const Seesaw: React.FC<{
  angle: number;
  f: number;
  dollarLabel: string;
  goldLabel: string;
  dollarArrow?: {dir: 'up' | 'down'; op: number};
  goldArrow?: {dir: 'up' | 'down'; color: string; op: number};
  goldGlow?: {color: string; op: number};
  width?: number;
}> = ({angle, f, dollarLabel, goldLabel, dollarArrow, goldArrow, goldGlow, width = 760}) => {
  const H = 380;
  const px = width / 2;
  const py = 250;
  const L = 300;
  const a = (angle * Math.PI) / 180;
  const d = [Math.cos(a), Math.sin(a)];
  const n = [Math.sin(a), -Math.cos(a)];
  const COIN = 128;
  const end = (s: number) => [px + s * L * d[0] + n[0] * (COIN / 2 + 8), py + s * L * d[1] + n[1] * (COIN / 2 + 8)];
  const [rx, ry] = end(1);
  const [lx, ly] = end(-1);
  const label = (txt: string, x: number, y: number, color: string) => (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: x,
        top: y - COIN / 2 - 52,
        transform: 'translateX(-50%)',
        fontFamily: FONT.ar,
        fontWeight: 700,
        fontSize: 34,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {txt}
    </div>
  );
  return (
    <div style={{position: 'relative', width, height: H}}>
      <svg width={width} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="beamG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.gold0} />
            <stop offset="100%" stopColor={C.gold2} />
          </linearGradient>
        </defs>
        {/* base + pivot */}
        <ellipse cx={px} cy={py + 98} rx={170} ry={10} fill="rgba(0,0,0,0.35)" />
        <path d={`M ${px} ${py + 4} L ${px + 52} ${py + 96} L ${px - 52} ${py + 96} Z`} fill="rgba(11,24,56,0.95)" stroke="rgba(212,175,55,0.55)" strokeWidth={2} />
        <g transform={`rotate(${angle} ${px} ${py})`}>
          <rect x={px - L - 30} y={py - 9} width={2 * L + 60} height={18} rx={9} fill="url(#beamG)" style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))'}} />
        </g>
        <circle cx={px} cy={py} r={13} fill={C.bg0} stroke={C.gold0} strokeWidth={4} />
      </svg>
      {/* dollar (right) */}
      <div style={{position: 'absolute', left: rx - COIN / 2, top: ry - COIN / 2}}>
        <DollarCoin size={COIN} />
      </div>
      {label(dollarLabel, rx, ry, C.text)}
      {dollarArrow && dollarArrow.op > 0 ? (
        <div style={{position: 'absolute', left: rx + COIN / 2 - 6, top: ry - 22, opacity: dollarArrow.op, transform: `scale(${0.6 + 0.4 * dollarArrow.op})`}}>
          <Arrow dir={dollarArrow.dir} color={C.text} />
        </div>
      ) : null}
      {/* gold (left) */}
      <div
        style={{
          position: 'absolute',
          left: lx - COIN / 2,
          top: ly - COIN / 2,
          filter: goldGlow && goldGlow.op > 0 ? `drop-shadow(0 0 ${26 * goldGlow.op}px ${goldGlow.color})` : 'drop-shadow(0 0 16px rgba(212,175,55,0.45))',
        }}
      >
        <Coin size={COIN} f={f} />
      </div>
      {label(goldLabel, lx, ly, C.gold0)}
      {goldArrow && goldArrow.op > 0 ? (
        <div style={{position: 'absolute', left: lx - COIN / 2 - 40, top: ly - 22, opacity: goldArrow.op, transform: `scale(${0.6 + 0.4 * goldArrow.op})`}}>
          <Arrow dir={goldArrow.dir} color={goldArrow.color} />
        </div>
      ) : null}
    </div>
  );
};

/* ───────────── Liquidity tank ───────────── */

/** A glass tank whose gold liquid drains (`level` 0→1), with a moving wave surface. */
export const Tank: React.FC<{level: number; f: number; width: number; height: number}> = ({level, f, width, height}) => {
  const pad = 10;
  const innerH = height - pad * 2;
  const y = pad + innerH * (1 - level);
  const wave = (k: number) =>
    Array.from({length: 21}, (_, i) => {
      const x = (i / 20) * width;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y + Math.sin(i / 2.2 + f / 7 + k) * 6}`;
    }).join(' ');
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id="liqG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.gold0} stopOpacity={0.95} />
          <stop offset="100%" stopColor={C.gold2} stopOpacity={0.9} />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x={4} y={4} width={width - 8} height={height - 8} rx={36} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={width} height={height} rx={40} fill="rgba(11,24,56,0.75)" stroke="rgba(212,175,55,0.4)" strokeWidth={2} />
      <g clipPath="url(#tankClip)">
        <path d={`${wave(0)} L ${width} ${height} L 0 ${height} Z`} fill="url(#liqG)" />
        <path d={wave(1.4)} fill="none" stroke="#FFF3C4" strokeOpacity={0.6} strokeWidth={3} />
        {/* bubbles */}
        {Array.from({length: 6}, (_, i) => {
          const bx = 20 + ((i * 37) % (width - 40));
          const by = height - (((f * (1.2 + i * 0.2) + i * 40) % (height - y + 10)) + 6);
          return by > y + 8 ? <circle key={i} cx={bx} cy={by} r={3 + (i % 3)} fill="#fff" opacity={0.35} /> : null;
        })}
      </g>
      <rect x={14} y={16} width={8} height={height - 32} rx={4} fill="#fff" opacity={0.08} />
    </svg>
  );
};
