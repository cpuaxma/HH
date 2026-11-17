import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LOGO, STAGE} from '../config';
import {Headline} from '../components/Headline';
import {useSceneFrame} from '../components/SceneShell';
import {ramp, settle} from '../motion';

/** 27–30s: the supplied logo rises out of a soft gold glow. The file is shown as is. */
export const EndCard: React.FC = () => {
  const f = useSceneFrame();
  const p = settle(f, 0, 40);
  const glow = ramp(f, 0, 45);
  const sweep = ramp(f, 18, 64);
  const breathe = 0.9 + 0.1 * Math.sin(f / 14);
  const half = LOGO.size / 2;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: STAGE.cx - 520,
          top: LOGO.cy - 520,
          width: 1040,
          height: 1040,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.38) 0%, rgba(212,175,55,0.12) 36%, transparent 66%)',
          opacity: glow * breathe,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: STAGE.cx - half,
          top: LOGO.cy - half,
          width: LOGO.size,
          height: LOGO.size,
          opacity: p,
          transform: `scale(${0.86 + 0.14 * p})`,
          filter: `blur(${(1 - p) * 12}px) drop-shadow(0 0 ${30 + 30 * glow}px rgba(212,175,55,0.45))`,
        }}
      >
        <Img src={staticFile(LOGO.file)} style={{width: '100%', height: '100%', display: 'block'}} />
        {/* a soft light sweep across the logo, clipped to its round badge */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            mixBlendMode: 'screen',
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              bottom: '-20%',
              width: '34%',
              left: `${-40 + sweep * 150}%`,
              transform: 'rotate(18deg)',
              background: 'linear-gradient(90deg, transparent, rgba(255,241,194,0.32), transparent)',
            }}
          />
        </div>
      </div>
      <Headline underline={false} />
    </AbsoluteFill>
  );
};
