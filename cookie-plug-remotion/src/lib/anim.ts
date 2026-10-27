import {Easing, interpolate, spring, SpringConfig} from 'remotion';
import {FPS} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SNAPPY: Partial<SpringConfig> = {stiffness: 260, damping: 15, mass: 0.9};
export const SLAM: Partial<SpringConfig> = {stiffness: 170, damping: 13, mass: 1};
export const POP: Partial<SpringConfig> = {stiffness: 200, damping: 10, mass: 0.5}; // ~16% overshoot
export const SOFT: Partial<SpringConfig> = {stiffness: 120, damping: 20, mass: 1};

/** Spring that starts at `start` (0 before it). Accepts fractional frames (motion blur). */
export const springAt = (frame: number, start: number, config: Partial<SpringConfig> = SNAPPY) =>
	frame <= start ? 0 : spring({frame: frame - start, fps: FPS, config});

const crossings = new Map<string, number>();
/** Frames until a 0→1 spring first reaches 1 — the "impact" moment. */
export const firstCrossing = (config: Partial<SpringConfig>) => {
	const key = JSON.stringify(config);
	const cached = crossings.get(key);
	if (cached !== undefined) return cached;
	let f = 0;
	while (f < 240 && spring({frame: f, fps: FPS, config}) < 1) f += 0.05;
	crossings.set(key, f);
	return f;
};

/** Spring timed so it first hits its target exactly on `impact` (a beat). */
export const landOn = (frame: number, impact: number, config: Partial<SpringConfig> = SLAM) =>
	springAt(frame, impact - firstCrossing(config), config);

/** Eased tween, clamped. */
export const tween = (
	frame: number,
	[a, b]: [number, number],
	[from, to]: [number, number],
	easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(frame, [a, b], [from, to], {...clamp, easing});

/** Exits always accelerate out. */
export const exit = (frame: number, a: number, b: number) =>
	tween(frame, [a, b], [1, 0], Easing.in(Easing.cubic));

/** Smooth bump that peaks at t=0 with zero slope and decays (camera punches). */
export const punchEnvelope = (t: number, tau = 5) => {
	if (t < -2) return 0;
	if (t < 0) return Easing.out(Easing.quad)((t + 2) / 2);
	return (1 + t / tau) * Math.exp(-t / tau);
};

/** Damped oscillation that kicks at t=0 — used for shakes and wobbles. */
export const ring = (t: number, freq: number, tau: number, phase = 0) =>
	t <= 0 ? 0 : Math.exp(-t / tau) * Math.sin(t * freq + phase);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
