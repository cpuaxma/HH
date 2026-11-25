import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, getStaticFiles, interpolate, staticFile} from 'remotion';
import {AUDIO, BEATS, VIDEO} from '../config';
import {getCues} from './cues';
import {VO} from './voiceover';

/** A slot plays only if its file exists in /public. */
const available = () => {
  try {
    return new Set(getStaticFiles().map((f) => f.name));
  } catch {
    return new Set<string>();
  }
};

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Music level: ducks under the voiceover, swells warm for the survivors, fades over the last 2 s. */
export const musicVolume = (f: number, hasVo: boolean) => {
  let duck = 0;
  if (hasVo) for (const l of VO) duck = Math.max(duck, interpolate(f, [l.from - 6, l.from, l.to, l.to + 8], [0, 1, 1, 0], C));
  const base = AUDIO.musicVolume + (AUDIO.musicSwell - AUDIO.musicVolume) * interpolate(f, [BEATS.riseStart - 10, BEATS.riseStart + 30, 1000, 1040], [0, 1, 1, 0.4], C);
  const level = base - (base - AUDIO.musicDuck) * duck;
  const fadeIn = interpolate(f, [0, 8], [0, 1], C);
  const fadeOut = interpolate(f, [VIDEO.durationInFrames - AUDIO.fadeOutFrames, VIDEO.durationInFrames], [1, 0], C);
  return level * fadeIn * fadeOut;
};

export const SoundTrack: React.FC = () => {
  const files = available();
  const has = (n: string) => files.has(n);
  const hasVo = has(AUDIO.voiceover);
  return (
    <>
      {has(AUDIO.music) ? <Audio src={staticFile(AUDIO.music)} volume={(f) => musicVolume(f, hasVo)} /> : null}
      {hasVo ? <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceoverVolume} /> : null}
      {getCues()
        .filter((c) => has(`sfx/${c.file}.mp3`))
        .map((c, i) => (
          <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.file}`}>
            <Audio src={staticFile(`sfx/${c.file}.mp3`)} volume={c.volume * AUDIO.sfxVolume} />
          </Sequence>
        ))}
    </>
  );
};
