import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Point, toPolygon} from '../lib/path';

type Props = {
  before: React.ReactNode;
  after: React.ReactNode;
  // AFTER shows only inside every region (their intersection). null = no restriction,
  // [] = nothing revealed yet. Regions come from the same samples as the red line.
  regions: (readonly Point[] | null)[];
};

// BEFORE and AFTER stacked; the AFTER layer is uncovered only where the brush has passed.
export const BrushReveal: React.FC<Props> = ({before, after, regions}) => {
  const hidden = regions.some((r) => r !== null && r.length < 3);
  let layer: React.ReactNode = after;
  for (const r of [...regions].reverse()) {
    if (r === null) continue;
    layer = <AbsoluteFill style={{clipPath: toPolygon(r)}}>{layer}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill>{before}</AbsoluteFill>
      {hidden ? null : layer}
    </AbsoluteFill>
  );
};
