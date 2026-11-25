// Masters the soundtrack of a rendered video: a brick-wall limiter so stacked hits never clip
// (target ≤ −1 dBTP for social platforms). The video stream is copied untouched.
//   node scripts/master-audio.mjs [in=out/traders-raw.mp4] [out=out/traders.mp4]
import {execFileSync} from 'node:child_process';

const [input = 'out/traders-raw.mp4', output = 'out/traders.mp4'] = process.argv.slice(2);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-map', '0:v', '-map', '0:a', '-c:v', 'copy', '-af', 'aresample=192000,alimiter=limit=0.82:attack=1:release=60:level=false,aresample=48000', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', output], {stdio: 'inherit'});
console.log(`${output}: mastered`);
