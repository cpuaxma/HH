// Bundles once, then renders stills for both languages.
// Usage: node scripts/stills.mjs <outDir> <frame> [frame...]
// Set REMOTION_BROWSER to use a specific Chrome/Chromium binary.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const langs = (process.env.LANGS ?? 'en,ar').split(',');
const browserExecutable = process.env.REMOTION_BROWSER ?? null;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const lang of langs) {
  const inputProps = {lang};
  const composition = await selectComposition({serveUrl, id: 'GoldDollar', inputProps, browserExecutable});
  for (const f of frames.map(Number)) {
    const output = path.join(outDir, `${lang}-${String(f).padStart(4, '0')}.png`);
    await renderStill({composition, serveUrl, output, frame: f, inputProps, browserExecutable});
    console.log(output);
  }
}
