/**
 * Monotone cubic (Fritsch–Carlson) interpolation through keyframes.
 * C1-continuous (no velocity jumps between camera moves) and never overshoots a key.
 */
export type Key = {f: number; v: number};

export const monotone = (keys: Key[]) => {
  const n = keys.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1].v - keys[i].v) / (keys[i + 1].f - keys[i].f));
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  m[0] = 0; // ease in from rest
  m[n - 1] = 0;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (f: number) => {
    if (f <= keys[0].f) return keys[0].v;
    if (f >= keys[n - 1].f) return keys[n - 1].v;
    let i = 0;
    while (f > keys[i + 1].f) i++;
    const h = keys[i + 1].f - keys[i].f;
    const t = (f - keys[i].f) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * keys[i].v + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * keys[i + 1].v + (t3 - t2) * h * m[i + 1]
    );
  };
};
