export interface Planet {
  id: string;
  name: string;
  code: string;
  type: string;
  color: string;
  diameter: string;
  distance: string;
  orbit: string;
  rotation: string;
  moons: string;
  temp: string;
  briefing: string[];
  data: [string, string][];
}

export const PLANETS: Planet[] = [
  {
    id: "sol",
    name: "SOL",
    code: "PL-00",
    type: "G2V MAIN SEQUENCE STAR",
    color: "#FFB000",
    diameter: "1,392,700 KM",
    distance: "0.0 AU",
    orbit: "—",
    rotation: "~27.3 DAYS",
    moons: "8 PLANETS",
    temp: "5,778 K",
    briefing: [
      "ORBITAL TELEMETRY // SOLAR ARRAY",
      "Fusion core output stable at 99.998% of nominal. Heliosynchronous relays report coronal mass ejection risk: LOW. All planetary command links are drawing power at expected grid load.",
    ],
    data: [
      ["SPECTRAL CLASS", "G2V"],
      ["CORE COMPOSITION", "H 73% / HE 25%"],
      ["GRID LOAD", "8 PLANETARY LINKS"],
    ],
  },
  {
    id: "mercury",
    name: "MERCURY",
    code: "PL-01",
    type: "TERRESTRIAL // EXTREME IRRADIATION",
    color: "#C9C9D8",
    diameter: "4,879 KM",
    distance: "0.39 AU",
    orbit: "88 DAYS",
    rotation: "58.6 DAYS",
    moons: "0",
    temp: "167°C AVG",
    briefing: [
      "ORBITAL TELEMETRY // INNERMOST BODY",
      "Solar relay arrays on the sunward face are intermittently blinded by radiation surges. Thermal shielding reports 41% degradation — recommend keeping all listening posts on the night side.",
    ],
    data: [
      ["SURFACE", "CRATERED REGOLITH"],
      ["RELAY STATIONS", "2 OPERATIONAL"],
      ["SOLAR EXPOSURE", "7.4x TERRAN"],
    ],
  },
  {
    id: "venus",
    name: "VENUS",
    code: "PL-02",
    type: "TERRESTRIAL // CLOUD-VEILED",
    color: "#F0C878",
    diameter: "12,104 KM",
    distance: "0.72 AU",
    orbit: "225 DAYS",
    rotation: "-243 DAYS",
    moons: "0",
    temp: "464°C",
    briefing: [
      "ORBITAL TELEMETRY // ACID CLOUD SHELL",
      "Surface scans remain blocked by the sulfuric cloud deck. Balloon relays drifting at 52 km altitude report stable stratospheric winds — a natural EM shield against ground-based interception.",
    ],
    data: [
      ["ATMOSPHERE", "CO2 96.5%"],
      ["CLOUD DECK", "H2SO4 · 52 KM ALT"],
      ["PRESSURIZED OPS", "NOT ADVISED"],
    ],
  },
  {
    id: "terra",
    name: "TERRA",
    code: "PL-03",
    type: "TERRESTRIAL // PRIMARY THEATER",
    color: "#00F0FF",
    diameter: "12,742 KM",
    distance: "1.00 AU",
    orbit: "365.25 DAYS",
    rotation: "23.9 HOURS",
    moons: "1 (LUNA)",
    temp: "15°C AVG",
    briefing: [
      "ORBITAL TELEMETRY // COMMAND HOMEWORLD",
      "All campaign nodes detected across three continental sectors. Switch to TERRAN VIEW for mission deployment. Weather-control array and orbital ion cannons standing by on this grid.",
    ],
    data: [
      ["ACTIVE NODES", "3 SECTORS LINKED"],
      ["ORBITAL ASSETS", "ION GRID + WCA"],
      ["UPLINK LATENCY", "42 MS"],
    ],
  },
  {
    id: "luna",
    name: "LUNA",
    code: "PL-03A",
    type: "SATELLITE // RELAY HUB",
    color: "#CFD6E8",
    diameter: "3,474 KM",
    distance: "0.0026 AU (TERRA)",
    orbit: "27.3 DAYS",
    rotation: "27.3 DAYS",
    moons: "—",
    temp: "-23°C AVG",
    briefing: [
      "ORBITAL TELEMETRY // LUNAR RELAY STATION",
      "Secondary command post active on the far side. Surface array rebroadcasts the command network across the inner system — cut this link and half the sector goes dark.",
    ],
    data: [
      ["FAR SIDE", "CRATER COMMAND"],
      ["RELAY ARRAY", "ONLINE"],
      ["ECLIPSE WINDOW", "04:12 REMAIN"],
    ],
  },
  {
    id: "mars",
    name: "MARS",
    code: "PL-04",
    type: "TERRESTRIAL // COLD DESERT",
    color: "#FF7A4A",
    diameter: "6,779 KM",
    distance: "1.52 AU",
    orbit: "687 DAYS",
    rotation: "24.6 HOURS",
    moons: "2 (PHOBOS/DEIMOS)",
    temp: "-65°C AVG",
    briefing: [
      "ORBITAL TELEMETRY // OXIDE WASTELAND",
      "Dust storm season is consuming the northern hemisphere. Buried supply caches at the Olympus slope remain sealed — heat signatures suggest the enemy found them first.",
    ],
    data: [
      ["OLYMPUS CACHES", "2 OF 5 SEALED"],
      ["STORM FRONT", "N-HEMISPHERE"],
      ["SURVIVAL INDEX", "MARGINAL"],
    ],
  },
  {
    id: "jupiter",
    name: "JUPITER",
    code: "PL-05",
    type: "GAS GIANT // STORM CARRIER",
    color: "#E8C48A",
    diameter: "139,820 KM",
    distance: "5.20 AU",
    orbit: "11.86 YEARS",
    rotation: "9.9 HOURS",
    moons: "95 CONFIRMED",
    temp: "-110°C (CLOUD TOPS)",
    briefing: [
      "ORBITAL TELEMETRY // RED STORM SYSTEM",
      "The Great Red Spot remains stable after three centuries. Gravity assist corridor through the Callisto pass is clear — fleet staging points hidden in the radiation shadow of the ring system.",
    ],
    data: [
      ["GREAT RED SPOT", "STABLE"],
      ["RADIATION BELT", "EXTREME"],
      ["MOON RELAYS", "CALLISTO / EUROPA"],
    ],
  },
  {
    id: "saturn",
    name: "SATURN",
    code: "PL-06",
    type: "GAS GIANT // RINGED",
    color: "#E8D8A8",
    diameter: "116,460 KM",
    distance: "9.58 AU",
    orbit: "29.4 YEARS",
    rotation: "10.7 HOURS",
    moons: "146 CONFIRMED",
    temp: "-140°C (CLOUD TOPS)",
    briefing: [
      "ORBITAL TELEMETRY // RING FORTRESS",
      "The ice ring hosts a chain of passive sensor buoys — each crystal fragment reflecting hostile radar like a wall of mirrors. Titan relay keeps the outer system on the command grid.",
    ],
    data: [
      ["RING ARRAY", "62 BUOYS ONLINE"],
      ["TITAN RELAY", "AMBER — INTERMITTENT"],
      ["ICE MASS", "4.8e19 KG"],
    ],
  },
  {
    id: "uranus",
    name: "URANUS",
    code: "PL-07",
    type: "ICE GIANT // SIDEWAYS SPIN",
    color: "#9FE8E4",
    diameter: "50,724 KM",
    distance: "19.2 AU",
    orbit: "84 YEARS",
    rotation: "-17.2 HOURS",
    moons: "28 CONFIRMED",
    temp: "-195°C",
    briefing: [
      "ORBITAL TELEMETRY // EXTREME AXIAL TILT",
      "The planet rolls sideways along its orbit — seasons lasting decades. Long-range arrays on Miranda pick up unexplained resonance in the inner ring: possibly our own signal, reflected 20 years ago.",
    ],
    data: [
      ["AXIAL TILT", "97.8°"],
      ["RING RESONANCE", "UNEXPLAINED"],
      ["MIRANDA ARRAY", "LISTENING"],
    ],
  },
  {
    id: "neptune",
    name: "NEPTUNE",
    code: "PL-08",
    type: "ICE GIANT // DEEP BLUE",
    color: "#5A8ADF",
    diameter: "49,244 KM",
    distance: "30.1 AU",
    orbit: "165 YEARS",
    rotation: "16.1 HOURS",
    moons: "16 CONFIRMED",
    temp: "-201°C",
    briefing: [
      "ORBITAL TELEMETRY // TERMINAL PERIMETER",
      "The outermost command boundary. Supersonic winds tear across the methane horizon at 2,100 km/h — the fastest in the system. Triton listening post is the last line of the early warning net.",
    ],
    data: [
      ["WIND SPEED", "2,100 KM/H"],
      ["TRITON POST", "EARLY WARNING NET"],
      ["DARK SPOT", "TRANSIENT"],
    ],
  },
];

export const planetById = (id: string) => PLANETS.find((p) => p.id === id);

/* ============================================================
 *  GALAXY — neighbouring & famous stars (clickable in the view)
 * ============================================================ */

export interface GalaxyStar {
  id: string;
  name: string;
  zh: string;
  color: string;
  type: string;
  distance: string;
  mag: string;
  pos: [number, number, number];
  briefing: [string, string];
}

export const GALAXY_STARS: GalaxyStar[] = [
  {
    id: "proxima",
    name: "PROXIMA CENTAURI C",
    zh: "比邻星 · 半人马座 α C",
    color: "#ff6a4a",
    type: "M5.5V 红矮星",
    distance: "4.24 光年",
    mag: "11.13",
    pos: [34.5, 4.2, 6.4],
    briefing: [
      "距离太阳最近的恒星（4.24 光年），半人马座 α 三合星的第三成员。已确认 2 颗行星：比邻星 b（1.07 倍地球质量，宜居带内的最近类地行星）与比邻星 d（0.26 倍地球质量，5 天公转周期）。",
      "The closest star to the sun (4.24 ly), third member of the Alpha Centauri triple. Two planets confirmed: Proxima b (1.07 M⊕, nearest terrestrial world in the habitable zone) and Proxima d (0.26 M⊕, 5-day orbit).",
    ],
  },
  {
    id: "alpha-a",
    name: "ALPHA CENTAURI A",
    zh: "南门二 A",
    color: "#fff4d0",
    type: "G2V 黄主序星",
    distance: "4.37 光年",
    mag: "-0.01",
    pos: [36.2, 6.8, 4.9],
    briefing: [
      "半人马座 α 双星的主星——与太阳同类型的 G 型主序星，质量与亮度都略高于太阳。与南门二 B 相互绕转，周期约 80 年。",
      "Primary of the Alpha Centauri binary — a G-type main-sequence star like our sun, slightly more massive and luminous. Orbits Alpha Centauri B every ~80 years.",
    ],
  },
  {
    id: "alpha-b",
    name: "ALPHA CENTAURI B",
    zh: "南门二 B",
    color: "#ffb060",
    type: "K1V 橙矮星",
    distance: "4.37 光年",
    mag: "1.33",
    pos: [33.8, 8.4, 7.2],
    briefing: [
      "半人马座 α 双星的伴星——K 型橙矮星，亮度低于太阳，与南门二 A 组成夜空中最近的亮双星。",
      "Companion of the Alpha Centauri binary — a K-type orange dwarf, dimmer than the sun, forming the closest bright binary in our sky.",
    ],
  },
  {
    id: "barnard",
    name: "BARNARD'S STAR",
    zh: "巴纳德星",
    color: "#ff8a60",
    type: "M4V 红矮星",
    distance: "5.96 光年",
    mag: "9.54",
    pos: [22.5, -6.2, -9.6],
    briefing: [
      "蛇夫座方向的红矮星，自行速度最快的恒星之一（每年 10.3 角秒）。研究认为它至少拥有 1 颗超级地球——巴纳德星 b（约 3.2 倍地球质量），位于宜居带外侧。",
      "A red dwarf in Ophiuchus with one of the fastest proper motions (10.3\"/yr). At least one super-Earth is suspected — Barnard's Star b (~3.2 M⊕), just outside the habitable zone.",
    ],
  },
  {
    id: "wolf359",
    name: "WOLF 359",
    zh: "沃尔夫 359",
    color: "#ff5a4a",
    type: "M6V 红矮耀星",
    distance: "7.86 光年",
    mag: "13.54",
    pos: [14.6, 10.4, 12.2],
    briefing: [
      "狮子座方向的红矮耀星——亮度极低，是已知最近的恒星之一。暂无确认的行星，但频繁的耀斑活动使它成为恒星物理研究的焦点。",
      "A faint red-dwarf flare star in Leo — among the closest stars known. No planets confirmed, but its violent flares make it a key stellar-physics laboratory.",
    ],
  },
  {
    id: "lalande",
    name: "LALANDE 21185",
    zh: "拉兰德 21185",
    color: "#ff7050",
    type: "M2V 红矮星",
    distance: "8.29 光年",
    mag: "7.52",
    pos: [26.4, 12.6, 8.8],
    briefing: [
      "大熊座方向的红矮星——已确认至少 2 颗行星，是离太阳较近的多行星系统之一。",
      "A red dwarf in Ursa Major — at least 2 planets confirmed, one of the closest multi-planet systems to the sun.",
    ],
  },
  {
    id: "sirius-a",
    name: "SIRIUS A",
    zh: "天狼星 A",
    color: "#cfe4ff",
    type: "A1V 蓝白主序星",
    distance: "8.58 光年",
    mag: "-1.46",
    pos: [31.4, -9.2, -5.8],
    briefing: [
      "夜空中最亮的恒星——大犬座的 A 型主序星，亮度约为太阳的 25 倍。与致密白矮星天狼星 B 组成双星系统，目前未确认存在行星。",
      "The brightest star in the night sky — an A-type main-sequence star in Canis Major, ~25× the sun's luminosity. Binary with the white dwarf Sirius B; no planets confirmed.",
    ],
  },
  {
    id: "sirius-b",
    name: "SIRIUS B",
    zh: "天狼星 B",
    color: "#e8f0ff",
    type: "DA2 白矮星",
    distance: "8.58 光年",
    mag: "8.44",
    pos: [34.0, -11.0, -4.4],
    briefing: [
      "天狼星系统的白矮星伴星——体积接近地球、质量却与太阳相当。它是离我们最近的白矮星，一颗恒星生命的最终余烬。",
      "White-dwarf companion of Sirius — Earth-sized but as massive as the sun. The closest white dwarf to us: the final ember of a star's life.",
    ],
  },
  {
    id: "eps-eri",
    name: "EPSILON ERIDANI",
    zh: "天苑四 · 波江座 ε",
    color: "#ffb060",
    type: "K2V 橙矮星",
    distance: "10.5 光年",
    mag: "3.73",
    pos: [13.8, 5.6, -14.4],
    briefing: [
      "波江座的 K 型橙矮星——肉眼可见的距离最近恒星之一。已确认 1 颗气态行星天苑四 b，并拥有大范围尘埃盘，推测可能存在更多岩石行星。",
      "A K-type orange dwarf in Eridanus — among the closest naked-eye stars. One gas giant confirmed (Epsilon Eridani b), plus a broad debris disk hinting at more rocky worlds.",
    ],
  },
  {
    id: "ross128",
    name: "ROSS 128",
    zh: "罗斯 128",
    color: "#ff7a5a",
    type: "M4V 红矮星",
    distance: "11.0 光年",
    mag: "11.13",
    pos: [11.2, -11.4, -7.2],
    briefing: [
      "室女座方向的安静红矮星——拥有 1 颗温带地球级行星罗斯 128 b，位于宜居带内缘。",
      "A quiet red dwarf in Virgo — hosts Ross 128 b, a temperate Earth-mass planet near the inner edge of the habitable zone.",
    ],
  },
  {
    id: "gliese876",
    name: "GLIESE 876",
    zh: "格利泽 876",
    color: "#ff6a4a",
    type: "M4V 红矮星",
    distance: "15.2 光年",
    mag: "10.17",
    pos: [8.8, -9.6, 10.4],
    briefing: [
      "宝瓶座方向的红矮星——已知拥有 4 颗行星的著名多行星系统，其中一颗位于宜居带边缘。",
      "A red dwarf in Aquarius — a celebrated 4-planet system, one world skirting the habitable zone's edge.",
    ],
  },
  {
    id: "gliese581",
    name: "GLIESE 581",
    zh: "格利泽 581",
    color: "#ff5a4a",
    type: "M3V 红矮星",
    distance: "20.5 光年",
    mag: "10.55",
    pos: [6.6, -6.8, -13.2],
    briefing: [
      "天秤座方向的红矮星——曾引发热议的宜居行星候选系统，拥有多颗行星的经典研究目标。",
      "A red dwarf in Libra — the famous system that sparked the habitable-planet debate, a classic target for exoplanet science.",
    ],
  },
  {
    id: "vega",
    name: "VEGA",
    zh: "织女星",
    color: "#cfe4ff",
    type: "A0V 蓝白主序星",
    distance: "25 光年",
    mag: "0.03",
    pos: [30.8, 14.2, -8.6],
    briefing: [
      "天琴座的织女星——全天第五亮，曾经的'北极星'（约 12000 年后它将再度成为北极星）。",
      "Vega of Lyra — fifth brightest in the sky, a former pole star that will reclaim the title in ~12,000 years.",
    ],
  },
];

export const starById = (id: string) => GALAXY_STARS.find((s) => s.id === id);

/* ============================================================
 *  NEIGHBOUR GALAXIES — fly to them from the galactic view
 * ============================================================ */

export type NeighborGalaxyType = "spiral" | "irregular" | "lenticular";

export interface NeighborGalaxy {
  id: string;
  name: string;
  zh: string;
  type: NeighborGalaxyType;
  typeLabel: [string, string];
  distance: string;
  size: string;
  color: string;
  pos: [number, number, number];
  briefing: [string, string];
  data: [string, string][];
}

export const NEIGHBOR_GALAXIES: NeighborGalaxy[] = [
  {
    id: "andromeda",
    name: "ANDROMEDA · M31",
    zh: "仙女座星系",
    type: "spiral",
    typeLabel: ["螺旋星系 · Sb", "SPIRAL · Sb"],
    distance: "254 万光年",
    size: "22 万光年",
    color: "#ffe9c0",
    pos: [98, 10, 22],
    briefing: [
      "仙女座星系——本星系群中最大的星系，比我们的银河系还大。它正以每秒 110 公里的速度向我们冲来，40 亿年后两者将碰撞合并为'银河仙女座'。",
      "Andromeda — the largest galaxy in the Local Group, bigger than our own Milky Way. It is approaching at 110 km/s; in 4 billion years the two will merge into 'Milkomeda'.",
    ],
    data: [
      ["恒星数量", "约 1 万亿"],
      ["类型", "Sb 螺旋"],
      ["接近速度", "110 KM/S"],
    ],
  },
  {
    id: "triangulum",
    name: "TRIANGULUM · M33",
    zh: "三角座星系",
    type: "spiral",
    typeLabel: ["螺旋星系 · Sc", "SPIRAL · Sc"],
    distance: "273 万光年",
    size: "6 万光年",
    color: "#cfe8ff",
    pos: [74, -16, 44],
    briefing: [
      "三角座星系——本星系群第三大成员，一座星光流转的巨大旋涡。它的旋臂松散而明亮，孕育着巨大的恒星形成区。",
      "Triangulum — third-largest member of the Local Group, a great pinwheel of starlight. Its loosely wound arms host giant star-forming regions.",
    ],
    data: [
      ["恒星数量", "约 400 亿"],
      ["类型", "Sc 螺旋"],
      ["视角", "正面 54°"],
    ],
  },
  {
    id: "lmc",
    name: "LARGE MAGELLANIC CLOUD",
    zh: "大麦哲伦云",
    type: "irregular",
    typeLabel: ["不规则矮星系", "IRREGULAR DWARF"],
    distance: "16.3 万光年",
    size: "1.4 万光年",
    color: "#9fe8ff",
    pos: [-46, -34, -38],
    briefing: [
      "大麦哲伦云——银河系最亮的伴星系，南天肉眼可见的云雾。著名的蜘蛛星云（剑鱼座 30）就藏在其中，是本地宇宙最剧烈的恒星育婴室。",
      "The Large Magellanic Cloud — the Milky Way's brightest satellite, visible to the naked eye from the south. It hides the Tarantula Nebula, the most violent stellar nursery in the local universe.",
    ],
    data: [
      ["恒星数量", "约 300 亿"],
      ["地位", "银河伴星系"],
      ["著名区域", "蜘蛛星云"],
    ],
  },
  {
    id: "smc",
    name: "SMALL MAGELLANIC CLOUD",
    zh: "小麦哲伦云",
    type: "irregular",
    typeLabel: ["不规则矮星系", "IRREGULAR DWARF"],
    distance: "20 万光年",
    size: "7000 光年",
    color: "#d8e8ff",
    pos: [-54, -26, -28],
    briefing: [
      "小麦哲伦云——大麦哲伦云的小妹妹，同样绕着银河系公转。两者之间还拖着一条横跨天空的巨大'麦哲伦流'——被潮汐力撕扯出来的氢气尾迹。",
      "The Small Magellanic Cloud — the LMC's little sister, also orbiting the Milky Way. A vast 'Magellanic Stream' of hydrogen gas, torn out by tidal forces, trails between them.",
    ],
    data: [
      ["恒星数量", "约 10 亿"],
      ["地位", "银河伴星系"],
      ["潮汐结构", "麦哲伦流"],
    ],
  },
  {
    id: "whirlpool",
    name: "WHIRLPOOL · M51",
    zh: "漩涡星系",
    type: "spiral",
    typeLabel: ["螺旋星系 · 互扰对", "SPIRAL · INTERACTING"],
    distance: "2300 万光年",
    size: "7.6 万光年",
    color: "#ffd8e0",
    pos: [-92, 28, -54],
    briefing: [
      "漩涡星系——与伴星系 NGC 5195 正在上演引力之舞：潮汐力把旋臂搅成华丽的涡旋，是'星系相互作用'最经典的教科书案例。",
      "The Whirlpool Galaxy — locked in a gravitational dance with companion NGC 5195: tidal forces have wound its arms into a spectacular vortex, the textbook case of galaxy interaction.",
    ],
    data: [
      ["伴星系", "NGC 5195"],
      ["特征", "潮汐旋涡"],
      ["状态", "持续互扰中"],
    ],
  },
];

export const neighborGalaxyById = (id: string) => NEIGHBOR_GALAXIES.find((g) => g.id === id);

/* ============================================================
 *  FULL LOCAL GROUP + famous neighbours — 16 galaxies, all
 *  fly-in-able, each with textured exoplanets.
 * ============================================================ */

const EXTRA_GALAXIES: NeighborGalaxy[] = [
  {
    id: "ic10",
    name: "IC 10",
    zh: "IC 10",
    type: "irregular",
    typeLabel: ["不规则矮星系", "IRREGULAR DWARF"],
    distance: "220 万光年",
    size: "5,000 光年",
    color: "#9fd8ff",
    pos: [92, 4, -26],
    briefing: [
      "IC 10——本星系群中唯一已知的星暴星系，恒星形成率远高于其他成员，是研究早期宇宙的天然实验室。",
      "IC 10 — the only known starburst galaxy in the Local Group, forming stars at a furious rate unmatched by its neighbours.",
    ],
    data: [
      ["特征", "星暴活动"],
      ["恒星形成率", "极高"],
      ["位置", "仙后座方向"],
    ],
  },
  {
    id: "sextans-a",
    name: "SEXTANS A",
    zh: "六分仪座 A",
    type: "irregular",
    typeLabel: ["不规则矮星系", "IRREGULAR DWARF"],
    distance: "430 万光年",
    size: "5,000 光年",
    color: "#bfe8ff",
    pos: [52, 14, -46],
    briefing: [
      "六分仪座 A——本星系群边缘的小型不规则星系，方方正正的年轻星团散布其中，像夜空中的萤火。",
      "Sextans A — a small irregular at the edge of the Local Group, studded with boxy young star clusters like fireflies.",
    ],
    data: [
      ["特征", "年轻星团"],
      ["形态", "方形结构"],
      ["位置", "本星系群边缘"],
    ],
  },
  {
    id: "draco-dwarf",
    name: "DRACO DWARF",
    zh: "天龙座矮星系",
    type: "irregular",
    typeLabel: ["矮椭球星系", "DWARF SPHEROIDAL"],
    distance: "26 万光年",
    size: "3,500 光年",
    color: "#d8d0ff",
    pos: [-24, 22, -12],
    briefing: [
      "天龙座矮星系——银河系最暗的伴星系之一，古老恒星的墓场。这里的恒星几乎全部诞生于百亿年前。",
      "Draco Dwarf — one of the Milky Way's faintest satellites, a graveyard of ancient stars born ten billion years ago.",
    ],
    data: [
      ["恒星", "极古老"],
      ["金属丰度", "极低"],
      ["亮度", "极暗"],
    ],
  },
  {
    id: "canes-dwarf",
    name: "CANES VENATICI I",
    zh: "猎犬座 I 矮星系",
    type: "irregular",
    typeLabel: ["矮椭球星系", "DWARF SPHEROIDAL"],
    distance: "71 万光年",
    size: "2,000 光年",
    color: "#e8d8ff",
    pos: [8, 26, 18],
    briefing: [
      "猎犬座 I——银河系最远的经典伴星系之一，暗物质占比惊人。它悄悄绕着银河转了三圈。",
      "Canes Venatici I — one of the most distant classical satellites, remarkably dark-matter dominated, on its third lap around the Milky Way.",
    ],
    data: [
      ["暗物质占比", "极高"],
      ["公转", "第 3 圈"],
      ["亮度", "极暗"],
    ],
  },
  {
    id: "ngc55",
    name: "NGC 55",
    zh: "NGC 55",
    type: "irregular",
    typeLabel: ["不规则星系", "IRREGULAR"],
    distance: "700 万光年",
    size: "5 万光年",
    color: "#cfe4ff",
    pos: [86, -34, 28],
    briefing: [
      "NGC 55——南天玉夫座群边缘的侧向星系，常被称为'鲸鱼星系'的兄弟。边缘视角下尘埃带清晰可见。",
      "NGC 55 — an edge-on irregular at the edge of the Sculptor Group, sibling of the 'Whale Galaxy', dust lanes starkly visible.",
    ],
    data: [
      ["视角", "边缘 80°"],
      ["群属", "玉夫座群"],
      ["尘埃带", "清晰"],
    ],
  },
  {
    id: "ngc253",
    name: "SCULPTOR · NGC 253",
    zh: "玉夫座星系",
    type: "spiral",
    typeLabel: ["星暴螺旋星系", "STARBURST SPIRAL"],
    distance: "1140 万光年",
    size: "7 万光年",
    color: "#ffd8a0",
    pos: [102, -18, -38],
    briefing: [
      "玉夫座星系——天空中最亮的星暴星系之一，银币星系。它的核心正以疯狂的速度锻造新星。",
      "The Sculptor Galaxy — the 'Silver Coin', one of the brightest starburst galaxies in the sky, forging stars at a frantic pace.",
    ],
    data: [
      ["特征", "星暴核心"],
      ["恒星形成", "活跃"],
      ["尘埃", "浓密"],
    ],
  },
  {
    id: "m81",
    name: "BODE'S · M81",
    zh: "波德星系",
    type: "spiral",
    typeLabel: ["大螺旋星系", "GRAND SPIRAL"],
    distance: "1200 万光年",
    size: "9 万光年",
    color: "#ffe0b0",
    pos: [-98, 24, 40],
    briefing: [
      "波德星系——北天最美丽的螺旋之一，M81 星系群的主导者。平滑的旋臂如盛开的星之花。",
      "Bode's Galaxy — one of the northern sky's finest spirals, dominant member of the M81 Group, arms unfurling like a stellar bloom.",
    ],
    data: [
      ["群属", "M81 星系群"],
      ["旋臂", "平滑"],
      ["核心", "活跃黑洞"],
    ],
  },
  {
    id: "m82",
    name: "CIGAR · M82",
    zh: "雪茄星系",
    type: "irregular",
    typeLabel: ["星暴星系", "STARBURST"],
    distance: "1200 万光年",
    size: "3.7 万光年",
    color: "#ff9a6a",
    pos: [-99, 26, 38],
    briefing: [
      "雪茄星系——被波德星系的引力撕扯的星暴星系，喷涌的红色氢流从核心冲天而起。",
      "The Cigar Galaxy — a starburst torn by M81's gravity, red hydrogen filaments erupting from its core.",
    ],
    data: [
      ["特征", "氢流喷涌"],
      ["诱因", "M81 潮汐力"],
      ["恒星形成", "爆发"],
    ],
  },
  {
    id: "m101",
    name: "PINWHEEL · M101",
    zh: "风车星系",
    type: "spiral",
    typeLabel: ["正面螺旋星系", "FACE-ON SPIRAL"],
    distance: "2100 万光年",
    size: "17 万光年",
    color: "#ffd8e8",
    pos: [76, 34, 52],
    briefing: [
      "风车星系——正对地球的巨大旋涡，直径是银河系的两倍。旋臂上的恒星形成区像珍珠串般闪耀。",
      "The Pinwheel Galaxy — a face-on whirlpool twice the Milky Way's size, star-forming regions strung along its arms like pearls.",
    ],
    data: [
      ["直径", "银河系 2 倍"],
      ["视角", "正面"],
      ["旋臂", "5 条"],
    ],
  },
  {
    id: "m104",
    name: "SOMBRERO · M104",
    zh: "草帽星系",
    type: "lenticular",
    typeLabel: ["透镜星系", "LENTICULAR"],
    distance: "2900 万光年",
    size: "5 万光年",
    color: "#ffe9c0",
    pos: [112, -22, 64],
    briefing: [
      "草帽星系——边缘视角下的优雅透镜星系，中央隆起的核球被壮观的尘埃带环绕。",
      "The Sombrero — an elegant lenticular seen edge-on, its bright bulge wrapped by a spectacular dust lane.",
    ],
    data: [
      ["特征", "尘埃带环"],
      ["核球", "巨型黑洞"],
      ["视角", "边缘 84°"],
    ],
  },
];

/* Local Group satellites per the brief — closest dwarf galaxies */
const SATELLITE_GALAXIES: NeighborGalaxy[] = [
  {
    id: "canis-dwarf",
    name: "CANIS MAJOR DWARF",
    zh: "大犬座矮星系",
    type: "irregular",
    typeLabel: ["不规则矮星系 · 被潮汐撕裂", "IRREGULAR DWARF · TIDALLY TORN"],
    distance: "2.5 万光年",
    size: "1,200 光年",
    color: "#cfe4ff",
    pos: [-20, -8, -8],
    briefing: [
      "已知距离银河系最近的矮星系——仅 2.5 万光年。它正被银河系的引力潮汐撕裂、逐渐吞并，恒星已散落在银河系外围的星流中。",
      "The closest known dwarf galaxy to the Milky Way — just 25,000 ly away. Galactic tides are tearing it apart; its stars already stream through the outer halo.",
    ],
    data: [
      ["距离", "2.5 万光年"],
      ["状态", "被潮汐撕裂"],
      ["恒星", "散落星流"],
    ],
  },
  {
    id: "sagittarius-dwarf",
    name: "SAGITTARIUS DSPH",
    zh: "人马座矮椭球星系",
    type: "irregular",
    typeLabel: ["矮椭球星系 · 环绕星流", "DWARF SPHEROIDAL · WRAPPED STREAM"],
    distance: "6 万光年",
    size: "1 万光年",
    color: "#e8d8ff",
    pos: [-16, 12, 10],
    briefing: [
      "银河系的卫星星系——已经被银河系引力拉扯成环绕银河的星流，核心部分位于人马座方向。它正把恒星一条条地送进银河。",
      "A satellite of the Milky Way — stretched into a stellar stream wrapping the galaxy, its core toward Sagittarius. It feeds stars into the Milky Way in ribbons.",
    ],
    data: [
      ["距离", "6 万光年"],
      ["结构", "环绕星流"],
      ["核心", "人马座方向"],
    ],
  },
];

NEIGHBOR_GALAXIES.push(...EXTRA_GALAXIES, ...SATELLITE_GALAXIES);

/* ============================================================
 *  EXOPLANETS — textured worlds orbiting the neighbour galaxies
 * ============================================================ */

export type ExoPlanetStyle = "gas" | "ocean" | "desert" | "ice" | "lava";

export interface ExoPlanet {
  id: string;
  galaxyId: string;
  name: string;
  zh: string;
  style: ExoPlanetStyle;
  color: string;
  radius: number;
  orbit: number;
  speed: number;
  phase: number;
  type: [string, string];
  briefing: [string, string];
  data: [string, string][];
}

export const EXO_PLANETS: ExoPlanet[] = [
  {
    id: "exo-and-1",
    galaxyId: "andromeda",
    name: "ANDROMEDA b",
    zh: "仙女座 b",
    style: "gas",
    color: "#E8C48A",
    radius: 1.3,
    orbit: 4.6,
    speed: 0.22,
    phase: 0.8,
    type: ["气态巨行星", "GAS GIANT"],
    briefing: [
      "仙女座星系的外缘行星——一颗漂浮在陌生旋臂中的气态巨行星。云带在异星恒星的照射下流转，仿佛在向我们招手。",
      "An outer world of Andromeda — a gas giant adrift in a foreign spiral arm. Its cloud bands churn under an alien sun.",
    ],
    data: [
      ["大气", "氢氦 + 甲烷"],
      ["质量", "2.1 木星质量"],
      ["卫星", "17 颗"],
    ],
  },
  {
    id: "exo-and-2",
    galaxyId: "andromeda",
    name: "ANDROMEDA c",
    zh: "仙女座 c",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.85,
    orbit: 7.2,
    speed: 0.14,
    phase: 2.4,
    type: ["海洋行星", "OCEAN WORLD"],
    briefing: [
      "被数十亿光年外的星光染蓝的海洋行星——全球覆盖液态水，云层下有未知的海洋生命在发光。",
      "An ocean world painted blue by starlight from billions of light-years away — a global sea with bioluminescent life below.",
    ],
    data: [
      ["海面", "100% 覆盖"],
      ["温度", "12°C"],
      ["生命信号", "检测到荧光"],
    ],
  },
  {
    id: "exo-tri-1",
    galaxyId: "triangulum",
    name: "TRIANGULUM b",
    zh: "三角座 b",
    style: "desert",
    color: "#FF7A4A",
    radius: 0.7,
    orbit: 4.0,
    speed: 0.26,
    phase: 1.2,
    type: ["荒漠行星", "DESERT WORLD"],
    briefing: [
      "三角座星系里的荒漠行星——赤色沙丘横亘千公里，尘暴季节席卷全球。峡谷深处埋藏着远古海洋的盐矿。",
      "A desert world in Triangulum — red dunes stretching a thousand kilometres, dust storms seasonally sweeping the globe.",
    ],
    data: [
      ["地表", "铁氧化物沙"],
      ["温度", "48°C"],
      ["峡谷", "盐矿遗迹"],
    ],
  },
  {
    id: "exo-lmc-1",
    galaxyId: "lmc",
    name: "LMC b",
    zh: "麦哲伦 b",
    style: "ice",
    color: "#9FE8E4",
    radius: 0.9,
    orbit: 4.2,
    speed: 0.24,
    phase: 3.1,
    type: ["冰封行星", "ICE WORLD"],
    briefing: [
      "大麦哲伦云中的冰封行星——整颗星球被冰川包裹，冰层之下埋藏着深达百公里的液态海洋。",
      "A frozen world in the LMC — sheathed in glaciers, with a liquid ocean buried a hundred kilometres beneath the ice.",
    ],
    data: [
      ["冰层", "30 KM"],
      ["地下海洋", "180 KM"],
      ["温度", "-110°C"],
    ],
  },
  {
    id: "exo-som-1",
    galaxyId: "m104",
    name: "SOMBRERO b",
    zh: "草帽 b",
    style: "lava",
    color: "#FF5A3A",
    radius: 0.75,
    orbit: 3.6,
    speed: 0.3,
    phase: 0.3,
    type: ["熔岩行星", "LAVA WORLD"],
    briefing: [
      "草帽星系里的熔岩行星——潮汐力把内核加热到炽白，火山口喷涌的熔岩河流淌在永恒的黑夜里。",
      "A lava world in the Sombrero — tidal heating glows its core white-hot, rivers of magma flowing through eternal night.",
    ],
    data: [
      ["表面", "熔岩海"],
      ["温度", "820°C"],
      ["火山", "活跃期"],
    ],
  },
  {
    id: "exo-m51-1",
    galaxyId: "whirlpool",
    name: "M51 b",
    zh: "漩涡 b",
    style: "gas",
    color: "#E8D8A8",
    radius: 1.1,
    orbit: 5.0,
    speed: 0.2,
    phase: 4.2,
    type: ["气态巨行星 · 带环", "RINGED GAS GIANT"],
    briefing: [
      "漩涡星系中的环系巨行星——比土星还壮观的冰环在双星系潮汐力下微微倾斜，像一顶皇冠。",
      "A ringed giant in the Whirlpool — ice rings more spectacular than Saturn's, tilted slightly by the dual-galaxy tides.",
    ],
    data: [
      ["环系", "三重冰环"],
      ["质量", "1.6 土星质量"],
      ["卫星", "23 颗"],
    ],
  },
];

export const exoPlanetById = (id: string) => EXO_PLANETS.find((p) => p.id === id);

/* ---- exoplanets of nearby STAR SYSTEMS (real data) ---- */

const STAR_EXO_PLANETS: ExoPlanet[] = [
  {
    id: "proxima-b",
    galaxyId: "proxima",
    name: "PROXIMA b",
    zh: "比邻星 b",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.9,
    orbit: 3.6,
    speed: 0.28,
    phase: 1.2,
    type: ["类地行星 · 宜居带", "TERRESTRIAL · HABITABLE"],
    briefing: [
      "距离地球最近的系外行星——1.07 倍地球质量的类地行星，位于比邻星的宜居带内。它很可能被潮汐锁定，永远以同一面朝向这颗红矮星。",
      "The closest exoplanet to Earth — a 1.07 M⊕ terrestrial in Proxima's habitable zone. Likely tidally locked, one face forever toward its red sun.",
    ],
    data: [
      ["质量", "1.07 地球"],
      ["轨道", "11.2 天"],
      ["潮汐锁定", "很可能"],
    ],
  },
  {
    id: "proxima-d",
    galaxyId: "proxima",
    name: "PROXIMA d",
    zh: "比邻星 d",
    style: "desert",
    color: "#FF7A4A",
    radius: 0.5,
    orbit: 2.0,
    speed: 0.5,
    phase: 3.0,
    type: ["类地行星 · 极近轨道", "TERRESTRIAL · ULTRA-CLOSE"],
    briefing: [
      "比邻星系统的第三颗行星——仅 0.26 倍地球质量的小型类地行星，贴着恒星公转，周期只有 5 天，表面被恒星风炙烤。",
      "Proxima's third world — a tiny 0.26 M⊕ terrestrial hugging its star with a 5-day orbit, baked by stellar wind.",
    ],
    data: [
      ["质量", "0.26 地球"],
      ["公转", "5 天"],
      ["表面", "高温"],
    ],
  },
  {
    id: "barnard-b",
    galaxyId: "barnard",
    name: "BARNARD b",
    zh: "巴纳德星 b",
    style: "ice",
    color: "#9FE8E4",
    radius: 1.1,
    orbit: 4.2,
    speed: 0.22,
    phase: 0.8,
    type: ["超级地球", "SUPER-EARTH"],
    briefing: [
      "巴纳德星系统的超级地球——约 3.2 倍地球质量，位于宜居带外侧，是一颗冰封的岩石世界。",
      "A super-Earth in the Barnard system — ~3.2 M⊕, just outside the habitable zone: a frozen rocky world.",
    ],
    data: [
      ["质量", "3.2 地球"],
      ["位置", "宜居带外缘"],
      ["表面", "冰岩"],
    ],
  },
  {
    id: "lalande-b",
    galaxyId: "lalande",
    name: "LALANDE 21185 b",
    zh: "拉兰德 21185 b",
    style: "gas",
    color: "#E8C48A",
    radius: 1.2,
    orbit: 4.8,
    speed: 0.2,
    phase: 2.1,
    type: ["气态行星", "GAS GIANT"],
    briefing: [
      "拉兰德 21185 已确认的行星之一——近距离多行星系统的成员，云带在其暗淡的橙红星光下缓缓流转。",
      "One of Lalande 21185's confirmed worlds — member of a nearby multi-planet system, its clouds drifting under dim orange starlight.",
    ],
    data: [
      ["系统", "≥2 行星"],
      ["恒星", "M2V 红矮星"],
      ["轨道", "贴近恒星"],
    ],
  },
  {
    id: "lalande-c",
    galaxyId: "lalande",
    name: "LALANDE 21185 c",
    zh: "拉兰德 21185 c",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.8,
    orbit: 6.4,
    speed: 0.16,
    phase: 4.5,
    type: ["类地行星", "TERRESTRIAL"],
    briefing: [
      "拉兰德 21185 的第二颗确认行星——更外侧的世界，可能拥有液态水海洋。",
      "Lalande 21185's second confirmed world — farther out, possibly harbouring liquid-water oceans.",
    ],
    data: [
      ["系统", "≥2 行星"],
      ["类型", "类地"],
      ["水", "可能"],
    ],
  },
  {
    id: "eps-eri-b",
    galaxyId: "eps-eri",
    name: "EPSILON ERIDANI b",
    zh: "天苑四 b",
    style: "gas",
    color: "#E8D8A8",
    radius: 1.5,
    orbit: 5.6,
    speed: 0.17,
    phase: 0.3,
    type: ["气态巨行星", "GAS GIANT"],
    briefing: [
      "天苑四唯一确认的行星——一颗气态巨行星，轨道外环绕着大范围尘埃盘，其中或许隐藏着更多岩石行星。",
      "Epsilon Eridani's only confirmed planet — a gas giant ringed by a broad debris disk that may hide more rocky worlds.",
    ],
    data: [
      ["尘埃盘", "广泛"],
      ["岩石行星", "推测存在"],
      ["系统年龄", "年轻"],
    ],
  },
  {
    id: "ross128-b",
    galaxyId: "ross128",
    name: "ROSS 128 b",
    zh: "罗斯 128 b",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.85,
    orbit: 3.8,
    speed: 0.26,
    phase: 1.6,
    type: ["温带类地行星", "TEMPERATE TERRESTRIAL"],
    briefing: [
      "罗斯 128 b——一颗安静的温带地球级行星，位于宜居带内缘，是最有希望的近邻宜居世界之一。",
      "Ross 128 b — a quiet, temperate Earth-mass world on the inner edge of the habitable zone, among the most promising nearby homes.",
    ],
    data: [
      ["质量", "≥1.4 地球"],
      ["轨道", "9.9 天"],
      ["宜居", "内缘"],
    ],
  },
  {
    id: "gl876-d",
    galaxyId: "gliese876",
    name: "GLIESE 876 d",
    zh: "格利泽 876 d",
    style: "desert",
    color: "#FF8A5A",
    radius: 0.7,
    orbit: 3.0,
    speed: 0.32,
    phase: 2.8,
    type: ["类地行星", "TERRESTRIAL"],
    briefing: [
      "格利泽 876 四行星系统的最内侧成员——贴恒星飞行的炽热岩质世界。",
      "Innermost member of the four-planet Gliese 876 system — a scorched rocky world racing close to its star.",
    ],
    data: [
      ["系统", "4 行星"],
      ["轨道", "贴近恒星"],
      ["表面", "炽热岩质"],
    ],
  },
  {
    id: "gl581-g",
    galaxyId: "gliese581",
    name: "GLIESE 581 g",
    zh: "格利泽 581 g",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.95,
    orbit: 4.4,
    speed: 0.21,
    phase: 3.4,
    type: ["宜居带候选", "HABITABLE CANDIDATE"],
    briefing: [
      "格利泽 581 g——曾经引爆'宜居行星'话题的候选世界，位于传统宜居带正中央，若存在，可能是一个被潮汐锁定的海洋世界。",
      "Gliese 581 g — the candidate that ignited the habitable-planet debate, sitting mid-habitable-zone; if real, possibly a tidally locked ocean world.",
    ],
    data: [
      ["状态", "争议候选"],
      ["宜居带", "正中"],
      ["潮汐锁定", "可能"],
    ],
  },
];

EXO_PLANETS.push(...STAR_EXO_PLANETS);

const EXTRA_EXO_PLANETS: ExoPlanet[] = [
  {
    id: "exo-ic10-1",
    galaxyId: "ic10",
    name: "IC 10 b",
    zh: "IC 10 b",
    style: "lava",
    color: "#FF5A3A",
    radius: 0.7,
    orbit: 3.8,
    speed: 0.28,
    phase: 1.7,
    type: ["熔岩行星", "LAVA WORLD"],
    briefing: [
      "IC 10 星暴核心旁的熔岩行星——星系级的恒星铸造炉把它的夜空照成暗红。",
      "A lava world beside IC 10's starburst core — the galactic forge lights its night sky blood-red.",
    ],
    data: [
      ["表面", "熔岩海"],
      ["温度", "890°C"],
      ["夜空", "暗红"],
    ],
  },
  {
    id: "exo-sex-1",
    galaxyId: "sextans-a",
    name: "SEXTANS A b",
    zh: "六分仪座 A b",
    style: "ice",
    color: "#9FE8E4",
    radius: 0.8,
    orbit: 4.0,
    speed: 0.25,
    phase: 0.6,
    type: ["冰封行星", "ICE WORLD"],
    briefing: [
      "六分仪座 A 里的冰封行星——年轻星团的光芒下，冰原折射出幽蓝的辉光。",
      "An ice world in Sextans A — young clusters' light refracts blue across its frozen plains.",
    ],
    data: [
      ["冰层", "25 KM"],
      ["反射率", "极高"],
      ["温度", "-130°C"],
    ],
  },
  {
    id: "exo-dra-1",
    galaxyId: "draco-dwarf",
    name: "DRACO b",
    zh: "天龙座 b",
    style: "desert",
    color: "#FF7A4A",
    radius: 0.6,
    orbit: 3.4,
    speed: 0.3,
    phase: 2.9,
    type: ["荒漠行星", "DESERT WORLD"],
    briefing: [
      "天龙座矮星系里的荒漠行星——在百亿岁恒星的黯淡红光下，沙丘无边无际。",
      "A desert world in the Draco Dwarf — endless dunes under the dim red light of ten-billion-year-old stars.",
    ],
    data: [
      ["地表", "硅酸盐沙"],
      ["恒星光", "黯淡红"],
      ["温度", "-20°C"],
    ],
  },
  {
    id: "exo-cvn-1",
    galaxyId: "canes-dwarf",
    name: "CVN I b",
    zh: "猎犬座 I b",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.75,
    orbit: 3.6,
    speed: 0.27,
    phase: 1.1,
    type: ["海洋行星", "OCEAN WORLD"],
    briefing: [
      "猎犬座 I 的海洋行星——暗物质主导的星系里，这颗蓝星独自反射着亿万年的星光。",
      "An ocean world of Canes Venatici I — a lone blue orb reflecting billion-year-old starlight in a dark-matter kingdom.",
    ],
    data: [
      ["海面", "全覆盖"],
      ["生命信号", "微弱"],
      ["温度", "8°C"],
    ],
  },
  {
    id: "exo-ngc55-1",
    galaxyId: "ngc55",
    name: "NGC 55 b",
    zh: "NGC 55 b",
    style: "gas",
    color: "#E8D8A8",
    radius: 1.2,
    orbit: 4.8,
    speed: 0.21,
    phase: 3.6,
    type: ["气态巨行星", "GAS GIANT"],
    briefing: [
      "NGC 55 里的气态巨行星——侧向星系的上空，云带像被拉长的丝带。",
      "A gas giant in NGC 55 — cloud bands stretched like ribbons above the edge-on galaxy.",
    ],
    data: [
      ["大气", "氢氦"],
      ["云带", "细长"],
      ["卫星", "12 颗"],
    ],
  },
  {
    id: "exo-ngc253-1",
    galaxyId: "ngc253",
    name: "NGC 253 b",
    zh: "玉夫座 b",
    style: "lava",
    color: "#FF7A4A",
    radius: 0.8,
    orbit: 4.2,
    speed: 0.24,
    phase: 0.4,
    type: ["熔岩行星", "LAVA WORLD"],
    briefing: [
      "玉夫座星暴星系的行星——核心星爆的热浪席卷而过，地表熔岩永不停息。",
      "A world of the Sculptor's starburst — heat from the galactic core keeps its magma oceans churning.",
    ],
    data: [
      ["表面", "永动熔岩"],
      ["热源", "星暴核心"],
      ["温度", "760°C"],
    ],
  },
  {
    id: "exo-m81-1",
    galaxyId: "m81",
    name: "M81 b",
    zh: "波德 b",
    style: "gas",
    color: "#E8C48A",
    radius: 1.4,
    orbit: 5.2,
    speed: 0.19,
    phase: 2.2,
    type: ["气态巨行星", "GAS GIANT"],
    briefing: [
      "波德星系旋臂上的巨行星——平滑旋臂的星光像潮水般拂过它的云顶。",
      "A giant on Bode's spiral arm — starlight washes over its cloud tops like tides.",
    ],
    data: [
      ["质量", "3 木星"],
      ["云顶", "风暴带"],
      ["卫星", "21 颗"],
    ],
  },
  {
    id: "exo-m82-1",
    galaxyId: "m82",
    name: "M82 b",
    zh: "雪茄 b",
    style: "desert",
    color: "#FF8A5A",
    radius: 0.65,
    orbit: 3.2,
    speed: 0.31,
    phase: 1.9,
    type: ["荒漠行星", "DESERT WORLD"],
    briefing: [
      "雪茄星系喷流旁的行星——红色氢流像极光一样悬挂在它的天际。",
      "A desert world beside the Cigar's jets — red hydrogen streamers hang in its sky like aurorae.",
    ],
    data: [
      ["天际", "氢流极光"],
      ["辐射", "强"],
      ["温度", "30°C"],
    ],
  },
  {
    id: "exo-m101-1",
    galaxyId: "m101",
    name: "M101 b",
    zh: "风车 b",
    style: "ocean",
    color: "#00F0FF",
    radius: 0.9,
    orbit: 4.6,
    speed: 0.22,
    phase: 4.4,
    type: ["海洋行星", "OCEAN WORLD"],
    briefing: [
      "风车星系里的海洋行星——珍珠串般的恒星形成区倒映在它的全球海洋上。",
      "An ocean world in the Pinwheel — pearl-string star nurseries mirrored across its global sea.",
    ],
    data: [
      ["海面", "100%"],
      ["倒影", "星团"],
      ["温度", "14°C"],
    ],
  },
];

EXO_PLANETS.push(...EXTRA_EXO_PLANETS);
