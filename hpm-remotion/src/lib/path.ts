export type Point = readonly [number, number];

// Smooth cubic path through every point (uniform Catmull-Rom → Bezier).
// The same number of points always yields the same number of segments,
// so two shapes can be morphed point by point.
export const smoothPath = (pts: readonly Point[], tension = 1) => {
  if (pts.length < 2) return '';
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M ${p(0)[0].toFixed(2)} ${p(0)[1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1x = x1 + ((x2 - x0) / 6) * tension;
    const c1y = y1 + ((y2 - y0) / 6) * tension;
    const c2x = x2 - ((x3 - x1) / 6) * tension;
    const c2y = y2 - ((y3 - y1) / 6) * tension;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  return d;
};

export const lerpPoints = (a: readonly Point[], b: readonly Point[], t: number): Point[] =>
  a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t] as const);

export const translatePoints = (pts: readonly Point[], dx: number, dy: number): Point[] =>
  pts.map(([x, y]) => [x + dx, y + dy] as const);
