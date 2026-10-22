import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, Sequence, staticFile} from 'remotion';
import {BackgroundGlow} from './components/BackgroundGlow';
import {Grain} from './components/Grain';
import {Accounts, Disclaimer, Wordmark} from './components/Persistent';
import {SplitScreen} from './components/SplitScreen';
import {useFonts} from './fonts';
import {Lang} from './i18n';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Entry} from './scenes/Scene2Entry';
import {Scene3Drop} from './scenes/Scene3Drop';
import {Scene4Panic} from './scenes/Scene4Panic';
import {Scene5Turn} from './scenes/Scene5Turn';
import {EndLockup, Scene6Result} from './scenes/Scene6Result';
import {Scene7Cta} from './scenes/Scene7Cta';
import {colors, DURATION} from './theme';
import {BEAT, range, SCENES} from './timeline';

export type TwoTradersProps = {lang: Lang};

// Optional audio: only added when the files exist in /public/audio
const OptionalAudio: React.FC<{lang: Lang}> = ({lang}) => {
  const files = getStaticFiles().map((f) => f.name);
  const has = (n: string) => files.includes(n);
  return (
    <>
      {has('audio/music.mp3') && <Audio src={staticFile('audio/music.mp3')} volume={0.55} />}
      {has('audio/sfx-bass.mp3') && (
        <Sequence from={BEAT.turnToScreens - 2}>
          <Audio src={staticFile('audio/sfx-bass.mp3')} />
        </Sequence>
      )}
      {has(`audio/vo-${lang}.mp3`) && <Audio src={staticFile(`audio/vo-${lang}.mp3`)} />}
    </>
  );
};

export const TwoTraders: React.FC<TwoTradersProps> = ({lang}) => {
  useFonts();
  const lockupFrom = BEAT.flare - 20;
  return (
    <AbsoluteFill style={{backgroundColor: colors.base}}>
      <BackgroundGlow />
      {/* Ray and Sam live in one persistent split screen so they are never redrawn per scene */}
      <SplitScreen lang={lang} />
      <Accounts lang={lang} />
      <Sequence name="1 Hook" {...range(SCENES.hook)}>
        <Scene1Hook lang={lang} />
      </Sequence>
      <Sequence name="2 Entry" {...range(SCENES.entry)}>
        <Scene2Entry lang={lang} />
      </Sequence>
      <Sequence name="3 Drop" {...range(SCENES.drop)}>
        <Scene3Drop lang={lang} />
      </Sequence>
      <Sequence name="4 Panic" {...range(SCENES.panic)}>
        <Scene4Panic lang={lang} />
      </Sequence>
      <Sequence name="5 Turn" {...range(SCENES.turn)}>
        <Scene5Turn lang={lang} />
      </Sequence>
      <Sequence name="6 Result" {...range(SCENES.result)}>
        <Scene6Result lang={lang} />
      </Sequence>
      <Sequence name="Lockup" from={lockupFrom} durationInFrames={DURATION - lockupFrom}>
        <EndLockup lang={lang} from={lockupFrom} />
      </Sequence>
      <Sequence name="7 CTA" {...range(SCENES.cta)}>
        <Scene7Cta lang={lang} />
      </Sequence>
      <Sequence name="Disclaimer" from={BEAT.disclaimer} durationInFrames={DURATION - BEAT.disclaimer}>
        <Disclaimer lang={lang} from={BEAT.disclaimer} />
      </Sequence>
      <Wordmark />
      <Grain opacity={0.04} />
      <OptionalAudio lang={lang} />
    </AbsoluteFill>
  );
};
