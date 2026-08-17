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
      "已知宇宙中质量最大的恒星，约 215 倍太阳质量，光度超过太阳的 600 万倍。位于 R136 星团中心，是一颗极端的 Wolf-Rayet 星。",
      "The most massive known star in the universe, ~215 M☉, over 6 million L☉. Located at the center of the R136 cluster in the Tarantula Nebula.",
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
      "小麦哲伦云中一颗双星系统，两颗子星都是极端的高光度蓝变星——这是已知唯一的 LBV 双星。主星 1994 年曾发生剧烈爆发。",
      "A binary system in the SMC where BOTH components are extreme LBVs — the only known LBV binary. The primary underwent a dramatic eruption in 1994.",
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
    parentStarId: "m31-nuc",
    name: "PA-99-N2 b",
    zh: "仙女座 PA-99-N2 b",
    color: "#9fb7d0",
    type: ["气态巨行星", "Gas Giant"],
    radius: 0.08,
    orbit: 0.7,
    speed: 0.6,
    phase: 0.3,
    briefing: [
      "1999 年通过微引力透镜效应在仙女座星系中发现的系外行星候选体，质量约 6.3 倍木星质量。如果确认，它将是已知第一颗河外行星。",
      "An exoplanet candidate discovered in M31 via microlensing in 1999, ~6.3 MJ. If confirmed, it would be the first known extragalactic planet.",
    ],
    data: [
      ["质量", "~6.3 MJ", "Mass", "~6.3 MJ"],
      ["发现方法", "微引力透镜", "Method", "Microlensing"],
      ["年份", "1999", "Year", "1999"],
    ],
  },
];

export const TRIANGULUM_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "m33-pl1",
    galaxyId: "triangulum",
    parentStarId: "m33-nuc",
    name: "M33-ULX-P1",
    zh: "M33 候选行星",
    color: "#7a8aa0",
    type: ["候选行星", "Candidate"],
    radius: 0.06,
    orbit: 0.6,
    speed: 0.5,
    phase: 1.8,
    briefing: [
      "三角座星系中通过 X 射线掩星法发现的候选行星，如果确认将是 M33 中第一颗已知行星。数据来自 XMM-Newton 观测。",
      "A candidate planet in M33 discovered via X-ray occultation. If confirmed, it would be the first known planet in the Triangulum Galaxy. Data from XMM-Newton.",
    ],
    data: [
      ["发现方法", "X 射线掩星", "Method", "X-ray Occultation"],
      ["状态", "候选", "Status", "Candidate"],
    ],
  },
];

/* ============================================================
 *  LARGE MAGELLANIC CLOUD PLANETS
 * ============================================================ */

export const LMC_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "lmc-pl1",
    galaxyId: "lmc",
    parentStarId: "lmc-r136a1",
    name: "R136a1-b",
    zh: "R136a1 候选行星",
    color: "#c8a060",
    type: ["候选行星", "Candidate"],
    radius: 0.07,
    orbit: 0.8,
    speed: 0.55,
    phase: 0.7,
    briefing: [
      "围绕已知最重恒星 R136a1 的候选行星。R136a1 质量约 215 M☉，光度是太阳的 870 万倍。如果该行星存在，将是已知最极端环境中的行星。",
      "A candidate planet orbiting the most massive known star, R136a1 (~215 M☉). If confirmed, it would be a planet in the most extreme stellar environment known.",
    ],
    data: [
      ["宿主", "R136a1", "Host", "R136a1"],
      ["环境", "极端辐射", "Environment", "Extreme"],
    ],
  },
  {
    id: "lmc-pl2",
    galaxyId: "lmc",
    parentStarId: "lmc-sn1987a",
    name: "SN1987A-b",
    zh: "SN1987A 前身行星",
    color: "#7a6090",
    type: ["候选行星", "Candidate"],
    radius: 0.05,
    orbit: 0.5,
    speed: 0.7,
    phase: 2.1,
    briefing: [
      "SN 1987A 前身恒星 Sanduleak -69°202 的候选行星。这颗超新星是 400 年来最亮的，其行星如果存在，可能已被冲击波摧毁。",
      "A candidate planet of the progenitor star Sanduleak -69°202 of SN 1987A, the brightest supernova in 400 years. Any planet would likely have been destroyed by the shockwave.",
    ],
    data: [
      ["宿主", "Sanduleak -69°202", "Host", "Sanduleak -69°202"],
      ["状态", "可能已毁灭", "Status", "Likely Destroyed"],
    ],
  },
];

/* ============================================================
 *  SMALL MAGELLANIC CLOUD PLANETS
 * ============================================================ */

export const SMC_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "smc-pl1",
    galaxyId: "smc",
    parentStarId: "smc-ngc346",
    name: "NGC346-b",
    zh: "NGC346 候选行星",
    color: "#b0c0e0",
    type: ["候选行星", "Candidate"],
    radius: 0.06,
    orbit: 0.7,
    speed: 0.5,
    phase: 0.3,
    briefing: [
      "小麦哲伦云中 NGC 346 星团区域的候选行星。NGC 346 是 SMC 中最亮的恒星形成区，年轻恒星正在诞生。",
      "A candidate planet in the NGC 346 star-forming region of the SMC, the brightest stellar nursery in the Small Magellanic Cloud.",
    ],
    data: [
      ["宿主", "NGC 346 星团", "Host", "NGC 346 Cluster"],
      ["区域", "活跃恒星形成区", "Region", "Active SF"],
    ],
  },
];

/* ============================================================
 *  IC 10 PLANETS
 * ============================================================ */

export const IC10_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "ic10-pl1",
    galaxyId: "ic10",
    parentStarId: "ic10-x1",
    name: "IC10-X1-b",
    zh: "IC10 X-1 候选行星",
    color: "#5a6a80",
    type: ["候选行星", "Candidate"],
    radius: 0.05,
    orbit: 0.6,
    speed: 0.6,
    phase: 1.5,
    briefing: [
      "围绕 IC 10 X-1 黑洞双星系统的候选行星。IC 10 X-1 是已知质量最大的恒星黑洞之一，约 23 M☉。",
      "A candidate planet orbiting the IC 10 X-1 black hole binary system, one of the most massive stellar-mass black holes known (~23 M☉).",
    ],
    data: [
      ["宿主", "IC 10 X-1", "Host", "IC 10 X-1"],
      ["环境", "黑洞双星", "Environment", "BH Binary"],
    ],
  },
];

/* ============================================================
 *  NGC 6822 PLANETS
 * ============================================================ */

export const NGC6822_PLANETS: GalaxyInteriorPlanet[] = [
  {
    id: "ngc6822-pl1",
    galaxyId: "ngc6822",
    parentStarId: "ngc6822-hv",
    name: "Hubble-V-b",
    zh: "Hubble-V 候选行星",
    color: "#a08860",
    type: ["候选行星", "Candidate"],
    radius: 0.06,
    orbit: 0.55,
    speed: 0.55,
    phase: 0.9,
    briefing: [
      "NGC 6822 中 Hubble-V 巨型 HII 区的候选行星。Hubble-V 是本地群中最亮的 HII 区之一，正在孕育大量新生恒星。",
      "A candidate planet in the Hubble-V giant HII region of NGC 6822, one of the brightest HII regions in the Local Group.",
    ],
    data: [
      ["宿主", "Hubble-V", "Host", "Hubble-V"],
      ["区域", "巨型 HII 区", "Region", "Giant HII"],
    ],
  },
];

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