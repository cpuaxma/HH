#!/usr/bin/env bash
# Starts a long Remotion render detached from the shell, so it survives the tool call
# that launched it, and logs to out/<name>.log.
#   render-bg.sh <output-file> <remotion render args...>
#   render-bg.sh out/reel.mp4 MyComp out/reel.mp4 --concurrency=1 --crf=16 --x264-preset=slow --pixel-format=yuv420p
# Run it from the project folder. Then wait for the log (don't poll with sleep in the foreground):
#   until grep -qE "$(basename out/reel.mp4) +[0-9.]+ (MB|kB|GB)|Error|error:" out/reel.log; do sleep 30; done; tail -5 out/reel.log
set -euo pipefail
out="$1"; shift
mkdir -p "$(dirname "$out")"
log="${out%.*}.log"
: "${REMOTION_BROWSER:=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -1 || true)}"
export REMOTION_BROWSER
setsid nohup npx remotion render "$@" > "$log" 2>&1 < /dev/null &
echo "pid $!  log $log  browser ${REMOTION_BROWSER:-<remotion default>}"
