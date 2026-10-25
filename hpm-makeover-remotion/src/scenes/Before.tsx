import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {IconCross} from '../components/Icons';
import {enter, exit} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {BLAND, FONT} from '../theme';

// 2 · The bland profile (the phone itself lives in ProfileStage). Caption bubbles and
// ✗ tags fade in flat and slow, one after another.
const BUBBLES = [
  {left: 598, top: 520},
  {left: 640, top: 690},
  {left: 618, top: 860},
];
const TAGS = [
  {left: 612, top: 1020, rot: -2},
  {left: 196, top: 1196, rot: -3},
  {left: 300, top: 528, rot: 2},
];

export const Before: React.FC = () => {
  const f = useSceneFrame(SCENES.before.from);
  const out = exit(f, CUE.beforeExit, 20);
  return (
    <AbsoluteFill>
      {COPY.before.bubbles.map((t, i) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            ...BUBBLES[i],
            opacity: enter(f, CUE.bubbles[i], CUE.beforeFade) * (1 - out),
            background: BLAND.bubble,
            color: BLAND.textDark,
            fontFamily: FONT.arial,
            fontSize: 26,
            padding: '16px 24px',
            borderRadius: '24px 24px 24px 6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            whiteSpace: 'nowrap',
          }}
        >
          {t}
        </div>
      ))}
      {COPY.before.tags.map((t, i) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            left: TAGS[i].left,
            top: TAGS[i].top,
            transform: `rotate(${TAGS[i].rot}deg)`,
            opacity: enter(f, CUE.tags[i], CUE.beforeFade) * (1 - out),
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#E6E6E6',
            border: '2px solid #A3A3A3',
            color: '#666666',
            fontFamily: FONT.arial,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.02em',
            padding: '8px 14px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <IconCross size={20} color="#7A7A7A" stroke={3} />
          {t}
        </div>
      ))}
    </AbsoluteFill>
  );
};
