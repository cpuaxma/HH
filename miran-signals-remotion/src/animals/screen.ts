// The tie-in phone: the Miran Gold app (the same gold theme and iOS details as the other
// reels) with a calm gold chart, then a news alert before a rate decision: a Live Activity
// in the Dynamic Island and a card. Generic on purpose: no real decision, bank or date.
import {
  CARD,
  Activity,
  PAD,
  background,
  cardBox,
  chrome,
  hexA,
  header,
  homeIndicator,
  say,
  sx,
  tr,
  withT,
} from '../screens/draw';
import {C, W, icon, rr, setShadowRelative} from '../screens/kit';
import {CHART, COLORS, PHONE_COPY, T} from './data';
import {chartClock, priceAt} from './story';

const AMBER = COLORS.alert;

const acts = (): Activity[] => [
  {at: T.alertAt, until: T.alertAt + 96, color: AMBER, icon: 'bell', title: PHONE_COPY.islandTitle, sub: PHONE_COPY.islandSub},
];

/** A small gold chart of the same market as the wall chart (no numbers). */
const miniChart = (ctx: CanvasRenderingContext2D, t: number) => {
  const top = 200;
  const bottom = 470;
  const left = PAD;
  const right = W - PAD;
  say(ctx, PHONE_COPY.chartLabel, sx(), 170, {weight: 700, size: 22, color: C.text});
  const now = chartClock(t);
  const span = CHART.candle * 22;
  const pts: [number, number][] = [];
  for (let x = now - span; x <= now; x += 3) pts.push([left + ((x - (now - span)) / span) * (right - left - 14), lerp(bottom, top, (priceAt(x) - 0.2) / 0.7)]);
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, 'rgba(212,162,76,0.28)');
  g.addColorStop(1, 'rgba(212,162,76,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0][0], bottom);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], bottom);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = '#E3B65E';
  ctx.lineWidth = 3.2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  const [lx, ly] = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(lx, ly, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF0C8';
  ctx.fill();
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const alertCard = (ctx: CanvasRenderingContext2D, t: number) => {
  const pulse = 0.5 + 0.5 * Math.sin((t - T.alertAt) / 6);
  const y = CARD.y - 30;
  cardBox(ctx, {fill: 'rgba(42,32,16,0.97)', border: AMBER, glow: '#B07A2A', y, h: 236});
  const ix = CARD.x + CARD.w - 46;
  ctx.beginPath();
  ctx.arc(ix, y + 48, 24, 0, Math.PI * 2);
  ctx.fillStyle = hexA(AMBER, 0.2 + 0.12 * pulse);
  ctx.fill();
  icon(ctx, 'bell', ix, y + 48, 24, AMBER, 2.4);
  say(ctx, PHONE_COPY.cardTitle, ix - 36, y + 56, {weight: 700, size: 23, color: AMBER, align: 'right', maxW: 240});
  say(ctx, PHONE_COPY.cardBody, sx() - 6, y + 124, {weight: 700, size: 30, color: C.text, align: 'right', maxW: CARD.w - 44});
  rr(ctx, CARD.x + 16, y + 152, CARD.w - 32, 58, 20);
  ctx.fillStyle = 'rgba(212,162,76,0.14)';
  ctx.fill();
  icon(ctx, 'warn', CARD.x + CARD.w - 46, y + 181, 22, '#F3D27A', 2.2);
  say(ctx, PHONE_COPY.cardNote, CARD.x + CARD.w - 70, y + 189, {weight: 600, size: 19, color: '#F3D27A', align: 'right', maxW: CARD.w - 100});
};

export const drawAlertScreen = (ctx: CanvasRenderingContext2D, t: number) => {
  setShadowRelative(true);
  background(ctx, 'miran', 0);
  header(ctx, 'miran');
  miniChart(ctx, t);
  withT(ctx, tr(t, T.alertAt + 30), () => alertCard(ctx, t));
  chrome(ctx, t, acts());
  homeIndicator(ctx);
  setShadowRelative(false);
};

/** Nothing changes on the screen before the phone comes up, nor after the end card covers it. */
export const alertScreenKey = (t: number) => `alert|${Math.max(T.phoneAt - 4, Math.min(t, T.endCardStart + 60))}`;
