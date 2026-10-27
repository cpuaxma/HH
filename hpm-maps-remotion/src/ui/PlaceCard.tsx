import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, BUSINESSES, Business, COPY, SAFE, arrivalFrame} from '../data';
import {EMOJI_FONT, FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, easeOutQuint, ramp} from '../lib/timeline';

const W = 1080 - SAFE.left - SAFE.right - 20;
const BOTTOM = 1920 - SAFE.bottom - 24;

/** Card timing, relative to the stop's arrival frame. */
export const CARD = {
  inFrom: -6,
  inTo: 16,
  starsFrom: 4,
  starsTo: 22,
  countFrom: 24,
  countTo: 76,
  chipAt: 70,
  outFrom: 106,
  outTo: 124,
};

const STAR_PATH =
  'M12 2.6 L14.85 8.6 L21.4 9.35 L16.55 13.85 L17.85 20.35 L12 17.1 L6.15 20.35 L7.45 13.85 L2.6 9.35 L9.15 8.6 Z';

const Star: React.FC<{fill: number; pop: number; id: string}> = ({fill, pop, id}) => (
  <svg width={46} height={46} viewBox="0 0 24 24" style={{transform: `scale(${1 + pop * 0.22})`}}>
    <defs>
      <clipPath id={id}>
        <rect x={0} y={0} width={24 * fill} height={24} />
      </clipPath>
    </defs>
    <path d={STAR_PATH} fill={BRAND.starEmpty} stroke={BRAND.starEmpty} strokeWidth={1.4} strokeLinejoin="round" />
    <path
      d={STAR_PATH}
      fill={BRAND.star}
      stroke={BRAND.star}
      strokeWidth={1.4}
      strokeLinejoin="round"
      clipPath={`url(#${id})`}
    />
  </svg>
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
    return <Star key={k} fill={fill} pop={pop} id={`s${index}-${k}`} />;
  });

  const chip = rel < CARD.chipAt ? 0 : spring({frame: rel - CARD.chipAt, fps, config: {damping: 11, stiffness: 190, mass: 0.6}});
  const footer = ramp(rel, 8, 22, easeOut);
  const done = ramp(rel, CARD.countTo - 6, CARD.countTo + 6, easeOut);

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: W,
        bottom: 1920 - BOTTOM,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 30px 70px rgba(40,25,10,0.18), 0 6px 18px rgba(40,25,10,0.08)',
        padding: '34px 36px 26px',
        boxSizing: 'border-box',
        fontFamily: FONT,
        color: BRAND.ink,
        transform: `translateY(${(1 - inP) * 620 + outP * 640}px)`,
        opacity: Math.min(1, inP * 2) * (1 - outP * 0.6),
      }}
    >
      {/* Name row */}
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 26,
            background: '#FFF0EA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: EMOJI_FONT,
            fontSize: 56,
            flexShrink: 0,
          }}
        >
          {b.emoji}
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 46, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
            {b.name}
          </div>
          <div style={{fontSize: 28, fontWeight: 600, color: BRAND.inkSoft, marginTop: 6, whiteSpace: 'nowrap'}}>
            {b.category} · {b.area ?? b.street}
          </div>
        </div>
      </div>

      <div style={{height: 1, background: '#EEE9E3', margin: '26px 0 22px'}} />

      {/* Rating row */}
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            width: 160,
            color: done > 0 ? mixHex(BRAND.ink, BRAND.red, done) : BRAND.ink,
          }}
        >
          {r.shown.toFixed(1)}
        </div>
        <div>
          <div style={{display: 'flex', gap: 4}}>{stars}</div>
          <div style={{fontSize: 30, fontWeight: 700, color: BRAND.inkSoft, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>
            {r.reviews.toLocaleString('en-US')} reviews
          </div>
        </div>
      </div>

      {/* Chip + before line */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginTop: 24, height: 62}}>
        <div
          style={{
            background: BRAND.red,
            color: '#fff',
            borderRadius: 999,
            padding: '12px 26px 12px 20px',
            fontSize: 30,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transform: `scale(${chip})`,
            transformOrigin: 'left center',
            boxShadow: '0 10px 24px rgba(230,57,34,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24">
            <path d="M3 17 L9.5 10.5 L13.5 14.5 L21 7" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 7 H21 V13" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {b.chip}
        </div>
        <div style={{fontSize: 24, fontWeight: 600, color: BRAND.inkFaint, opacity: footer, whiteSpace: 'nowrap'}}>
          was {b.rating.before.toFixed(1)} · {b.reviews.before.toLocaleString('en-US')} reviews
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          opacity: footer,
        }}
      >
        <div style={{fontSize: 20, fontWeight: 600, color: BRAND.inkFaint, letterSpacing: 0.3}}>{COPY.disclaimer}</div>
        <div style={{fontSize: 22, fontWeight: 600, color: BRAND.inkSoft}}>
          {COPY.cardCaption.split('→').map((part, k, arr) => (
            <span key={k}>
              {part}
              {k < arr.length - 1 ? <span style={{color: BRAND.red, fontWeight: 800}}>→</span> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
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
