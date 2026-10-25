import React from 'react';
import {clamp01, lerp, Params} from './rig';

// Shared 3/4 head (facing +x). Head-local origin is the centre of the face; the
// character places it on the neck pivot. Features slide along the face with
// `turn` (0 ≈ toward the viewer, 1 = full 3/4 toward the monitor).
//
// In 3/4 the eye nearer the viewer is full width (left), the far eye is
// foreshortened beside the nose (right), and the visible ear is on the left.

export type Skin = {base: string; light: string; shade: string; deep: string; lip: string; lipDeep: string; blush: string};

export type HeadProps = {
  uid: string;
  variant: 'ray' | 'sam';
  turn: number;
  nod: number;
  gx: number;
  gy: number;
  ex: Params; // bIn bOut bAsym lid lower pupil curve skew
  lid: number; // final lid incl. blink
  open: number; // final mouth open incl. visemes
  width: number; // final mouth width multiplier
  skin: Skin;
  rim: string;
  glow: string;
  glowOpacity: number;
  iris: string;
  browColor: string;
  hairBack: React.ReactNode;
  hairFront: React.ReactNode;
  stubble?: boolean;
  darkCircles?: boolean;
  blush?: number;
  glasses?: {frame: string; hi: string};
  sweat?: number;
  frame: number;
};

const CONTOUR = {
  ray: 'M -58 -30 C -60 -80 -24 -104 12 -102 C 50 -100 74 -74 76 -36 C 77 -26 75 -18 78 -10 C 81 0 85 10 83 18 C 81 34 75 50 67 62 C 60 76 49 88 35 93 C 25 96 12 97 2 93 C -13 85 -31 72 -41 56 C -48 45 -52 32 -54 18 C -58 2 -58 -16 -58 -30 Z',
  sam: 'M -58 -30 C -60 -80 -24 -104 12 -102 C 50 -100 74 -74 76 -36 C 77 -26 75 -18 78 -10 C 81 0 84 10 82 20 C 80 38 72 56 60 70 C 50 82 38 92 24 95 C 14 97 4 95 -6 89 C -22 80 -36 68 -44 54 C -50 42 -53 30 -55 18 C -58 2 -58 -16 -58 -30 Z',
};
const JAW_SHADOW = {
  ray: 'M -54 18 C -50 40 -36 66 -14 82 C -2 90 10 95 22 94 C 6 96 -14 86 -30 72 C -42 60 -50 42 -54 18 Z',
  sam: 'M -55 18 C -50 42 -36 66 -16 80 C -4 88 8 94 18 95 C 2 95 -16 86 -32 72 C -44 60 -51 42 -55 18 Z',
};
const STUBBLE =
  'M -44 40 C -36 62 -18 80 2 90 C 14 96 28 94 40 88 C 54 80 64 68 70 56 C 66 50 60 50 56 54 C 50 66 40 72 30 72 C 22 72 16 68 10 68 C 0 68 -10 62 -20 52 C -30 44 -38 40 -44 40 Z';

// Tapered brow: thick at the inner end, thin at the outer end
const browPath = (ix: number, iy: number, ox: number, oy: number, thick: number, arch = 5) => {
  const mx = lerp(ix, ox, 0.45);
  const my = Math.min(iy, oy) - arch;
  return `M ${ix} ${iy + thick * 0.5} Q ${mx} ${my + thick * 0.6} ${ox} ${oy + 1} Q ${mx} ${my - thick * 0.55} ${ix} ${iy - thick * 0.5} Z`;
};

const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  lid: number;
  lower: number;
  gx: number;
  gy: number;
  pupil: number;
  iris: string;
  lidFill: string;
  crease: string;
  outerLeft: boolean;
}> = ({id, cx, cy, w, h, lid, lower, gx, gy, pupil, iris, lidFill, crease, outerLeft}) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  // slight tilt: outer corner a touch higher
  const lo = outerLeft ? -1.5 : 1;
  const ro = outerLeft ? 1 : -1.5;
  const almond = `M ${l} ${cy + lo} C ${l + w * 0.2} ${cy - h * 0.95} ${r - w * 0.25} ${cy - h * 0.95} ${r} ${cy + ro} C ${r - w * 0.25} ${cy + h * 0.7} ${l + w * 0.25} ${cy + h * 0.7} ${l} ${cy + lo} Z`;
  const L = clamp01(lid);
  const upY = lerp(cy - h * 0.95, cy + h * 0.75, L);
  const loY = lerp(cy + h * 0.72, cy + h * 0.05, clamp01(lower));
  const ir = h * 0.56;
  const ix = cx + gx * w * 0.2;
  const iy = cy - h * 0.02 + gy * h * 0.16;
  const lidEdge = `M ${l - 1} ${cy + lo} C ${l + w * 0.2} ${upY} ${r - w * 0.25} ${upY} ${r + 1} ${cy + ro}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={almond} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={l - 2} y={cy - h} width={w + 4} height={h * 2} fill="#F1ECE6" />
        <circle cx={ix} cy={iy} r={ir} fill={iris} />
        <circle cx={ix} cy={iy} r={ir * 0.72} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={ir * 0.2} />
        <circle cx={ix} cy={iy} r={ir * 0.46 * pupil} fill="#0B0708" />
        <circle cx={ix + ir * 0.32} cy={iy - ir * 0.36} r={ir * 0.24} fill="#fff" opacity={0.95} />
        <circle cx={ix - ir * 0.3} cy={iy + ir * 0.34} r={ir * 0.1} fill="#fff" opacity={0.6} />
        {/* lid cast shadow */}
        <path d={`${lidEdge} L ${r + 2} ${cy - h * 2} L ${l - 2} ${cy - h * 2} Z`} fill="rgba(40,20,20,0.22)" transform="translate(0 3)" />
        <path d={`${lidEdge} L ${r + 2} ${cy - h * 2} L ${l - 2} ${cy - h * 2} Z`} fill={lidFill} />
        <path d={`M ${l - 2} ${cy + lo} C ${l + w * 0.25} ${loY} ${r - w * 0.25} ${loY} ${r + 2} ${cy + ro} L ${r + 2} ${cy + h * 2} L ${l - 2} ${cy + h * 2} Z`} fill={lidFill} />
      </g>
      {/* lash line, heavier toward the outer corner, with a small flick */}
      <path d={lidEdge} fill="none" stroke="#1A1012" strokeWidth={2.8} strokeLinecap="round" />
      {/* crease follows the lid */}
      <path
        d={`M ${l + w * 0.1} ${cy - h * 0.55} C ${l + w * 0.3} ${lerp(cy - h * 1.35, cy - h * 0.6, L * 0.6)} ${r - w * 0.3} ${lerp(cy - h * 1.35, cy - h * 0.6, L * 0.6)} ${r - w * 0.05} ${cy - h * 0.5}`}
        fill="none"
        stroke={crease}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* lower lid hint */}
      <path d={`M ${l + w * 0.2} ${cy + h * 0.62} Q ${cx} ${loY + h * 0.08} ${r - w * 0.15} ${cy + h * 0.5}`} fill="none" stroke={crease} strokeWidth={1.2} opacity={0.35} />
    </g>
  );
};

const Mouth: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  open: number;
  curve: number;
  skew: number;
  lip: string;
  lipDeep: string;
}> = ({id, cx, cy, w, open, curve, skew, lip, lipDeep}) => {
  const lx = cx - w * 0.56;
  const rx = cx + w * 0.44;
  const cornerY = cy - curve * 7;
  const ly = cornerY + skew * 4;
  const ry = cornerY - skew * 4;
  const upY = cy + curve * 2.5 - open * 9;
  const loY = cy + curve * 6 + open * 34;
  const midX = lerp(lx, rx, 0.53);
  const isOpen = open > 0.05;
  const shape = `M ${lx} ${ly} C ${lerp(lx, midX, 0.5)} ${upY} ${lerp(midX, rx, 0.5)} ${upY} ${rx} ${ry} C ${lerp(midX, rx, 0.6)} ${loY} ${lerp(lx, midX, 0.4)} ${loY} ${lx} ${ly} Z`;
  const line = `M ${lx} ${ly} C ${lerp(lx, midX, 0.5)} ${cy + curve * 4} ${lerp(midX, rx, 0.5)} ${cy + curve * 4} ${rx} ${ry}`;
  const lowerTop = isOpen ? loY - 2 : cy + curve * 4 + 1;
  const lowerLip = `M ${lx + w * 0.16} ${lowerTop - 1} C ${lerp(lx, rx, 0.35)} ${lowerTop + 9} ${lerp(lx, rx, 0.7)} ${lowerTop + 9} ${rx - w * 0.12} ${lowerTop - 1} Z`;
  return (
    <g>
      {/* philtrum + upper-lip shadow */}
      <path d={`M ${midX - 3} ${cy - 16} Q ${midX} ${cy - 8} ${midX - 1} ${upY - 1}`} fill="none" stroke={lipDeep} strokeOpacity={0.18} strokeWidth={3} strokeLinecap="round" />
      <path d={lowerLip} fill={lip} opacity={0.55} />
      <path d={`M ${lerp(lx, rx, 0.38)} ${lowerTop + 4} q 6 2 12 0`} stroke="#fff" strokeOpacity={0.25} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {isOpen ? (
        <>
          <defs>
            <clipPath id={id}>
              <path d={shape} />
            </clipPath>
          </defs>
          <path d={shape} fill="#2A0E10" />
          <g clipPath={`url(#${id})`}>
            <rect x={lx} y={upY - 8} width={w} height={8 + open * 8} fill="#F4EEE6" />
            <ellipse cx={midX} cy={loY - 1} rx={w * 0.3} ry={4 + open * 8} fill="#B4464C" />
          </g>
          <path d={shape} fill="none" stroke={lipDeep} strokeWidth={2.2} strokeLinejoin="round" />
        </>
      ) : (
        <path d={line} fill="none" stroke={lipDeep} strokeWidth={2.8} strokeLinecap="round" />
      )}
      {/* corner tucks */}
      <path d={`M ${lx - 1} ${ly - 3} q -2 3 0 6`} fill="none" stroke={lipDeep} strokeOpacity={0.35} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
};

export const Head: React.FC<HeadProps> = (p) => {
  const {uid, variant, turn, nod, gx, gy, ex, skin, frame} = p;
  const cx = lerp(14, 42, turn);
  const eyeY = -4 + nod * 8;
  const nearX = cx - 28;
  const farX = cx + 15;
  const farW = lerp(26, 19, turn);
  const browY = eyeY - 20;
  const noseY = nod * 6;
  const noseX = lerp(cx - 2, farX + 12, turn);
  const mouthX = cx + 4;
  const mouthY = 57 + nod * 6;
  const earX = lerp(-50, -44, turn);
  const contour = CONTOUR[variant];
  const browThick = variant === 'ray' ? 10 : 6.5;
  const arch = variant === 'ray' ? 2 : 5;
  const eyeH = variant === 'ray' ? 13.5 : 15;
  const asym = ex.bAsym ?? 0;

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0%" stopColor={skin.shade} />
          <stop offset="38%" stopColor={skin.base} />
          <stop offset="100%" stopColor={skin.light} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="1" cy="0.45" r="0.45">
          <stop offset="0%" stopColor={p.glow} stopOpacity={p.glowOpacity} />
          <stop offset="100%" stopColor={p.glow} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${uid}-faceclip`}>
          <path d={contour} />
        </clipPath>
      </defs>

      {p.hairBack}

      {/* rim pass, then the face */}
      <path d={contour} fill={p.rim} transform="translate(-3.5 -1)" />
      <path d={contour} fill={`url(#${uid}-face)`} />

      <g clipPath={`url(#${uid}-faceclip)`}>
        {/* temple + jaw shading */}
        <path d={JAW_SHADOW[variant]} fill={skin.deep} opacity={0.3} style={{filter: 'blur(3px)'}} />
        <ellipse cx={-44} cy={0} rx={20} ry={44} fill={skin.deep} opacity={0.16} style={{filter: 'blur(5px)'}} />
        {/* blush */}
        <ellipse cx={nearX + 2} cy={eyeY + 30} rx={15} ry={8} fill={skin.blush} opacity={(p.blush ?? 1) * (0.18 + clamp01(ex.lower) * 0.12)} />
        <ellipse cx={farX + 6} cy={eyeY + 30} rx={8} ry={6} fill={skin.blush} opacity={(p.blush ?? 1) * 0.14} />
        {p.stubble && <path d={STUBBLE} fill="#46405A" opacity={0.15} style={{filter: 'blur(3px)'}} />}
        {p.stubble && <path d={`M ${mouthX - 22} ${mouthY - 9} C ${mouthX - 8} ${mouthY - 16} ${mouthX + 10} ${mouthY - 16} ${mouthX + 20} ${mouthY - 8}`} fill="none" stroke="#46405A" strokeOpacity={0.14} strokeWidth={7} strokeLinecap="round" style={{filter: 'blur(2px)'}} />}
        {/* monitor spill on the near-screen side */}
        <rect x={-60} y={-110} width={150} height={210} fill={`url(#${uid}-glow)`} />
      </g>

      {/* ear */}
      <g>
        <path d={`M ${earX + 6} ${-10} C ${earX - 10} ${-18} ${earX - 18} ${0} ${earX - 14} ${16} C ${earX - 12} ${30} ${earX - 2} ${36} ${earX + 6} ${30} Z`} fill={skin.shade} />
        <path d={`M ${earX + 6} ${-10} C ${earX - 10} ${-18} ${earX - 18} ${0} ${earX - 14} ${16}`} fill="none" stroke={p.rim} strokeWidth={2} opacity={0.8} transform="translate(-1.5 0)" />
        <path d={`M ${earX + 1} ${-4} C ${earX - 9} ${-6} ${earX - 11} ${8} ${earX - 7} ${16} C ${earX - 4} ${22} ${earX} ${22} ${earX + 2} ${18}`} fill="none" stroke={skin.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
      </g>

      {/* dark circles */}
      {p.darkCircles && (
        <>
          <path d={`M ${nearX - 13} ${eyeY + 8} C ${nearX - 4} ${eyeY + 17} ${nearX + 8} ${eyeY + 17} ${nearX + 15} ${eyeY + 8}`} fill="none" stroke="#5E4466" strokeOpacity={0.24} strokeWidth={5} strokeLinecap="round" style={{filter: 'blur(1.5px)'}} />
          <path d={`M ${farX - 9} ${eyeY + 8} C ${farX - 3} ${eyeY + 14} ${farX + 5} ${eyeY + 14} ${farX + 9} ${eyeY + 8}`} fill="none" stroke="#5E4466" strokeOpacity={0.2} strokeWidth={4} strokeLinecap="round" style={{filter: 'blur(1.5px)'}} />
        </>
      )}

      <Eye id={`${uid}-eyeN`} cx={nearX} cy={eyeY} w={30} h={eyeH} lid={p.lid} lower={ex.lower} gx={gx} gy={gy} pupil={ex.pupil} iris={p.iris} lidFill={skin.base} crease={skin.deep} outerLeft />
      <Eye id={`${uid}-eyeF`} cx={farX} cy={eyeY} w={farW} h={eyeH - 1} lid={p.lid} lower={ex.lower} gx={gx} gy={gy} pupil={ex.pupil} iris={p.iris} lidFill={skin.light} crease={skin.deep} outerLeft={false} />

      {/* brows: near brow inner end is on the right, far brow inner end on the left */}
      <path d={browPath(nearX + 14, browY - ex.bIn - asym, nearX - 17, browY - ex.bOut - asym + 2, browThick, arch)} fill={p.browColor} />
      <path d={browPath(farX - 7, browY - ex.bIn + asym * 0.6, farX + farW * 0.6, browY - ex.bOut + asym * 0.6 + 2, browThick * 0.85, arch)} fill={p.browColor} />

      {/* nose: tip sits between the eyes when facing us, past the far eye in full 3/4 */}
      <ellipse cx={noseX - 9} cy={noseY + 30} rx={10} ry={3} fill={skin.deep} opacity={0.2} style={{filter: 'blur(1.5px)'}} />
      <path
        d={`M ${noseX - 5} ${noseY + 12} Q ${noseX + 3} ${noseY + 21} ${noseX - 3} ${noseY + 26} Q ${noseX - 8} ${noseY + 29} ${noseX - 15} ${noseY + 26}`}
        fill="none"
        stroke={skin.deep}
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={0.55}
      />
      <ellipse cx={noseX - 3} cy={noseY + 19} rx={3} ry={2.2} fill="#fff" opacity={0.22} />

      <Mouth id={`${uid}-mouth`} cx={mouthX} cy={mouthY} w={40 * p.width} open={p.open} curve={ex.curve} skew={ex.skew} lip={skin.lip} lipDeep={skin.lipDeep} />

      {p.glasses && (
        <g fill="none" stroke={p.glasses.frame} strokeWidth={2.4}>
          <circle cx={nearX + 1} cy={eyeY + 1} r={19} fill="#fff" fillOpacity={0.05} />
          <ellipse cx={farX + 1} cy={eyeY + 1} rx={lerp(17, 13, turn)} ry={18} fill="#fff" fillOpacity={0.05} />
          <path d={`M ${nearX + 20} ${eyeY - 3} Q ${(nearX + farX) / 2 + 1} ${eyeY - 8} ${farX + 1 - lerp(17, 13, turn)} ${eyeY - 3}`} />
          <path d={`M ${nearX - 18} ${eyeY - 4} L ${earX + 2} ${eyeY - 1}`} />
          <path d={`M ${nearX - 8} ${eyeY - 14} A 16 16 0 0 1 ${nearX + 12} ${eyeY - 10}`} stroke={p.glasses.hi} strokeOpacity={0.6} strokeWidth={1.4} />
          <path d={`M ${farX - 4} ${eyeY - 13} A 12 14 0 0 1 ${farX + 8} ${eyeY - 9}`} stroke={p.glasses.hi} strokeOpacity={0.5} strokeWidth={1.2} />
        </g>
      )}

      {p.sweat !== undefined && p.sweat > 0.05 && (
        <path
          d={`M -30 ${-44 + ((frame % 50) / 50) * 30} c 4 6 6 10 0 12 c -6 -2 -4 -6 0 -12 Z`}
          fill="#CFE2F5"
          opacity={p.sweat * 0.85 * (1 - (frame % 50) / 60)}
        />
      )}

      {p.hairFront}
    </g>
  );
};
