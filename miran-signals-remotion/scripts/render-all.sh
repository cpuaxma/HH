#!/bin/bash
# Renders every deliverable. Run detached (it takes a couple of hours in software WebGL):
#   setsid nohup bash scripts/render-all.sh > out/render-all.log 2>&1 &
# Each format's picture is rendered once (muted); the audio mixes are rendered as WAVs and
# muxed on, so the "with voice", "effects only" and "silent" files share the same picture.
#   FORMATS="MiranSignals:miran-signals"  bash scripts/render-all.sh   # just one format
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
X264="--concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p --muted"
FORMATS="${FORMATS:-MiranSignals:miran-signals MiranSignals4x5:miran-signals-4x5 MiranSignalsEN:miran-signals-en}"
COVER_FRAME=$(grep -oP 'coverFrame:\s*\K\d+' src/data.ts)

echo "== audio $(date +%T)"
npx remotion render MiranSignalsSfx out/miran-signals-sfx.wav --codec=wav
npx remotion render MiranSignalsAudio out/miran-signals-audio.wav --codec=wav

echo "== cover $(date +%T)"
npx remotion still MiranSignals out/miran-signals-cover.png --frame="$COVER_FRAME"

for f in $FORMATS; do
  id="${f%%:*}"; name="${f##*:}"
  echo "== $id $(date +%T)"
  npx remotion render "$id" "out/$name-silent.mp4" $X264
  # With voice + effects, and effects only (no voice); the silent file is the picture itself.
  # The voiceover is Arabic: the English picture only gets the effects-only and silent files.
  if [[ "$id" != *EN ]]; then
    ffmpeg -v error -y -i "out/$name-silent.mp4" -i out/miran-signals-audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name.mp4"
  fi
  ffmpeg -v error -y -i "out/$name-silent.mp4" -i out/miran-signals-sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name-sfx.mp4"
done

echo "== scan $(date +%T)"
python3 scripts/scan-frames.py $(for f in $FORMATS; do echo "out/${f##*:}-silent.mp4"; done) || true
echo "== done $(date +%T)"
