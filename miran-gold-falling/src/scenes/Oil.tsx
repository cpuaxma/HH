import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {COLORS, EASE, FONT, LAYOUT} from '../theme';
import {S3_OIL, S3_UNIT} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {OilBarrel} from '../components/OilBarrel';
import {LightStreak} from '../components/LightStreak';
import {Odometer} from '../components/Odometer';
import {HeroLayer} from '../components/Hero';
import {Pt, smoothPath, toBox} from '../components/ChartLine';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const DUR = 310;
const BARREL = {x: 712, y: 1090, w: 230};
const BOX = {x: 170, y: 1010, w: 360, h: 260};
const LINE: Pt[] = toBox(
  [
    [0, 0.82],
    [0.18, 0.78],
    [0.34, 0.84],
    [0.5, 0.76],
    [0.62, 0.72],
    [0.74, 0.4],
    [0.86, 0.22],
    [1, 0.06],
  ],
  BOX.x,
  BOX.y,
  BOX.w,
  BOX.h,
);
const LINE_D = smoothPath(LINE, 0.4);
const LINE_LEN = getLength(LINE_D);
const T = {text: 10, barrel: 15, fill: 55, line: 62, odo: 70, plus: 128};
const ODO_FROM = 64;
const ODO_TO = 100;

export const Oil: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const barrelIn = hero(frame, T.barrel);
  const fill = ease(frame, T.fill, 60) * 0.68;
  const line = ease(frame, T.line, 58, EASE.inOut);
  const head = getPointAtLength(LINE_D, LINE_LEN * Math.max(0.0001, line)) ?? {x: LINE[0][0], y: LINE[0][1]};
  const odoIn = enter(frame, T.odo - 8, 30);
  const roll = (f: number) => interpolate(ease(f, T.odo, 58, EASE.enter), [0, 1], [ODO_FROM, ODO_TO]);
  const plus = hero(frame, T.plus);
  const glowPulse = interpolate(frame, [T.plus, T.plus + 10, T.plus + 50], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <AbsoluteFill style={exitStyle(exit)}>
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <filter id="oil-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <line x1={BOX.x} x2={BOX.x + BOX.w} y1={BOX.y + BOX.h + 24} y2={BOX.y + BOX.h + 24} stroke="#FFFFFF" strokeOpacity={0.1 * odoIn} />
          <LightStreak id="oil-line" d={LINE_D} head={line} color="amber" width={3.4} from={LINE[0]} to={LINE[LINE.length - 1]} />
          {line > 0 ? (
            <g transform={`translate(${head.x}, ${head.y})`}>
              <circle r={20} fill={COLORS.amber} opacity={0.55 + glowPulse * 0.3} filter="url(#oil-glow)" />
              <circle r={5.5} fill="#FFFFFF" />
            </g>
          ) : null}
        </svg>
        <At x={BOX.x + BOX.w / 2 - 10} y={BOX.y - 88}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: odoIn, transform: `translateY(${(1 - odoIn) * 18}px)`}}>
            <div dir="ltr" style={{display: 'flex', alignItems: 'center', gap: 4}}>
              <span
                style={{
                  fontFamily: FONT.family,
                  fontWeight: FONT.key,
                  fontSize: 72,
                  color: COLORS.amber,
                  opacity: Math.min(1, Math.max(0, plus) * 1.5),
                  transform: `scale(${0.6 + 0.4 * plus})`,
                  display: 'inline-block',
                  textShadow: `0 0 24px ${hexA(COLORS.amber, 0.6)}`,
                }}
              >
                +
              </span>
              <Odometer value={roll(frame)} prev={roll(frame - 1)} digits={3} size={84} style={{textShadow: `0 0 ${20 + glowPulse * 20}px ${hexA(COLORS.amber, 0.35 + glowPulse * 0.3)}`}} />
            </div>
            <Label text={S3_UNIT} size={26} p={odoIn} weight={FONT.body} color="rgba(245,241,232,0.55)" />
          </div>
        </At>
      </AbsoluteFill>

      <HeroLayer from={T.barrel} to={T.barrel + 40}>
        <div
          style={{
            position: 'absolute',
            left: BARREL.x - BARREL.w / 2,
            top: BARREL.y - (BARREL.w * 1.3) / 2,
            ...heroStyle(barrelIn, `translateY(${(1 - Math.min(1, barrelIn)) * 60}px)`, exit),
          }}
        >
          <OilBarrel id="oil-barrel" width={BARREL.w} fill={fill} frame={frame} />
        </div>
      </HeroLayer>

      <Headline>
        <ArabicText block={S3_OIL} size={LAYOUT.headlineSize} start={T.text} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};
