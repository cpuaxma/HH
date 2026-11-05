# Miran Gold: one trade, one news candle, two results (signals reel)

A 27-second Arabic reel (26.8s: 1080×1920 and 1080×1350, 60fps, 1608 frames) built in Remotion with `@remotion/three` (React Three Fiber). Two iPhone-style 3D phones in a navy studio make **the same gold trade on the same day**, and the same news candle hits both:

- **Left «بلا خطة»** (no plan). Buys gold with **no stop loss** («لا حدّ للخسارة», no limit on the loss) and no alerts. Its balance climbs to about $12,100 while gold rises. Then the news candle drops gold $23, the screen floods red and the balance crashes: **«خسارة كبيرة» −$4,800, $10,000 → $5,200 (−48%)**.
- **Right «مع Miran Gold»** (with Miran Gold). A Miran signal: buy gold, **with a stop loss, small risk (1%)**. Before the news, a **Miran Gold alert** (big news in 10 minutes: take profit now) closes the trade at **+$140**. When the news hits it is **protected: $10,000 → $10,140 (+1.4%)**.
- Then the left phone flips and connects to Miran Gold. Its $5,200 stays: there's no magic recovery.

Big scoreboards under the phones (✕ «بلا خطة» / ✓ «مع Miran Gold» with the live account value) are on screen for the whole story, so it reads even without looking at the screens.

Written for the average viewer: no trading jargon on screen (no lots, leverage, price levels or "margin call"), one number per phone, and a caption for every step, ending on the one thing to learn: «الخطة: وقف خسارة + تنبيه قبل الخبر». The brand is always written in English, «Miran Gold»; everything else is Arabic.

The trading app, the news event and every number are **fictional and illustrative**. Every number carries a «توضيحي» (illustrative) label.

## Deliverables

In `deliverables/` (and `out/` after a render):

| File | What |
|---|---|
| `miran-signals.mp4` | 9:16 (1080×1920), with the sound effects |
| `miran-signals-silent.mp4` | 9:16, silent (for your voiceover) |
| `miran-signals-4x5.mp4` | 4:5 (1080×1350), re-framed for the feed, with the sound effects |
| `miran-signals-4x5-silent.mp4` | 4:5, silent |
| `miran-signals-sfx.wav` | The sound effects alone (to mix under your voiceover) |
| `miran-signals-cover.png` | 1080×1920 cover (frame 1000) |
| `storyboard.png` (repo root) | Captioned storyboard of real stills |

Final settings: H.264, CRF 16, yuv420p, preset slow, 60fps. They're on the render command, not in `remotion.config.ts` (setting them there breaks the WAV render).

## Your voiceover

There's no voiceover in the mix. A suggested script, timed to the beats:

| Time | Frames | Line |
|---|---|---|
| 0.2–2.9s | 10–172 | متداولان، نفس الذهب… نتيجتان مختلفتان. |
| 3.3–5.5s | 196–330 | كلاهما اشترى الذهب. |
| 5.7–8.0s | 344–480 | الذهب يرتفع… وكلاهما يربح. |
| 8.3–9.8s | 500–590 | Miran Gold نبّهت: خبر قوي قادم. |
| 10.0–11.6s | 600–694 | فخرج بربحه قبل الخبر. |
| 11.9–13.8s | 712–828 | ثم صدر الخبر… وهبط الذهب. |
| 14.2–16.0s | 850–958 | الفرق ليس في الحظ… بل في الخطة. |
| 16.1–18.3s | 966–1098 | الخطة: وقف خسارة + تنبيه قبل الخبر. |
| 20.6–22.5s | 1238–1348 | تداول بخطة مع Miran Gold. |

The end card runs from 22.6s to 26.8s. If your takes run longer or shorter, change the timings in `TIMING` (below) and re-render: captions, screens, sound and camera all follow.

## Commands

```bash
npm install
npm run studio          # Remotion Studio (live preview)
npm run stills          # QA stills → out/stills (args: outDir scale frames [--safe] [--feed])
npm run stills -- out/safe 0.5 300,830,1000 --safe   # with Instagram's UI zones drawn on top
npm run check:camera    # camera path smoothness (both formats)
npm run blur:budget     # how many frames get motion blur, and a render-time estimate
npm run preview         # half-res draft → out/preview.mp4
npm run sfx:make        # re-synthesise the sound effects into public/sfx
npm run render:all      # every deliverable (scripts/render-all.sh), then a frame scan
npm run scan -- out/miran-signals-silent.mp4   # flicker / black / glitched frame scan
python3 scripts/storyboard.py storyboard.png out/sb   # captioned storyboard from stills
```

Rendering uses the Chrome Headless Shell in `/opt/pw-browsers` with SwiftShader through ANGLE (`swangle`): no GPU needed, and every frame is deterministic. Concurrency is 1. A full-res format takes about 45 minutes, so run `setsid nohup bash scripts/render-all.sh > out/render-all.log 2>&1 &` and poll. IBM Plex Sans Arabic is bundled through `@fontsource`, so rendering never fetches fonts. If Chrome hits certificate errors on other downloads, add your network's TLS-inspection CA to its NSS store (`certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n name -i ca.crt`). Never turn TLS checks off.

## Changing things

Everything you're likely to change is in **`src/data.ts`**:

- **Copy:**
  - `COPY.ar`: the captions (`hookA`, `hookB`, `entry`, `rise`, `warning`, `exit`, `news`, `payoffA`, `payoffB`, `flip`), the scoreboard labels, the CTA and the disclaimer. In each caption block, `gold` / `red` list the words drawn in gold or red. Write the brand as `Miran Gold` (Latin): the caption animation keeps a run of Latin words together as one left-to-right unit.
  - `SCREEN_COPY.ar`: every word inside the phones.
  - (`COPY.en` / `SCREEN_COPY.en` are kept for a possible English cut but nothing renders them.)
- **Prices:** `MARKET.price` is the gold price as `[frame, price]` keyframes joined by a smooth curve. The news drop is the stretch from frame 758 to 776.
- **The trades:**
  - `LEFT`: lots, leverage, entry, close price, P&L, balances and the margin-call frame.
  - `SIGNAL`: entry, stop loss, target, lots and risk.
  - `UPDATE`: the update frame, close price and profit.
  - `RIGHT`: the balances.
  - If you change a trade, keep the numbers consistent: P&L = lots × 100 oz × the price move.
- **Colours:** `BRAND` (navy, gold, text, red, green) and `STUDIO` (backdrop, floor, the titanium frame and back glass of the phones).
- **Timings** are in `TIMING`, in frames at 60fps (60 = 1 second):

| Beat | Keys |
|---|---|
| Hook | `hookAIn/Out`, `hookBIn/Out` |
| Scoreboards | `boardsIn`, `boardsOut` |
| Both buy, gold rises | `entryIn/Out`, `riseIn/Out`, plus `LEFT.tapAt/openedAt`, `SIGNAL.at/filledAt` |
| The alert | `warningIn/Out`, `exitIn/Out`, plus `UPDATE.at/tapAt/closedAt` |
| The news | `NEWS.at`, `newsIn/Out`, `LEFT.marginCallAt` |
| Payoff and lesson | `payoffAIn/Out`, `payoffBIn/Out` |
| The switch | `streakStart/End`, `flipStart/End`, `impactAt`, `flipTextIn/Out` |
| End card | `endCardStart`, `logoAt`, `disclaimerAt`, `ctaAt`, `tapAt`, `holdFrom` |
| Cover | `coverFrame` |

- **Camera:** the shots and the edit (which shot runs when, and the blends) are in `src/lib/camera.ts` (`SHOTS`, `EDIT`). Run `npm run check:camera` after changing them.
- **Layout per format:** `LAYOUT.vertical` / `LAYOUT.feed` set the caption position and size, the scoreboard position, the framing (`distScale`, `focusY`) and the end card.

After any change: `npm run stills` to check, then `npm run render:all`.

## How it's built

- **Phones** (`src/three/Phone.tsx`, `phoneGeometry.ts`) are iPhone-style but unbranded:
  - Continuous ("squircle") corners and flat satin titanium sides with antenna bands.
  - The real button layout: action button and volume on the left, side button and a flush sapphire camera control on the right.
  - A thin even black border around the screen.
  - A matte glass back with a square camera plateau: three lenses, flash and LiDAR.
  - On the screen texture: the Dynamic Island, the iOS status bar and the home indicator.
  - No logos.
- **Screens** (`src/screens/draw.ts`) are drawn per frame into 1206×2622 canvases (402×874 pt at 3×):
  - One big balance (the live account value, tinted green when up and red when down), one thick glowing price line, and one large card at a time in plain words, with iOS-style scale and fade transitions.
  - Alerts arrive as **Live Activities**: the Dynamic Island expands (red news on the left; the gold Miran Gold alert, then green "protected", on the right).
  - The big loss is a radial red wipe, with its content landing in order.
- **Overlays** (`src/ui`):
  - Captions use a blur-reveal word animation (word by word, never letter by letter, so Arabic letters stay joined) on frosted-glass pills.
  - The scoreboards are frosted glass and show the same live account value as the screens.
  - Whichever phone isn't the subject dims (`focus()` in `src/lib/story.ts`), so the eye goes where the story is.
- **Motion:** every animated value is a pure function of the frame (`src/lib/story.ts`, `camera.ts`), with no `useFrame`.
  - The phones rise into place at the start. The right phone lifts on its good moments; the left sinks after the margin call.
  - The same news candle hits both screens on the same frame, with a camera jolt and a speed-ramped push.
  - The switch: a gold bar streak, a 360° flip and a 3-frame navy/gold impact frame.
  - Real accumulation motion blur only where things move fast (the intro, the streak, the flip).
- **Studio:** a navy cyclorama with a glossy floor that reflects the screens. Soft side light orbs sit on the backdrop: the left one turns red at the news and gold after the switch; the right one is gold. Coloured light pools sit under each phone.

## Sound

Synthesised effects (`scripts/make-sfx.py`, original, no library samples), cued from the same timings as the visuals (`src/sound.tsx`):

- Soft thocks as the captions land.
- The left: the Buy tap and an error tone.
- The right: gold chimes as the signal builds, the update chime, the take-profit tap and the TP chime.
- A heartbeat before the news, then the sub-drop and hit on the news candle.
- The left: the margin-call alarm. The right: a soft shield tone.
- The metallic whoosh, swish and impact on the switch, the logo sting and the CTA tap.

The mix sits around −20 LUFS with peaks near −3 dBFS, so it stays under music and your voiceover. `SFX_MASTER` in `src/sound.tsx` sets the overall level.

## Layout and safe zones

On 9:16, Instagram covers the top 220px, the bottom 400px and the right 140px. All text stays in a centred 800px column (140px margins), from 256px down to 1500px. The 4:5 version is re-framed (camera, type and layout per format), not cropped. Check with `npm run stills -- out/safe 0.5 300,830,1000 --safe`.

## Compliance notes (for Miran Gold's sign-off)

Built in:

- No "guaranteed", "risk-free", "easy money", "passive income" or "get rich" language.
- No real people, testimonials, brokers or platforms; the app is generic. No trading method is called a scam: the message is about trading without a plan, a stop loss or market updates.
- The news event is generic («خبر اقتصادي قوي», big economic news), with no date and no claim about a real release.
- Every result is labelled «توضيحي». The Miran side shows 1% risk, a stop loss set and a modest result (+1.4%). The left phone doesn't magically recover after switching.
- The risk disclaimer is readable on mute and on screen for about 3.7 seconds.

Worth checking with compliance before running it as an ad:

- **Meta:** ads for trading or signals services fall under the "Financial products and services" special ad category in many regions. Some regions need advertiser verification or a licence, and signals services can be restricted. Check the targeting countries.
- **Regional rules:** depending on where it runs, the authority may be the UAE (SCA/DFSA/FSRA), Saudi Arabia (CMA), Egypt (FRA), Jordan (JSC) or others, and the UK FCA or EU (ESMA) if it reaches those audiences.
  - A signals service may count as investment advice and need a licence.
  - Some regulators require a specific risk-warning wording, or a "% of retail accounts lose money" statement for leveraged products.
- **Performance figures:** the +$140 / +1.4% / $10,140 are illustrative. Some rules forbid showing hypothetical results at all, or require a stated basis.
- **Leverage:** 1:200 is shown as a negative example, but leverage above local retail caps may still need care in some regions.
- **The disclaimer:** check its wording, size and duration against each platform's and regulator's minimum.
- **The iPhone look:** the phones resemble iPhones (Dynamic Island, camera plateau) but carry no Apple logo or name. That's common in ads, but a very close likeness of Apple's design can draw objections; worth a quick check.
