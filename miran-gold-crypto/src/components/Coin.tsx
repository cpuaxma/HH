import React from 'react';
import {COLORS} from '../config';
import {mix} from '../motion';

/** Circuit traces on the coin face, in a 200×200 box centred on (100,100). */
const TRACES = [
  'M118,90 H140 L150,80 H165',
  'M118,100 H170',
  'M118,110 H135 L148,123 H160',
  'M82,90 H60 L50,80 H35',
  'M82,100 H30',
  'M82,110 H65 L52,123 H40',
  'M92,82 V60 L82,50 V38',
  'M108,82 V58 L118,48 V35',
  'M100,82 V30',
  'M92,118 V140 L82,150 V162',
  'M108,118 V142 L118,152 V166',
  'M100,118 V170',
];
const PADS: [number, number][] = [
  [165, 80], [170, 100], [160, 123], [35, 80], [30, 100], [40, 123],
  [82, 38], [118, 35], [100, 30], [82, 162], [118, 166], [100, 170],
];
const TICKS = Array.from({length: 72}, (_, i) => (i * 360) / 72);

const Face: React.FC<{t: number; light: number; glow: number; id: string}> = ({t, light, glow, id}) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{display: 'block'}}>
    <defs>
      <radialGradient id={`face-${id}`} cx="36%" cy="30%" r="80%">
        <stop offset="0%" stopColor={COLORS.goldPale} />
        <stop offset="22%" stopColor={COLORS.goldLight} />
        <stop offset="52%" stopColor={COLORS.gold} />
        <stop offset="82%" stopColor="#A6822A" />
        <stop offset="100%" stopColor="#6A4F14" />
      </radialGradient>
      <radialGradient id={`inner-${id}`} cx="60%" cy="65%" r="75%">
        <stop offset="0%" stopColor="#E8C75A" />
        <stop offset="60%" stopColor="#C49B2E" />
        <stop offset="100%" stopColor="#8C6B1C" />
      </radialGradient>
      <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="100" cy="100" r="100" fill={`url(#face-${id})`} />
    {/* reeded border */}
    {TICKS.map((a) => (
      <line
        key={a}
        x1="100" y1="3" x2="100" y2="11"
        stroke="#7A5C18" strokeWidth="1.4" strokeOpacity="0.55"
        transform={`rotate(${a} 100 100)`}
      />
    ))}
    <circle cx="100" cy="100" r="88" fill="none" stroke="#7A5C18" strokeWidth="2.2" />
    <circle cx="100" cy="100" r="86.6" fill="none" stroke={COLORS.goldPale} strokeWidth="0.8" strokeOpacity="0.7" />
    <circle cx="100" cy="100" r="82" fill={`url(#inner-${id})`} />
    <circle cx="100" cy="100" r="82" fill="none" stroke="#6A4F14" strokeWidth="1.2" strokeOpacity="0.6" />
    {/* engraved traces */}
    {TRACES.map((d, i) => (
      <path key={i} d={d} fill="none" stroke="#5E4512" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
    ))}
    {/* glowing traces */}
    <g filter={`url(#glow-${id})`} opacity={0.55 + 0.45 * glow}>
      {TRACES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={COLORS.goldPale} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />
      ))}
      {TRACES.map((d, i) => (
        <path
          key={`p${i}`}
          d={d}
          pathLength={100}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="14 86"
          strokeDashoffset={100 - ((t * 38 + i * 23) % 100)}
          opacity={glow}
        />
      ))}
      {PADS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill={COLORS.goldPale} stroke="#5E4512" strokeWidth="1" />
      ))}
    </g>
    {/* chip */}
    <rect x="80" y="80" width="40" height="40" rx="6" fill="#3A2B0A" stroke={COLORS.goldLight} strokeWidth="1.6" />
    <rect x="88" y="88" width="24" height="24" rx="4" fill="none" stroke={COLORS.gold} strokeWidth="1.2" />
    <circle cx="100" cy="100" r="6" fill={COLORS.goldPale} filter={`url(#glow-${id})`} opacity={0.6 + 0.4 * glow} />
    {/* light on the face as it turns */}
    <circle cx="100" cy="100" r="100" fill="#000" opacity={Math.max(0, 0.45 - light * 0.45)} />
    <circle cx="100" cy="100" r="100" fill="#FFF6D8" opacity={Math.max(0, light - 0.85) * 1.2} />
  </svg>
);

const RIM_SEGMENTS = 72;
// light from upper left, toward the viewer (screen y points down, z toward the viewer)
const L = (() => {
  const v = [-0.45, -0.55, 0.7];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();

/**
 * A gold coin with a glowing circuit face, built from real CSS 3D planes:
 * two faces and a ring of shaded rim segments, so it has thickness when it turns.
 */
export const Coin: React.FC<{
  size: number;
  angle: number; // rotateY in degrees
  tilt?: number; // rotateX in degrees
  t: number; // seconds, drives the circuit pulses
  glow?: number; // 0–1
  thickness?: number;
}> = ({size, angle, tilt = 0, t, glow = 1, thickness = size * 0.075}) => {
  const R = size / 2;
  const th = (angle * Math.PI) / 180;
  const tx = (tilt * Math.PI) / 180;
  // rotate a coin-space normal by rotateX(tilt) · rotateY(angle) and light it
  const lit = (n: number[]) => {
    const [x, y, z] = n;
    const x1 = x * Math.cos(th) + z * Math.sin(th);
    const z1 = -x * Math.sin(th) + z * Math.cos(th);
    const y2 = y * Math.cos(tx) - z1 * Math.sin(tx);
    const z2 = y * Math.sin(tx) + z1 * Math.cos(tx);
    return x1 * L[0] + y2 * L[1] + z2 * L[2];
  };
  const frontLight = 0.55 + 0.6 * Math.max(0, lit([0, 0, 1]));
  const backLight = 0.55 + 0.6 * Math.max(0, lit([0, 0, -1]));
  const segW = (2 * Math.PI * R) / RIM_SEGMENTS + 1.5;

  return (
    <div style={{width: size, height: size, perspective: 2000}}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt}deg) rotateY(${angle}deg)`,
        }}
      >
        {Array.from({length: RIM_SEGMENTS}, (_, i) => {
          const a = (i * 360) / RIM_SEGMENTS;
          const ar = (a * Math.PI) / 180;
          const b = Math.max(0, lit([Math.sin(ar), -Math.cos(ar), 0]));
          const color = mix(COLORS.goldShadow, COLORS.goldLight, Math.min(1, 0.18 + b * 0.95));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: R - segW / 2,
                top: R - thickness / 2,
                width: segW,
                height: thickness,
                background: `linear-gradient(180deg, ${color}, ${mix(COLORS.goldShadow, COLORS.gold, 0.35 + b * 0.5)} 50%, ${color})`,
                transform: `rotateZ(${a}deg) translateY(${-R}px) rotateX(90deg)`,
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            transform: `translateZ(${thickness / 2}px)`,
          }}
        >
          <Face t={t} light={frontLight} glow={glow} id="front" />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            transform: `rotateY(180deg) translateZ(${thickness / 2}px)`,
          }}
        >
          <Face t={t} light={backLight} glow={glow} id="back" />
        </div>
      </div>
    </div>
  );
};

/**
 * The coin's turn over the whole opening (global seconds): it starts slightly turned, makes two calm
 * turns, and comes to rest face-on at SPIN_END, ready to dissolve in scene 2.
 */
export const SPIN_END = 4.9;
export const coinAngle = (t: number) => {
  const p = Math.min(1, Math.max(0, t / SPIN_END));
  // ease-in-out with a long cruise: smoothstep blended with linear
  const s = p * p * (3 - 2 * p);
  const e = 0.45 * p + 0.55 * s;
  return -30 + 750 * e;
};
export const coinTilt = (t: number) => {
  const p = Math.min(1, Math.max(0, (t - 3.4) / (SPIN_END - 3.4)));
  return 12 * (1 - p * p * (3 - 2 * p));
};
