// SFX cue sheet: (frame, type, volume). Files are looked up in /public/sfx/<type>.wav; a missing
// file is skipped, never breaking the render. Exported to out/sfx_cues.csv by scripts/export-cues.ts.
import {HIT} from './timeline';
import {LANE_ORDER} from './brand';

export type SfxType = 'whoosh' | 'impact_low' | 'pulse_ring' | 'tick' | 'pop' | 'riser' | 'glitch' | 'chime_gold';
export type Cue = {frame: number; type: SfxType; volume: number; note: string};

const c = (frame: number, type: SfxType, volume: number, note: string): Cue => ({frame, type, volume, note});

export const CUES: Cue[] = [
  // S0 hook
  c(0, 'riser', 0.5, 'hook: streaks converge'),
  c(HIT.nodeSlam, 'impact_low', 0.9, 'hook: Fed node slams in'),
  c(HIT.hookPulse, 'pulse_ring', 0.7, 'hook: first Fed Pulse'),
  ...HIT.laneSnap.map((f, i) => c(f, 'tick', 0.45, `hook: lane ${LANE_ORDER[i]} snaps in`)),
  // S1 context
  c(HIT.gaugeIn, 'whoosh', 0.5, 'S1: gauge card in'),
  c(HIT.needleLand, 'pop', 0.6, 'S1: needle lands 3.75–4.00%'),
  c(HIT.cardFlip, 'whoosh', 0.45, 'S1: card flips to odds'),
  ...Array.from({length: 10}, (_, i) => c(HIT.oddsFillStart + i * 6, 'tick', 0.28 + i * 0.015, 'S1: odds bar tick')),
  c(HIT.oddsLand, 'pop', 0.6, 'S1: >90% lands'),
  // S2 core
  c(HIT.coinIn, 'pop', 0.45, 'S2: coin + % tag'),
  ...HIT.tagSteps.map((f) => c(f, 'impact_low', 0.4, 'S2: tag gets heavier')),
  c(HIT.corePulse, 'pulse_ring', 0.7, 'S2: pulse to all lanes'),
  c(HIT.coreImpact.nasdaq, 'impact_low', 0.6, 'S2: Nasdaq shakes'),
  c(HIT.coreImpact.spx, 'tick', 0.45, 'S2: S&P nudges'),
  c(HIT.coreImpact.gold, 'tick', 0.35, 'S2: gold dims'),
  // S3 Nasdaq
  c(HIT.dive1, 'whoosh', 0.6, 'S3: dive into Nasdaq lane'),
  c(HIT.ch1Pulse, 'pulse_ring', 0.6, 'S3: chapter pulse'),
  c(HIT.ch1Impact, 'impact_low', 0.7, 'S3: Nasdaq impact / 01 draws'),
  ...Array.from({length: 9}, (_, i) => c(HIT.coinsIn + i * 4, 'tick', 0.3, 'S3: earnings coin')),
  c(HIT.discount - 30, 'riser', 0.45, 'S3: discount slider'),
  ...Array.from({length: 9}, (_, i) => c(HIT.discount + i * 5, 'tick', 0.3, 'S3: coin shrinks')),
  // S4 S&P
  c(HIT.dive2, 'whoosh', 0.55, 'S4: match-cut coin → tile'),
  ...Array.from({length: 11}, (_, i) => c(HIT.tilesIn + i * 4, 'tick', 0.22, 'S4: sector tile')),
  c(HIT.ch2Pulse, 'pulse_ring', 0.6, 'S4: chapter pulse'),
  c(HIT.tilesRed, 'glitch', 0.35, 'S4: tech tiles red'),
  c(HIT.tilesGreen, 'pop', 0.4, 'S4: banks green'),
  c(HIT.netArrow, 'tick', 0.45, 'S4: net arrow'),
  // S5 Gold
  c(HIT.goldMorph, 'chime_gold', 0.6, 'S5: particles → gold bar'),
  c(HIT.ch3Pulse, 'pulse_ring', 0.6, 'S5: chapter pulse'),
  c(HIT.bondDrop, 'impact_low', 0.8, 'S5: bond card lands, scale tips'),
  c(HIT.dxyRise, 'whoosh', 0.45, 'S5: DXY arrow rises'),
  ...Array.from({length: 12}, (_, i) => c(HIT.chartDraw[0] + 40 + i * 5, 'tick', 0.25, 'S5: price counts down')),
  c(HIT.chartLand, 'pop', 0.65, 'S5: < $3,500 lands'),
  // S6 twist
  c(HIT.glitch, 'glitch', 0.6, 'S6: glitch transition'),
  c(HIT.expectCard, 'pop', 0.5, 'S6: expected ≠ actual'),
  ...LANE_ORDER.map((l) => c(HIT.flip[l], 'whoosh', 0.45, `S6: ${l} arrow flips up`)),
  // S7 recap
  c(HIT.flipBack, 'whoosh', 0.4, 'S7: arrows reset, pull back'),
  ...HIT.recapRows.map((f) => c(f, 'tick', 0.4, 'S7: recap row')),
  // S8 tease
  ...Array.from({length: 8}, (_, i) => c(HIT.flapStart + i * 7, 'tick', 0.35, 'S8: split-flap')),
  c(HIT.teasePulse, 'pulse_ring', 0.7, 'S8: Fed node pulses'),
  // S9 outro
  c(HIT.outroIn - 30, 'riser', 0.5, 'S9: particles gather'),
  c(HIT.logoLock, 'chime_gold', 0.75, 'S9: logo locks'),
];
