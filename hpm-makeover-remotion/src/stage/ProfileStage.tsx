import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrushReveal} from '../components/BrushReveal';
import {FeedGrid} from '../components/FeedGrid';
import {PhoneFrame} from '../components/PhoneFrame';
import {PostView} from '../components/PostView';
import {ProfileHeader} from '../components/ProfileHeader';
import {camera, GRID, HEADER_BOTTOM, SCREEN} from '../lib/stage';
import {dividerAfterRegion, gridSwept, headerSwept} from '../lib/sweeps';
import {BLAND} from '../theme';

// The phone lives here for scenes 2–5, under the scene overlays. It is one persistent
// layer so the overlapping <Sequence>s never show two phones. Three stacked copies share
// one camera: BEFORE, AFTER-grid (revealed by the 4a sweep) and AFTER-header (4c sweep).
// In scene 5 the divider additionally limits both AFTER copies to its right side.
export const ProfileStage: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const cam = camera(frame);
  const divider = dividerAfterRegion(frame);

  const before = (
    <PhoneFrame cam={cam} shell screenStyle={{background: BLAND.screen}}>
      <div style={{position: 'absolute', inset: 0, filter: BLAND.filter}}>
        <ProfileHeader state="before" frame={frame} />
        <FeedGrid state="before" frame={frame} />
      </div>
    </PhoneFrame>
  );
  const afterGrid = (
    <PhoneFrame cam={cam}>
      <div style={{position: 'absolute', left: 0, top: GRID.top - 4, width: SCREEN.w, height: SCREEN.h - GRID.top + 4, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: -(GRID.top - 4), width: SCREEN.w, height: SCREEN.h}}>
          <FeedGrid state="after" frame={frame} />
        </div>
      </div>
    </PhoneFrame>
  );
  const afterHeader = (
    <PhoneFrame cam={cam}>
      <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: HEADER_BOTTOM + 2, overflow: 'hidden'}}>
        <ProfileHeader state="after" frame={frame} />
      </div>
    </PhoneFrame>
  );

  return (
    <AbsoluteFill>
      <BrushReveal
        regions={[headerSwept(frame), divider]}
        after={afterHeader}
        before={<BrushReveal regions={[gridSwept(frame), divider]} after={afterGrid} before={before} />}
      />
      <PhoneFrame cam={cam} island>
        <PostView frame={frame} />
      </PhoneFrame>
    </AbsoluteFill>
  );
};
