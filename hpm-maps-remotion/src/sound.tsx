// The sound design as data: which effect plays when, and how loud. Every cue is derived from
// the same timings as the visuals, so moving a stop or retiming a scene moves its sounds too.
// The effects are synthesised by scripts/make-sfx.py (original, no sound library samples).
// Kept soft and sparse so it sits under the music added in Instagram.
import {Audio} from '@remotion/media';
import {Easing, Sequence, staticFile} from 'remotion';
import {BUSINESSES, COPY, TIMING, arrivalFrame, travelStartFrame} from './data';
import {getFinalePins} from './lib/finalePins';
import {makeRandom} from './lib/random';
import {headS} from './lib/timeline';
import {DROP_LEN, DROP_START, wordFrame} from './ui/Hook';
import {CARD, ratingAt} from './ui/PlaceCard';

/** Overall level of the effects (0–1). Each cue's volume is multiplied by this. */
export const SFX_MASTER = 0.9;

export type SoundCue = {at: number; sfx: string; volume: number};

const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

export const getCues = (): SoundCue[] => {
  const cues: SoundCue[] = [];

  // Hook: the pin's bounces (where Easing.bounce touches down), then a tick per headline word.
  [1 / 2.75, 2 / 2.75, 2.5 / 2.75, 1].forEach((t, i) => {
    cues.push(cue(DROP_START + DROP_LEN * t, 'thunk', [0.9, 0.45, 0.25, 0.12][i]));
  });
  COPY.hook.split(' ').forEach((_, i) => cues.push(cue(wordFrame(i), 'word', 0.22)));

  // Dive into the city.
  cues.push(cue(TIMING.hookEnd, 'dive', 0.6));

  BUSINESSES.forEach((b, i) => {
    const a = arrivalFrame(i);
    cues.push(cue(travelStartFrame(i), 'swipe', 0.35));
    cues.push(cue(a - 10, `pop-${i + 1}`, 0.7));
    // A tick each time the rating on the card steps up by 0.1, on a rising scale.
    let step = 0;
    for (let rel = CARD.countFrom; rel <= CARD.countTo; rel++) {
      if (ratingAt(b, rel).shown.toFixed(1) !== ratingAt(b, rel - 1).shown.toFixed(1)) {
        cues.push(cue(a + rel, `tick-${Math.min(12, step++)}`, 0.32));
      }
    }
    cues.push(cue(a + CARD.chipAt, 'bloop', 0.45));
    cues.push(cue(a + CARD.countTo, 'ding', 0.42));
  });

  // Finale: tiny pips as the pins rain in, then the pepper closes (click on the frame it
  // completes) and the glow shimmers along it.
  const rnd = makeRandom(7);
  for (const p of getFinalePins()) cues.push(cue(p.start, `pip-${rnd.int(0, 3)}`, 0.2));
  cues.push(cue(TIMING.routeComplete - 18, 'close', 0.7));
  cues.push(cue(TIMING.routeComplete + 2, 'shimmer', 0.5));

  // End card: the logo lands, then the "DM US" button.
  cues.push(cue(TIMING.endCardStart + 26, 'whomp', 0.75));
  cues.push(cue(TIMING.endCardStart + 70, 'tap', 0.6));

  return cues;
};

/** The pen-on-paper hum follows how fast the route head is drawing. */
const humVolume = (frame: number) => {
  const speed = Math.abs(headS(frame + 1) - headS(frame));
  return SFX_MASTER * 0.42 * Easing.out(Easing.quad)(Math.min(1, speed / 10));
};

export const SoundTrack: React.FC = () => {
  const cues = getCues();
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER} />
        </Sequence>
      ))}
      <Sequence
        from={TIMING.routeStart}
        durationInFrames={TIMING.routeComplete + 6 - TIMING.routeStart}
        layout="none"
        name="sfx hum"
      >
        <Audio src={staticFile('sfx/hum.wav')} loop volume={(f) => humVolume(TIMING.routeStart + f)} />
      </Sequence>
    </>
  );
};
