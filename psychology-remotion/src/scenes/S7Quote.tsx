import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, CUES, FONT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {AnimatedText} from '../components/AnimatedText';
import {useTextOnly} from '../components/Debug';
import {Scrim} from '../components/Scrim';
import {EASE, ease, windowed} from '../lib/motion';

const from = SCENES.quote.from;
const c = CUES.quote;

/** 0:33-0:37.5 Everything calms: one slow gold wave and the quote. */
export const S7Quote: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + from;
  const textOnly = useTextOnly();
  const a = ease(g, [c.attribution, c.attribution + 14], [0, 1], EASE.out) * (1 - ease(g, [c.exit + 2, c.exit + 14], [0, 1], EASE.in));
  const lineW = 70 * ease(g, [c.attribution + 4, c.attribution + 20], [0, 1], EASE.inOut);
  return (
    <AbsoluteFill>
      <Scrim y={480} h={460} opacity={windowed(g, c.text1 - 4, c.text1 + 8, c.exit + 4, c.exit + 16)} />
      <AnimatedText {...TEXT.quote.line1} enter={c.text1 - from} exit={c.text1Exit - from} shineAt={c.text1 - from + 18} size={94} y={460} variant="rise" stagger={5} />
      <AnimatedText {...TEXT.quote.line2} enter={c.text2 - from} exit={c.exit - from} shineAt={c.text2 - from + 14} size={94} y={460} variant="rise" stagger={5} />
      <div
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: 655,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          direction: 'rtl',
          opacity: a,
          transform: `translateY(${(1 - a) * 16}px)`,
        }}
      >
        {textOnly ? null : <div style={{width: lineW, height: 2, background: COLORS.gold, opacity: 0.7}} />}
        <div style={{fontFamily, fontWeight: FONT.weightRegular, fontSize: 40, color: COLORS.goldLight, letterSpacing: 0}}>{TEXT.quote.attribution}</div>
        {textOnly ? null : <div style={{width: lineW, height: 2, background: COLORS.gold, opacity: 0.7}} />}
      </div>
    </AbsoluteFill>
  );
};
