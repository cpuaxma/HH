# Hot Pepper Media: "The Bland Brand Makeover"

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) built in Remotion. A bland, grey profile for the **fictional** café Bean & Bloom (@beanandbloom) is repainted by Hot Pepper Media's red line. Everything the line touches turns into a polished, on-brand profile.

```
npm install
npm run studio            # preview and scrub in the browser
npm run stills            # QA stills at 1.5s, 6s, 9.5s, 12s, 16s, 20s, 24s, 28s → out/stills
npm run render            # → out/hpm-makeover.mp4 (H.264, CRF 18)
```

Rendering goes frame by frame through `remotion render`. To use a Chrome or Chromium you already have, add `--browser-executable=/path/to/chrome` to the render, or set `REMOTION_BROWSER` for `npm run stills`. All fonts are bundled locally from `@fontsource`:

- Montserrat 500/600/800 for Hot Pepper Media and the AFTER state.
- Arimo (an Arial look-alike) and Tinos (a Times look-alike) for the BEFORE state.

## Scenes (frames at 60fps; the overlaps are intentional)

| # | Frames | Beat |
|---|---|---|
| 1 | 0–180 | Hook: "is your brand / a little… bland?" grey on grey, with a red underline flick |
| 2 | 170–480 | The before: phone slides up, caption bubbles, ✗ tags |
| 3 | 470–680 | The kick: pepper drops, draws in red and kicks; Cream radial wipe; "let's add some / heat." |
| 4a | 670–890 | Grid: a diagonal sweep straightens and recolours the tiles |
| 4b | 880–1110 | Caption: strike-through, wipe, the new caption types on |
| 4c | 1100–1340 | Profile: header sweep, logo mark, bio, highlights, odometer counters |
| 5 | 1330–1540 | Before/After split with a divider handle |
| 6 | 1530–1800 | The divider floods the frame red; CTA |

## How the brush works

Every element that transforms has a BEFORE and an AFTER variant, stacked under `<BrushReveal>`.

- `src/lib/sweeps.ts` defines each red-line pass as a moving curved front. It returns the line's dense samples and the region the line has already swept, and builds both from the same points, so the AFTER layer is revealed exactly under the line.
- The phone is one persistent layer (`src/stage/ProfileStage.tsx`) with a keyframed camera (`src/lib/stage.ts`). The scene components draw the text, labels, lines and pepper on top of it.

## Editing

- **Timing:** `src/timeline.ts`. `SCENES` holds the scene ranges; `CUE` holds every cue as an absolute frame.
- **Copy:** `src/copy.ts`. In headlines, `*words*` are set in Hot Red.
- **Colours, fonts, easing, springs:** `src/theme.ts`. This covers the HPM palette, the Bean & Bloom palette and the BEFORE filters.
- **Feed:** 9 flat SVG illustrations in `src/feed/`. Drop `public/feed/01.jpg` … `09.jpg` to use photos instead.

## Brand files

- `public/logo-reversed.png` is the cream stand-in reversed logo: the supplied primary logo, keyed and recoloured. If you add `public/logo-reversed.svg`, it is used instead.
- The pepper is a single-stroke placeholder path traced from the logo. If you add `public/pepper-icon.svg`, its paths are drawn instead. Stroked paths work best, because the draw-on animation uses `strokeDashoffset`.
- The Bean & Bloom mark, palette and numbers are fictional. The stats carry an on-screen "Illustrative example" label.
