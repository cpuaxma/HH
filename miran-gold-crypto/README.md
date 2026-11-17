# Miran Gold reel: ما هي العملات الرقمية؟

A 30-second vertical Arabic explainer (1080×1920, 30fps, 900 frames) built in Remotion. Charcoal and gold, Cairo font, word-by-word RTL headlines, soft glow, film grain and a light vignette.

| Time | Scene | On-screen text |
|---|---|---|
| 0–4s | Gold coin with a glowing circuit face turns in the light | ما هي العملات الرقمية؟ |
| 4–10s | Coin dissolves into digital particles; bank and government icons are struck through and fade | نقود إلكترونية لا يتحكم بها بنك ولا حكومة |
| 10–17s | Gold blocks link into a chain; a light pulse runs along it | تعمل عبر البلوكتشين: دفتر رقمي مشترك يسجّل كل عملية |
| 17–23s | A transaction travels between wallets, network nodes verify it, a lock closes | آلاف المشاركين يتحققون من كل عملية، ولا يمكن تعديلها |
| 23–27s | Gold candlesticks draw in with a rising arrow | تداولها متاح على مدار ٢٤ ساعة |
| 27–30s | End card: the logo in a soft gold glow | تابع ميران جولد وتعلّم أكثر |

## Render

```
npm install
npm run render     # renders out/crypto-explainer.mp4, then trims the AAC padding so it is exactly 30.000s
```

`remotion.config.ts` sets H.264, CRF 18, yuv420p, bt709 and always writes an audio stream (silent if there is no audio yet). To use an installed Chromium headless shell instead of downloading one, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.

- Preview: `npx remotion studio`. The `CryptoExplainer-SafeZones` composition shades the top 250px and bottom 350px reserved for social UI.
- Stills: `npx remotion still CryptoExplainer out/still.png --frame=380`

## Audio slots

Drop these into `public/`; each one plays automatically when present, in Studio and in renders:

- `public/voiceover.mp3`: the Arabic voiceover. Script and timing are in `voiceover-script-ar.md`.
- `public/ambient.mp3`: subtle ambient music. It loops, fades in and out, and ducks under the voiceover.

Volumes, the voiceover start offset and the fades are in `AUDIO` in `src/config.ts`.

## Editing

Everything you would tune is in `src/config.ts`:

- `SCENES`: each scene's start and end (seconds), its headline lines, font size and position. Put a word in `*asterisks*` to set it in gold. Lines break exactly where the config breaks them.
- `TRANSITION`: the crossfade between scenes. `WORDS`: the word-by-word reveal (delay, stagger, rise, blur).
- `COLORS`, `FONT`, `SAFE`, `STAGE` (where visuals are centred), `LOGO`.

Code layout: `src/scenes/*` holds one component per scene; `src/components/*` holds the shared pieces (`Headline`, `SceneShell`, the 3D `Coin`, `Backdrop`, `FilmFinish`, `icons`, `AudioSlots`). `Headline` logs `TEXT OVERFLOW` or `TEXT OUTSIDE SAFE ZONE` to the render log (`--log=verbose`) if a line is too wide or the block leaves the safe zone.

`public/logo.png` is the supplied Miran Gold logo, used as is.
