import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, LAYOUT, NUM, SPRING} from '../brand';
import type {Edition} from '../edition';
import {ArText, Bdi, goldText} from '../components/ArabicWordReveal';
import {BarChartQ, CountUp, Gauge, LineChartDraw} from '../components/Charts';
import {CauseColumn} from '../components/CauseChain';
import {GlassCard, Source, Tag} from '../components/GlassCard';
import {Icon, PulseDot} from '../components/Icons';
import {enter, lin} from '../components/motion';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CARD_LEFT = (1080 - LAYOUT.cardWidth) / 2 - 10; // nudged left, away from the action rail

/** Gold particle burst (coins/flecks), deterministic. */
export const Burst: React.FC<{at: number; x: number; y: number; count?: number; seed?: string}> = ({at, x, y, count = 26, seed = 'b'}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 70) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
      {Array.from({length: count}, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = 6 + random(`${seed}v${i}`) * 12;
        const px = x + Math.cos(a) * v * t * 0.9;
        const py = y + Math.sin(a) * v * t * 0.7 + 0.09 * t * t;
        const s = 3 + random(`${seed}s${i}`) * 7;
        const o = interpolate(t, [0, 8, 70], [0, 1, 0], CLAMP);
        const isBar = i % 4 === 0;
        return isBar ? (
          <rect key={i} x={px - s} y={py - s / 2} width={s * 2.2} height={s} rx={1.5} fill={C.gold1} opacity={o} transform={`rotate(${t * 6 + i * 20} ${px} ${py})`} />
        ) : (
          <circle key={i} cx={px} cy={py} r={s / 2} fill={i % 3 ? C.gold0 : C.gold1} opacity={o} />
        );
      })}
    </svg>
  );
};

/* ───────────── 1 · HOOK ───────────── */
export const S1Hook: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = e.price;
  // already moving at frame 0: the spring started 8 frames "before" the video
  const slam = spring({frame: f + 8, fps, config: {damping: 13, stiffness: 150, mass: 0.9}});
  const tilt = 6 * (1 - spring({frame: f - 4, fps, config: SPRING.card}));
  const pct = Math.round(((p.record - p.latest) / p.record) * 100);
  const chip = spring({frame: f - 120, fps, config: SPRING.pill});
  const draw = interpolate(f, [16, 112], [0, 1], {...CLAMP, easing: EASE.move});
  const area = lin(f, 100, 140);
  const shake = f >= 60 && f < 70 ? Math.sin(f * 3.1) * (70 - f) * 0.6 : 0;
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={tilt}
        sheenOffset={40}
        glow="rgba(212,175,55,0.10)"
        style={{
          position: 'absolute',
          left: CARD_LEFT,
          top: 548,
          width: LAYOUT.cardWidth,
          height: 680,
          transform: `scale(${1.35 - 0.35 * slam}) translateY(${shake}px)`,
          opacity: Math.min(1, slam * 2),
          filter: slam < 0.8 ? `blur(${(0.8 - slam) * 14}px)` : undefined,
        }}
      >
        <div dir="rtl" style={{padding: '30px 40px 0', fontFamily: FONT.ar, color: C.text}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 500, color: C.label}}>
              <PulseDot f={f} color={C.red} />
              <span>{p.label}</span>
            </div>
            <div
              style={{
                opacity: chip,
                transform: `scale(${0.6 + 0.4 * chip})`,
                background: 'rgba(255,90,95,0.14)',
                border: `1px solid ${C.red}`,
                color: C.red,
                borderRadius: 999,
                padding: '4px 18px',
                fontSize: 30,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24">
                <path d="M12 21 L3 10 H9 V3 H15 V10 H21 Z" fill={C.red} />
              </svg>
              <Bdi>−{pct}%</Bdi>
              <span style={{fontSize: 22, fontWeight: 500}}>من القمة</span>
            </div>
          </div>
          <div style={{marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 18}}>
            <span style={{fontSize: 132, fontWeight: 700, lineHeight: 1.1, ...NUM}}>
              <CountUp from={p.record} to={p.latest} start={60} end={120} prefix="$" gold sheenAt={128} />
            </span>
            <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>
              {p.nowLabel} · <ArText text={p.latestAsOf} />
            </span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 40, top: 316, direction: 'ltr'}}>
          <LineChartDraw
            id="hook"
            values={p.path}
            min={3500}
            max={5800}
            width={740}
            height={250}
            color={C.red}
            progress={draw}
            area={area}
            refLine={{value: 4000, label: '$4,000', anchor: 'start'}}
          />
          {/* record marker at the start of the line */}
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              left: 0,
              top: -44,
              fontFamily: FONT.ar,
              fontSize: 23,
              color: C.gold0,
              fontWeight: 700,
              opacity: lin(f, 20, 34),
              whiteSpace: 'nowrap',
            }}
          >
            {p.recordLabel} <Bdi>${p.record.toLocaleString('en-US')}</Bdi> · <ArText text={p.recordDate} />
          </div>
        </div>
        <div
          dir="rtl"
          style={{position: 'absolute', left: 40, right: 40, bottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: lin(f, 120, 140)}}
        >
          <Source text={p.source} />
          <Tag text={p.pathTag} />
        </div>
      </GlassCard>
      <Burst at={60} x={540} y={720} seed="hook" />
    </AbsoluteFill>
  );
};

/* ───────────── 2 · CARD STACK ───────────── */
export const S2Stack: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const frameDraw = interpolate(f, [80, 125], [0, 1], {...CLAMP, easing: EASE.move});
  const pill = spring({frame: f - 120, fps, config: SPRING.pill});
  const W = 700;
  const H = 150;
  const top0 = 600;
  const gap = 28;
  const per = 2 * (W + 60) + 2 * (3 * H + 2 * gap + 60);
  return (
    <AbsoluteFill>
      {/* dashed gold frame drawing around the stack */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect
          x={(1080 - W) / 2 - 30 - 10}
          y={top0 - 30}
          width={W + 60}
          height={3 * H + 2 * gap + 60}
          rx={34}
          fill="none"
          stroke={C.gold1}
          strokeOpacity={0.7}
          strokeWidth={2.5}
          strokeDasharray={`14 12`}
          strokeDashoffset={-f * 0.5}
          style={{clipPath: `inset(0 ${(1 - frameDraw) * 100}% 0 0)`}}
        />
      </svg>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: 540 - 10,
          top: top0 - 58,
          transform: `translateX(-50%) scale(${0.5 + 0.5 * pill})`,
          opacity: pill,
          background: GOLD,
          color: C.bg0,
          fontFamily: FONT.ar,
          fontWeight: 700,
          fontSize: 30,
          padding: '6px 28px',
          borderRadius: 999,
          boxShadow: '0 0 30px rgba(212,175,55,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {e.stackPill}
      </div>
      {e.stack.map((c, i) => {
        const at = 15 + i * 30;
        const t = spring({frame: f - at, fps, config: SPRING.card});
        const fan = (1 - t) * (i - 1) * 9;
        return (
          <GlassCard
            key={i}
            sheenOffset={i * 30}
            tilt={(1 - t) * 6}
            style={{
              position: 'absolute',
              left: (1080 - W) / 2 - 10,
              top: top0 + i * (H + gap),
              width: W,
              height: H,
              opacity: Math.min(1, t * 1.5),
              transform: `translateX(${(1 - t) * -420}px) rotate(${fan}deg)`,
            }}
          >
            <div dir="rtl" style={{display: 'flex', alignItems: 'center', height: '100%', padding: '0 34px', gap: 26, fontFamily: FONT.ar}}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 22,
                  background: 'rgba(212,175,55,0.12)',
                  border: `1px solid ${C.glassBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={c.icon} size={50} color={C.gold0} t={f + i * 20} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>
                  <ArText text={c.day} />
                </span>
                <span style={{fontSize: 44, color: C.text, fontWeight: 700, lineHeight: 1.25}}>{c.title}</span>
              </div>
              <div style={{marginRight: 'auto', fontFamily: FONT.en, fontWeight: 700, fontSize: 40, ...goldText()}}>{`0${i + 1}`}</div>
            </div>
          </GlassCard>
        );
      })}
      <span style={{display: 'none'}}>{per}</span>
    </AbsoluteFill>
  );
};

/* ───────────── 4 · WEDNESDAY ───────────── */
export const S4Wednesday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = e.wednesday;
  const t = spring({frame: f, fps, config: SPRING.card});
  const tilt = 6 * (1 - t);
  const chip = spring({frame: f - 270, fps, config: SPRING.pill});
  const colW = 360;
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={tilt}
        glow="rgba(212,175,55,0.08)"
        style={{
          position: 'absolute',
          left: CARD_LEFT,
          top: 520,
          width: LAYOUT.cardWidth,
          height: 730,
          opacity: Math.min(1, t * 1.6),
          transform: `translateY(${(1 - t) * 80}px)`,
        }}
      >
        <div dir="rtl" style={{padding: '28px 36px', fontFamily: FONT.ar, color: C.text, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
          {/* header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Icon name="calendar" size={42} color={C.gold0} t={f} />
              <span style={{fontSize: 38, fontWeight: 700}}>
                <ArText text={w.day} />
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 18px',
                borderRadius: 999,
                background: 'rgba(212,175,55,0.12)',
                border: `1px solid ${C.glassBorder}`,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              <PulseDot f={f} color={C.gold0} size={10} />
              <Bdi style={{fontSize: 30}}>{w.time}</Bdi>
              <span style={{fontWeight: 500, color: C.label, fontSize: 22}}>{w.timeZone}</span>
            </div>
          </div>
          <div style={{height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)', margin: '22px 0', transform: `scaleX(${enter(f, 10, 30)})`}} />
          {/* two columns */}
          <div style={{display: 'flex', justifyContent: 'space-between', flex: 1}}>
            <div style={{width: colW, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: lin(f, 20, 40)}}>
              <div style={{fontSize: 34, fontWeight: 700}}>{w.gdp.title}</div>
              <div style={{fontSize: 23, color: C.label, fontWeight: 500, marginBottom: 6}}>{w.gdp.subtitle}</div>
              <BarChartQ bars={w.gdp.bars} max={4.5} start={60} qAt={208} width={colW} height={330} unit={w.gdp.unit} barWidth={62} />
            </div>
            <div style={{width: 1, background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.3), transparent)'}} />
            <div style={{width: colW, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: lin(f, 150, 170)}}>
              <div style={{fontSize: 34, fontWeight: 700}}>
                <ArText text={w.pce.title} />
              </div>
              <div style={{fontSize: 23, color: C.label, fontWeight: 500, marginBottom: 22}}>{w.pce.subtitle}</div>
              <Gauge value={w.pce.last} max={w.pce.max} target={w.pce.target} start={196} size={300} targetLabel={w.pce.targetLabel} />
              <div style={{marginTop: -8, fontSize: 64, fontWeight: 700, lineHeight: 1.1}}>
                <CountUp from={0} to={w.pce.last} start={196} end={232} decimals={1} suffix="%" gold sheenAt={240} />
              </div>
              <div style={{fontSize: 23, color: C.label, fontWeight: 500}}>{w.pce.lastLabel}</div>
              <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 21, color: C.label, opacity: lin(f, 210, 226)}}>
                <span style={{width: 4, height: 18, background: C.text, borderRadius: 2}} />
                <span>{w.pce.targetLabel}</span>
                <Bdi style={{fontWeight: 700, color: C.text}}>{w.pce.target}%</Bdi>
              </div>
            </div>
          </div>
          {/* footer */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 20px',
                borderRadius: 16,
                background: 'rgba(11,24,56,0.9)',
                border: `1px solid rgba(212,175,55,0.45)`,
                opacity: chip,
                transform: `scale(${0.7 + 0.3 * chip})`,
                transformOrigin: 'right center',
              }}
            >
              <Icon name="book" size={32} color={C.gold0} t={f} />
              <span style={{fontSize: 26, fontWeight: 700}}>{w.chip.label}</span>
              <Bdi style={{fontSize: 26, fontWeight: 700, color: C.gold0}}>{w.chip.time}</Bdi>
            </div>
            <Source text={w.source} style={{opacity: lin(f, 240, 260) * 0.85}} />
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};

/* ───────────── 5 · CAUSE CHAIN ───────────── */
export const S5Chain: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const flip = interpolate(f, [180, 196], [0, 1], {...CLAMP, easing: EASE.move});
  const tagIn = lin(f, 10, 24);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 506, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: tagIn}}>
        <Tag text={e.chain.tag} />
      </div>
      <div dir="rtl" style={{position: 'absolute', top: 560, left: 120, width: 820, display: 'flex', justifyContent: 'space-between'}}>
        <CauseColumn header={e.chain.up.header} steps={e.chain.up.steps} tone="up" start={30} every={30} dim={flip} width={400} />
        <CauseColumn header={e.chain.down.header} steps={e.chain.down.steps} tone="down" start={196} every={20} width={400} />
      </div>
    </AbsoluteFill>
  );
};
