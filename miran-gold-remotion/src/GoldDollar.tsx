import '@fontsource/ibm-plex-sans-arabic/arabic-300.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-300.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import '@fontsource/sora/300.css';
import '@fontsource/sora/600.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Sequence, useCurrentFrame} from 'remotion';
import {BackgroundGlow} from './components/BackgroundGlow';
import {DiagonalWipe, WIPE_DURATION, wipeClip, wipeEdge} from './components/DiagonalWipe';
import {Grain} from './components/Grain';
import {Wordmark} from './components/Wordmark';
import {Lang} from './i18n';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Priced} from './scenes/Scene2Priced';
import {Scene3World} from './scenes/Scene3World';
import {Scene4Buyers} from './scenes/Scene4Buyers';
import {Scene5Trust} from './scenes/Scene5Trust';
import {Scene6Tip} from './scenes/Scene6Tip';
import {Scene7Cta} from './scenes/Scene7Cta';

export type GoldDollarProps = {lang: Lang};

// Scene frame ranges at 60fps. Overlaps are intentional.
export const SCENES = {
  hook: [0, 180],
  priced: [170, 480],
  world: [470, 840],
  buyers: [830, 1140],
  trust: [1130, 1440],
  tip: [1430, 1740],
  cta: [1730, 1980],
} as const;

const range = ([from, to]: readonly [number, number]) => ({from, durationInFrames: to - from});

const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading local fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("300 40px 'Sora'"),
      document.fonts.load("600 40px 'Sora'"),
      document.fonts.load("300 40px 'IBM Plex Sans Arabic'", 'الذهب'),
      document.fonts.load("600 40px 'IBM Plex Sans Arabic'", 'الذهب'),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
};

export const GoldDollar: React.FC<GoldDollarProps> = ({lang}) => {
  useFonts();
  const frame = useCurrentFrame();
  const wipeStart = SCENES.cta[0];
  const wiping = frame >= wipeStart && frame <= wipeStart + WIPE_DURATION;
  const edge = wipeEdge(frame, wipeStart);

  return (
    <AbsoluteFill style={{backgroundColor: '#0A0E18'}}>
      <BackgroundGlow />

      <Sequence {...range(SCENES.hook)} name="1 Hook">
        <Scene1Hook lang={lang} />
      </Sequence>
      <Sequence {...range(SCENES.priced)} name="2 Priced in dollars">
        <Scene2Priced lang={lang} />
      </Sequence>
      <Sequence {...range(SCENES.world)} name="3 World buyers">
        <Scene3World lang={lang} />
      </Sequence>
      <Sequence {...range(SCENES.buyers)} name="4 Higher price">
        <Scene4Buyers lang={lang} />
      </Sequence>
      <Sequence {...range(SCENES.trust)} name="5 Trust">
        <Scene5Trust lang={lang} />
      </Sequence>
      <Sequence {...range(SCENES.tip)} name="6 Tip">
        <AbsoluteFill style={{clipPath: wiping ? wipeClip(edge, false) : undefined}}>
          <Scene6Tip lang={lang} />
        </AbsoluteFill>
      </Sequence>
      <Sequence {...range(SCENES.cta)} name="7 CTA">
        <AbsoluteFill style={{clipPath: wiping ? wipeClip(edge, true) : undefined}}>
          <Scene7Cta lang={lang} />
        </AbsoluteFill>
      </Sequence>

      <Wordmark fadeOutAt={wipeStart + 5} />
      <DiagonalWipe start={wipeStart} />
      <Grain />
    </AbsoluteFill>
  );
};
