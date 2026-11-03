#!/bin/bash
# Times a short frame range: scripts/bench.sh <first> <last> [scale]
mkdir -p out
s=$(date +%s%N)
npx remotion render ScrollTest out/bench.mp4 --frames=$1-$2 --concurrency=1 --scale=${3:-1} --x264-preset=ultrafast --muted >out/bench.log 2>&1 || echo FAILED
e=$(date +%s%N)
echo "frames $1-$2 scale=${3:-1}: $(( (e - s) / 1000000 )) ms"
