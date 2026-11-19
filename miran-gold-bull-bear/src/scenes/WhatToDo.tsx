import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT, s, SPRING} from '../constants';
import {clamp, ease, goldGlow, hexA, springAt} from '../lib';

const iconStroke = {fill: 'none', stroke: COLORS.gold, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

const TrendIcon = () => (
  <svg viewBox="0 0 80 80" width={78} height={78}>
    <path d="M10 62 L30 42 L42 52 L68 22" {...iconStroke} />
    <path d="M52 20 L70 20 L70 38" {...iconStroke} />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 80 80" width={78} height={78}>
    <path d="M40 8 L66 18 L66 40 C66 56 54 66 40 72 C26 66 14 56 14 40 L14 18 Z" {...iconStroke} />
    <path d="M27 40 L53 40" {...iconStroke} />
  </svg>
);
const HourglassIcon = () => (
  <svg viewBox="0 0 80 80" width={78} height={78}>
    <path d="M20 10 L60 10 M20 70 L60 70" {...iconStroke} />
    <path d="M24 10 C24 30 40 34 40 40 C40 46 24 50 24 70 M56 10 C56 30 40 34 40 40 C40 46 56 50 56 70" {...iconStroke} />
    <path d="M32 64 L48 64 L40 54 Z" fill={COLORS.gold} />
  </svg>
);

type Item = {word: string; tag: string; tagColor: string; at: number; Icon: React.FC};

// `at` = seconds from the scene start, as the voice-over says each word.
const ITEMS: Item[] = [
  {word: 'الاتجاه', tag: 'في الصاعد', tagColor: COLORS.green, at: 1.2, Icon: TrendIcon},
  {word: 'وقف الخسارة', tag: 'في الصاعد', tagColor: COLORS.green, at: 2.3, Icon: ShieldIcon},
  {word: 'الصبر', tag: 'في الهابط', tagColor: COLORS.red, at: 4.6, Icon: HourglassIcon},
];

const CLOSER_AT = 5.3;

/** 5) What to do — three gold keywords pop in with a spring, then the closing line fades in. */
export const WhatToDo: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = springAt(frame, 0, SPRING.soft);
  const closer = ease(frame, s(CLOSER_AT), s(0.7));

  return (
    <AbsoluteFill>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 262,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.heavy,
          fontSize: 104,
          lineHeight: 1.3,
          color: COLORS.white,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 40}px)`,
        }}
      >
        ماذا <span style={{color: COLORS.gold, textShadow: goldGlow(0.9)}}>تفعل؟</span>
      </div>

      <div style={{position: 'absolute', top: 450, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 30}}>
        {ITEMS.map(({word, tag, tagColor, at, Icon}) => {
          const p = springAt(frame, s(at), SPRING.pop);
          const shine = ease(frame, s(at) + 4, s(0.6));
          return (
            <div
              key={word}
              dir="rtl"
              style={{
                position: 'relative',
                height: 170,
                borderRadius: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '0 32px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.16), rgba(212,175,55,0.03))',
                border: `2.5px solid ${hexA(COLORS.gold, 0.7)}`,
                boxShadow: `0 0 40px ${hexA(COLORS.gold, 0.18)}`,
                opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
                transform: `scale(${0.55 + 0.45 * p})`,
              }}
            >
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(10,10,10,0.6)',
                  border: `2px solid ${hexA(COLORS.gold, 0.5)}`,
                  flexShrink: 0,
                }}
              >
                <Icon />
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: FONT.family,
                  fontWeight: FONT.heavy,
                  fontSize: 72,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  color: COLORS.gold,
                  textShadow: goldGlow(1),
                }}
              >
                {word}
              </div>
              <div
                style={{
                  fontFamily: FONT.family,
                  fontWeight: FONT.bold,
                  fontSize: 34,
                  color: tagColor,
                  padding: '4px 22px 8px',
                  borderRadius: 999,
                  border: `2px solid ${tagColor}`,
                  background: hexA(tagColor, 0.12),
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </div>
              {/* one-off shine pass across the card */}
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  bottom: -40,
                  width: 140,
                  left: `${interpolate(shine, [0, 1], [-20, 110])}%`,
                  transform: 'skewX(-20deg)',
                  background: 'linear-gradient(90deg, transparent, rgba(255,240,190,0.28), transparent)',
                  opacity: shine > 0 && shine < 1 ? 1 : 0,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Closing line */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 1080,
          left: 70,
          right: 70,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.heavy,
          fontSize: 70,
          lineHeight: 1.4,
          color: COLORS.white,
          opacity: closer,
          transform: `translateY(${(1 - closer) * 30}px)`,
        }}
      >
        لا يوجد سوق سيئ،
        <br />
        بل متداول <span style={{color: COLORS.gold, textShadow: goldGlow(1)}}>غير مستعد!</span>
      </div>
    </AbsoluteFill>
  );
};
