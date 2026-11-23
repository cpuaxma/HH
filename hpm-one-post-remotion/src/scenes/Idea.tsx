import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, rand, spr} from '../lib/anim';
import {fitSize} from '../lib/text';
import {Caption} from '../components/Caption';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.idea;
const NOTE = 380;
// Where each note lands (centre x, centre y, rotation). The chosen one then moves to WIN.
const SPOTS: [number, number, number][] = [
  [330, 610, -8],
  [700, 640, 7],
  [515, 900, -3],
];
const WIN = {x: 515, y: 730, scale: 1.12};

// Hand-drawn circle: a wobbly ellipse that overshoots its start.
const circlePath = (cx: number, cy: number, rx: number, ry: number) => {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n * 1.12; i++) {
    const a = -Math.PI * 0.62 + (i / n) * Math.PI * 2;
    const wob = 1 + 0.035 * Math.sin(i * 0.9) + (i / n) * 0.06;
    pts.push(`${(cx + Math.cos(a) * rx * wob).toFixed(1)},${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};

// Scribbled-out X over a note (two quick strokes).
const scribble = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy - r * 0.8} Q ${cx} ${cy - r * 0.1}, ${cx + r} ${cy + r * 0.85} M ${cx + r * 0.9} ${cy - r * 0.85} Q ${cx + r * 0.1} ${cy}, ${cx - r * 0.85} ${cy + r * 0.9}`;

export const Idea: React.FC = () => {
  const t = useSceneFrame();
  const cross = clamp(spr(t, C.crossAt, MOTION.smooth, 10));
  const win = spr(t, C.dropAt + 2, MOTION.snap);
  const circle = clamp(spr(t, C.circleAt, MOTION.smooth, C.circleFrames));
  const textSize = fitSize(C.notes.map((n) => n.split(' ').sort((a, b) => b.length - a.length)[0]), SIZES.note, NOTE - 70);

  // little kick of the whole board on each slap
  let shake = 0;
  C.noteAt.forEach((at, i) => {
    const d = t - at - 3;
    if (d >= 0 && d < 10) shake += 7 * Math.exp(-d * 0.5) * Math.sin(d * 2.8 + i);
  });

  return (
    <AbsoluteFill style={{transform: `translateY(${shake.toFixed(2)}px)`}}>
      {C.notes.map((text, i) => {
        const [sx, sy, sr] = SPOTS[i % SPOTS.length];
        const slap = spr(t, C.noteAt[i], MOTION.slam);
        if (slap <= 0) return null;
        const isWin = i === C.chosenNote;
        let x = sx;
        let y = sy;
        let r = sr + (1 - slap) * (i % 2 ? 14 : -14);
        let scale = mix(1.7, 1, slap);
        let opacity = clamp(slap * 3);
        if (isWin) {
          x = mix(sx, WIN.x, win);
          y = mix(sy, WIN.y, win);
          r = mix(r, 0, win);
          scale *= mix(1, WIN.scale, win);
        } else {
          // fall away after being scribbled out
          const d = Math.max(0, t - C.dropAt - i * 3);
          y += 0.9 * d * d;
          r += d * (i % 2 ? 2.2 : -2.2);
          opacity *= clamp(1 - d / 16);
        }
        y += Math.sin(t * 0.09 + i * 1.7) * 5;
        if (opacity <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - NOTE / 2,
              top: y - NOTE / 2,
              width: NOTE,
              height: NOTE,
              transform: `rotate(${r.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
              zIndex: isWin ? 5 : i,
              opacity,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isWin ? '#FFF1C9' : COLORS.card,
                borderRadius: 8,
                boxShadow: `0 22px 50px ${COLORS.shadow}`,
                clipPath: 'polygon(0 0, 100% 0, 100% 86%, 86% 100%, 0 100%)',
              }}
            />
            <div style={{position: 'absolute', right: 0, bottom: 0, width: NOTE * 0.14, height: NOTE * 0.14, background: '#E9DFC8', clipPath: 'polygon(0 0, 100% 0, 0 100%)'}} />
            <div
              style={{
                position: 'absolute',
                left: NOTE / 2 - 70,
                top: -16,
                width: 140,
                height: 38,
                background: i % 2 ? COLORS.orange : COLORS.red,
                opacity: 0.88,
                transform: `rotate(${(rand(i + 5) - 0.5) * 10}deg)`,
              }}
            />
            <div
              data-qa="text"
              style={{
                position: 'absolute',
                inset: '56px 34px 44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: textSize,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: COLORS.ink,
              }}
            >
              {text}
            </div>
            {!isWin && cross > 0 ? (
              <svg width={NOTE} height={NOTE} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <path d={scribble(NOTE / 2, NOTE / 2, NOTE * 0.36)} fill="none" stroke={COLORS.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cross} />
              </svg>
            ) : null}
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, zIndex: 10, overflow: 'visible'}}>
        <path
          d={circlePath(WIN.x, WIN.y + Math.sin(t * 0.09 + C.chosenNote * 1.7) * 5, NOTE * WIN.scale * 0.78, NOTE * WIN.scale * 0.74)}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={14}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - circle}
          opacity={circle > 0 ? 1 : 0}
        />
      </svg>
      <Caption lines={C.caption} at={C.captionAt} />
      {C.noteAt.map((at, i) => (
        <Sfx key={i} name="pop" at={at + 3} />
      ))}
      <Sfx name="whoosh" at={C.dropAt} />
    </AbsoluteFill>
  );
};
