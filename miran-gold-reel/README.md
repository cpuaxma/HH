# Miran Gold reel: لماذا يلجأ العالم إلى الذهب وقت الأزمات؟

A 33-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 1980 frames).

## Render

```
npm install
npx remotion render GoldSafeHavenAR out/gold-safe-haven-ar.mp4 --codec=h264 --crf=18
```

Codec, CRF and pixel format are also set in `remotion.config.ts`, so `npm run render` gives the same result.

- **Preview stills:** `npx remotion still GoldSafeHavenAR out/still.png --frame=325`
- **Live preview:** `npm run studio`

Remotion downloads its own headless Chrome the first time. To use a browser you already have, set `REMOTION_BROWSER=/path/to/chrome`. IBM Plex Sans Arabic is bundled through @fontsource, so rendering never fetches fonts.

## Where things live

- `src/strings.ts`: every on-screen string, plus the words shown in gold (`gold`) or fiat red (`red`).
- `src/theme.ts`: colors, easing curves, springs, motion constants, safe zones and the scene frame ranges.
- `src/scenes/*`: one component per scene.
- `src/components/*`: shared pieces (`ArabicText`, `LightStreak`, `GoldBar`, `GoldCube`, `ChartLine`, `GlassCard`, `BackgroundGlow`, `Grain`).
- `public/logo.png`: the logo, cropped to a circle from `assets/logo-source.jpg`. If you delete it, the CTA falls back to a gold "ميران جولد" wordmark.

Text animates one word at a time, never letter by letter, so Arabic letters keep joining.
