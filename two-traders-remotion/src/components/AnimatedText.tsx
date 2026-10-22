import React from 'react';
import {useCurrentFrame} from 'remotion';
import {enterProgress, exitProgress, smoothSpring} from '../anim';
import {Lang, parseLine, Segment, Tone, Word} from '../i18n';
import {colors, fonts, text as T} from '../theme';

type Props = {
  lang: Lang;
  lines: string[];
  start: number;
  exit?: number;
  fontSize: number;
  weight?: number;
  color?: string;
  align?: 'center' | 'start';
  // Latin tokens inside Arabic lines stay wrapped in <bdi>
  style?: React.CSSProperties;
};

const goldText: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, ${colors.goldTo} 10%, ${colors.goldFrom} 90%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  fontWeight: 600,
};

const toneStyle = (tone: Tone, base: string): React.CSSProperties => {
  if (tone === 'gold') return goldText;
  if (tone === 'red') return {color: colors.red, fontWeight: 600};
  return {color: base};
};

// Glow sits on the wrapper so background-clip:text does not clip it
const toneGlow = (tone: Tone) =>
  tone === 'gold' ? ' drop-shadow(0 0 14px rgba(212,162,76,0.35))' : tone === 'red' ? ' drop-shadow(0 0 12px rgba(217,83,79,0.25))' : '';

const unitStyle = (frame: number, enterAt: number, exitAt: number | undefined, tone: Tone): React.CSSProperties => {
  const p = enterProgress(frame, enterAt, T.enterDuration);
  const q = exitProgress(frame, exitAt, T.exitDuration);
  return {
    display: 'inline-block',
    opacity: p * (1 - q),
    transform: `translateY(${T.rise * (1 - p) - 8 * q}px)`,
    filter: `blur(${(T.blur * (1 - p) + T.blur * q).toFixed(2)}px)${toneGlow(tone)}`,
    whiteSpace: 'pre',
  };
};

// English animates per character (1.5f stagger) while the line's letter-spacing
// tightens 0.35em → 0. Arabic animates per word (4f stagger, right to left) and
// never gets letter-spacing.
export const AnimatedText: React.FC<Props> = ({lang, lines, start, exit, fontSize, weight = 300, color = colors.text, align = 'center', style}) => {
  const frame = useCurrentFrame();
  const parsed: Word[][] = lines.map(parseLine);
  const isAr = lang === 'ar';
  const base: React.CSSProperties = {
    textAlign: align === 'center' ? 'center' : isAr ? 'right' : 'left',
    fontFamily: isAr ? fonts.ar : fonts.en,
    fontWeight: weight,
    fontSize,
    lineHeight: isAr ? T.lineHeight.ar : T.lineHeight.en,
    color,
    ...style,
  };

  if (isAr) {
    let index = 0;
    return (
      <div dir="rtl" lang="ar" style={{...base, letterSpacing: 0}}>
        {parsed.map((words, li) => (
          <div key={li} style={{whiteSpace: 'nowrap'}}>
            {words.map((w, wi) => {
              const i = index++;
              const enterAt = start + i * T.arStagger;
              const exitAt = exit === undefined ? undefined : exit + i * T.arExitStagger;
              const tone = w.segments.find((s) => s.tone !== 'plain')?.tone ?? 'plain';
              const content = w.segments.map((s, si) => (
                <span key={si} style={toneStyle(s.tone, color)}>
                  {s.text}
                </span>
              ));
              return (
                <React.Fragment key={wi}>
                  {wi > 0 ? ' ' : null}
                  <span style={unitStyle(frame, enterAt, exitAt, tone)}>{w.latin ? <bdi dir="ltr">{content}</bdi> : content}</span>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const total = parsed.reduce((n, ws) => n + ws.reduce((m, w) => m + w.segments.reduce((k, s) => k + s.text.length, 0), 0), 0);
  const spacing = T.startSpacing * (1 - smoothSpring(frame, start, Math.max(36, total * T.enStagger * 0.8)));
  let index = 0;
  const renderSegment = (s: Segment, key: number) =>
    Array.from(s.text).map((ch, ci) => {
      const i = index++;
      const exitAt = exit === undefined ? undefined : exit + i * T.enExitStagger;
      return (
        <span key={`${key}-${ci}`} style={unitStyle(frame, start + i * T.enStagger, exitAt, s.tone)}>
          <span style={toneStyle(s.tone, color)}>{ch}</span>
        </span>
      );
    });
  return (
    <div lang="en" style={{...base, letterSpacing: `${spacing.toFixed(4)}em`}}>
      {parsed.map((words, li) => (
        <div key={li} style={{whiteSpace: 'nowrap'}}>
          {words.map((w, wi) => (
            <React.Fragment key={wi}>
              {wi > 0 ? ' ' : null}
              <span style={{display: 'inline-block', whiteSpace: 'nowrap'}}>{w.segments.map((s, si) => renderSegment(s, si))}</span>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};
