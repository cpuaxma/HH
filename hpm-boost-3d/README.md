# Hot Pepper Media: "Stop boosting. Build a system." (12s 3D product ad)

A 12-second vertical ad (1080×1920, 60fps, 720 frames) styled as a high-end 3D product-render commercial. It's built in Remotion with React Three Fiber, using physically based materials, a soft studio key with a warm red-orange rim, and real depth of field. The camera makes one continuous move with no cuts, and the final video has real motion blur from a 180° shutter.

There is no text, no logo and nobody on screen. The last two seconds hold on the chili with empty space below it for a logo and tagline, which you add in your editor.

| Time | Scene | What happens |
|---|---|---|
| 0–3s | The waste | A slow orbit around a floating phone showing a plain social post. The glowing boost button presses itself three times, and each press peels banknotes out of the screen. The notes flutter upward and burn from the edges into embers and ash. |
| 3–5s | The turn | Everything slows to 0.12×. A chili drops, spinning slowly, and touches the glass. A red-orange ring expands and wipes the ash away, and the camera pushes forward over the phone and through the ring. |
| 5–9s | The system | Four frosted-glass tiers slide in and lock, each with a click and a pulse of light. Glowing spheres pour in and swirl down through every tier. They leave the spout as gold coins that flip once and stack on the floor. The camera follows the flow down. |
| 9–12s | The brand | The camera tilts up and turns away from the coins into empty space. The chili settles into frame, turns a quarter turn and rests while embers drift up. The camera holds still from 10s to 12s. |

The rendered spot is [`exports/hpm-boost-ad.mp4`](exports/hpm-boost-ad.mp4): 1080×1920, 60fps, H.264 CRF 14, 3-sample motion blur, AAC stereo, 12.0s.

## Commands

```
npm install
npm run studio                         # preview and scrub in the browser
npm run stills -- out/stills 0.5 60,240,420,719   # QA stills (dir, scale, frames)
npm run audio                          # regenerate public/soundtrack.wav (needs numpy)
npm run render                         # final: 3-sample motion blur + audio → out/hpm-boost-ad.mp4
SAMPLES=1 SCALE=0.5 npm run render     # quick half-res draft without blur
FRAMES=300-359 npm run render          # just a range (no audio)
```

Rendering uses SwiftShader through ANGLE (`swangle`). It needs no GPU and gives the same image on every machine. On a 4-core machine a full-res frame takes about 4 s with `CONCURRENCY=2`, and a 3-sample final takes about 2.5 hours. The scripts use `REMOTION_BROWSER` if you set it, then a preinstalled Chrome Headless Shell if they find one (`scripts/browser.mjs`). Otherwise Remotion downloads its own.

### How the motion blur works

`scripts/render.mjs` renders the whole composition once per sample, each time with the clock shifted by a sub-frame offset inside half a frame (the input prop `sub`, read in `src/timeline.ts`). For 3 samples the offsets are −⅙, 0 and +⅙ of a frame. Each pass goes to a ProRes HQ intermediate in `out/passes/`. ffmpeg then averages the passes frame by frame (`mix`), muxes the soundtrack and encodes H.264 (CRF 14, yuv420p, faststart). `SAMPLES` sets the number of samples (default 3); 4 or more gives smoother blur. Passes are resumable: `PASSES=0` renders one pass, finished passes are kept, and the mix runs once all exist (`MIX_ONLY=1` forces just the mix).

Everything in the scene is a pure function of time, including the particles, burn fronts, sphere flow and coin physics. That's why the passes line up exactly.

## Changing things

- **Timing:** `src/timeline.json`, in seconds. It holds the button presses, note burn delay and duration, the slow-motion ramp, the chili drop and impact, the tier lock times, the pour, the coins, the pan, and the chili's settle and turn. The audio script reads the same file, so sound cues follow automatically. The track is 96 BPM (0.625 s per beat). The impact (3.75 s) and the final settle (10.0 s) sit on downbeats, and the presses and tier locks sit on the grid, so keep that if you retime.
- **Camera:** `KEYS` in `src/lib/camera.ts`. Each key has a time, a position, a look-at point, an optional focus point and a bokeh amount. Keys are joined with C1-continuous Hermite curves, and only keys marked `stop` have zero velocity. The lens is a virtual 50 mm (39.6° vertical FOV) in `src/three/Scene.tsx`.
- **World layout:** the phone, funnel profile and tiers, coin size, and the final chili and camera positions are all in `src/timeline.ts`.
- **Lighting:** `src/three/Stage.tsx`.
  - The key is a directional light from the upper left with soft VSM shadows. Each subject has a warm rim spotlight behind it, each with a hard `reach` so it never pools on the floor.
  - A procedural studio environment provides reflections (softbox, top strip, rim strips).
  - It also sets up the fog, the seamless backdrop, the blurred reflective floor and the volumetric haze slices.
- **Look:** in `src/three/Scene.tsx`, bloom only catches HDR emissives (threshold 1.15). This is followed by AgX tone mapping, a vignette and SMAA.
- **Materials:** the chili in `src/three/Chili.tsx` and `src/lib/chiliGeometry.ts` (procedural pod, calyx, stem, with skin normal and roughness maps from `src/lib/textures.ts`). The phone is in `src/three/Phone.tsx`. The banknote paper, fibres and guilloche are in `textures.ts`, and the burn shader is in `src/three/Notes.tsx`. The frosted glass with its fresnel edge glow is in `src/three/Funnel.tsx`. The gold coins are in `src/three/Coins.tsx`.
- **Sound:** `scripts/make-audio.py` is all synthesis with no samples. It has the kick, hats, rim and toms; whooshes on the camera moves; a riser and a sub hit on the impact; glass clicks on each tier; coin clinks on each landing; and a final hit plus a warm pad.

## Palette

The palette is charcoal, chili red, ember orange and warm white. The coins are a warm gold and the phone frame is a warm brushed aluminium, both chosen to sit inside that palette. The chili's calyx and stem are dark charcoal, as on the Hot Pepper Media pepper, not green.
