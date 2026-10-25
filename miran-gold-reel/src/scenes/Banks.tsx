import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {ArabicText} from '../components/ArabicText';
import {GoldBar} from '../components/GoldBar';
import {S5_BANKS} from '../strings';
import {COLORS, EASE, LAYOUT, SAFE, VIDEO} from '../theme';
import {dash, ease, exitProgress, exitStyle, hexA} from '../motion';

const columns = [330, 435, 540, 645, 750];
const BANK = [
  'M250 830 L540 712 L830 830 Z',
  'M272 830 H808 V872 H272 Z',
  ...columns.map((x) => `M${x - 26} 872 H${x + 26} V888 H${x - 26} Z M${x - 20} 888 V1150 M${x + 20} 888 V1150 M${x - 26} 1150 H${x + 26}`),
  'M250 1162 H830 V1186 H250 Z',
  'M226 1186 H854 V1210 H226 Z',
].join(' ');

const BAR_W = 150;
const BAR_H = (BAR_W * 170) / 300;
// stack 3-2-1, bottom row first (landing centre points)
const SLOTS: [number, number][] = [
  [382, 1290], [540, 1290], [698, 1290],
  [461, 1228], [619, 1228],
  [540, 1166],
];
const FROM: [number, number][] = [
  [-260, 1520], [1340, 1480], [-260, 1000], [1340, 900], [-260, 640], [1340, 620],
];
const FIRST = 62;
const GAP = 18;
const FLIGHT = 34;

const bezier = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];

const FlyingBar: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const start = FIRST + i * GAP;
  const land = start + FLIGHT;
  const u = ease(frame, start, FLIGHT);
  const from = FROM[i];
  const to = SLOTS[i];
  const ctrl: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 260];
  const [x, y] = bezier(from, ctrl, to, u);
  const rot = interpolate(u, [0, 1], [from[0] < 540 ? -28 : 28, 0]);
  const squash = frame >= land ? spring({frame: frame - land, fps: VIDEO.fps, config: {damping: 9, stiffness: 220}}) : 1;
  const sy = frame >= land ? interpolate(squash, [0, 1], [0.86, 1]) : 1;
  const sx = frame >= land ? interpolate(squash, [0, 1], [1.06, 1]) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - BAR_W / 2,
        top: y - BAR_H / 2,
        width: BAR_W,
        height: BAR_H,
        transformOrigin: '50% 100%',
        transform: `rotate(${rot}deg) scale(${sx}, ${sy})`,
      }}
    >
      <GoldBar id={`bank-bar-${i}`} width={BAR_W} frame={frame} sweepStart={land + 20 + i * 6} sweepEvery={120} />
    </div>
  );
};

const LandingRing: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const land = FIRST + i * GAP + FLIGHT;
  if (frame < land) return null;
  const p = interpolate(frame, [land, land + 26], [0, 1], {extrapolateRight: 'clamp', easing: EASE.enter});
  if (p >= 1) return null;
  const [x, y] = SLOTS[i];
  return <ellipse cx={x} cy={y + BAR_H / 2 - 4} rx={60 + p * 70} ry={12 + p * 16} fill="none" stroke={COLORS.goldB} strokeWidth={2.5} opacity={(1 - p) * 0.85} />;
};

export const Banks: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const draw = ease(frame, 0, 64);
  const lastLand = FIRST + (SLOTS.length - 1) * GAP + FLIGHT;
  const bright = ease(frame, lastLand, 30);

  return (
    <AbsoluteFill>
      <ArabicText block={S5_BANKS} size={64} start={15} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path
            d={BANK}
            pathLength={1}
            fill="none"
            stroke={COLORS.goldA}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              ...dash(draw, 0, 0.5 + 0.5 * bright),
              filter: bright > 0 ? `drop-shadow(0 0 ${10 * bright}px ${hexA(COLORS.goldB, 0.8)})` : undefined,
            }}
          />
          {SLOTS.map((_, i) => (
            <LandingRing key={i} i={i} />
          ))}
        </svg>
        {SLOTS.map((_, i) => {
          const start = FIRST + i * GAP;
          if (frame < start) return null;
          return frame < start + FLIGHT ? (
            <Trail key={i} layers={6} lagInFrames={0.6} trailOpacity={0.55}>
              <FlyingBar i={i} />
            </Trail>
          ) : (
            <FlyingBar key={i} i={i} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
