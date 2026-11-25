# Miran Gold: لماذا يهبط السوق كله بسبب سهم واحد؟

A 33-second vertical Instagram Reel (1080×1920, 30fps, H.264) explaining the Nasdaq-100 and how a few AI/tech giants move it. Arabic, RTL, Cairo font. It is silent by design and has an audio slot.

## Render

```
npm install
npm run studio        # live preview
npm run render        # → out/miran-gold-nasdaq-reel.mp4
npm run stills -- 45 250 650 940   # PNG previews (half size) → out/stills/
```

Cairo loads from Google Fonts through `@remotion/google-fonts`, so stay online while rendering. To use a Chromium you already have, set `REMOTION_BROWSER=/path/to/chrome`.

Encoding settings are in `remotion.config.ts`: CRF 18 with a 16 Mbps cap and x264 `slow`, which comes to about 70 MB. The cap is there because the film grain is costly to encode. The file also gets a silent AAC track, so it has an audio stream.

## Files

- `src/config.ts`: **the one file to edit.** It holds all Arabic copy, scene windows, per-scene beats, colors, layout positions, safe zones, motion springs and the audio slot.
- `src/scenes/Scene1Hook.tsx` … `Scene6CTA.tsx`: one component per scene.
- `src/components/`
  - `SceneShell`: mounts each scene and cross-fades it (opacity, blur and drift) across boundaries. There are no hard cuts.
  - `WordReveal`: word-by-word RTL reveal. It splits on spaces only, so letters stay joined.
  - `CompanyField`: the 100 constituents as one continuous layer across scenes 2–4: grid dots, then packed bubbles with swelling giants, then red, shrinking giants.
  - `Charts`: the hook's red candlestick dip and the scene-4 index line.
  - `Background`: charcoal base, breathing radial glow (it turns red during the drop), vignette and film grain (`public/grain.png`).
  - `Chrome`: the logo, the persistent top logo, the gold progress bar and the "مثال توضيحي" label.
- `public/logo.png`: the Miran Gold logo, used as supplied. Effects such as the shimmer are drawn on top of it, and the file itself is never modified. To swap in a new logo, replace this file.

## Timeline

| Scene | Time | Content |
|---|---|---|
| Hook | 0–3s | Gold question punches in over a faint red candlestick dip |
| What is it | 3–9s | "مؤشر ناسداك" + counter 0→100; 100 gold dots fill a 10×10 grid in step |
| Not equal | 9–17s | Dots morph into bubbles; 7 giants swell, the rest dim |
| Domino | 17–25s | Giants turn red and shrink; index line falls; 0.0% → −3.0% |
| Takeaway | 25–30s | Gold line with a highlight band sweeping right → left |
| CTA | 30–33s | Big logo + shimmer, brand line, "الرابط في البايو" pill, disclaimer |

## Safe zones

Key text stays between y = 250 and y = 1580 (Instagram's top 250px and bottom 340px), and the progress bar sits on the bottom line. `scripts/sheet.py` draws these guides on preview stills:
`python3 scripts/sheet.py out/sheet.png out/stills/frame-0250.png …`

## Audio

Put a track in `public/` and set `AUDIO.src` in `src/config.ts` (for example `'music.mp3'`). It fades out over the last second.

## Notes

- Digits are Western (0-9). The −3.0% counter shows one decimal while it runs; set `TEXT.domino.dropDecimals` to `0` for whole numbers.
- Bubble sizes and the drop figure are illustrative, not real index weights. Both scenes carry the "مثال توضيحي" label to say so.
