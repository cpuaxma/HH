// Writes out/sfx_cues.csv from src/sfx.ts: time_s, frame, cue, file, volume, note
import fs from 'node:fs';
import {CUES} from '../src/sfx';
import {VIDEO} from '../src/brand';

const rows = [...CUES].sort((a, b) => a.frame - b.frame);
const csv = ['time_s,frame,cue,file,volume,note', ...rows.map((c) => [(c.frame / VIDEO.fps).toFixed(3), c.frame, c.type, `sfx/${c.type}.wav`, c.volume.toFixed(2), `"${c.note}"`].join(','))].join('\n');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/sfx_cues.csv', csv + '\n');
console.log(`${rows.length} cues → out/sfx_cues.csv`);
