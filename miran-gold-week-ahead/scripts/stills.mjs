// Render stills at given frames with one bundle: node scripts/stills.mjs out/dir 150 440 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...frames] = process.argv.slice(2);
const scale = Number(process.env.SCALE ?? 1);
const comp = process.env.COMP ?? 'WeekAhead';
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {};
const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable});
for (const fr of frames) {
  const output = path.join(outDir, `f${String(fr).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: Number(fr), output, inputProps, scale, browserExecutable, chromiumOptions: {gl: 'swangle'}});
  console.log('wrote', output);
}
