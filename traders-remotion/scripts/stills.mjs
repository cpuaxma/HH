// Contact sheets for QA.
//   node scripts/stills.mjs <outDir> <frames: "10,50,120" or "100-200:10"> [--scale=0.5] [--comp=TradersArena] [--props='{"showSafeZone":true}'] [--sheet=name]
// Bundles once, keeps one browser open, renders each frame as a still, then tiles them into a
// labelled contact sheet with ffmpeg.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=');
const [outDir = 'out/stills', framesArg = '0,60,120'] = args.filter((a) => !a.startsWith('--'));
const scale = Number(flag('scale', '0.5'));
const comp = flag('comp', 'TradersArena');
const props = JSON.parse(flag('props', '{}'));
const sheet = flag('sheet', 'sheet');
const cols = Number(flag('cols', '4'));

const frames = framesArg.split(',').flatMap((part) => {
  const m = part.match(/^(\d+)-(\d+)(?::(\d+))?$/);
  if (!m) return [Number(part)];
  const out = [];
  for (let f = Number(m[1]); f <= Number(m[2]); f += Number(m[3] ?? 1)) out.push(f);
  return out;
});

fs.mkdirSync(outDir, {recursive: true});
// Forward REMOTION_* variables into the page, like the CLI does.
const envVariables = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('REMOTION_')));
const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => undefined});
const browser = await openBrowser('chrome', {
  browserExecutable: process.env.REMOTION_BROWSER ?? null,
  chromiumOptions: {gl: 'swangle'},
});
const composition = await selectComposition({serveUrl, id: comp, inputProps: props, puppeteerInstance: browser, envVariables});
const files = [];
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  const s = Date.now();
  await renderStill({composition, serveUrl, frame, output, scale, inputProps: props, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, overwrite: true, envVariables});
  files.push({frame, output});
  console.log(`frame ${frame} → ${output} (${((Date.now() - s) / 1000).toFixed(1)}s)`);
}
await browser.close({silent: true});

if (files.length > 1) {
  const W = Math.round(1080 * scale);
  const H = Math.round(1920 * scale);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ['-i', f.output]);
  const labelled = files
    .map((f, i) => `[${i}:v]scale=${W}:${H},drawtext=text='${f.frame}':x=12:y=12:fontsize=${Math.round(40 * scale * 2)}:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6[v${i}]`)
    .join(';');
  const layout = files.map((_, i) => `${(i % cols) * W}_${Math.floor(i / cols) * H}`).join('|');
  const fill = rows * cols - files.length;
  const pads = fill > 0 ? `;color=c=0x202020:s=${W}x${H}:d=1[pad]` : '';
  const stack = `${labelled}${pads};${files.map((_, i) => `[v${i}]`).join('')}${fill > 0 ? '[pad]'.repeat(1) : ''}xstack=inputs=${files.length + (fill > 0 ? 1 : 0)}:layout=${layout}${fill > 0 ? `|${(files.length % cols) * W}_${Math.floor(files.length / cols) * H}` : ''}:fill=0x202020[out]`;
  const sheetPath = path.join(outDir, `${sheet}.jpg`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', stack, '-map', '[out]', '-frames:v', '1', '-q:v', '3', sheetPath]);
  console.log(`contact sheet → ${sheetPath}`);
}
console.log(`total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
