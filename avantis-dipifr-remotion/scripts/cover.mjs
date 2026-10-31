// Exports the 1080x1920 PNG cover: node scripts/cover.mjs [output]  (frame: TIMING.coverFrame in src/data.ts)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const output = process.argv[2] ?? 'out/avantis-dipifr-cover.png';
const frame = Number(fs.readFileSync('src/data.ts', 'utf8').match(/coverFrame:\s*(\d+)/)[1]);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({serveUrl, id: 'AvantisDipIFR', chromiumOptions, browserExecutable});
await renderStill({composition, serveUrl, frame, output, scale: 1, chromiumOptions, browserExecutable, overwrite: true});
console.log(`${output} (frame ${frame})`);
