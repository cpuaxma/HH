#!/usr/bin/env bash
# One image of chosen frames from a rendered video, for a quick visual check.
#   contact-sheet.sh VIDEO OUT.jpg 60,200,430,980,1480 [cols]
set -euo pipefail
video="$1"; out="$2"; frames="$3"; cols="${4:-6}"
n=$(tr ',' '\n' <<<"$frames" | wc -l)
rows=$(( (n + cols - 1) / cols ))
sel=$(tr ',' '\n' <<<"$frames" | sed 's/.*/eq(n\\,&)/' | paste -sd+)
w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$video")
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$video")
tw=270; th=$(( h * tw / w ))
ffmpeg -v error -y -i "$video" -vf "select='$sel',scale=$tw:$th,tile=${cols}x${rows}" -frames:v 1 "$out"
echo "$out"
