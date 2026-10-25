import React from 'react';
import {getStaticFiles, Img, random} from 'remotion';
import {COPY} from '../copy';
import {FeedArt} from '../feed/Illustrations';
import {AFTER_PALETTES, BEFORE_PALETTES} from '../feed/palettes';
import {enter, kick, mix} from '../lib/anim';
import {GRID, tileRect} from '../lib/stage';
import {tileTrigger} from '../lib/sweeps';
import {CUE} from '../timeline';
import {CLIENT, FONT, TYPE, WEIGHT} from '../theme';
import {IconHeart} from './Icons';

export type Pose = {dx: number; dy: number; rot: number; scale: number; zoom: number; ox: number; oy: number};

const AFTER_POSE: Pose = {dx: 0, dy: 0, rot: 0, scale: 1, zoom: 1, ox: 0, oy: 0};

// Crooked, inconsistently sized, randomly cropped. Boring, not broken.
export const beforePose = (i: number): Pose => {
  const r = (k: string) => random(`tile-${i}-${k}`);
  const zoom = 1.15 + r('z') * 0.45;
  const slack = ((zoom - 1) * GRID.tile) / 2;
  return {
    dx: (r('x') - 0.5) * 18,
    dy: (r('y') - 0.5) * 18,
    rot: (r('s') < 0.5 ? -1 : 1) * (2 + r('r') * 2),
    scale: 0.84 + r('k') * 0.14,
    zoom,
    ox: (r('ox') - 0.5) * 2 * slack,
    oy: (r('oy') - 0.5) * 2 * slack,
  };
};

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  dx: mix(a.dx, b.dx, t),
  dy: mix(a.dy, b.dy, t),
  rot: mix(a.rot, b.rot, t),
  scale: mix(a.scale, b.scale, t),
  zoom: mix(a.zoom, b.zoom, t),
  ox: mix(a.ox, b.ox, t),
  oy: mix(a.oy, b.oy, t),
});

// /public/feed/01.jpg … 09.jpg replace the illustrations when present.
const photo = (i: number) => getStaticFiles().find((f) => f.name === `feed/${String(i + 1).padStart(2, '0')}.jpg`)?.src;

export const TileArt: React.FC<{index: number; state: 'before' | 'after'}> = ({index, state}) => {
  const src = photo(index);
  if (src) {
    return (
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: state === 'after' ? 'sepia(0.14) saturate(0.92)' : undefined}} />
    );
  }
  return <FeedArt index={index} palette={(state === 'after' ? AFTER_PALETTES : BEFORE_PALETTES)[index]} />;
};

// Clean Montserrat overlay label on an AFTER tile.
export const TileTag: React.FC<{text: string; onDark: boolean; scale?: number; reveal: number}> = ({text, onDark, scale = 1, reveal}) => (
  <div style={{position: 'absolute', left: 12 * scale, bottom: 12 * scale, overflow: 'hidden', borderRadius: 4 * scale}}>
    <div
      style={{
        transform: `translateY(${(1 - reveal) * 110}%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 6 * scale,
        padding: `${5 * scale}px ${8 * scale}px`,
        background: onDark ? CLIENT.oat : CLIENT.espresso,
        color: onDark ? CLIENT.espresso : CLIENT.oat,
        fontFamily: FONT.brand,
        fontWeight: WEIGHT.headline,
        fontSize: 13 * scale,
        letterSpacing: TYPE.labelTracking,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{width: 5 * scale, height: 5 * scale, borderRadius: '50%', background: CLIENT.accent}} />
      {text}
    </div>
  </div>
);

const BeforeTileText: React.FC<{text: string; i: number}> = ({text, i}) => (
  <div
    style={{
      position: 'absolute',
      left: i % 2 ? 14 : 'auto',
      right: i % 2 ? 'auto' : 10,
      top: 10,
      fontFamily: i % 2 ? FONT.times : FONT.arial,
      fontWeight: 700,
      fontSize: i % 2 ? 30 : 22,
      color: '#FFFFFF',
      textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
    }}
  >
    {text}
  </div>
);

type Props = {state: 'before' | 'after'; frame: number};

export const FeedGrid: React.FC<Props> = ({state, frame}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: GRID.top,
      width: GRID.size,
      height: GRID.size,
      background: state === 'after' ? CLIENT.oat : 'transparent',
    }}
  >
    {Array.from({length: 9}, (_, i) => {
      const r = tileRect(i);
      const t = state === 'after' ? kick(frame, tileTrigger(i)) : 0;
      const pose = lerpPose(beforePose(i), AFTER_POSE, t);
      const tag = COPY.makeover.tileText[i];
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: r.x + pose.dx,
            top: r.y - GRID.top + pose.dy,
            width: r.size,
            height: r.size,
            transform: `rotate(${pose.rot}deg) scale(${pose.scale})`,
            overflow: 'hidden',
          }}
        >
          <div style={{position: 'absolute', inset: 0, transform: `translate(${pose.ox}px, ${pose.oy}px) scale(${pose.zoom})`}}>
            <TileArt index={i} state={state} />
          </div>
          {state === 'before' ? (
            <>
              {COPY.before.tileText[i] ? <BeforeTileText text={COPY.before.tileText[i]} i={i} /> : null}
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  bottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontFamily: FONT.arial,
                  fontSize: 15,
                  color: '#FFFFFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                <IconHeart size={15} color="#FFFFFF" filled stroke={1.6} />
                {COPY.client.before.tileLikes[i]}
              </div>
            </>
          ) : tag ? (
            <TileTag text={tag} onDark={AFTER_PALETTES[i].bg === CLIENT.espresso} reveal={enter(frame, CUE.gridOverlays + (i === 2 ? 8 : 0), 26)} />
          ) : null}
        </div>
      );
    })}
  </div>
);
