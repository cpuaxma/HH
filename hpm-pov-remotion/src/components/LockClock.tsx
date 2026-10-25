import React from 'react';
import {START_MOMENT, dateText, jumpAt} from '../lib/moments';
import {FONT, HPM, LOCK, WEIGHT} from '../theme';
import {Clock} from './Clock';
import {Swap} from './Swap';
import {TimeChip} from './TimeChip';

// Date, big clock and the time-jump chip.
export const LockClock: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 1}) => {
  const j = jumpAt(frame);
  return (
    <>
      <div style={{position: 'absolute', left: 0, width: '100%', top: LOCK.dateY, display: 'flex', justifyContent: 'center', opacity}}>
        <Swap
          frame={frame}
          at={j ? j.start + 4 : null}
          from={dateText(j ? j.from : START_MOMENT)}
          to={j ? dateText(j.to) : ''}
          style={{fontFamily: FONT, fontWeight: WEIGHT.label, fontSize: 36, color: HPM.charcoal, opacity: 0.8, whiteSpace: 'nowrap', textAlign: 'center'}}
        />
      </div>
      <Clock frame={frame} opacity={opacity} />
      <TimeChip frame={frame} opacity={opacity} />
    </>
  );
};
