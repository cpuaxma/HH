import {BatteryFull, Signal, Wifi} from 'lucide-react';
import React from 'react';
import {START_MOMENT, jumpAt, timeText} from '../lib/moments';
import {FONT, HPM, LOCK, WEIGHT} from '../theme';
import {Swap} from './Swap';

// Generic status bar: time on the left; signal, wifi, battery on the right.
// The docked pepper (PepperLayer) sits right after the time.
export const StatusBar: React.FC<{frame: number; color?: string}> = ({frame, color = HPM.charcoal}) => {
  const j = jumpAt(frame);
  return (
    <div style={{position: 'absolute', left: 0, top: LOCK.statusY, width: '100%', height: 44, color, fontFamily: FONT}}>
      <Swap
        frame={frame}
        at={j ? j.start + 8 : null}
        from={timeText(j ? j.from : START_MOMENT)}
        to={j ? timeText(j.to) : ''}
        distance={18}
        style={{position: 'absolute', left: 64, top: 2, fontWeight: WEIGHT.label, fontSize: 30, lineHeight: '40px'}}
      />
      <div style={{position: 'absolute', right: 56, top: 4, display: 'flex', gap: 14, alignItems: 'center'}}>
        <Signal size={34} color={color} strokeWidth={2.4} />
        <Wifi size={34} color={color} strokeWidth={2.4} />
        <BatteryFull size={40} color={color} strokeWidth={2} />
      </div>
    </div>
  );
};
