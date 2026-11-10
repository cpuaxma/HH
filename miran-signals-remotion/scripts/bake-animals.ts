// Bakes the sculpted animals (src/animals/figures.ts) into compact meshes in public/animals/,
// so a render loads them in a moment instead of meshing for a minute and a half on every
// page. Skips the work when the sculpting sources haven't changed (a hash in the manifest).
//   npm run animals:bake          (the animals render and stills scripts run it first)
//   FORCE=1 npm run animals:bake
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {ANIMAL_FIGURES} from '../src/animals/figures';
import {bakeFigure, encodePart} from '../src/animals/bake';

const root = process.cwd();
const outDir = path.join(root, 'public/animals');
const sources = ['src/animals/sdf.ts', 'src/animals/figures.ts', 'src/animals/bake.ts'].map((f) => fs.readFileSync(path.join(root, f), 'utf8'));
const hash = createHash('sha256').update(sources.join('\n---\n')).digest('hex').slice(0, 16);
const manifestPath = path.join(outDir, 'manifest.json');
const old = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
// ONLY=bull,bear re-bakes just those (while sculpting); the rest stay as they are.
const only = process.env.ONLY?.split(',');
if (old?.hash === hash && !process.env.FORCE && !only) {
  console.log(`animals: meshes up to date (${hash})`);
  process.exit(0);
}
fs.mkdirSync(outDir, {recursive: true});
const files: Record<string, Record<string, string>> = only && old ? old.files : {};
for (const def of ANIMAL_FIGURES) {
  if (only && !only.includes(def.id)) continue;
  const t = Date.now();
  const parts = bakeFigure(def);
  files[def.id] = {};
  let bytes = 0;
  for (const [name, g] of parts) {
    const file = `${def.id}-${name}.bin`;
    const buf = encodePart(g);
    fs.writeFileSync(path.join(outDir, file), buf);
    files[def.id][name] = file;
    bytes += buf.byteLength;
  }
  console.log(`animals: ${def.id} ${(bytes / 1e6).toFixed(1)} MB in ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
fs.writeFileSync(manifestPath, JSON.stringify({hash, files}, null, 2));
console.log(`animals: baked (${hash})`);
