#!/bin/bash
# Rebuilds and runs the line-art gallery (out/art-gallery.png). ONLY=bull,bear POSES='{...};{...}'
set -e
cd "$(dirname "$0")/.."
npx esbuild scripts/art-gallery.ts --bundle --platform=node --outfile=scripts/tmp/art-gallery.cjs --external:playwright --log-level=warning
NODE_PATH=$(npm root -g) node scripts/tmp/art-gallery.cjs
