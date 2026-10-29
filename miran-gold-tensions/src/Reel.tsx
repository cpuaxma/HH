import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {BackgroundGlow, Vignette} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {Cta} from './scenes/Cta';
import {Fear} from './scenes/Fear';
import {History} from './scenes/History';
import {Hook} from './scenes/Hook';
import {Independent} from './scenes/Independent';
import {Markets} from './scenes/Markets';
import {Tip} from './scenes/Tip';
import {SoundTrack} from './sound';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, SCENES} from './theme';

const ORDER: {key: keyof typeof SCENES; C: React.FC<{dur: number}>}[] = [
  {key: 'hook', C: Hook},
  {key: 'fear', C: Fear},
  {key: 'independent', C: Independent},
  {key: 'markets', C: Markets},
  {key: 'history', C: History},
  {key: 'tip', C: Tip},
  {key: 'cta', C: Cta},
];

/** Small persistent wordmark; fades out when the CTA brings the full logo in. */
const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const ctaStart = SCENES.cta[0];
  const o = interpolate(frame, [0, 24, ctaStart, ctaStart + 20], [0, 0.7, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.inOut,
  });
  return (
    <div dir="rtl" style={{position: 'absolute', top: 104, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 28, lineHeight: 1.5, opacity: o}}>
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
    <SoundTrack />
  </AbsoluteFill>
);
