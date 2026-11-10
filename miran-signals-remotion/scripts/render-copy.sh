#!/bin/bash
# Renders the copy trading reel («كيف يعمل النسخ التلقائي مع Miran Gold»). Run detached:
#   setsid nohup bash scripts/render-copy.sh > out/render-copy.log 2>&1 &
# Each format's picture is rendered ONCE (muted); the effects mix is rendered as a WAV and
# muxed on, so the "with effects" and "silent" files share the same picture.
#   PREVIEW=1 bash scripts/render-copy.sh   # half-res draft of the 9:16 only (out/copy-preview*.mp4)
#   FORMATS="MiranCopyTrading:miran-copy-trading" bash scripts/render-copy.sh   # just one format
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
# Encoding settings live here on the command line, not in remotion.config.ts (that breaks the WAV render).
X264="--concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p --muted"
FORMATS="${FORMATS:-MiranCopyTrading:miran-copy-trading MiranCopyTrading4x5:miran-copy-trading-4x5}"
SFX_WAV=out/miran-copy-trading-sfx.wav
COVER_FRAME=$(grep -oP 'coverFrame:\s*\K\d+' src/copy/data.ts)

echo "== audio $(date +%T)"
npx remotion render MiranCopyTradingSfx "$SFX_WAV" --codec=wav

if [ "${PREVIEW:-0}" = 1 ]; then
  echo "== preview $(date +%T)"
  npx remotion render MiranCopyTrading out/copy-preview-silent.mp4 --scale=0.5 --concurrency=1 --crf=20 --x264-preset=veryfast --pixel-format=yuv420p --muted
  ffmpeg -v error -y -i out/copy-preview-silent.mp4 -i "$SFX_WAV" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/copy-preview.mp4
  python3 scripts/scan-frames.py --intended none out/copy-preview-silent.mp4 || true
  echo "== done $(date +%T)"
  exit 0
fi

echo "== cover $(date +%T)"
npx remotion still MiranCopyTrading out/miran-copy-trading-cover.png --frame="$COVER_FRAME"

for f in $FORMATS; do
  id="${f%%:*}"; name="${f##*:}"
  echo "== $id $(date +%T)"
  npx remotion render "$id" "out/$name-silent.mp4" $X264
  ffmpeg -v error -y -i "out/$name-silent.mp4" -i "$SFX_WAV" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name.mp4"
done

echo "== scan $(date +%T)"
python3 scripts/scan-frames.py --intended none $(for f in $FORMATS; do echo "out/${f##*:}-silent.mp4"; done) || true
echo "== done $(date +%T)"
