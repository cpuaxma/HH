import {CircleUser} from 'lucide-react';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COPY} from '../copy';
import {TypeOn} from '../components/TypeOn';
import {Logo} from '../components/Logo';
import {RedLine} from '../components/RedLine';
import {SlamText} from '../components/SlamText';
import {clamp, kick, mix, pop, progress} from '../lib/anim';
import {smoothPath, wavePath} from '../lib/path';
import {T} from '../timeline';
import {C, EASE_IN, EASE_OUT, FONT, FONT_APP} from '../theme';

const FLOOD = smoothPath([
  [-120, 1650],
  [200, 1250],
  [120, 760],
  [520, 560],
  [900, 840],
  [980, 300],
  [1220, 120],
]);

// 6 · CTA: the red line sweeps in and floods the frame, then the ask.
export const CtaLayer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.ctaLine) return null;
  const draw = progress(frame, T.ctaLine, T.flood[0] - T.ctaLine + 2, EASE_OUT);
  const width = interpolate(frame, T.flood, [9, 2700], {...clamp, easing: EASE_IN});
  const solid = frame >= T.flood[1];

  const logoT = frame - T.logo;
  const logoScale = interpolate(logoT, [0, 6], [1.6, 1], {...clamp, easing: EASE_OUT});
  const bubble = pop(frame, T.comment);
  const pill = pop(frame, T.pill);
  const pulse = frame >= T.pill + 20 ? 1 + 0.035 * Math.max(0, Math.sin(((frame - T.pulse) / 30) * Math.PI * 2)) + 0.05 * Math.max(0, kick(frame, T.pulse, 6, 0.4)) : 1;

  return (
    <AbsoluteFill>
      {!solid && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={FLOOD} stroke={C.red} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        </svg>
      )}
      {solid && (
        <AbsoluteFill style={{background: C.red}}>
          {/* Drifting wave lines keep the hold alive */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {[300, 1080, 1380, 1760].map((y, i) => (
              <path key={y} d={wavePath(y, 34 + i * 6, frame / (40 + i * 9) + i, 1080, 1.3 + i * 0.2)} stroke={C.cream} strokeOpacity={0.13} strokeWidth={5} fill="none" />
            ))}
          </svg>

          {frame >= T.logo && (
            <div style={{position: 'absolute', left: 540, top: 286, transform: `translate(-50%, -50%) scale(${logoScale}) rotate(${-2 * kick(frame, T.logo + 5, 6)}deg)`, opacity: interpolate(logoT, [0, 2], [0.4, 1], clamp)}}>
              <Logo width={460} text={C.cream} stroke={C.charcoal} draw={progress(frame, T.logo + 2, 24, EASE_OUT)} />
            </div>
          )}

          <SlamText lines={COPY.cta.lines} at={T.ctaSlams} exitAt={9999} variant="onRed" top={500} />

          {frame >= T.comment && (
            <div
              style={{
                position: 'absolute',
                left: 64,
                top: 870,
                width: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                background: C.cream,
                borderRadius: 34,
                padding: '22px 30px',
                boxShadow: '0 20px 50px rgba(15,15,15,0.28)',
                transform: `translateY(${(1 - bubble) * 260}px) scale(${mix(0.8, 1, bubble)})`,
                opacity: Math.min(1, bubble * 2),
              }}
            >
              <CircleUser size={92} strokeWidth={1.5} color={C.charcoal} />
              <div>
                <div style={{fontFamily: FONT_APP, fontWeight: 700, fontSize: 32, color: C.charcoal, opacity: 0.55}}>{COPY.cta.commenter}</div>
                <TypeOn parts={[{text: COPY.cta.comment, from: T.comment + 6, to: T.comment + 24}]} cursorUntil={T.arrow + 20} style={{fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: '86px', color: C.charcoal, letterSpacing: '0.02em'}} />
              </div>
              {/* bubble tail */}
              <div style={{position: 'absolute', left: 54, bottom: -22, width: 44, height: 44, background: C.cream, transform: 'rotate(45deg)', borderRadius: 6}} />
            </div>
          )}

          <RedLine type="arrow" from={[790, 960]} to={[930, 1330]} curve={-0.4} at={T.arrow} dur={16} width={11} head={50} color={C.cream} seed="cta" />

          {frame >= T.pill && (
            <div
              style={{
                position: 'absolute',
                left: 64,
                top: 1150,
                background: C.charcoal,
                color: C.cream,
                borderRadius: 30,
                padding: '24px 40px 26px',
                transform: `scale(${pill * pulse})`,
                transformOrigin: '30% 50%',
                boxShadow: '0 20px 50px rgba(15,15,15,0.3)',
              }}
            >
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 62, lineHeight: 1.05, letterSpacing: '-0.01em'}}>
                {COPY.cta.pill[0].replace('AUDIT', '')}
                <span style={{color: C.peach}}>AUDIT</span>
              </div>
              <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, marginTop: 4}}>{COPY.cta.pill[1]}</div>
            </div>
          )}

          {frame >= T.logo && (
            <div
              style={{
                position: 'absolute',
                left: 64,
                width: 1080 - 64 - 140,
                top: 1480,
                textAlign: 'center',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 44,
                letterSpacing: '0.14em',
                color: C.cream,
                transform: `translateY(${(1 - pop(frame, T.logo + 6)) * 120}px)`,
                opacity: Math.min(1, pop(frame, T.logo + 6) * 1.5),
              }}
            >
              {COPY.cta.slogan}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
