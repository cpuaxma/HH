// Builds src/data/land-dots.json: a lat/lon grid of points that fall on land.
// Run once with `npm run build:globe` (output is committed, so this is only needed to change density).
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';
import {geoContains} from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const STEP = Number(process.argv[2] ?? 2.4); // degrees between rows
const dots = [];
for (let lat = -58; lat <= 80; lat += STEP) {
  // keep spacing roughly even on the sphere: fewer points per row near the poles
  const lonStep = STEP / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (geoContains(land, [lon, lat])) dots.push([Number(lat.toFixed(2)), Number(lon.toFixed(2))]);
  }
}
writeFileSync(new URL('../src/data/land-dots.json', import.meta.url), JSON.stringify(dots));
console.log(`${dots.length} land dots (step ${STEP} deg)`);
