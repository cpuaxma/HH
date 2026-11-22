import {MUSIC, NO_HUD, SCENE_ORDER, SCENES, TRANSITION, TRANSITIONS_IN, VIDEO, CAPTION} from '../config';

export type SceneName = (typeof SCENE_ORDER)[number];
export type TransitionType = 'none' | 'flame' | 'whip';

export type SceneTiming = {
  name: SceneName;
  index: number;
  cut: number; // global frame where this scene "owns" the screen
  duration: number; // frames until the next cut
  head: number; // frames rendered before the cut (incoming transition half)
  tail: number; // frames rendered after the next cut (outgoing transition half)
  inType: TransitionType;
  outType: TransitionType;
  inFrames: number; // full length of the incoming transition
  outFrames: number;
};

export const BEAT_FRAMES = (VIDEO.fps * 60) / MUSIC.bpm;

const snap = (f: number) =>
  MUSIC.snapCutsToBeat
    ? Math.round(Math.round((f - MUSIC.firstBeatFrame) / BEAT_FRAMES) * BEAT_FRAMES + MUSIC.firstBeatFrame)
    : f;

const transFrames = (t: TransitionType) =>
  t === 'whip' ? TRANSITION.whipFrames : t === 'flame' ? TRANSITION.flameFrames : 0;

const buildTimeline = () => {
  const raw = SCENE_ORDER.map((n) => SCENES[n].duration as number);
  const total = raw.reduce((a, b) => a + b, 0);
  // Cut positions: cumulative durations, each snapped to the nearest beat.
  const cuts: number[] = [0];
  let acc = 0;
  for (let i = 0; i < raw.length - 1; i++) {
    acc += raw[i];
    const c = Math.max(cuts[i] + 1, Math.min(total - 1, snap(acc)));
    cuts.push(c);
  }
  cuts.push(total);

  const scenes: SceneTiming[] = SCENE_ORDER.map((name, i) => {
    const inType = TRANSITIONS_IN[name];
    const next = SCENE_ORDER[i + 1];
    const outType = next ? TRANSITIONS_IN[next] : 'none';
    const inFrames = i === 0 ? 0 : transFrames(inType);
    const outFrames = next ? transFrames(outType) : 0;
    return {
      name,
      index: i,
      cut: cuts[i],
      duration: cuts[i + 1] - cuts[i],
      head: Math.floor(inFrames / 2),
      tail: Math.ceil(outFrames / 2),
      inType: i === 0 ? 'none' : inType,
      outType,
      inFrames,
      outFrames,
    };
  });
  return {scenes, total};
};

export const TIMELINE = buildTimeline();
export const TOTAL_FRAMES = TIMELINE.total;
export const sceneByName = (n: SceneName) => TIMELINE.scenes.find((s) => s.name === n)!;

/** Global frame range where the HUD (clock + logo mark) is visible. */
export const HUD_SCENES = TIMELINE.scenes.filter((s) => !NO_HUD.includes(s.name));

// Startup sanity checks (printed in Studio / render logs).
for (const s of TIMELINE.scenes) {
  const conf = SCENES[s.name] as {captionAt?: number};
  if (conf.captionAt !== undefined && s.duration - conf.captionAt < CAPTION.minHoldFrames + 6) {
    console.warn(`[config] Caption in "${s.name}" is on screen < 1.2 s. Lower captionAt or lengthen the scene.`);
  }
}
