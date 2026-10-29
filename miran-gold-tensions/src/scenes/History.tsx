import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {GoldBar} from '../components/GoldBar';
import {LightStreak} from '../components/LightStreak';
import {S5_HISTORY} from '../strings';
import {COLORS, LAYOUT, SAFE} from '../theme';
import {ease, exitProgress, exitStyle, hero, heroStyle, hexA, noise} from '../motion';

const Y = 1130;
// Time runs right → left (RTL): the line starts at the right edge of the safe area.
const TIMELINE_D = `M ${1080 - SAFE.right} ${Y} L ${SAFE.side - 30} ${Y}`;
const SIZE = 180;

/** Ancient hand-struck coin: irregular edge, worn surface and an incuse square punch mark. */
const AncientCoin: React.FC = () => {
  const pts = new Array(36).fill(0).map((_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = 78 + noise(3, i * 0.9) * 7;
    return `${(90 + Math.cos(a) * r).toFixed(1)} ${(90 + Math.sin(a) * r * 0.94).toFixed(1)}`;
  });
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 180 180" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="ancient" cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#F0CC78" />
          <stop offset="0.55" stopColor="#C08E3C" />
          <stop offset="1" stopColor="#7A5420" />
        </radialGradient>
      </defs>
      <path d={'M' + pts.join(' L ') + ' Z'} fill="url(#ancient)" />
      <path d={'M' + pts.join(' L ') + ' Z'} fill="none" stroke="#FBE3A2" strokeOpacity={0.35} strokeWidth={2} />
      {/* incuse square: a sunken, slightly rotated punch with a cross */}
      <g transform="rotate(-8 90 90)">
        <rect x="62" y="62" width="56" height="56" rx="6" fill="#7A5420" fillOpacity={0.55} />
        <rect x="62" y="62" width="56" height="56" rx="6" fill="none" stroke="#FBE3A2" strokeOpacity={0.45} strokeWidth={2} />
        <path d="M66 66 L114 114 M114 66 L66 114" stroke="#E8BE68" strokeWidth={3} strokeOpacity={0.7} />
      </g>
    </svg>
  );
};

/** Classic minted coin: perfect circle, raised reeded rim, ring of beads and a central star. */
const MintedCoin: React.FC = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 180 180" style={{overflow: 'visible'}}>
    <defs>
      <radialGradient id="minted" cx="0.36" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#FFE9A8" />
        <stop offset="0.5" stopColor={COLORS.goldA} />
        <stop offset="1" stopColor={COLORS.goldDeep} />
      </radialGradient>
      <linearGradient id="minted-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={COLORS.goldB} />
        <stop offset="1" stopColor={COLORS.goldShadow} />
      </linearGradient>
    </defs>
    <circle cx="90" cy="90" r="82" fill="url(#minted-rim)" />
    {new Array(60).fill(0).map((_, i) => {
      const a = (i / 60) * Math.PI * 2;
      return <line key={i} x1={90 + Math.cos(a) * 77} y1={90 + Math.sin(a) * 77} x2={90 + Math.cos(a) * 82} y2={90 + Math.sin(a) * 82} stroke={COLORS.goldShadow} strokeWidth={1.4} />;
    })}
    <circle cx="90" cy="90" r="70" fill="url(#minted)" />
    <circle cx="90" cy="90" r="70" fill="none" stroke="#FFF0C0" strokeOpacity={0.5} strokeWidth={1.5} />
    {new Array(28).fill(0).map((_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return <circle key={i} cx={90 + Math.cos(a) * 58} cy={90 + Math.sin(a) * 58} r={2.2} fill={COLORS.goldDeep} fillOpacity={0.7} />;
    })}
    <path
      d="M90 58 L98 80 L121 80 L102 94 L109 116 L90 102 L71 116 L78 94 L59 80 L82 80 Z"
      fill={COLORS.goldB}
      stroke={COLORS.goldDeep}
      strokeOpacity={0.6}
      strokeWidth={2}
    />
  </svg>
);

const OBJECTS = [
  {x: 800, at: 50, C: AncientCoin},
  {x: 540, at: 100, C: MintedCoin},
  {x: 280, at: 150, C: null},
];

export const History: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const line = ease(frame, 0, 60);
  const finale = ease(frame, 160, 45);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <LightStreak id="timeline" d={TIMELINE_D} head={line} width={3} from={[1080 - SAFE.right, Y]} to={[SAFE.side, Y]} opacity={0.85} />
          {OBJECTS.map((o, i) => {
            const land = frame - (o.at + 14);
            const ring = interpolate(land, [0, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <g key={i}>
                <circle cx={o.x} cy={Y} r={6} fill={COLORS.goldB} opacity={ease(frame, o.at - 10, 14)} />
                {land >= 0 && ring < 1 ? (
                  <circle cx={o.x} cy={Y} r={60 + ring * 110} fill="none" stroke={COLORS.goldB} strokeWidth={2.5 * (1 - ring) + 0.5} opacity={(1 - ring) * 0.7} />
                ) : null}
              </g>
            );
          })}
        </svg>

        {OBJECTS.map((o, i) => {
          const p = hero(frame, o.at);
          const next = OBJECTS[i + 1];
          const dim = next ? ease(frame, next.at + 8, 30) : 0; // each object dims when the next one lands
          const isBar = o.C === null;
          const brightness = isBar ? 1 + 0.2 * finale : 1 - 0.45 * dim;
          const w = isBar ? 230 : SIZE;
          const h = isBar ? (230 * 170) / 300 : SIZE;
          return (
            <React.Fragment key={i}>
              {isBar ? (
                <div
                  style={{
                    position: 'absolute',
                    left: o.x - 220,
                    top: Y - 240,
                    width: 440,
                    height: 440,
                    borderRadius: '50%',
                    opacity: Math.min(1, p) * (0.4 + 0.6 * finale),
                    background: `radial-gradient(circle, ${hexA(COLORS.goldB, 0.4)} 0%, ${hexA(COLORS.glow, 0)} 65%)`,
                  }}
                />
              ) : null}
              <div
                style={{
                  position: 'absolute',
                  left: o.x - w / 2,
                  top: Y - h - 26,
                  width: w,
                  height: h,
                  ...heroStyle(p),
                  filter: `brightness(${brightness}) saturate(${1 - 0.3 * dim}) drop-shadow(0 16px 26px rgba(0,0,0,0.45))`,
                }}
              >
                {o.C ? <o.C /> : <GoldBar id="s5-bar" width={w} frame={frame} sweepStart={175} />}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <ArabicText
        block={S5_HISTORY}
        size={LAYOUT.headlineSize - 8}
        start={8}
        exitEnd={dur}
        style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}}
      />
    </AbsoluteFill>
  );
};
