// Safe-zone check (reused from sp500-remotion): renders the text-only composition at half size, then measures the brightest
// pixel inside each unsafe band (top 250 px, bottom 350 px, 90 px side margins) on every frame.
// Any frame whose text reaches into a band is listed. Needs ffmpeg on PATH.
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

const THRESHOLD = Number(process.env.SAFE_THRESHOLD ?? 70); // luma 16..235; faint glow stays below this
const out = 'out/check-text-only.mp4';
mkdirSync('out', {recursive: true});

if (!process.argv.includes('--skip-render')) {
  execFileSync('npx', ['remotion', 'render', 'Psychology-TextOnly', out, '--scale=0.5', '--crf=8', '--muted', '--log=error', '--concurrency=4'], {stdio: 'inherit'});
}

// half-size frame is 540 x 960
const bands = {
  top: 'crop=540:125:0:0',
  bottom: 'crop=540:175:0:785',
  left: 'crop=45:960:0:0',
  right: 'crop=45:960:495:0',
};

let failures = 0;
for (const [name, crop] of Object.entries(bands)) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', out, '-vf', `${crop},signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-`, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  const lines = r.stdout.split('\n');
  const bad = [];
  let frame = -1;
  let worst = 0;
  for (const line of lines) {
    const fm = line.match(/^frame:(\d+)/);
    if (fm) frame = Number(fm[1]);
    const ym = line.match(/YMAX=(\d+)/);
    if (ym) {
      const y = Number(ym[1]);
      worst = Math.max(worst, y);
      if (y > THRESHOLD) bad.push(`${frame}(${y})`);
    }
  }
  console.log(`${name.padEnd(6)} max luma ${worst}  ${bad.length ? `OUTSIDE SAFE ZONE on ${bad.length} frames: ${bad.slice(0, 20).join(' ')}` : 'ok'}`);
  failures += bad.length;
}
process.exit(failures ? 1 : 0);
