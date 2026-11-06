#!/bin/bash
# Renders every deliverable. Run detached (it takes a couple of hours in software WebGL):
#   setsid nohup bash scripts/render-all.sh > out/render-all.log 2>&1 &
# Each format's picture is rendered once (muted); the effects mix is rendered as a WAV and
# muxed on, so the "with effects" and "silent" files share the same picture.
# There is no voiceover: record your own over the silent or effects file (see README.md).
#   FORMATS="MiranSignals:miran-signals"  bash scripts/render-all.sh   # just one format
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
X264="--concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p --muted"
FORMATS="${FORMATS:-MiranSignals:miran-signals MiranSignals4x5:miran-signals-4x5}"
# The voiceover cut (only the hook and closing line on top) has its own effects mix:
#   CLEAN=1 bash scripts/render-all.sh
if [ "${CLEAN:-0}" = 1 ]; then
  FORMATS="MiranSignalsClean:miran-signals-clean MiranSignalsClean4x5:miran-signals-clean-4x5"
  SFX_ID=MiranSignalsCleanSfx; SFX_WAV=out/miran-signals-clean-sfx.wav
fi
SFX_ID="${SFX_ID:-MiranSignalsSfx}"; SFX_WAV="${SFX_WAV:-out/miran-signals-sfx.wav}"
COVER_FRAME=$(grep -oP 'coverFrame:\s*\K\d+' src/data.ts)

echo "== audio $(date +%T)"
npx remotion render "$SFX_ID" "$SFX_WAV" --codec=wav

echo "== cover $(date +%T)"
if [ "${CLEAN:-0}" = 1 ]; then
  npx remotion still MiranSignalsClean out/miran-signals-clean-cover.png --frame="$COVER_FRAME"
else
  npx remotion still MiranSignals out/miran-signals-cover.png --frame="$COVER_FRAME"
fi

for f in $FORMATS; do
  id="${f%%:*}"; name="${f##*:}"
  echo "== $id $(date +%T)"
  npx remotion render "$id" "out/$name-silent.mp4" $X264
  ffmpeg -v error -y -i "out/$name-silent.mp4" -i "$SFX_WAV" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name.mp4"
done

echo "== scan $(date +%T)"
python3 scripts/scan-frames.py $(for f in $FORMATS; do echo "out/${f##*:}-silent.mp4"; done) || true
echo "== done $(date +%T)"
