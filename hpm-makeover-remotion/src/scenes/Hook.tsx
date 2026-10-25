import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {enter, exit, kick} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {BLAND, FONT, HPM} from '../theme';

// 1 · Grey on grey, deliberately lifeless: plain Arial-style text, slow flat fades.
export const Hook: React.FC = () => {
  const f = useSceneFrame(SCENES.hook.from);
  const out = exit(f, CUE.hookExit, 15);
  const line = (at: number) => enter(f, at, CUE.hookFade) * (1 - out);
  const flick = kick(f, CUE.hookFlick);
  const text: React.CSSProperties = {fontFamily: FONT.arial, fontWeight: 400, fontSize: 84, color: BLAND.text, lineHeight: 1.18};

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 92, top: 774}}>
        <div style={{...text, opacity: line(CUE.hookLine1)}}>{COPY.hook.line1}</div>
        <div style={{...text, opacity: line(CUE.hookLine2)}}>
          {COPY.hook.line2Lead}
          <span style={{position: 'relative', display: 'inline-block'}}>
            {COPY.hook.line2Word}
            {/* A tiny red flick: a hint of what's coming. */}
            <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none"
              style={{position: 'absolute', left: 0, bottom: -10, overflow: 'visible', opacity: flick > 0.001 ? 1 - out : 0}}>
              <path d="M2 14 C 30 9, 60 8, 98 11" stroke={HPM.red} strokeWidth={5} fill="none" strokeLinecap="round"
                vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={`${0.7 * flick} 2`} />
            </svg>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
