// The sound design as data: which effect plays when, and how loud. Every cue is derived
// from the same timings as the visuals (src/data.ts), so retiming a beat moves its sound.
// The effects are synthesised by scripts/make-sfx.py (original, no library samples) and
// kept soft so they sit under the music added in Instagram.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {NUMBERS, TIMING, VOICEOVER, YOUR_NOTIFS, competitorNotifFrames} from './data';
import {keyframes} from './lib/ease';
import {VO_FRAMES} from './voLengths';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.85;

export type SoundCue = {at: number; sfx: string; volume: number};
const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

/** How loud the competitor's pings are at a given frame: full on their shots, distant on yours. */
const competitorPingLevel = (f: number) => {
  if (f < 300) return 0.34;
  if (f < 432) return 0; // your time-lapse: silence, ticks and one lonely ping
  if (f < 540) return 0.2;
  if (f < TIMING.profileAt) return 0.14;
  return 0;
};

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];

  // 1–2. Pings stacking faster and faster on the competitor's phone.
  competitorNotifFrames().forEach((at, i) => {
    const v = competitorPingLevel(at);
    if (at >= 0 && v > 0) cues.push(cue(at, `ping-${i % 4}`, v));
  });
  // Kinetic lines landing.
  [TIMING.headlineIn + 8, TIMING.gapLines[0][0] + 6, TIMING.gapLines[1][0] + 6, TIMING.gapLines[2][0] + 6, TIMING.twistTextIn + 6, TIMING.flipTextIn + 6].forEach(
    (at) => cues.push(cue(at, 'thock', 0.3)),
  );
  cues.push(cue(NUMBERS.competitorNewFollowers[0][0], 'pop', 0.34));
  cues.push(cue(TIMING.trendingAt, 'pop', 0.4));
  // Your side: the clock racing, then one lonely ping.
  cues.push(cue(TIMING.clockStart - 6, 'ticks', 0.42));
  cues.push(cue(TIMING.lonelyPingAt, 'lonely', 0.6));

  // 3. The twist: the tag pops.
  cues.push(cue(TIMING.tagAt, 'bloop', 0.5));

  // 4. The flip: streak fly-by, the spin, the impact.
  cues.push(cue((TIMING.streakStart + TIMING.streakEnd) / 2 - 24, 'whoosh', 0.62));
  cues.push(cue((TIMING.flipStart + TIMING.flipEnd) / 2 - 21, 'swish', 0.5));
  cues.push(cue(TIMING.impactAt, 'impact', 0.85));
  // Your first notifications: pings on a rising scale.
  YOUR_NOTIFS.forEach((n, i) => cues.push(cue(n.at, `rise-${Math.min(7, i + 1)}`, 0.42)));
  // A tiny tick each time your like count passes another 150.
  const likes = keyframes(NUMBERS.yourLikesAfter);
  let step = 0;
  for (let f = NUMBERS.yourLikesAfter[0][0]; f <= NUMBERS.yourLikesAfter[NUMBERS.yourLikesAfter.length - 1][0]; f++) {
    if (Math.floor(likes(f) / 150) > Math.floor(likes(f - 1) / 150)) cues.push(cue(f, `tick-${step++ % 6}`, 0.2));
  }

  // 5. End card: the logo lands, then the tap on "DM US".
  cues.push(cue(TIMING.logoAt, 'logo', 0.75));
  cues.push(cue(TIMING.ctaAt + 30, 'tap', 0.6));
  return cues.sort((a, b) => a.at - b.at);
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

export const SoundTrack: React.FC<{voice?: boolean}> = ({voice = VOICEOVER.enabled}) => (
  <>
    {getCues().map((c, i) => (
      <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER * (voice ? duck(c.at) : 1)} />
      </Sequence>
    ))}
    {voice
      ? VOICEOVER.lines.map((l) => (
          <Sequence key={l.file} from={l.at} layout="none" name={`vo ${l.file}`}>
            <Audio src={staticFile(`vo/${l.file}.wav`)} volume={VOICEOVER.volume} />
          </Sequence>
        ))
      : null}
  </>
);
