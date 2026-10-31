# Avantis: "Your global passport in IFRS" (DipIFR reel)

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) announcing the Avantis DipIFR course. It's built in Remotion with `@remotion/three` (React Three Fiber), so every frame is computed from the frame number and renders the same way every time. No audio: music is added in Instagram.

1. **Hook (0–3s):** a white 3D globe on off-white. A navy pin drops onto New York with a bounce and pulses, and "One certificate. Recognised worldwide." builds word by word.
2. **Global (3–9s):** the camera glides east around the globe. Navy routes draw hub to hub (New York → London → Beirut → Dubai → Singapore), and an "IFRS" tag pops at each hub. The title says what DipIFR is.
3. **Course (9–21s):** the camera dives in and the route becomes the journey. A navy dot travels back along it and stops once per module. At each stop a white card slides up with the module's number, name and what you'll learn. A banner at the top shows the course format.
4. **Benefits (21–26s):** the camera pulls back and three quick cards stack in.
5. **End card (26–30s):** a soft blur and fade to off-white. The traced Avantis logo builds layer by layer (shield, laurels, wordmark, tagline), followed by the launch line and the CTA. The last second holds.

The continents are rough outlines drawn by hand in `src/lib/land.ts`; the reel uses no map data or map APIs.

```
npm install
npm run studio          # preview and scrub in the browser
npm run stills          # QA stills, one per scene → out/stills (half size)
npm run stills -- out/safe 0.5 90,660,1400,1790 --safe   # with Instagram's UI zones drawn on top
npm run preview         # half-res draft → out/preview.mp4
npm run render          # final → out/avantis-dipifr-reel.mp4 (H.264, CRF 16, yuv420p, preset slow, no audio)
npm run cover           # 1080×1920 PNG cover (TIMING.coverFrame) → out/avantis-dipifr-cover.png
npm run check:camera    # numeric camera smoothness check
npm run check:video     # scans the final MP4 for black, flickering or glitched frames
npm run trace-logo      # re-trace assets/avantis-logo.jpg → src/lib/logoTrace.ts (needs: pip install potracer numpy pillow)
```

### Rendering in this environment

- **Browser and WebGL:** rendering uses SwiftShader through ANGLE (`swangle`, set in `remotion.config.ts`), so no GPU is needed. Point `REMOTION_BROWSER` at a local Chrome Headless Shell, e.g. `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
- **Concurrency:** keep it at 1. Software WebGL already uses every core.
- **Long renders:** run them detached (`setsid nohup npm run render > out/render.log 2>&1 &`) and poll the log.
- **Fonts:** they load from Google Fonts. If Chrome reports `ERR_CERT_AUTHORITY_INVALID`, the sandbox's egress CAs (the `Anthropic … Egress Gateway CA` and `TLS Inspection CA` certificates in `/root/.ccr/ca-bundle.crt`) must be in Chrome's NSS store. Add each with `certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n <name> -i <cert.pem>`. Don't disable TLS checks.

## Changing things

Everything you are likely to change is in **`src/data.ts`**. Text marked `PLACEHOLDER` there stands in for details the brief left open. Replace it before publishing.

- **Copy:** `COPY` holds all of the on-screen text except the modules and benefits:
  - the hook, and `hookHighlight` (the hook words drawn in navy)
  - the global eyebrow and title
  - the hub tag ("IFRS")
  - the course banner eyebrow
  - the benefits eyebrow (your audience) and title
  - the end card's launch line (`launch`) and button (`cta`)
- **Modules:** in `MODULES`, each module has a `title` and a `learn` line.
  - The journey runs back along the route from the last hub, so module 1 stops at Dubai, 2 at Beirut, 3 at London and 4 at New York.
  - `HUBS` needs one more entry than `MODULES`. To add a module, add a hub too, and check the timings below.
  - The card numbers ("01", "MODULE 1 OF 4") and the progress bar are worked out automatically.
- **Course format:** `COURSE_FORMAT`, the chips in the banner. Keep it to about three short items so they fit on one line.
- **Benefits:** in `BENEFITS`, each card has an `icon` (`globe`, `award`, `briefcase`, `chart` or `book`), a `title` and a `text` line.
- **Hubs:** in `HUBS`, each hub has a name, longitude and latitude, in route order. `tag` says where its IFRS tag sits next to the pin (`up`, `left` or `right`), so close hubs don't overlap.
- **Colours:**
  - `BRAND.navy` and `BRAND.grey` were sampled from the logo: `#0B2351` and `#545454`. `BRAND.background` is the warm off-white.
  - `CARD_COLORS` sets the card text hierarchy: heading `#111111`, body `#333333`, meta `#777777`, dividers `#EAEAEA`, white cards.
  - `GLOBE_COLORS` covers the ocean, land dots, graticule, haze and the faded route.
  - The logo itself always uses its own sampled colours.
- **Timings** are in `TIMING`, in frames at 60fps (60 frames = 1 second):
  - **Hook:** `pinDrop`, `hookWordsStart` / `hookWordGap` (word by word) and `hookOut`.
  - **Global:** `globalTitleIn`, `routeStart` and `legLength` (one route leg per hub), and `globalOut`.
  - **Course:** `diveStart` / `diveEnd`, `journeyStart`, `firstArrival` and `stopSpacing` (module *i* arrives at `firstArrival + i × stopSpacing`).
    - `travel` sets the travel time between stops. It grows with the distance, so long hops stay smooth, and `minDwell` keeps time for reading each card.
    - The card choreography relative to its arrival is `CARD` in `src/ui/Course.tsx`.
  - **Benefits:** `pullOutStart` / `pullOutEnd` (camera), `benefitsIn`, `benefitGap` (between the cards) and `benefitsOut`.
  - **End card:** `endCardStart`. The logo, launch line and CTA steps relative to it are `END` in `src/ui/EndCard.tsx`.
  - **Cover:** `coverFrame` is the frame exported as the PNG cover.
  - **Changing the length:** keep `durationInFrames` and the scene timings consistent, and run `npm run check:camera` afterwards.
- **Layout:**
  - `SAFE` holds Instagram's covered edges (top 220, bottom 400, right 140).
  - `COLUMN` is the centred column all text and cards use (x 140–940).
  - `FOCUS_Y` is where the globe, or the journey's focus point, sits on screen in each scene.
- **Camera:** `CAMERA` in `src/lib/camera.ts` sets the distance, tilt and target depth for each scene, the global and benefits glide (longitude/latitude ranges) and the smoothing window.

## How it's built

- **Globe (`src/three/Globe.tsx`):**
  - **Sphere:** a matte white sphere with a faint 15° graticule drawn in the shader.
  - **Land:** about 12,000 instanced, softly rounded dots. Each dot of an even latitude grid is kept if it falls inside one of the continent outlines in `src/lib/land.ts`.
  - **Haze:** a light haze fades the surface toward the edge, and a soft halo sprite sits behind the globe.
- **Lighting (`src/three/Scene.tsx`):** a key light travels with the camera, so the globe is always lit from the upper left. A hemisphere light fills the shadows. The raised route arcs cast soft PCF shadows onto the globe.
- **Post-processing:** SMAA anti-aliasing. Depth of field (quarter resolution) runs only during the close-ups. There's no bloom.
- **Route (`src/lib/geo.ts`, `src/three/Route.tsx`):**
  - The route is great-circle arcs between hubs, lifted in the middle, resampled every 0.25 units and drawn as one tube.
  - It draws forward with `setDrawRange`. It keeps a steady on-screen thickness by scaling about its centre line in the vertex shader; the shadow pass uses the same scaling.
  - During the course, the untravelled part fades to grey-blue and the travelled part stays navy.
- **Camera (`src/lib/camera.ts`):**
  - Each scene has its own camera plan: which point it hovers over, its distance, its tilt and what it looks at. The plans blend with cubic in/out weights.
  - Every track is then precomputed for the whole reel and Gaussian-smoothed over time, so blends and stops can't produce a sudden turn.
  - Slow layered sines add a slight hand-held drift.
  - `scripts/check-camera.ts` prints the largest frame-to-frame jerks and turns, and flags any spike above its neighbourhood.
- **Overlays (`src/ui/*`):**
  - Pins, IFRS tags and the travelling dot are crisp HTML/SVG. They're placed by projecting their 3D positions with the same camera, and fade as their hub turns toward the globe's edge.
  - Cards, titles and the end card are HTML.
- **Logo (`scripts/trace-logo.py` → `src/lib/logoTrace.ts`, drawn by `src/ui/Logo.tsx`):**
  - The JPEG is upscaled 4× and split into layers by colour and position: the shield, its white "A", the left and right laurels, the wordmark and the tagline. Each layer is traced with potrace into SVG paths.
  - The navy and grey are sampled from the logo's solid interiors.
  - The wordmark and tagline keep the original's soft drop shadow.

## Layout and safe zones

Instagram covers the top 220 px, the bottom 400 px and the right 140 px. All text and cards sit in the centred column x 140–940:

- **Top elements:** the course banner and the titles start at y ≈ 242.
- **Bottom elements:** module cards and benefit cards end at y 1496.
- **End card:** spans roughly y 420–1300.
