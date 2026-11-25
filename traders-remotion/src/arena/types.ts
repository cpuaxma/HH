import type {MechanismId} from '../config';
import type {Cell} from './grid';

/** Everything the pillar shader + instance matrix needs for one pillar on one frame. */
export type PillarState = {
  x: number;
  y: number;
  z: number;
  /** Orientation quaternion. */
  qx: number;
  qy: number;
  qz: number;
  qw: number;
  sx: number;
  sy: number;
  sz: number;
  glow: number; // gold emissive
  red: number; // 0..1 loss red
  crack: number; // 0..1 glowing red cracks
  dissolve: number; // 0..1 noise dissolve (1 = gone)
  grey: number; // 0..1 drained to grey (rumour)
  heat: number; // white-hot flash
  reflect: number; // strength of its reflection on the glass
};

export type TileState = {
  x: number;
  y: number;
  z: number;
  /** Tilt of the whole tile about an axis through `pivot` (lever). */
  rz: number;
  rx: number;
  pivotX: number;
  pivotY: number;
  /** Trapdoor: each half hinges down about its outer edge (radians). */
  hinge: number;
  glow: number; // gold rim
  dead: number; // 0..1 cracked + darkened
  flash: number; // red crack flash
  opacity: number;
  ripple: number; // whisper ripple
  shake: number;
};

export type Ctx = {
  /** Frames available to the trap. */
  len: number;
  /** Seed prefix for deterministic randomness. */
  seed: string;
  /** Cells whose pillar is still standing when this trap starts (its own victims included). */
  standing: Set<number>;
};

/** Per-trap planned data: the victims (ordered) and whatever the mechanism needs to animate them. */
export type Prepared<T = unknown> = {
  victims: number[];
  /** Local frame at which each victim stops "standing" (the counter drops at that frame). */
  death: number[];
  data: T;
};

export interface Mechanism<T = unknown> {
  id: MechanismId;
  /** Lower plans first. Geometry-hungry mechanisms plan first; the last one takes the leftovers. */
  priority: number;
  /** Cells this mechanism needs to own outright (no survivors may stand there). */
  reserve?: (count: number) => number[];
  /** Pick `count` victims (ordered) from the pool of still-unassigned, non-survivor cells. */
  select: (pool: Cell[], count: number, ctx: Ctx, reserved: number[]) => Cell[];
  prepare: (victims: Cell[], ctx: Ctx) => Prepared<T>;
  /** Pose victim k at local frame t (t may be < 0 or ≫ len). Starts from its idle state in `out`. */
  pillar: (p: Prepared<T>, k: number, t: number, out: PillarState) => void;
  /** Tile of victim k (or any reserved tile) at local frame t. */
  tile?: (p: Prepared<T>, cell: Cell, t: number, out: TileState) => void;
}
