// Times a frame range in one browser session: node scripts/bench.mjs <first> <last> [scale]
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [first = '150', last = '160', scaleArg = '1', dbg = '', id = 'HpmCompetitor'] = process.argv.slice(2);
const inputProps = {dbg};
const LOCAL_SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync(LOCAL_SHELL) ? LOCAL_SHELL : null);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const composition = await selectComposition({serveUrl, id, chromiumOptions, browserExecutable, inputProps});
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-'));
const t0 = Date.now();
let last_t = t0;
await renderFrames({
  composition, serveUrl, outputDir, chromiumOptions, inputProps, browserExecutable, concurrency: 1, scale: Number(scaleArg),
  frameRange: [Number(first), Number(last)], imageFormat: 'png', timeoutInMilliseconds: 240000,
  onStart: () => undefined,
  onFrameUpdate: (n, frame) => { const now = Date.now(); console.log(`frame ${frame} done ${(now - last_t)}ms`); last_t = now; },
  onBrowserLog: (l) => { if (l.text.startsWith('[mb]')) console.log('  ' + l.text); },
});
console.log(`total ${((Date.now() - t0) / 1000).toFixed(1)}s, frames in ${outputDir}`);
