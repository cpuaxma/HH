import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, LAYOUT, SPRING} from '../brand';
import type {Edition} from '../edition';
import {ArText, Bdi, goldText} from '../components/ArabicWordReveal';
import {LineChartDraw} from '../components/Charts';
import {Seesaw, Tank} from '../components/Explainers';
import {HalfClock} from '../components/DayStrip';
import {GlassCard, Source, Tag} from '../components/GlassCard';
import {Icon, PulseDot} from '../components/Icons';
import {enter, lin} from '../components/motion';
import {Burst} from './Part1';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CARD_LEFT = (1080 - LAYOUT.cardWidth) / 2 - 10;

/* ───────────── 7 · HOLIDAY: calendar + clock, then the liquidity tank ───────────── */
export const S7Holiday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = e.holiday;
  // phase A: two big tiles
  const thuIn = spring({frame: f, fps, config: SPRING.card});
  const stamp = spring({frame: f - 30, fps, config: {damping: 11, stiffness: 220, mass: 0.7}});
  const friIn = spring({frame: f - 112, fps, config: SPRING.card});
  const clock = interpolate(f, [122, 150], [0, 0.5], {...CLAMP, easing: EASE.move});
  const chip = spring({frame: f - 140, fps, config: SPRING.pill});
  const outA = interpolate(f, [168, 186], [0, 1], {...CLAMP, easing: EASE.exit});
  // phase B: tank drains → price line gets jumpy
  const bIn = spring({frame: f - 180, fps, config: SPRING.card});
  const drain = interpolate(f, [205, 262], [0.88, 0.28], {...CLAMP, easing: EASE.move});
  const link = enter(f, 258, 18);
  const lineDraw = interpolate(f, [268, 346], [0, 1], {...CLAMP, easing: EASE.move});
  const vals = Array.from({length: 36}, (_, i) => {
    const amp = i < 12 ? 5 : 5 + (i - 12) * 2.6;
    return 50 + Math.sin(i * 1.9) * amp + Math.sin(i * 0.7) * amp * 0.5;
  });
  const TILE_W = 370;
  const TILE_H = 470;
  const tile = (left: number, inT: number, children: React.ReactNode) => (
    <GlassCard
      tilt={6 * (1 - inT)}
      style={{
        position: 'absolute',
        left,
        top: 560,
        width: TILE_W,
        height: TILE_H,
        opacity: Math.min(1, inT * 1.6) * (1 - outA),
        transform: `translateY(${(1 - inT) * 70 - outA * 60}px) scale(${1 - outA * 0.08})`,
      }}
    >
      <div dir="rtl" style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, fontFamily: FONT.ar, color: C.text, position: 'relative'}}>
        {children}
      </div>
    </GlassCard>
  );
  return (
    <AbsoluteFill>
      {f < 190 ? (
        <>
          {tile(
            545,
            thuIn,
            <>
              <Icon name="calendar" size={190} color={C.label} t={f} stroke={2} />
              <span style={{fontSize: 52, fontWeight: 700}}>{h.thu.day}</span>
              <div
                style={{
                  position: 'absolute',
                  top: 150,
                  padding: '10px 24px',
                  border: `4px solid ${C.red}`,
                  borderRadius: 14,
                  color: C.red,
                  fontSize: 40,
                  fontWeight: 700,
                  background: 'rgba(6,11,26,0.75)',
                  transform: `rotate(-10deg) scale(${2.4 - 1.4 * stamp})`,
                  opacity: Math.min(1, stamp * 2),
                  boxShadow: `0 0 ${(1 - stamp) * 50}px ${C.red}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {h.thu.stamp}
              </div>
            </>,
          )}
          {tile(
            145,
            friIn,
            <>
              <div style={{filter: 'drop-shadow(0 0 22px rgba(212,175,55,0.45))'}}>
                <HalfClock size={190} color={C.gold0} fill={clock} />
              </div>
              <span style={{fontSize: 52, fontWeight: 700}}>{h.fri.day}</span>
              <div
                style={{
                  padding: '6px 22px',
                  borderRadius: 999,
                  background: GOLD,
                  color: C.bg0,
                  fontSize: 30,
                  fontWeight: 700,
                  opacity: chip,
                  transform: `scale(${0.6 + 0.4 * chip})`,
                }}
              >
                {h.fri.chip}
              </div>
            </>,
          )}
          <Source text={h.source} style={{position: 'absolute', top: 1050, left: 0, right: 0, textAlign: 'center', opacity: lin(f, 40, 60) * (1 - outA)}} />
        </>
      ) : null}

      {f >= 176 ? (
        <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, bIn * 1.5), transform: `translateY(${(1 - bIn) * 60}px)`}}>
          {/* tank (cause, right) */}
          <div dir="rtl" style={{position: 'absolute', left: 680, top: 556, width: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: FONT.ar, fontWeight: 700, fontSize: 36, color: C.text}}>
            <span>{h.liquidityLabel}</span>
            <svg width={30} height={30} viewBox="0 0 24 24" style={{transform: 'rotate(180deg)', opacity: lin(f, 210, 222)}}>
              <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={C.red} />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 690, top: 620}}>
            <Tank level={drain} f={f} width={210} height={400} />
          </div>
          {/* link arrow (RTL: cause → effect, right → left) */}
          <svg width={110} height={40} style={{position: 'absolute', left: 570, top: 800, overflow: 'visible'}}>
            <line x1={104} y1={20} x2={104 - 90 * link} y2={20} stroke={C.gold1} strokeWidth={4} strokeLinecap="round" />
            {link > 0.9 ? <path d="M22 8 L6 20 L22 32" fill="none" stroke={C.gold1} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
          {/* price line (effect, left) */}
          <div dir="rtl" style={{position: 'absolute', left: 150, top: 556, width: 400, textAlign: 'center', fontFamily: FONT.ar, fontWeight: 700, fontSize: 36, color: C.text, opacity: lin(f, 262, 276)}}>
            {h.priceLabel}
          </div>
          <div style={{position: 'absolute', left: 150, top: 690, opacity: lin(f, 262, 272)}}>
            <LineChartDraw id="liq" values={vals} min={0} max={100} width={400} height={260} color={C.gold0} progress={lineDraw} area={0.5 * lin(f, 330, 350)} strokeWidth={5} />
          </div>
          <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lin(f, 280, 296)}}>
            <Tag text={h.tag} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ───────────── 9 · JOBS REPORT: card + undecided seesaw ───────────── */
export const S9Nfp: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = e.nfp;
  const t = spring({frame: f, fps, config: SPRING.card});
  const sIn = spring({frame: f - 30, fps, config: SPRING.card});
  const q = spring({frame: f - 75, fps, config: {damping: 10, stiffness: 160}});
  const wob = 10 * Math.sin((f - 40) / 15) * lin(f, 40, 80);
  const glowQ = f > 150 ? 0.5 + 0.5 * Math.sin((f - 150) / 6) : 0;
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={6 * (1 - t)}
        style={{position: 'absolute', left: CARD_LEFT, top: 520, width: LAYOUT.cardWidth, height: 250, opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 80}px)`}}
      >
        <div dir="rtl" style={{padding: '0 36px', height: '100%', display: 'flex', alignItems: 'center', gap: 28, fontFamily: FONT.ar, color: C.text}}>
          <div style={{width: 128, height: 128, borderRadius: 30, background: 'rgba(212,175,55,0.12)', border: `1px solid ${C.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name="briefcase" size={80} color={C.gold0} t={f} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <span style={{fontSize: 46, fontWeight: 700, lineHeight: 1.2}}>{n.title}</span>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px', borderRadius: 999, background: 'rgba(212,175,55,0.12)', border: `1px solid ${C.glassBorder}`, alignSelf: 'flex-start'}}>
              <PulseDot f={f} color={C.gold0} size={10} />
              <span style={{fontSize: 28, fontWeight: 700}}>
                <ArText text={n.day} />
              </span>
              <span style={{color: C.label}}>·</span>
              <Bdi style={{fontSize: 28, fontWeight: 700}}>{n.time}</Bdi>
              <span style={{fontSize: 22, color: C.label}}>{n.timeZone}</span>
            </div>
          </div>
          <Source text={n.source} style={{position: 'absolute', left: 36, bottom: 18}} />
        </div>
      </GlassCard>
      <div style={{position: 'absolute', top: 820, left: 150, opacity: Math.min(1, sIn * 1.5), transform: `translateY(${(1 - sIn) * 50}px)`}}>
        <Seesaw angle={wob} f={f} dollarLabel={e.seesaw.dollar} goldLabel={e.seesaw.gold} />
        {/* the big "?" over the pivot */}
        <div
          style={{
            position: 'absolute',
            left: 380 - 58,
            top: 40,
            width: 116,
            height: 116,
            borderRadius: '50%',
            background: 'rgba(11,24,56,0.9)',
            border: `2px solid ${C.gold1}`,
            boxShadow: `0 0 ${24 + glowQ * 36}px rgba(212,175,55,${0.35 + glowQ * 0.35})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.ar,
            fontWeight: 700,
            fontSize: 76,
            opacity: Math.min(1, q * 1.5),
            transform: `scale(${q})`,
          }}
        >
          <span style={goldText()}>؟</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 10 · COLLAPSE → LOGO ───────────── */
export const LOGO_C = {x: 540, y: 760, size: 330};

export const S10Collapse: React.FC = () => {
  const f = useCurrentFrame();
  const lineW = interpolate(f, [0, 14, 24, 42], [0, 820, 820, 0], {...CLAMP, easing: EASE.move});
  const lineOp = interpolate(f, [0, 4, 40, 46], [0, 1, 1, 0], CLAMP);
  const ring = interpolate(f, [30, 88], [0, 1], {...CLAMP, easing: EASE.move});
  const logoIn = interpolate(f, [80, 98], [0, 1], {...CLAMP, easing: EASE.enter});
  const flash = interpolate(f, [88, 92, 120], [0, 0.55, 0], CLAMP);
  const r = LOGO_C.size / 2 + 6;
  const circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 540 - lineW / 2,
          top: LOGO_C.y + r - 3,
          width: lineW,
          height: 6,
          borderRadius: 3,
          background: GOLD,
          boxShadow: '0 0 24px rgba(247,222,140,0.9), 0 0 70px rgba(212,175,55,0.5)',
          opacity: lineOp,
        }}
      />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.gold0} />
            <stop offset="50%" stopColor={C.gold1} />
            <stop offset="100%" stopColor={C.gold2} />
          </linearGradient>
        </defs>
        <circle
          cx={LOGO_C.x}
          cy={LOGO_C.y}
          r={r}
          fill="none"
          stroke="url(#ringG)"
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ring)}
          transform={`rotate(90 ${LOGO_C.x} ${LOGO_C.y})`}
          style={{filter: 'drop-shadow(0 0 12px rgba(247,222,140,0.8))'}}
          opacity={1 - logoIn * 0.6}
        />
      </svg>
      <LogoMark f={f} op={logoIn} scale={0.9 + 0.1 * logoIn} />
      <AbsoluteFill style={{background: `radial-gradient(40% 25% at 50% ${(LOGO_C.y / 1920) * 100}%, rgba(255,240,200,${flash}), transparent)`}} />
    </AbsoluteFill>
  );
};

export const LogoMark: React.FC<{f: number; op: number; scale: number; sheenAt?: number}> = ({f, op, scale, sheenAt}) => {
  const sheen = sheenAt === undefined ? -1 : interpolate(f, [sheenAt, sheenAt + 40], [-40, 140], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: LOGO_C.x - LOGO_C.size / 2,
        top: LOGO_C.y - LOGO_C.size / 2,
        width: LOGO_C.size,
        height: LOGO_C.size,
        borderRadius: '50%',
        overflow: 'hidden',
        opacity: op,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${50 + 20 * Math.sin(f / 16)}px rgba(212,175,55,0.45)`,
      }}
    >
      <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
      {sheen > -40 && sheen < 140 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 14}%, rgba(255,248,220,0.55) ${sheen}%, rgba(255,255,255,0) ${sheen + 14}%)`,
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </div>
  );
};

/* ───────────── 11 · OUTRO (EN) ───────────── */
export const S11Outro: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = e.outro;
  const arrowDraw = interpolate(f, [0, 50], [0, 1], {...CLAMP, easing: EASE.move});
  const line = (at: number) => {
    const t = spring({frame: f - at, fps, config: SPRING.pill});
    return {opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 30}px)`, filter: t < 0.7 ? `blur(${(0.7 - t) * 10}px)` : undefined};
  };
  const btn = spring({frame: f - 120, fps, config: SPRING.pill});
  const pulse = f > 130 ? (Math.sin((f - 130) / 9) + 1) / 2 : 0;
  const arrowLen = 1500;
  return (
    <AbsoluteFill>
      {/* big diagonal gold arrow mark behind */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="arrowG" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={C.gold2} stopOpacity={0} />
            <stop offset="60%" stopColor={C.gold1} stopOpacity={0.16} />
            <stop offset="100%" stopColor={C.gold0} stopOpacity={0.26} />
          </linearGradient>
        </defs>
        <path
          d="M -60 1560 L 380 1120 L 560 1260 L 1000 760"
          fill="none"
          stroke="url(#arrowG)"
          strokeWidth={70}
          strokeLinejoin="miter"
          strokeDasharray={arrowLen}
          strokeDashoffset={arrowLen * (1 - arrowDraw)}
        />
        <path d="M 860 740 L 1040 720 L 1020 900 Z" fill={C.gold0} opacity={0.24 * lin(f, 40, 56)} />
      </svg>
      <LogoMark f={f} op={1} scale={1 + 0.015 * Math.sin(f / 30)} sheenAt={4} />
      <div style={{position: 'absolute', top: 990, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.en}}>
        <div style={{fontSize: 70, fontWeight: 600, color: C.text, lineHeight: 1.15, ...line(24)}}>{o.l1}</div>
        <div style={{fontSize: 70, fontWeight: 700, lineHeight: 1.25, ...line(60)}}>
          <span style={goldText(interpolate(f, [90, 130], [0, 1], CLAMP))}>{o.l2}</span>
        </div>
        <div style={{fontSize: 30, fontWeight: 500, color: C.label, marginTop: 22, letterSpacing: 1, ...line(90)}}>{o.brand}</div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 40}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px 44px',
              borderRadius: 999,
              background: GOLD,
              color: C.bg0,
              fontSize: 36,
              fontWeight: 700,
              opacity: btn,
              transform: `scale(${(0.6 + 0.4 * btn) * (1 + pulse * 0.04)})`,
              boxShadow: `0 0 ${24 + pulse * 40}px rgba(212,175,55,${0.4 + pulse * 0.3}), inset 0 1px 0 rgba(255,255,255,0.6)`,
            }}
          >
            <Icon name="plane" size={40} color={C.bg0} stroke={3} />
            {o.cta}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: LAYOUT.disclaimerY, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.en, fontSize: 24, color: C.text, opacity: 0.6 * lin(f, 140, 160), fontStyle: 'italic'}}>
        {o.disclaimer}
      </div>
      <Burst at={0} x={LOGO_C.x} y={LOGO_C.y} count={34} seed="outro" />
    </AbsoluteFill>
  );
};

export {enter};
