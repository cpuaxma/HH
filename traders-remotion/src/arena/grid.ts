// World units. The grid is 10×10 tiles on the XZ plane, centred on the origin; tile tops sit at y = 0.
// Columns run along +x, rows along +z (row 9 is the edge nearest the default camera, row 0 the far edge).
export const N = 10;
export const COUNT = N * N;
export const SPACING = 1;
export const TILE = 0.9; // tile size (gap = SPACING - TILE)
export const TILE_T = 0.12; // tile thickness
export const HALF = (N * SPACING) / 2; // 5
/** Distance from the grid centre to the outer edge of the outer tiles. */
export const EDGE = (N / 2 - 0.5) * SPACING + TILE / 2; // 4.95

export const PILLAR_R = 0.24;
export const PILLAR_H = 1.2;
/** Gravity in world units / frame². */
export const G = 0.011;

export type Cell = {i: number; c: number; r: number; x: number; z: number};

export const cellX = (c: number) => (c - (N - 1) / 2) * SPACING;
export const cellZ = (r: number) => (r - (N - 1) / 2) * SPACING;
export const CELLS: Cell[] = Array.from({length: COUNT}, (_, i) => {
  const c = i % N;
  const r = Math.floor(i / N);
  return {i, c, r, x: cellX(c), z: cellZ(r)};
});
export const idx = (c: number, r: number) => r * N + c;
export const dist = (a: Cell, b: Cell) => Math.hypot(a.x - b.x, a.z - b.z);
