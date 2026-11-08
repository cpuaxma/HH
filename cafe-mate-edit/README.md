# Café Mate: "Pick your vibe" reel

`edit.py` turns the raw counter clip into a 1080×1920, 30 fps H.264 reel (`cafe_mate_edit.mp4`, 10.07 s) that keeps the original audio.

```
pip install opencv-python-headless numpy pillow   # plus ffmpeg (zscale, minterpolate, atempo)
python3 edit.py path/to/clip.mov                   # or put it next to the script as input.mov
```

Everything you can change is in the **VARIABLES** block at the top of `edit.py`: names, text, fonts, positions, timings, ramp speeds, blur, grade and end card. Drop a `logo.png` next to the script to replace the placeholder green "CAFÉ MATE" circle.

## What it does (in this order)

1. **Tone-map.** The source is iPhone HLG/Dolby Vision HDR, so it is tone-mapped to SDR BT.709 (hable) and cached in `.work/`.
2. **Detection on real frames.** Each cup is found by segmenting its drink colour (L≈346, M≈560, R≈731; the opening cup ≈547). The script also detects when each cup is in place and still: pink at 5.47 s, yellow at 5.80 s (the third cup to land), mocha nudged into its final spot at 6.33 s (source time). The opening cup is picked up at 4.50 s. The log prints all of these.
3. **Speed ramp.** 1.5× until the ramp, then a cosine ease to 0.7× over 0.4 s so slow-mo is reached just as the yellow cup lands. It holds 0.7× for 1 s and eases back to 1× over 0.3 s. The motion section is `minterpolate`d to 120 fps and sampled from that. The audio is retimed with `asendcmd` driving `atempo`; its length matches the video to within 1 ms.
4. **Face blur.** Gaussian blur at σ 25, full strength down to y 640 and feathered out by y 720. The lowest face position in any frame is about y 560, and the highest cup lid is at y 770.
5. **Focus and grade.** A feathered ellipse around the cups gets +15 % brightness, +10 % contrast and +15 % saturation. Everything else gets a 22 % vignette. A multiplicative warm grade with a small black clip keeps the marble deep.
6. **Names.** Montserrat SemiBold 34 px. Each name fades in over 0.3 s once its cup is still. One-line names would overlap because the cups are only 170–215 px apart, so they are stacked on two lines (`NAME_STACK`).
7. **Hook.** "Pick your vibe 👇" at y 350. It pops from 90 % to 100 % scale over 0.25 s and is gone by 2 s.
8. **End card (1.5 s).** The last frame freezes and zooms from 100 % to 106 %. The frame darkens 30 % with an extra soft scrim, then the logo, "Now serving" and "@cafemate.lb" fade in, and the card fades to black over 0.3 s.

The script stops with an error if any text leaves the safe zone (bottom 300 px, right 150 px), the names overlap, the blur reaches the lids, or the reel runs longer than 12 s.

## Review stills (`review/`)

- `01_hook.png`, `02_three_cups_names.png`, `03_end_card.png`
- `blur_check_src3s.png`, `blur_check_src5s.png`, `blur_check_src7s.png`: the face-blur check at 3 s, 5 s and 7 s of the source.

Fonts: Montserrat (SIL OFL 1.1, see `fonts/OFL.txt`).
