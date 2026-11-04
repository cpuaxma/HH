// The two phone screens, drawn per frame into 1200 × 2670 canvases (400 × 890 pt at 3×).
// One fictional, unbranded trading app on XAU/USD, in three modes:
// - "blind": the left phone, trading without a plan (copied trades, no stop loss, no news);
// - "miran": the right phone, trading with Miran Gold (signal, 1% risk, market updates);
// - the left phone after its flip, now on Miran Gold too.
// Static parts are cached layers; the rest is drawn from pure functions of the frame.
import {
  FRESH_SIGNAL,
  LEFT,
  LEFT_AFTER_NOTIFS,
  LEFT_NOTIFS,
  LEFT_TRADES,
  Lang,
  MARKET,
  NEWS,
  RIGHT,
  RIGHT_NOTIFS,
  SCREEN_COPY,
  SIGNAL,
  TIMING,
  TOP_TRADER,
} from '../data';
import {clamp01, easeIn, easeInOut, easeOut, keyframes, ramp, springAt} from '../lib/ease';
import {
  Side,
  candleAt,
  chartRange,
  equitySeries,
  leftBalance,
  leftEquity,
  leftFloating,
  leftIsMiran,
  leftLossFlash,
  leftMarginLevel,
  liveCandle,
  price,
  rightBalance,
  rightFloating,
} from '../lib/story';
import {
  C,
  H,
  IconKind,
  W,
  emblem,
  fit,
  goldGradient,
  icon,
  layer,
  measure,
  money,
  pill,
  priceStr,
  rr,
  signedMoney,
  signedPct,
  smear,
  softShadow,
  tagPill,
  text,
} from './kit';

// ─── Language ────────────────────────────────────────────────────────────────

let LANG: Lang = 'ar';
export const setScreenLang = (l: Lang) => {
  LANG = l;
};
const SC = () => SCREEN_COPY[LANG];

/** Localised text inside [xl, xr]: right-aligned RTL for Arabic, left-aligned for English. */
const ltext = (ctx: CanvasRenderingContext2D, s: string, xl: number, xr: number, y: number, o: {weight?: number; size?: number; color?: string | CanvasGradient} = {}) => {
  const rtl = SC().rtl;
  const size = fit(ctx, s, o.weight ?? 500, o.size ?? 14, xr - xl, rtl);
  return text(ctx, s, rtl ? xr : xl, y, {...o, size, align: rtl ? 'right' : 'left', rtl});
};

const illus = (ctx: CanvasRenderingContext2D, rightX: number, y: number, size = 9) => tagPill(ctx, SC().illustrative, rightX, y, {rtl: SC().rtl, size});

// ─── Shared pieces ───────────────────────────────────────────────────────────

const clockAt = keyframes([
  [0, 13 * 60 + 58],
  [430, 14 * 60],
  [478, 14 * 60 + 30],
  [720, 14 * 60 + 41],
  [1020, 15 * 60 + 6],
]);
export const clockLabel = (t: number) => {
  const m = Math.floor(clockAt(t));
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

const statusBar = (ctx: CanvasRenderingContext2D, t: number) => {
  text(ctx, clockLabel(t), 30, 31, {weight: 600, size: 15, color: C.text});
  ctx.beginPath();
  ctx.arc(W / 2, 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    rr(ctx, 300 + i * 6, 31 - 4 - i * 3, 4, 4 + i * 3, 1);
    ctx.fillStyle = C.text;
    ctx.fill();
  }
  rr(ctx, 334, 19, 30, 14, 4);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = C.text;
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.globalAlpha = 1;
  rr(ctx, 336.5, 21.5, 20, 9, 2.4);
  ctx.fillStyle = C.text;
  ctx.fill();
  rr(ctx, 365.5, 23.5, 2.4, 5, 1);
  ctx.fill();
};

type Mode = 'blind' | 'miran';

/** Background, header and bottom nav: drawn once per mode and language. */
const baseLayer = (mode: Mode) =>
  layer(`base:${mode}:${LANG}`, W, H, 3, (ctx) => {
    ctx.fillStyle = C.appBg;
    ctx.fillRect(0, 0, W, H);
    // Header: a generic app mark, the pair.
    rr(ctx, 20, 52, 34, 34, 10);
    ctx.fillStyle = C.cardHi;
    ctx.fill();
    icon(ctx, 'chart', 37, 69, 18, C.text, 2);
    text(ctx, MARKET.pair, 64, 68, {weight: 700, size: 18, color: C.text});
    text(ctx, MARKET.pairName, 64, 85, {weight: 500, size: 11.5, color: C.meta});
    // Header chip: who drives this account.
    if (mode === 'blind') {
      const label = `Copying ${TOP_TRADER}`;
      const w = measure(ctx, label, 600, 11) + 34;
      rr(ctx, W - 20 - w, 56, w, 26, 13);
      ctx.fillStyle = '#2A1C22';
      ctx.fill();
      icon(ctx, 'copy', W - 20 - w + 16, 69, 12, C.red, 1.5);
      text(ctx, label, W - 20 - w + 26, 73, {weight: 600, size: 11, color: '#F0B4B2'});
    } else {
      const label = SC().brand;
      const w = measure(ctx, label, 700, 12, SC().rtl) + 40;
      rr(ctx, W - 20 - w, 55, w, 28, 14);
      ctx.fillStyle = '#231D12';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(212,162,76,0.55)';
      ctx.stroke();
      emblem(ctx, W - 20 - w + 15, 69, 10);
      text(ctx, label, W - 20 - w + 30 + (w - 36) / 2, 73.5, {weight: 700, size: 12, color: goldGradient(ctx, W - 20 - w, 0, W - 20, 0), align: 'center', rtl: SC().rtl});
    }
    // Account block: static labels.
    text(ctx, 'Balance', 24, 126, {weight: 500, size: 12.5, color: C.meta});
    // Chart card.
    rr(ctx, 12, 214, W - 24, 258, 20);
    ctx.fillStyle = C.card;
    ctx.fill();
    text(ctx, `${MARKET.pair} · M1`, 26, 238, {weight: 600, size: 11.5, color: C.meta});
    // Bottom nav.
    ctx.fillStyle = '#0E1320';
    ctx.fillRect(0, 838, W, H - 838);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, 838, W, 1);
    const kinds: IconKind[] = ['home', 'chart', mode === 'blind' ? 'copy' : 'signal', 'bell', 'user'];
    kinds.forEach((k, i) => icon(ctx, k, 48 + i * 76, 864, 22, i === 1 ? C.text : C.dim, 2));
  });

// ─── Account block ───────────────────────────────────────────────────────────

const accountBlock = (ctx: CanvasRenderingContext2D, t: number, side: Side, miran: boolean) => {
  const bal = side === 'left' ? leftBalance(t) : rightBalance(t);
  const flt = side === 'left' ? leftFloating(t) : rightFloating(t);
  const eq = side === 'left' ? leftEquity(t) : bal + flt;
  // During the news candle the left screen shows equity (it is what collapses).
  const showEq = side === 'left' && t >= NEWS.at && t < LEFT_TRADES[3].closedAt;
  const big = showEq ? eq : bal;
  const start = side === 'left' && miran ? LEFT.finalBalance : 10000;
  const pct = ((bal + (miran && side === 'left' ? flt : 0) - start) / start) * 100;
  illus(ctx, W - 24, 112);
  const bigColor = side === 'left' && !miran ? (showEq || bal < 10000 ? '#F2C4C2' : C.text) : C.text;
  text(ctx, `$${money(big)}`, 22, 166, {weight: 700, size: 36, color: bigColor});
  if (showEq) text(ctx, 'Equity', 24 + measure(ctx, `$${money(big)}`, 700, 36) + 8, 166, {weight: 600, size: 11, color: C.red});
  // Change today.
  const up = pct >= 0;
  const chg = `${up ? '+' : '−'}${Math.abs(pct).toFixed(1)}% today`;
  const cw = measure(ctx, chg, 700, 11.5) + 26;
  rr(ctx, 22, 176, cw, 22, 11);
  ctx.fillStyle = up ? 'rgba(76,195,138,0.14)' : 'rgba(217,83,79,0.16)';
  ctx.fill();
  icon(ctx, up ? 'up' : 'down', 33, 187, 9, up ? C.up : C.red);
  text(ctx, chg, 41, 191, {weight: 700, size: 11.5, color: up ? C.up : C.red});
  // Floating P&L.
  if (Math.abs(flt) > 0.5 && !showEq) {
    const label = `Floating ${signedMoney(flt, 2)}`;
    text(ctx, label, 30 + cw, 191, {weight: 600, size: 11.5, color: flt >= 0 ? C.up : C.red});
  }
  // Equity sparkline.
  const s = equitySeries(side, t);
  const x0 = 258;
  const x1 = 376;
  const y0 = 132;
  const y1 = 176;
  let lo = Math.min(...s);
  let hi = Math.max(...s);
  const mid = (lo + hi) / 2;
  const span = Math.max(hi - lo, 180);
  lo = mid - span / 2;
  hi = mid + span / 2;
  const col = side === 'left' && !miran ? C.red : C.goldB;
  ctx.save();
  ctx.beginPath();
  s.forEach((v, i) => {
    const x = x0 + ((x1 - x0) * i) / (s.length - 1);
    const y = y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineWidth = 2;
  ctx.strokeStyle = col;
  ctx.stroke();
  ctx.lineTo(x1, y1 + 8);
  ctx.lineTo(x0, y1 + 8);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, y0, 0, y1 + 8);
  g.addColorStop(0, side === 'left' && !miran ? 'rgba(217,83,79,0.32)' : 'rgba(212,162,76,0.32)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  text(ctx, 'Equity', x1, 204, {weight: 500, size: 10, color: C.dim, align: 'right'});
};

// ─── Chart ───────────────────────────────────────────────────────────────────

const PLOT = {x0: 22, x1: 330, y0: 250, y1: 458};

const niceStep = (span: number) => {
  const raw = span / 4;
  for (const s of [1, 2, 2.5, 5, 10, 20]) if (raw <= s) return s;
  return 20;
};

type Level = {price: number; label: string; color: string; dash?: number[]};

const chart = (ctx: CanvasRenderingContext2D, t: number, levels: Level[], newsKnown: boolean, accent: string) => {
  const {x0, x1, y0, y1} = PLOT;
  const [lo, hi] = chartRange(t);
  const yOf = (p: number) => y1 - ((p - lo) / (hi - lo)) * (y1 - y0);
  const n = MARKET.visibleCandles;
  const cw = (x1 - x0) / n;
  const u = t / MARKET.candleFrames;
  const xr = x1 - cw * 0.8;
  const xOf = (k: number) => xr - (u - (k + 0.5)) * cw;
  // Grid and price axis.
  const step = niceStep(hi - lo);
  ctx.save();
  for (let p = Math.ceil(lo / step) * step; p < hi; p += step) {
    const y = yOf(p);
    if (y < y0 + 4 || y > y1 - 4) continue;
    ctx.fillStyle = C.line;
    ctx.fillRect(x0, y, x1 - x0, 0.8);
    text(ctx, priceStr(p).replace(/\.00$/, ''), 384, y + 3.5, {weight: 500, size: 9.5, color: C.dim, align: 'right'});
  }
  ctx.beginPath();
  ctx.rect(x0, y0 - 6, x1 - x0 + 4, y1 - y0 + 12);
  ctx.clip();
  // The news candle marker.
  const kNews = Math.floor(NEWS.at / MARKET.candleFrames);
  const xn = xOf(kNews);
  if (newsKnown || t >= NEWS.at) {
    ctx.fillStyle = 'rgba(232,163,61,0.10)';
    ctx.fillRect(xn - cw / 2, y0, cw, y1 - y0);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(232,163,61,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xn, y0);
    ctx.lineTo(xn, y1);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Levels (entry, stop loss, targets).
  for (const l of levels) {
    const y = yOf(l.price);
    if (y < y0 - 2 || y > y1 + 2) continue;
    ctx.setLineDash(l.dash ?? [5, 4]);
    ctx.strokeStyle = l.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    const w = measure(ctx, l.label, 700, 9) + 10;
    rr(ctx, x0 + 2, y - 8, w, 16, 5);
    ctx.fillStyle = l.color;
    ctx.fill();
    text(ctx, l.label, x0 + 2 + w / 2, y + 3.2, {weight: 700, size: 9, color: '#0B0F19', align: 'center'});
  }
  // Candles.
  const now = liveCandle(t);
  for (let k = now - n - 1; k <= now; k++) {
    const c = candleAt(k, t);
    const x = xOf(k);
    if (x < x0 - cw || x > x1 + cw) continue;
    const upC = c.c >= c.o;
    const col = upC ? C.up : C.red;
    ctx.fillStyle = col;
    ctx.fillRect(x - 0.6, yOf(c.h), 1.2, Math.max(1, yOf(c.l) - yOf(c.h)));
    const top = yOf(Math.max(c.o, c.c));
    const bh = Math.max(1.2, Math.abs(yOf(c.o) - yOf(c.c)));
    ctx.fillRect(x - cw * 0.32, top, cw * 0.64, bh);
  }
  ctx.restore();
  // Live price line and tag.
  const p = price(t);
  const y = Math.min(y1, Math.max(y0, yOf(p)));
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1 + 4, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  const live = candleAt(now, t);
  const tagCol = live.c >= live.o ? C.up : C.red;
  rr(ctx, 334, y - 9, 54, 18, 5);
  ctx.fillStyle = tagCol;
  ctx.fill();
  text(ctx, priceStr(p), 361, y + 3.6, {weight: 700, size: 9.5, color: '#0B0F19', align: 'center'});
  // Header price.
  text(ctx, priceStr(p), W - 26, 238, {weight: 700, size: 13, color: tagCol, align: 'right'});
};

// ─── Notification banners (stacked, newest on top, smeared while moving) ─────

type Notif = {at: number; kind: string; title: string; body: string};

const BANNER_H = 50;
const BANNER_GAP = 56;

const bannerY = (n: Notif, all: Notif[], t: number) => {
  const drop = springAt(t - n.at, {freq: 2.6, damping: 0.62});
  let rank = 0;
  for (const m of all) if (m.at > n.at && m.at <= t) rank += easeOut(clamp01((t - m.at) / 12));
  return {y: 12 + rank * BANNER_GAP - (1 - drop) * 80, rank};
};

const KIND: Record<string, {icon: IconKind | 'emblem'; tint: string; color: string}> = {
  copy: {icon: 'copy', tint: '#22293A', color: '#AEB6C8'},
  loss: {icon: 'down', tint: '#3A1F24', color: C.red},
  warn: {icon: 'warn', tint: '#3A2E1C', color: C.warn},
  news: {icon: 'news', tint: '#3A1F24', color: C.red},
  call: {icon: 'warn', tint: '#5A2024', color: '#FFD2D0'},
  tp: {icon: 'emblem', tint: '#1C2A22', color: C.up},
  sl: {icon: 'emblem', tint: '#22293A', color: C.meta},
  signal: {icon: 'emblem', tint: '#2A2214', color: C.goldB},
  shield: {icon: 'emblem', tint: '#2A2214', color: C.goldB},
  update: {icon: 'emblem', tint: '#2A2214', color: C.goldB},
};

const banner = (ctx: CanvasRenderingContext2D, n: Notif, y: number, alpha: number, scale: number) => {
  if (alpha <= 0.01) return;
  const k = KIND[n.kind] ?? KIND.copy;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W / 2, y + BANNER_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-W / 2, -BANNER_H / 2);
  softShadow(ctx, 16, 2, W - 32, BANNER_H - 4, 0.55, 6);
  rr(ctx, 12, 0, W - 24, BANNER_H, 16);
  ctx.fillStyle = n.kind === 'call' ? '#4A1B20' : 'rgba(28,35,52,0.98)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = n.kind === 'call' ? 'rgba(217,83,79,0.9)' : k.icon === 'emblem' ? 'rgba(212,162,76,0.45)' : '#2E374B';
  ctx.stroke();
  if (k.icon === 'emblem') emblem(ctx, 40, BANNER_H / 2, 15);
  else {
    ctx.beginPath();
    ctx.arc(40, BANNER_H / 2, 15, 0, Math.PI * 2);
    ctx.fillStyle = k.tint;
    ctx.fill();
    icon(ctx, k.icon, 40, BANNER_H / 2, 15, k.color, 1.8);
  }
  text(ctx, n.title, 64, 22, {weight: 700, size: fit(ctx, n.title, 700, 13, 270), color: n.kind === 'call' ? '#FFFFFF' : k.icon === 'emblem' ? k.color : C.text});
  text(ctx, n.body, 64, 39, {weight: 500, size: fit(ctx, n.body, 500, 11, 290), color: n.kind === 'call' ? '#F2C4C2' : C.meta});
  text(ctx, 'now', W - 26, 22, {weight: 500, size: 10.5, color: C.dim, align: 'right'});
  ctx.restore();
};

const notifStack = (ctx: CanvasRenderingContext2D, list: Notif[], t: number, life: number, maxRank = 1.6) => {
  const live = list.filter((n) => n.at <= t + 0.5 && t - n.at < life + 20);
  if (!live.length) return;
  let travel = 0;
  for (const n of live) travel = Math.max(travel, Math.abs(bannerY(n, list, t + 0.25).y - bannerY(n, list, t - 0.25).y));
  const samples = Math.min(8, Math.max(1, Math.ceil(travel)));
  smear(
    ctx,
    samples,
    (c, i) => {
      const ts = samples === 1 ? t : t + 0.5 * ((i + 0.5) / samples - 0.5);
      for (const n of [...live].reverse()) {
        if (n.at > ts) continue;
        const {y, rank} = bannerY(n, list, ts);
        const age = 1 - ramp(ts, n.at + life, n.at + life + 16, easeIn);
        const alpha = clamp01(maxRank + 1 - rank) * clamp01((ts - n.at) / 3 + 0.4) * age;
        banner(c, n, y - (1 - age) * 30, alpha, 1 - Math.min(rank, 3) * 0.04);
      }
    },
    -90,
    12 + 3 * BANNER_GAP + BANNER_H + 20,
  );
};

// ─── Cards ───────────────────────────────────────────────────────────────────

const card = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, {gold = false, red = false, alpha = 1} = {}) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  softShadow(ctx, x + 4, y + 4, w - 8, h - 6, 0.5, 6);
  rr(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.card;
  ctx.fill();
  if (gold || red) {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = gold ? 'rgba(212,162,76,0.6)' : 'rgba(217,83,79,0.7)';
    ctx.stroke();
  }
  ctx.restore();
};

/** A horizontal risk gauge (green → amber → red) with a needle at v (0–1). */
const riskMeter = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, v: number, label: string, value: string, color: string) => {
  text(ctx, label, x, y, {weight: 600, size: 12, color: C.meta});
  text(ctx, value, x + w, y, {weight: 700, size: 13, color, align: 'right'});
  const by = y + 12;
  const segs = 10;
  for (let i = 0; i < segs; i++) {
    const sx = x + (w / segs) * i;
    const f = i / (segs - 1);
    const col = f < 0.35 ? C.up : f < 0.65 ? C.warn : C.red;
    rr(ctx, sx + 1, by, w / segs - 2, 10, 3);
    ctx.fillStyle = col;
    ctx.globalAlpha = v * segs >= i + 0.5 ? 1 : 0.22;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  const nx = x + w * clamp01(v);
  ctx.beginPath();
  ctx.moveTo(nx, by - 2);
  ctx.lineTo(nx - 6, by - 10);
  ctx.lineTo(nx + 6, by - 10);
  ctx.closePath();
  ctx.fillStyle = C.text;
  ctx.fill();
};

/** Row of a trade list (left phone). */
const tradeRow = (
  ctx: CanvasRenderingContext2D,
  y: number,
  r: {side: string; lots: number; source: string; note: string; pnl: number; open: boolean},
  alpha: number,
  t: number,
) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.line;
  ctx.fillRect(28, y + 58, W - 56, 1);
  const buy = r.side === 'BUY';
  pill(ctx, r.side, 28, y + 8, {bg: buy ? 'rgba(76,195,138,0.16)' : 'rgba(217,83,79,0.18)', color: buy ? C.up : C.red, size: 11, h: 22, padX: 8});
  text(ctx, `${r.lots.toFixed(2)} lots`, 80, y + 24, {weight: 700, size: 14, color: C.text});
  text(ctx, r.source, 28, y + 48, {weight: 500, size: 11, color: C.meta});
  text(ctx, 'SL: —', 168, y + 24, {weight: 700, size: 12, color: C.red});
  // The "?" where a reason should be.
  const qx = 250;
  const q = 0.5 + 0.5 * Math.sin(t / 6);
  ctx.beginPath();
  ctx.arc(qx, y + 20, 11, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(232,163,61,${0.16 + 0.12 * q})`;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = C.warn;
  ctx.stroke();
  text(ctx, '?', qx, y + 25.5, {weight: 700, size: 15, color: C.warn, align: 'center'});
  text(ctx, 'Reason', qx, y + 46, {weight: 500, size: 9.5, color: C.dim, align: 'center'});
  text(ctx, signedMoney(r.pnl, 0), W - 28, y + 25, {weight: 700, size: 15, color: r.pnl >= 0 ? C.up : C.red, align: 'right'});
  text(ctx, r.note, W - 28, y + 46, {weight: 500, size: 10.5, color: r.open ? C.warn : C.dim, align: 'right'});
  ctx.restore();
};

// ─── LEFT: trading blind ─────────────────────────────────────────────────────

const FOCUS_Y = 482;

const leftTrades = (ctx: CanvasRenderingContext2D, t: number, alpha: number) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, 12, FOCUS_Y, W - 24, 346);
  text(ctx, "Today's trades", 28, FOCUS_Y + 30, {weight: 700, size: 16, color: C.text});
  illus(ctx, W - 28, FOCUS_Y + 16);
  const [t1, t2, t3] = LEFT_TRADES;
  const rows: {side: string; lots: number; source: string; note: string; pnl: number; open: boolean; at: number}[] = [
    {side: t1.side, lots: t1.lots, source: `Copied · ${TOP_TRADER}`, note: t < t1.closedAt ? 'open · no stop loss' : 'closed in panic', pnl: t < t1.closedAt ? leftFloating(t) : t1.pnl, open: t < t1.closedAt, at: -100},
    {side: t2.side, lots: t2.lots, source: 'Manual · random buy', note: t < t2.closedAt ? 'opened late' : 'closed in panic', pnl: t < t2.closedAt ? leftFloating(t) : t2.pnl, open: t < t2.closedAt, at: t2.openedAt},
    {side: t3.side, lots: t3.lots, source: 'Manual · random sell', note: t < t3.closedAt ? 'guess' : 'closed in panic', pnl: t < t3.closedAt ? leftFloating(t) : t3.pnl, open: t < t3.closedAt, at: t3.openedAt},
  ];
  // Newest on top, pushing the older ones down.
  const shown = rows.filter((r) => t >= r.at).reverse();
  let y = FOCUS_Y + 46;
  for (const r of shown) {
    const p = easeOut(clamp01((t - r.at) / 14));
    tradeRow(ctx, y - (1 - p) * 30, r, p, t);
    y += 62 * p;
  }
  // Summary: no plan.
  const sy = FOCUS_Y + 300;
  rr(ctx, 28, sy, W - 56, 32, 10);
  ctx.fillStyle = 'rgba(217,83,79,0.12)';
  ctx.fill();
  icon(ctx, 'question', 46, sy + 16, 14, C.warn, 1.8);
  text(ctx, 'No plan · no stop loss · no reason', 62, sy + 21, {weight: 600, size: 12, color: '#F0B4B2'});
  ctx.restore();
};

const leftPosition = (ctx: CanvasRenderingContext2D, t: number, alpha: number) => {
  if (alpha <= 0) return;
  const T4 = LEFT_TRADES[3];
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, 12, FOCUS_Y, W - 24, 346, {red: true});
  text(ctx, 'Open position', 28, FOCUS_Y + 30, {weight: 700, size: 16, color: C.text});
  illus(ctx, W - 28, FOCUS_Y + 16);
  pill(ctx, 'BUY', 28, FOCUS_Y + 46, {bg: 'rgba(76,195,138,0.16)', color: C.up, size: 13, h: 28, padX: 10});
  text(ctx, `${T4.lots.toFixed(2)} lots`, 86, FOCUS_Y + 68, {weight: 700, size: 24, color: C.text});
  text(ctx, `Copied late from ${TOP_TRADER} · ${priceStr(T4.entry)}`, 28, FOCUS_Y + 94, {weight: 500, size: 11, color: C.meta});
  // Three big boxes: stop loss, leverage, lot size.
  const flash = 0.5 + 0.5 * Math.sin(t / 4.5);
  const boxes: [string, string][] = [
    ['Stop loss', 'SL: —'],
    ['Leverage', LEFT.leverage],
    ['Lot size', T4.lots.toFixed(2)],
  ];
  boxes.forEach(([label, value], i) => {
    const bx = 28 + i * 118;
    const by = FOCUS_Y + 108;
    rr(ctx, bx, by, 108, 78, 14);
    ctx.fillStyle = `rgba(217,83,79,${0.1 + 0.1 * flash})`;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(217,83,79,${0.5 + 0.4 * flash})`;
    ctx.stroke();
    text(ctx, label, bx + 54, by + 24, {weight: 600, size: 11, color: '#F0B4B2', align: 'center'});
    text(ctx, value, bx + 54, by + 58, {weight: 700, size: fit(ctx, value, 700, 24, 96), color: C.red, align: 'center'});
  });
  // Risk meter swinging into the red.
  const swing = springAt(t - (T4.openedAt + 4), {freq: 1.6, damping: 0.35});
  const v = 0.3 + 0.64 * swing + 0.02 * Math.sin(t / 3.1);
  riskMeter(ctx, 28, FOCUS_Y + 222, W - 56, v, 'Account risk', 'EXTREME', C.red);
  const ml = leftMarginLevel(t);
  text(ctx, `Margin level ${ml ? Math.round(ml) : LEFT.marginBefore}%`, 28, FOCUS_Y + 276, {weight: 700, size: 14, color: C.warn});
  const fl = leftFloating(t);
  text(ctx, `Floating ${signedMoney(fl, 2)}`, W - 28, FOCUS_Y + 276, {weight: 700, size: 14, color: fl >= 0 ? C.up : C.red, align: 'right'});
  rr(ctx, 28, FOCUS_Y + 298, W - 56, 32, 10);
  ctx.fillStyle = 'rgba(217,83,79,0.12)';
  ctx.fill();
  icon(ctx, 'warn', 46, FOCUS_Y + 314, 14, C.red, 1.8);
  text(ctx, 'No stop loss · oversized lot · 1:500', 62, FOCUS_Y + 319, {weight: 600, size: 12, color: '#F0B4B2'});
  ctx.restore();
};

const leftCalendar = (ctx: CanvasRenderingContext2D, t: number, alpha: number) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, 12, FOCUS_Y, W - 24, 346);
  icon(ctx, 'calendar', 36, FOCUS_Y + 25, 18, C.meta, 1.8);
  text(ctx, 'Economic calendar', 54, FOCUS_Y + 31, {weight: 700, size: 16, color: C.text});
  const nw = pill(ctx, 'Not opened', W - 28 - 96, FOCUS_Y + 16, {bg: '#22293A', color: C.meta, size: 11, h: 24, padX: 10});
  void nw;
  icon(ctx, 'eyeOff', W - 28 - 110, FOCUS_Y + 28, 16, C.dim, 1.6);
  // Events, greyed out: never looked at.
  ctx.save();
  ctx.globalAlpha *= 0.42;
  const ev: [string, string, number, string][] = [
    ['14:30', 'USD', 3, NEWS.detail],
    ['16:00', 'USD', 2, 'Consumer sentiment'],
    ['18:00', 'EUR', 1, 'Speech'],
  ];
  ev.forEach(([time, ccy, impactN, name], i) => {
    const y = FOCUS_Y + 62 + i * 46;
    rr(ctx, 28, y, W - 56, 38, 10);
    ctx.fillStyle = C.cardHi;
    ctx.fill();
    text(ctx, time, 40, y + 24, {weight: 700, size: 13, color: C.text});
    text(ctx, ccy, 90, y + 24, {weight: 700, size: 12, color: C.meta});
    for (let b = 0; b < 3; b++) {
      rr(ctx, 124 + b * 9, y + 13, 6, 12, 2);
      ctx.fillStyle = b < impactN ? C.red : C.line;
      ctx.fill();
    }
    text(ctx, name, 162, y + 24, {weight: 500, size: 12, color: C.text});
  });
  ctx.restore();
  text(ctx, '0 alerts set · 1 high-impact event today', 28, FOCUS_Y + 222, {weight: 500, size: 11.5, color: C.dim});
  // The open position, still without a stop.
  const T4 = LEFT_TRADES[3];
  const y = FOCUS_Y + 240;
  rr(ctx, 28, y, W - 56, 60, 12);
  ctx.fillStyle = 'rgba(217,83,79,0.1)';
  ctx.fill();
  text(ctx, `BUY ${T4.lots.toFixed(2)} · ${LEFT.leverage}`, 42, y + 25, {weight: 700, size: 14, color: C.text});
  text(ctx, 'SL: —', 42, y + 46, {weight: 700, size: 12, color: C.red});
  const fl = t < T4.closedAt ? leftFloating(t) : T4.pnl;
  text(ctx, signedMoney(fl, 2), W - 42, y + 33, {weight: 700, size: 16, color: fl >= 0 ? C.up : C.red, align: 'right'});
  text(ctx, 'Not watching the news', 28, FOCUS_Y + 330, {weight: 600, size: 12, color: '#F0B4B2'});
  ctx.restore();
};

/** "Margin level 112%" then "Margin call": the overlay cards on the left after the news. */
const leftCrash = (ctx: CanvasRenderingContext2D, t: number) => {
  const ml = leftMarginLevel(t);
  const warnIn = springAt(t - (NEWS.at + 6), {freq: 2.4, damping: 0.5});
  const callAt = LEFT_NOTIFS[LEFT_NOTIFS.length - 1].at;
  const callIn = springAt(t - callAt, {freq: 2.0, damping: 0.55});
  if (t >= NEWS.at + 6 && t < callAt + 10) {
    const a = clamp01(warnIn * 2) * (1 - ramp(t, callAt, callAt + 10));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, FOCUS_Y + 60);
    ctx.scale(0.8 + 0.2 * warnIn, 0.8 + 0.2 * warnIn);
    ctx.translate(-W / 2, -(FOCUS_Y + 60));
    card(ctx, 20, FOCUS_Y + 6, W - 40, 110, {red: true});
    icon(ctx, 'warn', 50, FOCUS_Y + 44, 24, C.red, 2.2);
    text(ctx, `Margin level ${Math.round(ml ?? LEFT.marginAtNews)}%`, 74, FOCUS_Y + 52, {weight: 700, size: 22, color: C.red});
    text(ctx, 'Equity collapsing · no stop loss', 74, FOCUS_Y + 76, {weight: 500, size: 12, color: '#F0B4B2'});
    riskMeter(ctx, 40, FOCUS_Y + 98, W - 80, 0.98, '', '', C.red);
    ctx.restore();
  }
  if (t >= callAt) {
    ctx.save();
    ctx.globalAlpha = clamp01(callIn * 2);
    ctx.translate(W / 2, FOCUS_Y + 170);
    ctx.scale(0.85 + 0.15 * callIn, 0.85 + 0.15 * callIn);
    ctx.translate(-W / 2, -(FOCUS_Y + 170));
    softShadow(ctx, 20, FOCUS_Y + 6, W - 40, 330, 0.7, 8);
    rr(ctx, 12, FOCUS_Y, W - 24, 346, 18);
    const g = ctx.createLinearGradient(0, FOCUS_Y, 0, FOCUS_Y + 346);
    g.addColorStop(0, '#4A1B20');
    g.addColorStop(1, '#22121A');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(217,83,79,0.9)';
    ctx.stroke();
    const pulse = 0.5 + 0.5 * Math.sin((t - callAt) / 5);
    ctx.beginPath();
    ctx.arc(W / 2, FOCUS_Y + 64, 30 + 4 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(217,83,79,${0.22 + 0.1 * pulse})`;
    ctx.fill();
    icon(ctx, 'warn', W / 2, FOCUS_Y + 64, 30, '#FFD2D0', 2.6);
    text(ctx, 'MARGIN CALL', W / 2, FOCUS_Y + 134, {weight: 700, size: 30, color: '#FFFFFF', align: 'center'});
    text(ctx, 'Positions closed · no stop loss was set', W / 2, FOCUS_Y + 160, {weight: 500, size: 12.5, color: '#F2C4C2', align: 'center'});
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(40, FOCUS_Y + 184, W - 80, 1);
    text(ctx, 'Balance', 40, FOCUS_Y + 214, {weight: 500, size: 12.5, color: '#F2C4C2'});
    text(ctx, `$${money(leftBalance(t))}`, W - 40, FOCUS_Y + 216, {weight: 700, size: 22, color: '#FFFFFF', align: 'right'});
    text(ctx, 'Today', 40, FOCUS_Y + 252, {weight: 500, size: 12.5, color: '#F2C4C2'});
    const today = leftBalance(t) - 10000;
    text(ctx, `${signedMoney(today, 0)} (${signedPct((today / 10000) * 100)})`, W - 40, FOCUS_Y + 254, {weight: 700, size: 18, color: C.red, align: 'right'});
    illus(ctx, W - 40, FOCUS_Y + 284);
    ctx.restore();
  }
};

const drawBlind = (ctx: CanvasRenderingContext2D, t: number) => {
  ctx.drawImage(baseLayer('blind'), 0, 0, W, H);
  accountBlock(ctx, t, 'left', false);
  const T4 = LEFT_TRADES[3];
  chart(ctx, t, t >= T4.openedAt && t < T4.closedAt ? [{price: T4.entry, label: `BUY 8.00 · SL —`, color: '#AEB6C8'}] : [], false, '#AEB6C8');
  // Focus card: trades (strategy) → position (risk) → calendar (market updates) → crash.
  const toPos = ramp(t, 304, 322, easeInOut);
  const toCal = ramp(t, 418, 436, easeInOut);
  const callAt = LEFT_NOTIFS[LEFT_NOTIFS.length - 1].at;
  const hideCal = ramp(t, callAt, callAt + 8);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FOCUS_Y - 10, W, 838 - FOCUS_Y + 10);
  ctx.clip();
  if (toPos < 1) {
    ctx.save();
    ctx.translate(-W * 0.3 * toPos, 0);
    leftTrades(ctx, t, 1 - toPos);
    ctx.restore();
  }
  if (toPos > 0 && toCal < 1) {
    ctx.save();
    ctx.translate(W * 0.3 * (1 - toPos) - W * 0.3 * toCal, 0);
    leftPosition(ctx, t, toPos * (1 - toCal));
    ctx.restore();
  }
  if (toCal > 0 && hideCal < 1) {
    ctx.save();
    ctx.translate(W * 0.3 * (1 - toCal), 0);
    leftCalendar(ctx, t, toCal * (1 - hideCal) * (1 - 0.65 * ramp(t, NEWS.at + 2, NEWS.at + 12)));
    ctx.restore();
  }
  ctx.restore();
  if (t >= NEWS.at) leftCrash(ctx, t);
  // Red alarm glow at the screen edges, pulsing with each loss.
  const flash = leftLossFlash(t) + (t > callAt ? 0.35 + 0.15 * Math.sin((t - callAt) / 6) : 0);
  if (flash > 0.01) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.62);
    g.addColorStop(0, 'rgba(217,83,79,0)');
    g.addColorStop(1, `rgba(217,83,79,${Math.min(0.55, 0.4 * flash)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = C.appBg;
  ctx.fillRect(0, 0, W, 44);
  statusBar(ctx, t);
  notifStack(ctx, LEFT_NOTIFS as unknown as Notif[], t, 150, 1.4);
};

// ─── RIGHT: trading with Miran Gold ──────────────────────────────────────────

type SignalSpec = {side: string; entry: number; sl: number; tp1: number; tp2: number; lots: number; riskPct: number};

/** The Miran signal card. `lines` (0–8, fractional) is how far it has built. */
const signalCard = (
  ctx: CanvasRenderingContext2D,
  y: number,
  t: number,
  s: SignalSpec,
  lines: number,
  st: {filled: boolean; slLabel?: string; slBE?: boolean; tp1Done?: string; tp2Done?: string; title?: string; riskGlow?: number; closedBE?: boolean},
) => {
  const x = 12;
  const w = W - 24;
  const h = 270;
  card(ctx, x, y, w, h, {gold: true});
  const L = (i: number) => easeOut(clamp01(lines - i));
  const row = (i: number, draw: () => void) => {
    const p = L(i);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.translate(SC().rtl ? -(1 - p) * 18 : (1 - p) * 18, 0);
    draw();
    ctx.restore();
  };
  const rtl = SC().rtl;
  // 0. Header: emblem + title.
  row(0, () => {
    const ex = rtl ? x + w - 30 : x + 30;
    emblem(ctx, ex, y + 26, 15);
    ltext(ctx, st.title ?? SC().signalTitle, x + 52, x + w - 52, y + 32, {weight: 700, size: 15, color: goldGradient(ctx, x, 0, x + w, 0)});
    illus(ctx, rtl ? x + 16 + measure(ctx, SC().illustrative, 600, 9, true) + 12 : x + w - 16, y + 18);
  });
  // 1. Pair + side.
  row(1, () => {
    const pw = measure(ctx, MARKET.pair, 700, 22);
    text(ctx, MARKET.pair, x + 18, y + 72, {weight: 700, size: 22, color: C.text});
    pill(ctx, s.side, x + 26 + pw, y + 53, {bg: 'rgba(76,195,138,0.18)', color: C.up, size: 13, h: 26, padX: 10});
    text(ctx, `${s.lots.toFixed(2)} lots`, x + w - 18, y + 72, {weight: 600, size: 12, color: C.meta, align: 'right'});
  });
  const field = (i: number, label: string, value: string, color: string, chip?: {text: string; color: string; bg: string; icon?: IconKind}) =>
    row(i, () => {
      const ry = y + 86 + (i - 2) * 30;
      ctx.fillStyle = C.line;
      ctx.fillRect(x + 18, ry, w - 36, 0.8);
      text(ctx, label, x + 18, ry + 20, {weight: 500, size: 12.5, color: C.meta});
      text(ctx, value, x + w - 18, ry + 21, {weight: 700, size: 15, color, align: 'right'});
      if (chip) {
        const vw = measure(ctx, value, 700, 15);
        const cw = measure(ctx, chip.text, 700, 10.5) + (chip.icon ? 26 : 14);
        const cx = x + w - 18 - vw - 8 - cw;
        rr(ctx, cx, ry + 6, cw, 19, 9.5);
        ctx.fillStyle = chip.bg;
        ctx.fill();
        if (chip.icon) icon(ctx, chip.icon, cx + 11, ry + 15.5, 10, chip.color, 1.6);
        text(ctx, chip.text, cx + (chip.icon ? 20 : 7), ry + 19.5, {weight: 700, size: 10.5, color: chip.color});
      }
    });
  field(2, 'Entry', priceStr(s.entry), C.text, st.filled ? {text: 'filled', color: C.up, bg: 'rgba(76,195,138,0.14)', icon: 'check'} : undefined);
  field(
    3,
    'Stop loss',
    st.slLabel ?? priceStr(s.sl),
    st.slBE ? C.goldB : C.red,
    st.closedBE ? {text: 'closed at BE · $0', color: C.goldB, bg: 'rgba(212,162,76,0.16)', icon: 'shield'} : st.slBE ? {text: 'break-even', color: C.goldB, bg: 'rgba(212,162,76,0.16)', icon: 'lock'} : {text: 'set', color: C.text, bg: C.cardHi, icon: 'lock'},
  );
  field(4, 'TP1', priceStr(s.tp1), C.up, st.tp1Done ? {text: st.tp1Done, color: '#0B0F19', bg: C.up, icon: 'check'} : undefined);
  field(5, 'TP2', priceStr(s.tp2), C.up, st.tp2Done ? {text: st.tp2Done, color: '#0B0F19', bg: C.up, icon: 'check'} : undefined);
  // 6. Reason.
  row(6, () => {
    const ry = y + 86 + 4 * 30;
    ctx.fillStyle = C.line;
    ctx.fillRect(x + 18, ry, w - 36, 0.8);
    const ix = rtl ? x + w - 28 : x + 28;
    icon(ctx, 'target', ix, ry + 17, 14, C.goldB, 1.6);
    ltext(ctx, SC().reason, x + 44, x + w - 44, ry + 22, {weight: 600, size: 13, color: C.text});
  });
  // 7. Risk 1%.
  row(7, () => {
    const ry = y + 86 + 4 * 30 + 36;
    const glow = st.riskGlow ?? 0;
    if (glow > 0.01) {
      rr(ctx, x + 14 - 4 * glow, ry - 4 * glow, 110 + 8 * glow, 30 + 8 * glow, 15 + 4 * glow);
      ctx.fillStyle = `rgba(243,210,122,${0.25 * glow})`;
      ctx.fill();
    }
    const label = `Risk ${s.riskPct}%`;
    pill(ctx, label, x + 18, ry, {bg: goldGradient(ctx, x + 18, 0, x + 120, 0), color: '#0B0F19', size: 14, h: 30, padX: 14});
    const risk = Math.round((s.entry - s.sl) * s.lots * 100);
    text(ctx, `Max loss $${money(risk, 0)} · stop loss always set`, x + w - 18, ry + 20, {weight: 500, size: 11, color: C.meta, align: 'right'});
  });
  return h;
};

const marketUpdateCard = (ctx: CanvasRenderingContext2D, y: number, alpha: number, title = SC().updateTitle, body = SC().updateBody, action = SC().updateAction, h = 128) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const x = 12;
  const w = W - 24;
  softShadow(ctx, x + 4, y + 4, w - 8, h - 6, 0.7, 8);
  rr(ctx, x, y, w, h, 18);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2A2214');
  g.addColorStop(1, '#171A22');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(243,210,122,0.75)';
  ctx.stroke();
  const rtl = SC().rtl;
  emblem(ctx, rtl ? x + w - 30 : x + 30, y + 28, 16);
  ltext(ctx, title, x + 54, x + w - 54, y + 34, {weight: 700, size: 16, color: goldGradient(ctx, x, 0, x + w, 0)});
  const bx = rtl ? x + 18 : x + w - 18;
  icon(ctx, 'bolt', rtl ? bx + 8 : bx - 8, y + 28, 14, C.warn);
  ltext(ctx, body, x + 18, x + w - 18, y + 68, {weight: 700, size: 15, color: C.text});
  ltext(ctx, action, x + 18, x + w - 18, y + 96, {weight: 500, size: 13, color: C.goldB});
  if (h > 110) text(ctx, `Miran Gold · ${NEWS.label}`, rtl ? x + 18 : x + w - 18, y + h - 12, {weight: 500, size: 9.5, color: C.dim, align: rtl ? 'left' : 'right'});
  ctx.restore();
};

const historyCard = (ctx: CanvasRenderingContext2D, y: number, h: number, t: number, alpha: number, max = 4) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, 12, y, W - 24, h);
  text(ctx, 'Trade history', 28, y + 28, {weight: 700, size: 15, color: C.text});
  illus(ctx, W - 28, y + 14);
  const rows = RIGHT.history.filter((r) => r.at <= t).reverse().slice(0, max);
  rows.forEach((r, i) => {
    const p = easeOut(clamp01((t - r.at) / 12));
    const ry = y + 44 + i * 34 - (1 - p) * 20;
    ctx.save();
    ctx.globalAlpha *= i === 0 ? p : 1;
    ctx.fillStyle = C.line;
    ctx.fillRect(28, ry, W - 56, 0.8);
    const col = r.pnl > 0 ? C.up : r.pnl < 0 ? C.red : C.goldB;
    ctx.beginPath();
    ctx.arc(36, ry + 17, 4, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    text(ctx, r.label.replace(' ✓', ''), 48, ry + 22, {weight: 600, size: 12.5, color: C.text});
    const v = r.pnl === 0 ? '$0 · BE' : `${signedMoney(r.pnl, 0)} (${signedPct(r.pct)})`;
    text(ctx, v, W - 28, ry + 22, {weight: 700, size: 12.5, color: col, align: 'right'});
    ctx.restore();
  });
  ctx.restore();
};

const checklistModal = (ctx: CanvasRenderingContext2D, t: number) => {
  const a = ramp(t, TIMING.checklistAt - 10, TIMING.checklistAt + 10, easeOut) * (1 - ramp(t, 714, 734, easeIn));
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(6,8,14,0.78)';
  ctx.fillRect(0, 0, W, H);
  const pop = springAt(t - TIMING.checklistAt, {freq: 1.9, damping: 0.55});
  const cy = 480;
  ctx.translate(W / 2, cy);
  ctx.scale(0.86 + 0.14 * pop, 0.86 + 0.14 * pop);
  ctx.translate(-W / 2, -cy);
  const x = 22;
  const w = W - 44;
  const y = 262;
  const h = 420;
  softShadow(ctx, x + 6, y + 8, w - 12, h - 10, 0.9, 10);
  rr(ctx, x, y, w, h, 26);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#1F1A12');
  g.addColorStop(0.5, '#141A28');
  g.addColorStop(1, '#10141F');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = goldGradient(ctx, x, 0, x + w, 0);
  ctx.stroke();
  // Emblem with a soft gold halo.
  const halo = ctx.createRadialGradient(W / 2, y + 62, 10, W / 2, y + 62, 70);
  halo.addColorStop(0, 'rgba(243,210,122,0.35)');
  halo.addColorStop(1, 'rgba(243,210,122,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, 140);
  emblem(ctx, W / 2, y + 62, 38);
  text(ctx, SC().checklistTitle, W / 2, y + 132, {weight: 700, size: 22, color: goldGradient(ctx, x, 0, x + w, 0), align: 'center', rtl: SC().rtl});
  const rtl = SC().rtl;
  SC().checklist.forEach((item, i) => {
    const ty = TIMING.ticks[i];
    const p = springAt(t - ty, {freq: 2.4, damping: 0.45});
    const ry = y + 156 + i * 66;
    rr(ctx, x + 18, ry, w - 36, 54, 14);
    ctx.fillStyle = p > 0.01 ? `rgba(212,162,76,${0.08 + 0.08 * clamp01(p)})` : 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = p > 0.01 ? 'rgba(212,162,76,0.5)' : C.line;
    ctx.stroke();
    const ccx = rtl ? x + w - 46 : x + 46;
    ctx.beginPath();
    ctx.arc(ccx, ry + 27, 15, 0, Math.PI * 2);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(212,162,76,0.6)';
    ctx.stroke();
    if (p > 0.001) {
      ctx.save();
      ctx.translate(ccx, ry + 27);
      ctx.scale(Math.max(0, p), Math.max(0, p));
      icon(ctx, 'checkCircle', 0, 0, 30, goldGradient(ctx, -15, 0, 15, 0), 2.6);
      ctx.restore();
      // A ring that pulses out once.
      const ring = clamp01((t - ty) / 24);
      if (ring > 0 && ring < 1) {
        ctx.beginPath();
        ctx.arc(ccx, ry + 27, 15 + 18 * ring, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(243,210,122,${0.7 * (1 - ring)})`;
        ctx.stroke();
      }
    }
    ltext(ctx, item, x + 74, x + w - 74, ry + 35, {weight: 700, size: 21, color: p > 0.01 ? C.text : C.meta});
  });
  // "Signal source: Miran Gold" tag with a glint.
  const tp = springAt(t - TIMING.tagAt, {freq: 2.2, damping: 0.5});
  if (tp > 0.001) {
    const label = SC().source;
    const tw = measure(ctx, label, 700, 13, rtl) + 44;
    const tx = W / 2 - tw / 2;
    const tyy = y + h - 50;
    ctx.save();
    ctx.globalAlpha *= clamp01(tp * 2);
    ctx.translate(W / 2, tyy + 15);
    ctx.scale(0.8 + 0.2 * tp, 0.8 + 0.2 * tp);
    ctx.translate(-W / 2, -(tyy + 15));
    rr(ctx, tx, tyy, tw, 30, 15);
    ctx.fillStyle = '#2A2214';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(243,210,122,0.8)';
    ctx.stroke();
    emblem(ctx, rtl ? tx + tw - 17 : tx + 17, tyy + 15, 10);
    text(ctx, label, W / 2 + (rtl ? -8 : 8), tyy + 20, {weight: 700, size: 13, color: C.goldB, align: 'center', rtl});
    // Glint: a bright diagonal band sweeping across the tag.
    const gl = clamp01((t - TIMING.tagAt - 8) / 22);
    if (gl > 0 && gl < 1) {
      ctx.save();
      rr(ctx, tx, tyy, tw, 30, 15);
      ctx.clip();
      const gx = tx - 30 + (tw + 60) * gl;
      const gg = ctx.createLinearGradient(gx - 24, 0, gx + 24, 0);
      gg.addColorStop(0, 'rgba(255,248,225,0)');
      gg.addColorStop(0.5, 'rgba(255,248,225,0.75)');
      gg.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(tx, tyy, tw, 30);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
};

/** The calm risk meter under the Miran signal. */
const calmMeter = (ctx: CanvasRenderingContext2D, y: number, alpha: number) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  card(ctx, 12, y, W - 24, 66);
  riskMeter(ctx, 28, y + 24, W - 56, 0.12, 'Account risk', 'LOW · 1% per trade', C.up);
  ctx.restore();
};

const signalState = (t: number) => ({
  filled: t >= SIGNAL.filledAt,
  slBE: t >= SIGNAL.beAt,
  slLabel: t >= SIGNAL.beAt ? priceStr(SIGNAL.entry) : priceStr(SIGNAL.sl),
  tp1Done: t >= SIGNAL.tp1At ? `${signedMoney(SIGNAL.tp1Profit)}` : undefined,
  closedBE: t >= SIGNAL.beClosedAt,
  riskGlow: Math.exp(-Math.abs(t - 352) / 18) * (t > 320 ? 1 : 0),
});

const freshState = (t: number) => ({
  title: SC().freshTitle,
  filled: t >= FRESH_SIGNAL.at + 10,
  slBE: t >= FRESH_SIGNAL.tp1At + 8,
  slLabel: t >= FRESH_SIGNAL.tp1At + 8 ? priceStr(FRESH_SIGNAL.entry) : priceStr(FRESH_SIGNAL.sl),
  tp1Done: t >= FRESH_SIGNAL.tp1At ? signedMoney(FRESH_SIGNAL.tp1Profit) : undefined,
  tp2Done: t >= FRESH_SIGNAL.tp2At ? signedMoney(FRESH_SIGNAL.tp2Profit) : undefined,
});

const miranLevels = (t: number): Level[] => {
  if (t >= SIGNAL.filledAt - 40 && t < SIGNAL.beClosedAt) {
    const be = t >= SIGNAL.beAt;
    return [
      {price: SIGNAL.tp1, label: t >= SIGNAL.tp1At ? 'TP1 ✓' : 'TP1', color: C.up},
      {price: be ? SIGNAL.entry : SIGNAL.sl, label: be ? 'SL · BE' : 'SL', color: be ? C.goldB : C.red},
      ...(be ? [] : [{price: SIGNAL.entry, label: 'Entry', color: C.goldA, dash: [2, 3]}]),
    ];
  }
  if (t >= FRESH_SIGNAL.at && t < FRESH_SIGNAL.tp2At + 20) {
    const be = t >= FRESH_SIGNAL.tp1At + 8;
    return [
      {price: FRESH_SIGNAL.tp1, label: t >= FRESH_SIGNAL.tp1At ? 'TP1 ✓' : 'TP1', color: C.up},
      {price: FRESH_SIGNAL.tp2, label: t >= FRESH_SIGNAL.tp2At ? 'TP2 ✓' : 'TP2', color: C.up},
      {price: be ? FRESH_SIGNAL.entry : FRESH_SIGNAL.sl, label: be ? 'SL · BE' : 'SL', color: be ? C.goldB : C.red},
    ];
  }
  return [];
};

const drawMiranRight = (ctx: CanvasRenderingContext2D, t: number) => {
  ctx.drawImage(baseLayer('miran'), 0, 0, W, H);
  accountBlock(ctx, t, 'right', true);
  chart(ctx, t, miranLevels(t), t >= TIMING.updateAt, C.goldB);
  // The upcoming news, flagged on the chart by the Miran update.
  if (t >= TIMING.updateAt && t < NEWS.at + 30) {
    const a = ramp(t, TIMING.updateAt, TIMING.updateAt + 12) * (1 - ramp(t, NEWS.at + 10, NEWS.at + 30));
    ctx.save();
    ctx.globalAlpha = a;
    const label = t < NEWS.at ? `${NEWS.label} · 14:30` : NEWS.label;
    const w = measure(ctx, label, 700, 10) + 30;
    rr(ctx, PLOT.x1 - w, PLOT.y0 - 2, w, 20, 10);
    ctx.fillStyle = 'rgba(232,163,61,0.2)';
    ctx.fill();
    icon(ctx, 'bolt', PLOT.x1 - w + 12, PLOT.y0 + 8, 11, C.warn);
    text(ctx, label, PLOT.x1 - w + 22, PLOT.y0 + 11.5, {weight: 700, size: 10, color: C.warn});
    ctx.restore();
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FOCUS_Y - 10, W, 838 - FOCUS_Y + 10);
  ctx.clip();
  const toSignal = ramp(t, TIMING.signalBuildAt - 12, TIMING.signalBuildAt + 4, easeInOut);
  const toFresh = ramp(t, FRESH_SIGNAL.at, FRESH_SIGNAL.at + 16, easeInOut);
  // History (before the signal), then the signal card + calm meter, then the fresh signal.
  if (toSignal < 1) historyCard(ctx, FOCUS_Y, 190, t, 1 - toSignal);
  if (toSignal > 0 && toFresh < 1) {
    const lines = (t - TIMING.signalBuildAt) / TIMING.signalLineGap + 1;
    const down = 140 * ramp(t, TIMING.updateAt, TIMING.updateAt + 18, easeOut);
    ctx.save();
    ctx.globalAlpha = toSignal * (1 - toFresh);
    ctx.translate(-W * 0.3 * toFresh, down);
    signalCard(ctx, FOCUS_Y, t, SIGNAL, lines, signalState(t));
    calmMeter(ctx, FOCUS_Y + 278, ramp(t, TIMING.signalBuildAt + 8 * TIMING.signalLineGap, TIMING.signalBuildAt + 8 * TIMING.signalLineGap + 14));
    ctx.restore();
  }
  if (toFresh > 0 && t < 736) {
    const lines = (t - FRESH_SIGNAL.at) / 3 + 1;
    const down = 140 * (1 - ramp(t, FRESH_SIGNAL.at, FRESH_SIGNAL.at + 18, easeInOut));
    ctx.save();
    ctx.globalAlpha = toFresh;
    ctx.translate(W * 0.3 * (1 - toFresh), down);
    signalCard(ctx, FOCUS_Y, t, FRESH_SIGNAL, lines, freshState(t));
    calmMeter(ctx, FOCUS_Y + 278, 1);
    ctx.restore();
  }
  // After the twist: the fresh signal running, and the history (with its one small loss).
  if (t >= 716) {
    const a = ramp(t, 716, 740, easeOut);
    ctx.save();
    ctx.globalAlpha = a;
    signalCard(ctx, FOCUS_Y, t, FRESH_SIGNAL, 9, freshState(t));
    ctx.restore();
    historyCard(ctx, FOCUS_Y + 278, 210, t, a, 5);
  }
  ctx.restore();
  // The market update lands on top (before the news), then the "protected" chip.
  const upIn = springAt(t - TIMING.updateAt, {freq: 2.0, damping: 0.6});
  const upOut = ramp(t, SIGNAL.beClosedAt - 4, SIGNAL.beClosedAt + 8, easeIn);
  if (t >= TIMING.updateAt && upOut < 1) {
    ctx.save();
    ctx.translate(0, -(1 - upIn) * 120);
    marketUpdateCard(ctx, FOCUS_Y - 2, clamp01(upIn * 2) * (1 - upOut));
    ctx.restore();
  }
  if (t >= SIGNAL.beClosedAt && t < FRESH_SIGNAL.at + 10) {
    const p = springAt(t - SIGNAL.beClosedAt, {freq: 2.2, damping: 0.55});
    const a = clamp01(p * 2) * (1 - ramp(t, FRESH_SIGNAL.at - 6, FRESH_SIGNAL.at + 10));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, FOCUS_Y + 60);
    ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
    ctx.translate(-W / 2, -(FOCUS_Y + 60));
    rr(ctx, 12, FOCUS_Y - 2, W - 24, 128, 18);
    const g = ctx.createLinearGradient(0, FOCUS_Y, 0, FOCUS_Y + 128);
    g.addColorStop(0, '#2C2414');
    g.addColorStop(1, '#171A22');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(243,210,122,0.85)';
    ctx.stroke();
    const rtl = SC().rtl;
    const sx = rtl ? W - 50 : 50;
    ctx.beginPath();
    ctx.arc(sx, FOCUS_Y + 46, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(243,210,122,0.16)';
    ctx.fill();
    icon(ctx, 'shield', sx, FOCUS_Y + 46, 28, C.goldB, 2.2);
    ltext(ctx, SC().protectedTitle, 84, W - 84, FOCUS_Y + 42, {weight: 700, size: 18, color: goldGradient(ctx, 0, 0, W, 0)});
    ltext(ctx, SC().protectedBody, 84, W - 84, FOCUS_Y + 66, {weight: 500, size: 13, color: C.text});
    text(ctx, `TP1 ✓ ${signedMoney(SIGNAL.tp1Profit)}`, rtl ? W - 28 : 28, FOCUS_Y + 106, {weight: 700, size: 15, color: C.up, align: rtl ? 'right' : 'left'});
    text(ctx, 'Rest closed at BE · $0', rtl ? 28 : W - 28, FOCUS_Y + 106, {weight: 600, size: 12, color: C.goldB, align: rtl ? 'left' : 'right'});
    ctx.restore();
  }
  ctx.fillStyle = C.appBg;
  ctx.fillRect(0, 0, W, 44);
  statusBar(ctx, t);
  notifStack(ctx, RIGHT_NOTIFS as unknown as Notif[], t, 84, 0.8);
  checklistModal(ctx, t);
};

// ─── LEFT after the flip: on Miran Gold ──────────────────────────────────────

const drawMiranLeft = (ctx: CanvasRenderingContext2D, t: number) => {
  ctx.drawImage(baseLayer('miran'), 0, 0, W, H);
  accountBlock(ctx, t, 'left', true);
  const a = LEFT.afterFlip;
  const lv: Level[] =
    t >= 850
      ? [
          {price: a.tp1, label: 'TP1', color: C.up},
          {price: a.sl, label: 'SL', color: C.red},
          {price: a.entry, label: 'Entry', color: C.goldA, dash: [2, 3]},
        ]
      : [];
  chart(ctx, t, lv, true, C.goldB);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FOCUS_Y - 10, W, 838 - FOCUS_Y + 10);
  ctx.clip();
  // "Connected to Miran Gold", then the first signal card and today's market update.
  const toSig = ramp(t, 846, 862, easeInOut);
  if (toSig < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - toSig;
    card(ctx, 12, FOCUS_Y, W - 24, 160, {gold: true});
    emblem(ctx, W / 2, FOCUS_Y + 52, 30);
    text(ctx, SC().connected, W / 2, FOCUS_Y + 112, {weight: 700, size: 17, color: goldGradient(ctx, 0, 0, W, 0), align: 'center', rtl: SC().rtl});
    icon(ctx, 'checkCircle', W / 2, FOCUS_Y + 138, 18, C.up, 2);
    ctx.restore();
  }
  if (toSig > 0) {
    const lines = (t - 850) / 3 + 1;
    ctx.save();
    ctx.globalAlpha = toSig;
    signalCard(
      ctx,
      FOCUS_Y,
      t,
      {side: 'BUY', entry: a.entry, sl: a.sl, tp1: a.tp1, tp2: a.tp2, lots: a.lots, riskPct: 1},
      lines,
      {filled: t >= a.openedAt},
    );
    ctx.restore();
  }
  ctx.restore();
  const upIn = springAt(t - 900, {freq: 2.0, damping: 0.6});
  if (t >= 900) marketUpdateCard(ctx, FOCUS_Y + 280 + (1 - upIn) * 60, clamp01(upIn * 2), SC().todayTitle, SC().todayBody, SC().updateAction, 104);
  ctx.fillStyle = C.appBg;
  ctx.fillRect(0, 0, W, 44);
  statusBar(ctx, t);
  notifStack(ctx, LEFT_AFTER_NOTIFS as unknown as Notif[], t, 84, 0.8);
};

// ─── Entry points ────────────────────────────────────────────────────────────

export const drawLeftScreen = (ctx: CanvasRenderingContext2D, t: number) => (leftIsMiran(t) ? drawMiranLeft(ctx, t) : drawBlind(ctx, t));
export const drawRightScreen = (ctx: CanvasRenderingContext2D, t: number) => drawMiranRight(ctx, t);

/** Content keys: a screen is only redrawn when its key changes (it holds still once the end card covers it). */
const FREEZE = TIMING.endCardStart + 60;
export const leftScreenKey = (t: number) => `${LANG}|${Math.min(t, FREEZE)}`;
export const rightScreenKey = (t: number) => `${LANG}|${Math.min(t, FREEZE)}`;
