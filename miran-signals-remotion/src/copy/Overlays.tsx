// Everything drawn in HTML over the 3D for the copy trading reel: the scoreboard under the
// phone (account value + copy status, in the signals reel's frosted-glass style), the same
// end card, and the same finish (grain, vignette). No captions: the phone UI and your
// voiceover tell the story.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, GOLD_GRADIENT} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeOut, ramp, springAt} from '../lib/ease';
import {EndCard, EndCardCfg, Finish, Mark, SafeZones, mix} from '../ui/Overlays';
import {glass} from '../ui/Kinetic';
import {BOARD, COLORS, CopyFormat, END, FINAL_BALANCE, ILLUSTRATIVE, LAYOUT, PLACEHOLDERS, T} from './data';
import {CopyStatus, accountValue, statusAt, statusSince} from './story';

const money0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pctStr = (p: number) => `${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p).toFixed(1)}%`;

const STATUS: Record<CopyStatus, {label: string; color: string}> = {
  notLinked: {label: BOARD.notLinked, color: COLORS.off},
  linked: {label: BOARD.linked, color: COLORS.linked},
  on: {label: BOARD.on, color: COLORS.on},
  paused: {label: BOARD.paused, color: COLORS.paused},
};

/** One status line; the previous one lifts away and blurs out as the new one rises in. */
const StatusLine: React.FC<{f: number}> = ({f}) => {
  const now = statusAt(f);
  const since = statusSince(f);
  const prev = statusAt(since - 1);
  const k = clamp01(springAt(f - since, {freq: 1.8, damping: 0.8}));
  const row = (s: CopyStatus, a: number, dy: number, blur: number) => (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: a,
        transform: `translateY(${dy}px)`,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    >
      <span style={{width: 16, height: 16, borderRadius: 8, background: STATUS[s].color, boxShadow: `0 0 14px ${STATUS[s].color}`}} />
      <span style={{color: STATUS[s].color, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap'}}>{STATUS[s].label}</span>
    </div>
  );
  return (
    <div style={{position: 'relative', height: 48, width: '100%'}}>
      {since > 0 && k < 1 && prev !== now ? row(prev, 1 - k, -k * 18, k * 6) : null}
      {row(now, since > 0 ? k : 1, since > 0 ? (1 - k) * 18 : 0, since > 0 ? (1 - k) * 6 : 0)}
    </div>
  );
};

/** The board under the phone: «حسابك», the live account value and the copy status. */
const Board: React.FC<{fmt: CopyFormat}> = ({fmt}) => {
  const f = useCurrentFrame();
  if (f < T.boardIn - 2 || f > T.boardOut + 24) return null;
  const L = LAYOUT[fmt];
  const enter = clamp01(springAt(f - T.boardIn, {freq: 1.5, damping: 0.85}));
  const out = 1 - ramp(f, T.boardOut, T.boardOut + 18, easeIn);
  if (out <= 0) return null;
  const value = accountValue(f);
  const start = PLACEHOLDERS.balance;
  const d = value - start;
  const closed = ramp(f, T.closedAt, T.closedAt + 16, easeOut);
  const color = d >= 0 ? mix(BRAND.text, BRAND.up, clamp01(d / 60)) : mix(BRAND.text, '#FF6B6B', clamp01(-d / 60));
  const badge = clamp01(springAt(f - (T.closedAt + 8), {freq: 2.0, damping: 0.62}));
  const flash = f >= T.closedAt ? Math.exp(-(f - T.closedAt) / 16) : 0;
  const pct = ((FINAL_BALANCE - start) / start) * 100;
  const s = statusAt(f);
  const edge = s === 'paused' ? 'rgba(232,163,61,0.6)' : 'rgba(243,210,122,0.55)';
  return (
    <div
      style={{
        position: 'absolute',
        left: L.width / 2,
        top: L.boardTop,
        width: 640,
        transform: `translate(-50%, ${(1 - enter) * 40}px) scale(${L.boardScale * (0.94 + 0.06 * enter)})`,
        transformOrigin: 'center top',
        opacity: out * clamp01(enter * 1.4),
        filter: enter < 0.98 ? `blur(${((1 - enter) * 10).toFixed(2)}px)` : undefined,
        fontFamily: FAMILY,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 26px 12px',
          borderRadius: 36,
          ...glass('rgba(40,31,14,0.5)', edge),
          boxShadow: `0 22px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 ${30 + 50 * flash}px rgba(212,162,76,${0.22 + 0.4 * flash})`,
        }}
      >
        <div dir="rtl" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 70}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 36, lineHeight: '50px', whiteSpace: 'nowrap'}}>
            <Mark good size={38} />
            <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BOARD.label}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr', whiteSpace: 'nowrap'}}>
            <span style={{fontSize: 56, fontWeight: 700, lineHeight: '70px', fontVariantNumeric: 'tabular-nums', color: closed > 0 ? mix(BRAND.text, BRAND.up, closed) : color}}>{money0(value)}</span>
            {badge > 0 ? (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  lineHeight: '38px',
                  padding: '0 12px',
                  borderRadius: 19,
                  color: BRAND.up,
                  background: 'rgba(63,208,138,0.16)',
                  border: '1.5px solid rgba(63,208,138,0.45)',
                  opacity: badge,
                  transform: `scale(${0.6 + 0.4 * badge})`,
                  filter: badge < 0.98 ? `blur(${((1 - badge) * 6).toFixed(2)}px)` : undefined,
                }}
              >
                {pctStr(pct)}
              </span>
            ) : null}
          </div>
        </div>
        <div style={{width: '100%', height: 1, background: 'rgba(255,255,255,0.12)', margin: '6px 0 6px'}} />
        <StatusLine f={f} />
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: -13,
            left: 26,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
            padding: '0 10px',
            borderRadius: 12,
            color: '#C3C8D3',
            background: 'rgba(18,24,38,0.92)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {ILLUSTRATIVE}
        </div>
      </div>
    </div>
  );
};

export const COPY_END: EndCardCfg = {
  timing: T,
  copy: () => END,
  layout: (fmt) => LAYOUT[fmt],
  disclaimerSize: (fmt) => LAYOUT[fmt].disclaimerSize,
};

export const CopyOverlays: React.FC<{fmt: CopyFormat; showSafeZones?: boolean}> = ({fmt, showSafeZones}) => (
  <>
    <Board fmt={fmt} />
    <EndCard fmt={fmt} lang="ar" cfg={COPY_END} />
    <Finish holdFrom={T.holdFrom} />
    {showSafeZones ? <SafeZones fmt={fmt} /> : null}
  </>
);
