import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {COLORS, SCENES, TRAPS} from './config';
import {Arena} from './arena/Arena';
import {PLAN} from './arena/plan';
import {SoundTrack} from './audio/SoundTrack';
import {Counter} from './components/Counter';
import {Flare, Grain, HitFlash, SafeZone, Vignette, Whispers} from './components/Overlays';
import {ArrowScene} from './scenes/ArrowScene';
import {Cta} from './scenes/Cta';
import {Habits} from './scenes/Habits';
import {Hook} from './scenes/Hook';
import {AuditContext} from './scenes/layout';
import {Reveal} from './scenes/Reveal';
import {Setup} from './scenes/Setup';
import {Trap} from './scenes/Trap';

export type TradersProps = {
  /** Draw the text-safe area on top (QA). */
  showSafeZone?: boolean;
  /** Text only on black (no 3D, scrims, grain): used by the per-frame safe-zone checker. */
  audit?: boolean;
};

const range = ([a, b]: readonly [number, number]) => ({from: a, durationInFrames: b - a});

export const TradersArena: React.FC<TradersProps> = ({showSafeZone = false, audit = false}) => (
  <AuditContext.Provider value={audit}>
    <AbsoluteFill style={{backgroundColor: audit ? '#000' : COLORS.black, overflow: 'hidden'}}>
      {/* One continuous 3D arena under every scene. */}
      {audit ? null : <Arena />}
      {audit ? null : <HitFlash />}
      {audit ? null : <Flare />}

      <Sequence name="1 Hook" {...range(SCENES.hook)}>
        <Hook />
      </Sequence>
      <Sequence name="2 Setup" {...range(SCENES.setup)}>
        <Setup />
      </Sequence>
      {TRAPS.map((t, k) => (
        <Sequence key={k} name={`3.${k + 1} Trap · ${t.mechanism}`} from={PLAN.traps[k].start - 4} durationInFrames={PLAN.traps[k].len + 12}>
          <Trap k={k} from={PLAN.traps[k].start - 4} />
        </Sequence>
      ))}
      <Sequence name="4 Reveal" {...range(SCENES.reveal)}>
        <Reveal />
      </Sequence>
      <Sequence name="5 Habits" {...range(SCENES.habits)}>
        <Habits />
      </Sequence>
      <Sequence name="6 Arrow" {...range(SCENES.arrow)}>
        <ArrowScene />
      </Sequence>
      <Sequence name="7 CTA" {...range(SCENES.cta)}>
        <Cta />
      </Sequence>

      <Counter />
      <Whispers />
      {audit ? null : <Vignette />}
      {audit ? null : <Grain />}
      {showSafeZone ? <SafeZone /> : null}
      {audit ? null : <SoundTrack />}
    </AbsoluteFill>
  </AuditContext.Provider>
);
