# Miran Gold reel: لماذا يرتفع الذهب وقت التوترات؟

A 33-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 1980 frames).

## Render

```
npm install
npx remotion render GoldTensionsAR out/gold-tensions-ar.mp4 --codec=h264 --crf=18
```

Codec, CRF and pixel format are also set in `remotion.config.ts`, so `npm run render` gives the same result.

- **Preview stills:** `npx remotion still GoldTensionsAR out/still.png --frame=325`
- **Live preview:** `npm run studio`

Remotion downloads its own headless Chrome the first time. To use a browser you already have, set `REMOTION_BROWSER=/path/to/chrome`. IBM Plex Sans Arabic is bundled through @fontsource, so rendering never fetches fonts.

## Where things live

- `src/strings.ts`: every on-screen string, plus the words shown in gold (`gold`) or tension red (`red`).
- `src/theme.ts`: colors, easing curves, springs, motion constants, safe zones and the scene frame ranges.
- `src/sound.tsx`: the sound cues and levels.
- `src/scenes/*`: one component per scene (`Hook`, `Fear`, `Independent`, `Markets`, `History`, `Tip`, `Cta`).
- `src/components/*`: shared pieces (`ArabicText`, `LightStreak`, `GoldBar`, `DottedMap`, `Particles`, `Odometer`, `ChartLine`, `GlassCard`, `BackgroundGlow`, `Grain`).
- `public/logo.png`: the logo, cropped to a circle from `assets/logo-source.jpg`. If you delete it, the CTA falls back to a gold "ميران جولد" wordmark.

The dotted map is generated at render time from `world-atlas` land-110m with d3-geo. The red "tension" spots are random and abstract: no labels, no countries.

## Sound

All the sound effects are synthesised by `scripts/make-sfx.py` (numpy only) into `public/sfx/`: original sounds, with no library samples. `src/sound.tsx` decides when each one plays, using the same timings as the visuals, so retiming a scene moves its sounds too. A normal render includes the audio.

- **Regenerate the sounds:** `python3 scripts/make-sfx.py`
- **Render only the sound mix** (for editing with a voiceover): `npx remotion render GoldTensionsAR out/sfx-mix.wav --codec=wav`
- **Levels:** `SFX_MASTER` and `BED_VOLUME` (the ambient pad) are at the top of `src/sound.tsx`. Set `BED_VOLUME` to 0 if you add music.

The mix sits around -21 LUFS with a peak near -6 dBFS, leaving room for a voiceover on top.

Text animates one word at a time, never letter by letter, so Arabic letters keep joining. Red words and visuals carry a small noise-driven jitter; gold stays calm.
