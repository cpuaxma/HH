import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FONT, VIDEO} from '../brand';
import {Background} from '../components/Background';
import {Headline, HeadlineItem} from '../components/Headline';
import {Persistent} from '../components/Persistent';
import {IntroSfx, SfxTrack} from '../components/SfxTrack';
import {Shot} from '../components/Shot';
import {DEFAULT_EDITION, EDITIONS} from '../edition';
import {V3Chapter, V3Collapse, V3Holiday, V3Intro, V3Jobs, V3Outro, V3Price, V3Seesaw, V3Week, V3Wednesday} from '../scenes/V3';
import {CAPTIONS, INTRO, MAIN_LENGTH, PERSISTENT_OUT, SHOTS} from '../timeline';

export type WeekAheadProps = {
  edition: string;
  /** false = overlay-only pass (transparent background) for the ProRes 4444 export. */
  showBackground: boolean;
  /** false = no audio (stills, overlay). */
  withAudio: boolean;
};

/**
 * The Week Ahead reel (v3 design: monochrome blue + gold, headline-led, one right edge).
 * 0–3s intro hook, then the template's shots (timeline.ts, relative to the end of the intro).
 */
export const WeekAhead: React.FC<WeekAheadProps> = ({edition, showBackground, withAudio}) => {
  const e = EDITIONS[edition] ?? EDITIONS[DEFAULT_EDITION];
  const headlines: HeadlineItem[] = CAPTIONS.filter((c) => e.captions[c.key]).map((c) => ({...c, ...e.captions[c.key]}));
  const introHeadline: HeadlineItem[] = [{key: 'intro', from: 8, to: INTRO - 16, l1: e.intro.l1, l2: e.intro.l2, eyebrow: e.intro.eyebrow}];
  return (
    <AbsoluteFill style={{backgroundColor: showBackground ? C.bg0 : 'transparent', overflow: 'hidden', fontFamily: FONT.ar}}>
      {showBackground ? <Background outroAt={INTRO + SHOTS.s11.from} /> : null}

      {/* 0–3s: intro hook */}
      <Shot id="intro" from={0} to={INTRO} enter="cut" exit="rise">
        <V3Intro e={e} />
      </Shot>
      <Headline items={introHeadline} />

      {/* 3–42s: the template's shots */}
      <Sequence from={INTRO} durationInFrames={MAIN_LENGTH} name="main">
        <Shot id="s1" {...SHOTS.s1} enter="rise" exit="rise">
          <V3Price e={e} />
        </Shot>
        <Shot id="s2" {...SHOTS.s2} enter="rise" exit="rise">
          <V3Week e={e} />
        </Shot>
        <Shot id="s3" {...SHOTS.s3} enter="cut" exit="rise">
          <V3Chapter n="01" />
        </Shot>
        <Shot id="s4" {...SHOTS.s4} enter="rise" exit="rise">
          <V3Wednesday e={e} />
        </Shot>
        <Shot id="s5" {...SHOTS.s5} enter="rise" exit="rise">
          <V3Seesaw e={e} />
        </Shot>
        <Shot id="s6" {...SHOTS.s6} enter="cut" exit="rise">
          <V3Chapter n="02" />
        </Shot>
        <Shot id="s7" {...SHOTS.s7} enter="rise" exit="rise">
          <V3Holiday e={e} />
        </Shot>
        <Shot id="s8" {...SHOTS.s8} enter="cut" exit="rise">
          <V3Chapter n="03" />
        </Shot>
        <Shot id="s9" {...SHOTS.s9} enter="rise" exit="squash">
          <V3Jobs e={e} />
        </Shot>
        <Shot id="s10" {...SHOTS.s10} enter="cut" exit="fade" push={0}>
          <V3Collapse />
        </Shot>
        <Sequence from={SHOTS.s11.from} name="s11">
          <V3Outro e={e} />
        </Sequence>

        <Headline items={headlines} />
        {withAudio ? <SfxTrack captions={e.captions} durationInFrames={VIDEO.durationInFrames} withMusic={false} /> : null}
      </Sequence>

      <Persistent edition={e} inAt={0} outAt={INTRO + PERSISTENT_OUT} />

      {withAudio ? <IntroSfx /> : null}
      {withAudio ? <SfxTrack captions={e.captions} durationInFrames={VIDEO.durationInFrames} withMusic sfx={false} /> : null}
    </AbsoluteFill>
  );
};
