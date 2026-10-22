// Every on-screen string. In headlines, *words* between asterisks are set in Hot Red.
// Each array entry is one line on screen.

export const COPY = {
  brand: 'HOT PEPPER MEDIA',
  slogan: 'Marketing with a kick.',

  hook: {
    label: 'HOT PEPPER MEDIA',
    headline: ['your brand,', 'but *spicier.*'],
  },

  oneTeam: {
    headline: ['one team.', '*all your*', '*marketing.*'],
    body: 'Plan, create, publish, advertise and report, under one roof.',
  },

  services: [
    {
      counter: '01 / 02',
      items: [
        {name: 'Strategy & Branding', desc: 'Voice, identity and direction.', icon: 'Compass'},
        {name: 'Social Media Management', desc: 'Calendars, captions, community.', icon: 'CalendarCheck'},
      ],
    },
    {
      counter: '03 / 04',
      items: [
        {name: 'Content Production', desc: 'Photo, video, Reels and carousels.', icon: 'Clapperboard'},
        {name: 'Paid Advertising', desc: 'Meta, TikTok, Google and YouTube ads.', icon: 'Megaphone'},
      ],
    },
    {
      counter: '05 / 06',
      items: [
        {name: 'Influencers & Partnerships', desc: 'Sourcing to campaign management.', icon: 'Handshake'},
        {name: 'Website, SEO & Landing Pages', desc: 'Built to convert.', icon: 'MonitorSmartphone'},
      ],
    },
    {
      counter: '07 / 08',
      items: [
        {name: 'Email & WhatsApp Marketing', desc: 'Automations that keep them coming back.', icon: 'MessageCircle'},
        {name: 'Analytics & Reporting', desc: 'Clear monthly insights.', icon: 'BarChart3'},
      ],
    },
  ],

  process: ['plan.', 'create.', 'publish.', 'advertise.', 'report.'],

  cta: {
    headline: ['ready to turn', 'up the heat?'],
    body: 'Send us a message or book a free call.',
    button: "Let's Grow",
    email: 'hotpeppermedia@outlook.com',
    tagline: 'MARKETING WITH A KICK.',
  },
} as const;

export type IconName = (typeof COPY.services)[number]['items'][number]['icon'];

// Splits "but *spicier.*" into runs: [{text: 'but ', red: false}, {text: 'spicier.', red: true}].
export const parseRuns = (line: string) =>
  line
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('*') ? {text: part.slice(1, -1), red: true} : {text: part, red: false},
    );

export const plain = (line: string) => line.replace(/\*/g, '');
