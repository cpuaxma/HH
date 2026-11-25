import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {FONT, LANES, LAYOUT, WORD} from '../brand';
import {CAPTIONS, CaptionCue} from '../captions';
import {ArabicWordReveal, GOLD_FILL, tokenize} from './ArabicWordReveal';

const Cue: React.FC<{cue: CaptionCue}> = ({cue}) => {
  const frame = useCurrentFrame();
  const dur = cue.to - cue.from;
  const l2Start = cue.l2Delay ?? tokenize(cue.l1).length * WORD.stagger + 6;
  const accent = !cue.accent || cue.accent === 'gold' ? GOLD_FILL : {color: LANES[cue.accent].color};
  // a hair of drift so a held caption never freezes
  const drift = -frame * 0.04;
  return (
    <div style={{position: 'absolute', top: LAYOUT.captionTop, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${drift}px)`}}>
      <ArabicWordReveal text={cue.l1} start={0} end={dur} size={52} weight={FONT.arMedium} />
      <ArabicWordReveal text={cue.l2} start={l2Start} end={dur} size={62} weight={FONT.arBold} fill={accent} style={{marginTop: -2}} />
    </div>
  );
};

/** Bottom-third caption track: two lines max, word by word, on the beat. */
export const CaptionTrack: React.FC = () => (
  <>
    {CAPTIONS.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.to - c.from} name={`caption ${i + 1}`} layout="none">
        <Cue cue={c} />
      </Sequence>
    ))}
  </>
);
