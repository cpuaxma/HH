import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, rand, spr} from '../lib/anim';
import {Caption} from '../components/Caption';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.idea;
const NOTE = 252;

// Scattered resting spots (centre x, centre y, rotation) inside the inner safe box.
const SPOTS: [number, number, number][] = [
  [262, 560, -7],
  [522, 520, 4],
  [768, 580, -3],
  [276, 905, 5],
  [528, 880, -4],
  [770, 930, 7],
];
const PILE = {x: 515, y: 720};

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

export const Idea: React.FC = () => {
  const t = useSceneFrame();
  const circle = spr(t, C.circleAt, MOTION.smooth, C.circleFrames);
  const focus = spr(t, C.circleAt - 4, MOTION.snap);
  const chosen = SPOTS[C.chosenNote];

  return (
    <AbsoluteFill>
      {C.notes.map((text, i) => {
        const [sx, sy, sr] = SPOTS[i % SPOTS.length];
        // 1) fly in from off-screen into a loose pile, 2) scatter to its spot.
        const fly = spr(t, C.flyInAt + i * C.flyStagger, MOTION.snap);
        const scatter = spr(t, C.scatterAt + i * 1.5, MOTION.bouncy);
        const ang = rand(i * 3.3) * Math.PI * 2;
        const fromX = PILE.x + Math.cos(ang) * 1300;
        const fromY = PILE.y + Math.sin(ang) * 1300;
        const pileX = PILE.x + (rand(i + 4) - 0.5) * 60;
        const pileY = PILE.y + (rand(i + 9) - 0.5) * 60;
        let x = mix(fromX, pileX, fly);
        let y = mix(fromY, pileY, fly);
        let r = mix(rand(i) * 120 - 60, (rand(i + 2) - 0.5) * 24, fly);
        x = mix(x, sx, scatter);
        y = mix(y, sy, scatter);
        r = mix(r, sr, scatter);
        // idle float so nothing is ever still
        y += Math.sin(t * 0.09 + i * 1.7) * 5;
        r += Math.sin(t * 0.07 + i) * 1.2;
        const isChosen = i === C.chosenNote;
        const scale = isChosen ? 1 + 0.1 * focus : 1 - 0.06 * focus;
        if (isChosen) r = mix(r, 0, focus);
        const dim = isChosen ? 1 : 1 - 0.55 * focus;
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
              zIndex: isChosen ? 5 : i,
              opacity: dim,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: i % 2 ? '#F3F1EC' : COLORS.offWhite,
                borderRadius: 6,
                boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
                clipPath: 'polygon(0 0, 100% 0, 100% 84%, 84% 100%, 0 100%)',
              }}
            />
            <div style={{position: 'absolute', right: 0, bottom: 0, width: NOTE * 0.16, height: NOTE * 0.16, background: '#D9D6CF', clipPath: 'polygon(0 0, 100% 0, 0 100%)'}} />
            <div
              style={{
                position: 'absolute',
                left: NOTE / 2 - 50,
                top: -12,
                width: 100,
                height: 28,
                background: i % 3 === 0 ? COLORS.red : COLORS.orange,
                opacity: 0.85,
                transform: `rotate(${(rand(i + 5) - 0.5) * 10}deg)`,
              }}
            />
            <div
              data-qa="text"
              style={{
                position: 'absolute',
                inset: '44px 22px 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: SIZES.note,
                lineHeight: 1.12,
                color: COLORS.ink,
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, zIndex: 10, overflow: 'visible'}}>
        <path
          d={circlePath(chosen[0], chosen[1] + Math.sin(t * 0.09 + C.chosenNote * 1.7) * 5, NOTE * 0.8, NOTE * 0.74)}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - clamp(circle)}
          opacity={circle > 0 ? 1 : 0}
        />
      </svg>
      <Caption lines={C.caption} at={C.captionAt} />
      {C.notes.map((_, i) => (
        <Sfx key={i} name="pop" at={C.flyInAt + i * C.flyStagger + 4} />
      ))}
    </AbsoluteFill>
  );
};
