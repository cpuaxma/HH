// Builds src/data/map-dots.json: a dotted world map in screen space, computed once
// from world-atlas land-110m so nothing geographic runs per frame.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {geoContains, geoNaturalEarth1} from 'd3-geo';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const WIDTH = 800;
const STEP = 10.5; // dot pitch in px; dots are drawn ~6px wide
const SOUTH_LIMIT = -56; // drop Antarctica

// Fit the projection to the world minus Antarctica.
const outline = {
  type: 'Polygon',
  coordinates: [[[-180, SOUTH_LIMIT], [180, SOUTH_LIMIT], [180, 84], [-180, 84], [-180, SOUTH_LIMIT]]],
};
const projection = geoNaturalEarth1().fitWidth(WIDTH, outline);
const [[, y0], [, y1]] = [projection([0, 84]), projection([0, SOUTH_LIMIT])].map((p) => [0, p[1]]);
const height = Math.ceil(y1 - y0);

// Region boxes in [lonMin, lonMax, latMin, latMax]. First match wins.
const REGIONS = [
  ['europe', [-11, 40, 36, 71]],
  ['middleEast', [34, 62, 12, 40]],
  ['india', [67, 92, 6, 34]],
  ['seAsia', [92, 141, -11, 21]],
  ['china', [74, 135, 21, 53]],
];

const dots = [];
for (let y = y0 + STEP / 2; y < y1; y += STEP) {
  for (let x = STEP / 2; x < WIDTH; x += STEP) {
    const ll = projection.invert([x, y]);
    if (!ll || ll[1] < SOUTH_LIMIT || !geoContains(land, ll)) continue;
    const [lon, lat] = ll;
    const region = REGIONS.find(([, b]) => lon >= b[0] && lon <= b[1] && lat >= b[2] && lat <= b[3]);
    dots.push([Math.round(x * 10) / 10, Math.round((y - y0) * 10) / 10, region ? REGIONS.indexOf(region) : -1]);
  }
}

const centroids = REGIONS.map(([name], i) => {
  const own = dots.filter((d) => d[2] === i);
  return {
    name,
    x: Math.round(own.reduce((s, d) => s + d[0], 0) / own.length),
    y: Math.round(own.reduce((s, d) => s + d[1], 0) / own.length),
    count: own.length,
  };
});

mkdirSync('src/data', {recursive: true});
writeFileSync('src/data/map-dots.json', JSON.stringify({width: WIDTH, height, regions: centroids, dots}));
console.log(`${dots.length} dots, ${WIDTH}x${height}`, centroids);
