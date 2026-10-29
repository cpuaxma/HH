import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {GlassCard} from '../components/GlassCard';
import {GoldBar} from '../components/GoldBar';
import {Odometer} from '../components/Odometer';
import {ILLUSTRATIVE, S4_MARKETS, S4_TICKER_FROM, S4_TICKER_TO} from '../strings';
import {COLORS, EASE, FONT, LAYOUT, SAFE} from '../theme';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle, hexA, noise} from '../motion';

// Panel on the right (where an RTL eye starts), small bar on the left for the arrows to land on.
const PANEL = {left: 390, top: 860, width: 550, height: 400};
const BAR = {cx: 228, cy: 1060, width: 190};
const GOLD_PTS: [number, number][] = [
  [40, 320], [100, 304], [160, 286], [220, 262], [280, 236], [340, 204], [400, 170], [460, 132], [510, 100],
];
const GOLD_D = (() => {
  // Smooth Catmull-Rom → cubic Bézier through the points.
  const p = GOLD_PTS;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
})();

/** The "markets" line: a jagged path that never stops shaking. */
const redPath = (frame: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = 40 + i * 19.6;
    const base = 230 + Math.sin(i * 1.7) * 38 + (i % 2 ? -26 : 22);
    const y = base + noise(i + 50, frame * 0.5) * 14;
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return 'M' + pts.join(' L ');
};

// Arrows fly in from the left, top and bottom edges toward the bar.
export const ARROWS = [
  {from: [-120, 760], at: 60},
  {from: [-140, 1160], at: 74},
  {from: [120, 600], at: 88},
  {from: [-100, 1400], at: 102},
  {from: [380, 1540], at: 116},
  {from: [-130, 960], at: 130},
] as const;
export const ARROW_DUR = 22;

/** The illustrative ticker value at a scene-local frame (rolls from FROM to TO over frames 40–120). */
export const tickerValue = (f: number) => S4_TICKER_FROM + (S4_TICKER_TO - S4_TICKER_FROM) * ease(f, 40, 80);

const Arrows: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {ARROWS.map((a, i) => {
          const t = interpolate(frame, [a.at, a.at + ARROW_DUR], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
          if (t <= 0 || t >= 1) return null;
          const dx = BAR.cx - a.from[0];
          const dy = BAR.cy - a.from[1];
          const len = Math.hypot(dx, dy);
          const stop = len - 90; // stop just short of the bar
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          const head = stop * t;
          return (
            <g key={i} transform={`translate(${a.from[0]} ${a.from[1]}) rotate(${ang})`} opacity={interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0])}>
              <line x1={head - 70} y1={0} x2={head} y2={0} stroke={COLORS.goldB} strokeWidth={2.5} strokeLinecap="round" />
              <path d={`M${head - 12} -8 L${head} 0 L${head - 12} 8`} fill="none" stroke={COLORS.goldB} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Markets: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const panel = enter(frame, 0, 40);
  const gold = ease(frame, 40, 90);
  const red = ease(frame, 14, 40);
  const bar = hero(frame, 30);
  const tickerIn = enter(frame, 26, 30);
  // The bar pulses softly as each arrow lands.
  const pulse = ARROWS.reduce((m, a) => {
    const t = frame - (a.at + ARROW_DUR);
    return Math.max(m, t >= 0 && t < 24 ? Math.sin((t / 24) * Math.PI) : 0);
  }, 0);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        {/* Ticker above the panel */}
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 728,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            opacity: tickerIn,
            transform: `translateY(${(1 - tickerIn) * 18}px)`,
            filter: tickerIn < 0.99 ? `blur(${(1 - tickerIn) * 8}px)` : undefined,
          }}
        >
          <span style={{color: COLORS.up, fontSize: 30, lineHeight: 1}}>▲</span>
          <Odometer value={tickerValue(frame)} prev={tickerValue(frame - 1)} digits={4} size={56} />
          <span style={{fontFamily: FONT.family, fontWeight: FONT.body, fontSize: 22, color: hexA(COLORS.text, 0.4), lineHeight: 1.5}}>
            {ILLUSTRATIVE}
          </span>
        </div>

        <GlassCard style={{...PANEL, opacity: panel, transform: `translateY(${(1 - panel) * 60}px) scale(${0.96 + 0.04 * panel})`}}>
          <svg width={PANEL.width} height={PANEL.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={30} y1={90 + i * 80} x2={PANEL.width - 30} y2={90 + i * 80} stroke={COLORS.text} strokeOpacity={0.05} strokeWidth={1} />
            ))}
            <path d={redPath(frame)} fill="none" stroke={COLORS.red} strokeWidth={2.5} strokeLinejoin="round" opacity={red * (0.55 + 0.2 * noise(9, frame * 0.7))} />
            <ChartLine d={GOLD_D} progress={gold} color={COLORS.goldB} width={5} glow={6} />
          </svg>
        </GlassCard>

        <div
          style={{
            position: 'absolute',
            left: BAR.cx - 170,
            top: BAR.cy - 170,
            width: 340,
            height: 340,
            borderRadius: '50%',
            opacity: Math.min(1, bar) * (0.5 + 0.5 * pulse),
            background: `radial-gradient(circle, ${hexA(COLORS.goldB, 0.35)} 0%, ${hexA(COLORS.glow, 0)} 65%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: BAR.cx - BAR.width / 2,
            top: BAR.cy - (BAR.width * 170) / 300 / 2,
            width: BAR.width,
            ...heroStyle(bar, `scale(${1 + 0.05 * pulse})`),
          }}
        >
          <GoldBar id="s4-bar" width={BAR.width} frame={frame} sweepStart={60} />
        </div>

        <CameraMotionBlur shutterAngle={200} samples={6}>
          <Arrows />
        </CameraMotionBlur>
      </div>
      <ArabicText
        block={S4_MARKETS}
        size={LAYOUT.headlineSize}
        start={8}
        exitEnd={dur}
        style={{position: 'absolute', top: LAYOUT.headlineTop - 60, left: SAFE.side, right: SAFE.side}}
      />
    </AbsoluteFill>
  );
};
