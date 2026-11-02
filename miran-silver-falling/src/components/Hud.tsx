import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CHROME_GRADIENT, COLORS, EASE, FONT, LAYOUT, SCENES, SILVER_GRADIENT, VIDEO} from '../theme';
import {PRICE, TICKER} from '../strings';
import {ar} from '../numbers';
import {chartHead, CHART, DROP_T, FULL_D, hudPrice} from '../silverChart';
import {enter, hexA} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = 600;
const H = 84;

/**
 * Live price HUD under the wordmark: ticker, price (chrome numerals), change from the record
 * and a sparkline. It counts down in sync with the drop chart, then stays as the story's anchor.
 */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = enter(frame, 26, 36);
  const out = interpolate(frame, [SCENES.cta[0] + 4, SCENES.cta[0] + 26], [0, 1], {...clamp, easing: EASE.exit});
  const price = hudPrice(frame);
  const pct = (price / PRICE.peak - 1) * 100;
  const atPeak = pct > -0.5;

  // Red alert from the hook's fracture onwards; calms back to neutral for the tip.
  const crackFlash = interpolate(frame, [SCENES.hook[0] + 112, SCENES.hook[0] + 120, SCENES.hook[0] + 160], [0, 1, 0.35], clamp);
  const calm = interpolate(frame, [SCENES.tip[0], SCENES.tip[0] + 40], [0, 1], clamp);
  const alert = Math.max(crackFlash, atPeak ? 0 : 0.35) * (1 - calm);
  const tick = frame > SCENES.drop[0] + DROP_T.peak && frame < SCENES.drop[0] + DROP_T.now ? 0.5 + 0.5 * Math.sin(frame * 0.9) : 0;

  const local = frame - SCENES.drop[0];
  const sparkIn = interpolate(local, [0, 24], [0, 1], clamp);
  const sparkX = local < DROP_T.climb ? CHART.x : local >= DROP_T.now ? CHART.x + CHART.w + 10 : chartHead(local).x;

  if (appear <= 0.001 || out >= 0.999) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: LAYOUT.hudTop,
        left: (VIDEO.width - W) / 2,
        width: W,
        height: H,
        borderRadius: H / 2,
        background: `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
        border: `1px solid ${hexA(alert > 0.05 ? COLORS.red : '#FFFFFF', alert > 0.05 ? 0.35 + alert * 0.5 : 0.14)}`,
        boxShadow: `0 18px 50px rgba(0,0,0,0.35), 0 0 ${30 * alert}px ${hexA(COLORS.red, 0.45 * alert)}`,
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        fontFamily: FONT.family,
        opacity: appear * (1 - out),
        transform: `translateY(${(1 - appear) * -16}px) scale(${0.96 + 0.04 * appear})`,
        filter: appear < 0.99 || out > 0.01 ? `blur(${(1 - appear) * 8 + out * 10}px)` : undefined,
      }}
    >
      <span style={{fontSize: 24, fontWeight: FONT.key, backgroundImage: SILVER_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        <bdi>{TICKER}</bdi>
      </span>
      <span
        style={{
          width: 150,
          textAlign: 'center',
          fontSize: 42,
          fontWeight: FONT.key,
          lineHeight: 1,
          paddingBottom: 6,
          backgroundImage: CHROME_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: `drop-shadow(0 0 ${6 + tick * 8}px ${hexA('#DCE6F5', 0.25 + tick * 0.2)})`,
        }}
      >
        {ar(price, 1)}
      </span>
      <span
        style={{
          width: 110,
          textAlign: 'center',
          fontSize: 24,
          fontWeight: FONT.key,
          color: atPeak ? COLORS.silverB : COLORS.red,
          whiteSpace: 'nowrap',
        }}
      >
        {atPeak ? 'قمة' : `▼ ${ar(Math.abs(pct))}٪`}
      </span>
      <svg width={130} height={44} style={{opacity: sparkIn}} viewBox={`${CHART.x} ${CHART.y - 20} ${CHART.w} ${CHART.h + 40}`} preserveAspectRatio="none">
        <defs>
          <clipPath id="hud-spark">
            <rect x={CHART.x - 10} y={CHART.y - 40} width={Math.max(0, sparkX - CHART.x + 10)} height={CHART.h + 80} />
          </clipPath>
        </defs>
        <path
          d={FULL_D}
          fill="none"
          stroke={atPeak ? COLORS.silverB : COLORS.red}
          strokeOpacity={0.9}
          strokeWidth={2.2}
          vectorEffect="non-scaling-stroke"
          clipPath="url(#hud-spark)"
        />
      </svg>
    </div>
  );
};
