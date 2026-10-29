import React from 'react';
import {COLORS, FONT} from '../theme';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Per-digit odometer in Eastern Arabic digits. `value` may be fractional while rolling:
 * the units column spins continuously and each higher column rolls only as its carry arrives.
 * Fast columns pick up a little vertical motion blur.
 */
export const Odometer: React.FC<{value: number; prev: number; digits: number; size: number; style?: React.CSSProperties}> = ({
  value,
  prev,
  digits,
  size,
  style,
}) => {
  const h = size * 1.3;
  const pos = (v: number, k: number) => {
    const unit = 10 ** k;
    if (k === 0) return v;
    const whole = Math.floor(v / unit);
    const carry = Math.min(1, Math.max(0, (v % unit) - (unit - 1)));
    return whole + carry;
  };
  const cols = new Array(digits).fill(0).map((_, i) => digits - 1 - i); // most significant first
  return (
    <div
      dir="ltr"
      style={{display: 'flex', alignItems: 'center', fontFamily: FONT.family, fontWeight: FONT.key, fontSize: size, lineHeight: `${h}px`, ...style}}
    >
      {cols.map((k, idx) => {
        const p = pos(value, k);
        const speed = Math.abs(p - pos(prev, k));
        const offset = ((p % 10) + 10) % 10;
        const sep = digits > 3 && idx === digits - 4; // thousands separator after this column
        return (
          <React.Fragment key={k}>
            <div style={{height: h, overflow: 'hidden', position: 'relative'}}>
              <div style={{transform: `translateY(${-offset * h}px)`, filter: speed > 0.05 ? `blur(${Math.min(4, speed * 3)}px)` : undefined}}>
                {[...AR_DIGITS, AR_DIGITS[0]].map((d, i) => (
                  <div key={i} style={{height: h, textAlign: 'center', color: COLORS.text}}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            {sep ? <span style={{color: COLORS.text}}>٬</span> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
