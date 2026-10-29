export type Pt = [number, number];

/** Smooth path through points (Catmull-Rom → cubic Bézier). `tension` 0 = straight segments. */
export const smoothPath = (pts: Pt[], tension = 0.5) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};

/** Map normalized points (x 0–1, y 0–1 top-down) into a box. */
export const toBox = (pts: Pt[], x: number, y: number, w: number, h: number): Pt[] => pts.map(([px, py]) => [x + px * w, y + py * h]);

/** Closed area under a path, for a soft gradient fill. */
export const areaPath = (pts: Pt[], baseY: number, tension = 0.5) =>
  `${smoothPath(pts, tension)} L${pts[pts.length - 1][0]},${baseY} L${pts[0][0]},${baseY} Z`;
