import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, LAYOUT, SPRING} from '../brand';
import type {Edition} from '../edition';
import {ArText, Bdi, goldText} from '../components/ArabicWordReveal';
import {BarChartQ, LineChartDraw} from '../components/Charts';
import {HalfClock} from '../components/DayStrip';
import {GlassCard, Source, Tag} from '../components/GlassCard';
import {Icon, PulseDot} from '../components/Icons';
import {NodeConstellation} from '../components/NodeConstellation';
import {enter, lin} from '../components/motion';
import {Burst} from './Part1';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CARD_LEFT = (1080 - LAYOUT.cardWidth) / 2 - 10;

/* ───────────── 7 · HOLIDAY ───────────── */
export const S7Holiday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = e.holiday;
  const t = spring({frame: f, fps, config: SPRING.card});
  const stamp = spring({frame: f - 30, fps, config: {damping: 11, stiffness: 220, mass: 0.7}});
  const friIn = spring({frame: f - 110, fps, config: SPRING.card});
  const clock = interpolate(f, [120, 150], [0, 0.5], {...CLAMP, easing: EASE.move});
  const thin = interpolate(f, [180, 220], [0, 1], {...CLAMP, easing: EASE.move});
  const lineDraw = interpolate(f, [230, 320], [0, 1], {...CLAMP, easing: EASE.move});
  const panelIn = lin(f, 160, 180);
  // a price line whose wiggle grows where liquidity thins (illustrative)
  const vals = Array.from({length: 40}, (_, i) => {
    const amp = i < 22 ? 4 : 4 + (i - 22) * 2.2;
    return 50 + Math.sin(i * 1.7) * amp + Math.sin(i * 0.6) * amp * 0.6;
  });
  const row = (children: React.ReactNode, op: number, y: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 128, opacity: op, transform: `translateY(${y}px)`}}>{children}</div>
  );
  const iconBox = (child: React.ReactNode, tone: string) => (
    <div style={{width: 84, height: 84, borderRadius: 22, background: `${tone}1F`, border: `1px solid ${tone}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      {child}
    </div>
  );
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={6 * (1 - t)}
        style={{position: 'absolute', left: CARD_LEFT, top: 520, width: LAYOUT.cardWidth, height: 730, opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 80}px)`}}
      >
        <div dir="rtl" style={{padding: '22px 36px', fontFamily: FONT.ar, color: C.text, position: 'relative', height: '100%', boxSizing: 'border-box'}}>
          {row(
            <>
              {iconBox(<Icon name="calendarOff" size={50} color={C.red} t={f} />, C.red)}
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>
                  <ArText text={h.thu.day} />
                </span>
                <span style={{fontSize: 40, fontWeight: 700, lineHeight: 1.25}}>{h.thu.title}</span>
                <span style={{fontSize: 25, color: C.label, fontWeight: 500}}>{h.thu.detail}</span>
              </div>
              <div
                style={{
                  marginRight: 'auto',
                  padding: '8px 20px',
                  border: `3px solid ${C.red}`,
                  borderRadius: 12,
                  color: C.red,
                  fontSize: 32,
                  fontWeight: 700,
                  transform: `rotate(-8deg) scale(${2.2 - 1.2 * stamp})`,
                  opacity: Math.min(1, stamp * 2),
                  boxShadow: `0 0 ${(1 - stamp) * 40}px ${C.red}`,
                  background: 'rgba(255,90,95,0.08)',
                  whiteSpace: 'nowrap',
                }}
              >
                {h.thu.stamp}
              </div>
            </>,
            lin(f, 4, 20),
            0,
          )}
          <div style={{height: 1, background: 'rgba(212,175,55,0.2)', margin: '6px 0'}} />
          {row(
            <>
              {iconBox(<HalfClock size={52} color={C.gold0} fill={clock} />, C.gold1)}
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>
                  <ArText text={h.fri.day} />
                </span>
                <span style={{fontSize: 40, fontWeight: 700, lineHeight: 1.25}}>{h.fri.title}</span>
                <span style={{fontSize: 25, color: C.label, fontWeight: 500}}>{h.fri.detail}</span>
              </div>
              <div
                style={{
                  marginRight: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 18px',
                  borderRadius: 999,
                  background: 'rgba(212,175,55,0.12)',
                  border: `1px solid ${C.glassBorder}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <PulseDot f={f} color={C.gold0} size={10} />
                <Bdi style={{fontSize: 32, fontWeight: 700}}>{h.fri.time}</Bdi>
                <span style={{fontSize: 22, color: C.label, fontWeight: 500}}>{h.fri.timeZone}</span>
              </div>
            </>,
            Math.min(1, friIn * 1.5),
            (1 - friIn) * 30,
          )}
          {/* liquidity panel */}
          <div style={{marginTop: 16, opacity: panelIn, position: 'relative'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <span style={{fontSize: 28, fontWeight: 700}}>{h.liquidityLabel}</span>
              <Tag text={h.tag} />
            </div>
            <div style={{position: 'relative', height: 250}}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px'}}>
                {e.days.map((d, i) => {
                  const full = 1;
                  const target = h.liquidity[i] ?? 1;
                  const v = full + (target - full) * thin;
                  const grow = spring({frame: f - (166 + i * 5), fps, config: SPRING.bar});
                  const low = target < 0.6;
                  return (
                    <div key={d.key} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 110}}>
                      <div
                        style={{
                          width: 64,
                          height: 120 * v * grow,
                          borderRadius: '12px 12px 4px 4px',
                          background: low && thin > 0.3 ? `linear-gradient(180deg, ${C.label}, rgba(138,147,173,0.25))` : `linear-gradient(180deg, ${C.gold0}, ${C.gold2})`,
                          opacity: low ? 1 - thin * 0.3 : 0.85,
                        }}
                      />
                      <span style={{fontSize: 22, color: low ? C.text : C.label, fontWeight: low ? 700 : 500}}>{d.ar}</span>
                    </div>
                  );
                })}
              </div>
              {/* jumpy price line drawn over the thin days (right → left in time, like the strip) */}
              <div style={{position: 'absolute', left: 20, top: 0, transform: 'scaleX(-1)', opacity: lin(f, 226, 236)}}>
                <LineChartDraw id="liq" values={vals} min={0} max={100} width={700} height={84} color={C.gold0} progress={lineDraw} area={0} strokeWidth={4} />
              </div>
            </div>
          </div>
          <Source text={h.source} style={{position: 'absolute', left: 36, bottom: 18}} />
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};

/* ───────────── 9 · NFP + CONSTELLATION ───────────── */
export const S9Nfp: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = e.nfp;
  const t = spring({frame: f, fps, config: SPRING.card});
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={6 * (1 - t)}
        style={{position: 'absolute', left: CARD_LEFT, top: 520, width: LAYOUT.cardWidth, height: 400, opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 80}px)`}}
      >
        <div dir="rtl" style={{padding: '24px 36px', fontFamily: FONT.ar, color: C.text, display: 'flex', gap: 24, height: '100%', boxSizing: 'border-box'}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Icon name="briefcase" size={40} color={C.gold0} t={f} />
                <span style={{fontSize: 28, color: C.label, fontWeight: 500}}>
                  <ArText text={n.day} />
                </span>
              </div>
              <div style={{fontSize: 40, fontWeight: 700, lineHeight: 1.3, marginTop: 8}}>{n.title}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 6}}>
                <span style={{fontFamily: FONT.en, fontWeight: 700, fontSize: 34, ...goldText()}}>{n.ticker}</span>
                <span style={{fontSize: 24, color: C.label}}>· {n.subtitle}</span>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px', borderRadius: 999, background: 'rgba(212,175,55,0.12)', border: `1px solid ${C.glassBorder}`}}>
                <PulseDot f={f} color={C.gold0} size={10} />
                <Bdi style={{fontSize: 30, fontWeight: 700}}>{n.time}</Bdi>
                <span style={{fontSize: 22, color: C.label}}>{n.timeZone}</span>
              </div>
            </div>
            <Source text={n.source} />
          </div>
          <BarChartQ bars={n.bars} max={250} start={30} qAt={75} width={320} height={330} barWidth={74} />
        </div>
      </GlassCard>
      <div style={{position: 'absolute', left: 130, top: 930}}>
        <NodeConstellation nodes={n.nodes} centre={n.centre} start={100} width={800} height={330} />
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
