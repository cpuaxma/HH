// Absolute frame ranges [from, to). The overlaps between scenes are intentional.
export const SCENES = {
  hook: [0, 180],
  oneTeam: [170, 390],
  services: [380, 1200],
  process: [1190, 1440],
  cta: [1430, 1800],
} as const;

// Services: four beats, each overlapping the next by 15 frames.
export const BEAT_STEP = 205;
export const BEAT_EXIT = 190; // local frame within a beat where its cards leave
export const beatStart = (i: number) => SCENES.services[0] + i * BEAT_STEP;

// Process words land this many frames apart.
export const PROCESS_STEP = 22;
export const PROCESS_FIRST = 20;

// The red line floods the frame at the start of the CTA.
export const FLOOD_START = SCENES.cta[0];
export const FLOOD_DURATION = 18;

export const range = ([from, to]: readonly [number, number]) => ({from, durationInFrames: to - from});
