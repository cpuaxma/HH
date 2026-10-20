import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {enterProgress, exitProgress, rand, visualExit} from '../anim';
import {AnimatedText} from '../components/AnimatedText';
import {DollarIcon} from '../components/DollarIcon';
import {PulseRing} from '../components/PulseRing';
import mapData from '../data/map-dots.json';
import {Lang, strings} from '../i18n';
import {colors, ease, layout} from '../theme';
import {DOLLAR_POS} from './Scene2Priced';

type MapData = {
  width: number;
  height: number;
  regions: {name: string; x: number; y: number; count: number}[];
  dots: [number, number, number][];
};
const map = mapData as MapData;

const MAP_LEFT = layout.safeLeft;
const MAP_TOP = 900;
const DOT_R = 3;

// Light-up order and local start frames
const LIGHT_ORDER: Record<string, number> = {europe: 90, india: 130, china: 170, middleEast: 210, seAsia: 250};

const CORNER = {x: 200, y: 330, scale: 0.45};

const T = {mapIn: 0, dollarMove: 10, text: 20, textOut: 315, out: 330};

const regionStart = (regionIndex: number) =>
  regionIndex < 0 ? Infinity : LIGHT_ORDER[map.regions[regionIndex].name];

export const Scene3World: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];
  const out = visualExit(frame, T.out, 40);

  const cx = map.width / 2;
  const cy = map.height / 2;
  const maxD = Math.hypot(cx, cy);

  // $ from scene 2: shrinks and dims into the top-left corner
  const m = interpolate(frame, [T.dollarMove, T.dollarMove + 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.enter,
  });
  const dollarFade = 1 - exitProgress(frame, T.out, 30);
  const dx = interpolate(m, [0, 1], [DOLLAR_POS.x, CORNER.x]);
  const dy = interpolate(m, [0, 1], [DOLLAR_POS.y, CORNER.y]);
  const ds = interpolate(m, [0, 1], [1, CORNER.scale]);
  const dOpacity = interpolate(m, [0, 1], [1, 0.35]) * dollarFade;

  return (
    <AbsoluteFill>
      <svg
        width={map.width}
        height={map.height}
        viewBox={`0 0 ${map.width} ${map.height}`}
        style={{
          position: 'absolute',
          left: MAP_LEFT,
          top: MAP_TOP,
          overflow: 'visible',
          opacity: out.opacity,
          filter: `blur(${out.blur}px)`,
          transform: `scale(${interpolate(enterProgress(frame, T.mapIn, 50), [0, 1], [0.96, 1]) * out.scale})`,
        }}
      >
        <defs>
          <radialGradient id="s3-dot-glow">
            <stop offset="0" stopColor={colors.goldTo} stopOpacity={0.5} />
            <stop offset="1" stopColor={colors.goldFrom} stopOpacity={0} />
          </radialGradient>
        </defs>
        {map.dots.map(([x, y, r], i) => {
          const d = Math.hypot(x - cx, y - cy) / maxD;
          const appear = enterProgress(frame, T.mapIn + d * 34, 26);
          const start = regionStart(r);
          const lit = start === Infinity ? 0 : enterProgress(frame, start + rand(i) * 14, 24);
          const fill = interpolateColors(lit, [0, 0.6, 1], [colors.mapDot, colors.goldFrom, colors.goldTo]);
          return (
            <g key={i}>
              {lit > 0.05 ? <circle cx={x} cy={y} r={DOT_R * 3} fill="url(#s3-dot-glow)" opacity={lit * 0.5} /> : null}
              <circle cx={x} cy={y} r={DOT_R * (1 + lit * 0.15)} fill={fill} opacity={appear * (0.85 + lit * 0.15)} />
            </g>
          );
        })}
        {map.regions.map((reg) => {
          const st = LIGHT_ORDER[reg.name];
          return (
            <PulseRing key={reg.name} cx={reg.x} cy={reg.y} at={[st + 4, st + 40]} frame={frame} radius={58} duration={55} />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: dx - DOLLAR_POS.size / 2,
          top: dy - DOLLAR_POS.size / 2,
          transform: `scale(${ds})`,
          opacity: dOpacity,
          filter: `saturate(${interpolate(m, [0, 1], [1, 0.4])})`,
        }}
      >
        <DollarIcon size={DOLLAR_POS.size} />
      </div>

      <AnimatedText
        lang={lang}
        lines={s.weaker}
        start={T.text}
        exit={T.textOut}
        fontSize={lang === 'ar' ? 62 : 44}
        style={{top: layout.headlineY}}
      />
    </AbsoluteFill>
  );
};
