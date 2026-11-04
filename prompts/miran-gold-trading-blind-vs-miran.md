Build a 20-second vertical motion-graphics reel for Miran Gold: "Trading blind vs. trading with Miran Gold." Two 3D phones side by side, same gold market, same day.

The left phone trades with no strategy (copying a stranger and guessing), no risk management (no stop loss, oversized lots, high leverage) and without following major market updates. It walks straight into a high-impact news release and gets wiped.

The right phone trades with Miran Gold:
- a clear strategy (a signal with entry, stop loss and targets);
- risk management (1% risk per trade, stop loss always set, stop moved to break-even);
- market updates (a Miran alert warned about the news release before it hit).

It comes through protected and grows steadily. Then the left phone flips and switches to Miran Gold.

The whole reel is built on these three pillars: strategy, risk management, market updates. It must match the quality of the Hot Pepper Media competitor reel (`hpm-competitor-remotion/`): cinematic shots, real motion blur, rich materials and lighting, crisp type, tight timing. The final output is an MP4 for Instagram Reels and paid ads.

## References (read first, do not modify)
- `hpm-competitor-remotion/`: the technical template. Reuse its engine instead of rebuilding it: the accumulation motion-blur pipeline (`src/three/Pipeline.tsx`, `motionBlurRule.ts`), the phone geometry and glass (`phoneGeometry.ts`, `Phone.tsx`, `glass.ts`), the canvas screen kit with cached layers, content keys and hi/lo texture tiers (`src/screens/kit.ts`, `useScreenTexture.ts`), the camera shot list and blends (`src/lib/camera.ts`), the kinetic type, `scripts/check-camera.ts`, `scan-frames.py`, `blur-budget.ts`, `render-all.sh`, `make-sfx.py` and `make-voiceover.py`.
- `miran-gold-tensions/` and `miran-gold-falling/`: the Miran Gold brand. Use their colours (`src/theme.ts`), Arabic text rules (`ArabicText`), strings file pattern, the "توضيحي" (illustrative) label, and the logo (`public/logo.png`, cropped from `assets/logo-source.jpg`).

## Skills
Load and follow remotion-best-practices (including its 3D rules). If remotion-create, remotion-render or video-shotcraft are installed, load them too and use video-shotcraft's shot recipes to plan every shot.

## Project setup
- A new, separate folder `miran-signals-remotion/` on its own new git branch. Commit and push as you go.
- Remotion + @remotion/three (React Three Fiber) + @remotion/motion-blur, with the same pinned versions as `hpm-competitor-remotion`. Deterministic: every animation is a pure function of the frame, with no useFrame and no screen recording.
- Main composition: 1080×1920, 60fps, 1200 frames (20s), Arabic. Also a 1080×1350 (4:5) composition for feed ads, re-framed (not just cropped). Optional: an English composition with the same picture and the strings swapped.
- Final render: H.264, CRF 16, yuv420p, preset slow → `miran-signals.mp4` and `miran-signals-4x5.mp4`, plus a no-voice version, a silent version, an SFX-only WAV and a 1080×1920 PNG cover. Render each format's picture once (muted) and mux the audio mixes on, as `render-all.sh` does.
- All copy, numbers, prices, colours and timings live in one `data.ts`.

## The two phones (fictional, generic)
Both phones run the same fictional, unbranded trading app on XAU/USD (gold). No real broker, platform, app, trader, logo or UI (no MetaTrader, TradingView, eToro or similar). Use plausible gold price levels for the time of making, set in `data.ts`.

**The shared event.** Both phones live through the same moment: a generic high-impact US data release ("High-impact USD news", e.g. "US inflation data", with no real date and no claimed real outcome). Gold spikes sharply against the left phone's position: one long candle, with the price line jumping. Show it on both screens at the same frame. It is the turning point of the gap.

- **LEFT, "تداول بلا خطة" (trading without a plan).** One phone, three failures, each made visible on screen:
  - **No strategy:** trades copied from an anonymous "top trader" (a clearly generic handle such as `TopTrader_07`), plus random buys and sells, opened late and closed in panic. Each trade row has a small "?" where a reason should be.
  - **No risk management:** every position shows "SL: —" (no stop loss), a big lot size and 1:500 leverage. A risk meter on the account sits in the red.
  - **No market updates:** the economic calendar the trader never opened. When the news candle hits, a late notification arrives after the damage: "High-impact USD news released". The position takes the full spike, the margin level collapses ("Margin level 112%"), then "Margin call".
  - The balance ticks down from $10,000 to $6,850, with floating P&L in red and a red candle chart sliding.
  - Notifications stack: "Trade copied", "Position closed −$420", "Margin warning", the late news alert, and finally "Margin call".
- **RIGHT, "التداول مع ميران جولد" (trading with Miran Gold).** The same market and the same spike. The three pillars, each made visible:
  - **Strategy:** a clean Miran signal card. "XAU/USD BUY", entry, stop loss, TP1 and TP2, and a one-line reason ("Support retest + trend").
  - **Risk management:** "Risk 1%" on the card, the stop loss always set, the stop moved to break-even after TP1 ("TP1 ✓ +$212"), and a calm, green risk meter.
  - **Market updates:** a Miran "Market update" card arrives before the news, e.g. "High-impact USD data in 30 min: protect open trades / wait for confirmation". The trader has already secured profit or tightened the stop, so when the spike hits, the account barely moves. Then a fresh signal after the dust settles.
  - The balance climbs steadily from $10,000 to $10,640 (+6.4%).
  - The trade history includes one small, controlled loss (−0.5%, stopped out). Honesty: the point is the plan and the risk control, not magic.
  - Its glow is warm gold.
- Every number carries a small "توضيحي" (illustrative) label.
- Show numbers as Western digits with comma formatting, wrapped in `<bdi>` inside Arabic lines.

## Timeline (60fps)
1. **0–3s (0–180) HOOK.** Open mid-action: two sleek 3D phones in a dark navy studio, labelled "تداول بلا خطة" and "التداول مع ميران جولد". The left phone is already flashing red, with notifications stacking, a cold red glow on the floor and a slight vibration. The right phone has a calm gold glow and its chart is ticking up. A big kinetic headline across the top: «نفس السوق. نفس الذهب.» then «نتيجتان مختلفتان.»
2. **3–9s (180–540) THE GAP.** The camera moves between the phones in three distinct shots, one per pillar. Each shot compares the left phone with the right on one pillar.
   - **Strategy.** Left, macro: copied and random trades with a "?" where the reason should be, and the balance counting down. Right: the Miran signal card builds line by line. Kinetic line: «بلا استراتيجية» vs «استراتيجية واضحة».
   - **Risk management.** Low 3/4 across both phones: "SL: —" and 1:500 flash on the left, and the risk meter swings red; the right shows "Risk 1%", stop loss set, and its meter steady and green. Kinetic line: «بلا إدارة مخاطر» vs «إدارة مخاطر بنسبة 1%».
   - **Market updates.** Overhead: the Miran "Market update" card lands on the right phone; the left phone gets nothing. Then the news candle spikes on both screens at the same frame (a camera jolt and a speed ramp). The left balance plunges into "Margin call" under a red pool of light; the right is protected (stop at break-even, "TP1 ✓") under a gold pool. Kinetic line: «تجاهل أخبار السوق» vs «تحديثات السوق أولاً بأول».
   - Each line pair animates as a mirrored split: the red "without" on the left phone's side, the gold "with" on the right.
3. **9–12s (540–720) THE TWIST.** Push in on the right phone's screen. A Miran Gold checklist card reveals with the emblem, each item ticking gold in turn: «✓ استراتيجية» «✓ إدارة مخاطر» «✓ تحديثات السوق». A small "مصدر الإشارة: ميران جولد" tag glints. Text: «الفرق ليس في الحظ…» then «بل في الخطة.»
4. **12–17s (720–1020) THE FLIP.**
   - A gold light streak (a gold bar or coin with a long trail) whips across the frame.
   - The left phone flips 360° in 3D (speed ramp, motion blur) and lands on one impact frame: a two-tone navy and gold silhouette, 3 frames.
   - It comes back on the Miran Gold screen: its first signal card with stop loss set and "Risk 1%", a Miran market-update card for the day, and the balance holding and starting to recover (modest: "+1.2%", not instant riches).
   - Both phones now pulse in sync with gold light.
   - Text: «تداول بخطة مع ميران جولد.»
5. **17–20s (1020–1200) END CARD.**
   - A soft blur to deep navy with a few drifting gold particles.
   - The Miran Gold logo animates in, then a gold CTA button «انضم إلى إشارات ميران جولد».
   - A legible risk disclaimer, on screen for at least 2 seconds and inside the safe zone: «التداول ينطوي على مخاطر عالية وقد تخسر رأس مالك. النتائج المعروضة توضيحية وليست ضماناً لأرباح مستقبلية.»
   - Hold the last second still.

## Compliance (financial ad)
- No "guaranteed", "risk-free", "easy money", "passive income" or "get rich" language, in copy or voiceover.
- No real people, testimonials, brokers or platforms.
- Don't call copy trading or any other method a scam. The message is "trading without strategy, risk management or market awareness".
- The news event is generic: no real dates or headlines, and no claim about what any real release did to gold.
- Every result shown is labelled illustrative. The winning side shows controlled risk and one small loss.
- Keep the disclaimer readable on mute.
- Flag anything that may need Miran Gold's compliance sign-off, such as regional ad rules for financial services or a special ad category on Meta.

## Visual quality (same bar as the Hot Pepper reel)
- **Phones:** original, unbranded designs, as in the Hot Pepper reel (satin frame, glossy glass with Fresnel reflections, rounded screens), with a dark titanium frame to suit the navy studio.
- **Studio:** a deep navy cyclorama (`bgTop #0A0E18` → `bgBottom #131A2A`) with a soft gold key, gold rim lights catching the frame edges, and a glossy dark floor.
  - The left phone throws a cold red pool (`#D9534F`) that pulses with each loss.
  - The right phone throws a warm gold pool (`#C8963E` / `#F3D27A`).
  - After the flip, both glow gold.
- **Screens:** the app UI is drawn into CanvasTextures at 1200×2670, with cached static layers and content keys, so text is razor sharp and the per-frame cost stays low.
  - Candlestick charts with a live price line.
  - Green `#4CC38A` and red `#D9534F` for P&L.
  - Gold `#D4A24C` → `#F3D27A` as the brand accent.
  - Dark UI cards (`#141A28`) with light text (`#F5F1E8`) and grey meta text.
- **Motion blur:** real motion blur on the whips, the streak and the flip; none on still moments or slow drifts (a still threshold of about 6px), so screen text stays crisp.
- **Camera:** at least 5 distinct shots (wide two-shot, a macro on each screen, overhead, low 3/4 hero, push-in on the signal card), eased moves, speed ramps and one impact frame at the flip. Never linear.
- **Typography:** big kinetic Arabic type in IBM Plex Sans Arabic (bold/extrabold via @fontsource, bundled, never fetched), RTL.
  - Animate word by word, never letter by letter, so letters stay joined. No letter-spacing.
  - Key words get the gold gradient; losses get red.
  - Readable on mute. Lines over busy screens get a dark glass backing block.
- **Finish:** a consistent warm-gold grade, very subtle film grain and vignette. Crisp, never blurry text.

## Layout
- Everything is centred on the frame, in one centred column with equal 140px side margins.
- Instagram safe zones: nothing important in the top 220px, the bottom 400px or the right 140px.
- Check that the disclaimer and the CTA sit inside the safe area.
- In the 4:5 version, keep the key text inside the central area too.

## Sound
Synthesised, like the Hot Pepper reel's `make-sfx.py`:
- Left: harsh, descending error blips for each loss, a heartbeat-like low pulse under the margin warning, and an alarm-like (but soft) margin-call tone.
- Right: soft, rising gold chimes when the signal card builds and when TP1 hits, and a calm "update" chime for the Miran market-update card.
- The news spike: a sudden sub-drop and rumble on both sides at the same frame. On the left it lands hard; on the right a soft "shield" tone follows.
- The twist checklist: three gold ticks.
- A metallic whoosh for the gold streak, a whoosh and impact on the flip, a warm logo hit and a tap on the CTA.

Keep it soft (about −20 LUFS, peaks around −3 dBFS) so it sits under music added in Instagram. Also export a no-voice version, a silent version and an SFX-only WAV.

Voiceover (optional, Arabic, generated with `make-voiceover.py`; check the Arabic voice quality and fall back to sound effects only if no clean take): «نفس السوق… نتيجتان مختلفتان.» at the start, «استراتيجية، إدارة مخاطر، وتحديثات السوق.» at the twist, and «تداول بخطة مع ميران جولد.» at the flip.

## Quality checks before the final render
- Check that each pillar (strategy, risk management, market updates) reads clearly on mute, both in the gap and in the twist checklist.
- Plan the shots first and show me a captioned storyboard of real stills before rendering.
- Render stills across the timeline and check:
  - legibility of the Arabic (letters joined, no clipped diacritics);
  - safe zones;
  - nothing clipped;
  - brand colours;
  - sharp screen text at full resolution.
- Check the camera path numerically for jerks (`check-camera.ts`; use C2-smooth easings).
- Check the motion-blur budget (`blur-budget.ts`).
- Render a half-res preview first, then the final renders.
- Scan the final videos for flicker or black/glitched frames (`scan-frames.py`, with the impact frames whitelisted) and fix any before delivering.

## Technical notes from the last build (same environment)
- Render with the Chrome Headless Shell in `/opt/pw-browsers` and `gl "swangle"` (no GPU). Concurrency 1. Run long renders detached (`setsid nohup … &`) and poll; background jobs time out after 30 minutes.
- Google Fonts and other downloads can fail with a certificate error, because Remotion's Chrome connects directly and that traffic is intercepted by the egress gateway. Add the system's Anthropic egress CAs from `/usr/local/share/ca-certificates/` (egress-gateway and swp, production and staging) to Chrome's NSS store with `certutil -A -t "C,,"`. Never disable TLS checks. (IBM Plex Sans Arabic via @fontsource avoids this for the type.)
- Keep CRF, x264 preset and pixel format on the render command, not in `remotion.config.ts` (it breaks WAV renders).
- Software rendering is slow, so keep the costs that bit last time down:
  - **Unlit cyclorama:** shade the floor and wall with a designed shader, and use soft projected decal shadows instead of shadow maps.
  - **Cheap screen glass:** a glass shader on the screens, not clear-coat PBR with area lights.
  - **Bloom only where needed:** half resolution, and only while something bright is on screen.
  - **Canvas costs:** cache static canvas layers, redraw a screen only when its content changes, and use a cached shadow sprite instead of `shadowBlur`.
  - **Texture tiers:** a full-res texture (no mipmaps) in close-ups, a half-res mipmapped one in wide shots.
  - **Canvas DPR:** let it follow the render scale (≤1), so the half-res preview is cheap.
  - **Budget:** expect about 1.7s a frame plus about 0.55s per extra motion-blur sample, around 50 minutes per format.
- No depth of field on the screen close-ups (it softened the text), and damp any phone vibration while the camera is close on that screen (it caused one-frame flicker).
- Never use flatShading (it produced NaN pixels that bloom smeared into a black frame); bake normals instead.

When done, tell me the output file paths and how to change the copy, numbers, prices, colours and timings.
