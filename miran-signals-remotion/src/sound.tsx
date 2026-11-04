// The sound design as data: which effect plays when, and how loud. Every cue is derived from
// the same timings as the visuals (src/data.ts), so retiming a beat moves its sound.
// The effects are synthesised by scripts/make-sfx.py (original, no library samples) and kept
// soft (about −20 LUFS, peaks near −3 dBFS) so they sit under music added in Instagram.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {LEFT_AFTER_NOTIFS, LEFT_NOTIFS, NEWS, RIGHT_NOTIFS, SIGNAL, TIMING, VOICEOVER} from './data';
import {VO_FRAMES} from './voLengths';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.7;

export type SoundCue = {at: number; sfx: string; volume: number};
const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];

  // LEFT: notifications, harsh descending error blips on each loss, a heartbeat under the
  // margin warning, the late news alert and a soft margin-call alarm.
  let err = 0;
  for (const n of LEFT_NOTIFS) {
    if (n.at < 0) continue;
    if (n.kind === 'copy') cues.push(cue(n.at, 'notif-left', 0.32));
    if (n.kind === 'loss') cues.push(cue(n.at, `err-${err++ % 3}`, 0.42));
    if (n.kind === 'warn') {
      cues.push(cue(n.at, 'err-2', 0.36));
      // The heartbeat pulses under the warning until the news.
      for (let at = n.at + 6; at < NEWS.at - 30; at += 140) cues.push(cue(at, 'heartbeat', 0.55));
    }
    if (n.kind === 'news') cues.push(cue(n.at, 'notif-left', 0.38));
    if (n.kind === 'call') cues.push(cue(n.at, 'alarm', 0.5));
  }

  // RIGHT: soft gold chimes as the signal card builds, a rising chime on every TP, the calm
  // market-update chime, and soft pings for its notifications.
  for (let i = 0; i < 8; i++) cues.push(cue(TIMING.signalBuildAt + i * TIMING.signalLineGap, `chime-${i}`, 0.24));
  for (const n of RIGHT_NOTIFS) {
    if (n.kind === 'tp') cues.push(cue(n.at, 'tp', 0.44));
    if (n.kind === 'sl') cues.push(cue(n.at, 'signal', 0.22));
    if (n.kind === 'signal') cues.push(cue(n.at, 'signal', 0.32));
  }
  cues.push(cue(TIMING.updateAt, 'update', 0.55));

  // The news candle: a sub-drop and rumble on both sides at the same frame. On the left it
  // lands hard; on the right a soft shield tone follows.
  cues.push(cue(NEWS.at, 'subdrop', 0.8));
  cues.push(cue(NEWS.at + 1, 'hit', 0.5));
  cues.push(cue(SIGNAL.beClosedAt + 2, 'shield', 0.5));

  // Kinetic lines landing: a soft low thock.
  [TIMING.hookAIn + 8, TIMING.hookBIn + 6, TIMING.twistAIn + 6, TIMING.twistBIn + 6, TIMING.flipTextIn + 6].forEach((at) => cues.push(cue(at, 'thock', 0.28)));
  TIMING.pillars.forEach((p) => {
    cues.push(cue(p.redIn + 4, 'thock', 0.22));
    cues.push(cue(p.goldIn + 4, 'thock', 0.22));
  });

  // The twist: three gold ticks, then the tag glints.
  TIMING.ticks.forEach((at, i) => cues.push(cue(at, `gtick-${i}`, 0.5)));
  cues.push(cue(TIMING.tagAt + 8, 'glint', 0.4));

  // The flip: the metallic whoosh of the gold streak, the spin, the impact.
  cues.push(cue((TIMING.streakStart + TIMING.streakEnd) / 2 - 26, 'whoosh-metal', 0.6));
  cues.push(cue((TIMING.flipStart + TIMING.flipEnd) / 2 - 21, 'swish', 0.5));
  cues.push(cue(TIMING.impactAt, 'impact', 0.8));
  // After the flip: both phones on Miran Gold.
  for (const n of LEFT_AFTER_NOTIFS) cues.push(cue(n.at, n.kind === 'update' ? 'update' : 'signal', 0.3));

  // End card: the logo lands, then the tap on the CTA.
  cues.push(cue(TIMING.logoAt, 'logo', 0.72));
  cues.push(cue(TIMING.tapAt, 'tap', 0.55));
  return cues.sort((a, b) => a.at - b.at);
};

/** 1 normally, VOICEOVER.duckTo while a voiceover line plays (with short ramps). */
export const duck = (frame: number) => {
  let g = 1;
  for (const l of VOICEOVER.lines) {
    const a = l.at - 4;
    const b = l.at + (VO_FRAMES[l.file] ?? 0) + 6;
    if (!VO_FRAMES[l.file]) continue;
    const t = frame < a - 6 || frame > b + 6 ? 0 : frame < a ? (frame - (a - 6)) / 6 : frame > b ? 1 - (frame - b) / 6 : 1;
    g = Math.min(g, 1 - (1 - VOICEOVER.duckTo) * t);
  }
  return g;
};

export const SoundTrack: React.FC<{voice?: boolean}> = ({voice = VOICEOVER.enabled}) => (
  <>
    {getCues().map((c, i) => (
      <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER * (voice ? duck(c.at) : 1)} />
      </Sequence>
    ))}
    {voice
      ? VOICEOVER.lines
          .filter((l) => VO_FRAMES[l.file])
          .map((l) => (
            <Sequence key={l.file} from={l.at} layout="none" name={`vo ${l.file}`}>
              <Audio src={staticFile(`vo/${l.file}.wav`)} volume={VOICEOVER.volume} />
            </Sequence>
          ))
      : null}
  </>
);
