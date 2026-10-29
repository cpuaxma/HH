import React from 'react';
import {geoContains, geoNaturalEarth1} from 'd3-geo';
import {feature} from 'topojson-client';
import type {Topology, GeometryCollection} from 'topojson-specification';
import type {FeatureCollection} from 'geojson';
import land110 from 'world-atlas/land-110m.json';
import {COLORS} from '../theme';
import {hexA, jitter, rand} from '../motion';

type Dot = {x: number; y: number; d: number};

const cache = new Map<string, Dot[]>();

/**
 * Land dots on a regular grid, generated from world-atlas land-110m with d3-geo.
 * `d` is the normalised distance from the map centre (used for the radial reveal).
 */
const buildDots = (width: number, height: number, step: number): Dot[] => {
  const key = `${width}x${height}@${step}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const topo = land110 as unknown as Topology<{land: GeometryCollection}>;
  const land = feature(topo, topo.objects.land) as unknown as FeatureCollection;
  const projection = geoNaturalEarth1().fitSize([width, height], land);
  const dots: Dot[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const ll = projection.invert?.([x, y]);
      if (!ll || ll[1] < -58) continue; // skip Antarctica: it eats space and reads as a smear
      if (land.features.some((f) => geoContains(f, ll))) dots.push({x, y, d: Math.hypot(x - cx, y - cy) / maxD});
    }
  }
  cache.set(key, dots);
  return dots;
};

/**
 * Dotted world map with abstract red "tension" spots (no labels, nothing named).
 * `reveal` 0–1 fades dots in from the centre outwards; `spots` 0–1 brings the red pulses in.
 */
export const DottedMap: React.FC<{
  frame: number;
  width: number;
  height: number;
  reveal: number;
  spots: number;
  step?: number;
  spotCount?: number;
}> = ({frame, width, height, reveal, spots, step = 11, spotCount = 8}) => {
  const dots = buildDots(width, height, step);
  const picks = React.useMemo(() => {
    const out: Dot[] = [];
    for (let k = 0; out.length < spotCount && k < 200; k++) {
      const dot = dots[Math.floor(rand(k + 42) * dots.length)];
      if (dot && out.every((o) => Math.hypot(o.x - dot.x, o.y - dot.y) > width * 0.12)) out.push(dot);
    }
    return out;
  }, [dots, spotCount, width]);

  return (
    <svg width={width} height={height} style={{overflow: 'visible'}}>
      {dots.map((p, i) => {
        const o = Math.min(1, Math.max(0, (reveal * 1.5 - p.d) / 0.5));
        return o > 0 ? <circle key={i} cx={p.x} cy={p.y} r={3} fill={COLORS.mapDot} opacity={o} /> : null;
      })}
      {picks.map((p, i) => {
        // Each spot pulses on its own irregular rhythm and flickers: restless, never in sync.
        const period = 62 + Math.floor(rand(i + 5) * 40);
        const local = (frame + rand(i + 9) * period) % period;
        const ring = local / period;
        const j = jitter(i + 30, frame, 1.2);
        const on = Math.min(1, Math.max(0, spots * spotCount - i * 0.6)); // staggered arrival
        if (on <= 0) return null;
        return (
          <g key={`s${i}`} transform={`translate(${p.x + j.x} ${p.y + j.y})`} opacity={on}>
            <circle r={6 + ring * 30} fill="none" stroke={COLORS.red} strokeWidth={2} opacity={(1 - ring) * 0.7} />
            <circle r={14} fill={hexA(COLORS.red, 0.18 * j.flicker)} />
            <circle r={4.5} fill={COLORS.red} opacity={j.flicker} style={{filter: `drop-shadow(0 0 6px ${COLORS.red})`}} />
          </g>
        );
      })}
    </svg>
  );
};
