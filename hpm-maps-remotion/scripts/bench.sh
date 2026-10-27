#!/bin/bash
# Times a short frame range: scripts/bench.sh <first> <last> [concurrency] [scale]
s=$(date +%s%N)
npx remotion render HpmMaps out/bench.mp4 --frames=$1-$2 --concurrency=${3:-1} --scale=${4:-1} --x264-preset=ultrafast >out/bench.log 2>&1 || echo FAILED
e=$(date +%s%N)
echo "frames $1-$2 c=${3:-1} scale=${4:-1}: $(( (e - s) / 1000000 )) ms"
