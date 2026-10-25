// Timeline QA: beat alignment, headline read time, and gaps where nothing new happens.
// MAX_GAP is 1.5 s: the cut is paced so each fix can be read (problem → fix → result held).
// Holds over 1 s are listed so they stay deliberate. The end card (from the pill on) is a hold by design.
const MAX_GAP = 90;
const NOTE_GAP = 60;
import {BEAT, DURATION, SLAM} from '../src/theme';
import {PUNCHES, SFX, T, TEXT_SLAMS} from '../src/timeline';

let fail = 0;
const bad = (msg: string) => {
  fail++;
  console.log(`  ✗ ${msg}`);
};

console.log('Beat grid (slams + punch-zooms on multiples of', BEAT, 'frames)');
const offBeat = [...TEXT_SLAMS, ...PUNCHES, T.stamp, T.logo, ...T.ctaSlams].filter((f) => f % BEAT !== 0);
if (offBeat.length) offBeat.forEach((f) => bad(`frame ${f} is off the beat grid`));
else console.log(`  ✓ ${TEXT_SLAMS.length + 3} slams/stamps and ${PUNCHES.length} punch-zooms all on beats`);

console.log('Headline read time (≥ 30 frames = 0.5s fully on screen per 1–3 word line)');
const heads: [string, number[], number][] = [
  ['hook', T.hookSlams, T.hookExit],
  ['bio', T.bioSlams, T.bioExit],
  ['grid', T.gridSlams, T.gridExit],
  ['hook3', T.countdown, T.reelExit],
  ['result', T.resultSlams, T.resultExit],
  ['cta', T.ctaSlams, DURATION],
];
for (const [name, at, exit] of heads) {
  const readable = at.map((f) => exit - (f + SLAM.frames));
  const min = Math.min(...readable);
  if (min < 30) bad(`${name}: a line is readable for only ${min} frames`);
  else console.log(`  ✓ ${name}: shortest line readable ${min} frames (${(min / 60).toFixed(2)}s)`);
}

console.log(`Gaps between new events (max ${MAX_GAP} frames = ${MAX_GAP / 60}s)`);
const events = [...new Set(SFX.map((c) => c.frame))].filter((f) => f <= T.pill).sort((a, b) => a - b);
let worst = 0;
for (let i = 1; i < events.length; i++) {
  const gap = events[i] - events[i - 1];
  worst = Math.max(worst, gap);
  if (gap > MAX_GAP) bad(`nothing new between frame ${events[i - 1]} and ${events[i]} (${gap} frames)`);
  else if (gap > NOTE_GAP) console.log(`  · reading hold ${events[i - 1]}–${events[i]} (${(gap / 60).toFixed(2)}s)`);
}
console.log(`  ${worst <= MAX_GAP ? '✓' : '·'} longest gap ${worst} frames (${(worst / 60).toFixed(2)}s)`);
process.exit(fail ? 1 : 0);
