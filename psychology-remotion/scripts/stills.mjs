// Renders preview stills: node scripts/stills.mjs <outDir> <scale> <frame> [frame ...] [--text-only]
// Bundles once and reuses one browser, so a batch of frames is quick.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const textOnly = args.includes('--text-only');
const [outDir, scale, ...frames] = args.filter((a) => !a.startsWith('--'));
mkdirSync(outDir, {recursive: true});
const gl = process.env.REMOTION_GL ?? 'swangle';
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const chromiumOptions = {gl};

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const id = textOnly ? 'Psychology-TextOnly' : 'Psychology';
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, chromiumOptions});
for (const f of frames) {
  const output = path.join(outDir, `${textOnly ? 't' : 'f'}${String(f).padStart(4, '0')}.jpg`);
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: Number(f), output, scale: Number(scale), puppeteerInstance: browser, chromiumOptions, imageFormat: 'jpeg', jpegQuality: 90});
  console.log(output, `${Date.now() - t0} ms`);
}
await browser.close({silent: true});
