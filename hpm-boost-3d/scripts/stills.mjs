// QA stills: node scripts/stills.mjs [outDir] [scale] [frame,frame,...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {browserExecutable} from './browser.mjs';

const [outDir = 'out/stills', scaleArg = '0.5', framesArg = '30,120,200,250,290,330,420,480,560,700'] = process.argv.slice(2);
const frames = framesArg.split(',').map(Number);
const scale = Number(scaleArg);
const sub = Number(process.env.SUB ?? 0);

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {sub};
const chromiumOptions = {gl: 'swangle'};
const composition = await selectComposition({serveUrl, id: 'BoostAd', inputProps, chromiumOptions, browserExecutable});

for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  const t = Date.now();
  await renderStill({
    composition,
    serveUrl,
    frame,
    output,
    scale,
    inputProps,
    chromiumOptions,
    browserExecutable,
    overwrite: true,
    onBrowserLog: (l) => (l.type === 'error' || l.type === 'warning') && console.log(`  [${l.type}] ${l.text.slice(0, 300)}`),
  });
  console.log(`${output}  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
}
