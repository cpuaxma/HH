import {Audio} from '@remotion/media';
import React from 'react';
import {interpolate, Sequence, staticFile} from 'remotion';
import {AUDIO, VIDEO} from '../config';
import {BEAT_FRAMES, BPM} from '../lib/director';
import {hasPublicFile} from '../lib/files';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Extra ducking: the peak goes nearly silent, the bottom goes quiet. */
const duckAt = (f: number) => {
  let k = 1;
  for (const d of AUDIO.musicDucks) {
    const v = interpolate(f, [d.from - d.ramp, d.from, d.to, d.to + d.ramp], [1, d.level, d.level, 1], clamp);
    k = Math.min(k, v);
  }
  return k;
};

/**
 * Music (looped; ducks under the voiceover, at the summit and at the bottom; fades out over the
 * last 2 s), optional voiceover, a heartbeat on every HUD beat, and the sfx slots. Reused from
 * sp500-remotion and extended. Missing files are skipped.
 */
export const AudioLayer: React.FC = () => {
  const hasMusic = hasPublicFile(AUDIO.music);
  const hasVoice = hasPublicFile(AUDIO.voiceover);
  const hasHeart = hasPublicFile(AUDIO.heartbeat.file);
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
            interpolate(f, [0, AUDIO.musicFadeInFrames, end - AUDIO.musicFadeOutFrames, end - 1], [0, musicLevel, musicLevel, 0], clamp) * duckAt(f)
          }
        />
      ) : null}
      {hasVoice ? <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceoverVolume} /> : null}
      {/* the heartbeat follows the HUD: one "lub-dub" per beat, louder when the pulse is racing */}
      {hasHeart
        ? BEAT_FRAMES.filter((f) => f < AUDIO.heartbeat.until).map((f) => (
            <Sequence key={`hb${f}`} from={f} durationInFrames={30} name={`heartbeat ${f}`} layout="none">
              <Audio src={staticFile(AUDIO.heartbeat.file)} volume={AUDIO.heartbeat.volume * interpolate(BPM[f], [55, 150], [0.55, 1], clamp)} />
            </Sequence>
          ))
        : null}
      {AUDIO.sfx.map((cue, i) =>
        hasPublicFile(cue.file) ? (
          <Sequence
            key={i}
            from={cue.frame}
            durationInFrames={cue.loopUntil ? cue.loopUntil - cue.frame : undefined}
            name={`sfx ${cue.file}`}
            layout="none"
          >
            <Audio
              src={staticFile(cue.file)}
              loop={Boolean(cue.loopUntil)}
              volume={(f) =>
                cue.loopUntil ? cue.volume * interpolate(f, [0, 4, cue.loopUntil - cue.frame - 10, cue.loopUntil - cue.frame], [0, 1, 1, 0], clamp) : cue.volume
              }
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
