import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, SAFE, SceneKey, SCENES, VIDEO} from './theme';
import {enter, hexA} from './motion';
import {BackgroundGlow, Vignette} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {EraTint, GodRays, GoldDust, TimeGates} from './components/World';
import {HeroGlow, HeroStage} from './components/HeroStage';
import {YearHud} from './components/YearHud';
import {Wipe} from './components/Wipe';
import {Layer} from './components/SceneText';
import {Dinar, Egypt, First, Hook, Lydia} from './scenes/Early';
import {Break1971, Cube, Modern, MoneyRig, Rush, Standard, Today} from './scenes/Later';
import {Cta} from './scenes/Cta';

const SCENE_COMPONENTS: Partial<Record<SceneKey, React.FC<{layer: Layer}>>> = {
  hook: Hook,
  first: First,
  egypt: Egypt,
  lydia: Lydia,
  dinar: Dinar,
  rush: Rush,
  standard: Standard,
  break1971: Break1971,
  modern: Modern,
  cube: Cube,
  today: Today,
};

/** Every scene's layer ('back' sits behind the 3D gold, 'front' in front of it). */
const SceneLayer: React.FC<{layer: Layer}> = ({layer}) => (
  <>
    {(Object.keys(SCENE_COMPONENTS) as SceneKey[]).map((k) => {
      const C = SCENE_COMPONENTS[k]!;
      return (
        <Sequence key={k} from={SCENES[k][0]} durationInFrames={SCENES[k][1] - SCENES[k][0]} name={`${k} (${layer})`}>
          <C layer={layer} />
        </Sequence>
      );
    })}
  </>
);

/** Persistent small wordmark at the top centre; it hands over to the big CTA logo. */
const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [SCENES.cta[0] + 2, SCENES.cta[0] + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  return (
    <div
      dir="rtl"
      style={{position: 'absolute', top: LAYOUT.wordmarkTop, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 28, lineHeight: 1.5, opacity: 0.7 * (1 - out)}}
    >
      <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BRAND}</span>
    </div>
  );
};

const BOTTOM_LOGO = 96;

/** Small Miran Gold logo at the bottom centre, just above the platform-UI safe zone, for the whole reel. */
const BottomLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = enter(frame, 8, 40);
  const out = interpolate(frame, [SCENES.cta[0] + 2, SCENES.cta[0] + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
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

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bgTop}}>
    <BackgroundGlow />
    <EraTint />
    <TimeGates />
    <GoldDust />
    <SceneLayer layer="back" />
    <GodRays />
    <Sequence from={0} durationInFrames={SCENES.cta[0] + 20} name="gold (3D)">
      <HeroStage />
    </Sequence>
    <HeroGlow />
    <Sequence from={SCENES.standard[0]} durationInFrames={SCENES.break1971[1] - SCENES.standard[0]} name="money rig">
      <MoneyRig />
    </Sequence>
    <SceneLayer layer="front" />
    <Sequence from={SCENES.cta[0]} durationInFrames={SCENES.cta[1] - SCENES.cta[0]} name="cta">
      <Cta />
    </Sequence>
    <Sequence from={SCENES.cta[0]} durationInFrames={24} name="light-sweep">
      <Wipe />
    </Sequence>
    <YearHud />
    <Wordmark />
    <Vignette />
    <BottomLogo />
    <Grain />
  </AbsoluteFill>
);
