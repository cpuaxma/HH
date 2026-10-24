#!/usr/bin/env bash
# Self-review: pull one frame every 0.25s from the render and tile them into contact sheets
# (safe-zone guides drawn in blue). Usage: scripts/review-frames.sh [video]
set -euo pipefail
video="${1:-out/hpm-audit.mp4}"
rm -rf out/review && mkdir -p out/review
ffmpeg -loglevel error -i "$video" -vf "fps=4,scale=540:960" -start_number 0 out/review/t%03d.png
python3 scripts/contact.py out/review out/review/sheet_ 6 2
