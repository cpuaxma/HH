import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {ArabicText} from '../components/ArabicText';
import {LightStreak} from '../components/LightStreak';
import {S2_STOCKS} from '../strings';
import {COLORS, LAYOUT, SAFE, VIDEO} from '../theme';
import {Pt, dash, ease, exitProgress, exitStyle, hero, heroStyle, hexA, pointAt, polyD} from '../motion';

const BASE = 1360; // ground line under the buildings
const XS = [290, 540, 790];

// Three thin-stroke icons drawn in local coords (0,0 = bottom centre of the icon).
const ICONS = [
  // factory: saw-tooth roof + chimney
  {top: -105, d: 'M-75 0 V-80 L-40 -105 V-80 L-5 -105 V-80 L30 -105 V-80 H45 V-150 H65 V-80 H75 V0 Z M-50 0 V-35 H-25 V0 M5 -45 H35 V-25 H5 Z'},
  // tower: tall office block with window rows
  {top: -190, d: 'M-50 0 V-190 H50 V0 Z M-30 -165 H-10 M10 -165 H30 M-30 -135 H-10 M10 -135 H30 M-30 -105 H-10 M10 -105 H30 M-30 -75 H-10 M10 -75 H30 M-12 0 V-35 H12 V0'},
  // office: wide low building with pediment
  {top: -140, d: 'M-75 0 V-100 L0 -140 L75 -100 V0 Z M-50 0 V-75 M-20 0 V-75 M20 0 V-75 M50 0 V-75 M-75 -100 H75'},
];

// Stepped growth line (left → right, rising). Each feeder meets it at the matching x.
const STEPS: Pt[] = [
  [180, 1090], [290, 1090], [290, 1010], [420, 1010], [420, 960], [540, 960], [540, 900], [660, 900], [660, 860], [790, 860], [790, 800], [880, 800],
];
const STEP_Y = [1090, 960, 860]; // where each feeder joins

const COINS = [
  {b: 0, dx: -18, delay: 0},
  {b: 1, dx: 14, delay: 8},
  {b: 2, dx: -10, delay: 14},
  {b: 0, dx: 22, delay: 22},
  {b: 2, dx: 20, delay: 30},
];

const Coin: React.FC<{x: number; delay: number}> = ({x, delay}) => {
  // Trail re-renders this at earlier frames, so it reads the frame itself.
  const frame = useCurrentFrame() - 120 - delay;
  if (frame < 0) return null;
  const pop = hero(frame, 0);
  const fall = ease(frame, 4, 46);
  const y = BASE - 40 + fall * 70;
  const o = interpolate(frame, [0, 6, 34, 52], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, ...heroStyle(pop, `rotateX(${fall * 40}deg)`), opacity: o * Math.min(1, pop * 3)}}>
      <svg width={32} height={32} viewBox="0 0 32 32">
        <defs>
          <linearGradient id="coin-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.goldB} />
            <stop offset="1" stopColor={COLORS.goldA} />
          </linearGradient>
        </defs>
        <circle cx={16} cy={16} r={14} fill="url(#coin-g)" />
        <circle cx={16} cy={16} r={9.5} fill="none" stroke={COLORS.goldDeep} strokeOpacity={0.6} strokeWidth={1.5} />
      </svg>
    </div>
  );
};

export const Stocks: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const growth = ease(frame, 75, 75);
  const tip = pointAt(STEPS, growth);
  const ground = ease(frame, 0, 40);

  return (
    <AbsoluteFill>
      <ArabicText block={S2_STOCKS} size={76} start={12} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <AbsoluteFill style={exitStyle(out)}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <line x1={160} y1={BASE} x2={920} y2={BASE} stroke={COLORS.text} strokeOpacity={0.1 * ground} strokeWidth={1.5} />
          {/* feeder lines rising from each roof */}
          {XS.map((x, i) => {
            const p = ease(frame, 45 + i * 6, 34);
            const d = `M${x} ${BASE + ICONS[i].top - 14} L${x} ${STEP_Y[i]}`;
            return <path key={i} d={d} pathLength={1} stroke={hexA(COLORS.blueB, 0.55)} strokeWidth={2} fill="none" strokeLinecap="round" style={dash(p)} />;
          })}
          <LightStreak id="stocks-growth" variant="blue" d={polyD(STEPS)} head={growth} width={4.5} from={STEPS[0]} to={STEPS[STEPS.length - 1]} />
          {growth > 0.01 ? (
            <g>
              <circle cx={tip[0]} cy={tip[1]} r={22} fill={hexA(COLORS.blueB, 0.35)} style={{filter: 'blur(8px)'}} />
              <circle cx={tip[0]} cy={tip[1]} r={6} fill="#EAF1FF" />
            </g>
          ) : null}
        </svg>

        {XS.map((x, i) => {
          const p = ease(frame, i * 8, 45);
          return (
            <div key={i} style={{position: 'absolute', left: x - 90, top: BASE - 200, width: 180, height: 200, ...heroStyle(hero(frame, i * 8))}}>
              <svg width={180} height={200} viewBox="-90 -200 180 200" style={{overflow: 'visible'}}>
                <path
                  d={ICONS[i].d}
                  pathLength={1}
                  fill="none"
                  stroke={COLORS.blueB}
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{...dash(p), filter: `drop-shadow(0 0 6px ${hexA(COLORS.blueA, 0.6)})`}}
                />
              </svg>
            </div>
          );
        })}

        {COINS.map((c, i) => (
          <Trail key={i} layers={4} lagInFrames={0.5} trailOpacity={0.5}>
            <Coin x={XS[c.b] + c.dx} delay={c.delay} />
          </Trail>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
