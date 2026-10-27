import {useId} from 'react';
import {LOGO_INK, LOGO_RED, LOGO_VIEWBOX} from '../lib/logoTrace';

/**
 * The Hot Pepper Media logo, traced from assets/logo-primary.png
 * (scripts/trace-logo.py). `pepper` and `letters` (0–1) animate the two layers:
 * the pepper outline scales in, the red lettering wipes in from the left.
 */
export const Logo: React.FC<{width: number; pepper?: number; letters?: number; red: string; ink: string}> = ({
  width,
  pepper = 1,
  letters = 1,
  red,
  ink,
}) => {
  const id = useId().replace(/:/g, '');
  const [x, y, w, h] = LOGO_VIEWBOX;
  const edge = x + (w + 160) * letters - 80; // soft 80px wipe edge
  return (
    <svg width={width} height={(width * h) / w} viewBox={LOGO_VIEWBOX.join(' ')} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`wipe${id}`} gradientUnits="userSpaceOnUse" x1={edge - 80} y1={0} x2={edge + 80} y2={0}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`mask${id}`} maskUnits="userSpaceOnUse" x={x - 50} y={y - 50} width={w + 100} height={h + 100}>
          <rect x={x - 50} y={y - 50} width={w + 100} height={h + 100} fill={`url(#wipe${id})`} />
        </mask>
      </defs>
      <g
        opacity={Math.min(1, pepper * 1.5)}
        transform={`translate(${x + w * 0.62} ${y + h * 0.45}) scale(${0.86 + 0.14 * pepper}) rotate(${(1 - pepper) * -8}) translate(${-(x + w * 0.62)} ${-(y + h * 0.45)})`}
      >
        <path d={LOGO_INK} fill={ink} />
      </g>
      <path d={LOGO_RED} fill={red} mask={letters < 1 ? `url(#mask${id})` : undefined} />
    </svg>
  );
};
