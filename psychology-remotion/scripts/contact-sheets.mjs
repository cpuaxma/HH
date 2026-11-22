// Contact sheets: renders evenly spaced frames from every scene and tiles them, one sheet per scene.
//   node scripts/contact-sheets.mjs [outDir=out/contact] [perScene=6] [scale=0.5]
//   node scripts/contact-sheets.mjs out/strip 0 0.5 --frames=440,444,448 --name=drop   (a custom strip)
// Needs ffmpeg on PATH (the DejaVu font is used for the frame labels).
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const [outDir = 'out/contact', perSceneArg = '6', scaleArg = '0.5'] = args.filter((a) => !a.startsWith('--'));
const perScene = Number(perSceneArg);
const scale = Number(scaleArg);
const textOnly = args.includes('--text-only');

const SCENES = [
  ['1-cold-open', 0, 100],
  ['2-rewind', 90, 170],
  ['3-question', 160, 250],
  ['4a-climb', 240, 390],
  ['4b-peak', 380, 460],
  ['4c-drop', 446, 592],
  ['4d-bottom', 586, 664],
  ['4e-recovery', 660, 760],
  ['5-reveal', 750, 880],
  ['6-crowd', 870, 1000],
  ['7-quote', 990, 1135],
  ['8-lesson', 1125, 1210],
  ['9-cta', 1200, 1350],
];

const jobs = flag('frames')
  ? [[flag('name') ?? 'strip', flag('frames').split(',').map(Number)]]
  : SCENES.map(([name, a, b]) => [name, Array.from({length: perScene}, (_, i) => Math.round(a + ((b - a - 1) * (i + 0.5)) / perScene))]);

mkdirSync(outDir, {recursive: true});
const tmp = path.join(outDir, '_frames');
const gl = process.env.REMOTION_GL ?? 'swangle';
const chromiumOptions = {gl};
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
const id = textOnly ? 'Psychology-TextOnly' : 'Psychology';
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, chromiumOptions});
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const t0 = Date.now();
let n = 0;
for (const [name, frames] of jobs) {
  rmSync(tmp, {recursive: true, force: true});
  mkdirSync(tmp, {recursive: true});
  for (let i = 0; i < frames.length; i++) {
    const output = path.join(tmp, `${String(i).padStart(3, '0')}.jpg`);
    await renderStill({composition, serveUrl, frame: frames[i], output, scale, puppeteerInstance: browser, chromiumOptions, imageFormat: 'jpeg', jpegQuality: 88});
    // stamp the frame number
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', output, '-vf', `drawtext=fontfile=${font}:text='${frames[i]}':x=12:y=12:fontsize=${Math.round(28 * scale * 2)}:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6`, output]);
    n++;
  }
  const cols = Math.min(frames.length, 6);
  const rows = Math.ceil(frames.length / cols);
  const sheet = path.join(outDir, `${name}.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-vf', `tile=${cols}x${rows}:padding=6:color=0x202020`, '-frames:v', '1', '-q:v', '3', sheet]);
  console.log(sheet);
}
rmSync(tmp, {recursive: true, force: true});
await browser.close({silent: true});
console.log(`${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
