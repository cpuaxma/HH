// Plots visual-event density over the timeline and checks the "new event at least every 1.5 s" rule.
//   npm run events   ->  docs/event-density.svg (+ .png when Playwright is installed)
import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {SCENES, VIDEO} from '../src/config';
import {visualEvents} from '../src/lib/events';

const MAX_GAP = 45; // 1.5 s at 30 fps
const ev = visualEvents();
const frames = [...new Set(ev.map((e) => e.frame))].sort((a, b) => a - b);
const pts = [0, ...frames, VIDEO.durationInFrames].filter((v, i, a) => i === 0 || v !== a[i - 1]);
const gaps = pts.slice(1).map((f, i) => ({from: pts[i], to: f, gap: f - pts[i]}));
const worst = gaps.reduce((a, b) => (b.gap > a.gap ? b : a));

// ---- SVG
const W = 1600, H = 620, L = 70, R = 30, T = 70, B = 120;
const pw = W - L - R, ph = H - T - B;
const x = (f: number) => L + (f / VIDEO.durationInFrames) * pw;
const yMax = 60;
const y = (g: number) => T + ph - (g / yMax) * ph;
const ink = '#2B2A27', muted = '#6E6A60', grid = '#E6E2D8', bar = '#B8902A', bg = '#FBFAF6';
const out: string[] = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
out.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
out.push(`<text x="${L}" y="34" font-size="22" font-weight="700" fill="${ink}">Visual event density: gap before each new event (frames, 30 fps)</text>`);
out.push(`<text x="${L}" y="58" font-size="15" fill="${muted}">${ev.length} events, ${frames.length} distinct frames. Longest gap: ${worst.gap} frames (${(worst.gap / 30).toFixed(2)} s), frames ${worst.from}-${worst.to}. Rule: no gap over ${MAX_GAP} frames (1.5 s).</text>`);
// scene bands
Object.entries(SCENES).forEach(([k, s], i) => {
  out.push(`<rect x="${x(s.from)}" y="${T}" width="${x(s.from + s.duration) - x(s.from)}" height="${ph}" fill="${i % 2 ? '#F1EEE6' : '#F7F5EF'}"/>`);
  out.push(`<text x="${(x(s.from) + x(s.from + s.duration)) / 2}" y="${T + ph + 44}" font-size="13" fill="${muted}" text-anchor="middle">${k}</text>`);
});
for (const g of [0, 15, 30, 45, 60]) {
  out.push(`<line x1="${L}" x2="${L + pw}" y1="${y(g)}" y2="${y(g)}" stroke="${grid}" stroke-width="1"/>`);
  out.push(`<text x="${L - 10}" y="${y(g) + 4}" font-size="12" fill="${muted}" text-anchor="end">${g}</text>`);
}
for (const g of gaps) {
  const bw = Math.max(2, x(g.to) - x(g.from) - 2);
  out.push(`<rect x="${x(g.from) + 1}" y="${y(g.gap)}" width="${bw}" height="${y(0) - y(g.gap)}" rx="2" fill="${bar}"><title>${g.from}-${g.to}: ${g.gap} frames</title></rect>`);
}
// event ticks along the bottom
for (const f of frames) out.push(`<line x1="${x(f)}" x2="${x(f)}" y1="${T + ph + 6}" y2="${T + ph + 18}" stroke="${ink}" stroke-width="1.5"/>`);
out.push(`<line x1="${L}" x2="${L + pw}" y1="${y(MAX_GAP)}" y2="${y(MAX_GAP)}" stroke="${ink}" stroke-width="2" stroke-dasharray="6 5"/>`);
out.push(`<text x="${L + pw}" y="${y(MAX_GAP) - 8}" font-size="13" fill="${ink}" text-anchor="end">1.5 s limit</text>`);
for (let s = 0; s <= 45; s += 5) out.push(`<text x="${x(s * 30)}" y="${T + ph + 70}" font-size="12" fill="${muted}" text-anchor="middle">${s}s</text>`);
out.push(`<text x="${L}" y="${H - 18}" font-size="12" fill="${muted}">Bars: frames since the previous visual event. Ticks: event frames. Background bands: scenes.</text>`);
out.push('</svg>');
mkdirSync('docs', {recursive: true});
writeFileSync('docs/event-density.svg', out.join('\n'));
writeFileSync('docs/event-list.json', JSON.stringify(ev, null, 1));
console.log(`events: ${ev.length}, longest gap ${worst.gap} frames (${worst.from}-${worst.to})`);

// PNG via Playwright if available (optional)
const toPng = async () => {
try {
  const req = createRequire(__filename);
  let pw: any;
  try { pw = req('playwright'); } catch { pw = req(execSync('npm root -g').toString().trim() + '/playwright'); }
  const b = await pw.chromium.launch();
  const p = await b.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 2});
  await p.setContent(`<html><body style="margin:0">${out.join('')}</body></html>`);
  await p.screenshot({path: 'docs/event-density.png'});
  await b.close();
  console.log('docs/event-density.png');
} catch {
  console.log('(Playwright not found: SVG only)');
}
};
toPng().then(() => {
  if (worst.gap > MAX_GAP) process.exit(1);
});
