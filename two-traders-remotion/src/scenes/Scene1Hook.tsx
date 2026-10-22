import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {exitProgress, smoothSpring} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {LightStreak} from '../components/LightStreak';
import {SideTag} from '../components/SideTag';
import {priceAt} from '../data/price';
import {COPY, Lang} from '../i18n';
import {colors, ease, layout} from '../theme';
import {SCENES} from '../timeline';
import {POS} from './positions';

const FROM = SCENES.hook[0];
const l = (abs: number) => abs - FROM;

// Full-width gold strip across the top of both panels: the spike
const strip = (() => {
  const pts: string[] = [];
  for (let t = 0; t <= 21; t += 0.25) {
    const x = 80 + (t / 21) * 840;
    const y = 590 - (priceAt(t) - 0.3) * 330;
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
})();

export const Scene1Hook: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];
  const ar = lang === 'ar';
  const draw = interpolate(frame, [l(10), l(70)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.sweep});
  const out = exitProgress(frame, l(276), 20);
  const spike = interpolate(frame, [l(55), l(62), l(95)], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tipX = 80 + (19 / 21) * 840;
  const tipY = 590 - (priceAt(19) - 0.3) * 330;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: `blur(${out * 8}px)`, transform: `translateY(${out * 40}px)`}}>
        <LightStreak id="hookStrip" d={strip} progress={draw} width={5} />
        <circle cx={tipX} cy={tipY} r={40 + spike * 80} fill={colors.goldTo} opacity={spike * 0.35} style={{filter: 'blur(18px)'}} />
        <circle cx={tipX} cy={tipY} r={6 + spike * 6} fill="#fff" opacity={spike} />
      </svg>
      <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: ar ? 166 : 176}}>
        <AnimatedText lang={lang} lines={c.headline} start={l(8)} exit={l(272)} fontSize={ar ? 54 : 58} />
      </div>
      <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: ar ? 344 : 338}}>
        <AnimatedText lang={lang} lines={c.caption} start={l(143)} exit={l(278)} fontSize={ar ? 30 : 29} color="rgba(245,241,232,0.85)" />
      </div>
      <SideTag lang={lang} kind="coin" lines={[c.nameRay]} start={l(150)} exit={l(276)} x={POS.rayX} weight={600} color={colors.text} />
      <SideTag lang={lang} kind="coin" lines={[c.nameSam]} start={l(158)} exit={l(280)} x={POS.samX} weight={600} color={colors.text} />
      <div style={{position: 'absolute', inset: 0, opacity: smoothSpring(frame, l(55), 8) * (1 - smoothSpring(frame, l(64), 30)) * 0.12, background: colors.goldTo}} />
    </>
  );
};
