// Bundles once, then renders review stills.
// Usage: node scripts/stills.mjs <outDir> [seconds...]   (defaults to the QA checkpoints)
// Set REMOTION_BROWSER to use a specific Chrome/Chromium binary.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const CHECKPOINTS = [2.5, 5.5, 9, 15, 19.5, 22.5, 28];
const [outDir = 'out/stills', ...args] = process.argv.slice(2);
const seconds = args.length ? args.map(Number) : CHECKPOINTS;
const browserExecutable = process.env.REMOTION_BROWSER ?? null;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'HpmPov', browserExecutable});
for (const s of seconds) {
  const frame = Math.round(s * composition.fps);
  const output = path.join(outDir, `${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, browserExecutable});
  console.log(output);
}
