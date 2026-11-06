# Sashimi Fusion Sushi — plate drop

`index.html` animates a black hammered-ceramic plate being set onto the Sashimi placemat. It is one self-contained file with inline CSS and JS. Apart from the Poppins font on the Replay button, the only asset it loads is `sashimi_placemat.png`, the flat 1660×1172 scan, which must stay next to it.

The animation runs for about 4.5s and plays once on load:

| Time | Beat |
|---|---|
| 0.0–0.6s | The placemat fades and scales in (0.96 → 1) and the red sun brightens. |
| 0.6–1.0s | 9 charcoal teardrop petals fade in, then drift down-right in a loop for good. |
| 1.0–2.4s | The plate drops in from above the frame (scale 1.25 → 1, ease-out-back, blur → sharp), the shadow tightens, and a 2px settle bounce follows. |
| ~2.1–3.2s | Two red-orange rings ripple out from under the plate. |
| 3.2–4.5s | A specular sweep crosses the rim at 30°, the logo glows, and the "Scan For Menu" box pulses. |

## URL options

- `?record=1` hides the Replay button and the cursor for clean screen recording. Click or press R, Space or Enter to replay.
- `?t=2.4` freezes the page on one frame.
- With `prefers-reduced-motion` turned on, the page shows only the final frame.

## Editing

The constants at the top of the script control the layout. Positions are fractions of the placemat, measured on the scan:

- `SUN`: centre of the red sun. The plate lands here, at x 0.506 and y 0.459.
- `PLATE_D`: outer diameter, set to 0.46 of the mat width. The well is 62% of that (`RW` in `plateSVG`).
- `LOGO` and `QR`: the glow and pulse areas.
- `PETALS`: start position, size, loop time, sway and spin for each petal.

`render(t)` draws each frame as a pure function of time, so the timings are the `seg(t, start, end)` calls inside it. It animates only `transform` and `opacity`. The plate is SVG built with radial gradients, `feTurbulence` + `feDiffuseLighting`/`feSpecularLighting` for the hammered rim, and `feDisplacementMap` for the wavy edge. It is rasterised once into three images: sharp, blurred and the sheen texture.

## Exporting MP4s

From the repo root:

```
node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-story.mp4 'sashimi-plate/index.html?record=1'
SIZE=1080x1080 node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-square.mp4 'sashimi-plate/index.html?record=1'
```

Each command renders a 6-second clip (4.5s of animation plus a 1.5s hold) frame by frame, so no frames are dropped. `exports/` is git-ignored.
