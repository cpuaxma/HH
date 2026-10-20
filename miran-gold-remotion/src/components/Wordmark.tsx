import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BRAND} from '../i18n';
import {ease, fonts, goldGradientCss, layout} from '../theme';

// Persistent small brand mark, top centre. Fades out when the CTA's big wordmark arrives.
export const Wordmark: React.FC<{fadeOutAt: number}> = ({fadeOutAt}) => {
  const frame = useCurrentFrame();
  const opacity =
    interpolate(frame, [0, 24], [0, 0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.enter}) *
    interpolate(frame, [fadeOutAt, fadeOutAt + 20], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.exit,
    });
  return (
    <div
      style={{
        position: 'absolute',
        top: layout.wordmarkY,
        left: 0,
        width: '100%',
        textAlign: 'center',
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          backgroundImage: goldGradientCss,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {BRAND}
      </span>
    </div>
  );
};
