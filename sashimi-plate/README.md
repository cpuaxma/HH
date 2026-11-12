# Sashimi Fusion Sushi — plate drop

`index.html` animates a black hammered-ceramic plate being set onto the Sashimi placemat. It is one self-contained file with inline CSS and JS. Apart from the Poppins font (end card and Replay button), the only asset it loads is `sashimi_placemat.png`, the flat 1660×1172 scan, which must stay next to it.

It is a 12-second seamless loop. The first frame (the empty mat) is also the frame after the last one:

| Time | Beat |
|---|---|
| 0.0–0.5s | The empty mat, with 9 charcoal petals drifting down-right. |
| 0.5–1.9s | The plate drops in from above the frame (scale 1.25 → 1, ease-out-back, blur → sharp) and the shadow tightens. Red-orange rings ripple out and a 2px settle bounce follows. |
| 2.6–3.8s | The plate lifts, flips once (showing its underside and foot ring) and lands with a smaller ripple. |
| 3.95–5.0s | A specular sweep crosses the rim at 30°. |
| 4.7–6.2s | Two chopsticks fall in at a tilt. Each touches down on one end first, pivots flat, rebounds twice and slides slightly. |
| 5.9–7.0s | The logo glows and the "Scan For Menu" box pulses. |
| 7.0–10.7s | The sun spreads to fill the frame and the end card comes in: logo badge, "Classic sushi. Bold fusion.", the four branches and the Instagram handle. |
| 10.65–11.5s | The sun shrinks back into the print and leaves the empty mat, which loops back to the start. |

When the page itself opens, the mat fades in once. The exported video starts straight on the loop.

## URL options

- `?record=1` hides the Replay button and the cursor, and skips the fade-in, for clean screen recording. Click or press R, Space or Enter to restart the loop.
- `?t=2.4` freezes the page on one frame.
- With `prefers-reduced-motion` turned on, the page shows one still frame of the full setting.

## Editing

The constants at the top of the script control the layout. Positions are fractions of the placemat, measured on the scan:

- `SUN`: centre of the red sun. The plate lands here, at x 0.506 and y 0.459.
- `PLATE_D`: outer diameter, set to 0.46 of the mat width. The well is 62% of that (`RW` in `plateSVG`).
- `LOGO` and `QR`: the glow and pulse areas.
- `PETALS`: start position, size, sway and spin for each petal. Every motion repeats a whole number of times per loop.
- `STICKS` and `STICK_LEN`: where each chopstick lands, its angle, start time, where it falls from, and its spin, tilt and slide.
- The end-card wording is plain HTML in `#card`.

`render(t)` draws each frame as a pure function of time, so the timings are the `seg(t, start, end)` calls inside it. It animates only `transform` and `opacity`. The plate is SVG built with radial gradients, `feTurbulence` + `feDiffuseLighting`/`feSpecularLighting` for the hammered rim, and `feDisplacementMap` for the wavy edge. It is rasterised once into four images: sharp, blurred, underside and the sheen texture. The chopsticks and their shadows are SVG images too, and their fall is worked out in `stickPose()`.

## Exporting MP4s

From the repo root:

```
node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-story.mp4 'sashimi-plate/index.html?record=1'
SIZE=1080x1080 node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-square.mp4 'sashimi-plate/index.html?record=1'
```

Each command renders the 12-second loop frame by frame, so no frames are dropped. Because the page sets `LOOP = true`, the exporter leaves out the duplicate closing frame, and the video loops without a stutter. `exports/` is git-ignored.

### Higher quality

`SCALE=2` renders at double pixel density, so a 1080×1920 layout becomes a 2160×3840 (4K) video:

```
SCALE=2 node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-story-4k.mp4 'sashimi-plate/index.html?record=1'
SIZE=1080x1080 SCALE=2 node tools/export-video.js 60 sashimi-plate/exports/sashimi-plate-square-4k.mp4 'sashimi-plate/index.html?record=1'
```

Add `OUT=1080x1920` (or `OUT=1080x1080`) to downsample the 2x render to 1080p while encoding. This supersampled 1080p is noticeably sharper on the plate texture and edges than a plain 1x render, and it is the best file to upload to Instagram and TikTok, which re-compress anything above 1080p.

The placemat scan is 1660px wide, and at 4K it fills about 1990px, so the print itself is slightly upscaled. Swap in a higher-resolution scan of the placemat (about 4000px wide or more) under the same file name to make the 4K master fully sharp. Nothing else needs to change.
