import React from 'react';
import {COLORS} from '../config';

// Hand-built 48×48 line icons (no emoji glyphs: they render as boxes headless).
export type IconName =
  | 'heart' | 'comment' | 'dm' | 'user' | 'eye' | 'users' | 'target' | 'audience'
  | 'message' | 'check' | 'info' | 'arrowUp' | 'flame' | 'bookmark';

type Props = {name: IconName; size?: number; color?: string; accent?: string; stroke?: number; t?: number; fill?: boolean};

export const Icon: React.FC<Props> = ({name, size = 48, color = COLORS.offWhite, accent = COLORS.orange, stroke = 3.6, t = 0, fill = false}) => {
  const common = {fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  let body: React.ReactNode = null;
  switch (name) {
    case 'heart':
      body = (
        <path
          {...common}
          fill={fill ? accent : 'none'}
          stroke={fill ? accent : color}
          d="M24 40 C10 31 5 24 5 17 C5 11 10 7 15.5 7 C19.5 7 22.5 9.5 24 12.5 C25.5 9.5 28.5 7 32.5 7 C38 7 43 11 43 17 C43 24 38 31 24 40 Z"
        />
      );
      break;
    case 'comment':
      body = <path {...common} d="M41 23 C41 31.8 33.4 38 24 38 C21.2 38 18.5 37.5 16.2 36.5 L7 40 L9.6 32.4 C7.9 29.7 7 26.5 7 23 C7 14.2 14.6 8 24 8 C33.4 8 41 14.2 41 23 Z" />;
      break;
    case 'dm':
      body = (
        <>
          <path {...common} d="M43 6 L5 21 L20 27 L26 42 Z" />
          <path {...common} stroke={accent} d="M43 6 L20 27" />
        </>
      );
      break;
    case 'user':
      body = (
        <>
          <circle {...common} cx={19} cy={15} r={8} />
          <path {...common} d="M5 41 C5 32 11 27 19 27 C27 27 33 32 33 41" />
          <path {...common} stroke={accent} d="M39 14 V26 M33 20 H45" />
        </>
      );
      break;
    case 'eye': {
      const blink = 1 - Math.max(0, Math.sin(t * 0.18)) ** 40 * 0.9;
      body = (
        <g transform={`translate(0 ${24 - 24 * blink}) scale(1 ${blink})`}>
          <path {...common} d="M3 24 C9 13 16 9 24 9 C32 9 39 13 45 24 C39 35 32 39 24 39 C16 39 9 35 3 24 Z" />
          <circle cx={24} cy={24} r={7} fill={accent} />
        </g>
      );
      break;
    }
    case 'users':
      body = (
        <>
          <circle {...common} cx={18} cy={16} r={7} />
          <path {...common} d="M4 40 C4 32 10 27 18 27 C26 27 32 32 32 40" />
          <circle {...common} stroke={accent} cx={33} cy={14} r={5.5} />
          <path {...common} stroke={accent} d="M35 24 C40 25 44 29 44 36" />
        </>
      );
      break;
    case 'target': {
      const pulse = 1 + 0.08 * Math.sin(t * 0.3);
      body = (
        <>
          <circle {...common} cx={24} cy={24} r={19 * pulse} />
          <circle {...common} cx={24} cy={24} r={11} />
          <circle cx={24} cy={24} r={4.5} fill={accent} />
        </>
      );
      break;
    }
    case 'audience': {
      const bob = (i: number) => Math.sin(t * 0.25 + i * 1.4) * 1.5;
      body = (
        <>
          <g transform={`translate(0 ${bob(0)})`}>
            <circle {...common} cx={12} cy={17} r={5} />
            <path {...common} d="M3 37 C3 30 7 27 12 27 C15 27 17 28 18.5 29.5" />
          </g>
          <g transform={`translate(0 ${bob(2)})`}>
            <circle {...common} cx={36} cy={17} r={5} />
            <path {...common} d="M45 37 C45 30 41 27 36 27 C33 27 31 28 29.5 29.5" />
          </g>
          <g transform={`translate(0 ${bob(1)})`}>
            <circle {...common} stroke={accent} cx={24} cy={15} r={6.5} />
            <path {...common} stroke={accent} d="M12 42 C12 33 17 28 24 28 C31 28 36 33 36 42" />
          </g>
        </>
      );
      break;
    }
    case 'message': {
      const dot = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.35 - i * 0.9));
      body = (
        <>
          <path {...common} d="M6 10 H42 V33 H22 L13 41 V33 H6 Z" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={15 + i * 9} cy={21.5} r={2.8} fill={accent} opacity={dot(i)} />
          ))}
        </>
      );
      break;
    }
    case 'check':
      body = <path {...common} d="M10 25 L20 35 L39 13" />;
      break;
    case 'info':
      body = (
        <>
          <circle {...common} cx={24} cy={24} r={19} />
          <path {...common} d="M24 22 V34" />
          <circle cx={24} cy={15} r={2.4} fill={color} />
        </>
      );
      break;
    case 'arrowUp':
      body = <path {...common} d="M24 40 V9 M12 20 L24 8 L36 20" />;
      break;
    case 'bookmark':
      body = <path {...common} d="M12 6 H36 V42 L24 33 L12 42 Z" />;
      break;
    case 'flame':
      body = (
        <path
          {...common}
          fill={fill ? accent : 'none'}
          stroke={fill ? accent : color}
          d="M24 44 C14 44 9 37 9 30 C9 22 15 18 17 10 C21 14 22 18 22 21 C25 18 27 13 27 5 C35 11 39 20 39 29 C39 37 33 44 24 44 Z"
        />
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block', overflow: 'visible'}}>
      {body}
    </svg>
  );
};
