import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, LAYOUT, SAFE, VIDEO} from '../theme';
import {S1_HOOK} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {Headline} from '../components/Layout';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {HeroLayer} from '../components/Hero';
import {smoothPath, Pt} from '../components/ChartLine';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA, jitter, rand} from '../motion';

const DUR = 180;

// Abstract warning dots: deterministic positions, kept off the headline, the hero and the safe zones.
const DOTS = (() => {
  const out: {x: number; y: number; r: number; seed: number; delay: number}[] = [];
  let s = 1;
  while (out.length < 26 && s < 900) {
    const x = 60 + rand(s) * (VIDEO.width - SAFE.right - 90);
    const y = 150 + rand(s + 0.5) * (VIDEO.height - SAFE.bottom - 200);
    s++;
    const inHeadline = y > LAYOUT.headlineTop - 60 && y < LAYOUT.headlineTop + 260;
    const inHero = x > 220 && x < 860 && y > 860 && y < 1300;
    if (inHeadline || inHero) continue;
    if (out.some((d) => Math.hypot(d.x - x, d.y - y) < 120)) continue;
    out.push({x, y, r: 5 + rand(s + 3) * 5, seed: s, delay: 20 + rand(s + 9) * 40});
  }
  return out;
})();

const BAR = {x: 540, y: 1040, w: 330};
// Calm line under the bar; its right end bends down when the bar tips.
const CALM: Pt[] = [
  [250, 1222],
  [400, 1214],
  [540, 1208],
  [680, 1204],
  [820, 1198],
];
const BENT: Pt[] = [
  [250, 1222],
  [400, 1214],
  [540, 1210],
  [680, 1236],
  [820, 1300],
];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const barIn = hero(frame, 22);
  const tip = ease(frame, 90, 26, EASE.inOut);
  const bend = ease(frame, 96, 24, EASE.enter);
  const pts = CALM.map(([x, y], i) => [x, interpolate(bend, [0, 1], [y, BENT[i][1]])] as Pt);
  const lineHead = ease(frame, 30, 44);
  const tipPt = pts[pts.length - 1];
  const flash = interpolate(frame, [112, 118, 150], [0, 1, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flashRing = interpolate(frame, [112, 146], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});

  return (
    <AbsoluteFill>
      {/* warning dots */}
      <AbsoluteFill style={exitStyle(exit)}>
        <svg width={VIDEO.width} height={VIDEO.height}>
          <defs>
            <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {DOTS.map((d, i) => {
            const p = ease(frame, d.delay, 24);
            const j = jitter(d.seed, frame, 1.2);
            const period = 48 + (i % 5) * 9;
            const ph = ((frame - d.delay + i * 13) % period) / period;
            const pulse = frame > d.delay ? ph : 0;
            const flick = j.flicker * (0.65 + 0.35 * Math.abs(Math.sin(frame * 0.21 + i)));
            return (
              <g key={i} opacity={p} transform={`translate(${d.x + j.x}, ${d.y + j.y})`}>
                <circle r={d.r * 2.4} fill={COLORS.red} opacity={0.35 * flick} filter="url(#dot-glow)" />
                <circle r={d.r} fill={COLORS.red} opacity={flick} />
                <circle r={d.r * (1 + pulse * 3.2)} fill="none" stroke={COLORS.red} strokeWidth={1.5} opacity={(1 - pulse) * 0.6} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* line under the bar + red flash at its tip */}
      <AbsoluteFill style={exitStyle(exit)}>
        <svg width={VIDEO.width} height={VIDEO.height}>
          <LightStreak id="hook-line" d={smoothPath(pts, 0.5)} head={lineHead} width={3.2} from={[250, 1220]} to={[820, 1240]} />
          <g transform={`translate(${tipPt[0]}, ${tipPt[1]})`}>
            <circle r={26} fill={COLORS.red} opacity={flash * 0.55} filter="url(#dot-glow)" />
            <circle r={7} fill="#FFD9D8" opacity={flash} />
            <circle r={8 + flashRing * 46} fill="none" stroke={COLORS.red} strokeWidth={2} opacity={flashRing > 0 ? (1 - flashRing) * 0.9 : 0} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* gold bar (hero) */}
      <HeroLayer from={22} to={70}>
        <div
          style={{
            position: 'absolute',
            left: BAR.x - BAR.w / 2,
            top: BAR.y - (BAR.w * 170) / 300 / 2,
            ...heroStyle(barIn, `rotate(${tip * 8}deg) translateY(${tip * 10}px)`, exit),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              top: '60%',
              height: 80,
              background: `radial-gradient(ellipse at center, ${hexA(COLORS.goldA, 0.35)}, transparent 70%)`,
              filter: 'blur(14px)',
            }}
          />
          <GoldBar id="hook-bar" width={BAR.w} frame={frame} sweepStart={40} sweepEvery={200} />
        </div>
      </HeroLayer>

      <Headline>
        <ArabicText block={S1_HOOK} size={LAYOUT.headlineSize + 6} start={2} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};
