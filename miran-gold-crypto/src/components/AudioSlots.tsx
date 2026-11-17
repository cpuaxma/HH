import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, getStaticFiles, interpolate, staticFile} from 'remotion';
import {AUDIO, TOTAL_FRAMES, sec} from '../config';

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

/**
 * Optional audio. public/voiceover.mp3 and public/ambient.mp3 play automatically when present.
 * With neither, the render carries a silent track (enforceAudioTrack in remotion.config.ts).
 */
export const AudioSlots: React.FC = () => {
  const vo = has(AUDIO.voiceover.file);
  const music = has(AUDIO.music.file);
  const {fadeIn, fadeOut} = AUDIO.music;
  const level = vo ? AUDIO.music.duckedVolume : AUDIO.music.volume;
  return (
    <>
      {music ? (
        <Audio
          src={staticFile(AUDIO.music.file)}
          loop
          volume={(f) =>
            interpolate(f, [0, sec(fadeIn), TOTAL_FRAMES - sec(fadeOut), TOTAL_FRAMES], [0, level, level, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}
      {vo ? (
        <Sequence from={sec(AUDIO.voiceover.startAt)} layout="none" name="Voiceover">
          <Audio src={staticFile(AUDIO.voiceover.file)} volume={AUDIO.voiceover.volume} />
        </Sequence>
      ) : null}
    </>
  );
};
