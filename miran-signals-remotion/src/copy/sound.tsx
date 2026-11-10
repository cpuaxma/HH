// The copy trading reel's sound design: the same synthesised effects as the signals reel
// (public/sfx, made by scripts/make-sfx.py), cued from this reel's timings (src/copy/data.ts),
// so retiming a beat moves its sound. No voiceover in the mix.
import {Audio} from '@remotion/media';
import {Sequence, staticFile} from 'remotion';
import {SFX_MASTER, SoundCue} from '../sound';
import {PLACEHOLDERS, T} from './data';
import {PAGES, lossValue, ratioValue} from './story';

const cue = (at: number, sfx: string, volume: number): SoundCue => ({at: Math.round(at), sfx, volume});

/** Frames where a slider's shown value steps (a soft tick each time, at most one every 3 frames). */
const steps = (grab: number, release: number, value: (t: number) => {shown: number}) => {
  const out: number[] = [];
  let last = value(grab).shown;
  let lastAt = -10;
  for (let f = grab; f <= release; f++) {
    const v = value(f).shown;
    if (Math.abs(v - last) > 1e-6) {
      if (f - lastAt >= 3) {
        out.push(f);
        lastAt = f;
      }
      last = v;
    }
  }
  return out;
};

export const getCopyCues = (): SoundCue[] => {
  const c: SoundCue[] = [];
  // Hook: the phone rises, the question lands, the copies travel to the account.
  c.push(cue(0, 'swish', 0.32));
  c.push(cue(T.questionAt + 8, 'thock', 0.3));
  c.push(cue(T.questionAt + 15, 'thock', 0.22));
  c.push(cue(T.diagramAt, 'signal', 0.3));
  for (let k = 0; k < 6; k++) c.push(cue(T.diagramAt + 36 + k * 34 + 30, `chime-${k}`, 0.18));

  // Each new page: a soft swish.
  PAGES.slice(1).forEach((p) => c.push(cue(p.at - 8, 'swish', 0.2)));

  // Connect: tap, linking ticks, linked.
  c.push(cue(T.connectTapAt, 'tap', 0.45));
  for (let f = T.connectTapAt + 14; f < T.linkedAt - 6; f += 16) c.push(cue(f, 'gtick-0', 0.16));
  c.push(cue(T.linkedAt, 'gtick-2', 0.42));
  c.push(cue(T.linkedAt + 4, 'glint', 0.32));

  // Settings: grab, slider ticks, the switch, save.
  c.push(cue(T.ratioGrab, 'tap', 0.3));
  steps(T.ratioGrab, T.ratioRelease, ratioValue).forEach((f) => c.push(cue(f, 'gtick-1', 0.1)));
  c.push(cue(T.lossGrab, 'tap', 0.3));
  steps(T.lossGrab, T.lossRelease, lossValue).forEach((f) => c.push(cue(f, 'gtick-1', 0.1)));
  c.push(cue(T.saveTapAt, 'tap', 0.45));
  c.push(cue(T.saveTapAt + 6, 'tp', 0.38));

  // Automatic copy on.
  c.push(cue(T.autoOnAt - 2, 'tap', 0.5));
  c.push(cue(T.autoOnAt + 4, 'gtick-2', 0.45));
  c.push(cue(T.autoOnAt + 10, 'glint', 0.42));

  // The signal builds line by line, then it is copied.
  c.push(cue(T.signalAt - 4, 'signal', 0.36));
  for (let i = 0; i < 6; i++) c.push(cue(T.signalAt + i * 8, `chime-${i}`, 0.2));
  c.push(cue(T.copiedAt, 'gtick-0', 0.48));
  c.push(cue(T.copiedAt + 6, 'notif-left', 0.22));

  // The news alert, the close by plan, then the release.
  c.push(cue(T.alertAt - 6, 'update', 0.52));
  c.push(cue(T.alertAt + 40, 'heartbeat', 0.36));
  c.push(cue(T.closedAt, 'tp', 0.5));
  c.push(cue(T.newsAt, 'subdrop', 0.55));
  c.push(cue(T.newsAt + 1, 'hit', 0.3));
  c.push(cue(T.newsAt + 8, 'shield', 0.45));

  // In control: off, then on again; then the loss limit, withdraw / deposit (yours only), the history.
  c.push(cue(T.controlAt + 10, 'thock', 0.24));
  c.push(cue(T.pauseTapAt - 2, 'tap', 0.5));
  c.push(cue(T.pauseTapAt + 4, 'thock', 0.34));
  c.push(cue(T.resumeTapAt - 2, 'tap', 0.5));
  c.push(cue(T.resumeTapAt + 4, 'gtick-1', 0.42));
  c.push(cue(T.limitCardAt + 4, 'thock', 0.26));
  c.push(cue(T.accessCardAt + 4, 'thock', 0.26));
  c.push(cue(T.accessCardAt + 16, 'shield', 0.36));
  c.push(cue(T.historyCardAt + 4, 'thock', 0.26));
  c.push(cue(T.historyCardAt + 14, 'gtick-0', 0.24));

  // End card.
  c.push(cue(T.endCardStart - 10, 'whoosh-metal', 0.4));
  c.push(cue(T.logoAt, 'logo', 0.72));
  c.push(cue(T.tapAt, 'tap', 0.55));
  void PLACEHOLDERS;
  return c.filter((q) => q.at >= 0).sort((a, b) => a.at - b.at);
};

export const CopySoundTrack: React.FC = () => (
  <>
    {getCopyCues().map((c, i) => (
      <Sequence key={i} from={c.at} layout="none" name={`sfx ${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume * SFX_MASTER} />
      </Sequence>
    ))}
  </>
);
