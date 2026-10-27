import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, BUSINESSES, Business, CARD_COLORS, COLUMN, COPY, SAFE, arrivalFrame} from '../data';
import {EMOJI_FONT, FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, easeOutQuint, ramp} from '../lib/timeline';

const W = COLUMN.width;
const BOTTOM = 1920 - SAFE.bottom - 24;
const C = CARD_COLORS;

/** Card timing, relative to the stop's arrival frame. */
export const CARD = {
  inFrom: -6,
  inTo: 16,
  starsFrom: 4,
  starsTo: 22,
  countFrom: 24,
  countTo: 76,
  /** The result line pops in. */
  chipAt: 70,
  outFrom: 106,
  outTo: 124,
};

const STAR_PATH =
  'M12 2.6 L14.85 8.6 L21.4 9.35 L16.55 13.85 L17.85 20.35 L12 17.1 L6.15 20.35 L7.45 13.85 L2.6 9.35 L9.15 8.6 Z';

const Star: React.FC<{fill: number; pop: number; id: string; size: number}> = ({fill, pop, id, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${1 + pop * 0.2})`, display: 'block'}}>
    <defs>
      <clipPath id={id}>
        <rect x={0} y={0} width={24 * fill} height={24} />
      </clipPath>
    </defs>
    <path d={STAR_PATH} fill={C.starEmpty} stroke={C.starEmpty} strokeWidth={1.2} strokeLinejoin="round" />
    <path d={STAR_PATH} fill={C.star} stroke={C.star} strokeWidth={1.2} strokeLinejoin="round" clipPath={`url(#${id})`} />
  </svg>
);

/** Small red-tinted growth tag, e.g. "▲ +1.2". The only red in the body of the card. */
const GrowthTag: React.FC<{text: string; show: number}> = ({text, show}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px 5px 9px',
      borderRadius: 999,
      background: C.accentTint,
      color: BRAND.red,
      fontSize: 24,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      opacity: show,
      transform: `translateY(${(1 - show) * 6}px)`,
    }}
  >
    <svg width={16} height={16} viewBox="0 0 24 24">
      <path d="M12 4 L21 15 H15 V21 H9 V15 H3 Z" fill={BRAND.red} />
    </svg>
    {text}
  </div>
);

/** The rating as it animates: stars fill to BEFORE, then everything climbs to AFTER. */
export const ratingAt = (b: Business, rel: number) => {
  const fillIn = ramp(rel, CARD.starsFrom, CARD.starsTo, easeOut);
  const climb = ramp(rel, CARD.countFrom, CARD.countTo, easeInOut);
  return {
    stars: b.rating.before * fillIn + (b.rating.after - b.rating.before) * climb,
    shown: b.rating.before + (b.rating.after - b.rating.before) * climb,
    reviews: Math.round(b.reviews.before + (b.reviews.after - b.reviews.before) * climb),
    climb,
  };
};

const Card: React.FC<{b: Business; index: number; rel: number}> = ({b, index, rel}) => {
  const {fps} = useVideoConfig();
  const inP = ramp(rel, CARD.inFrom, CARD.inTo, easeOutQuint);
  const outP = ramp(rel, CARD.outFrom, CARD.outTo, easeIn);
  const r = ratingAt(b, rel);

  // Each star pops as it fills completely.
  const stars = [0, 1, 2, 3, 4].map((k) => {
    const fill = Math.max(0, Math.min(1, r.stars - k));
    let full = -1;
    for (let f = CARD.starsFrom; f <= CARD.countTo; f++) {
      if (ratingAt(b, f).stars >= k + 1 - 1e-6) {
        full = f;
        break;
      }
    }
    const pop = full >= 0 && rel >= full ? Math.max(0, 1 - (rel - full) / 12) * Math.min(1, (rel - full + 1) / 3) : 0;
    return <Star key={k} fill={fill} pop={pop} id={`s${index}-${k}`} size={40} />;
  });

  const gainIn = ramp(rel, CARD.countFrom + 14, CARD.countFrom + 26, easeOut);
  const result = rel < CARD.chipAt ? 0 : spring({frame: rel - CARD.chipAt, fps, config: {damping: 14, stiffness: 170, mass: 0.6}});
  const footer = ramp(rel, 8, 22, easeOut);

  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: W,
        bottom: 1920 - BOTTOM,
        background: C.background,
        border: `1px solid ${C.border}`,
        borderRadius: 28,
        boxShadow: '0 14px 36px rgba(20,20,20,0.10), 0 2px 6px rgba(20,20,20,0.04)',
        padding: '36px 40px 28px',
        boxSizing: 'border-box',
        fontFamily: FONT,
        color: C.text,
        transform: `translateY(${(1 - inP) * 640 + outP * 660}px)`,
        opacity: Math.min(1, inP * 2) * (1 - outP * 0.6),
      }}
    >
      {/* 1 · Business */}
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            background: C.tile,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: EMOJI_FONT,
            fontSize: 48,
            flexShrink: 0,
          }}
        >
          {b.emoji}
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 50, fontWeight: 800, letterSpacing: -1.4, lineHeight: 1.06, color: C.heading, whiteSpace: 'nowrap'}}>
            {b.name}
          </div>
          <div style={{fontSize: 26, fontWeight: 500, color: C.meta, marginTop: 6, whiteSpace: 'nowrap'}}>
            {b.category} · {b.area ?? b.street}
          </div>
        </div>
      </div>

      {/* 2 · Rating */}
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 32}}>
        <div style={{display: 'flex', gap: 4}}>{stars}</div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1,
            color: C.heading,
            fontVariantNumeric: 'tabular-nums',
            marginLeft: 6,
          }}
        >
          {r.shown.toFixed(1)}
        </div>
        <GrowthTag text={`+${(r.shown - b.rating.before).toFixed(1)}`} show={gainIn} />
      </div>

      {/* 3 · Reviews */}
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
        <div style={{fontSize: 30, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
          {r.reviews.toLocaleString('en-US')} reviews
        </div>
        <GrowthTag text={`+${(r.reviews - b.reviews.before).toLocaleString('en-US')}`} show={gainIn} />
        <div style={{fontSize: 24, fontWeight: 500, color: C.meta, whiteSpace: 'nowrap', opacity: gainIn}}>
          was {b.rating.before.toFixed(1)} · {b.reviews.before.toLocaleString('en-US')}
        </div>
      </div>

      <div style={{height: 1, background: C.border, margin: '28px 0 24px'}} />

      {/* 4 · Result line */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 500,
          lineHeight: 1.3,
          color: C.text,
          opacity: result,
          transform: `translateY(${(1 - result) * 10}px)`,
        }}
      >
        <span style={{fontWeight: 800, color: C.heading}}>{b.chip}</span> {COPY.resultSuffix}
      </div>

      {/* 5 · Actions */}
      <div style={{display: 'flex', gap: 16, marginTop: 26}}>
        <div
          style={{
            flex: 1,
            height: 76,
            borderRadius: 999,
            background: BRAND.red,
            color: '#fff',
            fontSize: 30,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(230,57,34,0.22)',
          }}
        >
          {COPY.cardPrimary}
        </div>
        <div
          style={{
            width: 232,
            height: 76,
            borderRadius: 999,
            background: '#fff',
            border: `2px solid ${C.border}`,
            boxSizing: 'border-box',
            color: C.text,
            fontSize: 28,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke={C.text} strokeWidth={2} strokeLinejoin="round" />
            <path d="M9 14 V11 H14 M12 9 L14.5 11 L12 13" fill="none" stroke={C.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {COPY.cardSecondary}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 22,
          fontSize: 20,
          fontWeight: 500,
          color: C.meta,
          opacity: footer,
        }}
      >
        <div>{COPY.disclaimer}</div>
        <div>{COPY.cardCaption}</div>
      </div>
    </div>
  );
};

export const PlaceCards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {BUSINESSES.map((b, i) => {
        const rel = frame - arrivalFrame(i);
        if (rel < CARD.inFrom - 1 || rel > CARD.outTo + 1) return null;
        return <Card key={i} b={b} index={i} rel={rel} />;
      })}
    </>
  );
};
