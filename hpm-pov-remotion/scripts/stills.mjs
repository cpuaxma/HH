// Bundles once, then renders review stills.
// Usage: node scripts/stills.mjs <outDir> [seconds...]   (defaults to the QA checkpoints)
// Set REMOTION_BROWSER to use a specific Chrome/Chromium binary.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

// cold open, rewind, quiet phone, hire, week 1, week 4, month 3, overheat, CTA
const CHECKPOINTS = [0.8, 2.7, 4.8, 7.6, 10.8, 13.6, 17, 21.3, 28];
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
