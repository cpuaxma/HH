import fs from 'node:fs';

// Use REMOTION_BROWSER if set, else a preinstalled Chrome Headless Shell if one is found,
// else let Remotion download its own.
const CANDIDATES = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
].filter(Boolean);
export const browserExecutable = CANDIDATES.find((p) => fs.existsSync(p)) ?? null;
