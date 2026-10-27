# Hot Pepper Media: "Every type of business. One agency." (maps reel)

A 25-second vertical reel (1080×1920, 60fps, 1500 frames) built in Remotion with `@remotion/three` (React Three Fiber). It's styled as a premium maps-app ad. The camera flies across a stylised, procedurally built 3D Beirut and stops at five businesses. At each stop, the business's rating and review count climb. No audio.

All five businesses are **fictional examples**. Every place card carries an "Example results" label.

```
npm install
npm run studio                     # preview and scrub in the browser
npm run stills                     # QA stills (frames 60, 300, 480, 900, 1250, 1450) → out/stills
npm run stills -- out/safe 0.5 300,1250 --safe   # same, with Instagram's UI zones drawn on top
npm run preview                    # half-res draft → out/preview.mp4
npm run render                     # final → out/hotpepper-reel.mp4 (H.264, CRF 16, yuv420p, preset slow)
npm run cover                      # PNG cover from the finale → out/hotpepper-cover.png
```

Rendering uses SwiftShader through ANGLE (`swangle`, set in `remotion.config.ts`), so it needs no GPU and every frame is deterministic. To use a Chrome Headless Shell you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`. Fonts load through `@remotion/google-fonts`: Plus Jakarta Sans for text and Noto Color Emoji for the emoji. Stay online while rendering.

## Changing things

Everything you are likely to change is in **`src/data.ts`**.

- **Businesses:** the `BUSINESSES` array. Each entry has `emoji`, `name`, `category`, `street` (shown in the nav banner), `area` (shown on the card), `rating.before/after`, `reviews.before/after` and `chip` (the red pill).
  - `mapPosition` is `[x, z]` on the stylised map, in roughly metres. North (the sea) is negative `z`.
  - Each position snaps to the nearest street corner. The route between stops is worked out automatically along the grid, and so are the banner manoeuvre ("Turn right onto …") and the distance countdown.
  - The featured building is placed on the block ahead and to the right of the arrival direction.
  - Keep stops roughly 200–350 m apart so a 1-second hop between them stays smooth.
- **Copy:** `COPY` holds the hook, the finale lines, the card caption, the "Example results" label, the wordmark and the CTA. `hookHighlight` lists the hook words drawn in red.
- **Brand colours:** `BRAND` (red `#E63922`, orange `#FF7A1A`, glow `#FF4D2E`, ink, the nav-banner green, the star colour).
- **City colours:** `CITY_COLORS` (ground, roads, curb lines, parks, water, buildings, windows, trees, the roof highlight, lights).
- **City:** `CITY.seed` gives a different but still deterministic city. `CITY.bounds` sets its size.
- **Timings:** `TIMING`, in frames at 60fps.
  - The hook ends at `hookEnd`. The dive runs to `diveEnd`.
  - Stop *i* arrives at `firstArrival + i × stopSpacing`. Each 180-frame block is `travel` frames of flight, then the dwell.
  - Then come `finaleStart`, `finaleSettled`, `finalePinsStart` and `endCardStart`. `coverFrame` is the frame used for the cover PNG.
  - The place-card choreography relative to arrival (count-up window, chip pop, exit) is `CARD` in `src/ui/PlaceCard.tsx`.
- **Camera:** `CAMERA` in `src/lib/camera.ts` sets the chase pitch and distance (55°, 300), the close-up (42°, 205), the orbit sweep (−10° → +5°), the finale height and the bank limit.
- **Safe zones:** `SAFE` in `src/data.ts`. `FOCUS_SCREEN` is where the camera target lands on screen (the middle of the safe area).

If you change the duration, keep `TIMING.durationInFrames` and the `stopSpacing` / `firstArrival` maths consistent. The finale needs about 180 frames, and the end card about 180.

## How it's built

- `src/lib/city.ts` builds the city from a seeded PRNG (`src/lib/random.ts`).
  - The street grid has jittered spacing, two diagonal avenues, and a Corniche along the sea.
  - Blocks are split into lots, with extruded buildings of 1–12 floors (taller toward the sea and the centre) and stepped tops on about a third of the mid- and high-rises.
  - Street trees line the sidewalks, and three blocks are parks.
- `src/three/City.tsx` draws the ground as merged flat layers. They are coplanar, and polygon offset orders them, so nothing z-fights.
  - Buildings are one instanced mesh with a shader-patched `MeshStandardMaterial` (roughness 0.9): window rows come from world position, and the walls darken softly near the ground.
  - Trees are instanced low-poly icosahedrons on thin trunks.
- `src/lib/route.ts` turns the stop corners into an L-shaped path with rounded corners, resampled every 0.5 m. `src/three/Route.tsx` draws it in two parts:
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

## Layout and safe zones

Instagram covers the top 220 px, the bottom 400 px and the right 140 px.

- **Nav banner:** y 242–414.
- **Place card:** ends at y 1496.
- **Finale card:** starts at y 250.
- **Width:** text and cards stay within x 60–920.
- **Camera target:** lands at (490, 860), the middle of the safe area, through `setViewOffset`.
