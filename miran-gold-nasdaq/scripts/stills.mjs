// Renders preview stills of key frames with one bundle: node scripts/stills.mjs [frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const list = frames.length ? frames : [45, 89, 150, 250, 330, 420, 500, 560, 650, 740, 840, 890, 940, 989];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({serveUrl, id: 'NasdaqReel', browserExecutable});
for (const frame of list) {
  const output = path.resolve(`out/stills/frame-${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, frame, output, scale: 0.5, browserExecutable});
  console.log('wrote', output);
}
