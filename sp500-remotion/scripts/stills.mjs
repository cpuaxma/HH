// Renders preview stills: node scripts/stills.mjs <outDir> <scale> <frame> [frame ...] [--text-only]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const args = process.argv.slice(2);
const textOnly = args.includes('--text-only');
const [outDir, scale, ...frames] = args.filter((a) => a !== '--text-only');
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromeMode = process.env.REMOTION_BROWSER?.includes('headless') || !process.env.REMOTION_BROWSER ? 'headless-shell' : 'chrome-for-testing';

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const id = textOnly ? 'SP500-TextOnly' : 'SP500';
const composition = await selectComposition({serveUrl, id, browserExecutable, chromeMode});
for (const f of frames) {
  const output = path.join(outDir, `${textOnly ? 't' : 'f'}${String(f).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, frame: Number(f), output, scale: Number(scale), browserExecutable, chromeMode});
  console.log(output);
}
