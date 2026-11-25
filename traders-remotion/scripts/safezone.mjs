// Per-frame safe-zone check. Renders the video in audit mode (text and logo only, white on black,
// no 3D / scrims / grain) at quarter scale, then checks EVERY frame for lit pixels outside the
// safe area: the centre 900 px, clear of the top 250 px and bottom 350 px.
//   node scripts/safezone.mjs            (exit code 1 if any frame fails)
import {execFileSync, spawn} from 'node:child_process';
import fs from 'node:fs';

const SCALE = 0.25;
const W = 1080 * SCALE;
const H = 1920 * SCALE;
const SAFE = {left: 90, right: 990, top: 250, bottom: 1920 - 350};
const THRESHOLD = 64; // 0–255 luma; anti-aliased glyph edges and faint glows stay below this
fs.mkdirSync('out', {recursive: true});

console.log('Rendering audit pass…');
execFileSync('npx', ['remotion', 'render', 'TradersArena', 'out/safezone-audit.mp4', `--props=${JSON.stringify({audit: true})}`, `--scale=${SCALE}`, '--crf=8', '--muted', '--log=error'], {stdio: 'inherit'});

const ff = spawn('ffmpeg', ['-loglevel', 'error', '-i', 'out/safezone-audit.mp4', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
const frameBytes = W * H;
let buf = Buffer.alloc(0);
let frame = 0;
const failures = [];
const x0 = Math.floor(SAFE.left * SCALE);
const x1 = Math.ceil(SAFE.right * SCALE);
const y0 = Math.floor(SAFE.top * SCALE);
const y1 = Math.ceil(SAFE.bottom * SCALE);
const check = (px) => {
  let bad = 0;
  let box = [W, H, 0, 0];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
      if (px[y * W + x] > THRESHOLD) {
        bad++;
        box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)];
      }
    }
  if (bad > 2) failures.push({frame, bad, box: box.map((v) => Math.round(v / SCALE))});
};
ff.stdout.on('data', (d) => {
  buf = Buffer.concat([buf, d]);
  while (buf.length >= frameBytes) {
    check(buf.subarray(0, frameBytes));
    buf = buf.subarray(frameBytes);
    frame++;
  }
});
ff.on('close', () => {
  console.log(`Checked ${frame} frames.`);
  if (!failures.length) {
    console.log('PASS: every frame keeps text inside the safe zone.');
    return;
  }
  console.log(`FAIL: ${failures.length} frames have text outside the safe zone:`);
  failures.slice(0, 40).forEach((f) => console.log(`  frame ${f.frame}: ${f.bad} px, bbox x${f.box[0]}–${f.box[2]} y${f.box[1]}–${f.box[3]}`));
  process.exitCode = 1;
});
