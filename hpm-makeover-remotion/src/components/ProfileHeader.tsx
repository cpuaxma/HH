import React from 'react';
import {COPY} from '../copy';
import {enter, kick, mix} from '../lib/anim';
import {Point} from '../lib/path';
import {HEADER_BOTTOM, SCREEN} from '../lib/stage';
import {headerTrigger} from '../lib/sweeps';
import {CUE} from '../timeline';
import {BLAND, CLIENT, FONT, TYPE, WEIGHT} from '../theme';
import {ClientMark} from './ClientMark';
import {
  IconArrowDown, IconCalendar, IconChevronDown, IconCup, IconDots, IconGrid, IconPerson, IconPlay, IconStar, StatusIcons,
} from './Icons';
import {Odometer} from './Odometer';

// Shared layout (screen-local px), so BEFORE and AFTER line up under the brush.
export const HEADER = {
  avatar: {x: 24, y: 128, d: 132},
  statX: [240, 366, 494],
  statY: 158,
  highlightX: [62, 162, 262],
  highlightY: 494,
} as const;

const abs = (left: number, top: number, extra?: React.CSSProperties): React.CSSProperties => ({position: 'absolute', left, top, ...extra});

const StatusBar: React.FC<{color: string; font: string; weight: number}> = ({color, font, weight}) => (
  <>
    <div style={abs(40, 18, {fontFamily: font, fontWeight: weight, fontSize: 22, color})}>9:41</div>
    <div style={abs(SCREEN.w - 112, 22)}>
      <StatusIcons color={color} />
    </div>
  </>
);

const TabRow: React.FC<{color: string; active?: string; muted: string}> = ({color, active, muted}) => (
  <div style={abs(0, 590, {width: SCREEN.w, height: 38, display: 'flex', borderTop: `1px solid ${muted}`})}>
    {[IconGrid, IconPlay, IconPerson].map((Icon, i) => (
      <div key={i} style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
        <Icon size={24} color={i === 0 ? color : muted} stroke={1.8} />
        {i === 0 && active ? <div style={{position: 'absolute', bottom: 0, left: '22%', right: '22%', height: 3, background: active}} /> : null}
      </div>
    ))}
  </div>
);

// ── BEFORE: default avatar, mismatched fonts, uneven spacing ──
const BeforeHeader: React.FC = () => {
  const b = COPY.client.before;
  const {avatar} = HEADER;
  return (
    <div style={{position: 'absolute', inset: 0, height: HEADER_BOTTOM + 2, background: BLAND.screen}}>
      <StatusBar color="#333" font={FONT.arial} weight={700} />
      <div style={abs(24, 68, {display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT.arial, fontWeight: 700, fontSize: 27, color: '#222'})}>
        {COPY.client.handle}
        <IconChevronDown size={20} color="#222" />
      </div>
      <div style={abs(SCREEN.w - 56, 70)}>
        <IconDots size={30} color="#222" stroke={2} />
      </div>
      <div style={abs(avatar.x, avatar.y, {width: avatar.d, height: avatar.d, borderRadius: '50%', background: '#C8C8C8', overflow: 'hidden'})}>
        <div style={abs(avatar.d / 2 - 24, 30, {width: 48, height: 48, borderRadius: '50%', background: '#EDEDED'})} />
        <div style={abs(avatar.d / 2 - 46, 86, {width: 92, height: 80, borderRadius: '46px 46px 0 0', background: '#EDEDED'})} />
      </div>
      {b.stats.map((s, i) => (
        <div key={i} style={abs(HEADER.statX[i] - 70, HEADER.statY + 4, {width: 140, textAlign: 'center', fontFamily: FONT.arial, color: '#222'})}>
          <div style={{fontSize: 29, fontWeight: 700}}>{s.value}</div>
          <div style={{fontSize: 20, marginTop: 2}}>{s.label}</div>
        </div>
      ))}
      <div style={abs(24, 276, {fontFamily: FONT.times, fontWeight: 700, fontSize: 27, color: '#222'})}>{b.name}</div>
      <div style={abs(24, 314, {fontFamily: FONT.arial, fontSize: 23, color: '#333'})}>{b.bio}</div>
      <div style={abs(24, 348, {fontFamily: FONT.times, fontSize: 22, color: '#3366CC', textDecoration: 'underline'})}>{b.link}</div>
      <div
        style={abs(24, 404, {
          width: SCREEN.w - 48,
          height: 50,
          borderRadius: 6,
          background: '#DCDCDC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.arial,
          fontSize: 22,
          color: '#444',
        })}
      >
        {b.follow}
      </div>
      <TabRow color="#444" muted="#C4C4C4" />
    </div>
  );
};

// ── AFTER: logo mark, rewritten bio, highlights, odometer counters ──
const STAT_TO = [null, 12.4, 2.1];
const STAT_FROM = [null, 0.2, 0];

const AfterHeader: React.FC<{frame: number}> = ({frame}) => {
  const a = COPY.client.after;
  const {avatar} = HEADER;
  const avatarCenter: Point = [avatar.x + avatar.d / 2, avatar.y + avatar.d / 2];
  const ak = kick(frame, headerTrigger(avatarCenter));
  const label: React.CSSProperties = {
    fontFamily: FONT.brand,
    fontWeight: WEIGHT.label,
    fontSize: 14,
    letterSpacing: TYPE.labelTracking,
    textTransform: 'uppercase',
    color: CLIENT.sageDeep,
  };
  return (
    <div style={{position: 'absolute', inset: 0, height: HEADER_BOTTOM + 2, background: CLIENT.oat}}>
      <StatusBar color={CLIENT.espresso} font={FONT.brand} weight={WEIGHT.label} />
      <div style={abs(24, 66, {display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT.brand, fontWeight: WEIGHT.headline, fontSize: 27, letterSpacing: '-0.02em', color: CLIENT.espresso})}>
        {COPY.client.handle}
        <IconChevronDown size={20} color={CLIENT.espresso} stroke={2.4} />
      </div>
      <div style={abs(SCREEN.w - 56, 70)}>
        <IconDots size={30} color={CLIENT.espresso} stroke={2.4} />
      </div>
      <div
        style={abs(avatar.x, avatar.y, {
          width: avatar.d,
          height: avatar.d,
          borderRadius: '50%',
          border: `4px solid ${CLIENT.sage}`,
          padding: 5,
          boxSizing: 'border-box',
          transform: `scale(${mix(0.82, 1, ak)}) rotate(${mix(-10, 0, ak)}deg)`,
        })}
      >
        <ClientMark size={avatar.d - 18} />
      </div>
      {a.statLabels.map((l, i) => {
        const trig = headerTrigger([HEADER.statX[i], HEADER.statY + 30]);
        const to = STAT_TO[i];
        return (
          <div key={i} style={abs(HEADER.statX[i] - 70, HEADER.statY, {width: 140, textAlign: 'center', color: CLIENT.espresso})}>
            <div style={{fontFamily: FONT.brand, fontWeight: WEIGHT.headline, fontSize: 32, letterSpacing: '-0.02em', height: 36, display: 'flex', justifyContent: 'center'}}>
              {to === null ? COPY.client.before.stats[i].value : <Odometer frame={frame} from={STAT_FROM[i] ?? 0} to={to} start={trig + 4} suffix="K" />}
            </div>
            <div style={{...label, color: CLIENT.espresso, opacity: 0.7, marginTop: 6}}>{l}</div>
          </div>
        );
      })}
      <div style={abs(HEADER.statX[0] - 60, HEADER.statY + 78, {width: HEADER.statX[2] - HEADER.statX[0] + 120, textAlign: 'center', fontFamily: FONT.brand, fontWeight: WEIGHT.body, fontSize: 14, color: CLIENT.espresso, opacity: 0.4 * enter(frame, CUE.disclaimer, 30)})}>
        {a.disclaimer}
      </div>
      <div style={abs(24, 270, {fontFamily: FONT.brand, fontWeight: WEIGHT.headline, fontSize: 28, letterSpacing: '-0.02em', color: CLIENT.espresso})}>{a.name}</div>
      <div style={abs(24, 306, label)}>{a.category}</div>
      <div style={abs(24, 334, {fontFamily: FONT.brand, fontWeight: WEIGHT.body, fontSize: 21, lineHeight: '29px', color: CLIENT.espresso})}>
        <div>{a.bio[0]}</div>
        <div>{a.bio[1]}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 4, fontWeight: WEIGHT.label}}>
          {a.bio[2]}
          <IconArrowDown size={19} color={CLIENT.espresso} stroke={2.6} />
        </div>
      </div>
      <div style={abs(24, 436, {display: 'flex', gap: 12})}>
        {[a.follow, a.order].map((t, i) => (
          <div
            key={t}
            style={{
              width: (SCREEN.w - 48 - 12) / 2,
              height: 46,
              borderRadius: 12,
              boxSizing: 'border-box',
              background: i === 0 ? CLIENT.espresso : 'transparent',
              border: `2px solid ${CLIENT.espresso}`,
              color: i === 0 ? CLIENT.oat : CLIENT.espresso,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.brand,
              fontWeight: WEIGHT.headline,
              fontSize: 19,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      {a.highlights.map((h, i) => {
        const x = HEADER.highlightX[i];
        const pop = kick(frame, headerTrigger([x, HEADER.highlightY + 32]) + 6 + i * 4);
        const Icon = [IconCup, IconStar, IconCalendar][i];
        return (
          <div key={h} style={abs(x - 44, HEADER.highlightY, {width: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop})`, transformOrigin: '50% 40%'})}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: `3px solid ${CLIENT.sage}`,
                boxSizing: 'border-box',
                padding: 4,
              }}
            >
              <div style={{width: '100%', height: '100%', borderRadius: '50%', background: i === 1 ? CLIENT.sage : CLIENT.espresso, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon size={26} color={CLIENT.oat} stroke={2} />
              </div>
            </div>
            <div style={{...label, fontSize: 12, color: CLIENT.espresso, marginTop: 6}}>{h}</div>
          </div>
        );
      })}
      <TabRow color={CLIENT.espresso} active={CLIENT.espresso} muted="#C7B596" />
    </div>
  );
};

export const ProfileHeader: React.FC<{state: 'before' | 'after'; frame: number}> = ({state, frame}) =>
  state === 'before' ? <BeforeHeader /> : <AfterHeader frame={frame} />;
