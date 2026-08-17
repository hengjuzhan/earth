/* ============================================================
 *  GALAXY INTERIOR DATA — real stars & exoplanets in galaxies
 *  beyond the Milky Way. When you enter a galaxy's interior
 *  view, these objects are placed as clickable markers.
 *
 *  Stars are real known variable stars, supergiants, novae,
 *  clusters, and famous objects resolved by Hubble/JWST etc.
 *  Exoplanets are from microlensing surveys (PA-99-N2 etc).
 * ============================================================ */

export interface GalaxyInteriorStar {
  id: string;
  galaxyId: string;
  name: string;
  zh: string;
  color: string;
  type: string;
  subtype: string; // "LBV" | "WR" | "RSG" | "BSG" | "O" | "B" | "WN" | "cluster"
  pos: [number, number, number];
  briefing: [string, string];
}

export interface GalaxyInteriorPlanet {
  id: string;
  galaxyId: string;
  parentStarId: string;
  name: string;
  zh: string;
  color: string;
  type: [string, string];
  radius: number; // relative to host star
  orbit: number;
  speed: number;
  phase: number;
  briefing: [string, string];
  data: [string, string, string, string][];
}

/* ============================================================
 *  ANDROMEDA (M31) — 2.5 million light-years
 *  The nearest major spiral galaxy, ~1 trillion stars.
 *  Known objects: variable stars, novae, star clusters.
 * ============================================================ */

export const ANDROMEDA_STARS: GalaxyInteriorStar[] = [
  {
    id: "m31-pa99",
    galaxyId: "andromeda",
    name: "PA-99-N2 LENS STAR",
    zh: "PA-99-N2 透镜星",
    color: "#ff9060",
    type: "红矮星（透镜星）",
    subtype: "RSG",
    pos: [12, 1, -8],
    briefing: [
      "1999 年 POINT-AGAPE 微引力透镜巡天事件 PA-99-N2 的透镜恒星——M31 盘内一颗约 0.5 倍太阳质量的红矮星。2009 年 Ingrosso 等分析其光变异常，提出它携带一颗约 6.3 倍木星质量的行星候选。",
      "The lens star of microlensing event PA-99-N2 (POINT-AGAPE, 1999) — an ~0.5 M☉ M-dwarf in the M31 disc. Ingrosso et al. (2009) attributed a light-curve anomaly to a ~6.3 MJ planet candidate.",
    ],
  },
  {
    id: "m31-ae-and",
    galaxyId: "andromeda",
    name: "AE ANDROMEDAE",
    zh: "仙女座 AE",
    color: "#b0d8ff",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [18, 2.4, 6],
    briefing: [
      "仙女座星系中最亮的高光度蓝变星之一，质量约 80 倍太阳，光度超过太阳的 200 万倍。这类恒星极其不稳定，会周期性喷发物质。",
      "One of the brightest Luminous Blue Variables in M31, ~80 M☉, over 2 million times the Sun's luminosity. LBVs are unstable and erupt periodically.",
    ],
  },
  {
    id: "m31-af-and",
    galaxyId: "andromeda",
    name: "AF ANDROMEDAE",
    zh: "仙女座 AF",
    color: "#a0c8ff",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [14, -3.2, 9],
    briefing: [
      "仙女座星系中另一颗著名的高光度蓝变星，与 AE And 相隔约 1°，是 M31 内恒星演化的关键研究对象。",
      "Another famous LBV in M31, about 1° from AE And. A key object for studying stellar evolution in external galaxies.",
    ],
  },
  {
    id: "m31-rv",
    galaxyId: "andromeda",
    name: "M31-RV",
    zh: "仙女座红新星",
    color: "#ff6a4a",
    type: "红新星",
    subtype: "RN",
    pos: [22, 0.8, -4],
    briefing: [
      "1988 年在仙女座星系中爆发的红新星，是一颗罕见的恒星合并事件。这是首次在银河系之外观测到此类爆发。",
      "A rare red nova that erupted in M31 in 1988 — a stellar merger event. The first such event observed outside the Milky Way.",
    ],
  },
  {
    id: "m31-v1",
    galaxyId: "andromeda",
    name: "M31 V1",
    zh: "哈勃变星",
    color: "#ffe8a0",
    type: "造父变星",
    subtype: "Cepheid",
    pos: [26, 4.2, 8],
    briefing: [
      "埃德温·哈勃 1923 年发现的造父变星，正是这颗星证明了仙女座在银河系之外，彻底改变了人类对宇宙大小的认知。",
      "The Cepheid variable Edwin Hubble discovered in 1923 — this star proved M31 lies beyond the Milky Way, revolutionizing our understanding of the universe's scale.",
    ],
  },
  {
    id: "m31-n206",
    galaxyId: "andromeda",
    name: "NGC 206",
    zh: "NGC 206 恒星云",
    color: "#cfe0ff",
    type: "OB 星协",
    subtype: "cluster",
    pos: [8, 1.5, 14],
    briefing: [
      "仙女座星系中最亮的恒星云，包含大量年轻、炽热的 O 型和 B 型恒星，是研究星系旋臂中恒星形成的理想场所。",
      "The brightest star cloud in M31, containing numerous young, hot O- and B-type stars. An ideal laboratory for studying star formation in spiral arms.",
    ],
  },
  {
    id: "m31-nuc",
    galaxyId: "andromeda",
    name: "M31 NUCLEAR CLUSTER",
    zh: "M31 核心星团",
    color: "#ffe0a0",
    type: "双核心星团",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "仙女座星系核心的奇特双星团结构——P1 和 P2 两个亮度峰值。P2 被认为是真正的星系核心，含有一个 1.4 亿倍太阳质量的超大质量黑洞。",
      "A peculiar double nucleus (P1 & P2) at M31's center. P2 is believed to be the true core, hosting a 140 million M☉ supermassive black hole.",
    ],
  },
  {
    id: "m31-ngc205",
    galaxyId: "andromeda",
    name: "NGC 205 / M110",
    zh: "M110 椭圆星系",
    color: "#fff0d0",
    type: "伴星系核心",
    subtype: "cluster",
    pos: [30, 8, 20],
    briefing: [
      "仙女座星系的主要伴星系 M110（NGC 205），矮椭圆星系，含约 40 亿颗恒星。它正在被仙女座的引力潮汐力撕扯变形。",
      "M31's prominent companion M110 (NGC 205), a dwarf elliptical with ~4 billion stars. It is being tidally distorted by M31's gravity.",
    ],
  },
  {
    id: "m31-star1",
    galaxyId: "andromeda",
    name: "M31 B324",
    zh: "仙女座 B324",
    color: "#ffffff",
    type: "B 型超巨星",
    subtype: "BSG",
    pos: [10, -1.8, 12],
    briefing: [
      "哈勃太空望远镜在仙女座星系中分辨出的单颗 B 型超巨星，温度约 20000 K，是研究星系外恒星大气的珍贵样本。",
      "A single B-type supergiant resolved by Hubble in M31, ~20000 K. A rare specimen for studying stellar atmospheres beyond the Milky Way.",
    ],
  },
  {
    id: "m31-n0812a",
    galaxyId: "andromeda",
    name: "M31N 2008-12a",
    zh: "M31 复发新星 2008-12a",
    color: "#ffd050",
    type: "复发新星（白矮星双星）",
    subtype: "Nova",
    pos: [-14, 0.5, 10],
    briefing: [
      "已知复发最快的复发新星——自 2008 年发现以来每年爆发一次（复现周期 0.996 年）。白矮星质量逼近钱德拉塞卡极限（约 1.38 M☉），吸积率极高，被认为是 Ia 型超新星前身星的最强候选，周围存在直径数百秒差距的『新星超遗迹』。",
      "The fastest-recurrent nova known, erupting annually since 2008 (recurrence 0.996 yr). Its near-Chandrasekhar (~1.38 M☉) white dwarf and extreme accretion rate make it the leading Type Ia supernova progenitor candidate, surrounded by a nova super-remnant hundreds of parsecs wide.",
    ],
  },
  {
    id: "m31-xmmu",
    galaxyId: "andromeda",
    name: "XMMU J004243.6+412519",
    zh: "M31 微类星体",
    color: "#8090ff",
    type: "微类星体（黑洞双星）",
    subtype: "BH",
    pos: [-8, -2, -12],
    briefing: [
      "2012 年 XMM-Newton 在 M31 发现的微类星体——银河系外首个探测到相对论性射电喷流的恒星质量黑洞（约 10 M☉），X 射线光度接近爱丁顿极限。7 个月内从暗到极亮再衰减，被喻为黑洞『吃完整套餐』。",
      "A microquasar discovered in M31 by XMM-Newton in 2012 — the first stellar-mass black hole (~10 M☉) beyond the Milky Way with detected relativistic radio jets, accreting near the Eddington limit.",
    ],
  },
  {
    id: "m31-g1",
    galaxyId: "andromeda",
    name: "G1 / MAYALL II",
    zh: "G1 球状星团",
    color: "#ffe0b0",
    type: "球状星团 + 黑洞候选",
    subtype: "cluster",
    pos: [20, -4, -14],
    briefing: [
      "本星系群最亮的球状星团（M_V = -10.94，质量约为半人马 ω 的 2 倍，总质量约 10^7 M☉），距 M31 核心 13 万光年，1953 年由 Mayall 与 Eggen 发现。可能像半人马 ω 一样是被 M31 吞并的矮星系残核。HST 运动学测量暗示其中心存在约 2 万倍太阳质量的中等质量黑洞候选（仍有争议）。",
      "The Local Group's brightest globular cluster (M_V = -10.94, ~10^7 M☉, twice Omega Cen), 130,000 ly from M31's core. Possibly a stripped dwarf-galaxy nucleus like Omega Cen; HST kinematics hint at a ~20,000 M☉ intermediate-mass black hole candidate (disputed).",
    ],
  },
];

/* ============================================================
 *  TRIANGULUM (M33) — 2.73 million light-years
 *  The third-largest spiral in the Local Group.
 *  Notable for massive star-forming regions.
 * ============================================================ */

export const TRIANGULUM_STARS: GalaxyInteriorStar[] = [
  {
    id: "m33-x7",
    galaxyId: "triangulum",
    name: "M33 X-7",
    zh: "三角座 X-7",
    color: "#80b0ff",
    type: "黑洞双星系统",
    subtype: "BH",
    pos: [5, 1.2, 3],
    briefing: [
      "三角座星系中最著名的 X 射线双星，含有一个 15.65 倍太阳质量的恒星质量黑洞——这是已知最大的恒星质量黑洞之一。伴星是一颗 70 倍太阳质量的 O 型巨星。",
      "The most famous X-ray binary in M33, containing a 15.65 M☉ stellar-mass black hole — one of the largest known. Its companion is a 70 M☉ O-type giant.",
    ],
  },
  {
    id: "m33-var83",
    galaxyId: "triangulum",
    name: "VAR 83",
    zh: "三角座 Var 83",
    color: "#b8d8ff",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [8, -2.4, -5],
    briefing: [
      "三角座星系中最亮的恒星之一，光度超过太阳的 200 万倍。是目前已知最亮的恒星之一，质量约 60-90 倍太阳。",
      "One of the most luminous stars in M33, exceeding 2 million L☉. Among the most luminous stars known, ~60-90 M☉.",
    ],
  },
  {
    id: "m33-varb",
    galaxyId: "triangulum",
    name: "VAR B",
    zh: "三角座 Var B",
    color: "#c0e0ff",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [6, 3.8, 7],
    briefing: [
      "三角座星系中第二颗著名的高光度蓝变星，与 Var 83 和 Var C 共同构成 M33 中最引人注目的恒星群。",
      "The second famous LBV in M33, forming a remarkable trio with Var 83 and Var C.",
    ],
  },
  {
    id: "m33-varc",
    galaxyId: "triangulum",
    name: "VAR C",
    zh: "三角座 Var C",
    color: "#b0d0ff",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [4, -1.5, 9],
    briefing: [
      "三角座星系中第三颗高光度蓝变星，Var 83/Var B/Var C 三颗超亮恒星使 M33 成为研究大质量恒星演化的关键目标。",
      "The third LBV in M33. These three hyper-luminous stars make M33 a key target for massive star evolution studies.",
    ],
  },
  {
    id: "m33-n604",
    galaxyId: "triangulum",
    name: "NGC 604",
    zh: "NGC 604 恒星形成区",
    color: "#ff9ad5",
    type: "巨星形成区",
    subtype: "cluster",
    pos: [12, 0.5, 4],
    briefing: [
      "本星系群中最大的恒星形成区之一，直径约 1500 光年，包含 200 多颗 O 型和 Wolf-Rayet 星——亮度是整个猎户座星云的 6300 倍。",
      "One of the largest HII regions in the Local Group, ~1500 ly across, containing 200+ O and Wolf-Rayet stars — 6300× brighter than the Orion Nebula.",
    ],
  },
  {
    id: "m33-nuc",
    galaxyId: "triangulum",
    name: "M33 NUCLEAR CLUSTER",
    zh: "M33 核心星团",
    color: "#ffe0b0",
    type: "核心星团",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "三角座星系的核心不含超大质量黑洞（与银河系和仙女座不同），但有一个致密的恒星核心星团，这在旋涡星系中非常罕见。",
      "M33's core lacks a supermassive black hole (unlike Milky Way & Andromeda), instead hosting a dense stellar nucleus — rare among spiral galaxies.",
    ],
  },
];

/* ============================================================
 *  LARGE MAGELLANIC CLOUD (LMC) — 163,000 light-years
 *  The largest satellite of the Milky Way.
 *  Home to the most massive known stars.
 * ============================================================ */

export const LMC_STARS: GalaxyInteriorStar[] = [
  {
    id: "lmc-r136a1",
    galaxyId: "lmc",
    name: "R136a1",
    zh: "R136a1 · 最重恒星",
    color: "#90c0ff",
    type: "WN5h 沃尔夫-拉叶星",
    subtype: "WN",
    pos: [3, 0.8, 2],
    briefing: [
      "已知宇宙中质量最大、光度最高（约 720 万倍太阳）的恒星。质量估计随方法不同：2022 年 Gemini 散斑成像给 150-230 M☉，2025 年最新模型给 291±46 M☉。位于蜘蛛星云 R136 星团核心，正以 2600 km/s 的星风每年流失 1.6×10⁻⁴ M☉——是恒星质量上限的活体检验场。",
      "The most massive and most luminous star known (~7.2 million L☉). Mass estimates vary by method: 150-230 M☉ from 2022 Gemini speckle imaging, 291±46 M☉ from 2025 modelling. At the heart of the R136 cluster in the Tarantula Nebula, its 2,600 km/s wind sheds 1.6×10⁻⁴ M☉ per year — a living test of the stellar mass limit.",
    ],
  },
  {
    id: "lmc-r136a2",
    galaxyId: "lmc",
    name: "R136a2",
    zh: "R136a2",
    color: "#88b8ff",
    type: "WN5h 沃尔夫-拉叶星",
    subtype: "WN",
    pos: [2.8, 0.6, 1.8],
    briefing: [
      "R136 星团中第二亮的恒星，质量约 195 倍太阳，光度约 560 万倍太阳。与 R136a1 共同构成宇宙中最极端的恒星群。",
      "The second most massive star in R136, ~195 M☉, ~5.6 million L☉. Together with R136a1, forms the most extreme stellar ensemble known.",
    ],
  },
  {
    id: "lmc-s-dor",
    galaxyId: "lmc",
    name: "S DORADUS",
    zh: "剑鱼座 S",
    color: "#ffe0a0",
    type: "高光度蓝变星原型",
    subtype: "LBV",
    pos: [5, 2.2, -3],
    briefing: [
      "高光度蓝变星（LBV）的原型星——整个恒星类别都以它命名。亮度变化幅度可达 1-2 个星等，是研究大质量恒星晚期演化的关键天体。",
      "The prototype of the Luminous Blue Variable class — the entire category is named after it. Its brightness varies by 1-2 magnitudes, key to studying late-stage massive star evolution.",
    ],
  },
  {
    id: "lmc-wohg64",
    galaxyId: "lmc",
    name: "WOH G64",
    zh: "WOH G64 · 红超巨星",
    color: "#ff7040",
    type: "红超巨星",
    subtype: "RSG",
    pos: [7, -1.5, 4],
    briefing: [
      "已知最大的恒星之一，半径约 1540 倍太阳半径——如果放在太阳的位置，将延伸到土星轨道。目前正在经历剧烈的物质抛射，可能即将爆发为超新星。",
      "One of the largest known stars, ~1540 R☉ — would extend past Saturn's orbit if placed at the Sun. Currently undergoing violent mass loss, nearing supernova.",
    ],
  },
  {
    id: "lmc-sn1987a",
    galaxyId: "lmc",
    name: "SN 1987A",
    zh: "超新星 1987A",
    color: "#ff50a0",
    type: "超新星遗迹",
    subtype: "SNR",
    pos: [4, -2.8, 6],
    briefing: [
      "1987 年 2 月 23 日爆发的超新星——现代天文学中最重要的事件之一。这颗超新星在 383 年来首次肉眼可见，产生了壮观的环状遗迹，至今仍在被 JWST 和哈勃持续观测。",
      "The supernova that erupted on Feb 23, 1987 — one of the most important events in modern astronomy. First naked-eye supernova in 383 years. Its spectacular ring system is still monitored by JWST and Hubble.",
    ],
  },
  {
    id: "lmc-r136",
    galaxyId: "lmc",
    name: "R136 CLUSTER",
    zh: "R136 星团 · 蜘蛛星云",
    color: "#ff9ad5",
    type: "超星团",
    subtype: "cluster",
    pos: [3.2, 0.4, 2.2],
    briefing: [
      "蜘蛛星云核心的超星团——包含多颗已知最重恒星（R136a1, a2, a3）。星团年龄仅 1-2 百万年，是研究极端恒星形成的最佳场所。",
      "The super star cluster at the Tarantula Nebula's core — contains the most massive known stars. Only 1-2 million years old, the best laboratory for extreme star formation.",
    ],
  },
  {
    id: "lmc-hd269810",
    galaxyId: "lmc",
    name: "HD 269810",
    zh: "HD 269810",
    color: "#a0d0ff",
    type: "O2III 巨星",
    subtype: "O",
    pos: [6, 3.5, 1],
    briefing: [
      "已知质量最大的 O 型恒星之一，光谱型 O2III(f*)，质量约 130 倍太阳，温度超过 52000 K。是研究恒星风和质量损失的理想对象。",
      "One of the most massive O-type stars known, spectral type O2III(f*), ~130 M☉, temperature >52000 K. Ideal for studying stellar winds and mass loss.",
    ],
  },
  {
    id: "lmc-r71",
    galaxyId: "lmc",
    name: "R71",
    zh: "R71 蓝变星",
    color: "#ffe8b0",
    type: "高光度蓝变星",
    subtype: "LBV",
    pos: [8, -0.5, 5],
    briefing: [
      "大麦哲伦云中另一颗重要高光度蓝变星，曾经历显著的光度变化和物质抛射事件，是研究 LBV 爆发机制的典型天体。",
      "Another important LBV in the LMC, having undergone notable brightness changes and mass ejections. A classic case for studying LBV eruption mechanisms.",
    ],
  },
  {
    id: "lmc-x1",
    galaxyId: "lmc",
    name: "LMC X-1",
    zh: "LMC X-1 黑洞双星",
    color: "#8090ff",
    type: "黑洞 X 射线双星",
    subtype: "BH",
    pos: [-6, 1.5, 7],
    briefing: [
      "1969 年探空火箭探测到的 LMC 第一个 X 射线源——一个 10.91±1.41 M☉ 的恒星黑洞，正通过星风吸积一颗 O8 IIIf 蓝巨星（star 32，31.79 M☉）的物质，每 3.909 天互绕一周。黑洞电离的恒星风在周围造就了唯一被观测到的弓形激波星云。",
      "The first X-ray source detected in the LMC (1969) — a 10.91±1.41 M☉ stellar black hole accreting the wind of an O8 IIIf giant (star 32, 31.79 M☉) every 3.909 days. Its X-ray-ionized wind has carved the only observed bow-shock nebula around an X-ray binary.",
    ],
  },
  {
    id: "lmc-x3",
    galaxyId: "lmc",
    name: "LMC X-3",
    zh: "LMC X-3 黑洞双星",
    color: "#7080d8",
    type: "黑洞 X 射线双星",
    subtype: "BH",
    pos: [-8, -2.2, -4],
    briefing: [
      "1971 年 Uhuru 卫星发现、1983 年被确认为黑洞的 X 射线双星——6.98±0.56 M☉ 黑洞每 1.705 天绕行一颗 B2.5Ve 主序星（3.63 M☉）。作为最早确认的黑洞之一，它至今仍是检验吸积盘模型与黑洞自旋测量的标杆系统。",
      "Discovered by Uhuru in 1971 and confirmed as a black hole in 1983 — a 6.98±0.56 M☉ black hole circling a 3.63 M☉ B2.5Ve star every 1.705 days. One of the first confirmed black holes, still a benchmark for accretion-disk models and spin measurements.",
    ],
  },
];

/* ============================================================
 *  SMALL MAGELLANIC CLOUD (SMC) — 200,000 light-years
 *  The second-largest Milky Way satellite.
 *  Lower metallicity → different stellar evolution.
 * ============================================================ */

export const SMC_STARS: GalaxyInteriorStar[] = [
  {
    id: "smc-ngc346",
    galaxyId: "smc",
    name: "NGC 346",
    zh: "NGC 346 恒星形成区",
    color: "#ff80c0",
    type: "巨星形成区",
    subtype: "cluster",
    pos: [2, 0.5, 1],
    briefing: [
      "小麦哲伦云中最大的恒星形成区，也是 JWST 的重点观测目标。由于 SMC 金属丰度极低（类似早期宇宙），这里的恒星形成环境与 100 亿年前相似。",
      "The largest star-forming region in the SMC and a prime JWST target. SMC's extremely low metallicity mimics early-universe conditions ~10 billion years ago.",
    ],
  },
  {
    id: "smc-hd5980",
    galaxyId: "smc",
    name: "HD 5980",
    zh: "HD 5980 双星",
    color: "#b0d8ff",
    type: "高光度蓝变双星",
    subtype: "LBV",
    pos: [3.5, -1.2, -2],
    briefing: [
      "小麦哲伦云最亮的恒星——一个极端的三体系统：61 M☉ 的 LBV/WN 星与 66 M☉ 的 WN4 星在 19.266 天高偏心轨道上碰撞星风，更远处一颗 34 M☉ 的 O 型星以 96.56 天绕行。1993-1994 年主星曾发生 LBV 式剧烈爆发。",
      "The brightest star of the SMC — an extreme triple: a 61 M☉ LBV/WN star and a 66 M☉ WN4 star collide winds on a 19.27-day eccentric orbit, with a 34 M☉ O star orbiting every 96.56 days. The primary underwent a dramatic LBV-style eruption in 1993-94.",
    ],
  },
  {
    id: "smc-sk67",
    galaxyId: "smc",
    name: "SK-67°266",
    zh: "SK-67°266",
    color: "#90c0ff",
    type: "WN4 沃尔夫-拉叶星",
    subtype: "WR",
    pos: [4, 1.8, 3],
    briefing: [
      "小麦哲伦云中一颗 Wolf-Rayet 星，由于 SMC 低金属丰度，其恒星风特性与银河系 WR 星有显著差异，对理解质量损失机制至关重要。",
      "A Wolf-Rayet star in the SMC. Due to the SMC's low metallicity, its wind properties differ markedly from Milky Way WR stars — crucial for understanding mass-loss mechanisms.",
    ],
  },
  {
    id: "smc-x1",
    galaxyId: "smc",
    name: "SMC X-1",
    zh: "SMC X-1 脉冲星",
    color: "#80a0ff",
    type: "X 射线脉冲双星",
    subtype: "BH",
    pos: [1, -2.5, 4],
    briefing: [
      "小麦哲伦云中一颗明亮的 X 射线脉冲星，中子星以 0.71 秒周期自转，从伴星吸积物质。是研究双星演化和致密天体的重要目标。",
      "A bright X-ray pulsar in the SMC — a neutron star spinning at 0.71 s, accreting from a companion. A key target for studying binary evolution and compact objects.",
    ],
  },
  {
    id: "smc-n602",
    galaxyId: "smc",
    name: "NGC 602",
    zh: "NGC 602 星团",
    color: "#ff90d0",
    type: "年轻星团",
    subtype: "cluster",
    pos: [5, 0.2, -1],
    briefing: [
      "小麦哲伦云外围一个壮观的年轻星团，位于一个巨大的气体和尘埃空腔边缘。哈勃和 JWST 都拍摄了它的标志性照片。",
      "A spectacular young cluster at the edge of the SMC, sitting at the rim of a giant gas-and-dust cavity. Both Hubble and JWST have captured iconic images of it.",
    ],
  },
];

/* ============================================================
 *  OTHER GALAXIES — IC 10, NGC 6822, etc.
 *  Fewer individually resolved stars, but notable objects.
 * ============================================================ */

export const IC10_STARS: GalaxyInteriorStar[] = [
  {
    id: "ic10-x1",
    galaxyId: "ic10",
    name: "IC 10 X-1",
    zh: "IC 10 X-1",
    color: "#80a0ff",
    type: "黑洞双星",
    subtype: "BH",
    pos: [1, 0.3, 0.5],
    briefing: [
      "IC 10 星系中一个恒星质量黑洞双星系统，黑洞质量约 23-33 倍太阳质量，伴星是一颗 Wolf-Rayet 星。是研究黑洞形成的重要目标。",
      "A stellar-mass black hole binary in IC 10, ~23-33 M☉ black hole with a Wolf-Rayet companion. Important for studying black hole formation.",
    ],
  },
  {
    id: "ic10-wr",
    galaxyId: "ic10",
    name: "IC 10 WR CLUSTER",
    zh: "IC 10 WR 星群",
    color: "#90c0ff",
    type: "Wolf-Rayet 星群",
    subtype: "WN",
    pos: [0.5, -0.8, 1.2],
    briefing: [
      "IC 10 拥有本星系群中密度最高的 Wolf-Rayet 星群——这个小星系中 WR 星的数量惊人，表明它正经历一场强烈的恒星形成爆发。",
      "IC 10 has the highest density of Wolf-Rayet stars in the Local Group — an astounding number for such a small galaxy, indicating a vigorous starburst.",
    ],
  },
];

export const NGC6822_STARS: GalaxyInteriorStar[] = [
  {
    id: "n6822-hv",
    galaxyId: "ngc6822",
    name: "HUBBLE-V",
    zh: "哈勃 V 星云",
    color: "#ff80c0",
    type: "巨星形成区",
    subtype: "cluster",
    pos: [1.5, 0.4, 0.8],
    briefing: [
      "巴纳德星系（NGC 6822）中最大的 HII 区之一，直径约 200 光年。哈勃太空望远镜由此得名观测了该星系。",
      "One of the largest HII regions in Barnard's Galaxy (NGC 6822), ~200 ly across. Named after Hubble's observations of this galaxy.",
    ],
  },
  {
    id: "n6822-hx",
    galaxyId: "ngc6822",
    name: "HUBBLE-X",
    zh: "哈勃 X 星云",
    color: "#ff90d0",
    type: "巨星形成区",
    subtype: "cluster",
    pos: [2, -0.6, 1.5],
    briefing: [
      "巴纳德星系中另一个巨大的恒星形成区，与 Hubble-V 相邻。这个不规则矮星系是研究低金属丰度环境下恒星形成的理想目标。",
      "Another giant HII region in Barnard's Galaxy, adjacent to Hubble-V. This irregular dwarf is an ideal target for studying low-metallicity star formation.",
    ],
  },
];

/* ============================================================
 *  EXOPLANETS IN OTHER GALAXIES
 *  Very few confirmed — mostly microlensing candidates.
 *  PA-99-N2 is the most credible extragalactic planet candidate.
 * ============================================================ */

export const ANDROMEDA_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "pa99n2-b",
    galaxyId: "andromeda",
    parentStarId: "m31-pa99",
    name: "PA-99-N2 b",
    zh: "PA-99-N2 b 行星候选",
    color: "#9fb7d0",
    type: ["气态巨行星（候选）", "Gas Giant (candidate)"],
    radius: 0.08,
    orbit: 0.7,
    speed: 0.6,
    phase: 0.3,
    briefing: [
      "迄今唯一被编目的河外星系系外行星候选——质量约 6.34 倍木星质量，围绕 M31 盘内一颗红矮星透镜星运行。1999 年 POINT-AGAPE 像元微引力透镜事件 PA-99-N2 的光变异常于 2009 年由 Ingrosso 等给出行星解释。若最终确认，它将是人类发现的第一颗银河系外行星。",
      "The only catalogued extragalactic exoplanet candidate — ~6.34 Jupiter masses around an M31 disc M-dwarf lens star. The 1999 POINT-AGAPE pixel-lensing event's anomaly was explained as a planet by Ingrosso et al. (2009). If confirmed, it would be the first planet ever found beyond the Milky Way.",
    ],
    data: [
      ["质量", "6.34 MJ", "Mass", "6.34 MJ"],
      ["发现方法", "微引力透镜", "Method", "Microlensing"],
      ["事件年份", "1999", "Event", "1999"],
      ["状态", "候选待确认", "Status", "Unconfirmed"],
    ],
  },
  {
    id: "m31-n0812a-donor",
    galaxyId: "andromeda",
    parentStarId: "m31-n0812a",
    name: "12a DONOR STAR",
    zh: "2008-12a 供星",
    color: "#ff9050",
    type: ["红巨星供星", "Red giant donor"],
    radius: 0.11,
    orbit: 0.6,
    speed: 0.7,
    phase: 1.2,
    briefing: [
      "M31N 2008-12a 中向白矮星输送物质的供星——HST 观测约束其光度约 103 倍太阳、半径 14.1 R☉、温度约 4890 K，性质介于红巨星与红团簇星之间。正是这颗星每年喂给白矮星足够物质，触发每年一次的新星爆发。",
      "The donor feeding the white dwarf in M31N 2008-12a — HST constraints: ~103 L☉, 14.1 R☉, Teff ~4890 K, nature between a red giant and red clump star. It supplies the material that triggers the nova's annual eruptions.",
    ],
    data: [
      ["光度", "103 L☉", "Luminosity", "103 L☉"],
      ["半径", "14.1 R☉", "Radius", "14.1 R☉"],
      ["温度", "4890 K", "Temp", "4890 K"],
      ["爆发复现", "0.996 年", "Recurrence", "0.996 yr"],
    ],
  },
  {
    id: "m31-xmmu-comp",
    galaxyId: "andromeda",
    parentStarId: "m31-xmmu",
    name: "J004243 COMPANION",
    zh: "微类星体伴星",
    color: "#c0d0ff",
    type: ["低质量伴星", "Low-mass companion"],
    radius: 0.06,
    orbit: 0.55,
    speed: 0.8,
    phase: 2.4,
    briefing: [
      "微类星体 XMMU J004243.6+412519 中围绕约 10 M☉ 恒星黑洞运行的低质量伴星。它剥离的物质落入黑洞形成吸积盘，产生接近爱丁顿极限的 X 射线辐射和相对论性射电喷流。",
      "The low-mass companion orbiting the ~10 M☉ black hole in microquasar XMMU J004243.6+412519. Its stripped matter feeds an accretion disk shining near the Eddington limit, powering relativistic radio jets.",
    ],
    data: [
      ["黑洞质量", "~10 M☉", "BH mass", "~10 M☉"],
      ["喷流", "相对论性射电", "Jets", "Relativistic radio"],
      ["发现", "XMM-Newton 2012", "Found", "XMM-Newton 2012"],
    ],
  },
  {
    id: "m31-g1-imbh",
    galaxyId: "andromeda",
    parentStarId: "m31-g1",
    name: "G1 IMBH CANDIDATE",
    zh: "G1 中等质量黑洞",
    color: "#603070",
    type: ["中等质量黑洞候选", "IMBH candidate"],
    radius: 0.07,
    orbit: 0.5,
    speed: 0.45,
    phase: 0.8,
    briefing: [
      "G1 球状星团中心约 2 万倍太阳质量的中等质量黑洞候选（仍有争议）——介于恒星黑洞与超大质量黑洞之间。若确认，将填补黑洞质量谱中最大的空缺，支持『球状星团中心黑洞是超大质量黑洞种子』的假说。",
      "A ~20,000 M☉ intermediate-mass black hole candidate (disputed) at G1's center — between stellar and supermassive scales. If confirmed it would fill the largest gap in the black-hole mass spectrum, supporting the idea that globular-cluster IMBHs seed supermassive black holes.",
    ],
    data: [
      ["质量", "~2×10⁴ M☉", "Mass", "~2×10⁴ M☉"],
      ["证据", "HST 恒星运动学", "Evidence", "HST kinematics"],
      ["状态", "候选（有争议）", "Status", "Disputed"],
    ],
  },
];

export const TRIANGULUM_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "m33-x7-giant",
    galaxyId: "triangulum",
    parentStarId: "m33-x7",
    name: "M33 X-7 O7 GIANT",
    zh: "X-7 蓝巨星伴星",
    color: "#a0c8ff",
    type: ["O7-8III 蓝巨星", "O7-8III blue giant"],
    radius: 0.16,
    orbit: 0.8,
    speed: 2.2,
    phase: 0.5,
    briefing: [
      "围绕 M33 X-7 黑洞运行的 O7-8III 蓝巨星——实测质量 70±6.9 M☉，温度约 35000 K，是已知黑洞双星中最重的伴星。它与 15.65 M☉ 黑洞每 3.453 天互绕一周并发生掩食，轨道倾角 74.6°。黑洞前身星约 100 M☉，未来或将演化为双黑洞系统。",
      "The O7-8III blue giant orbiting the M33 X-7 black hole — measured at 70±6.9 M☉ and ~35,000 K, the most massive companion in any known BH binary. It circles the 15.65 M☉ black hole every 3.453 days with eclipses at i=74.6°. The ~100 M☉ progenitor may one day make this a double black hole system.",
    ],
    data: [
      ["质量", "70 ± 6.9 M☉", "Mass", "70 ± 6.9 M☉"],
      ["轨道周期", "3.453 天", "Period", "3.453 d"],
      ["系统总质量", "~85.7 M☉", "Total", "~85.7 M☉"],
      ["发现", "2007 · Nature", "Found", "2007 · Nature"],
    ],
  },
];

/* ============================================================
 *  LARGE MAGELLANIC CLOUD PLANETS
 * ============================================================ */

export const LMC_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "lmc-x1-giant",
    galaxyId: "lmc",
    parentStarId: "lmc-x1",
    name: "LMC X-1 STAR 32",
    zh: "X-1 O 型巨星",
    color: "#a8c8ff",
    type: ["O8 IIIf 蓝巨星", "O8 IIIf blue giant"],
    radius: 0.13,
    orbit: 0.75,
    speed: 2,
    phase: 1.1,
    briefing: [
      "LMC X-1 中被黑洞撕裂物质的 O8 IIIf 蓝巨星（编号 star 32）——实测质量 31.79±3.48 M☉、半径 17 R☉，几乎充满洛希瓣。它与 10.91 M☉ 黑洞每 3.909 天互绕一周。黑洞的 X 射线电离恒星风，在周围造就了唯一被观测到的弓形激波星云。",
      "The O8 IIIf giant (star 32) feeding the black hole in LMC X-1 — measured at 31.79±3.48 M☉ and 17 R☉, nearly filling its Roche lobe. It orbits the 10.91 M☉ black hole every 3.909 days; the BH's X-rays have carved a unique bow-shock nebula around the system.",
    ],
    data: [
      ["黑洞质量", "10.91 ± 1.41 M☉", "BH mass", "10.91 ± 1.41 M☉"],
      ["伴星质量", "31.79 ± 3.48 M☉", "Companion", "31.79 ± 3.48 M☉"],
      ["轨道周期", "3.909 天", "Period", "3.909 d"],
      ["发现", "1969 · 探空火箭", "Found", "1969 · rocket"],
    ],
  },
  {
    id: "lmc-x3-star",
    galaxyId: "lmc",
    parentStarId: "lmc-x3",
    name: "LMC X-3 B-STAR",
    zh: "X-3 B 型伴星",
    color: "#b0d8ff",
    type: ["B2.5Ve 主序星", "B2.5Ve main-sequence"],
    radius: 0.06,
    orbit: 0.5,
    speed: 2.6,
    phase: 2.7,
    briefing: [
      "LMC X-3 中通过洛希瓣溢流供养吸积盘的 B2.5Ve 主序星——实测质量 3.63±0.57 M☉，与 6.98 M☉ 黑洞每 1.705 天互绕一周。该系统 1983 年被确认为黑洞，是最早确认的黑洞之一，至今仍是检验吸积盘模型与黑洞自旋的标杆。",
      "The B2.5Ve star in LMC X-3 feeding the accretion disk via Roche-lobe overflow — measured at 3.63±0.57 M☉, orbiting the 6.98 M☉ black hole every 1.705 days. Confirmed as a black hole in 1983, it remains a benchmark for accretion-disk and spin studies.",
    ],
    data: [
      ["黑洞质量", "6.98 ± 0.56 M☉", "BH mass", "6.98 ± 0.56 M☉"],
      ["伴星质量", "3.63 ± 0.57 M☉", "Companion", "3.63 ± 0.57 M☉"],
      ["轨道周期", "1.705 天", "Period", "1.705 d"],
      ["确认黑洞", "1983", "BH confirmed", "1983"],
    ],
  },
  {
    id: "lmc-r136a1-hsh",
    galaxyId: "lmc",
    parentStarId: "lmc-r136a1",
    name: "HSH95-17",
    zh: "R136a1 可能伴星",
    color: "#c0b0ff",
    type: ["可能伴星（候选）", "Possible companion"],
    radius: 0.09,
    orbit: 0.85,
    speed: 0.5,
    phase: 0.7,
    briefing: [
      "2022 年 Gemini South 散斑成像在 R136a1 旁分辨出的可能伴星 HSH95-17——约有 25% 的概率只是视线方向巧合，光谱中也未观测到多普勒摆动，故尚未确认。这是已知最重恒星身边唯一的候选伴星。",
      "A possible companion HSH95-17 resolved beside R136a1 by Gemini South speckle imaging in 2022 — there is a ~25% chance it is a chance alignment, and no Doppler wobble is seen in spectra, so it remains unconfirmed. The only candidate companion to the most massive star known.",
    ],
    data: [
      ["发现", "2022 · Gemini Zorro", "Found", "2022 · Gemini Zorro"],
      ["视线巧合概率", "~25%", "Alignment odds", "~25%"],
      ["状态", "未确认", "Status", "Unconfirmed"],
    ],
  },
  {
    id: "lmc-sn1987a-ns",
    galaxyId: "lmc",
    parentStarId: "lmc-sn1987a",
    name: "SN 1987A NEUTRON STAR",
    zh: "1987A 中子星遗迹",
    color: "#e0f0ff",
    type: ["中子星（遗迹）", "Neutron star remnant"],
    radius: 0.05,
    orbit: 0.42,
    speed: 3,
    phase: 1.6,
    briefing: [
      "SN 1987A 爆发后残留的中子星——爆发时探测到的 25 颗中微子宣告了它的诞生（中微子天文学的开端）。2019-2024 年 JWST 在遗迹中心探测到电离氩线，为这颗隐匿 30 余年的中子星提供了迄今最强的观测证据。它位于三环星云的中心。",
      "The neutron star left behind by SN 1987A — its birth announced by 25 detected neutrinos at detonation, opening neutrino astronomy. JWST detection of ionized argon lines at the remnant's center (2019-2024) provides the strongest evidence yet for this star hiding for over 30 years, at the heart of the triple-ring nebula.",
    ],
    data: [
      ["诞生信号", "25 颗中微子", "Birth sign", "25 neutrinos"],
      ["证据", "JWST 电离氩线", "Evidence", "JWST Ar+ lines"],
      ["位置", "三环星云中心", "Location", "Triple-ring center"],
    ],
  },
];

/* ============================================================
 *  SMALL MAGELLANIC CLOUD PLANETS
 * ============================================================ */

export const SMC_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "smc-x1-sk160",
    galaxyId: "smc",
    parentStarId: "smc-x1",
    name: "SMC X-1 SK 160",
    zh: "X-1 超巨星伴星",
    color: "#a8c0ff",
    type: ["B0 Ia 超巨星", "B0 Ia supergiant"],
    radius: 0.14,
    orbit: 0.75,
    speed: 2.1,
    phase: 0.3,
    briefing: [
      "SMC X-1 中每 3.89 天被 0.71 秒自转的中子星掩食一次的 B0 Ia 超巨星 Sk 160（约 17 M☉）。它的洛希瓣溢流供养中子星的吸积盘，轨道正以可测速率衰减——是验证中子星质量与轨道演化的教科书级系统。1971 年 Uhuru 卫星发现 SMC X-1，这是人类探测到的第一个河外 X 射线源。",
      "The B0 Ia supergiant Sk 160 (~17 M☉) in SMC X-1, eclipsed by the 0.71-s pulsar every 3.89 days. Its Roche-lobe overflow feeds the neutron star, and the orbit is measurably decaying — a textbook system for neutron-star masses and orbital evolution. Discovered by Uhuru in 1971 as the first X-ray source ever detected beyond the Milky Way.",
    ],
    data: [
      ["中子星", "1.06 M☉ · 0.71s", "NS", "1.06 M☉ · 0.71s"],
      ["伴星", "Sk 160 · ~17 M☉", "Companion", "Sk 160 · ~17 M☉"],
      ["轨道周期", "3.89 天", "Period", "3.89 d"],
      ["历史", "首个河外 X 射线源", "Record", "1st extragalactic X-ray"],
    ],
  },
  {
    id: "hd5980-b",
    galaxyId: "smc",
    parentStarId: "smc-hd5980",
    name: "HD 5980 B",
    zh: "HD 5980 B",
    color: "#b0d0ff",
    type: ["WN4 沃夫-拉叶星", "WN4 Wolf-Rayet"],
    radius: 0.1,
    orbit: 0.8,
    speed: 1.5,
    phase: 1.9,
    briefing: [
      "HD 5980 三体系统中最重的子星 B——WN4 型沃尔夫-拉叶星，实测质量 66 M☉。它与 61 M☉ 的 LBV/WN 主星 A 在 19.266 天的高偏心轨道（e=0.27）上碰撞星风，产生剧烈的 X 射线与亮度变化。",
      "Component B of the HD 5980 triple — a WN4 Wolf-Rayet star at a measured 66 M☉. It collides winds with the 61 M☉ LBV/WN primary on a 19.27-day eccentric orbit (e=0.27), producing violent X-rays and brightness swings.",
    ],
    data: [
      ["质量", "66 M☉", "Mass", "66 M☉"],
      ["轨道周期", "19.266 天", "Period", "19.266 d"],
      ["偏心率", "0.27", "Eccentricity", "0.27"],
      ["光谱型", "WN4", "Type", "WN4"],
    ],
  },
  {
    id: "hd5980-c",
    galaxyId: "smc",
    parentStarId: "smc-hd5980",
    name: "HD 5980 C",
    zh: "HD 5980 C",
    color: "#c0d8ff",
    type: ["O 型星（外圈）", "O-type star (outer)"],
    radius: 0.08,
    orbit: 1.15,
    speed: 0.5,
    phase: 4.2,
    briefing: [
      "HD 5980 三体系统的第三体 C——一颗 34 M☉ 的 O 型星，在更远的 96.56 天高偏心轨道（e=0.815）上绕 AB 双星运转。三星共舞使 HD 5980 成为已知最极端的相互作用恒星系统之一，V 星等在 8.8-11.9 之间剧变。",
      "The third member C of HD 5980 — a 34 M☉ O-type star circling the AB pair on a wider, highly eccentric 96.56-day orbit (e=0.815). The triple dance makes HD 5980 one of the most extreme interacting systems known, with V magnitude raging between 8.8 and 11.9.",
    ],
    data: [
      ["质量", "34 M☉", "Mass", "34 M☉"],
      ["轨道周期", "96.56 天", "Period", "96.56 d"],
      ["偏心率", "0.815", "Eccentricity", "0.815"],
      ["系统", "三体系统", "System", "Triple"],
    ],
  },
];

/* ============================================================
 *  IC 10 PLANETS
 * ============================================================ */

export const IC10_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "ic10-x1-wr",
    galaxyId: "ic10",
    parentStarId: "ic10-x1",
    name: "IC 10 X-1 WR STAR",
    zh: "X-1 沃夫-拉叶伴星",
    color: "#90a0ff",
    type: ["沃尔夫-拉叶星", "Wolf-Rayet star"],
    radius: 0.09,
    orbit: 0.7,
    speed: 2,
    phase: 1.5,
    briefing: [
      "IC 10 X-1 中围绕约 24-33 M☉ 黑洞运行的沃尔夫-拉叶伴星——两者每 34.4 小时互绕一周。2007 年该系统发表于 Nature，是当时已知质量最大的恒星黑洞之一，与 M33 X-7 一道改写了黑洞形成理论。IC 10 是本星系群中唯一的星暴矮星系，正批量制造大质量恒星与黑洞。",
      "The Wolf-Rayet companion orbiting the ~24-33 M☉ black hole in IC 10 X-1 every 34.4 hours. Published in Nature in 2007 as one of the most massive stellar black holes known — alongside M33 X-7 it reshaped black-hole formation theory. IC 10, the Local Group's only starburst dwarf, mass-produces massive stars and black holes.",
    ],
    data: [
      ["黑洞质量", "24-33 M☉", "BH mass", "24-33 M☉"],
      ["轨道周期", "34.4 小时", "Period", "34.4 h"],
      ["发表", "2007 · Nature", "Paper", "2007 · Nature"],
      ["宿主星系", "星暴矮星系", "Host", "Starburst dwarf"],
    ],
  },
];

/* ============================================================
 *  NGC 6822 PLANETS
 * ============================================================ */

/* NGC 6822: no individually recorded planets or orbital companions —
   honest empty set (Hubble Variable stars remain as viewable stars). */
export const NGC6822_PLANETS: GalaxyInteriorPlanet[] = [];

/* ============================================================
 *  GALAXY INTERIOR GENERATION CONFIG
 *  For galaxies without specific data, we generate procedural
 *  stars based on the galaxy's type and scale.
 * ============================================================ */

export interface GalaxyInteriorConfig {
  galaxyId: string;
  spiralArms: number; // 0 for irregular/elliptical
  armPitch: number; // radians
  armWidth: number;
  coreRadius: number;
  discRadius: number;
  coreColor: string;
  armColor: string;
  dustAmount: number;
  starCount: number; // procedural stars
}

export const GALAXY_INTERIOR_CONFIGS: Record<string, GalaxyInteriorConfig> = {
  andromeda: {
    galaxyId: "andromeda",
    spiralArms: 2,
    armPitch: 0.22,
    armWidth: 0.18,
    coreRadius: 3.5,
    discRadius: 32,
    coreColor: "#ffe8c0",
    armColor: "#bfd0ff",
    dustAmount: 0.7,
    starCount: 120,
  },
  triangulum: {
    galaxyId: "triangulum",
    spiralArms: 2,
    armPitch: 0.28,
    armWidth: 0.22,
    coreRadius: 2.2,
    discRadius: 18,
    coreColor: "#ffe0b0",
    armColor: "#c0d8ff",
    dustAmount: 0.4,
    starCount: 80,
  },
  lmc: {
    galaxyId: "lmc",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.5,
    discRadius: 14,
    coreColor: "#ffe8d0",
    armColor: "#d0e0ff",
    dustAmount: 0.5,
    starCount: 100,
  },
  smc: {
    galaxyId: "smc",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.0,
    discRadius: 8,
    coreColor: "#ffe8d0",
    armColor: "#d0e0ff",
    dustAmount: 0.3,
    starCount: 60,
  },
  ic10: {
    galaxyId: "ic10",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.8,
    discRadius: 6,
    coreColor: "#ffe8d0",
    armColor: "#d0e0ff",
    dustAmount: 0.4,
    starCount: 50,
  },
  ngc6822: {
    galaxyId: "ngc6822",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.6,
    discRadius: 5,
    coreColor: "#ffe8d0",
    armColor: "#d0e0ff",
    dustAmount: 0.2,
    starCount: 40,
  },
  m32: {
    galaxyId: "m32",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.2,
    discRadius: 6,
    coreColor: "#ffe8c0",
    armColor: "#f0e0c0",
    dustAmount: 0.1,
    starCount: 40,
  },
  m110: {
    galaxyId: "m110",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.0,
    discRadius: 7,
    coreColor: "#fff0d0",
    armColor: "#efe0c8",
    dustAmount: 0.2,
    starCount: 45,
  },
  "sagittarius-dwarf": {
    galaxyId: "sagittarius-dwarf",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.0,
    discRadius: 6,
    coreColor: "#ffe8d0",
    armColor: "#ffd8a0",
    dustAmount: 0.1,
    starCount: 35,
  },
  "sculptor-dwarf": {
    galaxyId: "sculptor-dwarf",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.8,
    discRadius: 5,
    coreColor: "#cfe4ff",
    armColor: "#d0e0ff",
    dustAmount: 0.05,
    starCount: 30,
  },
  "fornax-dwarf": {
    galaxyId: "fornax-dwarf",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.8,
    discRadius: 6,
    coreColor: "#d8d0ff",
    armColor: "#e0d8ff",
    dustAmount: 0.1,
    starCount: 35,
  },
  ngc185: {
    galaxyId: "ngc185",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.8,
    discRadius: 5,
    coreColor: "#ffe8c0",
    armColor: "#efe0c8",
    dustAmount: 0.2,
    starCount: 35,
  },
  ngc147: {
    galaxyId: "ngc147",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.8,
    discRadius: 5,
    coreColor: "#f0e8d8",
    armColor: "#e8e0d0",
    dustAmount: 0.05,
    starCount: 30,
  },
  ic1613: {
    galaxyId: "ic1613",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.7,
    discRadius: 5,
    coreColor: "#cfe8ff",
    armColor: "#d0e8ff",
    dustAmount: 0.02,
    starCount: 30,
  },
  "sextans-a": {
    galaxyId: "sextans-a",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.7,
    discRadius: 5,
    coreColor: "#bfe8ff",
    armColor: "#cfe8ff",
    dustAmount: 0.1,
    starCount: 30,
  },
  maffei1: {
    galaxyId: "maffei1",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 1.5,
    discRadius: 8,
    coreColor: "#ffd8a0",
    armColor: "#ffe0b0",
    dustAmount: 0.3,
    starCount: 50,
  },
  maffei2: {
    galaxyId: "maffei2",
    spiralArms: 2,
    armPitch: 0.25,
    armWidth: 0.2,
    coreRadius: 1.0,
    discRadius: 7,
    coreColor: "#ffe0b0",
    armColor: "#c0d8ff",
    dustAmount: 0.5,
    starCount: 45,
  },
  "leo-i": {
    galaxyId: "leo-i",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.5,
    discRadius: 4,
    coreColor: "#e8d8ff",
    armColor: "#d8d0ff",
    dustAmount: 0.02,
    starCount: 25,
  },
  "draco-dwarf": {
    galaxyId: "draco-dwarf",
    spiralArms: 0,
    armPitch: 0,
    armWidth: 0,
    coreRadius: 0.5,
    discRadius: 4,
    coreColor: "#d8d0ff",
    armColor: "#d0c8ff",
    dustAmount: 0.02,
    starCount: 25,
  },
};

/* ============================================================
 *  M32 (NGC 221) — Andromeda's compact dwarf elliptical
 *  Stripped-down former spiral, ancient metal-rich stars
 * ============================================================ */

export const M32_STARS: GalaxyInteriorStar[] = [
  {
    id: "m32-core",
    galaxyId: "m32",
    name: "M32 NUCLEUS",
    zh: "M32 核心",
    color: "#ffe8c0",
    type: "致密核心",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "M32 的致密星系核，恒星密度极高，中央含有一个约 250 万倍太阳质量的超大质量黑洞。M32 被认为是曾经更大的旋涡星系被仙女座剥离后的残余核心。",
      "M32's compact nucleus with extreme stellar density, hosting a ~2.5 million M☉ supermassive black hole. M32 is likely the stripped remnant core of a once-larger spiral galaxy.",
    ],
  },
  {
    id: "m32-c1",
    galaxyId: "m32",
    name: "M32 C1 CEPHEID",
    zh: "M32 造父变星 C1",
    color: "#ffe8a0",
    type: "造父变星",
    subtype: "Cepheid",
    pos: [1.2, 0.5, 0.8],
    briefing: [
      "M32 中已确认的造父变星之一，周期约 1.78 天。这些变星是测量 M32 距离和年龄的关键探针——哈勃太空望远镜已解析出其中的 RR Lyrae 和造父变星族群。",
      "One of the confirmed Cepheids in M32, period ~1.78 days. These variables are key probes of M32's distance and age — HST has resolved both RR Lyrae and Cepheid populations here.",
    ],
  },
];

/* ============================================================
 *  M110 (NGC 205) — Andromeda's dwarf elliptical
 *  Unusually young for a dE, with dust lanes and blue stars
 * ============================================================ */

export const M110_STARS: GalaxyInteriorStar[] = [
  {
    id: "m110-core",
    galaxyId: "m110",
    name: "M110 NUCLEUS",
    zh: "M110 核心",
    color: "#fff0d0",
    type: "矮椭星系核",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "M110 的核心区域包含异常年轻的蓝色恒星和尘埃带——这在矮椭星系中极为罕见。哈勃望远镜观测显示它仍保留着近期恒星形成的痕迹。",
      "M110's core region contains unusually young blue stars and dust lanes — extremely rare for a dwarf elliptical. Hubble observations reveal traces of recent star formation.",
    ],
  },
  {
    id: "m110-nova1999",
    galaxyId: "m110",
    name: "M110 NOVA 1999",
    zh: "M110 1999 年新星",
    color: "#ff6a4a",
    type: "经典新星",
    subtype: "Nova",
    pos: [1.5, -0.8, 2],
    briefing: [
      "1999 年由 R. Johnson 和 M. Modjaz 在 M110 中发现的经典新星，峰值亮度约 +18 等。这是 M110 中少数被独立记录的单颗恒星事件之一。",
      "A classical nova discovered in M110 in 1999 by R. Johnson & M. Modjaz, peaking at ~+18 magnitude. One of the few individually recorded stellar events in M110.",
    ],
  },
  {
    id: "m110-gc1",
    galaxyId: "m110",
    name: "M110 GC SYSTEM",
    zh: "M110 球状星团群",
    color: "#ffe8d0",
    type: "球状星团系统",
    subtype: "cluster",
    pos: [3, 1.5, 4],
    briefing: [
      "M110 拥有 8 个已确认的球状星团，质量约 1-10 万倍太阳质量，半光半径约 5-10 pc。它们因高内部密度而在仙女座的潮汐剥离中幸存。",
      "M110 hosts 8 confirmed globular clusters, ~10^4-10^5 M☉, half-light radii ~5-10 pc. They survive M31's tidal stripping thanks to high internal densities.",
    ],
  },
];

/* ============================================================
 *  SAGITTARIUS DWARF — Milky Way satellite being torn apart
 *  Core contains M54 globular cluster, the former nucleus
 * ============================================================ */

export const SAGITTARIUS_STARS: GalaxyInteriorStar[] = [
  {
    id: "sgr-m54",
    galaxyId: "sagittarius-dwarf",
    name: "M54 (NGC 6715)",
    zh: "M54 球状星团",
    color: "#ffe8d0",
    type: "核心球状星团",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "M54 —— 人马座矮星系的核心球状星团，含约 100 万颗恒星，至少 82 颗变星（55 颗 RR Lyrae）。它很可能是人马座矮星系原初星系的核星团，年龄约 130 亿年，几乎与宇宙同岁。",
      "M54 — the core globular cluster of the Sagittarius Dwarf, ~1 million stars, at least 82 variables (55 RR Lyrae). It is likely the former nuclear star cluster of the Sgr progenitor galaxy, ~13 Gyr old.",
    ],
  },
  {
    id: "sgr-terzan7",
    galaxyId: "sagittarius-dwarf",
    name: "TERZAN 7",
    zh: "Terzan 7 球状星团",
    color: "#ffe0b0",
    type: "球状星团",
    subtype: "cluster",
    pos: [2.5, 1.2, 1],
    briefing: [
      "Terzan 7 —— 与人马座矮星系关联的球状星团之一，相对年轻（约 80 亿年），金属丰度较高。它正随人马座星流一起被银河系引力撕裂。",
      "Terzan 7 — one of the globular clusters associated with Sgr dSph, relatively young (~8 Gyr) and metal-rich. It is being torn apart along with the Sagittarius Stream.",
    ],
  },
];

/* ============================================================
 *  SCULPTOR DWARF — ancient Milky Way satellite
 *  Purely old stellar population, cornerstone for RR Lyrae studies
 * ============================================================ */

export const SCULPTOR_STARS: GalaxyInteriorStar[] = [
  {
    id: "scl-vara",
    galaxyId: "sculptor-dwarf",
    name: "SCULPTOR VAR A",
    zh: "玉夫座变星 A",
    color: "#ffe8a0",
    type: "经典造父变星",
    subtype: "Cepheid",
    pos: [1.5, 0.5, 0.8],
    briefing: [
      "玉夫座矮星系中由 Harlow Shapley 发现的经典造父变星，周期约 6.5 天。这是第一批在银河系外被确认的造父变星之一，奠定了用变星测量星系距离的基础。",
      "A classical Cepheid discovered by Harlow Shapley in the Sculptor Dwarf, period ~6.5 days. One of the first Cepheids confirmed outside the Milky Way, foundational for variable-star distance measurements.",
    ],
  },
  {
    id: "scl-varb",
    galaxyId: "sculptor-dwarf",
    name: "SCULPTOR VAR B",
    zh: "玉夫座变星 B",
    color: "#ffd8a0",
    type: "经典造父变星",
    subtype: "Cepheid",
    pos: [1.8, -0.3, 1.2],
    briefing: [
      "玉夫座矮星系中第二颗经典造父变星，周期约 1.35 天。与 Var A 一起，它们证明玉夫座矮星系是一个独立的恒星系统而非银河系内的星团。",
      "The second classical Cepheid in the Sculptor Dwarf, period ~1.35 days. Together with Var A, they proved Sculptor is a separate stellar system, not a Galactic cluster.",
    ],
  },
  {
    id: "scl-mag29",
    galaxyId: "sculptor-dwarf",
    name: "MAG29 CARBON STAR",
    zh: "MAG29 碳星",
    color: "#ff7040",
    type: "碳星",
    subtype: "RSG",
    pos: [2.2, 0.8, -0.5],
    briefing: [
      "玉夫座矮星系中一颗明亮的碳星（AGB 星），编号 MAG29（Mauron 2004）。这类恒星处于生命末期，正在将重元素抛入星际空间。",
      "A bright carbon star (AGB) in the Sculptor Dwarf, catalogued as MAG29 (Mauron 2004). Such stars are in their final stages, ejecting heavy elements into interstellar space.",
    ],
  },
];

/* ============================================================
 *  FORNAX DWARF — Milky Way satellite with 6 globular clusters
 *  The most GC-rich dwarf spheroidal in the Local Group
 * ============================================================ */

export const FORNAX_STARS: GalaxyInteriorStar[] = [
  {
    id: "for-gc3",
    galaxyId: "fornax-dwarf",
    name: "FORNAX 3",
    zh: "天炉座 3 号星团",
    color: "#ffe8d0",
    type: "球状星团",
    subtype: "cluster",
    pos: [1.5, 0.5, 0.8],
    briefing: [
      "天炉座矮星系中最亮的球状星团之一。天炉座是本星系群中拥有球状星团最多的矮椭球星系——共有 6 个，包括最近重新发现的 Fornax 6。",
      "One of the brightest globular clusters in the Fornax Dwarf, which hosts the most GCs of any Local Group dwarf spheroidal — 6 in total, including the recently rediscovered Fornax 6.",
    ],
  },
  {
    id: "for-gc4",
    galaxyId: "fornax-dwarf",
    name: "FORNAX 4",
    zh: "天炉座 4 号星团",
    color: "#ffe0b0",
    type: "核星团候选",
    subtype: "cluster",
    pos: [0.3, 0.1, 0.2],
    briefing: [
      "Fornax 4 —— 位于天炉座矮星系中心附近，比其它星团更年轻、金属更丰富。它可能是天炉座矮星系的原初核星团。",
      "Fornax 4 — located near the galaxy center, younger and more metal-rich than the other GCs. It may be the original nuclear star cluster of the Fornax Dwarf.",
    ],
  },
];

/* ============================================================
 *  NGC 185 — Andromeda satellite, unusual dE with AGN
 *  Only known Seyfert galaxy in the Local Group
 * ============================================================ */

export const NGC185_STARS: GalaxyInteriorStar[] = [
  {
    id: "ngc185-nuc",
    galaxyId: "ngc185",
    name: "NGC 185 NUCLEUS",
    zh: "NGC 185 核心",
    color: "#ffe8c0",
    type: "活动星系核",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "NGC 185 的核心含有一个 2 型 Seyfert 活动星系核——这是本星系群中唯一已知的 Seyfert 星系。它也是距离我们最近的 Seyfert 星系，中心有一个活跃的超大质量黑洞。",
      "NGC 185's nucleus hosts a Type 2 Seyfert AGN — the only known Seyfert in the Local Group and the closest Seyfert to Earth. An active supermassive black hole lurks at its center.",
    ],
  },
  {
    id: "ngc185-snr",
    galaxyId: "ngc185",
    name: "NGC 185 SNR",
    zh: "NGC 185 超新星遗迹",
    color: "#ff50a0",
    type: "超新星遗迹",
    subtype: "SNR",
    pos: [0.8, -0.5, 0.3],
    briefing: [
      "NGC 185 中心附近的超新星遗迹，与弥漫的弧形发射星云相关联。这个遗迹是 NGC 185 近期恒星形成活动的证据——在矮椭星系中极为罕见。",
      "A supernova remnant near NGC 185's center, associated with a diffuse arc-like nebula. Evidence of recent star formation in this dwarf elliptical — extremely rare for its type.",
    ],
  },
];

/* ============================================================
 *  NGC 147 — Andromeda satellite, quiet ancient dE
 *  Star formation ceased much earlier than its twin NGC 185
 * ============================================================ */

export const NGC147_STARS: GalaxyInteriorStar[] = [
  {
    id: "ngc147-nuc",
    galaxyId: "ngc147",
    name: "NGC 147 NUCLEUS",
    zh: "NGC 147 核心",
    color: "#f0e8d8",
    type: "古老恒星核",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "NGC 147 的核心——与它的孪生星系 NGC 185 截然不同，NGC 147 的恒星形成在数十亿年前就已停止。它是一颗安静、古老的矮椭星系，没有气体、尘埃或年轻恒星。",
      "NGC 147's nucleus — unlike its twin NGC 185, star formation here ceased billions of years ago. A quiet, ancient dwarf elliptical with no gas, dust, or young stars.",
    ],
  },
];

/* ============================================================
 *  IC 1613 — isolated irregular dwarf, "cleanest" galaxy
 *  Extremely low dust, cornerstone of cosmic distance ladder
 * ============================================================ */

export const IC1613_STARS: GalaxyInteriorStar[] = [
  {
    id: "ic1613-nova99",
    galaxyId: "ic1613",
    name: "IC 1613 NOVA 1999",
    zh: "IC 1613 1999 年新星",
    color: "#ff6a4a",
    type: "经典新星",
    subtype: "Nova",
    pos: [1.2, 0.3, 0.8],
    briefing: [
      "1999 年由 KAIT 自动望远镜在 IC 1613 中发现的经典新星。IC 1613 是本星系群中尘埃最少的星系之一，几乎完全透明，是精确光度测量的理想场所。",
      "A classical nova discovered in IC 1613 in 1999 by the KAIT robotic telescope. IC 1613 is among the least dusty galaxies in the Local Group, nearly transparent — ideal for precision photometry.",
    ],
  },
  {
    id: "ic1613-ceph",
    galaxyId: "ic1613",
    name: "IC 1613 CEPHEIDS",
    zh: "IC 1613 造父变星群",
    color: "#ffe8a0",
    type: "造父变星群",
    subtype: "Cepheid",
    pos: [0.5, -0.4, 1.5],
    briefing: [
      "IC 1613 中已发现 49 颗经典造父变星（ACS LCID 项目），是宇宙距离阶梯的基石之一。连同 90 颗 RR Lyrae 变星，IC 1613 是精确校准河外距离的关键天体。",
      "49 classical Cepheids discovered in IC 1613 (ACS LCID Project), a cornerstone of the cosmic distance ladder. Together with 90 RR Lyrae stars, IC 1613 is key to calibrating extragalactic distances.",
    ],
  },
];

/* ============================================================
 *  SEXTANS A — small irregular at Local Group edge
 *  Boxy morphology from supernova-driven star formation
 * ============================================================ */

export const SEXTANS_A_STARS: GalaxyInteriorStar[] = [
  {
    id: "sexa-gc1",
    galaxyId: "sextans-a",
    name: "SEXTANS A GC-1",
    zh: "六分仪座 A 球状星团",
    color: "#ffe8d0",
    type: "球状星团",
    subtype: "cluster",
    pos: [1.5, 0.3, 0.5],
    briefing: [
      "六分仪座 A 中唯一确认的古老贫金属球状星团，绝对星等约 -7.85，质量约 16 万倍太阳质量。位于星系中心西南约 1.8 kpc 处。",
      "The only confirmed old, metal-poor globular cluster in Sextans A, M_V ~ -7.85, mass ~1.6×10^5 M☉. Located ~1.8 kpc SW of the galaxy center.",
    ],
  },
  {
    id: "sexa-ob",
    galaxyId: "sextans-a",
    name: "SEXTANS A OB ASSOC",
    zh: "六分仪座 A OB 星协",
    color: "#b0d8ff",
    type: "OB 星协",
    subtype: "cluster",
    pos: [0.8, -0.5, 1.2],
    briefing: [
      "六分仪座 A 中明亮的 OB 星协——年轻炽热的大质量恒星群。HST 紫外波段观测已编录了其中质量大于 8 倍太阳质量的恒星，揭示了该星系的活跃恒星形成历史。",
      "Bright OB associations in Sextans A — clusters of young, hot, massive stars. HST UV photometry has catalogued stars >8 M☉, revealing the galaxy's active star formation history.",
    ],
  },
];

/* ============================================================
 *  MAFFEI 1 — giant lenticular, 99.5% obscured by Milky Way dust
 *  Nearest giant elliptical, discovered only in 1968 (infrared)
 * ============================================================ */

export const MAFFEI1_STARS: GalaxyInteriorStar[] = [
  {
    id: "maf1-core",
    galaxyId: "maffei1",
    name: "MAFFEI 1 NUCLEUS",
    zh: "马费 1 核心",
    color: "#ffd8a0",
    type: "巨型透镜星系核",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "马费 1 星系的核心——被银河系盘面尘埃遮挡了 99.5% 的光线，直到 1968 年才在红外波段被发现。它是距离我们最近的巨型椭圆/透镜星系，拥有约 1100 个球状星团。",
      "Maffei 1's nucleus — 99.5% obscured by Milky Way dust, discovered only in 1968 via infrared. It is the nearest giant elliptical/lenticular to us, hosting ~1100 globular clusters.",
    ],
  },
];

/* ============================================================
 *  MAFFEI 2 — intermediate spiral, also obscured
 *  Barred spiral with starburst activity
 * ============================================================ */

export const MAFFEI2_STARS: GalaxyInteriorStar[] = [
  {
    id: "maf2-core",
    galaxyId: "maffei2",
    name: "MAFFEI 2 NUCLEUS",
    zh: "马费 2 核心",
    color: "#ffe0b0",
    type: "星暴星系核",
    subtype: "cluster",
    pos: [0, 0, 0],
    briefing: [
      "马费 2 星系的核心——同样被银河系尘埃深度遮挡的棒旋星系。红外观测显示其中心有活跃的星暴活动，恒星形成率远高于普通旋涡星系。",
      "Maffei 2's nucleus — a barred spiral also deeply obscured by Milky Way dust. Infrared observations reveal active starburst activity at its center, with star formation rates far above normal spirals.",
    ],
  },
];

/* ============================================================
 *  LEO I — distant Milky Way satellite
 *  Metal-poor system with dominant intermediate-age population
 * ============================================================ */

export const LEO_I_STARS: GalaxyInteriorStar[] = [
  {
    id: "leo1-rrlyr",
    galaxyId: "leo-i",
    name: "LEO I RR LYRAE",
    zh: "狮子座 I RR Lyrae 群",
    color: "#ffe8a0",
    type: "RR Lyrae 变星群",
    subtype: "Cepheid",
    pos: [0.5, 0.2, 0.3],
    briefing: [
      "狮子座 I 矮星系中已确认的 47 颗 RR Lyrae 变星（Held 2001），是测量该星系距离和年龄的关键探针。狮子座 I 位于亮星轩辕十四（狮子座 α）仅 20 角分处，观测难度极大。",
      "47 confirmed RR Lyrae variables in Leo I (Held 2001), key probes of the galaxy's distance and age. Leo I lies only 20 arcmin from the bright star Regulus, making observations challenging.",
    ],
  },
];

/* ============================================================
 *  DRACO DWARF — extremely faint, metal-poor Milky Way satellite
 *  "Flawless dwarf galaxy" — almost entirely ancient stars
 * ============================================================ */

export const DRACO_STARS: GalaxyInteriorStar[] = [
  {
    id: "draco-rrlyr",
    galaxyId: "draco-dwarf",
    name: "DRACO RR LYRAE",
    zh: "天龙座 RR Lyrae 群",
    color: "#ffe8a0",
    type: "RR Lyrae 变星群",
    subtype: "Cepheid",
    pos: [0.5, 0.2, 0.3],
    briefing: [
      "天龙座矮星系中已确认的 268 颗 RR Lyrae 变星——包括 173 颗 RRab、24 颗 RRc 和 15 颗双模 RRd。天龙座是金属丰度极低（[Fe/H] ~ -2.0）的'完美矮星系'，几乎所有恒星都诞生于百亿年前。",
      "268 RR Lyrae variables confirmed in the Draco Dwarf — 173 RRab, 24 RRc, 15 double-mode RRd. Draco is a 'flawless dwarf galaxy' with extremely low metallicity ([Fe/H] ~ -2.0), almost all stars born 10+ Gyr ago.",
    ],
  },
  {
    id: "draco-acep",
    galaxyId: "draco-dwarf",
    name: "DRACO ANOM CEPHEIDS",
    zh: "天龙座异常造父变星",
    color: "#d8c0ff",
    type: "异常造父变星",
    subtype: "Cepheid",
    pos: [0.8, -0.3, 0.6],
    briefing: [
      "天龙座矮星系中已确认的 8 颗异常造父变星，这些中质量（2-5 M☉）变星是天龙座中少数比主流恒星年轻的星体，暗示约 10-20 亿年前有过微弱恒星形成。",
      "8 confirmed Anomalous Cepheids in the Draco Dwarf. These intermediate-mass (2-5 M☉) variables are among the few stars younger than the dominant ancient population, hinting at weak star formation ~1-2 Gyr ago.",
    ],
  },
];

/* ---- lookup tables ---- */

export const GALAXY_INTERIOR_STARS_BY_GALAXY: Record<string, GalaxyInteriorStar[]> = {
  andromeda: ANDROMEDA_STARS,
  triangulum: TRIANGULUM_STARS,
  lmc: LMC_STARS,
  smc: SMC_STARS,
  ic10: IC10_STARS,
  ngc6822: NGC6822_STARS,
  m32: M32_STARS,
  m110: M110_STARS,
  "sagittarius-dwarf": SAGITTARIUS_STARS,
  "sculptor-dwarf": SCULPTOR_STARS,
  "fornax-dwarf": FORNAX_STARS,
  ngc185: NGC185_STARS,
  ngc147: NGC147_STARS,
  ic1613: IC1613_STARS,
  "sextans-a": SEXTANS_A_STARS,
  maffei1: MAFFEI1_STARS,
  maffei2: MAFFEI2_STARS,
  "leo-i": LEO_I_STARS,
  "draco-dwarf": DRACO_STARS,
};

export const GALAXY_INTERIOR_PLANETS_BY_GALAXY: Record<string, GalaxyInteriorPlanet[]> = {
  andromeda: ANDROMEDA_PLANETS,
  triangulum: TRIANGULUM_PLANETS,
  lmc: LMC_PLANETS,
  smc: SMC_PLANETS,
  ic10: IC10_PLANETS,
  ngc6822: NGC6822_PLANETS,
  m32: [],
  m110: [],
  "sagittarius-dwarf": [],
  "sculptor-dwarf": [],
  "fornax-dwarf": [],
  ngc185: [],
  ngc147: [],
  ic1613: [],
  "sextans-a": [],
  maffei1: [],
  maffei2: [],
  "leo-i": [],
  "draco-dwarf": [],
};