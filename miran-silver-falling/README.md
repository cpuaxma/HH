# Miran Gold reel: لماذا انهارت الفضة؟

A 42-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 2530 frames). It's the companion to the gold reel in `../miran-gold-falling/`. It has no audio. The voiceover script is in `voiceover-script-ar.md` and reads each headline as it appears. The outro holds for music.

## What's different from the gold reel

- **Real 3D silver.** The ingot in the hook and the coin in the tip are rendered in 3D with `@remotion/three`. They use polished metal and studio reflections generated in code (`src/components/three/Studio.tsx`), so nothing is downloaded at render time.
- **One continuous camera.** Each scene is a "station". The camera glides right to left between stations with horizontal motion blur (`src/components/World.tsx`), over a reflective floor and drifting dust that parallax with it.
- **Live price HUD.** `XAG/USD` with a price, the change from the record and a sparkline (`src/components/Hud.tsx`). It counts down in sync with the chart in scene 2.
- **Silver sheen on the headlines.** Each word gets a light sweep as it lands.
- **Pull-back ending.** The camera pulls back to show the whole story as a strip of tiles before the logo.

## Render

```
npm install
npx remotion render SilverFallingAR out/silver-falling-ar.mp4 --codec=h264 --crf=18 --gl=swangle
```

`npm run render` does the same thing. `--gl=swangle` (software WebGL) is needed for the 3D on machines without a GPU, such as servers.

- **Phone/social copy:** `npm run export:phone` re-encodes the render to `out/silver-falling-ar-phone.mp4` (about 14 Mbps, under 100 MB).
- **Preview stills:** `npx remotion still SilverFallingAR out/still.png --frame=780 --gl=swangle`
- **Live preview:** `npm run studio`

## Updating the numbers

The prices are approximate, as of 30 Oct 2026. All of them live in `src/strings.ts`:
- `PRICE` drives the HUD and the chart.
- The headline strings hold the numbers that appear in the text.

The chart's shape is in `src/silverChart.ts`.

## Where things live

- `src/strings.ts`: every on-screen string and number, and which words get which accent (`silver`, `gold`, `red`, `green`, `blue`).
- `src/theme.ts`: colors, easing, safe zones, scene frame ranges, the camera glide length and the station order.
- `src/scenes/*`: one component per scene (`Hook`, `Drop`, `Versus`, `Pressure`, `Industry`, `Market`, `Tip`, `Cta`).
- `src/components/*`: shared pieces. Reused from the gold reel: `ArabicText`, `LightStreak`, `GlassCard`, `Gauge`, `Pill`, `Grain`, `BackgroundGlow`. New here: `World`, `Hud`, `LiquidColumn`, `SilverBar2D`, `IndustryIcon`, `StoryStrip`, `Wipe` and `three/*`.
- `public/logo.png`: the logo used in the CTA.
