# Sashimi Fusion Sushi — counter banner animation

`index.html` animates the Sashimi Fusion Sushi counter banner. It is one self-contained file with inline CSS and JS. The only things it loads are the Poppins font (for the Replay button) and `sashimi_banner.png`, the flat 2374×326 front-on crop of the banner. **Put `sashimi_banner.png` next to `index.html`.** If the file is missing, the page shows a short notice instead.

Nothing is redrawn. Every moving part is a crop of the same PNG, plus a few coded overlays:

- **Characters, pizza and burger:** CSS `background-position` crops.
- **Logo, tail and tagline:** crops run through an SVG colour key. The logo is off-white, so the key reads its alpha from the blue channel.
- **Logo removed before it writes on:** an SVG filter paints the logo out. It fills the lettering from the surrounding strokes.
- **Glints:** red and gold keys of the heart glasses and hoop earrings, swept by a moving mask.
- **Coded overlays:** the brush strokes (with `feTurbulence` dry-brush edges), the ink splash and the sakura petals.

## Timeline

| Time | Beat |
|---|---|
| 0.0–1.2s | Starts on charcoal. 13 rough red strokes paint in diagonally, left to right, and the banner is revealed through the same strokes a beat behind them. |
| 1.2–2.3s | "SASHIMI" wipes on letter by letter, 80ms apart. The fish tail flicks in (−12° → 0°, ease-out-back). "FUSION SUSHI" rises 8px and its letter-spacing tightens from 0.4em. |
| 2.2–3.4s | The left girl slides in from the left and the right girl from the right (30% → 0, with a slight overshoot and a feathered edge). Each food item squashes 1 → 0.94 → 1 twice. |
| 3.4–4.2s | Glints run across both pairs of heart glasses and the gold hoops. White sakura petals pop out near each character. |
| 4.2–6.0s | Camera punch (scale 1 → 1.03 → 1), a red ink splash behind the logo, and one logo shimmer. |
| 6.0s → | Idle loop: the brush strokes drift ±1.5% (16s cycle), the characters breathe ±2px (3s, half a cycle apart), a bite every 4s alternating left and right, a logo shimmer every 5s, and 8 petals drift right to left. |

## URL options

- *(default)*: the banner fills the window width (or the height, on very wide screens) on a #0e0e10 backdrop. This is the setting for the screen above the counter.
- `?format=reel`: a 1080×1920 frame. The logo is played large first, filling the frame, then the camera zooms out to the full banner. Every later beat runs 1s later than in the default.
- `?format=post`: a 1080×1080 frame. The left girl flies in from the top-left corner and the right girl from the bottom-right.
- `?record=1`: hides the Replay button and the cursor for clean screen recording. Click, or press R, Space or Enter, to restart.
- `?t=3.5`: freezes on one frame.
- `?debug=1`: draws the layout boxes over the banner (see below).
- With `prefers-reduced-motion` turned on, the page shows the finished banner without motion.

The reel and post frames scale to fit the window. Options can be combined, for example `?format=post&record=1`.

## Tuning the layout to the real PNG

The positions in `REGIONS`, at the top of the script, are fractions of the banner's width (`x`, `w`) and height (`y`, `h`). They follow the brief's layout map. The glasses and earring boxes are estimates. Open `index.html?debug=1&t=8` and adjust any box that misses its target:

- `charL` / `charR`: the strips that slide in. Between them, the original PNG is used.
- `foodL` / `foodR`: the pizza slice and the burger. `FOOD_ORIGIN` sets the squash pivot, which should be the side nearest the mouth.
- `letters`: "SASHIMI", split into 7 equal columns for the write-on. `tail` is the fish tail, and `TAIL_ORIGIN` is the point it pivots from.
- `tagline`: "FUSION SUSHI", split into 12 columns for the letter-spacing effect.
- `patch`: the area where the logo is painted out before it writes on. It must cover the logo and the tagline.
- `glassesL/R` and `hoopL/R`: where the glints run.

Other settings: `T` holds the timeline in seconds, `EASE` the curves, and `STROKE_ANGLE` the slant of the brush strokes. `PETAL_POPS` sets where the petals burst from.

The colour keys assume the banner's palette: an off-white logo (#f3eee6) on red (#e8343c / #d62a33) and charcoal (#2a2a33). If parts of the background show up inside the logo layers, or the logo leaves a ghost while it is painted out, adjust the `k-white` and `clean` filters in `buildFilters()`.

## How it runs

All motion uses the Web Animations API, and the animations change only `transform`, `opacity`, `clip-path` and mask position. The animations are created paused. Playback starts them all on the same timeline time. `render(t)` seeks every animation to time `t`, which is what the exporter and `?t=` use. A few one-off switches are cues on the same clock: dropping the reveal mask after 1.2s, hiding the painted-out logo, and hiding the stroke layer once the characters cover it. Filtered layers are rasterised once and then only moved, so the idle loop composites without repainting.

## Exporting MP4s

From the repo root:

```
SIZE=2374x326 node tools/export-video.js 60 sashimi-banner/exports/sashimi-banner.mp4 'sashimi-banner/index.html?record=1'
node tools/export-video.js 60 sashimi-banner/exports/sashimi-banner-reel.mp4 'sashimi-banner/index.html?format=reel&record=1'
SIZE=1080x1080 node tools/export-video.js 60 sashimi-banner/exports/sashimi-banner-post.mp4 'sashimi-banner/index.html?format=post&record=1'
```

Each export is the intro plus 8 seconds of the idle loop: 14s, or 15s for the reel. `SCALE=2` renders at double pixel density (for example a 4748×652 banner master). `exports/` is git-ignored.
