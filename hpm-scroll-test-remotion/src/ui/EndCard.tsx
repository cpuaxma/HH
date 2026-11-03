// END CARD: the phone glides off, the frame softly blurs to off-white, the logo animates
// in, then the line and the "DM US" button. Everything has settled before T.holdFrom,
// so the last second is a clean hold.
import {useCurrentFrame} from 'remotion';
import {BRAND, COLUMN, COPY, T} from '../data';
import {DISPLAY, TEXT} from '../fonts';
import {easeInOut, easeOut, ramp, springAt} from '../lib/ease';
import {Logo} from './Logo';

/** CSS blur (px) applied to the 3D layer as the end card takes over. */
export const endBlurAt = (f: number) => 26 * ramp(f, T.endStart + 6, T.endStart + 56, easeInOut);

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.endStart) return null;
  const fade = ramp(f, T.endStart + 14, T.endStart + 64, easeInOut);
  const pepper = springAt(f, T.logoAt, 0.3, 0.5);
  const letters = ramp(f, T.logoAt + 10, T.logoAt + 44, easeInOut);
  const line = (k: number) => springAt(f, T.endLineAt + k * 8, 0.32, 0.6);
  const lineOp = (k: number) => ramp(f, T.endLineAt + k * 8, T.endLineAt + k * 8 + 8, easeOut);
  const cta = springAt(f, T.ctaAt, 0.34, 0.5);
  const ring = ramp(f, T.ctaAt + 10, T.ctaAt + 52, easeOut);
  const LOGO_W = 600;

  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: BRAND.offWhite, opacity: fade}} />
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x,
          width: COLUMN.width,
          top: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{opacity: pepper > 0 ? 1 : 0}}>
          <Logo width={LOGO_W} pepper={pepper} letters={letters} red={BRAND.red} ink={BRAND.ink} />
        </div>
        <div style={{marginTop: 70, fontFamily: DISPLAY, fontSize: 84, lineHeight: '92px', letterSpacing: -1.5, textAlign: 'center', color: BRAND.ink}}>
          <div style={{opacity: lineOp(0), transform: `translateY(${(1 - line(0)) * 40}px)`}}>{COPY.endLine1}</div>
          <div style={{opacity: lineOp(1), transform: `translateY(${(1 - line(1)) * 40}px)`, color: BRAND.red}}>{COPY.endLine2}</div>
        </div>
        <div style={{position: 'relative', marginTop: 64}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${BRAND.glow}`,
              transform: `scale(${1 + ring * 0.22}, ${1 + ring * 0.55})`,
              opacity: (1 - ring) * 0.6 * (ring > 0 ? 1 : 0),
            }}
          />
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.glow}, ${BRAND.red})`,
              color: '#FFFFFF',
              fontFamily: TEXT,
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: 3,
              padding: '26px 78px',
              borderRadius: 999,
              transform: `scale(${Math.max(0, cta)})`,
              boxShadow: '0 18px 40px rgba(230,57,34,0.33)',
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta}
          </div>
        </div>
      </div>
    </>
  );
};
