import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {ArabicText} from '../components/ArabicText';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {S3_PRINT} from '../strings';
import {COLORS, FONT, LAYOUT, SAFE} from '../theme';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA} from '../motion';

const NOTE_W = 230;
const NOTE_H = 116;
const NOTES = 18;
const FIRST = 40;
// a new note every 12 frames, accelerating to every 5
const NOTE_TIMES = Array.from({length: NOTES}, (_, i) => i).reduce<number[]>((acc, i) => {
  acc.push(i === 0 ? FIRST : acc[i - 1] + Math.max(5, 12 - (i - 1) * 0.6));
  return acc;
}, []);
const NOTE_IN = 14;

// Opaque notes (so the pile reads as paper, not overlapping outlines); later notes are dimmer.
const Banknote: React.FC<{dim: number}> = ({dim}) => {
  const stroke = hexA(COLORS.fiat, 0.8 * dim);
  return (
    <svg width={NOTE_W} height={NOTE_H} viewBox={`0 0 ${NOTE_W} ${NOTE_H}`}>
      <rect x={1.5} y={1.5} width={NOTE_W - 3} height={NOTE_H - 3} rx={10} fill={COLORS.noteFill} stroke={stroke} strokeWidth={2} />
      <rect x={1.5} y={1.5} width={NOTE_W - 3} height={NOTE_H - 3} rx={10} fill={hexA(COLORS.fiat, 0.08 * dim)} />
      <rect x={12} y={12} width={NOTE_W - 24} height={NOTE_H - 24} rx={6} fill="none" stroke={hexA(COLORS.text, 0.25 * dim)} strokeWidth={1} />
      {[0, 1, 2, 3].map((k) => (
        <React.Fragment key={k}>
          <line x1={24} y1={36 + k * 14} x2={78} y2={36 + k * 14} stroke={hexA(COLORS.text, 0.22 * dim)} strokeWidth={1} />
          <line x1={NOTE_W - 78} y1={36 + k * 14} x2={NOTE_W - 24} y2={36 + k * 14} stroke={hexA(COLORS.text, 0.22 * dim)} strokeWidth={1} />
        </React.Fragment>
      ))}
      <circle cx={NOTE_W / 2} cy={NOTE_H / 2} r={28} fill="none" stroke={stroke} strokeWidth={1.5} />
      <text x={NOTE_W / 2} y={NOTE_H / 2 + 12} textAnchor="middle" fontFamily={FONT.family} fontWeight={FONT.key} fontSize={34} fill={hexA(COLORS.text, 0.85 * dim)}>
        $
      </text>
    </svg>
  );
};

const Note: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const t = NOTE_TIMES[i];
  const p = ease(frame, t, NOTE_IN);
  const fan = -32 + (i / (NOTES - 1)) * 56; // final fan angle: a growing, splayed pile
  const x = -420 * (1 - p) + (i - NOTES / 2) * 4;
  const rot = fan - 40 * (1 - p);
  return (
    <div
      style={{
        position: 'absolute',
        left: -NOTE_W / 2,
        top: -NOTE_H,
        transformOrigin: `${NOTE_W / 2}px ${NOTE_H}px`,
        transform: `translate(${x}px, ${-i * 5}px) rotate(${rot}deg)`,
        opacity: Math.min(1, p * 2.5),
      }}
    >
      <Banknote dim={Math.max(0.45, 1 - i * 0.032)} />
    </div>
  );
};

export const Print: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const divider = ease(frame, 0, 32);
  const bar = hero(frame, 10);
  const breathe = 0.85 + Math.sin(frame / 40) * 0.08;

  return (
    <AbsoluteFill>
      <ArabicText block={S3_PRINT} size={68} start={25} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <LightStreak id="divider" d="M540 700 L540 1460" head={divider} width={2.2} bloom={8} from={[540, 700]} to={[540, 1460]} />
        </svg>

        {/* left: currency printing without limit */}
        <div style={{position: 'absolute', left: 325, top: 1180}}>
          {Array.from({length: NOTES}, (_, i) => {
            const t = NOTE_TIMES[i];
            if (frame < t) return null;
            return frame < t + NOTE_IN ? (
              <Trail key={i} layers={4} lagInFrames={0.4} trailOpacity={0.4}>
                <Note i={i} />
              </Trail>
            ) : (
              <Note key={i} i={i} />
            );
          })}
        </div>

        {/* right: one calm gold bar */}
        <div
          style={{
            position: 'absolute',
            left: 750 - 220,
            top: 1060 - 220,
            width: 440,
            height: 440,
            borderRadius: '50%',
            opacity: Math.min(1, bar) * breathe,
            background: `radial-gradient(circle, ${hexA(COLORS.glow, 0.32)} 0%, ${hexA(COLORS.glow, 0)} 65%)`,
          }}
        />
        <div style={{position: 'absolute', left: 750 - 140, top: 1060 - 80, width: 280, height: 160, ...heroStyle(bar)}}>
          <GoldBar id="print-bar" width={280} frame={frame} sweepStart={70} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
