import React from 'react';
import {Audio} from '@remotion/media';
import {getStaticFiles, interpolate, Sequence, staticFile} from 'remotion';
import type {Caption} from '../edition';
import {CAPTION_TICK_VOLUME, CUES, MUSIC} from '../sfx';
import {CAPTIONS} from '../timeline';
import {captionWordFrames} from './ArabicWordReveal';

/** Caption ticks: every 2nd word, low volume. */
export const captionTicks = (captions: Record<string, Caption>) =>
  CAPTIONS.flatMap((c) => {
    const cap = captions[c.key];
    if (!cap) return [];
    return captionWordFrames(cap.l1, cap.l2, c.from, cap.oneLine).frames.filter((_, i) => i % 2 === 0);
  });

/**
 * Wires <Audio> for every cue whose file exists in public/sfx/, plus the first file found in
 * public/music/ as the bed (ducked −6dB under the outro, 1.5s tail fade).
 */
export const SfxTrack: React.FC<{captions: Record<string, Caption>; durationInFrames: number}> = ({captions, durationInFrames}) => {
  const files = new Set(getStaticFiles().map((f) => f.name));
  const has = (name: string) => files.has(`sfx/${name}.wav`);
  const music = getStaticFiles().find((f) => f.name.startsWith('music/') && /\.(wav|mp3|m4a|aac|ogg)$/i.test(f.name));
  const duck = Math.pow(10, MUSIC.duckDb / 20);
  return (
    <>
      {music ? (
        <Audio
          src={music.src}
          volume={(fr) =>
            MUSIC.volume *
            interpolate(fr, [MUSIC.duckFrom - 15, MUSIC.duckFrom], [1, duck], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
            interpolate(fr, [durationInFrames - MUSIC.tailFrames, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          }
        />
      ) : null}
      {CUES.filter((c) => has(c.sfx)).map((c, i) => (
        <Sequence key={`${c.sfx}-${c.frame}-${i}`} from={c.frame} durationInFrames={c.durationInFrames ?? 150} layout="none" name={`sfx ${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume} />
        </Sequence>
      ))}
      {has('tick')
        ? captionTicks(captions).map((fr, i) => (
            <Sequence key={`tick-${fr}-${i}`} from={fr} durationInFrames={20} layout="none" name="caption tick">
              <Audio src={staticFile('sfx/tick.wav')} volume={CAPTION_TICK_VOLUME} />
            </Sequence>
          ))
        : null}
    </>
  );
};
