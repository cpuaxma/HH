import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {BRAND} from './strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, SceneKey, SCENES} from './theme';
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
      dir="ltr"
      style={{position: 'absolute', top: LAYOUT.wordmarkTop + 4, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.key, fontSize: 24, letterSpacing: '0.32em', textIndent: '0.32em', lineHeight: 1.5, opacity: 0.75 * (1 - out)}}
    >
      <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BRAND}</span>
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
    <Grain />
  </AbsoluteFill>
);
