# Miran Gold reel: الذهب أم الأسهم؟

A 33-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 1980 frames). One composition, `GoldVsStocksAR`.

## Render

```
npm install
npx remotion render GoldVsStocksAR out/gold-vs-stocks-ar.mp4 --codec=h264 --crf=18
```

Codec, CRF, pixel format (yuv420p) and colour space (bt709) are also set in `remotion.config.ts`, so `npm run render` gives the same result.

- **QA stills (one bundle, many frames):** `node scripts/stills.mjs 90 325 655 985 1285 1585 1855` writes `out/stills/fNNNN.png`
- **Single still:** `npx remotion still GoldVsStocksAR out/still.png --frame=325`
- **Live preview:** `npm run studio`

Remotion downloads its own headless Chrome the first time. To use a browser you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`. IBM Plex Sans Arabic (300 and 600) is bundled through @fontsource, so rendering never fetches fonts.

## Scenes

| # | Frames | Text |
|---|---|---|
| 1 Hook | 0–180 | الذهب أم الأسهم… / أيهما أفضل لأموالك؟ |
| 2 | 170–480 | الأسهم حصة في شركات / تنمو وتربح. |
| 3 | 470–840 | الذهب لا يُنتج أرباحاً… / لكنه يحفظ القيمة. |
| 4 | 830–1140 | في الأزمات، تهبط الأسهم / غالباً ويصمد الذهب. |
| 5 | 1130–1440 | على المدى الطويل: / الأسهم للنمو، والذهب للحماية. |
| 6 Tip | 1430–1740 | السؤال ليس «أيهما»… بل «كم من كلٍّ منهما». / كثيرون يوزّعون أموالهم بين الاثنين حسب أهدافهم. |
| 7 CTA | 1730–1980 | انضم إلى مجتمع ميران جولد. / الرابط في البايو. |

Scenes overlap by 10 frames on purpose, so there are no hard cuts. The chart in scene 4 and the donut split in scene 6 are illustrative shapes, not real data.

## Where things live

- `src/strings.ts`: every on-screen string, plus the words shown in gold (`gold`), stocks blue (`blue`), loss red (`red`) or plain weight 600 (`key`).
- `src/theme.ts`: colours, easing curves, springs, motion constants, safe zones and the scene frame ranges.
- `src/scenes/*`: one component per scene (`Hook`, `Stocks`, `GoldValue`, `Crisis`, `LongTerm`, `Tip`, `Cta`).
- `src/components/*`: shared pieces (`ArabicText`, `LightStreak` with `gold` / `blue` / `goldToBlue` variants, `GoldBar`, `Candles`, `ChartLine`, `GlassCard`, `Donut`, `BackgroundGlow`, `Grain`).
- `public/logo.png`: the logo, cropped to a circle from `assets/logo-source.jpg`. If you delete it, the CTA falls back to a gold "ميران جولد" wordmark.

Text animates one word at a time, never letter by letter, so Arabic letters keep joining. Latin tokens (XAU/USD, S&P 500, VS) are wrapped in `<bdi>`. Everything important stays inside x 140–940 and above y 1600 (right and bottom safe zones).
