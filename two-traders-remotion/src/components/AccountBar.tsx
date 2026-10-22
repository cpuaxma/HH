import React from 'react';
import {Lang} from '../i18n';
import {colors, fonts} from '../theme';
import {Arrow} from './Icons';

// Balance meter: no amounts, just a level, a trend arrow and an "Illustrative" label
export const AccountBar: React.FC<{
  lang: Lang;
  label: string;
  illustrative: string;
  level: number; // 0..1
  trend: number; // -1 falling … 1 rising
  color: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
}> = ({lang, label, illustrative, level, trend, color, x, y, width, opacity}) => {
  const isAr = lang === 'ar';
  const font = isAr ? fonts.ar : fonts.en;
  const arrowColor = trend < -0.05 ? colors.red : trend > 0.05 ? colors.green : colors.muted;
  return (
    <div style={{position: 'absolute', left: x, top: y, width, opacity, direction: isAr ? 'rtl' : 'ltr'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{fontFamily: font, fontWeight: 300, fontSize: isAr ? 19 : 18, color: 'rgba(245,241,232,0.7)', whiteSpace: 'nowrap'}}>{label}</span>
        <div style={{position: 'relative', flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [isAr ? 'right' : 'left']: 0,
              width: `${Math.max(0, Math.min(1, level)) * 100}%`,
              borderRadius: 7,
              background: `linear-gradient(90deg, ${color}AA, ${color})`,
              boxShadow: `0 0 14px ${color}88`,
            }}
          />
        </div>
        <div style={{opacity: Math.min(1, Math.abs(trend) * 3 + 0.35)}}>
          <Arrow up={trend >= 0} color={arrowColor} size={22} />
        </div>
      </div>
      <div style={{fontFamily: font, fontWeight: 300, fontSize: 14, color: colors.muted, marginTop: 4, textAlign: isAr ? 'left' : 'right'}}>{illustrative}</div>
    </div>
  );
};
