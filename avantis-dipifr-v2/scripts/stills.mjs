// Renders QA stills: node scripts/stills.mjs [outDir] [scale] [frame,frame,...] [--safe]
// Defaults: out/stills, scale 0.5, one or more frames from each scene.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const args = process.argv.slice(2);
const safe = args.includes('--safe');
const [outDir = 'out/stills', scaleArg = '0.5', framesArg = '0,40,75,110,200,270,330,388,440,600,880,1010,1060,1120,1260,1400,1520,1790'] = args.filter((a) => a !== '--safe');
const frames = framesArg.split(',').map(Number);
const scale = Number(scaleArg);

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {showSafeZones: safe};
const chromiumOptions = {gl: 'swangle'};
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({serveUrl, id: 'AvantisDipIFR', inputProps, chromiumOptions, browserExecutable});

for (const frame of frames) {
  const output = path.join(outDir, `frame-${String(frame).padStart(4, '0')}${safe ? '-safe' : ''}.png`);
  const t = Date.now();
  await renderStill({composition, serveUrl, frame, output, scale, inputProps, chromiumOptions, browserExecutable, overwrite: true});
  console.log(`${output}  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
}
