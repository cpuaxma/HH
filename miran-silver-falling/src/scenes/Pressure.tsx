import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {ACCENT_GLOW, FONT, LAYOUT, SCENES, VIDEO} from '../theme';
import {S4_PRESSURE, S4_WEIGHTS} from '../strings';
import {ArabicText, toneStyle} from '../components/ArabicText';
import {Headline} from '../components/Layout';
import {SilverBar2D} from '../components/SilverBar2D';
import {HeroLayer} from '../components/Hero';
import {Station} from '../components/World';
import {enter, hexA, rand} from '../motion';

const START = SCENES.pressure[0];
const TEXT_END = SCENES.pressure[1] - START;
const BASE_Y = 1388;
const L0 = 170;
const STEP = 24;
const BAR_W = 300;
const WT = {w: 236, h: 90};
// Each weight drops as the headline names it («تضخم», «وفائدة», «ودولار»).
const DROPS = [86, 114, 142];
const FALL = 16;

const landing = (frame: number, k: number) => spring({frame: frame - (DROPS[k] + FALL), fps: VIDEO.fps, config: {damping: 8, stiffness: 190, mass: 1}});

/** Geometry at a frame: spring length, platform and bar top, and where each weight rests. */
const layout = (frame: number) => {
  const comp = DROPS.reduce((s, _, k) => s + STEP * landing(frame, k), 0);
  const springLen = L0 - comp;
  const platTop = BASE_Y - springLen - 16;
  const barTop = platTop - 112; // the ingot's top face (SilverBar2D geometry at width 300)
  const rest = (k: number) => barTop - (k + 1) * WT.h - k * 3;
  return {springLen, platTop, barTop, rest};
};

const shake = (frame: number) =>
  DROPS.reduce((s, d) => {
    const t = frame - (d + FALL);
    return t < 0 || t > 24 ? s : s + Math.sin(t * 2.4) * 7 * (1 - t / 24);
  }, 0);

const Weight: React.FC<{k: number}> = ({k}) => {
  const frame = useCurrentFrame();
  const {rest} = layout(frame);
  const d = DROPS[k];
  if (frame < d) return null;
  const fall = interpolate(frame, [d, d + FALL], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const y = rest(k) - (1 - fall) * 300;
  const appear = interpolate(frame, [d, d + 6], [0, 1], {extrapolateRight: 'clamp'});
  const squash = 1 - 0.07 * Math.max(0, Math.sin(Math.min(Math.PI, (frame - d - FALL) * 0.35))) * (frame > d + FALL ? 1 : 0);
  const {label, accent} = S4_WEIGHTS[k];
  const glow = ACCENT_GLOW[accent];
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - WT.w / 2,
        top: y,
        width: WT.w,
        height: WT.h,
        opacity: appear,
        transform: `scaleY(${squash})`,
        transformOrigin: '50% 100%',
      }}
    >
      <svg width={WT.w} height={WT.h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`wt-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3A4459" />
            <stop offset="0.45" stopColor="#1C2333" />
            <stop offset="1" stopColor="#10141F" />
          </linearGradient>
        </defs>
        <path
          d={`M14,4 H${WT.w - 14} L${WT.w - 2},18 V${WT.h - 6} Q${WT.w - 2},${WT.h - 2} ${WT.w - 8},${WT.h - 2} H8 Q2,${WT.h - 2} 2,${WT.h - 6} V18 Z`}
          fill={`url(#wt-${k})`}
          stroke={glow}
          strokeOpacity={0.85}
          strokeWidth={2}
          style={{filter: `drop-shadow(0 0 12px ${hexA(glow, 0.45)})`}}
        />
        <line x1={18} x2={WT.w - 18} y1={10} y2={10} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.5} />
      </svg>
      <div
        dir="rtl"
        style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.family, fontSize: 34, paddingTop: 4}}
      >
        <span style={toneStyle(accent, FONT.key)}>{label}</span>
      </div>
    </div>
  );
};

export const Pressure: React.FC = () => {
  const frame = useCurrentFrame();
  const {springLen, platTop, barTop} = layout(frame);
  const rigIn = enter(frame, 10, 40);
  const sh = shake(frame);

  // Spring coil between the base and the platform.
  const coils = 9;
  const top = platTop + 16;
  const pts: string[] = [];
  for (let i = 0; i <= coils * 2; i++) {
    const y = top + (springLen * i) / (coils * 2);
    const x = 540 + (i === 0 || i === coils * 2 ? 0 : i % 2 ? -92 : 92);
    pts.push(`${x},${y}`);
  }

  return (
    <AbsoluteFill>
      <Station index={3} from={START}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${sh}px)`, opacity: rigIn}}>
          <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="coil" x1="0" x2="1">
                <stop offset="0" stopColor="#7D8798" />
                <stop offset="0.5" stopColor="#F2F5F9" />
                <stop offset="1" stopColor="#7D8798" />
              </linearGradient>
              <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#DCE3EC" />
                <stop offset="1" stopColor="#6F7989" />
              </linearGradient>
            </defs>
            <polyline points={pts.join(' ')} fill="none" stroke="url(#coil)" strokeWidth={6} strokeLinejoin="round" />
            <polyline points={pts.join(' ')} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.5} strokeLinejoin="round" />
            <rect x={540 - 190} y={platTop} width={380} height={16} rx={6} fill="url(#plate)" />
            <rect x={540 - 215} y={BASE_Y} width={430} height={24} rx={8} fill="url(#plate)" opacity={0.9} />
            {/* impact flashes */}
            {DROPS.map((d, k) => {
              const t = frame - (d + FALL);
              if (t < 0 || t > 30) return null;
              const o = 1 - t / 30;
              const y = barTop - k * (WT.h + 3);
              return (
                <g key={k} opacity={o}>
                  <ellipse cx={540} cy={y} rx={130 + t * 9} ry={6 + t * 0.6} fill={ACCENT_GLOW[S4_WEIGHTS[k].accent]} opacity={0.35} />
                  <line x1={540 - 120 - t * 10} x2={540 + 120 + t * 10} y1={y} y2={y} stroke="#FFFFFF" strokeWidth={2} />
                  {new Array(8).fill(0).map((_, i) => {
                    const dir = i % 2 ? 1 : -1;
                    const sp = 3 + rand(i + k * 9) * 4;
                    return <circle key={i} cx={540 + dir * (110 + t * sp * 2)} cy={y - t * sp * 0.6 + 0.08 * t * t} r={2.2} fill="#FFFFFF" />;
                  })}
                </g>
              );
            })}
          </svg>
          <div style={{position: 'absolute', left: 540 - BAR_W / 2, top: platTop - 160}}>
            <SilverBar2D id="press-bar" width={BAR_W} frame={frame} sweepStart={30} sweepEvery={240} />
          </div>
          <HeroLayer from={DROPS[0]} to={DROPS[2] + FALL + 8} samples={6}>
            {S4_WEIGHTS.map((_, k) => (
              <Weight key={k} k={k} />
            ))}
          </HeroLayer>
        </div>
      </Station>

      <Headline>
        <ArabicText block={S4_PRESSURE} size={LAYOUT.headlineSize - 4} start={8} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};

