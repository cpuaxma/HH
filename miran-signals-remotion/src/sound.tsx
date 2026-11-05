// The sound design as data: which effect plays when, and how loud. Every cue is derived from
// the same timings as the visuals (src/data.ts), so retiming a beat moves its sound.
// The effects are synthesised by scripts/make-sfx.py (original, no library samples) and kept
// soft (about −20 LUFS, peaks near −3 dBFS) so they sit under music and your own voiceover.
// There is no voiceover in the mix: README.md has a suggested script with timings.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {LEFT, NEWS, SIGNAL, TIMING, UPDATE} from './data';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.7;

export type SoundCue = {at: number; sfx: string; volume: number};
const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];

  // Captions landing: a soft low thock.
  [TIMING.hookAIn, TIMING.hookBIn, TIMING.entryIn, TIMING.riseIn, TIMING.warningIn, TIMING.exitIn, TIMING.newsIn, TIMING.payoffAIn, TIMING.payoffBIn, TIMING.flipTextIn].forEach((at) =>
    cues.push(cue(at + 8, 'thock', 0.28)),
  );

  // LEFT: the impulsive "Buy" tap, then the trade opens with a plain notification.
  cues.push(cue(LEFT.tapAt, 'tap', 0.4));
  cues.push(cue(LEFT.openedAt, 'notif-left', 0.32));
  // A heartbeat under the calm before the news.
  for (let at = 732; at < NEWS.at - 48; at += 96) cues.push(cue(at, 'heartbeat', 0.5));

  // RIGHT: the Miran signal builds with soft gold chimes, executes, then the market update.
  cues.push(cue(SIGNAL.at, 'signal', 0.34));
  for (let i = 0; i < 6; i++) cues.push(cue(SIGNAL.at + i * SIGNAL.lineGap, `chime-${i}`, 0.22));
  cues.push(cue(SIGNAL.filledAt, 'gtick-0', 0.45));
  cues.push(cue(UPDATE.at, 'update', 0.55));
  cues.push(cue(UPDATE.tapAt, 'tap', 0.45));
  cues.push(cue(UPDATE.closedAt, 'tp', 0.5));

  // The news candle: a sub-drop and hit on both sides at the same frame. The left lands hard
  // (error, then the margin-call alarm); the right gets a soft shield tone.
  cues.push(cue(NEWS.at, 'subdrop', 0.8));
  cues.push(cue(NEWS.at + 1, 'hit', 0.5));
  cues.push(cue(NEWS.at + 10, 'err-0', 0.42));
  cues.push(cue(NEWS.at + 12, 'shield', 0.5));
  cues.push(cue(LEFT.marginCallAt, 'alarm', 0.5));
  cues.push(cue(LEFT.marginCallAt + 2, 'err-2', 0.4));

  // The payoff word lands with a glint.
  cues.push(cue(TIMING.payoffBIn + 18, 'glint', 0.4));

  // The switch: the metallic whoosh of the gold streak, the spin, the impact, the sync pulses.
  cues.push(cue((TIMING.streakStart + TIMING.streakEnd) / 2 - 26, 'whoosh-metal', 0.6));
  cues.push(cue((TIMING.flipStart + TIMING.flipEnd) / 2 - 21, 'swish', 0.5));
  cues.push(cue(TIMING.impactAt, 'impact', 0.8));
  cues.push(cue(TIMING.impactAt + 20, 'gtick-1', 0.4));
  cues.push(cue(TIMING.impactAt + 34, 'gtick-2', 0.4));

  // End card: the logo lands, then the tap on the CTA.
  cues.push(cue(TIMING.logoAt, 'logo', 0.72));
  cues.push(cue(TIMING.tapAt, 'tap', 0.55));
  return cues.sort((a, b) => a.at - b.at);
};

export const SoundTrack: React.FC = () => (
  <>
    {getCues().map((c, i) => (
      <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER} />
      </Sequence>
    ))}
  </>
);
