import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {PepperDraw} from '../components/PepperDraw';
import {TrackingLabel} from '../components/TrackingLabel';
import {COPY} from '../copy';
import {headlineSize, LAYOUT} from '../layout';
import {exitProgress} from '../lib/anim';
import {SAFE} from '../theme';

// Local cue frames.
const T = {
  label: 10,
  pepper: 18,
  line1: 30,
  line2: 56, // "spicier." starts landing ~5 frames later
  kick: 78,
  exit: 160,
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const L = LAYOUT.hook;
  const size = headlineSize();
  const pepperOut = exitProgress(frame, T.exit + 4, 14);

  return (
    <AbsoluteFill>
      <TrackingLabel text={COPY.hook.label} start={T.label} exitAt={T.exit} style={{position: 'absolute', left: SAFE.left, top: L.labelY}} />

      <div
        style={{
          position: 'absolute',
          left: L.pepper.x,
          top: L.pepper.y,
          transform: `translateY(${-60 * pepperOut}px)`,
          opacity: 1 - pepperOut,
        }}
      >
        <PepperDraw start={T.pepper} kickAt={T.kick} width={L.pepper.width} />
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: L.headlineTop}}>
        <MaskReveal lines={[COPY.hook.headline[0]]} start={T.line1} exitAt={T.exit} fontSize={size} />
        <MaskReveal lines={[COPY.hook.headline[1]]} start={T.line2} exitAt={T.exit + 4} fontSize={size} />
      </div>
    </AbsoluteFill>
  );
};
