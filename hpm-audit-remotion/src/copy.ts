// Every word on screen. Key words (Hot Red) are listed per line.

export type HeadlineLine = {text: string; key?: string[]};

export const COPY = {
  hook: {
    lines: [{text: 'this café'}, {text: 'is losing', key: ['losing']}, {text: 'customers.'}] as HeadlineLine[],
    stamp: '3 FIXES',
  },
  bio: {
    label: 'FIX 01 · BIO',
    lines: [{text: 'your bio'}, {text: 'says nothing.', key: ['nothing.']}] as HeadlineLine[],
    old: 'Coffee shop. Open daily.',
    // Typed in three runs so each phrase lands on a beat.
    newParts: ['Slow coffee for busy mornings ☕', ' · Open 7am–7pm', ' · Order ahead ↓'],
    micro: "who it's for + why come in",
  },
  grid: {
    label: 'FIX 02 · GRID',
    lines: [{text: 'zero', key: ['zero']}, {text: 'brand.'}] as HeadlineLine[],
    swatches: [
      {name: 'Espresso', hex: '#2B1D16'},
      {name: 'Sage', hex: '#8FA58A'},
    ],
    font: '1 font',
  },
  hook3: {
    label: 'FIX 03 · HOOK',
    lines: [{text: '3 seconds.', key: ['3']}, {text: "that's all"}, {text: 'you get.'}] as HeadlineLine[],
    caption: ['best latte', 'in town?'],
    chip: 'stops the scroll',
  },
  result: {
    lines: [{text: 'same café.'}, {text: 'now it sells.', key: ['sells.']}] as HeadlineLine[],
    followersLabel: 'followers',
    illustrative: 'Illustrative',
    before: 'BEFORE',
    after: 'AFTER',
    recap: ['bio', 'grid', 'hook'],
  },
  cta: {
    lines: [{text: 'want us to'}, {text: 'audit yours?', key: ['audit']}] as HeadlineLine[],
    comment: 'AUDIT 🌶️',
    commenter: 'you',
    pill: ['Comment AUDIT', 'for a free page review'],
    slogan: 'MARKETING WITH A KICK.',
  },
  profile: {
    handle: 'beanandbloom',
    name: 'Bean & Bloom',
    category: 'Café',
    posts: '48',
    following: '301',
    followersBefore: 212,
    followersAfter: 12400,
    oldBio: 'Coffee shop. Open daily.',
    newBio: 'Slow coffee for busy mornings ☕ · Open 7am–7pm · Order ahead ↓',
    highlights: ['Menu', 'Hours', 'Latte art', 'Team', 'Reviews'],
  },
  logo: {top: 'hot', main: 'pepper', sub: 'MEDIA'},
};
