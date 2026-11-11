import {CHILI_END, END_CAM, IMPACT_WORLD} from '../timeline';
import {V3, v3} from './math';

/**
 * The single continuous camera move. Keys are positions, look-at targets and focus
 * points in world space; between keys they are joined with C1-continuous cubic Hermite
 * curves (finite-difference tangents), so the camera never stops or jerks except
 * where a key is marked `stop` (zero velocity there: an eased stop or start).
 */
type Key = {t: number; p: V3; l: V3; f?: V3; bokeh?: number; stop?: boolean};

const deg = Math.PI / 180;
const ORBIT_CENTER: V3 = [0, 0.8, 0];
const orbit = (t: number, a: number, r: number, h: number, bokeh = 2.4): Key => ({
  t,
  p: [r * Math.sin(a * deg), h, r * Math.cos(a * deg)],
  l: ORBIT_CENTER,
  bokeh,
});

export const END_LOOK: V3 = [CHILI_END[0], CHILI_END[1] - 2.7, CHILI_END[2]];

const KEYS: Key[] = [
  // Scene 1: slow orbit, drifting closer as the notes burn.
  orbit(0.0, -36, 49.3, 2.2),
  orbit(0.6, -28.5, 46.6, 2.6),
  orbit(1.2, -21, 43.9, 3.0),
  orbit(1.8, -13.5, 41.0, 3.4),
  orbit(2.4, -6.5, 38.1, 3.8),
  orbit(3.0, -0.5, 35.4, 4.2),
  // Scene 2: almost still while the ash hangs and the chili falls.
  {...orbit(3.5, 3.5, 33.2, 4.6), l: [0.2, 1.8, 0], f: [0.3, 2.2, 0.4]},
  {...orbit(3.95, 6.5, 30.7, 5.0), l: [0.3, 2.6, 0], f: [0.4, 2.6, 0.5]},
  // The push: forward over the top edge of the phone, through the ring.
  {t: 4.45, p: [2.5, 8.3, 10.6], l: [0, 4.8, -12], f: [0, 6.5, -2], bokeh: 3.2},
  {t: 4.82, p: [2.1, 11.4, 0.4], l: [0, 7.4, -40], f: [0, 8, -26], bokeh: 2.6},
  // Scene 3: alongside the funnel, then down with the flow.
  {t: 5.22, p: [3.8, 14.6, -16.5], l: [0, 8.2, -70], f: [0, 9, -68], bokeh: 2.2},
  {t: 5.75, p: [9.0, 19.5, -30], l: [0, 5.6, -70], f: [0, 7, -68], bokeh: 2.0},
  {t: 6.3, p: [11.4, 16.4, -40.5], l: [0, 5.0, -70], f: [0, 7, -68], bokeh: 2.2},
  {t: 6.85, p: [11.8, 9.6, -47], l: [0, 1.8, -70], f: [0, 2.5, -68.5], bokeh: 2.4},
  {t: 7.4, p: [10.5, 2.6, -53], l: [0, -4.4, -70], f: [0, -4.4, -68.8], bokeh: 2.5},
  {t: 7.95, p: [11.0, -5.2, -54.6], l: [0, -11.4, -70], f: [0, -11.4, -69], bokeh: 2.6},
  {t: 8.5, p: [11.6, -11.6, -53.8], l: [0, -16.8, -70], f: [0, -17.5, -69.3], bokeh: 2.6},
  {t: 9.05, p: [12.1, -14.1, -53.3], l: [0, -18.8, -70], f: [0, -18.8, -69.6], bokeh: 2.7},
  // Scene 4: tilt up and turn away from the coins into empty space; then hold.
  {t: 9.6, p: [12.2, -14.5, -53.2], l: [7.0, -16.8, -73.5], f: [14, -13.5, -74], bokeh: 2.7},
  {t: 10.05, p: END_CAM, l: END_LOOK, f: CHILI_END, bokeh: 2.6, stop: true},
  {t: 12.0, p: END_CAM, l: END_LOOK, f: CHILI_END, bokeh: 2.6, stop: true},
];

const hermite = (k: Key[], i: number, get: (k: Key) => V3, t: number): V3 => {
  const a = k[i];
  const b = k[i + 1];
  const dt = b.t - a.t;
  const tangent = (j: number): V3 => {
    const kj = k[j];
    if (kj.stop || j === k.length - 1) return [0, 0, 0];
    if (j === 0) return v3.scale(v3.sub(get(k[1]), get(k[0])), 1 / (k[1].t - k[0].t));
    const d0 = v3.scale(v3.sub(get(kj), get(k[j - 1])), 1 / (kj.t - k[j - 1].t));
    const d1 = v3.scale(v3.sub(get(k[j + 1]), get(kj)), 1 / (k[j + 1].t - kj.t));
    return v3.scale(v3.add(d0, d1), 0.5);
  };
  const m0 = v3.scale(tangent(i), dt);
  const m1 = v3.scale(tangent(i + 1), dt);
  const s = (t - a.t) / dt;
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;
  const pa = get(a);
  const pb = get(b);
  return [0, 1, 2].map((c) => h00 * pa[c] + h10 * m0[c] + h01 * pb[c] + h11 * m1[c]) as V3;
};

export type CameraState = {position: V3; look: V3; focus: V3; bokeh: number};

export const cameraAt = (t: number): CameraState => {
  const k = KEYS;
  const tt = Math.min(k[k.length - 1].t, Math.max(k[0].t, t));
  let i = 0;
  while (i < k.length - 2 && tt > k[i + 1].t) i++;
  const s = (tt - k[i].t) / (k[i + 1].t - k[i].t);
  const ss = s * s * (3 - 2 * s);
  return {
    position: hermite(k, i, (x) => x.p, tt),
    look: hermite(k, i, (x) => x.l, tt),
    focus: hermite(k, i, (x) => x.f ?? x.l, tt),
    bokeh: (k[i].bokeh ?? 2.4) + ((k[i + 1].bokeh ?? 2.4) - (k[i].bokeh ?? 2.4)) * ss,
  };
};

/** Where the camera starts (used by the impact light etc.). */
export const IMPACT = IMPACT_WORLD;
