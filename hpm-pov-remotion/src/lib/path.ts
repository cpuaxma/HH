export type Point = readonly [number, number];

// Uniform Catmull-Rom → cubic Bezier control points for every segment.
const segments = (pts: readonly Point[], tension = 1) => {
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out: [Point, Point, Point, Point][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    out.push([
      [x1, y1],
      [x1 + ((x2 - x0) / 6) * tension, y1 + ((y2 - y0) / 6) * tension],
      [x2 - ((x3 - x1) / 6) * tension, y2 - ((y3 - y1) / 6) * tension],
      [x2, y2],
    ]);
  }
  return out;
};

// Smooth cubic path through every point.
export const smoothPath = (pts: readonly Point[], tension = 1) => {
  if (pts.length < 2) return '';
  const f = (n: number) => n.toFixed(2);
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (const [, c1, c2, e] of segments(pts, tension)) {
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`;
  }
  return d;
};

// Dense samples along the same smooth curve. The brush mask and the drawn line
// are both built from these, so the reveal edge sits exactly under the line.
export const sampleSmooth = (pts: readonly Point[], perSegment = 14, tension = 1): Point[] => {
  if (pts.length < 2) return [...pts];
  const out: Point[] = [pts[0]];
  for (const [a, b, c, d] of segments(pts, tension)) {
    for (let k = 1; k <= perSegment; k++) {
      const t = k / perSegment;
      const u = 1 - t;
      const w0 = u * u * u;
      const w1 = 3 * u * u * t;
      const w2 = 3 * u * t * t;
      const w3 = t * t * t;
      out.push([
        w0 * a[0] + w1 * b[0] + w2 * c[0] + w3 * d[0],
        w0 * a[1] + w1 * b[1] + w2 * c[1] + w3 * d[1],
      ]);
    }
  }
  return out;
};

export const polylinePath = (pts: readonly Point[]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

export const lerpPoints = (a: readonly Point[], b: readonly Point[], t: number): Point[] =>
  a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t] as const);

export const toPolygon = (pts: readonly Point[]) =>
  `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;
