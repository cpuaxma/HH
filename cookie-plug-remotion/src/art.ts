import data from './art/layers.json';

export type TracedLayer = {d: string; subpaths: string[]; bbox: [number, number, number, number]};

export const LAYERS = data.layers as unknown as Record<string, TracedLayer>;
export const FILLS = data.fills as Record<'hat_fill' | 'panel_fill', string>;
export const COOKIE_CENTERS = data.cookieCenters as [number, number][];

export const letters = (word: string) =>
	Object.keys(LAYERS)
		.filter((k) => k.startsWith(word + '_'))
		.sort((a, b) => Number(a.split('_')[1]) - Number(b.split('_')[1]))
		.map((k) => LAYERS[k]);

export const bboxCenter = (l: TracedLayer): [number, number] => [
	(l.bbox[0] + l.bbox[2]) / 2,
	(l.bbox[1] + l.bbox[3]) / 2,
];

/** Union bbox of several layers. */
export const unionBox = (ls: TracedLayer[]): [number, number, number, number] => [
	Math.min(...ls.map((l) => l.bbox[0])),
	Math.min(...ls.map((l) => l.bbox[1])),
	Math.max(...ls.map((l) => l.bbox[2])),
	Math.max(...ls.map((l) => l.bbox[3])),
];

// Pivots (poster units) measured off the drawing.
export const PIVOTS = {
	hinge: [351.5, 440] as [number, number], // where the left coat half meets the torso
	shoulder: [462, 306] as [number, number], // right coat flap
	neck: [400, 298] as [number, number],
	feet: [415, 646] as [number, number],
	hatCenter: [393, 160] as [number, number],
	hatTipPivot: [470, 176] as [number, number],
	rightHeel: [455, 642] as [number, number],
};
