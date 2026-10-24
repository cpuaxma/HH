import React from 'react';
import {random} from 'remotion';
import {mix, pop, progress} from '../lib/anim';
import {handCross} from '../lib/path';
import {C, EASE_IN, EASE_IN_OUT, EASE_OUT} from '../theme';
import {AfterTile, BeforeTile, GAP, TILE} from './Tiles';

export type GridState = 'before' | 'after';

// Crooked BEFORE layout: per-tile tilt (deg) and nudge (px).
const CROOK = [-2.4, 1.6, -1.1, 2.8, -1.8, 1.1, 2.3, -1.4, 1.7];
const NUDGE: [number, number][] = [[-6, 4], [5, -3], [-2, 7], [7, 2], [-5, -6], [3, 5], [-7, -2], [4, 6], [-3, -5]];

// Scatter timeline (frames since scatter start). Tiles fly out, flip edge-on at SWAP, fly back, snap at SNAP_AT.
export const SNAP_AT = 60;
const SWAP = 30; // flip lands on the beat after the scatter starts
const STAGGER = [-4, 2, -1, 4, 0, -3, 3, -2, 1];

export type Mark = {tile: number; t: number}; // t = frames since the ✗ started

export const Grid: React.FC<{state: GridState; scatterT?: number; marks?: Mark[]; reelT?: number}> = ({state, scatterT, marks = [], reelT}) => {
  const s = scatterT ?? -1;
  const scattering = s >= 0 && s < SNAP_AT + 1;
  const out = scattering ? progress(s, 0, 22, EASE_OUT) : 0;
  const back = scattering ? progress(s, 42, SNAP_AT - 42, EASE_IN) : 0;
  const p = out * (1 - back);
  const tilt = 16 * p;
  // Each tile flips edge-on (and swaps to its AFTER design) around SWAP, staggered by a few frames.
  const flipOf = (i: number) => (scattering ? progress(s, 14 + STAGGER[i], 2 * (SWAP - 14), EASE_IN_OUT) : s >= SNAP_AT ? 1 : 0);

  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1500, perspectiveOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg)`}}>
        {Array.from({length: 9}, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const dx = col - 1 + (i === 4 ? 0.3 : 0);
          const dy = row - 1 + (i === 4 ? -0.6 : 0);
          const len = Math.hypot(dx, dy) || 1;
          const dist = 150 + random(`gd${i}`) * 170;
          const tz = 140 + random(`gz${i}`) * 360;
          const spinX = (random(`gx${i}`) * 2 - 1) * 50;
          const spinZ = (random(`gr${i}`) * 2 - 1) * 70;
          const flip = flipOf(i);
          const showAfter = scattering ? flip >= 0.5 : state === 'after';
          const flipY = scattering ? (flip < 0.5 ? 180 * flip : 180 * flip - 180) : 0;
          const crookK = showAfter ? 0 : 1;
          const tx = (dx / len) * dist * p + NUDGE[i][0] * crookK;
          const ty = (dy / len) * dist * p + NUDGE[i][1] * crookK;
          const rz = CROOK[i] * crookK + spinZ * p;
          const mark = marks.find((m) => m.tile === i);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: col * (TILE + GAP),
                top: row * (TILE + GAP),
                width: TILE,
                height: TILE,
                transform: `translate3d(${tx}px, ${ty}px, ${tz * p}px) rotateX(${spinX * p}deg) rotateY(${flipY}deg) rotateZ(${rz}deg)`,
                boxShadow: p > 0.02 ? `0 ${30 * p}px ${60 * p}px rgba(15,15,15,${0.35 * p})` : undefined,
                overflow: 'hidden',
                filter: showAfter ? undefined : 'saturate(0.38) contrast(0.92) brightness(1.02)',
              }}
            >
              {showAfter ? <AfterTile i={i} reelT={reelT} /> : <BeforeTile i={i} reelT={reelT} />}
              {mark && !showAfter && mark.t >= 0 && <CrossMark t={mark.t} seed={`m${i}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Red ✗: pops in with the overlay spring, both strokes draw on.
const CrossMark: React.FC<{t: number; seed: string}> = ({t, seed}) => {
  const sc = pop(t, 0);
  const [a, b] = handCross(64, 64, 230, seed);
  const d1 = progress(t, 0, 5);
  const d2 = progress(t, 4, 5);
  return (
    <svg width={TILE} height={TILE} viewBox={`0 0 ${TILE} ${TILE}`} style={{position: 'absolute', inset: 0, transform: `scale(${mix(1.5, 1, sc)})`, opacity: Math.min(1, sc * 2)}}>
      <rect x={6} y={6} width={TILE - 12} height={TILE - 12} fill="none" stroke={C.red} strokeWidth={10} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - d1} />
      <path d={a} stroke={C.red} strokeWidth={22} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d1} />
      <path d={b} stroke={C.red} strokeWidth={22} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d2} />
    </svg>
  );
};
