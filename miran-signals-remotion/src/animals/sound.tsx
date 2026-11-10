// The animals reel's sound design: the same synthesised effects as the other Miran Gold
// reels (public/sfx, made by scripts/make-sfx.py), cued from this reel's timings
// (src/animals/data.ts), so retiming a beat moves its sound. No voiceover in the mix.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {SFX_MASTER, SoundCue} from '../sound';
import {T} from './data';
import {WHALE_CANDLE, reelFrameOfChart} from './story';

const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

/** Rising (or falling) soft chimes spread over a chart move. */
const run = (c: SoundCue[], from: number, to: number, up: boolean, volume: number) => {
  const n = 6;
  for (let i = 0; i < n; i++) c.push(cue(from + ((to - from) * i) / (n - 1), `chime-${up ? i : n - 1 - i}`, volume));
};

export const getAnimalsCues = (): SoundCue[] => {
  const c: SoundCue[] = [];
  // Hook: the question lands, the bull and the bear push at each other.
  c.push(cue(0, 'swish', 0.3));
  c.push(cue(T.hookTitleIn + 8, 'thock', 0.3));
  c.push(cue(30, 'heartbeat', 0.32));
  T.faceoffPush.forEach((at) => {
    c.push(cue(at + 8, 'hit', 0.22));
    c.push(cue(at + 9, 'thock', 0.3));
  });

  // Through the floor: a low metal whoosh each time an animal goes down or comes up.
  for (const at of [T.bullAt - 34, T.bearAt - 24, T.bearAt + 20, T.whaleAt - 26]) c.push(cue(at, 'whoosh-metal', 0.22));

  // The bull: the label, two horn thrusts, the chart climbs.
  c.push(cue(T.bullLabel + 6, 'thock', 0.26));
  T.bullThrust.forEach((at, i) => {
    c.push(cue(at, 'impact', 0.32 - 0.06 * i));
    c.push(cue(at + 4, 'glint', 0.26));
  });
  run(c, T.bullThrust[0] + 14, T.bullThrust[1] + 50, true, 0.16);

  // The bear: the label, the paw goes up, the swipe, the chart drops.
  c.push(cue(T.bearLabel + 6, 'thock', 0.26));
  c.push(cue(T.bearRaise, 'swish', 0.3));
  c.push(cue(T.bearSwipe + 4, 'swish', 0.4));
  c.push(cue(T.bearSwipe + 9, 'hit', 0.42));
  c.push(cue(T.bearSwipe + 10, 'subdrop', 0.4));
  run(c, T.bearSwipe + 20, T.bearSwipe + 110, false, 0.13);

  // The whale: it surfaces, then one big candle.
  c.push(cue(T.whaleSurface - 6, 'subdrop', 0.5));
  c.push(cue(T.whaleSurface + 4, 'whoosh-metal', 0.32));
  c.push(cue(T.whaleLabel + 6, 'thock', 0.26));
  const candleStart = reelFrameOfChart(WHALE_CANDLE.start);
  const candleEnd = reelFrameOfChart(WHALE_CANDLE.end - 2);
  c.push(cue(candleStart, 'signal', 0.32));
  c.push(cue(candleEnd, 'impact', 0.42));
  c.push(cue(candleEnd + 3, 'tp', 0.34));
  c.push(cue(T.whaleDive, 'whoosh-metal', 0.24));

  // The hawk: the dive, the strike, the chart dips.
  c.push(cue(T.hawkDive + 4, 'whoosh-metal', 0.48));
  c.push(cue(T.hawkLabel + 6, 'thock', 0.26));
  c.push(cue(T.hawkStrike, 'hit', 0.34));
  c.push(cue(T.hawkStrike + 2, 'swish', 0.36));
  run(c, T.hawkStrike + 20, T.hawkStrike + 90, false, 0.12);
  c.push(cue(T.noteIn + 6, 'thock', 0.2));

  // The dove: wingbeats up, the chart lifts.
  c.push(cue(T.doveRise, 'swish', 0.3));
  c.push(cue(T.doveRise + 22, 'swish', 0.22));
  c.push(cue(T.doveLabel + 6, 'thock', 0.26));
  c.push(cue(T.doveLift, 'shield', 0.34));
  run(c, T.doveLift + 10, T.doveLift + 90, true, 0.14);

  // Tie-in: the phone comes up, the Miran Gold news alert.
  c.push(cue(T.phoneAt, 'whoosh-metal', 0.26));
  c.push(cue(T.phoneAt + 40, 'gtick-1', 0.3));
  c.push(cue(T.alertAt - 6, 'update', 0.52));
  c.push(cue(T.alertAt + 30, 'notif-left', 0.24));
  c.push(cue(T.alertAt + 60, 'heartbeat', 0.3));

  // End card.
  c.push(cue(T.endCardStart - 10, 'whoosh-metal', 0.4));
  c.push(cue(T.logoAt, 'logo', 0.72));
  c.push(cue(T.tapAt, 'tap', 0.55));
  return c.filter((q) => q.at >= 0 && q.at < T.durationInFrames).sort((a, b) => a.at - b.at);
};

export const AnimalsSoundTrack: React.FC = () => (
  <>
    {getAnimalsCues().map((c, i) => (
      <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER} />
      </Sequence>
    ))}
  </>
);
