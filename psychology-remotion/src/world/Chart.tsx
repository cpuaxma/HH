import React, {useLayoutEffect, useMemo} from 'react';
import {random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {COLORS} from '../config';
import {getWorld} from '../lib/director';
import {crowdOpacity, crowdPos} from '../lib/crowd';
import {ease} from '../lib/motion';
import {BASE, CHART, CHART_CENTER, SAMPLES, SAMPLE_U, flatY, shapeAt} from '../lib/track';
import {glowTexture} from './textures';
import {Orb} from './Orb';
import {RibbonGeometry, makeRibbonMaterial} from './ribbon';

/** y of the flat chart at x (BASE is monotone in x). */
const yAtX = (x: number) => {
  let lo = 0;
  let hi = SAMPLES - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (BASE[mid][0] < x) lo = mid;
    else hi = mid;
  }
  const a = BASE[lo];
  const b = BASE[hi];
  const t = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
  return {y: a[1] + (b[1] - a[1]) * t, u: SAMPLE_U[lo] + (SAMPLE_U[hi] - SAMPLE_U[lo]) * t};
};

const CANDLE_STEP = 3.3;
const CANDLE_W = 1.55;
const GHOSTS = [1, 2, 3];
const GRID_LINES = 5;

/**
 * The reveal: a thin price line with candles drawn exactly on the flattened track, a faint grid,
 * and the same cycle repeating into the distance. Also the crowd-vs-wise replay orbs.
 */
export const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  const w = getWorld(frame);

  const parts = useMemo(() => {
    // price line
    const priceGeo = new RibbonGeometry(SAMPLES, SAMPLE_U.map(() => new THREE.Color('#FFF3D0')));
    const price = makeRibbonMaterial({width: 0.12, minPx: 2.1, intensity: 2.2, core: 0.7, sharp: 2.2});
    const priceBuf = new Float32Array(SAMPLES * 3);

    // candles: body + wick per candle
    type Candle = {x: number; u: number; open: number; close: number; hi: number; lo: number};
    const candles: Candle[] = [];
    for (let x = CHART.minX + 2; x < CHART.maxX - 1; x += CANDLE_STEP) {
      const o = yAtX(x - CANDLE_STEP * 0.42);
      const c = yAtX(x + CANDLE_STEP * 0.42);
      const n = candles.length;
      const wick = 0.6 + random(`wick-${n}`) * 2.2;
      candles.push({
        x,
        u: yAtX(x).u,
        open: o.y,
        close: c.y,
        hi: Math.max(o.y, c.y) + wick * random(`hi-${n}`),
        lo: Math.min(o.y, c.y) - wick * random(`lo-${n}`),
      });
    }
    const mkMesh = () =>
      new THREE.InstancedMesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false}),
        candles.length,
      );
    const bodies = mkMesh();
    const wicks = mkMesh();
    const up = new THREE.Color(COLORS.gold).multiplyScalar(1.25);
    const down = new THREE.Color('#E8463A').multiplyScalar(1.1);
    candles.forEach((c, i) => {
      const col = c.close >= c.open ? up : down;
      bodies.setColorAt(i, col);
      wicks.setColorAt(i, col.clone().multiplyScalar(0.8));
    });
    bodies.renderOrder = 8;
    wicks.renderOrder = 8;
    bodies.frustumCulled = false;
    wicks.frustumCulled = false;

    // grid
    const gridGeos: RibbonGeometry[] = [];
    const grid = makeRibbonMaterial({width: 0.03, minPx: 0.7, intensity: 0.45, sharp: 2});
    for (let g = 0; g < GRID_LINES; g++) {
      const y = flatY(CHART.minY - 3 + (g / (GRID_LINES - 1)) * (CHART.maxY - CHART.minY + 6));
      const geo = new RibbonGeometry(2, [new THREE.Color('#F5D77A'), new THREE.Color('#F5D77A')]);
      geo.setPoints([CHART.minX - 4, y, -0.5, CHART.maxX + 4, y, -0.5]);
      gridGeos.push(geo);
    }

    // ghosts: the same cycle again and again, each one starting where the last one ended, so the
    // market carries on to the right and recedes into the distance as the camera turns
    const first = BASE[0];
    const last = BASE[SAMPLES - 1];
    const ghostGeos = GHOSTS.map((k) => {
      const geo = new RibbonGeometry(SAMPLES, SAMPLE_U.map(() => new THREE.Color('#E9C766')));
      const pts = new Float32Array(SAMPLES * 3);
      for (let i = 0; i < SAMPLES; i++) {
        const b = BASE[i];
        pts[i * 3] = b[0] + k * (last[0] - first[0]);
        pts[i * 3 + 1] = flatY(b[1] + k * (last[1] - first[1]));
        pts[i * 3 + 2] = 0;
      }
      geo.setPoints(pts);
      return geo;
    });
    const ghostMats = GHOSTS.map(() => makeRibbonMaterial({width: 0.12, minPx: 1.8, intensity: 1.3, sharp: 2.5}));
    const ghostGlow = GHOSTS.map(() => makeRibbonMaterial({width: 1.2, minPx: 10, intensity: 0.22, sharp: 3}));

    // a warm pool of light behind the flat line, so the late scenes are not a hairline in a void
    const pool = new THREE.Sprite(
      new THREE.SpriteMaterial({map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false, fog: false, color: new THREE.Color('#D4AF37')}),
    );
    pool.position.set(CHART_CENTER[0], CHART_CENTER[1], -30);
    pool.scale.set(240, 150, 1);
    pool.renderOrder = -1;

    return {priceGeo, price, priceBuf, candles, bodies, wicks, gridGeos, grid, ghostGeos, ghostMats, ghostGlow, pool};
  }, []);

  useLayoutEffect(() => {
    const p = parts;
    const show = w.shape.flatten;
    // price line sits a hair in front of the flattened track
    for (let i = 0; i < SAMPLES; i++) {
      const q = shapeAt(i, w.shape, frame);
      p.priceBuf[i * 3] = q[0];
      p.priceBuf[i * 3 + 1] = q[1];
      p.priceBuf[i * 3 + 2] = q[2] + 0.4;
    }
    p.priceGeo.setPoints(p.priceBuf);
    const priceOpacity = show * (1 - ease(frame, [992, 1012]));
    p.price.uniforms.uDraw.value.set(0, w.priceDraw);
    p.price.uniforms.uOpacity.value = priceOpacity;

    const m = new THREE.Matrix4();
    const vis = w.candles * show;
    p.candles.forEach((c, i) => {
      const k = THREE.MathUtils.smoothstep(w.priceDraw, c.u - 0.004, c.u + 0.03);
      const kk = k * k * (3 - 2 * k);
      const fl = w.shape.flatten;
      const o = flatY(c.open, fl);
      const cl = flatY(c.close, fl);
      const hi = flatY(c.hi, fl);
      const lo = flatY(c.lo, fl);
      const bodyH = Math.max(0.45, Math.abs(cl - o)) * kk;
      m.makeScale(CANDLE_W, Math.max(0.001, bodyH), 1).setPosition(c.x, (cl + o) / 2, 0.6);
      p.bodies.setMatrixAt(i, m);
      m.makeScale(0.26, Math.max(0.001, (hi - lo) * kk), 1).setPosition(c.x, (hi + lo) / 2, 0.55);
      p.wicks.setMatrixAt(i, m);
    });
    p.bodies.instanceMatrix.needsUpdate = true;
    p.wicks.instanceMatrix.needsUpdate = true;
    (p.bodies.material as THREE.MeshBasicMaterial).opacity = vis * 0.9;
    (p.wicks.material as THREE.MeshBasicMaterial).opacity = vis * 0.75;
    p.bodies.visible = vis > 0.003;
    p.wicks.visible = vis > 0.003;

    p.grid.uniforms.uOpacity.value = show * 0.22 * (1 - w.shape.wave);
    const pm = p.pool.material as THREE.SpriteMaterial;
    pm.opacity = show * (0.16 + 0.06 * Math.sin(frame * 0.05)) * (1 - w.shape.ring * 0.4);
    p.pool.visible = pm.opacity > 0.003;
    p.grid.uniforms.uDraw.value.set(0, ease(frame, [770, 822]));

    p.ghostMats.forEach((mat, i) => {
      mat.uniforms.uOpacity.value = w.ghosts[i];
      mat.uniforms.uDraw.value.set(0, ease(frame, [848 + i * 10 - 12, 848 + i * 10 + 16]));
      p.ghostGlow[i].uniforms.uOpacity.value = w.ghosts[i];
      p.ghostGlow[i].uniforms.uDraw.value.copy(mat.uniforms.uDraw.value);
    });
  });

  const co = crowdOpacity(frame);
  const red = useMemo(() => new THREE.Color('#FF3B30'), []);
  const gold = useMemo(() => new THREE.Color(COLORS.goldLight), []);

  return (
    <>
      {parts.gridGeos.map((g, i) => (
        <mesh key={`g${i}`} geometry={g} material={parts.grid.mat} frustumCulled={false} renderOrder={1} />
      ))}
      {parts.ghostGeos.map((g, i) => (
        <React.Fragment key={`gh${i}`}>
          <mesh geometry={g} material={parts.ghostGlow[i].mat} frustumCulled={false} renderOrder={1} />
          <mesh geometry={g} material={parts.ghostMats[i].mat} frustumCulled={false} renderOrder={2} />
        </React.Fragment>
      ))}
      <primitive object={parts.pool} />
      <primitive object={parts.wicks} />
      <primitive object={parts.bodies} />
      <mesh geometry={parts.priceGeo} material={parts.price.mat} frustumCulled={false} renderOrder={9} />
      {co > 0.003 ? (
        <>
          <Orb pos={crowdPos(frame, 'crowd')} color={red} opacity={co} scale={5.5} pulse={0} heat={1.1} />
          <Orb pos={crowdPos(frame, 'wise')} color={gold} opacity={co} scale={5.5} pulse={0} heat={1.1} />
        </>
      ) : null}
    </>
  );
};
