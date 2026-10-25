# Hot Pepper Media — "3 Instagram fixes"

A 41-second, 1080×1920, 60 fps Remotion reel. A 3D phone shows the profile of a fictional café, Bean & Bloom (@beanandbloom). The camera dives into the screen and fixes three problems live (bio, grid, hook), then pulls back out for a before/after and a red CTA: "Hit us a DM, get a free call". Everything is generated in code: no footage, no images except the paper-grain tile.

- `out/hpm-audit.mp4`: the render (H.264, CRF 18, silent, ready for music).
- `out/sfx-cues.txt`: every timestamp that needs a sound, with frame and beat numbers.

## Commands

```
npm install
npm run studio      # preview and scrub
npm run render      # out/hpm-audit.mp4
npm run cues        # regenerate out/sfx-cues.txt from the timeline
npm run check       # beat grid, headline read time, "something new every ≤ 0.7s"
npm run stills      # review stills (node scripts/stills.mjs <dir> [frames...])
```

To render with a Chrome or Chromium you already have, add `--browser-executable=/path/to/chrome-headless-shell` to the render, or set `REMOTION_BROWSER` for `npm run stills`. In a container without a GPU, add `--gl=swangle`. The 3D phone renders in WebGL.

## Pacing

Every headline line slams on a beat, but each fix runs problem → fix → result, and the result holds for about 1.5 s before the next whip. Whips take 16–20 frames. `npm run check` fails any stretch over 1.5 s with nothing new, and lists the deliberate reading holds over 1 s.

## Colours

- **Before:** the café starts desaturated and grey, with crooked tiles and mismatched fonts.
- **After:** the rebrand is deliberately loud: cobalt `#2F4BFF`, butter `#FFD23F` and pink `#FF8FB8` over espresso `#2B1D16` and oat `#FFF4E2`, in one font (Montserrat).
- **The reveal moments:** a burst of the new palette fires when the grid snaps in and when the phone lands on the AFTER profile, and a butter/pink glow follows the AFTER phone.

All palette values live in `src/theme.ts`.

## Beat grid

`src/theme.ts` sets `BPM = 120`, with the first downbeat on frame 0, so `BEAT` = 30 frames. Every cue in `src/timeline.ts` is built with `beat(n)`. Change `BPM` and the whole film retimes, the cue sheet included (run `npm run cues`). Slams, stamps and punch-zooms all land on whole beats. `npm run check` verifies this.

## Where things live

| File | What |
|---|---|
| `src/theme.ts` | Colors, springs, easing, `BEAT`, safe zones, slam/punch settings |
| `src/copy.ts` | All on-screen text |
| `src/timeline.ts` | Every cue frame, the punch-zoom and shake lists, the motion-blur windows, and the SFX cue list |
| `src/lib/cameras.ts` | The 3D phone poses and the flat-camera keyframes |
| `src/lib/projection.ts` | The fixed camera, the screen projection (`matrix3d`), and the 3D↔flat hand-off math |
| `src/scenes/` | `HookStage` (3D), `FlatStage` (bio, grid, reel), `ResultStage` (3D before/after), `CtaLayer`, `TextLayer` |
| `src/components/` | `Phone3D`, `Profile`, `Grid`, `Tiles`, `LatteReel`, `SlamText`, `RedLine`, `Stamp`, `CounterChip`, `TypeOn`, `CountdownRing`, `Odometer`, `PunchZoom`, `Grain`, `MotionBlur`, `CheckBadge`, `Logo` |

Every element that changes has a BEFORE and an AFTER state. `<Profile state>` can mix them part by part (`bio`, `grid`, `avatar`, `highlights`), which is how the mid-fix states are built.

## How the 3D phone works

- **Phone body:** built in `@remotion/three` (React Three Fiber). It's an extruded rounded body with a thin glass bezel, a camera bump and side buttons, lit by ambient, key and rim lights with a studio environment map for reflections.
- **Screen:** the live React `<Profile>` component, projected onto the glass every frame with a CSS `matrix3d` computed from the same camera and pose as the 3D model. A reflection band sweeps across it. This keeps the text sharp and lets the screen change state instantly (the swap happens mid-spin, while the phone faces away).
- **Hand-offs:** at both 3D↔flat cuts (frames 150 and 1320), the 3D pose is solved from the flat framing (`poseFromFlat`), so the screen lands on exactly the same pixels.
- **Camera:** it never actually moves. Orbits, tilts, dives and whips are applied to the phone, so the projection math stays in one place.

## Motion blur

`@remotion/motion-blur`'s `CameraMotionBlur` is switched on only inside the fast-move windows listed in `src/timeline.ts`:
- **Stage** (dives, whips, scatter, spin): 8 samples.
- **Text and CTA layers** (each slam and exit): 8 samples at a 180° shutter.

Outside those windows it renders one sample, so rendering stays fast.

## Logo

The repo has no `public/logo.svg` or `public/pepper-icon.svg`. `src/components/Logo.tsx` rebuilds the wordmark ("hot / pepper / MEDIA" in Montserrat 800) and traces a single-stroke pepper by hand from `assets/logo-primary.png`. The stroke draws on in the CTA. Drop in the official SVG and swap the component if you have it.

## Safe zones

Key text stays inside x 64–940 and above y 1600 (Reels UI: right 140 px, bottom 320 px). Headlines auto-fit to that width at 130–170 px (Montserrat 900).

## Fonts and icons

Montserrat 600/800/900, plus Arimo and Tinos for the café's "before" mismatched fonts, are bundled locally from `@fontsource`. All icons come from `lucide-react`. There are no real app logos or branding. The follower numbers carry an "Illustrative" label.
