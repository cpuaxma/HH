#!/bin/bash
# Renders every deliverable. Run detached (it takes a couple of hours in software WebGL):
#   setsid nohup bash scripts/render-all.sh > out/render-all.log 2>&1 &
# Each format's picture is rendered once (muted); the audio mixes are rendered as WAVs and
# muxed on, so the "with voice", "effects only" and "silent" files share the same picture.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
X264="--concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p --muted"
FORMATS="${FORMATS:-HpmCompetitor:hotpepper-competitor HpmCompetitor4x5:hotpepper-competitor-4x5}"

echo "== audio $(date +%T)"
npx remotion render HpmCompetitorSfx out/hotpepper-competitor-sfx.wav --codec=wav
npx remotion render HpmCompetitorAudio out/hotpepper-competitor-audio.wav --codec=wav

echo "== cover $(date +%T)"
npx remotion still HpmCompetitor out/hotpepper-competitor-cover.png --frame=960

for f in $FORMATS; do
  id="${f%%:*}"; name="${f##*:}"
  echo "== $id $(date +%T)"
  npx remotion render "$id" "out/$name-silent.mp4" $X264
  ffmpeg -v error -y -i "out/$name-silent.mp4" -i out/hotpepper-competitor-audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name.mp4"
  ffmpeg -v error -y -i "out/$name-silent.mp4" -i out/hotpepper-competitor-sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "out/$name-sfx.mp4"
done

echo "== scan $(date +%T)"
python3 scripts/scan-frames.py $(for f in $FORMATS; do echo "out/${f##*:}-silent.mp4"; done) || true
echo "== done $(date +%T)"
