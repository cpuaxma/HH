import {Audio} from '@remotion/media';
import React from 'react';
import {interpolate, Sequence, staticFile} from 'remotion';
import {AUDIO, VIDEO} from '../config';
import {hasPublicFile} from '../lib/files';

/** Music (looped, low, fades out over the last 2 s), optional voiceover, and sfx slots. Missing files are skipped. */
export const AudioLayer: React.FC = () => {
  const hasMusic = hasPublicFile(AUDIO.music);
  const hasVoice = hasPublicFile(AUDIO.voiceover);
  const musicLevel = hasVoice ? AUDIO.musicVolumeUnderVoice : AUDIO.musicVolume;
  const end = VIDEO.durationInFrames;

  return (
    <>
      {hasMusic ? (
        <Audio
          src={staticFile(AUDIO.music)}
          loop
          // "extend" keeps the volume curve on the composition timeline instead of restarting each loop
          loopVolumeCurveBehavior="extend"
          volume={(f) =>
            interpolate(f, [0, AUDIO.musicFadeInFrames, end - AUDIO.musicFadeOutFrames, end - 1], [0, musicLevel, musicLevel, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}
      {hasVoice ? <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceoverVolume} /> : null}
      {AUDIO.sfx.map((cue, i) =>
        hasPublicFile(cue.file) ? (
          <Sequence key={i} from={cue.frame} name={`sfx ${cue.file}`} layout="none">
            <Audio src={staticFile(cue.file)} volume={cue.volume} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
