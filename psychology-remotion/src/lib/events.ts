/**
 * Every "new visual event" in the video, derived from config.ts (so it never drifts from the
 * actual cues). Used by `npm run events` to plot event density and check the 1.5 s rule.
 */
import {BURSTS, CUES, IMPACTS, RIDE_LABELS, SCENES} from '../config';
import {BEAT_FRAMES} from './director';

export type VisualEvent = {frame: number; label: string};

export const visualEvents = (): VisualEvent[] => {
  const e: VisualEvent[] = [];
  const add = (frame: number, label: string) => e.push({frame, label});
  for (const [k, s] of Object.entries(SCENES)) add(s.from, `scene: ${k}`);
  const c = CUES;
  add(c.coldOpen.slam, '«ذعر» slams in');
  add(c.coldOpen.text, 'caption');
  add(c.coldOpen.glitch, 'glitch burst + alarm hit');
  add(c.coldOpen.wordExit, '«ذعر» glitches out');
  add(c.coldOpen.tapeStop, 'tape stop');
  for (let i = 0; i < 8; i++) add(c.rewind.labelsFrom + i * c.rewind.labelEvery, 'reverse label flash');
  add(c.rewind.text, 'caption');
  add(c.rewind.land, 'rewind lands');
  add(c.question.text1, 'caption 1');
  add(c.question.text2, 'caption 2');
  add(c.question.shine, 'shine sweep');
  for (const l of RIDE_LABELS) add(l.at, `emotion: ${l.stage}`);
  add(c.ride.peakArrive, 'summit');
  add(c.ride.tiltDown[0], 'tilt down');
  add(c.ride.peakCallout, 'callout');
  add(c.ride.peakTag, 'red tag');
  add(c.ride.dropStart, 'tip over');
  add(c.ride.impact, 'drop impact');
  add(c.ride.bottomArrive, 'bottom');
  add(c.ride.bottomCallout, 'callout');
  add(c.ride.bottomTag, 'gold tag');
  add(c.ride.hopeRay, 'light ray');
  // at the near-silent bottom each slow heartbeat visibly pulses the orb (bigger pulse there)
  for (const b of BEAT_FRAMES) if (b >= c.ride.bottomArrive && b < c.ride.hopeRay) add(b, 'heartbeat pulse');
  for (const b of BURSTS) add(b.from, `${b.kind} burst`);
  for (const i of IMPACTS) add(i.frame, 'impact');
  add(c.reveal.pullBack[0], 'pull back');
  add(c.reveal.text1, 'caption');
  add(c.reveal.draw[0], 'price line draws');
  add(c.reveal.text2, 'caption');
  for (const g of c.reveal.ghosts) add(g, 'cycle repeats');
  add(c.crowd.orbsIn, 'replay orbs');
  add(c.crowd.run[1], 'pins at the peak');
  add(c.crowd.text1, 'caption');
  add(c.crowd.run[2], 'pins at the bottom');
  add(c.crowd.text2, 'caption');
  add(c.crowd.text2 + 14, 'shine sweep');
  add(c.crowd.run[3], 'replay orbs finish');
  add(c.quote.morph[0], 'line calms into a wave');
  add(c.quote.text1, 'quote line 1');
  add(c.quote.text2, 'quote line 2');
  add(c.quote.attribution, 'attribution');
  for (const p of c.quote.pulses) add(p, 'light pulse');
  add(c.lesson.morph[0], 'heartbeat line');
  add(c.lesson.text1, 'caption');
  add(c.lesson.text2, 'caption');
  add(c.lesson.shine, 'shine sweep');
  add(c.cta.coil[0], 'line coils');
  add(c.cta.logo, 'logo');
  for (const s of c.cta.logoShine) add(s, 'logo shine');
  add(c.cta.text, 'CTA');
  for (const s of c.cta.textShine) add(s, 'CTA shine');
  add(c.cta.footnote, 'footnote');
  for (const p of c.cta.pulses) add(p, 'light pulse');
  return e.sort((a, b) => a.frame - b.frame);
};
