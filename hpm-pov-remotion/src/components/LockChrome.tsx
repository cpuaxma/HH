import {Camera, Flashlight} from 'lucide-react';
import React from 'react';
import {HPM} from '../theme';

const BUTTON = 104;

// The bottom of an iPhone lock screen: flashlight and camera buttons and the home
// indicator. Decorative phone chrome, so it may sit in the bottom safe zone.
export const LockChrome: React.FC<{opacity: number; color: string}> = ({opacity, color}) => {
  const button = (left: number, Icon: typeof Camera) => (
    <div
      style={{
        position: 'absolute',
        left: left - BUTTON / 2,
        top: 1736 - BUTTON / 2,
        width: BUTTON,
        height: BUTTON,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <Icon size={42} color={HPM.charcoal} strokeWidth={2} />
    </div>
  );
  return (
    <>
      {opacity > 0 ? button(140, Flashlight) : null}
      {opacity > 0 ? button(940, Camera) : null}
      <div style={{position: 'absolute', left: 540 - 190, top: 1884, width: 380, height: 13, borderRadius: 7, background: color, opacity: 0.9}} />
    </>
  );
};
