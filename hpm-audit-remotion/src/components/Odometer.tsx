import React from 'react';

// ── Odometer: rolling digits ────────────────────────────────────────────────
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
export const Odometer: React.FC<{value: number; format: (v: number) => string; unit: (v: number) => number; height: number; settled?: boolean; style?: React.CSSProperties}> = ({
  value,
  format,
  unit,
  height,
  settled,
  style,
}) => {
  const str = format(value);
  if (settled) return <span style={{display: 'inline-flex', height, lineHeight: `${height}px`, ...style}}>{str}</span>;
  const u = unit(value);
  let place = 0;
  const chars = str.split('').reverse().map((ch, i) => {
    if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
    const c = value / u / Math.pow(10, place);
    const lower = place === 0 ? 0 : (value / u / Math.pow(10, place - 1)) % 10;
    const roll = place === 0 ? c % 1 : Math.max(0, lower - 9);
    const pos = (Math.floor(c) % 10) + roll;
    place++;
    return (
      <span key={i} style={{display: 'inline-block', height, overflow: 'hidden', verticalAlign: 'top'}}>
        <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-pos * height}px)`}}>
          {DIGITS.map((d, k) => (
            <span key={k} style={{height, lineHeight: `${height}px`}}>
              {d}
            </span>
          ))}
        </span>
      </span>
    );
  });
  return <span style={{display: 'inline-flex', height, lineHeight: `${height}px`, fontVariantNumeric: 'tabular-nums', ...style}}>{chars.reverse()}</span>;
};
