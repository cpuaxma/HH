import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GLIDE, GOLD_GRADIENT, LAYOUT, SceneKey, SCENES, STATIONS} from './theme';
import {BackgroundGlow, Vignette} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {Dust, Floor} from './components/World';
import {Hud} from './components/Hud';
import {Wipe} from './components/Wipe';
import {Hook} from './scenes/Hook';
import {Drop} from './scenes/Drop';
import {Versus} from './scenes/Versus';
import {Pressure} from './scenes/Pressure';
import {Industry} from './scenes/Industry';
import {Market} from './scenes/Market';
import {Tip} from './scenes/Tip';
import {Cta} from './scenes/Cta';

/** Persistent small wordmark at the top centre; it hands over to the big CTA logo. */
const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [SCENES.cta[0] + 60, SCENES.cta[0] + 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
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

/** Visuals stay mounted until the camera has glided on to the next station; the tip stays through the CTA pull-back. */
const visualEnd = (key: SceneKey) => {
  const i = STATIONS.indexOf(key);
  if (key === 'tip') return SCENES.cta[0] + 80;
  const next = STATIONS[i + 1];
  return next ? SCENES[next][0] + GLIDE : SCENES[key][1];
};

const Scene: React.FC<{k: SceneKey; children: React.ReactNode}> = ({k, children}) => (
  <Sequence from={SCENES[k][0]} durationInFrames={visualEnd(k) - SCENES[k][0]} name={k}>
    {children}
  </Sequence>
);

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bgTop}}>
    <BackgroundGlow />
    <Dust />
    <Floor />
    <Scene k="hook">
      <Hook />
    </Scene>
    <Scene k="drop">
      <Drop />
    </Scene>
    <Scene k="versus">
      <Versus />
    </Scene>
    <Scene k="pressure">
      <Pressure />
    </Scene>
    <Scene k="industry">
      <Industry />
    </Scene>
    <Scene k="market">
      <Market />
    </Scene>
    <Scene k="tip">
      <Tip />
    </Scene>
    <Sequence from={SCENES.cta[0]} durationInFrames={SCENES.cta[1] - SCENES.cta[0]} name="cta">
      <Cta />
    </Sequence>
    <Sequence from={SCENES.cta[0] + 74} durationInFrames={24} name="light-sweep">
      <Wipe />
    </Sequence>
    <Hud />
    <Wordmark />
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
