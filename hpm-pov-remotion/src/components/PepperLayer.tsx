import React from 'react';
import {interpolateColors} from 'remotion';
import {exit, kick, mix, progress} from '../lib/anim';
import {CUE} from '../timeline';
import {EASE_IN_OUT, HPM} from '../theme';
import {PepperDraw} from './PepperDraw';

const REST = {left: 540 - 190, top: 1010, width: 380};
export const DOCK = {left: 150, top: 34, width: 50};

// The pepper drops in, draws itself in Hot Red, kicks, then shrinks and docks in the
// status bar next to the time for the rest of the video (Cream once the frame floods).
export const PepperLayer: React.FC<{frame: number}> = ({frame}) => {
  if (frame < CUE.pepperDrop) {
    // Cold open: already docked (this is the future); it pops out on the rewind.
    const out = exit(frame, CUE.rewind, 16);
    if (out >= 1) return null;
    return (
      <PepperDraw
        frame={frame}
        width={DOCK.width}
        strokePx={2.8}
        style={{position: 'absolute', left: DOCK.left, top: DOCK.top, opacity: 1 - out, transform: `scale(${1 - 0.6 * out})`}}
      />
    );
  }
  const drop = kick(frame, CUE.pepperDrop);
  const dock = kick(frame, CUE.pepperDock);
  const left = mix(REST.left, DOCK.left, dock);
  const top = mix(mix(-480, REST.top, drop), DOCK.top, dock);
  const width = mix(REST.width, DOCK.width, dock);
  const color = interpolateColors(progress(frame, CUE.flood, CUE.floodDuration, EASE_IN_OUT), [0, 1], [HPM.red, HPM.cream]);
  return (
    <PepperDraw
      frame={frame}
      width={width}
      strokePx={mix(6, 2.8, dock)}
      color={color}
      drawAt={CUE.pepperDraw}
      ghost={frame < CUE.pepperDraw + 60 ? 'rgba(15,15,15,0.18)' : undefined}
      kickAt={CUE.pepperKick}
      style={{position: 'absolute', left, top}}
    />
  );
};
