import {Audio} from '@remotion/media';
import React from 'react';
import {interpolate, Sequence, staticFile} from 'remotion';
import {SOUND_CUES} from '../sound';

// Plays every cue in sound.ts. Each effect sits in its own <Sequence> so it starts on its
// frame; the volume callback's frame counts from the start of the effect.
export const SoundTrack: React.FC = () => (
  <>
    {SOUND_CUES.map((c, i) => {
      const fadeIn = c.fadeIn ?? 0;
      const fadeOut = c.fadeOut ?? 0;
      return (
        <Sequence key={i} from={c.at} durationInFrames={c.duration} layout="none" name={`sfx · ${c.sfx}`}>
          <Audio
            src={staticFile(`sfx/${c.sfx}.wav`)}
            loop={c.loop}
            volume={(f) =>
              c.volume *
              (fadeIn ? interpolate(f, [0, fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1) *
              (fadeOut ? interpolate(f, [c.duration - fadeOut, c.duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1)
            }
          />
        </Sequence>
      );
    })}
  </>
);
