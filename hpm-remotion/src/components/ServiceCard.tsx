import React from 'react';
import {useCurrentFrame} from 'remotion';
import {IconName} from '../copy';
import {LAYOUT, wrapLines} from '../layout';
import {enterProgress, exitProgress, mix} from '../lib/anim';
import {COLORS, COLUMN, FONT, TYPE, WEIGHT} from '../theme';
import {LineIcon} from './LineIcon';
import {MaskReveal} from './MaskReveal';

const PADDING = 40;
const ENTER = 34;
const EXIT = 20; // ~40% faster than ENTER
const NAME_TRACKING = '-0.02em';

type Props = {
  name: string;
  desc: string;
  icon: IconName;
  start: number;
  // Entrance offset in px: the card travels from here to its resting place.
  fromX: number;
  fromY: number;
  exitAt?: number;
  top: number;
};

export const ServiceCard: React.FC<Props> = ({name, desc, icon, start, fromX, fromY, exitAt, top}) => {
  const frame = useCurrentFrame();
  const p = enterProgress(frame, start, ENTER);
  const out = exitProgress(frame, exitAt, EXIT);
  const nameLines = wrapLines(name, TYPE.serviceName, WEIGHT.headline, COLUMN - PADDING * 2, NAME_TRACKING);

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        top,
        width: COLUMN,
        height: LAYOUT.services.cardHeight,
        boxSizing: 'border-box',
        padding: PADDING,
        borderRadius: 28,
        backgroundColor: COLORS.peach,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transform: `translate(${mix(fromX, 0, p)}px, ${mix(fromY, 0, p) - 900 * out}px)`,
        opacity: Math.min(1, p * 3) * Math.max(0, 1 - out * 1.7),
      }}
    >
      <LineIcon name={icon} start={start + 16} />
      <MaskReveal
        lines={nameLines.map((l) => `*${l}*`)}
        start={start + 10}
        fontSize={TYPE.serviceName}
        hero={false}
        style={{marginTop: 24, letterSpacing: NAME_TRACKING, lineHeight: 1.04}}
      />
      <div
        style={{
          marginTop: 16,
          fontFamily: FONT,
          fontWeight: WEIGHT.body,
          fontSize: 34,
          lineHeight: 1.3,
          color: COLORS.charcoal,
          opacity: enterProgress(frame, start + 22, 24),
          transform: `translateY(${mix(18, 0, enterProgress(frame, start + 22, 24))}px)`,
        }}
      >
        {desc}
      </div>
    </div>
  );
};
