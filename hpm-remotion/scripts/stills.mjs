// Bundles once, then renders review stills.
// Usage: node scripts/stills.mjs <outDir> [frame...]   (defaults to every scene and beat midpoint)
// Set REMOTION_BROWSER to use a specific Chrome/Chromium binary.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const MIDPOINTS = [90, 280, 490, 695, 900, 1100, 1315, 1615];
const [outDir = 'out/stills', ...args] = process.argv.slice(2);
const frames = args.length ? args.map(Number) : MIDPOINTS;
const browserExecutable = process.env.REMOTION_BROWSER ?? null;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'HpmServices', browserExecutable});
for (const f of frames) {
  const output = path.join(outDir, `${String(f).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame: f, browserExecutable});
  console.log(output);
}
