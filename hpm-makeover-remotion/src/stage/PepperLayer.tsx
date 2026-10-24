import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PepperDraw} from '../components/PepperDraw';
import {enter, exit, kick, mix} from '../lib/anim';
import {PEPPER_BUG, PEPPER_REST} from '../lib/sweeps';
import {CUE} from '../timeline';

// The pepper drops in grey, its stroke draws in red, it kicks, then parks top-left as a
// small brand bug next to the 4a–4c labels. Persistent across scenes 3–4.
export const PepperLayer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < CUE.pepperDrop || frame > CUE.bugExit + 16) return null;
  const drop = kick(frame, CUE.pepperDrop);
  const park = enter(frame, CUE.pepperPark, 40);
  const out = exit(frame, CUE.bugExit, 14);
  const left = mix(PEPPER_REST.left, PEPPER_BUG.left, park);
  const top = mix(mix(-420, PEPPER_REST.top, drop), PEPPER_BUG.top, park);
  const width = mix(PEPPER_REST.width, PEPPER_BUG.width, park);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <PepperDraw
        frame={frame}
        width={width}
        strokePx={mix(5, 3, park)}
        drawAt={CUE.pepperDraw}
        ghost="#9C9C9C"
        kickAt={CUE.pepperKick}
        style={{position: 'absolute', left, top, opacity: 1 - out}}
      />
    </AbsoluteFill>
  );
};
