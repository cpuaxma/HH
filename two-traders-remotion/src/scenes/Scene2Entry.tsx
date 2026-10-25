import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {exitProgress, popSpring, smoothSpring} from '../anim';
import {LotBadge} from '../components/Badges';
import {SideTag} from '../components/SideTag';
import {SpeechBubble} from '../components/SpeechBubble';
import {TradeCard} from '../components/TradeCard';
import {EVENTS, levelValue} from '../data/price';
import {COPY, Lang} from '../i18n';
import {colors, fonts, layout} from '../theme';
import {BEAT, BUBBLES, SCENES} from '../timeline';
import {POS} from './positions';

const FROM = SCENES.entry[0];
const l = (abs: number) => abs - FROM;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// The big BUY button Ray slams, with a red flash over his panel
const BuyButton: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = l(BEAT.slamImpact - 18);
  if (frame < t0) return null;
  const pop = popSpring(frame, t0);
  const press = interpolate(frame, [l(BEAT.slamImpact - 2), l(BEAT.slamImpact), l(BEAT.slamImpact + 8)], [0, 1, 0.3], clamp);
  const q = exitProgress(frame, l(BEAT.slamImpact + 40), 14);
  if (q >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 300,
        top: 1150,
        transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * pop) * (1 - 0.1 * press) * (1 - 0.2 * q)})`,
        opacity: Math.min(1, pop * 2) * (1 - q),
        filter: q > 0 ? `blur(${q * 8}px)` : undefined,
      }}
    >
      <bdi
        dir="ltr"
        style={{
          display: 'block',
          padding: '18px 54px',
          borderRadius: 22,
          background: `linear-gradient(180deg, #4CCB98, ${colors.green})`,
          boxShadow: `0 ${10 - press * 8}px 0 #1E6E4F, 0 0 ${30 + press * 40}px rgba(217,83,79,${0.3 + press * 0.5})`,
          transform: `translateY(${press * 8}px)`,
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: 50,
          letterSpacing: '0.06em',
          color: '#fff',
        }}
      >
        BUY
      </bdi>
    </div>
  );
};

const RedFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [l(BEAT.slamImpact), l(BEAT.slamImpact + 3), l(BEAT.slamImpact + 22)], [0, 0.55, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: layout.panel.top,
        width: 540,
        height: layout.panel.height,
        opacity: a,
        background: `radial-gradient(ellipse at 60% 60%, ${colors.red} 0%, rgba(217,83,79,0.35) 45%, rgba(217,83,79,0) 80%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export const Scene2Entry: React.FC<{lang: Lang}> = ({lang}) => {
  const c = COPY[lang];
  const t1 = EVENTS.trade1;
  return (
    <>
      <RedFlash />
      <SpeechBubble lang={lang} lines={c.s2RayBubble} start={l(BUBBLES.ray2[0])} exit={l(BUBBLES.ray2[1])} tipX={POS.rayTip.x} tipY={POS.rayTip.y} x={POS.rayX} accent={colors.red} />
      <BuyButton />
      <LotBadge steps={[{at: l(BEAT.slamImpact + 2), n: 10}]} start={l(BEAT.slamImpact + 2)} exit={l(880)} x={POS.rayLot.x} y={POS.rayLot.y} punch color={colors.red} size={46} />
      <SideTag lang={lang} kind="x" lines={c.s2RayTag} start={l(470)} exit={l(880)} x={POS.rayX} color={colors.red} weight={600} />

      <SpeechBubble lang={lang} lines={c.s2SamBubble} start={l(BUBBLES.sam2[0])} exit={l(BUBBLES.sam2[1])} tipX={POS.samTip.x} tipY={POS.samTip.y} x={POS.samX} accent={colors.goldFrom} />
      <LotBadge steps={[{at: l(455), n: 1}]} start={l(455)} exit={l(884)} x={POS.samLot.x} y={POS.samLot.y} color={colors.goldFrom} size={30} />
      <SideTag lang={lang} kind="check" lines={c.s2SamTag} start={l(500)} exit={l(884)} x={POS.samX} />

      <TradeCard
        lang={lang}
        labels={c.card}
        values={{entry: levelValue(t1.entry), tp: levelValue(t1.tp), sl: levelValue(t1.sl)}}
        illustrative={c.illustrative}
        start={l(BEAT.insert[0] + 10)}
        exit={l(BEAT.insert[1] - 26)}
        x={POS.samX}
        y={700}
        width={360}
        seed="card1"
      />
    </>
  );
};
