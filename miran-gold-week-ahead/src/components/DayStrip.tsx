import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, GOLD, LAYOUT, NUM, SPRING} from '../brand';
import type {Edition} from '../edition';
import {STRIP} from '../timeline';
import {Icon} from './Icons';
import {enter, lin} from './motion';

const PW = 158; // pill width
const PH = 104;
const GAP = 12;
const W = 5 * PW + 4 * GAP; // 838
const LEFT = 88; // strip spans 88 → 926 (clear of the 140px right rail)

/** Centre x (in strip coordinates) of slot i, counted right to left (0 = Monday on the right). */
const cx = (i: number) => W - (i * (PW + GAP) + PW / 2);

/**
 * Persistent 5-day strip (الاثنين → الجمعة, right to left). The gold highlight slides along
 * on a spring between days; the strip never resets. At the end it nudges right to peek at the
 * following week.
 */
export const DayStrip: React.FC<{edition: Edition}> = ({edition}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  // highlight position = sum of spring steps
  let pos = STRIP.moves[0].to;
  for (let k = 1; k < STRIP.moves.length; k++) {
    const m = STRIP.moves[k];
    const prev = STRIP.moves[k - 1].to;
    pos += (m.to - prev) * spring({frame: f - m.at, fps, config: SPRING.slide});
  }

  const drop = spring({frame: f - STRIP.inAt, fps, config: SPRING.pill});
  const out = interpolate(f, [STRIP.outAt, STRIP.outAt + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  const peek = spring({frame: f - STRIP.peekAt, fps, config: SPRING.slide});
  const shiftX = peek * (PW + GAP); // strip slides right by one slot

  const holiday = enter(f, STRIP.holidayStampAt, 14);
  const fri = enter(f, STRIP.friClockAt, 16);

  const hlScale = 1.12;

  return (
    <div
      style={{
        position: 'absolute',
        top: LAYOUT.stripY,
        left: LEFT,
        width: W,
        height: PH + 30,
        opacity: Math.min(1, drop * 1.4) * (1 - out),
        transform: `translateY(${(1 - drop) * -50 - out * 30}px)`,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
      }}
    >
      <div style={{position: 'absolute', inset: 0}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: PH, transform: `translateX(${shiftX}px)`}}>
          {/* gold highlight */}
          <div
            style={{
              position: 'absolute',
              left: cx(pos) - PW / 2,
              top: 0,
              width: PW,
              height: PH,
              borderRadius: 22,
              background: GOLD,
              transform: `scale(${hlScale})`,
              boxShadow: '0 0 34px rgba(212,175,55,0.55), 0 0 90px rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
              opacity: drop,
            }}
          />
          {[...edition.days, null].map((d, i) => {
            const a = Math.max(0, 1 - Math.abs(pos - i));
            const isTab = d === null;
            const isHoliday = !!d?.holiday;
            const isShort = !!d?.shortDay;
            const pillIn = spring({frame: f - (STRIP.inAt + i * 4), fps, config: SPRING.pill});
            const leaving = i === 0 ? lin(f, STRIP.peekAt, STRIP.peekAt + 20) : 0;
            const tabIn = isTab ? peek : 1;
            const dark = a > 0.5;
            return (
              <div
                key={i}
                dir="rtl"
                style={{
                  position: 'absolute',
                  left: cx(i) - PW / 2,
                  top: 0,
                  width: PW,
                  height: PH,
                  borderRadius: 22,
                  border: a > 0.5 ? 'none' : `1px solid rgba(212,175,55,${0.22 + 0.2 * a})`,
                  background: a > 0.5 ? 'transparent' : 'rgba(11,24,56,0.55)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  opacity: (0.35 + 0.65 * a) * pillIn * (1 - leaving) * tabIn,
                  transform: `scale(${1 + 0.12 * a}) translateY(${(1 - pillIn) * -30}px)`,
                  color: dark ? C.bg0 : C.text,
                  fontFamily: FONT.ar,
                }}
              >
                {isTab ? (
                  <span style={{fontSize: 23, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', padding: '0 10px'}}>{edition.nextWeekTab}</span>
                ) : (
                  <>
                    <span style={{fontSize: 30, fontWeight: 700, lineHeight: 1.2, textDecoration: isHoliday && holiday > 0.5 ? 'line-through' : undefined, textDecorationThickness: 2}}>
                      {d!.ar}
                    </span>
                    <span style={{fontSize: 24, fontWeight: 500, ...NUM, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6}}>
                      <bdi dir="ltr">{d!.date}</bdi>
                      {isShort && fri > 0 ? (
                        <span style={{opacity: fri, transform: `scale(${0.6 + 0.4 * fri})`, display: 'inline-block'}}>
                          <HalfClock size={22} color={dark ? C.bg0 : C.gold0} />
                        </span>
                      ) : null}
                    </span>
                  </>
                )}
                {isHoliday && holiday > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: `translateX(-50%) rotate(-6deg) scale(${1.6 - 0.6 * holiday})`,
                      opacity: holiday,
                      background: C.red,
                      color: '#fff',
                      fontSize: 17,
                      fontWeight: 700,
                      padding: '1px 10px',
                      borderRadius: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    عطلة
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const HalfClock: React.FC<{size: number; color: string; fill?: number}> = ({size, color, fill = 0.5}) => {
  const r = 18;
  const ang = fill * Math.PI * 2;
  const x = 24 + Math.sin(ang) * r;
  const y = 24 - Math.cos(ang) * r;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3.5" />
      <path d={`M24 24 L24 ${24 - r} A ${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={color} />
    </svg>
  );
};

/** Icon export for other scenes. */
export {Icon};
