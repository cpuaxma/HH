// TRAP · no stop-loss: tiles crack under pillars, give way like trapdoors, and the pillars drop straight down.
import {EASE, prog, rnd, springAt} from '../../lib/anim';
import {N} from '../grid';
import {fallAway} from '../fall';
import {spread} from '../select';
import type {Mechanism} from '../types';

type D = {crack: number[]; open: number[]; spinDir: number[]};

export const CRACK_TIME = 13; // frames from first crack to the floor giving way

export const crack: Mechanism<D> = {
  id: 'crack',
  priority: 5,
  select: (pool, count, ctx) => {
    const inner = pool.filter((c) => c.c > 0 && c.c < N - 1 && c.r > 0 && c.r < N - 1);
    const picked = spread(inner.length >= count ? inner : pool, count, `${ctx.seed}-crack`);
    // A cascade that sweeps from the far side toward the camera.
    return picked.sort((a, b) => a.z + rnd(`${ctx.seed}-cz-${a.i}`) * 1.2 - (b.z + rnd(`${ctx.seed}-cz-${b.i}`) * 1.2));
  },
  prepare: (victims, ctx) => {
    const crackT = victims.map((_, k) => 8 + k * 3.2 + rnd(`${ctx.seed}-ct-${k}`) * 2.5);
    const open = crackT.map((c) => c + CRACK_TIME);
    return {
      victims: victims.map((c) => c.i),
      death: open,
      data: {crack: crackT, open, spinDir: victims.map((_, k) => rnd(`${ctx.seed}-sd-${k}`) * Math.PI * 2)},
    };
  },
  pillar: (p, k, t, out) => {
    const c0 = p.data.crack[k];
    const o = p.data.open[k];
    if (t < o) {
      const a = prog(t, c0, o);
      const j = a * a * 0.018;
      out.x += Math.sin(t * 2.7 + k) * j;
      out.z += Math.cos(t * 3.1 + k) * j;
      out.crack = 0.6 * EASE.in(a);
      return;
    }
    const d = p.data.spinDir[k];
    fallAway(out, t - o, {x: out.x, y: 0, z: out.z, vx: 0, vy: -0.015, vz: 0, spin: 0.018, dirX: Math.cos(d), dirZ: Math.sin(d), g: 0.014});
  },
  tile: (p, cell, t, out) => {
    const k = p.victims.indexOf(cell.i);
    const c0 = p.data.crack[k];
    const o = p.data.open[k];
    out.dead = Math.max(out.dead, EASE.out(prog(t, c0, c0 + 9)));
    out.flash = Math.max(out.flash, prog(t, c0, c0 + 4) * (1 - prog(t, o, o + 18)));
    out.shake = t > c0 && t < o + 2 ? prog(t, c0, o) : 0;
    out.glow *= 1 - prog(t, c0, c0 + 8);
    // Swinging trapdoor: snaps open, overshoots, settles hanging.
    out.hinge = 1.25 * springAt(t, o, 0.42, 0.32);
  },
};
