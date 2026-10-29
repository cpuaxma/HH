import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {BRAND} from './strings';
import {CHAIN, COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, SCENES} from './theme';
import {BackgroundGlow, Vignette} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {Chain} from './components/Chain';
import {Hook} from './scenes/Hook';
import {Drop} from './scenes/Drop';
import {Oil} from './scenes/Oil';
import {Inflation} from './scenes/Inflation';
import {Dollar} from './scenes/Dollar';
import {Panic} from './scenes/Panic';
import {Tip} from './scenes/Tip';
import {Cta} from './scenes/Cta';
import {Wipe} from './components/Wipe';

const Scene: React.FC<{range: readonly [number, number]; children: React.ReactNode; name: string}> = ({range, children, name}) => (
  <Sequence from={range[0]} durationInFrames={range[1] - range[0]} name={name}>
    {children}
  </Sequence>
);

/** Persistent small wordmark at the top centre; it hands over to the big CTA logo. */
const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [SCENES.cta[0] + 4, SCENES.cta[0] + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: LAYOUT.wordmarkTop,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT.family,
        fontWeight: FONT.key,
        fontSize: 28,
        lineHeight: 1.5,
        opacity: 0.7 * (1 - out),
      }}
    >
      <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BRAND}</span>
    </div>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bgTop}}>
    <BackgroundGlow />
    <Scene range={SCENES.hook} name="1 Hook">
      <Hook />
    </Scene>
    <Scene range={SCENES.drop} name="2 Drop">
      <Drop />
    </Scene>
    <Scene range={SCENES.oil} name="3 Oil">
      <Oil />
    </Scene>
    <Scene range={SCENES.inflation} name="4 Inflation">
      <Inflation />
    </Scene>
    <Scene range={SCENES.dollar} name="5 Dollar">
      <Dollar />
    </Scene>
    <Scene range={SCENES.panic} name="6 Panic">
      <Panic />
    </Scene>
    <Scene range={SCENES.tip} name="7 Tip">
      <Tip />
    </Scene>
    <Scene range={SCENES.cta} name="8 CTA">
      <Cta />
    </Scene>
    <Sequence from={CHAIN.start} durationInFrames={CHAIN.fadeOut[1] - CHAIN.start} name="Chain">
      <Chain />
    </Sequence>
    <Sequence from={SCENES.cta[0]} durationInFrames={24} name="Light-sweep wipe">
      <Wipe />
    </Sequence>
    <Wordmark />
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
