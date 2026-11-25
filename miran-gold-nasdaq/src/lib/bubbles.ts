import {random} from 'remotion';
import {LAYOUT, TEXT} from '../config';

export type Company = {
  /** Position in the 10×10 grid (scene 2), filled in reading order: top row first, right → left. */
  gridX: number;
  gridY: number;
  /** Packed bubble (scene 3). */
  x: number;
  y: number;
  r: number;
  giant: boolean;
  /** Small per-item delay so the morph feels organic. */
  jitter: number;
};

const COUNT = TEXT.whatIs.counterTo;

/**
 * Deterministic circle packing: giants first from the center outward, then the small bubbles
 * fill the gaps along an elliptical spiral. Pure function of the config, computed once.
 */
const pack = () => {
  const b = LAYOUT.bubbles;
  const giants = b.giantRadii;
  const smallCount = COUNT - giants.length;
  const radii: {r: number; giant: boolean}[] = [
    ...giants.map((r) => ({r, giant: true})),
    ...Array.from({length: smallCount}, (_, i) => ({
      r: b.smallMin + random(`small-r-${i}`) * (b.smallMax - b.smallMin),
      giant: false,
    })).sort((p, q) => q.r - p.r),
  ];

  const placed: {x: number; y: number; r: number; giant: boolean}[] = [];
  const aspect = (b.maxX - b.minX) / (b.maxY - b.minY);
  const fits = (x: number, y: number, r: number) =>
    x - r >= b.minX &&
    x + r <= b.maxX &&
    y - r >= b.minY &&
    y + r <= b.maxY &&
    placed.every((p) => Math.hypot(p.x - x, p.y - y) >= p.r + r + b.gap);

  radii.forEach(({r, giant}, i) => {
    const turn = random(`turn-${i}`) * Math.PI * 2;
    for (let t = 0; t < 4000; t += 0.12) {
      const rad = t * 2.2;
      const x = b.centerX + Math.cos(t + turn) * rad * Math.sqrt(aspect);
      const y = b.centerY + Math.sin(t + turn) * rad / Math.sqrt(aspect);
      if (fits(x, y, r)) {
        placed.push({x, y, r, giant});
        return;
      }
      if (rad > 900) break;
    }
    // Fallback (should not happen with the default config): tuck a tiny bubble at the edge.
    placed.push({x: b.minX + 8, y: b.maxY - 8, r: 6, giant});
  });
  return placed;
};

const buildCompanies = (): Company[] => {
  const g = LAYOUT.grid;
  const bubbles = pack();
  // Shuffle which grid dot becomes which bubble (seeded), so giants emerge from scattered dots.
  const order = bubbles.map((_, i) => i).sort((a, c) => random(`ord-${a}`) - random(`ord-${c}`));
  return Array.from({length: COUNT}, (_, i) => {
    const row = Math.floor(i / g.cols);
    const col = i % g.cols;
    const bubble = bubbles[order[i]];
    return {
      gridX: g.centerX + ((g.cols - 1) / 2 - col) * g.gap,
      gridY: g.centerY + (row - (g.rows - 1) / 2) * g.gap,
      x: bubble.x,
      y: bubble.y,
      r: bubble.r,
      giant: bubble.giant,
      jitter: random(`jit-${i}`),
    };
  });
};

export const COMPANIES = buildCompanies();
