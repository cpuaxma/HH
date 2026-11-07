// Renders a reel page frame by frame at 1080x1920 and encodes an MP4 with ffmpeg.
// Usage: node tools/export-video.js [fps=60] [out=exports/hot-pepper-intro.mp4] [page=index.html]
// e.g.   node tools/export-video.js 30 exports/miran-gold.mp4 miran-gold/index.html
// The page may carry extra URL options: miran-gold/index.html?nocaptions
// Set SIZE=1080x1080 (WIDTHxHEIGHT) for a size other than 1080x1920.
// Set SCALE=2 to render at 2x pixel density (SIZE 1080x1920 -> a 2160x3840 video).
// Add OUT=1080x1920 to downsample that render back to 1080p (supersampled, sharper edges and texture).
// Set BLUR=4 (or 8) for motion blur: each output frame averages that many sub-frames spread over the
// shutter (SHUTTER=0.5 is a 180-degree film shutter; 1 blurs across the whole frame interval).
// CRF=12 sets the x264 quality (lower is higher quality; 10-14 is visually lossless).
// JOBS=4 renders in that many browsers at once, each into a lossless segment, then joins and encodes
// them. Use it only with pages whose render(t) is a pure function of t (the sashimi pages are).
// SHOT=jpeg captures quality-100 JPEGs instead of PNGs (about 40% faster, visually the same).
// Needs Node with the `playwright` package (Chromium) and ffmpeg on PATH.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const fps = +(process.argv[2] || 60);
const out = path.resolve(process.argv[3] || 'exports/hot-pepper-intro.mp4');
const [page_file, page_query] = (process.argv[4] || 'index.html').split('?');
const page_url = 'file://' + path.resolve(__dirname, '..', page_file) + '?t=0' + (page_query ? '&' + page_query : '');
const [width, height] = (process.env.SIZE || '1080x1920').split('x').map(Number);
const scale = +(process.env.SCALE || 1);
const blur = Math.max(1, Math.round(+(process.env.BLUR || 1)));
const shutter = Math.min(1, Math.max(0, +(process.env.SHUTTER || 0.5)));
const jobs = Math.max(1, Math.round(+(process.env.JOBS || 1)));
const shot = process.env.SHOT === 'jpeg' ? { type: 'jpeg', quality: 100 } : { type: 'png' };
const finalCodec = ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(process.env.CRF || 12), '-profile:v', 'high',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
const scaleVF = process.env.OUT ? [`scale=${process.env.OUT.replace('x', ':')}:flags=lanczos`] : [];
// sub-frames come in at fps * blur; tmix averages each group and select keeps one frame per group
const blurVF = blur > 1 ? [`tmix=frames=${blur}`, `select=eq(mod(n\\,${blur})\\,${blur - 1})`, 'setpts=PTS-STARTPTS'] : [];
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;   // behind a proxy, Chromium needs it to reach Google Fonts

async function openPage() {
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(page_url);
  await page.waitForFunction(() => !document.querySelector('#stage').classList.contains('waiting'));
  return { browser, page };
}

// Render output frames [a, b) and pipe them through ffmpeg into file with the given codec args
async function renderRange(a, b, file, vf, codec, progress) {
  const { browser, page } = await openPage();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps * blur), '-i', '-',
    ...(vf.length ? ['-vf', vf.join(',')] : []), '-r', String(fps), ...codec, file], { stdio: ['pipe', 'inherit', 'inherit'] });
  // render(t) with still=false steps the timeline exactly like playback (one-frame flashes included)
  await page.evaluate(() => { lastT = -1; });
  for (let k = a; k < b; k++) {
    for (let j = 0; j < blur; j++) {
      // sub-frame times are centred on the frame time (clamped to the start of the timeline)
      const t = blur > 1 ? Math.max(0, (k + ((j + 0.5) / blur - 0.5) * shutter) / fps) : k / fps;
      await page.evaluate(t => render(t), t);
      const img = await page.screenshot(shot);
      if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
    }
    progress(k);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error('ffmpeg exited ' + c)) : res())));
  await browser.close();
}

(async () => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const probe = await openPage();
  const duration = await probe.page.evaluate(() => DURATION);
  // a page with LOOP = true is a seamless loop: its last frame would repeat frame 0, so leave it out
  const loop = await probe.page.evaluate(() => typeof LOOP !== 'undefined' && LOOP === true);
  await probe.browser.close();
  const total = Math.round(duration * fps) + (loop ? 0 : 1);
  const t0 = Date.now();

  if (jobs === 1) {
    await renderRange(0, total, out, [...blurVF, ...scaleVF], finalCodec,
      k => { if (k % fps === 0) process.stdout.write(`\r${(k / fps).toFixed(0)}s / ${duration}s`); });
  } else {
    const tmp = fs.mkdtempSync(path.join(path.dirname(out), '.export-'));
    const done = new Array(jobs).fill(0), per = Math.ceil(total / jobs), segs = [];
    const report = () => process.stdout.write(`\r${done.reduce((a, b) => a + b, 0)} / ${total} frames`);
    await Promise.all(Array.from({ length: jobs }, (_, i) => {
      const a = i * per, b = Math.min(total, a + per), file = path.join(tmp, `seg${i}.mkv`);
      if (a >= b) return null;
      segs[i] = file;
      // lossless intermediate segments; the scale and the final encode happen once, after the join
      return renderRange(a, b, file, blurVF, ['-c:v', 'libx264rgb', '-preset', 'ultrafast', '-qp', '0'],
        k => { done[i] = k - a + 1; if (k % 10 === 0) report(); });
    }));
    const list = path.join(tmp, 'list.txt');
    fs.writeFileSync(list, segs.filter(Boolean).map(f => `file '${f}'`).join('\n'));
    await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
      ...(scaleVF.length ? ['-vf', scaleVF.join(',')] : []), '-r', String(fps), ...finalCodec, out], { stdio: 'inherit' })
      .on('close', c => (c ? rej(new Error('ffmpeg exited ' + c)) : res())));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`\nSaved ${out} (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
})();
