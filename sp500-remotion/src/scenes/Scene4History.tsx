import React from 'react';
import {Easing, random, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, FONT, GOLD_GRADIENT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {toArabicDigits} from '../lib/arabic';
import {EASE, ease, springIn} from '../lib/motion';
import {useTextOnly} from '../components/Debug';
import {partialLine} from './Scene3Heartbeat';

const C = CUES.history;
const FROM = SCENES.history.from;

// Approximate S&P 500 year-end levels (illustrative shape only, plotted on a log scale).
const LEVELS: [number, number][] = [
  [1957, 40], [1959, 60], [1961, 72], [1962, 63], [1965, 92], [1966, 80], [1968, 104], [1970, 92],
  [1972, 118], [1974, 69], [1976, 107], [1978, 96], [1980, 136], [1982, 141], [1985, 211], [1987, 247],
  [1989, 353], [1990, 330], [1993, 466], [1995, 616], [1997, 970], [1999, 1469], [2000, 1320], [2002, 880],
  [2004, 1212], [2007, 1468], [2008, 903], [2010, 1258], [2013, 1848], [2015, 2044], [2018, 2507],
  [2019, 3231], [2020, 3756], [2021, 4766], [2022, 3840], [2023, 4770], [2024, 5882], [2026, 6700],
];
const Y0 = 1957;
const Y1 = 2026;
const DIPS = [1974, 2002, 2008, 2022];

// Chart box. Time runs right (1957) to left (today).
const BOX = {right: 950, left: 130, top: 780, base: 1250};
const xOf = (year: number) => BOX.right - ((year - Y0) / (Y1 - Y0)) * (BOX.right - BOX.left);
const lmin = Math.log10(35);
const lmax = Math.log10(7200);
const yOf = (level: number) => BOX.base - ((Math.log10(level) - lmin) / (lmax - lmin)) * (BOX.base - BOX.top);

const levelAt = (year: number) => {
  for (let k = 1; k < LEVELS.length; k++) {
    const [ya, la] = LEVELS[k - 1];
    const [yb, lb] = LEVELS[k];
    if (year <= yb) {
      const t = (year - ya) / (yb - ya);
      const s = t * t * (3 - 2 * t); // smooth between anchors
      return Math.pow(10, Math.log10(la) + (Math.log10(lb) - Math.log10(la)) * s);
    }
  }
  return LEVELS[LEVELS.length - 1][1];
};

// quarterly points with a little texture so the line feels organic, not a straight line
const POINTS = (() => {
  const pts: {x: number; y: number; year: number}[] = [];
  for (let q = 0; q <= (Y1 - Y0) * 4; q++) {
    const year = Y0 + q / 4;
    const noise = q === 0 || q === (Y1 - Y0) * 4 ? 0 : (random(`h${q}`) - 0.5) * 0.035;
    pts.push({x: xOf(year), y: yOf(levelAt(year) * (1 + noise)), year});
  }
  return pts;
})();

const toPath = (pts: {x: number; y: number}[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

/** 0:15-0:23 — 1957 to today, right to left: a long-term growth curve with dips, then ≈ ١٠٪. */
export const Scene4History: React.FC = () => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();

  const axis = ease(frame, [C.axisIn, C.axisIn + 22], [0, 1], EASE.inOut);
  const p = ease(frame, [C.curveStart, C.curveEnd], [0, 1], Easing.bezier(0.45, 0, 0.25, 1));
  const {points, head} = partialLine(POINTS, p);
  const headYear = Math.round(Y0 + (BOX.right - head.x) / (BOX.right - BOX.left) * (Y1 - Y0));

  const out = ease(frame, [C.exit, C.exit + 16], [0, 1], EASE.in);
  const chartGlow = 0.5 + 0.5 * Math.sin(frame / 9);

  // big year ticker at the top while the curve draws, then the ≈ ١٠٪ counter replaces it
  const yearIn = ease(frame, [C.axisIn + 4, C.axisIn + 16], [0, 1]);
  const yearPop = springIn(frame, C.axisIn + 4, {damping: 12, stiffness: 140});
  const yearOut = ease(frame, [C.counter - 8, C.counter + 4], [0, 1], EASE.in);
  const counterP = springIn(frame, C.counter, {damping: 12, stiffness: 130, mass: 0.8});
  const counterVal = Math.round(ease(frame, [C.counter, C.counterLand], [0, TEXT.history.counterValue], Easing.out(Easing.cubic)));
  const landPop = frame >= C.counterLand ? 1 + 0.1 * Math.exp(-(frame - C.counterLand) / 5) * Math.cos((frame - C.counterLand) * 0.6) : 1;
  const counterShine = ease(frame, [C.counterShine, C.counterShine + 22], [0, 1], EASE.inOut);

  const labelIn = (start: number) => ease(frame, [start, start + 14], [0, 1]);

  return (
    <SceneFrame from={FROM} range={[FROM, FROM + SCENES.history.duration]}>
      {!textOnly ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
          <defs>
            <linearGradient id="histArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* faint guides */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={BOX.right}
              x2={BOX.right - (BOX.right - BOX.left) * axis}
              y1={BOX.base - (BOX.base - BOX.top) * t}
              y2={BOX.base - (BOX.base - BOX.top) * t}
              stroke={COLORS.gold}
              strokeOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 10"
            />
          ))}
          {/* time axis, drawn right to left */}
          <line x1={BOX.right} x2={BOX.right - (BOX.right - BOX.left) * axis} y1={BOX.base + 30} y2={BOX.base + 30} stroke={COLORS.gold} strokeOpacity={0.6} strokeWidth={3} />
          {[1957, 1970, 1980, 1990, 2000, 2010, 2020, 2026].map((yr) => (
            <line key={yr} x1={xOf(yr)} x2={xOf(yr)} y1={BOX.base + 22} y2={BOX.base + 38} stroke={COLORS.goldLight} strokeWidth={3} opacity={axis >= (BOX.right - xOf(yr)) / (BOX.right - BOX.left) ? 0.8 : 0} />
          ))}
          {p > 0 ? (
            <>
              <path d={`${toPath(points)} L${head.x},${BOX.base + 30} L${points[0].x},${BOX.base + 30} Z`} fill="url(#histArea)" />
              <path d={toPath(points)} fill="none" stroke={COLORS.gold} strokeOpacity={0.22 + chartGlow * 0.08} strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
              <path d={toPath(points)} fill="none" stroke={COLORS.goldLight} strokeWidth={5.5} strokeLinejoin="round" strokeLinecap="round" />
              {/* a ring pings at each dip as the head passes it */}
              {DIPS.map((yr) => {
                const passT = (BOX.right - xOf(yr)) / (BOX.right - BOX.left);
                const headT = (BOX.right - head.x) / (BOX.right - BOX.left);
                if (headT < passT) return null;
                const age = Math.min(1, (headT - passT) * 9);
                const cx = xOf(yr);
                const cy = yOf(levelAt(yr));
                return (
                  <g key={yr}>
                    <circle cx={cx} cy={cy} r={8 + age * 34} fill="none" stroke={COLORS.goldLight} strokeWidth={2.5} opacity={(1 - age) * 0.8} />
                    <circle cx={cx} cy={cy} r={6} fill={COLORS.goldLight} opacity={0.85} />
                  </g>
                );
              })}
              <circle cx={head.x} cy={head.y} r={28} fill={COLORS.gold} opacity={0.25 * (1 - ease(frame, [C.curveEnd, C.curveEnd + 20], [0, 0.6]))} />
              <circle cx={head.x} cy={head.y} r={10} fill="#FFF6D8" />
            </>
          ) : null}
        </svg>
      ) : null}

      {/* axis labels: ١٩٥٧ on the right, today on the left */}
      <AxisLabel text={TEXT.history.startYear} x={BOX.right} y={BOX.base + 82} opacity={labelIn(C.axisIn + 6) * (1 - out)} align="right" />
      <AxisLabel text={toArabicDigits(1980)} x={xOf(1980)} y={BOX.base + 82} opacity={labelIn(C.axisIn + 12) * (1 - out) * 0.55} small />
      <AxisLabel text={toArabicDigits(2000)} x={xOf(2000)} y={BOX.base + 82} opacity={labelIn(C.axisIn + 16) * (1 - out) * 0.55} small />
      <AxisLabel text={TEXT.history.endLabel} x={BOX.left} y={BOX.base + 82} opacity={labelIn(C.axisIn + 20) * (1 - out)} align="left" />

      {/* year ticker */}
      <BigGold y={430} size={150} opacity={yearIn * (1 - yearOut)} blur={yearOut * 16 + (1 - yearIn) * 10} scale={0.8 + 0.2 * yearPop}>
        {toArabicDigits(Math.max(Y0, Math.min(Y1, headYear)))}
      </BigGold>

      {/* ≈ ١٠٪ */}
      <BigGold y={420} size={200} opacity={Math.min(1, counterP * 1.5) * (1 - out)} blur={(1 - Math.min(1, counterP)) * 14 + out * 16} scale={(0.7 + 0.3 * counterP) * landPop} shine={counterShine}>
        {`${TEXT.history.counterPrefix} ${toArabicDigits(counterVal)}٪`}
      </BigGold>

      <AnimatedText {...TEXT.history.label} enter={C.label} exit={C.exit} size={54} y={575} anchor="top" variant="rise" stagger={3} />
      <AnimatedText text={TEXT.history.footnote} enter={C.footnote} exit={C.exit} size={30} y={1475} anchor="center" variant="rise" weight={FONT.weightRegular} opacity={0.5} stagger={2} />
    </SceneFrame>
  );
};

const AxisLabel: React.FC<{text: string; x: number; y: number; opacity: number; align?: 'left' | 'right'; small?: boolean}> = ({
  text,
  x,
  y,
  opacity,
  align,
  small,
}) => (
  <div
    style={{
      position: 'absolute',
      top: y,
      left: x,
      transform: `translate(${align === 'right' ? '-100%' : align === 'left' ? '0' : '-50%'}, -50%) translateY(${(1 - opacity) * 14}px)`,
      fontFamily,
      fontWeight: small ? FONT.weightRegular : FONT.weightBold,
      fontSize: small ? 32 : 46,
      color: small ? COLORS.textMuted : COLORS.goldLight,
      direction: 'rtl',
      whiteSpace: 'nowrap',
      opacity,
    }}
  >
    {text}
  </div>
);

const BigGold: React.FC<{y: number; size: number; opacity: number; blur: number; scale: number; shine?: number; children: React.ReactNode}> = ({
  y,
  size,
  opacity,
  blur,
  scale,
  shine = 0,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      transform: `translateY(-50%) scale(${scale})`,
      textAlign: 'center',
      direction: 'rtl',
      fontFamily,
      fontWeight: FONT.weightBlack,
      fontSize: size,
      lineHeight: 1.1,
      opacity,
      filter: `drop-shadow(0 0 ${size * 0.18}px rgba(212,175,55,0.45)) blur(${blur}px)`,
    }}
  >
    <span
      style={{
        backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,252,236,0.95) 50%, rgba(255,255,255,0) 60%), ${GOLD_GRADIENT}`,
        backgroundSize: '250% 100%, 100% 100%',
        backgroundPosition: `${shine * 100}% 0, 0 0`,
        backgroundRepeat: 'no-repeat',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: COLORS.gold,
        padding: '0 0.08em',
      }}
    >
      {children}
    </span>
  </div>
);
