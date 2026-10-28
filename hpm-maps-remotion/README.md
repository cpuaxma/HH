# Hot Pepper Media: "Every type of business. One agency." (maps reel)

A 25-second vertical reel (1080×1920, 60fps, 1500 frames) built in Remotion with `@remotion/three` (React Three Fiber). It's styled as a premium maps-app ad. The camera flies across a stylised, procedurally built 3D Beirut and stops at five businesses. At each stop, the business's rating and review count climb. No audio.

The route is the pepper from the Hot Pepper Media logo. It runs along a curved boulevard through the city, and when the camera pulls up in the finale the head finishes the stem and the whole route reads as the logo's pepper. The end card shows the logo itself, traced from `assets/logo-primary.png`.

All five businesses are **fictional examples**. Every place card carries an "Example results" label.

```
npm install
npm run studio                     # preview and scrub in the browser
npm run stills                     # QA stills (frames 60, 300, 480, 900, 1250, 1450) → out/stills
npm run stills -- out/safe 0.5 300,1250 --safe   # same, with Instagram's UI zones drawn on top
npm run preview                    # half-res draft → out/preview.mp4
npm run render                     # final with sound effects → out/hotpepper-reel.mp4 (H.264, CRF 16, yuv420p, preset slow)
npm run render:silent              # same, no audio track → out/hotpepper-reel-silent.mp4
npm run sfx:wav                    # the sound effects alone → out/hotpepper-sfx.wav (renders in ~30s)
npm run sfx:make                   # regenerate the effect sounds in public/sfx (needs numpy)
npm run audio:wav                  # effects + voiceover alone → out/hotpepper-audio.wav
npm run cover                      # PNG cover from the finale → out/hotpepper-cover.png
```

Rendering uses SwiftShader through ANGLE (`swangle`, set in `remotion.config.ts`), so it needs no GPU and every frame is deterministic. To use a Chrome Headless Shell you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`. Fonts load through `@remotion/google-fonts`: Plus Jakarta Sans for text and Noto Color Emoji for the emoji. Stay online while rendering.

## Changing things

Everything you are likely to change is in **`src/data.ts`**.

- **Businesses:** the `BUSINESSES` array. Each entry has `emoji`, `name`, `category`, `street` (shown in the nav banner), `area` (shown on the card), `rating.before/after`, `reviews.before/after` and `chip` (the red pill).
  - `along` is where the stop sits on the pepper route, 0–1 of the way round, clockwise from the base of the stem (about 0.1 the right side, 0.4 the bottom, 0.55 the tip, 0.75 the top edge).
  - Keep the stops in order, keep the last ~20% (hump, calyx and stem) free for the finale, and space them roughly 0.12–0.22 apart so a 1-second hop stays smooth.
  - Each featured building sits just inside the pepper, facing the boulevard. A stop slides a little along the route if its building would land on a street.
  - The banner manoeuvre ("Continue on …" / "Turn right onto …") and the distance countdown are worked out from the route.
- **Pepper route:** `PEPPER_ROUTE` sets where the pepper sits on the map (`center`), its size (`width`, map units) and the boulevard width.
- **Copy:** `COPY` holds the hook, the finale lines, the card caption, the "Example results" label and the CTA ("DM US"). `hookHighlight` lists the hook words drawn in red.
- **Brand colours:** `BRAND` (red `#E63922`, orange `#FF7A1A`, glow `#FF4D2E`, ink, the nav-banner green, the star colour).
- **City colours:** `CITY_COLORS` (ground, roads, curb lines, parks, water, buildings, windows, trees, the roof highlight, lights).
- **City:** `CITY.seed` gives a different but still deterministic city. `CITY.bounds` sets its size.
- **Timings:** `TIMING`, in frames at 60fps.
  - The hook ends at `hookEnd`. The dive runs to `diveEnd`.
  - Stop *i* arrives at `firstArrival + i × stopSpacing`. Each 180-frame block is `travel` frames of flight, then the dwell.
  - Then come `finaleStart`, `finaleSettled`, `routeComplete` (the pepper closes and pulses once), `finalePinsStart` and `endCardStart`. `coverFrame` is the frame used for the cover PNG.
  - The place-card choreography relative to arrival (count-up window, chip pop, exit) is `CARD` in `src/ui/PlaceCard.tsx`.
- **Camera:** `CAMERA` in `src/lib/camera.ts` sets the chase pitch and distance (55°, 300), the close-up (42°, 205), the orbit sweep (−10° → +5°), the finale height and the bank limit.
- **Layout:** `SAFE` in `src/data.ts` holds Instagram's covered edges. `COLUMN` is the centred column all text and cards use (equal 140 px margins, so it is centred and clear of Instagram's buttons). `FOCUS_SCREEN` is where the camera target lands on screen (centred horizontally).
- **Place card:** the rating and the review count are the two big stats; each counts up and shows its gain ("▲ +1.2", "▲ +1,238") next to the old value, and the review bar fills from before to after. Its colours are `CARD_COLORS`: near-black name and numbers, grey labels and metadata, gold stars and growth bar. Brand red is only an accent: the stat chip and the small up-arrows.

If you change the duration, keep `TIMING.durationInFrames` and the `stopSpacing` / `firstArrival` maths consistent. The finale needs about 180 frames, and the end card about 180.

## How it's built

- `src/lib/city.ts` builds the city from a seeded PRNG (`src/lib/random.ts`).
  - The street grid has jittered spacing, two diagonal avenues, and a Corniche along the sea.
  - Blocks are split into lots, with extruded buildings of 1–12 floors (taller toward the sea and the centre) and stepped tops on about a third of the mid- and high-rises.
  - Street trees line the sidewalks, and three blocks are parks.
  - The pepper boulevard is cut through the grid; curb lines follow it and stop where it crosses streets.
- `src/three/City.tsx` draws the ground as merged flat layers. They are coplanar, and polygon offset orders them, so nothing z-fights.
  - Buildings are one instanced mesh with a shader-patched `MeshStandardMaterial` (roughness 0.9): window rows come from world position, and the walls darken softly near the ground.
  - Trees are instanced low-poly icosahedrons on thin trunks.
- `scripts/trace-logo.py` traces `assets/logo-primary.png` into `src/lib/logoTrace.ts` (needs `pip install potracer numpy pillow`):
  - **Logo layers:** the red lettering and the black pepper become SVG paths, used by the end card (`src/ui/Logo.tsx`).
  - **Pepper outline:** the letters hide stretches of the pepper line, so the outline comes from hand-placed guide points snapped onto the visible line and joined by a spline. It becomes the route.
- `src/lib/route.ts` scales that outline onto the map, resampled every 0.5 m. The city keeps buildings and trees off it and lays a curved boulevard along it. `src/three/Route.tsx` draws the route in two parts:
  - The **tube** draws forward with `setDrawRange`. Its red→orange gradient runs toward the head.
  - A soft **glow ribbon** sits on the ground beneath it.
  - Both thicken with camera distance so the route still reads from the top-down finale.
- `src/lib/camera.ts` computes the whole camera from the frame number: no state and no `useFrame`.
  - **Chase:** follows the route head; the heading is smoothed with a Gaussian filter over time and banks on turns.
  - **Close-up:** each stop has its own eased weight, which pushes in, lowers the pitch and orbits the pin.
  - **Dive and finale:** a log-distance dive at the start, and a pull-up into a north-up top-down view at the end.
  - **Drift:** slow layered sines add a hand-held feel.
- `src/three/Scene.tsx` sets up the lights and the post-processing.
  - **Lights:** a warm sun with a 4096 PCF-soft shadow map over a fixed frustum (so shadows never shimmer), plus a hemisphere fill and distance-based fog.
  - **Post-processing:** depth of field only during close-ups, and a light bloom (threshold 1.0) that only the HDR route head and the pins reach.
  - The vignette is a CSS layer in `src/HpmMaps.tsx`.
- `src/ui/*` holds the HTML overlays: the hook, the nav banner, the place card, the finale line and the end card. `src/lib/pepper.ts` is the pepper-pin artwork, shared by the SVG and the 3D sprite texture.

## Sound effects

Every effect is synthesised from sine waves and filtered noise by `scripts/make-sfx.py` (original, license-free, identical on every run) into `public/sfx/`. `src/sound.tsx` places them, and every cue comes from the same timings as the visuals, so retiming a scene moves its sounds too. They are soft and mid-range so they sit under the music you add in Instagram and still read on phone speakers.

| Moment | Sound |
|---|---|
| Pin drops in | a soft thunk on each bounce, quieter each time |
| Headline | a tiny tick per word |
| Dive | air rushing past, settling as the camera levels out |
| Route drawing | a faint pen-on-paper hum whose volume follows the head's speed |
| Nav banner | a short swipe |
| Pin on each business | a pop, a step higher at each stop |
| Rating counting up | a tick per 0.1 step on a rising scale, then a ding when it lands |
| Stat chip | a bloop |
| Finale pins | tiny pips, one per pin |
| Pepper completes | a rising swoosh into a click on the frame it closes, then a shimmer with the glow |
| End card | a warm whomp for the logo, a tap for "DM US" |

- **Overall level:** `SFX_MASTER` in `src/sound.tsx`. Each cue has its own volume in `getCues()`.
- **Without effects:** `npm run render:silent`, or pass `sfx: false` as a prop.
- **Adding the effects to an existing silent render** (no re-render of the picture): `npm run sfx:wav`, then
  `ffmpeg -i out/hotpepper-reel-silent.mp4 -i out/hotpepper-sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest out/hotpepper-reel-sfx.mp4`

## Voiceover

Three short lines, timed to beats: "Okay… watch this." as the pin lands, "And another one!" as the third card's numbers climb, and "Your turn." just before the DM US button. The effects dip under the voice (`VOICEOVER.duckTo`).

- **Lines and timing:** `VOICEOVER` in `src/data.ts` (`at` is the start frame of each line).
- **Voice:** Supertonic 3 by Supertone (model licence OpenRAIL-M, which allows commercial use), run locally through sherpa-onnx. Voices 0–4 are female, 5–9 male; the reel uses voice 3.
- **Regenerating** (after changing the text, also update `LINES` in the script):
  ```
  pip install sherpa-onnx soundfile librosa numpy
  # download and unpack into MODELS_DIR from github.com/k2-fsa/sherpa-onnx/releases:
  #   tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2
  #   asr-models/sherpa-onnx-whisper-small.en.tar.bz2
  python3 scripts/make-voiceover.py MODELS_DIR 3      # → public/vo/*.wav and src/voLengths.ts
  ```
  The script renders a few takes of each line, has Whisper check every word, keeps the liveliest take, gives it a light polish (warmth, presence, gentle compression, a very short room) and levels it to lead the mix.

## Layout and safe zones

Instagram covers the top 220 px, the bottom 400 px and the right 140 px.

- **Nav banner:** y 242–414.
- **Place card:** ends at y 1496.
- **Finale card:** starts at y 250.
- **Width:** text and cards sit in a centred column, x 140–940.
- **Camera target:** lands at (540, 760), centred between the banner and the card, through `setViewOffset`.
