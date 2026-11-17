# Miran Gold — The Week Ahead (الأسبوع القادم)

A recurring bi-weekly reel: a calendar breakdown of the events that could move gold in the coming week.
Remotion, 1080×1920, 60fps, 42s (3s intro hook «ماذا ينتظر الذهب في الأسبوع القادم؟» + main reel + 4s outro). Arabic (RTL) body; English wordmark and outro.

Edition #1 covers **Mon 23 – Fri 27 Nov 2026** (uploaded the week before).

## Make the next edition

1. Copy `src/editions/2026-11-23/` to `src/editions/<monday-date>/` and edit `edition.json`:
   the date pill, days (`holiday` / `shortDay` flags), price (refresh `latest` on render day),
   the Wednesday-style event card, the seesaw labels, the holiday block, the tease card, the captions.
2. Register it in `src/edition.ts` (`EDITIONS`) and set `DEFAULT_EDITION`, or pass `--props='{"edition":"<id>"}'`.
3. If the week's shape changes (different day for the main event, no holiday), adjust the
   active-day moves in `src/timeline.ts` (`STRIP.moves`) and the scene for that slot.

Every number, date and time in `edition.json` must be checked against the primary source
(BEA, BLS, Federal Reserve, NYSE/CME) before rendering. Anything not real data is tagged "توضيحي".

## Render

```
npm install
export REMOTION_BROWSER=/path/to/chrome-headless-shell   # optional: use an existing browser
npx remotion render WeekAhead out/MiranGold_WeekAhead_2026-11-23.mp4 --codec=h264 --crf=18
npx remotion render WeekAheadOverlay out/MiranGold_WeekAhead_2026-11-23_overlay.mov \
  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
node scripts/export-cues.mjs          # → out/sfx_cues.csv
```

- `WeekAheadOverlay` = same video with `showBackground: false` and no audio (alpha channel), for your own edit.
- QA stills: `node scripts/stills.mjs out/qa 90 270 420 …` then `python3 scripts/sheet.py sheet.png 6 300 out/qa/*.png`.

## Sound

- `public/sfx/*.wav` — the 12 expected names (`whoosh, swish_short, pop, click_ui, tick, riser_1s, impact_soft,
  chime_gold, typing, counter_roll, paper, bass_drop`). The current files are **placeholders** synthesised by
  `python3 scripts/make-sfx.py`. Drop your own files in with the same names to replace them.
- `public/music/` — the first audio file found is the bed (placeholder: `bed_120bpm.wav`, 120 BPM, 42s).
  It ducks −6dB under the outro and fades over the last 1.5s.
- Cue list: `src/sfx.ts` (frame, sound, volume, note). Caption ticks (every 2nd word, low volume) are added
  automatically. `out/sfx_cues.csv` mirrors all of it for rebuilding the mix in an editor.

## Where things live

- `src/brand.ts` — colours, fonts, easing, springs, beat length, safe zones.
- `src/timeline.ts` — `INTRO` (intro length), shot slots (relative to the end of the intro), caption timing, day-strip moves.
- `src/scenes/Intro.tsx` — the 3s intro hook (coin + orbiting weekdays + slam title + zoom-through). Title text: `intro` in edition.json.
- `src/compositions/WeekAhead.tsx` — the composition (shots, persistent UI, captions, audio).
- `src/scenes/Part1.tsx` — hook, card stack, Wednesday thermometer, seesaw.
- `src/scenes/Part2.tsx` — holiday (calendar/clock → liquidity tank), jobs report, collapse → logo, outro.
- `src/components/` — `DayStrip`, `GlassCard`, `ChapterNumeral`, `LineChartDraw`/`CountUp`/`BarChartQ`/`Gauge` (Charts),
  `Thermometer`/`Seesaw`/`Tank` (Explainers), `CauseChain`, `NodeConstellation`, `ArabicWordReveal`, `Caption2Line`,
  `Persistent` (wordmark, date pill, disclaimer), `Shot` (camera push + whip/mask/zoom transitions), `SfxTrack`.

## Arabic rules baked in

- Real RTL (`dir="rtl"`); text animates **per word** (blur 8→0, y 24→0, 70ms stagger, right to left).
- Numbers, $, %, and Latin names are isolated (`<bdi>` / `unicode-bidi: isolate`) so they never flip.
- Western digits for prices and percentages; Arabic-Indic digits only in the date pill.
- Safe zones: nothing in the top 220px or bottom 380px; the right 140px stays clear of the action rail.
