import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, RIDE_LABELS, SCENES, STAGES, TEXT} from '../config';
import {Callout} from '../components/Callout';
import {EmotionWord} from '../components/EmotionWord';
import {Scrim} from '../components/Scrim';
import {getWorld, project} from '../lib/director';
import {windowed} from '../lib/motion';

const from = SCENES.ride.from;
const c = CUES.ride;
const wordOf = (k: string) => STAGES.find((s) => s.key === k)!.word!;
// the despondency word sits higher so the callout fits between it and the orb
const Y: Record<string, number> = {despondency: 600};

/** 0:08-0:25 The ride: every emotion changes the world, and its word appears beside the orb. */
export const S4Ride: React.FC = () => {
  const g = useCurrentFrame() + from;
  const w = getWorld(g);
  const orb = project(g, w.orb.pos);
  const anyWord = RIDE_LABELS.some((l) => g >= l.at - 10 && g <= l.out + 12);
  return (
    <AbsoluteFill>
      <Scrim y={800} h={420} w={1100} strength={0.4} opacity={anyWord ? 1 : 0} />
      {RIDE_LABELS.map((l) => (
        <EmotionWord key={l.stage + l.at} word={wordOf(l.stage)} at={l.at - from} out={l.out - from} fx={l.fx} y={Y[l.stage] ?? 800} />
      ))}
      {/* the peak: hang time */}
      <Scrim y={940} h={360} opacity={windowed(g, c.peakCallout - 4, c.peakCallout + 6, c.peakCalloutExit + 4, c.peakCalloutExit + 14)} />
      <Callout
        text={TEXT.ride.peakCallout}
        tag={TEXT.ride.peakTag}
        tagColor="red"
        y={900}
        to={orb}
        enter={c.peakCallout - from}
        tagEnter={c.peakTag - from}
        exit={c.peakCalloutExit - from}
      />
      {/* the bottom */}
      <Scrim y={1010} h={360} opacity={windowed(g, c.bottomCallout - 4, c.bottomCallout + 6, c.bottomCalloutExit + 4, c.bottomCalloutExit + 14)} />
      <Callout
        text={TEXT.ride.bottomCallout}
        tag={TEXT.ride.bottomTag}
        tagColor="gold"
        y={970}
        to={orb}
        enter={c.bottomCallout - from}
        tagEnter={c.bottomTag - from}
        exit={c.bottomCalloutExit - from}
      />
    </AbsoluteFill>
  );
};
