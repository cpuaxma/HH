# Miran Gold: how automatic copy trading works (copy trading reel)

A 37.5-second Arabic explainer reel (1080×1920 and 1080×1350, 60fps, 2250 frames). It's built in the same Remotion project as the signals reel and reuses its look: the iPhone-style 3D phone, the canvas-drawn screens with the gold Miran Gold theme, the auto-copy switch, the frosted-glass scoreboard, the end card and the sound kit.

**One gold Miran Gold phone**, centred in the navy studio. The story plays out step by step on its screen, like an Arabic iOS app (pages push in from the left, and a fingertip shows each tap and drag):

| # | Time | On the phone | Board under the phone |
|---|---|---|---|
| 1 | 0–4.2s | «ما هو النسخ التلقائي؟» and a small diagram: copies travel from Miran Gold to «حسابك», then «صفقات Miran Gold تُنسخ إلى حسابك تلقائياً» | (comes in at 4.4s) |
| 2 | 4.2–8.8s | «ربط الحساب»: your generic trading account (no broker or platform), the «ربط الحساب» button is tapped, it links, then «تم الربط مع Miran Gold» | «غير مرتبط» → «مرتبط · النسخ متوقف» |
| 3 | 8.8–15.2s | «إعدادات النسخ»: the copy ratio is dragged from ×1.0 to ×0.5, the risk per trade from 2% to 1%, the 3% daily loss limit is switched on, then «حفظ الإعدادات» → «تم الحفظ». Note: «النسخ لا يلغي المخاطرة، والنتائج قد تختلف» | |
| 4 | 15.2–18.5s | «النسخ التلقائي»: the big switch is tapped on («مفعّل»), with chips for the chosen settings and «بانتظار إشارة Miran Gold» | «النسخ التلقائي: مفعّل» |
| 5 | 18.5–23s | The account screen. Live Activity «إشارة جديدة من Miran Gold». The signal card builds: «شراء الذهب», entry 4,002.0 / stop loss 3,997.0 / target 4,012.0, «حجمك ×0.5», «الخسارة عند الوقف −$50». Then «نُسخت تلقائياً». The levels show on the chart and the balance follows the price | live value |
| 6 | 23–27.3s | Live Activity «تنبيه أخبار من Miran Gold · خبر قوي بعد 15 دقيقة». The card says «الخطة: إغلاق الصفقة قبل الخبر», «يُنسخ إلى حسابك تلقائياً». Then «أُغلقت حسب الخطة», «نُسخت تلقائياً», «النتيجة: +$70», «النتيجة قد تكون ربحاً أو خسارة». The release then hits the chart: «صدر الخبر · لا صفقات مفتوحة» | $10,070, +0.7% |
| 7 | 27.3–32s | «أنت المتحكّم»: the switch is tapped off («متوقف مؤقتاً · لن تُنسخ إشارات جديدة»), then on again («مفعّل»). «يمكنك الإيقاف أو التشغيل في أي وقت» | «متوقف مؤقتاً» → «مفعّل» |
| 8 | 32–37.5s | End card: the logo, «Miran Gold», «إشارات • تنبيهات الأخبار • نسخ تلقائي», CTA «انضم إلى إشارات Miran Gold», and the risk disclaimer (on screen for 4.9s) | |

There are no captions over the frame. The phone UI and your voiceover explain it. Everything carries a «توضيحي» label: the app header on every screen, the board, and the disclaimer. "Miran Gold" is always written in English.

## Deliverables

In `deliverables/copy-trading/` (and `out/` after a render):

| File | What |
|---|---|
| `miran-copy-trading.mp4` | 9:16 (1080×1920), with the sound effects |
| `miran-copy-trading-silent.mp4` | 9:16, muted (for your voiceover) |
| `miran-copy-trading-4x5.mp4` | 4:5 (1080×1350), re-framed for the feed, with the sound effects |
| `miran-copy-trading-4x5-silent.mp4` | 4:5, muted |
| `miran-copy-trading-sfx.wav` | The sound effects alone |
| `miran-copy-trading-cover.png` | 1080×1920 cover (frame 1250: the copied signal) |
| `storyboard-copy-trading.png` (project root) | Captioned storyboard of real stills |

Final settings: H.264, CRF 16, yuv420p, preset slow, 60fps. They're passed on the render command in `scripts/render-copy.sh`, not set in `remotion.config.ts`. Each format's picture is rendered once (muted), and the effects WAV is muxed onto it.

Compositions: `MiranCopyTrading` (9:16), `MiranCopyTrading4x5` (4:5) and `MiranCopyTradingSfx` (the WAV). The signals reel's compositions are unchanged.

## Your voiceover (Arabic narration script)

There's no voiceover in the mix. The script below is short and simple on purpose (about 47 words for 37.5s), so it fits comfortably when read by text to speech. Each line has roughly twice the time it needs, so it can start a little late or run a little slow:

| Time | Line | On screen |
|---|---|---|
| 0.2–2.0s | ما هو النسخ التلقائي؟ | the question |
| 2.2–4.2s | صفقات Miran Gold تُنسخ إلى حسابك. | the diagram |
| 4.6–7.4s | أولاً، اربط حسابك. | connect, linked |
| 9.0–13.5s | اختر حجم النسخ، وحدّ المخاطرة. | the sliders, the daily limit, save |
| 15.3–17.5s | ثم فعّل النسخ التلقائي. | the big switch |
| 19.0–23.0s | تصل إشارة… فتُنسخ إلى حسابك تلقائياً. | the signal, «نُسخت تلقائياً» |
| 23.2–26.0s | وقبل الخبر القوي، تُغلق الصفقة حسب الخطة. | the news alert, closed by plan |
| 27.6–31.8s | وتستطيع إيقاف النسخ متى شئت. | the switch off, then on |
| 32.4–35.5s | انضم إلى إشارات Miran Gold. | the end card |
| 35.8–37.5s | النسخ لا يلغي المخاطرة. | the disclaimer |

The gaps (7.4–9.0s, 13.5–15.3s, 26.0–27.6s) are deliberate: the taps and the sound effects carry those moments.

If your takes run longer or shorter, change the timings in `T` (below) and re-render. The screens, the taps, the board, the sound and the camera all follow.

## Placeholders to confirm with Miran Gold

Every number is a placeholder (`PLACEHOLDERS` in `src/copy/data.ts`). None of them is a real Miran Gold term:

- Demo balance **$10,000**.
- Copy ratio **×1.0 → ×0.5** (slider range ×0.25–×2.0). Does Miran Gold offer a ratio, a fixed size or a multiplier, and with what range?
- Risk per trade **2% → 1%** (slider range 0.5–5%). Is there a per-trade risk cap, and how does it interact with the ratio?
- Daily loss limit **3%**. Does it exist, and what happens when it's reached?
- Signal **buy gold, entry 4,002.0, stop loss 3,997.0, target 4,012.0** (USD/oz).
- **$10 per $1 move** after the ratio, so the loss at the stop is **−$50 (0.5%)**.
- Closed by plan at **4,009.0**: **+$70 (+0.7%)**, account **$10,070**.
- News alert lead time: **"high-impact news in 15 minutes"**.
- Not shown, so nothing invented: minimum deposit, fees or subscription price, supported brokers or platforms, copy latency or slippage.

## Commands

```bash
npm install
npm run studio                 # Remotion Studio: pick MiranCopyTrading
npm run copy:stills            # storyboard stills → out/copy-stills
npm run copy:storyboard        # captioned storyboard → storyboard-copy-trading.png
npm run copy:check:camera      # camera path smoothness (both formats)
npm run copy:blur:budget       # motion-blur frames and a render-time estimate
npm run copy:preview           # half-res draft → out/copy-preview.mp4 (+ frame scan)
setsid nohup bash scripts/render-copy.sh > out/render-copy.log 2>&1 &   # the finals (+ frame scan)
python3 scripts/scan-frames.py --intended none out/miran-copy-trading-silent.mp4
```

Rendering is the same as for the signals reel: the Chrome Headless Shell in `/opt/pw-browsers`, `gl` swangle (SwiftShader through ANGLE), concurrency 1. A full-res format takes about 25 minutes here, so run it detached and poll the log.

## Changing things

Everything for this reel is in **`src/copy/data.ts`**:

- **Copy:**
  - `SCREEN`: every word on the phone.
  - `BOARD`: the board's label and its four statuses.
  - `END`: the tagline, the CTA and the disclaimer.
  - `ILLUSTRATIVE`: the «توضيحي» label.
  - Write the brand as `Miran Gold` (Latin). Numbers inside Arabic strings go through `iso()`, so «1%» never shows as «%1».
- **Numbers:** `PLACEHOLDERS` (above). `MAX_LOSS`, `RESULT` and `FINAL_BALANCE` are derived from it, so the screen, the board and the end result stay consistent.
- **The market:** `MARKET.price` is the gold price as `[frame, price]` keyframes. The release is the drop at `T.newsAt` (frame 1552).
- **Colours:**
  - `COLORS`: the phone's gold frame and back, the status colours, the alert amber.
  - The gold Miran Gold screen theme and `BRAND` (navy, gold, green, red) are shared with the signals reel, in `src/screens/draw.ts` and `src/data.ts`.
- **Timings** are in `T`, in frames at 60fps:

| Beat | Keys |
|---|---|
| Hook | `questionAt`, `diagramAt` |
| Connect | `connectPage`, `connectTapAt`, `linkedAt` |
| Settings | `settingsPage`, `ratioGrab/Release`, `riskGrab/Release`, `dailyTapAt`, `saveTapAt` |
| Auto copy | `autoPage`, `autoOnAt` |
| Signal | `dashPage`, `signalAt`, `copiedAt` |
| News | `alertAt`, `closedAt`, `newsAt` |
| In control | `controlAt`, `pauseTapAt`, `resumeTapAt` |
| Board | `boardIn`, `boardOut` |
| End card | `endCardStart`, `logoAt`, `disclaimerAt`, `ctaAt`, `tapAt`, `holdFrom` |
| Length, cover | `durationInFrames`, `coverFrame` |

- **Layout per format:** `LAYOUT.vertical` / `LAYOUT.feed` set the phone framing (`focusY`, `distScale`), the board and the end card.
- **Camera:** the shots and the edit are in `src/copy/camera.ts` (`SHOTS`, `EDIT`). Run `npm run copy:check:camera` after changing them.

## How it's built

`src/copy/`:

| File | What it does |
|---|---|
| `data.ts` | Copy, numbers, timings, layout |
| `story.ts` | Every animated value as a pure function of the frame: pages, switch state, sliders, price, account value, phone pose, glow |
| `camera.ts` | The single-phone camera |
| `screens.ts` | The phone pages, drawn on canvas with the signals reel's drawing kit |
| `Scene.tsx` | One phone in the shared studio |
| `Overlays.tsx` | The board, the shared end card, the finish |
| `sound.tsx` | Cues for the shared sound effects |
| `CopyReel.tsx` | The composition |

Every animation is a pure function of the frame: no `useFrame`, no state and no screen recording. The phone never moves fast enough to trigger motion blur (`npm run copy:blur:budget`), so every frame is rendered once and stays sharp.

To share code without touching the signals reel, a few shared modules gained optional parameters whose defaults are the old behaviour:

- `Pipeline` takes `camera`, `bloom` and `impactAt`.
- `Studio` takes `orbs`.
- `EndCard` and `Finish` take a config.
- `chart` takes a price source.
- `scan-frames.py` takes `--intended`.

Several drawing helpers in `src/screens/draw.ts` are now exported. The chart's level tags, which the signals reel never draws, now sit inside the screen. Stills of the signals reel were checked pixel-identical before and after.

## Compliance flags (for Miran Gold's sign-off)

Built in:

- No "guaranteed", "risk-free", "easy money", "passive income" or "get rich" language.
- The app says «النسخ لا يلغي المخاطرة، والنتائج قد تختلف» on the settings and switch screens, «النتيجة قد تكون ربحاً أو خسارة» on the result, and the end card says it again.
- The disclaimer is readable on mute, on screen for 4.9 seconds: «التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. النسخ التلقائي لا يلغي المخاطرة والنتائج قد تختلف. المحتوى توضيحي وليس ضماناً لأرباح مستقبلية.»
- No real people, testimonials, brokers or platforms. The account is «حساب التداول الخاص بك» and the news is a generic «خبر اقتصادي عالي التأثير».
- No trading method is called a scam.
- The signal shows its stop loss and the loss at the stop (−$50) before any result. The result is small (+0.7%) and labelled «توضيحي».

Needs Miran Gold's compliance sign-off:

1. **Offering copy trading at all.** Automatic copy trading (mirroring trades into a client's account) is regulated in many countries. It can count as portfolio management, investment advice or "dealing" and need a licence. Possible authorities include the UAE (SCA, DFSA, FSRA), Saudi Arabia (CMA), Egypt (FRA) and Jordan (JSC), and the UK FCA or the EU (ESMA/MiFID II) if the ad reaches those audiences. Confirm the countries the ad targets and the licence that covers them.
2. **"Connect your account" (step 2).** What is actually linked (a broker account through an API, a MAM/PAMM setup, a third-party platform)? Who holds the client's money? The reel shows only a generic link and makes no claim about custody. The real flow and any terms must match.
3. **The settings (step 3).** Copy ratio, risk-per-trade cap and daily loss limit are placeholders. Show only controls Miran Gold really offers, and confirm how they work. For example: does the daily limit stop copying or close trades?
4. **"Closed by plan, copied automatically" (step 6).** This implies Miran Gold manages open trades and that closes are mirrored. Confirm that's true. Also confirm the alert lead time, and that closes can fail or slip in fast markets.
5. **"You stay in control / stop at any time" (step 7).** Confirm that pausing really stops new copies, what happens to trades already open, and any notice periods, fees or lock-ins.
6. **Showing a result (+$70, +0.7%).** Even illustrative, a positive result can be read as a performance claim. Some regulators forbid hypothetical results or require a stated basis. Option: show a flat or negative result instead, or remove the number.
7. **Risk warning wording.** Some regulators require specific wording, a "% of retail accounts lose money" figure for leveraged products, or a minimum size and duration. Check the disclaimer against each market and platform.
8. **Meta ads policy.** Trading, signals and copy trading ads fall under the "Financial products and services" special ad category in many regions. Some regions need advertiser verification or a licence, and copy trading may be restricted.
9. **Implied performance or ease.** «صفقات Miran Gold تُنسخ إلى حسابك تلقائياً» describes the mechanism only. Make sure surrounding ad copy and your voiceover don't add profit claims.
10. **The iPhone look.** The phone resembles an iPhone (Dynamic Island, camera plateau) but carries no Apple logo or name. As with the signals reel, a quick check is worthwhile.
