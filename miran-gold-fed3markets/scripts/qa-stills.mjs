// Renders QA stills in one browser session: node scripts/qa-stills.mjs <outdir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const comp = process.env.COMP ?? 'Fed3Markets';
const executable = process.env.REMOTION_BROWSER ?? fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-')).map((d) => {
  const sub = fs.readdirSync(path.join('/opt/pw-browsers', d)).find((s) => s.startsWith('chrome-headless-shell'));
  return path.join('/opt/pw-browsers', d, sub, 'chrome-headless-shell');
})[0];
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: executable});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const f of frames) {
  await renderStill({composition, serveUrl, frame: Number(f), output: path.join(outDir, `f${String(f).padStart(4, '0')}.png`), puppeteerInstance: browser, scale: Number(process.env.SCALE ?? 1)});
  process.stdout.write(`${f} `);
}
await browser.close({silent: true});
console.log('done');
