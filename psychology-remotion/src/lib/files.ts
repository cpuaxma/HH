import {getStaticFiles} from 'remotion';

/** True if /public/<name> exists. Lets optional assets (logo, music, voiceover, sfx) be skipped safely. */
export const hasPublicFile = (name: string) => getStaticFiles().some((f) => f.name === name);
