import {getLength, getPointAtLength} from '@remotion/paths';
import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {enterProgress, heroEntrance, rand, visualExit} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {MotionTrail} from '../components/MotionTrail';
import {Lang, strings} from '../i18n';
import {colors, ease, fonts, HEIGHT, layout, WIDTH} from '../theme';

const COIN = 250;
const USD = {x: 300, y: 1160};
const AU = {x: 780, y: 1160};
const FLOW = `M ${USD.x + 70} ${USD.y - 60} Q 540 860 ${AU.x - 70} ${AU.y - 60}`;
const FLOW_LEN = getLength(FLOW);

const T = {
  usd: 0,
  au: 15,
  text: 15,
  usdFade: 90,
  crack: 120,
  particles: 110,
  particleCount: 40,
  particleGap: 3.2,
  particleFlight: 52,
  glow: 130,
  textOut: 255,
  out: 270,
};

const CRACK = 'M 70 38 L 92 78 L 84 96 L 108 122 L 100 146 L 122 170';

const UsdCoin: React.FC = () => {
  const frame = useCurrentFrame();
  const e = heroEntrance(frame, T.usd, {fromX: -220});
  const out = visualExit(frame, T.out, 34);
  const fade = interpolate(frame, [T.usdFade, T.usdFade + 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const crack = enterProgress(frame, T.crack, 25);
  const crackLen = 160;
  return (
    <div
      style={{
        position: 'absolute',
        left: USD.x - COIN / 2,
        top: USD.y - COIN / 2,
        transform: e.transform,
        opacity: e.opacity * out.opacity * interpolate(fade, [0, 1], [1, 0.3]),
        filter: `blur(${e.blur + out.blur}px) grayscale(${fade}) brightness(${1 - fade * 0.25})`,
      }}
    >
      <svg width={COIN} height={COIN} viewBox="0 0 200 200">
        <defs>
          <radialGradient id="s5-usd-face" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#3A2A31" />
            <stop offset="1" stopColor="#1A1520" />
          </radialGradient>
        </defs>
        <circle cx={100} cy={100} r={94} fill="url(#s5-usd-face)" stroke={colors.dollar} strokeWidth={3} />
        <circle cx={100} cy={100} r={80} fill="none" stroke={colors.dollar} strokeWidth={1.2} strokeDasharray="2 5" opacity={0.6} />
        <text
          x={100}
          y={106}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={fonts.en}
          fontWeight={600}
          fontSize={96}
          fill={colors.dollar}
        >
          $
        </text>
        {/* Crack */}
        <path
          d={CRACK}
          fill="none"
          stroke="#0A0E18"
          strokeWidth={4}
          strokeLinejoin="bevel"
          style={{strokeDasharray: crackLen, strokeDashoffset: crackLen * (1 - crack)}}
        />
        <path
          d={CRACK}
          fill="none"
          stroke="rgba(245,241,232,0.5)"
          strokeWidth={1}
          transform="translate(1.5 0)"
          style={{strokeDasharray: crackLen, strokeDashoffset: crackLen * (1 - crack)}}
        />
      </svg>
    </div>
  );
};

const GoldCoin: React.FC = () => {
  const frame = useCurrentFrame();
  const e = heroEntrance(frame, T.au, {fromX: 220, rotateFrom: -25});
  const out = visualExit(frame, T.out, 34);
  const glow = interpolate(frame, [T.glow, T.glow + 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  // Slow, continuous turn on Y
  const sway = Math.sin(((frame - T.au) / 180) * Math.PI * 2) * 28 * Math.min(1, Math.max(0, (frame - T.au) / 40));
  return (
    <div
      style={{
        position: 'absolute',
        left: AU.x - COIN / 2,
        top: AU.y - COIN / 2,
        width: COIN,
        height: COIN,
        transform: e.transform,
        opacity: e.opacity * out.opacity,
        filter: `blur(${e.blur + out.blur}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -COIN * 0.45,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(243,210,122,${0.22 + glow * 0.4}) 0%, rgba(200,150,62,0) 62%)`,
        }}
      />
      <svg
        width={COIN}
        height={COIN}
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          transform: `perspective(900px) rotateY(${sway}deg)`,
          filter: `brightness(${1 + glow * 0.18}) drop-shadow(0 0 ${10 + glow * 24}px rgba(243,210,122,${0.25 + glow * 0.35}))`,
        }}
      >
        <defs>
          <radialGradient id="s5-au-face" cx="36%" cy="30%" r="78%">
            <stop offset="0" stopColor="#FCE8A8" />
            <stop offset="0.45" stopColor="#E3B65A" />
            <stop offset="1" stopColor="#9A6E25" />
          </radialGradient>
          <linearGradient id="s5-au-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF0B8" />
            <stop offset="0.5" stopColor="#B8862F" />
            <stop offset="1" stopColor="#F3D27A" />
          </linearGradient>
        </defs>
        <circle cx={100} cy={100} r={96} fill="url(#s5-au-rim)" />
        <circle cx={100} cy={100} r={92} fill="none" stroke="#7A5418" strokeWidth={4} strokeDasharray="1.5 3" opacity={0.55} />
        <circle cx={100} cy={100} r={84} fill="url(#s5-au-face)" />
        <circle cx={100} cy={100} r={84} fill="none" stroke="#FFF3C4" strokeWidth={1} opacity={0.6} />
        <circle cx={100} cy={100} r={74} fill="none" stroke="#8E6220" strokeWidth={1} opacity={0.45} />
        {/* Embossed "Au": dark offset below, light offset above */}
        <g fontFamily={fonts.en} fontWeight={600} fontSize={70} textAnchor="middle">
          <text x={101.5} y={126.5} fill="#7A5418" opacity={0.75}>
            Au
          </text>
          <text x={98.5} y={123.5} fill="#FFF6D6" opacity={0.85}>
            Au
          </text>
          <text x={100} y={125} fill="#D9A84E">
            Au
          </text>
        </g>
      </svg>
    </div>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const out = visualExit(frame, T.out, 30);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < T.particleCount; i++) {
    const start = T.particles + i * T.particleGap;
    const p = (frame - start) / T.particleFlight;
    if (p <= 0 || p >= 1) continue;
    const e = ease.inOut(p);
    const pt = getPointAtLength(FLOW, FLOW_LEN * e) ?? {x: USD.x, y: USD.y};
    const jitter = (rand(i * 7.1) - 0.5) * 26 * Math.sin(p * Math.PI);
    const r = 2 + rand(i * 3.3) * 3;
    const color = interpolateColors(e, [0, 0.4, 1], ['#B9A8A8', colors.goldFrom, colors.goldTo]);
    const alpha = Math.sin(p * Math.PI);
    dots.push(
      <g key={i}>
        <circle cx={pt.x} cy={pt.y + jitter} r={r * 3.2} fill={colors.goldFrom} opacity={alpha * 0.18} />
        <circle cx={pt.x} cy={pt.y + jitter} r={r} fill={color} opacity={alpha} />
      </g>,
    );
  }
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', opacity: out.opacity}}>
      <path d={FLOW} fill="none" stroke={colors.goldFrom} strokeWidth={1} strokeDasharray="2 10" opacity={0.18 * enterProgress(frame, T.particles, 30) * out.opacity} />
      {dots}
    </svg>
  );
};

export const Scene5Trust: React.FC<{lang: Lang}> = ({lang}) => {
  const s = strings[lang];
  return (
    <AbsoluteFill>
      <Particles />
      <MotionTrail from={T.usd} to={T.usd + 30}>
        <UsdCoin />
      </MotionTrail>
      <MotionTrail from={T.au} to={T.au + 30}>
        <GoldCoin />
      </MotionTrail>
      <AnimatedText
        lang={lang}
        lines={s.trust}
        start={T.text}
        exit={T.textOut}
        fontSize={lang === 'ar' ? 62 : 52}
        style={{top: layout.headlineY}}
      />
    </AbsoluteFill>
  );
};
