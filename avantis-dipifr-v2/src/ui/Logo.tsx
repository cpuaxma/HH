import {useId} from 'react';
import {LAUREL_LEFT, LAUREL_RIGHT, LOGO_BOXES, LOGO_COLORS, LOGO_VIEWBOX, SHIELD, SHIELD_FILL, TAGLINE, WORDMARK} from '../lib/logoTrace';

export type LogoAnim = {
  /** 0–1 (may overshoot): the shield scales up into place. */
  shield: number;
  /** 0–1: each laurel branch grows from its base up. */
  laurels: number;
  /** 0–1: "AVANTIS" wipes in from the left. */
  wordmark: number;
  /** 0–1: the tagline fades up. */
  tagline: number;
};

const DONE: LogoAnim = {shield: 1, laurels: 1, wordmark: 1, tagline: 1};

/**
 * The Avantis logo, traced from assets/avantis-logo.jpg (scripts/trace-logo.py).
 * Every layer is the traced artwork; the animation only reveals it.
 */
export const Logo: React.FC<{width: number; anim?: LogoAnim}> = ({width, anim = DONE}) => {
  const id = useId().replace(/:/g, '');
  const [x, y, w, h] = LOGO_VIEWBOX;
  const sb = LOGO_BOXES.SHIELD;
  const scx = (sb[0] + sb[2]) / 2;
  const scy = (sb[1] + sb[3]) / 2;
  const s = anim.shield;
  // Laurels: a clip that rises from the bottom of the branches.
  const lb = LOGO_BOXES.LAUREL_LEFT;
  const lTop = lb[3] - (lb[3] - lb[1] + 20) * anim.laurels;
  // Wordmark: a soft-edged wipe from the left.
  const wb = LOGO_BOXES.WORDMARK;
  const edge = wb[0] - 30 + (wb[2] - wb[0] + 60) * anim.wordmark;
  return (
    <svg width={width} height={(width * h) / w} viewBox={LOGO_VIEWBOX.join(' ')} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <clipPath id={`laurel${id}`}>
          <rect x={x - 20} y={lTop} width={w + 40} height={h + 40} />
        </clipPath>
        <linearGradient id={`wipe${id}`} gradientUnits="userSpaceOnUse" x1={edge - 30} y1={0} x2={edge + 30} y2={0}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`mask${id}`} maskUnits="userSpaceOnUse" x={x - 50} y={y - 50} width={w + 100} height={h + 100}>
          <rect x={x - 50} y={y - 50} width={w + 100} height={h + 100} fill={`url(#wipe${id})`} />
        </mask>
        {/* The original wordmark and tagline sit on a soft drop shadow. */}
        <filter id={`shadow${id}`} x="-10%" y="-30%" width="120%" height="170%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>
      <g clipPath={anim.laurels < 1 ? `url(#laurel${id})` : undefined}>
        <path d={LAUREL_LEFT} fill={LOGO_COLORS.grey} fillRule="evenodd" />
        <path d={LAUREL_RIGHT} fill={LOGO_COLORS.grey} fillRule="evenodd" />
      </g>
      <g
        opacity={Math.min(1, Math.max(0, s) * 2)}
        transform={`translate(${scx} ${scy}) scale(${Math.max(0, 0.55 + 0.45 * s)}) translate(${-scx} ${-scy})`}
      >
        <path d={SHIELD_FILL} fill="#fff" fillRule="evenodd" />
        <path d={SHIELD} fill={LOGO_COLORS.navy} fillRule="evenodd" />
      </g>
      <g filter={`url(#shadow${id})`}>
        <g mask={anim.wordmark < 1 ? `url(#mask${id})` : undefined} transform={`translate(0 ${(1 - anim.wordmark) * 6})`}>
          <path d={WORDMARK} fill={LOGO_COLORS.navy} fillRule="evenodd" />
        </g>
        <g opacity={anim.tagline} transform={`translate(0 ${(1 - anim.tagline) * 8})`}>
          <path d={TAGLINE} fill={LOGO_COLORS.grey} fillRule="evenodd" />
        </g>
      </g>
    </svg>
  );
};
