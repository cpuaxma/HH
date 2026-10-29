import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {GoldBar} from '../components/GoldBar';
import {S3_INDEPENDENT} from '../strings';
import {COLORS, LAYOUT, SAFE} from '../theme';
import {dash, ease, exitProgress, exitStyle, hero, heroStyle, hexA, rand} from '../motion';

const BAR = {cx: 540, top: 1200, width: 300};
const ANCHOR: [number, number] = [540, 1218]; // where every connection lands on the bar's top face
const ICON = 120;

const stroke = {fill: 'none', stroke: COLORS.text, strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

/** Government building: dome, drum, columns and steps. */
const Government: React.FC = () => (
  <g {...stroke}>
    <path d="M30 52 A30 26 0 0 1 90 52" />
    <line x1="60" y1="18" x2="60" y2="26" />
    <rect x="24" y="52" width="72" height="8" />
    {[34, 50, 70, 86].map((x) => (
      <line key={x} x1={x} y1="64" x2={x} y2="96" />
    ))}
    <line x1="16" y1="100" x2="104" y2="100" />
    <line x1="10" y1="108" x2="110" y2="108" />
  </g>
);

/** Company tower: tall block with a window grid and an antenna. */
const Company: React.FC = () => (
  <g {...stroke}>
    <rect x="34" y="20" width="52" height="88" />
    <line x1="60" y1="6" x2="60" y2="20" />
    {[34, 50, 66, 82].map((y) =>
      [46, 60, 74].map((x) => <line key={`${x}-${y}`} x1={x - 4} y1={y} x2={x + 4} y2={y} />),
    )}
    <rect x="52" y="94" width="16" height="14" />
    <line x1="14" y1="108" x2="106" y2="108" />
  </g>
);

/** Bank: pediment with a coin, columns and a base. */
const Bank: React.FC = () => (
  <g {...stroke}>
    <path d="M14 46 L60 14 L106 46 Z" />
    <circle cx="60" cy="34" r="6" />
    <line x1="20" y1="54" x2="100" y2="54" />
    {[30, 50, 70, 90].map((x) => (
      <line key={x} x1={x} y1="60" x2={x} y2="96" />
    ))}
    <line x1="16" y1="100" x2="104" y2="100" />
    <line x1="10" y1="108" x2="110" y2="108" />
  </g>
);

// Right to left, matching the sentence: حكومة ← شركة ← بنك.
export const ICONS = [
  {C: Government, cx: 810, cy: 870, breakAt: 150},
  {C: Company, cx: 540, cy: 820, breakAt: 185},
  {C: Bank, cx: 270, cy: 870, breakAt: 220},
];

const linkPath = (cx: number, cy: number) => {
  const sx = cx;
  const sy = cy + ICON / 2 + 18;
  const [ex, ey] = ANCHOR;
  return {d: `M${sx} ${sy} C ${sx} ${sy + 140} ${ex} ${ey - 200} ${ex} ${ey}`, pts: [sx, sy, ex, ey] as const};
};

const cubic = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;

export const Independent: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const bar = hero(frame, 0);
  const alone = ease(frame, 240, 55);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {ICONS.map(({C, cx, cy, breakAt}, i) => {
            const pop = hero(frame, 30 + i * 14);
            const draw = ease(frame, 70 + i * 10, 40);
            const brk = ease(frame, breakAt, 34);
            const {pts} = linkPath(cx, cy);
            const [sx, sy, ex, ey] = pts;
            // Dots sampled along the link; once it breaks they drift apart and fade.
            const dots = new Array(14).fill(0).map((_, k) => {
              const t = (k + 0.5) / 14;
              const x = cubic(sx, sx, ex, ex, t);
              const y = cubic(sy, sy + 140, ey - 200, ey, t);
              const a = rand(i * 40 + k) * Math.PI * 2;
              const spread = 26 + rand(i * 40 + k + 9) * 40;
              return {x: x + Math.cos(a) * spread * brk, y: y + Math.sin(a) * spread * brk + brk * 30};
            });
            return (
              <g key={i}>
                <path
                  d={linkPath(cx, cy).d}
                  pathLength={1}
                  fill="none"
                  stroke={hexA(COLORS.text, 0.55)}
                  strokeWidth={1.6}
                  style={dash(draw, 0, 1 - interpolate(brk, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}))}
                />
                {brk > 0 && brk < 1
                  ? dots.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={2.4} fill={COLORS.text} opacity={Math.sin(brk * Math.PI) * 0.8} />)
                  : null}
                <g
                  transform={`translate(${cx} ${cy}) scale(${0.7 + 0.3 * pop}) translate(${-ICON / 2} ${-ICON / 2})`}
                  opacity={Math.min(1, pop) * (1 - 0.75 * brk)}
                >
                  <C />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Glow under the bar: steady, and brighter once the bar stands alone. */}
        <div
          style={{
            position: 'absolute',
            left: BAR.cx - 330,
            top: BAR.top - 240,
            width: 660,
            height: 660,
            borderRadius: '50%',
            opacity: Math.min(1, bar) * (0.45 + 0.55 * alone),
            background: `radial-gradient(circle, ${hexA(COLORS.goldB, 0.38)} 0%, ${hexA(COLORS.glow, 0.12)} 38%, ${hexA(COLORS.glow, 0)} 66%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: BAR.cx - BAR.width / 2,
            top: BAR.top,
            width: BAR.width,
            ...heroStyle(bar),
            filter: `brightness(${1 + 0.18 * alone}) drop-shadow(0 0 ${10 + 26 * alone}px ${hexA(COLORS.goldB, 0.35 + 0.3 * alone)})`,
          }}
        >
          <GoldBar id="s3-bar" width={BAR.width} frame={frame} sweepStart={40} />
        </div>
      </div>
      <ArabicText
        block={S3_INDEPENDENT}
        size={LAYOUT.headlineSize}
        start={10}
        exitEnd={dur}
        style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}}
      />
    </AbsoluteFill>
  );
};
