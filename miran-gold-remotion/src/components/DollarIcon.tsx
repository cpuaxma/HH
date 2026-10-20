import React from 'react';
import {colors, fonts} from '../theme';

// Thin outlined "$" in a circle
export const DollarIcon: React.FC<{size: number; color?: string; strokeWidth?: number}> = ({
  size,
  color = colors.dollar,
  strokeWidth = 2.5,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    <circle cx={100} cy={100} r={92} fill="rgba(217,83,79,0.06)" stroke={color} strokeWidth={strokeWidth} />
    <circle cx={100} cy={100} r={80} fill="none" stroke={color} strokeWidth={1} opacity={0.35} />
    <text
      x={100}
      y={104}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={fonts.en}
      fontWeight={300}
      fontSize={108}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
    >
      $
    </text>
  </svg>
);
