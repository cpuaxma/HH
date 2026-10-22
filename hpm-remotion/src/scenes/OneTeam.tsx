import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {COPY} from '../copy';
import {headlineSize, LAYOUT} from '../layout';
import {enterProgress, exitProgress, mix} from '../lib/anim';
import {COLORS, COLUMN, FONT, SAFE, TYPE, WEIGHT} from '../theme';

const T = {
  headline: 12,
  body: 70,
  exit: 194,
};

export const OneTeam: React.FC = () => {
  const frame = useCurrentFrame();
  const L = LAYOUT.oneTeam;
  const bodyIn = enterProgress(frame, T.body, 28);
  const bodyOut = exitProgress(frame, T.exit + 8);

  return (
    <AbsoluteFill>
      <MaskReveal
        lines={COPY.oneTeam.headline}
        start={T.headline}
        exitAt={T.exit}
        fontSize={headlineSize()}
        style={{position: 'absolute', left: SAFE.left, top: L.headlineTop}}
      />
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: L.bodyTop(),
          width: COLUMN - 40,
          fontFamily: FONT,
          fontWeight: WEIGHT.body,
          fontSize: TYPE.bodySize,
          lineHeight: 1.35,
          color: COLORS.charcoal,
          opacity: bodyIn * (1 - bodyOut),
          transform: `translateY(${mix(24, 0, bodyIn) - 40 * bodyOut}px)`,
        }}
      >
        {COPY.oneTeam.body}
      </div>
    </AbsoluteFill>
  );
};
