import React from 'react';
import {LAYOUT, SAFE} from '../theme';

/** Headline slot: centred in the safe content column, upper-middle third. */
export const Headline: React.FC<{top?: number; children: React.ReactNode}> = ({top = LAYOUT.headlineTop, children}) => (
  <div style={{position: 'absolute', left: SAFE.side, width: LAYOUT.contentWidth, top, display: 'flex', justifyContent: 'center'}}>
    {children}
  </div>
);

/** Absolutely placed box centred on (x, y). */
export const At: React.FC<{x: number; y: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style}}>{children}</div>
);
