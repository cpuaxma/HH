import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {COLORS, FONT, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {HEART_PHASE, getWorld} from '../lib/director';
import {toArabicDigits} from '../lib/arabic';
import {heartbeatShape} from '../lib/motion';
import {useTextOnly} from './Debug';

/** Heart-rate counter (Eastern digits) with a live ECG trace. Bottom-right corner of the safe zone. */
const HeartRate: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);
  const textOnly = useTextOnly();
  const cold = frame < 88;
  const bpm = cold ? TEXT.coldOpen.heartRate : Math.round(w.bpm);
  // the cold-open counter flickers like a failing monitor
  const flicker = cold ? (random(`hr-fl-${Math.floor(frame / 2)}`) > 0.78 ? 0.3 : 1) : 1;
  const beat = Math.min(1, heartbeatShape(w.heart));
  const hot = Math.min(1, Math.max(0, (w.bpm - 95) / 45));
  const color = `rgb(${245 + 10 * hot}, ${215 - 150 * hot}, ${122 - 70 * hot})`;

  // the trace: last ~2.4 s of the heartbeat, newest at the left (RTL reading)
  const N = 72;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const f = Math.max(0, frame - i);
    const v = heartbeatShape(HEART_PHASE[f]);
    pts.push(`${(i / (N - 1)) * 230},${40 - v * 30}`);
  }

  return (
    <div style={{position: 'absolute', right: 100, top: 1414, width: 250, height: 140, opacity: opacity * flicker, direction: 'rtl'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-start'}}>
        <div
          style={{
            fontFamily,
            fontWeight: FONT.weightBold,
            fontSize: 64,
            lineHeight: 1,
            color,
            textShadow: `0 0 ${10 + beat * 16}px rgba(255,${120 - 80 * hot},60,${0.35 + 0.3 * hot})`,
          }}
        >
          {toArabicDigits(bpm)}
        </div>
        {textOnly ? null : (
          <div style={{width: 18, height: 18, borderRadius: 9, background: color, transform: `scale(${0.7 + beat * 0.6})`, boxShadow: `0 0 ${8 + beat * 14}px ${color}`}} />
        )}
        <div style={{fontFamily, fontWeight: FONT.weightRegular, fontSize: 26, color: COLORS.textMuted, marginTop: 8}}>{TEXT.hud.bpmUnit}</div>
      </div>
      {textOnly ? null : (
        <svg width={230} height={48} style={{display: 'block', marginTop: 8}} viewBox="0 0 230 48">
          <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" opacity={0.9} />
          <circle cx={0} cy={40 - heartbeatShape(w.heart) * 30} r={4} fill="#fff" />
        </svg>
      )}
    </div>
  );
};

/** Fear/greed gauge: the needle swings between «خوف» and «طمع». Bottom-left corner of the safe zone. */
const Gauge: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);
  const textOnly = useTextOnly();
  const cx = 120;
  const cy = 112;
  const r = 96;
  // smooth the needle a little and give it a tiny tremor when afraid
  const g = Math.max(-1, Math.min(1, w.greed + (w.greed < -0.5 ? Math.sin(frame * 1.7) * 0.03 : 0)));
  const ang = (g * 90 * Math.PI) / 180; // -90 = left (fear), +90 = right (greed)
  const nx = cx + Math.sin(ang) * (r - 14);
  const ny = cy - Math.cos(ang) * (r - 14);
  const arc = (a0: number, a1: number) => {
    const p0 = [cx + Math.sin(a0) * r, cy - Math.cos(a0) * r];
    const p1 = [cx + Math.sin(a1) * r, cy - Math.cos(a1) * r];
    return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`;
  };
  const fearK = Math.max(0, -g);
  const greedK = Math.max(0, g);
  return (
    <div style={{position: 'absolute', left: 100, top: 1400, width: 240, height: 160, opacity}}>
      {textOnly ? null : (
        <svg width={240} height={124} viewBox="0 0 240 124" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="gauge" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#FF3B3B" />
              <stop offset="0.45" stopColor="#FFA436" />
              <stop offset="0.75" stopColor={COLORS.gold} />
              <stop offset="1" stopColor={COLORS.green} />
            </linearGradient>
          </defs>
          <path d={arc(-Math.PI / 2, Math.PI / 2)} stroke="rgba(255,255,255,0.12)" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d={arc(-Math.PI / 2, Math.PI / 2)} stroke="url(#gauge)" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={5} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))'}} />
          <circle cx={cx} cy={cy} r={9} fill="#fff" />
        </svg>
      )}
      <div style={{position: 'absolute', left: 0, top: 116, width: 60, textAlign: 'center', fontFamily, fontWeight: FONT.weightBold, fontSize: 28, color: fearK > 0.4 ? '#FF6B5E' : COLORS.textMuted, opacity: 0.75 + fearK * 0.25}}>
        {TEXT.hud.fear}
      </div>
      <div style={{position: 'absolute', left: 180, top: 116, width: 60, textAlign: 'center', fontFamily, fontWeight: FONT.weightBold, fontSize: 28, color: greedK > 0.4 ? COLORS.goldLight : COLORS.textMuted, opacity: 0.75 + greedK * 0.25}}>
        {TEXT.hud.greed}
      </div>
    </div>
  );
};

export const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);
  if (w.hud <= 0.001) return null;
  // quieter while the question is asked
  const dim = frame >= 150 && frame < 240 ? 0.7 : 1;
  const intro = Math.min(1, frame / 3);
  const textOnly = useTextOnly();
  return (
    <>
      {textOnly ? null : (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1330,
            height: 330,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
            opacity: w.hud * intro,
          }}
        />
      )}
      <HeartRate opacity={w.hud * dim * intro} />
      <Gauge opacity={w.hud * dim * intro} />
    </>
  );
};
