import React from 'react';
import {camera, HEADER_BOTTOM, rectToFrame, SCREEN} from '../lib/stage';
import {gridLine, headerLine} from '../lib/sweeps';
import {BrandLine, LineHide} from './BrandLine';

// 4a line: thread from the pepper, then the diagonal sweep over the grid.
// It tapers away over the tab row so it only ever paints the grid.
export const GridSweepLine: React.FC<{frame: number}> = ({frame}) => {
  const s = gridLine(frame);
  const cam = camera(frame);
  const r = rectToFrame(cam, 0, -60, SCREEN.w, HEADER_BOTTOM + 14);
  const hide: LineHide = {...r, feather: 40 * cam.s, edge: 'bottom'};
  return <BrandLine pts={s.pts} trimStart={s.trimStart} trimEnd={s.trimEnd} hide={[hide]} />;
};

// 4c line: sweeps the header left → right and tapers out above the grid.
export const HeaderSweepLine: React.FC<{frame: number}> = ({frame}) => {
  const s = headerLine(frame);
  const cam = camera(frame);
  const r = rectToFrame(cam, 0, HEADER_BOTTOM - 26, SCREEN.w, 2000);
  const hide: LineHide = {x0: -100, x1: 1180, y0: r.y0, y1: 2100, feather: 40 * cam.s, edge: 'top'};
  return <BrandLine pts={s.pts} trimStart={s.trimStart} trimEnd={s.trimEnd} hide={[hide]} />;
};
