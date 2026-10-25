import React from 'react';
import {lerp} from './rig';

// ── Eye ───────────────────────────────────────────────────────────────────
// Almond eye with an upper lid that closes along a curve, a lower lid that
// squints up, and a pupil that follows gaze (-1..1).
export const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  lid: number; // 0 open → 1 shut
  lower: number; // 0 → 1 squint
  gazeX: number;
  gazeY: number;
  pupil: number;
  iris: string;
  lidFill: string;
  sclera?: string;
  lash?: string;
}> = ({id, cx, cy, w, h, lid, lower, gazeX, gazeY, pupil, iris, lidFill, sclera = '#ECE6DF', lash = '#1A1214'}) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const almond = `M ${l} ${cy} Q ${cx} ${cy - h} ${r} ${cy} Q ${cx} ${cy + h * 0.8} ${l} ${cy} Z`;
  const lidC = Math.max(0, Math.min(1, lid));
  const upY = lerp(cy - h * 1.02, cy + h * 0.82, lidC);
  const loY = lerp(cy + h * 0.82, cy + h * 0.05, Math.max(0, Math.min(1, lower)));
  const ir = h * 0.5;
  const ix = cx + gazeX * w * 0.2;
  const iy = cy - h * 0.06 + gazeY * h * 0.18;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={almond} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={l - 2} y={cy - h} width={w + 4} height={h * 2} fill={sclera} />
        <circle cx={ix} cy={iy} r={ir} fill={iris} />
        <circle cx={ix} cy={iy} r={ir * 0.5 * pupil} fill="#0B0708" />
        <circle cx={ix + ir * 0.35} cy={iy - ir * 0.38} r={ir * 0.22} fill="#fff" opacity={0.9} />
        {/* lid shadow on the eyeball */}
        <path d={`M ${l} ${cy} Q ${cx} ${upY + 4} ${r} ${cy} L ${r} ${cy - h * 2} L ${l} ${cy - h * 2} Z`} fill="rgba(0,0,0,0.18)" />
        <path d={`M ${l - 2} ${cy} Q ${cx} ${upY} ${r + 2} ${cy} L ${r + 2} ${cy - h * 2} L ${l - 2} ${cy - h * 2} Z`} fill={lidFill} />
        <path d={`M ${l - 2} ${cy} Q ${cx} ${loY} ${r + 2} ${cy} L ${r + 2} ${cy + h * 2} L ${l - 2} ${cy + h * 2} Z`} fill={lidFill} />
      </g>
      <path d={`M ${l - 1} ${cy + 0.5} Q ${cx} ${upY} ${r + 1} ${cy - 0.5}`} fill="none" stroke={lash} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
};

// ── Brow ──────────────────────────────────────────────────────────────────
export const Brow: React.FC<{
  ix: number; // inner end
  ox: number; // outer end
  y: number;
  inner: number; // raise in px (+ up)
  outer: number;
  color: string;
  width?: number;
}> = ({ix, ox, y, inner, outer, color, width = 6}) => {
  const iy = y - inner;
  const oy = y - outer;
  const mx = (ix + ox) / 2;
  const my = Math.min(iy, oy) - 4;
  return (
    <path
      d={`M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
};

// ── Mouth ─────────────────────────────────────────────────────────────────
export const Mouth: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  open: number; // 0..1.2
  curve: number; // -1 frown → 1 smile
  skew: number; // asymmetric corners
  lip: string;
  inner?: string;
}> = ({id, cx, cy, w, open, curve, skew, lip, inner = '#2A0E10'}) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const cornerY = cy - curve * 6;
  const ly = cornerY + skew * 4;
  const ry = cornerY - skew * 4;
  const upY = cy + curve * 3 - open * 7;
  const loY = cy + curve * 7 + open * 30;
  const shape = `M ${l} ${ly} Q ${cx} ${upY} ${r} ${ry} Q ${cx} ${loY} ${l} ${ly} Z`;
  const clipId = id;
  return (
    <g>
      {open > 0.04 ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <path d={shape} />
            </clipPath>
          </defs>
          <path d={shape} fill={inner} />
          <g clipPath={`url(#${clipId})`}>
            <rect x={l} y={upY - 6} width={w} height={6 + open * 7} fill="#F2ECE4" opacity={0.92} />
            <ellipse cx={cx} cy={loY - 2} rx={w * 0.32} ry={open * 9} fill="#B34B4E" opacity={0.85} />
          </g>
          <path d={shape} fill="none" stroke={lip} strokeWidth={2.2} strokeLinejoin="round" />
        </>
      ) : (
        <path d={`M ${l} ${ly} Q ${cx} ${(upY + loY) / 2} ${r} ${ry}`} fill="none" stroke={lip} strokeWidth={3.2} strokeLinecap="round" />
      )}
      {/* lower lip hint */}
      <path
        d={`M ${cx - w * 0.22} ${(open > 0.04 ? loY * 0.5 + cy * 0.5 + open * 6 : cy + curve * 4) + 6} Q ${cx} ${(open > 0.04 ? loY * 0.5 + cy * 0.5 + open * 6 : cy + curve * 4) + 9} ${cx + w * 0.22} ${(open > 0.04 ? loY * 0.5 + cy * 0.5 + open * 6 : cy + curve * 4) + 6}`}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
};

// ── Limb ──────────────────────────────────────────────────────────────────
// A sleeve from shoulder → elbow → wrist, with a rim pass and a sheen pass
export const Limb: React.FC<{
  s: [number, number];
  e: [number, number];
  h: [number, number];
  upper: number;
  fore: number;
  fill: string;
  shade: string;
  rim: string;
  rimDx: number;
  sheen?: string;
  cuff?: string;
}> = ({s, e, h, upper, fore, fill, shade, rim, rimDx, sheen, cuff}) => {
  const up = `M ${s[0]} ${s[1]} L ${e[0]} ${e[1]}`;
  const lo = `M ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`;
  // shorten the forearm so the cuff ends just before the wrist
  const fx = h[0] - (h[0] - e[0]) * 0.08;
  const fy = h[1] - (h[1] - e[1]) * 0.08;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <g transform={`translate(${rimDx} -2)`} stroke={rim}>
        <path d={up} strokeWidth={upper + 3} />
        <path d={`M ${e[0]} ${e[1]} L ${fx} ${fy}`} strokeWidth={fore + 3} />
      </g>
      <path d={up} stroke={shade} strokeWidth={upper} />
      <path d={`M ${e[0]} ${e[1]} L ${fx} ${fy}`} stroke={shade} strokeWidth={fore} />
      <g transform="translate(3 -2)">
        <path d={up} stroke={fill} strokeWidth={upper - 12} />
        <path d={`M ${e[0]} ${e[1]} L ${fx} ${fy}`} stroke={fill} strokeWidth={fore - 12} />
      </g>
      {sheen && (
        <g transform="translate(7 -4)" opacity={0.55}>
          <path d={up} stroke={sheen} strokeWidth={4} />
          <path d={`M ${e[0]} ${e[1]} L ${fx} ${fy}`} stroke={sheen} strokeWidth={3} />
        </g>
      )}
      {cuff && <path d={`M ${fx - (fx - e[0]) * 0.1} ${fy - (fy - e[1]) * 0.1} L ${fx} ${fy}`} stroke={cuff} strokeWidth={fore + 1} />}
    </g>
  );
};

// ── Hand ──────────────────────────────────────────────────────────────────
// Drawn in wrist space: wrist at (0,0), fingers along +x.
export type HandShape = 'flat' | 'fist' | 'point' | 'grip' | 'claw' | 'pen';

export const Hand: React.FC<{
  x: number;
  y: number;
  angle: number; // degrees
  shape: HandShape;
  skin: string;
  shade: string;
  rim: string;
  rimDx: number;
  flipY?: boolean;
  size?: number;
}> = ({x, y, angle, shape, skin, shade, rim, rimDx, flipY, size = 1.35}) => {
  const paths: Record<HandShape, string> = {
    flat: 'M -2 -12 C 10 -17 30 -16 40 -10 C 46 -6 46 4 40 8 C 30 13 12 15 0 11 C -6 6 -6 -8 -2 -12 Z',
    fist: 'M -2 -13 C 10 -18 26 -16 30 -8 C 34 0 32 10 24 14 C 14 18 2 16 -2 10 C -6 4 -6 -8 -2 -13 Z',
    point: 'M -2 -13 C 8 -17 22 -16 26 -11 L 46 -12 C 52 -12 52 -5 46 -5 L 28 -3 C 32 4 28 12 20 14 C 10 17 0 15 -3 9 C -6 3 -6 -8 -2 -13 Z',
    grip: 'M -2 -13 C 10 -18 24 -17 30 -11 C 34 -6 26 -3 22 -2 C 30 0 32 8 26 13 C 16 18 2 16 -2 10 C -6 4 -6 -8 -2 -13 Z',
    claw: 'M -2 -12 C 6 -18 18 -22 30 -24 C 36 -25 37 -19 32 -17 L 22 -12 C 34 -14 44 -12 46 -7 C 47 -3 42 -2 36 -3 L 26 -2 C 36 2 40 8 36 12 C 30 16 14 16 2 12 C -6 8 -6 -6 -2 -12 Z',
    pen: 'M -2 -13 C 10 -18 26 -16 30 -9 C 33 -3 32 8 24 13 C 14 18 2 16 -2 10 C -6 4 -6 -8 -2 -13 Z',
  };
  const d = paths[shape];
  const knuckles = shape === 'fist' || shape === 'grip' || shape === 'pen' || shape === 'point';
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size} ${flipY ? -size : size})`}>
      <path d={d} fill={rim} transform={`translate(${rimDx * 0.6} -1.5)`} />
      <path d={d} fill={shade} />
      <path d={d} fill={skin} transform="translate(1.5 -2) scale(0.92)" />
      {knuckles && (
        <path d="M 22 -10 C 26 -4 26 4 22 10" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={1.6} strokeLinecap="round" />
      )}
      {shape === 'flat' && (
        <path d="M 28 -6 L 40 -6 M 28 0 L 42 0 M 28 6 L 39 6" stroke="rgba(0,0,0,0.18)" strokeWidth={1.4} strokeLinecap="round" />
      )}
      {shape === 'pen' && (
        <g>
          <path d="M 8 -2 L 58 -26" stroke="#1E1E24" strokeWidth={5} strokeLinecap="round" />
          <path d="M 8 -2 L 16 -6" stroke="#D4A24C" strokeWidth={5} strokeLinecap="round" />
          <path d="M 4 0 L 8 -2" stroke="#111" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// Soft radial light pool used for monitor spill on faces and desks
export const Glow: React.FC<{id: string; cx: number; cy: number; r: number; color: string; opacity: number}> = ({
  id,
  cx,
  cy,
  r,
  color,
  opacity,
}) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={opacity} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </g>
);

// 3/4 nose: tip at (x, y + 24), bridge from (x - 12, y)
export const Nose: React.FC<{x: number; y: number; skin: string; shade: string; deep: string}> = ({x, y, skin, shade, deep}) => (
  <g>
    <path d={`M ${x - 12} ${y} C ${x - 2} ${y + 10} ${x + 9} ${y + 17} ${x + 9} ${y + 24} C ${x + 9} ${y + 30} ${x - 2} ${y + 31} ${x - 11} ${y + 28} C ${x - 8} ${y + 18} ${x - 10} ${y + 8} ${x - 12} ${y} Z`} fill={skin} />
    <path d={`M ${x - 11} ${y + 28} C ${x - 4} ${y + 31} ${x + 6} ${y + 30} ${x + 9} ${y + 24} C ${x + 4} ${y + 27} ${x - 4} ${y + 27} ${x - 11} ${y + 25} Z`} fill={shade} opacity={0.55} />
    <path d={`M ${x - 12} ${y} C ${x - 2} ${y + 10} ${x + 8} ${y + 17} ${x + 8} ${y + 23}`} fill="none" stroke={deep} strokeWidth={1.8} strokeLinecap="round" opacity={0.45} />
    <ellipse cx={x - 3} cy={y + 27} rx={3.2} ry={1.6} fill={deep} opacity={0.7} />
  </g>
);
