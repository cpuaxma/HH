import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {EVENTS} from '../data/price';
import {COPY, Lang} from '../i18n';
import {colors, fonts, layout} from '../theme';
import {BEAT} from '../timeline';
import {AccountBar} from './AccountBar';
import {AnimatedText} from './AnimatedText';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = Easing.inOut(Easing.cubic);

// Persistent "Miran Gold" wordmark, top centre; steps aside for the large reveal
export const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 16, BEAT.flare, BEAT.flare + 20], [0, 0.7, 0.7, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, width: 1080, top: layout.wordmark.top, height: layout.wordmark.bottom - layout.wordmark.top, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <span
        style={{
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.12em',
          backgroundImage: `linear-gradient(100deg, ${colors.goldFrom}, ${colors.goldTo})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Miran Gold
      </span>
    </div>
  );
};

const track = (f: number, keys: Array<[number, number]>) =>
  interpolate(
    f,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    {...clamp, easing: io},
  );

const rayLevel = (f: number) =>
  track(f, [
    [0, 0.72], [930, 0.72], [1010, 0.5], [1066, 0.5], [1120, 0.3], [1620, 0.26], [2100, 0.2], [2272, 0.14],
  ]);
const samLevel = (f: number) => {
  const sl = EVENTS.trade1.slHit;
  const tp = EVENTS.trade2.tpHit;
  return track(f, [
    [0, 0.72], [sl, 0.72], [sl + 30, 0.67], [tp, 0.67], [tp + 80, 0.88],
  ]);
};

// Both account meters (no amounts). Ray drains fast; Sam dips slightly then rises.
export const Accounts: React.FC<{lang: Lang}> = ({lang}) => {
  const f = useCurrentFrame();
  const c = COPY[lang];
  const o = interpolate(f, [450, 470, BEAT.flare, BEAT.flare + 30], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const rTrend = (rayLevel(f) - rayLevel(f - 12)) * 20;
  const sTrend = (samLevel(f) - samLevel(f - 12)) * 20;
  const rayColor = f < 930 ? colors.goldFrom : colors.red;
  const samColor = f < EVENTS.trade2.tpHit ? colors.goldFrom : colors.green;
  const y = 1392;
  return (
    <>
      <AccountBar lang={lang} label={c.account} illustrative={c.illustrative} level={rayLevel(f)} trend={rTrend} color={rayColor} x={110} y={y} width={360} opacity={o} />
      <AccountBar lang={lang} label={c.account} illustrative={c.illustrative} level={samLevel(f)} trend={sTrend} color={samColor} x={572} y={y} width={360} opacity={o} />
    </>
  );
};

// Disclaimer from f3000 to the end, above the bottom safe zone
export const Disclaimer: React.FC<{lang: Lang; from: number}> = ({lang, from}) => (
  <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: lang === 'ar' ? 1512 : 1526}}>
    <AnimatedText lang={lang} lines={COPY[lang].disclaimer} start={BEAT.disclaimer + 6 - from} fontSize={22} color={colors.disclaimer} />
  </div>
);
