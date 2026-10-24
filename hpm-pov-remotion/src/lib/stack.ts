// Notification stack layout. Newest card on top at LOCK.areaTop; each arrival pushes the
// others down. Up to 5 cards show in full (fewer if they would run past VISIBLE_BOTTOM);
// older ones fold into a grouped stack peeking out behind the last visible card.
//
// A layout is computed after every arrival. A card's on-screen state is its layout on
// arrival plus every later layout change, each springing in from the frame that caused
// it. Springs add up linearly, so cards glide even when arrivals overlap: nothing jumps.
import {COUNTER_FROM_FLOOD, COUNTER_KEYS, Notif, NOTIFICATIONS} from '../notifications';
import {CARD, FONT, LOCK, WEIGHT} from '../theme';
import {fontsReady, measureText} from '../fonts';
import {cardSpring} from './anim';
import {interpolate} from 'remotion';

export const MAX_VISIBLE = 5;
export const VISIBLE_BOTTOM = 1520; // leaves room for the 2 × 18px peeks above y 1560
const GROUP = [
  {scale: 0.94, opacity: 0.6},
  {scale: 0.88, opacity: 0.3},
];

export const TEXT_WIDTH = CARD.width - CARD.padX * 2 - CARD.tile - CARD.gap;

// Body wraps to 1–2 lines; heights follow the card spec (label, title, body).
export const bodyLines = (body: string) => {
  const font = `${WEIGHT.body} ${CARD.bodySize}px ${FONT}`;
  const words = body.split(' ');
  let lines = 1;
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && measureText(next, font) > TEXT_WIDTH) {
      lines++;
      line = w;
    } else line = next;
  }
  return Math.min(2, lines);
};
const HEADER = CARD.labelSize * 1.2 + 6 + CARD.titleSize * 1.2 + 2;
export const cardHeight = (body: string) => CARD.padY * 2 + HEADER + CARD.bodyLine * bodyLines(body);

type Slot = {y: number; scale: number; opacity: number; z: number};
type Layout = {slots: Slot[]; groupBottom: number; grouped: number};

let cache: {heights: number[]; layouts: Layout[]} | null = null;

const build = () => {
  const heights = NOTIFICATIONS.map((n) => cardHeight(n.body));
  const layouts: Layout[] = NOTIFICATIONS.map((_, k) => {
    const slots: Slot[] = [];
    let cursor: number = LOCK.areaTop;
    let visible = 0;
    let lastBottom: number = LOCK.areaTop;
    // Newest first.
    for (let j = k; j >= 0; j--) {
      const idx = k - j;
      const h = heights[j];
      if (visible === idx && idx < MAX_VISIBLE && (idx === 0 || cursor + h <= VISIBLE_BOTTOM)) {
        slots[j] = {y: cursor, scale: 1, opacity: 1, z: 1000 - idx};
        lastBottom = cursor + h;
        cursor += h + CARD.stackGap;
        visible++;
      } else {
        const g = idx - visible;
        const look = GROUP[Math.min(g, GROUP.length - 1)];
        const peek = CARD.peek * Math.min(g + 1, GROUP.length);
        slots[j] = {y: lastBottom + peek - h, scale: look.scale, opacity: g < GROUP.length ? look.opacity : 0, z: 1000 - idx};
      }
    }
    return {slots, groupBottom: lastBottom, grouped: k + 1 - visible};
  });
  return {heights, layouts};
};

const data = () => {
  if (cache) return cache;
  const d = build();
  if (fontsReady()) cache = d; // never cache metrics measured with a fallback font
  return d;
};

export type CardState = {notif: Notif; index: number; y: number; scale: number; opacity: number; z: number; height: number; enter: number};

const lastArrived = (t: number) => {
  let k = -1;
  for (let i = 0; i < NOTIFICATIONS.length; i++) if (NOTIFICATIONS[i].frame <= t) k = i;
  return k;
};

// Every arrived card's state at story time t.
export const stackAt = (t: number): {cards: CardState[]; groupBottom: number; grouped: number} => {
  const {heights, layouts} = data();
  const k = lastArrived(t);
  const cards: CardState[] = [];
  for (let j = 0; j <= k; j++) {
    const base = layouts[j].slots[j];
    let {y, scale, opacity} = base;
    for (let e = j + 1; e <= k; e++) {
      const s = cardSpring(t - NOTIFICATIONS[e].frame);
      const a = layouts[e - 1].slots[j];
      const b = layouts[e].slots[j];
      y += (b.y - a.y) * s;
      scale += (b.scale - a.scale) * s;
      opacity += (b.opacity - a.opacity) * s;
    }
    if (opacity <= 0.002) continue;
    cards.push({
      notif: NOTIFICATIONS[j],
      index: j,
      y,
      scale,
      opacity: Math.min(1, opacity),
      z: layouts[k].slots[j].z,
      height: heights[j],
      enter: cardSpring(t - NOTIFICATIONS[j].frame),
    });
  }
  let groupBottom: number = LOCK.areaTop;
  if (k >= 0) {
    groupBottom = layouts[0].groupBottom;
    for (let e = 1; e <= k; e++) groupBottom += (layouts[e].groupBottom - layouts[e - 1].groupBottom) * cardSpring(t - NOTIFICATIONS[e].frame);
  }
  return {cards, groupBottom, grouped: k >= 0 ? layouts[k].grouped : 0};
};

// "+N more": the real hidden count until the flood, then the counter keyframes.
export const counterValue = (t: number) => {
  if (t < COUNTER_FROM_FLOOD) return stackAt(t).grouped;
  const start = stackAt(COUNTER_FROM_FLOOD).grouped;
  const frames = [COUNTER_FROM_FLOOD, ...COUNTER_KEYS.map(([f]) => f)];
  const values = [start, ...COUNTER_KEYS.map(([, v]) => v)];
  return Math.floor(interpolate(t, frames, values, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
};

export const counterLabel = (v: number) => (v >= 99 ? '99+ more' : `+${v} more`);


// Frame at which the first card folds into the grouped stack.
export const firstGroupFrame = () => {
  const {layouts} = data();
  const k = layouts.findIndex((l) => l.grouped > 0);
  return k < 0 ? Infinity : NOTIFICATIONS[k].frame;
};
