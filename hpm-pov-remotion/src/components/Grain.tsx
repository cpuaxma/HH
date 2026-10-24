import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame} from 'remotion';
import {storyTime} from '../timeline';

// Subtle animated paper grain: a noise tile jumped to a new offset every 2 frames.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.025}) => {
  const frame = storyTime(useCurrentFrame()); // frozen during the stillness
  const step = Math.floor(frame / 2);
  const x = Math.floor(random(`gx${step}`) * 512);
  const y = Math.floor(random(`gy${step}`) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
};
