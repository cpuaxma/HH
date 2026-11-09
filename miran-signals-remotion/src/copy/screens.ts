// The one phone screen of the copy trading reel, drawn per frame into the same 1206 × 2622
// canvas as the signals reel (402 × 874 pt at 3×), with the same gold Miran Gold theme,
// iOS chrome (status bar, Dynamic Island Live Activities, home indicator), cards, switch
// and chart (all from src/screens/draw.ts). The screen is a short series of app pages,
// pushed in right-to-left like an Arabic iOS app:
//   hook → connect → settings → auto copy → the account (signal, news alert, in control).
// Taps and drags show as a soft fingertip on the glass.
import {clamp01, easeIn, easeInOut, easeOut, ramp, springAt} from '../lib/ease';
import {
  Activity,
  CARD,
  ChartSource,
  GOLD,
  GREEN,
  Level,
  PAD,
  RED,
  background,
  balanceBlock,
  cardBox,
  chart,
  chrome,
  header,
  hexA,
  homeIndicator,
  mixHex,
  num,
  say,
  sx,
  toggle,
  tr,
  valueColor,
  withT,
} from '../screens/draw';
import {C, H, W, emblem, goldGradient, icon, measure, rr, setShadowRelative, signedMoney, softShadow} from '../screens/kit';
import {MARKET, MAX_LOSS, PLACEHOLDERS, RESULT, SCREEN as S, T} from './data';
import {accountValue, autoOn, chartRange, dailyOn, fmtPct, fmtRatio, openPnl, pagesAt, price, ratioValue, riskValue, tradeOpen} from './story';
import {PageId} from './story';

const P = PLACEHOLDERS;
const AMBER = '#E8A33D';
const RTL = true;

// ─── Small parts ─────────────────────────────────────────────────────────────

/** A page title and its subtitle, at the reading start. */
const title = (ctx: CanvasRenderingContext2D, s: string, sub?: string) => {
  say(ctx, s, sx(), 166, {weight: 700, size: 32, color: C.text});
  if (sub) say(ctx, sub, sx(), 200, {weight: 500, size: 18, color: C.meta});
};

/** A lightly sprung appearance (0 before `at`, overshoots a touch, settles at 1). */
const pop = (t: number, at: number, freq = 2.0, damping = 0.7) => Math.max(0, springAt(t - at, {freq, damping}));

/** Draws `draw` faded in and risen into place from frame `at`. */
const land = (ctx: CanvasRenderingContext2D, t: number, at: number, draw: () => void, rise = 18) => {
  const p = pop(t, at, 1.9, 0.8);
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp01(p * 1.6);
  ctx.translate(0, (1 - Math.min(1, p)) * rise);
  draw();
  ctx.restore();
};

const spinner = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, color: string, lw = 3) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  const a = t * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a, a + Math.PI * 1.35);
  ctx.stroke();
  ctx.restore();
};

/** A fingertip on the glass: approaches, presses at `at`, lifts, with a ripple. */
const fingertip = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, press: number) => {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const r = 25 * (1 - 0.14 * press);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.18 * press})`;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke();
  ctx.restore();
};

const ripple = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, at: number) => {
  const d = t - at;
  if (d < 0 || d > 22) return;
  const k = d / 22;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 24 + 34 * easeOut(k), 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - k)})`;
  ctx.stroke();
  ctx.restore();
};

/** A tap: the fingertip comes in over 14 frames, presses at `at`, lifts by `at + 20`. */
const tap = (ctx: CanvasRenderingContext2D, t: number, at: number, x: number, y: number) => {
  const a = ramp(t, at - 16, at - 4, easeOut) * (1 - ramp(t, at + 8, at + 22, easeIn));
  const press = Math.sin(Math.PI * clamp01((t - at + 2) / 10));
  const approach = 1 - ramp(t, at - 16, at, easeOut);
  fingertip(ctx, x + 10 * approach, y + 16 * approach, a, press);
  ripple(ctx, x, y, t, at + 2);
};

/** How much a button is pressed at frame t (0 → 1 → 0 over 10 frames). */
const pressOf = (t: number, at: number) => Math.sin(Math.PI * clamp01((t - at) / 10));

/** A big rounded button (gold by default), scaled down while pressed. */
const button = (ctx: CanvasRenderingContext2D, y: number, h: number, press: number, fill: string | CanvasGradient, draw: () => void, stroke?: string) => {
  const w = CARD.w - 24;
  ctx.save();
  ctx.translate(W / 2, y + h / 2);
  ctx.scale(1 - 0.05 * press, 1 - 0.05 * press);
  rr(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  if (press > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 * press})`;
    ctx.fill();
  }
  draw();
  ctx.restore();
};

/** A label then a number, laid out right to left as one row ending at x (right edge). */
const labelNum = (ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number, o: {size?: number; numSize?: number; color?: string; numColor?: string; weight?: number; align?: 'right' | 'center' | 'left'} = {}) => {
  const size = o.size ?? 17;
  const numSize = o.numSize ?? size + 1;
  const lw = measure(ctx, label, o.weight ?? 600, size, true);
  const nw = measure(ctx, value, 700, numSize);
  const total = lw + 8 + nw;
  const right = o.align === 'center' ? x + total / 2 : o.align === 'left' ? x + total : x;
  say(ctx, label, right, y, {weight: o.weight ?? 600, size, color: o.color ?? C.meta, align: 'right', maxW: 400});
  num(ctx, value, right - lw - 8, y, {size: numSize, color: o.numColor ?? C.text, align: 'right'});
};

/** A small rounded pill with a check and a label, centred at cx or anchored at its right edge. */
const checkPill = (ctx: CanvasRenderingContext2D, label: string, x: number, y: number, color: string, anchor: 'center' | 'right' | 'left' = 'center', size = 15) => {
  const w = measure(ctx, label, 700, size, true) + 42;
  const h = size + 16;
  const left = anchor === 'center' ? x - w / 2 : anchor === 'right' ? x - w : x;
  rr(ctx, left, y, w, h, h / 2);
  ctx.fillStyle = hexA(color, 0.18);
  ctx.fill();
  icon(ctx, 'check', left + w - 17, y + h / 2, 12, color, 2.4);
  say(ctx, label, left + w - 30, y + h / 2 + size * 0.36, {weight: 700, size, color, align: 'right', maxW: w});
  return w;
};

/** A row of plain pills centred on W/2 (right to left). */
const chipRow = (ctx: CanvasRenderingContext2D, labels: string[], y: number, size = 16) => {
  const ws = labels.map((l) => measure(ctx, l, 700, size, true) + 26);
  const gap = 10;
  const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let right = W / 2 + total / 2;
  labels.forEach((l, i) => {
    const w = ws[i];
    rr(ctx, right - w, y, w, size + 18, (size + 18) / 2);
    ctx.fillStyle = 'rgba(212,162,76,0.16)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(212,162,76,0.5)';
    ctx.stroke();
    say(ctx, l, right - w / 2, y + (size + 18) / 2 + size * 0.36, {weight: 700, size, color: '#F0D9A6', align: 'center', maxW: w});
    right -= w + gap;
  });
};

/** The amber "copying does not remove risk" note. */
const riskNote = (ctx: CanvasRenderingContext2D, y: number) => {
  const size = 16;
  const tw = measure(ctx, S.riskNote, 600, size, true);
  const total = tw + 28;
  const right = W / 2 + total / 2;
  icon(ctx, 'warn', right - 9, y - 6, 17, AMBER, 2);
  say(ctx, S.riskNote, right - 28, y, {weight: 600, size, color: '#EBC98A', align: 'right', maxW: W - 2 * PAD - 30});
};

/** The automatic copy switch row (label at the reading start, switch at the end). */
const switchRow = (ctx: CanvasRenderingContext2D, y: number, on: number, press: number, big = false) => {
  const h = big ? 92 : 80;
  rr(ctx, CARD.x + 22, y - h / 2, CARD.w - 44, h, 24);
  ctx.fillStyle = `rgba(63,208,138,${0.05 + 0.1 * on})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(63,208,138,${0.15 + 0.45 * on})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  say(ctx, S.autoCopy, CARD.x + CARD.w - 46, y + (big ? 10 : 9), {weight: 700, size: big ? 29 : 26, color: C.text, align: 'right', maxW: 220});
  const tx = CARD.x + (big ? 100 : 92);
  ctx.save();
  ctx.translate(tx, y);
  if (big) ctx.scale(1.18, 1.18);
  toggle(ctx, 0, 0, on, press);
  ctx.restore();
  return {x: tx, y};
};

/** The slider used in the settings: min at the reading start (right), the gold fill grows leftwards. */
const SLIDER = {left: CARD.x + 40, right: CARD.x + CARD.w - 40};
const sliderX = (v: number, min: number, max: number) => SLIDER.right - ((v - min) / (max - min)) * (SLIDER.right - SLIDER.left);
const slider = (ctx: CanvasRenderingContext2D, y: number, v: number, min: number, max: number, grabbed: number) => {
  const kx = sliderX(v, min, max);
  rr(ctx, SLIDER.left, y - 4, SLIDER.right - SLIDER.left, 8, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();
  rr(ctx, kx, y - 4, SLIDER.right - kx, 8, 4);
  ctx.fillStyle = goldGradient(ctx, SLIDER.left, 0, SLIDER.right, 0);
  ctx.fill();
  // Tick marks at the ends.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (const x of [SLIDER.left, SLIDER.right]) {
    ctx.beginPath();
    ctx.arc(x, y + 16, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  const r = 14 * (1 + 0.16 * grabbed);
  softShadow(ctx, kx - r, y - r, 2 * r, 2 * r, 0.5, 3);
  ctx.beginPath();
  ctx.arc(kx, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  if (grabbed > 0) {
    ctx.beginPath();
    ctx.arc(kx, y, r + 6 * grabbed, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(243,210,122,${0.6 * grabbed})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  return kx;
};

/** A drag on a slider: the fingertip follows the knob between grab and release. */
const dragTouch = (ctx: CanvasRenderingContext2D, t: number, grab: number, release: number, x: number, y: number) => {
  const a = ramp(t, grab - 16, grab - 4, easeOut) * (1 - ramp(t, release + 4, release + 18, easeIn));
  const press = clamp01((t - grab + 2) / 5) * (1 - clamp01((t - release) / 5));
  const approach = 1 - ramp(t, grab - 16, grab, easeOut);
  fingertip(ctx, x + 10 * approach, y + 16 * approach, a, 0.6 * press);
  ripple(ctx, x, y, t, grab);
};

// ─── Pages ───────────────────────────────────────────────────────────────────

/** 1. Hook: the question, then a small diagram (Miran Gold → your account). */
const hookPage = (ctx: CanvasRenderingContext2D, t: number) => {
  // The emblem with a soft breathing gold ring.
  land(ctx, t, 2, () => {
    const br = 0.5 + 0.5 * Math.sin(t / 14);
    ctx.beginPath();
    ctx.arc(W / 2, 228, 58 + 4 * br, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,162,76,${0.1 + 0.06 * br})`;
    ctx.fill();
    emblem(ctx, W / 2, 228, 46);
  });
  land(ctx, t, T.questionAt, () => say(ctx, S.hookQ1, W / 2, 338, {weight: 700, size: 40, color: C.text, align: 'center'}));
  land(ctx, t, T.questionAt + 7, () => say(ctx, S.hookQ2, W / 2, 398, {weight: 700, size: 46, color: goldGradient(ctx, 40, 0, W - 40, 0), align: 'center', maxW: W - 40}));

  // The diagram.
  const d0 = T.diagramAt;
  const y = 530;
  const xa = W - 86; // Miran Gold (the reading start)
  const xb = 86; // your account
  land(ctx, t, d0, () => {
    ctx.beginPath();
    ctx.arc(xa, y, 46, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212,162,76,0.14)';
    ctx.fill();
    emblem(ctx, xa, y, 38);
    say(ctx, 'Miran Gold', xa, y + 76, {weight: 700, size: 19, color: goldGradient(ctx, xa - 60, 0, xa + 60, 0), align: 'center', maxW: 140});
  });
  land(ctx, t, d0 + 10, () => {
    const hit = arrivals(t);
    ctx.beginPath();
    ctx.arc(xb, y, 46 + 6 * hit, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(63,208,138,${0.1 + 0.2 * hit})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(xb, y, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#1d1810';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = mixHex('#D4A24C', GREEN, hit);
    ctx.stroke();
    icon(ctx, 'user', xb, y, 34, '#F3D27A', 2.6);
    say(ctx, S.account, xb, y + 76, {weight: 700, size: 19, color: C.text, align: 'center', maxW: 140});
  });
  // The path draws from Miran Gold to the account, then copies travel along it.
  const grow = ramp(t, d0 + 14, d0 + 40, easeInOut);
  if (grow > 0) {
    const x0 = xa - 58;
    const x1 = xb + 58;
    ctx.save();
    ctx.strokeStyle = 'rgba(212,162,76,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = t * 0.8;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + (x1 - x0) * grow, y);
    ctx.stroke();
    ctx.restore();
    for (let k = 0; k < 6; k++) {
      const s = d0 + 36 + k * 34;
      const p = ramp(t, s, s + 32, easeInOut);
      if (p <= 0 || p >= 1) continue;
      const cx = x0 + (x1 - x0) * p;
      const a = Math.min(1, p * 6, (1 - p) * 6);
      ctx.save();
      ctx.globalAlpha *= a;
      softShadow(ctx, cx - 26, y - 18, 52, 36, 0.6, 0, '#C8963E');
      rr(ctx, cx - 26, y - 18, 52, 36, 12);
      ctx.fillStyle = goldGradient(ctx, cx - 26, 0, cx + 26, 0);
      ctx.fill();
      icon(ctx, 'copy', cx + 2, y + 2, 20, '#1a1206', 2.4);
      ctx.restore();
    }
  }
  land(ctx, t, d0 + 46, () => say(ctx, S.hookFlow, W / 2, 694, {weight: 700, size: 27, color: C.text, align: 'center', maxW: W - 40}));
  land(ctx, t, d0 + 54, () => say(ctx, S.hookFlow2, W / 2, 736, {weight: 700, size: 27, color: goldGradient(ctx, 40, 0, W - 40, 0), align: 'center', maxW: W - 40}));
};

/** 0 → 1 → 0 each time a copy reaches the account in the hook diagram. */
const arrivals = (t: number) => {
  let h = 0;
  for (let k = 0; k < 6; k++) {
    const d = t - (T.diagramAt + 36 + k * 34 + 32);
    if (d >= 0 && d < 24) h = Math.max(h, Math.exp(-d / 7));
  }
  return h;
};

/** 2. Connect your account (generic: "your trading account", no broker or platform). */
const connectPage = (ctx: CanvasRenderingContext2D, t: number) => {
  title(ctx, S.connectTitle, S.connectSub);
  const linking = ramp(t, T.connectTapAt + 6, T.linkedAt, easeInOut);
  const linked = t >= T.linkedAt;
  const ok = pop(t, T.linkedAt, 2.2, 0.55);

  // Your account.
  cardBox(ctx, {y: 232, h: 104});
  const ix = CARD.x + CARD.w - 54;
  ctx.beginPath();
  ctx.arc(ix, 284, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(212,162,76,0.16)';
  ctx.fill();
  icon(ctx, 'user', ix, 284, 30, '#F3D27A', 2.6);
  say(ctx, S.account, ix - 46, 280, {weight: 700, size: 24, color: C.text, align: 'right', maxW: 180});
  say(ctx, S.accountSub, ix - 46, 308, {weight: 500, size: 16, color: C.meta, align: 'right', maxW: 180});
  if (linked) {
    ctx.save();
    ctx.globalAlpha *= clamp01(ok * 1.5);
    checkPill(ctx, 'مرتبط', CARD.x + 20, 270, GREEN, 'left', 15);
    ctx.restore();
  }

  // The link between them: grey dashes, filling gold while linking, a check once linked.
  const y0 = 340;
  const y1 = 420;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.moveTo(W / 2, y0);
  ctx.lineTo(W / 2, y1);
  ctx.stroke();
  ctx.setLineDash([]);
  if (linking > 0) {
    ctx.strokeStyle = linked ? GREEN : '#F3D27A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2, y0);
    ctx.lineTo(W / 2, y0 + (y1 - y0) * linking);
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(W / 2, (y0 + y1) / 2, 21, 0, Math.PI * 2);
  ctx.fillStyle = linked ? mixHex('#2a2214', '#123a29', clamp01(ok)) : '#2a2214';
  ctx.fill();
  if (linked) {
    ctx.save();
    ctx.translate(W / 2, (y0 + y1) / 2);
    ctx.scale(Math.max(0, ok), Math.max(0, ok));
    icon(ctx, 'check', 0, 0, 22, GREEN, 3.4);
    ctx.restore();
  } else if (t >= T.connectTapAt + 4) spinner(ctx, W / 2, (y0 + y1) / 2, 12, t, '#F3D27A', 3);
  else icon(ctx, 'copy', W / 2 + 1, (y0 + y1) / 2 + 1, 20, '#C9A660', 2.2);

  // Miran Gold.
  cardBox(ctx, {y: 424, h: 104, border: linked ? `rgba(63,208,138,${0.55 * clamp01(ok)})` : 'rgba(212,162,76,0.35)'});
  emblem(ctx, ix, 476, 30);
  say(ctx, 'Miran Gold', ix - 46, 472, {weight: 700, size: 24, color: goldGradient(ctx, 0, 0, W, 0), align: 'right', maxW: 180});
  say(ctx, S.miranSub, ix - 46, 500, {weight: 500, size: 16, color: C.meta, align: 'right', maxW: 200});

  // The button: gold, then "connecting…", then a green "linked".
  const press = pressOf(t, T.connectTapAt);
  const by = 588;
  if (!linked && t < T.connectTapAt + 4) {
    button(ctx, by, 70, press, goldGradient(ctx, -170, 0, 170, 0), () => say(ctx, S.connectBtn, 0, 10, {weight: 700, size: 26, color: '#1a1206', align: 'center'}));
  } else if (!linked) {
    button(ctx, by, 70, press, 'rgba(212,162,76,0.25)', () => {
      say(ctx, S.connecting, 14, 9, {weight: 700, size: 23, color: '#F3D27A', align: 'center'});
      spinner(ctx, 86, 0, 10, t, '#F3D27A', 3);
    }, 'rgba(243,210,122,0.6)');
  } else {
    button(ctx, by, 70, 0, 'rgba(63,208,138,0.16)', () => {
      say(ctx, S.linkedBtn, -12, 10, {weight: 700, size: 25, color: GREEN, align: 'center'});
      icon(ctx, 'check', 52, 0, 20, GREEN, 3.2);
    }, GREEN);
  }
  land(ctx, t, T.linkedAt + 6, () => say(ctx, S.linked, W / 2, 716, {weight: 700, size: 23, color: goldGradient(ctx, 40, 0, W - 40, 0), align: 'center', maxW: W - 60}));
  tap(ctx, t, T.connectTapAt, W / 2 + 30, by + 35);
};

/** 3. Settings: two sliders (copy ratio, risk per trade), a daily loss limit switch, save. */
const settingsPage = (ctx: CanvasRenderingContext2D, t: number) => {
  title(ctx, S.settingsTitle, S.settingsSub);
  const grabbed = (g: number, r: number) => ramp(t, g, g + 6, easeOut) * (1 - ramp(t, r, r + 8, easeOut));

  // Copy ratio.
  const rv = ratioValue(t);
  const g1 = grabbed(T.ratioGrab, T.ratioRelease);
  cardBox(ctx, {y: 228, h: 134, border: `rgba(243,210,122,${0.12 + 0.6 * g1})`});
  say(ctx, S.ratio, sx() - 10, 270, {weight: 700, size: 23, color: C.text, align: 'right', maxW: 240});
  say(ctx, S.ratioSub, sx() - 10, 298, {weight: 500, size: 15, color: C.meta, align: 'right', maxW: 300});
  num(ctx, fmtRatio(rv.shown), CARD.x + 24, 272, {size: 26, color: '#F3D27A', align: 'left'});
  const k1 = slider(ctx, 334, rv.raw, P.ratio.min, P.ratio.max, g1);

  // Risk per trade.
  const kv = riskValue(t);
  const g2 = grabbed(T.riskGrab, T.riskRelease);
  cardBox(ctx, {y: 376, h: 134, border: `rgba(243,210,122,${0.12 + 0.6 * g2})`});
  say(ctx, S.risk, sx() - 10, 418, {weight: 700, size: 23, color: C.text, align: 'right', maxW: 250});
  say(ctx, S.riskSub, sx() - 10, 446, {weight: 500, size: 15, color: C.meta, align: 'right', maxW: 300});
  num(ctx, fmtPct(kv.shown), CARD.x + 24, 420, {size: 26, color: '#F3D27A', align: 'left'});
  const k2 = slider(ctx, 482, kv.raw, P.risk.min, P.risk.max, g2);

  // Daily loss limit.
  const d = dailyOn(t);
  cardBox(ctx, {y: 524, h: 86, border: `rgba(63,208,138,${0.1 + 0.4 * d})`});
  say(ctx, S.daily, sx() - 10, 575, {weight: 700, size: 23, color: C.text, align: 'right', maxW: 200});
  const tgx = CARD.x + 60;
  num(ctx, fmtPct(P.dailyLimitPct), tgx + 62, 576, {size: 22, color: mixHex('#6B7180', '#F3D27A', d), align: 'left'});
  toggle(ctx, tgx, 567, d, pressOf(t, T.dailyTapAt - 2));

  // Save.
  const saved = t >= T.saveTapAt + 6;
  const sv = pop(t, T.saveTapAt + 6, 2.2, 0.55);
  if (!saved) {
    button(ctx, 626, 66, pressOf(t, T.saveTapAt), goldGradient(ctx, -170, 0, 170, 0), () => say(ctx, S.save, 0, 9, {weight: 700, size: 25, color: '#1a1206', align: 'center'}));
  } else {
    button(ctx, 626, 66, 0, 'rgba(63,208,138,0.16)', () => {
      say(ctx, S.saved, -12, 9, {weight: 700, size: 24, color: GREEN, align: 'center'});
      ctx.save();
      ctx.translate(48, 0);
      ctx.scale(Math.max(0, sv), Math.max(0, sv));
      icon(ctx, 'check', 0, 0, 20, GREEN, 3.2);
      ctx.restore();
    }, GREEN);
  }
  riskNote(ctx, 744);

  dragTouch(ctx, t, T.ratioGrab, T.ratioRelease, k1, 334);
  dragTouch(ctx, t, T.riskGrab, T.riskRelease, k2, 482);
  tap(ctx, t, T.dailyTapAt, tgx + 6, 567);
  tap(ctx, t, T.saveTapAt, W / 2 + 40, 659);
};

/** 4. Automatic copy trading: the big switch. */
const autoPage = (ctx: CanvasRenderingContext2D, t: number) => {
  title(ctx, S.autoTitle);
  const on = ramp(t, T.autoOnAt, T.autoOnAt + 10, easeOut);
  const burst = t >= T.autoOnAt ? Math.exp(-(t - T.autoOnAt) / 16) : 0;
  if (burst > 0.01) softShadow(ctx, CARD.x, 224, CARD.w, 300, 0.7 * burst, 0, '#3FD08A');
  cardBox(ctx, {y: 224, h: 300, border: `rgba(243,210,122,${0.3 + 0.5 * on})`, glow: on > 0.5 ? '#C8963E' : undefined});
  emblem(ctx, W / 2, 290, 36);
  const row = switchRow(ctx, 392, on, pressOf(t, T.autoOnAt - 2), true);
  // Status: off (grey) → on (green), crossfading.
  const status = (label: string, color: string, a: number) => {
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const lw = measure(ctx, label, 700, 23, true);
    const right = W / 2 + (lw + 22) / 2;
    ctx.beginPath();
    ctx.arc(right - 6, 469, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    say(ctx, label, right - 20, 477, {weight: 700, size: 23, color, align: 'right'});
    ctx.restore();
  };
  status(S.off, C.meta, 1 - on);
  status(S.on, GREEN, on);
  ctx.save();
  ctx.globalAlpha *= on;
  say(ctx, S.onBody, W / 2, 506, {weight: 600, size: 17, color: '#D5D8DF', align: 'center', maxW: CARD.w - 40});
  ctx.restore();
  // The settings chosen in the step before.
  chipRow(ctx, [S.chipRatio(fmtRatio(P.ratio.to)), S.chipRisk(fmtPct(P.risk.to)), S.chipDaily(fmtPct(P.dailyLimitPct))], 556, 16);
  land(ctx, t, T.autoOnAt + 16, () => {
    say(ctx, S.waiting, W / 2, 662, {weight: 600, size: 20, color: '#C9CDD6', align: 'center', maxW: 320});
    dots(ctx, t, 692);
  });
  riskNote(ctx, 762);
  tap(ctx, t, T.autoOnAt, row.x + 4, row.y);
};

const dots = (ctx: CanvasRenderingContext2D, t: number, y: number) => {
  for (let i = 0; i < 3; i++) {
    const p = 0.35 + 0.65 * Math.max(0, Math.sin((t / 8 - i * 0.9) % (Math.PI * 2)));
    ctx.beginPath();
    ctx.arc(W / 2 - 22 + i * 22, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = hexA(GOLD, p);
    ctx.fill();
  }
};

// ─── 5–7. The account: signal, news alert, in control ────────────────────────

const SRC: ChartSource = {price, range: chartRange, newsAt: T.newsAt, span: MARKET.chartSpan};

const levelsAt = (t: number): Level[] => {
  const a = ramp(t, T.copiedAt - 4, T.copiedAt + 14, easeOut) * (1 - ramp(t, T.closedAt, T.closedAt + 16, easeIn));
  if (a <= 0) return [];
  return [
    {price: P.signal.tp, color: GREEN, label: S.target, alpha: a},
    {price: P.signal.entry, color: '#E9E4D8', label: S.entry, alpha: a},
    {price: P.signal.sl, color: RED, label: S.stopShort, alpha: a},
  ];
};

const dashActs = (): Activity[] => [
  {at: T.signalAt - 4, until: T.signalAt + 64, color: GOLD, icon: 'signal', title: S.signalIsland, sub: S.buyGold},
  {at: T.alertAt - 6, until: T.alertAt + 66, color: AMBER, icon: 'bell', title: S.alertIsland, sub: S.alertIslandSub(P.newsInMinutes)},
  {at: T.newsAt + 4, until: T.newsAt + 96, color: GREEN, icon: 'shield', title: S.newsIsland, sub: S.newsIslandSub},
];

const waitingDashCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(212,162,76,0.35)'});
  emblem(ctx, W / 2, CARD.y + 62, 34);
  const lw = measure(ctx, S.on, 700, 22, true);
  const lab = `${S.autoCopy}: `;
  const total = measure(ctx, lab, 700, 22, true) + lw + 22;
  const right = W / 2 + total / 2;
  ctx.beginPath();
  ctx.arc(right - 6, CARD.y + 140, 6, 0, Math.PI * 2);
  ctx.fillStyle = GREEN;
  ctx.fill();
  say(ctx, `${S.autoCopy}: ${S.on}`, right - 20, CARD.y + 148, {weight: 700, size: 22, color: GREEN, align: 'right'});
  say(ctx, S.waiting, W / 2, CARD.y + 210, {weight: 600, size: 20, color: '#C9CDD6', align: 'center', maxW: 320});
  dots(ctx, t, CARD.y + 244);
};

const signalCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(212,162,76,0.7)', glow: '#C8963E'});
  const line = (i: number) => ramp(t, T.signalAt + i * 8, T.signalAt + i * 8 + 10, easeOut);
  const y = CARD.y;
  // Title row and the "copied automatically" pill.
  ctx.save();
  ctx.globalAlpha *= line(0);
  const e0 = CARD.x + CARD.w - 24 - 15;
  emblem(ctx, e0, y + 38, 15);
  say(ctx, S.signalTitle, e0 - 24, y + 45, {weight: 700, size: 18, color: goldGradient(ctx, 0, 0, W, 0), align: 'right', maxW: 190});
  const c = ramp(t, T.copiedAt, T.copiedAt + 10, easeOut);
  if (c > 0) {
    ctx.globalAlpha = line(0) * c;
    const s = 0.8 + 0.2 * pop(t, T.copiedAt, 2.4, 0.5);
    ctx.translate(CARD.x + 22, y + 39);
    ctx.scale(s, s);
    checkPill(ctx, S.copied, 0, -15, GREEN, 'left', 15);
  }
  ctx.restore();
  // "Buy gold".
  ctx.save();
  ctx.globalAlpha *= line(1);
  say(ctx, S.buyGold, sx() - 6, y + 96, {weight: 700, size: 32, color: GREEN, align: 'right', maxW: 300});
  ctx.restore();
  // Entry, stop loss, target: three columns (reading order right to left).
  const cols: [string, number, string][] = [
    [S.entry, P.signal.entry, C.text],
    [S.stop, P.signal.sl, RED],
    [S.target, P.signal.tp, GREEN],
  ];
  cols.forEach(([label, value, color], i) => {
    ctx.save();
    ctx.globalAlpha *= line(2 + i);
    const cx = CARD.x + CARD.w * ((5 - 2 * i) / 6);
    say(ctx, label, cx, y + 140, {weight: 600, size: 15, color: C.meta, align: 'center', maxW: 110});
    num(ctx, value.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}), cx, y + 172, {size: 23, color, align: 'center'});
    ctx.restore();
  });
  ctx.save();
  ctx.globalAlpha *= line(2) * 0.6;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (const k of [1, 2]) ctx.fillRect(CARD.x + (CARD.w * k) / 3, y + 122, 1.2, 60);
  ctx.restore();
  // Your size and the most you can lose at the stop (inside the risk limit).
  ctx.save();
  ctx.globalAlpha *= line(5);
  rr(ctx, CARD.x + 16, y + 204, CARD.w - 32, 54, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  labelNum(ctx, 'حجمك', fmtRatio(P.ratio.to), CARD.x + CARD.w - 34, y + 238, {size: 17, numSize: 19, numColor: '#F3D27A'});
  labelNum(ctx, S.maxLoss, signedMoney(-MAX_LOSS), CARD.x + 34, y + 238, {size: 17, numSize: 19, numColor: '#FF8A8A', align: 'left'});
  ctx.restore();
};

const alertCard = (ctx: CanvasRenderingContext2D, t: number) => {
  const pulse = 0.5 + 0.5 * Math.sin((t - T.alertAt) / 6);
  cardBox(ctx, {fill: 'rgba(42,32,16,0.97)', border: AMBER, glow: '#B07A2A'});
  const y = CARD.y;
  const ix = CARD.x + CARD.w - 24 - 22;
  ctx.beginPath();
  ctx.arc(ix, y + 44, 22, 0, Math.PI * 2);
  ctx.fillStyle = hexA(AMBER, 0.2 + 0.12 * pulse);
  ctx.fill();
  icon(ctx, 'bell', ix, y + 44, 22, AMBER, 2.4);
  say(ctx, S.alertTitle, ix - 34, y + 52, {weight: 700, size: 22, color: AMBER, align: 'right', maxW: 240});
  say(ctx, S.alertBody(P.newsInMinutes), sx() - 6, y + 112, {weight: 700, size: 23, color: C.text, align: 'right', maxW: CARD.w - 44});
  // The plan, from Miran Gold.
  land(ctx, t, T.alertAt + 16, () => {
    rr(ctx, CARD.x + 16, y + 136, CARD.w - 32, 60, 20);
    ctx.fillStyle = 'rgba(212,162,76,0.16)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(243,210,122,0.5)';
    ctx.stroke();
    icon(ctx, 'shield', CARD.x + CARD.w - 46, y + 166, 24, '#F3D27A', 2.4);
    say(ctx, S.alertPlan, CARD.x + CARD.w - 70, y + 174, {weight: 700, size: 20, color: '#F3D27A', align: 'right', maxW: CARD.w - 100});
  });
  // Being copied into your account.
  land(ctx, t, T.alertAt + 46, () => {
    const lw = measure(ctx, S.alertCopying, 600, 17, true);
    const right = W / 2 + (lw + 30) / 2;
    spinner(ctx, right - 9, y + 238, 9, t, '#F3D27A', 2.6);
    say(ctx, S.alertCopying, right - 28, y + 244, {weight: 600, size: 17, color: '#D5D8DF', align: 'right'});
  });
};

const closedCard = (ctx: CanvasRenderingContext2D, t: number) => {
  cardBox(ctx, {border: 'rgba(63,208,138,0.6)'});
  const y = CARD.y;
  const k = pop(t, T.closedAt, 2.2, 0.5);
  ctx.save();
  ctx.translate(W / 2, y + 60);
  ctx.scale(k, k);
  icon(ctx, 'checkCircle', 0, 0, 64, GREEN, 4.5);
  ctx.restore();
  say(ctx, S.closedTitle, W / 2, y + 132, {weight: 700, size: 28, color: C.text, align: 'center'});
  checkPill(ctx, S.copied, W / 2, y + 146, GREEN, 'center', 15);
  labelNum(ctx, `${S.result}:`, signedMoney(RESULT), W / 2, y + 224, {size: 22, numSize: 34, color: '#CFEBDD', numColor: GREEN, weight: 700, align: 'center'});
  say(ctx, S.resultNote, W / 2, y + 258, {weight: 500, size: 15, color: '#AEB4C2', align: 'center', maxW: 330});
};

const controlCard = (ctx: CanvasRenderingContext2D, t: number) => {
  const on = autoOn(t);
  cardBox(ctx, {border: mixHex('#E8A33D', '#D4A24C', on) + 'AA'});
  const y = CARD.y;
  say(ctx, S.controlTitle, sx() - 6, y + 50, {weight: 700, size: 27, color: goldGradient(ctx, 0, 0, W, 0), align: 'right', maxW: 300});
  const press = Math.max(pressOf(t, T.pauseTapAt - 2), pressOf(t, T.resumeTapAt - 2));
  const row = switchRow(ctx, y + 124, on, press);
  const line = (label: string, color: string, a: number) => {
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const lw = measure(ctx, label, 700, 18, true);
    const right = W / 2 + (lw + 20) / 2;
    ctx.beginPath();
    ctx.arc(right - 5, y + 196, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    say(ctx, label, right - 18, y + 203, {weight: 700, size: 18, color, align: 'right', maxW: CARD.w - 40});
    ctx.restore();
  };
  line(S.controlOn, GREEN, on);
  line(S.controlOff, AMBER, 1 - on);
  say(ctx, S.controlNote, W / 2, y + 250, {weight: 500, size: 16, color: '#AEB4C2', align: 'center', maxW: CARD.w - 40});
  tap(ctx, t, T.pauseTapAt, row.x + 4, row.y);
  tap(ctx, t, T.resumeTapAt, row.x + 4, row.y);
};

const dashPage = (ctx: CanvasRenderingContext2D, t: number) => {
  const v = accountValue(t);
  const pnl = openPnl(t);
  const openA = ramp(t, T.copiedAt, T.copiedAt + 10) * (1 - ramp(t, T.closedAt - 2, T.closedAt + 8));
  balanceBlock(ctx, v, valueColor(v, P.balance), tradeOpen(t) ? pnl : null, openA);
  chart(ctx, t, GOLD, levelsAt(t), AMBER, SRC);
  withT(ctx, tr(t, -100, T.signalAt - 4, 10), () => waitingDashCard(ctx, t));
  withT(ctx, tr(t, T.signalAt, T.alertAt - 6, 10), () => signalCard(ctx, t));
  withT(ctx, tr(t, T.alertAt, T.closedAt - 2, 10), () => alertCard(ctx, t));
  withT(ctx, tr(t, T.closedAt, T.controlAt - 6, 10), () => closedCard(ctx, t));
  withT(ctx, tr(t, T.controlAt), () => controlCard(ctx, t));
};

// ─── The screen ──────────────────────────────────────────────────────────────

const PAGE_DRAW: Record<PageId, (ctx: CanvasRenderingContext2D, t: number) => void> = {
  hook: hookPage,
  connect: connectPage,
  settings: settingsPage,
  auto: autoPage,
  dash: dashPage,
};

export const drawCopyScreen = (ctx: CanvasRenderingContext2D, t: number) => {
  // Shadows fade with their page and card (no pop on the first frame of a transition).
  setShadowRelative(true);
  background(ctx, 'miran', 0);
  header(ctx, 'miran');
  // Pages push in from the left (Arabic iOS); the old page slides off to the right.
  for (const p of pagesAt(t)) {
    const a = p.enter * (1 - p.leave);
    if (a <= 0.001) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(-(1 - p.enter) * 70 + p.leave * 70 * (RTL ? 1 : -1), 0);
    // Content under the header only (the header stays put).
    ctx.beginPath();
    ctx.rect(-80, 118, W + 160, H - 118);
    ctx.clip();
    PAGE_DRAW[p.id](ctx, t);
    ctx.restore();
  }
  chrome(ctx, t, t >= T.dashPage - T.pageTr ? dashActs() : []);
  homeIndicator(ctx);
  setShadowRelative(false);
};

/** The screen stops changing once the end card covers it. */
const FREEZE = T.endCardStart + 60;
export const copyScreenKey = (t: number) => `copy|${Math.min(t, FREEZE)}`;
