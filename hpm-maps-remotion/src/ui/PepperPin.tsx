import {useId} from 'react';
import {BRAND} from '../data';
import {PIN_BODY, PIN_BOX, PIN_CALYX, PIN_DOT, PIN_STEM} from '../lib/pepper';

/** The pepper-shaped map pin as SVG. `height` is the rendered height in px. */
export const PepperPin: React.FC<{height: number; glow?: boolean; style?: React.CSSProperties}> = ({
  height,
  glow = true,
  style,
}) => {
  const id = useId().replace(/:/g, '');
  const width = (height * PIN_BOX.w) / PIN_BOX.h;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${PIN_BOX.w} ${PIN_BOX.h}`}
      style={{overflow: 'visible', ...style}}
    >
      <defs>
        <linearGradient id={`body${id}`} x1="0" y1="28" x2="0" y2="166" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={BRAND.glow} />
          <stop offset="0.55" stopColor={BRAND.red} />
          <stop offset="1" stopColor="#C92E19" />
        </linearGradient>
        <radialGradient id={`hl${id}`} cx="40" cy="52" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`glow${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      {glow ? <path d={PIN_BODY} fill={BRAND.glow} opacity={0.45} filter={`url(#glow${id})`} /> : null}
      <path d={PIN_BODY} fill={`url(#body${id})`} />
      <path d={PIN_BODY} fill={`url(#hl${id})`} />
      <path d={PIN_CALYX} fill="#B32A16" />
      <path d={PIN_STEM} stroke="#B32A16" strokeWidth={7} strokeLinecap="round" fill="none" />
      <circle cx={PIN_DOT.cx} cy={PIN_DOT.cy} r={PIN_DOT.r} fill="#fff" />
    </svg>
  );
};

export const PIN_TIP = {x: PIN_BOX.tipX / PIN_BOX.w, y: PIN_BOX.tipY / PIN_BOX.h};
