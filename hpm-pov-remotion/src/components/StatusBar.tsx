import {BatteryFull, Signal, Wifi} from 'lucide-react';
import React from 'react';
import {START_MOMENT, jumpAt, timeText} from '../lib/moments';
import {HPM, LOCK, UI_FONT} from '../theme';
import {Swap} from './Swap';

// iPhone-style status bar: time on the left, the Dynamic Island in the middle; signal,
// wifi and battery on the right. The docked pepper (PepperLayer) sits after the time.
export const StatusBar: React.FC<{frame: number; color?: string}> = ({frame, color = HPM.charcoal}) => {
  const j = jumpAt(frame);
  return (
    <div style={{position: 'absolute', left: 0, top: LOCK.statusY, width: '100%', height: 40, color, fontFamily: UI_FONT}}>
      <Swap
        frame={frame}
        at={j ? j.start + 8 : null}
        from={timeText(j ? j.from : START_MOMENT)}
        to={j ? timeText(j.to) : ''}
        distance={18}
        style={{position: 'absolute', left: 64, top: 0, fontWeight: 600, fontSize: 32, lineHeight: '40px'}}
      />
      <div style={{position: 'absolute', left: 540 - 150, top: -24, width: 300, height: 88, borderRadius: 44, background: HPM.charcoal}} />
      <div style={{position: 'absolute', right: 56, top: 2, display: 'flex', gap: 14, alignItems: 'center'}}>
        <Signal size={34} color={color} strokeWidth={2.4} />
        <Wifi size={34} color={color} strokeWidth={2.4} />
        <BatteryFull size={40} color={color} strokeWidth={2} />
      </div>
    </div>
  );
};
