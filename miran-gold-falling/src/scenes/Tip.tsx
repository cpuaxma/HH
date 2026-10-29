import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Accent, COLORS, EASE, LAYOUT, sceneLength} from '../theme';
import {S7_CARDS, S7_PILL, S7_TIP} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {OilBarrel} from '../components/OilBarrel';
import {Gauge} from '../components/Gauge';
import {BankIcon} from '../components/BankIcon';
import {GoldBar} from '../components/GoldBar';
import {HeroLayer} from '../components/Hero';
import {ease, enter, exitProgress, exitStyle, hero, heroStyle} from '../motion';

const DUR = sceneLength('tip');
const CARD = {w: 220, h: 236, y: 1020};
const XS = [790, 540, 290]; // right to left: النفط، التضخم، الفيدرالي
const TONES: Accent[] = ['amber', 'red', 'white'];
const BOTTOM = CARD.y + CARD.h / 2;
const RAIL = BOTTOM + 52;
const BAR = {x: 540, y: RAIL + 96, w: 150};
const T = {pill: 4, text: 14, cards: [150, 176, 202], streak: 236, stubs: 244, stem: 274, bar: 286};

const RAIL_D = `M${XS[0]},${BOTTOM + 4} V${RAIL - 18} Q${XS[0]},${RAIL} ${XS[0] - 18},${RAIL} H${XS[2] + 18} Q${XS[2]},${RAIL} ${XS[2]},${RAIL - 18} V${BOTTOM + 4}`;
const STUB_D = `M${XS[1]},${BOTTOM + 4} V${RAIL}`;
const STEM_D = `M${XS[1]},${RAIL} V${BAR.y - 40}`;

export const Tip: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = exitProgress(frame, DUR);

  const pill = hero(frame, T.pill);
  const rail = ease(frame, T.streak, 40, EASE.inOut);
  const stub = ease(frame, T.stubs + 8, 18);
  const stem = ease(frame, T.stem, 16);
  const barIn = hero(frame, T.bar);
  const barGlint = interpolate(frame, [T.bar, T.bar + 12, T.bar + 50], [0, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const icon = (i: number) => {
    if (i === 0) return <OilBarrel id="tip-barrel" width={84} fill={0.55} frame={frame} stroke={4} />;
    if (i === 1) return <Gauge id="tip-gauge" height={120} level={0.8} pulse={0.5 + 0.5 * Math.sin(frame * 0.12)} />;
    return <BankIcon width={112} stroke={5} />;
  };

  return (
    <AbsoluteFill>
      {XS.map((x, i) => {
        const p = hero(frame, T.cards[i]);
        const lbl = enter(frame, T.cards[i] + 10);
        return (
          <HeroLayer key={i} from={T.cards[i]} to={T.cards[i] + 36} samples={5}>
            <div
              style={{
                position: 'absolute',
                left: x - CARD.w / 2,
                top: CARD.y - CARD.h / 2,
                width: CARD.w,
                height: CARD.h,
                ...heroStyle(p, '', exit),
              }}
            >
              <GlassCard style={{left: 0, top: 0, width: CARD.w, height: CARD.h}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 26, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {icon(i)}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center'}}>
                <Label text={S7_CARDS[i]} size={34} p={lbl} tone={TONES[i] === 'white' ? null : TONES[i]} color={COLORS.text} />
              </div>
            </div>
          </HeroLayer>
        );
      })}

      <AbsoluteFill style={exitStyle(exit)}>
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <LightStreak id="tip-rail" d={RAIL_D} head={rail} width={3} bloom={8} from={[XS[0], RAIL]} to={[XS[2], RAIL]} />
          <LightStreak id="tip-stub" d={STUB_D} head={stub} width={3} bloom={8} from={[XS[1], BOTTOM]} to={[XS[1], RAIL]} />
          <LightStreak id="tip-stem" d={STEM_D} head={stem} width={3.4} bloom={10} from={[XS[1], RAIL]} to={[XS[1], BAR.y - 40]} />
        </svg>
      </AbsoluteFill>

      <HeroLayer from={T.bar} to={T.bar + 36}>
        <div
          style={{
            position: 'absolute',
            left: BAR.x - BAR.w / 2,
            top: BAR.y - (BAR.w * 170) / 300 / 2,
            ...heroStyle(barIn, '', exit),
            filter: `${heroStyle(barIn, '', exit).filter ?? ''} drop-shadow(0 0 ${10 + barGlint * 26}px rgba(243,210,122,${0.35 + barGlint * 0.4}))`,
          }}
        >
          <GoldBar id="tip-bar" width={BAR.w} frame={frame} sweepStart={T.bar + 6} sweepEvery={400} />
        </div>
      </HeroLayer>

      <At x={540} y={LAYOUT.headlineTop - 34}>
        <div style={exitStyle(exit)}>
          <Pill text={S7_PILL} p={pill} accent="gold" size={30} />
        </div>
      </At>
      <Headline top={LAYOUT.headlineTop + 20}>
        <ArabicText block={S7_TIP} size={LAYOUT.headlineSize} start={T.text} exitEnd={DUR} />
      </Headline>
    </AbsoluteFill>
  );
};
