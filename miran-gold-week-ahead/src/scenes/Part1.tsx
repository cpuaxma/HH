import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, LAYOUT, NUM, SPRING} from '../brand';
import type {Edition} from '../edition';
import {ArText, Bdi, goldText} from '../components/ArabicWordReveal';
import {CountUp, LineChartDraw} from '../components/Charts';
import {Seesaw, Thermometer, thermoY} from '../components/Explainers';
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
  const draw = interpolate(f, [16, 118], [0, 1], {...CLAMP, easing: EASE.move});
  const area = lin(f, 100, 140);
  const shake = f >= 60 && f < 70 ? Math.sin(f * 3.1) * (70 - f) * 0.6 : 0;
  // the small label above the number switches from "peak" to "now" as the number rolls down
  const peakOp = 1 - lin(f, 96, 108);
  const nowOp = lin(f, 108, 120);
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
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 500, color: C.label}}>
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
                padding: '4px 20px',
                fontSize: 34,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24">
                <path d="M12 21 L3 10 H9 V3 H15 V10 H21 Z" fill={C.red} />
              </svg>
              <Bdi>−{pct}%</Bdi>
            </div>
          </div>
          <div style={{position: 'relative', height: 50, marginTop: 18}}>
            <span style={{position: 'absolute', right: 6, fontSize: 32, fontWeight: 700, color: C.gold0, opacity: peakOp}}>{p.recordLabel}</span>
            <span style={{position: 'absolute', right: 6, fontSize: 32, fontWeight: 700, color: C.text, opacity: nowOp}}>{p.nowLabel}</span>
          </div>
          <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1.05, ...NUM}}>
            <CountUp from={p.record} to={p.latest} start={60} end={120} prefix="$" gold sheenAt={128} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 40, top: 330, direction: 'ltr'}}>
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
          {/* glowing peak dot at the start of the line */}
          <div
            style={{
              position: 'absolute',
              left: -12,
              top: 250 - ((p.record - 3500) / (5800 - 3500)) * 250 - 12,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: C.gold0,
              boxShadow: `0 0 ${16 + 8 * Math.sin(f / 6)}px ${C.gold0}`,
              opacity: lin(f, 16, 26),
            }}
          />
        </div>
        <div
          dir="rtl"
          style={{position: 'absolute', left: 40, right: 40, bottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: lin(f, 120, 140) * 0.8}}
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

/* ───────────── 4 · WEDNESDAY: the inflation thermometer ───────────── */
export const S4Wednesday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = e.wednesday;
  const t = spring({frame: f, fps, config: SPRING.card});
  const MAX = 5;
  const TH = 470; // thermometer svg height
  // column rises with a soft overshoot, then (phase B) wobbles: "what will October be?"
  const rise = spring({frame: f - 40, fps, config: {damping: 15, stiffness: 70, mass: 1}});
  const wobbleAmp = 0.6 * lin(f, 196, 220);
  const level = w.value * rise + wobbleAmp * Math.sin((f - 196) / 8);
  const targetIn = enter(f, 18, 30);
  const hot = lin(f, 118, 140);
  const above = spring({frame: f - 132, fps, config: SPRING.pill}) * (1 - lin(f, 190, 200));
  const phaseB = lin(f, 196, 210);
  const also = spring({frame: f - 270, fps, config: SPRING.pill});
  const thermoLeft = 320; // inside the card
  const thermoTop = 150;
  const yLevel = thermoTop + thermoY(level, MAX, TH);
  const yTarget = thermoTop + thermoY(w.target, MAX, TH);
  return (
    <AbsoluteFill>
      <GlassCard
        tilt={6 * (1 - t)}
        glow="rgba(212,175,55,0.08)"
        style={{position: 'absolute', left: CARD_LEFT, top: 520, width: LAYOUT.cardWidth, height: 720, opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 80}px)`}}
      >
        <div dir="rtl" style={{position: 'absolute', inset: 0, fontFamily: FONT.ar, color: C.text}}>
          {/* header */}
          <div style={{position: 'absolute', top: 28, left: 36, right: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Icon name="calendar" size={42} color={C.gold0} t={f} />
              <span style={{fontSize: 36, fontWeight: 700}}>
                <ArText text={w.day} />
              </span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px', borderRadius: 999, background: 'rgba(212,175,55,0.12)', border: `1px solid ${C.glassBorder}`}}>
              <PulseDot f={f} color={C.gold0} size={10} />
              <Bdi style={{fontSize: 30, fontWeight: 700}}>{w.time}</Bdi>
              <span style={{fontWeight: 500, color: C.label, fontSize: 22}}>{w.timeZone}</span>
            </div>
          </div>
          <div style={{position: 'absolute', top: 104, left: 0, right: 0, textAlign: 'center', fontSize: 42, fontWeight: 700, opacity: lin(f, 10, 26)}}>
            <ArText text={w.title} />
          </div>

          {/* thermometer */}
          <div style={{position: 'absolute', left: thermoLeft, top: thermoTop}}>
            <Thermometer level={level} max={MAX} target={w.target} height={TH} f={f} targetIn={targetIn} hot={hot} />
          </div>

          {/* target label (right of the tube) */}
          <div style={{position: 'absolute', left: thermoLeft + 180, top: yTarget - 24, display: 'flex', alignItems: 'center', gap: 10, opacity: targetIn, whiteSpace: 'nowrap'}}>
            <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>{w.targetLabel}</span>
            <Bdi style={{fontSize: 34, fontWeight: 700}}>{w.target}%</Bdi>
          </div>

          {/* "above target" chip, between target and level */}
          <div
            style={{
              position: 'absolute',
              left: thermoLeft + 180,
              top: (yTarget + thermoTop + thermoY(w.value, MAX, TH)) / 2 - 64,
              padding: '6px 18px',
              borderRadius: 999,
              border: `1.5px solid ${C.red}`,
              background: 'rgba(255,90,95,0.14)',
              color: C.red,
              fontSize: 28,
              fontWeight: 700,
              opacity: above,
              transform: `scale(${0.6 + 0.4 * above})`,
              transformOrigin: 'right center',
              whiteSpace: 'nowrap',
            }}
          >
            {w.aboveLabel}
          </div>

          {/* value bubble (left of the tube), follows the column */}
          <div style={{position: 'absolute', right: 820 - thermoLeft + 6, top: yLevel - 52, textAlign: 'left', opacity: lin(f, 40, 56), whiteSpace: 'nowrap'}}>
            <div style={{position: 'relative', height: 104, width: 220}}>
              <div style={{position: 'absolute', inset: 0, opacity: 1 - phaseB, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <span style={{fontSize: 26, color: C.label, fontWeight: 500}}>{w.valueMonth}</span>
                <span style={{fontSize: 64, fontWeight: 700, lineHeight: 1}}>
                  <CountUp from={0} to={w.value} start={40} end={110} decimals={1} suffix="%" gold sheenAt={118} />
                </span>
              </div>
              <div style={{position: 'absolute', inset: 0, opacity: phaseB, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: `scale(${0.8 + 0.2 * phaseB})`, transformOrigin: 'right center'}}>
                <span style={{fontSize: 26, color: C.gold0, fontWeight: 700}}>{w.nextMonth}</span>
                <span style={{fontSize: 72, fontWeight: 700, lineHeight: 1, ...goldText(), transform: `scale(${1 + 0.06 * Math.sin(f / 6)})`, display: 'inline-block'}}>؟</span>
              </div>
            </div>
          </div>

          {/* footer: GDP lands at the same time · source */}
          <div style={{position: 'absolute', bottom: 26, left: 36, right: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div
              style={{
                padding: '8px 20px',
                borderRadius: 16,
                background: 'rgba(11,24,56,0.9)',
                border: `1px solid rgba(212,175,55,0.45)`,
                fontSize: 26,
                fontWeight: 700,
                opacity: also,
                transform: `scale(${0.7 + 0.3 * also})`,
                transformOrigin: 'right center',
              }}
            >
              <ArText text={w.alsoChip} />
            </div>
            <Source text={w.source} style={{opacity: lin(f, 120, 140) * 0.8}} />
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};

/* ───────────── 5 · SEESAW: inflation → rates → dollar ⇄ gold ───────────── */
const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size?: number}> = ({dir, color, size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: dir === 'down' ? 'rotate(180deg)' : undefined, display: 'block'}}>
    <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={color} />
  </svg>
);

const DriverChip: React.FC<{label: string; up: boolean; flip: number; inT: number}> = ({label, up, flip, inT}) => {
  // flip: 0→1; the chip turns on its X axis and comes back showing the opposite direction
  const rot = flip < 0.5 ? flip * 180 : (1 - flip) * 180;
  const isUp = flip < 0.5 ? up : !up;
  const col = isUp ? C.red : C.green;
  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 28px',
        borderRadius: 999,
        background: 'rgba(11,24,56,0.85)',
        border: `2px solid ${col}`,
        boxShadow: `0 0 26px ${col}44`,
        fontFamily: FONT.ar,
        fontWeight: 700,
        fontSize: 38,
        color: C.text,
        opacity: inT,
        transform: `perspective(600px) rotateX(${rot}deg) scale(${0.7 + 0.3 * inT})`,
      }}
    >
      <span>{label}</span>
      <Arrow dir={isUp ? 'up' : 'down'} color={col} size={34} />
    </div>
  );
};

export const S5Chain: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = e.seesaw;
  const chip1 = spring({frame: f - 20, fps, config: SPRING.pill});
  const chip2 = spring({frame: f - 50, fps, config: SPRING.pill});
  const link = enter(f, 36, 16);
  const flip = interpolate(f, [180, 200], [0, 1], {...CLAMP, easing: EASE.move});
  const tiltA = spring({frame: f - 90, fps, config: {damping: 9, stiffness: 80, mass: 1.2}});
  const tiltB = spring({frame: f - 208, fps, config: {damping: 9, stiffness: 80, mass: 1.2}});
  const angle = -14 * tiltA + 28 * tiltB + Math.sin(f / 18) * 0.6;
  const aOp = lin(f, 104, 116) * (1 - lin(f, 182, 192));
  const bOp = lin(f, 222, 234);
  const phaseB = f >= 200;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 500, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lin(f, 10, 24)}}>
        <Tag text={s.tag} />
      </div>
      <div style={{position: 'absolute', top: 552, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <DriverChip label={s.driver} up flip={flip} inT={chip1} />
        <svg width={20} height={34} viewBox="0 0 20 34" style={{display: 'block', opacity: link}}>
          <line x1={10} y1={2} x2={10} y2={2 + 22 * link} stroke={C.gold1} strokeWidth={3} strokeLinecap="round" />
          <path d="M3 20 L10 30 L17 20" fill="none" stroke={C.gold1} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={link > 0.9 ? 1 : 0} />
        </svg>
        <DriverChip label={s.rates} up flip={lin(f, 188, 208)} inT={chip2} />
      </div>
      <div style={{position: 'absolute', top: 790, left: 150}}>
        <Seesaw
          angle={angle}
          f={f}
          dollarLabel={s.dollar}
          goldLabel={s.gold}
          dollarArrow={{dir: phaseB ? 'down' : 'up', op: phaseB ? bOp : aOp}}
          goldArrow={{dir: phaseB ? 'up' : 'down', color: phaseB ? C.green : C.red, op: phaseB ? bOp : aOp}}
          goldGlow={{color: phaseB ? C.green : C.red, op: phaseB ? bOp : aOp}}
        />
      </div>
    </AbsoluteFill>
  );
};
