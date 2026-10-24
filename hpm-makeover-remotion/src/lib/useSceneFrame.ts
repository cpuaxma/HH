import {useCurrentFrame} from 'remotion';

// Inside a <Sequence>, returns the absolute composition frame so every cue in
// timeline.ts can stay absolute.
export const useSceneFrame = (from: number) => useCurrentFrame() + from;
