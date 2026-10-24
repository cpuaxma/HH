import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {BrandLine} from '../components/BrandLine';
import {strikeGeometry} from '../components/PostView';
import {SceneLabel} from '../components/SceneLabel';
import {camera} from '../lib/stage';
import {captionLine, captionToFrame} from '../lib/sweeps';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {LABEL_POS} from './MakeoverGrid';

// 4b · Into one post: the red line strikes the bland caption, wipes it away, and the
// new caption types in (PostView, inside the phone).
export const MakeoverCaption: React.FC = () => {
  const f = useSceneFrame(SCENES.caption.from);
  const l = COPY.makeover.labels[1];
  const line = captionLine(f, strikeGeometry());
  const cam = camera(f);
  return (
    <AbsoluteFill>
      <SceneLabel frame={f} num={l.num} text={l.text} start={CUE.captionLabel} exitAt={CUE.captionLabelExit} style={LABEL_POS} />
      {line ? (
        <BrandLine pts={line.local.map((p) => captionToFrame(cam, p))} trimStart={line.trimStart} trimEnd={line.trimEnd} />
      ) : null}
    </AbsoluteFill>
  );
};
