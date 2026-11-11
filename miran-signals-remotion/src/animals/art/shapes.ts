// The five animals as line art, in profile. Shape units: about a pixel at scale 1, origin on
// the ground under the middle of the figure, y up is negative. Each outline is a handful of
// control points (a smooth curve runs through them; [x, y, 1] is a sharp corner). Parts that
// move (a head, an arm, a wing) turn about their pivot.
import type {C} from './geo';
import type {ArtLine, ArtPart, ArtPoly, ArtShape} from './render';

/** Mirror control points left-right (reversed, so the outline keeps its direction). */
const mirror = (c: C[]): C[] => [...c].reverse().map((p) => (p.length === 3 ? [-p[0], p[1], 1] : [-p[0], p[1]]) as C);
/** A symmetric outline from its right half (top centre → bottom centre, x ≥ 0). */
const symmetric = (half: C[]): C[] => [...half, ...mirror(half).slice(1, -1)];
const mirrorPoly = (p: ArtPoly): ArtPoly => ({...p, ctrl: mirror(p.ctrl), landmarks: p.landmarks?.map(([x, y]) => [-x, y])});
const mirrorLine = (l: ArtLine): ArtLine => ({...l, ctrl: mirror(l.ctrl)});
/** The other side's copy of a part (the left wing from the right one). */
const mirrorPart = (p: ArtPart, name: string): ArtPart => ({...p, name, pivot: [-p.pivot[0], p.pivot[1]], polys: p.polys.map(mirrorPoly), lines: p.lines?.map(mirrorLine)});
/** Move and turn control points (for a far wing drawn from the near one). */
const moved = (c: C[], dx: number, dy: number, rot: number, about: [number, number]): C[] =>
  c.map((p) => {
    const x = p[0] - about[0];
    const y = p[1] - about[1];
    const q: [number, number] = [about[0] + x * Math.cos(rot) - y * Math.sin(rot) + dx, about[1] + x * Math.sin(rot) + y * Math.cos(rot) + dy];
    return (p.length === 3 ? [q[0], q[1], 1] : q) as C;
  });

export const BULL_ART: ArtShape = {
  id: 'bull',
  metal: 'gold',
  parts: [
    {
      name: 'far',
      pivot: [0, 0],
      layer: 0,
      shade: 0.55,
      polys: [
        {
          // Far foreleg (a half step back) and far hind leg (a half step forward).
          ctrl: [[178, -250], [184, -150], [180, -95], [174, -55], [181, -22], [196, 0, 1], [140, 0, 1], [135, -20], [129, -60], [124, -100], [112, -160], [106, -250]],
          fill: 60,
          reach: 40,
        },
        {
          ctrl: [[-170, -250], [-166, -150], [-190, -84], [-192, -42], [-185, -18], [-170, 0, 1], [-230, 0, 1], [-235, -22], [-242, -62], [-254, -112], [-258, -170], [-244, -250]],
          fill: 60,
          reach: 40,
        },
      ],
    },
    {
      name: 'tail',
      pivot: [-400, -432],
      layer: 0.5,
      shade: 0.8,
      polys: [
        {
          ctrl: [[-402, -440], [-428, -384], [-441, -312], [-447, -252], [-472, -206], [-462, -160, 1], [-440, -192], [-434, -250], [-428, -312], [-416, -382], [-393, -428]],
          fill: 60,
          reach: 20,
          step: 18,
        },
      ],
    },
    {
      name: 'body',
      pivot: [0, -300],
      layer: 1,
      polys: [
        {
          ctrl: [
            [-402, -446], [-300, -456], [-170, -466], [-40, -486], [50, -520], [120, -566], [182, -588], [240, -572], [286, -524],
            [308, -446], [304, -360], [290, -296], [282, -238], [262, -196],
            // Near foreleg.
            [262, -150], [258, -100], [252, -58], [258, -24], [274, 0, 1], [212, 0, 1], [206, -22], [198, -60], [192, -104], [182, -152], [168, -194],
            // Belly: deep behind the elbow, tucked up into the flank.
            [80, -200], [-30, -206], [-120, -222], [-176, -244],
            // Near hind leg.
            [-206, -238], [-226, -160], [-250, -88], [-252, -44], [-244, -20], [-228, 0, 1], [-294, 0, 1], [-300, -24], [-310, -64], [-328, -120], [-340, -180],
            [-370, -256], [-404, -326], [-414, -396],
          ],
          fill: 70,
          reach: 150,
          landmarks: [[160, -440], [90, -320], [-280, -390], [-300, -290], [20, -410], [-120, -340], [230, -300]],
        },
      ],
      lines: [
        // Shoulder, elbow and thigh: a few engraved muscle lines.
        {ctrl: [[226, -560], [170, -430], [166, -300], [186, -210]], w: 1.3, a: 0.4},
        {ctrl: [[-246, -450], [-296, -350], [-276, -262], [-232, -226]], w: 1.3, a: 0.4},
        {ctrl: [[266, 0], [216, 0]], w: 1, a: 0},
        {ctrl: [[256, -20], [207, -20]], w: 1.2, a: 0.55, dark: true},
        {ctrl: [[-244, -20], [-298, -22]], w: 1.2, a: 0.55, dark: true},
      ],
    },
    {
      name: 'hornFar',
      parent: 'head',
      pivot: [300, -530],
      layer: 1.5,
      shade: 0.55,
      polys: [{ctrl: [[244, -528], [236, -574], [250, -626], [290, -668], [346, -694, 1], [308, -660], [282, -620], [272, -576], [288, -532]], fill: 80, reach: 18, step: 16}],
    },
    {
      name: 'head',
      parent: 'body',
      pivot: [272, -470],
      layer: 2,
      polys: [
        {
          ctrl: [
            [270, -546], [336, -554], [376, -530], [402, -478], [422, -428], [438, -394], [450, -374], [448, -348], [432, -330],
            [404, -324], [372, -336], [332, -370], [300, -402], [276, -452],
          ],
          fill: 50,
          reach: 70,
          landmarks: [[352, -488], [398, -420], [320, -440], [390, -360]],
        },
        {
          // The ear, pointing back from under the horn.
          ctrl: [[292, -528], [238, -552], [196, -540, 1], [236, -512], [288, -506]],
          fill: 60,
          reach: 14,
          step: 16,
        },
      ],
      lines: [
        {ctrl: [[340, -500], [356, -508], [373, -499], [356, -491]], closed: true, w: 1.6, a: 0.95, dark: true},
        {ctrl: [[334, -514], [358, -524], [382, -512]], w: 1.3, a: 0.5},
        {ctrl: [[436, -372], [444, -362], [441, -352]], w: 1.4, a: 0.8, dark: true},
        // Curls on the broad forehead.
        {ctrl: [[350, -540], [362, -530], [354, -522]], w: 1.1, a: 0.45},
        {ctrl: [[372, -528], [384, -516], [376, -508]], w: 1.1, a: 0.45},
      ],
    },
    {
      name: 'horn',
      parent: 'head',
      pivot: [320, -540],
      layer: 3,
      polys: [{ctrl: [[290, -540], [282, -582], [298, -632], [344, -670], [404, -688, 1], [362, -664], [330, -630], [318, -586], [346, -544]], fill: 80, reach: 18, step: 16}],
    },
  ],
};


/** A paw's claws: curved blades hanging from the underside of the paw. */
const claws = (x0: number, y0: number, gap: number, n: number, len: number) =>
  Array.from({length: n}, (_, i) => {
    const x = x0 + i * gap;
    return {
      ctrl: [[x - 8, y0], [x + 6, y0 + len * 0.45], [x + 4, y0 + len, 1], [x - 6, y0 + len * 0.5], [x - 16, y0 + 2]] as [number, number][],
      fill: 80,
      reach: 8,
      step: 7,
    };
  });

export const BEAR_ART: ArtShape = {
  id: 'bear',
  metal: 'silver',
  parts: [
    {
      name: 'armFar',
      parent: 'body',
      pivot: [-60, -580],
      layer: 0,
      shade: 0.5,
      polys: [
        {ctrl: [[-120, -630], [-30, -642], [50, -632], [118, -622], [168, -620], [202, -598], [198, -570], [160, -560], [112, -556], [40, -536], [-40, -512], [-110, -530]], fill: 60, reach: 50},
        ...claws(160, -562, 13, 4, 32),
      ],
    },
    {
      name: 'legFar',
      parent: 'body',
      pivot: [-60, -200],
      layer: 0.2,
      shade: 0.5,
      polys: [{ctrl: [[-120, -300], [-40, -250], [-30, -150], [-24, -70], [20, -40], [40, -14], [36, 0, 1], [-150, 0, 1], [-160, -60], [-170, -160], [-190, -260]], fill: 60, reach: 60}],
    },
    {
      name: 'body',
      pivot: [-80, -300],
      layer: 1,
      polys: [
        {
          ctrl: [
            [-60, -682], [-150, -654], [-226, -566], [-262, -444], [-272, -322], [-262, -220], [-244, -140], [-226, -64], [-238, 0, 1],
            [-52, 0, 1], [-46, -26], [-96, -60], [-104, -130], [-84, -204], [-24, -252], [34, -336], [66, -436], [80, -526], [74, -596], [52, -640],
          ],
          fill: 70,
          reach: 190,
          landmarks: [[-150, -540], [-60, -430], [-170, -330], [-160, -170], [-20, -330], [-100, -250]],
        },
      ],
      lines: [
        // Fur: a few combed strokes on the hump, the haunch and the belly.
        {ctrl: [[-170, -620], [-200, -560], [-210, -500]], w: 1.3, a: 0.45},
        {ctrl: [[-130, -630], [-156, -570], [-164, -520]], w: 1.2, a: 0.32},
        {ctrl: [[-226, -360], [-232, -300], [-224, -240]], w: 1.3, a: 0.45},
        {ctrl: [[-196, -330], [-170, -250], [-136, -186]], w: 1.4, a: 0.45},
        {ctrl: [[20, -440], [6, -380], [-6, -330]], w: 1.2, a: 0.35},
        {ctrl: [[-238, 0], [-52, 0]], w: 1, a: 0},
        {ctrl: [[-76, -22], [-70, -2]], w: 1.2, a: 0.6, dark: true},
        {ctrl: [[-58, -24], [-52, -4]], w: 1.2, a: 0.6, dark: true},
      ],
    },
    {
      name: 'head',
      parent: 'body',
      pivot: [0, -650],
      layer: 2,
      polys: [
        {
          ctrl: [
            [-90, -676], [-72, -756], [-12, -806], [52, -800], [90, -774], [122, -764], [148, -754], [162, -738, 1], [162, -714], [148, -698],
            [118, -690], [92, -676], [50, -650], [0, -634], [-50, -646],
          ],
          fill: 46,
          reach: 80,
          landmarks: [[20, -730], [100, -720], [-40, -700]],
        },
        {ctrl: [[4, -792], [-26, -812], [-20, -850], [18, -854], [36, -814]], fill: 60, reach: 14, step: 12},
      ],
      lines: [
        {ctrl: [[60, -764], [72, -770], [84, -763], [72, -758]], closed: true, w: 1.5, a: 0.95, dark: true},
        {ctrl: [[50, -778], [72, -786], [92, -776]], w: 1.2, a: 0.5},
        {ctrl: [[146, -752], [161, -739], [157, -726], [144, -732]], closed: true, w: 1.4, a: 0.9, dark: true},
        {ctrl: [[142, -704], [120, -700], [100, -686]], w: 1.2, a: 0.6, dark: true},
        {ctrl: [[-6, -834], [10, -816]], w: 1.1, a: 0.5, dark: true},
        // The cheek ruff.
        {ctrl: [[-20, -730], [-44, -700], [-36, -662]], w: 1.2, a: 0.4},
      ],
    },
    {
      name: 'arm',
      parent: 'body',
      pivot: [-70, -560],
      layer: 3,
      polys: [
        {
          ctrl: [[-140, -604], [-50, -616], [30, -598], [104, -580], [164, -578], [206, -556], [204, -524], [166, -512], [112, -514], [44, -494], [-30, -474], [-110, -494]],
          fill: 60,
          reach: 70,
          landmarks: [[-40, -548], [130, -548], [50, -540]],
        },
        ...claws(156, -516, 15, 4, 42),
      ],
      lines: [
        {ctrl: [[-70, -590], [-10, -572], [50, -560]], w: 1.2, a: 0.4},
        {ctrl: [[100, -566], [118, -546], [112, -524]], w: 1.2, a: 0.4},
      ],
    },
  ],
};

export const WHALE_ART: ArtShape = {
  id: 'whale',
  metal: 'gold',
  parts: [
    {
      name: 'finFar',
      parent: 'body',
      pivot: [200, 60],
      layer: 0,
      shade: 0.5,
      polys: [{ctrl: [[240, 40], [180, 110], [90, 170], [10, 205], [-40, 214, 1], [10, 180], [100, 120], [170, 60]], fill: 60, reach: 20, step: 16}],
    },
    {
      name: 'tail',
      parent: 'body',
      pivot: [-420, -20],
      layer: 0.5,
      polys: [
        {
          ctrl: [[-400, -36], [-470, -32], [-530, -70], [-592, -118, 1], [-590, -72], [-570, -34], [-546, -12, 1], [-576, 14], [-612, 62, 1], [-548, 38], [-470, 4], [-400, 4]],
          fill: 56,
          reach: 40,
          step: 18,
        },
      ],
    },
    {
      name: 'body',
      pivot: [0, 0],
      layer: 1,
      polys: [
        {
          ctrl: [
            [486, -6], [470, -48], [420, -72], [320, -94], [200, -112], [60, -118], [-90, -116], [-150, -122], [-190, -152, 1], [-206, -118],
            [-280, -80], [-370, -46], [-440, -28], [-460, -12], [-440, 4], [-350, 16], [-220, 48], [-60, 96], [100, 120], [250, 112], [370, 76], [446, 34],
          ],
          fill: 70,
          reach: 120,
          landmarks: [[300, -20], [120, -40], [-80, -40], [-260, -40], [200, 50]],
        },
      ],
      lines: [
        // The mouth, the eye and the throat pleats.
        {ctrl: [[484, -10], [420, 0], [340, 6], [300, 22]], w: 1.6, a: 0.75, dark: true},
        {ctrl: [[280, -4], [292, -10], [304, -3], [292, 2]], closed: true, w: 1.4, a: 0.95, dark: true},
        {ctrl: [[440, 18], [360, 46], [240, 68], [120, 78]], w: 1.2, a: 0.5},
        {ctrl: [[420, 30], [340, 62], [220, 84], [100, 92]], w: 1.2, a: 0.45},
        {ctrl: [[400, 44], [320, 76], [200, 98], [90, 104]], w: 1.2, a: 0.4},
        // Knobs on the head.
        {ctrl: [[440, -58], [446, -64]], w: 3, a: 0.6},
        {ctrl: [[400, -74], [406, -80]], w: 3, a: 0.6},
        {ctrl: [[360, -84], [366, -90]], w: 3, a: 0.6},
        {ctrl: [[420, -40], [426, -46]], w: 3, a: 0.5},
        {ctrl: [[380, -56], [386, -62]], w: 3, a: 0.5},
      ],
    },
    {
      name: 'fin',
      parent: 'body',
      pivot: [220, 50],
      layer: 2,
      polys: [
        {
          // The long pectoral fin with a scalloped leading edge.
          ctrl: [[262, 30], [228, 86], [190, 112], [168, 140], [122, 170], [90, 196], [40, 224], [-20, 252, 1], [30, 210], [100, 160], [160, 110], [200, 64]],
          fill: 60,
          reach: 24,
          step: 14,
        },
      ],
    },
  ],
};

// ─── The hawk: face on, wings spread (and tucked for the dive) ──────────────

const HAWK_WING: ArtPart = {
  name: 'wingR',
  parent: 'body',
  pivot: [78, -96],
  layer: 0.5,
  polys: [
    {
      ctrl: [
        [64, -112], [180, -162], [300, -194], [410, -206],
        // Five fingered primaries with rounded tips.
        [490, -214], [566, -226], [622, -220], [628, -206], [560, -190], [498, -170, 1],
        [580, -178], [638, -168], [646, -154], [632, -146], [566, -144], [508, -132, 1],
        [590, -126], [640, -108], [642, -94], [626, -90], [562, -100], [504, -92, 1],
        [574, -74], [616, -50], [612, -36], [596, -36], [540, -58], [490, -56, 1],
        [544, -24], [574, 4], [566, 16], [550, 14], [500, -14], [462, -18, 1],
        // Secondaries: a soft scalloped trailing edge.
        [452, 14], [424, 30], [396, 20], [366, 40], [336, 28], [306, 44], [276, 30], [246, 42], [216, 28], [186, 36], [156, 20], [120, 6], [88, -40],
      ],
      fill: 56,
      reach: 60,
      step: 16,
      landmarks: [[200, -100], [340, -110], [460, -100], [260, -40], [400, -40]],
    },
  ],
  lines: [
    // Coverts and the feather lines.
    {ctrl: [[96, -100], [220, -134], [340, -152], [450, -150]], w: 1.2, a: 0.5},
    {ctrl: [[120, -56], [240, -84], [360, -94], [450, -84]], w: 1.2, a: 0.45},
    {ctrl: [[246, 38], [262, -30]], w: 1, a: 0.35},
    {ctrl: [[306, 40], [318, -34]], w: 1, a: 0.35},
    {ctrl: [[366, 36], [372, -36]], w: 1, a: 0.35},
    {ctrl: [[424, 26], [424, -30]], w: 1, a: 0.35},
  ],
};

export const HAWK_ART: ArtShape = {
  id: 'hawk',
  metal: 'silver',
  parts: [
    mirrorPart({...HAWK_WING, shade: 0.92}, 'wingL'),
    HAWK_WING,
    {
      name: 'body',
      pivot: [0, 0],
      layer: 1,
      polys: [
        {
          ctrl: symmetric([[0, -158], [36, -152], [72, -120], [92, -70], [96, -20], [86, 40], [66, 96], [42, 148], [66, 236], [56, 256], [36, 250], [20, 266], [0, 258]]),
          fill: 48,
          reach: 80,
          step: 16,
          landmarks: [[0, -60], [40, -10], [-40, -10], [0, 60]],
        },
        {
          // The head, turned in profile, with the hooked beak.
          ctrl: [[-46, -136], [-63, -204], [-34, -253], [18, -267], [57, -255], [83, -236], [110, -226], [127, -204], [118, -177, 1], [103, -194], [81, -197], [59, -182], [37, -155], [8, -131]],
          fill: 40,
          reach: 50,
          step: 12,
          landmarks: [[10, -200], [-10, -170]],
        },
        // Talons.
        {ctrl: [[16, 104], [48, 106], [46, 164], [60, 196, 1], [42, 184], [32, 202, 1], [24, 184], [10, 196, 1], [16, 164]], fill: 60, reach: 10, step: 10},
        {ctrl: mirror([[16, 104], [48, 106], [46, 164], [60, 196, 1], [42, 184], [32, 202, 1], [24, 184], [10, 196, 1], [16, 164]]), fill: 60, reach: 10, step: 10},
      ],
      lines: [
        // Fierce eyes under a heavy brow.
        {ctrl: [[40, -228], [52, -236], [66, -228], [52, -221]], closed: true, w: 1.5, a: 0.95, dark: true},
        {ctrl: [[25, -241], [52, -248], [81, -238]], w: 2.2, a: 0.8},
        {ctrl: [[83, -233], [88, -214], [83, -199]], w: 1.2, a: 0.6, dark: true},
        {ctrl: [[81, -197], [101, -201]], w: 1.2, a: 0.6, dark: true},
        // Breast feathers.
        {ctrl: [[-40, -60], [0, -40], [40, -60]], w: 1.1, a: 0.4},
        {ctrl: [[-50, -10], [0, 10], [50, -10]], w: 1.1, a: 0.4},
        {ctrl: [[-46, 40], [0, 60], [46, 40]], w: 1.1, a: 0.4},
        {ctrl: [[14, 160], [20, 250]], w: 1, a: 0.4},
        {ctrl: [[-14, 160], [-20, 250]], w: 1, a: 0.4},
      ],
    },
  ],
};

// ─── The dove: in profile, wings up ──────────────────────────────────────────

const DOVE_WING: C[] = [
  [56, -62], [90, -140], [88, -230], [60, -320], [18, -394],
  // Primaries: long feathers with rounded tips.
  [2, -424], [-12, -434], [-24, -426], [-22, -410], [-34, -372, 1],
  [-46, -402], [-60, -410], [-70, -402], [-64, -388], [-70, -344, 1],
  [-88, -370], [-102, -378], [-110, -368], [-102, -354], [-96, -310, 1],
  [-118, -328], [-132, -334], [-140, -322], [-128, -310], [-108, -270, 1],
  // Secondaries.
  [-138, -260], [-130, -236], [-100, -222], [-120, -198], [-104, -172], [-74, -162], [-84, -132], [-62, -110], [-32, -96], [-10, -82],
];

export const DOVE_ART: ArtShape = {
  id: 'dove',
  metal: 'gold',
  parts: [
    {
      name: 'wingFar',
      parent: 'body',
      pivot: [40, -60],
      layer: 0,
      shade: 0.55,
      polys: [{ctrl: moved(DOVE_WING, 26, -6, -0.42, [40, -60]), fill: 56, reach: 40, step: 14}],
    },
    {
      name: 'body',
      pivot: [0, 0],
      layer: 1,
      polys: [
        {
          ctrl: [
            [226, -74, 1], [196, -90], [172, -116], [140, -128], [108, -112], [92, -80], [40, -66], [-60, -46], [-140, -26], [-200, -18], [-262, -26],
            [-274, 12], [-260, 50], [-200, 42], [-130, 50], [-40, 84], [60, 82], [132, 50], [170, 0], [190, -50], [212, -70],
          ],
          fill: 48,
          reach: 70,
          step: 14,
          landmarks: [[130, -80], [60, 0], [-40, 10], [-160, 10], [100, 30]],
        },
      ],
      lines: [
        {ctrl: [[154, -100], [162, -106], [170, -99], [162, -94]], closed: true, w: 1.6, a: 0.95, dark: true},
        {ctrl: [[224, -74], [196, -76]], w: 1.2, a: 0.7, dark: true},
        // Tail feathers.
        {ctrl: [[-170, 0], [-262, -10]], w: 1.1, a: 0.45},
        {ctrl: [[-170, 26], [-262, 36]], w: 1.1, a: 0.4},
      ],
    },
    {
      name: 'wing',
      parent: 'body',
      pivot: [40, -60],
      layer: 2,
      polys: [{ctrl: DOVE_WING, fill: 56, reach: 50, step: 14, landmarks: [[20, -180], [0, -280], [-40, -140]]}],
      lines: [
        {ctrl: [[50, -100], [44, -200], [16, -290], [-20, -350]], w: 1.2, a: 0.45},
        {ctrl: [[-10, -110], [-36, -200], [-70, -270]], w: 1.1, a: 0.4},
      ],
    },
  ],
};

export const ART_SHAPES: ArtShape[] = [BULL_ART, BEAR_ART, WHALE_ART, HAWK_ART, DOVE_ART];
