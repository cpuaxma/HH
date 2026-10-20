import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {enterProgress, heroEntrance, smoothSpring, visualExit} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {GoldBar} from '../components/GoldBar';
import {MotionTrail} from '../components/MotionTrail';
import {Lang, strings} from '../i18n';
import {colors, ease, fonts, HEIGHT, layout, WIDTH} from '../theme';

const BAR = {x: 540, y: 1200, width: 360};
// Illustrative prices only
const PRICE_FROM = 4110.0;
const PRICE_TO = 4218.6;

const T = {
  bar: 0,
  text: 10,
  arrows: 40,
  arrowStagger: 10,
  arrowFlight: 26,
  ticker: 70,
  roll: 80,
  rollDuration: 90,
  up: 170,
  textOut: 250,
  arrowsOut: 255,
  out: 270,
};

// Directions (deg, screen space) the arrows come from; none from straight above,
// where the ticker sits
const ARROW_ANGLES = [180, 0, 155, 25, 205, 335, 128, 52];
const STOP_R = 270;
const ARROW_LEN = 110;

const arrowLanding = (i: number) => T.arrows + i * T.arrowStagger + T.arrowFlight * 0.55;

const Arrows: React.FC = () => {
  const frame = useCurrentFrame();
  const out = visualExit(frame, T.arrowsOut, 25);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', opacity: out.opacity, filter: `blur(${out.blur}px)`}}>
      <defs>
        <linearGradient id="s4-arrow" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={-ARROW_LEN} y2={0}>
          <stop offset="0" stopColor={colors.goldTo} />
          <stop offset="1" stopColor={colors.goldFrom} stopOpacity={0} />
        </linearGradient>
      </defs>
      {ARROW_ANGLES.map((deg, i) => {
        const start = T.arrows + i * T.arrowStagger;
        const p = enterProgress(frame, start, T.arrowFlight);
        if (p <= 0) return null;
        const r = interpolate(p, [0, 1], [1100, STOP_R]);
        const a = (deg * Math.PI) / 180;
        const tipX = BAR.x + Math.cos(a) * r;
        const tipY = BAR.y + Math.sin(a) * r * 0.82;
        const rotation = deg + 180;
        return (
          <g key={i} transform={`translate(${tipX} ${tipY}) rotate(${rotation})`} opacity={Math.min(1, p * 3)}>
            <line x1={-ARROW_LEN} y1={0} x2={-4} y2={0} stroke="url(#s4-arrow)" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M -16 -9 L 0 0 L -16 9" fill="none" stroke={colors.goldTo} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

const BarLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const e = heroEntrance(frame, T.bar);
  const out = visualExit(frame, T.out, 36);
  // Brief flare each time an arrow lands
  const flare = ARROW_ANGLES.reduce((acc, _, i) => {
    const d = frame - arrowLanding(i);
    return d < 0 || d > 20 ? acc : Math.max(acc, 1 - d / 20);
  }, 0);
  const h = (BAR.width * 230) / 400;
  return (
    <div
      style={{
        position: 'absolute',
        left: BAR.x - BAR.width / 2,
        top: BAR.y - h * 0.52,
        transform: `${e.transform} scale(${out.scale + flare * 0.015})`,
        opacity: e.opacity * out.opacity,
        filter: `blur(${e.blur + out.blur}px)`,
      }}
    >
      <GoldBar id="s4-bar" width={BAR.width} sweepStart={60} sweepEvery={90} glow={1 + flare * 1.2} />
    </div>
  );
};

const DIGIT_H = 80;

const DigitColumn: React.FC<{pos: number}> = ({pos}) => (
  <span style={{display: 'inline-block', height: DIGIT_H, overflow: 'hidden', verticalAlign: 'top'}}>
    <span style={{display: 'block', transform: `translateY(${-pos * DIGIT_H}px)`}}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
        <span key={i} style={{display: 'block', height: DIGIT_H, lineHeight: `${DIGIT_H}px`}}>
          {d}
        </span>
      ))}
    </span>
  </span>
);

const Ticker: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];
  const appear = smoothSpring(frame, T.ticker);
  const out = visualExit(frame, T.out, 30);
  const t = interpolate(frame, [T.roll, T.roll + T.rollDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.enter,
  });
  const cents = (PRICE_FROM + (PRICE_TO - PRICE_FROM) * t) * 100;

  // Odometer: the lowest place spins continuously, each higher place rolls over
  // during the last 15% of the place below it.
  const columnPos = (k: number) => {
    const q = cents / 10 ** k;
    if (k === 0) return q % 10;
    const base = Math.floor(q);
    const lower = (cents / 10 ** (k - 1)) % 10;
    const roll = interpolate(lower, [8.5, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
    return (base % 10) + roll;
  };

  // $ 2 , 4 1 8 . 6 0 → places 5 4 3 2 1 0
  const places = [5, 4, 3, 2, 1, 0];
  const up = smoothSpring(frame, T.up);
  const pct = (((PRICE_TO - PRICE_FROM) / PRICE_FROM) * 100).toFixed(1);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: WIDTH,
        top: 860,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: appear * out.opacity,
        filter: `blur(${(1 - appear) * 8 + out.blur}px)`,
        transform: `translateY(${(1 - appear) * 18}px)`,
      }}
    >
      <div
        dir="ltr"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: 68,
          color: colors.text,
          fontVariantNumeric: 'tabular-nums',
          height: DIGIT_H,
          lineHeight: `${DIGIT_H}px`,
        }}
      >
        <span style={{color: colors.goldTo, marginRight: 6}}>$</span>
        <DigitColumn pos={columnPos(places[0])} />
        <span>,</span>
        <DigitColumn pos={columnPos(places[1])} />
        <DigitColumn pos={columnPos(places[2])} />
        <DigitColumn pos={columnPos(places[3])} />
        <span>.</span>
        <DigitColumn pos={columnPos(places[4])} />
        <DigitColumn pos={columnPos(places[5])} />
        <span
          style={{
            marginLeft: 22,
            fontSize: 30,
            color: colors.green,
            alignSelf: 'center',
            opacity: up,
            transform: `translateY(${(1 - up) * 12}px) scale(${0.6 + up * 0.4})`,
            display: 'inline-block',
            lineHeight: 1,
          }}
        >
          ▲ {pct}%
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: lang === 'ar' ? fonts.ar : fonts.en,
          fontWeight: 300,
          fontSize: 22,
          letterSpacing: lang === 'ar' ? 0 : '0.12em',
          textTransform: lang === 'ar' ? 'none' : 'uppercase',
          color: colors.muted,
        }}
      >
        {s.illustrative}
      </div>
    </div>
  );
};

export const Scene4Buyers: React.FC<{lang: Lang}> = ({lang}) => {
  const s = strings[lang];
  return (
    <AbsoluteFill>
      <MotionTrail from={T.arrows} to={T.arrows + ARROW_ANGLES.length * T.arrowStagger + T.arrowFlight}>
        <Arrows />
      </MotionTrail>
      <MotionTrail from={T.bar} to={T.bar + 34}>
        <BarLayer />
      </MotionTrail>
      <Ticker lang={lang} />
      <AnimatedText
        lang={lang}
        lines={s.buyers}
        start={T.text}
        exit={T.textOut}
        fontSize={lang === 'ar' ? 80 : 80}
        style={{top: layout.headlineY - 20}}
      />
    </AbsoluteFill>
  );
};
