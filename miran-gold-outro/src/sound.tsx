// The outro's sound design: four soft, synthesised effects (original, no library samples),
// shared with the gold tensions reel (../miran-gold-tensions/scripts/make-sfx.py).
// Cues come from the same T timings as the visuals, so retiming a beat moves its sound too.
import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {T} from './theme';

/** Overall level of the effects (0–1). Set to 0 for a silent outro. */
export const SFX_MASTER = 0.9;

type Cue = {at: number; sfx: string; volume: number; hit?: number};

// `hit` is how far into the file (seconds) its main transient lands, so it lines up with the picture.
const CUES: Cue[] = [
  {at: T.wipe + 7, sfx: 'wipe', volume: 0.55, hit: 0.38},
  {at: T.logo + 10, sfx: 'logo', volume: 0.7, hit: 0.35},
  {at: T.button + 6, sfx: 'pill', volume: 0.4},
  {at: T.shine, sfx: 'sparkle', volume: 0.38},
];

export const SoundTrack: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <>
      {CUES.map((c, i) => {
        const start = c.at - Math.round((c.hit ?? 0) * fps);
        const from = Math.max(0, start);
        const trim = from - start; // frames of the file that fall before frame 0
        return (
          <Sequence key={i} from={from} layout="none" name={`sfx ${c.sfx}`}>
            <Audio
              src={staticFile(`sfx/${c.sfx}.wav`)}
              trimBefore={trim || undefined}
              // Fades with the picture so tails never cut off abruptly.
              volume={(f) =>
                SFX_MASTER * c.volume * interpolate(from + f, [T.fadeOut, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
              }
            />
          </Sequence>
        );
      })}
    </>
  );
};
