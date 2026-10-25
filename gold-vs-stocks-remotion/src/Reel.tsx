import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {BackgroundGlow, Vignette} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {Crisis} from './scenes/Crisis';
import {Cta} from './scenes/Cta';
import {GoldValue} from './scenes/GoldValue';
import {Hook} from './scenes/Hook';
import {LongTerm} from './scenes/LongTerm';
import {Stocks} from './scenes/Stocks';
import {Tip} from './scenes/Tip';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, SCENES} from './theme';

const ORDER: {key: keyof typeof SCENES; C: React.FC<{dur: number}>}[] = [
  {key: 'hook', C: Hook},
  {key: 'stocks', C: Stocks},
  {key: 'gold', C: GoldValue},
  {key: 'crisis', C: Crisis},
  {key: 'longTerm', C: LongTerm},
  {key: 'tip', C: Tip},
  {key: 'cta', C: Cta},
];

/** Small persistent wordmark at the top centre. */
const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 24], [0, 0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});
  return (
    <div dir="rtl" style={{position: 'absolute', top: LAYOUT.wordmarkTop, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 28, lineHeight: 1.5, opacity: o}}>
      <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BRAND}</span>
    </div>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bgTop}}>
    <BackgroundGlow />
    {ORDER.map(({key, C}) => {
      const [from, to] = SCENES[key];
      return (
        <Sequence key={key} name={key} from={from} durationInFrames={to - from}>
          <C dur={to - from} />
        </Sequence>
      );
    })}
    <Wordmark />
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
