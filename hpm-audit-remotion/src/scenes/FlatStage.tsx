import {Heart} from 'lucide-react';
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {COPY} from '../copy';
import {CheckBadge} from '../components/CheckBadge';
import {CountdownRing} from '../components/CountdownRing';
import {TypeOn} from '../components/TypeOn';
import {Grid} from '../components/Grid';
import {LatteReel} from '../components/LatteReel';
import {LAYOUT, Profile} from '../components/Profile';
import {RedLine, RedWander} from '../components/RedLine';
import {MARKED_TILES, REEL_TILE, TILE} from '../components/Tiles';
import {clamp, exitP, mix, pop, progress} from '../lib/anim';
import {camPoint, camTransform, flatCam, reelTime} from '../lib/cameras';
import {smoothPath} from '../lib/path';
import {BEZEL_PX, BODY_R_PX, SCREEN, SCREEN_R_PX} from '../lib/projection';
import {T} from '../timeline';
import {C, EASE_IN, EASE_OUT, FONT, FONT_APP, HEIGHT, WIDTH} from '../theme';

// 2–4 · The flat, full-screen profile: bio fix, grid fix, and the reel (hook) fix.

const pill: React.CSSProperties = {
  position: 'absolute',
  background: C.cream,
  color: C.charcoal,
  fontFamily: FONT,
  fontWeight: 800,
  borderRadius: 18,
  boxShadow: '0 12px 32px rgba(15,15,15,0.22)',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
};

const STREAK = (y: number) =>
  smoothPath([
    [-80, y + 260],
    [260, y + 40],
    [560, y + 180],
    [820, y - 40],
    [1160, y + 60],
  ]);

// The bio fix, drawn in profile coordinates (moves with the camera).
const BioFix: React.FC<{frame: number}> = ({frame}) => {
  const card = pop(frame, T.bioCard);
  const settle = progress(frame, T.bioContext, 16);
  const showCard = frame >= T.bioCard && frame < T.bioContext + 18;
  return (
    <>
      {frame < T.bioCard + 20 && (
        <RedLine type="strike" x1={36} y1={LAYOUT.bioY + 30} x2={540} y2={LAYOUT.bioY + 26} at={T.bioStrike} dur={12} width={9} seed="strike" w={SCREEN.w} h={SCREEN.h} />
      )}
      {showCard && (
        <div
          style={{
            position: 'absolute',
            left: 24 + mix(260, 0, card),
            opacity: Math.min(1, card * 2.5),
            top: LAYOUT.bioY - 16,
            width: 880,
            height: 2 * LAYOUT.bioLine + 34,
            borderRadius: 20,
            background: settle > 0 ? `rgba(254,249,239,${1 - settle})` : C.cream,
            boxShadow: `0 16px 40px rgba(15,15,15,${0.25 * (1 - settle)})`,
            border: `3px solid rgba(226,59,36,${0.9 * (1 - settle)})`,
          }}
        >
          <TypeOn
            parts={T.bioType}
            cursorUntil={T.bioCheck}
            style={{position: 'absolute', left: LAYOUT.bioX - 24 - 3, top: 16 - 3, width: LAYOUT.bioW, fontFamily: FONT_APP, fontSize: LAYOUT.bioFont, lineHeight: `${LAYOUT.bioLine}px`, color: C.ink}}
          />
        </div>
      )}
    </>
  );
};

// Full-screen reel layer: expands out of (and back into) its grid tile.
const ReelLayer: React.FC<{frame: number}> = ({frame}) => {
  const cam = flatCam(frame);
  const tile = LAYOUT.tile(REEL_TILE);
  const [tx, ty] = camPoint(cam, tile.x, tile.y);
  const ts = TILE * cam.s;
  const q = progress(frame, T.zoomThrough[0] + 6, T.zoomThrough[1] - T.zoomThrough[0] - 6, EASE_IN) * (1 - progress(frame, T.reelShrink[0], T.reelShrink[1] - T.reelShrink[0], EASE_OUT));
  const r = {x: mix(tx, 0, q), y: mix(ty, 0, q), w: mix(ts, WIDTH, q), h: mix(ts, HEIGHT, q)};
  const sc = Math.max(r.w / WIDTH, r.h / HEIGHT);
  const rt = reelTime(frame);
  const wob = q * (frame >= T.freeze && frame < T.colorSnap ? 0 : 1);
  const desat = progress(frame, T.freeze, 6) * (1 - progress(frame, T.colorSnap, 3));
  const flashAt = (at: number, peak: number) => (frame < at ? 0 : interpolate(frame - at, [0, 1, 4], [peak, peak * 0.6, 0], clamp));
  const flash = Math.max(flashAt(T.freeze, 0.9), flashAt(T.colorSnap, 0.8));
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', borderRadius: (1 - q) * 4}}>
      <div
        style={{
          position: 'absolute',
          left: (r.w - WIDTH * sc) / 2,
          top: (r.h - HEIGHT * sc) / 2,
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `scale(${sc})`,
          filter: desat > 0 ? `grayscale(${desat}) brightness(${1 - 0.25 * desat}) contrast(${1 + 0.1 * desat})` : undefined,
        }}
      >
        <div style={{width: WIDTH, height: HEIGHT, transform: `translate(${Math.sin(rt / 13) * 10 * wob}px, ${Math.cos(rt / 17) * 8 * wob}px) rotate(${Math.sin(rt / 29) * 0.8 * wob}deg) scale(${1.04 + 0.03 * (frame >= T.freeze && frame < T.colorSnap ? progress(frame, T.freeze, 140, (x) => x) : 0)})`}}>
          <LatteReel t={rt} />
        </div>
      </div>
      {flash > 0 && <AbsoluteFill style={{background: C.cream, opacity: flash}} />}
    </div>
  );
};

// Reel overlays in frame coordinates.
const ReelOverlays: React.FC<{frame: number}> = ({frame}) => {
  const out = exitP(frame, T.reelShrink[0], 8);
  if (frame < T.countdown[0] || frame > T.reelShrink[0] + 8) return null;
  const capT = frame - T.colorSnap;
  const capScale = interpolate(capT, [0, 6], [1.5, 1], {...clamp, easing: EASE_OUT});
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - 0.3 * out})`}}>
      <CountdownRing at={T.countdown} closeAt={T.ringClose} x={470} y={1190} />
      {capT >= 0 && (
        <div style={{position: 'absolute', left: 64, top: 640, transform: `scale(${capScale})`, transformOrigin: '30% 50%'}}>
          {COPY.hook3.caption.map((line, i) => (
            <div key={i} style={{display: 'table', marginBottom: 12, background: C.cream, color: C.charcoal, fontFamily: FONT, fontWeight: 900, fontSize: 118, lineHeight: '124px', letterSpacing: '-0.035em', padding: '0 22px', borderRadius: 10}}>
              {line}
            </div>
          ))}
        </div>
      )}
      <RedLine type="underline" x1={80} y1={936} x2={590} y2={930} at={T.underline} dur={14} width={12} seed="cap" />
      {frame >= T.hearts &&
        Array.from({length: 7}, (_, i) => {
          const t = frame - T.hearts - i * 3;
          if (t < 0) return null;
          const rise = progress(t, 0, 70, EASE_OUT);
          const s = pop(t, 0) * (0.7 + random(`h${i}`) * 0.6);
          return (
            <div key={i} style={{position: 'absolute', left: 90 + random(`hx${i}`) * 260, top: 1480 - rise * (380 + random(`hy${i}`) * 220), opacity: 1 - progress(t, 45, 25), transform: `scale(${s}) rotate(${(random(`hr${i}`) - 0.5) * 30}deg)`}}>
              <Heart size={110} color={C.red} fill={C.red} strokeWidth={1} />
            </div>
          );
        })}
      {frame >= T.scrollChip && (
        <div style={{...pill, left: 64, top: 1010, height: 92, padding: '0 30px', fontSize: 46, transform: `scale(${pop(frame, T.scrollChip)})`, transformOrigin: '0 50%'}}>
          {COPY.hook3.chip}
          <span style={{color: C.red, marginLeft: 14}}>↓</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const FlatStage: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = flatCam(frame);
  const reelCovers = frame >= T.zoomThrough[1] && frame < T.reelShrink[0];
  const marks = T.gridMarks.map((f, i) => ({tile: MARKED_TILES[i], t: frame - f}));
  const gridOut = exitP(frame, T.zoomThrough[0], 8);
  const bioOut = exitP(frame, T.gridWhip[0], 8);
  // While the tiles explode they leave the screen, so the grid renders outside the screen clip.
  const scattering = frame >= T.scatter && frame < T.snap;
  const grid = <Grid state={frame >= T.snap ? 'after' : 'before'} scatterT={frame >= T.scatter ? frame - T.scatter : undefined} marks={marks} reelT={reelTime(frame)} />;

  return (
    <AbsoluteFill>
      {!reelCovers && (
        <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transformOrigin: '0 0', transform: camTransform(cam)}}>
          {/* The phone face, flattened: same bezel and radii as the 3D model */}
          <div style={{position: 'absolute', left: -BEZEL_PX, top: -BEZEL_PX, width: SCREEN.w + 2 * BEZEL_PX, height: SCREEN.h + 2 * BEZEL_PX, borderRadius: BODY_R_PX, background: '#0A0A0A', boxShadow: '0 40px 120px rgba(15,15,15,0.35)'}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: SCREEN_R_PX, overflow: 'hidden'}}>
            <Profile
              state="before"
              bio={frame >= T.bioContext ? 'after' : 'before'}
              gridNode={scattering ? <></> : grid}
            >
              <BioFix frame={frame} />
            </Profile>
          </div>
        </div>
      )}

      {scattering && (
        <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transformOrigin: '0 0', transform: camTransform(cam)}}>
          <div style={{position: 'absolute', left: 0, top: LAYOUT.gridY, width: SCREEN.w, height: 3 * TILE + 6}}>{grid}</div>
        </div>
      )}

      {/* Bio overlays */}
      {frame < T.gridWhip[0] + 8 && (
        <AbsoluteFill style={{transform: `translateY(${-600 * bioOut}px)`, opacity: 1 - bioOut}}>
          <CheckBadge at={T.bioCheck} x={64} y={1096} size={100} />
          {frame >= T.bioMicro && (
            <div style={{...pill, left: 64, top: 1222, height: 100, padding: '0 30px 14px', fontSize: 44, transform: `scale(${pop(frame, T.bioMicro)})`, transformOrigin: '0 50%'}}>
              {COPY.bio.micro}
            </div>
          )}
          <RedLine type="underline" x1={92} y1={1300} x2={700} y2={1296} at={T.bioMicro + 4} dur={12} width={8} seed="micro" />
        </AbsoluteFill>
      )}

      {/* Grid overlays: palette swatches, "1 font", check */}
      {frame >= T.swatches && frame < T.zoomThrough[0] + 8 && (
        <AbsoluteFill style={{transform: `translateY(${-500 * gridOut}px)`, opacity: 1 - gridOut}}>
          {COPY.grid.swatches.map((sw, i) => {
            const s = pop(frame, T.swatches + i * 6);
            return (
              <div key={sw.name} style={{...pill, left: 64 + i * 196, top: 300, width: 180, height: 214, flexDirection: 'column', justifyContent: 'center', gap: 14, transform: `scale(${s}) rotate(${(i ? 3 : -3) * s}deg)`}}>
                <div style={{width: 112, height: 112, borderRadius: 24, background: sw.hex, border: `4px solid ${C.charcoal}`}} />
                <div style={{fontSize: 30}}>{sw.name}</div>
              </div>
            );
          })}
          {frame >= T.fontChip && (
            <div style={{...pill, left: 470, top: 352, height: 110, padding: '0 30px', gap: 18, fontSize: 48, transform: `scale(${pop(frame, T.fontChip)})`}}>
              <span style={{fontWeight: 900, fontSize: 64}}>Aa</span>
              <span style={{width: 4, height: 54, background: C.charcoal}} />
              {COPY.grid.font}
            </div>
          )}
          <CheckBadge at={T.gridCheck} x={786} y={354} size={106} />
        </AbsoluteFill>
      )}

      {/* Red line streaks between beats */}
      <RedWander d={STREAK(300)} at={T.bioWander} dur={28} width={8} length={0.5} />
      <RedWander d={STREAK(1400)} at={T.gridCheck + 4} dur={24} width={8} length={0.5} />
      <RedWander d={STREAK(260)} at={T.reelWander} dur={30} width={8} length={0.5} />

      {frame >= T.zoomThrough[0] + 6 && frame < T.reelShrink[1] + 1 && <ReelLayer frame={frame} />}
      <ReelOverlays frame={frame} />
    </AbsoluteFill>
  );
};
