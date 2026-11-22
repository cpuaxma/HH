import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CUES, SCENES, STAGES, StageKey, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {useTextOnly} from '../components/Debug';
import {EmotionWord} from '../components/EmotionWord';
import {RewindFX} from '../components/RewindFX';
import {Scrim} from '../components/Scrim';
import {windowed} from '../lib/motion';

const from = SCENES.rewind.from;
const c = CUES.rewind;
// the labels flash past in reverse
const REVERSE: StageKey[] = ['panic', 'fear', 'denial', 'anxiety', 'euphoria', 'thrill', 'excitement', 'optimism'];
const wordOf = (k: StageKey) => STAGES.find((s) => s.key === k)!.word!;

/** The rewind glyph: two left-pointing triangles (drawn, not an emoji). */
const RewindGlyph: React.FC<{opacity: number}> = ({opacity}) => {
  if (useTextOnly()) return null;
  return (
    <svg width={96} height={56} viewBox="0 0 96 56" style={{position: 'absolute', left: 492, top: 286, opacity}}>
      <path d="M48 4 L4 28 L48 52 Z M92 4 L48 28 L92 52 Z" fill="#fff" opacity={0.9} />
    </svg>
  );
};

/** 0:03-0:05 Everything rewinds up the track and lands on a calm, still start. */
export const S2Rewind: React.FC = () => {
  const g = useCurrentFrame() + from;
  const fx = windowed(g, 86, 92, 128, 140);
  const glyph = windowed(g, 94, 97, 126, 132) * (random(`rg-${Math.floor(g / 4)}`) > 0.25 ? 1 : 0.35);
  return (
    <AbsoluteFill>
      <RewindFX strength={fx} />
      <RewindGlyph opacity={glyph} />
      {REVERSE.map((k, i) => {
        const at = c.labelsFrom + i * c.labelEvery - from;
        return <EmotionWord key={k} word={wordOf(k)} at={at} out={at + 3} fx="flash" y={820} size={150} />;
      })}
      <Scrim y={420} h={340} opacity={windowed(g, c.text - 4, c.text + 6, c.textExit + 6, c.textExit + 18)} />
      <AnimatedText {...TEXT.rewind.line} enter={c.text - from} exit={c.textExit - from} shineAt={c.text - from + 14} size={90} y={420} />
    </AbsoluteFill>
  );
};
