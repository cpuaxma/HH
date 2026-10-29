import React from 'react';
import {COLORS} from '../theme';

export const GlassCard: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      position: 'absolute',
      background: COLORS.glassFill,
      border: `1px solid ${COLORS.glassBorder}`,
      borderRadius: 24,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 40px 90px rgba(0, 0, 0, 0.35)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);
