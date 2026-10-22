import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ServiceCard} from '../components/ServiceCard';
import {TrackingLabel} from '../components/TrackingLabel';
import {COPY} from '../copy';
import {LAYOUT} from '../layout';
import {SAFE} from '../theme';
import {BEAT_EXIT, BEAT_STEP} from '../timeline';

const CARD_STAGGER = 8;
const EXIT_STAGGER = 4;

// Vertical carousel: beat A enters from the sides, later beats rise from below
// with a slight sideways drift (card 1 from the lower left, card 2 from the lower right).
const entrance = (beat: number, card: number) => {
  const side = card === 0 ? -1 : 1;
  return beat === 0 ? {fromX: side * 1000, fromY: 0} : {fromX: side * 160, fromY: 760};
};

export const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const L = LAYOUT.services;

  return (
    <AbsoluteFill>
      {COPY.services.map((beat, b) => {
        const b0 = b * BEAT_STEP;
        if (frame < b0 || frame > b0 + BEAT_EXIT + 30) return null;
        const exitAt = b0 + BEAT_EXIT;
        return (
          <React.Fragment key={b}>
            <TrackingLabel
              text={beat.counter}
              start={b === 0 ? b0 : b0 + 8}
              exitAt={exitAt}
              style={{position: 'absolute', left: SAFE.left, top: L.counterY}}
            />
            {beat.items.map((item, c) => (
              <ServiceCard
                key={item.name}
                {...item}
                {...entrance(b, c)}
                start={b0 + 2 + c * CARD_STAGGER}
                exitAt={exitAt + c * EXIT_STAGGER}
                top={L.cardTop + c * (L.cardHeight + L.cardGap)}
              />
            ))}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
