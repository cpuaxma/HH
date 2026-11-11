// Draws every line-art animal (and a few poses) to an HTML page and screenshots it:
// out/art-gallery.png. For iterating on the shapes in src/animals/art/shapes.ts.
import * as fs from 'fs';
import * as path from 'path';
import {ART_SHAPES} from '../src/animals/art/shapes';
import {drawShape, shapeDefs, shapeStats} from '../src/animals/art/render';

const root = process.cwd();
const only = process.env.ONLY?.split(',');
const shapes = ART_SHAPES.filter((s) => !only || only.includes(s.id));
const W = 1080;
const H = 900;
const extra = (process.env.POSES ?? '').split(';').filter(Boolean);
const cells: string[] = [];
for (const s of shapes) {
  const uid = `g-${s.id}`;
  const poses = [{x: W / 2, y: H * (process.env.Y ? +process.env.Y : 0.86), s: 0.85, sheenX: null as number | null}, ...extra.map((p) => ({x: W / 2, y: H * 0.86, s: 0.85, ...JSON.parse(p)}))];
  for (const p of poses) {
    cells.push(
      `<div class="c"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${shapeDefs(uid)}${drawShape(s, p, uid)}</svg><span>${s.id} · ${shapeStats(s)} facets</span></div>`,
    );
  }
}
const html = `<!doctype html><html><body style="margin:0;background:radial-gradient(circle at 50% 40%,#1a2340,#070b16);display:flex;flex-wrap:wrap;width:${W * 2}px">
<style>.c{position:relative}.c span{position:absolute;left:16px;top:12px;color:#8a93a8;font:20px sans-serif}</style>${cells.join('')}</body></html>`;
const out = path.join(root, 'out');
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'art-gallery.html'), html);
(async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {chromium} = require('playwright');
  const b = await chromium.launch();
  const pg = await b.newPage({viewport: {width: W * 2, height: 400}});
  await pg.goto('file://' + path.join(out, 'art-gallery.html'));
  await pg.screenshot({path: path.join(out, 'art-gallery.png'), fullPage: true});
  await b.close();
  console.log('out/art-gallery.png');
})();
