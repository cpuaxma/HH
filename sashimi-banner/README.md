# Sashimi Fusion Sushi — counter banner animation

`index.html` animates the Sashimi Fusion Sushi counter banner, and with `?format=reel` it turns the banner into a 15-second 9:16 story reel. It is one self-contained file with inline CSS and JS. The only things it loads are the Poppins font and the banner artwork, which sits next to it:

- `sashimi_banner.png`: the flat 2374×326 front-on crop of the banner. It sets the layout units, and the colour keys run on it. If it is missing, the page shows a short notice instead.
- `sashimi_banner@4x.jpg`: a 9496×1304 master made from the same PNG with the Real-ESRGAN upscaler. The characters went through its illustration model (`RealESRGAN_x4plus_anime_6B`) and the background through the general model (`RealESRGAN_x4plus`), blended in the plain background between them. When this file is present, the page draws from it, so close-ups, the reel's zooms and 2×/4K renders stay sharp. `?sd` forces the original PNG.

Nothing is redrawn. Every moving part is a crop of the artwork, plus a few coded overlays:

- **Characters, pizza and burger:** CSS `background-position` crops.
- **Logo, tail and tagline:** crops run through an SVG colour key. The logo is off-white, so the key reads its alpha from the blue channel.
- **Logo removed before it writes on:** an SVG filter paints the logo out. It fills the lettering from the surrounding strokes. This painted-out patch stays under the keyed logo for good, so the logo can stamp, pulse and float without leaving a ghost.
- **Glints:** red and gold keys of the heart glasses and hoop earrings, swept by a moving mask.
- **Coded overlays:** the brush strokes (with `feTurbulence` dry-brush edges), the ink splash, its droplets and shock ring, the chomp lines and the sakura petals.

## Banner timeline

| Time | Beat |
|---|---|
| 0.0–1.2s | Starts on slate navy. 13 rough red strokes, each tilted slightly differently and with ragged ends, paint in diagonally. The sweep speeds up from left to right. The banner is revealed through the same strokes a beat behind them. |
| 1.2–2.6s | "SASHIMI" stamps on letter by letter, 80ms apart: each letter wipes on while it drops from 124% scale with an overshoot. The fish tail springs in (−30° → 8° → −3° → 0°) and a shimmer chases it. "FUSION SUSHI" rises and its letter-spacing tightens from 0.4em. |
| 2.2–3.4s | The girls snap in from the sides (62% of their width, with a slight tilt, an overshoot and a feathered edge) and take a double bite. On each bite the food squashes towards the mouth, the body dips, and chomp lines pop beside the mouth. |
| 3.4–4.2s | Glints run across both pairs of heart glasses and the gold hoops. Sakura petals pop out near each character. |
| 4.2–6.0s | Impact: a camera punch, the logo pulses to 107%, and a red ink splash bursts behind the logo with a shock ring and 18 droplets flung outward. |
| 6.0s → | Idle loop: the camera drifts slowly, the brush strokes drift ±1.5%, the logo floats, the characters breathe (a 1.2% swell from the waist). A bite comes every 4s, alternating left and right, and a logo shimmer every 5s. 10 petals drift right to left at three depths: far ones small, soft and slow, near ones big and quick. |

## Reel (`?format=reel`, 1080×1920, 15s)

The reel films the same animated banner with a moving camera. The camera's path is sampled 30 times a second and zooms evenly. Behind the banner is a full-frame brush field, and kinetic type sits on top. The top and bottom edges of the banner band are feathered into the field.

| Time | Scene |
|---|---|
| 0.0–2.35s | The brush field paints in. The logo fills the frame width as it stamps on, and the camera pulls back slightly. |
| 2.35–5.45s | The camera moves to the left girl. She snaps in as it arrives. **SUSHI / PIZZA** rises in with a cream brush underline, and the camera pushes in slowly. |
| 5.45–8.5s | A whip pan to the right girl. **SUSHI / BURGER**. |
| 8.5–11.15s | The camera pulls back and pans along the banner. *Classic sushi. / Bold fusion.* |
| 11.15–15s | End card. The camera returns to the logo, and the ink splash and punch hit. "Sushi burgers & mouth-watering pizzas" appears above the logo, and the branches (Mansourieh • Tripoli • Faraya • Jal el Dib) and the Instagram handle appear below it. |

The `@sashimi.fusion.lb` handle shows as a footer through the middle scenes, and full-frame petals drift down in three depths. The words and branch names are in `buildReel()`. The branches and handle are the same as on the placemat end card in `sashimi-plate/`, so change both together if they change.

## URL options

- *(default)*: the banner fills the window width (or the height, on very wide screens) on a #0e0e10 backdrop. This is the setting for the screen above the counter.
- `?format=reel`: the 1080×1920 story reel described above.
- `?format=post`: a 1080×1080 frame. The left girl flies in from the top-left corner and the right girl from the bottom-right.
- `?record=1`: hides the Replay button and the cursor for clean screen recording. Click, or press R, Space or Enter, to restart.
- `?t=3.5`: freezes on one frame.
- `?debug=1`: draws the layout boxes over the banner (see below).
- `?sd`: draws from the original PNG instead of the 4x master.
- With `prefers-reduced-motion` turned on, the page shows one finished frame without motion (the end card, for the reel).

The reel and post frames scale to fit the window. Options can be combined, for example `?format=post&record=1`.

## Layout

The positions at the top of the script were measured on `sashimi_banner.png`. They are fractions of the banner's width (`x`, `w`) and height (`y`, `h`). Open `index.html?debug=1&t=8` to see the `REGIONS` boxes drawn over the banner. If you replace the artwork, re-measure them:

- `charL` / `charR`: the strips that slide in. Between them, the original artwork is used.
- `foodL` / `foodR`: the pizza slice and the burger. `FOOD_ORIGIN` sets the squash pivot, which should be the side nearest the mouth. `CHOMP` places the chomp lines.
- `letters`: the overall "SASHIMI" box. The write-on uses `LETTER_X` (the column edges of S·A·S·H·i·m·i) and `LETTER_Y` (each letter's top and bottom; the first S and the A reach lower than the rest). `tail` is the fish tail, and `TAIL_ORIGIN` is the point it pivots from.
- `tagline`: "FUSION SUSHI". `TAG_CUTS` holds the 11 letter columns and `TAG_SPACE` the slot of the word gap, for the letter-spacing effect.
- `patch`: the area where the logo is painted out. It must cover the logo and the tagline.
- `glassesL/R` and `hoopL/R`: where the glints run.

Other settings:

- `TIMES`: the timeline for each format, in seconds. Each character has her own entrance, glint and petal times, so the reel can bring each one in as the camera arrives.
- `EASE`: the CSS easing curves.
- `STROKE_ANGLE`: the slant of the brush strokes.
- `PETAL_POPS`: where the petals burst from.
- `buildReel()`: the reel's shots and moves (`S` and `moves`) are listed at its top.

The photographed print reads lighter than the brand colours: coral red #f7646e, muted rose #ab5265 and slate navy #40465d, against the brand's #e8343c and #2a2a33. `PRINT` holds these sampled colours. The coded overlays use them, so they match the print. The colour keys in `buildFilters()` are tuned to the same print. Its logo's blue channel is at least about 0.63, and the background's stays below about 0.48. The painted-out patch and the drift layer are built from the original PNG, because the upscale adds a faint dark fringe round the letters that the fill would otherwise keep.

## How it runs

All motion uses the Web Animations API, and the animations change only `transform`, `opacity`, `clip-path` and mask position. The animations are created paused. Playback starts them all on the same timeline time. `render(t)` seeks every animation to time `t`, which is what the exporter and `?t=` use. A few one-off switches are cues on the same clock: dropping the reveal mask, removing each character's feathered edge once she lands, and hiding the stroke layer once the characters cover it. Filtered layers are rasterised once and then only moved.

In headless Chromium without a GPU, the banner plays at close to 60fps after the first second. The reel previews at about 30fps, because its moving camera re-rasterises the scene every frame. Exports are frame-exact either way.

## Exporting MP4s

From the repo root. These are the settings used for the delivered files: 60fps, motion blur from 4 sub-frames per frame (180° shutter), and 4 browsers rendering in parallel:

```
# Reel, 1080x1920
SIZE=1080x1920 BLUR=4 JOBS=4 SHOT=jpeg node tools/export-video.js 60 sashimi-banner/exports/sashimi-reel.mp4 'sashimi-banner/index.html?format=reel&record=1'
# Banner, 3840x528 (4K wide): a 1920x264 layout at 2x pixel density
SIZE=1920x264 SCALE=2 BLUR=4 JOBS=4 SHOT=jpeg node tools/export-video.js 60 sashimi-banner/exports/sashimi-banner-4k.mp4 'sashimi-banner/index.html?record=1'
# Square post, 1080x1080
SIZE=1080x1080 BLUR=4 JOBS=4 SHOT=jpeg node tools/export-video.js 60 sashimi-banner/exports/sashimi-post.mp4 'sashimi-banner/index.html?format=post&record=1'
```

The banner and post exports are the intro plus 8 seconds of the idle loop (14s). The reel is the whole 15s story. Leave out `BLUR` for a quick draft. For a supersampled reel, add `SCALE=2 OUT=1080x1920`, which takes about four times as long. `exports/` is git-ignored.

Render time: without a GPU, each frame takes about 0.65s at 1080×1920. With `BLUR=4`, the 15s reel is 3,600 captures, about 15–25 minutes with `JOBS=4` on 4 cores.
