// Big kinetic type in the top band of the frame (y ≈ 250–520, above the phone):
// "Scroll." ×3, "…wait.", then "Bland gets scrolled." / "Bold gets stopped.".
// Each line slams in on a spring (overshoot and settle) and leaves with an eased lift.
import {useCurrentFrame} from 'remotion';
import {BRAND, COLUMN, COPY, T} from '../data';
import {DISPLAY} from '../fonts';
import {easeIn, lerp, ramp, springAt} from '../lib/ease';
import {inWindows, MotionBlurLayer} from './MotionBlur';

/** Centre of the type band (frame px). */
const BAND_Y = 384;

type Beat = {at: number; out: number; size: number; rotate: number; lines: React.ReactNode[]};

const red = (s: string) => <span style={{color: BRAND.red}}>{s}</span>;
const hot = (s: string) => (
  <span
    style={{
      backgroundImage: `linear-gradient(100deg, ${BRAND.orange}, ${BRAND.glow} 55%, ${BRAND.red})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {s}
  </span>
);

/** "Scroll." → "Scroll" + a red full stop. */
const withRedStop = (s: string) => (s.endsWith('.') ? [s.slice(0, -1), red('.')] : [s]);

const splitTwo = (s: string) => {
  const w = s.split(' ');
  const cut = Math.ceil(w.length / 2);
  return [w.slice(0, cut).join(' '), w.slice(cut).join(' ')];
};

export const BEATS: Beat[] = [
  ...COPY.scrollWords.map((w, i) => ({
    at: T.scrollWordAt[i],
    out: i < COPY.scrollWords.length - 1 ? T.scrollWordAt[i + 1] - 10 : 334,
    size: [196, 196, 214][i] ?? 196,
    rotate: [-3, 2.5, -1.5][i] ?? 0,
    lines: [<>{withRedStop(w)}</>],
  })),
  {
    at: T.waitAt,
    out: 436,
    size: 190,
    rotate: 0,
    lines: [<>{red(COPY.stop.startsWith('…') ? '…' : '')}{COPY.stop.replace(/^…/, '')}</>],
  },
  {
    at: T.contrast1At,
    out: T.contrast2At - 10,
    size: 112,
    rotate: 0,
    lines: splitTwo(COPY.contrast1).map((l) => <span style={{color: '#8C8984'}}>{l}</span>),
  },
  {
    at: T.contrast2At,
    out: T.endStart + 2,
    size: 112,
    rotate: 0,
    lines: (() => {
      const [a, b] = splitTwo(COPY.contrast2);
      const [first, ...rest] = a.split(' ');
      return [
        <>
          {hot(first)} {rest.join(' ')}
        </>,
        <>{b}</>,
      ];
    })(),
  },
];

const BeatView: React.FC<{beat: Beat}> = ({beat}) => {
  const f = useCurrentFrame();
  if (f < beat.at - 0.5 || f > beat.out + 12) return null;
  const pin = springAt(f, beat.at, 0.42, 0.48);
  const op = ramp(f, beat.at, beat.at + 3);
  const out = ramp(f, beat.out, beat.out + 10, easeIn);
  const scale = lerp(1.75, 1, pin) * (1 - 0.06 * out);
  const lh = beat.size * 1.0;
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top: BAND_Y - (lh * beat.lines.length) / 2,
        height: lh * beat.lines.length,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: DISPLAY,
        fontSize: beat.size,
        lineHeight: `${lh}px`,
        letterSpacing: beat.size * -0.02,
        color: BRAND.ink,
        whiteSpace: 'nowrap',
        opacity: op * (1 - out),
        transform: `translateY(${-out * 36}px) rotate(${beat.rotate * (1 - 0.4 * pin)}deg) scale(${scale})`,
      }}
    >
      {beat.lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

const MOVING = inWindows(BEATS.flatMap((b) => [[b.at - 1, b.at + 26] as [number, number], [b.out - 1, b.out + 12] as [number, number]]));

export const KineticType: React.FC = () => (
  <MotionBlurLayer moving={MOVING}>
    {BEATS.map((b, i) => (
      <BeatView key={i} beat={b} />
    ))}
  </MotionBlurLayer>
);
