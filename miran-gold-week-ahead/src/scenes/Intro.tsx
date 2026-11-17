import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT} from '../brand';
import type {Edition} from '../edition';
import {goldText, splitWords} from '../components/ArabicWordReveal';
import {Coin} from '../components/CauseChain';
import {Burst} from './Part1';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Intro length (frames). Everything after it is shifted by this much. */
export const INTRO_FRAMES = 180;

const CX = 540;
const COIN_Y = 690;

/** A word that slams in: scale 1.8→1, blur 14→0, drops from above, with a spring. */
const SlamWord: React.FC<{w: string; at: number; gold?: boolean; size: number; sheen?: number}> = ({w, at, gold, size, sheen = -1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: f - at, fps, config: {damping: 12, stiffness: 210, mass: 0.8}});
  if (f < at) return <span style={{display: 'inline-block', opacity: 0, fontSize: size}}>{w}</span>;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: size,
        opacity: Math.min(1, t * 2),
        transform: `translateY(${(1 - t) * -36}px) scale(${1.8 - 0.8 * t})`,
        filter: t < 0.95 ? `blur(${(1 - t) * 14}px)` : undefined,
        paddingBottom: size * 0.1,
        ...(gold ? goldText(sheen) : {color: C.text}),
      }}
    >
      {w}
    </span>
  );
};

/**
 * Intro hook (3s): "ماذا ينتظر الذهب في الأسبوع القادم؟"
 * Speed streaks → a spinning gold coin drops in with the five weekdays orbiting it in 3D,
 * the title slams in word by word over a giant outlined "؟", particle burst, then a
 * zoom-through with a gold flash into the price card.
 */
export const IntroHook: React.FC<{e: Edition; title: {l1: string; l2: string}}> = ({e, title}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const exit = interpolate(f, [148, 186], [0, 1], {...CLAMP, easing: EASE.exit});
  const push = 1 + 0.06 * (f / INTRO_FRAMES);
  const flash = interpolate(f, [160, 172, 190], [0, 0.65, 0], CLAMP);
  const beat = Math.exp(-(f % 30) / 7); // pulse on every beat (120 BPM)

  // coin: already falling at frame 0
  const drop = spring({frame: f + 6, fps, config: {damping: 11, stiffness: 120, mass: 1}});
  const spinA = f / 9;
  const coinScaleX = 0.22 + 0.78 * Math.abs(Math.cos(spinA));

  // title words
  const w1 = splitWords(title.l1);
  const w2 = splitWords(title.l2);
  const l1At = (i: number) => 16 + i * 8;
  const l2At = (i: number) => 48 + i * 8;
  const lastLand = l2At(w2.length - 1) + 6;
  const shake = f >= lastLand && f < lastLand + 14 ? Math.sin(f * 2.7) * (lastLand + 14 - f) * 0.9 : 0;
  const sheen = interpolate(f, [92, 132], [0, 1], CLAMP);

  // giant "؟" outline drawing behind
  const qDraw = interpolate(f, [4, 70], [0, 1], {...CLAMP, easing: EASE.move});
  const QDASH = 2400;

  // orbiting weekdays
  const orbitIn = spring({frame: f - 10, fps, config: {damping: 15, stiffness: 90}});
  const RX = 360 * orbitIn;
  const RY = 105 * orbitIn;
  const days = e.days.map((d, i) => {
    const a = f * 0.032 + (i * Math.PI * 2) / e.days.length + Math.PI / 2;
    const depth = Math.sin(a); // >0 = in front
    return {d, x: CX + Math.cos(a) * RX, y: COIN_Y + Math.sin(a) * RY, depth, i};
  });

  const dayPill = (o: (typeof days)[number]) => {
    const s = 0.72 + 0.28 * ((o.depth + 1) / 2);
    const inT = spring({frame: f - (12 + o.i * 4), fps, config: {damping: 13, stiffness: 160}});
    return (
      <div
        key={o.d.key}
        dir="rtl"
        style={{
          position: 'absolute',
          left: o.x,
          top: o.y,
          transform: `translate(-50%, -50%) scale(${s * inT})`,
          opacity: (0.35 + 0.65 * ((o.depth + 1) / 2)) * Math.min(1, inT * 1.5),
          padding: '8px 20px',
          borderRadius: 999,
          background: o.depth > 0.55 ? 'rgba(212,175,55,0.22)' : 'rgba(11,24,56,0.85)',
          border: `1px solid rgba(212,175,55,${0.3 + 0.4 * ((o.depth + 1) / 2)})`,
          color: C.text,
          fontFamily: FONT.ar,
          fontWeight: 700,
          fontSize: 28,
          whiteSpace: 'nowrap',
          boxShadow: o.depth > 0.55 ? '0 0 22px rgba(212,175,55,0.35)' : undefined,
        }}
      >
        {o.d.ar}
      </div>
    );
  };

  // speed streaks converging on the coin (first ~0.8s)
  const streaks = Array.from({length: 14}, (_, i) => {
    const a = random(`sa${i}`) * Math.PI * 2;
    const delay = random(`sd${i}`) * 18;
    const t = interpolate(f, [delay - 8, delay + 26], [0, 1], {...CLAMP, easing: EASE.move});
    const r0 = 1100;
    const r1 = 120;
    const r = r0 + (r1 - r0) * t;
    const len = 160 + 120 * random(`sl${i}`);
    const op = interpolate(t, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
    return {x1: CX + Math.cos(a) * r, y1: COIN_Y + Math.sin(a) * r, x2: CX + Math.cos(a) * (r + len), y2: COIN_Y + Math.sin(a) * (r + len), op};
  });

  return (
    <AbsoluteFill style={{opacity: 1 - exit}}>
      <AbsoluteFill
        style={{
          transform: `scale(${push * (1 + exit * 0.9)})`,
          transformOrigin: `50% ${(COIN_Y / 1920) * 100 + 10}%`,
          filter: exit > 0.02 ? `blur(${exit * 18}px)` : undefined,
        }}
      >
        {/* rotating light rays behind the coin, pulsing on the beat */}
        <div
          style={{
            position: 'absolute',
            left: CX - 900,
            top: COIN_Y - 900,
            width: 1800,
            height: 1800,
            borderRadius: '50%',
            background: `repeating-conic-gradient(from ${f * 0.45}deg, rgba(247,222,140,0.16) 0deg 5deg, rgba(247,222,140,0) 5deg 18deg)`,
            maskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 25%, transparent 60%)',
            opacity: interpolate(f, [0, 20], [0, 1], CLAMP) * (0.7 + 0.3 * beat),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: CX - 420,
            top: COIN_Y - 420,
            width: 840,
            height: 840,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(212,175,55,${0.28 + 0.12 * beat}) 0%, rgba(212,175,55,0) 60%)`,
          }}
        />

        {/* giant outlined question mark */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <text
            x={CX}
            y={COIN_Y + 360}
            textAnchor="middle"
            fontFamily={FONT.ar}
            fontWeight={700}
            fontSize={1100}
            fill="none"
            stroke={C.gold1}
            strokeWidth={3}
            strokeOpacity={0.22}
            strokeDasharray={QDASH}
            strokeDashoffset={QDASH * (1 - qDraw)}
          >
            ؟
          </text>
          {streaks.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={C.gold0} strokeWidth={3} strokeLinecap="round" opacity={s.op * 0.8} />
          ))}
          {/* orbit ring */}
          <ellipse cx={CX} cy={COIN_Y} rx={RX} ry={RY} fill="none" stroke={C.gold1} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" strokeDashoffset={-f * 1.2} />
        </svg>

        {/* days behind the coin */}
        {days.filter((o) => o.depth <= 0).map(dayPill)}

        {/* the coin */}
        <div
          style={{
            position: 'absolute',
            left: CX - 150,
            top: COIN_Y - 150,
            width: 300,
            height: 300,
            transform: `translateY(${(1 - drop) * -520}px) scale(${0.4 + 0.6 * drop + 0.04 * beat}) scaleX(${coinScaleX})`,
            filter: `drop-shadow(0 0 ${30 + 30 * beat}px rgba(247,222,140,0.65))`,
          }}
        >
          <Coin size={300} f={0} />
        </div>

        {/* days in front of the coin */}
        {days.filter((o) => o.depth > 0).map(dayPill)}

        {/* title */}
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 1010,
            left: 90,
            right: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: FONT.ar,
            fontWeight: 700,
            lineHeight: 1.25,
            transform: `translate(${shake}px, ${shake * 0.6}px)`,
          }}
        >
          <div style={{display: 'flex', gap: 26, justifyContent: 'center'}}>
            {w1.map((w, i) => (
              <SlamWord key={i} w={w} at={l1At(i)} size={92} />
            ))}
          </div>
          <div style={{display: 'flex', gap: 26, justifyContent: 'center'}}>
            {w2.map((w, i) => (
              <SlamWord key={i} w={w} at={l2At(i)} size={100} gold sheen={sheen > 0 && sheen < 1 ? sheen : -1} />
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '6px 24px',
              borderRadius: 999,
              border: `1px solid ${C.glassBorder}`,
              background: C.glassFill,
              color: C.text,
              fontSize: 30,
              fontWeight: 700,
              opacity: interpolate(f, [84, 100], [0, 1], CLAMP),
              transform: `translateY(${interpolate(f, [84, 100], [16, 0], {...CLAMP, easing: EASE.enter})}px)`,
            }}
          >
            {e.datePill}
          </div>
        </div>

        <Burst at={lastLand - 2} x={CX} y={1120} count={34} seed="intro" />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% ${(COIN_Y / 1920) * 100}%, rgba(255,240,200,${flash}), rgba(255,240,200,${flash * 0.3}))`}} />
    </AbsoluteFill>
  );
};
