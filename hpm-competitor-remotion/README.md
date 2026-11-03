# Hot Pepper Media: "Your competitor just posted." (FOMO reel)

A 20-second vertical reel (1080×1920, 60fps, 1200 frames) built in Remotion with `@remotion/three` (React Three Fiber) and `@remotion/motion-blur`. Two original, unbranded 3D phones float in an off-white studio. Theirs (Grind House) is blowing up. Yours (Bean Corner) is dead. Then a red pepper streak whips across, your phone flips, and it comes back lit. A re-framed 4:5 version (1080×1350) is included for feed ads.

Both businesses, every handle and every number are **fictional examples**. The stats carry an "Example" label.

```
npm install
npm run studio          # preview and scrub in the browser
npm run stills          # QA stills → out/stills (args: outDir scale frames [--safe] [--feed])
npm run stills -- out/safe 0.5 90,250,690,940 --safe   # with Instagram's UI zones drawn on top
npm run stills:feed     # the same frames in the 4:5 version
npm run check:camera    # numerical jerk check of the camera path (both formats)
npm run preview         # half-res draft → out/preview.mp4
npm run render          # final, with sound → out/hotpepper-competitor.mp4 (H.264, CRF 16, yuv420p, preset slow)
npm run render:4x5      # final 4:5 → out/hotpepper-competitor-4x5.mp4
npm run render:silent   # no audio → out/hotpepper-competitor-silent.mp4
npm run sfx:wav         # the sound effects alone → out/hotpepper-competitor-sfx.wav
npm run cover           # 1080×1920 PNG cover → out/hotpepper-competitor-cover.png
npm run scan -- out/hotpepper-competitor.mp4   # flicker / black / glitched frame scan
```

`scripts/render-all.sh` does the whole delivery. It renders each format once without audio, renders the two audio mixes as WAVs, muxes them on (so the picture is never rendered twice), then scans every file:

- `hotpepper-competitor.mp4`: effects and voiceover
- `hotpepper-competitor-sfx.mp4`: effects only
- `hotpepper-competitor-silent.mp4`
- the same three for 4:5
- `hotpepper-competitor-sfx.wav`
- the cover PNG

Rendering uses SwiftShader through ANGLE (`swangle`, set in `remotion.config.ts`), so it needs no GPU and every frame is deterministic. Set `REMOTION_BROWSER=/path/to/chrome-headless-shell` to use a Chrome Headless Shell you already have; the config falls back to the one in `/opt/pw-browsers` if it exists. Fonts load through `@remotion/google-fonts` (Archivo Black, Inter, Noto Color Emoji), so stay online. If Chrome can't load Google Fonts with a certificate error, add your network's TLS-inspection CA to Chrome's NSS store (`certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n name -i ca.crt`); never turn TLS checks off. A full-resolution render takes about an hour at concurrency 1, so run it detached (`setsid nohup … &`).

## Changing things

Everything you are likely to change is in **`src/data.ts`**.

- **Business names, handles, avatars:** `YOU` and `COMPETITOR`.
  - `name`, `handle`, `monogram` (the two letters on the avatar), `avatarBg` / `avatarInk`, `location`, `bio`.
  - The posts: `YOU.deadPost.caption` (`Open today ☕`), `YOU.newPost` (headline lines, kicker, caption) and `COMPETITOR.post`.
  - The post images are drawn in `src/screens/art.ts` from those headline lines.
- **Street:** `STREET` (`Mar Mikhael, Beirut`).
- **Numbers:** `NUMBERS`.
  - Counters are `[frame, value]` keyframes joined by a smooth curve, e.g. `competitorLikes` 214 → 8,420 between frames 200 and 300.
  - Also: `competitorComments`, `competitorNewFollowers` (the "+1,236 new followers" toast), `competitorFollowers`/`Posts`/`Following` (the profile), `yourLikes`/`yourComments` (the dead 3 likes and 1 comment) and `yourLikesAfter`/`yourCommentsAfter` (the climb after the flip).
  - Numbers are drawn with comma formatting.
- **People:** `COMPETITOR_COMMENTS` (with the frame each one slides in), `COMPETITOR_OLD_COMMENTS`, `YOUR_COMMENT` (`nice 👍`), `YOUR_LONELY_NOTIF` (the single ping during your time-lapse), `YOUR_NEW_COMMENTS`, and the notification banners `COMPETITOR_NOTIFS` and `YOUR_NOTIFS`.
- **Copy:** `COPY` holds:
  - the hook (`hook`, `hookAccent` in red), the labels (`labelYou`, `labelCompetitor`);
  - the three gap lines and their accent;
  - the twist and flip lines;
  - the tag (`managedBy`, `agency`), `trending`, `example`, the clock label and the CTA (`DM US`).
  - Headlines are auto-fitted to the 800px column, so longer copy shrinks instead of clipping.
- **Voiceover:** `VOICEOVER`. Each line's `text` and start frame `at`, `enabled`, its `volume`, and `duckTo` (how far the effects dip under the voice). After changing the text, re-run `scripts/make-voiceover.py` (below).
- **Colours:** `BRAND`. Red `#E63922`, orange `#FF7A1A` and glow `#FF4D2E` are accents only. Off-white `#F4F2EE` is the background; ink `#111`, text `#333`, meta `#777` and dividers `#EAEAEA` cover the UI. `STUDIO` holds the floor, the warm and cold screen glows and the aluminium.
- **Timings:** `TIMING`, in frames at 60fps.

  | Beat | Frames | Keys |
  |---|---|---|
  | Hook | 0–180 | `headlineIn`, `headlineOut` |
  | The gap | 180–540 | `gapLines` (in/out for each line), `trendingAt`, `clockStart`/`clockEnd`/`clockFromHour`/`clockToHour` (9:00 → 21:00), `dimStart`/`dimEnd`, `lonelyPingAt` |
  | Twist | 540–720 | `profileAt` (the screen slides to the profile), `tagAt` (the tag pops), `twistTextIn`/`Out` |
  | Flip | 720–1020 | `streakStart`/`streakEnd`, `flipStart`/`flipEnd`, `impactAt` + `impactFrames`, `syncPulseFrom`/`syncPulsePeriod`, `flipTextIn`/`Out` |
  | End card | 1020–1200 | `endCardStart`, `logoAt`, `ctaAt`, `holdFrom` (nothing moves after this) |

  - `coverFrame` is the frame used for the PNG cover.
  - Sounds follow these timings automatically.
- **Camera:** the edit is `EDIT` in `src/lib/camera.ts`. It is a list of shots, each with `until` (the frame it hands over) and `blend` (how many frames the move to the next shot takes) and an easing. Each shot in `SHOTS` is an orbit around a target with its own slow drift. Run `npm run check:camera` after changing it.
- **Layout:**
  - `SAFE` holds Instagram's covered edges (top 220, bottom 400, right 140). `COLUMN` is the centred column (equal 140px margins).
  - `LAYOUT` holds the per-format numbers: text top and size, how low labels may go, the camera's framing scale and where the target lands. That is how the 4:5 version is re-framed rather than cropped.

## How it's built

- **Phones** (`src/three/Phone.tsx`, `phoneGeometry.ts`):
  - **Frame:** a satin aluminium band (PBR metal, RoomEnvironment reflections, area-light highlights), swept from a rounded-rect path and a superellipse edge profile with analytic normals. No `flatShading`.
  - **Front:** a black glass bezel and the screen under a glass shader (`glass.ts`) with Fresnel reflections of a painted studio.
  - **Back and buttons:** a frosted-glass back with a generic two-lens camera bump, and capsule side buttons. No logos.
- **Screens** (`src/screens/`): a fictional, generic social app drawn on 1200×2670 canvases (400×890 pt at 3×).
  - A rounded post card, stat pills, comments, stacking notification banners (motion-smeared in the canvas while they move), a profile page with the "Managed by Hot Pepper Media" tag (the pepper is filled from the traced logo outline), and procedurally drawn post art.
  - Static parts of each view are drawn once and cached. A screen is only redrawn when its content key changes.
  - It's uploaded at full resolution when the screen is big on frame, and as a half-size mipmapped texture in the wide shots.
- **Studio** (`src/three/Studio.tsx`):
  - A cyclorama with designed studio fall-off, and RoomEnvironment through PMREM (no HDRI) for the reflections.
  - A warm key, two rim strips and a softbox (rect area lights).
  - Soft projected shadows and contact shadows that react to the hop and the spin.
  - The warm pool and halo the competitor's screen throws. Yours stays cold and grey until the flip lands.
- **Render pipeline** (`src/three/Pipeline.tsx`): the scene lives in its own `THREE.Scene` (an R3F portal) and is drawn in an effect after the screen textures update. There is no `useFrame`; every value is a pure function of the frame (`src/lib/story.ts`, `src/lib/camera.ts`).
  - **Motion blur:** real accumulation blur. Every moving part registers an animator and probe points. Each frame, the pipeline measures how far the probes travel on screen during a 180° shutter, picks 1–16 sub-frame samples, renders the scene at each sub-frame time and averages them in a half-float buffer. Still moments use one sample, so they stay perfectly sharp; whips, the streak and the flip get up to 16.
  - **Post:** depth of field at quarter resolution, only in the macro shots. Then SMAA, then bloom at half resolution, only while the streak or the impact is on screen. Then neutral tone mapping and a warm grade that also makes the red/off-white impact frame.
- **Type and overlays** (`src/ui/`):
  - Kinetic lines spring up through line masks, with an off-white "sticker" block when they sit over busy screen content. They are motion-blurred with `@remotion/motion-blur`'s `CameraMotionBlur` only while they move.
  - Labels are pinned to the phones with the renderer's own camera.
  - Also here: the time-lapse clock chip, the impact burst, and the end card (the traced logo from `hpm-maps-remotion`, then DM US with a tap), plus the vignette and a very light grain.

## Sound

Every effect is synthesised by `scripts/make-sfx.py` (sine waves and filtered noise; original, license-free, identical on every run) into `public/sfx/`. `src/sound.tsx` places them from the same timings as the visuals. They are soft and mid-range so they sit under the music you add in Instagram (peak about −4 dBFS).

| Moment | Sound |
|---|---|
| Competitor notifications | bright two-note pings, faster and faster as the banners stack; silent during your time-lapse |
| Your time-lapse | an accelerating clock-tick texture, then one lonely, low ping with a long tail |
| Kinetic lines | a soft low thock as each line lands |
| Trending pill, follower toast | light pops |
| "Managed by" tag | a round bloop |
| Red streak | an air fly-by whoosh |
| Your flip | a whip swish, then the impact (thump, crack, air) |
| Your numbers climb | pings on a rising scale, tiny ticks every 150 likes |
| End card | a warm logo hit with a shimmer, a tap on DM US |

- **Level:** `SFX_MASTER` in `src/sound.tsx`. Each cue has its own volume in `getCues()`.
- **Regenerating the sounds:** `npm run sfx:make` (needs numpy).

## Voiceover

"Your competitor just posted." under the hook and "Your turn." at the flip.

- **Voice:** Supertonic 3 by Supertone (model licence OpenRAIL-M, which allows commercial use), voice 3, run locally through sherpa-onnx. Whisper checks every take word for word, and the liveliest clean take is kept.
- **Regenerating** (after changing `VOICEOVER` in `src/data.ts`; the script reads the lines from there):
  ```
  pip install sherpa-onnx soundfile librosa numpy
  # unpack into MODELS_DIR from github.com/k2-fsa/sherpa-onnx/releases:
  #   tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2
  #   asr-models/sherpa-onnx-whisper-small.en.tar.bz2
  python3 scripts/make-voiceover.py MODELS_DIR 3      # → public/vo/*.wav and src/voLengths.ts
  ```
- **Without the voice:** set `VOICEOVER.enabled` to false, or use the `-sfx` files.

## Layout and safe zones

- **Vertical:** all text and labels sit in the centred column (x 140–940), between y 262 and 1500, clear of Instagram's top 220px, bottom 400px and right 140px.
- **4:5:** the text starts at y 92 and labels stay above y 1250. The camera's framing and focus points are re-set per format in `LAYOUT`.
- **Checking:** `npm run stills -- out/safe 0.5 <frames> --safe` draws the zones on top.
