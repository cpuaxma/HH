// The two phone screens, drawn per frame into 1206 × 2622 canvases (402 × 874 pt at 3×).
//
// Designed to be read at a glance on a phone held at arm's length: one big balance, one
// thick price line, and ONE large card at a time. iOS details (Dynamic Island, status bar,
// home indicator) make the phones read as iPhones; the app itself is fictional.
//
// - Left («بلا خطة»): an impulsive Buy of 3 lots with no stop loss; the news candle turns the
//   whole screen red; margin call. After its flip it is connected to Miran Gold.
// - Right («مع ميران جولد»): the Miran signal (entry, stop loss, target, 1% risk), the market
//   update before the news (take profit now), then "Protected" when the news hits.
import {LEFT, Lang, NEWS, RIGHT, SCREEN_COPY, SIGNAL, TIMING, UPDATE} from '../data';
import {clamp01, easeIn, easeInOut, easeOut, ramp, springAt} from '../lib/ease';
import {chartRange, leftBalance, leftDanger, leftIsMiran, leftOpenPnl, price, rightBalance, rightOpenPnl} from '../lib/story';
import {MARKET} from '../data';
import {C, H, IconKind, W, emblem, fit, goldGradient, icon, measure, money, rr, signedMoney, softShadow, tagPill, text} from './kit';

// ─── Language ────────────────────────────────────────────────────────────────

let LANG: Lang = 'ar';
export const setScreenLang = (l: Lang) => {
  LANG = l;
};
const SC = () => SCREEN_COPY[LANG];

const PAD = 26;
/** x of the reading start / end (right / left in Arabic). */
const sx = () => (SC().rtl ? W - PAD : PAD);
const ex = () => (SC().rtl ? PAD : W - PAD);
const aStart = (): CanvasTextAlign => (SC().rtl ? 'right' : 'left');
const aEnd = (): CanvasTextAlign => (SC().rtl ? 'left' : 'right');

/** Localised text that fits in maxW, anchored at x with `align`. */
const say = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: {weight?: number; size?: number; color?: string | CanvasGradient; align?: CanvasTextAlign; maxW?: number} = {}) => {
  const rtl = SC().rtl;
  const weight = o.weight ?? 600;
  const size = fit(ctx, s, weight, o.size ?? 18, o.maxW ?? W - 2 * PAD, rtl);
  return text(ctx, s, x, y, {weight, size, color: o.color ?? C.text, align: o.align ?? aStart(), rtl});
};

/** Numbers are always laid out LTR (so "−$4,800" keeps its sign on the left). */
const num = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: {weight?: number; size?: number; color?: string | CanvasGradient; align?: CanvasTextAlign} = {}) =>
  text(ctx, s, x, y, {weight: o.weight ?? 700, size: o.size ?? 18, color: o.color ?? C.text, align: o.align ?? aStart(), rtl: false});

const usd = (n: number) => `$${money(n, 0)}`;
const priceLabel = (p: number) => p.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});

// ─── iOS chrome ──────────────────────────────────────────────────────────────

const clock = (t: number) => {
  const m = 10 * 60 + 24 + Math.floor(Math.max(0, t) / 600);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** Status bar (time, signal, Wi-Fi, battery) and the Dynamic Island. */
const chrome = (ctx: CanvasRenderingContext2D, t: number, acts: Activity[] = [], ink = C.text) => {
  text(ctx, clock(t), 62, 35, {weight: 600, size: 17, color: ink, align: 'center'});
  // Signal bars.
  ctx.fillStyle = ink;
  for (let i = 0; i < 4; i++) {
    const h = 4 + i * 2.6;
    rr(ctx, 290 + i * 5, 34 - h, 3.4, h, 1);
    ctx.fill();
  }
  // Wi-Fi.
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(320, 35, 3.5 + i * 4, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.restore();
  // Battery.
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.2;
  rr(ctx, 337, 24.5, 26, 12.5, 3.6);
  ctx.stroke();
  ctx.globalAlpha = 0.5;
  rr(ctx, 364.4, 28.5, 1.8, 4.5, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = ink;
  rr(ctx, 339, 26.5, 18.5, 8.5, 2.2);
  ctx.fill();
  ctx.restore();
  island(ctx, t, acts);
};

/** A Live Activity: the Dynamic Island expands to show an alert, then shrinks back. */
type Activity = {at: number; until: number; color: string; icon: IconKind; title: string; sub: string};

const island = (ctx: CanvasRenderingContext2D, t: number, acts: Activity[]) => {
  let k = 0;
  let raw = 0;
  let act: Activity | null = null;
  for (const a of acts) {
    if (t < a.at) continue;
    const p = springAt(t - a.at, {freq: 1.5, damping: 0.66});
    const c = ramp(t, a.until, a.until + 18, easeInOut);
    const v = p * (1 - c);
    if (v > raw) {
      raw = v;
      act = a;
    }
  }
  k = Math.max(0, raw);
  const w = 126 + (W - 24 - 126) * k;
  const h = 37 + (88 - 37) * k;
  const r = 18.5 + (36 - 18.5) * Math.min(1, k);
  ctx.save();
  if (act && k > 0.02) {
    // A soft coloured glow under the expanded island.
    softShadow(ctx, W / 2 - w / 2, 11, w, h, 0.55 * Math.min(1, k), 0, act.color);
  }
  ctx.fillStyle = '#000';
  rr(ctx, W / 2 - w / 2, 11, w, h, r);
  ctx.fill();
  if (act && k > 0.02) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexA(act.color, 0.5 * Math.min(1, k));
    ctx.stroke();
  }
  // The front camera (hidden once expanded content shows).
  ctx.fillStyle = '#0d0f16';
  ctx.beginPath();
  ctx.arc(W / 2 + w / 2 - 21, 29.5, 6, 0, Math.PI * 2);
  ctx.fill();
  const ca = clamp01((k - 0.6) / 0.3);
  if (act && ca > 0) {
    ctx.globalAlpha = ca;
    const rtl = SC().rtl;
    const ix = rtl ? W / 2 + w / 2 - 44 : W / 2 - w / 2 + 44;
    const cy = 11 + h / 2;
    ctx.beginPath();
    ctx.arc(ix, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = hexA(act.color, 0.22);
    ctx.fill();
    icon(ctx, act.icon, ix, cy, 24, act.color, 2.6);
    const tx = rtl ? ix - 38 : ix + 38;
    say(ctx, act.title, tx, cy - 3, {weight: 700, size: 19, color: '#fff', maxW: w - 100});
    say(ctx, act.sub, tx, cy + 22, {weight: 500, size: 15, color: act.color, maxW: w - 100});
  }
  ctx.restore();
};


const homeIndicator = (ctx: CanvasRenderingContext2D, ink = C.text) => {
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  rr(ctx, W / 2 - 68, H - 13, 136, 5, 2.5);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const illus = (ctx: CanvasRenderingContext2D, y: number) => {
  const rtl = SC().rtl;
  // tagPill anchors at its right edge.
  const label = SC().illustrative;
  const w = measure(ctx, label, 600, 11, rtl) + 12;
  tagPill(ctx, label, rtl ? PAD + w : W - PAD, y, {rtl, size: 11, color: '#AEB4C2', border: '#4A5266'});
};

// ─── Backgrounds ─────────────────────────────────────────────────────────────

const background = (ctx: CanvasRenderingContext2D, mode: 'blind' | 'miran', danger: number) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (mode === 'miran') {
    g.addColorStop(0, '#111a31');
    g.addColorStop(1, '#0a0f1e');
  } else {
    g.addColorStop(0, '#14161c');
    g.addColorStop(1, '#0b0c10');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (mode === 'miran') {
    const rg = ctx.createRadialGradient(W / 2, 0, 10, W / 2, 0, 420);
    rg.addColorStop(0, 'rgba(212,162,76,0.22)');
    rg.addColorStop(1, 'rgba(212,162,76,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  if (danger > 0) {
    ctx.save();
    ctx.globalAlpha = danger;
    const d = ctx.createLinearGradient(0, 0, 0, H);
    d.addColorStop(0, '#8a141b');
    d.addColorStop(0.55, '#4d0a0f');
    d.addColorStop(1, '#260407');
    ctx.fillStyle = d;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};

// ─── Header and balance ──────────────────────────────────────────────────────

const header = (ctx: CanvasRenderingContext2D, mode: 'blind' | 'miran') => {
  const rtl = SC().rtl;
  const y = 92;
  if (mode === 'miran') {
    const cx = rtl ? W - PAD - 17 : PAD + 17;
    emblem(ctx, cx, y - 7, 17);
    say(ctx, SC().brand, rtl ? cx - 27 : cx + 27, y, {weight: 700, size: 22, color: goldGradient(ctx, 0, 0, W, 0), maxW: 200});
  } else {
    // A plain gold-coin glyph for the generic app.
    const cx = rtl ? W - PAD - 17 : PAD + 17;
    ctx.beginPath();
    ctx.arc(cx, y - 7, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2d36';
    ctx.fill();
    text(ctx, 'Au', cx, y - 1, {weight: 700, size: 15, color: '#cfc7b4', align: 'center'});
    say(ctx, SC().pair, rtl ? cx - 27 : cx + 27, y, {weight: 700, size: 21, maxW: 220});
  }
  illus(ctx, y - 18);
};

/** The big balance, plus the open trade's live P&L under it. */
/** Draws `from` → `to` at frame `at`, anchored at x (reading start); changed digits roll over. */
const swapNum = (ctx: CanvasRenderingContext2D, from: string, to: string, at: number, t: number, x: number, y: number, size: number, color: string) => {
  const n = Math.max(from.length, to.length);
  const A = Array.from({length: n}, (_, i) => from[i - (n - from.length)] ?? '');
  const B = Array.from({length: n}, (_, i) => to[i - (n - to.length)] ?? '');
  const cw = (c: string) => (c ? measure(ctx, c, 700, size) : 0);
  const cols = A.map((a, i) => {
    const b = B[i];
    const p = a === b ? 1 : Math.min(1.08, Math.max(0, springAt(t - (at + (n - 1 - i) * 2.2), {freq: 1.8, damping: 0.78})));
    const k = clamp01(p);
    return {a, b, p, k, w: cw(a) + (cw(b) - cw(a)) * k};
  });
  const total = cols.reduce((s2, c) => s2 + c.w, 0);
  let cx = SC().rtl ? x - total : x;
  const em = size * 0.62;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - 20, y - size * 1.05, total + 40, size * 1.35);
  ctx.clip();
  for (const c of cols) {
    const mid = cx + c.w / 2;
    if (c.a === c.b) num(ctx, c.a, mid, y, {size, color, align: 'center'});
    else {
      if (c.k < 1 && c.a) {
        ctx.globalAlpha = 1 - c.k;
        num(ctx, c.a, mid, y - c.k * em, {size, color, align: 'center'});
      }
      if (c.k > 0 && c.b) {
        ctx.globalAlpha = c.k;
        num(ctx, c.b, mid, y + (1 - c.p) * em, {size, color, align: 'center'});
      }
      ctx.globalAlpha = 1;
    }
    cx += c.w;
  }
  ctx.restore();
};

const balanceBlock = (
  ctx: CanvasRenderingContext2D,
  balance: number,
  balanceColor: string,
  open: number | null,
  openAlpha: number,
  swap?: {from: number; to: number; at: number; t: number},
) => {
  say(ctx, SC().balance, sx(), 146, {weight: 500, size: 17, color: C.meta});
  if (swap) swapNum(ctx, usd(swap.from), usd(swap.to), swap.at, swap.t, sx(), 206, 58, balanceColor);
  else num(ctx, usd(balance), sx(), 206, {weight: 700, size: 58, color: balanceColor});
  if (open !== null && openAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = openAlpha;
    const rtl = SC().rtl;
    const label = SC().openTrade;
    const lw = say(ctx, label, sx(), 242, {weight: 500, size: 18, color: C.meta, maxW: 200});
    const col = open >= 0 ? C.up : C.red;
    num(ctx, signedMoney(open), rtl ? sx() - lw - 12 : sx() + lw + 12, 242, {weight: 700, size: 22, color: col});
    ctx.restore();
  }
};

// ─── The chart: one thick price line ─────────────────────────────────────────

type Level = {price: number; color: string; label: string; alpha: number};

const CHART = {top: 268, bottom: 520, left: PAD, right: W - PAD - 70};

const chart = (ctx: CanvasRenderingContext2D, t: number, lineColor: string, levels: Level[], newsColor: string) => {
  const span = MARKET.chartSpan;
  let [lo, hi] = chartRange(t);
  // Keep visible levels (stop loss, target) inside the chart, easing the range out to them.
  for (const l of levels) {
    if (l.alpha <= 0) continue;
    lo = Math.min(lo, lo + (l.price - 1.5 - lo) * l.alpha);
    hi = Math.max(hi, hi + (l.price + 1.5 - hi) * l.alpha);
  }
  const X = (f: number) => CHART.left + ((f - (t - span)) / span) * (CHART.right - CHART.left);
  const Y = (p: number) => CHART.bottom - ((p - lo) / (hi - lo)) * (CHART.bottom - CHART.top);

  // Faint grid.
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = CHART.top + ((CHART.bottom - CHART.top) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(CHART.left, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();
  }

  // The news moment: a vertical marker.
  if (t >= NEWS.at) {
    const x = X(NEWS.at);
    if (x > CHART.left) {
      ctx.save();
      ctx.strokeStyle = newsColor;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, CHART.top - 6);
      ctx.lineTo(x, CHART.bottom);
      ctx.stroke();
      ctx.restore();
      icon(ctx, 'bolt', x, CHART.top - 14, 16, newsColor, 2);
    }
  }

  // Levels (entry, stop loss, target), dashed, with small tags at the right.
  for (const l of levels) {
    if (l.alpha <= 0) continue;
    const y = Y(l.price);
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(CHART.left, y);
    ctx.lineTo(CHART.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    rr(ctx, CHART.right + 6, y - 12, 62, 24, 12);
    ctx.fillStyle = l.color;
    ctx.fill();
    text(ctx, l.label, CHART.right + 37, y + 5, {weight: 700, size: 13, color: '#0b0f19', align: 'center', rtl: SC().rtl});
    ctx.restore();
  }

  // The line, with a soft area fill under it.
  const N = 150;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const f = t - span + (span * i) / N;
    pts.push([X(f), Y(price(f))]);
  }
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineTo(CHART.right, CHART.bottom);
  ctx.lineTo(CHART.left, CHART.bottom);
  ctx.closePath();
  const area = ctx.createLinearGradient(0, CHART.top, 0, CHART.bottom);
  area.addColorStop(0, hexA(lineColor, 0.3));
  area.addColorStop(1, hexA(lineColor, 0));
  ctx.fillStyle = area;
  ctx.fill();
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = hexA(lineColor, 0.16);
  ctx.lineWidth = 16;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Live dot and price tag.
  const [lx, ly] = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(lx, ly, 7, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
  const ph = (((t % 48) + 48) % 48) / 48;
  ctx.beginPath();
  ctx.arc(lx, ly, 8 + 18 * ph, 0, Math.PI * 2);
  ctx.fillStyle = hexA(lineColor, 0.4 * (1 - ph));
  ctx.fill();
  const tagY = Math.max(CHART.top, Math.min(CHART.bottom, ly));
  rr(ctx, CHART.right + 6, tagY - 14, 62, 28, 8);
  ctx.fillStyle = lineColor;
  ctx.fill();
  num(ctx, priceLabel(price(t)), CHART.right + 37, tagY + 6, {size: 15, color: '#0b0f19', align: 'center'});
};

const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// ─── Cards ───────────────────────────────────────────────────────────────────

const CARD = {x: PAD - 6, y: 556, w: W - 2 * PAD + 12, h: 278};

const cardBox = (ctx: CanvasRenderingContext2D, o: {fill?: string; border?: string; glow?: string; y?: number; h?: number} = {}) => {
  const y = o.y ?? CARD.y;
  const h = o.h ?? CARD.h;
  softShadow(ctx, CARD.x, y, CARD.w, h, 0.5, 8);
  if (o.glow) softShadow(ctx, CARD.x, y, CARD.w, h, 0.6, 0, o.glow);
  rr(ctx, CARD.x, y, CARD.w, h, 30);
  ctx.fillStyle = o.fill ?? 'rgba(26,31,44,0.96)';
  ctx.fill();
  if (o.border) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = o.border;
    ctx.stroke();
  }
};

/** Card transition: 0 → 1 in, then 1 → 0 out; returns alpha and a vertical offset. */
const tr = (t: number, inAt: number, outAt = Infinity, dur = 14) => {
  const a = springAt(t - inAt, {freq: 2.0, damping: 0.75});
  const b = Number.isFinite(outAt) ? ramp(t, outAt, outAt + dur, easeIn) : 0;
  return {
    alpha: clamp01(a * 1.6) * (1 - b),
    dy: (1 - Math.min(1, a)) * 26 - b * 14,
    s: (0.92 + 0.08 * Math.min(1.02, a)) * (1 - 0.05 * b),
    on: t >= inAt - 1 && t <= outAt + dur,
  };
};

const withT = (ctx: CanvasRenderingContext2D, k: {alpha: number; dy: number; s: number; on: boolean}, draw: () => void) => {
  if (!k.on || k.alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = k.alpha;
  const cy = CARD.y + CARD.h / 2;
  ctx.translate(W / 2, cy + k.dy);
  ctx.scale(k.s, k.s);
  ctx.translate(-W / 2, -cy);
  draw();
  ctx.restore();
};

/** A labelled row: label at the start, value (LTR number or text) at the end. */
const row = (ctx: CanvasRenderingContext2D, y: number, label: string, value: string, color: string, isNum = true, size = 24) => {
  say(ctx, label, sx() + (SC().rtl ? -4 : 4), y, {weight: 500, size: 21, color: '#C9CDD6', maxW: 170});
  if (isNum) num(ctx, value, ex() + (SC().rtl ? 4 : -4), y, {size, color, align: aEnd()});
  else say(ctx, value, ex() + (SC().rtl ? 4 : -4), y, {weight: 700, size, color, align: aEnd(), maxW: 170});
};

// ─── LEFT: trading without a plan ────────────────────────────────────────────

const RED = '#FF4D4D';
const GREEN = '#3FD08A';

/** The news arrives on the left as a red Live Activity, too late to act on. */
const LEFT_ACTS_FN = (): Activity[] => [{at: NEWS.at + 2, until: LEFT.marginCallAt + 6, color: RED, icon: 'bolt', title: SC().newsBanner, sub: SC().newsBody}];
let LEFT_ACTS: Activity[] = [];

/** Before the trade: a ticket with Sell / Buy, and "Buy" gets tapped. */
const leftTicket = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx);
  const rtl = SC().rtl;
  say(ctx, SC().noPlan, sx() + (rtl ? -6 : 6), CARD.y + 50, {weight: 500, size: 18, color: '#9AA1B0'});
  // Lot size.
  num(ctx, `3.00 ${SC().lots === 'lots' ? 'lots' : ''}`.trim(), W / 2, CARD.y + 120, {size: 44, align: 'center'});
  if (SC().lots !== 'lots') say(ctx, SC().lots, W / 2, CARD.y + 152, {weight: 500, size: 18, color: '#9AA1B0', align: 'center'});
  // Sell and Buy buttons (Buy on the reading-end side for LTR, start for RTL: like the app's order).
  const press = Math.sin(Math.PI * clamp01((t - LEFT.tapAt) / 10));
  const bw = 156;
  const by = CARD.y + 178;
  const sellX = rtl ? W / 2 + 8 : W / 2 - 8 - bw;
  const buyX = rtl ? W / 2 - 8 - bw : W / 2 + 8;
  rr(ctx, sellX, by, bw, 74, 22);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = RED;
  ctx.stroke();
  say(ctx, SC().sell, sellX + bw / 2, by + 47, {weight: 700, size: 26, color: RED, align: 'center'});
  ctx.save();
  ctx.translate(buyX + bw / 2, by + 37);
  ctx.scale(1 - 0.07 * press, 1 - 0.07 * press);
  rr(ctx, -bw / 2, -37, bw, 74, 22);
  ctx.fillStyle = GREEN;
  ctx.fill();
  if (press > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 * press})`;
    ctx.fill();
  }
  say(ctx, SC().buy, 0, 10, {weight: 700, size: 28, color: '#062514', align: 'center'});
  ctx.restore();
};

/** The open trade: Buy 3.00 lots, stop loss: none. */
const leftPosition = (ctx: CanvasRenderingContext2D) => {
  cardBox(ctx);
  const rtl = SC().rtl;
  // "Buy 3.00 lots"
  const bw = say(ctx, SC().buy, sx() + (rtl ? -6 : 6), CARD.y + 62, {weight: 700, size: 32, color: GREEN, maxW: 120});
  const nx = rtl ? sx() - 6 - bw - 14 : sx() + 6 + bw + 14;
  const lotsStr = SC().lots === 'lots' ? '3.00 lots' : '3.00';
  const lw = num(ctx, lotsStr, nx, CARD.y + 62, {size: 32});
  if (SC().lots !== 'lots') say(ctx, SC().lots, rtl ? nx - lw - 10 : nx + lw + 10, CARD.y + 62, {weight: 700, size: 32, maxW: 80});
  // The big red "Stop loss: none".
  const y = CARD.y + 98;
  rr(ctx, CARD.x + 16, y, CARD.w - 32, 96, 22);
  ctx.fillStyle = 'rgba(255,77,77,0.14)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,77,77,0.7)';
  ctx.stroke();
  const ix = rtl ? CARD.x + CARD.w - 16 - 46 : CARD.x + 16 + 46;
  ctx.beginPath();
  ctx.arc(ix, y + 48, 25, 0, Math.PI * 2);
  ctx.fillStyle = RED;
  ctx.fill();
  icon(ctx, 'x', ix, y + 48, 22, '#2a0507', 4);
  const tx = rtl ? ix - 40 : ix + 40;
  say(ctx, SC().stopLoss, tx, y + 40, {weight: 500, size: 19, color: '#F2C2C2', maxW: 230});
  say(ctx, SC().none, tx, y + 76, {weight: 700, size: 30, color: RED, maxW: 230});
  // Leverage, small.
  say(ctx, `${LANG === 'ar' ? 'الرافعة' : 'Leverage'}`, sx() + (rtl ? -6 : 6), CARD.y + 244, {weight: 500, size: 18, color: '#9AA1B0', maxW: 160});
  num(ctx, LEFT.leverage, ex() + (rtl ? 6 : -6), CARD.y + 244, {size: 20, color: '#E0B04A', align: aEnd()});
};

/** The margin call takeover: the whole screen says it. */
const marginCall = (ctx: CanvasRenderingContext2D, t: number) => {
  const d = t - LEFT.marginCallAt;
  const wipe = Math.max(0, springAt(d, {freq: 1.25, damping: 0.92}));
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, 250, 30 + 1000 * wipe, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#c0141f');
  g.addColorStop(0.5, '#730a12');
  g.addColorStop(1, '#2b0508');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W / 2, 250, 10, W / 2, 250, 380);
  rg.addColorStop(0, 'rgba(255,120,120,0.35)');
  rg.addColorStop(1, 'rgba(255,120,120,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, 0);
  /** Each element lands in turn: fades in, rises and settles. */
  const el = (delay: number, draw: () => void) => {
    const p = springAt(d - delay, {freq: 1.9, damping: 0.8});
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha = clamp01(p * 1.6);
    ctx.translate(0, (1 - Math.min(1, p)) * 26);
    draw();
    ctx.restore();
  };
  el(4, () => {
    const s = Math.max(0, springAt(d - 4, {freq: 2.2, damping: 0.5}));
    ctx.save();
    ctx.translate(0, 250);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fill();
    icon(ctx, 'warn', 0, 0, 64, '#fff', 6);
    ctx.restore();
  });
  el(10, () => say(ctx, SC().marginCall, 0, 376, {weight: 700, size: 50, color: '#fff', align: 'center', maxW: 350}));
  el(14, () => say(ctx, SC().closedLoss, 0, 420, {weight: 500, size: 21, color: '#FFD3D3', align: 'center', maxW: 350}));
  el(18, () => {
    rr(ctx, -160, 458, 320, 104, 30);
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fill();
    num(ctx, signedMoney(LEFT.pnl), 0, 530, {size: 60, color: '#fff', align: 'center'});
  });
  el(24, () => {
    say(ctx, SC().balance, 0, 626, {weight: 500, size: 19, color: '#FFD3D3', align: 'center'});
    num(ctx, usd(LEFT.finalBalance), 0, 680, {size: 44, color: '#fff', align: 'center'});
  });
  ctx.restore();
};

const drawBlind = (ctx: CanvasRenderingContext2D, t: number) => {
  LEFT_ACTS = LEFT_ACTS_FN();
  const danger = leftDanger(t);
  background(ctx, 'blind', danger);
  if (t >= LEFT.marginCallAt + 40) {
    marginCall(ctx, t);
    chrome(ctx, t, LEFT_ACTS);
    homeIndicator(ctx);
    return;
  }
  header(ctx, 'blind');
  const open = leftOpenPnl(t);
  const balColor = C.text;
  balanceBlock(ctx, leftBalance(t), balColor, open, ramp(t, LEFT.openedAt, LEFT.openedAt + 10));
  const lineColor = mixHex('#ECE7DC', RED, ramp(t, NEWS.at, NEWS.at + 8));
  chart(ctx, t, lineColor, [{price: LEFT.entry, color: '#ECE7DC', label: SC().entry, alpha: ramp(t, LEFT.openedAt, LEFT.openedAt + 12)}], RED);
  withT(ctx, tr(t, -100, LEFT.openedAt - 2, 10), () => leftTicket(ctx, t));
  withT(ctx, tr(t, LEFT.openedAt), () => leftPosition(ctx));
  if (t >= LEFT.marginCallAt) marginCall(ctx, t);
  chrome(ctx, t, LEFT_ACTS);
  homeIndicator(ctx);
};

// ─── RIGHT: trading with Miran Gold ──────────────────────────────────────────

const GOLD = '#E3B65E';

/** The right gets the Miran update before the news (gold), then "protected" when it lands (green). */
const RIGHT_ACTS = (): Activity[] => [
  {at: UPDATE.at - 6, until: UPDATE.at + 60, color: GOLD, icon: 'bell', title: SC().updateTitle, sub: SC().updateBody},
  {at: NEWS.at + 4, until: NEWS.at + 150, color: GREEN, icon: 'shield', title: SC().newsReleased, sub: SC().noOpen},
];

/** Waiting for the signal. */
const waitingCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(212,162,76,0.35)'});
  emblem(ctx, W / 2, CARD.y + 92, 44);
  say(ctx, SC().waiting, W / 2, CARD.y + 186, {weight: 600, size: 22, align: 'center', maxW: 320});
  for (let i = 0; i < 3; i++) {
    const p = 0.35 + 0.65 * Math.max(0, Math.sin((t / 8 - i * 0.9) % (Math.PI * 2)));
    ctx.beginPath();
    ctx.arc(W / 2 - 22 + i * 22, CARD.y + 226, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = hexA(GOLD, p);
    ctx.fill();
  }
};

/** The Miran signal, building line by line. */
const signalCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(212,162,76,0.7)', glow: '#C8963E'});
  const rtl = SC().rtl;
  const line = (i: number) => ramp(t, SIGNAL.at + i * SIGNAL.lineGap, SIGNAL.at + i * SIGNAL.lineGap + 10, easeOut);
  // Title row.
  ctx.save();
  ctx.globalAlpha *= line(0);
  const ex0 = rtl ? CARD.x + CARD.w - 24 - 15 : CARD.x + 24 + 15;
  emblem(ctx, ex0, CARD.y + 38, 15);
  say(ctx, SC().signalTitle, rtl ? ex0 - 24 : ex0 + 24, CARD.y + 45, {weight: 700, size: 18, color: goldGradient(ctx, 0, 0, W, 0), maxW: 200});
  // Executed tick.
  const ex1 = ramp(t, SIGNAL.filledAt, SIGNAL.filledAt + 10, easeOut);
  if (ex1 > 0) {
    ctx.globalAlpha = line(0) * ex1;
    const label = `✓ ${SC().executed}`;
    const w = measure(ctx, SC().executed, 700, 15, rtl) + 40;
    const px = rtl ? CARD.x + 22 : CARD.x + CARD.w - 22 - w;
    rr(ctx, px, CARD.y + 24, w, 30, 15);
    ctx.fillStyle = 'rgba(63,208,138,0.18)';
    ctx.fill();
    icon(ctx, 'check', rtl ? px + w - 16 : px + 16, CARD.y + 39, 12, GREEN, 2.4);
    say(ctx, SC().executed, rtl ? px + w - 30 : px + 30, CARD.y + 44, {weight: 700, size: 15, color: GREEN, maxW: w});
    void label;
  }
  ctx.restore();
  // "Buy gold".
  ctx.save();
  ctx.globalAlpha *= line(1);
  say(ctx, SC().signalHead, sx() + (rtl ? -6 : 6), CARD.y + 98, {weight: 700, size: 34, color: GREEN, maxW: 300});
  ctx.restore();
  const rows: [string, string, string][] = [
    [SC().entry, priceLabel(SIGNAL.entry), C.text],
    [SC().stopLoss, priceLabel(SIGNAL.sl), RED],
    [SC().target, priceLabel(SIGNAL.tp), GREEN],
    [SC().risk, `${SIGNAL.riskPct}%`, GOLD],
  ];
  rows.forEach(([l, v, c], i) => {
    ctx.save();
    ctx.globalAlpha *= line(i + 2);
    const y = CARD.y + 140 + i * 36;
    row(ctx, y, l, v, c);
    if (i < rows.length - 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CARD.x + 22, y + 13);
      ctx.lineTo(CARD.x + CARD.w - 22, y + 13);
      ctx.stroke();
    }
    ctx.restore();
  });
};

/** The market update: high-impact news soon, take profit now. */
const updateCard = (ctx: CanvasRenderingContext2D, t: number) => {
  const pulse = 0.5 + 0.5 * Math.sin((t - UPDATE.at) / 6);
  cardBox(ctx, {fill: 'rgba(40,33,20,0.97)', border: GOLD, glow: '#C8963E'});
  const rtl = SC().rtl;
  const ix = rtl ? CARD.x + CARD.w - 24 - 22 : CARD.x + 24 + 22;
  ctx.beginPath();
  ctx.arc(ix, CARD.y + 44, 22, 0, Math.PI * 2);
  ctx.fillStyle = hexA(GOLD, 0.2 + 0.1 * pulse);
  ctx.fill();
  icon(ctx, 'bell', ix, CARD.y + 44, 22, GOLD, 2.4);
  say(ctx, SC().updateTitle, rtl ? ix - 34 : ix + 34, CARD.y + 52, {weight: 700, size: 22, color: GOLD, maxW: 240});
  say(ctx, SC().updateBody, sx() + (rtl ? -6 : 6), CARD.y + 120, {weight: 700, size: 27, color: C.text, maxW: CARD.w - 40});
  // The button.
  const press = Math.sin(Math.PI * clamp01((t - UPDATE.tapAt) / 10));
  ctx.save();
  ctx.translate(W / 2, CARD.y + 196);
  ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
  rr(ctx, -(CARD.w - 40) / 2, -34, CARD.w - 40, 68, 34);
  ctx.fillStyle = goldGradient(ctx, -170, 0, 170, 0);
  ctx.fill();
  if (press > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 * press})`;
    ctx.fill();
  }
  say(ctx, SC().updateAction, 0, 10, {weight: 700, size: 26, color: '#1a1206', align: 'center', maxW: 300});
  ctx.restore();
};

/** Profit taken before the news. */
const profitCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(63,208,138,0.6)'});
  const k = springAt(t - UPDATE.closedAt, {freq: 2.2, damping: 0.5});
  ctx.save();
  ctx.translate(W / 2, CARD.y + 74);
  ctx.scale(Math.max(0, k), Math.max(0, k));
  icon(ctx, 'checkCircle', 0, 0, 72, GREEN, 4.5);
  ctx.restore();
  say(ctx, SC().profitTaken, W / 2, CARD.y + 152, {weight: 700, size: 26, align: 'center'});
  num(ctx, signedMoney(UPDATE.profit), W / 2, CARD.y + 212, {size: 52, color: GREEN, align: 'center'});
  say(ctx, SC().noOpen, W / 2, CARD.y + 252, {weight: 500, size: 17, color: '#AEB4C2', align: 'center', maxW: 330});
};

/** The news hits: protected. */
const protectedCard = (ctx: CanvasRenderingContext2D, t: number) => {
  const k = springAt(t - (NEWS.at + 10), {freq: 2.0, damping: 0.5});
  cardBox(ctx, {fill: 'rgba(14,44,32,0.97)', border: GREEN, glow: '#1d8a55'});
  ctx.save();
  ctx.translate(W / 2, CARD.y + 84);
  ctx.scale(0.6 + 0.4 * Math.max(0, k), 0.6 + 0.4 * Math.max(0, k));
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(63,208,138,0.18)';
  ctx.fill();
  icon(ctx, 'shield', 0, 0, 66, GREEN, 5);
  ctx.restore();
  say(ctx, SC().protectedTitle, W / 2, CARD.y + 196, {weight: 700, size: 46, color: GREEN, align: 'center'});
  const label = SC().protectedBody;
  const rtl = SC().rtl;
  const lw = measure(ctx, label, 600, 21, rtl);
  const nw = measure(ctx, signedMoney(UPDATE.profit), 700, 23, false);
  const total = lw + 12 + nw;
  const left = W / 2 - total / 2;
  if (rtl) {
    say(ctx, label, left + total, CARD.y + 246, {weight: 600, size: 21, color: '#CFEBDD', align: 'right'});
    num(ctx, signedMoney(UPDATE.profit), left, CARD.y + 246, {size: 23, color: GREEN, align: 'left'});
  } else {
    say(ctx, label, left, CARD.y + 246, {weight: 600, size: 21, color: '#CFEBDD', align: 'left'});
    num(ctx, signedMoney(UPDATE.profit), left + total, CARD.y + 246, {size: 23, color: GREEN, align: 'right'});
  }
};

const drawMiranRight = (ctx: CanvasRenderingContext2D, t: number) => {
  background(ctx, 'miran', 0);
  header(ctx, 'miran');
  const bal = rightBalance(t);
  balanceBlock(
    ctx,
    bal,
    mixHex('#F5F1E8', GREEN, ramp(t, UPDATE.closedAt, UPDATE.closedAt + 16)),
    rightOpenPnl(t),
    ramp(t, SIGNAL.filledAt, SIGNAL.filledAt + 10) * (1 - ramp(t, UPDATE.closedAt, UPDATE.closedAt + 8)),
    {from: RIGHT.startBalance, to: RIGHT.finalBalance, at: UPDATE.closedAt, t},
  );
  const lv = ramp(t, SIGNAL.filledAt, SIGNAL.filledAt + 16) * (1 - ramp(t, UPDATE.closedAt, UPDATE.closedAt + 14));
  chart(
    ctx,
    t,
    GOLD,
    [
      {price: SIGNAL.tp, color: GREEN, label: 'TP', alpha: lv},
      {price: SIGNAL.entry, color: '#ECE7DC', label: SC().entry, alpha: lv},
      {price: SIGNAL.sl, color: RED, label: 'SL', alpha: lv},
    ],
    GOLD,
  );
  withT(ctx, tr(t, -100, SIGNAL.at - 4, 10), () => waitingCard(ctx, t));
  withT(ctx, tr(t, SIGNAL.at, UPDATE.at - 6, 10), () => signalCard(ctx, t));
  withT(ctx, tr(t, UPDATE.at, UPDATE.closedAt - 2, 10), () => updateCard(ctx, t));
  withT(ctx, tr(t, UPDATE.closedAt, NEWS.at + 6, 10), () => profitCard(ctx, t));
  withT(ctx, tr(t, NEWS.at + 10), () => protectedCard(ctx, t));
  chrome(ctx, t, RIGHT_ACTS());
  homeIndicator(ctx);
};

// ─── LEFT after the flip: connected to Miran Gold ────────────────────────────

const drawMiranLeft = (ctx: CanvasRenderingContext2D, t: number) => {
  background(ctx, 'miran', 0);
  header(ctx, 'miran');
  balanceBlock(ctx, leftBalance(t), C.text, null, 0);
  chart(ctx, t, GOLD, [], GOLD);
  const k = tr(t, (TIMING.flipStart + TIMING.flipEnd) / 2 + 4);
  withT(ctx, k, () => {
    cardBox(ctx, {border: GOLD, glow: '#C8963E'});
    emblem(ctx, W / 2, CARD.y + 80, 50);
    say(ctx, SC().connected, W / 2, CARD.y + 176, {weight: 700, size: 26, color: goldGradient(ctx, 40, 0, W - 40, 0), align: 'center', maxW: 340});
    say(ctx, SC().nextSignal, W / 2, CARD.y + 226, {weight: 600, size: 19, color: '#D5D8DF', align: 'center', maxW: 340});
  });
  chrome(ctx, t);
  homeIndicator(ctx);
};

// ─── Exports ─────────────────────────────────────────────────────────────────

const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * k));
  return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

void easeInOut;

export const drawLeftScreen = (ctx: CanvasRenderingContext2D, t: number) => (leftIsMiran(t) ? drawMiranLeft(ctx, t) : drawBlind(ctx, t));
export const drawRightScreen = (ctx: CanvasRenderingContext2D, t: number) => drawMiranRight(ctx, t);

/** Screens stop changing once the end card covers them. */
const FREEZE = TIMING.endCardStart + 60;
export const leftScreenKey = (t: number) => `${LANG}|${Math.min(t, FREEZE)}`;
export const rightScreenKey = (t: number) => `${LANG}|${Math.min(t, FREEZE)}`;
