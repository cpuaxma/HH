import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, FONT, LAYOUT} from '../theme';
import {S4_FED, S4_GAUGE, S4_INFLATION, S4_RATE} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {Gauge} from '../components/Gauge';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {BankIcon} from '../components/BankIcon';
import {HeroLayer} from '../components/Hero';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const DUR = 310;
const GAUGE = {x: 720, y: 1070, h: 430};
const FED = {x: 360, y: 960};
const ARROW = {x: 360, y: 1130};
const T = {text: 8, gauge: 15, fill: 42, label: 40, streak: 100, fed: 124, arrow: 138};

export const Inflation: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const gaugeIn = hero(frame, T.gauge);
  const level = ease(frame, T.fill, 72, EASE.inOut) * 0.86;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
  const gaugeLabel = enter(frame, T.label);
  const streak = ease(frame, T.streak, 26);
  const fed = hero(frame, T.fed);
  const arrowIn = hero(frame, T.arrow);
  const arrowLabel = enter(frame, T.arrow + 8);
  const bob = arrowIn > 0.5 ? Math.sin((frame - T.arrow) * 0.08) * 4 : 0;

  const S0: [number, number] = [GAUGE.x - 34, GAUGE.y - 170];
  const S1: [number, number] = [FED.x + 118, FED.y];
  const streakD = `M${S0[0]},${S0[1]} Q${(S0[0] + S1[0]) / 2 + 10},${S0[1] - 70} ${S1[0]},${S1[1]}`;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={exitStyle(exit)}>
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <LightStreak id="infl-streak" d={streakD} head={streak} color="red" width={2.6} bloom={7} from={S0} to={S1} />
        </svg>
        <At x={FED.x} y={FED.y}>
          <Pill text={S4_FED} p={fed} accent="white" textTone="white" size={32}>
            <BankIcon width={34} />
          </Pill>
        </At>
        <At x={ARROW.x} y={ARROW.y}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: Math.min(1, Math.max(0, arrowIn) * 1.5),
              transform: `translateY(${(1 - Math.min(1, arrowIn)) * 40 + bob}px) scale(${0.7 + 0.3 * arrowIn})`,
            }}
          >
            <svg width={120} height={110} viewBox="0 0 120 110" style={{overflow: 'visible'}}>
              <defs>
                <filter id="arrow-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
              </defs>
              <path d="M60,6 L112,100 L8,100 Z" fill={COLORS.red} opacity={0.6} filter="url(#arrow-glow)" />
              <path d="M60,6 L112,100 L8,100 Z" fill={COLORS.red} stroke="#F29A97" strokeWidth={2} strokeLinejoin="round" />
            </svg>
          </div>
        </At>
        <At x={ARROW.x} y={ARROW.y + 104}>
          <Label text={S4_RATE} size={40} p={arrowLabel} tone="red" />
        </At>
        <At x={GAUGE.x} y={GAUGE.y + GAUGE.h / 2 + 46}>
          <Label text={S4_GAUGE} size={40} p={gaugeLabel} tone="red" />
        </At>
      </AbsoluteFill>

      <HeroLayer from={T.gauge} to={T.gauge + 40}>
        <div
          style={{
            position: 'absolute',
            left: GAUGE.x - (GAUGE.h * 120) / 420 / 2,
            top: GAUGE.y - GAUGE.h / 2,
            ...heroStyle(gaugeIn, '', exit),
            filter: `${heroStyle(gaugeIn, '', exit).filter ?? ''} drop-shadow(0 0 ${12 * level}px ${hexA(COLORS.red, 0.4)})`,
          }}
        >
          <Gauge id="infl-gauge" height={GAUGE.h} level={level} pulse={pulse * interpolate(level, [0.5, 0.86], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        </div>
      </HeroLayer>

      <Headline>
        <ArabicText block={S4_INFLATION} size={LAYOUT.headlineSize - 4} start={T.text} exitEnd={DUR} weight={FONT.body} />
      </Headline>
    </AbsoluteFill>
  );
};
