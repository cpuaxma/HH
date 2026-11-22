import React from 'react';
import {BRAND, COLORS, FONT, SCENES, SIZES} from '../config';
import {ChiliMark} from './ChiliMark';
import {Icon} from './Icons';

/** Vector "hero dish" used as the client's product (a steaming bowl with chili). */
export const DishArt: React.FC<{size: number; t: number; steam?: boolean}> = ({size, t, steam = true}) => {
  const s = size / 300;
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" style={{display: 'block', overflow: 'visible'}}>
      {steam
        ? [0, 1, 2].map((i) => {
            const ph = t * 0.12 + i * 2.1;
            const lift = ((t * 0.9 + i * 22) % 60) / 60;
            return (
              <path
                key={i}
                d={`M ${110 + i * 40} ${120 - lift * 30} c ${-14 + Math.sin(ph) * 6} -18, ${14 + Math.cos(ph) * 6} -30, 0 -50 c -10 -12, 4 -24, 0 -34`}
                fill="none"
                stroke={COLORS.offWhite}
                strokeWidth={6 / Math.max(0.5, s * 0.9)}
                strokeLinecap="round"
                opacity={Math.sin(Math.PI * lift) * 0.55}
              />
            );
          })
        : null}
      <ellipse cx={150} cy={262} rx={110} ry={12} fill="#000" opacity={0.35} />
      <path d="M 40 150 H 260 C 260 215, 215 255, 150 255 C 85 255, 40 215, 40 150 Z" fill={COLORS.surfaceHi} stroke={COLORS.offWhite} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 62 176 C 110 186, 190 186, 238 176" stroke={COLORS.border} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={150} cy={150} rx={110} ry={20} fill="#2A2A2A" stroke={COLORS.offWhite} strokeWidth={7} />
      <g transform="translate(96 108) rotate(-12) scale(0.17)">
        <ChiliMark width={740} color={COLORS.red} fill={COLORS.red} stroke={40} />
      </g>
      <circle cx={208} cy={146} r={9} fill={COLORS.orange} />
      <circle cx={88} cy={150} r={7} fill={COLORS.orange} opacity={0.8} />
      <path d="M 196 92 L 252 30" stroke={COLORS.offWhite} strokeWidth={7} strokeLinecap="round" />
      <path d="M 212 98 L 268 40" stroke={COLORS.offWhite} strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
};

/** The finished post (Instagram-style card). Designed at 580 px wide; scale with `width`. */
export const PostCard: React.FC<{width: number; t: number; liked?: number; style?: React.CSSProperties}> = ({width, t, liked = 0, style}) => {
  const k = width / 580;
  const c = SCENES.create;
  return (
    <div style={{width, height: 800 * k, position: 'relative', ...style}}>
      <div
        style={{
          width: 580,
          height: 800,
          transform: `scale(${k})`,
          transformOrigin: 'top left',
          borderRadius: 34,
          background: COLORS.surface,
          border: `2px solid ${COLORS.border}`,
          overflow: 'hidden',
          fontFamily: FONT.family,
          color: COLORS.offWhite,
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16}}>
          <div style={{width: 56, height: 56, borderRadius: 28, border: `3px solid ${COLORS.orange}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.charcoal}}>
            <ChiliMark width={36} stroke={40} />
          </div>
          <div style={{fontWeight: FONT.bold, fontSize: SIZES.postHandle}}>{BRAND.handle.replace('@', '')}</div>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 6}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 7, height: 7, borderRadius: 4, background: COLORS.muted}} />
            ))}
          </div>
        </div>
        <div style={{height: 580, position: 'relative', background: 'linear-gradient(160deg, #262626 0%, #161616 100%)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 40, top: 46, fontWeight: FONT.bold, fontSize: SIZES.postHeadline, lineHeight: 0.95, letterSpacing: '-0.02em'}}>
            {c.postHeadline.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            <div style={{width: 120, height: 10, borderRadius: 5, background: COLORS.orange, marginTop: 16}} />
          </div>
          <div style={{position: 'absolute', right: 10, bottom: 40}}>
            <DishArt size={360} t={t} />
          </div>
          <div style={{position: 'absolute', left: 40, bottom: 44, padding: '14px 28px', borderRadius: 40, border: `3px solid ${COLORS.red}`, fontWeight: FONT.bold, fontSize: 26}}>
            {c.postButton}
          </div>
        </div>
        <div style={{height: 124, padding: '20px 26px 0', display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
            <div style={{transform: `scale(${1 + 0.35 * Math.sin(Math.PI * Math.min(1, liked))})`}}>
              <Icon name="heart" size={40} fill={liked > 0.3} accent={COLORS.red} />
            </div>
            <Icon name="comment" size={40} />
            <Icon name="dm" size={40} />
            <div style={{marginLeft: 'auto'}}>
              <Icon name="bookmark" size={40} />
            </div>
          </div>
          <div style={{fontWeight: FONT.medium, fontSize: 22, color: COLORS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            <span style={{color: COLORS.offWhite, fontWeight: FONT.bold}}>{BRAND.handle.replace('@', '')}</span> {c.typedCaption}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Phone mockup. Screen content is laid out in a 412 × 872 box. */
export const Phone: React.FC<{width: number; time?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  width,
  time = '17:00',
  children,
  style,
}) => {
  const k = width / 440;
  return (
    <div style={{width, height: 900 * k, position: 'relative', ...style}}>
      <div
        style={{
          width: 440,
          height: 900,
          transform: `scale(${k})`,
          transformOrigin: 'top left',
          borderRadius: 70,
          background: '#0B0B0B',
          border: '3px solid #3A3A3A',
          boxShadow: '0 50px 120px rgba(0,0,0,0.6), inset 0 0 0 10px #191919',
          position: 'relative',
          fontFamily: FONT.family,
          color: COLORS.offWhite,
        }}
      >
        <div style={{position: 'absolute', left: 14, top: 14, width: 412, height: 872, borderRadius: 58, overflow: 'hidden', background: COLORS.charcoal}}>
          <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '6px 34px 0', fontWeight: FONT.bold, fontSize: 22}}>
            {time}
            <div style={{marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'flex-end'}}>
              {[8, 12, 16, 20].map((h) => (
                <div key={h} style={{width: 5, height: h * 0.8, borderRadius: 2, background: COLORS.offWhite}} />
              ))}
              <div style={{width: 34, height: 16, borderRadius: 5, border: `2px solid ${COLORS.offWhite}`, marginLeft: 8, padding: 2}}>
                <div style={{width: '70%', height: '100%', background: COLORS.offWhite, borderRadius: 2}} />
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 156, top: 14, width: 100, height: 30, borderRadius: 15, background: '#000'}} />
          {children}
        </div>
      </div>
    </div>
  );
};
