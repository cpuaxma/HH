#!/usr/bin/env bash
# Render stills: scripts/stills.sh <comp> <outdir> frame1 frame2 ...
set -e
COMP=$1; OUT=$2; shift 2
BROWSER=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | head -1)}
mkdir -p "$OUT"
npx remotion bundle --log=error --out-dir=out/bundle >/dev/null 2>&1 || true
SERVE=out/bundle; [ -f out/bundle/index.html ] || SERVE=src/index.ts
for f in "$@"; do
  npx remotion still "$SERVE" "$COMP" "$OUT/f$f.png" --frame="$f" ${BROWSER:+--browser-executable=$BROWSER} --log=error
done
