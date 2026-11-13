# Miran Gold reel: تاريخ الذهب في ٦٠ ثانية

A 60-second vertical Arabic reel built in Remotion (1080×1920, 60fps, 3600 frames). It's the third in the series, after `../miran-gold-falling/` and `../miran-silver-falling/`. It has no audio. The voiceover script is in `voiceover-script-ar.md`, with a headlines-only version and a longer one.

## What's new in this one

- **One gold object through history.** A single 3D gold piece (`src/components/three/GoldHero3D.tsx`) melts into a glowing molten drop and recasts into each era's form: nugget → bangle → sun disc → Lydian coin → dinar → nuggets in a pan → stamped bar → (molten line) → cube. Its whole life is scripted in `src/heroTrack.ts`.
- **Flying through time.** The camera dollies forward through a corridor of gold "time gates", each engraved with its year. Gold dust streams past on each dolly. In scene 11 the camera pulls back down the whole corridor as the gates light up in their era tints (`src/components/World.tsx`).
- **Year odometer HUD.** A chrome-gold year rolls between eras and follows the price chart from 1971 to 2026 (`src/components/YearHud.tsx`).
- **Atmosphere.** Light rays fall on the gold, there is a per-era colour tint, and a molten bloom appears when the gold recasts.
- **Kept from the series:** per-word RTL text with a sheen, Eastern Arabic numerals, the safe zones, and the CTA.
- **English branding:** the small "MIRAN GOLD" wordmark at the top and the whole outro (CTA) are in English. There is no logo at the bottom in this reel.

## Render

```
npm install
npx remotion render GoldHistoryAR out/gold-history-ar.mp4 --codec=h264 --crf=18 --gl=swangle
```

- **`--gl=swangle`:** software WebGL, needed for the 3D on machines without a GPU, such as servers.
- **Render time:** the full render is long. To render in parts, use `--frames=0-1199` and so on, then join the parts with ffmpeg's concat demuxer (`-c copy`).
- **Phone/social copy:** `npm run export:phone` re-encodes the render to `out/gold-history-ar-phone.mp4` (about 14 Mbps, under 100 MB).
- **Preview stills:** `npx remotion still GoldHistoryAR out/still.png --frame=1250 --gl=swangle`

## Updating the facts

All strings and numbers are in `src/strings.ts`, including the price path for the modern chart (`S9_DATA`). The figures are approximate. Check the ones that change over time before posting: total gold ever mined, central-bank buying and prices.

## Where things live

- `src/theme.ts`: colours, era tints, the years shown per scene, the timeline ticks, scene frame ranges and the dolly scenes.
- `src/heroTrack.ts`: the 3D gold's forms, poses, melts and beats.
- `src/scenes/Early.tsx`: scenes 1–5. `src/scenes/Later.tsx`: scenes 6–11, plus the banknote-and-chain rig for 1944–1971. `src/scenes/Cta.tsx`: the CTA.
- `src/components/three/*`: the procedural studio lighting, the gold forms and the 3D hero.
- `public/logo.png`: the logo, shown large in the CTA.
