import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, PHONE, SCREEN} from '../lib/stage';
import {HPM} from '../theme';

type Props = {
  cam: Cam;
  shell?: boolean; // draw the bezel + shadow (only the bottom layer does)
  island?: boolean;
  screenStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

// A generic, minimal phone: rounded rectangle, thin Charcoal bezel, soft shadow.
// Every stage layer uses the same camera so the stacked BEFORE/AFTER copies line up exactly.
export const PhoneFrame: React.FC<Props> = ({cam, shell = false, island = false, screenStyle, children}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: cam.cx - PHONE.w / 2,
        top: cam.cy - PHONE.h / 2,
        width: PHONE.w,
        height: PHONE.h,
        transform: `scale(${cam.s})`,
        transformOrigin: '50% 50%',
      }}
    >
      {shell ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: PHONE.radius,
            background: HPM.charcoal,
            boxShadow: '0 50px 90px rgba(15,15,15,0.20), 0 14px 30px rgba(15,15,15,0.14)',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: PHONE.bezel,
          top: PHONE.bezel,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: PHONE.radius - PHONE.bezel,
          overflow: 'hidden',
          ...screenStyle,
        }}
      >
        {children}
      </div>
      {island ? (
        <div
          style={{
            position: 'absolute',
            left: PHONE.w / 2 - 58,
            top: PHONE.bezel + 14,
            width: 116,
            height: 34,
            borderRadius: 17,
            background: HPM.charcoal,
          }}
        />
      ) : null}
    </div>
  </AbsoluteFill>
);
