/**
 * The Week Ahead template timeline (frames at 60fps, 1 beat = 30f).
 * Every edition reuses these slots; only edition.json changes.
 * Kept free of imports so scripts/export-cues.mjs can load it with plain Node.
 */

export type ShotId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10' | 's11';

export const SHOTS: Record<ShotId, {from: number; to: number}> = {
  s1: {from: 0, to: 180}, // hook
  s2: {from: 180, to: 360}, // card stack
  s3: {from: 360, to: 480}, // 01
  s4: {from: 480, to: 840}, // Wednesday card
  s5: {from: 840, to: 1140}, // cause chain
  s6: {from: 1140, to: 1260}, // 02
  s7: {from: 1260, to: 1620}, // holiday
  s8: {from: 1620, to: 1740}, // 03
  s9: {from: 1740, to: 1980}, // NFP + constellation
  s10: {from: 1980, to: 2100}, // collapse → logo
  s11: {from: 2100, to: 2400}, // outro (EN)
};

/** Scenes overlap: each shot stays on screen this many frames past its slot while the next comes in. */
export const OVERLAP = 10;

/** Captions: [from, to] per caption key in edition.captions. */
export const CAPTIONS: {key: string; from: number; to: number}[] = [
  {key: 's1', from: 24, to: 176},
  {key: 's2', from: 196, to: 356},
  {key: 's3', from: 384, to: 476},
  {key: 's4', from: 500, to: 836},
  {key: 's5a', from: 862, to: 1012},
  {key: 's5b', from: 1022, to: 1136},
  {key: 's6', from: 1164, to: 1256},
  {key: 's7', from: 1284, to: 1616},
  {key: 's8', from: 1644, to: 1736},
  {key: 's9', from: 1764, to: 1976},
  {key: 's10', from: 2000, to: 2094},
];

/** Day strip: which pill is active, and when the gold highlight moves (index 0 = Monday). */
export const STRIP = {
  inAt: 96, // strip drops in during the hook
  moves: [
    {at: 96, to: 0},
    {at: 405, to: 2}, // → Wednesday (passes Tuesday)
    {at: 1185, to: 3}, // → Thursday
    {at: 1380, to: 4}, // → Friday
    {at: 1680, to: 5}, // → peek at the following week
  ],
  holidayStampAt: 1290,
  friClockAt: 1395,
  peekAt: 1680,
  outAt: 1990,
};

/** Persistent UI (wordmark, date pill, disclaimer) leaves for the English outro. */
export const PERSISTENT_OUT = 2090;
