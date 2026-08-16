/* ============================================================
 *  COMMANDER DOSSIER — personal homepage content
 *  Edit this single file to make the terminal yours.
 * ============================================================ */

export type DossierKind =
  | "identity"
  | "skills"
  | "projects"
  | "project"
  | "timeline"
  | "contacts"
  | "contact";

export interface DossierSel {
  kind: DossierKind;
  id?: string;
}

export interface Skill {
  name: string;
  level: number; // 1-5
}

export interface SkillCat {
  id: string;
  cat: string;
  color: string;
  planet: string;
  brief: string;
  items: Skill[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  nameCn: string;
  planet: string;
  color: string;
  year: string;
  status: string;
  difficulty: number; // 1-5
  stack: string[];
  desc: string;
  objectives: string[];
  link?: { label: string; url: string };
}

export interface TimelineItem {
  date: string;
  title: string;
  place: string;
  detail: string;
}

export interface Contact {
  id: string;
  label: string;
  value: string;
  hint: string;
  color: string;
  url?: string;
}

export const PROFILE = {
  codename: "ZERO-7",
  name: "林泽",
  nameEn: "LIN ZE",
  role: "FULL-STACK DEVELOPER // CREATIVE TECHNOLOGIST",
  roleCn: "全栈开发 · 三维可视化 · 创意技术",
  location: "SHANGHAI · CN",
  status: "OPEN FOR MISSIONS",
  clearance: "OWNER // ROOT ACCESS",
  bio: [
    "DOSSER DECRYPTED // CHANNEL 01-PERSONAL",
    "你好，我是 ZERO-7。白天写业务代码，晚上造宇宙。",
    "我着迷于把复杂的系统做成看得见的体验：WebGL 渲染管线、实时数据可视化、以及任何『感觉像从科幻电影里走出来』的界面。这个战术终端本身就是我的作品——用 Three.js、GLSL 与 React 从零搭建。",
    "如果你正在寻找一个既懂工程、又在乎像素级细节的开发者，UPLINK 已经为你打开。",
  ],
  stats: [
    ["CODE YEARS", "6+"],
    ["PROJECTS SHIPPED", "23"],
    ["WEBGL EXPERIMENTS", "40+"],
    ["UPTIME", "24/7"],
  ],
  skills: [
    {
      id: "frontend",
      cat: "FRONTEND CORE",
      color: "#00F0FF",
      planet: "jupiter",
      brief:
        "前端是我的主战场。从类型安全的工程架构到逐帧级别的交互动效，追求的是一行代码也不浪费的精确性。",
      items: [
        { name: "TYPESCRIPT / REACT", level: 5 },
        { name: "CSS / TAILWIND / MOTION", level: 5 },
        { name: "VUE / VITE 工程链", level: 4 },
        { name: "PWA / WEBSOCKET", level: 4 },
      ],
    },
    {
      id: "graphics",
      cat: "3D & GRAPHICS",
      color: "#FFB000",
      planet: "terra",
      brief:
        "Three.js、GLSL 着色器、粒子系统——把数据变成可以旋转、缩放、触摸的立体世界是我的日常娱乐项目。",
      items: [
        { name: "THREE.JS / WEBGL", level: 5 },
        { name: "GLSL SHADER", level: 4 },
        { name: "CANVAS / D3 可视化", level: 4 },
        { name: "BLENDER / 建模", level: 3 },
      ],
    },
    {
      id: "backend",
      cat: "BACKEND & DATA",
      color: "#B44CFF",
      planet: "mars",
      brief:
        "服务端与数据层：从 RESTful API 到消息队列，保证每一个像素背后的数据都跑得又快又稳。",
      items: [
        { name: "NODE.JS / NEST", level: 4 },
        { name: "PYTHON / FASTAPI", level: 3 },
        { name: "POSTGRESQL / REDIS", level: 4 },
        { name: "DOCKER / K8S", level: 3 },
      ],
    },
  ],
  projects: [
    {
      id: "mo-client",
      code: "PRJ-01",
      name: "MO-CLIENT 战术终端",
      nameCn: "你现在看到的这个页面",
      planet: "mars",
      color: "#FF7A4A",
      year: "2024",
      status: "LIVE",
      difficulty: 5,
      stack: ["React", "Three.js", "GLSL", "GSAP", "Web Audio"],
      desc: "工业级科幻战术指令终端——3D 太阳系交互引擎、Fresnel 大气层着色器、程序化纹理、合成音效与全息 HUD。也是本主页的心脏。",
      objectives: [
        "三视图天体引擎 + 行星局部自由环绕",
        "NASA 卫星级真实贴图加载系统",
        "GLSL 大气辉光 / 脉冲 / 粒子特效",
        "打字机情报面板 + 合成战术音效",
      ],
      link: { label: "SOURCE", url: "https://github.com" },
    },
    {
      id: "galaxy",
      code: "PRJ-02",
      name: "GALAXY FLOW · 粒子银河",
      nameCn: "十万星粒子模拟",
      planet: "jupiter",
      color: "#E8C48A",
      year: "2023",
      status: "SHIPPED",
      difficulty: 4,
      stack: ["Three.js", "InstancedMesh", "GLSL", "Perlin Noise"],
      desc: "十万颗恒星的螺旋星系模拟，InstancedMesh 单次绘制渲染，噪声驱动的悬臂与尘埃带，可在任意设备上 60FPS 巡航。",
      objectives: [
        "100K 粒子单 DrawCall 渲染",
        "GPU 噪声螺旋悬臂生成",
        "引力透镜伪影后处理",
      ],
      link: { label: "SOURCE", url: "https://github.com" },
    },
    {
      id: "holo-dash",
      code: "PRJ-03",
      name: "HOLO-DASH 全息数据台",
      nameCn: "实时可视化中控",
      planet: "venus",
      color: "#F0C878",
      year: "2023",
      status: "SHIPPED",
      difficulty: 4,
      stack: ["D3", "Canvas", "WebSocket", "Vue3"],
      desc: "面向运营团队的全息风数据中控台——实时交易流、异常告警雷达与 3D 拓扑图，数据延迟低于 40ms。",
      objectives: [
        "10W+ 点实时流渲染",
        "异常检测雷达图",
        "深色全息主题设计系统",
      ],
      link: { label: "SOURCE", url: "https://github.com" },
    },
    {
      id: "neural-studio",
      code: "PRJ-04",
      name: "NEURAL STUDIO",
      nameCn: "AI 图像工作台",
      planet: "neptune",
      color: "#5A8ADF",
      year: "2024",
      status: "BETA",
      difficulty: 5,
      stack: ["React", "WebGPU", "Stable Diffusion", "Node"],
      desc: "浏览器里的 AI 图像工作台——WebGPU 加速的扩散模型推理、图生图/重绘流与提示词工程面板。",
      objectives: [
        "WebGPU 推理管线",
        "图层化重绘工作流",
        "提示词权重编辑器",
      ],
      link: { label: "SOURCE", url: "https://github.com" },
    },
    {
      id: "terra-engine",
      code: "PRJ-05",
      name: "TERRA ENGINE",
      nameCn: "TypeScript 游戏引擎",
      planet: "uranus",
      color: "#9FE8E4",
      year: "2022",
      status: "ARCHIVED",
      difficulty: 4,
      stack: ["TypeScript", "ECS", "Canvas2D"],
      desc: "自研 2D 游戏引擎——实体组件系统、瓦片地图与行为树，驱动过 3 个独立小游戏。",
      objectives: [
        "ECS 架构与帧调度",
        "瓦片地图编辑器",
        "行为树 AI 系统",
      ],
      link: { label: "SOURCE", url: "https://github.com" },
    },
    {
      id: "smarthome",
      code: "PRJ-06",
      name: "ORBIT HOME",
      nameCn: "智能家居中控",
      planet: "mercury",
      color: "#C9C9D8",
      year: "2021",
      status: "SHIPPED",
      difficulty: 3,
      stack: ["React Native", "MQTT", "ESP32"],
      desc: "跨端智能家居中控——MQTT 设备编排、场景自动化与本地优先的隐私架构。",
      objectives: [
        "MQTT 设备编排",
        "场景自动化引擎",
        "离线优先架构",
      ],
    },
  ],
  timeline: [
    {
      date: "2024.09",
      title: "独立开发者 · 创意技术工作室",
      place: "SHANGHAI / REMOTE",
      detail:
        "主导 WebGL 交互项目与品牌官网：从粒子系统到全息 UI，专注三维可视化与沉浸式数字体验，服务多家品牌客户。",
    },
    {
      date: "2021.07",
      title: "高级前端工程师 · 数据智能团队",
      place: "HANGZHOU",
      detail:
        "负责实时数据可视化平台核心模块，将 10W+ 数据点的渲染性能提升 8 倍；建立团队组件库与工程规范。",
    },
    {
      date: "2019.06",
      title: "前端工程师 · 电商中台",
      place: "SHANGHAI",
      detail:
        "构建多端商城与营销活动引擎，沉淀动画库与低代码配置系统，支撑全年 30+ 次大促活动。",
    },
    {
      date: "2017.09",
      title: "计算机科学与技术 · 本科",
      place: "NANJING",
      detail:
        "在校期间沉迷图形学与 Web 技术，毕业设计为『基于 WebGL 的校园三维漫游系统』——命运的齿轮就此转动。",
    },
  ],
  contacts: [
    {
      id: "github",
      label: "GITHUB",
      value: "@zero7-dev",
      hint: "CODE REPOSITORY UPLINK",
      color: "#8B9BB4",
      url: "https://github.com",
    },
    {
      id: "email",
      label: "EMAIL",
      value: "zero7@example.com",
      hint: "PRIMARY DIRECT CHANNEL",
      color: "#00F0FF",
      url: "mailto:zero7@example.com",
    },
    {
      id: "bilibili",
      label: "BILIBILI",
      value: "空间站 Z-7",
      hint: "CREATIVE VIDEO STREAM",
      color: "#FB7299",
      url: "https://www.bilibili.com",
    },
    {
      id: "wechat",
      label: "WECHAT",
      value: "ZERO-7_DEV",
      hint: "INSTANT MESSAGING UPLINK",
      color: "#3CB371",
    },
    {
      id: "x",
      label: "X / TWITTER",
      value: "@zero7_makes",
      hint: "PUBLIC BROADCAST CHANNEL",
      color: "#E0E0E0",
      url: "https://x.com",
    },
  ],
};

export const projectById = (id: string) => PROFILE.projects.find((p) => p.id === id);
export const skillCatById = (id: string) => PROFILE.skills.find((s) => s.id === id);
export const contactById = (id: string) => PROFILE.contacts.find((c) => c.id === id);
export const timelineById = (i: string) => PROFILE.timeline[Number(i)];
