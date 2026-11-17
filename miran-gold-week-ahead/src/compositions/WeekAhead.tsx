import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FONT} from '../brand';
import {Background} from '../components/Background';
import {Captions} from '../components/Caption2Line';
import {ChapterNumeral} from '../components/ChapterNumeral';
import {DayStrip} from '../components/DayStrip';
import {DisclaimerOnly, Persistent} from '../components/Persistent';
import {IntroSfx, SfxTrack} from '../components/SfxTrack';
import {Shot} from '../components/Shot';
import {DEFAULT_EDITION, EDITIONS} from '../edition';
import {S1Hook, S2Stack, S4Wednesday, S5Chain} from '../scenes/Part1';
import {S10Collapse, S11Outro, S7Holiday, S9Nfp} from '../scenes/Part2';
import {INTRO, MAIN_LENGTH, OVERLAP, SHOTS} from '../timeline';
import {IntroHook} from '../scenes/Intro';
import {VIDEO} from '../brand';

export type WeekAheadProps = {
  edition: string;
  /** false = overlay-only pass (transparent background) for the ProRes 4444 export. */
  showBackground: boolean;
  /** false = no audio (stills, overlay). */
  withAudio: boolean;
};

/** The Week Ahead reel. Reads everything from editions/<id>/edition.json. */
export const WeekAhead: React.FC<WeekAheadProps> = ({edition, showBackground, withAudio}) => {
  const e = EDITIONS[edition] ?? EDITIONS[DEFAULT_EDITION];
  return (
    <AbsoluteFill style={{backgroundColor: showBackground ? C.bg0 : 'transparent', overflow: 'hidden', fontFamily: FONT.ar}}>
      {showBackground ? <Background /> : null}

      {/* 0–3s: intro hook */}
      <Sequence durationInFrames={INTRO + OVERLAP} name="intro">
        <IntroHook e={e} title={e.intro} />
      </Sequence>
      <Sequence durationInFrames={INTRO} name="intro disclaimer">
        <DisclaimerOnly text={e.disclaimer} />
      </Sequence>
      {withAudio ? <IntroSfx /> : null}
      {withAudio ? <SfxTrack captions={e.captions} durationInFrames={VIDEO.durationInFrames} withMusic sfx={false} /> : null}

      {/* 3–42s: the template's shots, shifted by the intro */}
      <Sequence from={INTRO} durationInFrames={MAIN_LENGTH} name="main">
      <Shot id="s1" {...SHOTS.s1} enter="cut" exit="fade">
        <S1Hook e={e} />
      </Shot>
      <Shot id="s2" {...SHOTS.s2} enter="zoom" exit="whip">
        <S2Stack e={e} />
      </Shot>
      <Shot id="s3" {...SHOTS.s3} enter="whip" exit="zoom">
        <ChapterNumeral n="01" impactAt={30} />
      </Shot>
      <Shot id="s4" {...SHOTS.s4} enter="cut" exit="whip">
        <S4Wednesday e={e} />
      </Shot>
      <Shot id="s5" {...SHOTS.s5} enter="whip" exit="whip">
        <S5Chain e={e} />
      </Shot>
      <Shot id="s6" {...SHOTS.s6} enter="whip" exit="zoom">
        <ChapterNumeral n="02" impactAt={30} />
      </Shot>
      <Shot id="s7" {...SHOTS.s7} enter="cut" exit="whip">
        <S7Holiday e={e} />
      </Shot>
      <Shot id="s8" {...SHOTS.s8} enter="whip" exit="zoom">
        <ChapterNumeral n="03" impactAt={30} />
      </Shot>
      <Shot id="s9" {...SHOTS.s9} enter="cut" exit="squash">
        <S9Nfp e={e} />
      </Shot>
      <Shot id="s10" {...SHOTS.s10} enter="cut" exit="cut" push={0}>
        <S10Collapse />
      </Shot>
      <Sequence from={SHOTS.s11.from} durationInFrames={SHOTS.s11.to - SHOTS.s11.from} name="s11">
        <S11Outro e={e} />
      </Sequence>

      <DayStrip edition={e} />
      <Persistent edition={e} disclaimerOn />
      <Captions captions={e.captions} />

      {withAudio ? <SfxTrack captions={e.captions} durationInFrames={VIDEO.durationInFrames} withMusic={false} /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};
