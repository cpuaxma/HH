import React from 'react';
import {enter, kick, mix} from '../lib/anim';
import {START_MOMENT, jumpAt} from '../lib/moments';
import {measureText} from '../fonts';
import {FONT, HPM, LOCK, TYPE, WEIGHT} from '../theme';
import {Swap} from './Swap';

const SIZE = 26;
const PAD_X = 26;
const labelWidth = (s: string) => measureText(s, `${WEIGHT.label} ${SIZE}px ${FONT}`, SIZE * 0.08) + PAD_X * 2;

// "Time jump" chip: Hot Red pill with a Cream uppercase label. The label rolls and the
// pill morphs to the new width with a little kick.
export const TimeChip: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 1}) => {
  const j = jumpAt(frame);
  const from = j ? j.from.chip : START_MOMENT.chip;
  const to = j ? j.to.chip : from;
  const width = mix(labelWidth(from), labelWidth(to), j ? enter(frame, j.start + 6, 26) : 0);
  const k = j ? mix(0.88, 1, kick(frame, j.start + 8)) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: '100%', top: LOCK.chipY, display: 'flex', justifyContent: 'center', opacity}}>
      <div
        style={{
          width,
          height: 54,
          borderRadius: 27,
          background: HPM.red,
          color: HPM.cream,
          overflow: 'hidden',
          transform: `scale(${k})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: FONT,
          fontWeight: WEIGHT.label,
          fontSize: SIZE,
          letterSpacing: TYPE.labelTracking,
          whiteSpace: 'nowrap',
        }}
      >
        <Swap frame={frame} at={j ? j.start + 4 : null} from={from} to={to} distance={40} style={{paddingLeft: '0.08em'}} />
      </div>
    </div>
  );
};
