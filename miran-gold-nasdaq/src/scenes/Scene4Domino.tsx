import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors} from 'remotion';
import {BEATS, COLORS, FONT, LAYOUT, SAFE, TEXT, VIDEO} from '../config';
import {IndexChart} from '../components/Charts';
import {ExampleLabel} from '../components/Chrome';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';
import {FONT_FAMILY} from '../fonts';
import {clamp, EASE, rgba} from '../lib/motion';

/** 17-25s: AI sector under pressure → giants fall → the whole index falls. */
export const Scene4Domino: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.domino;
  const L = LAYOUT.domino;
  const t = TEXT.domino;

  const drop = interpolate(frame, [b.dropFrom, b.dropFrom + b.dropDur], [0, 1], {...clamp, easing: EASE.inOut});
  const value = t.dropTo * drop;
  const shown = Math.abs(value) < 0.05 ? (0).toFixed(t.dropDecimals) : `−${Math.abs(value).toFixed(t.dropDecimals)}`;
  const numberColor = interpolateColors(drop, [0, 0.15], [COLORS.white, COLORS.red]);
  const numberIn = interpolate(frame, [b.chartAt, b.chartAt + 14], [0, 1], {...clamp, easing: EASE.out});

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: L.firstTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal
          lines={t.first}
          frame={frame}
          start={b.firstAt}
          stagger={b.stagger}
          fontSize={L.firstSize}
          fill="white"
          // "الذكاء الاصطناعي" highlighted
          wordFill={(i) => (i === 3 || i === 4 ? 'gold' : undefined)}
          glow={0.35}
        />
      </div>

      <IndexChart frame={frame} appearAt={b.chartAt} dropFrom={b.dropFrom} dropDur={b.dropDur} />

      {/* the falling percentage, top-left of the chart */}
      <div
        style={{
          position: 'absolute',
          left: L.chartLeft - 6,
          top: L.chartTop - 54,
          direction: 'ltr',
          unicodeBidi: 'isolate',
          fontFamily: FONT_FAMILY,
          fontWeight: FONT.extraBold,
          fontSize: L.numberSize,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
          color: numberColor,
          opacity: numberIn,
          textShadow: `0 0 ${30 * drop}px ${rgba(COLORS.red, 0.55 * drop)}`,
        }}
      >
        {shown}%
      </div>
      <ExampleLabel text={t.label} frame={frame} at={b.labelAt} style={{top: L.chartTop - 30, right: VIDEO.width - L.chartRight}} />

      <div style={{position: 'absolute', top: L.secondTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal lines={t.second} frame={frame} start={b.secondAt} stagger={b.stagger} fontSize={L.secondSize} fill="red" />
      </div>
    </AbsoluteFill>
  );
};
