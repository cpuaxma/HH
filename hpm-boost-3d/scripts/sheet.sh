#!/bin/sh
# Contact sheet of PNG stills: scripts/sheet.sh <dir> <out.png> [cols] [width]
ffmpeg -loglevel error -y -pattern_type glob -i "$1/f*.png" -vf "scale=${4:-360}:-1,tile=${3:-5}x1:padding=6:color=white" -frames:v 1 "$2"
