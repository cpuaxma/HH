// The post images, drawn procedurally (no photos, no real brands). Each is drawn
// once into a cached 3× offscreen canvas and then reused on every frame.
import {BRAND, COMPETITOR, YOU} from '../data';
import {font, pepper, rng} from './kit';

const S = 352; // art is designed in a 352 × 352 square
const RES = 3;
const cache = new Map<string, HTMLCanvasElement>();

const cached = (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => {
  let c = cache.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = S * RES;
    c.height = S * RES;
    const ctx = c.getContext('2d')!;
    ctx.scale(RES, RES);
    draw(ctx);
    cache.set(key, c);
  }
  return c;
};

const headline = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, tracking = -1) => {
  ctx.font = font(400, size, true);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  (ctx as unknown as {letterSpacing: string}).letterSpacing = `${tracking}px`;
  ctx.fillText(s, x, y);
  (ctx as unknown as {letterSpacing: string}).letterSpacing = '0px';
};

/** An iced latte in a tall glass: coffee, a swirl of milk, ice, a straw, condensation. */
const icedLatte = (ctx: CanvasRenderingContext2D, cx: number, top: number, h: number) => {
  const wTop = h * 0.62;
  const wBot = h * 0.48;
  const glass = new Path2D();
  glass.moveTo(cx - wTop / 2, top);
  glass.lineTo(cx + wTop / 2, top);
  glass.lineTo(cx + wBot / 2, top + h);
  glass.quadraticCurveTo(cx, top + h + 8, cx - wBot / 2, top + h);
  glass.closePath();
  ctx.save();
  // Shadow on the "table"
  const sh = ctx.createRadialGradient(cx + 10, top + h + 6, 4, cx + 10, top + h + 6, wBot);
  sh.addColorStop(0, 'rgba(0,0,0,0.45)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(cx - wBot * 1.2, top + h - 14, wBot * 2.6, 40);
  ctx.clip(glass);
  // Coffee body, darker at the bottom.
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, '#F2E2CC');
  g.addColorStop(0.32, '#E3C29C');
  g.addColorStop(0.5, '#B06A35');
  g.addColorStop(0.78, '#6E3415');
  g.addColorStop(1, '#3E1A09');
  ctx.fillStyle = g;
  ctx.fillRect(cx - wTop, top, wTop * 2, h + 10);
  // Milk swirling down into the coffee.
  ctx.globalAlpha = 0.75;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const y0 = top + h * (0.36 + i * 0.06);
    ctx.moveTo(cx - wTop / 2, y0);
    ctx.bezierCurveTo(cx - wTop * 0.15, y0 + 26 - i * 3, cx + wTop * 0.1, y0 - 18 + i * 4, cx + wTop / 2, y0 + 10);
    ctx.lineWidth = 7 - i;
    ctx.strokeStyle = i % 2 ? '#F6E7D3' : '#D9AE80';
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Ice cubes.
  const cubes: [number, number, number, number][] = [
    [-0.24, 0.04, 0.3, -0.3],
    [0.12, 0.0, 0.32, 0.25],
    [-0.05, 0.2, 0.28, 0.1],
    [0.2, 0.24, 0.26, -0.15],
    [-0.22, 0.3, 0.25, 0.35],
  ];
  for (const [dx, dy, sz, rot] of cubes) {
    ctx.save();
    ctx.translate(cx + dx * wTop, top + h * (0.08 + dy));
    ctx.rotate(rot);
    const s = sz * wTop;
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.22);
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.28);
    ctx.lineTo(s * 0.12, -s * 0.32);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
    ctx.restore();
  }
  // Glass highlights.
  const hl = ctx.createLinearGradient(cx - wTop / 2, 0, cx + wTop / 2, 0);
  hl.addColorStop(0, 'rgba(255,255,255,0.0)');
  hl.addColorStop(0.12, 'rgba(255,255,255,0.55)');
  hl.addColorStop(0.2, 'rgba(255,255,255,0.0)');
  hl.addColorStop(0.82, 'rgba(255,255,255,0.0)');
  hl.addColorStop(0.9, 'rgba(255,255,255,0.35)');
  hl.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = hl;
  ctx.fillRect(cx - wTop, top, wTop * 2, h + 10);
  // Condensation.
  const r = rng(11);
  for (let i = 0; i < 70; i++) {
    const yy = top + 20 + r() * (h - 30);
    const span = wTop - (wTop - wBot) * ((yy - top) / h);
    const xx = cx + (r() - 0.5) * span * 0.95;
    const rad = 0.7 + r() * 1.8;
    ctx.beginPath();
    ctx.arc(xx, yy, rad, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }
  ctx.restore();
  // Rim and outline.
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke(glass);
  ctx.beginPath();
  ctx.ellipse(cx, top, wTop / 2, 6, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  // Straw.
  ctx.translate(cx + wTop * 0.12, top - 4);
  ctx.rotate(0.32);
  ctx.beginPath();
  ctx.roundRect(-5, -54, 10, 120, 5);
  ctx.fillStyle = BRAND.orange;
  ctx.fill();
  ctx.fillStyle = '#FFF1DE';
  for (let k = 0; k < 6; k++) ctx.fillRect(-5, -50 + k * 20, 10, 8);
  ctx.restore();
};

/** The competitor's scroll-stopper: espresso dark, hot orange, a giant headline, an iced latte. */
export const competitorArt = () =>
  cached('competitor', (ctx) => {
    const bg = ctx.createRadialGradient(250, 170, 20, 220, 200, 330);
    bg.addColorStop(0, '#5A3220');
    bg.addColorStop(0.55, '#2E1A10');
    bg.addColorStop(1, '#180C06');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    // Hot orange sun behind the glass.
    const sun = ctx.createRadialGradient(258, 168, 10, 258, 168, 118);
    sun.addColorStop(0, '#FFB15C');
    sun.addColorStop(0.55, BRAND.orange);
    sun.addColorStop(1, 'rgba(255,122,26,0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(258, 168, 118, 0, Math.PI * 2);
    ctx.fill();
    // Diagonal orange band.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 272);
    ctx.lineTo(S, 214);
    ctx.lineTo(S, 262);
    ctx.lineTo(0, 320);
    ctx.closePath();
    ctx.fillStyle = BRAND.red;
    ctx.fill();
    ctx.restore();
    icedLatte(ctx, 262, 92, 196);
    const [l1, l2, l3] = COMPETITOR.post.headline;
    headline(ctx, l1, 20, 74, 58, '#FFF3E3', -1.5);
    headline(ctx, l2, 20, 136, 58, BRAND.orange, -1.5);
    headline(ctx, l3, 20, 196, 58, BRAND.orange, -1.5);
    // Kicker on the band.
    ctx.save();
    ctx.translate(20, 302);
    ctx.rotate(-0.165);
    ctx.font = font(800, 13);
    ctx.fillStyle = '#FFF3E3';
    (ctx as unknown as {letterSpacing: string}).letterSpacing = '2px';
    ctx.fillText(COMPETITOR.post.kicker, 0, 0);
    (ctx as unknown as {letterSpacing: string}).letterSpacing = '0px';
    ctx.restore();
    // Monogram badge.
    ctx.beginPath();
    ctx.arc(S - 30, S - 30, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF3E3';
    ctx.fill();
    ctx.font = font(800, 12);
    ctx.fillStyle = '#2B1A12';
    ctx.textAlign = 'center';
    ctx.fillText(COMPETITOR.monogram, S - 30, S - 25.5);
    ctx.textAlign = 'left';
  });

/** Your dead post: a dim, flat, slightly tilted and soft photo of a cup on a table. */
export const deadArt = () =>
  cached('dead', (ctx) => {
    ctx.save();
    ctx.filter = 'blur(2.2px)';
    // Wall and table, tilted horizon.
    ctx.fillStyle = '#7C766A';
    ctx.fillRect(-20, -20, S + 40, S + 40);
    ctx.beginPath();
    ctx.moveTo(-20, 196);
    ctx.lineTo(S + 20, 214);
    ctx.lineTo(S + 20, S + 20);
    ctx.lineTo(-20, S + 20);
    ctx.closePath();
    ctx.fillStyle = '#5E5547';
    ctx.fill();
    // Saucer and cup, small and off-centre.
    ctx.beginPath();
    ctx.ellipse(146, 262, 66, 18, 0.03, 0, Math.PI * 2);
    ctx.fillStyle = '#A9A396';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(108, 196);
    ctx.lineTo(184, 198);
    ctx.lineTo(176, 254);
    ctx.quadraticCurveTo(146, 266, 116, 252);
    ctx.closePath();
    ctx.fillStyle = '#B5AEA2';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(186, 222, 14, 18, 0.1, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#A9A396';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(146, 197, 38, 8, 0.03, 0, Math.PI * 2);
    ctx.fillStyle = '#4D3D2E';
    ctx.fill();
    // Overexposed window glare, top right.
    const glare = ctx.createRadialGradient(300, 40, 4, 300, 40, 150);
    glare.addColorStop(0, 'rgba(250,246,226,0.85)');
    glare.addColorStop(1, 'rgba(250,246,226,0)');
    ctx.fillStyle = glare;
    ctx.fillRect(0, 0, S, S);
    ctx.restore();
    // Yellow cast, low contrast, heavy vignette, noise.
    ctx.fillStyle = 'rgba(150,130,60,0.16)';
    ctx.fillRect(0, 0, S, S);
    const v = ctx.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(20,16,10,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, S, S);
    const r = rng(5);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + r() * 0.06})`;
      ctx.fillRect(r() * S, r() * S, 1, 1);
    }
  });

/** Your new post after the flip: cream, a red-orange sun, latte art from above, a big headline. */
export const newArt = () =>
  cached('new', (ctx) => {
    ctx.fillStyle = '#F6E8D4';
    ctx.fillRect(0, 0, S, S);
    // Red sun.
    const sun = ctx.createLinearGradient(190, 120, 352, 352);
    sun.addColorStop(0, BRAND.orange);
    sun.addColorStop(1, BRAND.red);
    ctx.beginPath();
    ctx.arc(262, 250, 118, 0, Math.PI * 2);
    ctx.fillStyle = sun;
    ctx.fill();
    // Saucer, cup and latte art from above.
    const cx = 258;
    const cy = 246;
    ctx.beginPath();
    ctx.arc(cx + 6, cy + 8, 82, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(80,20,0,0.22)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#F2EDE4';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    const coffee = ctx.createRadialGradient(cx - 10, cy - 10, 6, cx, cy, 48);
    coffee.addColorStop(0, '#A8622E');
    coffee.addColorStop(1, '#5B2C10');
    ctx.fillStyle = coffee;
    ctx.fill();
    // Heart latte art.
    ctx.save();
    ctx.translate(cx, cy + 2);
    ctx.scale(1.25, 1.25);
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.bezierCurveTo(-30, 2, -24, -24, -8, -20);
    ctx.bezierCurveTo(-2, -19, 0, -14, 0, -10);
    ctx.bezierCurveTo(0, -14, 2, -19, 8, -20);
    ctx.bezierCurveTo(24, -24, 30, 2, 0, 18);
    ctx.fillStyle = '#F8EBDA';
    ctx.fill();
    ctx.restore();
    // Handle.
    ctx.beginPath();
    ctx.roundRect(cx + 50, cy - 9, 30, 18, 9);
    ctx.fillStyle = '#FFFDF8';
    ctx.fill();
    // Cookie.
    ctx.beginPath();
    ctx.arc(150, 300, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#D9A15E';
    ctx.fill();
    const r = rng(9);
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(150 + (r() - 0.5) * 44, 300 + (r() - 0.5) * 44, 3.5 + r() * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#4A2410';
      ctx.fill();
    }
    const [l1, l2, l3] = YOU.newPost.headline;
    headline(ctx, l1, 20, 72, 56, BRAND.ink, -1.5);
    headline(ctx, l2, 20, 130, 56, BRAND.ink, -1.5);
    headline(ctx, l3, 20, 188, 56, BRAND.red, -1.5);
    ctx.fillStyle = BRAND.ink;
    ctx.fillRect(20, 214, 72, 5);
    ctx.font = font(800, 11);
    ctx.fillStyle = BRAND.ink;
    (ctx as unknown as {letterSpacing: string}).letterSpacing = '1.6px';
    ctx.fillText(YOU.newPost.kicker.split(' WITH ')[0], 20, 240);
    ctx.fillText('WITH ' + (YOU.newPost.kicker.split(' WITH ')[1] ?? ''), 20, 256);
    (ctx as unknown as {letterSpacing: string}).letterSpacing = '0px';
  });

/** Small tiles for the competitor's profile grid. */
export const gridTile = (i: number) =>
  cached(`tile${i}`, (ctx) => {
    if (i === 0) {
      ctx.drawImage(competitorArt(), 0, 0, S, S);
      return;
    }
    const palettes = [
      ['#FF7A1A', '#2B1A12', 'COLD\nBREW'],
      ['#2B1A12', '#FFF3E3', 'NEW\nBEANS'],
      ['#F2E3CF', '#2B1A12', 'OAT\nFLAT W.'],
      ['#E63922', '#FFF3E3', '7AM\nOPEN'],
      ['#3A2416', '#FF7A1A', 'LIVE\nDJ SAT'],
      ['#FFB15C', '#2B1A12', 'MATCHA\nTONIC'],
      ['#1E120B', '#F2E3CF', 'BEIRUT\nROAST'],
      ['#FF7A1A', '#FFF3E3', 'BUY 5\nGET 1'],
    ];
    const [bg, ink, label] = palettes[(i - 1) % palettes.length];
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    ctx.beginPath();
    ctx.arc(S * 0.78, S * 0.72, S * 0.36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();
    const lines = label.split('\n');
    lines.forEach((l, k) => headline(ctx, l, 26, 120 + k * 92, 86, ink, -2));
  });

/** The pepper mark on a red disc (used in the "Managed by" tag). */
export const pepperBadge = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, BRAND.glow);
  g.addColorStop(1, BRAND.red);
  ctx.fillStyle = g;
  ctx.fill();
  pepper(ctx, cx, cy, r * 1.25, '#FFFFFF');
};

export const ART_SIZE = S;
