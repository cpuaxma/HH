import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, getStaticFiles, staticFile} from 'remotion';
import {CUES} from '../sfx';
import {VIDEO} from '../brand';

/** Plays every cue whose file exists in /public/sfx, plus /public/music/bed.(wav|mp3) if present. */
export const SfxTrack: React.FC = () => {
  const files = new Set(getStaticFiles().map((f) => f.name));
  const music = ['music/bed.wav', 'music/bed.mp3'].find((m) => files.has(m));
  return (
    <>
      {music && <Audio src={staticFile(music)} volume={0.6} />}
      {CUES.map((c, i) => {
        const name = `sfx/${c.type}.wav`;
        if (!files.has(name)) return null;
        return (
          <Sequence key={i} from={c.frame} durationInFrames={VIDEO.fps * 3} layout="none" name={`sfx ${c.type}`}>
            <Audio src={staticFile(name)} volume={c.volume} />
          </Sequence>
        );
      })}
    </>
  );
};
