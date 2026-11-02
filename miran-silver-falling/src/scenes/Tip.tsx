import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ACCENT_GLOW, COLORS, EASE, LAYOUT, SCENES, VIDEO} from '../theme';
import {S7_CARDS, S7_PILL, S7_TIP} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {GlassCard} from '../components/GlassCard';
import {Gauge} from '../components/Gauge';
import {IndustryIcon} from '../components/IndustryIcon';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {Station} from '../components/World';
import {Studio} from '../components/three/Studio';
import {SilverCoin3D} from '../components/three/SilverCoin3D';
import {STRIP} from '../components/StoryStrip';
import {ease, enter, hero, heroStyle, hexA} from '../motion';

const START = SCENES.tip[0];
const TEXT_END = SCENES.tip[1] - START;
const CARD = {w: 212, h: 206};
// An arc, right → left: التضخم، الفائدة، الطلب الصناعي.
const POS = [
  {x: 784, y: 960, r: 5},
  {x: 540, y: 905, r: 0},
  {x: 296, y: 960, r: -5},
];
const COIN = {x: 540, y: 1250, canvasTop: 1060, canvasH: 400};
const T = {pill: 4, text: 14, coin: 40, cards: [76, 88, 100], streak: 122, glint: 168};
const PULL = {start: SCENES.cta[0] - START, dur: 56}; // the camera pull-back into the CTA's story strip

const RateArrow: React.FC = () => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <path d="M14,84 L44,54 L62,70 L96,30" fill="none" stroke={COLORS.red} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M76,28 H98 V50" fill="none" stroke={COLORS.red} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Tip: React.FC = () => {
  const frame = useCurrentFrame();
  const pill = hero(frame, T.pill);
  const coinIn = Math.max(0, hero(frame, T.coin));
  const glint = interpolate(frame, [T.glint, T.glint + 8, T.glint + 40], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const spin = (1 - Math.min(1, coinIn)) * 2.6 + Math.sin(frame * 0.018) * 0.5;

  // Pull-back: the whole station shrinks into the left-most tile of the CTA's story strip.
  const pull = interpolate(frame, [PULL.start, PULL.start + PULL.dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.glide});
  const tile = STRIP.tiles[STRIP.tiles.length - 1];
  const scale = 1 + (STRIP.w / VIDEO.width - 1) * pull;
  const dx = (tile.x - VIDEO.width / 2) * pull;
  const dy = (STRIP.y - VIDEO.height / 2) * pull;

  const icon = (i: number) =>
    i === 0 ? <Gauge id="tip-gauge" height={112} level={0.8} pulse={0.5 + 0.5 * Math.sin(frame * 0.12)} /> : i === 1 ? <RateArrow /> : <IndustryIcon kind="factory" size={104} color={COLORS.blue} stroke={4} />;

  const target: [number, number] = [COIN.x, COIN.y - 150];
  const streaks = POS.map((p) => `M${p.x},${p.y + CARD.h / 2 + 4} C${p.x},${p.y + CARD.h / 2 + 90} ${target[0]},${target[1] - 80} ${target[0]},${target[1]}`);

  return (
    <AbsoluteFill>
      <Station index={6} from={START}>
        <AbsoluteFill
          style={{
            transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
            opacity: interpolate(frame, [PULL.start + 70, PULL.start + 80], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            borderRadius: 60 * pull,
            overflow: pull > 0 ? 'hidden' : undefined,
            border: pull > 0 ? `${3 / Math.max(0.1, scale)}px solid ${hexA('#FFFFFF', 0.2 * pull)}` : undefined,
            background: pull > 0 ? `linear-gradient(180deg, ${hexA(COLORS.bgTop, pull)}, ${hexA(COLORS.bgBottom, pull)})` : undefined,
          }}
        >
          {/* halo + glint behind the coin */}
          <div
            style={{
              position: 'absolute',
              left: COIN.x - 320,
              top: COIN.y - 260,
              width: 640,
              height: 520,
              borderRadius: '50%',
              opacity: Math.min(1, coinIn),
              background: `radial-gradient(ellipse at center, ${hexA('#DCE6F5', 0.16 + glint * 0.3)} 0%, ${hexA('#DCE6F5', 0)} 65%)`,
            }}
          />
          <div style={{position: 'absolute', left: 0, top: COIN.canvasTop, width: VIDEO.width, height: COIN.canvasH, opacity: Math.min(1, coinIn * 2)}}>
            <ThreeCanvas width={VIDEO.width} height={COIN.canvasH} camera={{fov: 30, position: [0, 0, 7.5]}} gl={{antialias: true}}>
              <Studio frontFill={2.4} />
              <directionalLight position={[-3, 4, 5]} intensity={2 + glint * 3} />
              <directionalLight position={[4, 1, -2]} intensity={1.2} color="#9CC7FF" />
              <SilverCoin3D position={[0, -(COIN.y - COIN.canvasTop - COIN.canvasH / 2) / 95 - (1 - Math.min(1, coinIn)) * 0.6, 0]} rotation={[0.12, spin, 0]} scale={1.45 * (0.7 + 0.3 * coinIn)} />
            </ThreeCanvas>
          </div>
          {/* star glint */}
          {glint > 0.01 ? (
            <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
              <g transform={`translate(${COIN.x + 70}, ${COIN.y - 70})`} opacity={glint}>
                <path d="M0,-60 L6,-6 L60,0 L6,6 L0,60 L-6,6 L-60,0 L-6,-6 Z" fill="#FFFFFF" />
                <circle r={14} fill="#FFFFFF" style={{filter: 'blur(6px)'}} />
              </g>
            </svg>
          ) : null}

          <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
            {streaks.map((d, i) => (
              <LightStreak
                key={i}
                id={`tip-streak-${i}`}
                d={d}
                head={ease(frame, T.streak + i * 8, 34, EASE.inOut)}
                color={S7_CARDS[i].accent}
                width={2.6}
                bloom={7}
                from={[POS[i].x, POS[i].y + CARD.h / 2]}
                to={target}
              />
            ))}
          </svg>

          {POS.map((pos, i) => {
            const p = Math.max(0, hero(frame, T.cards[i]));
            const lbl = enter(frame, T.cards[i] + 10);
            const glow = ACCENT_GLOW[S7_CARDS[i].accent];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: pos.x - CARD.w / 2,
                  top: pos.y - CARD.h / 2,
                  width: CARD.w,
                  height: CARD.h,
                  ...heroStyle(p, `rotate(${pos.r}deg)`),
                }}
              >
                <GlassCard style={{left: 0, top: 0, width: CARD.w, height: CARD.h, boxShadow: `0 30px 70px rgba(0,0,0,0.35), 0 0 30px ${hexA(glow, 0.18)}`}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: 22, height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon(i)}</div>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center'}}>
                  <Label text={S7_CARDS[i].label} size={30} p={lbl} tone={S7_CARDS[i].accent} />
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Station>

      <At x={540} y={LAYOUT.headlineTop - 34}>
        <div style={{opacity: interpolate(frame, [TEXT_END - 18, TEXT_END], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <Pill text={S7_PILL} p={pill} size={30} />
        </div>
      </At>
      <Headline top={LAYOUT.headlineTop + 20}>
        <ArabicText block={S7_TIP} size={LAYOUT.headlineSize} start={T.text} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};
