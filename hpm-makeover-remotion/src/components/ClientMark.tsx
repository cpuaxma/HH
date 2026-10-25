import React from 'react';
import {CLIENT} from '../theme';

// Bean & Bloom logo mark (fictional): a coffee bean sprouting a sage leaf,
// with one tiny Hot Red accent.
export const ClientMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <circle cx="50" cy="50" r="50" fill={CLIENT.espresso} />
    <g transform="rotate(-28 47 56)">
      <ellipse cx="47" cy="56" rx="17" ry="24" fill={CLIENT.oat} />
      <path d="M47 33c-7 8 7 15 0 23s7 15 0 23" stroke={CLIENT.espresso} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
    <path d="M58 33c2-9 9-14 18-14-1 9-7 15-18 14z" fill={CLIENT.sage} />
    <path d="M58 33c4-4 8-7 12-9" stroke={CLIENT.espresso} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
    <circle cx="75" cy="72" r="3.6" fill={CLIENT.accent} />
  </svg>
);
