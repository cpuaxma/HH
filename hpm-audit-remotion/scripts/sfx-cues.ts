// Writes out/sfx-cues.txt from the timeline (src/timeline.ts), the same data that drives the animation.
import fs from 'node:fs';
import {BEAT, BPM, DURATION, FPS} from '../src/theme';
import {SECTIONS, SFX} from '../src/timeline';

const tc = (f: number) => {
  const s = f / FPS;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(3).padStart(6, '0')}`;
};
const beatOf = (f: number) => (f / BEAT).toFixed(2).replace(/\.00$/, '').padStart(5);
const section = (f: number) => Object.entries(SECTIONS).find(([, [a, b]]) => f >= a && f < b)?.[0] ?? 'cta';

const rows = [...SFX].sort((a, b) => a.frame - b.frame || a.kind.localeCompare(b.kind));
const lines = [
  'HOT PEPPER MEDIA · "3 Instagram fixes in 30 seconds" · SFX cue sheet',
  `Video: out/hpm-audit.mp4 · 1080x1920 · ${FPS} fps · ${DURATION} frames (${DURATION / FPS}s), silent`,
  `Beat grid: ${BPM} BPM, first downbeat at frame 0 → one beat every ${BEAT} frames (${(BEAT / FPS).toFixed(3)}s)`,
  'Timecode is mm:ss.mmm from the first frame. "beat" = beat number on that grid (whole numbers are downbeats).',
  'Ranges (typing, risers, odometer) give start → end; place risers so they peak on the end time.',
  '',
  'TIME        FRAME  BEAT   SECTION  SFX         NOTE',
  '──────────  ─────  ─────  ───────  ──────────  ────────────────────────────────────────────',
  ...rows.map((c) => {
    const range = c.end !== undefined ? ` → ${tc(c.end)} (f${c.end})` : '';
    return `${tc(c.frame)}   ${String(c.frame).padStart(4)}   ${beatOf(c.frame)}  ${section(c.frame).padEnd(7)}  ${c.kind.toUpperCase().padEnd(10)}  ${c.note}${range}`;
  }),
  '',
  'Totals: ' +
    Object.entries(rows.reduce<Record<string, number>>((acc, c) => ({...acc, [c.kind]: (acc[c.kind] ?? 0) + 1}), {}))
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · '),
];
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/sfx-cues.txt', lines.join('\n') + '\n');
console.log(`out/sfx-cues.txt: ${rows.length} cues`);
