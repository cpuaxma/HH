// Writes out/sfx_cues.csv from src/sfx.ts + caption ticks. Run: node scripts/export-cues.mjs
import fs from 'node:fs';
import {CUES, CAPTION_TICK_VOLUME, INTRO_CUES, MUSIC} from '../src/sfx.ts';
import {CAPTIONS, INTRO, MAIN_LENGTH} from '../src/timeline.ts';

const FPS = 60;
const edition = JSON.parse(fs.readFileSync(new URL('../src/editions/2026-11-23/edition.json', import.meta.url)));
// same word timing as ArabicWordReveal.captionWordFrames (stagger 4, line-2 gap 10 / 4 on one line)
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const ticks = [];
for (const c of CAPTIONS) {
  const cap = edition.captions[c.key];
  if (!cap) continue;
  const w1 = words(cap.l1), w2 = words(cap.l2);
  const l2Start = c.from + w1 * 4 + (cap.oneLine ? 4 : 10);
  const frames = [...Array(w1).keys()].map((i) => c.from + i * 4).concat([...Array(w2).keys()].map((i) => l2Start + i * 4));
  frames.filter((_, i) => i % 2 === 0).forEach((fr) => ticks.push({frame: fr, sfx: 'tick', volume: CAPTION_TICK_VOLUME, note: `Caption word tick (${c.key})`}));
}
const main = [...CUES, ...ticks].map((c) => ({...c, frame: c.frame + INTRO})).filter((c) => c.frame < INTRO + MAIN_LENGTH);
const all = [...INTRO_CUES, ...main].sort((a, b) => a.frame - b.frame);
const tc = (fr) => {
  const s = fr / FPS;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(3).padStart(6, '0')}`;
};
const rows = ['timestamp,frame,sound,volume,note', ...all.map((c) => `${tc(c.frame)},${c.frame},${c.sfx}.wav,${c.volume},"${c.note.replace(/"/g, "'")}"`)];
rows.push(`00:00.000,0,music/bed_120bpm.wav,${MUSIC.volume},"Music bed 120 BPM; ducks ${MUSIC.duckDb}dB from ${tc(MUSIC.duckFrom)}; 1.5s tail fade to ${tc(INTRO + MAIN_LENGTH)}"`);
fs.mkdirSync(new URL('../out/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('../out/sfx_cues.csv', import.meta.url), rows.join('\n') + '\n');
console.log(`wrote out/sfx_cues.csv (${rows.length - 1} rows)`);
