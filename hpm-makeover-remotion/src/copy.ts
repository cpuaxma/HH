// Every on-screen string. In headlines, *words* between asterisks are set in Hot Red.
// Each array entry is one line on screen.

export const COPY = {
  hook: {
    line1: 'is your brand',
    line2Lead: 'a little… ',
    line2Word: 'bland?',
  },

  client: {
    handle: 'beanandbloom',
    before: {
      name: 'Bean and Bloom Cafe',
      bio: 'Coffee shop. Open daily.',
      link: 'www.beanandbloom.biz',
      follow: 'Follow',
      stats: [
        {value: '48', label: 'posts'},
        {value: '212', label: 'followers'},
        {value: '4', label: 'avg likes'},
      ],
      tileLikes: [4, 3, 5, 3, 4, 3, 5, 4, 3],
    },
    after: {
      name: 'Bean & Bloom',
      category: 'Specialty coffee · Café',
      bio: ['Your daily ritual, brewed slow ☕', 'Open 7am–7pm', 'Order online'],
      follow: 'Follow',
      order: 'Order online',
      statLabels: ['Posts', 'Followers', 'Avg. likes'],
      highlights: ['MENU', 'REVIEWS', 'EVENTS'],
      disclaimer: 'Illustrative example',
    },
  },

  before: {
    bubbles: ['New product available.', 'Open today.', 'Happy Monday!!'],
    tags: ['NO STRATEGY', 'NO CONSISTENCY', 'NO ENGAGEMENT'],
    tileText: {2: 'New!', 3: 'OPEN'} as Record<number, string>,
  },

  kick: {
    headline: ["let's add some", '*heat.*'],
  },

  makeover: {
    labels: [
      {num: '01', text: 'VISUAL IDENTITY'},
      {num: '02', text: 'COPY THAT CONVERTS'},
      {num: '03', text: 'GROWTH & ENGAGEMENT'},
    ],
    tileText: {0: '7AM CLUB', 2: 'NEW: OAT LATTE'} as Record<number, string>,
    oldCaption: 'New product available.',
    newCaption: 'Your new 7am ritual just dropped. ☕ Oat latte, now on the menu.',
    postsTitle: 'Posts',
  },

  compare: {
    headline: ['same brand.', '*way more heat.*'],
    before: 'BEFORE',
    after: 'AFTER',
  },

  cta: {
    headline: ['ready to turn', 'up the heat?'],
    body: 'Send us a message or book a free call.',
    button: "Let's Grow",
    email: 'hotpeppermedia@outlook.com',
    slogan: 'MARKETING WITH A KICK.',
  },
} as const;

export type Run = {text: string; red: boolean};

// "plain *red* plain" → runs
export const parseRuns = (line: string): Run[] =>
  line
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') ? {text: part.slice(1, -1), red: true} : {text: part, red: false}));
