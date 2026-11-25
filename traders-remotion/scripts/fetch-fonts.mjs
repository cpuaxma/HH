// Optional: downloads Cairo (the same files @remotion/google-fonts uses) into public/fonts so a render
// can run without internet access from the headless browser. Then render with REMOTION_LOCAL_FONTS=1.
//   node scripts/fetch-fonts.mjs
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const FILES = {
  'cairo-arabic.woff2': 'https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2',
  'cairo-latin.woff2': 'https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2',
};
fs.mkdirSync('public/fonts', {recursive: true});
for (const [name, url] of Object.entries(FILES)) {
  execFileSync('curl', ['-sSfL', '-o', `public/fonts/${name}`, url]);
  console.log(`public/fonts/${name}  ${fs.statSync(`public/fonts/${name}`).size} bytes`);
}
