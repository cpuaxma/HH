// Directional (horizontal) motion blur for whip-pans, plus the RGB-split glitch filter.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HIT} from '../timeline';
import {noise} from '../motion';

const LEVELS = 32;
/** CSS filter value for a horizontal motion blur of ~`px` pixels. */
export const mblurX = (px: number) => `url(#mbx-${Math.max(1, Math.min(LEVELS, Math.round(px)))})`;

export const GLITCH = {from: HIT.glitch - 4, to: HIT.glitch + 16};

export const glitchAmount = (frame: number) => {
  if (frame < GLITCH.from || frame > GLITCH.to) return 0;
  const t = (frame - GLITCH.from) / (GLITCH.to - GLITCH.from);
  const env = Math.sin(t * Math.PI);
  return env * (0.55 + 0.45 * Math.abs(noise(31, frame * 0.9)));
};

export const FilterDefs: React.FC = () => {
  const frame = useCurrentFrame();
  const g = glitchAmount(frame);
  const d = 4 + g * 18;
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <defs>
        {Array.from({length: LEVELS}, (_, i) => (
          <filter key={i} id={`mbx-${i + 1}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${i + 1} 0`} />
          </filter>
        ))}
        <filter id="rgbsplit" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={d} dy={0} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-d} dy={0} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
};

/** Horizontal slice bars over the frame during the glitch. */
export const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const g = glitchAmount(frame);
  if (g <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 9}, (_, i) => {
        const y = ((noise(i * 3 + 1, frame * 1.7) + 1) / 2) * 1920;
        const h = 6 + Math.abs(noise(i + 50, frame)) * 60 * g;
        const x = noise(i + 80, frame * 2) * 120 * g;
        const color = i % 3 === 0 ? '#FF4D6D' : i % 3 === 1 ? '#4DD8FF' : '#F7DE8C';
        return <rect key={i} x={x} y={y} width={1080} height={h} fill={color} opacity={0.18 * g + 0.05} />;
      })}
    </svg>
  );
};
