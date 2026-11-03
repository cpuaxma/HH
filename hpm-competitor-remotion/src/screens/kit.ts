// Drawing kit for the fictional social app: text, icons, avatars, pills, smearing.
// Units are design points (the screen is 400 × 890 pt, drawn at 3×).
import {BRAND} from '../data';
import {DISPLAY, UI} from '../fonts';
import {PEPPER_OUTLINE} from '../lib/logoTrace';

export const W = 400;
export const H = 890;

export const C = {
  appBg: '#F3F2EF',
  card: '#FFFFFF',
  ink: BRAND.ink,
  text: BRAND.text,
  meta: BRAND.meta,
  divider: BRAND.divider,
  pill: '#F3F2EF',
  red: BRAND.red,
  orange: BRAND.orange,
};

export const font = (weight: number | string, size: number, display = false) => `${weight} ${size}px ${display ? DISPLAY : UI}`;

export const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

export const text = (
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  {weight = 500, size = 14, color = C.text, align = 'left' as CanvasTextAlign, display = false, tracking = 0} = {},
) => {
  ctx.font = font(weight, size, display);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  (ctx as unknown as {letterSpacing: string}).letterSpacing = `${tracking}px`;
  ctx.fillText(s, x, y);
  (ctx as unknown as {letterSpacing: string}).letterSpacing = '0px';
  return ctx.measureText(s).width;
};

export const measure = (ctx: CanvasRenderingContext2D, s: string, weight: number, size: number, display = false) => {
  ctx.font = font(weight, size, display);
  return ctx.measureText(s).width;
};

/** Runs of (bold?, text) laid out and wrapped inside a width. Returns the height used. */
export const richText = (
  ctx: CanvasRenderingContext2D,
  runs: {s: string; bold?: boolean; color?: string}[],
  x: number,
  y: number,
  maxW: number,
  {size = 14, lineH = 19, color = C.text, maxLines = 3} = {},
) => {
  const words: {w: string; bold: boolean; color: string}[] = [];
  for (const r of runs) for (const w of r.s.split(/(\s+)/)) if (w) words.push({w, bold: !!r.bold, color: r.color ?? (r.bold ? C.ink : color)});
  let cx = x;
  let cy = y;
  let line = 1;
  for (const wd of words) {
    ctx.font = font(wd.bold ? 700 : 500, size);
    const ww = ctx.measureText(wd.w).width;
    if (cx + ww > x + maxW && wd.w.trim()) {
      line++;
      if (line > maxLines) break;
      cx = x;
      cy += lineH;
    }
    if (cx === x && !wd.w.trim()) continue;
    ctx.fillStyle = wd.color;
    ctx.textAlign = 'left';
    ctx.fillText(wd.w, cx, cy);
    cx += ww;
  }
  return cy - y + lineH;
};

// ─── Icons (generic, drawn as paths) ─────────────────────────────────────────

export const heartPath = (cx: number, cy: number, s: number) => {
  const p = new Path2D();
  p.moveTo(cx, cy + s * 0.42);
  p.bezierCurveTo(cx - s * 0.62, cy + s * 0.02, cx - s * 0.58, cy - s * 0.52, cx - s * 0.25, cy - s * 0.5);
  p.bezierCurveTo(cx - s * 0.1, cy - s * 0.5, cx, cy - s * 0.38, cx, cy - s * 0.26);
  p.bezierCurveTo(cx, cy - s * 0.38, cx + s * 0.1, cy - s * 0.5, cx + s * 0.25, cy - s * 0.5);
  p.bezierCurveTo(cx + s * 0.58, cy - s * 0.52, cx + s * 0.62, cy + s * 0.02, cx, cy + s * 0.42);
  p.closePath();
  return p;
};

export const icon = (
  ctx: CanvasRenderingContext2D,
  kind: 'heart' | 'heartFill' | 'comment' | 'save' | 'share' | 'follow' | 'bell' | 'home' | 'search' | 'plus' | 'flame' | 'clock' | 'chart' | 'more' | 'back' | 'pin',
  cx: number,
  cy: number,
  s: number,
  color: string,
  lw = 1.8,
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const h = s / 2;
  switch (kind) {
    case 'heart':
      ctx.stroke(heartPath(cx, cy + s * 0.04, s * 0.95));
      break;
    case 'heartFill':
      ctx.fill(heartPath(cx, cy + s * 0.04, s * 0.95));
      break;
    case 'comment': {
      ctx.beginPath();
      ctx.roundRect(cx - h, cy - h * 0.8, s, s * 0.72, s * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.35, cy + h * 0.62);
      ctx.lineTo(cx - h * 0.55, cy + h * 0.98);
      ctx.lineTo(cx + h * 0.05, cy + h * 0.64);
      ctx.stroke();
      break;
    }
    case 'save':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.62, cy - h * 0.85);
      ctx.lineTo(cx + h * 0.62, cy - h * 0.85);
      ctx.lineTo(cx + h * 0.62, cy + h * 0.9);
      ctx.lineTo(cx, cy + h * 0.42);
      ctx.lineTo(cx - h * 0.62, cy + h * 0.9);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'share':
      // Circular arrows (generic "repost").
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.72, Math.PI * 1.15, Math.PI * 1.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.72, Math.PI * 0.15, Math.PI * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + h * 0.72, cy - h * 0.55);
      ctx.lineTo(cx + h * 0.66, cy - h * 0.12);
      ctx.lineTo(cx + h * 0.25, cy - h * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.72, cy + h * 0.55);
      ctx.lineTo(cx - h * 0.66, cy + h * 0.12);
      ctx.lineTo(cx - h * 0.25, cy + h * 0.2);
      ctx.stroke();
      break;
    case 'follow':
      ctx.beginPath();
      ctx.arc(cx - h * 0.2, cy - h * 0.35, h * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.95, cy + h * 0.85);
      ctx.quadraticCurveTo(cx - h * 0.2, cy - h * 0.15, cx + h * 0.55, cy + h * 0.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + h * 0.72, cy - h * 0.5);
      ctx.lineTo(cx + h * 0.72, cy + h * 0.05);
      ctx.moveTo(cx + h * 0.45, cy - h * 0.22);
      ctx.lineTo(cx + h, cy - h * 0.22);
      ctx.stroke();
      break;
    case 'bell':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.75, cy + h * 0.5);
      ctx.quadraticCurveTo(cx - h * 0.55, cy + h * 0.2, cx - h * 0.55, cy - h * 0.15);
      ctx.arc(cx, cy - h * 0.15, h * 0.55, Math.PI, 0);
      ctx.quadraticCurveTo(cx + h * 0.55, cy + h * 0.2, cx + h * 0.75, cy + h * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.72, h * 0.18, 0, Math.PI);
      ctx.stroke();
      break;
    case 'home':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.8, cy - h * 0.05);
      ctx.lineTo(cx, cy - h * 0.8);
      ctx.lineTo(cx + h * 0.8, cy - h * 0.05);
      ctx.moveTo(cx - h * 0.6, cy - h * 0.2);
      ctx.lineTo(cx - h * 0.6, cy + h * 0.8);
      ctx.lineTo(cx + h * 0.6, cy + h * 0.8);
      ctx.lineTo(cx + h * 0.6, cy - h * 0.2);
      ctx.stroke();
      break;
    case 'search':
      ctx.beginPath();
      ctx.arc(cx - h * 0.12, cy - h * 0.12, h * 0.6, 0, Math.PI * 2);
      ctx.moveTo(cx + h * 0.32, cy + h * 0.32);
      ctx.lineTo(cx + h * 0.82, cy + h * 0.82);
      ctx.stroke();
      break;
    case 'plus':
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.85, cy - h * 0.85, s * 0.85, s * 0.85, s * 0.26);
      ctx.moveTo(cx, cy - h * 0.4);
      ctx.lineTo(cx, cy + h * 0.4);
      ctx.moveTo(cx - h * 0.4, cy);
      ctx.lineTo(cx + h * 0.4, cy);
      ctx.stroke();
      break;
    case 'flame': {
      const p = new Path2D();
      p.moveTo(cx, cy + h);
      p.bezierCurveTo(cx - h * 0.95, cy + h, cx - h * 0.95, cy - h * 0.05, cx - h * 0.2, cy - h * 0.55);
      p.bezierCurveTo(cx - h * 0.2, cy - h * 0.15, cx + h * 0.05, cy - h * 0.05, cx + h * 0.05, cy - h * 0.05);
      p.bezierCurveTo(cx + h * 0.05, cy - h * 0.6, cx + h * 0.1, cy - h * 0.9, cx + h * 0.05, cy - h);
      p.bezierCurveTo(cx + h * 0.9, cy - h * 0.45, cx + h * 0.95, cy + h, cx, cy + h);
      p.closePath();
      ctx.fill(p);
      break;
    }
    case 'clock':
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.85, 0, Math.PI * 2);
      ctx.moveTo(cx, cy - h * 0.5);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + h * 0.35, cy + h * 0.2);
      ctx.stroke();
      break;
    case 'chart':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.85, cy + h * 0.6);
      ctx.lineTo(cx - h * 0.25, cy);
      ctx.lineTo(cx + h * 0.15, cy + h * 0.3);
      ctx.lineTo(cx + h * 0.85, cy - h * 0.6);
      ctx.stroke();
      break;
    case 'more':
      for (const k of [-1, 0, 1]) {
        ctx.beginPath();
        ctx.arc(cx + k * h * 0.6, cy, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'back':
      ctx.beginPath();
      ctx.moveTo(cx + h * 0.25, cy - h * 0.7);
      ctx.lineTo(cx - h * 0.45, cy);
      ctx.lineTo(cx + h * 0.25, cy + h * 0.7);
      ctx.stroke();
      break;
    case 'pin':
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.25, h * 0.55, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(cx, cy + h * 0.95);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.25, h * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

// ─── Pepper (from the traced logo outline) ───────────────────────────────────

let pepperCache: {path: Path2D; w: number; h: number} | null = null;
/** The Hot Pepper Media pepper as a filled silhouette, ~1 unit tall. */
const pepperUnit = () => {
  if (pepperCache) return pepperCache;
  const xs = PEPPER_OUTLINE.map((p) => p[0]);
  const ys = PEPPER_OUTLINE.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const h = Math.max(...ys) - minY;
  const w = (Math.max(...xs) - minX) / h;
  const path = new Path2D();
  PEPPER_OUTLINE.forEach(([x, y], i) => {
    const px = (x - minX) / h;
    const py = (y - minY) / h;
    if (i === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  });
  path.closePath();
  pepperCache = {path, w, h: 1};
  return pepperCache;
};

/** Filled pepper centred at (cx, cy), `size` tall. */
export const pepper = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) => {
  const p = pepperUnit();
  ctx.save();
  ctx.translate(cx - (p.w * size) / 2, cy - size / 2);
  ctx.scale(size, size);
  ctx.fillStyle = color;
  ctx.fill(p.path);
  ctx.restore();
};

// ─── Avatars, pills ──────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#C9B8A6', '#9FB0A3', '#B7A3B8', '#D3A98C', '#8FA3B8', '#C4B07C', '#A7B59A'];
const hashStr = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export const avatar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, label: string, bg?: string, ink = '#fff') => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bg ?? AVATAR_COLORS[hashStr(label) % AVATAR_COLORS.length];
  ctx.fill();
  const initials = label.length <= 2 ? label : label[0].toUpperCase();
  text(ctx, initials, cx, cy + r * 0.36, {weight: 800, size: r * (initials.length > 1 ? 0.82 : 1.0), color: ink, align: 'center'});
  ctx.restore();
};

/**
 * Draws `draw(c, i)` once per sample and averages the samples (canvas motion blur).
 * Only the horizontal strip [y0, y1] (in points) is blurred, to keep it cheap.
 */
export const smear = (
  ctx: CanvasRenderingContext2D,
  samples: number,
  draw: (c: CanvasRenderingContext2D, i: number) => void,
  y0 = 0,
  y1 = H,
) => {
  if (samples <= 1) {
    draw(ctx, 0);
    return;
  }
  const m = ctx.getTransform();
  const px0 = Math.max(0, Math.floor(m.d * y0 + m.f));
  const px1 = Math.min(ctx.canvas.height, Math.ceil(m.d * y1 + m.f));
  const w = ctx.canvas.width;
  const h = Math.max(1, px1 - px0);
  const acc = getScratch('acc', w, h);
  const one = getScratch('one', w, h);
  const a = acc.getContext('2d')!;
  const o = one.getContext('2d')!;
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.clearRect(0, 0, w, h);
  for (let i = 0; i < samples; i++) {
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, w, h);
    o.setTransform(m.a, m.b, m.c, m.d, m.e, m.f - px0);
    draw(o, i);
    a.globalCompositeOperation = 'lighter';
    a.globalAlpha = 1 / samples;
    a.drawImage(one, 0, 0);
  }
  a.globalAlpha = 1;
  a.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(acc, 0, px0);
  ctx.restore();
};

/** A soft drop shadow under a box, from a cached blurred sprite (much cheaper than shadowBlur). */
export const softShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number, dy = 6) => {
  let sprite = scratch.get('shadow-sprite');
  if (!sprite) {
    sprite = document.createElement('canvas');
    sprite.width = 256;
    sprite.height = 256;
    const c = sprite.getContext('2d')!;
    c.filter = 'blur(18px)';
    c.fillStyle = '#2a1e14';
    c.beginPath();
    c.roundRect(56, 56, 144, 144, 44);
    c.fill();
    scratch.set('shadow-sprite', sprite);
  }
  // The sprite's core is the 144px square at (56, 56): map it onto the box.
  const sx = w / 144;
  const sy = h / 144;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x - 56 * sx, y - 56 * sy + dy, 256 * sx, 256 * sy);
  ctx.restore();
};

/** A full-screen layer drawn once and reused (static parts of a view). */
export const layer = (key: string, w: number, h: number, scale: number, draw: (c: CanvasRenderingContext2D) => void) => {
  let c = scratch.get(`layer:${key}`);
  if (!c) {
    c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const x = c.getContext('2d')!;
    x.scale(scale, scale);
    draw(x);
    scratch.set(`layer:${key}`, c);
  }
  return c;
};

const scratch = new Map<string, HTMLCanvasElement>();
const getScratch = (key: string, w: number, h: number) => {
  let c = scratch.get(key);
  if (!c) {
    c = document.createElement('canvas');
    scratch.set(key, c);
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
};

/** Seeded PRNG for the procedural art (identical every frame). */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
