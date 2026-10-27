import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, BUSINESSES, Business, COPY, SAFE, arrivalFrame, COLUMN} from '../data';
import {EMOJI_FONT, FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, easeOutQuint, ramp} from '../lib/timeline';

const W = COLUMN.width;
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

const Star: React.FC<{fill: number; pop: number; id: string; size: number}> = ({fill, pop, id, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${1 + pop * 0.22})`}}>
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

const UpArrow: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink: 0}}>
    <path d="M12 4 L21 15 H15 V21 H9 V15 H3 Z" fill={color} />
  </svg>
);

/** One big before→after stat: label, counting number, a visual, and the gain. */
const Stat: React.FC<{
  label: string;
  value: string;
  color: string;
  visual: React.ReactNode;
  gain: string;
  was: string;
  gainIn: number;
}> = ({label, value, color, visual, gain, was, gainIn}) => (
  <div style={{flex: 1, minWidth: 0}}>
    <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 2.5, color: BRAND.inkFaint}}>{label}</div>
    <div
      style={{
        fontSize: 116,
        fontWeight: 800,
        letterSpacing: -4,
        lineHeight: 1,
        marginTop: 6,
        fontVariantNumeric: 'tabular-nums',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </div>
    <div style={{height: 40, display: 'flex', alignItems: 'center', marginTop: 12}}>{visual}</div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
        fontSize: 30,
        fontWeight: 800,
        color: BRAND.red,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
        opacity: gainIn,
      }}
    >
      <UpArrow size={26} color={BRAND.red} />
      {gain}
      <span style={{fontSize: 24, fontWeight: 600, color: BRAND.inkFaint, marginLeft: 6}}>was {was}</span>
    </div>
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
    return <Star key={k} fill={fill} pop={pop} id={`s${index}-${k}`} size={52} />;
  });

  const chip = rel < CARD.chipAt ? 0 : spring({frame: rel - CARD.chipAt, fps, config: {damping: 11, stiffness: 190, mass: 0.6}});
  const footer = ramp(rel, 8, 22, easeOut);
  const done = ramp(rel, CARD.countTo - 6, CARD.countTo + 6, easeOut);

  const ratingColor = done > 0 ? mixHex(BRAND.ink, BRAND.red, done) : BRAND.ink;
  const gainIn = ramp(rel, CARD.countFrom + 14, CARD.countFrom + 26, easeOut);
  const ratingGain = r.shown - b.rating.before;
  const reviewGain = r.reviews - b.reviews.before;
  // Growth bar: the grey part is where reviews started, the red part is the growth.
  const barBefore = b.reviews.before / b.reviews.after;
  const barNow = ramp(rel, CARD.starsFrom, CARD.starsTo, easeOut) * barBefore + (r.reviews - b.reviews.before) / b.reviews.after;

  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: W,
        bottom: 1920 - BOTTOM,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 30px 70px rgba(40,25,10,0.18), 0 6px 18px rgba(40,25,10,0.08)',
        padding: '30px 36px 24px',
        boxSizing: 'border-box',
        fontFamily: FONT,
        color: BRAND.ink,
        transform: `translateY(${(1 - inP) * 700 + outP * 720}px)`,
        opacity: Math.min(1, inP * 2) * (1 - outP * 0.6),
      }}
    >
      {/* Name row */}
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 22,
            background: '#FFF0EA',
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
          <div style={{fontSize: 42, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
            {b.name}
          </div>
          <div style={{fontSize: 26, fontWeight: 600, color: BRAND.inkSoft, marginTop: 4, whiteSpace: 'nowrap'}}>
            {b.category} · {b.area ?? b.street}
          </div>
        </div>
      </div>

      <div style={{height: 1, background: '#EEE9E3', margin: '24px 0 22px'}} />

      {/* The growth: rating and reviews, side by side */}
      <div style={{display: 'flex', gap: 28}}>
        <Stat
          label="RATING"
          value={r.shown.toFixed(1)}
          color={ratingColor}
          visual={<div style={{display: 'flex', gap: 3}}>{stars}</div>}
          gain={`+${ratingGain.toFixed(1)}`}
          was={b.rating.before.toFixed(1)}
          gainIn={gainIn}
        />
        <div style={{width: 1, background: '#EEE9E3'}} />
        <Stat
          label="REVIEWS"
          value={r.reviews.toLocaleString('en-US')}
          color={ratingColor}
          visual={
            <div style={{position: 'relative', width: '100%', height: 18, borderRadius: 9, background: BRAND.starEmpty, overflow: 'hidden'}}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.min(1, barNow) * 100}%`,
                  borderRadius: 9,
                  background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.orange})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.min(barNow, barBefore) * 100}%`,
                  background: '#C9C3BB',
                  borderRadius: 9,
                }}
              />
            </div>
          }
          gain={`+${reviewGain.toLocaleString('en-US')}`}
          was={b.reviews.before.toLocaleString('en-US')}
          gainIn={gainIn}
        />
      </div>

      {/* Chip */}
      <div style={{display: 'flex', marginTop: 26, height: 70, alignItems: 'center'}}>
        <div
          style={{
            background: BRAND.red,
            color: '#fff',
            borderRadius: 999,
            padding: '14px 32px 14px 24px',
            fontSize: 36,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transform: `scale(${chip})`,
            transformOrigin: 'left center',
            boxShadow: '0 10px 24px rgba(230,57,34,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width={32} height={32} viewBox="0 0 24 24">
            <path d="M3 17 L9.5 10.5 L13.5 14.5 L21 7" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 7 H21 V13" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {b.chip}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
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
