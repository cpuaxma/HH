# Miran Gold: «ما علاقة الحيوانات بالتداول؟» (the market animals reel)

A 35.0-second Arabic educational reel (1080×1920 and 1080×1350, 60fps, 2100 frames) about what the market animals mean. It's built in the same Remotion project as the signals and copy trading reels and reuses their look: the navy studio and its lighting (`Studio`), the render pipeline, the gold Miran Gold phone and screen theme, the end card, the finish and the sound kit.

Five animals, each **original faceted line art in gold or silver, drawn in code**: a clean outline filled with lit facets, like a cut-metal emblem (see "How the animals are made" below). They're drawn in 2D over the 3D studio. A gold price chart sits on the wall behind them and reacts to each one.

| # | Time | On screen | The chart behind |
|---|---|---|---|
| 1 | 0–4.0s | Hook: a gold bull and a silver bear face off, lean in and push. The question «ما علاقة الحيوانات بالتداول؟» | Chops sideways |
| 2 | 4.0–8.2s | The bear breaks up into its facets, which drift away. The bull takes centre stage and thrusts its horns up, twice. Label «الثور» | Climbs |
| 3 | 8.2–12.3s | The bull breaks up, the silver bear assembles facet by facet, standing, raises a paw and swipes it down. Label «الدب» | Drops |
| 4 | 12.3–16.7s | A gold humpback rises into frame, flicks its tail and dives away. Label «الحوت» | One big candle forms (the chart's clock slows so you can watch it), highlighted |
| 5 | 16.7–21.5s | A silver hawk dives in from above with its wings tucked, flares them open and hovers. Label «الصقر», then the note «ليس دائماً — السوق يتأثر بعوامل كثيرة» | Dips |
| 6 | 21.5–25.6s | A gold dove flies up from below and rises. Label «الحمامة», with the same note | Lifts |
| Tie-in | 25.6–30.0s | The gold Miran Gold phone rises between the hawk and the dove. A news alert: Live Activity «تنبيه أخبار من Miran Gold · قرار فائدة مرتقب», then a card «تنبيه أخبار / قرار فائدة مرتقب / تقلّبات محتملة في سعر الذهب» | Sideways (waiting) |
| 7 | 30.0–35.0s | End card: logo, «Miran Gold», «إشارات • تنبيهات الأخبار • نسخ تلقائي», CTA «انضم إلى إشارات Miran Gold», risk disclaimer (on screen for 4.4s) | |

On-screen text is kept to one short name label per animal. The extras are the hook question (switch it off with `SHOW_HOOK_TITLE`), the note under the hawk and the dove, the phone's alert, and the end card. A «توضيحي» chip is on screen from the first second to the end card, the phone's app header carries it too, and the disclaimer says so. "Miran Gold" is always written in English. The chart is abstract: it has no prices, dates or instrument data.

## Deliverables

In `deliverables/animals/` (and `out/` after a render):

| File | What |
|---|---|
| `miran-animals.mp4` | 9:16 (1080×1920), with the sound effects |
| `miran-animals-silent.mp4` | 9:16, muted (for your voiceover) |
| `miran-animals-4x5.mp4` | 4:5 (1080×1350), re-framed for the feed, with the sound effects |
| `miran-animals-4x5-silent.mp4` | 4:5, muted |
| `miran-animals-sfx.wav` | The sound effects alone |
| `miran-animals-cover.png` | 1080×1920 cover (frame 440: the bull, horns up, the chart climbing) |
| `storyboard-animals.png` (project root) | Captioned storyboard of real stills |

Final settings: H.264, CRF 16, yuv420p, preset slow, 60fps. They're passed on the render command in `scripts/render-animals.sh`, not set in `remotion.config.ts`. Each format's picture is rendered once (muted), and the effects WAV is muxed onto it.

Compositions: `MiranAnimals` (9:16), `MiranAnimals4x5` (4:5) and `MiranAnimalsSfx` (the WAV). The signals and copy trading reels' compositions are unchanged.

## Your voiceover (Arabic narration script)

There's no voiceover in the mix. The lines are short so a text-to-speech voice can read each one in its slot. Vowel marks are on the words a TTS voice could misread (for example «الثَّوْر» rather than «الثورة», and «السِّعر»):

| Time | Line | On screen |
|---|---|---|
| 0.2–2.4s | ما علاقةُ الحيواناتِ بالتداول؟ | the face-off, the question |
| 2.6–3.9s | لكلِّ حيوانٍ معنى. | the bull and the bear push |
| 4.3–5.8s | الثَّوْر: سوقٌ صاعد. | «الثور», horns up |
| 6.0–7.9s | المشترون هم المسيطرون. | the chart climbs |
| 8.5–10.0s | الدُّبّ: سوقٌ هابط. | «الدب», the paw goes up |
| 10.2–12.1s | والبائعون هم المسيطرون. | the swipe, the chart drops |
| 12.8–15.6s | الحوت: لاعبٌ كبير، أوامرُه الكبيرة قد تُحرِّكُ السِّعر. | the whale surfaces, the big candle |
| 15.8–16.7s | ثمّ البنوكُ المركزيّة. | the whale dives |
| 16.9–19.3s | الصَّقْر: يميلُ لرفعِ الفائدة، أو إبقائِها مرتفعة. | the hawk dives, «الصقر» |
| 19.4–21.8s | دولارٌ أقوى وعوائدُ أعلى… غالباً تضغطُ على الذهب. | the chart dips |
| 22.1–23.6s | الحمامة: تميلُ لخفضِ الفائدة. | the dove rises, «الحمامة» |
| 23.7–25.0s | وهذا غالباً يدعمُ الذهب. | the chart lifts |
| 25.2–27.0s | ليس دائماً… فالسوقُ يتأثّرُ بعواملَ كثيرة. | the note, the phone comes up |
| 27.2–29.9s | وقبلَ قرارِ الفائدة، يصلُك تنبيهُ أخبارٍ من Miran Gold. | the news alert |
| 30.5–32.3s | انضمَّ إلى إشاراتِ Miran Gold. | the end card, the CTA |
| 32.6–34.8s | التداولُ ينطوي على مخاطرَ عالية. | the disclaimer |

The hawk and the dove are described as "often" («غالباً»), never "always", and the note line says it isn't always so. If your TTS voice reads "Miran Gold" badly, type it phonetically in the TTS input only (for example «ميران غولد»), and keep it in English everywhere on screen.

If your takes run longer or shorter, change the timings in `T` (below) and re-render. The animals, the chart, the labels, the sound and the camera all follow.

## Commands

```bash
npm install
npm run studio                 # Remotion Studio: pick MiranAnimals
npm run animals:stills         # storyboard stills → out/animals-stills
npm run animals:storyboard     # captioned storyboard → storyboard-animals.png
npm run animals:preview        # half-res draft → out/animals-preview.mp4 (+ frame scan)
setsid nohup bash scripts/render-animals.sh > out/render-animals.log 2>&1 &   # the finals (+ frame scan)
python3 scripts/scan-frames.py --intended none out/miran-animals-silent.mp4
```

Rendering works the same way as for the other reels: Chrome Headless Shell from `/opt/pw-browsers`, `gl` swangle (SwiftShader through ANGLE), concurrency 1. Run the finals detached and poll the log.

## Changing things

Everything for this reel is in **`src/animals/data.ts`**:

- **Copy:**
  - `COPY`: the hook question, the five labels and the note.
  - `PHONE_COPY`: the phone's alert.
  - `END`: the tagline, the CTA and the disclaimer.
  - `ILLUSTRATIVE`: the «توضيحي» chip.
  - `SHOW_HOOK_TITLE`: whether the opening question is on screen.
- **Numbers (the chart):** `CHART.price` is the chart's level (0 = bottom, 1 = top) as `[frame, level]` keyframes, one group per animal. `CHART.whale` sets the whale's candle (from → to) and how long the chart's clock lingers on it. `candle` is frames per candle, `candles` is how many show across, `noise` is the tick jitter, and `panel` is the chart's place and size in the studio. No numbers are shown on screen.
- **Colours:**
  - The animals' gold and silver tones: `PALETTE` in `src/animals/art/render.ts` (dark to light, the facet edges and the outline).
  - `COLORS.chartLine`, `candleUp`, `candleDown`, `grid`: the chart.
  - `COLORS.tint`: the light per beat (the chart's glow, the floor pool, the backdrop orbs).
  - `COLORS.phoneFrame` / `phoneBack`, `alert`: the phone.
  - Which animal is gold and which silver: `metal` in `src/animals/art/shapes.ts`.
  - The navy studio and the brand colours are shared with the other reels (`src/data.ts`).
- **Timings** are in `T`, in frames at 60fps:

| Beat | Keys |
|---|---|
| Hook | `hookTitleIn`, `hookTitleOut`, `faceoffPush` |
| Bull | `bullAt`, `bullLabel`, `bullThrust` |
| Bear | `bearAt`, `bearLabel`, `bearRaise`, `bearSwipe` |
| Whale | `whaleAt`, `whaleSurface`, `whaleLabel`, `whaleCandle`, `whaleDive` |
| Hawk | `hawkAt`, `hawkDive`, `hawkLabel`, `hawkStrike` |
| Dove | `doveAt`, `doveRise`, `doveLabel`, `doveLift` |
| Note | `noteIn`, `noteOut` |
| Tie-in | `phoneAt`, `alertAt` |
| End card | `endCardStart`, `logoAt`, `disclaimerAt`, `ctaAt`, `tapAt`, `holdFrom` |
| Length, cover | `durationInFrames`, `coverFrame` |

  If you move a whole beat, move its `CHART.price` keyframes with it, and the shot windows in `src/animals/camera.ts`.
- **Layout per format:** `LAYOUT.vertical` / `LAYOUT.feed` set the framing (`focus`, `distScale`), the title, the label and note, and the end card.
- **Camera:** one shot per animal, plus the edit between them, in `src/animals/camera.ts` (`SHOTS`, `EDIT`).
- **Poses and moves:** the animals in `src/animals/art/poses.ts` (`bullArt`, `bearArt`, `whaleArt`, `hawkArt`, `doveArt`; `STAGE` sets where they stand and how big they are per format); the phone in `src/animals/story.ts` (`phonePose`).

## How the animals are made

All five are original designs made for this reel, drawn in code. No 3D model, photo, illustration, post or channel design was used, copied or traced, so there's no third-party licence to note.

The style is faceted line art, like a cut-metal emblem: each animal is a clean silhouette in profile (the hawk face on, heraldic style, with its head turned), filled with small triangular facets. Each facet is lit as if the shape were a low relief, so the light breaks across it. The facets have thin bright edges, there's a crisp gold or silver outline with a soft glow, and a few engraved detail lines (eyes, nostrils, muscle and fur lines, throat pleats, feathers). A band of light sweeps across each animal at its big moments.

- The bull: neck hump, deep chest, cloven hooves, a broad forehead and forward-sweeping horns. Its head lowers in the face-off and tosses up on each thrust.
- The bear: a grizzly on its hind legs, with a heavy body, a shoulder hump, a short snout, round ears and long claws. The near arm lifts and swipes down.
- The whale: a humpback with long scalloped flippers, knobs on the head, throat pleats and flukes.
- The hawk: body facing you, head in profile with a hooked beak and a heavy brow, fingered primaries and a fanned tail. Wings tucked for the dive, then spread.
- The dove: in profile, a plump body, wings up with long rounded primaries. It flaps as it rises.

Animals arrive by assembling facet by facet, and leave by breaking into their facets, which drift away.

How it works (`src/animals/art/`):

- `shapes.ts`: the five animals. Each part (a body, a head, an arm, a wing) is a few outlines given as control points; a smooth curve runs through them, and `[x, y, 1]` marks a sharp corner. Parts that move turn about a pivot. The hawk's left wing is the right one mirrored.
- `geo.ts`: the outline curves, points spread inside each shape, and a Delaunay triangulation (pure and deterministic).
- `render.ts`: builds each part's facets once, then draws a frame of a figure from its pose as SVG: lit facets, edges, outlines, detail lines, the assemble and break-up effects, the light sweep.
- `poses.ts`: where each animal is and how it moves, frame by frame, on the beats in `data.ts`.
- `AnimalArt.tsx`: draws them over the 3D, with a soft shadow and a line of light under the bull and the bear.
- `npm run animals:art` draws all five to `out/art-gallery.png` for checking a shape after you change it (`ONLY=bull`, and `POSES='{"parts":{"head":{"rot":-0.4}}}'` to try a pose).

`src/animals/`:

| File | What it does |
|---|---|
| `data.ts` | Copy, timings, colours, the chart, layout |
| `story.ts` | The 3D side as pure functions of the frame: the phone, the floor ring and light, the chart's price, candles and clock |
| `camera.ts` | One shot per animal, blended |
| `art/` | The line-art animals (see above) |
| `chart.ts` | The background chart, drawn on canvas each frame |
| `screen.ts` | The phone's alert screen (the shared drawing kit) |
| `Scene.tsx` | The studio, chart panel, floor light and phone |
| `Overlays.tsx` | The hook question, labels, note, «توضيحي» chip, the shared end card and finish |
| `sound.tsx` | Cues for the shared sound effects |
| `AnimalsReel.tsx` | The composition |

Every animation is a pure function of the frame: no `useFrame`, no state and no screen recording. The flight paths and wingbeats are closed-form functions of the frame. The chart is redrawn once per frame. The 3D studio and phone get the pipeline's motion blur; the 2D animals are drawn crisp each frame. No shared module was changed; the reel uses the optional parameters the copy trading reel added.

## Compliance flags (for Miran Gold's sign-off)

Built in:

- Educational only. There's no buy or sell advice, no prediction and no "be a bull" call. The chart is abstract and labelled «توضيحي».
- The hawk and dove effects on gold are described as "often" («غالباً»). The note «ليس دائماً — السوق يتأثر بعوامل كثيرة» is on screen under both, and in the narration.
- No "guaranteed", "risk-free", "easy money", "passive income" or "get rich" language.
- No real people, central bankers, central banks, films, brokers, platforms or testimonials. No real rate decision or date: the alert says only «قرار فائدة مرتقب» (an upcoming rate decision).
- The disclaimer is readable on mute and on screen for 4.4 seconds: «التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. المحتوى تعليمي وتوضيحي فقط وليس نصيحة استثمارية أو توصية بالشراء أو البيع، ولا يضمن نتائج مستقبلية.»

Needs Miran Gold's compliance sign-off:

1. **The hawkish and dovish lines.** "A stronger dollar and higher yields often weigh on gold" and "cuts often support gold" are general educational statements, not rules. Confirm the wording, and that the surrounding ad copy doesn't turn them into a trading call (for example "rates are rising, so sell gold").
2. **The chart moves with each animal.** The bull, bear, hawk and dove each come with a chart move. The chart is abstract and labelled, but a viewer could read the pairing as a prediction. Confirm this is acceptable as an illustration.
3. **The whale («large orders can move the price»).** This is meant as a description, not a suggestion to follow big players or a hint at manipulation. Keep any caption or ad copy free of "follow the whales".
4. **The tie-in alert.** The phone shows a Miran Gold news alert before a rate decision, with «تقلّبات محتملة في سعر الذهب» (possible volatility in gold). Confirm that Miran Gold really sends news alerts for rate decisions, how far ahead, and that a volatility warning (with no direction given) is acceptable.
5. **The end card's tagline and CTA.** «إشارات • تنبيهات الأخبار • نسخ تلقائي» and «انضم إلى إشارات Miran Gold» promote a signals and automatic copy trading service. In many target markets (the UAE's SCA, DFSA and FSRA; Saudi Arabia's CMA; Egypt's FRA; Jordan's JSC; the UK FCA or EU MiFID II if the ad reaches them), signals can count as investment advice and copy trading as portfolio management. Confirm the licence that covers each market. The educational body of the reel doesn't change that.
6. **Risk warning wording.** Some regulators require specific wording, a "% of retail accounts lose money" figure for leveraged products, or a minimum size and duration. Check the disclaimer against each market and platform.
7. **Meta ad policy.** Trading and signals ads fall under the "Financial products and services" special ad category in many regions. Some regions need advertiser verification or a licence.
8. **On-screen text beyond the name labels.** The brief allowed only labels, but the opening question, the note under the hawk and dove, and the phone's alert are also on screen (the note and the alert were in the brief). Turn the question off with `SHOW_HOOK_TITLE = false` if you prefer.
9. **The iPhone look.** The tie-in phone resembles an iPhone (Dynamic Island) but carries no Apple logo or name. As with the other reels, a quick check is worthwhile.
10. **The animal symbols.** The bull, bear, hawk, dove and whale are generic market terms. The figures are original designs and don't refer to any existing logo, statue, mascot or channel.
