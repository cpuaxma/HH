# Hot Pepper Media: services overview reel

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) built in Remotion. One composition, `HpmServices`.

## Render

```
npm install
npm run render            # out/hpm-services.mp4 (H.264, CRF 18, yuv420p)
npm run studio            # preview and scrub in the browser
npm run stills            # review stills at every scene and services-beat midpoint → out/stills/
```

Rendering is frame by frame through `remotion render`. Montserrat comes from `@fontsource/montserrat` (500, 600, 800) and is bundled locally. To use a Chrome or Chromium you already have, add `--browser-executable=/path/to/chrome` to the render, or set `REMOTION_BROWSER` for `npm run stills`.

## Files

- `src/theme.ts`: colours, type sizes, safe area, easing curves (`EASE_OUT`, `EASE_IN`, `EASE_IN_OUT`), the `KICK` spring and text timing.
- `src/copy.ts`: every on-screen string. `*words*` in a headline are set in Hot Red. Each array entry is one line.
- `src/timeline.ts`: the scene `<Sequence>` frame ranges (they overlap on purpose), the services beat step, the process word spacing and the flood timing.
- `src/layout.ts`: positions shared between scenes and the red line. The headline size is computed with `fitText` so every headline fits the safe column, capped at 140px.
- `src/HpmServices.tsx`: font loading, layer order and the scene sequences.
- `src/scenes/`: `Hook`, `OneTeam`, `Services`, `Process`, `Cta`. Each has a `T` object with its local cue frames.
- `src/components/`: `MaskReveal`, `TrackingLabel`, `BrandLine`, `PepperDraw`, `ServiceCard`, `LineIcon`, `Grain`.
- `scripts/prepare-assets.py`: rebuilds `public/logo-reversed.png` (cropped, recoloured to Cream) and `public/grain.png`.

## The red line

`BrandLine` is one 4px path with seven anchors in every shape (hook curl, underline, services divider, process S-curve, flood diagonal), so shapes morph point by point. Between services beats it retracts to the right and redraws in the opposite wave. At frame 1430 it moves above the scene content, thickens to 2400px and sweeps diagonally to flood the frame red. The process dot is placed on the live path, so it follows the line exactly.

## Logo files

- `public/logo-reversed.png`: made from `../assets/logo-reversed.png`, which is itself a stand-in derived from the primary logo. Replace the source and rerun `python3 scripts/prepare-assets.py`.
- **Pepper outline:** a placeholder traced from the logo lives in `PepperDraw.tsx`. Drop a stroke-only `public/pepper-icon.svg` in and it is used automatically. Each `path`, `circle`, `line` or `polyline` draws in turn, in document order. Strokes keep their own colour and width. Any fill fades in on the kick.

## Rules the code follows

- **Headlines** reveal per character, 1.2 frames apart, sliding up from behind a line mask with the kick spring (`damping 14, stiffness 160`). They exit per word, moving up 40px and fading out, 2 frames apart.
- **Labels** fade in while their letter-spacing tightens from 0.3em to 0.08em.
- **Easing:** everything that isn't a hero element enters on `bezier(0.16, 1, 0.3, 1)`. Exits use cubic-in and run about 40% shorter.
- **Line icons** come from lucide-react at stroke width 1.75. They draw in with a CSS dash driven by `--dash`.
- **Safe area:** key content stays inside x 80–940 and above y 1600.
