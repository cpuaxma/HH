// The finish over everything: a very soft warm vignette and a very subtle film grain.
// The grain is four pre-made noise frames (scripts/make-grain.py), picked and offset per frame.
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {LOOK} from '../data';
import {hash1} from '../lib/ease';

export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f) % 4;
  const ox = -Math.floor(hash1(f * 1.7) * 64);
  const oy = -Math.floor(hash1(f * 3.1 + 5) * 64);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 90% 75% at 50% 48%, rgba(0,0,0,0) 58%, rgba(70,42,22,${LOOK.vignette}) 100%)`,
        }}
      />
      <Img
        src={staticFile(`grain/grain-${k}.png`)}
        style={{
          position: 'absolute',
          left: ox,
          top: oy,
          width: 1144,
          height: 1984,
          mixBlendMode: 'overlay',
          opacity: LOOK.grain,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
