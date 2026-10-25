import {CheckCheck, Flame, Send} from 'lucide-react';
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
  const bubble = pop(frame, T.dm);
  const sent = progress(frame, T.dmSend, 10, EASE_OUT);
  const fly = progress(frame, T.dmSend, 12, EASE_IN);
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

          {/* DM: the viewer's message types out and sends */}
          {frame >= T.dm && (
            <div
              style={{
                position: 'absolute',
                left: 64,
                top: 860,
                width: 760,
                background: C.cream,
                borderRadius: 34,
                padding: '22px 26px 26px',
                boxShadow: '0 20px 50px rgba(15,15,15,0.28)',
                transform: `translateY(${(1 - bubble) * 260}px) scale(${mix(0.8, 1, bubble)})`,
                opacity: Math.min(1, bubble * 2),
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: `2px solid ${C.gray}`}}>
                <div style={{width: 64, height: 64, borderRadius: 32, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Flame size={36} color={C.cream} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{fontFamily: FONT_APP, fontWeight: 700, fontSize: 34, color: C.charcoal}}>{COPY.cta.dmTo}</div>
                  <div style={{fontFamily: FONT_APP, fontSize: 26, color: C.muted}}>Message</div>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18, marginTop: 20, transform: `translateY(${-14 * sent}px)`}}>
                <div style={{background: C.charcoal, borderRadius: '32px 32px 8px 32px', padding: '10px 28px 14px'}}>
                  <TypeOn
                    parts={[{text: COPY.cta.dm, from: T.dmType[0], to: T.dmType[1]}]}
                    cursorUntil={T.dmSend}
                    cursorColor={C.cream}
                    style={{fontFamily: FONT, fontWeight: 900, fontSize: 62, lineHeight: '78px', color: C.cream, whiteSpace: 'nowrap'}}
                  />
                </div>
                <div style={{width: 96, height: 96, borderRadius: 48, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.18 * kick(frame, T.dmSend, 5)})`}}>
                  <Send size={48} color={C.cream} strokeWidth={2.4} style={{transform: `translate(${fly * 260}px, ${-fly * 200}px) rotate(${fly * 20}deg)`, opacity: 1 - fly}} />
                  {fly >= 1 && <Send size={48} color={C.cream} strokeWidth={2.4} style={{position: 'absolute', transform: `scale(${pop(frame, T.dmSend + 14)})`}} />}
                </div>
              </div>
              {frame >= T.dmSend && (
                <div style={{position: 'absolute', right: 140, bottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_APP, fontSize: 26, color: C.muted, transform: `scale(${pop(frame, T.dmSend + 4)})`, transformOrigin: '100% 50%'}}>
                  <CheckCheck size={28} color={C.cobalt} strokeWidth={2.6} />
                  {COPY.cta.sent}
                </div>
              )}
            </div>
          )}

          <RedLine type="arrow" from={[836, 1010]} to={[930, 1440]} curve={-0.35} at={T.arrow} dur={16} width={11} head={50} color={C.cream} seed="cta" />

          {frame >= T.pill && (
            <div
              style={{
                position: 'absolute',
                left: 64,
                top: 1190,
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
                {COPY.cta.pill[0].replace('DM', '')}
                <span style={{color: C.peach}}>DM</span>
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
