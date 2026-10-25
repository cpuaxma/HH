import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {ChartLine} from '../components/ChartLine';
import {GlassCard} from '../components/GlassCard';
import {LightStreak} from '../components/LightStreak';
import {ILLUSTRATIVE, S4_CRISIS, S4_CRISIS_LABEL} from '../strings';
import {COLORS, EASE, FONT, LAYOUT, SAFE} from '../theme';
import {Pt, ease, exitProgress, exitStyle, fractionAtX, hexA, pointAt, polyD} from '../motion';

// Panel-local coordinates (800×600). Illustrative shapes only, no real data.
const W = 800;
const H = 600;
const X0 = 60;
const X1 = 740;
const BAND: [number, number] = [320, 470];

// Blue (stocks): calm rise, sharp drop inside the band, then a recovery.
const PRE: Pt[] = [[X0, 300], [130, 272], [200, 286], [265, 248], [330, 236]];
const DROP: Pt[] = [[330, 236], [362, 262], [402, 452]];
const POST: Pt[] = [[402, 452], [432, 428], [470, 360], [540, 316], [610, 262], [680, 228], [X1, 186]];
const BLUE_ALL: Pt[] = [...PRE, ...DROP.slice(1), ...POST.slice(1)];
const TROUGH = DROP[DROP.length - 1];

// Gold: holds level, with a slight wobble that grows a little through the crisis band.
const GOLD: Pt[] = Array.from({length: 69}, (_, i) => {
  const x = X0 + i * 10;
  const inBand = Math.exp(-(((x - 395) / 70) ** 2));
  return [x, 392 - (x - X0) * 0.05 + Math.sin(x / 26) * (3 + 9 * inBand)];
});

const segHead = (headX: number, seg: Pt[]) =>
  headX <= seg[0][0] ? 0 : headX >= seg[seg.length - 1][0] ? 1 : fractionAtX(seg, headX);

export const Crisis: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const panel = ease(frame, 0, 40);
  const draw = ease(frame, 40, 120, EASE.inOut);
  const headX = X0 + (X1 - X0) * draw;

  // frames at which the head crosses the band and reaches the trough
  const frameAtX = (x: number) => {
    for (let f = 40; f <= 160; f += 0.5) if (X0 + (X1 - X0) * ease(f, 40, 120, EASE.inOut) >= x) return f;
    return 160;
  };
  const bandAt = frameAtX(BAND[0]);
  const troughAt = frameAtX(TROUGH[0]);
  const label = ease(frame, bandAt - 6, 24);
  const redTurn = ease(frame, troughAt - 4, 14);
  const flash = interpolate(frame, [troughAt, troughAt + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});

  const blueTip = pointAt(BLUE_ALL, fractionAtX(BLUE_ALL, headX));
  const goldTip = pointAt(GOLD, fractionAtX(GOLD, headX));
  const drawing = draw > 0.001 && draw < 0.999;

  return (
    <AbsoluteFill>
      <ArabicText block={S4_CRISIS} size={76} start={12} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <div style={{position: 'absolute', left: SAFE.side, top: LAYOUT.visualTop, width: W, height: H, ...exitStyle(out)}}>
        <GlassCard
          style={{
            inset: 0,
            opacity: panel,
            transform: `scale(${0.96 + 0.04 * panel})`,
            filter: panel < 0.999 ? `blur(${(1 - panel) * 10}px)` : undefined,
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="crisis-band" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.07" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x={BAND[0]} y={60} width={BAND[1] - BAND[0]} height={480} fill="url(#crisis-band)" />
            <rect x={BAND[0]} y={60} width={BAND[1] - BAND[0]} height={480} fill={COLORS.red} opacity={0.08 * (1 - flash) * (flash > 0 ? 1 : 0)} />
            <line x1={X0} y1={540} x2={X1} y2={540} stroke={COLORS.text} strokeOpacity={0.12} strokeWidth={1.5} />

            <LightStreak id="crisis-gold" d={polyD(GOLD)} head={fractionAtX(GOLD, headX)} width={3.2} bloom={8} from={[X0, 392]} to={[X1, 392]} />

            <ChartLine d={polyD(PRE)} progress={segHead(headX, PRE)} color={COLORS.blueB} width={4} glow={6} />
            <ChartLine d={polyD(DROP)} progress={segHead(headX, DROP)} color={COLORS.blueB} width={4} glow={6} opacity={1 - redTurn} />
            <ChartLine d={polyD(DROP)} progress={segHead(headX, DROP)} color={COLORS.red} width={4.5} glow={8} opacity={redTurn} />
            <ChartLine d={polyD(POST)} progress={segHead(headX, POST)} color={COLORS.blueB} width={4} glow={6} />

            {frame >= troughAt ? (
              <g>
                <circle cx={TROUGH[0]} cy={TROUGH[1]} r={10 + flash * 60} fill={hexA(COLORS.red, 0.35 * (1 - flash))} />
                <circle cx={TROUGH[0]} cy={TROUGH[1]} r={6 + flash * 30} fill="none" stroke={COLORS.red} strokeWidth={2.5} opacity={1 - flash} />
              </g>
            ) : null}

            {drawing ? (
              <g>
                <circle cx={blueTip[0]} cy={blueTip[1]} r={6} fill="#EAF1FF" style={{filter: `drop-shadow(0 0 8px ${COLORS.blueA})`}} />
                <circle cx={goldTip[0]} cy={goldTip[1]} r={6} fill="#FFF6DA" style={{filter: `drop-shadow(0 0 8px ${COLORS.goldA})`}} />
              </g>
            ) : null}
          </svg>

          <div
            dir="rtl"
            style={{position: 'absolute', left: BAND[0], width: BAND[1] - BAND[0], top: 66, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.body, fontSize: 28, lineHeight: 1.5, color: hexA(COLORS.text, 0.4), opacity: label}}
          >
            {S4_CRISIS_LABEL}
          </div>
          <div dir="rtl" style={{position: 'absolute', right: 28, top: 20, fontFamily: FONT.family, fontWeight: FONT.body, fontSize: 22, lineHeight: 1.5, color: hexA(COLORS.text, 0.4)}}>
            {ILLUSTRATIVE}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};
