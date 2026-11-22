// QA stills. Bundles once, then renders each frame.
// Usage: node scripts/stills.mjs [--audit] [frame...]
//   default frames: 15 90 210 400 520 620 735  → out/stills/ (or out/stills-audit/ with --audit)
// --audit draws the safe zone (cyan) and every text box (green = inside, red = outside).
// Set REMOTION_BROWSER to use a local Chrome/Chromium.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const args = process.argv.slice(2);
const audit = args.includes('--audit');
const picked = args.filter((a) => /^\d+$/.test(a)).map(Number);
const frames = picked.length ? picked : [15, 90, 210, 400, 520, 620, 735];
const outDir = audit ? 'out/stills-audit' : 'out/stills';
const browserExecutable = process.env.REMOTION_BROWSER ?? null;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('assets')});
const inputProps = {fontSource: 'auto', debugSafeZone: audit};
const composition = await selectComposition({serveUrl, id: 'Reel', inputProps, browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `${String(frame).padStart(4, '0')}.png`);
  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    inputProps: composition.props,
    browserExecutable,
    onBrowserLog: (log) => {
      if (log.text.startsWith('[safe-zone]')) console.log(log.text);
    },
  });
  console.log(output);
}
