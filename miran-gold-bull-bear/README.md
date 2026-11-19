# Miran Gold: ثور أم دب؟ (Bull vs Bear)

A 45-second vertical Arabic reel built in Remotion: 1080×1920, 30fps, 1350 frames. The video is black and gold, with green and red candles. All text is RTL in Cairo, with Eastern Arabic digits and gold-highlighted captions. Scenes cross-fade in 0.4s.

| # | Scene | Time | File |
|---|-------|------|------|
| 1 | Hook: gold flash, bull and bear slam in, screen shake | 0–3s | `src/scenes/Hook.tsx` |
| 2 | Bull market: green candles, the bull rises, +٢٠٪ | 3–13s | `src/scenes/BullMarket.tsx` |
| 3 | Bear market: red candles fall, the bear slides in, -٢٠٪ | 13–23s | `src/scenes/BearMarket.tsx` |
| 4 | Comparison: split screen with a gold divider | 23–31s | `src/scenes/Comparison.tsx` |
| 5 | What to do: three gold keywords, then the closing line | 31–39s | `src/scenes/WhatToDo.tsx` |
| 6 | Outro: logo shine, t.me/Mirangold1, footer | 39–45s | `src/scenes/Outro.tsx` |

## Files you supply (in `public/`)

| File | Required? | Notes |
|------|-----------|-------|
| `logo.png` | Yes | Shown unaltered in the outro. A copy of the Miran Gold logo from the other projects in this repo is already here; overwrite it to use a different file. A transparent PNG looks best. |
| `voiceover.mp3` | Optional | Plays from 0:00 at full volume. Keep it at 45 seconds or less (anything longer is cut). |
| `music.mp3` | Optional | Loops at low volume (8% under the voice-over, 20% without one), with a fade in and out. |

When the composition loads, it checks which of these files exist (`calculateMetadata` in `src/Root.tsx`). A missing file is skipped, so the video still renders without crashing. A missing logo shows a gold ring instead.

## Preview and render

```bash
npm install
npm run dev                                            # Remotion Studio preview
npx remotion render BullVsBear out/bull-vs-bear.mp4   # or: npm run render
```

`remotion.config.ts` sets H.264 output at CRF 20 with the x264 `slow` preset, `yuv420p`, and BT.709. Output is about 60 MB.

If Remotion can't download its headless browser (for example on an offline server), point it at an installed Chromium:
`REMOTION_BROWSER=/path/to/chrome-headless-shell npx remotion render ...`

## Syncing captions to your voice-over

Captions are in `src/captions.ts`. Each line has `start` and `end` times in seconds, and key words are wrapped in `*asterisks*` to turn them gold. The current timings are estimates. After adding `voiceover.mp3`, scrub through it in `npm run dev` and adjust the numbers.

Some on-screen beats are timed by their own constants and may need nudging too:
- `T` in `src/components/MarketScene.tsx` covers scenes 2–3: the candles, the counter, the mood chips, and the horn and claw strike.
- `LEFT.start` and `RIGHT.start` in `src/scenes/Comparison.tsx` set when each side's rows come in.
- `ITEMS[].at` and `CLOSER_AT` in `src/scenes/WhatToDo.tsx` set when each keyword pops in and when the closing line fades in.

Lines marked `onScreen: true` already appear as big text in the scene, so the caption band stays empty for them.

## Where things live

- `src/constants.ts`: colours, fonts, safe zone (250px top / 340px bottom), scene timing, springs, audio levels.
- `src/BullVsBear.tsx`: the scene `<Sequence>`s, captions, grain and vignette, and the `<Audio>` tracks.
- `src/components/Silhouettes.tsx`: the gold-outline bull and bear (SVG paths).
- `src/components/Candles.tsx`: candle data and the chart.
