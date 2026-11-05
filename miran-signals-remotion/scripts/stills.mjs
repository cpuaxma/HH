// Renders QA stills: node scripts/stills.mjs [outDir] [scale] [frame,frame,...] [--safe] [--feed]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const safe = args.includes('--safe');
const feed = args.includes('--feed');
const [outDir = 'out/stills', scaleArg = '0.5', framesArg = '120,336,672,768,924,984,1200,1296,1368,1476,1740'] = args.filter((a) => !a.startsWith('--'));
const frames = framesArg.split(',').map(Number);
const scale = Number(scaleArg);
const id = process.env.COMP ?? (feed ? 'MiranSignals4x5' : 'MiranSignals');

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {showSafeZones: safe};
const chromiumOptions = {gl: 'swangle'};
const LOCAL_SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync(LOCAL_SHELL) ? LOCAL_SHELL : null);
const composition = await selectComposition({serveUrl, id, inputProps, chromiumOptions, browserExecutable});

for (const frame of frames) {
  const output = path.join(outDir, `${feed ? 'feed-' : ''}frame-${String(frame).padStart(4, '0')}${safe ? '-safe' : ''}.png`);
  const t = Date.now();
  await renderStill({
    composition, serveUrl, frame, output, scale, inputProps, chromiumOptions, browserExecutable, overwrite: true,
    timeoutInMilliseconds: 120000,
    onBrowserLog: (l) => { if (l.type === 'error' || l.text.startsWith('[')) console.log('[browser]', l.type, l.text.slice(0, 300)); },
  });
  console.log(`${output}  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
}
