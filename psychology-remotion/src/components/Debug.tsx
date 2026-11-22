import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {SAFE} from '../config';

/**
 * textOnly: hides every non-text visual (3D, scrims, grade). Used by `npm run check:safe` to find
 * text pixels outside the safe zone.
 */
export const DebugContext = createContext({textOnly: false});
export const useTextOnly = () => useContext(DebugContext).textOnly;

/** Draws the safe zone. Toggle with the `showSafeZone` prop in Studio. */
export const SafeZoneOverlay: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: 'rgba(255,0,80,0.18)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: 'rgba(255,0,80,0.18)'}} />
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top,
        width: SAFE.right - SAFE.left,
        height: SAFE.bottom - SAFE.top,
        border: '2px dashed rgba(0,255,200,0.7)',
      }}
    />
  </AbsoluteFill>
);
