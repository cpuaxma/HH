/** How many sub-frame samples a frame gets, from how far things travel on screen during the shutter. */
export const MOTION_BLUR_RULE = {
  /** Shutter in frames (0.5 = 180° shutter). */
  shutter: 0.5,
  /** One sample per this many pixels of on-screen travel during the shutter. */
  pxPerSample: 2.5,
  /** Below this travel (px) a frame is treated as still: one sharp sample. */
  stillBelow: 4,
  maxSamples: 16,
  samples(travel: number) {
    if (travel < this.stillBelow) return 1;
    return Math.max(2, Math.min(this.maxSamples, Math.ceil(travel / this.pxPerSample)));
  },
};
