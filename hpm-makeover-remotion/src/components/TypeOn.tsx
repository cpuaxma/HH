import React from 'react';
import {HPM} from '../theme';

type Props = {
  frame: number;
  text: string;
  start: number;
  framesPerChar?: number;
  cursorFrom?: number; // cursor blinks in before typing starts
  cursorColor?: string;
  style?: React.CSSProperties;
};

const BLINK = 32; // frames per on/off cycle

// Types text in with a blinking cursor. The untyped rest is laid out invisibly,
// so line breaks never jump while typing.
export const TypeOn: React.FC<Props> = ({frame, text, start, framesPerChar = 1, cursorFrom, cursorColor = HPM.red, style}) => {
  const chars = Array.from(text);
  const n = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / framesPerChar) + 1));
  const typing = frame >= start && n < chars.length;
  const showCursor = frame >= (cursorFrom ?? start) && (typing || Math.floor((frame - start) / (BLINK / 2)) % 2 === 0);

  return (
    <span style={style}>
      {chars.slice(0, n).join('')}
      <span
        style={{
          display: 'inline-block',
          width: 0,
          overflow: 'visible',
          verticalAlign: '-0.15em',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '0.09em',
            height: '1.1em',
            marginLeft: '0.04em',
            background: cursorColor,
            borderRadius: 2,
            opacity: showCursor ? 1 : 0,
          }}
        />
      </span>
      <span style={{color: 'transparent'}}>{chars.slice(n).join('')}</span>
    </span>
  );
};
