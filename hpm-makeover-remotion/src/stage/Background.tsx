import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progress} from '../lib/anim';
import {DIVIDER_TOP, dividerTip, dividerX, PEPPER_REST, PEPPER_VIEWBOX} from '../lib/sweeps';
import {CUE} from '../timeline';
import {BLAND, EASE_IN_OUT, HPM} from '../theme';

// Grey and lifeless until the pepper lands; then a radial Cream wipe spreads from it.
// In scene 5 the left side of the divider turns grey again (BEFORE).
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const warm = progress(frame, CUE.warm, 80, EASE_IN_OUT);
  const k = PEPPER_REST.width / PEPPER_VIEWBOX.w;
  const cx = PEPPER_REST.left + (PEPPER_VIEWBOX.w / 2) * k;
  const cy = PEPPER_REST.top + (PEPPER_VIEWBOX.h / 2) * k;
  const r = warm * 2300;

  const split = frame >= CUE.dividerIn;
  const dx = dividerX(frame);
  const tip = dividerTip(frame);

  return (
    <AbsoluteFill style={{background: BLAND.bg}}>
      {warm > 0 ? (
        <AbsoluteFill style={{background: HPM.cream, clipPath: warm >= 1 ? undefined : `circle(${r}px at ${cx}px ${cy}px)`}} />
      ) : null}
      {split ? (
        <div style={{position: 'absolute', left: 0, top: DIVIDER_TOP, width: dx, height: tip - DIVIDER_TOP, background: BLAND.bg}} />
      ) : null}
    </AbsoluteFill>
  );
};
