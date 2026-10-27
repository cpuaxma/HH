# The Cookie Plug — "Support your local cookie dealer"

10-second vertical motion graphic (1080×1920, 60 fps, 600 frames) built in Remotion from the
Cookielicius poster, rebranded to **THE COOKIE PLUG**. No audio; every hit sits on a
**120 BPM grid with the first big hit on frame 12** (`beat(n) = 12 + 30n`).

## Renders

```bash
npm install
npm run render        # out/cookie-dealer.mp4          H.264, crf 18, paper background
npm run render:alpha  # out/cookie-dealer-alpha.mov    ProRes 4444 with alpha
npm run render:green  # out/cookie-dealer-green.mp4    on #00FF00
npm run studio        # scrub the timeline
```

If Remotion can't download its headless Chrome, point it at a local one:
`REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render`.

## Hit sheet (frames @ 60 fps)

| Frame | Beat | Hit |
|---|---|---|
| 12 | 0 | SUPPORT slams (big punch + shake) |
| 27 | 0.5 | YOUR stamps |
| 42 | 1 | LOCAL stamps |
| 48–118 | — | dealer draws on, head first |
| 132 | 4 | hat lands |
| 162 | 5 | shades slide down |
| 177 / 192 / 207 / 222 | 5.5–7 | eyes dart L / R / L / centre |
| 234–258 | — | shades up, glint + sparkle |
| 252 | 8 | coat yanked open (punch + shake) |
| 258–288 | — | 11 cookies pop, 3 frames apart |
| 312 | 10 | cookies pulse, coat wiggle |
| 327–357 | 10.5–11.5 | peek over the shades, brow raise on 342 |
| 372 | 12 | COOKIE slams (big punch + shake) |
| 402 | 13 | DEALER slams (big punch + shake) |
| 432 | 14 | toe tap |
| 444–486 | — | THE COOKIE PLUG types in |
| 492 | 16 | nod + hat tip |
| 510–599 | — | end-card hold |

To move everything to another tempo, change `BPM` / `FIRST_HIT` in `src/theme.ts`; all
moments in `src/timeline.ts` are derived from `beat()`.

## Artwork pipeline

`npm run trace` (`scripts/trace_layers.py`) splits `art/source.jpg` (also copied to
`public/cookie_dealer.png`) into layers and vectorizes each with potrace, writing
`src/art/layers.json`: every headline/title letter, hat, sunglasses, brows, head, body, right
coat flap, cookie panel, 11 cookies, both shoes, plus paper-coloured silhouettes for the hat and
panel. `art/debug_layers.png` shows the split colour-coded.

Rebuilt in SVG (not in the poster): the eyes behind the shades, the face edge hidden by the left
lens, and the closed-coat front (the panel silhouette mirrored across the hinge, plus buttons and
a pocket). The shop name is set in Bodoni Moda 800 to match the poster's serif lockup.

## Code map

- `src/timeline.ts` — every key frame, plus the windows that get motion blur
- `src/beats/Beat1Hook.tsx` … `Beat6EndCard.tsx` — one module per story beat
- `src/Character.tsx` — the dealer rig (layers, pivots, 3D coat swing)
- `src/Camera.tsx` — push-in, punch-zooms, damped shakes
- `src/fx/*` — line boil (redrawn every 3 frames), paper, grain
