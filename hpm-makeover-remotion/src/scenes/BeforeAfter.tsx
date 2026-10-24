import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {IconChevronLeft} from '../components/Icons';
import {MaskReveal} from '../components/MaskReveal';
import {PepperDraw} from '../components/PepperDraw';
import {enter, exit, kick} from '../lib/anim';
import {camera, PHONE} from '../lib/stage';
import {DIVIDER_TOP, dividerTip, dividerX} from '../lib/sweeps';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {BLAND, FONT, HPM, LINE_WIDTH, TYPE, WEIGHT} from '../theme';

// 5 · Split view. The divider (and the BEFORE/AFTER clip in ProfileStage and Background)
// is driven by dividerX(); at the flood it hands over to the CTA at the same position.
export const BeforeAfter: React.FC = () => {
  const f = useSceneFrame(SCENES.compare.from);
  const x = dividerX(f);
  const tip = dividerTip(f);
  const cam = camera(f);
  const phoneTop = cam.cy - (PHONE.h / 2) * cam.s;
  const phoneLeft = cam.cx - (PHONE.w / 2) * cam.s;
  const phoneRight = cam.cx + (PHONE.w / 2) * cam.s;
  const handle = kick(f, CUE.dividerIn + 12);
  const labels = enter(f, CUE.dividerIn + 18, 26) * (1 - exit(f, CUE.compareExit, 15));
  const label: React.CSSProperties = {
    position: 'absolute',
    top: phoneTop - 46,
    fontFamily: FONT.brand,
    fontWeight: WEIGHT.label,
    fontSize: 22,
    letterSpacing: TYPE.labelTracking,
    opacity: labels,
  };
  const showDivider = f < CUE.flood;

  return (
    <AbsoluteFill>
      <MaskReveal
        frame={f}
        lines={COPY.compare.headline}
        start={CUE.compareHeadline}
        exitAt={CUE.compareExit}
        fontSize={92}
        style={{position: 'absolute', left: 80, top: 178}}
      />
      <div style={{...label, left: phoneLeft, color: BLAND.textDark}}>{COPY.compare.before}</div>
      <div style={{...label, left: phoneRight, transform: 'translateX(-100%)', color: HPM.red}}>{COPY.compare.after}</div>
      {showDivider ? (
        <>
          <div style={{position: 'absolute', left: x - LINE_WIDTH / 2, top: DIVIDER_TOP, width: LINE_WIDTH, height: tip - DIVIDER_TOP, background: HPM.red, borderRadius: 3}} />
          <div
            style={{
              position: 'absolute',
              left: x - 44,
              top: cam.cy - 44,
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: HPM.cream,
              border: `${LINE_WIDTH}px solid ${HPM.red}`,
              boxSizing: 'border-box',
              boxShadow: '0 10px 26px rgba(15,15,15,0.22)',
              transform: `scale(${handle})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconChevronLeft size={16} color={HPM.red} stroke={3} style={{position: 'absolute', left: 4}} />
            <PepperDraw frame={f} width={46} strokePx={2.6} />
            <IconChevronLeft size={16} color={HPM.red} stroke={3} style={{position: 'absolute', right: 4, transform: 'scaleX(-1)'}} />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
