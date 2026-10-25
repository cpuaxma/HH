import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cardSpring, enter, exit, mix} from '../lib/anim';
import {counterLabel, Stack} from '../lib/stack';
import {storyTime} from '../timeline';
import {CARD, FONT, HPM, LOCK, SAFE, WEIGHT} from '../theme';
import {NotificationCard} from './NotificationCard';

const CLEAR_DURATION = 24;
const CLEAR_DISTANCE = 1900;

type Props = {
  stack: Stack;
  clearAt: number; // every card flies off upward from here, top card first
  stagger: number; // frames between cards flying off
  counterExitAt?: number; // defaults to leaving with the top card
  disclaimerFrom: number;
};

// A live notification stack. It reads the frame itself, so <CameraMotionBlur> can
// re-render it at sub-frame times.
export const NotificationStack: React.FC<Props> = ({stack, clearAt, stagger, counterExitAt, disclaimerFrom}) => {
  const frame = useCurrentFrame();
  const t = storyTime(frame);
  if (frame >= clearAt + 80) return null;
  const {cards, groupBottom} = stack.stackAt(t);
  const order = [...cards].sort((a, b) => a.y - b.y);
  const rank = new Map(order.map((c, i) => [c.index, i]));
  const flyOut = (r: number) => exit(frame, clearAt + r * stagger, CLEAR_DURATION);

  const count = stack.counterValue(t);
  const counterIn = cardSpring(t - stack.firstGroupFrame());
  const counterOut = counterExitAt === undefined ? flyOut(0) : exit(frame, counterExitAt, 14);
  const disclaimer = (disclaimerFrom <= 0 ? 1 : enter(frame, disclaimerFrom, 30)) * (1 - flyOut(order.length + 2));

  return (
    <AbsoluteFill>
      {cards.map((c) => {
        const out = flyOut(rank.get(c.index) ?? 0);
        const e = c.enter;
        return (
          <NotificationCard
            key={c.index}
            notif={c.notif}
            contentOpacity={Math.max(0, Math.min(1, (c.opacity - 0.62) / 0.3))}
            style={{
              top: c.y,
              zIndex: c.z,
              transformOrigin: '50% 100%',
              transform: `translateY(${-80 * (1 - e) - CLEAR_DISTANCE * out}px) scale(${c.scale * mix(0.92, 1, e)})`,
              opacity: c.opacity * Math.min(1, Math.max(0, e)) * (1 - out * 0.4),
            }}
          />
        );
      })}
      {counterIn > 0.001 && count > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: (SAFE.left + SAFE.right) / 2,
            top: groupBottom + 4,
            zIndex: 2000,
            transform: `translate(-50%, ${-CLEAR_DISTANCE * counterOut}px) scale(${mix(0.6, 1, counterIn)})`,
            opacity: Math.min(1, counterIn) * (1 - counterOut),
            background: HPM.charcoal,
            color: HPM.cream,
            fontFamily: FONT,
            fontWeight: WEIGHT.label,
            fontSize: 22,
            padding: '6px 18px',
            borderRadius: 999,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {counterLabel(count)}
        </div>
      ) : null}
      {disclaimer > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: CARD.left,
            width: CARD.width,
            top: LOCK.areaBottom + 12,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: WEIGHT.body,
            fontSize: 22,
            color: HPM.charcoal,
            opacity: 0.4 * disclaimer,
          }}
        >
          Illustrative example
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
