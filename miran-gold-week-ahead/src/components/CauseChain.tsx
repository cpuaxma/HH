import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, SPRING} from '../brand';
import {ArText} from './ArabicWordReveal';
import {lin} from './motion';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size?: number}> = ({dir, color, size = 26}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: dir === 'down' ? 'rotate(180deg)' : undefined}}>
    <path d="M12 4 L20 13 H15 V20 H9 V13 H4 Z" fill={color} />
  </svg>
);

/** A gold coin (SVG) that dips (red) or lifts (green). */
export const Coin: React.FC<{size: number; tint?: string; f: number}> = ({size, tint, f}) => {
  const spin = Math.cos(f / 26); // slow 3D-ish spin via scaleX
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scaleX(${0.75 + 0.25 * Math.abs(spin)})`, overflow: 'visible'}}>
      <defs>
        <radialGradient id="coinG" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="45%" stopColor={C.gold1} />
          <stop offset="100%" stopColor={C.gold2} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#coinG)" stroke={C.gold2} strokeWidth="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#FFF3C4" strokeOpacity="0.55" strokeWidth="2" />
      <text x="50" y="62" textAnchor="middle" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="34" fill={C.gold2}>
        Au
      </text>
      {tint ? <circle cx="50" cy="50" r="48" fill="none" stroke={tint} strokeWidth="4" opacity="0.8" /> : null}
    </svg>
  );
};

/**
 * One cause chain column: header chip, 4 steps linked by drawn arrows, outcome coin.
 * `start` = local frame the first step lands; steps every `every` frames.
 */
export const CauseColumn: React.FC<{
  header: string;
  steps: string[];
  tone: 'up' | 'down';
  start: number;
  every: number;
  dim?: number;
  width: number;
}> = ({header, steps, tone, start, every, dim = 0, width}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const col = tone === 'up' ? C.red : C.green;
  const headIn = spring({frame: f - (start - 18), fps, config: SPRING.pill});
  // dirs: inflation, rates, dollar, gold
  const dirs: ('up' | 'down')[] = tone === 'up' ? ['up', 'up', 'up', 'down'] : ['down', 'down', 'down', 'up'];
  const coinT = spring({frame: f - (start + every * 4), fps, config: {damping: 10, stiffness: 120}});
  const coinY = (tone === 'up' ? 26 : -26) * coinT + Math.sin(f / 20) * 3;
  return (
    <div dir="rtl" style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - dim * 0.55, filter: dim > 0 ? `saturate(${1 - dim * 0.6})` : undefined}}>
      <div
        style={{
          padding: '8px 22px',
          borderRadius: 999,
          border: `1.5px solid ${col}`,
          color: col,
          fontFamily: FONT.ar,
          fontWeight: 700,
          fontSize: 26,
          background: 'rgba(6,11,26,0.6)',
          opacity: headIn,
          transform: `scale(${0.8 + 0.2 * headIn})`,
          marginBottom: 18,
          whiteSpace: 'nowrap',
        }}
      >
        <ArText text={header} />
      </div>
      {steps.map((s, i) => {
        const at = start + i * every;
        const t = spring({frame: f - at, fps, config: SPRING.card});
        const isLast = i === steps.length - 1;
        const link = interpolate(f, [at - 14, at], [0, 1], {...CLAMP, easing: EASE.enter});
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <svg width={20} height={34} viewBox="0 0 20 34" style={{display: 'block'}}>
                <line x1={10} y1={0} x2={10} y2={26 * link} stroke={col} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
                {link > 0.95 ? <path d="M3 22 L10 32 L17 22" fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
              </svg>
            ) : null}
            <div
              style={{
                width: width - 20,
                minHeight: 74,
                borderRadius: 18,
                background: isLast ? `linear-gradient(180deg, ${col}26, ${col}10)` : 'rgba(11,24,56,0.72)',
                border: `1px solid ${isLast ? col : 'rgba(212,175,55,0.25)'}`,
                boxShadow: isLast ? `0 0 28px ${col}44` : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 22px',
                gap: 12,
                opacity: Math.min(1, t * 1.3),
                transform: `translateY(${(1 - t) * 26}px) scale(${0.92 + 0.08 * t})`,
              }}
            >
              <span style={{fontFamily: FONT.ar, fontWeight: isLast ? 700 : 500, fontSize: 29, color: C.text, lineHeight: 1.25}}>
                <ArText text={s} />
              </span>
              <span style={{transform: `scale(${lin(f, at + 4, at + 12)})`, display: 'inline-flex'}}>
                <Arrow dir={dirs[i]} color={col} />
              </span>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lin(f, start + every * 3, start + every * 3 + 14)}}>
        <div style={{transform: `translateY(${coinY}px)`, filter: `drop-shadow(0 0 18px ${col}66)`}}>
          <Coin size={86} tint={col} f={f} />
        </div>
      </div>
    </div>
  );
};
