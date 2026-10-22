import React from 'react';
import {AnimatedText} from '../components/AnimatedText';
import {Chip} from '../components/Badges';
import {SpeechBubble} from '../components/SpeechBubble';
import {TradeCard} from '../components/TradeCard';
import {EVENTS, levelValue} from '../data/price';
import {COPY, Lang} from '../i18n';
import {colors, layout} from '../theme';
import {BEAT, BUBBLES, SCENES} from '../timeline';
import {POS} from './positions';

const FROM = SCENES.turn[0];
const l = (abs: number) => abs - FROM;

export const Scene5Turn: React.FC<{lang: Lang}> = ({lang}) => {
  const c = COPY[lang];
  const t2 = EVENTS.trade2;
  return (
    <>
      {/* the camera is pushed in on Ray's face, so his bubble sits a little higher */}
      <SpeechBubble lang={lang} lines={c.s5RayBubble} start={l(BUBBLES.ray5[0])} exit={l(BUBBLES.ray5[1])} tipX={POS.rayTip.x} tipY={600} x={POS.rayX} accent={colors.red} />
      <TradeCard
        lang={lang}
        labels={c.card}
        values={{entry: levelValue(t2.entry), tp: levelValue(t2.tp), sl: levelValue(t2.sl)}}
        illustrative={c.illustrative}
        start={l(t2.frame - 6)}
        exit={l(2950)}
        x={POS.samX}
        y={1118}
        width={330}
        scale={0.86}
        seed="card2"
      />
      <Chip lang={lang} kind="check" text={c.tpHit} start={l(BEAT.tpHit)} exit={l(2950)} x={POS.chip.x} y={POS.chip.y} />
      <div style={{position: 'absolute', left: layout.safeLeft, width: layout.safeRight - layout.safeLeft, top: lang === 'ar' ? 220 : 236}}>
        <AnimatedText lang={lang} lines={c.s5Headline} start={l(2660)} exit={l(2962)} fontSize={lang === 'ar' ? 70 : 72} />
      </div>
    </>
  );
};
