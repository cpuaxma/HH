import React from 'react';
import {Audio, getStaticFiles, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {MUSIC, SFX, VIDEO, VOICEOVER} from '../config';
import {sceneByName, SceneName, TOTAL_FRAMES} from '../lib/timeline';
import {VO_FRAMES} from '../voLengths';
import {useScene} from './SceneShell';

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

// ── Voiceover ──────────────────────────────────────────────────────────────
type VoLine = {id: string; file: string; from: number; to: number};
const voLines = (): VoLine[] =>
  VOICEOVER.enabled
    ? VOICEOVER.lines
        .map((l) => {
          const from = sceneByName(l.scene as SceneName).cut + l.at;
          return {id: l.id, file: `${VOICEOVER.folder}/${l.id}.wav`, from, to: from + (VO_FRAMES[l.id] ?? 60)};
        })
        .filter((l) => has(l.file))
    : [];

/** 0..1: how much a voiceover line is speaking at global frame f (6-frame ramps). */
const voPresence = (f: number) => {
  let v = 0;
  for (const l of voLines()) {
    const r = Math.min(1, Math.max(0, (f - l.from + 6) / 6), Math.max(0, (l.to + 6 - f) / 6));
    v = Math.max(v, r);
  }
  return v;
};

/** Plays every line in assets/vo/ at its cue. Lines whose file is missing are skipped. */
export const Voiceover: React.FC = () => (
  <>
    {voLines().map((l) => (
      <Sequence key={l.id} from={Math.max(0, l.from)} layout="none" name={`vo:${l.id}`}>
        <Audio src={staticFile(l.file)} volume={VOICEOVER.volume} />
      </Sequence>
    ))}
  </>
);

const sfxFile = (name: string) => {
  for (const ext of SFX.extensions) {
    const file = `${SFX.folder}/${name}.${ext}`;
    if (has(file)) return file;
  }
  return null;
};

export type SfxName = 'whoosh' | 'pop' | 'tap' | 'bass-hit';

/** One-shot SFX at scene frame `at`. Renders nothing if assets/sfx/<name>.(mp3|wav) is missing. */
export const Sfx: React.FC<{name: SfxName; at: number}> = ({name, at}) => {
  const scene = useScene();
  const file = sfxFile(name);
  if (!file) return null;
  const from = Math.max(0, Math.round(at + scene.head));
  // SFX sit lower while the voice is speaking.
  const duck = 1 - (1 - VOICEOVER.sfxDuckTo) * voPresence(scene.cut + Math.round(at));
  return (
    <Sequence from={from} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(file)} volume={(SFX.volume[name] ?? 0.8) * duck} />
    </Sequence>
  );
};

/** Background music with fade-in, CTA duck and fade-out. Silent if assets/music.mp3 is missing. */
export const Music: React.FC = () => {
  const {fps} = useVideoConfig();
  if (!has(MUSIC.file)) return null;
  const cta = sceneByName('cta');
  const duckStart = cta.cut - Math.floor(cta.inFrames / 2);
  const end = TOTAL_FRAMES;
  return (
    <Audio
      src={staticFile(MUSIC.file)}
      trimBefore={Math.round(MUSIC.trimStartSeconds * fps)}
      loop
      volume={(f) => {
        const fadeIn = interpolate(f, [0, MUSIC.fadeInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const duck = interpolate(f, [duckStart, duckStart + MUSIC.duckFrames], [1, MUSIC.duckTo], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const fadeOut = interpolate(f, [end - MUSIC.fadeOutFrames, end - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const voDuck = 1 - (1 - VOICEOVER.musicDuckTo) * voPresence(f);
        return MUSIC.volume * fadeIn * duck * fadeOut * voDuck;
      }}
    />
  );
};

/** Whooshes on every whip-pan, placed so the peak lands on the cut. Lives at the root (global frames). */
export const TransitionSfx: React.FC = () => {
  const file = sfxFile('whoosh');
  if (!file) return null;
  const cuts = (['strategy', 'create', 'launch', 'results', 'cta', 'idea'] as const).map((n) => sceneByName(n));
  return (
    <>
      {cuts.map((s) => (
        <Sequence key={s.name} from={Math.max(0, s.cut - Math.floor(s.inFrames / 2) - 2)} layout="none" name={`sfx:whoosh→${s.name}`}>
          <Audio src={staticFile(file)} volume={SFX.volume.whoosh ?? 0.7} />
        </Sequence>
      ))}
    </>
  );
};

void VIDEO;
