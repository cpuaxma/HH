import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GLIDE, GOLD_GRADIENT, LAYOUT, SAFE, SceneKey, SCENES, STATIONS, VIDEO} from './theme';
import {enter, hexA} from './motion';
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

const BOTTOM_LOGO = 96;

/**
 * Small Miran Gold logo at the bottom centre, just above the platform-UI safe zone. It stays
 * for the whole reel and fades out under the CTA's light-sweep, where the large logo takes over.
 */
const BottomLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = enter(frame, 8, 40);
  const out = interpolate(frame, [SCENES.cta[0] + 76, SCENES.cta[0] + 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: (VIDEO.width - BOTTOM_LOGO) / 2,
        top: VIDEO.height - SAFE.bottom - 24 - BOTTOM_LOGO,
        width: BOTTOM_LOGO,
        height: BOTTOM_LOGO,
        borderRadius: '50%',
        opacity: 0.9 * appear * (1 - out),
        transform: `scale(${0.85 + 0.15 * appear})`,
        filter: out > 0.01 ? `blur(${out * 8}px)` : undefined,
        boxShadow: `0 0 32px ${hexA(COLORS.goldA, 0.22)}`,
      }}
    >
      <Img src={staticFile('logo.png')} style={{width: BOTTOM_LOGO, height: BOTTOM_LOGO, borderRadius: '50%'}} />
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
    <BottomLogo />
    <Grain />
  </AbsoluteFill>
);
