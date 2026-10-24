import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {CounterChip} from '../components/CounterChip';
import {Stamp} from '../components/Stamp';
import {SlamText} from '../components/SlamText';
import {T} from '../timeline';

// Global overlay layer: kinetic headlines, the stamp and the fix counter.
export const TextLayer: React.FC = () => (
  <AbsoluteFill>
    <SlamText lines={COPY.hook.lines} at={T.hookSlams} exitAt={T.hookExit} variant="plain" />
    <Stamp text={COPY.hook.stamp} at={T.stamp} exitAt={T.stampExit} x={480} y={430} />
    <SlamText lines={COPY.bio.lines} at={T.bioSlams} exitAt={T.bioExit} variant="boxed" />
    <SlamText lines={COPY.grid.lines} at={T.gridSlams} exitAt={T.gridExit} variant="boxed" />
    <SlamText lines={COPY.hook3.lines} at={T.countdown} exitAt={T.reelExit} variant="boxed" />
    <SlamText lines={COPY.result.lines} at={T.resultSlams} exitAt={T.resultExit} variant="plain" />
    <CounterChip
      inAt={T.chipIn}
      outAt={T.flood[0]}
      steps={[
        {at: T.chipIn, n: 0},
        {at: T.bioLabel, n: 1, label: COPY.bio.label, done: T.bioContext},
        {at: T.gridLabel, n: 2, label: COPY.grid.label, done: T.gridCheck},
        {at: T.reelLabel, n: 3, label: COPY.hook3.label, done: T.underline},
        {at: T.pullOut, n: 3, done: T.underline},
      ]}
    />
  </AbsoluteFill>
);
