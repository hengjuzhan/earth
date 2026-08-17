/* ============================================================
 *  i18n — UI dictionary + zh name maps
 * ============================================================ */

export type Lang = "zh" | "en";

const dict: Record<string, [string, string]> = {
  personalTerminal: ["个人终端", "PERSONAL TERMINAL"],
  openForMissions: ["接受任务中", "OPEN FOR MISSIONS"],
  ownerAccess: ["所有者 · 最高权限", "OWNER // ROOT ACCESS"],
  liveOps: ["实时任务", "LIVE OPS"],
  render: ["渲染", "RENDER"],
  welcome: ["欢迎登舰 — 个人指挥界面", "WELCOME ABOARD — PERSONAL COMMAND INTERFACE"],
  openDossier: ["打开档案", "OPEN DOSSIER"],
  exploreSystem: ["探索星系", "EXPLORE SYSTEM"],
  statYears: ["编码年限", "CODE YEARS"],
  statProjects: ["已交付项目", "PROJECTS SHIPPED"],
  statExperiments: ["三维实验", "WEBGL EXPERIMENTS"],
  statUptime: ["在线状态", "UPTIME"],

  dossier: ["指挥官档案", "COMMANDER DOSSIER"],
  tabDossier: ["档案", "DOSSIER"],
  tabArchive: ["战术档案", "ARCHIVE"],
  techArsenal: ["技术武器库", "TECH ARSENAL"],
  projectArchive: ["项目档案", "PROJECT ARCHIVE"],
  opLog: ["履历档案", "OPERATION LOG"],
  contactUplink: ["联系信道", "CONTACT UPLINK"],
  allChannels: ["全部信道", "ALL CHANNELS"],
  indexAll: ["索引 // 全部交付", "INDEX // ALL SHIPMENTS"],
  ownerLink: ["所有者在线", "OWNER LINK"],
  live: ["在线", "LIVE"],

  intelFeed: ["情报面板", "INTELLIGENCE FEED"],
  targetLocked: ["目标锁定", "TARGET LOCKED"],
  celestialBody: ["天体遥测", "CELESTIAL BODY"],
  briefing: ["任务简报", "BRIEFING"],
  idle: ["待命", "IDLE"],
  commanderId: ["指挥官身份", "COMMANDER ID"],
  archiveIndex: ["档案索引", "ARCHIVE INDEX"],
  projectFile: ["项目文件", "PROJECT FILE"],
  channelList: ["信道列表", "CHANNEL LIST"],
  uplinkChannel: ["通信信道", "UPLINK CHANNEL"],
  awaitingOrders: ["等待指令", "AWAITING ORDERS"],
  awaitingText: [
    "从左侧打开你的个人档案\n或点击地球上的脉冲节点",
    "OPEN YOUR DOSSIER FROM THE\nLEFT PANEL — OR CLICK A\nPULSING NODE ON THE GLOBE",
  ],
  heliocentric: ["日心扫描模式", "HELIOCENTRIC SCAN MODE"],
  helioText: [
    "点击任意天体锁定遥测\n然后拖拽直接环绕该天体\n滚轮缩放 · 双击释放",
    "CLICK ANY CELESTIAL BODY TO LOCK\nITS TELEMETRY — THEN DRAG TO\nORBIT THAT BODY DIRECTLY.\nSCROLL ZOOM · DBL-CLICK RELEASE",
  ],
  lat: ["纬度", "LAT"],
  lon: ["经度", "LON"],
  alt: ["高度", "ALT"],
  sector: ["扇区", "SECTOR"],
  threat: ["威胁", "THREAT"],
  objectives: ["任务目标", "OBJECTIVES"],
  skip: ["跳过", "SKIP"],
  execute: ["执行", "EXECUTE"],
  engaged: ["已接战", "ENGAGED"],
  wideScan: ["宽视野", "WIDE SCAN"],
  telemetryFeed: ["轨道遥测数据流", "ORBITAL TELEMETRY FEED"],
  physicalData: ["物理数据", "PHYSICAL DATA"],
  decryptedDossier: ["解密档案", "DECRYPTED DOSSIER"],
  transmission: ["传输记录", "TRANSMISSION"],
  logEntry: ["日志条目", "LOG ENTRY"],
  remoteSensing: ["⚠ 遥感模式 — 节点中继离线", "⚠ REMOTE SENSING MODE — NODE RELAY OFFLINE"],
  copy: ["复制", "COPY"],
  openUplink: ["打开链接", "OPEN UPLINK"],
  identityBtn: ["身份", "IDENTITY"],
  channelData: ["信道数据", "CHANNEL DATA"],
  openChannels: ["已开启信道", "OPEN CHANNELS"],
  shipmentManifest: ["交付清单", "SHIPMENT MANIFEST"],
  diameter: ["直径", "DIAMETER"],
  distance: ["距离", "DISTANCE"],
  orbit: ["轨道周期", "ORBIT"],
  rotation: ["自转周期", "ROTATION"],
  moons: ["卫星数", "MOONS"],

  navDossier: ["身份", "IDENTITY"],
  navArsenal: ["技能", "SKILLS"],
  navProjects: ["项目", "PROJECTS"],
  navContact: ["联系", "CONTACT"],
  bodyEarth: ["地球", "EARTH"],
  bodyLuna: ["月球", "LUNA"],
  bodySystem: ["太阳系", "SYSTEM"],
  bodyGalaxy: ["银河系", "GALAXY"],
  galaxyView: ["银河系视景", "GALACTIC VIEW"],
  galacticScan: ["银河巡天模式", "GALACTIC SURVEY MODE"],
  galacticScanText: [
    "这里是银河系 · 4000 亿颗恒星的家园。\n点击亮星查阅星表 · 点击 SOL 返回太阳系。\n拖拽旋转 · 滚轮缩放 · 双击复位",
    "THE MILKY WAY — HOME TO 400 BILLION STARS.\nCLICK A STAR FOR ITS CATALOG ENTRY · CLICK SOL TO RETURN.\nDRAG TO ROTATE · SCROLL TO ZOOM · DBL-CLICK TO RESET",
  ],
  starDossier: ["恒星档案", "STAR DOSSIER"],
  starType: ["光谱型", "SPECTRAL TYPE"],
  starDist: ["距离", "DISTANCE"],
  starMag: ["视星等", "APPARENT MAG"],
  solHome: ["太阳 · 返回太阳系", "SOL · RETURN TO SYSTEM"],
  galaxyDossier: ["星系档案", "GALAXY DOSSIER"],
  galaxyDistance: ["距离", "DISTANCE"],
  galaxySize: ["直径", "DIAMETER"],
  galaxyType: ["类型", "TYPE"],
  backToMilkyWay: ["返回银河全景", "BACK TO MILKY WAY"],
  clickGalaxyHint: ["点击邻近星系进入观测", "CLICK A NEIGHBOUR GALAXY TO VISIT"],
  terminate: ["复位视角", "TERMINATE"],
  fxOn: ["特效：开", "FX: ON"],
  fxOff: ["特效：关", "FX: OFF"],

  doomVoid: ["黑洞坍缩", "VOID COLLAPSE"],
  doomSupernova: ["超新星爆发", "SUPERNOVA"],
  doomDissolve: ["量子分解", "QUANTUM DISSOLVE"],
  doomMeteor: ["陨石风暴", "METEOR STORM"],
  restoreGalaxy: ["一键复原", "RESTORE"],
  doomInProgress: ["毁灭进行中 · 请勿移开视线", "ANNIHILATION IN PROGRESS · DO NOT LOOK AWAY"],
  systemAnnihilated: ["☠ 星系已毁灭", "☠ SYSTEM ANNIHILATED"],
  restoreMessage: [
    "正在从宇宙备份恢复 · 校验通过 ✓ 宇宙已复原",
    "RESTORING FROM COSMIC BACKUP · SHA-256 VERIFIED ✓ UNIVERSE RESTORED",
  ],
  terranView: ["地球轨道视图", "TERRAN ORBITAL VIEW"],
  lunarView: ["月球中继视图", "LUNAR RELAY VIEW"],
  helioView: ["日心轨道视图", "HELIOCENTRIC ORBITAL VIEW"],
  controls: [
    "拖拽环绕 · 右键平移 · 滚轮惯性缩放 · +/- 缩放 · [L] 火箭 · [D] 光照 · [G] 渲染 · [~] 指令台",
    "DRAG ORBIT · RIGHT-DRAG PAN · INERTIAL SCROLL ZOOM · +/- ZOOM · [L] ROCKET · [D] LIGHT · [G] SHADER · [~] CONSOLE",
  ],

  /* lighting modes */
  lightFull: ["全日", "FULL DAY"],
  lightDawn: ["晨昏", "DAWN"],
  lightNight: ["深夜", "NIGHT"],
  /* render lab */
  labReal: ["写实", "REAL"],
  labWire: ["线框科技", "WIREFRAME"],
  labNeon: ["赛博霓虹", "CYBER NEON"],
  labGlitch: ["故障艺术", "GLITCH"],
  /* status panel */
  camPos: ["相机坐标", "CAMERA POS"],
  spinRate: ["自转速率", "SPIN RATE"],
  nodes: ["在线节点", "NODES"],
  commLink: ["通信链路", "COMM LINK"],
  power: ["能源等级", "POWER"],
  scan: ["扫描进度", "SCAN"],
  tris: ["三角面数", "TRIS"],
  logTitle: ["操作日志", "OP LOG"],
  /* satellite matrix */
  satFirstPerson: ["节点第一视角", "NODE FIRST-PERSON"],
  releaseView: ["释放视角", "RELEASE"],
  dockBtn: ["对接", "DOCK"],
  docking: ["对接中…", "DOCKING…"],
  docked: ["对接成功", "DOCKED"],
  /* ufo tracking */
  ufoTracked: ["未知目标追踪", "UFO TRACKING"],
  ufoDist: ["距地高度", "ALTITUDE"],
  ufoSpeed: ["相对速度", "REL SPEED"],
  ufoSize: ["目标体积", "TARGET SIZE"],
  ufoObserve: ["抵近观测", "OBSERVE"],
  ufoIntercept: ["拦截", "INTERCEPT"],
  ufoUntrack: ["取消追踪", "RELEASE"],
  rocketReady: ["火箭待命 · [L] 发射", "ROCKET READY · [L] LAUNCH"],
  consolePlaceholder: [
    "输入指令，/help 查看全部…",
    "TYPE COMMAND, /HELP FOR LIST…",
  ],
  /* settings module */
  tiangong: ["天宫空间站", "TIANGONG STATION"],
  settings: ["设置", "SETTINGS"],
  masterVol: ["主音量", "MASTER VOL"],
  sfxVol: ["音效音量", "EFFECTS VOL"],
  ambVol: ["环境音音量", "AMBIENT VOL"],
  quality: ["渲染质量", "RENDER QUALITY"],
  qualityLow: ["低", "LOW"],
  qualityMed: ["中", "MED"],
  qualityHigh: ["高", "HIGH"],
  settingsHint: [
    "所有设置即时生效并自动保存",
    "ALL SETTINGS APPLY LIVE & AUTO-SAVE",
  ],
  moonProgram: ["登月计划", "MOON PROGRAM"],
  /* pilotable tour ship */
  ship: ["观光飞船", "TOUR SHIP"],
  shipThird: ["第三人称", "THIRD-PERSON"],
  shipFirst: ["第一人称", "FIRST-PERSON"],
  shipExit: ["离船", "EXIT SHIP"],
  shipThrottle: ["油门", "THROTTLE"],
  shipSpeed: ["速度", "VELOCITY"],
  shipDist: ["距太阳", "DIST TO SUN"],
  shipWarning: ["⚠ 太阳临近 · 减速！", "⚠ SOLAR PROXIMITY · SLOW DOWN"],
  shipControls: [
    "鼠标拖拽转向 · W 前进 · S 后退 · A/D 平移 · R/F 升降 · Q/E 滚转 · ←→↑↓ 姿态 · 空格制动 · C 视角",
    "DRAG TO STEER · W THRUST · S REVERSE · A/D STRAFE · R/F LIFT · Q/E ROLL · ARROWS ATTITUDE · SPACE BRAKE · C VIEW",
  ],
  freeFlight: ["自由飞行模式", "FREE FLIGHT MODE"],
  velVector: ["速度矢量", "VEL VECTOR"],
  hover: ["悬浮中", "HOVERING"],
  /* cargo delivery gameplay */
  cargoBoard: ["货运调度中心", "CARGO DISPATCH"],
  cargoJobs: ["可用货运单", "AVAILABLE JOBS"],
  cargo: ["货物", "CARGO"],
  cargoFrom: ["装货港", "PICKUP"],
  cargoTo: ["目的地", "DESTINATION"],
  cargoReward: ["报酬", "PAY"],
  cargoTime: ["时限", "DEADLINE"],
  cargoAccept: ["接受任务", "ACCEPT JOB"],
  cargoNoJob: ["暂无任务 · 前往货运中心接单", "NO JOB — OPEN CARGO DISPATCH"],
  cargoPickupPhase: ["前往装货点", "EN ROUTE TO PICKUP"],
  cargoTransitPhase: ["运达交货", "DELIVERING CARGO"],
  cargoSlowDown: ["抵达区域 · 刹车停稳装卸", "IN ZONE · BRAKE TO DOCK"],
  cargoPickedUp: ["货物已装载", "CARGO LOADED"],
  cargoDelivered: ["货物送达", "DELIVERY COMPLETE"],
  cargoFailed: ["任务超时 · 货物过期", "JOB EXPIRED · CARGO LOST"],
  credits: ["信用点", "CREDITS"],
};

export const ALIEN_MSGS: Record<Lang, string[]> = {
  zh: [
    "你好地球人，你们这颗星球看起来很可爱。",
    "我们只是路过，别开火。",
    "你们的摇滚乐不错，我们借走了。",
    "改天再来串门，记得给我们留灯。",
    "信号已收到——你们的外卖能送到月球吗？",
  ],
  en: [
    "GREETINGS EARTHLINGS, NICE PLANET YOU GOT THERE.",
    "WE ARE JUST PASSING BY, HOLD YOUR FIRE.",
    "YOUR ROCK MUSIC IS EXCELLENT. WE TOOK SOME.",
    "WE'LL VISIT AGAIN. KEEP THE LIGHTS ON.",
    "SIGNAL RECEIVED — DOES YOUR DELIVERY REACH THE MOON?",
  ],
};

export const t = (lang: Lang, key: string): string => {
  const entry = dict[key];
  if (!entry) return key;
  return lang === "zh" ? entry[0] : entry[1];
};

/* ---- Chinese names for celestial bodies / missions / skill cats ---- */

export const PLANET_ZH: Record<string, { name: string; type: string }> = {
  sol: { name: "太阳", type: "G2V 主序恒星" },
  mercury: { name: "水星", type: "类地行星 · 极端辐射" },
  venus: { name: "金星", type: "类地行星 · 浓云蔽日" },
  terra: { name: "地球", type: "类地行星 · 主战区" },
  luna: { name: "月球", type: "卫星 · 中继枢纽" },
  mars: { name: "火星", type: "类地行星 · 寒冷荒漠" },
  jupiter: { name: "木星", type: "气态巨行星 · 风暴之眼" },
  saturn: { name: "土星", type: "气态巨行星 · 环带堡垒" },
  uranus: { name: "天王星", type: "冰巨星 · 侧躺自转" },
  neptune: { name: "海王星", type: "冰巨星 · 深蓝边界" },
  io: { name: "木卫一", type: "伽利略卫星 · 火山熔炉" },
  europa: { name: "欧罗巴", type: "伽利略卫星 · 冰壳海洋" },
  ganymede: { name: "木卫三", type: "伽利略卫星 · 最大卫星" },
  callisto: { name: "木卫四", type: "伽利略卫星 · 古老表面" },
  titan: { name: "泰坦", type: "大型卫星 · 甲烷世界" },
  phobos: { name: "火卫一", type: "小行星卫星 · 濒临碎裂" },
  deimos: { name: "火卫二", type: "小行星卫星 · 外层伴星" },
  triton: { name: "海卫一", type: "大型卫星 · 被捕俘柯伊伯带天体" },
  pluto: { name: "冥王星", type: "矮行星 · 柯伊伯带" },
};

export const MISSION_ZH: Record<string, string> = {
  "al-01": "行动：午夜风暴",
  "al-02": "行动：极光",
  "al-03": "行动：潮汐先锋",
  "cr-01": "行动：红色黎明",
  "cr-02": "行动：冬日之锤",
  "cr-03": "行动：寂静草原",
  "ep-01": "行动：灵能晶格",
  "ep-02": "行动：心灵碎片",
  "fo-01": "行动：太阳坠落",
  "fo-02": "行动：热力攀升",
};

export const SKILLCAT_ZH: Record<string, string> = {
  frontend: "前端核心",
  graphics: "三维图形",
  backend: "后端与数据",
};

/* ---- Chinese content: mission briefings · objectives · sectors ---- */

export const MISSION_BRIEF_ZH: Record<string, string[]> = {
  "al-01": [
    "解密传输 // 信道 07-A",
    "敌方装甲纵队已确认向曼哈顿外围集结。城市防御网运行率仅 34%。气象中继报告 06:00 前存在零能见度窗口。",
    "派遣前沿侦察部队前往东部港口。坚守子午线之门，直到时空信标阵列完成充能循环。",
  ],
  "al-02": [
    "解密传输 // 信道 03-C",
    "敌方潜艇活动在北海走廊被探测。卫星扫描显示三条封锁线正在泰晤士河口成型。",
    "护送情报车队穿越 J-08 扇区。保持无线电静默，直到声呐信标阵列上线。",
  ],
  "al-03": [
    "解密传输 // 信道 11-B",
    "台风旋涡掠过群岛，所有空中支援被迫停飞。敌方海军特遣队正利用风暴逼近首都湾。",
    "气象控制卫星已就位。在 04:00 风暴窗口关闭前，夺取近海平台。",
  ],
  "cr-01": [
    "解密传输 // 信道 05-R",
    "盟军前进基地在西部草原被锁定。铁幕设施效率 78%——正是实战检验的最佳时机。",
    "在敌方时空卫星重新定位之前撕开防御圈。将军的磁暴突击师将跟进你的突破。",
  ],
  "cr-02": [
    "解密传输 // 信道 08-K",
    "东海岸港口设施已陷入沉寂。远程雷达确认敌方装甲反击部队将在 12 小时内抵达。",
    "加固海岸炮台。冰层足够厚，重装甲可从冰封海峡直接通过。",
  ],
  "cr-03": ["加密 // 需 5 级权限", "数据不可读。"],
  "ep-01": [
    "解密传输 // 信道 00-PSI",
    "沙漠之下的金字塔阵列已进入第二阶段共振。盟军卫星目前无法探测其信号——只是目前。",
    "守住晶格，直到心灵大师链接扇区内的所有心灵使徒。一次中断都会让心灵场归零。",
  ],
  "ep-02": ["加密 // 需 7 级权限", "数据不可读。"],
  "fo-01": [
    "解密传输 // 信道 12-F",
    "被征用的太阳能收割机正通过沿海终端转运。两座轨道反射镜可以重新瞄准，为你的推进提供掩护。",
    "切断补给走廊。城市电网依赖收割的光能——断其光源，占领军一周之内将失去电力。",
  ],
  "fo-02": [
    "解密传输 // 信道 15-T",
    "海峡之下的地热抽取点被占领军超频运行。升高的海温正在破坏珊瑚礁线。",
    "通过旧管道网络释放热压。喷发将致盲扇区内的所有传感器。",
  ],
};

export const MISSION_OBJ_ZH: Record<string, string[]> = {
  "al-01": ["坚守子午线之门 10 分钟", "摧毁敌方攻城爬行者", "充能超时空传送阵列"],
  "al-02": ["护送车队至撤离点", "部署声呐信标阵列", "清除敌方封锁线"],
  "al-03": ["夺取三座近海平台", "在敌方海军攻势中存活", "部署风暴破坏者卫星"],
  "cr-01": ["粉碎西部防线", "对先锋部队展开铁幕", "抵达敌方指挥部"],
  "cr-02": ["重建海岸炮台网络", "摧毁敌方反击部队", "坚守港口 24 小时"],
  "cr-03": ["---"],
  "ep-01": ["保护金字塔阵列", "将 12 名使徒链入晶格", "心灵大师不可阵亡"],
  "ep-02": ["---"],
  "fo-01": ["摧毁补给车队", "重新瞄准轨道反射镜", "解放沿海终端"],
  "fo-02": ["超载地热抽取点", "穿越传感器网络", "破坏管道阀门"],
};

export const MISSION_SECTOR_ZH: Record<string, string> = {
  "al-01": "大西洋扇区 // 网格 DQ-14",
  "al-02": "欧洲扇区 // 网格 JS-08",
  "al-03": "太平洋扇区 // 网格 UF-21",
  "cr-01": "欧亚扇区 // 网格 OK-33",
  "cr-02": "远东扇区 // 网格 VX-12",
  "cr-03": "中亚扇区 // 网格 QW-02",
  "ep-01": "北非扇区 // 网格 CB-09",
  "ep-02": "中欧扇区 // 网格 HT-17",
  "fo-01": "南大西洋扇区 // 网格 ZM-06",
  "fo-02": "巽他扇区 // 网格 PS-04",
};

export const FACTION_ZH: Record<string, string> = {
  allied: "盟军指挥部",
  crimson: "赤红公约",
  epsilon: "厄普西隆军团",
  foehn: "焚风反抗军",
};

export const STATUS_ZH: Record<string, string> = {
  AVAILABLE: "可执行",
  ACTIVE: "进行中",
  COMPLETE: "已完成",
  LOCKED: "已锁定",
};

/* ---- Chinese content: planet telemetry ---- */

export const PLANET_BRIEF_ZH: Record<string, string[]> = {
  sol: [
    "轨道遥测 // 太阳阵列",
    "聚变核心输出稳定在额定的 99.998%。日同步中继报告日冕物质抛射风险：低。所有行星指挥链路均按预期负荷取电。",
  ],
  mercury: [
    "轨道遥测 // 最内侧天体",
    "向阳面的太阳能中继阵列间歇性被辐射暴致盲。热屏蔽报告 41% 退化——建议所有监听站保持在背阳面。",
  ],
  venus: [
    "轨道遥测 // 硫酸云壳",
    "地表扫描仍被硫酸云层阻挡。52 公里高空的浮空气球中继报告平流层风稳定——这是一道天然的电磁屏障。",
  ],
  terra: [
    "轨道遥测 // 指挥母星",
    "三大洲扇区的全部战役节点已探测。切换至地球视角可部署任务。气象控制阵列与轨道离子炮在本网格待命。",
  ],
  luna: [
    "轨道遥测 // 月球中继站",
    "背面次级指挥所保持活跃。月面阵列向整个内太阳系转发指挥网络——切断此链路，半个扇区将陷入黑暗。",
  ],
  mars: [
    "轨道遥测 // 氧化荒漠",
    "沙尘暴季正在吞噬北半球。奥林帕斯山坡下的埋藏补给库仍被封存——热信号表明敌人先找到了它们。",
  ],
  jupiter: [
    "轨道遥测 // 红色风暴系统",
    "大红斑历经三个世纪仍保持稳定。卡利斯托航道引力弹射走廊畅通——舰队集结点隐藏在环系辐射阴影中。",
  ],
  saturn: [
    "轨道遥测 // 环带堡垒",
    "冰环上部署着被动传感器浮标链——每颗冰晶碎片像镜墙一样反射敌方雷达。土卫六中继保持外太阳系接入指挥网。",
  ],
  uranus: [
    "轨道遥测 // 极端轴倾角",
    "这颗行星侧躺在轨道上滚动——季节长达数十年。天卫五上的长程阵列捕捉到内环的未知共振：或许是我们自己的信号，在 20 年前被反射回来。",
  ],
  neptune: [
    "轨道遥测 // 终端边界",
    "指挥网的最终边界。超音速风暴以 2100 km/h 撕扯甲烷地平线——全系统最快。海卫一监听站是预警网的最后一道防线。",
  ],
};

export const PLANET_DATA_ZH: Record<string, [string, string][]> = {
  sol: [
    ["光谱等级", "G2V"],
    ["核心成分", "H 73% / HE 25%"],
    ["电网负荷", "8 条行星链路"],
  ],
  mercury: [
    ["地表", "陨坑风化层"],
    ["中继站", "2 个运行中"],
    ["日照强度", "地球的 7.4 倍"],
  ],
  venus: [
    ["大气", "CO2 96.5%"],
    ["云层", "硫酸 · 52KM 高空"],
    ["增压作业", "不建议"],
  ],
  terra: [
    ["活跃节点", "3 扇区已链接"],
    ["轨道资产", "离子网络 + 气象阵列"],
    ["上行延迟", "42 毫秒"],
  ],
  luna: [
    ["背面", "环形山指挥部"],
    ["中继阵列", "在线"],
    ["月食窗口", "剩余 04:12"],
  ],
  mars: [
    ["奥林帕斯储备", "5 处中 2 处封存"],
    ["风暴锋面", "北半球"],
    ["生存指数", "勉强"],
  ],
  jupiter: [
    ["大红斑", "稳定"],
    ["辐射带", "极端"],
    ["卫星中继", "卡利斯托 / 欧罗巴"],
  ],
  saturn: [
    ["环带阵列", "62 浮标在线"],
    ["泰坦中继", "琥珀色 · 间歇"],
    ["冰体质量", "4.8e19 KG"],
  ],
  uranus: [
    ["轴倾角", "97.8°"],
    ["环共振", "未解明"],
    ["米兰达阵列", "监听中"],
  ],
  neptune: [
    ["风速", "2,100 KM/H"],
    ["海卫一哨站", "预警网络"],
    ["大暗斑", "瞬态"],
  ],
};

export const TICKER: Record<Lang, string> = {
  zh:
    "全栈开发 · THREE.JS 匠人 · 接受任务中 // " +
    "本终端 100% 手工打造：REACT + THREE.JS + GLSL + WEB AUDIO // " +
    "拖拽环绕 · [L] 火箭 · [D] 光照 · [G] 渲染 · [~] 指令台 // " +
    "👽 未知飞行物在星系游荡 — 点击追踪 · 火箭拦截 // " +
    "★ 成就系统已上线 — 指令台里藏着彩蛋指令 // " +
    "通信信道 AES-256 加密 // ",
  en:
    "FULL-STACK DEVELOPER // THREE.JS ARTISAN // OPEN FOR MISSIONS // " +
    "THIS TERMINAL IS 100% HAND-BUILT: REACT + THREE.JS + GLSL + WEB AUDIO // " +
    "DRAG TO ORBIT · [L] ROCKET · [D] LIGHT · [G] SHADER · [~] CONSOLE // " +
    "👽 UNKNOWN CRAFT PATROLLING — CLICK TO TRACK · ROCKET INTERCEPT // " +
    "★ ACHIEVEMENT SYSTEM LIVE — HIDDEN COMMANDS INSIDE THE CONSOLE // " +
    "UPLINK CHANNELS ENCRYPTED AES-256 // ",
};
