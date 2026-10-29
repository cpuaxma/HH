// The sound design as data: which effect plays when, and how loud. Cues are derived from the
// same timings as the visuals (scene ranges, exported scene constants), so retiming a scene
// moves its sounds too. The effects are synthesised by scripts/make-sfx.py (original, no
// sound library samples). Kept soft and sparse so a voiceover sits comfortably on top.
import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, interpolate, staticFile} from 'remotion';
import {SPECS} from './scenes/Fear';
import {ICONS} from './scenes/Independent';
import {ARROWS, tickerValue} from './scenes/Markets';
import {OBJECTS} from './scenes/History';
import {LINE_DRAW, NEWS_LOW_AT, NEWS_TAG_AT, SETTLE_AT} from './scenes/Tip';
import {SCENES, VIDEO} from './theme';
import {frameAt} from './motion';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.9;
/** The ambient pad under the whole reel. Set to 0 to drop it (e.g. if you add music). */
export const BED_VOLUME = 0.32;

export type SoundCue = {at: number; sfx: string; volume: number};

const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.max(0, Math.round(at)), sfx, volume});
const SEC = VIDEO.fps;

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];
  const [hook, fear, independent, markets, history, tip, cta] = [
    SCENES.hook[0], SCENES.fear[0], SCENES.independent[0], SCENES.markets[0], SCENES.history[0], SCENES.tip[0], SCENES.cta[0],
  ];

  // Scene changes: a soft whoosh peaking as the next scene's visual arrives (peak ≈ 0.47s in).
  [fear, independent, markets, history, tip].forEach((s, i) => cues.push(cue(s - 0.4 * SEC, `whoosh-${i % 2}`, 0.42)));

  // 1 · Hook: a soft low thum under the first words, red spots blip in as they arrive; the gold line rises; its tip sparkles.
  cues.push(cue(hook, 'land', 0.38));
  for (let i = 0; i < 5; i++) cues.push(cue(hook + frameAt(Math.min(0.99, i * 0.075 + 0.02), 40, 50), `blip-${i % 4}`, 0.32 - i * 0.03));
  cues.push(cue(hook + 58, 'rise', 0.55));
  cues.push(cue(hook + 118, 'sparkle', 0.45));

  // 2 · Fear: the shield draws, particles swirl in, then the gold bloom as it glows.
  cues.push(cue(fear + 60, 'trace', 0.35));
  const flowStart = Math.min(...SPECS.map((p) => p.flowAt));
  cues.push(cue(fear + flowStart, 'swirl', 0.5));
  cues.push(cue(fear + 190, 'bloom', 0.55));

  // 3 · Independent: bar lands, icons plink in, each link dissolves, the bar glows alone.
  cues.push(cue(independent + 4, 'land', 0.6));
  ICONS.forEach((icon, i) => {
    cues.push(cue(independent + 32 + i * 14, `plink-${i}`, 0.3));
    cues.push(cue(independent + icon.breakAt, `dissolve-${i}`, 0.45));
  });
  cues.push(cue(independent + 236, 'bloom', 0.42));
  cues.push(cue(independent + 250, 'sparkle', 0.3));

  // 4 · Markets: the panel glides in, the ticker ticks on each tens step and settles,
  // the gold line rises, and each arrow lands on the bar.
  cues.push(cue(markets, 'glass', 0.45));
  let step = 0;
  let settled = 0;
  for (let f = 41; f <= 120; f++) {
    const now = Math.floor(tickerValue(f) / 10);
    if (now !== Math.floor(tickerValue(f - 1) / 10)) cues.push(cue(markets + f, `tick-${Math.min(9, step++)}`, 0.3));
    if (!settled && Math.round(tickerValue(f)) === Math.round(tickerValue(120))) settled = f;
  }
  cues.push(cue(markets + settled + 4, 'settle', 0.32));
  cues.push(cue(markets + 38, 'rise-long', 0.4));
  ARROWS.forEach((a, i) => cues.push(cue(markets + a.at, `arrow-${i}`, 0.4)));

  // 5 · History: the timeline streaks right → left, then each object lands on it.
  cues.push(cue(history, 'streak', 0.45));
  const landing = ['coin-ancient', 'coin-minted', 'bar-land'];
  OBJECTS.forEach((o, i) => cues.push(cue(history + o.at + 12, landing[i], [0.45, 0.42, 0.55][i])));

  // 6 · Tip: pill and card, the news dump (its low on the frame the line reaches it),
  // the red tag, the light streak tracing it, and a calm chime as the price settles.
  cues.push(cue(tip + 2, 'pill', 0.35));
  cues.push(cue(tip + 20, 'glass', 0.35));
  cues.push(cue(tip + frameAt(NEWS_LOW_AT, LINE_DRAW.start, LINE_DRAW.dur) - 0.18 * SEC, 'dump', 0.42));
  cues.push(cue(tip + NEWS_TAG_AT, 'news', 0.32));
  cues.push(cue(tip + 82, 'trace', 0.35));
  cues.push(cue(tip + SETTLE_AT + 6, 'settle', 0.26));

  // 7 · CTA: the light wipe (peaking mid-sweep), the logo landing (its hit 0.35s into the file),
  // the button popping in, and its shine.
  cues.push(cue(cta + 7 - 0.38 * SEC, 'wipe', 0.55));
  cues.push(cue(cta + 18 - 0.35 * SEC, 'logo', 0.65));
  cues.push(cue(cta + 66, 'pill', 0.4));
  cues.push(cue(cta + 104, 'sparkle', 0.38));

  return cues;
};

/** Restless tension under the red: in with the map spots, out as the particles turn gold. */
const TENSION = [
  {from: 30, to: 420, keys: [30, 70, 330, 420], peak: 0.32},
  // A quieter return under the shaking "markets" line.
  {from: SCENES.markets[0] + 10, to: SCENES.markets[1] - 5, keys: [SCENES.markets[0] + 10, SCENES.markets[0] + 50, SCENES.markets[1] - 60, SCENES.markets[1] - 5], peak: 0.16},
];

export const SoundTrack: React.FC = () => {
  const cues = getCues();
  return (
    <>
      <Audio src={staticFile('sfx/bed.wav')} volume={BED_VOLUME * SFX_MASTER} />
      {TENSION.map((t, i) => (
        <Sequence key={`tension-${i}`} from={t.from} durationInFrames={t.to - t.from} layout="none" name="sfx tension">
          <Audio
            src={staticFile('sfx/tension.wav')}
            loop
            volume={(f) => SFX_MASTER * t.peak * interpolate(t.from + f, t.keys, [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </Sequence>
      ))}
      {cues.map((c, i) => (
        <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER} />
        </Sequence>
      ))}
    </>
  );
};
