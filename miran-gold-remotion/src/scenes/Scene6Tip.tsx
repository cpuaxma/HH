import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {enterProgress, exitProgress, smoothSpring, visualExit} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {ChartLine, Pt} from '../components/ChartLine';
import {LightStreak} from '../components/LightStreak';
import {Lang, strings} from '../i18n';
import {colors, fonts, HEIGHT, WIDTH} from '../theme';

const CARD = {top: 800, height: 360, width: 370, leftX: 140, rightX: 570, radius: 24};

const DXY_LINE: Pt[] = [
  [178, 930],
  [228, 915],
  [278, 968],
  [328, 952],
  [378, 1036],
  [428, 1020],
  [478, 1106],
];
const XAU_LINE: Pt[] = [
  [602, 1106],
  [652, 1090],
  [702, 1040],
  [752, 1056],
  [802, 978],
  [852, 990],
  [902, 918],
];
const LINK = 'M 478 1106 C 478 1236, 602 1236, 602 1106';

const T = {
  leftCard: 0,
  rightCard: 8,
  lines: 40,
  link: 100,
  tag: 125,
  pill: 6,
  title: 10,
  line2a: 54,
  line2aOut: 174,
  line2b: 186,
  textOut: 295,
  out: 290,
};

const Card: React.FC<{x: number; start: number; label: string; sub: string; down: boolean; lang: Lang}> = ({
  x,
  start,
  label,
  sub,
  down,
  lang,
}) => {
  const frame = useCurrentFrame();
  const s = smoothSpring(frame, start);
  const out = visualExit(frame, T.out, 30);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        borderRadius: CARD.radius,
        background: colors.glassFill,
        border: `1px solid ${colors.glassBorder}`,
        boxShadow: '0 30px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        opacity: s * out.opacity,
        filter: `blur(${(1 - s) * 8 + out.blur}px)`,
        transform: `translateY(${(1 - s) * 40}px) scale(${interpolate(s, [0, 1], [0.94, 1]) * out.scale})`,
      }}
    >
      <div
        dir="ltr"
        style={{position: 'absolute', left: 32, top: 26, display: 'flex', alignItems: 'baseline', gap: 14}}
      >
        <span
          style={{
            fontFamily: fonts.en,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '0.04em',
            backgroundImage: `linear-gradient(180deg, ${colors.goldTo}, ${colors.goldFrom})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {label}
        </span>
        <span style={{fontFamily: fonts.en, fontSize: 20, color: down ? colors.dollar : colors.green}}>
          {down ? '▼' : '▲'}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          top: 70,
          fontFamily: lang === 'ar' ? fonts.ar : fonts.en,
          fontWeight: 300,
          fontSize: 20,
          color: colors.muted,
          textAlign: lang === 'ar' ? 'right' : 'left',
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {sub}
      </div>
    </div>
  );
};

const SUBS: Record<Lang, [string, string]> = {
  en: ['US Dollar Index', 'Gold vs US dollar'],
  ar: ['مؤشر الدولار الأمريكي', 'الذهب مقابل الدولار'],
};

export const Scene6Tip: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];
  const isAr = lang === 'ar';
  const out = visualExit(frame, T.out, 30);

  const pill = smoothSpring(frame, T.pill);
  const pillOut = exitProgress(frame, T.textOut, 18);
  const tag = smoothSpring(frame, T.tag);

  return (
    <AbsoluteFill>
      <Card x={CARD.leftX} start={T.leftCard} label="DXY" sub={SUBS[lang][0]} down lang={lang} />
      <Card x={CARD.rightX} start={T.rightCard} label="XAU/USD" sub={SUBS[lang][1]} down={false} lang={lang} />

      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', opacity: out.opacity, filter: `blur(${out.blur}px)`}}>
        <ChartLine id="s6-dxy" points={DXY_LINE} progress={enterProgress(frame, T.lines, 60)} color={colors.dollar} width={3.5} fillTo={1150} />
        <ChartLine id="s6-xau" points={XAU_LINE} progress={enterProgress(frame, T.lines + 6, 60)} color={colors.goldFrom} width={4} streak fillTo={1150} />
        <LightStreak id="s6-link" d={LINK} progress={enterProgress(frame, T.link, 34)} width={2.4} />
      </svg>

      {/* "Inverse" tag on the bottom of the link */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: WIDTH,
          top: 1184,
          display: 'flex',
          justifyContent: 'center',
          opacity: tag * out.opacity,
          transform: `scale(${interpolate(tag, [0, 1], [0.85, 1])})`,
          filter: `blur(${(1 - tag) * 6}px)`,
        }}
      >
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            padding: '8px 22px',
            borderRadius: 22,
            background: colors.bgBottom,
            border: `1px solid ${colors.goldFrom}`,
            fontFamily: isAr ? fonts.ar : fonts.en,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: isAr ? 0 : '0.14em',
            textTransform: isAr ? 'none' : 'uppercase',
            color: colors.goldTo,
            lineHeight: 1.3,
          }}
        >
          {s.inverse}
        </div>
      </div>

      {/* TIP pill */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: WIDTH,
          top: 372,
          display: 'flex',
          justifyContent: 'center',
          opacity: pill * (1 - pillOut),
          filter: `blur(${(1 - pill) * 6 + pillOut * 8}px)`,
          transform: `translateY(${(1 - pill) * 14}px)`,
        }}
      >
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            padding: '6px 22px',
            borderRadius: 20,
            background: `linear-gradient(100deg, ${colors.goldFrom}, ${colors.goldTo})`,
            color: colors.ink,
            fontFamily: isAr ? fonts.ar : fonts.en,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: isAr ? 0 : '0.2em',
            lineHeight: 1.4,
          }}
        >
          {s.tipPill}
        </div>
      </div>

      <AnimatedText lang={lang} lines={s.tipTitle} start={T.title} exit={T.textOut} fontSize={isAr ? 84 : 92} style={{top: 436}} />
      <AnimatedText
        lang={lang}
        lines={s.tipLine2a}
        start={T.line2a}
        exit={T.line2aOut}
        enterDuration={22}
        fontSize={40}
        style={{top: isAr ? 590 : 584}}
      />
      <AnimatedText
        lang={lang}
        lines={s.tipLine2b}
        start={T.line2b}
        exit={T.textOut}
        enterDuration={22}
        fontSize={40}
        style={{top: isAr ? 590 : 584}}
      />
    </AbsoluteFill>
  );
};
