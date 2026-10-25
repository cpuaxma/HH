// Notification stack layout. Newest card on top at LOCK.areaTop; each arrival pushes the
// others down. Up to 5 cards show in full (fewer if they would run past VISIBLE_BOTTOM);
// older ones fold into a grouped stack peeking out behind the last visible card.
//
// Each run of notifications (the cold open, the main story) is its own stack.
// A layout is computed after every arrival. A card's on-screen state is its layout on
// arrival plus every later layout change, each springing in from the frame that caused
// it. Springs add up linearly, so cards glide even when arrivals overlap: nothing jumps.
import {MAIN_RUN, Notif, OPEN_RUN, Run} from '../notifications';
import {CARD, LOCK, UI_FONT} from '../theme';
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

// Body wraps to 1–2 lines; heights follow the iOS card: title line + body lines, never
// shorter than the avatar.
export const bodyLines = (body: string) => {
  const words = body.split(' ');
  let lines = 1;
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && measureText({text: next, fontSize: CARD.bodySize, fontWeight: 400, fontFamily: UI_FONT}) > TEXT_WIDTH) {
      lines++;
      line = w;
    } else line = next;
  }
  return Math.min(2, lines);
};
export const cardHeight = (body: string) => CARD.padY * 2 + Math.max(CARD.tile, CARD.line * (1 + bodyLines(body)));

type Slot = {y: number; scale: number; opacity: number; z: number};
type Layout = {slots: Slot[]; groupBottom: number; grouped: number};

export type CardState = {notif: Notif; index: number; y: number; scale: number; opacity: number; z: number; height: number; enter: number};

export const makeStack = ({list, counter}: Run) => {
  let cache: {heights: number[]; layouts: Layout[]} | null = null;

  const build = () => {
    const heights = list.map((n) => cardHeight(n.body));
    const layouts: Layout[] = list.map((_, k) => {
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

  const lastArrived = (t: number) => {
    let k = -1;
    for (let i = 0; i < list.length; i++) if (list[i].frame <= t) k = i;
    return k;
  };

  // Every arrived card's state at story time t.
  const stackAt = (t: number): {cards: CardState[]; groupBottom: number; grouped: number} => {
    const {heights, layouts} = data();
    const k = lastArrived(t);
    const cards: CardState[] = [];
    for (let j = 0; j <= k; j++) {
      // Cards long since folded away (opacity 0 in every layout from here on) are skipped.
      if (layouts[k].slots[j].opacity === 0 && t - list[Math.min(k, j + MAX_VISIBLE + 3)].frame > 60) continue;
      const base = layouts[j].slots[j];
      let {y, scale, opacity} = base;
      for (let e = j + 1; e <= k; e++) {
        const s = cardSpring(t - list[e].frame);
        const a = layouts[e - 1].slots[j];
        const b = layouts[e].slots[j];
        y += (b.y - a.y) * s;
        scale += (b.scale - a.scale) * s;
        opacity += (b.opacity - a.opacity) * s;
      }
      if (opacity <= 0.002) continue;
      cards.push({
        notif: list[j],
        index: j,
        y,
        scale,
        opacity: Math.min(1, opacity),
        z: layouts[k].slots[j].z,
        height: heights[j],
        enter: cardSpring(t - list[j].frame),
      });
    }
    let groupBottom: number = LOCK.areaTop;
    if (k >= 0) {
      groupBottom = layouts[0].groupBottom;
      for (let e = 1; e <= k; e++) groupBottom += (layouts[e].groupBottom - layouts[e - 1].groupBottom) * cardSpring(t - list[e].frame);
    }
    return {cards, groupBottom, grouped: k >= 0 ? layouts[k].grouped : 0};
  };

  // "+N more": the real hidden count until counter.from, then the counter keyframes.
  const counterValue = (t: number) => {
    if (t < counter.from) return stackAt(t).grouped;
    const start = stackAt(counter.from).grouped;
    const frames = [counter.from, ...counter.keys.map(([f]) => f)];
    const values = [start, ...counter.keys.map(([, v]) => v)];
    return Math.floor(interpolate(t, frames, values, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  };

  // Frame at which the first card folds into the grouped stack.
  const firstGroupFrame = () => {
    const k = data().layouts.findIndex((l) => l.grouped > 0);
    return k < 0 ? Infinity : list[k].frame;
  };

  return {stackAt, counterValue, firstGroupFrame};
};

export type Stack = ReturnType<typeof makeStack>;
export const OPEN_STACK = makeStack(OPEN_RUN);
export const MAIN_STACK = makeStack(MAIN_RUN);

export const counterLabel = (v: number) => (v >= 99 ? '99+ more' : `+${v} more`);
