# Miran Gold reel: لماذا ينخفض الذهب رغم الأزمات؟

A 38-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 2280 frames). It has no audio.

## Render

```
npm install
npx remotion render GoldFallingCrisisAR out/gold-falling-crisis-ar.mp4 --codec=h264 --crf=18
```

`npm run render` does the same thing.

- **Phone/social copy:** `npm run export:phone` re-encodes the render to `out/gold-falling-crisis-ar-phone.mp4` (about 8 Mbps, ~38 MB). The crf 18 master is over 100 MB, which many phones refuse to save.
- **Preview stills:** `npx remotion still GoldFallingCrisisAR out/still.png --frame=1225`
- **Live preview:** `npm run studio`

Remotion downloads its own headless Chrome the first time. To use a browser you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`. IBM Plex Sans Arabic comes bundled through @fontsource, so a render never fetches fonts.

## Where things live

- `src/strings.ts`: every on-screen string, and which words get which accent color (`gold`, `red`, `green`, `amber`).
- `src/theme.ts`: colors, easing curves, springs, motion constants, safe zones, scene frame ranges and the chain timings.
- `src/scenes/*`: one component per scene (`Hook`, `Drop`, `Oil`, `Inflation`, `Dollar`, `Panic`, `Tip`, `Cta`).
- `src/components/*`: the shared pieces (`ArabicText`, `LightStreak`, `Chain`, `GoldBar`, `OilBarrel`, `DollarCoin`, `BalanceScale`, `Gauge`, `ChartLine`, `GlassCard`, `Odometer`, `Grain`, `BackgroundGlow`, `Wipe`, and others).
- `public/logo.png`: the logo used in the CTA. If you delete it, the CTA shows a large gold "ميران جولد" wordmark instead.

## Notes

- Text animates one word at a time, never one letter at a time, so Arabic letters stay joined. Each line is kept on a single line and is scaled down if it would overflow the 800px safe column.
- Hero objects use `<CameraMotionBlur>` only while they are entering, so still frames cost nothing extra. The particles and flying coins use `<Trail>`.
- The chain (النفط ← التضخم ← الفائدة ← الدولار ← الذهب) is drawn above the scenes from frame 470 to frame 1395, so it carries across scenes 3–5.
