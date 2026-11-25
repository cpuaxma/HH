// Plans the whole massacre once, deterministically: who survives, which trap takes whom,
// and the exact frame each pillar stops standing. Everything else reads from this.
import {COUNTER_STEPS, FINAL_COUNT, START_COUNT, TRAPS, TRAP_FRAMES, type TrapDef} from '../config';
import {EASE, prog} from '../lib/anim';
import {CELLS, COUNT, type Cell} from './grid';
import {MECHANISMS} from './mechanisms';
import {spread} from './select';
import type {Mechanism, Prepared} from './types';

export type PlannedTrap = {
  k: number;
  def: TrapDef;
  mech: Mechanism<any>;
  prepared: Prepared<any>;
  start: number;
  len: number;
  /** Absolute frame of the counter hit (the last victim of this trap goes down). */
  hit: number;
};

const SEED = 'arena-v1';

const build = () => {
  const reserved = new Set<number>();
  TRAPS.forEach((t) => MECHANISMS[t.mechanism].reserve?.(t.remove).forEach((i) => reserved.add(i)));

  // Survivors: an even scatter over the cells nobody else has a claim on.
  const free = CELLS.filter((c) => !reserved.has(c.i));
  const survivors = spread(free, FINAL_COUNT, `${SEED}-survivors`, CELLS[56]).map((c) => c.i);
  const isSurvivor = new Set(survivors);

  // Victims: geometry-hungry mechanisms choose first; the last one takes whoever is left.
  const order = TRAPS.map((def, k) => ({def, k, mech: MECHANISMS[def.mechanism]})).sort((a, b) => a.mech.priority - b.mech.priority || a.k - b.k);
  const assigned = new Map<number, Cell[]>();
  const taken = new Set<number>();
  for (const {def, k, mech} of order) {
    const pool = CELLS.filter((c) => !isSurvivor.has(c.i) && !taken.has(c.i) && (mech.reserve ? true : !reserved.has(c.i)));
    const picked = mech.select(pool, def.remove, {len: 0, seed: `${SEED}-${k}`, standing: new Set()}, [...reserved]);
    if (picked.length !== def.remove) throw new Error(`Trap ${k} (${def.mechanism}) picked ${picked.length}, needs ${def.remove}`);
    picked.forEach((c) => {
      if (taken.has(c.i) || isSurvivor.has(c.i)) throw new Error(`Trap ${k} picked cell ${c.i} twice`);
      taken.add(c.i);
    });
    assigned.set(k, picked);
  }
  if (taken.size + survivors.length !== COUNT) throw new Error('Plan does not cover all 100 pillars');

  const traps: PlannedTrap[] = TRAPS.map((def, k) => {
    const [start, end] = TRAP_FRAMES[k];
    const len = end - start;
    const standing = new Set<number>(survivors);
    for (let j = k; j < TRAPS.length; j++) assigned.get(j)!.forEach((c) => standing.add(c.i));
    const mech = MECHANISMS[def.mechanism];
    const prepared = mech.prepare(assigned.get(k)!, {len, seed: `${SEED}-${k}`, standing});
    const last = Math.max(...prepared.death);
    if (last > len - 10) throw new Error(`Trap ${k} (${def.mechanism}) finishes at ${last.toFixed(1)}, too late for its ${len}-frame slot`);
    return {k, def, mech, prepared, start, len, hit: Math.round(start + last + 1)};
  });

  const trapOf = new Int16Array(COUNT).fill(-1);
  const slot = new Int16Array(COUNT).fill(-1);
  const deathAbs = new Float32Array(COUNT).fill(Infinity);
  traps.forEach((t) =>
    t.prepared.victims.forEach((i, j) => {
      trapOf[i] = t.k;
      slot[i] = j;
      deathAbs[i] = t.start + t.prepared.death[j];
    }),
  );
  return {survivors, isSurvivor, traps, trapOf, slot, deathAbs};
};

export const PLAN = build();

/** Whole number of pillars still standing at a frame. */
export const standingAt = (f: number) => {
  let n = START_COUNT;
  for (let i = 0; i < COUNT; i++) if (PLAN.deathAbs[i] <= f) n--;
  return n;
};

/**
 * The counter's continuous value. Its whole-number part is ALWAYS the number of pillars still
 * standing (so the number you read never disagrees with the arena); the fractional residual
 * (< 0.5) only animates the digits rolling down into place over the 4 frames after each loss.
 */
export const counterValue = (f: number) => {
  let r = 0;
  for (let i = 0; i < COUNT; i++) {
    const d = PLAN.deathAbs[i];
    if (Number.isFinite(d) && f >= d) r += 1 - EASE.out(prog(f, d, d + 4));
  }
  return standingAt(f) + Math.min(0.49, r * 0.49);
};

/** Sanity: after every trap the standing count equals the configured counter step. */
PLAN.traps.forEach((t, k) => {
  const after = standingAt(t.start + t.len);
  if (after !== COUNTER_STEPS[k + 1]) throw new Error(`Counter mismatch after trap ${k}: ${after} ≠ ${COUNTER_STEPS[k + 1]}`);
});

/** How many waves (trap hits) a still-standing pillar has lived through at frame f. */
export const wavesSurvived = (f: number) => PLAN.traps.filter((t) => f >= t.hit).length;
