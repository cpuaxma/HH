export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 60;
export const DURATION = 600;

// Sampled from the poster.
export const NAVY = '#0F177C';
export const PAPER = '#FAF8F3';
export const CHROMA_GREEN = '#00FF00';

export type Backdrop = 'paper' | 'transparent' | 'green';

// ---------------------------------------------------------------- music grid
// 120 BPM at 60fps = one beat every 30 frames; first big hit on frame 12.
export const BPM = 120;
export const FIRST_HIT = 12;
export const BEAT = (60 * FPS) / BPM;
export const beat = (n: number) => FIRST_HIT + n * BEAT;

// ---------------------------------------------------------------- layout
// Everything is drawn in poster pixel units (the source is 736x863) and scaled by S.
export const POSTER_W = 736;
export const S = 1.85;
const POSTER_CENTER_X = 390;
export const GROUP_LEFT = WIDTH / 2 - POSTER_CENTER_X * S;

// Each band of the poster gets its own vertical slot so the 9:16 frame breathes.
export const BANDS = {
	headline: {y0: 24, y1: 133, top: 156},
	character: {y0: 126, y1: 650, top: 394},
	title: {y0: 646, y1: 794, top: 1390},
} as const;
export type Band = keyof typeof BANDS;

export const TAGLINE = 'THE COOKIE PLUG';
export const TAGLINE_TOP = 1690;
export const TAGLINE_SIZE = 64;
