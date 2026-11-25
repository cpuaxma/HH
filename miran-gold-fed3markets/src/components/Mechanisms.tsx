// Mechanism visuals: Coin, DiscountTimeline, SectorMosaic, BalanceScale (+ GoldBar, BondCard).
import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT, GOLD_GRADIENT} from '../brand';
import {clamp, hexA, mixHex, noise, springAt} from '../motion';

export const Coin: React.FC<{size: number; tint?: number; label?: string}> = ({size, tint = 0, label = '$'}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${C.gold1} 0%, ${C.gold2} 45%, ${C.gold3} 100%)`,
      boxShadow: `inset 0 -${size * 0.06}px ${size * 0.1}px rgba(0,0,0,0.35), inset 0 ${size * 0.04}px ${size * 0.06}px rgba(255,255,255,0.35), 0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.45)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: tint > 0 ? `saturate(${1 - tint * 0.5}) brightness(${1 - tint * 0.2})` : undefined,
      position: 'relative',
    }}
  >
    <div style={{position: 'absolute', inset: size * 0.09, borderRadius: '50%', border: `${Math.max(1, size * 0.03)}px solid ${hexA(C.gold3, 0.7)}`}} />
    <span style={{fontFamily: FONT.en, fontWeight: 700, fontSize: size * 0.46, color: hexA('#5A3F0E', 0.85), lineHeight: 1}}>{label}</span>
  </div>
);

export const YEARS = [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

/** Present value of each future year's earnings at rate r, as a coin scale (exaggerated for clarity). */
export const pvScale = (t: number, r: number) => Math.pow(1 + r, -t * 1.15);

export const DiscountTimeline: React.FC<{frame: number; coinsIn: number; discountAt: number; w?: number}> = ({frame, coinsIn, discountAt, w = 800}) => {
  const base = 86;
  const rLow = 0.04;
  const rHigh = 0.1;
  const slider = interpolate(frame, [discountAt - 10, discountAt + 30], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const rate = rLow + (rHigh - rLow) * slider;
  const step = w / YEARS.length;
  return (
    <div style={{position: 'relative', width: w, height: 420}}>
      {/* discount slider (fills right → left) */}
      <div dir="rtl" style={{position: 'absolute', top: 0, right: 0, left: 0, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 26, color: C.slate, whiteSpace: 'nowrap'}}>معدل الخصم</div>
        <div style={{position: 'relative', flex: 1, height: 14, borderRadius: 7, background: hexA(C.slate, 0.2)}}>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${(rate / 0.12) * 100}%`,
              borderRadius: 7,
              background: `linear-gradient(270deg, ${C.nasdaq}, ${mixHex(C.nasdaq, C.red, slider)})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -9,
              right: `calc(${(rate / 0.12) * 100}% - 16px)`,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: C.text,
              boxShadow: `0 0 ${10 + slider * 16}px ${hexA(mixHex(C.nasdaq, C.red, slider), 0.8)}`,
            }}
          />
        </div>
      </div>
      {/* timeline rail */}
      <div style={{position: 'absolute', top: 236, left: 20, right: 20, height: 2, background: `linear-gradient(270deg, ${hexA(C.nasdaq, 0.7)}, ${hexA(C.nasdaq, 0.1)})`}} />
      {YEARS.map((y, i) => {
        const t = i + 1;
        const appear = springAt(frame, coinsIn + i * 4, {damping: 14, stiffness: 170});
        // domino: near (right) coins shrink first, each one more than the last
        const d = interpolate(frame, [discountAt + i * 5, discountAt + i * 5 + 22], [0, 1], {...clamp, easing: (q) => 1 - Math.pow(1 - q, 3)});
        const sBefore = pvScale(t, rLow);
        const sAfter = pvScale(t, rHigh);
        const s = sBefore + (sAfter - sBefore) * d;
        const cx = w - step / 2 - i * step; // RTL: 2027 on the right
        const size = base * s;
        return (
          <div key={y} style={{position: 'absolute', left: cx - base / 2, top: 236 - base / 2, width: base, height: base, opacity: Math.min(1, appear * 1.5)}}>
            {/* ghost of the pre-hike size */}
            <div
              style={{
                position: 'absolute',
                left: (base - base * sBefore) / 2,
                top: (base - base * sBefore) / 2,
                width: base * sBefore,
                height: base * sBefore,
                borderRadius: '50%',
                border: `2px dashed ${hexA(C.gold1, 0.35 * d)}`,
              }}
            />
            <div style={{position: 'absolute', left: (base - size) / 2, top: (base - size) / 2, transform: `scale(${appear})`}}>
              <Coin size={size} tint={d * (t / 9)} />
            </div>
            <div style={{position: 'absolute', top: base + 26, left: -20, right: -20, textAlign: 'center', fontFamily: FONT.en, fontWeight: 600, fontSize: 20, color: C.slate}}>{y}</div>
          </div>
        );
      })}
      <div dir="rtl" style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 22, color: C.slate}}>
        <span>أرباح قريبة</span>
        <span>أرباح بعيدة</span>
      </div>
    </div>
  );
};

export type Tile = {key: string; ar: string; x: number; y: number; w: number; h: number; state: 'red' | 'green' | 'neutral'};

const ROWS: {h: number; tiles: {key: string; ar: string; w: number; state: Tile['state']}[]}[] = [
  {
    h: 220,
    tiles: [
      {key: 'tech', ar: 'تقنية', w: 420, state: 'red'},
      {key: 'comm', ar: 'اتصالات', w: 180, state: 'red'},
      {key: 'disc', ar: 'استهلاكي', w: 180, state: 'red'},
    ],
  },
  {
    h: 150,
    tiles: [
      {key: 'banks', ar: 'بنوك ومالية', w: 260, state: 'green'},
      {key: 'health', ar: 'صحة', w: 190, state: 'neutral'},
      {key: 'ind', ar: 'صناعة', w: 160, state: 'neutral'},
      {key: 'energy', ar: 'طاقة', w: 160, state: 'neutral'},
    ],
  },
  {
    h: 130,
    tiles: [
      {key: 'staples', ar: 'سلع أساسية', w: 192, state: 'neutral'},
      {key: 'util', ar: 'مرافق', w: 192, state: 'neutral'},
      {key: 're', ar: 'عقارات', w: 192, state: 'neutral'},
      {key: 'mat', ar: 'مواد', w: 194, state: 'neutral'},
    ],
  },
];

/** 11 sector tiles laid out right → left (RTL), treemap-style (sizes are illustrative). */
export const TILES: Tile[] = (() => {
  const gap = 10;
  const out: Tile[] = [];
  let y = 0;
  ROWS.forEach((row) => {
    let right = 800;
    row.tiles.forEach((t) => {
      out.push({...t, x: right - t.w, y, w: t.w, h: row.h});
      right -= t.w + gap;
    });
    y += row.h + gap;
  });
  return out;
})();

export const SectorMosaic: React.FC<{frame: number; tilesIn: number; redAt: number; greenAt: number}> = ({frame, tilesIn, redAt, greenAt}) => (
  <div style={{position: 'relative', width: 800, height: 520}}>
    {TILES.map((t, i) => {
      const appear = springAt(frame, tilesIn + i * 4, {damping: 15, stiffness: 160});
      const ripple = t.y / 4; // pulse arrives row by row
      const red = t.state === 'red' ? interpolate(frame, [redAt + ripple, redAt + ripple + 10], [0, 1], clamp) : 0;
      const greenRaw = t.state === 'green' ? interpolate(frame, [greenAt, greenAt + 24], [0, 1], clamp) : 0;
      const flicker = t.state === 'green' && frame >= greenAt && frame < greenAt + 24 ? (noise(t.x, frame * 0.9) > 0 ? 1 : 0.35) : 1;
      const green = greenRaw * flicker;
      const neutralHit = t.state === 'neutral' ? interpolate(frame - redAt - ripple, [0, 4, 30], [0, 1, 0], clamp) : 0;
      const drop = red * 10;
      const border = t.state === 'red' ? mixHex('#3A4C7A', C.red, red) : t.state === 'green' ? mixHex('#3A4C7A', C.green, green) : '#3A4C7A';
      const bg = t.state === 'red' ? hexA(C.red, 0.06 + 0.2 * red) : t.state === 'green' ? hexA(C.green, 0.05 + 0.18 * green) : hexA('#13234F', 0.7);
      const big = t.w * t.h > 60000;
      return (
        <div
          key={t.key}
          dir="rtl"
          style={{
            position: 'absolute',
            left: t.x,
            top: t.y,
            width: t.w,
            height: t.h,
            borderRadius: 18,
            background: bg,
            border: `1.5px solid ${border}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 ${24 * Math.max(red, green)}px ${hexA(t.state === 'green' ? C.green : C.red, 0.35 * Math.max(red, green))}`,
            opacity: Math.min(1, appear * 1.4),
            transform: `translateY(${(1 - appear) * 40 + drop}px) scale(${0.9 + 0.1 * appear + neutralHit * 0.02})`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: big ? 40 : 26, color: C.text, whiteSpace: 'nowrap'}}>{t.ar}</div>
          <div style={{alignSelf: 'flex-end', height: 40, fontFamily: FONT.en, fontWeight: 700, fontSize: big ? 44 : 32, lineHeight: 1, color: t.state === 'red' ? C.red : t.state === 'green' ? C.green : C.slate, opacity: Math.max(red, green, t.state === 'neutral' ? interpolate(frame, [redAt + 20, redAt + 34], [0, 0.8], clamp) : 0)}}>
            {t.state === 'red' ? '↓' : t.state === 'green' ? '↑' : ''}
          </div>
        </div>
      );
    })}
  </div>
);

export const GoldBar: React.FC<{w: number; frame: number}> = ({w, frame}) => {
  const h = w * 0.42;
  const sheen = ((frame % 140) / 140) * 260 - 80;
  return (
    <svg width={w} height={h} viewBox="0 0 200 84" style={{overflow: 'visible', filter: `drop-shadow(0 14px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 22px ${hexA(C.gold2, 0.35)})`}}>
      <defs>
        <linearGradient id="barTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold1} />
          <stop offset="60%" stopColor={C.gold2} />
          <stop offset="100%" stopColor={C.gold3} />
        </linearGradient>
        <linearGradient id="barFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold2} />
          <stop offset="100%" stopColor="#7A5A12" />
        </linearGradient>
        <linearGradient id="barSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset={`${Math.max(0, sheen - 15) / 2}%`} stopColor="#FFF6D8" stopOpacity={0} />
          <stop offset={`${Math.max(0, sheen) / 2}%`} stopColor="#FFF6D8" stopOpacity={0.6} />
          <stop offset={`${Math.max(0, sheen + 15) / 2}%`} stopColor="#FFF6D8" stopOpacity={0} />
        </linearGradient>
        <clipPath id="barClip">
          <path d="M30 6 L170 6 L196 40 L4 40 Z" />
          <path d="M4 40 L196 40 L196 80 L4 80 Z" />
        </clipPath>
      </defs>
      <path d="M30 6 L170 6 L196 40 L4 40 Z" fill="url(#barTop)" />
      <path d="M4 40 L196 40 L196 80 L4 80 Z" fill="url(#barFront)" />
      <rect x={0} y={0} width={200} height={84} fill="url(#barSheen)" clipPath="url(#barClip)" />
      <text x={100} y={30} textAnchor="middle" fontFamily={FONT.en} fontWeight={700} fontSize={14} letterSpacing={2} fill="#6E4F10" opacity={0.8}>
        GOLD
      </text>
    </svg>
  );
};

export const BondCard: React.FC<{w: number}> = ({w}) => (
  <div
    dir="rtl"
    style={{
      width: w,
      height: w * 0.62,
      borderRadius: 18,
      background: `linear-gradient(160deg, #F3F0E8 0%, #D9D3C2 100%)`,
      boxShadow: '0 16px 30px rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{position: 'absolute', top: 10, bottom: 10, left: 10, right: 10, borderRadius: 12, border: '2px dashed rgba(6,11,26,0.25)'}} />
    <div style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: w * 0.2, color: C.ink, lineHeight: 1.1}}>
      <bdi dir="ltr">%</bdi> عائد
    </div>
    <div style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: w * 0.1, color: hexA(C.ink, 0.6)}}>سندات</div>
  </div>
);

/** Balance scale. `angle` in degrees (+ = right side down). Gold bar on the right pan (RTL primary). */
export const BalanceScale: React.FC<{frame: number; angle: number; bondY: number; bondOpacity: number; appear: number}> = ({frame, angle, bondY, bondOpacity, appear}) => {
  const W = 800;
  const px = W / 2;
  const py = 120;
  const L = 270;
  const th = (angle * Math.PI) / 180;
  const left = {x: px - L * Math.cos(th), y: py - L * Math.sin(th)};
  const right = {x: px + L * Math.cos(th), y: py + L * Math.sin(th)};
  const string = 150;
  const panW = 230;
  const Pan: React.FC<{x: number; y: number}> = ({x, y}) => (
    <g>
      <line x1={x} y1={y} x2={x - panW / 2 + 16} y2={y + string} stroke={hexA(C.gold1, 0.6)} strokeWidth={2} />
      <line x1={x} y1={y} x2={x + panW / 2 - 16} y2={y + string} stroke={hexA(C.gold1, 0.6)} strokeWidth={2} />
      <path d={`M${x - panW / 2} ${y + string} Q${x} ${y + string + 40} ${x + panW / 2} ${y + string} Z`} fill="url(#panGold)" />
      <circle cx={x} cy={y} r={7} fill={C.gold2} />
    </g>
  );
  return (
    <div style={{position: 'relative', width: W, height: 500, opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`}}>
      <svg width={W} height={560} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="panGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold1} />
            <stop offset="100%" stopColor={C.gold3} />
          </linearGradient>
          <linearGradient id="pillar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2A3A6A" />
            <stop offset="50%" stopColor="#4A5E96" />
            <stop offset="100%" stopColor="#2A3A6A" />
          </linearGradient>
        </defs>
        <rect x={px - 9} y={py} width={18} height={350} rx={6} fill="url(#pillar)" />
        <path d={`M${px - 120} 494 L${px + 120} 494 L${px + 90} 466 L${px - 90} 466 Z`} fill="url(#pillar)" />
        <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke="url(#panGold)" strokeWidth={10} strokeLinecap="round" />
        <circle cx={px} cy={py} r={18} fill={C.gold2} stroke={C.gold1} strokeWidth={3} />
        <path d={`M${px - 14} ${py - 60} L${px + 14} ${py - 60} L${px} ${py - 16} Z`} fill={C.gold2} opacity={0.9} />
        <Pan x={left.x} y={left.y} />
        <Pan x={right.x} y={right.y} />
      </svg>
      {/* gold bar sits on the right pan */}
      <div style={{position: 'absolute', left: right.x - 90, top: right.y + string - 76}}>
        <GoldBar w={180} frame={frame} />
      </div>
      {/* bond card drops onto the left pan */}
      <div style={{position: 'absolute', left: left.x - 90, top: left.y + string - 112 + bondY, opacity: bondOpacity, transform: `rotate(${bondY / -40}deg)`}}>
        <BondCard w={180} />
      </div>
    </div>
  );
};

export const GOLD_TEXT: React.CSSProperties = {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
