import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText, Bidi} from '../components/ArabicText';
import {Candles} from '../components/Candles';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {S1_GOLD_TICKER, S1_HOOK, S1_STOCKS_TICKER, VS} from '../strings';
import {COLORS, EASE, FONT, GOLD_GRADIENT, LAYOUT, SAFE, VIDEO} from '../theme';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const DIV_TOP = 780;
const DIV_BOTTOM = 1440;
const MID = 1110; // vertical centre of the split visual
const RIGHT_X = 740; // centre of the right half inside the safe area (540–940)
const LEFT_X = 340; // centre of the left half (140–540)

const Ticker: React.FC<{text: string; gold?: boolean; opacity: number}> = ({text, gold, opacity}) => (
  <div dir="rtl" style={{fontFamily: FONT.family, fontSize: 30, lineHeight: 1.5, textAlign: 'center', opacity}}>
    <span
      style={
        gold
          ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: FONT.key}
          : {color: hexA(COLORS.text, 0.4), fontWeight: FONT.key}
      }
    >
      <Bidi text={text} />
    </span>
  </div>
);

export const Hook: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const divider = ease(frame, 20, 30);
  const bar = hero(frame, 24);
  const vsIn = ease(frame, 50, 20);
  const pulse = interpolate(frame, [90, 100, 112], [1, 1.18, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
  const tickers = ease(frame, 70, 24);
  const out = exitProgress(frame, dur);

  return (
    <AbsoluteFill>
      <ArabicText block={S1_HOOK} size={78} start={-8} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <AbsoluteFill style={exitStyle(out)}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <LightStreak id="hook-divider" d={`M540 ${DIV_TOP} L540 ${DIV_BOTTOM}`} head={divider} width={2.6} bloom={8} from={[540, DIV_TOP]} to={[540, DIV_BOTTOM]} />
        </svg>

        {/* Right half: gold bar */}
        <div style={{position: 'absolute', left: RIGHT_X - 150, top: MID - 120, width: 300, ...heroStyle(bar)}}>
          <GoldBar id="hook-bar" width={300} frame={frame} sweepStart={80} sweepEvery={90} />
        </div>
        <div style={{position: 'absolute', left: RIGHT_X - 150, width: 300, top: MID + 90}}>
          <Ticker text={S1_GOLD_TICKER} gold opacity={tickers} />
        </div>

        {/* Left half: rising blue candles */}
        <div style={{position: 'absolute', left: LEFT_X - 140, top: MID - 245, width: 280, ...heroStyle(hero(frame, 28))}}>
          <Candles id="hook-candles" width={280} frame={frame} start={30} />
        </div>
        <div style={{position: 'absolute', left: LEFT_X - 150, width: 300, top: MID + 90}}>
          <Ticker text={S1_STOCKS_TICKER} opacity={tickers} />
        </div>

        {/* VS on the divider */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 42,
            top: MID - 42,
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: COLORS.bgTop,
            boxShadow: `0 0 0 1px ${hexA(COLORS.text, 0.12)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: vsIn,
            transform: `scale(${(0.8 + 0.2 * vsIn) * pulse})`,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 32,
            color: hexA(COLORS.text, 0.4),
          }}
        >
          <Bidi text={VS} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
