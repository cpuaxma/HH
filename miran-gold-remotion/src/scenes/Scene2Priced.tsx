import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {enterProgress, exitProgress, heroEntrance, visualExit} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {DollarIcon} from '../components/DollarIcon';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {MotionTrail} from '../components/MotionTrail';
import {Lang, strings} from '../i18n';
import {colors, fonts, HEIGHT, layout, WIDTH} from '../theme';

// Shared with scene 3, which picks the $ up from exactly this spot
export const DOLLAR_POS = {x: 790, y: 1080, size: 200};
export const DOLLAR_HANDOFF = 300; // local frame where scene 3 takes over the $

const BAR = {x: 305, y: 1080, width: 330};
const LINE = {x1: 480, x2: 685, y: 1080};

const T = {
  bar: 0,
  dollar: 15,
  line: 55,
  pill: 75,
  text: 10,
  sweep: 60,
  textOut: 255,
  lineOut: 260,
  barOut: 270,
};

const BarLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const e = heroEntrance(frame, T.bar, {fromX: -260});
  const out = visualExit(frame, T.barOut, 30);
  const slide = -70 * out.q;
  const h = (BAR.width * 230) / 400;
  return (
    <div
      style={{
        position: 'absolute',
        left: BAR.x - BAR.width / 2 + slide,
        top: BAR.y - h * 0.52,
        transform: e.transform,
        opacity: e.opacity * out.opacity,
        filter: `blur(${e.blur + out.blur}px)`,
      }}
    >
      <GoldBar id="s2-bar" width={BAR.width} sweepStart={T.sweep} sweepEvery={90} />
    </div>
  );
};

const DollarLayer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= DOLLAR_HANDOFF) return null;
  const e = heroEntrance(frame, T.dollar, {fromX: 260, rotateFrom: -25});
  return (
    <div
      style={{
        position: 'absolute',
        left: DOLLAR_POS.x - DOLLAR_POS.size / 2,
        top: DOLLAR_POS.y - DOLLAR_POS.size / 2,
        transform: e.transform,
        opacity: e.opacity,
        filter: `blur(${e.blur}px)`,
      }}
    >
      <DollarIcon size={DOLLAR_POS.size} />
    </div>
  );
};

export const Scene2Priced: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];

  const lineIn = enterProgress(frame, T.line, 32);
  const lineOut = visualExit(frame, T.lineOut, 26);
  const pillIn = enterProgress(frame, T.pill, 28);
  const pillOut = exitProgress(frame, T.lineOut, 22);

  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', opacity: lineOut.opacity}}>
        <LightStreak
          id="s2-link"
          d={`M ${LINE.x1} ${LINE.y} L ${LINE.x2} ${LINE.y}`}
          progress={lineIn}
          width={2.2}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: (LINE.x1 + LINE.x2) / 2 - 100,
          width: 200,
          top: LINE.y - 26,
          height: 52,
          display: 'flex',
          justifyContent: 'center',
          opacity: pillIn * (1 - pillOut),
          filter: `blur(${(1 - pillIn) * 6 + pillOut * 8}px)`,
          transform: `translateY(${(1 - pillIn) * 14}px) scale(${interpolate(pillIn, [0, 1], [0.9, 1])})`,
        }}
      >
        <div
          dir="ltr"
          style={{
            height: 52,
            padding: '0 26px',
            borderRadius: 26,
            border: `1.5px solid ${colors.goldFrom}`,
            background: colors.bgTop,
            boxShadow: '0 0 24px rgba(212,162,76,0.25)',
            display: 'flex',
            alignItems: 'center',
            fontFamily: fonts.en,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: '0.08em',
            backgroundImage: 'none',
            color: colors.goldTo,
          }}
        >
          XAU/USD
        </div>
      </div>

      <MotionTrail from={T.bar} to={T.bar + 30}>
        <BarLayer />
      </MotionTrail>
      <MotionTrail from={T.dollar} to={T.dollar + 30}>
        <DollarLayer />
      </MotionTrail>

      <AnimatedText
        lang={lang}
        lines={s.priced}
        start={T.text}
        exit={T.textOut}
        fontSize={lang === 'ar' ? 72 : 72}
        style={{top: layout.headlineY}}
      />
    </AbsoluteFill>
  );
};
