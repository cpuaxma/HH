import React from 'react';
import {enter, exit} from '../lib/anim';
import {FONT, HPM, TYPE, WEIGHT} from '../theme';

type Props = {frame: number; num: string; text: string; start: number; exitAt: number; style?: React.CSSProperties};

// "01 · VISUAL IDENTITY": Montserrat 600 uppercase, 0.08em tracking, mask slide-up.
export const SceneLabel: React.FC<Props> = ({frame, num, text, start, exitAt, style}) => {
  const p = enter(frame, start, 26);
  const out = exit(frame, exitAt, 15);
  return (
    <div style={{position: 'absolute', overflow: 'hidden', padding: '4px 0', ...style}}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 110 - out * 110}%)`,
          fontFamily: FONT.brand,
          fontWeight: WEIGHT.label,
          fontSize: 26,
          letterSpacing: TYPE.labelTracking,
          color: HPM.charcoal,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{color: HPM.red}}>{num}</span>
        <span style={{opacity: 0.45}}> · </span>
        {text}
      </div>
    </div>
  );
};
