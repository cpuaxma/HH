import React from 'react';
import type {IconName} from '../edition';

/** Line icons (no emoji). `t` drives a small idle animation so icons are never frozen. */
export const Icon: React.FC<{name: IconName; size?: number; color?: string; t?: number; stroke?: number}> = ({
  name,
  size = 40,
  color = 'currentColor',
  t = 0,
  stroke = 2.2,
}) => {
  const p = {fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const wob = Math.sin(t / 18);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{overflow: 'visible', display: 'block'}}>
      {name === 'gauge' && (
        <>
          <path d="M8 32a16 16 0 0 1 32 0" {...p} />
          <path d="M12 32h2M34 32h2M24 16v2M13 21l1.5 1.5M35 21l-1.5 1.5" {...p} />
          <line x1="24" y1="32" x2={24 + Math.cos(-Math.PI / 4 + wob * 0.35) * 11} y2={32 + Math.sin(-Math.PI / 4 + wob * 0.35) * 11} {...p} />
          <circle cx="24" cy="32" r="2.4" fill={color} />
        </>
      )}
      {(name === 'calendar' || name === 'calendarOff') && (
        <>
          <rect x="8" y="11" width="32" height="29" rx="5" {...p} />
          <path d="M8 19h32M16 7v7M32 7v7" {...p} />
          {name === 'calendarOff' ? (
            <path d="M18 25l12 10M30 25L18 35" {...p} style={{opacity: 0.75 + wob * 0.25}} />
          ) : (
            <circle cx="24" cy="29" r="3" fill={color} style={{opacity: 0.6 + wob * 0.4}} />
          )}
        </>
      )}
      {name === 'briefcase' && (
        <>
          <rect x="7" y="15" width="34" height="24" rx="5" {...p} />
          <path d="M18 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M7 25h34" {...p} />
          <rect x="21" y={22 + wob} width="6" height="6" rx="1.5" fill={color} />
        </>
      )}
      {name === 'clock' && (
        <>
          <circle cx="24" cy="24" r="16" {...p} />
          <path d="M24 24 L24 13" {...p} />
          <path d={`M24 24 L${24 + Math.cos(t / 30) * 9} ${24 + Math.sin(t / 30) * 9}`} {...p} />
        </>
      )}
      {name === 'chart' && <path d="M7 36l10-10 7 6 15-17M33 15h6v6" {...p} />}
      {name === 'book' && (
        <>
          <path d="M24 13c-4-3-10-3-15-2v25c5-1 11-1 15 2 4-3 10-3 15-2V11c-5-1-11-1-15 2z" {...p} />
          <path d="M24 13v25" {...p} />
        </>
      )}
      {name === 'plane' && (
        <>
          <path d="M42 8L6 22l12 4 3 12 6-8 9 7z" {...p} />
          <path d="M18 26L42 8" {...p} />
        </>
      )}
    </svg>
  );
};

/** Live "pulse" dot used on cards. */
export const PulseDot: React.FC<{f: number; color: string; size?: number}> = ({f, color, size = 12}) => {
  const ring = (f % 60) / 60;
  return (
    <span style={{position: 'relative', display: 'inline-block', width: size, height: size}}>
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 ${size}px ${color}`}} />
      <span
        style={{
          position: 'absolute',
          inset: -size * ring * 0.9,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 1 - ring,
        }}
      />
    </span>
  );
};
