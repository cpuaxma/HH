import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, CARD_COLORS, COLUMN, COPY, HUBS, TIMING} from '../data';
import {SANS} from '../fonts';
import {project} from '../lib/camera';
import {hubPos, routePoint} from '../lib/geo';
import {easeIn, easeInOut, hubReachedFrame, journeyS, ramp} from '../lib/timeline';

/** Map pin artwork: 48×64, tip at the bottom centre. */
export const Pin: React.FC<{height: number}> = ({height}) => (
  <svg width={(height * 48) / 64} height={height} viewBox="0 0 48 64" style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <linearGradient id="pinShade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2A4785" />
        <stop offset="0.55" stopColor={BRAND.navy} />
        <stop offset="1" stopColor="#06163A" />
      </linearGradient>
    </defs>
    <path d="M24 1C11.3 1 1 11.1 1 23.7 1 40.6 24 63 24 63S47 40.6 47 23.7C47 11.1 36.7 1 24 1Z" fill="url(#pinShade)" />
    <circle cx="24" cy="23.5" r="8.6" fill="#fff" />
  </svg>
);

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Fade for points on the globe as they turn toward its edge. */
const facingFade = (facing: number) => smooth(0.12, 0.32, facing);

/** Pin height in px for a given pixels-per-unit scale. */
const pinHeight = (px: number) => 52 * Math.pow(px / 4.2, 0.3);

const hubAppear = (i: number) => (i === 0 ? TIMING.pinDrop : hubReachedFrame(i) - 4);

/** The navy pins at each hub; the first one drops in with a bounce in the hook. */
export const Pins: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame > TIMING.endCardStart + 60) return null;
  return (
    <>
      {HUBS.map((_, i) => {
        const start = hubAppear(i);
        if (frame < start) return null;
        const p = project(frame, hubPos(i));
        const fade = facingFade(p.facing);
        if (fade <= 0.001) return null;
        let h = pinHeight(p.pxPerUnit);
        let y = 0;
        let squash = 0;
        let pop = 1;
        let shadow = 1;
        if (i === 0) {
          // Hook: a hero-sized pin drops with a physical bounce, then settles to the others' size.
          h *= interpolate(ramp(frame, 150, 270, easeInOut), [0, 1], [2.7, 1]);
          const t = interpolate(frame, [TIMING.pinDrop, TIMING.pinDrop + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const fall = Easing.bounce(t);
          y = -(1 - fall) * 1000;
          const near = Math.max(0, 1 - Math.abs(y) / 26);
          squash = near * (1 - t) * 0.22;
          shadow = 0.35 + 0.65 * fall;
          // Heartbeat after landing.
          const since = frame - (TIMING.pinDrop + 40);
          if (since > 0 && since < 110) pop = 1 + Math.max(0, Math.sin(Math.min(1, (since % 34) / 12) * Math.PI)) * 0.06;
        } else {
          pop = spring({frame: frame - start, fps, config: {damping: 11, stiffness: 170, mass: 0.7}});
          shadow = pop;
        }
        const w = (h * 48) / 64;
        const sw = w * 1.1;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: fade}}>
            <div
              style={{
                position: 'absolute',
                left: p.x - sw / 2,
                top: p.y - sw * 0.14,
                width: sw,
                height: sw * 0.28,
                borderRadius: '50%',
                background: 'radial-gradient(closest-side, rgba(11,25,60,0.32), rgba(11,25,60,0))',
                opacity: shadow,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: p.x - w / 2,
                top: p.y - h + y,
                transform: `scale(${pop * (1 + squash)}, ${pop * (1 - squash)})`,
                transformOrigin: '50% 100%',
                filter: 'drop-shadow(0 6px 8px rgba(11,25,60,0.25))',
              }}
            >
              <Pin height={h} />
            </div>
          </div>
        );
      })}
    </>
  );
};

/** The small "IFRS" tag that pops beside each hub while the routes draw. */
export const HubTags: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < TIMING.routeStart - 20 || frame > TIMING.globalOut + 40) return null;
  const out = ramp(frame, TIMING.globalOut, TIMING.globalOut + 26, easeIn);
  return (
    <>
      {HUBS.map((hub, i) => {
        const at = hubReachedFrame(i) + 2;
        if (frame < at) return null;
        const p = project(frame, hubPos(i));
        const fade = facingFade(p.facing) * (1 - out);
        if (fade <= 0.001) return null;
        const pop = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 190, mass: 0.6}});
        const h = pinHeight(p.pxPerUnit);
        const font = 25;
        // Rough width so the tag can be kept inside the centred column.
        const width = 44 + font * 0.62 * (COPY.hubTag.length + hub.name.length) + 34;
        const height = 54;
        let left = p.x - width / 2;
        let top = p.y - h - height - 14;
        let origin = '50% 100%';
        if (hub.tag === 'left') {
          left = p.x - width - 22;
          top = p.y - h * 0.62 - height / 2;
          origin = '100% 50%';
        } else if (hub.tag === 'right') {
          left = p.x + 22;
          top = p.y - h * 0.62 - height / 2;
          origin = '0% 50%';
        }
        left = Math.max(COLUMN.x, Math.min(COLUMN.x + COLUMN.width - width, left));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              height,
              width,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '0 18px',
              background: '#fff',
              borderRadius: 999,
              boxShadow: '0 12px 28px rgba(20,25,45,0.16), 0 2px 6px rgba(20,25,45,0.08)',
              fontFamily: SANS,
              fontSize: font,
              whiteSpace: 'nowrap',
              opacity: fade,
              transform: `scale(${pop})`,
              transformOrigin: origin,
            }}
          >
            <span style={{fontWeight: 800, color: BRAND.navy, letterSpacing: 1.5}}>{COPY.hubTag}</span>
            <span style={{width: 1.5, height: 24, background: CARD_COLORS.divider}} />
            <span style={{fontWeight: 600, color: CARD_COLORS.text}}>{hub.name}</span>
          </div>
        );
      })}
    </>
  );
};

/** The navy dot travelling the journey, hub to hub. */
export const Traveller: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.journeyStart - 20;
  const b = TIMING.pullOutStart + 40;
  if (frame < a || frame > b) return null;
  const vis = ramp(frame, a, a + 18) * (1 - ramp(frame, b - 30, b));
  const p = project(frame, routePoint(journeyS(frame)));
  const size = 20 * Math.pow(p.pxPerUnit / 4.2, 0.25);
  const ring = (frame % 60) / 60;
  return (
    <div style={{position: 'absolute', left: p.x, top: p.y, opacity: vis * smooth(0.05, 0.25, p.facing)}}>
      <div
        style={{
          position: 'absolute',
          left: -size * 1.6,
          top: -size * 1.6,
          width: size * 3.2,
          height: size * 3.2,
          borderRadius: '50%',
          border: `3px solid ${BRAND.navy}`,
          transform: `scale(${0.4 + 0.6 * ring})`,
          opacity: 0.45 * (1 - ring),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -size * 0.72,
          top: -size * 0.72,
          width: size * 1.44,
          height: size * 1.44,
          borderRadius: '50%',
          background: BRAND.navy,
          border: `${size * 0.22}px solid #fff`,
          boxSizing: 'border-box',
          boxShadow: '0 6px 14px rgba(11,25,60,0.35)',
        }}
      />
    </div>
  );
};
