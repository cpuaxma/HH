# Miran Gold outro (3.5s)

A reusable end card for any Miran Gold video. It's built in Remotion in the same style as the reels: navy and gold, a light-sweep wipe, the logo springing in with a gold comet orbit and dust burst, then "ميران جولد", the "انضم على تيليجرام" pill with a glint, and the disclaimer. It fades to black at the end and includes soft synthesised sound effects (no music, so it sits under any track).

## Ready-made files (`video/`)

| File | Resolution | Use for |
| --- | --- | --- |
| `miran-gold-outro-9x16.mp4` | 1080×1920 | Reels, TikTok, Shorts, Stories |
| `miran-gold-outro-16x9.mp4` | 1920×1080 | YouTube, landscape |
| `miran-gold-outro-1x1.mp4` | 1080×1080 | Feed posts |

All three are 3.5s, 60fps H.264 with AAC audio. Drop the file at the end of your edit. The first frames are a bright gold sweep, so a hard cut into it looks intentional.

## Editing and re-rendering

```
npm install
npm run render            # all three, into out/
npm run render:vertical   # or :wide / :square
npm run studio            # live preview
```

- **Text:** `src/strings.ts`, which holds the brand name, button and disclaimer.
- **Timing:** the `T` object in `src/theme.ts` sets when each beat starts. The sound cues follow it automatically. `VIDEO.durationInFrames` is the length (210 frames = 3.5s at 60fps).
- **Sound:** `src/sound.tsx`. Set `SFX_MASTER = 0` for a silent outro. The effects (`public/sfx/`) are the original synthesised sounds from `../miran-gold-tensions/scripts/make-sfx.py`.
- **Logo:** `public/logo.png`.
- **Layout:** `useLayout()` in `src/Outro.tsx`. The vertical version keeps clear of the bottom 320px of platform UI.

Remotion downloads its own headless Chrome the first time. To use one you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.
