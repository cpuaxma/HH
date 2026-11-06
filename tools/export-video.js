// Renders a reel page frame by frame at 1080x1920 and encodes an MP4 with ffmpeg.
// Usage: node tools/export-video.js [fps=60] [out=exports/hot-pepper-intro.mp4] [page=index.html]
// e.g.   node tools/export-video.js 30 exports/miran-gold.mp4 miran-gold/index.html
// The page may carry extra URL options: miran-gold/index.html?nocaptions
// Set SIZE=1080x1080 (WIDTHxHEIGHT) for a size other than 1080x1920.
// Set SCALE=2 to render at 2x pixel density (SIZE 1080x1920 -> a 2160x3840 video).
// Add OUT=1080x1920 to downsample that render back to 1080p (supersampled, sharper edges and texture).
// Needs Node with the `playwright` package (Chromium) and ffmpeg on PATH.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const fps = +(process.argv[2] || 60);
const out = path.resolve(process.argv[3] || 'exports/hot-pepper-intro.mp4');
const [page_file, page_query] = (process.argv[4] || 'index.html').split('?');
const page_url = 'file://' + path.resolve(__dirname, '..', page_file) + '?t=0' + (page_query ? '&' + page_query : '');

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // behind a proxy, Chromium needs it passed explicitly to reach Google Fonts
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  const [width, height] = (process.env.SIZE || '1080x1920').split('x').map(Number);
  const scale = +(process.env.SCALE || 1);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(page_url);
  await page.waitForFunction(() => !document.querySelector('#stage').classList.contains('waiting'));
  const duration = await page.evaluate(() => DURATION);
  const frames = Math.round(duration * fps);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    ...(process.env.OUT ? ['-vf', `scale=${process.env.OUT.replace('x', ':')}:flags=lanczos`] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  // render(t) with still=false steps the timeline exactly like playback (one-frame flashes included)
  await page.evaluate(() => { lastT = -1; });
  // a page with LOOP = true is a seamless loop: its last frame would repeat frame 0, so leave it out
  const loop = await page.evaluate(() => typeof LOOP !== 'undefined' && LOOP === true);
  for (let k = 0; k < frames + (loop ? 0 : 1); k++) {
    await page.evaluate(t => render(t), k / fps);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (k % fps === 0) process.stdout.write(`\r${(k / fps).toFixed(0)}s / ${duration}s`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error('ffmpeg exited ' + c)) : res())));
  await browser.close();
  console.log(`\nSaved ${out}`);
})();
