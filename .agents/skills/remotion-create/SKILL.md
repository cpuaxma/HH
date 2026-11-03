---
name: remotion-create
description: Scaffolding a new Remotion reel project in this repo the Hot Pepper Media way - folder and branch, pinned versions, one data.ts for every editable value, deterministic frame-driven code, optional 3D with @remotion/three, a sound-only composition, npm scripts, README, and a storyboard before the full build. Use when starting any new video project here.
metadata:
  tags: remotion, scaffold, setup, project, three, reel
---

# Creating a new Remotion reel project

Read `remotion-best-practices` for the API, `video-shotcraft` to plan the shots and `remotion-render` to get the file out. This skill covers the project skeleton and the rules that keep it editable and deterministic.

## 1. Folder, branch, reference

- Make one folder per reel at the repo root, named `hpm-<slug>-remotion/` (or `<client>-<slug>-remotion/`). Work on the branch you were given. Commit and push at each milestone: skeleton, storyboard, overlays, sound, final.
- Use earlier projects (`hpm-maps-remotion/`, `hpm-scroll-test-remotion/`) as **read-only references**. Copy files out of them, such as the traced logo (`src/lib/logoTrace.ts`, `src/ui/Logo.tsx`), but never edit them.
- Add a one-line entry for the new project to the "Also in this repo" paragraph of the root `README.md`.

## 2. Don't run `create-video` here; copy the known-good versions

Copy the dependency versions from the newest sibling project's `package.json`. They are known to work together and with the pre-installed Chrome. As of the Scroll Test:

```json
"dependencies": {
  "remotion": "4.0.537", "@remotion/cli": "4.0.537", "@remotion/bundler": "4.0.537",
  "@remotion/renderer": "4.0.537", "@remotion/google-fonts": "4.0.537", "@remotion/media": "4.0.537",
  "@remotion/three": "4.0.537", "@remotion/motion-blur": "4.0.537",
  "@react-three/fiber": "9.4.0", "three": "0.180.0", "react": "19.2.0", "react-dom": "19.2.0"
},
"devDependencies": {"@types/react": "19.2.2", "@types/three": "0.180.0", "typescript": "5.9.3", "esbuild": "0.25.10"}
```

- Every `@remotion/*` package must be on **the same exact version**.
- Leave out `three`, `@react-three/fiber` and `@remotion/three` for 2D-only reels.

Layout:

```
hpm-<slug>-remotion/
  package.json  tsconfig.json  remotion.config.ts  .gitignore  README.md
  src/index.ts        registerRoot
  src/Root.tsx        <Composition>s: the main one + an audio-only one
  src/data.ts         EVERY editable value: copy, colours, timings, shots, layout, look
  src/fonts.ts        @remotion/google-fonts loads + fontsReady()
  src/lib/            pure functions of time: ease.ts, camera/shots.ts, layout.ts …
  src/ui/             HTML overlays: type, cards, end card, finish (grain/vignette)
  src/three/          (3D only) world.ts, shaders.ts, textures, Renderer.tsx
  src/sound.tsx       cue list → <Sequence><Audio/></Sequence>
  scripts/            stills.mjs, make-sfx.py, checks
  public/             sfx/, vo/, grain/ … referenced with staticFile()
  docs/storyboard.png
```

`.gitignore` holds `node_modules` and `out`. Renders go to `out/` and are not committed.

## 3. `remotion.config.ts`: renderer settings only

```ts
import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setChromiumOpenGlRenderer('swangle'); // deterministic software WebGL, no GPU needed
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
```

**No CRF, preset or pixel format here**: they break WAV and still renders. They go in the npm scripts (see `remotion-render`).

## 4. `data.ts` is the single source of truth

Anything a person might want to change lives here, with a comment saying what it does and in what unit:

- `FPS`, `DURATION`, and the timeline `T` (named beat frames, not magic numbers in components).
- `BRAND`: hex colours. Use the brand red only as an accent unless the brief says otherwise.
- `COPY`: every visible word. Components never hard-code text.
- Content records (posts, cards, callouts), `SHOTS` (camera keys), `SAFE` / `COLUMN` (layout), `LOOK` (grain, vignette, shutter), `VOICEOVER`.

Derived positions (for example, where a callout points) are computed from the content layout, not typed in twice. The project README's "Changing things" section then just walks through `data.ts`.

## 5. Determinism rules (non-negotiable)

- Every animated value comes from `useCurrentFrame()`, through pure functions `f(frame) → value` that also take fractional frames (motion blur samples between frames).
- Don't use `useFrame` from R3F, CSS transitions or animations, Tailwind `animate-*`, `Math.random()`, `Date.now()`, or `requestAnimationFrame` loops.
  - For randomness, use a seeded hash such as `hash1(i)`, `noise1(t)`.
- Springs are analytic: a closed-form damped oscillator evaluated at `t`, or `spring()` from remotion with an explicit `frame`. Never integrate state from frame to frame.
- Async work (fonts, canvas textures, model loading) sits behind `delayRender`/`continueRender`.
- Never screen-record or stream anything into the video.

## 6. 3D specifics (`@remotion/three`)

- Use `<ThreeCanvas>` with `flat`, `gl={{antialias: false, preserveDrawingBuffer: true}}`, and `dpr` equal to the device pixel ratio. Drive the scene from `useCurrentFrame()` in a `useLayoutEffect`, and render it yourself when you need accumulation (motion blur).
- For materials, use `MeshStandardMaterial` with an environment: `RoomEnvironment` through `PMREMGenerator`, no HDRI downloads. Add a key light and one or two rim lights. Fake contact shadows with an analytic AO term in the floor shader; it's cheaper and softer than shadow maps.
- **Never use `flatShading`.** For smooth extrusions, delete the `uv` attribute, run `mergeVertices`, then `computeVertexNormals`.
- For text on 3D screens, use a `CanvasTexture` at least 2048 px tall with `generateMipmaps`, `anisotropy` 4, `flipY = false` and `SRGBColorSpace`. Draw it after `fontsReady()`.
- Custom shaders with `glslVersion: THREE.GLSL3` need `layout(location = 0) out highp vec4 outColor;`.
- Keep text that must be crisp in **HTML overlays**. Project 3D anchor points to screen space each frame for leader lines and pins.

## 7. Compositions and props

- The main composition takes props such as `showSafeZones`, `overlays`, `sfx` and `draft` (one sample, no blur, for fast checks).
- Add a second composition that renders only `<SoundTrack/>` on black, so `--codec=wav` exports the audio in seconds. Add a third if there's a voiceover, so effects-only and effects-plus-voice can be exported separately.
- For the vertical reel safe zones (Instagram), keep everything out of the top 220 px, the bottom 400 px and the right 140 px. Keep text in a centred column. Have a `showSafeZones` overlay that draws them.

## 8. Sound

- Synthesise effects in `scripts/make-sfx.py`: numpy, a seeded RNG, 48 kHz mono WAV in `public/sfx/`. They're original and need no licence.
- `src/sound.tsx` builds the cue list from the same `T` timings as the visuals, so retiming a beat moves its sound too.
- Keep effects soft (around −20 to −23 LUFS) so they sit under music added in the app. Duck them under any voiceover.

## 9. npm scripts every project gets

`studio`, `stills`, `preview` (half-res), `render`, `render:silent`, `sfx:make`, `sfx:wav`, `cover`, `check:frames`, `typecheck`, plus `check:camera` for 3D. The exact commands are in `remotion-render`.

## 10. Milestones

1. Skeleton plus `data.ts` plus a draft render of one frame.
2. **Storyboard first:** render 8–12 key stills, tile them with labels into `docs/storyboard.png`, and show the user before building everything.
3. The scene, overlays and sound.
4. QA: stills at the safe zones, legibility, colours and screen sharpness; the camera jerk check; the half-res preview scanned for flicker.
5. The final render, silent copy, WAVs and cover, then the README with "how to change the copy, the hero, colours and timings". Push.
