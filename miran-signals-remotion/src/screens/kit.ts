// Drawing kit for the fictional, unbranded trading app: text (LTR and RTL), icons, avatars,
// pills, smearing, cached layers. Units are design points (the screen is 402 × 874 pt, drawn at 3×).
import {BRAND} from '../data';
import {FAMILY} from '../fonts';

export const W = 402;
export const H = 874;

export const C = {
  appBg: '#0B0F19',
  card: BRAND.card,
  cardHi: '#1A2132',
  line: '#242C3D',
  text: BRAND.text,
  meta: BRAND.meta,
  dim: '#5D6577',
  up: BRAND.up,
  red: BRAND.red,
  goldA: BRAND.goldA,
  goldB: BRAND.goldB,
  glow: BRAND.glow,
  warn: '#E8A33D',
};

export const font = (weight: number | string, size: number) => `${weight} ${size}px ${FAMILY}`;

export const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

export type TextOpts = {weight?: number; size?: number; color?: string | CanvasGradient; align?: CanvasTextAlign; rtl?: boolean};

/** Draws one run of text. `rtl` sets the canvas direction (Arabic shapes and orders correctly). */
export const text = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, {weight = 500, size = 14, color = C.text, align = 'left', rtl = false}: TextOpts = {}) => {
  // The font has no check mark: draw "✓" as a vector tick inside LTR runs.
  if (!rtl && s.includes('✓')) return textWithChecks(ctx, s, x, y, {weight, size, color, align});
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
  const w = ctx.measureText(s).width;
  ctx.direction = 'ltr';
  return w;
};

const CHECK_W = 0.95;
const textWithChecks = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: {weight: number; size: number; color: string | CanvasGradient; align: CanvasTextAlign}) => {
  const parts = s.split('✓');
  ctx.font = font(o.weight, o.size);
  const widths = parts.map((p) => ctx.measureText(p).width);
  const total = widths.reduce((a, b) => a + b, 0) + (parts.length - 1) * o.size * CHECK_W;
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  parts.forEach((p, i) => {
    if (p) {
      ctx.font = font(o.weight, o.size);
      ctx.fillStyle = o.color;
      ctx.textAlign = 'left';
      ctx.direction = 'ltr';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(p, cx, y);
    }
    cx += widths[i];
    if (i < parts.length - 1) {
      icon(ctx, 'check', cx + o.size * CHECK_W * 0.5, y - o.size * 0.34, o.size * 0.72, o.color, Math.max(1.2, o.size * 0.13));
      cx += o.size * CHECK_W;
    }
  });
  return total;
};

export const measure = (ctx: CanvasRenderingContext2D, s: string, weight: number, size: number, rtl = false) => {
  ctx.font = font(weight, size);
  ctx.direction = rtl ? 'rtl' : 'ltr';
  const w = ctx.measureText(s).width;
  ctx.direction = 'ltr';
  return w;
};

/** Shrinks `size` until `s` fits in `maxW`. */
export const fit = (ctx: CanvasRenderingContext2D, s: string, weight: number, size: number, maxW: number, rtl = false) => {
  const w = measure(ctx, s, weight, size, rtl);
  return w <= maxW ? size : size * (maxW / w);
};

/** Western digits, comma thousands, fixed decimals: 10,640.00 */
export const money = (n: number, dp = 2) =>
  Math.abs(n).toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
/** Signed money: +$212 / −$420 */
export const signedMoney = (n: number, dp = 0) => `${n < 0 ? '−' : n > 0 ? '+' : ''}$${money(n, dp)}`;
export const signedPct = (n: number, dp = 1) => `${n < 0 ? '−' : n > 0 ? '+' : ''}${Math.abs(n).toFixed(dp)}%`;
export const priceStr = (p: number) => p.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

export const goldGradient = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, C.goldA);
  g.addColorStop(0.55, C.goldB);
  g.addColorStop(1, C.goldA);
  return g;
};

// ─── Icons (generic, drawn as paths) ─────────────────────────────────────────

export type IconKind =
  | 'check'
  | 'checkCircle'
  | 'shield'
  | 'lock'
  | 'warn'
  | 'news'
  | 'copy'
  | 'question'
  | 'calendar'
  | 'eyeOff'
  | 'bolt'
  | 'bell'
  | 'home'
  | 'chart'
  | 'list'
  | 'user'
  | 'up'
  | 'down'
  | 'signal'
  | 'target'
  | 'x';

export const icon = (ctx: CanvasRenderingContext2D, kind: IconKind, cx: number, cy: number, s: number, color: string | CanvasGradient, lw = 1.8) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const h = s / 2;
  switch (kind) {
    case 'check':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.72, cy + h * 0.02);
      ctx.lineTo(cx - h * 0.2, cy + h * 0.55);
      ctx.lineTo(cx + h * 0.78, cy - h * 0.55);
      ctx.stroke();
      break;
    case 'checkCircle':
      ctx.beginPath();
      ctx.arc(cx, cy, h, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0B0F19';
      ctx.lineWidth = lw * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.45, cy + h * 0.02);
      ctx.lineTo(cx - h * 0.12, cy + h * 0.36);
      ctx.lineTo(cx + h * 0.5, cy - h * 0.34);
      ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + h * 0.82, cy - h * 0.66);
      ctx.quadraticCurveTo(cx + h * 0.86, cy + h * 0.5, cx, cy + h);
      ctx.quadraticCurveTo(cx - h * 0.86, cy + h * 0.5, cx - h * 0.82, cy - h * 0.66);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.36, cy);
      ctx.lineTo(cx - h * 0.08, cy + h * 0.3);
      ctx.lineTo(cx + h * 0.4, cy - h * 0.28);
      ctx.stroke();
      break;
    case 'lock':
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.7, cy - h * 0.12, s * 0.7, s * 0.56, s * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.12, h * 0.42, Math.PI, 0);
      ctx.stroke();
      break;
    case 'warn':
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.9);
      ctx.lineTo(cx + h, cy + h * 0.8);
      ctx.lineTo(cx - h, cy + h * 0.8);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.3);
      ctx.lineTo(cx, cy + h * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.5, lw * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'news':
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.85, cy - h * 0.7, s * 0.85, s * 0.7, s * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.5, cy - h * 0.3);
      ctx.lineTo(cx + h * 0.1, cy - h * 0.3);
      ctx.moveTo(cx - h * 0.5, cy + h * 0.05);
      ctx.lineTo(cx + h * 0.4, cy + h * 0.05);
      ctx.moveTo(cx - h * 0.5, cy + h * 0.38);
      ctx.lineTo(cx + h * 0.25, cy + h * 0.38);
      ctx.stroke();
      break;
    case 'copy':
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.8, cy - h * 0.45, s * 0.55, s * 0.62, s * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.3, cy - h * 0.8, s * 0.55, s * 0.62, s * 0.08);
      ctx.stroke();
      break;
    case 'question':
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.28, h * 0.42, Math.PI * 1.1, Math.PI * 2.25);
      ctx.quadraticCurveTo(cx, cy, cx, cy + h * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.72, lw * 0.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'calendar':
      ctx.beginPath();
      ctx.roundRect(cx - h * 0.85, cy - h * 0.65, s * 0.85, s * 0.78, s * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.85, cy - h * 0.2);
      ctx.lineTo(cx + h * 0.85, cy - h * 0.2);
      ctx.moveTo(cx - h * 0.4, cy - h * 0.9);
      ctx.lineTo(cx - h * 0.4, cy - h * 0.5);
      ctx.moveTo(cx + h * 0.4, cy - h * 0.9);
      ctx.lineTo(cx + h * 0.4, cy - h * 0.5);
      ctx.stroke();
      break;
    case 'eyeOff':
      ctx.beginPath();
      ctx.moveTo(cx - h, cy);
      ctx.quadraticCurveTo(cx, cy - h * 1.1, cx + h, cy);
      ctx.quadraticCurveTo(cx, cy + h * 1.1, cx - h, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.8, cy + h * 0.8);
      ctx.lineTo(cx + h * 0.8, cy - h * 0.8);
      ctx.stroke();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(cx + h * 0.15, cy - h);
      ctx.lineTo(cx - h * 0.55, cy + h * 0.12);
      ctx.lineTo(cx - h * 0.02, cy + h * 0.12);
      ctx.lineTo(cx - h * 0.15, cy + h);
      ctx.lineTo(cx + h * 0.55, cy - h * 0.12);
      ctx.lineTo(cx + h * 0.02, cy - h * 0.12);
      ctx.closePath();
      ctx.fill();
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
    case 'chart':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.85, cy + h * 0.6);
      ctx.lineTo(cx - h * 0.25, cy);
      ctx.lineTo(cx + h * 0.15, cy + h * 0.3);
      ctx.lineTo(cx + h * 0.85, cy - h * 0.6);
      ctx.stroke();
      break;
    case 'list':
      for (const k of [-0.55, 0, 0.55]) {
        ctx.beginPath();
        ctx.moveTo(cx - h * 0.4, cy + h * k);
        ctx.lineTo(cx + h * 0.85, cy + h * k);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - h * 0.8, cy + h * k, lw * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'user':
      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.35, h * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.8, cy + h * 0.85);
      ctx.quadraticCurveTo(cx, cy - h * 0.1, cx + h * 0.8, cy + h * 0.85);
      ctx.stroke();
      break;
    case 'up':
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.6);
      ctx.lineTo(cx + h * 0.7, cy + h * 0.5);
      ctx.lineTo(cx - h * 0.7, cy + h * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    case 'down':
      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.6);
      ctx.lineTo(cx + h * 0.7, cy - h * 0.5);
      ctx.lineTo(cx - h * 0.7, cy - h * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    case 'signal':
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.62, -0.8, 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.62, Math.PI - 0.8, Math.PI + 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.95, -0.7, 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.95, Math.PI - 0.7, Math.PI + 0.7);
      ctx.stroke();
      break;
    case 'target':
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, h * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, lw * 0.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'x':
      ctx.beginPath();
      ctx.moveTo(cx - h * 0.6, cy - h * 0.6);
      ctx.lineTo(cx + h * 0.6, cy + h * 0.6);
      ctx.moveTo(cx + h * 0.6, cy - h * 0.6);
      ctx.lineTo(cx - h * 0.6, cy + h * 0.6);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

// ─── Logo (Miran Gold emblem, from public/logo.png) ──────────────────────────

let logoImg: HTMLImageElement | null = null;
/** Set once the logo PNG has loaded (Reel waits for it before rendering). */
export const setLogoImage = (img: HTMLImageElement) => {
  logoImg = img;
};

/** The Miran Gold emblem, clipped to a circle. */
export const emblem = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#05070C';
  ctx.fill();
  if (logoImg) {
    ctx.clip();
    // The PNG's gold ring sits at ~97% of its half-size: scale so the ring meets our circle.
    const s = (r * 2) / 0.985;
    ctx.drawImage(logoImg, cx - s / 2, cy - s / 2, s, s);
  }
  ctx.restore();
};

// ─── Avatars, pills, labels ──────────────────────────────────────────────────

export const avatar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, label: string, bg: string, ink = '#fff') => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  text(ctx, label, cx, cy + r * 0.36, {weight: 700, size: r * (label.length > 1 ? 0.78 : 1.0), color: ink, align: 'center'});
  ctx.restore();
};

/** A small outlined pill, e.g. the "توضيحي" (illustrative) label. Anchored at its right edge. */
export const tagPill = (ctx: CanvasRenderingContext2D, label: string, rightX: number, y: number, {rtl = false, color = C.meta, border = '#3A4254', size = 9.5} = {}) => {
  const w = measure(ctx, label, 600, size, rtl) + 12;
  const h = size + 7;
  rr(ctx, rightX - w, y, w, h, h / 2);
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = border;
  ctx.stroke();
  text(ctx, label, rightX - w / 2, y + h / 2 + size * 0.36, {weight: 600, size, color, align: 'center', rtl});
  return w;
};

/** A filled pill with text, anchored at its left edge. Returns its width. */
export const pill = (
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  {bg = C.cardHi, color = C.text, size = 12, weight = 700, h = 24, padX = 10, rtl = false}: {bg?: string | CanvasGradient; color?: string; size?: number; weight?: number; h?: number; padX?: number; rtl?: boolean} = {},
) => {
  const w = measure(ctx, label, weight, size, rtl) + padX * 2;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  text(ctx, label, x + w / 2, y + h / 2 + size * 0.36, {weight, size, color, align: 'center', rtl});
  return w;
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

/**
 * When true, soft shadows multiply the current alpha (so they fade with whatever they belong
 * to). Off by default: the signals reel draws its shadows at their own absolute alpha.
 */
let shadowRelative = false;
export const setShadowRelative = (on: boolean) => {
  shadowRelative = on;
};

/** A soft drop shadow under a box, from a cached blurred sprite (much cheaper than shadowBlur). */
export const softShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number, dy = 6, tint = '#000000') => {
  const key = `shadow-sprite:${tint}`;
  let sprite = scratch.get(key);
  if (!sprite) {
    sprite = document.createElement('canvas');
    sprite.width = 256;
    sprite.height = 256;
    const c = sprite.getContext('2d')!;
    c.filter = 'blur(18px)';
    c.fillStyle = tint;
    c.beginPath();
    c.roundRect(56, 56, 144, 144, 44);
    c.fill();
    scratch.set(key, sprite);
  }
  // The sprite's core is the 144px square at (56, 56): map it onto the box.
  const sx = w / 144;
  const sy = h / 144;
  ctx.save();
  ctx.globalAlpha = shadowRelative ? ctx.globalAlpha * alpha : alpha;
  ctx.drawImage(sprite, x - 56 * sx, y - 56 * sy + dy, 256 * sx, 256 * sy);
  ctx.restore();
};

/** A full-screen (or any size) layer drawn once and reused (static parts of a view). */
export const layer = (key: string, w: number, h: number, scale: number, draw: (c: CanvasRenderingContext2D) => void) => {
  let c = scratch.get(`layer:${key}`);
  if (!c) {
    c = document.createElement('canvas');
    c.width = Math.ceil(w * scale);
    c.height = Math.ceil(h * scale);
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
