// Bundles once, then renders review stills at the given frames.
// Usage: node scripts/stills.mjs <outDir> [frames...]
// Set REMOTION_BROWSER to use a specific Chrome/Chromium binary, REMOTION_GL to pick the GL backend.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const CHECKPOINTS = [10, 60, 125, 200, 250, 320, 430, 470, 560, 640, 700, 770, 820, 890, 950, 1000, 1060, 1160, 1250, 1330, 1365, 1400, 1460, 1530, 1600, 1700, 1790];
const [outDir = 'out/stills', ...args] = process.argv.slice(2);
const frames = args.length ? args.map(Number) : CHECKPOINTS;
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromiumOptions = {gl: process.env.REMOTION_GL ?? 'swangle'};

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'HpmAudit', browserExecutable, chromiumOptions});
for (const frame of frames) {
  const output = path.join(outDir, `${String(frame).padStart(4, '0')}.png`);
  const t0 = Date.now();
  await renderStill({composition, serveUrl, output, frame, browserExecutable, chromiumOptions, timeoutInMilliseconds: 120000});
  console.log(output, `${Date.now() - t0}ms`);
}
