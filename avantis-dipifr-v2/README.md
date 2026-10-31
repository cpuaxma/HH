# Avantis: "Four modules. One global qualification." (DipIFR reel, v2)

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) announcing the Avantis DipIFR course. It is built in Remotion with `@remotion/three` (React Three Fiber), so every frame is computed from the frame number and renders the same way every time. There is no audio. The scene changes and big moves land on a 120 BPM grid (one beat = 30 frames), so music added in Instagram sits on them.

## Scenes

1. **Hook (0–2s).** Huge kinetic type: "Does your CV speak IFRS?". The first word is already on screen at frame 0. Each word slams in. "IFRS?" lands in gold on the beat, with a punch-in and an underline swipe. At ~1.6s the line snap-zooms past the camera behind a sweep of light.
2. **Answer (2–6s).** "Meet DipIFR" and "ACCA's Diploma in International Financial Reporting". The 3D certificate rotates in: cream paper, navy frame, the logo's laurels in gold, and a gold seal. A light sweep crosses it, then "IFRS-focused. Internationally recognised.". The certificate then splits into four tiles, which flip to their module sides and fly off.
3. **Course (6–18s).** One module every 5 beats.
   - Each navy-and-gold tile flies in to a hero spot in front of the camera, then snaps into its slot in the stack on the beat. The lock lands with a camera shake and a gold edge glow.
   - The gold progress bar steps 25 → 50 → 75 → 100%, and a white card slides up with the module's number, name and what you'll learn.
   - Dashed gold outlines show the empty slots, so you can see the certificate being built.
   - At 100% the tiles flip back into the certificate, a light shimmers across it, and the seal stamps on. "Four modules. One global qualification." follows.
4. **Benefits (18–24s).** Three fast near-fullscreen beats, each with a big gold icon, 3–5 big words and one small line.
5. **End card (24–30s).** A sweep of light reveals the Avantis logo on a white badge. The logo builds layer by layer; its tagline is part of the logo. Then come the launch line and the gold CTA, followed by a still final second.

## Commands

```
npm ci
npm run studio          # preview and scrub in the browser
npm run stills          # QA stills across the timeline → out/stills (half size)
npm run stills -- out/safe 0.5 0,250,440,1060,1260,1790 --safe   # with Instagram's UI zones drawn on top
npm run preview         # half-res draft → out/preview.mp4
npm run render          # final → out/avantis-dipifr-reel.mp4 (H.264, CRF 16, yuv420p, preset slow, no audio)
npm run cover           # 1080×1920 cover still (the AvantisCover composition) → out/avantis-dipifr-cover.png
npm run check:camera    # numeric camera smoothness check
npm run check:video     # scans the final MP4 for black, flickering or glitched frames
```

The delivered files are `deliverables/avantis-dipifr-reel.mp4` and `deliverables/avantis-dipifr-cover.png`.

### Rendering in this environment

- **Browser and GPU:** rendering uses SwiftShader through ANGLE (`swangle`, set in `remotion.config.ts`), so no GPU is needed. Point `REMOTION_BROWSER` at a local Chrome Headless Shell, e.g. `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
- **Concurrency:** keep it at 1.
- **Long renders:** run them detached (`setsid nohup npm run render > out/render.log 2>&1 &`) and poll the log.
- **Fonts:** they load from Google Fonts. If Chrome reports `ERR_CERT_AUTHORITY_INVALID`, add the sandbox's egress CAs (the `Anthropic … Egress Gateway CA` and `TLS Inspection CA` certificates in `/root/.ccr/ca-bundle.crt`) to Chrome's NSS store with `certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n <name> -i <cert.pem>`. Don't disable TLS checks.

## Changing things

Everything you are likely to change is in **`src/data.ts`**. Text marked `PLACEHOLDER` there stands in for details the brief left open. Replace it before publishing.

- **Hook (`HOOK`):** one entry per word.
  - `at` is the frame the word slams in. 30 frames make one beat; the first word has `at: 0`, so it is on screen in the first frame.
  - `br` starts a new line after the word, and `accent` makes it the big gold word with the underline.
  - The other two hook lines from the brief are in the comment above `HOOK`, ready to swap in.
- **Copy (`COPY`):**
  - the answer title, line and sub-line
  - the text printed on the certificate (`certificate`)
  - the course eyebrow and payoff
  - the end card's `launch` line, `cta` button and optional `urgency` line (leave it empty unless it is true)
- **Modules (`MODULES`):** each module has three fields:
  - `short`: engraved on its 3D tile
  - `title`: shown on the white card
  - `learn`: shown on the white card

  The four tiles build the certificate, so keep it to four.
- **Course format (`COURSE_FORMAT`):** the gold-outlined chips. About three short items fit on one line.
- **Benefits (`BENEFITS`):** each has an `icon` (`globe`, `award`, `briefcase`, `chart` or `book`), `words` (3–5 big words; `|` breaks the line, and the last line is gold) and a small `line`.
- **Colours (`COLORS`, `CARD_COLORS`):**
  - The navy `#0B2351` and the logo grey come from the logo.
  - The background gradient runs from `bgTop` to `bgBottom`.
  - The gold accent is `gold` / `goldLight`, and light blue is `blue`.
  - On dark backgrounds, headlines use `headline` and body text uses `body`. The certificate paper is `paper`.
  - The cards keep the white / `#111` / `#333` / `#777` / `#EAEAEA` hierarchy.
- **Timings (`TIMING`, in frames at 60fps; keep big moments on multiples of 30):**
  - **Hook:** `hookInterrupt` (the snap zoom).
  - **Answer:** `answerStart` and `breakStart` (the certificate splits).
  - **Course:** `courseStart` and `moduleLength` (a module every 150 frames). Within a module, `LOCK` sets when the tile reaches the hero spot, leaves it, and locks into place.
  - **Finale of the course:** `morphStart` (the tiles flip back) and `sealStamp`.
  - **Benefits:** `benefitsStart` and `benefitLength`.
  - **End card:** `endStart`.
  - **Finer choreography:** the card timing is `CARD` in `src/ui/Course.tsx`, and the end card steps are `END` in `src/ui/EndCard.tsx`.
- **Layout:** `SAFE` holds Instagram's covered edges (top 220, bottom 400, right 140). `COLUMN` is the centred column every text and card uses (x 140–940).

## How it's built

- **3D motion (`src/lib/choreo.ts`).** Everything that moves in 3D is a pure function of the frame number:
  - **`groupPose`:** the certificate as a whole.
  - **`tileState`:** each tile:
    - part of the certificate
    - breaking off
    - flying in → hero → slot (eased in, so it lands with an impact on the beat)
    - locked
    - flipping back
  - The seal stamp, the gold glows and the light sweep.
- **Camera (`src/lib/camera.ts`).**
  - The camera has one framing per scene, blended with cubic-bezier in/out weights, plus slow layered sines for a hand-held drift.
  - Each lock and the seal stamp add a short decaying shake that starts from rest, so the motion stays continuous.
  - `scripts/check-camera.ts` checks the base path and the full camera for jerks, steps and turns.
- **Textures (`src/lib/textures.ts`).**
  - The certificate face, the four module faces and the seal are drawn to canvas once the fonts have loaded.
  - The certificate face reuses the laurels traced from the logo.
  - Each tile is a box: certificate strip on the front, module face on the back, gold metal edges.
- **Look (`src/three/*`).**
  - **Background:** a full-screen shader paints the navy gradient, two slow drifting glows and a static grain. The grain is static, so it can't flicker.
  - **Lighting:** the gold reflects a room environment. A warm key light and a cool rim light do the rest.
  - **Post-processing:** SMAA anti-aliasing and a light bloom that only the glowing gold reaches.
- **Overlays (`src/ui/*`).** Text, cards, the HUD, the benefits, the end card and the light sweeps are HTML. The logo is the exact traced vector logo (`src/lib/logoTrace.ts`, from `scripts/trace-logo.py`).
- **Cover (`src/Cover.tsx`).** The `AvantisCover` still shows the hook above the finished certificate, inside the centred 4:5 crop (y 285–1635) that the profile grid shows.
