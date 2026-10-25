import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {smoothSpring, uiInOut} from '../anim';
import {Lang} from '../i18n';
import {colors, fonts} from '../theme';
import {CoinDot} from './Icons';

// Rolls each digit through seeded values until it settles, left to right
const Rolling: React.FC<{value: string; start: number; frame: number; seed: string}> = ({value, start, frame, seed}) => (
  <>
    {Array.from(value).map((ch, i) => {
      const settle = start + i * 3;
      const isDigit = /\d/.test(ch);
      const shown = !isDigit || frame >= settle ? ch : String(Math.floor(random(`${seed}-${i}-${Math.floor(frame / 2)}`) * 10));
      const p = smoothSpring(frame, settle - 2, 10);
      return (
        <span key={i} style={{display: 'inline-block', opacity: frame < start - 6 ? 0 : isDigit ? 0.55 + 0.45 * p : 1}}>
          {shown}
        </span>
      );
    })}
  </>
);

// Glass trade card: Entry / TP / SL with placeholder levels, labelled Illustrative
export const TradeCard: React.FC<{
  lang: Lang;
  labels: {entry: string; tp: string; sl: string};
  values: {entry: string; tp: string; sl: string};
  illustrative: string;
  start: number;
  exit?: number;
  x: number;
  y: number;
  width: number;
  scale?: number;
  seed: string;
}> = ({lang, labels, values, illustrative, start, exit, x, y, width, scale = 1, seed}) => {
  const frame = useCurrentFrame();
  const a = uiInOut(frame, start, exit, 30, 26);
  if (frame < start || a.q >= 1) return null;
  const isAr = lang === 'ar';
  const rows: Array<[string, string, string]> = [
    [labels.entry, values.entry, colors.text],
    [labels.tp, values.tp, colors.green],
    [labels.sl, values.sl, colors.red],
  ];
  const s = 0.94 + 0.06 * smoothSpring(frame, start, 26);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: `translateX(-50%) ${a.transform} scale(${s * scale})`,
        transformOrigin: '50% 0%',
        opacity: a.opacity,
        filter: a.filter,
        borderRadius: 26,
        background: 'linear-gradient(160deg, rgba(30,34,46,0.82), rgba(14,16,24,0.78))',
        border: `1px solid ${colors.glassBorder}`,
        backdropFilter: 'blur(18px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        padding: '22px 26px 18px',
        direction: isAr ? 'rtl' : 'ltr',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14}}>
        <CoinDot size={22} />
        <bdi dir="ltr" style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 22, color: colors.goldTo}}>
          Miran Gold
        </bdi>
        <span style={{flex: 1}} />
        <span style={{fontFamily: isAr ? fonts.ar : fonts.en, fontWeight: 300, fontSize: 16, color: colors.muted}}>{illustrative}</span>
      </div>
      {rows.map(([label, value, color], i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '9px 0',
            borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
            opacity: smoothSpring(frame, start + 8 + i * 8, 18),
          }}
        >
          <span style={{fontFamily: isAr ? fonts.ar : fonts.en, fontWeight: 300, fontSize: isAr ? 26 : 24, color: colors.text}}>{label}</span>
          <bdi dir="ltr" style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 30, color, fontVariantNumeric: 'tabular-nums'}}>
            <Rolling value={value} start={start + 14 + i * 10} frame={frame} seed={`${seed}-${i}`} />
          </bdi>
        </div>
      ))}
    </div>
  );
};
