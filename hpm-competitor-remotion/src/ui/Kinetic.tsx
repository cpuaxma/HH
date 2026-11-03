// Big kinetic type: each word springs up through a line mask (with a little overshoot and
// a tilt that settles), then the line leaves upwards. Lines that sit over busy screen
// content get an off-white "sticker" block that wipes in behind them.
// Sizes are fitted to the 800px column with @remotion/layout-utils, so nothing clips.
import {fitText} from '@remotion/layout-utils';
import {useCurrentFrame} from 'remotion';
import {BRAND, COLUMN} from '../data';
import {DISPLAY} from '../fonts';
import {clamp01, easeIn, easeOutQuint, ramp, springAt} from '../lib/ease';

export type KineticProps = {
  lines: string[];
  /** Whole lines (or words) to draw in brand red. */
  accent?: string;
  inAt: number;
  outAt: number;
  top: number;
  maxSize: number;
  backing?: boolean;
  /** Frames between words. */
  stagger?: number;
};

const FONT_WEIGHT = '400';

export const fitSize = (lines: string[], maxSize: number, width: number) =>
  Math.min(
    maxSize,
    ...lines.map((l) => fitText({text: l, withinWidth: width, fontFamily: DISPLAY, fontWeight: FONT_WEIGHT}).fontSize),
  );

/** True while any word of this block is moving (used to switch the DOM motion blur on). */
export const kineticMoving = (f: number, p: Pick<KineticProps, 'lines' | 'inAt' | 'outAt' | 'stagger'>) => {
  const words = p.lines.join(' ').split(' ').length;
  const st = p.stagger ?? 4;
  return (f >= p.inAt - 1 && f <= p.inAt + words * st + 30) || (f >= p.outAt - 16 && f <= p.outAt + 12);
};

export const Kinetic: React.FC<KineticProps> = ({lines, accent, inAt, outAt, top, maxSize, backing, stagger = 4}) => {
  const frame = useCurrentFrame();
  if (frame < inAt - 6 || frame > outAt + 14) return null;
  const padX = backing ? 26 : 0;
  const size = fitSize(lines, maxSize, COLUMN.width - 2 * padX - 8);
  const lineH = size * 1.06;
  let wordIndex = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: backing ? 10 : 0,
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: `${lineH}px`,
        letterSpacing: -size * 0.025,
        color: BRAND.ink,
      }}
    >
      {lines.map((line, li) => {
        const words = line.split(' ');
        const isAccentLine = accent !== undefined && line === accent;
        // Backing block: wipes in from the left before the words, out to the right after.
        const bIn = ramp(frame, inAt - 6 + li * 5, inAt + 10 + li * 5, easeOutQuint);
        const bOut = ramp(frame, outAt - 4 + li * 2, outAt + 10 + li * 2, easeIn);
        return (
          <div key={li} style={{position: 'relative', padding: backing ? `6px ${padX}px 10px` : '0 0 4px'}}>
            {backing ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 22,
                  background: 'rgba(246,244,240,0.96)',
                  boxShadow: '0 14px 36px rgba(40,25,10,0.16)',
                  transformOrigin: bOut > 0 ? 'right center' : 'left center',
                  transform: `scaleX(${bIn * (1 - bOut)})`,
                }}
              />
            ) : null}
            <div style={{position: 'relative', overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08, whiteSpace: 'nowrap'}}>
              {words.map((w, wi) => {
                const i = wordIndex++;
                const start = inAt + i * stagger;
                const p = springAt(frame - start, {freq: 2.1, damping: 0.52});
                const q = ramp(frame, outAt - 10 + i * 1.5, outAt + 2 + i * 1.5, easeIn);
                const red = isAccentLine || (accent !== undefined && accent.split(' ').includes(w) && line.includes(accent));
                return (
                  <span
                    key={wi}
                    style={{
                      display: 'inline-block',
                      marginRight: wi < words.length - 1 ? '0.24em' : 0,
                      color: red ? BRAND.red : BRAND.ink,
                      opacity: clamp01(p * 2.5) * (1 - q),
                      transform: `translateY(${(1 - p) * lineH * 1.05 - q * lineH * 1.1}px) rotate(${(1 - p) * 7}deg)`,
                      transformOrigin: 'left bottom',
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
