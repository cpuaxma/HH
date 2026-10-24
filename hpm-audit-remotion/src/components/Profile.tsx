import {BatteryFull, ChevronDown, Clapperboard, Clock, Coffee, Grid3x3, Menu, Plus, Signal, Sparkles, SquarePlus, SquareUser, Star, UserPlus, Users, Wifi} from 'lucide-react';
import React from 'react';
import {COPY} from '../copy';
import {C, FONT, FONT_APP} from '../theme';
import {Grid, GridState} from './Grid';
import {GAP, TILE} from './Tiles';

// Generic social profile (no real app branding), 1080×2340 "profile px".
// Every part has a BEFORE and an AFTER state; overrides let a scene mix them mid-fix.
export type PState = 'before' | 'after';

export const LAYOUT = {
  bioX: 48,
  bioY: 600,
  bioW: 820,
  bioFont: 42,
  bioLine: 56,
  gridY: 1250,
  tile: (i: number) => ({x: (i % 3) * (TILE + GAP), y: 1250 + Math.floor(i / 3) * (TILE + GAP), w: TILE, h: TILE}),
};

export const formatFollowers = (v: number) => {
  const n = Math.round(v);
  return n < 1000 ? `${n}` : `${(Math.floor(n / 100) / 10).toFixed(1)}K`;
};

type Props = {
  state: PState;
  bio?: PState;
  grid?: GridState;
  avatar?: PState;
  highlights?: PState;
  followers?: React.ReactNode;
  hideBio?: boolean;
  gridNode?: React.ReactNode;
  reelT?: number;
  children?: React.ReactNode; // overlay in profile coordinates
};

const ink = C.ink;

const Stat: React.FC<{n: React.ReactNode; label: string}> = ({n, label}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 210}}>
    <div style={{fontFamily: FONT_APP, fontWeight: 700, fontSize: 50, color: ink, height: 60, overflow: 'hidden', display: 'flex'}}>{n}</div>
    <div style={{fontFamily: FONT_APP, fontSize: 38, color: ink}}>{label}</div>
  </div>
);

const Avatar: React.FC<{state: PState}> = ({state}) =>
  state === 'before' ? (
    <div style={{width: 230, height: 230, borderRadius: '50%', background: '#CFC8BE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.hairline}`}}>
      <Coffee size={110} color="#8F877C" strokeWidth={1.6} />
    </div>
  ) : (
    <div style={{width: 230, height: 230, borderRadius: '50%', padding: 8, background: `conic-gradient(${C.sage}, ${C.espresso}, ${C.sage})`}}>
      <div style={{width: '100%', height: '100%', borderRadius: '50%', background: C.white, padding: 7}}>
        <div style={{width: '100%', height: '100%', borderRadius: '50%', background: C.espresso, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.oat, letterSpacing: '-0.03em', lineHeight: 0.9}}>b&amp;b</div>
          <div style={{width: 70, height: 6, borderRadius: 3, background: C.sage, marginTop: 10}} />
        </div>
      </div>
    </div>
  );

const HIGHLIGHT_ICONS = [Coffee, Clock, Sparkles, Users, Star];

const Highlights: React.FC<{state: PState}> = ({state}) => (
  <div style={{position: 'absolute', left: 48, top: 890, display: 'flex', gap: 55}}>
    {state === 'before' ? (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{width: 150, height: 150, borderRadius: '50%', border: `3px solid ${C.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Plus size={64} color={ink} strokeWidth={1.5} />
        </div>
        <div style={{fontFamily: FONT_APP, fontSize: 32, color: ink}}>New</div>
      </div>
    ) : (
      COPY.profile.highlights.map((label, i) => {
        const Icon = HIGHLIGHT_ICONS[i];
        return (
          <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 150}}>
            <div style={{width: 150, height: 150, borderRadius: '50%', border: `4px solid ${C.sage}`, padding: 6}}>
              <div style={{width: '100%', height: '100%', borderRadius: '50%', background: i % 2 ? C.espresso : C.oat, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon size={58} color={i % 2 ? C.oat : C.espresso} strokeWidth={2} />
              </div>
            </div>
            <div style={{fontFamily: FONT_APP, fontSize: 30, color: ink, whiteSpace: 'nowrap'}}>{label}</div>
          </div>
        );
      })
    )}
  </div>
);

export const Profile: React.FC<Props> = ({state, bio = state, grid = state, avatar = state, highlights = state, followers, hideBio, gridNode, reelT, children}) => {
  const p = COPY.profile;
  return (
    <div style={{position: 'relative', width: 1080, height: 2340, background: C.white, overflow: 'hidden', fontFamily: FONT_APP, color: ink}}>
      {/* Status bar */}
      <div style={{position: 'absolute', left: 80, top: 34, fontWeight: 700, fontSize: 44}}>9:41</div>
      <div style={{position: 'absolute', right: 70, top: 38, display: 'flex', gap: 18}}>
        <Signal size={44} strokeWidth={2.4} />
        <Wifi size={44} strokeWidth={2.4} />
        <BatteryFull size={50} strokeWidth={2} />
      </div>
      {/* Top bar */}
      <div style={{position: 'absolute', left: 48, top: 128, display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{fontWeight: 700, fontSize: 54}}>{p.handle}</div>
        <ChevronDown size={44} strokeWidth={2.4} />
      </div>
      <div style={{position: 'absolute', right: 48, top: 132, display: 'flex', gap: 44}}>
        <SquarePlus size={58} strokeWidth={1.8} />
        <Menu size={58} strokeWidth={1.8} />
      </div>
      {/* Avatar + stats */}
      <div style={{position: 'absolute', left: 48, top: 250}}>
        <Avatar state={avatar} />
      </div>
      <div style={{position: 'absolute', left: 330, top: 310, display: 'flex'}}>
        <Stat n={p.posts} label="posts" />
        <Stat n={followers ?? formatFollowers(state === 'after' ? p.followersAfter : p.followersBefore)} label="followers" />
        <Stat n={p.following} label="following" />
      </div>
      {/* Name, category, bio */}
      <div style={{position: 'absolute', left: LAYOUT.bioX, top: 500, fontWeight: 700, fontSize: 42}}>{p.name}</div>
      <div style={{position: 'absolute', left: LAYOUT.bioX, top: 552, fontSize: 40, color: C.muted}}>{p.category}</div>
      {!hideBio && (
        <div style={{position: 'absolute', left: LAYOUT.bioX, top: LAYOUT.bioY, width: LAYOUT.bioW, fontSize: LAYOUT.bioFont, lineHeight: `${LAYOUT.bioLine}px`}}>
          {bio === 'before' ? p.oldBio : p.newBio}
        </div>
      )}
      {/* Buttons */}
      <div style={{position: 'absolute', left: 48, top: 760, display: 'flex', gap: 16}}>
        <div style={{width: 430, height: 90, borderRadius: 20, background: ink, color: C.white, fontWeight: 700, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Follow</div>
        <div style={{width: 430, height: 90, borderRadius: 20, background: '#EFEFEF', fontWeight: 700, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Message</div>
        <div style={{width: 92, height: 90, borderRadius: 20, background: '#EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <UserPlus size={44} strokeWidth={2} />
        </div>
      </div>
      <Highlights state={highlights} />
      {/* Tabs */}
      <div style={{position: 'absolute', left: 0, top: 1150, width: 1080, height: 96, display: 'flex', borderTop: `2px solid ${C.hairline}`}}>
        {[Grid3x3, Clapperboard, SquareUser].map((Icon, i) => (
          <div key={i} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: i === 0 ? `4px solid ${ink}` : '4px solid transparent'}}>
            <Icon size={52} strokeWidth={1.8} color={i === 0 ? ink : C.muted} />
          </div>
        ))}
      </div>
      {/* Grid */}
      <div style={{position: 'absolute', left: 0, top: LAYOUT.gridY, width: 1080, height: 3 * TILE + 2 * GAP}}>
        {gridNode ?? <Grid state={grid} reelT={reelT} />}
      </div>
      {children}
    </div>
  );
};
