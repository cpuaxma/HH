import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, FONT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {AnimatedText} from '../components/AnimatedText';
import {Pin} from '../components/Pin';
import {Scrim} from '../components/Scrim';
import {CROWD_OFFSET, PIN_AT, crowdOpacity, crowdPos} from '../lib/crowd';
import {project, shapeWeights} from '../lib/director';
import {EASE, ease, windowed} from '../lib/motion';
import {shapeAtU} from '../lib/track';

const from = SCENES.crowd.from;
const c = CUES.crowd;

/** 0:29-0:33 Fast replay: the crowd buys the top and sells the bottom; the calm investor does the opposite. */
export const S6Crowd: React.FC = () => {
  const g = useCurrentFrame() + from;
  const sw = shapeWeights(g);
  const at = (u: number, dy: number) => {
    const p = shapeAtU(u, sw, g);
    return project(g, [p[0], p[1] + dy, p[2] + 0.5]);
  };
  const peakUp = at(PIN_AT.peak, CROWD_OFFSET);
  const peakDown = at(PIN_AT.peak, -CROWD_OFFSET);
  const botUp = at(PIN_AT.bottom, CROWD_OFFSET);
  const botDown = at(PIN_AT.bottom, -CROWD_OFFSET);
  const red = project(g, crowdPos(g, 'crowd'));
  const labelOpacity = crowdOpacity(g) * (1 - ease(g, [c.text1 - 6, c.text1 + 6], [0, 1], EASE.inOut));
  const [, peakF, bottomF] = c.run;

  return (
    <AbsoluteFill>
      <Scrim y={420} h={400} opacity={windowed(g, c.text1 - 4, c.text1 + 8, c.exit + 4, c.exit + 16)} />
      {labelOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: Math.max(100, Math.min(980 - 200, red.x - 100)),
            width: 200,
            top: red.y - 96,
            textAlign: 'center',
            direction: 'rtl',
            fontFamily,
            fontWeight: FONT.weightBlack,
            fontSize: 44,
            color: '#FF7468',
            opacity: labelOpacity,
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
          }}
        >
          {TEXT.crowd.crowd}
        </div>
      ) : null}
      {/* the crowd (red, above the line) */}
      <Pin label={TEXT.crowd.buy} color="red" at={peakUp} dir="up" drop={peakF - from} exit={c.exit - from} />
      <Pin label={TEXT.crowd.sell} color="red" at={botUp} dir="up" drop={bottomF - from} exit={c.exit - from} />
      {/* the calm investor (gold, below the line): the opposite */}
      <Pin label={TEXT.crowd.sell} color="gold" at={peakDown} dir="down" drop={peakF - from + 3} exit={c.exit - from} />
      <Pin label={TEXT.crowd.buy} color="gold" at={botDown} dir="down" drop={bottomF - from + 3} exit={c.exit - from} />
      <AnimatedText {...TEXT.crowd.line1} enter={c.text1 - from} exit={c.exit - from} size={76} y={360} />
      <AnimatedText {...TEXT.crowd.line2} enter={c.text2 - from} exit={c.exit - from + 3} shineAt={c.text2 - from + 14} size={76} y={470} />
    </AbsoluteFill>
  );
};
