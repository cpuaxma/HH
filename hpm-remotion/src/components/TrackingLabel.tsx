import React from 'react';
import {useCurrentFrame} from 'remotion';
import {enterProgress, exitProgress, mix} from '../lib/anim';
import {COLORS, FONT, TIMING, TYPE, WEIGHT} from '../theme';

type Props = {
  text: string;
  start: number;
  exitAt?: number;
  size?: number;
  color?: string;
  // Letter-spacing in em: from → to while it fades in.
  trackingFrom?: number;
  trackingTo?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
};

// Uppercase label: fades in while its letter-spacing tightens.
export const TrackingLabel: React.FC<Props> = ({
  text,
  start,
  exitAt,
  size = TYPE.labelSize,
  color = COLORS.charcoal,
  trackingFrom = TYPE.labelTrackingFrom,
  trackingTo = TYPE.labelTracking,
  align = 'left',
  style,
}) => {
  const frame = useCurrentFrame();
  const p = enterProgress(frame, start, TIMING.labelEnter);
  const out = exitProgress(frame, exitAt);
  const tracking = mix(trackingFrom, trackingTo, p);

  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: WEIGHT.label,
        fontSize: size,
        lineHeight: 1.2,
        letterSpacing: `${tracking}em`,
        // letter-spacing trails the last glyph; pad the other side so centred text stays centred.
        paddingLeft: align === 'center' ? `${tracking}em` : 0,
        textAlign: align,
        whiteSpace: 'nowrap',
        color,
        opacity: p * (1 - out),
        transform: `translateY(${-40 * out}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
