import React from 'react';
import {C, FONT} from '../theme';

// Rebuilt wordmark (no logo.svg / pepper-icon.svg in the repo): "hot / pepper / MEDIA" in
// Montserrat 800 with a single-stroke pepper running behind it, after assets/logo-primary.png.
// `draw` (0..1) draws the pepper stroke on.
export const PEPPER_PATH =
  'M 700 10 C 690 30, 664 50, 652 62 C 634 58, 618 52, 602 55 C 586 40, 560 34, 538 40 C 500 52, 472 92, 452 132 ' +
  'C 424 200, 392 262, 332 312 C 252 372, 150 400, 44 404 C 6 407, 4 442, 42 452 C 152 482, 302 476, 452 410 ' +
  'C 562 360, 652 282, 672 190 C 682 150, 672 122, 652 106 C 642 96, 640 76, 652 62';

export const Logo: React.FC<{width: number; text?: string; stroke?: string; draw?: number}> = ({width, text = C.cream, stroke = C.charcoal, draw = 1}) => (
  <svg width={width} height={(width * 480) / 740} viewBox="0 0 740 480" style={{display: 'block', overflow: 'visible'}}>
    <path d={PEPPER_PATH} stroke={stroke} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
    <circle cx={533} cy={62} r={6} fill={stroke} opacity={draw > 0.9 ? 1 : 0} />
    <text x={96} y={238} fontFamily={FONT} fontWeight={800} fontSize={210} fill={text} letterSpacing="-10">
      hot
    </text>
    <text x={96} y={398} fontFamily={FONT} fontWeight={800} fontSize={210} fill={text} letterSpacing="-10" textLength={622} lengthAdjust="spacingAndGlyphs">
      pepper
    </text>
    <text x={716} y={452} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={52} fill={text} letterSpacing="1">
      MEDIA
    </text>
  </svg>
);
