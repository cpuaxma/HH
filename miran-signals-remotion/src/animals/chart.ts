// The gold price chart behind the animals, drawn per frame into a canvas that sits on a
// panel in the studio (additive, so only its light shows on the navy wall). Abstract on
// purpose: candles and a line, no prices, dates or instrument data (the «توضيحي» chip on
// screen covers it).
import {clamp01, lerp} from '../lib/ease';
import {hexA, mixHex} from '../screens/draw';
import {rr} from '../screens/kit';
import {CHART, COLORS, T} from './data';
import {candlesAt, chartPulse, priceAt, tintMix, whaleHighlight} from './story';

export const CHART_TEX = {w: 2048, h: Math.round((2048 * CHART.panel.h) / CHART.panel.w)};

export const drawChart = (ctx: CanvasRenderingContext2D, t: number) => {
  const {w: W, h: H} = CHART_TEX;
  ctx.clearRect(0, 0, W, H);
  const {candles, now} = candlesAt(t);
  const C = CHART.candle;
  // The newest candle sits about two thirds across, so it stays in frame in the close shots.
  const right = W * 0.64;
  const left = W * 0.02;
  const cw = (right - left) / CHART.candles;
  const xOf = (chartFrame: number) => right - ((now - chartFrame) / C) * cw;
  const yOf = (v: number) => H * (0.86 - 0.68 * v);
  const tint = tintMix(t);
  const glow = mixHex(tint.a, tint.b, tint.k);
  const pulse = chartPulse(t);

  // Grid: faint horizontal rules, and vertical ones every 4 candles that scroll with the chart.
  ctx.save();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 2;
  for (let i = 0; i <= 5; i++) {
    const y = H * (0.1 + 0.16 * i);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  const first = Math.floor((now - CHART.candles * C * 1.3) / (4 * C));
  for (let k = first; k * 4 * C <= now + 8 * C; k++) {
    const x = xOf(k * 4 * C);
    ctx.beginPath();
    ctx.moveTo(x, H * 0.06);
    ctx.lineTo(x, H * 0.94);
    ctx.stroke();
  }
  ctx.restore();

  // The area under the line, then the line (closing prices, sampled finely).
  const pts: [number, number][] = [];
  const from = now - (CHART.candles + 1.5) * C;
  for (let x = from; x <= now; x += 2) pts.push([xOf(x), yOf(priceAt(x))]);
  pts.push([xOf(now), yOf(priceAt(now))]);
  const area = ctx.createLinearGradient(0, H * 0.1, 0, H);
  area.addColorStop(0, hexA(glow, 0.22 + 0.12 * pulse));
  area.addColorStop(1, hexA(glow, 0));
  ctx.beginPath();
  ctx.moveTo(pts[0][0], H);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], H);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  // The line through the closes, glowing softly behind the candles.
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(COLORS.chartLine, 0.85);
  ctx.shadowBlur = 18 + 16 * pulse;
  ctx.strokeStyle = COLORS.chartLine;
  ctx.lineWidth = 4.5;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();

  // Candles.
  const bodyW = cw * 0.62;
  for (const c of candles) {
    const xc = xOf(c.i * C + C / 2);
    if (xc < -cw || xc > W + cw) continue;
    const up = c.close >= c.open;
    let col = up ? COLORS.candleUp : COLORS.candleDown;
    const hl = c.whale ? whaleHighlight(t) : 0;
    if (hl > 0) col = mixHex(col, '#FFE7A6', 0.5 * hl);
    const a = c.forming ? 1 : 0.9;
    ctx.save();
    if (hl > 0 || c.forming) {
      ctx.shadowColor = hexA(c.whale ? '#F3D27A' : glow, c.whale ? 0.9 * hl : 0.5 + 0.4 * pulse);
      ctx.shadowBlur = c.whale ? 60 * hl : 24 + 30 * pulse;
    }
    ctx.globalAlpha = a;
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(xc, yOf(c.high));
    ctx.lineTo(xc, yOf(c.low));
    ctx.stroke();
    const y0 = yOf(Math.max(c.open, c.close));
    const y1 = yOf(Math.min(c.open, c.close));
    const bw = c.whale ? bodyW * lerp(1, 1.35, hl) : bodyW;
    rr(ctx, xc - bw / 2, y0, bw, Math.max(4, y1 - y0), Math.min(8, bw / 4));
    ctx.fillStyle = up ? col : hexA(col, 0.9);
    ctx.fill();
    if (hl > 0) {
      ctx.globalAlpha = hl;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#FFF1C8';
      ctx.stroke();
    }
    ctx.restore();
  }

  // The latest price: a dashed rule across and a pulsing dot.
  const [lx, ly] = pts[pts.length - 1];
  ctx.save();
  ctx.setLineDash([14, 14]);
  ctx.lineDashOffset = -t * 0.6;
  ctx.strokeStyle = hexA(COLORS.chartLine, 0.4);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lx + 20, ly);
  ctx.lineTo(W, ly);
  ctx.stroke();
  ctx.restore();
  const ph = ((t / 50) % 1 + 1) % 1;
  ctx.beginPath();
  ctx.arc(lx, ly, 14 + 40 * ph, 0, Math.PI * 2);
  ctx.fillStyle = hexA(COLORS.chartLine, 0.35 * (1 - ph));
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx, ly, 12 + 6 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF3D0';
  ctx.shadowColor = COLORS.chartLine;
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;
  // A soft halo of the beat's colour around the newest price.
  const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 360);
  halo.addColorStop(0, hexA(glow, 0.16 + 0.3 * pulse));
  halo.addColorStop(1, hexA(glow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(lx - 360, ly - 360, 720, 720);

  // Fade every edge into the wall (no panel border).
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const fx = ctx.createLinearGradient(0, 0, W, 0);
  fx.addColorStop(0, 'rgba(0,0,0,0)');
  fx.addColorStop(0.08, 'rgba(0,0,0,1)');
  fx.addColorStop(0.92, 'rgba(0,0,0,1)');
  fx.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fx;
  ctx.fillRect(0, 0, W, H);
  const fy = ctx.createLinearGradient(0, 0, 0, H);
  fy.addColorStop(0, 'rgba(0,0,0,0)');
  fy.addColorStop(0.06, 'rgba(0,0,0,1)');
  fy.addColorStop(0.85, 'rgba(0,0,0,1)');
  fy.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fy;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
};

/** The chart stops changing once the end card covers it. */
export const chartKey = (t: number) => `chart|${Math.min(t, T.endCardStart + 60)}`;
/** Overall brightness of the chart panel (dims a little behind the phone). */
export const chartBrightness = (t: number) => 0.95 - 0.25 * clamp01((t - T.phoneAt) / 60);
