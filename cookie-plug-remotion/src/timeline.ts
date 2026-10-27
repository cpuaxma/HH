import {beat} from './theme';

// Every key moment, locked to the 120 BPM grid (beat(n) = 12 + 30n). Half-beats are 15 frames.
export const T = {
	// 1 — Hook
	supportImpact: beat(0), // 12
	yourImpact: beat(0.5), // 27
	localImpact: beat(1), // 42

	// 2 — Draw-on + hat
	draw: {
		head: [48, 78],
		brows: [56, 76],
		glasses: [58, 84],
		body: [64, 108],
		flap: [72, 112],
		coatBack: [78, 116],
		shoes: [90, 118],
	} as Record<string, [number, number]>,
	hatLand: beat(4), // 132

	// 3 — Shades
	glassesDown: beat(5), // 162
	eyeDarts: [beat(5.5), beat(6), beat(6.5), beat(7)], // 177 192 207 222
	glassesUp: beat(7.5) - 3, // 234
	glint: [232, 258] as [number, number],
	focusFace: [[144, 180], [224, 250]] as [[number, number], [number, number]], // camera leans in, then lets go
	focusCookies: [[262, 304], [338, 368]] as [[number, number], [number, number]],

	// 4 — Coat + cookies
	coatYank: beat(8), // 252
	cookiesStart: beat(8) + 6, // 258, then every 3 frames
	cookieStagger: 3,
	present: beat(10), // 312
	peek: [beat(10.5), beat(11.5)] as [number, number], // 327–357: peeks over the shades at camera
	browRaise: beat(11), // 342

	// 5 — Title slams
	cookieImpact: beat(12), // 372
	dealerImpact: beat(13), // 402
	shoeTap: beat(14), // 432

	// 6 — End card
	typeStart: 444,
	typeStagger: 3,
	hatTip: beat(16), // 492
	cursorOut: [522, 536] as [number, number],
	pushEnd: 576,
};

/** Windows with fast motion; only these pay for motion-blur sub-frames (slow frames gain nothing). */
export const FAST_WINDOWS: [number, number][] = [
	[0, 64], // hook slams
	[110, 144], // hat drop
	[240, 332], // coat yank, cookie pops, present wiggle
	[352, 446], // title slams, flinch, shoe tap
	[476, 508], // nod + hat tip
];
export const isFast = (f: number) => FAST_WINDOWS.some(([a, b]) => f >= a && f <= b);
