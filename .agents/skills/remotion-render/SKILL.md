---
name: remotion-render
description: Rendering Remotion videos to delivery quality in a headless, GPU-less container - browser and WebGL setup, fonts behind a TLS proxy, long detached renders, codec settings for Instagram/TikTok, WAV/silent/cover exports, and the final QA scan for flicker and black frames. Use whenever you render stills, previews or finals from a Remotion project.
metadata:
  tags: remotion, render, ffmpeg, h264, qa, headless, chrome, webgl
---

# Rendering Remotion projects

Use this together with `remotion-best-practices`. This skill covers getting a correct file out of the renderer; that one covers writing the composition.

Helper scripts are in `scripts/` next to this file (`.agents/skills/remotion-render/scripts/`). Run them from the project folder, for example `../.agents/skills/remotion-render/scripts/render-bg.sh`:

| Script | What it does |
|---|---|
| `render-bg.sh OUT ARGS…` | Starts `npx remotion render ARGS…` detached (setsid nohup) and logs to `OUT` with `.log` |
| `trust-egress-ca.sh` | Adds the egress proxy's CA to Chrome's NSS store (fixes font loading without disabling TLS) |
| `check-frames.py VIDEO --cuts … --motion …` | Flags dark frames, black/NaN patches, single-frame flicker and unplanned jumps |
| `contact-sheet.sh VIDEO OUT.jpg f1,f2,…` | Tiles chosen frames into one image to look at |

## 1. Browser and WebGL

- Use the pre-installed Chrome Headless Shell, not a download:
  `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` (resolve the glob; `render-bg.sh` does).
- Never run `npx remotion browser ensure` or `playwright install` here.
- For 3D (`@remotion/three`) set `Config.setChromiumOpenGlRenderer('swangle')`, which is SwiftShader through ANGLE. It's software WebGL2, so it needs no GPU and gives identical pixels on every run. For stills and `renderMedia` from Node, pass `chromiumOptions: {gl: 'swangle'}`.
- Use `--concurrency=1` for WebGL scenes. More tabs fight over the same CPU cores, and SwiftShader is already multi-threaded, so you gain nothing and risk running out of memory.
- In `remotion.config.ts`, read the browser from the environment:
  ```ts
  if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
  ```

## 2. Fonts behind the egress proxy

If a render logs `ERR_CERT_AUTHORITY_INVALID` for fonts.gstatic.com, or the text comes out in a fallback face, Chrome doesn't trust the proxy's CA.

- On Linux, Chrome reads only its own NSS store, so run `scripts/trust-egress-ca.sh` once per container.
- **Never** pass `--ignore-certificate-errors` or disable TLS checks in any other way.
- Load fonts with `@remotion/google-fonts`. Anything drawn to a canvas texture must wait for `loadFont(...).waitUntilDone()` behind a `delayRender()`, or the first frames bake in the fallback font.

## 3. Codec settings: on the command line, never in the config

Put CRF, preset and pixel format on the render command or in a `package.json` script. If they're in `remotion.config.ts`, they also apply to WAV and still renders, and those then fail.

| Output | Command |
|---|---|
| Final for Reels/TikTok | `remotion render Comp out/x.mp4 --concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p` |
| Half-res preview | `remotion render Comp out/preview.mp4 --scale=0.5 --crf=24 --x264-preset=veryfast --concurrency=1` |
| Audio only | `remotion render CompAudio out/x.wav --codec=wav`. Make a separate composition that renders only the `<Audio>` tree, so it renders in seconds. |
| Silent copy | `ffmpeg -i out/x.mp4 -c:v copy -an out/x-silent.mp4`. The frames are identical and you don't re-render. |
| Cover / still | `remotion still Comp out/cover.png --frame=N` |
| QA stills | `remotion still Comp out/s.png --frame=N --scale=0.5`. For many frames, bundle once and call `renderStill` in a loop. |

- Keep `yuv420p`, because Instagram re-encodes anything else badly.
- At 1080×1920 60fps, CRF 16 slow gives about 10 Mbps (around 30 MB for 25 s), which Instagram accepts.

## 4. Long renders: detach and wait on the log

A WebGL frame can take 3 s or more, so a 1500-frame final runs well over an hour. A foreground tool call gets killed long before that.

```bash
cd my-project
../.agents/skills/remotion-render/scripts/render-bg.sh out/final.mp4 \
  Comp out/final.mp4 --concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p
```

Then wait in a **background** task (`run_in_background`) that watches the log:

```bash
until grep -qE "final.mp4 +[0-9.]+ (kB|MB|GB)|Error|error:" out/final.log; do sleep 30; done; tail -5 out/final.log
```

- Don't wait with `pgrep -f remotion`: the waiter's own command line matches, so it never exits.
- Don't chain foreground `sleep`s.
- Benchmark before launching. Render about 30 frames of the heaviest shot (`--frames=600-629`) and time it, then tell the user the expected duration.

## 5. Order of work

1. Render **stills** of the key frames and look at them: layout, legibility, safe zones, colours.
2. Render the **half-res preview** of the whole thing and scan it with `check-frames.py`. Fix problems here, because it's 3–4× cheaper than the final.
3. Render the **final**, detached.
4. Check the final with QA (below), then make the silent copy, the WAVs and the cover.
5. `out/` is usually gitignored. Send the files to the user, and tell them the files only exist in the container.

## 6. QA on every delivered video

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_frames -of compact out/final.mp4
python3 ../.agents/skills/remotion-render/scripts/check-frames.py out/final.mp4 \
  --cuts 152,254 --motion 360-382,656-680      # planned hard cuts and fast moves
../.agents/skills/remotion-render/scripts/contact-sheet.sh out/final.mp4 sheet.jpg 60,200,430,980,1480   # then look at it
```

- **Expect** the exact size, `yuv420p`, the right fps, and `nb_frames` equal to the composition's duration.
- `check-frames.py` should report "No flicker, black or glitched frames found."
  - **Black patches** usually mean NaN pixels from a shader: a normalize of a zero vector, a pow of a negative number, or a division by zero.
  - **Single-frame glitches** usually mean something that isn't a pure function of the frame: `Math.random`, `Date`, CSS transitions, or `useFrame`.
  - Pass `--dark-ok` for videos that are meant to be dark.
- **Loudness:** `ffmpeg -i out/x.wav -af ebur128=framelog=quiet -f null - 2>&1 | grep -A1 Integrated`. Effects meant to sit under Instagram music should land around −20 to −23 LUFS.

## 7. Common failures

| Symptom | Cause / fix |
|---|---|
| `gl_FragColor` undeclared | You set `glslVersion: THREE.GLSL3`. Declare `layout(location = 0) out highp vec4 outColor;` and write to that. |
| Black background in 3D | Back-face culling on geometry with reversed winding. Fix the index order; don't switch to `DoubleSide` everywhere. |
| Text renders in a fallback font | Fonts weren't ready before the canvas was drawn, or the TLS problem from section 2. |
| WAV render fails on codec options | CRF or pixel format is in `remotion.config.ts`. Move them to the command line. |
| Render much slower than the benchmark | Anisotropy 16, `MeshPhysicalMaterial`, full-screen shader work that could early-out, or too many accumulation samples. Profile by timing whole renders; `gl.finish()` timings inside the page are meaningless in Chrome. |
| Frames differ between runs | Something isn't driven by `useCurrentFrame()`. |
