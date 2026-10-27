// Render stills from one bundle. Usage:
//   node scripts/frames.mjs <outDir> [comp=CookieDealer] [frames=0,30,...|every:30] [samples=1]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir = 'out/frames', comp = 'CookieDealer', framesArg = 'every:30', samples = '1'] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const props = {backdrop: comp === 'CookieDealerGreen' ? 'green' : comp === 'CookieDealerAlpha' ? 'transparent' : 'paper', motionBlurSamples: Number(samples)};
const composition = await selectComposition({serveUrl, id: comp, inputProps: props, browserExecutable});
const frames = framesArg.startsWith('every:')
	? Array.from({length: Math.ceil(composition.durationInFrames / Number(framesArg.slice(6)))}, (_, i) => i * Number(framesArg.slice(6)))
	: framesArg.split(',').map(Number);
for (const frame of frames) {
	const output = path.join(outDir, `f${String(frame).padStart(3, '0')}.png`);
	await renderStill({composition, serveUrl, frame, output, inputProps: props, browserExecutable});
	console.log(output);
}
