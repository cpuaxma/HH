import {getLength} from '@remotion/paths';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {enterProgress, visualExit} from '../anim';
import {ChartLine, Pt, smoothPath} from '../components/ChartLine';
import {AnimatedText} from '../components/AnimatedText';
import {PulseRing} from '../components/PulseRing';
import {Lang, strings} from '../i18n';
import {colors, HEIGHT, layout, WIDTH} from '../theme';

const CROSS: Pt = [540, 1080];
const GOLD: Pt[] = [
  [170, 1270],
  [270, 1215],
  [360, 1235],
  [455, 1172],
  CROSS,
  [625, 988],
  [720, 1050],
  [810, 945],
  [910, 890],
];
// Mirror of the gold line, so the two cross exactly once, at the centre
const RED: Pt[] = GOLD.map(([x, y]) => [x, CROSS[1] * 2 - y]);

const GOLD_START = 20;
const RED_START = 26;
const DRAW = 130;

const T = {textIn: 4, textOut: 140, chartOut: 148};

// Frame at which a line drawn from `start` reaches the crossing point
const useCrossFrame = (pts: Pt[], start: number) =>
  useMemo(() => {
    const share = getLength(smoothPath(pts.slice(0, 5))) / getLength(smoothPath(pts));
    for (let f = start; f < start + DRAW; f++) if (enterProgress(f, start, DRAW) >= share) return f;
    return start + DRAW;
  }, [pts, start]);

export const Scene1Hook: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const s = strings[lang];
  const crossAt = Math.max(useCrossFrame(GOLD, GOLD_START), useCrossFrame(RED, RED_START));

  const grid = enterProgress(frame, 20, 30) * 0.07;
  const out = visualExit(frame, T.chartOut, 30);

  const gridLines: React.ReactNode[] = [];
  for (let x = 140; x <= 940; x += 80) {
    gridLines.push(<line key={`v${x}`} x1={x} y1={820} x2={x} y2={1340} />);
  }
  for (let y = 820; y <= 1340; y += 80) {
    gridLines.push(<line key={`h${y}`} x1={140} y1={y} x2={940} y2={y} />);
  }

  const crossGlow = interpolate(frame, [crossAt - 4, crossAt + 6, crossAt + 60], [0, 1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{
          position: 'absolute',
          opacity: out.opacity,
          filter: `blur(${out.blur}px)`,
          transform: `scale(${1 - out.q * 0.04})`,
          transformOrigin: `${CROSS[0]}px ${CROSS[1]}px`,
        }}
      >
        <defs>
          <radialGradient id="s1-grid-mask-g" cx="50%" cy="50%" r="55%">
            <stop offset="0.4" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="s1-grid-mask">
            <rect x={140} y={820} width={800} height={520} fill="url(#s1-grid-mask-g)" />
          </mask>
          <radialGradient id="s1-cross-glow">
            <stop offset="0" stopColor={colors.goldTo} stopOpacity={0.55} />
            <stop offset="1" stopColor={colors.goldFrom} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g stroke={colors.text} strokeWidth={1} opacity={grid} mask="url(#s1-grid-mask)">
          {gridLines}
        </g>
        <ChartLine
          id="s1-red"
          points={RED}
          progress={enterProgress(frame, RED_START, DRAW)}
          color={colors.dollar}
          width={4}
        />
        <ChartLine
          id="s1-gold"
          points={GOLD}
          progress={enterProgress(frame, GOLD_START, DRAW)}
          color={colors.goldFrom}
          width={5}
          streak
        />
        <circle cx={CROSS[0]} cy={CROSS[1]} r={90} fill="url(#s1-cross-glow)" opacity={crossGlow} />
        <PulseRing cx={CROSS[0]} cy={CROSS[1]} at={[crossAt, crossAt + 40]} frame={frame} radius={110} width={2.5} duration={60} />
        <circle cx={CROSS[0]} cy={CROSS[1]} r={7} fill="#FFF6DA" opacity={crossGlow} />
      </svg>

      <AnimatedText
        lang={lang}
        lines={s.hook}
        start={T.textIn}
        exit={T.textOut}
        fontSize={lang === 'ar' ? 68 : 64}
        style={{top: layout.headlineY}}
      />
    </AbsoluteFill>
  );
};
