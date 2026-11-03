// The sound design as data: which effect plays when, and how loud. Every cue comes from
// the same timings as the visuals (src/data.ts), so retiming a beat moves its sound too.
// The effects are synthesised by scripts/make-sfx.py (original, no sound-library samples).
// Kept soft so it sits under the music added in Instagram.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {SCROLL, SHOTS, T, VOICEOVER} from './data';
import {clamp01} from './lib/ease';
import {feedSpeed} from './lib/scroll';
import {VO_FRAMES} from './voLengths';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.85;

export type SoundCue = {at: number; sfx: string; volume: number};
const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.max(0, Math.round(at)), sfx, volume});

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];
  // THE SCROLL: a swish per thumb flick, climbing in pitch as the scroll speeds up.
  const flicks = SCROLL.flicks.filter((f) => f >= 0 && f < T.brake - 2);
  flicks.forEach((f, i) => cues.push(cue(f, `flick-${Math.min(7, Math.floor((i / flicks.length) * 8))}`, 0.26 + 0.12 * (i / flicks.length))));
  T.scrollWordAt.forEach((f) => cues.push(cue(f + 1, 'slam', 0.55)));

  // THE STOP: the brake lands on the frame the feed stops; the neon flickers on.
  cues.push(cue(T.brake - 4, 'brake', 0.9));
  [5, 11, 17].forEach((u) => cues.push(cue(T.brake + u, 'neon', 0.22)));
  cues.push(cue(T.waitAt, 'wait', 0.4));

  // THE BREAKDOWN: a pop per card (rising), a tick as each leader line lands, a whip between angles.
  T.calloutAt.forEach((f, i) => {
    cues.push(cue(f, `pop-${i + 1}`, 0.6));
    cues.push(cue(f + 21, 'dot', 0.28));
  });
  SHOTS.forEach((s) => {
    if (s.whipIn && s.whipIn < 24) cues.push(cue(s.start - 3, 'whip', 0.5));
  });

  // THE CONTRAST: the pull-back, the hero lifting off, the two lines.
  cues.push(cue(T.pullBack, 'whoosh', 0.5));
  cues.push(cue(T.heroLift, 'lift', 0.38));
  cues.push(cue(T.contrast1At, 'bland', 0.45));
  cues.push(cue(T.contrast2At, 'bold', 0.6));

  // END CARD.
  cues.push(cue(T.phoneOff, 'swoosh', 0.45));
  cues.push(cue(T.logoAt, 'whomp', 0.72));
  cues.push(cue(T.ctaAt, 'tap', 0.6));
  return cues;
};

/** 1 normally, VOICEOVER.duckTo while a voiceover line plays (with short ramps). */
export const duck = (frame: number) => {
  let g = 1;
  for (const l of VOICEOVER.lines) {
    const a = l.at - 4;
    const b = l.at + (VO_FRAMES[l.file] ?? 60) + 6;
    const t = frame < a - 6 || frame > b + 6 ? 0 : frame < a ? (frame - (a - 6)) / 6 : frame > b ? 1 - (frame - b) / 6 : 1;
    g = Math.min(g, 1 - (1 - VOICEOVER.duckTo) * t);
  }
  return g;
};

/** The feed rushing by: its level follows the scroll speed, so it cuts dead at the stop. */
const rushVolume = (frame: number) => SFX_MASTER * 0.34 * clamp01(Math.abs(feedSpeed(frame)) / 280) ** 0.8 * duck(frame);

export const SoundTrack: React.FC<{voiceover?: boolean}> = ({voiceover = true}) => {
  const cues = getCues();
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER * duck(c.at)} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={T.brake + 6} layout="none" name="sfx rush">
        <Audio src={staticFile('sfx/rush.wav')} loop volume={(f) => rushVolume(f)} />
      </Sequence>
      <Sequence from={T.feedResume} durationInFrames={T.endStart + 40 - T.feedResume} layout="none" name="sfx rush (contrast)">
        <Audio src={staticFile('sfx/rush.wav')} loop volume={(f) => rushVolume(T.feedResume + f) * 0.7} />
      </Sequence>
      {voiceover
        ? VOICEOVER.lines.map((l) => (
            <Sequence key={l.file} from={l.at} layout="none" name={`vo ${l.file}`}>
              <Audio src={staticFile(`vo/${l.file}.wav`)} volume={VOICEOVER.volume} />
            </Sequence>
          ))
        : null}
    </>
  );
};
