// Final render with real motion blur.
//
// A 180-degree shutter at 60fps exposes for half a frame. Each pass renders the whole
// composition with the clock shifted by a sub-frame offset inside that half frame; ffmpeg
// then averages the passes frame by frame and muxes the soundtrack.
//
//   node scripts/render.mjs                 # 4 samples, full res → out/hpm-boost-ad.mp4
//   SAMPLES=1 SCALE=0.5 node scripts/render.mjs   # quick draft, no blur
//   FRAMES=300-359 node scripts/render.mjs        # a range only
//   PASSES=1 node scripts/render.mjs              # render only pass 1 (resumable: finished passes are kept)
//   MIX_ONLY=1 node scripts/render.mjs            # just average the passes and mux the audio
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {browserExecutable} from './browser.mjs';

const SAMPLES = Number(process.env.SAMPLES ?? 3);
const SCALE = Number(process.env.SCALE ?? 1);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? Math.max(1, Math.floor(os.cpus().length / 2)));
const OUT = process.env.OUT ?? 'out/hpm-boost-ad.mp4';
const range = process.env.FRAMES ? process.env.FRAMES.split('-').map(Number) : null;
const SHUTTER = 0.5; // fraction of a frame the shutter is open (180 degrees)
const ONLY = process.env.PASSES ? process.env.PASSES.split(',').map(Number) : null;
const MIX_ONLY = Boolean(process.env.MIX_ONLY);
const FORCE = Boolean(process.env.FORCE);
const tag = `${SAMPLES}s-${SCALE}x${range ? `-${range.join('-')}` : ''}`;

const offsets = Array.from({length: SAMPLES}, (_, k) => (SAMPLES === 1 ? 0 : ((k + 0.5) / SAMPLES - 0.5) * SHUTTER));
fs.mkdirSync('out/passes', {recursive: true});

const serveUrl = MIX_ONLY ? null : await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const passes = [];
for (const [k, sub] of offsets.entries()) {
  const file = `out/passes/pass-${tag}-${k}.mov`;
  passes.push(file);
  if (MIX_ONLY || (ONLY && !ONLY.includes(k)) || (fs.existsSync(file) && !FORCE)) continue;
  const inputProps = {sub};
  const composition = await selectComposition({serveUrl, id: 'BoostAd', inputProps, chromiumOptions, browserExecutable});
  const tmp = `${file}.part.mov`;
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'prores',
    proResProfile: 'hq',
    outputLocation: tmp,
    inputProps,
    chromiumOptions,
    browserExecutable,
    scale: SCALE,
    concurrency: CONCURRENCY,
    frameRange: range,
    muted: true,
    imageFormat: 'png',
    overwrite: true,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 20);
      if (p !== last) {
        last = p;
        process.stdout.write(`\rpass ${k + 1}/${SAMPLES} (offset ${sub.toFixed(4)})  ${Math.round(progress * 100)}%  ${((Date.now() - t0) / 1000).toFixed(0)}s   `);
      }
    },
  });
  fs.renameSync(tmp, file);
  console.log(`\npass ${k + 1} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
const missing = passes.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.log(`not mixing yet, missing: ${missing.join(', ')}`);
  process.exit(0);
}

const audio = 'public/soundtrack.wav';
const args = ['-y', '-loglevel', 'error'];
passes.forEach((p) => args.push('-i', p));
const hasAudio = fs.existsSync(audio) && !range;
if (hasAudio) args.push('-i', audio);
const mix = passes.length > 1 ? `${passes.map((_, i) => `[${i}:v]`).join('')}mix=inputs=${passes.length}[m];[m]` : '[0:v]';
args.push('-filter_complex', `${mix}format=yuv420p[v]`, '-map', '[v]');
if (hasAudio) args.push('-map', `${passes.length}:a`, '-c:a', 'aac', '-b:a', '256k', '-shortest');
args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'film', '-r', '60', '-movflags', '+faststart', OUT);
execFileSync('ffmpeg', args, {stdio: 'inherit'});
console.log(`wrote ${OUT}`);
