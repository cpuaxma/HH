import {useCurrentFrame} from 'remotion';
import {COLORS, COLUMN, COPY, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeInOut, easeOut, ramp, springAt} from '../lib/timeline';
import {Logo} from './Logo';

/** The end card's steps, in frames after TIMING.endStart. */
export const END = {sweep: 36, badge: 14, shield: 24, laurels: [40, 84], wordmark: [56, 92], tagline: [80, 104], launch: 104, cta: 128, urgency: 146, ring: [150, 196]};

/** Where the light sweep is (0 → 1 across the frame), shared with the sweep overlay. */
export const endSweep = (f: number) => ramp(f, TIMING.endStart, TIMING.endStart + END.sweep, easeInOut);

/** 24–30s: the light sweep reveals the logo on a white badge, the tagline, the launch line and the gold CTA; then a hold. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const start = TIMING.endStart;
  if (frame < start) return null;
  const r = frame - start;
  // Revealed behind the sweep: a mask edge travelling diagonally with the band.
  const edge = -30 + endSweep(frame) * 160;
  const badge = springAt(r, END.badge, 30, 0.35);
  const anim = {
    shield: springAt(r, END.shield, 30, 0.4),
    laurels: ramp(r, END.laurels[0], END.laurels[1], easeInOut),
    wordmark: ramp(r, END.wordmark[0], END.wordmark[1], easeInOut),
    tagline: ramp(r, END.tagline[0], END.tagline[1], easeOut),
  };
  const launch = ramp(r, END.launch, END.launch + 22, easeOut);
  const cta = springAt(r, END.cta, 28, 0.45);
  const urgency = ramp(r, END.urgency, END.urgency + 20, easeOut);
  const ring = ramp(r, END.ring[0], END.ring[1], easeOut);
  const mask = `linear-gradient(115deg, #000 ${edge - 12}%, transparent ${edge + 4}%)`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        WebkitMaskImage: edge < 130 ? mask : undefined,
        maskImage: edge < 130 ? mask : undefined,
      }}
    >
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 44,
            padding: '46px 54px 40px',
            boxShadow: '0 40px 90px rgba(0,0,0,0.45), 0 0 0 2px rgba(217,178,106,0.55)',
            transform: `scale(${0.85 + 0.15 * badge})`,
            opacity: Math.min(1, badge * 2),
          }}
        >
          <Logo width={460} anim={anim} />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 62,
            lineHeight: 1.1,
            color: COLORS.headline,
            textAlign: 'center',
            textWrap: 'balance',
            marginTop: 58,
            opacity: launch,
            transform: `translateY(${(1 - launch) * 24}px)`,
          }}
        >
          {COPY.launch}
        </div>
        <div style={{position: 'relative', marginTop: 44}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${COLORS.gold}`,
              transform: `scale(${1 + ring * 0.16}, ${1 + ring * 0.5})`,
              opacity: ring > 0 ? (1 - ring) * 0.7 : 0,
            }}
          />
          <div
            style={{
              background: `linear-gradient(180deg, ${COLORS.goldLight}, ${COLORS.gold})`,
              color: COLORS.navy,
              fontFamily: SANS,
              fontSize: 38,
              fontWeight: 800,
              padding: '28px 46px',
              borderRadius: 999,
              transform: `scale(${cta})`,
              boxShadow: '0 18px 44px rgba(217,178,106,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta}
          </div>
        </div>
        {COPY.urgency ? (
          <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 600, color: COLORS.body, marginTop: 30, opacity: urgency}}>{COPY.urgency}</div>
        ) : null}
      </div>
    </div>
  );
};

/** A diagonal band of warm light sweeping across the whole frame. `p` 0 → 1. */
export const LightBand: React.FC<{p: number; strength?: number}> = ({p, strength = 0.85}) => {
  if (p <= 0 || p >= 1) return null;
  const x = -40 + p * 180;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(115deg, rgba(255,236,200,0) ${x - 22}%, rgba(255,236,200,${strength * 0.55}) ${x - 6}%, rgba(255,250,236,${strength}) ${x}%, rgba(255,236,200,${strength * 0.55}) ${x + 6}%, rgba(255,236,200,0) ${x + 22}%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export const LightSweeps: React.FC = () => {
  const frame = useCurrentFrame();
  const hook = ramp(frame, TIMING.hookInterrupt + 4, TIMING.answerStart + 18, easeInOut);
  return (
    <>
      <LightBand p={hook} strength={0.7} />
      <LightBand p={endSweep(frame)} />
    </>
  );
};
