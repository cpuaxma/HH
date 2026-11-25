# Miran Gold reel: قرار واحد، ثلاث أسواق (One Fed decision, three markets)

Vertical Arabic educational reel in Remotion: 1080×1920, 60fps, 44.0s (2,640 frames), 120 BPM grid (1 beat = 30 frames).

**Status: full build.** All shots S0–S9 and their transitions are in.

## Render

```
npm install
npm run render          # out/MiranGold_Fed3Markets_2026-11.mp4 (H.264, CRF 18)
npm run render:overlay  # ProRes 4444 overlay pass (no background)
scripts/stills.sh Fed3Markets out/frames 150 300 1060   # stills at given frames
npm run qa -- 90 255 405       # half-res QA stills in one browser session (out/qa)
npm run cues                   # out/sfx_cues.csv (time_s, frame, cue, file, volume, note)
```

Set `REMOTION_BROWSER` to use an existing Chrome/headless shell.

## Where things live

- `src/brand.ts`: colours, lane colours, fonts, easing, springs, beat length, safe zones.
- `src/data.json`: every verified number with its date and source. Edit here, not in scenes.
- `src/timeline.ts`: the approved shot list as frame numbers (scene ranges + every hit).
- `src/captions.ts`: all on-screen Arabic captions. `[text]` marks an LTR run (number, %, ticker) rendered in `<bdi>`.
- `src/sfx.ts`: SFX cue sheet (frame, type, volume). Drop `whoosh.wav`, `impact_low.wav`, `pulse_ring.wav`, `tick.wav`, `pop.wav`, `riser.wav`, `glitch.wav`, `chime_gold.wav` into `public/sfx/` and `bed.wav`/`bed.mp3` into `public/music/`. Missing files are skipped.
- `src/components/`: FedNode, FedPulse, LaneBoard/LaneRail, ChapterNumeral/CountUp/RateGauge/ProbabilityBar (Charts), DiscountTimeline/SectorMosaic/BalanceScale (Mechanisms), ArabicWordReveal, Caption2Line, SourceLine/IllustrativeTag/Disclaimer (Chrome), Background, SfxTrack.
- `styleframes/`: the six approved style frames and the contact sheet.

Arabic animates one word at a time, never per letter, so letters stay joined.
