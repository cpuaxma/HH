# Two Traders, One Gold Market

A 60-second vertical reel (1080×1920, 60fps, 3600 frames) for Miran Gold, built in Remotion. One composition, two renders: English and Arabic, picked with the `lang` prop.

```
npm install
npm run render            # out/two-traders-en.mp4 and out/two-traders-ar.mp4 (H.264, CRF 18)
npm run studio            # preview and scrub
npm run sheets            # character sheet stills: out/sheet-ray.png, out/sheet-sam.png
node scripts/stills.mjs out/stills 150 595 1255   # check stills for both languages
```

To use a Chrome or Chromium you already have instead of the one Remotion downloads, set `REMOTION_BROWSER=/path/to/chrome`.

## Where things live

- `src/i18n.ts`: every on-screen string in both languages. `*gold*` marks gold key words, `_red_` marks red ones. Arrays are explicit lines (two at most).
- `src/theme.ts`: colours, per-side lighting, easings, layout bands, text timing.
- `src/timeline.ts`: scene ranges (they overlap on purpose), key beats, speech-bubble windows, and the keyed tracks that drive each character's expression, pose, gaze, intensity and talking.
- `src/data/price.ts`: the one gold price path. Both monitors and the hook strip draw from it. Trade levels and the SL/TP hit frames are derived from it, so markers always land on the line.
- `src/camera.ts`: per-scene push-ins, Ray's handheld drift and impact shakes, the four S4 cuts with whip-pans, the S5 push-in on Ray's face, the S2 insert on Sam's trade card, and the S6 grade and recede.
- `src/characters/`: Ray and Sam as rigged SVG components on a shared rig (`rig.ts`: tracks, blinks, visemes, breathing, IK, shake; `Head.tsx`: the 3/4 head; `parts.tsx` and `props.tsx`: limbs, hands, desk props).
- `src/components/`: `AnimatedText`, `SpeechBubble`, `SideTag`, `LightStreak`, `ChartLine`, `TradeCard`, `AccountBar`, `Badges`, `Grain`, `BackgroundGlow`, `SplitScreen`.
- `src/scenes/`: one overlay component per scene, composed with `<Sequence>` in `src/TwoTraders.tsx`.

The two characters live in one persistent split screen (`SplitScreen.tsx`), not inside the scenes. That way they are drawn once and never doubled up during the 10-frame scene overlaps. The scenes add the text, bubbles, tags, badges and cards on top.

## Assets

- `public/logo.png`: the supplied logo with its black background keyed out (source: `public/logo-src.jpg`).
- Optional, picked up automatically when present: `public/audio/music.mp3`, `public/audio/sfx-bass.mp3` (plays on the spike, f58), `public/audio/vo-en.mp3` / `vo-ar.mp3`, and `public/telegram.svg` (shown in the CTA button). Without them the reel renders silent and the CTA is text only.

## Rules the build keeps

- Nothing moves linearly: entrances use `spring({damping: 200})` or `bezier(0.16, 1, 0.3, 1)`; exits use `Easing.in(Easing.cubic)` and run about 40% faster.
- English animates per character (1.5-frame stagger, letter-spacing tightening from 0.35em). Arabic animates per word, right to left (4-frame stagger), with no letter-spacing, `dir="rtl"`, line-height 1.5, and Latin tokens in `<bdi>`.
- No emoji: the ✕, ✓ and coin are SVG badges.
- No currency amounts or profit figures. Balances are meters with an arrow and an "Illustrative" label; trade-card levels are placeholders, also labelled "Illustrative".
- The right 140px and the bottom 320px stay free of content.
