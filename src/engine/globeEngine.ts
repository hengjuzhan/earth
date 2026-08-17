import * as THREE from "three";
import { gsap } from "gsap";
import { audio } from "../audio/tacticalAudio";
import { EXO_PLANETS, GALAXY_STARS, NEIGHBOR_GALAXIES, type ExoPlanetStyle } from "../data/planets";
import {
  GALAXY_INTERIOR_STARS_BY_GALAXY,
  GALAXY_INTERIOR_PLANETS_BY_GALAXY,
  GALAXY_INTERIOR_CONFIGS,
  type GalaxyInteriorPlanet,
} from "../data/galaxyInteriors";

/* =====================================================================
 *  GLOBE ENGINE — Tactical 3D sphere with GLSL atmosphere, particles,
 *  procedural grid textures, mission nodes and GSAP camera fly-to.
 * ===================================================================== */

export type BodyMode = "earth" | "moon" | "sol" | "system" | "galaxy" | "galaxyInterior";
type SingleBodyMode = Exclude<BodyMode, "system" | "galaxy" | "galaxyInterior">;

export type DoomMethod = "void" | "supernova" | "dissolve" | "meteor";

export interface NodeSpec {
  id: string;
  lat: number;
  lon: number;
  color: string;
  name: string;
}

export interface HoverInfo {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

const DEG = Math.PI / 180;
const BODY_R = 2; // earth base radius (scene units)

const BODY_CFG: Record<
  BodyMode,
  { scale: number; camDist: number; atmo: number; glow: number; spin: number }
> = {
  earth: { scale: 1, camDist: 7.7, atmo: 0x00e5ff, glow: 0x00b7ff, spin: 0.006 },
  moon: { scale: 0.74, camDist: 6.1, atmo: 0xbfd4ff, glow: 0x7f9bff, spin: 0.0035 },
  sol: { scale: 1.14, camDist: 8.7, atmo: 0xffb000, glow: 0xff7b00, spin: 0.009 },
  system: { scale: 1, camDist: 34, atmo: 0xffb000, glow: 0xff7b00, spin: 0.008 },
  galaxy: { scale: 1, camDist: 170, atmo: 0xffb000, glow: 0xff7b00, spin: 0.008 },
  galaxyInterior: { scale: 1, camDist: 80, atmo: 0xffb000, glow: 0xff7b00, spin: 0.008 },
};

/* ---------------- math helpers ---------------- */

export function latLonToVector3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function cartesianToSph(v: THREE.Vector3) {
  const radius = v.length();
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / radius, -1, 1));
  const theta = Math.atan2(v.x, v.z);
  return { theta, phi, radius };
}

function unwrapTheta(current: number, target: number) {
  let d = target - current;
  d = ((((d + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return current + d;
}

/* ---------------- procedural textures ---------------- */

function hash2(x: number, y: number, seed: number) {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function pnoise(x: number, y: number, seed: number, wrapW: number) {
  const xi = ((Math.floor(x) % wrapW) + wrapW) % wrapW;
  const yi = Math.floor(y);
  const xf = x - Math.floor(x);
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2((xi + 1) % wrapW, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2((xi + 1) % wrapW, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number, octaves: number, wrapW: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * pnoise(x * freq, y * freq, seed + o * 101, wrapW * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function makeTacticalTexture(kind: BodyMode): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const gridColor =
    kind === "earth" ? [0, 240, 255] : kind === "moon" ? [255, 176, 0] : [255, 96, 64];
  const eqColor = kind === "earth" ? [255, 176, 0] : [255, 220, 140];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      let r = 0;
      let g = 0;
      let b = 0;

      if (kind === "earth") {
        const latDeg = Math.abs(y / h - 0.5) * 180;
        const n = fbm(x * 0.0032, y * 0.0064, 7, 5, w * 0.0032);
        const n2 = fbm(x * 0.009, y * 0.018, 19, 3, w * 0.009);
        if (n > 0.55) {
          /* land — climate zones */
          const coast = n - 0.55 < 0.02;
          if (latDeg > 72) {
            r = 214 + n2 * 34; g = 226 + n2 * 24; b = 240 + n2 * 14;   /* polar ice */
          } else if (latDeg > 62) {
            r = 112 + n2 * 42; g = 128 + n2 * 36; b = 112 + n2 * 30;   /* tundra */
          } else if (latDeg < 34 && n2 > 0.55) {
            r = 176 + n2 * 44; g = 132 + n2 * 30; b = 74 + n2 * 22;    /* desert belt */
          } else {
            r = 34 + n2 * 34; g = 92 + n2 * 42; b = 42 + n2 * 26;      /* forests */
          }
          if (coast) { r += 58; g += 66; b += 54; }                    /* beaches */
        } else {
          /* ocean depth gradient */
          const depth = n / 0.55;
          r = (4 + depth * 10) * 0.6;
          g = (12 + depth * 18) * 0.8;
          b = (26 + depth * 34) * 1.12;
        }
        /* snow line on sea ice too */
        if (latDeg > 68) {
          const ice = Math.min(1, Math.max(0, (latDeg - 68) / 12 + (n2 - 0.5) * 0.3));
          r += (238 - r) * ice;
          g += (244 - g) * ice;
          b += (250 - b) * ice;
        }
      } else if (kind === "moon") {
        const n = fbm(x * 0.004, y * 0.008, 13, 4, w * 0.004);
        let v = 30 + n * 30;
        /* maria — dark basalt plains */
        const m1 = fbm(x * 0.006 + 40, y * 0.012 + 30, 77, 3, w * 0.006);
        const m2 = fbm(x * 0.005 + 90, y * 0.01 + 130, 83, 3, w * 0.005);
        const maria = Math.max(0, m1 - 0.55) * 0.9 + Math.max(0, m2 - 0.58) * 0.7;
        v -= Math.min(24, maria * 46);
        r = v * 0.86;
        g = v * 0.89;
        b = v;
      } else {
        const n = fbm(x * 0.003, y * 0.018, 29, 4, w * 0.003);
        const v = n * 0.7 + 0.2;
        r = 90 + v * 160;
        g = 20 + v * 130;
        b = 6 + v * 40;
        const limb = Math.pow(Math.abs(y / h - 0.5) * 2, 1.6);
        r *= 1 - limb * 0.35;
        g *= 1 - limb * 0.45;
        b *= 1 - limb * 0.5;
      }

      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  /* moon craters */
  if (kind === "moon") {
    for (let c = 0; c < 70; c++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const cr = 3 + Math.random() * 14;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(8,10,16,${0.25 + Math.random() * 0.3})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - cr * 0.25, cy - cr * 0.2, cr * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,215,255,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* sol plasma blobs */
  if (kind === "sol") {
    ctx.globalCompositeOperation = "lighter";
    for (let c = 0; c < 26; c++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const cr = 18 + Math.random() * 60;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      grad.addColorStop(0, `rgba(255,220,120,${0.12 + Math.random() * 0.18})`);
      grad.addColorStop(1, "rgba(255,140,40,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---- lat/lon tactical grid — the sun stays a pure plasma ball ---- */
  if (kind !== "sol") {
    const lonStepMinor = 5;
    const latStepMinor = 5;
    for (let lon = -180; lon <= 180; lon += lonStepMinor) {
      const x = ((lon + 180) / 360) * w;
      const major = lon % 15 === 0;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.strokeStyle = major
        ? `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},0.38)`
        : `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},0.12)`;
      ctx.lineWidth = major ? 1 : 0.5;
      ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += latStepMinor) {
      const y = ((90 - lat) / 180) * h;
      const major = lat % 15 === 0;
      const equator = lat === 0;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.strokeStyle = equator
        ? `rgba(${eqColor[0]},${eqColor[1]},${eqColor[2]},0.85)`
        : major
          ? `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},0.38)`
          : `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},0.12)`;
      ctx.lineWidth = equator ? 1.6 : major ? 1 : 0.5;
      ctx.stroke();
    }

    /* dot matrix at intersections + scattered data dust */
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -90; lat <= 90; lat += 15) {
        const x = ((lon + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        ctx.fillStyle = `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},0.9)`;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }
    for (let i = 0; i < 620; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = `rgba(${gridColor[0]},${gridColor[1]},${gridColor[2]},${0.08 + Math.random() * 0.3})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/* ---------------- solar system ---------------- */

interface PlanetTexOpts {
  seed: number;
  base: [number, number, number];
  size?: number;
  bands?: { count: number; palette: [number, number, number][]; strength: number };
  craters?: number;
  swirl?: number;
  storm?: { x: number; y: number; rx: number; ry: number; color: [number, number, number] };
}

function makePlanetTexture(o: PlanetTexOpts): THREE.CanvasTexture {
  const w = o.size ?? 256;
  const h = w / 2;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const wrapW = w * 0.02;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      let n: number;
      if (o.swirl) {
        n = fbm(
          x * 0.02 + Math.sin(y * 0.1 + Math.cos(x * 0.045) * 2.1) * o.swirl * 6,
          y * 0.032,
          o.seed,
          4,
          wrapW
        );
      } else {
        n = fbm(x * 0.02, y * 0.04, o.seed, 4, wrapW);
      }
      const vv = 0.42 + n * 0.95;
      let r = o.base[0] * vv;
      let g = o.base[1] * vv;
      let b = o.base[2] * vv;
      if (o.bands) {
        const wob = fbm(y * (o.bands.count * 2.1), x * 0.003, o.seed + 91, 2, wrapW);
        const idx = Math.min(
          o.bands.count - 1,
          Math.max(0, Math.floor(v * o.bands.count + (wob - 0.5) * o.bands.count * 0.55))
        );
        const pc = o.bands.palette[idx % o.bands.palette.length];
        const m = Math.min(1, o.bands.strength * (0.5 + n));
        r += (pc[0] - r) * m;
        g += (pc[1] - g) * m;
        b += (pc[2] - b) * m;
      }
      const i = (y * w + x) * 4;
      d[i] = Math.min(255, r);
      d[i + 1] = Math.min(255, g);
      d[i + 2] = Math.min(255, b);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  if (o.craters) {
    for (let c = 0; c < o.craters; c++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const cr = 2 + Math.random() * 9;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(18,20,28,${0.2 + Math.random() * 0.3})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(230,235,245,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  if (o.storm) {
    const sx = o.storm.x * w;
    const sy = o.storm.y * h;
    const srx = o.storm.rx * w;
    const sry = o.storm.ry * h;
    const [sr, sg, sb] = o.storm.color;
    ctx.fillStyle = `rgba(${sr},${sg},${sb},0.65)`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, srx, sry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  /* light tactical grid overlay */
  ctx.strokeStyle = "rgba(0,240,255,0.10)";
  ctx.lineWidth = 0.6;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

interface PlanetDef {
  id: string;
  name: string;
  color: string;
  radius: number;
  dist: number;
  speed: number;
  selfSpin: number;
  tilt: number;
  tex: PlanetTexOpts;
  useSolTex?: boolean;
  useEarthTex?: boolean;
  useMoonTex?: boolean;
  ring?: { inner: number; outer: number; color: number; opacity: number; tilt: number; textured?: boolean };
  atmo?: number;
  isMoon?: boolean;
  moonOf?: string;
  moonR?: number;
  moonSpeed?: number;
}

const PLANET_DEFS: PlanetDef[] = [
  { id: "sol", name: "SOL", color: "#FFB000", radius: 2.2, dist: 0, speed: 0, selfSpin: 0.02, tilt: 0, tex: { seed: 1, base: [255, 160, 60] }, useSolTex: true },
  { id: "mercury", name: "MERCURY", color: "#C9C9D8", radius: 0.24, dist: 5.0, speed: 0.36, selfSpin: 0.1, tilt: 0.05, tex: { seed: 17, base: [150, 150, 162], craters: 40, size: 128 } },
  { id: "venus", name: "VENUS", color: "#F0C878", radius: 0.4, dist: 7.3, speed: 0.27, selfSpin: -0.04, tilt: 0.1, tex: { seed: 23, base: [216, 168, 96], bands: { count: 6, palette: [[226, 190, 120], [198, 150, 86], [236, 204, 138]], strength: 0.55 }, swirl: 1.1 }, atmo: 0xe8c46a },
  { id: "terra", name: "TERRA", color: "#00F0FF", radius: 0.46, dist: 9.9, speed: 0.21, selfSpin: 0.14, tilt: 0.35, tex: { seed: 7, base: [20, 40, 70] }, useEarthTex: true, atmo: 0x00e5ff },
  { id: "mars", name: "MARS", color: "#FF7A4A", radius: 0.3, dist: 12.7, speed: 0.16, selfSpin: 0.13, tilt: 0.2, tex: { seed: 31, base: [196, 92, 56], craters: 26, size: 128 }, atmo: 0xff8a5a },
  { id: "jupiter", name: "JUPITER", color: "#E8C48A", radius: 1.15, dist: 18.2, speed: 0.1, selfSpin: 0.22, tilt: 0.12, tex: { seed: 41, base: [196, 160, 120], bands: { count: 9, palette: [[226, 196, 150], [176, 126, 90], [236, 210, 170], [150, 106, 80]], strength: 0.85 }, swirl: 1.6, storm: { x: 0.68, y: 0.62, rx: 0.1, ry: 0.05, color: [160, 70, 50] }, size: 512 }, atmo: 0xd8b07a },
  { id: "saturn", name: "SATURN", color: "#E8D8A8", radius: 0.95, dist: 23.8, speed: 0.075, selfSpin: 0.2, tilt: 0.3, tex: { seed: 47, base: [214, 188, 140], bands: { count: 7, palette: [[232, 210, 162], [198, 170, 120], [244, 226, 184]], strength: 0.6 }, swirl: 1.2, size: 512 }, ring: { inner: 1.45, outer: 2.35, color: 0xd8c9a0, opacity: 0.62, tilt: 0.42, textured: true }, atmo: 0xe0c890 },
  { id: "uranus", name: "URANUS", color: "#9FE8E4", radius: 0.62, dist: 29.0, speed: 0.052, selfSpin: 0.16, tilt: 1.35, tex: { seed: 53, base: [150, 216, 214], bands: { count: 4, palette: [[168, 230, 228], [130, 198, 200]], strength: 0.35 }, swirl: 0.5 }, ring: { inner: 1.5, outer: 1.95, color: 0x9fd8e8, opacity: 0.25, tilt: 1.35 }, atmo: 0x8ad8d8 },
  { id: "neptune", name: "NEPTUNE", color: "#5A8ADF", radius: 0.58, dist: 33.8, speed: 0.04, selfSpin: 0.17, tilt: 0.4, tex: { seed: 59, base: [70, 110, 210], bands: { count: 5, palette: [[90, 140, 230], [60, 96, 196], [110, 160, 240]], strength: 0.5 }, swirl: 1.0, storm: { x: 0.3, y: 0.45, rx: 0.08, ry: 0.04, color: [30, 50, 110] }, size: 512 }, atmo: 0x5a80c8 },
  { id: "luna", name: "LUNA", color: "#CFD6E8", radius: 0.13, dist: 0, speed: 0, selfSpin: 0.05, tilt: 0.3, tex: { seed: 13, base: [150, 152, 168] }, useMoonTex: true, isMoon: true, moonR: 1.05, moonSpeed: 0.5 },

  /* ---- REAL SATELLITES — Galilean moons (Jupiter), Titan (Saturn), Martian moons, Triton (Neptune) ---- */
  { id: "io", name: "IO", color: "#F8E8A0", radius: 0.2, dist: 0, speed: 0, selfSpin: 0.3, tilt: 0.05, tex: { seed: 61, base: [226, 198, 120], craters: 48, size: 256 }, isMoon: true, moonOf: "jupiter", moonR: 2.35, moonSpeed: 1.6 },
  { id: "europa", name: "EUROPA", color: "#E8D8C8", radius: 0.18, dist: 0, speed: 0, selfSpin: 0.28, tilt: 0.1, tex: { seed: 63, base: [210, 190, 170], craters: 12, size: 256 }, isMoon: true, moonOf: "jupiter", moonR: 3.05, moonSpeed: 1.15 },
  { id: "ganymede", name: "GANYMEDE", color: "#B8B8C0", radius: 0.26, dist: 0, speed: 0, selfSpin: 0.22, tilt: 0.08, tex: { seed: 65, base: [160, 160, 172], craters: 36, size: 256 }, isMoon: true, moonOf: "jupiter", moonR: 3.95, moonSpeed: 0.82 },
  { id: "callisto", name: "CALLISTO", color: "#B8B4A0", radius: 0.24, dist: 0, speed: 0, selfSpin: 0.18, tilt: 0.15, tex: { seed: 67, base: [150, 148, 132], craters: 44, size: 256 }, isMoon: true, moonOf: "jupiter", moonR: 5.05, moonSpeed: 0.55 },
  { id: "titan", name: "TITAN", color: "#E8B060", radius: 0.28, dist: 0, speed: 0, selfSpin: 0.2, tilt: 0.1, tex: { seed: 69, base: [216, 160, 88], bands: { count: 4, palette: [[226, 176, 100], [190, 140, 78], [236, 196, 120]], strength: 0.4 }, swirl: 0.8, size: 256 }, isMoon: true, moonOf: "saturn", moonR: 2.4, moonSpeed: 0.62 },
  { id: "phobos", name: "PHOBOS", color: "#B0A090", radius: 0.09, dist: 0, speed: 0, selfSpin: 0.5, tilt: 0.3, tex: { seed: 71, base: [130, 118, 102], craters: 8, size: 128 }, isMoon: true, moonOf: "mars", moonR: 0.62, moonSpeed: 1.9 },
  { id: "deimos", name: "DEIMOS", color: "#B8B0A8", radius: 0.08, dist: 0, speed: 0, selfSpin: 0.5, tilt: 0.4, tex: { seed: 73, base: [138, 130, 118], craters: 6, size: 128 }, isMoon: true, moonOf: "mars", moonR: 0.78, moonSpeed: 1.2 },
  { id: "triton", name: "TRITON", color: "#D0D0E0", radius: 0.21, dist: 0, speed: 0, selfSpin: 0.2, tilt: 0.4, tex: { seed: 75, base: [176, 176, 204], craters: 26, size: 256 }, isMoon: true, moonOf: "neptune", moonR: 1.6, moonSpeed: 0.5 },

  /* ---- DWARF PLANET — Pluto sitting in the Kuiper belt ---- */
  { id: "pluto", name: "PLUTO", color: "#E8B088", radius: 0.2, dist: 37.5, speed: 0.02, selfSpin: 0.08, tilt: 0.7, tex: { seed: 77, base: [206, 158, 118], craters: 26, size: 256 }, atmo: 0xc8a080 },
];

/** procedural Cassini-like ring texture — radial banded alpha */
function makeRingTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 4;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const img = g.createImageData(w, h);
  const d = img.data;
  for (let x = 0; x < w; x++) {
    const f = x / w;
    let alpha = 0.05;
    let r = 214;
    let gg = 196;
    let b = 156;
    /* band structure — Cassini division + bright B ring */
    const bands: [number, number, number][] = [
      [0.0, 0.08, 0.25],
      [0.08, 0.2, 0.1],
      [0.2, 0.36, 0.85],
      [0.36, 0.44, 0.15],
      [0.44, 0.62, 0.7],
      [0.62, 0.72, 0.12],
      [0.72, 0.9, 0.55],
      [0.9, 1.0, 0.2],
    ];
    for (const [a, b2, inten] of bands) {
      if (f >= a && f < b2) alpha = inten;
    }
    const noiseB = 0.85 + 0.3 * Math.sin(f * 480);
    alpha *= noiseB;
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      d[i] = r;
      d[i + 1] = gg;
      d[i + 2] = b;
      d[i + 3] = Math.min(255, alpha * 255);
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface PlanetEntry {
  id: string;
  name: string;
  color: string;
  radius: number;
  dist: number;
  speed: number;
  angle: number;
  group: THREE.Group;
  mesh: THREE.Mesh;
  glow: THREE.Sprite;
  highlight: THREE.Mesh;
  tilt: number;
  selfSpin: number;
  moon?: { pivot: THREE.Group; angle: number; speed: number };
  world: THREE.Vector3;
}

interface AsteroidRock {
  mesh: THREE.Mesh;
  angle: number;
  dist: number;
  inc: number;
  speed: number;
  spin: THREE.Vector3;
}

interface OrbitalUnit {
  id: string;
  pivot: THREE.Group;
  carrier: THREE.Group;
  angle: number;
  speed: number;
  beacons: { sprite: THREE.Sprite; phase: number }[];
  world: THREE.Vector3;
  clickable: boolean;
}

interface AuroraRibbon {
  mesh: THREE.Mesh;
  phase: number;
  t: number;
  dur: number;
}

interface WindParticle {
  sprite: THREE.Sprite;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  t: number;
  life: number;
}

type LabUniforms = {
  [K in "uTime" | "uMode" | "uTex"]: { value: number | THREE.Texture };
};

interface DoomBurst {
  sprite: THREE.Sprite;
  dir: THREE.Vector3;
  speed: number;
  idx: number;
}

interface DoomMeteor {
  sprite: THREE.Sprite;
  from: THREE.Vector3;
  target: THREE.Vector3;
  speed: number;
  t: number;
  arrived: boolean;
  idx: number;
}

interface DoomState {
  method: DoomMethod;
  t: number;
  dur: number;
  onDone: () => void;
  hits: number[];
  flashT: number[];
  dirs: THREE.Vector3[];
  assets: THREE.Object3D[];
  bursts?: DoomBurst[];
  meteors?: DoomMeteor[];
}

interface ShootingStar {
  head: THREE.Sprite;
  trail: THREE.Line;
  pts: THREE.Vector3[];
  dir: THREE.Vector3;
  t: number;
  life: number;
  speed: number;
}

interface CometEntry {
  a: number;
  e: number;
  inc: number;
  omega: number;
  angle: number;
  speed: number;
  nucleus: THREE.Sprite;
  glow: THREE.Sprite;
  trail: THREE.Line;
  pts: THREE.Vector3[];
  tmp: THREE.Vector3;
}

interface UfoEntry {
  id: string;
  group: THREE.Group;
  lights: { sprite: THREE.Sprite; phase: number }[];
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  dur: number;
  system: boolean;
  disabled?: boolean;
  respawnAt?: number;
}

interface RocketState {
  group: THREE.Group;
  flame: THREE.Sprite;
  parent: THREE.Object3D;
  normal: THREE.Vector3;
  tangent: THREE.Vector3;
  baseR: number;
  t: number;
  dur: number;
  active: boolean;
  target?: { type: "dock" | "observe" | "intercept"; ufo?: UfoEntry };
}

/* ============ moon landing program (登月计划) ============ */

interface MoonMissionState {
  phase: "ascent" | "transfer" | "brake" | "descent" | "landed" | "wave" | "return";
  t: number;
  group: THREE.Group; // lunar module
  flame: THREE.Sprite;
  astronaut: THREE.Group | null;
  astroArm: THREE.Group | null;
  astroGlow: THREE.Sprite;
  landLocal: THREE.Vector3;
  normal: THREE.Vector3;
  tangent: THREE.Vector3;
  startPos: THREE.Vector3;
  vel: THREE.Vector3; // real velocity vector (integrated physics)
}

function makeGlowDotTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function makeCrosshairTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.strokeStyle = "rgba(0,240,255,0.95)";
  g.lineWidth = 3;
  const s = 26;
  const l = 22;
  const m = 64;
  /* four corner brackets */
  g.beginPath();
  g.moveTo(m - s, m - s + l);
  g.lineTo(m - s, m - s);
  g.lineTo(m - s + l, m - s);
  g.moveTo(m + s - l, m - s);
  g.lineTo(m + s, m - s);
  g.lineTo(m + s, m - s + l);
  g.moveTo(m + s, m + s - l);
  g.lineTo(m + s, m + s);
  g.lineTo(m + s - l, m + s);
  g.moveTo(m - s + l, m + s);
  g.lineTo(m - s, m + s);
  g.lineTo(m - s, m + s - l);
  g.stroke();
  g.beginPath();
  g.arc(m, m, 6, 0, Math.PI * 2);
  g.strokeStyle = "rgba(255,176,0,0.95)";
  g.stroke();
  g.fillStyle = "rgba(255,176,0,0.9)";
  g.beginPath();
  g.arc(m, m, 2, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* text sprite label — a small HUD plate with the given caption */
function makeTextSprite(text: string, color: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 120;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 120);
  g.font = "600 42px 'Rajdhani','Segoe UI',system-ui,sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(2,7,16,0.6)";
  g.fillRect(96, 20, 320, 80);
  g.strokeStyle = color;
  g.globalAlpha = 0.55;
  g.lineWidth = 3;
  g.strokeRect(96, 20, 320, 80);
  g.globalAlpha = 1;
  g.shadowColor = color;
  g.shadowBlur = 14;
  g.fillStyle = color;
  g.fillText(text, 256, 62);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  sprite.scale.set(2.6, 0.6, 1);
  return sprite;
}

/* nebula cloud texture — layered soft blobs of ionised gas */
function makeNebulaTexture(rgb: [number, number, number], seed: number): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  let sd = seed;
  const rnd = () => {
    sd = (sd * 16807) % 2147483647;
    return sd / 2147483647;
  };
  const blob = (x: number, y: number, r: number, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
    gr.addColorStop(0.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * 0.3})`);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  };
  blob(s / 2, s / 2, s * 0.48, 0.5);
  for (let i = 0; i < 14; i++) {
    blob(s * 0.28 + rnd() * s * 0.44, s * 0.28 + rnd() * s * 0.44, s * 0.09 + rnd() * s * 0.2, 0.14 + rnd() * 0.22);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------- shaders ---------------- */

const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 viewDir = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - abs(dot(normalize(vNormalW), viewDir)), uPower);
  gl_FragColor = vec4(uColor, fres * uIntensity);
}
`;

const PULSE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PULSE_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uSpeed;
uniform float uPhase;
uniform vec3 uColor;
void main() {
  float t = fract(uTime * uSpeed + uPhase);
  float band = smoothstep(0.32, 0.5, vUv.x) * (1.0 - smoothstep(0.5, 0.68, vUv.x));
  float alpha = band * (1.0 - t) * 0.95;
  gl_FragColor = vec4(uColor, alpha);
}
`;

const HEAT_VERT = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vObj;
void main() {
  vObj = position;
  vPosW = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* solar heat shimmer — noise-driven thermal turbulence above the limb */
const HEAT_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uStrength;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vObj;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
void main() {
  vec3 viewDir = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - abs(dot(normalize(vNormalW), viewDir)), 2.1);
  /* thermal turbulence: two noise octaves rising over the surface */
  float n1 = noise(normalize(vObj).xy * 7.0 + vec2(0.0, uTime * 0.5));
  float n2 = noise(normalize(vObj).xz * 9.0 - vec2(uTime * 0.38, uTime * 0.2));
  float n3 = noise(normalize(vObj).yz * 11.0 + vec2(uTime * 0.3, -uTime * 0.42));
  float heat = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  /* heat concentrates at the limb, dancing slowly */
  float alpha = fres * (0.15 + heat * 0.85) * uStrength;
  gl_FragColor = vec4(uColor, alpha);
}
`;

const LIGHTS_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LIGHTS_FRAG = /* glsl */ `
uniform sampler2D uNight;
uniform vec3 uSunDir;
uniform float uIntensity;
uniform float uOffset;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  vec2 uv = vec2(fract(vUv.x + uOffset), vUv.y);
  vec4 night = texture2D(uNight, uv);
  float lum = dot(night.rgb, vec3(0.3, 0.6, 0.1));
  float ndl = dot(normalize(vNormalW), normalize(uSunDir));
  float mask = 1.0 - smoothstep(-0.3, 0.12, ndl);
  float a = mask * lum * uIntensity;
  gl_FragColor = vec4(night.rgb * uIntensity * mask, a);
}
`;

/* ---------------- node entry ---------------- */

interface NodeEntry {
  id: string;
  name: string;
  color: string;
  lat: number;
  lon: number;
  group: THREE.Group;
  spinA: THREE.Group;
  spinB: THREE.Group;
  pulse: THREE.Mesh;
  pulseU: {
    uTime: { value: number };
    uSpeed: { value: number };
    uPhase: { value: number };
    uColor: { value: THREE.Color };
  };
  glow: THREE.Sprite;
  cross: THREE.Sprite;
  boost: number;
  locked: boolean;
  world: THREE.Vector3;
}

/* ===================================================================== */

export class GlobeEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private raf = 0;
  private clock = new THREE.Clock();
  private time = 0;

  private sph = { theta: 0.9, phi: 1.18, radius: 7.7 };
  private homeSph = { theta: 0.9, phi: 1.18, radius: 7.7 };
  private lookAt = new THREE.Vector3(0, 0, 0);

  private bodyGroup = new THREE.Group();
  private globe: THREE.Mesh;
  private globeMat: THREE.MeshPhongMaterial;
  private atmo: THREE.Mesh;
  private atmoU: {
    uColor: { value: THREE.Color };
    uIntensity: { value: number };
    uPower: { value: number };
  };
  private innerAtmo: THREE.Mesh;
  private innerAtmoU: {
    uColor: { value: THREE.Color };
    uIntensity: { value: number };
    uPower: { value: number };
  };
  private glowSprite: THREE.Sprite;
  private glowMat: THREE.SpriteMaterial;
  private dust: THREE.Points;
  private stars: THREE.Points;
  private decorGroup = new THREE.Group();
  private decorA: THREE.Mesh;
  private decorB: THREE.Mesh;
  private dashedRing: THREE.Line;

  private nodesGroup = new THREE.Group();
  private nodes: NodeEntry[] = [];
  private activeId: string | null = null;

  private systemGroup = new THREE.Group();
  private planets: PlanetEntry[] = [];
  private focusPlanetId: string | null = null;
  private hoverPlanetId: string | null = null;
  private belt!: THREE.Points;
  private kuiperBelt!: THREE.Points;
  private outerSystemRing!: THREE.Line;
  /* Milky Way band — the sky river seen from inside the galaxy */
  private milkyWay!: THREE.Points;
  private milkyWayHaze = new THREE.Group();
  private tmpV = new THREE.Vector3();
  private tmpV2 = new THREE.Vector3();
  /* pointer-anchored zoom — the scene point under the cursor stays put */
  private zoomPivot: THREE.Vector3 | null = null;
  private zoomCam0 = new THREE.Vector3();
  private zoomLook0 = new THREE.Vector3();
  /* the look target every mode eases toward; zoom anchoring overrides it */
  private lookAtGoal = new THREE.Vector3(0, 0, 0);
  private lookGoalOverride = 0;
  /* smooth inertial zoom — wheel sets a target radius, tick eases toward it */
  private zoomTarget = 0;
  private zoomAnim = 0;
  private asteroids: AsteroidRock[] = [];
  private orbitals: OrbitalUnit[] = [];
  private orbitalRoot!: THREE.Group;

  /* local free-orbit state around the focused planet + camera flight */
  private local = { theta: 0.9, phi: 1.32, radius: 3 };
  private flight: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    lookFrom: THREE.Vector3;
    lookTo: THREE.Vector3;
    t: number;
    dur: number;
    onDone?: () => void;
  } | null = null;

  /* galaxy annihilation protocol */
  private annihilation: DoomState | null = null;

  /* easter eggs: shooting stars · comets · ufos · rocket · night lights */
  private shootingStars: ShootingStar[] = [];
  private shootTimer = 3;
  private comets: CometEntry[] = [];
  private ufos: UfoEntry[] = [];
  private nearUfo: UfoEntry | null = null;
  private hoverUfo = false;
  private rocket: RocketState | null = null;
  private rocketTimer = 25;
  private onAlien?: (id: string) => void;
  private realEarthLoaded = false;
  private lightsShell: THREE.Mesh | null = null;
  private lightsMat: THREE.ShaderMaterial | null = null;
  private lightsU = {
    uNight: { value: null as THREE.Texture | null },
    uSunDir: { value: new THREE.Vector3(6, 4, 8).normalize() },
    uIntensity: { value: 1.4 },
    uOffset: { value: 0 },
  };

  /* interactive orbital matrix · moon · weather · lab · ufo gameplay */
  private sunLight: THREE.DirectionalLight;
  private ambLight: THREE.AmbientLight;
  private hoverSat: OrbitalUnit | null = null;
  private hoverMoon = false;
  private satFocus: OrbitalUnit | null = null;
  private moonInEarth: { mesh: THREE.Mesh; pivot: THREE.Group; angle: number } | null = null;
  private lightMode: "full" | "dawn" | "night" = "full";
  private labMat: THREE.ShaderMaterial | null = null;
  private labMode = 0; // 0 real · 1 wireframe · 2 neon · 3 glitch
  private auroras: AuroraRibbon[] = [];
  private windParticles: WindParticle[] = [];
  private ufoTrackId: string | null = null;
  private ufoTelemetryAcc = 0;
  private lastUfoPos = new THREE.Vector3();
  private onSatelliteClick?: (id: string) => void;
  private onMoonClick?: () => void;
  private onUfoTelemetry?: (d: { id: string; dist: number; speed: number; size: number }) => void;
  private onRocketEvent?: (k: "dock" | "observe" | "intercept") => void;
  private onStats?: (s: { triangles: number; alt: number; nodes: number }) => void;
  private statsAcc = 0;
  /* adaptive render resolution — throttles pixel ratio to keep FPS smooth */
  private baseDpr = 2;
  private curDpr = 2;
  private ufoHoverId = "";
  private moonMission: MoonMissionState | null = null;
  private moonMissionTimer = 80;
  private onMoonLand?: () => void;
  private onMoonMissionChange?: (active: boolean) => void;
  private prevMoonPos = new THREE.Vector3();
  private tiangongFlag: THREE.Mesh | null = null;
  private moonFlagPole: THREE.Group | null = null;
  private sunHeatMats: THREE.ShaderMaterial[] = [];
  /* galaxy container — spiral arm stars, core bulge, halo, clickable stars */
  private solarRoot = new THREE.Group();
  private galaxyGroup = new THREE.Group();
  private starMarkers: {
    id: string;
    name: string;
    color: string;
    glow: THREE.Sprite;
    world: THREE.Vector3;
    mesh: THREE.Mesh;
    /* interaction: pulsing reticle + hover name plate */
    reticle?: THREE.Sprite;
    label?: THREE.Sprite;
    /* real physics: proper motion + binary orbit */
    orbit?: { center: THREE.Vector3; axis: THREE.Vector3; phase: number; rate: number; radius: number };
    proper?: THREE.Vector3;
    properCycle: number;
    base: THREE.Vector3;
  }[] = [];
  private solMarker: THREE.Sprite | null = null;
  private onStarClick?: (id: string) => void;
  private hoverStar: string | null = null;
  private neighborGalaxies: { id: string; name: string; color: string; group: THREE.Group; world: THREE.Vector3; scale: number }[] = [];
  private onGalaxyClick?: (id: string) => void;
  private hoverGalaxy: string | null = null;
  private galaxyFocusId: string | null = null;
  private exoFocusId: string | null = null;
  private starFocusId: string | null = null;
  private galaxyLocal = { theta: 0.4, phi: 1.3, radius: 30 };
  private exoPlanets: { def: (typeof EXO_PLANETS)[number]; pivot: THREE.Group; mesh: THREE.Mesh; glow: THREE.Sprite; angle: number; world: THREE.Vector3; parentGalaxyId: string }[] = [];
  private hoverExo: string | null = null;
  private onExoPlanetClick?: (id: string) => void;

  /* ---- GALAXY INTERIOR (星系内部) — enter any galaxy, view its stars & planets ---- */
  private galaxyInteriorGroup = new THREE.Group();
  private galaxyInteriorCurrent: string | null = null;
  /* star markers (mirrors starMarkers): clickable, proper motion, orbits */
  private galaxyInteriorStarMarkers: {
    id: string;
    name: string;
    color: string;
    glow: THREE.Sprite;
    reticle: THREE.Sprite;
    world: THREE.Vector3;
    mesh: THREE.Mesh;
    orbit?: { center: THREE.Vector3; axis: THREE.Vector3; phase: number; rate: number; radius: number };
    proper?: THREE.Vector3;
    properCycle: number;
    base: THREE.Vector3;
  }[] = [];
  /* exoplanets orbiting the interior stars */
  private galaxyInteriorExoPlanets: {
    def: GalaxyInteriorPlanet;
    pivot: THREE.Group;
    mesh: THREE.Mesh;
    glow: THREE.Sprite;
    orbitDist: number;
    angle: number;
    world: THREE.Vector3;
    parentStarId: string;
  }[] = [];
  private galaxyInteriorBg: THREE.Points | null = null;
  private galaxyInteriorLocal = { theta: 0.5, phi: 1.2, radius: 60 };
  private galaxyInteriorFocusId: string | null = null;
  private hoverGalaxyInterior: string | null = null;
  private hoverGalaxyInteriorExo: string | null = null;
  private onGalaxyInteriorStarClick?: (id: string) => void;
  private onGalaxyInteriorPlanetClick?: (id: string) => void;

  /* star-system sub-level — the solar-system-like view of ONE interior star */
  private interiorSystemGroup = new THREE.Group();
  private interiorSystemStarId: string | null = null;
  private interiorSystemPlanets: {
    def: GalaxyInteriorPlanet;
    mesh: THREE.Mesh;
    glow: THREE.Sprite;
    orbitDist: number;
    angle: number;
    world: THREE.Vector3;
  }[] = [];
  private interiorSystemLocal = { theta: 0.4, phi: 1.25, radius: 48 };
  private interiorSystemFocusPlanetId: string | null = null;
  private hoverInteriorSysPlanet: string | null = null;

  /* moon as its own body — camera flies to the real orbiting moon */
  private moonFocus = false;
  private moonLocal = { theta: 0.4, phi: 1.35, radius: 1.7 };

  private mode: BodyMode = "earth";
  private bodyTex: Record<SingleBodyMode, THREE.Texture>;
  private clouds: THREE.Mesh;
  private cloudOffset = 0;
  private switching = false;

  private dragging = false;
  private panning = false;
  private lastX = 0;
  private lastY = 0;
  private idleUntil = 0;
  /* multi-touch pinch-to-zoom (mobile / tablet) */
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchDist = 0;
  private pinched = false;

  private onFps?: (fps: number) => void;
  private onHover?: (h: HoverInfo | null) => void;
  private onNodeClick?: (id: string) => void;
  private onPlanetClick?: (id: string) => void;
  private hoverId: string | null = null;
  private moved = false;
  private downX = 0;
  private downY = 0;
  private fpsAcc = 0;
  private fpsTime = 0;

  private dotTex: THREE.CanvasTexture;
  private crossTex: THREE.CanvasTexture;
  private resizeObs: ResizeObserver;

  constructor(
    container: HTMLElement,
    opts: {
      onFps?: (fps: number) => void;
      onHover?: (h: HoverInfo | null) => void;
      onNodeClick?: (id: string) => void;
      onPlanetClick?: (id: string) => void;
      onAlien?: (id: string) => void;
      onSatelliteClick?: (id: string) => void;
      onMoonClick?: () => void;
      onUfoTelemetry?: (d: { id: string; dist: number; speed: number; size: number }) => void;
      onRocketEvent?: (k: "dock" | "observe" | "intercept") => void;
      onStats?: (s: { triangles: number; alt: number; nodes: number }) => void;
      onMoonLand?: () => void;
      onMoonMissionChange?: (active: boolean) => void;
      onStarClick?: (id: string) => void;
      onGalaxyClick?: (id: string) => void;
      onExoPlanetClick?: (id: string) => void;
      onGalaxyInteriorStarClick?: (id: string) => void;
      onGalaxyInteriorPlanetClick?: (id: string) => void;
    } = {}
  ) {
    this.container = container;
    this.onFps = opts.onFps;
    this.onHover = opts.onHover;
    this.onNodeClick = opts.onNodeClick;
    this.onPlanetClick = opts.onPlanetClick;
    this.onAlien = opts.onAlien;
    this.onSatelliteClick = opts.onSatelliteClick;
    this.onMoonClick = opts.onMoonClick;
    this.onUfoTelemetry = opts.onUfoTelemetry;
    this.onRocketEvent = opts.onRocketEvent;
    this.onStats = opts.onStats;
    this.onMoonLand = opts.onMoonLand;
    this.onMoonMissionChange = opts.onMoonMissionChange;
    this.onStarClick = opts.onStarClick;
    this.onGalaxyClick = opts.onGalaxyClick;
    this.onExoPlanetClick = opts.onExoPlanetClick;
    this.onGalaxyInteriorStarClick = opts.onGalaxyInteriorStarClick;
    this.onGalaxyInteriorPlanetClick = opts.onGalaxyInteriorPlanetClick;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    const canvas = this.renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.cursor = "crosshair";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      /* the deep galaxy-interior backdrop sits beyond radius 1000. If the
         far plane sits at 1000 (was Milky Way only), diving into a galaxy
         clips the whole backdrop away → black screen */
      4000
    );

    this.dotTex = makeGlowDotTexture();
    this.crossTex = makeCrosshairTexture();
    this.bodyTex = {
      earth: makeTacticalTexture("earth"),
      moon: makeTacticalTexture("moon"),
      sol: makeTacticalTexture("sol"),
    };

    /* lights — darker ambient so the night side reads as true night */
    this.ambLight = new THREE.AmbientLight(0x1e2a40, 0.9);
    this.sunLight = new THREE.DirectionalLight(0x99ddff, 2.6);
    this.sunLight.position.set(6, 4, 8);
    this.scene.add(this.ambLight, this.sunLight);
    /* solar root holds earth-view + system-view; galaxy lives beside it */
    this.scene.add(this.solarRoot);
    this.galaxyGroup.visible = false;
    this.scene.add(this.galaxyGroup);
    this.galaxyInteriorGroup.visible = false;
    this.scene.add(this.galaxyInteriorGroup);
    this.interiorSystemGroup.visible = false;
    this.scene.add(this.interiorSystemGroup);

    /* body tilt — the whole solar system lives under solarRoot so it can
       shrink into a single point when we zoom out to the galaxy */
    this.bodyGroup.rotation.z = 0.32;
    this.solarRoot.add(this.bodyGroup);

    /* globe */
    this.globeMat = new THREE.MeshPhongMaterial({
      map: this.bodyTex.earth,
      emissive: 0x0a1424,
      emissiveIntensity: 0.85,
      specular: 0x336688,
      shininess: 14,
      transparent: true,
      opacity: 1,
    });
    this.globe = new THREE.Mesh(new THREE.SphereGeometry(BODY_R, 96, 64), this.globeMat);
    this.bodyGroup.add(this.globe);

    /* atmosphere shells — thin realistic blue edge, not a force field */
    this.atmoU = {
      uColor: { value: new THREE.Color(BODY_CFG.earth.atmo) },
      uIntensity: { value: 0.55 },
      uPower: { value: 3.4 },
    };
    this.atmo = new THREE.Mesh(
      new THREE.SphereGeometry(BODY_R * 1.16, 64, 48),
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
        uniforms: this.atmoU,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    this.bodyGroup.add(this.atmo);

    this.innerAtmoU = {
      uColor: { value: new THREE.Color(BODY_CFG.earth.atmo) },
      uIntensity: { value: 0.4 },
      uPower: { value: 5.2 },
    };
    this.innerAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(BODY_R * 1.015, 64, 48),
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
        uniforms: this.innerAtmoU,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    this.bodyGroup.add(this.innerAtmo);

    /* subtle realistic rim sheen — no more energy-shield halo */
    this.glowMat = new THREE.SpriteMaterial({
      map: this.dotTex,
      color: BODY_CFG.earth.glow,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    this.glowSprite = new THREE.Sprite(this.glowMat);
    this.glowSprite.scale.setScalar(5.6);
    this.bodyGroup.add(this.glowSprite);

    /* cloud layer — real texture injected asynchronously */
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(BODY_R * 1.028, 96, 64),
      new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.92, depthWrite: false })
    );
    this.clouds.visible = false;
    this.bodyGroup.add(this.clouds);

    /* dust particles near globe */
    const dustCount = 750;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = BODY_R * (1.3 + Math.random() * 2.1);
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);
      dustPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      dustPos[i * 3 + 1] = r * Math.cos(p) * 0.7;
      dustPos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        size: 0.035,
        map: this.dotTex,
        color: 0x66f0ff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(this.dust);

    /* far starfield — dense sky with a realistic colour mix */
    const starCount = 2400;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 46 + Math.random() * 44;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);
      starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      starPos[i * 3 + 1] = r * Math.cos(p);
      starPos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      /* realistic stellar colours: blue-white / white / yellow / orange */
      const roll = Math.random();
      const cc =
        roll < 0.15
          ? new THREE.Color(0x9fc8ff)
          : roll < 0.6
            ? new THREE.Color(0xffffff)
            : roll < 0.85
              ? new THREE.Color(0xfff4d0)
              : new THREE.Color(0xffb98a);
      starCol[i * 3] = cc.r;
      starCol[i * 3 + 1] = cc.g;
      starCol[i * 3 + 2] = cc.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.12,
        map: this.dotTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(this.stars);

    /* Milky Way band — we sit INSIDE the galactic disc, so the sky carries a
       river of dense starlight along a tilted great circle, plus soft haze */
    const bandN = new THREE.Vector3(0.52, 1, 0.34).normalize();
    const bandU = new THREE.Vector3().crossVectors(bandN, new THREE.Vector3(0, 0, 1)).normalize();
    const bandV = new THREE.Vector3().crossVectors(bandN, bandU).normalize();
    const bandCount = 5200;
    const bandPos = new Float32Array(bandCount * 3);
    for (let i = 0; i < bandCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 38;
      const spread = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 2.4;
      const px = bandU.x * Math.cos(t) * r + bandV.x * Math.sin(t) * r + bandN.x * spread;
      const py = bandU.y * Math.cos(t) * r + bandV.y * Math.sin(t) * r + bandN.y * spread;
      const pz = bandU.z * Math.cos(t) * r + bandV.z * Math.sin(t) * r + bandN.z * spread;
      bandPos[i * 3] = px;
      bandPos[i * 3 + 1] = py;
      bandPos[i * 3 + 2] = pz;
    }
    const bandGeo = new THREE.BufferGeometry();
    bandGeo.setAttribute("position", new THREE.BufferAttribute(bandPos, 3));
    this.milkyWay = new THREE.Points(
      bandGeo,
      new THREE.PointsMaterial({
        size: 0.1,
        map: this.dotTex,
        color: 0xd8e8ff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(this.milkyWay);
    /* soft glow blobs strung along the band — unresolved star clouds */
    for (let i = 0; i < 30; i++) {
      const t = (i / 30) * Math.PI * 2 + Math.random() * 0.2;
      const r = 54 + Math.random() * 30;
      const spread = (Math.random() - 0.5) * 3;
      const haze = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: 0x9fc0e8,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.08 + Math.random() * 0.08,
        })
      );
      haze.scale.setScalar(10 + Math.random() * 16);
      haze.position.set(
        bandU.x * Math.cos(t) * r + bandV.x * Math.sin(t) * r + bandN.x * spread,
        bandU.y * Math.cos(t) * r + bandV.y * Math.sin(t) * r + bandN.y * spread,
        bandU.z * Math.cos(t) * r + bandV.z * Math.sin(t) * r + bandN.z * spread
      );
      this.milkyWayHaze.add(haze);
    }
    this.scene.add(this.milkyWayHaze);

    /* decor rings */
    const ringMatA = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringMatB = new THREE.MeshBasicMaterial({
      color: 0xffb000,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.decorA = new THREE.Mesh(new THREE.RingGeometry(BODY_R * 1.33, BODY_R * 1.345, 200), ringMatA);
    this.decorA.rotation.x = 1.15;
    this.decorB = new THREE.Mesh(new THREE.RingGeometry(BODY_R * 1.48, BODY_R * 1.495, 200), ringMatB);
    this.decorB.rotation.x = -1.45;

    const dashPoints: THREE.Vector3[] = [];
    const dashR = BODY_R * 1.62;
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      dashPoints.push(new THREE.Vector3(Math.cos(a) * dashR, 0, Math.sin(a) * dashR));
    }
    const dashGeo = new THREE.BufferGeometry().setFromPoints(dashPoints);
    this.dashedRing = new THREE.Line(
      dashGeo,
      new THREE.LineDashedMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.32,
        dashSize: 0.18,
        gapSize: 0.14,
      })
    );
    this.dashedRing.computeLineDistances();

    this.decorGroup.add(this.decorA, this.decorB, this.dashedRing);
    this.bodyGroup.add(this.decorGroup);

    /* nodes */
    this.bodyGroup.add(this.nodesGroup);

    /* solar system */
    this.buildSystem();

    /* central sun light — planets get true day/night sides from the star */
    const sunPoint = new THREE.PointLight(0xfff1d6, 3.4, 0, 0);
    sunPoint.position.set(0, 0, 0);
    this.systemGroup.add(sunPoint);

    /* orbital satellites & stations (interactive matrix) */
    this.buildOrbitals();

    /* moon orbiting earth in the terran view */
    this.buildEarthMoon();

    /* render lab shader material */
    this.buildLabMaterial();

    /* easter eggs: comets + wandering UFOs */
    this.initComets();
    this.initUfos();

    /* milky way galaxy */
    this.buildGalaxy();

    /* real star surface texture (recoloured per spectral type) */
    this.loadTex(
      [
        "https://www.solarsystemscope.com/textures/download/2k_sun.jpg",
        "https://www.solarsystemscope.com/textures/download/1k_sun.jpg",
      ],
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = THREE.RepeatWrapping;
        /* the real solar granulation only replaces the SUN itself —
           distant stars keep their distinct per-class surfaces */
        /* the sun itself gets the pure texture */
        const sun = this.planets.find((p) => p.id === "sol");
        if (sun) {
          const sm = sun.mesh.material as THREE.MeshPhongMaterial;
          sm.map = t;
          sm.emissiveMap = t;
          sm.needsUpdate = true;
        }
      }
    );

    /* real satellite textures (async, procedural fallback stays) */
    this.loadRealTextures();

    /* events */
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("dblclick", this.onDblClick);


    this.resizeObs = new ResizeObserver(() => this.onResize());
    this.resizeObs.observe(container);

    this.clock.start();
    this.raf = requestAnimationFrame(this.tick);
  }

  /* ------------ real NASA-style satellite textures ------------ */

  private loadTex(urls: string[], onLoad: (t: THREE.Texture) => void) {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tryLoad = (i: number) => {
      if (i >= urls.length) return;
      loader.load(urls[i], onLoad, undefined, () => tryLoad(i + 1));
    };
    tryLoad(0);
  }

  private loadRealTextures() {
    const cdn = "https://threejs.org/examples/textures/planets/";
    const gh = "https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/textures/planets/";
    const src = (file: string) => [`${cdn}${file}`, `${gh}${file}`];

    /* earth diffuse — real satellite surface */
    this.loadTex(src("earth_atmos_2048.jpg"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      const old = this.bodyTex.earth;
      this.bodyTex.earth = t;
      this.globeMat.emissiveIntensity = 0.25;
      if (this.mode === "earth") {
        this.globeMat.map = t;
        this.globeMat.needsUpdate = true;
      }
      this.applyToTerra();
      this.realEarthLoaded = true;
      this.syncLightsShell();
      old.dispose();
    });

    /* earth night lights — city lights on the dark side (day/night cycle) */
    this.loadTex(src("earth_lights_2048.png"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      this.lightsU.uNight.value = t;
      if (!this.lightsMat) this.buildNightLights();
      this.syncLightsShell();
    });

    /* earth normal map — relief shading */
    this.loadTex(src("earth_normal_2048.jpg"), (t) => {
      t.wrapS = THREE.RepeatWrapping;
      this.globeMat.normalMap = t;
      this.globeMat.normalScale = new THREE.Vector2(0.8, 0.8);
      this.globeMat.needsUpdate = true;
    });

    /* earth surface — remove the specular glint (bright spot) by keeping
       specular dark and skipping the ocean sun-glint map */
    this.globeMat.specularMap = null;
    this.globeMat.specular = new THREE.Color(0x060a0e);
    this.globeMat.shininess = 6;
    this.globeMat.emissiveIntensity = 0.3;
    this.globeMat.needsUpdate = true;

    /* earth clouds — drifting white layer */
    this.loadTex(src("earth_clouds_1024.png"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      (this.clouds.material as THREE.MeshPhongMaterial).map = t;
      (this.clouds.material as THREE.MeshPhongMaterial).needsUpdate = true;
      this.clouds.visible = this.mode === "earth";
    });

    /* moon — real cratered surface */
    this.loadTex(src("moon_1024.jpg"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      const old = this.bodyTex.moon;
      this.bodyTex.moon = t;
      if (this.mode === "moon") {
        this.globeMat.map = t;
        this.globeMat.bumpMap = t;
        this.globeMat.bumpScale = 0.035;
        this.globeMat.needsUpdate = true;
      }
      this.applyToLuna();
      old.dispose();
    });

    /* ---- other planets: real NASA-based 2k textures (multi-source fallback) ---- */
    const ss = (name: string) => [
      `https://www.solarsystemscope.com/textures/download/2k_${name}.jpg`,
      `https://www.solarsystemscope.com/textures/download/1k_${name}.jpg`,
    ];
    const planetTex: [string, string[]][] = [
      ["mercury", ss("mercury")],
      ["venus", [...ss("venus_atmosphere"), ...ss("venus")]],
      ["mars", ss("mars")],
      ["jupiter", ss("jupiter")],
      ["saturn", ss("saturn")],
      ["uranus", ss("uranus")],
      ["neptune", ss("neptune")],
    ];
    for (const [id, urls] of planetTex) {
      this.loadTex(urls, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = THREE.RepeatWrapping;
        t.anisotropy = 8;
        this.applyPlanetTexture(id, t);
      });
    }

    /* the sun — real solar surface texture (single-body SOL view + system center) */
    this.loadTex(ss("sun"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      const old = this.bodyTex.sol;
      this.bodyTex.sol = t;
      if (this.mode === "sol") {
        this.globeMat.map = t;
        this.globeMat.emissive = new THREE.Color(0xff9a30);
        this.globeMat.emissiveIntensity = 0.5;
        this.globeMat.needsUpdate = true;
      }
      const sunP = this.planets.find((x) => x.id === "sol");
      if (sunP) {
        const m = sunP.mesh.material as THREE.MeshPhongMaterial;
        m.map = t;
        m.emissive = new THREE.Color(0xff9a30);
        m.emissiveIntensity = 0.9;
        m.needsUpdate = true;
      }
      old.dispose();
    });
  }

  private applyPlanetTexture(id: string, tex: THREE.Texture) {
    const p = this.planets.find((x) => x.id === id);
    if (!p) return;
    const mat = p.mesh.material as THREE.MeshPhongMaterial;
    const old = mat.map;
    mat.map = tex;
    mat.needsUpdate = true;
    if (old) old.dispose();
  }

  private applyToTerra() {
    const terra = this.planets.find((p) => p.id === "terra");
    if (!terra) return;
    const mat = terra.mesh.material as THREE.MeshPhongMaterial;
    mat.map = this.bodyTex.earth;
    mat.needsUpdate = true;
  }

  private applyToLuna() {
    const luna = this.planets.find((p) => p.id === "luna");
    if (!luna) return;
    const mat = luna.mesh.material as THREE.MeshPhongMaterial;
    mat.map = this.bodyTex.moon;
    mat.bumpMap = this.bodyTex.moon;
    mat.bumpScale = 0.05;
    mat.needsUpdate = true;
  }

  /* ------------ public API ------------ */

  setMissions(specs: NodeSpec[]) {
    for (const n of this.nodes) {
      this.nodesGroup.remove(n.group);
      n.group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    }
    this.nodes = [];
    for (const spec of specs) this.addNode(spec);
  }

  private addNode(spec: NodeSpec) {
    const local = latLonToVector3(spec.lat, spec.lon, BODY_R);
    const group = new THREE.Group();
    group.position.copy(local);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), local.clone().normalize());

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.012, 6, 42),
      new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const spinA = new THREE.Group();
    spinA.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.01, 6, 32),
      new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const spinB = new THREE.Group();
    spinB.rotation.x = 1.25;
    spinB.add(ring2);

    const pulseU = {
      uTime: { value: 0 },
      uSpeed: { value: 0.45 },
      uPhase: { value: Math.random() },
      uColor: { value: new THREE.Color(spec.color) },
    };
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.09, 0.125, 48),
      new THREE.ShaderMaterial({
        vertexShader: PULSE_VERT,
        fragmentShader: PULSE_FRAG,
        uniforms: pulseU,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: spec.color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    glow.scale.setScalar(0.55);

    const cross = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.crossTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
    );
    cross.scale.setScalar(0.001);

    group.add(spinA, spinB, pulse, glow, cross);
    this.nodesGroup.add(group);
    group.updateWorldMatrix(true, false);

    this.nodes.push({
      id: spec.id,
      name: spec.name,
      color: spec.color,
      lat: spec.lat,
      lon: spec.lon,
      group,
      spinA,
      spinB,
      pulse,
      pulseU,
      glow,
      cross,
      boost: 0,
      locked: false,
      world: group.getWorldPosition(new THREE.Vector3()),
    });
  }

  selectMission(id: string | null) {
    this.activeId = id;
    for (const n of this.nodes) {
      const active = n.id === id;
      n.locked = false;
      gsap.to(n.cross.scale, {
        x: active ? 0.62 : 0.001,
        y: active ? 0.62 : 0.001,
        z: 1,
        duration: active ? 0.5 : 0.3,
        ease: "power2.out",
      });
      gsap.to(n.glow.material, { opacity: active ? 1 : 0.7, duration: 0.5 });
    }
    if (id) {
      const node = this.nodes.find((n) => n.id === id);
      if (node) this.flyToWorld(node.world, 3.55, 2.4);
    } else {
      this.resetView(1.6);
    }
  }

  setTargetLock(locked: boolean) {
    const node = this.nodes.find((n) => n.id === this.activeId);
    if (!node) return;
    node.locked = locked;
    if (locked) {
      /* reset pulse phase for an immediate burst */
      node.pulseU.uPhase.value = -((this.time * node.pulseU.uSpeed.value) % 1);
      gsap.to(node.pulseU.uSpeed, { value: 1.35, duration: 0.3 });
    } else {
      gsap.to(node.pulseU.uSpeed, { value: 0.45, duration: 0.6 });
    }
  }

  flyToWorld(world: THREE.Vector3, zoom = 3.6, duration = 2.2) {
    const dir = world.clone().normalize();
    const camPos = dir.multiplyScalar(BODY_R * zoom);
    const target = cartesianToSph(camPos);
    target.theta = unwrapTheta(this.sph.theta, target.theta);

    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.sph, {
      theta: target.theta,
      phi: target.phi,
      radius: target.radius,
      duration,
      ease: "power3.inOut",
    });
    gsap.to(this.lookAt, {
      x: world.x,
      y: world.y,
      z: world.z,
      duration,
      ease: "power2.inOut",
    });
    this.idleUntil = this.time + duration + 2.2;
  }

  resetView(duration = 1.8) {
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    const home = { ...this.homeSph, theta: unwrapTheta(this.sph.theta, this.homeSph.theta) };
    gsap.to(this.sph, { ...home, duration, ease: "power3.inOut" });
    gsap.to(this.lookAt, { x: 0, y: 0, z: 0, duration, ease: "power2.inOut" });
    this.idleUntil = this.time + duration + 1.5;
  }

  switchBody(mode: BodyMode) {
    if (this.switching) return;
    /* GALAXY INTERIOR — enter an extragalactic star system */
    if (mode === "galaxyInterior") {
      if (this.mode === "galaxyInterior") return;
      if (this.mode === "galaxy" && this.galaxyFocusId && this.galaxyFocusId !== "milky-way") {
        this.enterGalaxyInterior(this.galaxyFocusId);
      }
      return;
    }
    /* if currently inside a galaxy interior, exit first then continue to the requested mode */
    if (this.mode === "galaxyInterior") {
      this.exitGalaxyInterior();
      /* after exit we're back in the galaxy — now chain to the requested mode */
      if (mode === "galaxy") return;
      if (mode === "system") {
        this.exitGalaxyToSystem();
        return;
      }
      if (mode === "earth" || mode === "sol") {
        this.exitGalaxy("earth");
        if (mode === "sol") this.swapSingleBody("sol");
        return;
      }
      if (mode === "moon") {
        this.exitGalaxy("earth");
        setTimeout(() => this.focusMoon(), 1300);
        return;
      }
      return;
    }
    /* GALAXY — zoom out to the milky way / back in */
    if (mode === "galaxy") {
      if (this.mode !== "galaxy") this.enterGalaxy();
      return;
    }
    /* LUNA is the real orbiting moon — fly to it instead of swapping textures */
    if (mode === "moon") {
      if (this.mode === "system") {
        this.exitSystem("earth");
        setTimeout(() => this.focusMoon(), 1300);
      } else if (this.mode === "earth") {
        this.focusMoon();
      }
      return;
    }
    if (mode === this.mode) {
      /* pressing EARTH again releases the moon focus */
      if (mode === "earth" && this.moonFocus) this.clearMoonFocus();
      return;
    }
    this.switching = true;
    if (mode === "system") this.enterSystem();
    else if (this.mode === "system") this.exitSystem(mode);
    else this.swapSingleBody(mode);
  }

  private swapSingleBody(mode: SingleBodyMode) {
    const cfg = BODY_CFG[mode];
    const prev = this.mode;
    const prevCfg = BODY_CFG[prev];
    const fromAtmo = prevCfg.atmo;
    const toAtmo = cfg.atmo;

    const proxy = { t: 0 };
    const fromC = new THREE.Color(fromAtmo);
    const toC = new THREE.Color(toAtmo);
    const fromG = new THREE.Color(prevCfg.glow);
    const toG = new THREE.Color(cfg.glow);

    const tl = gsap.timeline({ onComplete: () => (this.switching = false) });

    tl.to(this.globeMat, {
      opacity: 0.06,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        this.satFocus = null;
        this.globe.material = this.globeMat;
        this.globeMat.map = this.bodyTex[mode];
        if (mode === "moon") {
          this.globeMat.bumpMap = this.bodyTex.moon;
          this.globeMat.bumpScale = 0.035;
        } else {
          this.globeMat.bumpMap = null;
        }
        this.globe.scale.setScalar(cfg.scale);
        this.clouds.scale.setScalar(cfg.scale);
        this.clouds.visible =
          mode === "earth" && !!(this.clouds.material as THREE.MeshPhongMaterial).map;
        this.decorGroup.scale.setScalar(cfg.scale);
        this.nodesGroup.visible = mode === "earth";
        this.orbitalRoot.visible = mode === "earth";
        if (this.nearUfo) this.nearUfo.group.visible = mode === "earth";
        this.mode = mode;
        this.syncLightsShell();
        this.applyLab();
      },
    }, 0);
    tl.to(this.globeMat, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0.38);
    tl.to(proxy, {
      t: 1,
      duration: 0.9,
      ease: "power2.inOut",
      onUpdate: () => {
        this.atmoU.uColor.value.copy(fromC).lerp(toC, proxy.t);
        this.innerAtmoU.uColor.value.copy(fromC).lerp(toC, proxy.t);
        this.glowMat.color.copy(fromG).lerp(toG, proxy.t);
        this.glowMat.opacity = 0.16 + (mode === "sol" ? 0.08 : 0);
      },
    }, 0);
    /* adjust camera distance if not focused on a mission */
    if (!this.activeId) {
      this.homeSph.radius = cfg.camDist;
      gsap.to(this.sph, { radius: cfg.camDist, duration: 1.1, ease: "power2.inOut" });
    }
  }

  private enterSystem() {
    this.mode = "system";
    this.focusPlanetId = null;
    this.satFocus = null;
    this.moonFocus = false;
    this.finishFlight();
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.globeMat, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        this.bodyGroup.visible = false;
      },
    });
    this.systemGroup.visible = true;
    this.systemGroup.scale.setScalar(0.55);
    gsap.to(this.systemGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power1.out" });
    /* continuous zoom: earth's outer limit (≈13) flows into system range (4–70) */
    this.sph.radius = Math.max(this.sph.radius, 14);
    this.sph.phi = Math.max(this.sph.phi, 0.85);
    this.homeSph = { theta: this.sph.theta, phi: 1.25, radius: 34 };
    this.lookAt.set(0, 0, 0);
    this.switching = false;
    (this.stars.material as THREE.PointsMaterial).size = 0.16;
    this.dust.visible = false;
    this.decorGroup.visible = false;
    this.nodesGroup.visible = false;
    this.clouds.visible = false;
    if (this.nearUfo) this.nearUfo.group.visible = false;
    this.syncLightsShell();
    this.idleUntil = this.time + 3;
  }

  private exitSystem(mode: SingleBodyMode) {
    const cfg = BODY_CFG[mode];
    this.mode = mode;
    this.focusPlanetId = null;
    this.satFocus = null;
    this.moonFocus = false;
    this.finishFlight();
    /* re-sync spherical state from wherever the camera actually is */
    const s = cartesianToSph(this.camera.position);
    this.sph = { theta: s.theta, phi: s.phi, radius: s.radius };
    this.lookAt.set(0, 0, 0);
    this.systemGroup.visible = false;
    this.bodyGroup.visible = true;
    this.globeMat.map = this.bodyTex[mode];
    this.globeMat.opacity = 0.06;
    if (mode === "moon") {
      this.globeMat.bumpMap = this.bodyTex.moon;
      this.globeMat.bumpScale = 0.035;
    } else {
      this.globeMat.bumpMap = null;
    }
    this.globe.scale.setScalar(cfg.scale);
    this.clouds.scale.setScalar(cfg.scale);
    this.clouds.visible = mode === "earth" && !!(this.clouds.material as THREE.MeshPhongMaterial).map;
    this.decorGroup.visible = true;
    this.decorGroup.scale.setScalar(cfg.scale);
    this.nodesGroup.visible = mode === "earth";
    this.orbitalRoot.visible = mode === "earth";
    if (this.nearUfo) this.nearUfo.group.visible = mode === "earth";
    this.syncLightsShell();
    this.dust.visible = true;
    (this.stars.material as THREE.PointsMaterial).size = 0.12;
    this.homeSph = { theta: 0.9, phi: 1.18, radius: cfg.camDist };

    const proxy = { t: 0 };
    const fromC = this.atmoU.uColor.value.clone();
    const toC = new THREE.Color(cfg.atmo);
    const fromG = this.glowMat.color.clone();
    const toG = new THREE.Color(cfg.glow);

    gsap.to(this.globeMat, { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.15 });
    gsap.to(proxy, {
      t: 1,
      duration: 0.9,
      ease: "power2.inOut",
      onUpdate: () => {
        this.atmoU.uColor.value.copy(fromC).lerp(toC, proxy.t);
        this.innerAtmoU.uColor.value.copy(fromC).lerp(toC, proxy.t);
        this.glowMat.color.copy(fromG).lerp(toG, proxy.t);
        this.glowMat.opacity = 0.16 + (mode === "sol" ? 0.08 : 0);
      },
    });
    /* continuous zoom back into the single-body view */
    this.sph.radius = Math.min(this.sph.radius, cfg.camDist);
    this.sph.phi = Math.min(Math.max(this.sph.phi, 0.4), 2.4);
    this.lookAt.set(0, 0, 0);
    this.switching = false;
  }

  getMode() {
    return this.mode;
  }

  /** render quality from settings — sets the pixel-ratio ceiling */
  setQuality(level: "low" | "med" | "high") {
    const cap = level === "low" ? 1 : level === "med" ? 1.5 : 2;
    this.baseDpr = Math.min(window.devicePixelRatio || 1, cap);
    this.curDpr = this.baseDpr;
    this.applyDpr();
  }

  /** apply the current pixel ratio (called when quality or adaptive scale changes) */
  private applyDpr() {
    this.renderer.setPixelRatio(this.curDpr);
    this.onResize();
  }

  /**
   * adaptive resolution — when FPS drops, step the pixel ratio down to keep
   * the view smooth; when it recovers, step it back up toward the quality cap.
   * Hysteresis (48/57) prevents rapid thrashing between two levels.
   */
  private adaptResolution(fps: number) {
    if (fps >= 48 && fps <= 57) return;
    const floor = this.baseDpr * 0.5;
    if (fps < 48 && this.curDpr > floor) {
      this.curDpr = Math.max(floor, this.curDpr * 0.8);
      this.applyDpr();
    } else if (fps > 57 && this.curDpr < this.baseDpr) {
      this.curDpr = Math.min(this.baseDpr, this.curDpr / 0.8);
      this.applyDpr();
    }
  }

  /* ------------ solar system ------------ */

  private buildSystem() {
    for (const def of PLANET_DEFS) {
      const entry = this.buildPlanetEntry(def);
      if (def.isMoon) {
        const parent = this.planets.find((p) => p.id === (def.moonOf ?? "terra"));
        if (parent) {
          parent.group.add(entry.group);
          const r = def.moonR ?? parent.radius * 2.2;
          entry.mesh.position.x = r;
          entry.glow.position.x = r;
          entry.highlight.position.x = r;
          entry.moon = { pivot: entry.group, angle: Math.random() * Math.PI * 2, speed: def.moonSpeed ?? 0.5 };
          /* faint orbit ring for the moon, in the parent planet's local space */
          const moonPts: THREE.Vector3[] = [];
          for (let i = 0; i <= 96; i++) {
            const a = (i / 96) * Math.PI * 2;
            moonPts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
          }
          const mg = new THREE.BufferGeometry().setFromPoints(moonPts);
          parent.group.add(
            new THREE.Line(mg, new THREE.LineBasicMaterial({ color: new THREE.Color(entry.color), transparent: true, opacity: 0.32 }))
          );
        }
      } else {
        this.systemGroup.add(entry.group);
      }
      this.planets.push(entry);
    }

    /* asteroid belt between mars and jupiter */
    const beltCount = 700;
    const beltPos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 14.2 + Math.random() * 2.4;
      beltPos[i * 3] = Math.cos(a) * r;
      beltPos[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
      beltPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const beltGeo = new THREE.BufferGeometry();
    beltGeo.setAttribute("position", new THREE.BufferAttribute(beltPos, 3));
    this.belt = new THREE.Points(
      beltGeo,
      new THREE.PointsMaterial({
        size: 0.05,
        map: this.dotTex,
        color: 0x9aa6c0,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.systemGroup.add(this.belt);

    /* drifting asteroid rocks of all sizes, spread across the whole system */
    this.buildAsteroids();

    /* outer perimeter dashed ring */
    const orPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      orPoints.push(new THREE.Vector3(Math.cos(a) * 39.5, 0, Math.sin(a) * 39.5));
    }
    const orGeo = new THREE.BufferGeometry().setFromPoints(orPoints);
    this.outerSystemRing = new THREE.Line(
      orGeo,
      new THREE.LineDashedMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.16,
        dashSize: 0.5,
        gapSize: 0.4,
      })
    );
    this.outerSystemRing.computeLineDistances();
    this.systemGroup.add(this.outerSystemRing);

    /* Kuiper belt — faint icy trans-Neptunian debris beyond the perimeter */
    const kuiperCount = 1600;
    const kuiperPos = new Float32Array(kuiperCount * 3);
    for (let i = 0; i < kuiperCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 38.5 + Math.random() * 3.4;
      kuiperPos[i * 3] = Math.cos(a) * r;
      kuiperPos[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      kuiperPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const kgeo = new THREE.BufferGeometry();
    kgeo.setAttribute("position", new THREE.BufferAttribute(kuiperPos, 3));
    this.kuiperBelt = new THREE.Points(
      kgeo,
      new THREE.PointsMaterial({
        size: 0.05,
        map: this.dotTex,
        color: 0x8aa0c8,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.systemGroup.add(this.kuiperBelt);

    /* orbit path rings */
    for (const p of this.planets) {
      if (p.dist <= 0.1) continue;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: new THREE.Color(p.color), transparent: true, opacity: 0.13 })
      );
      this.systemGroup.add(line);
    }

    this.systemGroup.rotation.z = 0.16;
    this.systemGroup.visible = false;
    this.solarRoot.add(this.systemGroup);
  }

  private buildAsteroids() {
    /* shared material pool (cheap draw calls) */
    const rockMats = Array.from({ length: 6 }, () => {
      const shade = 0.42 + Math.random() * 0.42;
      return new THREE.MeshPhongMaterial({
        color: new THREE.Color(shade * 0.75, shade * 0.68, shade * 0.6),
        flatShading: true,
        shininess: 5,
      });
    });

    const count = 220;
    for (let i = 0; i < count; i++) {
      /* size distribution: 20 large · 60 medium · 140 small shards */
      const roll = Math.random();
      const s =
        roll < 0.09
          ? 0.11 + Math.random() * 0.11
          : roll < 0.36
            ? 0.05 + Math.random() * 0.06
            : 0.015 + Math.random() * 0.035;
      const geo = new THREE.IcosahedronGeometry(s, s > 0.05 ? 1 : 0);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let v = 0; v < pos.count; v++) {
        const f = 0.7 + Math.random() * 0.6;
        pos.setXYZ(v, pos.getX(v) * f, pos.getY(v) * f, pos.getZ(v) * f);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, rockMats[i % rockMats.length]);
      const angle = Math.random() * Math.PI * 2;
      const inc = (Math.random() - 0.5) * 0.55;
      /* inner belt → outer rim, plus a debris lane near terra's orbit */
      const dist =
        i < 185
          ? 11.5 + Math.random() * 27.5
          : 9.4 + Math.random() * 0.9;
      mesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist * inc, Math.sin(angle) * dist);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      this.systemGroup.add(mesh);
      this.asteroids.push({
        mesh,
        angle,
        dist,
        inc,
        speed: (0.075 + Math.random() * 0.07) / Math.sqrt(dist / 10),
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 1.6,
          (Math.random() - 0.5) * 1.6,
          (Math.random() - 0.5) * 1.6
        ),
      });
    }
  }

  /* ------------ comets ------------ */

  private cometPosOf(a: number, e: number, inc: number, omega: number, angle: number, out: THREE.Vector3) {
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle) * Math.sin(inc);
    const z = r * Math.sin(angle) * Math.cos(inc);
    const cosO = Math.cos(omega);
    const sinO = Math.sin(omega);
    out.set(x * cosO + z * sinO, y, -x * sinO + z * cosO);
    return out;
  }

  private initComets() {
    const defs = [
      { a: 26, e: 0.75, inc: 1.15, omega: 0.5, speed: 0.09, color: 0x9fd8ff },
      { a: 21, e: 0.7, inc: -2.0, omega: 2.6, speed: -0.11, color: 0xc9f7b2 },
    ];
    for (const d of defs) {
      const nucleus = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: 0xffffff,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      nucleus.scale.setScalar(0.5);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: d.color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        })
      );
      glow.scale.setScalar(1.8);
      const angle0 = Math.random() * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let i = 45; i >= 0; i--) {
        const aa = angle0 - i * 0.035 * Math.sign(d.speed);
        pts.push(this.cometPosOf(d.a, d.e, d.inc, d.omega, aa, new THREE.Vector3()));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const trail = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: d.color,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      this.systemGroup.add(nucleus, glow, trail);
      this.comets.push({
        a: d.a,
        e: d.e,
        inc: d.inc,
        omega: d.omega,
        angle: angle0,
        speed: d.speed,
        nucleus,
        glow,
        trail,
        pts,
        tmp: new THREE.Vector3(),
      });
    }
  }

  private updateComets(dt: number) {
    for (const c of this.comets) {
      const r = (c.a * (1 - c.e * c.e)) / (1 + c.e * Math.cos(c.angle));
      c.angle += c.speed * dt * (1 + 40 / (r * r));
      c.pts.pop();
      c.pts.unshift(this.cometPosOf(c.a, c.e, c.inc, c.omega, c.angle, c.tmp).clone());
      c.nucleus.position.copy(c.pts[0]);
      c.glow.position.copy(c.pts[0]);
      const g = c.trail.geometry as THREE.BufferGeometry;
      g.setFromPoints(c.pts);
      g.attributes.position.needsUpdate = true;
    }
  }

  /* ------------ wandering UFOs ------------ */

  private makeUfo(scale: number, color: number) {
    const g = new THREE.Group();
    const lights: { sprite: THREE.Sprite; phase: number }[] = [];
    const disc = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 18, 10),
      new THREE.MeshPhongMaterial({
        color,
        emissive: 0x0a2a14,
        emissiveIntensity: 0.9,
        shininess: 70,
      })
    );
    disc.scale.set(1, 0.3, 1);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({
        color: 0x9ffff0,
        emissive: 0x1a5f55,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.85,
        shininess: 90,
      })
    );
    dome.position.y = 0.05;
    g.add(disc, dome);
    const rimColors = [0xff4455, 0xffb000];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: rimColors[i % 2],
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      sp.scale.setScalar(0.07);
      sp.position.set(Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.26);
      g.add(sp);
      lights.push({ sprite: sp, phase: i * 0.9 });
    }
    const under = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0x7cff6b,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      })
    );
    under.scale.setScalar(0.5);
    under.position.y = -0.18;
    g.add(under);
    g.scale.setScalar(scale);
    return { group: g, lights };
  }

  private pickUfoWaypoint(): THREE.Vector3 {
    const p = this.planets[Math.floor(Math.random() * this.planets.length)];
    return new THREE.Vector3(
      Math.cos(p.angle) * p.dist + (Math.random() - 0.5) * 2.4,
      (Math.random() - 0.5) * 1.6,
      Math.sin(p.angle) * p.dist + (Math.random() - 0.5) * 2.4
    );
  }

  private initUfos() {
    /* two patrol the solar system */
    for (let i = 0; i < 2; i++) {
      const m = this.makeUfo(1, 0x86c9ff);
      const from = new THREE.Vector3(
        18 + Math.random() * 16,
        (Math.random() - 0.5) * 3,
        8 + Math.random() * 14
      );
      m.group.position.copy(from);
      this.systemGroup.add(m.group);
      this.ufos.push({
        id: `ufo_0${i + 1}`,
        group: m.group,
        lights: m.lights,
        from: from.clone(),
        to: this.pickUfoWaypoint(),
        t: 0,
        dur: 8 + Math.random() * 8,
        system: true,
      });
    }
    /* one patrols the earth globe in terran view */
    const m2 = this.makeUfo(0.5, 0xc9ff86);
    m2.group.position.set(4.5, 0.8, 0);
    this.bodyGroup.add(m2.group);
    this.nearUfo = {
      id: "ufo_near",
      group: m2.group,
      lights: m2.lights,
      from: new THREE.Vector3(4.5, 0.8, 0),
      to: new THREE.Vector3(0, 4.2, 4.5),
      t: 0,
      dur: 16,
      system: false,
    };
  }

  private updateUfo(u: UfoEntry, dt: number, system: boolean) {
    if (u.disabled) {
      /* intercepted — respawn far away after cooldown */
      if (u.respawnAt !== undefined && this.time > u.respawnAt) {
        u.disabled = false;
        u.group.visible = true;
        u.group.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 40
        );
        u.from.copy(u.group.position);
        u.to.copy(this.pickUfoWaypoint());
        u.t = 0;
      }
      return;
    }
    u.t += dt;
    const k = Math.min(1, u.t / u.dur);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    u.group.position.lerpVectors(u.from, u.to, e);
    u.group.position.y += Math.sin(this.time * 1.7 + u.t * 3) * 0.12;
    const dir = u.to.clone().sub(u.from).normalize();
    if (dir.lengthSq() > 0.001) {
      u.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    }
    for (const l of u.lights) {
      (l.sprite.material as THREE.SpriteMaterial).opacity =
        Math.sin(this.time * 9 + l.phase) > 0 ? 1 : 0.12;
    }
    if (k >= 1) {
      u.from.copy(u.group.position);
      if (system) {
        u.to.copy(this.pickUfoWaypoint());
      } else {
        const r = 3.6 + Math.random() * 1.6;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(Math.random() * 2 - 1);
        u.to.set(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
      }
      u.t = 0;
      u.dur = 7 + Math.random() * 10;
    }
  }

  /* ------------ rocket launch easter egg ------------ */

  private makeRocket() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.06, 0.32, 12),
      new THREE.MeshPhongMaterial({ color: 0xe8eef4, emissive: 0x1a2430, shininess: 60 })
    );
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.12, 12),
      new THREE.MeshPhongMaterial({ color: 0xff4455, shininess: 50 })
    );
    nose.position.y = 0.22;
    const finGeo = new THREE.BoxGeometry(0.015, 0.1, 0.08);
    const finMat = new THREE.MeshPhongMaterial({ color: 0xff8c2a });
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(finGeo, finMat);
      const a = (i / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.05, -0.12, Math.sin(a) * 0.05);
      fin.rotation.y = -a;
      g.add(fin);
    }
    const flame = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0xffb000,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.95,
      })
    );
    flame.scale.setScalar(0.3);
    flame.position.y = -0.28;
    g.add(body, nose, flame);
    return { group: g, flame };
  }

  /** launch a rocket from Cape Canaveral — [L] key or automatic */
  launchRocket() {
    if (this.rocket && this.rocket.active) return;
    if (this.mode !== "earth" && this.mode !== "system") return;
    const sys = this.mode === "system";
    const terra = this.planets.find((p) => p.id === "terra");
    const parent = sys && terra ? terra.mesh : this.globe;
    const baseR = sys && terra ? terra.radius : BODY_R;
    const rk = this.makeRocket();
    const local = latLonToVector3(28.6, -80.6, baseR);
    const normal = local.clone().normalize();
    const tangent = new THREE.Vector3(normal.z, 0, -normal.x);
    if (tangent.lengthSq() < 1e-4) tangent.set(1, 0, 0);
    tangent.normalize();
    rk.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    parent.add(rk.group);
    this.rocket = {
      group: rk.group,
      flame: rk.flame,
      parent,
      normal,
      tangent,
      baseR,
      t: 0,
      dur: 6.5,
      active: true,
    };
    audio.lock();
  }

  private disposeRocket() {
    const rk = this.rocket;
    if (!rk) return;
    rk.active = false;
    rk.parent.remove(rk.group);
    rk.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.rocket = null;
  }

  private boomAt(pos: THREE.Vector3, color: number, size = 0.9) {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    sp.position.copy(pos);
    sp.scale.setScalar(0.2);
    this.scene.add(sp);
    gsap.to(sp.scale, { x: size, y: size, z: size, duration: 0.7, ease: "power2.out" });
    gsap.to(sp.material, { opacity: 0, duration: 0.7, onComplete: () => this.scene.remove(sp) });
  }

  private updateRocket(dt: number) {
    const rk = this.rocket;
    if (!rk || !rk.active) return;
    rk.t += dt;
    const k = Math.min(1, rk.t / rk.dur);

    if (rk.target && k > 0.22) {
      /* steered phase — dock with the station or chase the UFO */
      let dest: THREE.Vector3 | null = null;
      if (rk.target.type === "dock") {
        const stn = this.orbitals.find((o) => o.id === "stn-01");
        dest = stn ? stn.world : null;
      } else {
        dest = rk.target.ufo && !rk.target.ufo.disabled ? rk.target.ufo.group.position : null;
      }
      if (!dest) dest = rk.group.position.clone().addScaledVector(rk.normal, 30);
      const f = Math.min(1, dt * 2.2);
      rk.group.position.lerp(dest, f);
      rk.group.quaternion.slerp(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dest.clone().sub(rk.group.position).normalize()),
        f
      );
      rk.flame.scale.setScalar(0.2 + Math.random() * 0.12);
      (rk.flame.material as THREE.SpriteMaterial).opacity = 0.6 + Math.random() * 0.4;
      rk.group.scale.setScalar(0.25 + (1 - k) * 0.15);

      /* arrival */
      if (dest.distanceTo(rk.group.position) < 0.34) {
        if (rk.target.type === "dock") {
          this.boomAt(dest, 0x7cffa0, 0.8);
          this.onRocketEvent?.("dock");
        } else if (rk.target.type === "intercept") {
          const ufo = rk.target.ufo;
          if (ufo) {
            this.boomAt(ufo.group.position, 0xff7a3c, 1.6);
            ufo.disabled = true;
            ufo.respawnAt = this.time + 40;
            ufo.group.visible = false;
          }
          this.onRocketEvent?.("intercept");
        } else {
          this.boomAt(dest, 0x7cffd0, 0.6);
          this.onRocketEvent?.("observe");
          const ufo = rk.target.ufo;
          if (ufo) {
            ufo.to.copy(ufo.group.position.clone().addScaledVector(ufo.group.position.clone().normalize(), 18));
            ufo.t = 0;
            ufo.dur = 4;
          }
        }
        this.disposeRocket();
      }
      return;
    }

    /* free ascent phase */
    const rise = k * k * 26;
    const drift = k * k * 3.5;
    rk.group.position
      .copy(rk.normal)
      .multiplyScalar(rk.baseR + 0.35 + rise)
      .addScaledVector(rk.tangent, drift);
    rk.group.rotation.z += dt * 0.9;
    (rk.flame.material as THREE.SpriteMaterial).opacity = 0.65 + Math.random() * 0.35;
    rk.flame.scale.setScalar(0.22 + Math.random() * 0.14);
    rk.group.scale.setScalar(1 - k * 0.7);
    if (k >= 1) this.disposeRocket();
  }

  /* ------------ moon landing program (登月计划) ------------ */

  private makeLunarModule() {
    const root = new THREE.Group();
    /* descent stage — gold-foil octagon */
    const desc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.062, 0.045, 8),
      new THREE.MeshPhongMaterial({ color: 0xcaa84a, emissive: 0x241a05, shininess: 40 })
    );
    root.add(desc);
    /* 4 landing legs */
    const legGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.075, 5);
    const legMat = new THREE.MeshPhongMaterial({ color: 0xb8b2a2, shininess: 50 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.cos(a) * 0.052, -0.05, Math.sin(a) * 0.052);
      leg.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5);
      root.add(leg);
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.006, 8),
        legMat
      );
      pad.position.set(Math.cos(a) * 0.078, -0.085, Math.sin(a) * 0.078);
      root.add(pad);
    }
    /* ascent stage — silver crew module */
    const asc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.036, 0.05, 8),
      new THREE.MeshPhongMaterial({ color: 0xd8dde4, emissive: 0x141a24, shininess: 70 })
    );
    asc.position.y = 0.045;
    root.add(asc);
    /* window */
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.012, 0.004),
      new THREE.MeshPhongMaterial({ color: 0x142438, emissive: 0x0a1a2a, emissiveIntensity: 0.8 })
    );
    win.position.set(0, 0.052, 0.032);
    root.add(win);
    /* antenna */
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.06, 5),
      new THREE.MeshPhongMaterial({ color: 0xe8ecf2 })
    );
    ant.position.y = 0.1;
    root.add(ant);
    const flame = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0xffb000,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    flame.scale.setScalar(0.14);
    flame.position.y = -0.1;
    root.add(flame);
    return { root, flame };
  }

  /** tiny astronaut (proportional to the LM: ~1/3 module height) */
  private makeAstronaut() {
    const root = new THREE.Group();
    const suit = new THREE.MeshPhongMaterial({ color: 0xf2f4f8, shininess: 60 });
    const visorMat = new THREE.MeshPhongMaterial({ color: 0xd9a441, emissive: 0x4a3308, shininess: 90 });
    /* body */
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.03, 10), suit);
    root.add(body);
    /* backpack */
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.008), suit);
    pack.position.z = -0.009;
    root.add(pack);
    /* helmet + gold visor */
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), suit);
    helmet.position.y = 0.021;
    root.add(helmet);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), visorMat);
    visor.position.set(0, 0.022, 0.008);
    root.add(visor);
    /* legs */
    const legG = new THREE.CylinderGeometry(0.005, 0.005, 0.016, 8);
    for (const sx of [-0.006, 0.006]) {
      const leg = new THREE.Mesh(legG, suit);
      leg.position.set(sx, -0.022, 0);
      root.add(leg);
    }
    /* waving arm (right) + idle arm (left) */
    const armG = new THREE.CylinderGeometry(0.004, 0.004, 0.022, 8);
    const leftArm = new THREE.Mesh(armG, suit);
    leftArm.position.set(-0.012, 0.006, 0);
    leftArm.rotation.z = 0.5;
    root.add(leftArm);
    const armPivot = new THREE.Group();
    armPivot.position.set(0.012, 0.012, 0);
    const rightArm = new THREE.Mesh(armG, suit);
    rightArm.position.y = -0.012;
    armPivot.add(rightArm);
    armPivot.rotation.z = -0.3;
    root.add(armPivot);
    /* visibility glow */
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0x9fe8ff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );
    glow.scale.setScalar(0.22);
    glow.position.y = 0.02;
    root.add(glow);
    /* real proportion: astronaut ≈ 26% of the LM height */
    root.scale.setScalar(1.45);
    return { root, arm: armPivot };
  }

  /** launch the lunar lander from Cape Canaveral toward the orbiting moon */
  launchMoonMission(): boolean {
    if (this.mode !== "earth" || this.moonMission || !this.moonInEarth) return false;
    const m = this.makeLunarModule();
    /* world space: the bodyGroup is tilted, so convert the launch site to world */
    const startLocal = latLonToVector3(28.6, -80.6, BODY_R + 0.08);
    const startPos = this.bodyGroup.localToWorld(startLocal);
    const normal = startPos.clone().normalize();
    const tangent = new THREE.Vector3(normal.z, 0, -normal.x).normalize();
    m.root.position.copy(startPos);
    m.root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    this.scene.add(m.root);
    /* seed the moon velocity estimator so the first derivative is sane */
    this.prevMoonPos.copy(this.moonWorldPos(new THREE.Vector3()));
    this.moonMission = {
      phase: "ascent",
      t: 0,
      group: m.root,
      flame: m.flame,
      astronaut: null,
      astroArm: null,
      astroGlow: new THREE.Sprite(),
      landLocal: new THREE.Vector3(),
      normal,
      tangent,
      startPos: startPos.clone(),
      vel: new THREE.Vector3(),
    };
    audio.announce("moon");
    this.onMoonMissionChange?.(true);
    return true;
  }

  private moonWorldPos(out: THREE.Vector3) {
    this.moonInEarth!.mesh.updateWorldMatrix(true, false);
    return this.moonInEarth!.mesh.getWorldPosition(out);
  }

  /** plant the five-star red flag on the moon — permanent, with unfurl animation */
  private plantMoonFlag(
    moonMesh: THREE.Mesh,
    landPoint: THREE.Vector3,
    outward: THREE.Vector3,
    localUp: THREE.Vector3
  ) {
    const pole = new THREE.Group();
    /* thin metallic pole */
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.004, 0.16, 6),
      new THREE.MeshPhongMaterial({ color: 0xd8dde4, shininess: 60 })
    );
    shaft.position.y = 0.08;
    pole.add(shaft);
    /* red flag with stars */
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.066),
      new THREE.MeshBasicMaterial({ map: this.makeChinaFlag(), side: THREE.DoubleSide })
    );
    flag.position.set(0.052, 0.105, 0);
    flag.userData = { moonFlag: true };
    pole.add(flag);
    /* place beside the lander: offset perpendicular to the normal */
    const right = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0)).normalize();
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    const anchor = landPoint.clone().addScaledVector(right, 0.17);
    pole.position.copy(moonMesh.worldToLocal(anchor));
    pole.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
    /* unfurl: pole drives in from below */
    pole.scale.setScalar(0.01);
    moonMesh.add(pole);
    gsap.to(pole.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: "back.out(1.6)" });
    this.moonFlagPole = pole;
  }

  /** engine exhaust puff — expands and fades */
  private exhaustPuff(pos: THREE.Vector3, color = 0xffb060, size = 0.16) {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    sp.position.copy(pos);
    sp.scale.setScalar(0.05);
    this.scene.add(sp);
    gsap.to(sp.scale, { x: size, y: size, z: size, duration: 0.55, ease: "power2.out" });
    gsap.to(sp.material, {
      opacity: 0,
      duration: 0.55,
      onComplete: () => {
        this.scene.remove(sp);
        (sp.material as THREE.Material).dispose();
      },
    });
  }

  private updateMoonMission(dt: number) {
    const mm = this.moonMission;
    const moon = this.moonInEarth;
    if (!mm || !moon) return;
    mm.t += dt;
    const pos = mm.group.position;
    const moonPos = this.moonWorldPos(new THREE.Vector3());
    const moonR = 0.55;

    /* NaN-safe helpers — a zero-length velocity must never reach normalize() */
    const safeNorm = (v: THREE.Vector3) => (v.lengthSq() > 1e-8 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0));
    const orient = (dir: THREE.Vector3, rate: number) => {
      const d = safeNorm(dir);
      mm.group.quaternion.slerp(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d),
        Math.min(1, dt * rate)
      );
    };

    /* moon velocity (numerical derivative — used for velocity matching) */
    const moonVel = moonPos.clone().sub(this.prevMoonPos).divideScalar(Math.max(dt, 1e-4));
    this.prevMoonPos.copy(moonPos);

    switch (mm.phase) {
      case "ascent": {
        /* physics: thrust up + earth gravity — stays BELOW lunar orbit altitude */
        const radial = pos.lengthSq() > 1e-6 ? pos.clone().normalize() : mm.normal;
        mm.vel.addScaledVector(mm.normal, 1.25 * dt);
        mm.vel.addScaledVector(radial, -0.95 * dt);
        mm.vel.addScaledVector(mm.tangent, 0.1 * dt);
        pos.addScaledVector(mm.vel, dt);
        orient(mm.vel, 2.5);
        mm.flame.scale.setScalar(0.1 + Math.random() * 0.08);
        (mm.flame.material as THREE.SpriteMaterial).opacity = 0.6 + Math.random() * 0.4;
        if (Math.random() < 0.7) {
          this.exhaustPuff(pos.clone().addScaledVector(safeNorm(mm.vel), -0.14), 0xffb060, 0.14);
        }
        if (mm.t >= 2.8) {
          mm.phase = "transfer";
          mm.t = 0;
        }
        break;
      }
      case "transfer": {
        /* lead pursuit with moon-frame blending — the lander outruns the moon
           (max 6.0 vs moon's 0.37) and progressively matches its velocity */
        const toMoon = moonPos.clone().sub(pos);
        const dist = toMoon.length();
        const tf = Math.max(1.2, Math.min(4, dist / 3.2));
        const lead = moonPos.clone().addScaledVector(moonVel, tf);
        const toLead = lead.clone().sub(pos);
        const radial = pos.lengthSq() > 1e-6 ? pos.clone().normalize() : new THREE.Vector3(0, 1, 0);
        mm.vel.addScaledVector(radial, -0.35 * dt);
        if (toLead.lengthSq() > 1e-4) mm.vel.addScaledVector(toLead.normalize(), 2.4 * dt);
        mm.vel.clampLength(0, 6.0);
        /* close-range velocity match: slide into the moon's reference frame */
        if (dist < 2.6) {
          mm.vel.lerp(moonVel, Math.min(1, dt * 0.7));
        }
        pos.addScaledVector(mm.vel, dt);
        orient(mm.vel, 1.5);
        (mm.flame.material as THREE.SpriteMaterial).opacity = 0.12 + Math.random() * 0.2;
        mm.flame.scale.setScalar(0.05);
        /* generous handover — the lander ALWAYS catches the moon now */
        if (dist < 1.8 || mm.t > 5.5) {
          mm.phase = "brake";
          mm.t = 0;
        }
        break;
      }
      case "brake": {
        /* velocity match + converge onto the moon reference frame (cannot miss) */
        const outward = moonPos.lengthSq() > 1e-6 ? moonPos.clone().normalize() : new THREE.Vector3(0, 1, 0);
        const hold = outward.clone().multiplyScalar(moonR + 0.62);
        const target = moonPos.clone().add(hold);
        const e = Math.min(1, mm.t / 1.2);
        const ee = e * e;
        pos.lerp(target, ee);
        /* match the moon's orbital velocity so we ride alongside */
        mm.vel.copy(moonVel);
        orient(outward, 3);
        mm.flame.scale.setScalar(0.08 + Math.random() * 0.05);
        (mm.flame.material as THREE.SpriteMaterial).opacity = 0.7 + Math.random() * 0.3;
        if (Math.random() < 0.6) this.exhaustPuff(pos.clone().addScaledVector(outward, -0.14), 0xffc070, 0.15);
        if (e >= 1) {
          mm.phase = "descent";
          mm.t = 0;
        }
        break;
      }
      case "descent": {
        /* frame-locked descent: position is pinned to the moon's reference frame
           (moonPos + radial altitude). The moving moon can never slip away —
           the lander descends straight down onto the surface below it. */
        const outward = moonPos.lengthSq() > 1e-6 ? moonPos.clone().normalize() : new THREE.Vector3(0, 1, 0);
        const surf = moonR + 0.045;
        const d = pos.distanceTo(moonPos);
        const rate = THREE.MathUtils.clamp((d - surf) * 1.1, 0.1, 0.55);
        const newD = Math.max(surf, d - rate * dt);
        pos.copy(moonPos).addScaledVector(outward, newD);
        mm.vel.copy(moonVel).addScaledVector(outward, -rate);
        orient(outward, 3);
        mm.flame.scale.setScalar(0.05 + rate * 0.12);
        (mm.flame.material as THREE.SpriteMaterial).opacity = 0.85;
        if (Math.random() < 0.5) this.exhaustPuff(pos.clone().addScaledVector(outward, -0.1), 0xffd090, 0.12);
        if (newD - surf < 0.005) {
          /* touchdown dust ring */
          for (let i = 0; i < 10; i++) {
            const d2 = new THREE.Vector3(
              (Math.random() - 0.5),
              (Math.random() - 0.5),
              (Math.random() - 0.5)
            )
              .normalize()
              .multiplyScalar(0.05);
            this.exhaustPuff(pos.clone().add(d2), 0xc8b8a0, 0.1);
          }
          /* attach to moon surface — convert world → moon-local so it rides along */
          const landPoint = moonPos.clone().addScaledVector(outward, surf);
          /* local "up" on the moon (surface normal in the moon's own space).
             Using the world normal here was the upside-down bug: as the moon
             orbits, the craft flipped. Local-space alignment sticks to the ground. */
          const moonInvQ = moon.mesh.getWorldQuaternion(new THREE.Quaternion()).invert();
          const localUp = outward.clone().applyQuaternion(moonInvQ).normalize();
          moon.mesh.add(mm.group);
          mm.group.position.copy(moon.mesh.worldToLocal(landPoint.clone()));
          mm.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
          /* astronaut steps out — also ground-aligned */
          const astro = this.makeAstronaut();
          astro.root.position.copy(moon.mesh.worldToLocal(landPoint.clone().addScaledVector(outward, 0.1)));
          astro.root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
          moon.mesh.add(astro.root);
          mm.astronaut = astro.root;
          mm.astroArm = astro.arm;
          mm.astroGlow = (astro.root.children.find((c) => (c as THREE.Sprite).isSprite) as THREE.Sprite);
          /* plant the five-star red flag beside the lander (stays forever) */
          this.plantMoonFlag(moon.mesh, landPoint, outward, localUp);
          mm.phase = "landed";
          mm.t = 0;
          (mm.flame.material as THREE.SpriteMaterial).opacity = 0;
          audio.announce("dock");
          this.onMoonLand?.();
        }
        break;
      }
      case "landed":
        if (mm.t > 1.6) {
          mm.phase = "wave";
          mm.t = 0;
        }
        break;
      case "wave": {
        /* astronaut waves hello */
        if (mm.astroArm) {
          mm.astroArm.rotation.z = -0.3 + Math.sin(this.time * 4.2) * 0.9;
        }
        if (mm.astroGlow) {
          (mm.astroGlow.material as THREE.SpriteMaterial).opacity = 0.4 + Math.sin(this.time * 3) * 0.2;
        }
        if (mm.t > 9) {
          mm.phase = "return";
          mm.t = 0;
        }
        break;
      }
      case "return": {
        /* astronaut waves goodbye then fades back into the lander */
        if (mm.astronaut) {
          mm.astronaut.scale.setScalar(Math.max(0.001, 1 - mm.t / 1.4));
          if (mm.t >= 1.4) {
            moon.mesh.remove(mm.astronaut);
            this.disposeRocketLike(mm.astronaut);
            mm.astronaut = null;
            mm.astroArm = null;
          }
        }
        /* lunar liftoff: climb + kick sideways into a return arc */
        if (mm.t > 1.6 && mm.group.parent === moon.mesh) {
          const world = moon.mesh.localToWorld(mm.group.position.clone());
          moon.mesh.remove(mm.group);
          this.scene.add(mm.group);
          mm.group.position.copy(world);
          const up = world.clone().normalize();
          const tang = new THREE.Vector3(up.z, 0, -up.x).normalize();
          mm.startPos.copy(this.bodyGroup.localToWorld(latLonToVector3(28.6, -80.6, BODY_R + 0.05)));
          mm.vel.copy(up).multiplyScalar(0.85).addScaledVector(tang, 0.45);
          mm.t = 1.7;
          audio.announce("launch");
        }
        if (mm.group.parent !== moon.mesh) {
          /* visible ballistic return: powered arc home, then braking descent */
          const home = mm.startPos;
          const toHome = home.clone().sub(pos);
          const dist = toHome.length();
          const radial = pos.lengthSq() > 1e-6 ? pos.clone().normalize() : new THREE.Vector3(0, 1, 0);
          if (dist > 1.0) {
            /* cruise: earth gravity + thrust toward the landing site */
            mm.vel.addScaledVector(radial, -0.85 * dt);
            if (dist > 1e-4) mm.vel.addScaledVector(toHome.normalize(), 1.7 * dt);
            mm.vel.clampLength(0, 3.0);
          } else {
            /* terminal approach: retro burn, soft speed decay with distance */
            mm.vel.multiplyScalar(Math.max(0, 1 - 2.4 * dt));
            if (dist > 1e-4) mm.vel.addScaledVector(toHome.normalize(), Math.min(1.2, dist * 1.6) * dt);
            mm.vel.clampLength(0, Math.max(0.15, dist * 0.9));
          }
          pos.addScaledVector(mm.vel, dt);
          orient(mm.vel, 2);
          mm.flame.scale.setScalar(0.06 + Math.random() * 0.04);
          (mm.flame.material as THREE.SpriteMaterial).opacity = 0.75 + Math.random() * 0.25;
          if (Math.random() < 0.5) {
            this.exhaustPuff(pos.clone().addScaledVector(safeNorm(mm.vel), -0.12), 0xffc070, 0.12);
          }
          /* keep visible until touchdown — no shrink-to-nothing */
          mm.group.scale.setScalar(dist < 0.5 ? 0.85 : 1);
          if (dist < 0.22) {
            /* touchdown dust at the launch site */
            for (let i = 0; i < 8; i++) {
              const d2 = new THREE.Vector3(
                (Math.random() - 0.5),
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5)
              )
                .normalize()
                .multiplyScalar(0.05);
              this.exhaustPuff(pos.clone().add(d2), 0xc8b8a0, 0.1);
            }
            this.scene.remove(mm.group);
            this.disposeRocketLike(mm.group);
            this.moonMission = null;
            this.onMoonMissionChange?.(false);
            this.moonMissionTimer = 90 + Math.random() * 70;
            audio.announce("dock");
          }
        }
        break;
      }
    }
  }

  private disposeRocketLike(obj: THREE.Object3D) {
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
  }

  /* ------------ shooting stars ------------ */

  private spawnShootingStar() {
    /* shooting stars are tiny near Earth; at galaxy scale they
       must launch far out in the void so they're actually visible */
    const gx = this.mode === "galaxy";
    const sc = gx ? 60 : 1;
    const headScale = gx ? 1.1 : 0.4;
    const ptsLen = gx ? 24 : 16;
    const speedMul = gx ? 1.7 : 1;
    const r = (28 + Math.random() * 14) * sc;
    const th = Math.random() * Math.PI * 2;
    const el = (Math.random() - 0.5) * 1.3;
    const start = new THREE.Vector3(
      Math.cos(th) * Math.cos(el) * r,
      Math.sin(el) * r,
      Math.sin(th) * Math.cos(el) * r
    );
    const t2 = Math.random() * Math.PI * 2;
    const r2 = Math.random() * 7 * sc * 0.6;
    const end = new THREE.Vector3(
      Math.cos(t2) * r2,
      (Math.random() - 0.5) * 6 * sc * 0.4,
      Math.sin(t2) * r2
    );
    const dir = end.sub(start).normalize();
    const head = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0xcfeaff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    );
    head.scale.setScalar(headScale);
    head.position.copy(start);
    const pts: THREE.Vector3[] = Array.from({ length: ptsLen }, () => start.clone());
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const trail = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: 0x9fd8ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.scene.add(head, trail);
    this.shootingStars.push({
      head,
      trail,
      pts,
      dir,
      t: 0,
      life: 1.4 + Math.random() * 0.8,
      speed: (26 + Math.random() * 14) * speedMul,
    });
  }

  private updateShootingStars(dt: number) {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.t += dt;
      s.head.position.addScaledVector(s.dir, s.speed * dt);
      s.pts.pop();
      s.pts.unshift(s.head.position.clone());
      const g = s.trail.geometry as THREE.BufferGeometry;
      g.setFromPoints(s.pts);
      g.attributes.position.needsUpdate = true;
      const k = s.t / s.life;
      (s.head.material as THREE.SpriteMaterial).opacity = 1 - k;
      (s.trail.material as THREE.LineBasicMaterial).opacity = 0.5 * (1 - k);
      if (k >= 1) {
        this.scene.remove(s.head, s.trail);
        (s.head.material as THREE.Material).dispose();
        g.dispose();
        (s.trail.material as THREE.Material).dispose();
        this.shootingStars.splice(i, 1);
      }
    }
  }

  /* ------------ earth night lights (day/night cycle) ------------ */

  private syncLightsShell() {
    if (this.lightsShell) {
      this.lightsShell.visible = this.mode === "earth" && this.realEarthLoaded && !!this.lightsU.uNight.value;
    }
  }

  private buildNightLights() {
    const mat = new THREE.ShaderMaterial({
      vertexShader: LIGHTS_VERT,
      fragmentShader: LIGHTS_FRAG,
      uniforms: this.lightsU,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.lightsMat = mat;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(BODY_R * 1.004, 96, 64), mat);
    shell.visible = false;
    this.bodyGroup.add(shell);
    this.lightsShell = shell;
    const terra = this.planets.find((p) => p.id === "terra");
    if (terra) {
      const tShell = new THREE.Mesh(new THREE.SphereGeometry(terra.radius * 1.012, 48, 32), mat);
      terra.mesh.add(tShell);
    }
    this.syncLightsShell();
  }

  /* ------------ orbital units (satellites & stations) ------------ */

  private makeChinaFlag(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 85;
    const g = c.getContext("2d")!;
    g.fillStyle = "#DE2910";
    g.fillRect(0, 0, 128, 85);
    /* big star */
    const star = (cx: number, cy: number, r: number, ang: number, color: string) => {
      g.fillStyle = color;
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = ang - Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const a2 = a1 + Math.PI / 5;
        const a3 = a1 + (2 * Math.PI) / 5;
        const x1 = cx + Math.cos(a1) * r;
        const y1 = cy + Math.sin(a1) * r;
        const x2 = cx + Math.cos(a2) * r * 0.4;
        const y2 = cy + Math.sin(a2) * r * 0.4;
        const x3 = cx + Math.cos(a3) * r;
        const y3 = cy + Math.sin(a3) * r;
        if (i === 0) g.moveTo(x1, y1);
        else g.lineTo(x1, y1);
        g.lineTo(x2, y2);
        g.lineTo(x3, y3);
      }
      g.closePath();
      g.fill();
    };
    star(32, 25, 16, 0, "#FFDE00");
    star(58, 10, 6, Math.atan2(10 - 25, 58 - 32), "#FFDE00");
    star(64, 26, 6, Math.atan2(26 - 25, 64 - 32), "#FFDE00");
    star(58, 43, 6, Math.atan2(43 - 25, 58 - 32), "#FFDE00");
    star(32, 54, 6, Math.atan2(54 - 25, 32 - 32) + Math.PI / 2, "#FFDE00");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Tiangong space station — T-configuration: Tianhe core + Wentian/Mengtian labs */
  private makeTiangong(scale: number) {
    const root = new THREE.Group();
    const beacons: { sprite: THREE.Sprite; phase: number }[] = [];

    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0xdde3ea,
      emissive: 0x1a2430,
      shininess: 60,
    });
    const segMat = new THREE.MeshPhongMaterial({
      color: 0xc8d2de,
      emissive: 0x141c28,
      shininess: 55,
    });
    const panelMat = new THREE.MeshPhongMaterial({
      color: 0x1c4c8c,
      emissive: 0x0d2b57,
      emissiveIntensity: 1.5,
      shininess: 24,
    });

    /* Tianhe core module — chubby cylinder along X */
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.4 * scale, 12), bodyMat);
    core.rotation.z = Math.PI / 2;
    root.add(core);

    /* nose cap (docking node) */
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05 * scale, 0.08 * scale, 12), segMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 0.24 * scale;
    root.add(nose);

    /* Wentian + Mengtian lab modules (slightly thinner) */
    const labGeo = new THREE.CylinderGeometry(0.042 * scale, 0.042 * scale, 0.32 * scale, 12);
    const lab1 = new THREE.Mesh(labGeo, segMat);
    lab1.rotation.z = Math.PI / 2;
    lab1.position.set(0, 0.105 * scale, 0);
    root.add(lab1);
    const lab2 = new THREE.Mesh(labGeo, segMat);
    lab2.rotation.z = Math.PI / 2;
    lab2.position.set(0, -0.105 * scale, 0);
    root.add(lab2);

    /* big solar arrays — vertical wings on both labs (the iconic look) */
    const wingGeo = new THREE.BoxGeometry(0.012 * scale, 0.3 * scale, 0.14 * scale);
    for (const [sy, sx] of [
      [1, -0.05],
      [1, 0.22],
      [-1, -0.05],
      [-1, 0.22],
    ] as const) {
      const wing = new THREE.Mesh(wingGeo, panelMat);
      wing.position.set(sx * scale, sy * 0.105 * scale, 0);
      root.add(wing);
    }

    /* central small solar wings on the core */
    const cwGeo = new THREE.BoxGeometry(0.012 * scale, 0.05 * scale, 0.1 * scale);
    const cw1 = new THREE.Mesh(cwGeo, panelMat);
    cw1.position.set(0, 0, 0.09 * scale);
    root.add(cw1);
    const cw2 = new THREE.Mesh(cwGeo, panelMat);
    cw2.position.set(0, 0, -0.09 * scale);
    root.add(cw2);

    /* robotic arm segment (along the core) */
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.14 * scale, 8),
      new THREE.MeshPhongMaterial({ color: 0xa8b4c2, shininess: 50 })
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-0.05 * scale, 0, 0.05 * scale);
    root.add(arm);

    /* the five-star red flag, flying above the module */
    const flagGeo = new THREE.PlaneGeometry(0.1 * scale, 0.066 * scale);
    const flag = new THREE.Mesh(
      flagGeo,
      new THREE.MeshBasicMaterial({ map: this.makeChinaFlag(), side: THREE.DoubleSide })
    );
    flag.position.set(-0.08 * scale, 0.085 * scale, 0);
    flag.rotation.z = -0.35;
    flag.userData = { flagWave: true };
    root.add(flag);

    /* docking beacons */
    const mk = (color: number, x: number, y: number, z: number) => {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      sp.scale.setScalar(0.06 * scale);
      sp.position.set(x, y, z);
      root.add(sp);
      beacons.push({ sprite: sp, phase: Math.random() * Math.PI * 2 });
    };
    mk(0xff4455, 0.24 * scale, 0, 0);
    mk(0xff4455, 0, 0.09 * scale, 0);
    mk(0xff4455, 0, -0.09 * scale, 0);
    mk(0x55ffaa, -0.2 * scale, 0, 0.06 * scale);
    return { root, beacons, flag };
  }

  private makeSatellite(scale: number) {
    const root = new THREE.Group();
    const beacons: { sprite: THREE.Sprite; phase: number }[] = [];

    /* main body */
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.14 * scale, 0.11 * scale, 0.11 * scale),
      new THREE.MeshPhongMaterial({ color: 0xb9c2cc, emissive: 0x141c28, shininess: 46 })
    );
    root.add(body);

    /* twin solar panels (glowing blue) */
    const panelMat = new THREE.MeshPhongMaterial({
      color: 0x1c4c8c,
      emissive: 0x0d2b57,
      emissiveIntensity: 1.5,
      shininess: 24,
    });
    const pGeo = new THREE.BoxGeometry(0.42 * scale, 0.012 * scale, 0.16 * scale);
    const pL = new THREE.Mesh(pGeo, panelMat);
    pL.position.x = -(0.42 * scale) / 2 - 0.08 * scale;
    const pR = new THREE.Mesh(pGeo, panelMat);
    pR.position.x = (0.42 * scale) / 2 + 0.08 * scale;
    root.add(pL, pR);

    /* mast antenna */
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006 * scale, 0.006 * scale, 0.22 * scale, 6),
      new THREE.MeshPhongMaterial({ color: 0xe8ecf2 })
    );
    ant.position.y = 0.16 * scale;
    root.add(ant);

    /* side dish */
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 0.014 * scale, 20),
      new THREE.MeshPhongMaterial({ color: 0xdfe5ec, shininess: 60 })
    );
    dish.rotation.z = Math.PI / 2;
    dish.position.z = 0.08 * scale;
    root.add(dish);

    /* blinking beacons */
    const mk = (color: number, x: number, y: number, z: number) => {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      sp.scale.setScalar(0.1 * scale);
      sp.position.set(x, y, z);
      root.add(sp);
      beacons.push({ sprite: sp, phase: Math.random() * Math.PI * 2 });
    };
    mk(0xff4455, -(0.42 * scale) / 2 - 0.08 * scale, 0, 0.08 * scale);
    mk(0xff4455, (0.42 * scale) / 2 + 0.08 * scale, 0, -0.08 * scale);
    mk(0x55ffaa, 0, 0.27 * scale, 0);
    return { root, beacons };
  }

  private makeStation(scale: number) {
    const root = new THREE.Group();
    const beacons: { sprite: THREE.Sprite; phase: number }[] = [];

    /* habitation ring */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3 * scale, 0.028 * scale, 8, 48),
      new THREE.MeshPhongMaterial({ color: 0xcdd3dc, emissive: 0x1a2430, shininess: 55 })
    );
    root.add(ring);

    /* vertical hub + horizontal spine */
    const hubMat = new THREE.MeshPhongMaterial({ color: 0xaeb8c4, emissive: 0x0e1824, shininess: 50 });
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055 * scale, 0.055 * scale, 0.42 * scale, 12),
      hubMat
    );
    root.add(hub);
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045 * scale, 0.045 * scale, 0.5 * scale, 12),
      hubMat
    );
    spine.rotation.z = Math.PI / 2;
    root.add(spine);

    /* cross solar array */
    const panelMat = new THREE.MeshPhongMaterial({
      color: 0x1c4c8c,
      emissive: 0x0d2b57,
      emissiveIntensity: 1.5,
      shininess: 24,
    });
    const pg = new THREE.BoxGeometry(0.2 * scale, 0.01 * scale, 0.09 * scale);
    for (const [sx, sy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const p = new THREE.Mesh(pg, panelMat);
      p.position.set(sx * 0.27 * scale, sy * 0.27 * scale, 0);
      if (sy !== 0) p.rotation.z = Math.PI / 2;
      root.add(p);
    }

    /* beacons */
    const mk = (color: number, x: number, y: number, z: number) => {
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      sp.scale.setScalar(0.09 * scale);
      sp.position.set(x, y, z);
      root.add(sp);
      beacons.push({ sprite: sp, phase: Math.random() * Math.PI * 2 });
    };
    mk(0xff4455, 0.3 * scale, 0, 0);
    mk(0xff4455, -0.3 * scale, 0, 0);
    mk(0xff4455, 0, 0.2 * scale, 0);
    mk(0xff4455, 0, -0.2 * scale, 0);
    mk(0x55ffaa, 0, 0.06 * scale, 0.28 * scale);
    return { root, beacons };
  }

  private addOrbital(
    parent: THREE.Object3D,
    unit: { root: THREE.Group; beacons: { sprite: THREE.Sprite; phase: number }[] },
    radius: number,
    speed: number,
    tilt: number,
    id: string,
    clickable: boolean
  ) {
    const pivot = new THREE.Group();
    pivot.rotation.z = tilt;
    const carrier = new THREE.Group();
    carrier.position.x = radius;
    carrier.add(unit.root);
    pivot.add(carrier);
    parent.add(pivot);
    this.orbitals.push({
      id,
      pivot,
      carrier,
      angle: Math.random() * Math.PI * 2,
      speed,
      beacons: unit.beacons,
      world: new THREE.Vector3(),
      clickable,
    });
  }

  /* Keplerian angular velocity: ω = sqrt(μ / r³) — inner orbits move faster */
  private keplerOmega(r: number) {
    const MU = 1.7;
    return Math.sqrt(MU / (r * r * r));
  }

  private buildOrbitals() {
    /* around the tactical terra globe (EARTH view) — interactive facility matrix
       (scaled down: real satellites are tiny against the planet) */
    this.orbitalRoot = new THREE.Group();
    this.bodyGroup.add(this.orbitalRoot);
    this.addOrbital(this.orbitalRoot, this.makeSatellite(0.18), 2.5, this.keplerOmega(2.5), 0.55, "opt-01", true);
    this.addOrbital(this.orbitalRoot, this.makeSatellite(0.15), 2.72, this.keplerOmega(2.72), 1.35, "com-01", true);
    this.addOrbital(this.orbitalRoot, this.makeSatellite(0.13), 2.88, this.keplerOmega(2.88), 2.9, "wrn-01", true);
    this.addOrbital(this.orbitalRoot, this.makeStation(0.3), 3.15, this.keplerOmega(3.15), 2.4, "stn-01", true);
    /* 🇨🇳 Tiangong space station — T-configuration with the five-star flag */
    const tg = this.makeTiangong(0.24);
    this.addOrbital(this.orbitalRoot, tg, 3.32, this.keplerOmega(3.32), -1.1, "tg-01", true);
    this.tiangongFlag = tg.flag;

    /* around terra inside the solar system view (decor only) */
    const terra = this.planets.find((p) => p.id === "terra");
    if (terra) {
      this.addOrbital(terra.group, this.makeSatellite(0.08), 0.95, 0.5, 0.4, "sys-sat-1", false);
      this.addOrbital(terra.group, this.makeSatellite(0.07), 1.3, -0.32, 1.1, "sys-sat-2", false);
      this.addOrbital(terra.group, this.makeStation(0.14), 1.75, 0.16, 2.2, "sys-stn", false);
    }

    /* constellation swarm: Starlink train · nav sats · GEO ring */
    this.buildConstellations();
  }

  /* ------------ satellite constellations (Starlink & co.) ------------ */

  private constellationTrains: { grp: THREE.Group; speed: number }[] = [];

  private buildConstellations() {
    /* one instanced train = count sats on a circular orbit plane */
    const mkTrain = (count: number, radius: number, tilt: number, size: number) => {
      const grp = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(size * 0.5, size * 0.35, size * 0.5);
      const panelGeo = new THREE.BoxGeometry(size * 2.4, size * 0.03, size * 0.6);
      const bodyMat = new THREE.MeshPhongMaterial({
        color: 0xc8d4e4,
        emissive: 0x0d1a2e,
        shininess: 60,
      });
      const panelMat = new THREE.MeshPhongMaterial({
        color: 0x1c4c8c,
        emissive: 0x0d2b57,
        emissiveIntensity: 1.4,
        shininess: 24,
      });
      const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
      const panels = new THREE.InstancedMesh(panelGeo, panelMat, count);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const v = new THREE.Vector3();
      const s = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        v.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
        m.compose(v, q, s);
        bodies.setMatrixAt(i, m);
        panels.setMatrixAt(i, m);
      }
      bodies.instanceMatrix.needsUpdate = true;
      panels.instanceMatrix.needsUpdate = true;
      grp.add(bodies, panels);
      grp.rotation.z = tilt;
      this.orbitalRoot.add(grp);
      /* faint orbit guide line */
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x8fd8e8, transparent: true, opacity: 0.1 })
      );
      line.rotation.z = tilt;
      this.orbitalRoot.add(line);
      return grp;
    };

    /* Starlink: 22 sats in a LEO train at 550 km class orbit */
    this.constellationTrains.push({ grp: mkTrain(22, 2.46, 0.9, 0.05), speed: this.keplerOmega(2.46) });
    /* second Starlink shell, retrograde inclination */
    this.constellationTrains.push({ grp: mkTrain(22, 2.52, 2.1, 0.05), speed: -this.keplerOmega(2.52) });
    /* navigation constellation (GPS/BeiDou style), MEO — two planes */
    this.constellationTrains.push({ grp: mkTrain(4, 3.05, 1.0, 0.07), speed: this.keplerOmega(3.05) });
    this.constellationTrains.push({ grp: mkTrain(4, 3.05, 2.05, 0.07), speed: -this.keplerOmega(3.05) });
    /* geostationary ring — rotates with the earth (same angular rate as the texture) */
    this.constellationTrains.push({ grp: mkTrain(4, 3.9, 0.15, 0.09), speed: BODY_CFG.earth.spin });
  }

  /* ------------ moon orbiting earth in the terran view ------------ */

  private buildEarthMoon() {
    const pivot = new THREE.Group();
    this.bodyGroup.add(pivot);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 48, 32),
      new THREE.MeshPhongMaterial({
        map: this.bodyTex.moon,
        bumpMap: this.bodyTex.moon,
        bumpScale: 0.04,
        emissive: 0x101018,
        emissiveIntensity: 0.3,
        specular: 0x334455,
        shininess: 8,
      })
    );
    mesh.position.x = 4.9;
    pivot.add(mesh);
    this.moonInEarth = { mesh, pivot, angle: Math.random() * Math.PI * 2 };
  }

  /* ------------ render lab (shader material) ------------ */

  private buildLabMaterial() {
    const u: LabUniforms = {
      uTime: { value: 0 },
      uMode: { value: 1 },
      uTex: { value: this.bodyTex.earth },
    };
    this.labMat = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uMode;
        uniform sampler2D uTex;
        varying vec2 vUv;
        float hash(float n) { return fract(sin(n) * 43758.5453); }
        void main() {
          vec2 uv = vUv;
          vec3 c;
          if (uMode < 1.5) {
            /* wireframe tech — bright hologram on dark hull */
            c = vec3(0.03, 0.10, 0.16);
            float gx = smoothstep(0.985, 1.0, abs(fract(uv.x * 24.0) * 2.0 - 1.0));
            float gy = smoothstep(0.975, 1.0, abs(fract(uv.y * 12.0) * 2.0 - 1.0));
            c += vec3(0.0, 0.95, 1.0) * max(gx, gy) * 1.1;
            float eq = smoothstep(0.975, 1.0, abs(uv.y - 0.5) * 2.0);
            c += vec3(1.0, 0.72, 0.1) * eq * 1.4;
            float dot_ = step(0.96, hash(floor(uv.x * 48.0) + floor(uv.y * 24.0) * 97.0));
            c += vec3(0.3, 0.9, 1.0) * dot_ * 0.7;
          } else if (uMode < 2.5) {
            /* cyber neon */
            float band = sin(uv.y * 26.0 - uTime * 2.2) * 0.5 + 0.5;
            c = vec3(0.95, 0.05, 0.62) * band + vec3(0.0, 0.92, 1.0) * (1.0 - band);
            float ring = step(0.975, abs(fract(uv.y * 34.0 - uTime * 0.7) - 0.5) * 2.0);
            c += ring * 0.55;
            float pulse = 0.5 + 0.5 * sin(uv.y * 90.0 + uTime * 5.0);
            c *= 0.55 + pulse * 0.45;
          } else {
            /* glitch art */
            float n = hash(uv.y * 71.0 + floor(uTime * 10.0));
            vec2 jit = vec2((n - 0.5) * 0.09, 0.0);
            vec4 t = texture2D(uTex, uv + jit);
            c = t.rgb;
            c.r = texture2D(uTex, uv + jit + vec2(0.025, 0.0)).r;
            c.b = texture2D(uTex, uv + jit - vec2(0.025, 0.0)).b;
            float tear = step(0.965, hash(floor(uv.y * 86.0) * 13.7 + floor(uTime * 2.5)));
            c *= 1.0 + tear * 1.8;
            c += vec3(0.1, 0.4, 0.9) * tear * 0.4;
          }
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });
  }

  private buildPlanetEntry(def: PlanetDef): PlanetEntry {
    let tex: THREE.Texture;
    if (def.useSolTex) tex = this.bodyTex.sol;
    else if (def.useEarthTex) tex = this.bodyTex.earth;
    else if (def.useMoonTex) tex = this.bodyTex.moon;
    else tex = makePlanetTexture(def.tex);

    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 48, 32),
      new THREE.MeshPhongMaterial({
        map: tex,
        emissive: 0x101018,
        emissiveIntensity: 0.4,
        specular: 0x334455,
        shininess: 14,
      })
    );
    mesh.rotation.z = def.tilt;
    group.add(mesh);

    if (def.ring) {
      const ringMat = def.ring.textured
        ? new THREE.MeshBasicMaterial({
            map: makeRingTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: def.ring.opacity,
            depthWrite: false,
          })
        : new THREE.MeshBasicMaterial({
            color: def.ring.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: def.ring.opacity,
            depthWrite: false,
          });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(def.radius * def.ring.inner, def.radius * def.ring.outer, 128),
        ringMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = def.ring.tilt;
      mesh.add(ring);
    }

    /* thin fresnel atmosphere shell for realism */
    if (def.atmo) {
      const aU = {
        uColor: { value: new THREE.Color(def.atmo) },
        uIntensity: { value: 0.55 },
        uPower: { value: 3.2 },
      };
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(def.radius * 1.07, 48, 32),
        new THREE.ShaderMaterial({
          vertexShader: ATMOSPHERE_VERT,
          fragmentShader: ATMOSPHERE_FRAG,
          uniforms: aU,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        })
      );
      mesh.add(shell);
    }

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: def.color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    glow.scale.setScalar(def.radius * 3.4);
    group.add(glow);

    const highlight = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius * 1.8, 0.014 + def.radius * 0.045, 8, 48),
      new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    highlight.rotation.y = Math.PI / 2;
    group.add(highlight);

    if (def.id === "sol") {
      /* the sun is a self-luminous ball — real texture only, no force field */
      const m = mesh.material as THREE.MeshPhongMaterial;
      m.emissive = new THREE.Color(0xfff2d0);
      m.emissiveIntensity = 1.0;
      m.emissiveMap = tex;
      glow.scale.setScalar(def.radius * 2.2);
      glow.material.opacity = 0.14;
      glow.material.color.set(0xffd9a0);

      /* rising heat shimmer around the limb (double shell) */
      const makeHeat = (scale: number, strength: number, color: number) => {
        const mat = new THREE.ShaderMaterial({
          vertexShader: HEAT_VERT,
          fragmentShader: HEAT_FRAG,
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(color) },
            uStrength: { value: strength },
          },
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        });
        const shell = new THREE.Mesh(new THREE.SphereGeometry(def.radius * scale, 64, 48), mat);
        group.add(shell);
        return mat;
      };
      this.sunHeatMats.push(makeHeat(1.1, 0.55, 0xff8c30));
      this.sunHeatMats.push(makeHeat(1.24, 0.32, 0xffc070));
    }

    const angle = Math.random() * Math.PI * 2;
    group.position.set(Math.cos(angle) * def.dist, 0, Math.sin(angle) * def.dist);
    group.updateWorldMatrix(true, false);

    return {
      id: def.id,
      name: def.name,
      color: def.color,
      radius: def.radius,
      dist: def.dist,
      speed: def.speed,
      angle,
      group,
      mesh,
      glow,
      highlight,
      tilt: def.tilt,
      selfSpin: def.selfSpin,
      world: new THREE.Vector3(),
    };
  }

  /* ================= MILKY WAY GALAXY ================= */

  private buildGalaxy() {
    const g = this.galaxyGroup;
    const armCount = 4;
    const pitch = 0.21; // spiral pitch angle (rad)

    const makeStars = (
      count: number,
      colorFn: () => THREE.Color,
      gen: (i: number) => { x: number; y: number; z: number },
      size: number,
      opacity: number
    ) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const p = gen(i);
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        const c = colorFn();
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size,
          map: this.dotTex,
          vertexColors: true,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      g.add(pts);
      return pts;
    };

    /* star population colours */
    const starColor = () => {
      const r = Math.random();
      if (r < 0.08) return new THREE.Color(0x9fc8ff); // O/B blue giants
      if (r < 0.3) return new THREE.Color(0xfff4d0); // F/G yellow
      if (r < 0.65) return new THREE.Color(0xffffff); // main sequence white
      return new THREE.Color(0xffb98a); // K/M orange dwarfs
    };

    /* ---- spiral disc: 4 logarithmic arms ---- */
    const discGen = () => {
      const arm = Math.floor(Math.random() * armCount);
      const armTheta = (arm / armCount) * Math.PI * 2;
      let r = 2.5 + Math.pow(Math.random(), 0.55) * 52.5;
      const theta = armTheta + Math.log(r / 2.5) / Math.tan(pitch);
      /* scatter perpendicular to the arm — wider far out */
      const sigma = 0.7 + r * 0.09;
      const jitter = (Math.random() + Math.random() + Math.random() - 1.5) * sigma;
      const x = Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * jitter;
      const z = Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * jitter;
      const y = (Math.random() + Math.random() - 1) * (0.6 + r * 0.05);
      return { x, y, z };
    };
    makeStars(16000, starColor, discGen, 0.16, 0.95);

    /* ---- central bulge: dense golden core ---- */
    const bulgeGen = () => {
      let r = 0;
      let x = 0;
      let y = 0;
      let z = 0;
      do {
        x = (Math.random() * 2 - 1) * 3.4;
        y = (Math.random() * 2 - 1) * 2.2;
        z = (Math.random() * 2 - 1) * 3.4;
        r = Math.hypot(x, y * 1.4, z);
      } while (r > 3.2);
      return { x, y, z };
    };
    makeStars(4200, () => new THREE.Color(0xffe2a8), bulgeGen, 0.22, 0.9);

    /* ---- halo: sparse old blue-white stars ---- */
    const haloGen = () => {
      const rr = 6 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      return {
        x: rr * Math.sin(ph) * Math.cos(th),
        y: rr * Math.cos(ph) * 0.6,
        z: rr * Math.sin(ph) * Math.sin(th),
      };
    };
    makeStars(2600, () => new THREE.Color(0xcfdfff), haloGen, 0.12, 0.5);

    /* ---- dust lanes: dark red-brown particles inside the arms ---- */
    const dustGen = () => {
      const arm = Math.floor(Math.random() * armCount);
      const armTheta = (arm / armCount) * Math.PI * 2;
      const r = 3.5 + Math.pow(Math.random(), 0.5) * 40;
      const theta = armTheta + Math.log(r / 2.5) / Math.tan(pitch) + 0.12;
      const sigma = 0.4 + r * 0.05;
      const jitter = (Math.random() + Math.random() - 1) * sigma;
      return {
        x: Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * jitter,
        y: (Math.random() - 0.5) * 0.4,
        z: Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * jitter,
      };
    };
    makeStars(1800, () => new THREE.Color(0x5a3018), dustGen, 0.2, 0.22);

    /* ---- real emission nebulae along the spiral arms ----
       HII star-forming clouds (Orion, Carina, Eagle, Trifid, Lagoon…) each
       rendered as a coloured gas sprite wrapped in a clump of hot young stars */
    const gauss = () => Math.random() + Math.random() + Math.random() - 1.5;
    const nebulae: { name: string; rgb: [number, number, number]; r: number; arm: number; scale: number; seed: number }[] = [
      { name: "Orion", rgb: [255, 92, 148], r: 9, arm: 0, scale: 4.6, seed: 101 },
      { name: "Rosette", rgb: [255, 128, 168], r: 13, arm: 0, scale: 3.8, seed: 103 },
      { name: "Carina", rgb: [255, 128, 64], r: 15, arm: 1, scale: 5.4, seed: 107 },
      { name: "Crab", rgb: [140, 168, 255], r: 11, arm: 1, scale: 3.2, seed: 109 },
      { name: "Eagle", rgb: [110, 224, 160], r: 19, arm: 2, scale: 4.4, seed: 113 },
      { name: "Omega", rgb: [255, 158, 96], r: 21, arm: 2, scale: 4.0, seed: 127 },
      { name: "Trifid", rgb: [198, 108, 208], r: 24, arm: 3, scale: 3.6, seed: 131 },
      { name: "Lagoon", rgb: [255, 96, 116], r: 27, arm: 3, scale: 4.2, seed: 137 },
    ];
    for (const nb of nebulae) {
      const theta = (nb.arm / armCount) * Math.PI * 2 + Math.log(nb.r / 2.5) / Math.tan(pitch);
      const cx = Math.cos(theta) * nb.r;
      const cz = Math.sin(theta) * nb.r;
      const cy = (nb.arm % 2 === 0 ? 0.5 : -0.6);
      const cloud = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeNebulaTexture(nb.rgb, nb.seed),
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.62,
        })
      );
      cloud.scale.setScalar(nb.scale);
      cloud.position.set(cx, cy, cz);
      g.add(cloud);
      /* young hot stars freshly born inside the cloud */
      makeStars(
        170,
        () => (Math.random() < 0.6 ? new THREE.Color(0x9fc8ff) : new THREE.Color(0xffffff)),
        () => ({ x: cx + gauss() * nb.scale * 0.28, y: cy + gauss() * nb.scale * 0.1, z: cz + gauss() * nb.scale * 0.28 }),
        0.15,
        0.9
      );
    }

    /* ---- globular clusters — dense ancient swarms in the halo ---- */
    const globulars: { name: string; r: number; th: number; ph: number; warm: number }[] = [
      { name: "Omega Centauri", r: 21, th: 0.8, ph: 0.9, warm: 0xffe0b0 },
      { name: "M13 Hercules", r: 26, th: 2.4, ph: 1.4, warm: 0xffe8c0 },
      { name: "M4", r: 17, th: 4.1, ph: 1.1, warm: 0xffd8a0 },
      { name: "M22", r: 23, th: 5.4, ph: 0.7, warm: 0xffe4b4 },
      { name: "M5", r: 29, th: 1.7, ph: 1.7, warm: 0xffe0c0 },
    ];
    for (const gc of globulars) {
      const cx = gc.r * Math.sin(gc.ph) * Math.cos(gc.th);
      const cy = gc.r * Math.cos(gc.ph) * 0.7;
      const cz = gc.r * Math.sin(gc.ph) * Math.sin(gc.th);
      const core = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: gc.warm,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.55,
        })
      );
      core.scale.setScalar(3);
      core.position.set(cx, cy, cz);
      g.add(core);
      /* hundreds of old suns packed into a sphere */
      makeStars(
        460,
        () => new THREE.Color(gc.warm),
        () => {
          const u = Math.random();
          const v = Math.random();
          const rr = 0.4 + Math.pow(u, 0.4) * 1.7;
          const a = 2 * Math.PI * v;
          const sp = Math.acos(2 * Math.random() - 1);
          return {
            x: cx + rr * Math.sin(sp) * Math.cos(a),
            y: cy + rr * Math.cos(sp) * 0.8,
            z: cz + rr * Math.sin(sp) * Math.sin(a),
          };
        },
        0.11,
        0.85
      );
    }

    /* ---- galactic core glow ---- */
    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0xffd9a0,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );
    coreGlow.scale.setScalar(11);
    g.add(coreGlow);

    /* ---- SOL system marker (the sun's position in the Orion arm) ---- */
    const solGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: 0xffd050,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    solGlow.scale.setScalar(1.4);
    solGlow.position.set(26, 1.2, 0);
    g.add(solGlow);
    this.solMarker = solGlow;

    /* ---- clickable famous stars — REAL star balls with surface texture ---- */
    for (const s of GALAXY_STARS) {
      const pos = new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]);
      const mesh = this.buildStarMesh(s.type, s.color);
      mesh.position.copy(pos);
      g.add(mesh);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: s.color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.75,
        })
      );
      glow.scale.setScalar(2.2);
      glow.position.copy(pos);
      g.add(glow);

      /* interaction stack: pulsing reticle ring + hover name plate (hidden until hovered) */
      const reticle = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.makeRingTexture(),
          color: s.color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        })
      );
      reticle.scale.setScalar(2.4);
      reticle.position.copy(pos);
      g.add(reticle);
      const label = makeTextSprite(s.name, s.color);
      label.position.set(pos.x, pos.y + 2.4, pos.z);
      label.visible = false;
      g.add(label);

      this.starMarkers.push({
        id: s.id,
        name: s.name,
        color: s.color,
        glow,
        world: pos.clone(),
        mesh,
        reticle,
        label,
        properCycle: Math.random() * Math.PI * 2,
        base: pos.clone(),
      });
    }

    /* ---- real stellar motion ----
       binaries orbit a common barycentre; every star drifts with a small
       proper motion along the galactic plane. */
    const setOrbit = (a: string, b: string, radiusA: number, rate: number) => {
      const ma = this.starMarkers.find((m) => m.id === a);
      const mb = this.starMarkers.find((m) => m.id === b);
      if (!ma || !mb) return;
      const center = ma.base.clone().add(mb.base).multiplyScalar(0.5);
      const axis = new THREE.Vector3(0.2, 1, -0.15).normalize();
      const delta = mb.base.clone().sub(ma.base).normalize();
      ma.orbit = { center, axis, phase: 0, rate, radius: radiusA };
      mb.orbit = { center, axis, phase: Math.PI, rate, radius: radiusA };
      void delta;
    };
    setOrbit("alpha-a", "alpha-b", 1.6, 0.25); // ~80 yr binary — wide enough to see both
    setOrbit("sirius-a", "sirius-b", 1.5, 0.2); // 50 yr binary
    setOrbit("proxima", "alpha-a", 3.2, 0.05); // wide third star, distinct position
    /* proper motion — tiny drift, direction varies per star */
    for (const m of this.starMarkers) {
      const speed = 0.006 + Math.random() * 0.014;
      const ang = Math.random() * Math.PI * 2;
      m.proper = new THREE.Vector3(Math.cos(ang), (Math.random() - 0.5) * 0.15, Math.sin(ang))
        .normalize()
        .multiplyScalar(speed);
    }

    /* ---- neighbour galaxies (fly-in targets) — BIG so they are easy to hit ---- */
    for (const def of NEIGHBOR_GALAXIES) {
      const scale = def.type === "irregular" ? 16 : 22;
      const grp = this.buildNeighborGalaxy(def.type, def.color, scale);
      grp.position.set(def.pos[0], def.pos[1], def.pos[2]);
      g.add(grp);
      this.neighborGalaxies.push({
        id: def.id,
        name: def.name,
        color: def.color,
        group: grp,
        world: new THREE.Vector3(),
        scale,
      });

      /* textured exoplanets orbiting this galaxy */
      for (const ex of EXO_PLANETS) {
        if (ex.galaxyId !== def.id) continue;
        const tex = this.makeExoTexture(ex.style);
        const pivot = new THREE.Group();
        pivot.position.copy(grp.position);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(ex.radius, 40, 28),
          new THREE.MeshPhongMaterial({
            map: tex,
            emissive: 0x101018,
            emissiveIntensity: 0.35,
            specular: 0x334455,
            shininess: 14,
          })
        );
        const angle0 = ex.phase;
        mesh.position.set(Math.cos(angle0) * ex.orbit, 0, Math.sin(angle0) * ex.orbit);
        pivot.add(mesh);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.dotTex,
            color: ex.color,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0.5,
          })
        );
        glow.scale.setScalar(ex.radius * 2.6);
        mesh.add(glow);
        g.add(pivot);
        this.exoPlanets.push({
          def: ex,
          pivot,
          mesh,
          glow,
          angle: angle0,
          world: new THREE.Vector3(),
          parentGalaxyId: def.id,
        });
        /* hidden until the parent galaxy is focused */
        pivot.visible = false;
        pivot.userData = { exoParent: def.id };
      }

      /* star-system planets — attach to their host star markers */
      for (const ex of EXO_PLANETS) {
        const host = this.starMarkers.find((s) => s.id === ex.galaxyId);
        if (!host) continue;
        const tex = this.makeExoTexture(ex.style);
        const pivot = new THREE.Group();
        pivot.position.copy(host.world);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(ex.radius, 40, 28),
          new THREE.MeshPhongMaterial({
            map: tex,
            emissive: 0x101018,
            emissiveIntensity: 0.35,
            specular: 0x334455,
            shininess: 14,
          })
        );
        const angle0 = ex.phase;
        mesh.position.set(Math.cos(angle0) * ex.orbit, 0, Math.sin(angle0) * ex.orbit);
        pivot.add(mesh);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.dotTex,
            color: ex.color,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0.5,
          })
        );
        glow.scale.setScalar(ex.radius * 2.6);
        mesh.add(glow);
        g.add(pivot);
        pivot.visible = false;
        pivot.userData = { exoParent: ex.galaxyId };
        this.exoPlanets.push({
          def: ex,
          pivot,
          mesh,
          glow,
          angle: angle0,
          world: new THREE.Vector3(),
          parentGalaxyId: ex.galaxyId,
        });
      }
    }
  }

  /** spectral class → star size & tint (real star physics feel) */
  private starParams(type: string): { radius: number; tint: number; emissive: number; seed: number; style: string } {
    const t = type.toUpperCase();
    if (t.includes("白矮") || t.startsWith("DA")) return { radius: 0.3, tint: 0xffffff, emissive: 0xd8e8ff, seed: 97, style: "dense" };
    if (t.startsWith("M")) return { radius: 0.55, tint: 0xff7a4a, emissive: 0xcc5030, seed: 43, style: "flare" };
    if (t.startsWith("K")) return { radius: 0.75, tint: 0xffb060, emissive: 0xcc7020, seed: 71, style: "grain" };
    if (t.startsWith("G")) return { radius: 0.9, tint: 0xfff4d0, emissive: 0xd8a840, seed: 11, style: "granule" };
    if (t.startsWith("A") || t.startsWith("B") || t.startsWith("O")) return { radius: 1.1, tint: 0xcfe4ff, emissive: 0x90b8e0, seed: 59, style: "hot" };
    return { radius: 0.7, tint: 0xffd8a0, emissive: 0xd08830, seed: 17, style: "granule" };
  }

  /** per-spectral-class star surface: distinct convection patterns */
  private makeStarTexture(seed: number, style: string): THREE.CanvasTexture {
    const w = 256;
    const h = 128;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext("2d")!;
    const img = g.createImageData(w, h);
    const d = img.data;
    const wrapW = w * 0.02;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let n: number;
        if (style === "flare") {
          /* red dwarfs: violent flare regions — high contrast blotches */
          n = fbm(x * 0.05, y * 0.1, seed, 3, wrapW);
          n = Math.pow(n, 1.6);
        } else if (style === "dense") {
          /* white dwarfs: smooth, nearly featureless */
          n = fbm(x * 0.012, y * 0.024, seed, 2, wrapW) * 0.35 + 0.65;
        } else if (style === "hot") {
          /* A/B stars: fast hot convection — fine striations */
          n = fbm(x * 0.03, y * 0.09, seed, 4, wrapW);
          n = 0.35 + Math.abs(n - 0.5) * 1.6;
        } else if (style === "grain") {
          /* K stars: mottled orange granularity */
          n = fbm(x * 0.04, y * 0.07, seed, 4, wrapW);
        } else {
          /* G stars: classic solar granulation */
          n = fbm(x * 0.045, y * 0.08, seed, 4, wrapW);
        }
        const v = THREE.MathUtils.clamp(n, 0, 1);
        d[(y * w + x) * 4] = Math.round(255 * v);
        d[(y * w + x) * 4 + 1] = Math.round(255 * v);
        d[(y * w + x) * 4 + 2] = Math.round(255 * v);
        d[(y * w + x) * 4 + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  /** thin glowing ring — targeting reticle for clickable interior stars */
  private makeRingTexture(): THREE.CanvasTexture {
    const s = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = s;
    const g = canvas.getContext("2d")!;
    g.clearRect(0, 0, s, s);
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 5;
    g.beginPath();
    g.arc(s / 2, s / 2, s * 0.42, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      g.beginPath();
      g.moveTo(s / 2 + Math.cos(a) * s * 0.3, s / 2 + Math.sin(a) * s * 0.3);
      g.lineTo(s / 2 + Math.cos(a) * s * 0.46, s / 2 + Math.sin(a) * s * 0.46);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** a real-looking star ball: per-spectral-class surface texture */
  private buildStarMesh(type: string, fallbackColor: string): THREE.Mesh {
    const p = this.starParams(type);
    /* each spectral class gets its own surface pattern */
    const tex = this.makeStarTexture(p.seed, p.style);
    tex.needsUpdate = true;
    const color = new THREE.Color(fallbackColor);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 32, 24), mat);
    return mesh;
  }

  /** exoplanet surface — reuses the REAL NASA textures already loaded
      for the solar-system planets, matched per world style */
  private makeExoTexture(style: ExoPlanetStyle): THREE.Texture {
    const realOf = (id: string) => {
      const p = this.planets.find((x) => x.id === id);
      if (p) {
        const m = (p.mesh.material as THREE.MeshPhongMaterial).map;
        if (m) return m.clone();
      }
      return this.bodyTex.earth.clone();
    };
    switch (style) {
      case "gas":
        return realOf("jupiter"); // real NASA Jupiter clouds
      case "ocean":
        return realOf("terra"); // real Earth ocean surface
      case "desert":
        return realOf("mars"); // real Martian dunes
      case "ice":
        return realOf("neptune"); // real deep-blue ice world
      case "lava":
        return realOf("mercury"); // cratered scorched rock
      default:
        return realOf("terra");
    }
  }

  /** small procedural galaxy — spiral / irregular / lenticular */
  private buildNeighborGalaxy(type: "spiral" | "irregular" | "lenticular", tint: string, baseScale = 16) {
    const grp = new THREE.Group();
    const tintColor = new THREE.Color(tint);
    const starColor = () => {
      const c = tintColor.clone();
      c.lerp(new THREE.Color(Math.random() > 0.5 ? 0xffffff : 0x9fc8ff), 0.4 + Math.random() * 0.5);
      return c;
    };
    const makeStars = (count: number, gen: () => { x: number; y: number; z: number }, size: number, opacity: number) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const p = gen();
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        const c = starColor();
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          size,
          map: this.dotTex,
          vertexColors: true,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      grp.add(pts);
    };

    if (type === "spiral") {
      const scale = baseScale + Math.random() * 3;
      /* four broad logarithmic arms + a thicker disc = a proper spiral galaxy */
      const arms = 4;
      makeStars(
        1500,
        () => {
          const arm = (Math.random() * arms) | 0;
          const armTheta = arm * ((Math.PI * 2) / arms) + Math.random() * 0.35;
          const r = 1 + Math.pow(Math.random(), 0.55) * scale;
          const theta = armTheta + Math.log(r) / 0.5;
          const jitter = (Math.random() + Math.random() - 1) * (0.5 + r * 0.12);
          return {
            x: Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * jitter,
            y: (Math.random() - 0.5) * 0.7,
            z: Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * jitter,
          };
        },
        0.16,
        0.95
      );
      /* brighter, denser core bulge */
      makeStars(
        420,
        () => {
          let x = 0, y = 0, z = 0, rr = 99;
          do {
            x = (Math.random() * 2 - 1) * 1.9;
            y = (Math.random() * 2 - 1) * 1.2;
            z = (Math.random() * 2 - 1) * 1.9;
            rr = Math.hypot(x, y * 1.4, z);
          } while (rr > 1.6);
          return { x, y, z };
        },
        0.2,
        1
      );
    } else if (type === "irregular") {
      makeStars(
        700,
        () => {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(Math.random() * 2 - 1);
          const r = Math.pow(Math.random(), 0.7) * 6;
          return {
            x: r * Math.sin(ph) * Math.cos(th),
            y: r * Math.cos(ph) * 0.55,
            z: r * Math.sin(ph) * Math.sin(th),
          };
        },
        0.13,
        0.85
      );
    } else {
      /* lenticular: flat disc + dominant bulge + dust ring */
      makeStars(
        500,
        () => {
          const th = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 0.6) * 6.5;
          return { x: Math.cos(th) * r, y: (Math.random() - 0.5) * 0.18, z: Math.sin(th) * r };
        },
        0.13,
        0.9
      );
      makeStars(
        250,
        () => {
          let x = 0, y = 0, z = 0, rr = 99;
          do {
            x = (Math.random() * 2 - 1) * 1.4;
            y = (Math.random() * 2 - 1) * 0.9;
            z = (Math.random() * 2 - 1) * 1.4;
            rr = Math.hypot(x, y * 1.6, z);
          } while (rr > 1.3);
          return { x, y, z };
        },
        0.17,
        0.95
      );
      const dust = new THREE.Mesh(
        new THREE.RingGeometry(2.2, 3.4, 64),
        new THREE.MeshBasicMaterial({
          color: 0x2a1608,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      dust.rotation.x = Math.PI / 2 + 0.15;
      grp.add(dust);
    }

    /* glow halo */
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: tint,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      })
    );
    halo.scale.setScalar(baseScale * 1.5);
    grp.add(halo);

    /* wide soft outer glow — real volume, not a flat sticker on black */
    const outerGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: tint,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
    );
    outerGlow.scale.setScalar(baseScale * 2.6);
    grp.add(outerGlow);

    /* bright RESOLVED field stars scattered through the disc — so a galaxy
       reads as a swarm of individual stars, not a uniform ball of light */
    const starCols = [0xffffff, 0xffe9c8, 0xcfe2ff, 0xffd0a0, 0xd8c8ff, 0x9fe8ff];
    const sCount = type === "spiral" ? 120 : 70;
    const sPos = new Float32Array(sCount * 3);
    const sCol = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      const sth = Math.random() * Math.PI * 2;
      const sr = 0.3 + Math.random() * baseScale;
      sPos[i * 3] = Math.cos(sth) * sr;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
      sPos[i * 3 + 2] = Math.sin(sth) * sr;
      const sc = new THREE.Color(starCols[(Math.random() * starCols.length) | 0]);
      const sb = 0.55 + Math.random() * 0.45;
      sCol[i * 3] = sc.r * sb; sCol[i * 3 + 1] = sc.g * sb; sCol[i * 3 + 2] = sc.b * sb;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
    const sStars = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({
        size: Math.max(0.35, baseScale * 0.032),
        map: this.dotTex,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    grp.add(sStars);
    return grp;
  }

  /* ============================================================
   *  GALAXY INTERIOR — enter the star system of any galaxy
   *  Shows real known stars, star clusters, and exoplanets
   *  inside the selected galaxy. Procedural spiral structure
   *  creates the backdrop.
   * ============================================================ */

  /** which galaxy's interior is currently open (for the UI object list) */
  getGalaxyInteriorCurrent(): string | null {
    return this.mode === "galaxyInterior" ? this.galaxyInteriorCurrent : null;
  }

  /** enter a galaxy's interior — real stars + planets + procedural backdrop */
  enterGalaxyInterior(galaxyId: string) {
    const cfg = GALAXY_INTERIOR_CONFIGS[galaxyId];
    if (!cfg) return;
    this.finishFlight();
    /* drop any open star-system sub-level first */
    this.interiorSystemStarId = null;
    this.interiorSystemFocusPlanetId = null;
    this.hoverInteriorSysPlanet = null;
    this.interiorSystemGroup.visible = false;
    this.interiorSystemPlanets = [];
    this.galaxyInteriorFocusId = null;
    this.hoverGalaxyInterior = null;
    this.mode = "galaxyInterior";

    /* hide the galaxy, show interior */
    this.galaxyGroup.visible = false;
    this.stars.visible = false;
    this.milkyWay.visible = false;
    this.milkyWayHaze.visible = false;

    /* build interior on-demand */
    this.buildGalaxyInterior(galaxyId);

    this.galaxyInteriorGroup.visible = true;
    this.galaxyInteriorGroup.scale.setScalar(0.6);
    gsap.to(this.galaxyInteriorGroup.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: "power1.out" });

    /* fly the camera into the interior — avoid a frame-zero jump that
       leaves the camera far outside the interior scene (black screen) */
    const targetRadius = cfg.discRadius * 2.2;
    this.galaxyInteriorLocal = { theta: 0.5, phi: 1.2, radius: targetRadius };
    this.homeSph = { theta: 0.5, phi: 1.2, radius: targetRadius };
    const to = this.sphToVec({ theta: 0.5, phi: 1.2, radius: targetRadius });
    this.startFlight(to, new THREE.Vector3(0, 0, 0), 1.8, () => {
      const s = cartesianToSph(this.camera.position);
      this.galaxyInteriorLocal = { theta: s.theta, phi: s.phi, radius: s.radius };
      this.homeSph = { theta: s.theta, phi: s.phi, radius: s.radius };
      this.lookAt.set(0, 0, 0);
    });
    this.idleUntil = this.time + 3;
  }

  /** focus a specific star inside a galaxy interior */
  focusGalaxyInteriorStar(id: string) {
    const m = this.galaxyInteriorStarMarkers.find((x) => x.id === id);
    if (!m || this.mode !== "galaxyInterior") return;
    this.galaxyInteriorFocusId = id;
    this.flight = null;
    const out = m.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    const r = (m.mesh.geometry as THREE.SphereGeometry).parameters.radius;
    const dist = Math.max(r * 4, 2.6);
    const to = m.world.clone().addScaledVector(out, dist);
    this.startFlight(to, m.world.clone(), 1.6, () => {
      const rel = this.camera.position.clone().sub(m.world);
      const len = rel.length() || 1;
      this.galaxyInteriorLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
    this.idleUntil = this.time + 3;
  }

  clearGalaxyInteriorFocus() {
    if (this.interiorSystemStarId) {
      this.exitInteriorStarSystem();
      return;
    }
    this.galaxyInteriorFocusId = null;
    const cfg = this.galaxyInteriorCurrent ? GALAXY_INTERIOR_CONFIGS[this.galaxyInteriorCurrent] : null;
    const r = cfg ? cfg.discRadius * 2.2 : 60;
    this.galaxyInteriorLocal = { theta: 0.5, phi: 1.2, radius: r };
    this.lookAt.set(0, 0, 0);
  }

  /** focus a specific exoplanet inside a galaxy interior */
  focusGalaxyInteriorPlanet(id: string) {
    if (this.mode !== "galaxyInterior") return;
    /* inside the star-system sub-level the same planet lives at system scale */
    if (this.interiorSystemStarId) {
      this.focusInteriorSystemPlanet(id);
      return;
    }
    const ex = this.galaxyInteriorExoPlanets.find((x) => x.def.id === id);
    if (!ex) return;
    this.galaxyInteriorFocusId = null;
    this.flight = null;
    ex.mesh.updateWorldMatrix(true, false);
    ex.mesh.getWorldPosition(ex.world);
    const out = ex.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    const planetR = (ex.mesh.geometry as THREE.SphereGeometry).parameters.radius;
    const dist = Math.max(planetR * 5, 2.0);
    const to = ex.world.clone().addScaledVector(out, dist);
    this.startFlight(to, ex.world.clone(), 1.2, () => {
      const rel = this.camera.position.clone().sub(ex.world);
      const len = rel.length() || 1;
      this.galaxyInteriorLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
    this.idleUntil = this.time + 3;
  }

  /** enter the star-system sub-level — a solar-system-like view of ONE star */
  enterInteriorStarSystem(starId: string) {
    if (this.mode !== "galaxyInterior" || !this.galaxyInteriorCurrent) return;
    if (this.interiorSystemStarId === starId) return;
    const starDef = (GALAXY_INTERIOR_STARS_BY_GALAXY[this.galaxyInteriorCurrent] ?? []).find(
      (s) => s.id === starId
    );
    if (!starDef) return;
    this.finishFlight();
    this.interiorSystemStarId = starId;
    this.interiorSystemFocusPlanetId = null;
    this.hoverInteriorSysPlanet = null;
    this.galaxyInteriorFocusId = null;

    const g = this.interiorSystemGroup;
    while (g.children.length > 0) {
      const child = g.children[0];
      this.disposeRecursive(child);
      g.remove(child);
    }
    this.interiorSystemPlanets = [];

    /* central star — same class-specific surface as the galaxy view, blown up */
    const star = this.buildStarMesh(starDef.type, starDef.color);
    const baseR = (star.geometry as THREE.SphereGeometry).parameters.radius;
    star.scale.setScalar(2.6 / baseR);
    g.add(star);
    const starGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.dotTex,
        color: starDef.color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    starGlow.scale.setScalar(11);
    g.add(starGlow);
    const starLight = new THREE.PointLight(0xfff1d6, 3.4, 0, 0);
    g.add(starLight);

    /* its real planets — solar-system scale orbits */
    const planets = (GALAXY_INTERIOR_PLANETS_BY_GALAXY[this.galaxyInteriorCurrent] ?? []).filter(
      (p) => p.parentStarId === starId
    );
    let maxOrbit = 8;
    planets.forEach((p, idx) => {
      const orbitDist = 7.5 + idx * 7.5;
      maxOrbit = Math.max(maxOrbit, orbitDist);
      const planetR = 0.32 + p.radius * 2.4;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planetR, 32, 24),
        new THREE.MeshPhongMaterial({
          map: this.makeExoTexture(p.radius > 0.06 ? "gas" : "desert"),
          emissive: 0x101018,
          emissiveIntensity: 0.3,
          specular: 0x334455,
          shininess: 12,
        })
      );
      mesh.position.set(Math.cos(p.phase) * orbitDist, 0, Math.sin(p.phase) * orbitDist);
      g.add(mesh);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: p.color,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        })
      );
      glow.scale.setScalar(planetR * 3.4);
      mesh.add(glow);
      /* orbit ring — solar-system style */
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * orbitDist, 0, Math.sin(a) * orbitDist));
      }
      const ring = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: new THREE.Color(p.color), transparent: true, opacity: 0.28 })
      );
      g.add(ring);
      this.interiorSystemPlanets.push({
        def: p,
        mesh,
        glow,
        orbitDist,
        angle: p.phase,
        world: new THREE.Vector3(),
      });
    });

    /* outer perimeter dashed ring — the solar-system signature */
    const orPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      orPts.push(new THREE.Vector3(Math.cos(a) * (maxOrbit + 6), 0, Math.sin(a) * (maxOrbit + 6)));
    }
    const orRing = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(orPts),
      new THREE.LineDashedMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.16, dashSize: 0.6, gapSize: 0.5 })
    );
    orRing.computeLineDistances();
    g.add(orRing);

    /* ambient background field */
    const bgCount = 420;
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      const rr = 130 + Math.random() * 130;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      bgPos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
      bgPos[i * 3 + 1] = rr * Math.cos(ph);
      bgPos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    const bg = new THREE.Points(
      bgGeo,
      new THREE.PointsMaterial({
        size: 0.55,
        map: this.dotTex,
        color: 0xcfe0ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    g.add(bg);

    /* swap scenes + set camera */
    this.galaxyInteriorGroup.visible = false;
    this.interiorSystemGroup.visible = true;
    this.interiorSystemGroup.scale.setScalar(0.6);
    gsap.to(this.interiorSystemGroup.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: "power1.out" });
    this.interiorSystemLocal = { theta: 0.4, phi: 1.25, radius: (maxOrbit + 6) * 2.1 };
    this.lookAt.set(0, 0, 0);
    this.idleUntil = this.time + 3;
  }

  /** leave the star-system sub-level, back to the galaxy panorama */
  exitInteriorStarSystem() {
    if (!this.interiorSystemStarId) return;
    this.interiorSystemStarId = null;
    this.interiorSystemFocusPlanetId = null;
    this.hoverInteriorSysPlanet = null;
    this.interiorSystemGroup.visible = false;
    while (this.interiorSystemGroup.children.length > 0) {
      const child = this.interiorSystemGroup.children[0];
      this.disposeRecursive(child);
      this.interiorSystemGroup.remove(child);
    }
    this.interiorSystemPlanets = [];
    this.galaxyInteriorGroup.visible = true;
    const cfg = this.galaxyInteriorCurrent ? GALAXY_INTERIOR_CONFIGS[this.galaxyInteriorCurrent] : null;
    const r = cfg ? cfg.discRadius * 2.2 : 60;
    this.galaxyInteriorLocal = { theta: 0.5, phi: 1.2, radius: r };
    this.lookAt.set(0, 0, 0);
    this.idleUntil = this.time + 3;
  }

  isInInteriorSystem(): boolean {
    return this.mode === "galaxyInterior" && !!this.interiorSystemStarId;
  }

  /** focus one planet inside the star-system sub-level */
  focusInteriorSystemPlanet(id: string) {
    const p = this.interiorSystemPlanets.find((x) => x.def.id === id);
    if (!p || !this.interiorSystemStarId) return;
    this.interiorSystemFocusPlanetId = id;
    this.flight = null;
    p.mesh.updateWorldMatrix(true, false);
    p.mesh.getWorldPosition(p.world);
    const out = p.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    const planetR = (p.mesh.geometry as THREE.SphereGeometry).parameters.radius;
    const dist = Math.max(planetR * 4.5, 1.6);
    const to = p.world.clone().addScaledVector(out, dist);
    this.startFlight(to, p.world.clone(), 1.2, () => {
      const rel = this.camera.position.clone().sub(p.world);
      const len = rel.length() || 1;
      this.interiorSystemLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
    this.idleUntil = this.time + 3;
  }

  /** exit the galaxy interior back to the galaxy */
  exitGalaxyInterior() {
    this.exitInteriorStarSystem();
    this.galaxyInteriorFocusId = null;
    this.hoverGalaxyInterior = null;
    this.galaxyInteriorGroup.visible = false;
    this.galaxyGroup.visible = true;
    this.galaxyGroup.scale.setScalar(0.55);
    gsap.to(this.galaxyGroup.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power1.out" });
    this.stars.visible = true;
    this.mode = "galaxy";
    this.sph.radius = Math.min(this.sph.radius, 330);
    this.homeSph = { theta: this.sph.theta, phi: 1.16, radius: 85 };
    this.lookAt.set(0, 0, 0);
    this.idleUntil = this.time + 3;
  }

  /** build the procedural + real-object galaxy interior view */
  private buildGalaxyInterior(galaxyId: string) {
    const cfg = GALAXY_INTERIOR_CONFIGS[galaxyId];
    if (!cfg || this.galaxyInteriorCurrent === galaxyId) return;
    this.galaxyInteriorCurrent = galaxyId;

    const g = this.galaxyInteriorGroup;
    while (g.children.length > 0) {
      const child = g.children[0];
      this.disposeRecursive(child);
      g.remove(child);
    }
    this.galaxyInteriorStarMarkers = [];
    this.galaxyInteriorExoPlanets = [];
    this.galaxyInteriorBg = null;
    this.galaxyInteriorFocusId = null;
    this.hoverGalaxyInterior = null;
    this.hoverGalaxyInteriorExo = null;

    const makeStars = (
      count: number,
      colorFn: () => THREE.Color,
      gen: (i: number) => { x: number; y: number; z: number },
      size: number,
      opacity: number
    ) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const p = gen(i);
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        const c = colorFn();
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ size, map: this.dotTex, vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      g.add(pts);
      return pts;
    };

    const starColor = () => {
      const r = Math.random();
      if (r < 0.08) return new THREE.Color(0x9fc8ff);
      if (r < 0.3) return new THREE.Color(0xfff4d0);
      if (r < 0.65) return new THREE.Color(0xffffff);
      return new THREE.Color(0xffb98a);
    };

    /* ---- spiral disc ---- */
    if (cfg.spiralArms > 0) {
      const armCount = cfg.spiralArms;
      const discGen = () => {
        const arm = Math.floor(Math.random() * armCount);
        const armTheta = (arm / armCount) * Math.PI * 2;
        const r = cfg.coreRadius + Math.pow(Math.random(), 0.55) * (cfg.discRadius - cfg.coreRadius);
        const theta = armTheta + Math.log(r / cfg.coreRadius) / Math.tan(cfg.armPitch);
        const sigma = cfg.armWidth * (1 + r * 0.08);
        const jitter = (Math.random() + Math.random() + Math.random() - 1.5) * sigma;
        return {
          x: Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * jitter,
          z: Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * jitter,
          y: (Math.random() + Math.random() - 1) * (0.5 + r * 0.04),
        };
      };
      makeStars(cfg.starCount * 6, starColor, discGen, 0.14, 0.9);
    }

    /* ---- central bulge ---- */
    const bulgeGen = () => {
      let x = 0, y = 0, z = 0, r = 0;
      do {
        x = (Math.random() * 2 - 1) * cfg.coreRadius;
        y = (Math.random() * 2 - 1) * cfg.coreRadius * 0.7;
        z = (Math.random() * 2 - 1) * cfg.coreRadius;
        r = Math.hypot(x, y * 1.4, z);
      } while (r > cfg.coreRadius);
      return { x, y, z };
    };
    makeStars(cfg.starCount * 2, () => new THREE.Color(cfg.coreColor), bulgeGen, 0.18, 0.85);

    /* ---- halo ---- */
    const haloGen = () => {
      const rr = cfg.discRadius * 0.3 + Math.random() * cfg.discRadius * 0.8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      return {
        x: rr * Math.sin(ph) * Math.cos(th),
        y: rr * Math.cos(ph) * 0.5,
        z: rr * Math.sin(ph) * Math.sin(th),
      };
    };
    makeStars(cfg.starCount * 0.8, () => new THREE.Color(0xcfdfff), haloGen, 0.1, 0.4);

    /* ---- irregular/elliptical cloud ---- */
    if (cfg.spiralArms === 0) {
      const cloudGen = () => {
        let x = 0, y = 0, z = 0;
        do {
          x = (Math.random() * 2 - 1) * cfg.discRadius;
          y = (Math.random() * 2 - 1) * cfg.discRadius * 0.55;
          z = (Math.random() * 2 - 1) * cfg.discRadius;
        } while (Math.hypot(x, y, z) > cfg.discRadius);
        return { x, y, z };
      };
      makeStars(cfg.starCount * 4, starColor, cloudGen, 0.12, 0.7);
    }

    /* ---- dust lanes ---- */
    if (cfg.dustAmount > 0 && cfg.spiralArms > 0) {
      const armCount = cfg.spiralArms;
      const dustGen = () => {
        const arm = Math.floor(Math.random() * armCount);
        const armTheta = (arm / armCount) * Math.PI * 2;
        const r = cfg.coreRadius + 1 + Math.pow(Math.random(), 0.5) * (cfg.discRadius - cfg.coreRadius);
        const theta = armTheta + Math.log(r / cfg.coreRadius) / Math.tan(cfg.armPitch) + 0.12;
        const sigma = cfg.armWidth * 0.5;
        const jitter = (Math.random() + Math.random() - 1) * sigma;
        return {
          x: Math.cos(theta) * r + Math.cos(theta + Math.PI / 2) * jitter,
          y: (Math.random() - 0.5) * 0.3,
          z: Math.sin(theta) * r + Math.sin(theta + Math.PI / 2) * jitter,
        };
      };
      makeStars(Math.floor(cfg.starCount * cfg.dustAmount), () => new THREE.Color(0x5a3018), dustGen, 0.18, 0.18);
    }

    /* ---- core glow ---- */
    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.dotTex, color: cfg.coreColor, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.45, depthWrite: false })
    );
    coreGlow.scale.setScalar(cfg.coreRadius * 3);
    g.add(coreGlow);

    /* ---- clickable real stars (mirrors starMarkers pattern) ---- */
    /* star spheres are authored at solar-system scale (r 0.3-1.1) —
       rescale so they stay visible against a disc 4-32 units wide */
    const starScale = Math.max(cfg.discRadius * 0.055, 1.6);
    const stars = GALAXY_INTERIOR_STARS_BY_GALAXY[galaxyId] ?? [];
    for (const s of stars) {
      const pos = new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]);
      const mesh = this.buildStarMesh(s.type, s.color);
      mesh.scale.setScalar(starScale);
      mesh.position.copy(pos);
      g.add(mesh);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.dotTex, color: s.color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.75 })
      );
      glow.scale.setScalar(starScale * 4.5);
      glow.position.copy(pos);
      g.add(glow);
      /* pulsing targeting reticle — marks the star as clickable */
      const reticle = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.makeRingTexture(), color: 0x7de0ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.55 })
      );
      reticle.scale.setScalar(starScale * 7);
      reticle.userData.baseScale = starScale * 7;
      reticle.position.copy(pos);
      g.add(reticle);
      this.galaxyInteriorStarMarkers.push({
        id: s.id,
        name: s.name,
        color: s.color,
        glow,
        reticle,
        world: pos.clone(),
        mesh,
        properCycle: Math.random() * Math.PI * 2,
        base: pos.clone(),
      });
    }

    /* proper motion for interior stars */
    for (const m of this.galaxyInteriorStarMarkers) {
      const speed = 0.006 + Math.random() * 0.014;
      const ang = Math.random() * Math.PI * 2;
      m.proper = new THREE.Vector3(Math.cos(ang), (Math.random() - 0.5) * 0.15, Math.sin(ang))
        .normalize()
        .multiplyScalar(speed);
    }

    /* ---- exoplanets orbiting the interior stars ---- */
    const planets = GALAXY_INTERIOR_PLANETS_BY_GALAXY[galaxyId] ?? [];
    for (const p of planets) {
      const parentStar = this.galaxyInteriorStarMarkers.find((s) => s.id === p.parentStarId);
      /* orbits + sizes scale with the galaxy so planets sit outside the star ball */
      const orbitDist = p.orbit * starScale * 2.4;
      const planetR = Math.max(p.radius * starScale * 2.6, 0.28);
      const pivot = new THREE.Group();
      if (parentStar) pivot.position.copy(parentStar.world);
      const tex = this.makeExoTexture(p.radius > 0.06 ? "gas" : "desert");
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planetR, 32, 24),
        new THREE.MeshPhongMaterial({ map: tex, emissive: 0x101018, emissiveIntensity: 0.3, specular: 0x334455, shininess: 12 })
      );
      mesh.position.set(Math.cos(p.phase) * orbitDist, 0, Math.sin(p.phase) * orbitDist);
      pivot.add(mesh);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.dotTex, color: p.color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.4 })
      );
      glow.scale.setScalar(planetR * 3.2);
      mesh.add(glow);
      /* orbit ring — like the Solar System */
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitDist, 0, Math.sin(a) * orbitDist));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitLine = new THREE.Line(
        orbitGeo,
        new THREE.LineBasicMaterial({ color: new THREE.Color(p.color), transparent: true, opacity: 0.35 })
      );
      pivot.add(orbitLine);
      g.add(pivot);
      this.galaxyInteriorExoPlanets.push({
        def: p,
        pivot,
        mesh,
        glow,
        orbitDist,
        angle: p.phase,
        world: new THREE.Vector3(),
        parentStarId: p.parentStarId,
      });
    }

    /* ---- background field stars ---- */
    const bgCount = 500;
    const bgPos = new Float32Array(bgCount * 3);
    const bgCol = new Float32Array(bgCount * 3);
    const fieldCols = [0x9fc8ff, 0xfff4d0, 0xffd8a0, 0xe0c8ff];
    for (let i = 0; i < bgCount; i++) {
      const rr = cfg.discRadius * 1.8 + Math.random() * cfg.discRadius * 2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      bgPos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
      bgPos[i * 3 + 1] = rr * Math.cos(ph) * 0.5;
      bgPos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
      const c = new THREE.Color(fieldCols[(Math.random() * fieldCols.length) | 0]);
      bgCol[i * 3] = c.r;
      bgCol[i * 3 + 1] = c.g;
      bgCol[i * 3 + 2] = c.b;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute("color", new THREE.BufferAttribute(bgCol, 3));
    this.galaxyInteriorBg = new THREE.Points(
      bgGeo,
      new THREE.PointsMaterial({ size: 0.4, map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    g.add(this.galaxyInteriorBg);
  }

  private disposeRecursive(obj: THREE.Object3D) {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material?.dispose();
      }
    }
    if (obj instanceof THREE.Points) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        (obj.material as THREE.Material)?.dispose();
      }
    }
    if (obj instanceof THREE.Sprite) {
      (obj.material as THREE.Material)?.dispose();
    }
    while (obj.children.length > 0) {
      this.disposeRecursive(obj.children[0]);
      obj.remove(obj.children[0]);
    }
  }

  /** fly the camera into a neighbour galaxy */
  focusGalaxy(id: string) {
    const g = this.neighborGalaxies.find((x) => x.id === id);
    if (!g || this.mode !== "galaxy") return;
    this.galaxyFocusId = id;
    this.flight = null;
    g.group.getWorldPosition(g.world);
    const out = g.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    /* frame the WHOLE disc from outside — fixed 26 drops the camera into the
       disc for corner-case scales, where the thin disc looks like nothing */
    const dist = Math.max(g.scale * 2.4, 36);
    const to = g.world.clone().addScaledVector(out, dist);
    this.startFlight(to, g.world.clone(), 2.6, () => {
      const rel = this.camera.position.clone().sub(g.world);
      const len = rel.length() || 1;
      this.galaxyLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
    this.idleUntil = this.time + 3;
  }

  /** fly to a star and enter a free orbit around it */
  focusStar(id: string) {
    const m = this.starMarkers.find((x) => x.id === id);
    if (!m || this.mode !== "galaxy") return;
    this.starFocusId = id;
    this.galaxyFocusId = null;
    this.exoFocusId = null;
    const r = (m.mesh.geometry as THREE.SphereGeometry).parameters.radius;
    /* view the WHOLE star ball: distance 4× radius keeps it fully framed */
    const dist = Math.max(r * 4, 2.6);
    const out = m.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    const to = m.world.clone().addScaledVector(out, dist);
    this.startFlight(to, m.world.clone(), 1.6, () => {
      const rel = this.camera.position.clone().sub(m.world);
      const len = rel.length() || 1;
      this.galaxyLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
  }

  clearStarFocus() {
    this.starFocusId = null;
    this.clearGalaxyFocus();
  }

  /** fly to an exoplanet and orbit it */
  focusExoPlanet(id: string) {
    const ex = this.exoPlanets.find((x) => x.def.id === id);
    if (!ex || this.mode !== "galaxy") return;
    this.exoFocusId = id;
    this.galaxyFocusId = null;
    const out = ex.world.clone().normalize();
    if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
    const to = ex.world.clone().addScaledVector(out, ex.def.radius * 2.6);
    this.startFlight(to, ex.world.clone(), 1.8, () => {
      const rel = this.camera.position.clone().sub(ex.world);
      const len = rel.length() || 1;
      this.galaxyLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
    });
  }

  clearExoFocus() {
    this.exoFocusId = null;
    this.clearGalaxyFocus();
  }

  clearGalaxyFocus() {
    this.galaxyFocusId = null;
    this.exoFocusId = null;
    this.starFocusId = null;
    this.homeSph = { theta: 0.55, phi: 1.16, radius: 150 };
    this.startFlight(
      this.sphToVec(this.homeSph),
      new THREE.Vector3(0, 0, 0),
      2.2,
      () => {
        const s = cartesianToSph(this.camera.position);
        this.sph = { theta: s.theta, phi: s.phi, radius: s.radius };
        this.lookAt.set(0, 0, 0);
      }
    );
  }

  /** zoom out of the solar system into the spiral galaxy.
      The camera radius stays CONTINUOUS — no flight animation, no jump:
      you keep zooming out exactly like a single-level zoom. */
  enterGalaxy() {
    this.satFocus = null;
    this.moonFocus = false;
    this.focusPlanetId = null;
    this.galaxyFocusId = null;
    this.exoFocusId = null;
    this.starFocusId = null;
    this.finishFlight();
    this.mode = "galaxy";
    /* hide fine solar-system detail — it collapses to a single star */
    this.dust.visible = false;
    this.decorGroup.visible = false;
    this.nodesGroup.visible = false;
    this.orbitalRoot.visible = false;
    this.clouds.visible = false;
    if (this.nearUfo) this.nearUfo.group.visible = false;
    this.stars.visible = false;
    /* outside the galaxy the sky-river band no longer applies */
    this.milkyWay.visible = false;
    this.milkyWayHaze.visible = false;
    /* the whole solar system shrinks into its place in the Orion arm */
    this.solarRoot.position.set(26, 1.2, 0);
    this.solarRoot.scale.setScalar(0.05);
    /* galaxy fades in quickly */
    this.galaxyGroup.visible = true;
    this.galaxyGroup.scale.setScalar(0.55);
    gsap.to(this.galaxyGroup.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power1.out" });
    /* radius continuity: system's max (≈55) flows into galaxy's range (16–330) */
    this.sph.radius = Math.max(this.sph.radius, 56);
    this.sph.phi = Math.max(this.sph.phi, 0.9);
    this.homeSph = { theta: this.sph.theta, phi: 1.16, radius: 85 };
    this.lookAt.set(0, 0, 0);
    this.idleUntil = this.time + 3;
  }

  /** drop back into the solar system — radius stays continuous */
  exitGalaxy(to: "earth" | "system" = "earth") {
    this.galaxyFocusId = null;
    this.exoFocusId = null;
    this.galaxyGroup.visible = false;
    this.solarRoot.scale.setScalar(1);
    this.solarRoot.position.set(0, 0, 0);
    this.stars.visible = true;
    this.milkyWay.visible = true;
    this.milkyWayHaze.visible = true;
    this.dust.visible = true;
    this.decorGroup.visible = true;
    this.orbitalRoot.visible = true;
    if (this.nearUfo) this.nearUfo.group.visible = true;
    this.clouds.visible = to === "earth";
    this.syncLightsShell();
    if (to === "system") {
      this.exitGalaxyToSystem();
    } else {
      this.mode = "earth";
      this.globeMat.map = this.bodyTex.earth;
      this.nodesGroup.visible = true;
      /* continuity: galaxy's inner limit (≈16) flows into earth's range (3.4–15) */
      this.sph.radius = Math.min(this.sph.radius, 14);
      this.homeSph = { theta: this.sph.theta, phi: 1.18, radius: BODY_CFG.earth.camDist };
      this.lookAt.set(0, 0, 0);
    }
  }

  private exitGalaxyToSystem() {
    this.mode = "system";
    this.systemGroup.visible = true;
    this.bodyGroup.visible = false;
    this.sph.radius = Math.min(this.sph.radius, 40);
    this.homeSph = { theta: this.sph.theta, phi: 1.25, radius: 34 };
    this.lookAt.set(0, 0, 0);
  }

  /* ------------ moon as its own body (no skin-swap) ------------ */

  /** fly the camera to the real orbiting moon and enter a free local orbit */
  focusMoon() {
    const moon = this.moonInEarth;
    if (!moon || this.mode !== "earth") return;
    this.satFocus = null;
    this.focusPlanetId = null;
    const moonPos = this.moonWorldPos(new THREE.Vector3());
    const outward = moonPos.clone().normalize();
    /* keep the moon fully in frame instead of filling the whole screen */
    const to = moonPos.clone().addScaledVector(outward, 2.4);
    this.startFlight(to, moonPos.clone(), 1.8, () => {
      const rel = this.camera.position.clone().sub(moonPos);
      const len = rel.length() || 1;
      this.moonLocal = {
        theta: Math.atan2(rel.x, rel.z),
        phi: Math.acos(THREE.MathUtils.clamp(rel.y / len, -1, 1)),
        radius: len,
      };
      this.moonFocus = true;
    });
    this.idleUntil = this.time + 2;
  }

  clearMoonFocus() {
    this.moonFocus = false;
    this.resetView(1.6);
  }

  /** tap on empty space → release any camera follow and return to the free view */
  clearFocus() {
    if (this.mode === "galaxy") {
      if (this.galaxyFocusId || this.exoFocusId || this.starFocusId) this.clearGalaxyFocus();
    } else if (this.mode === "system") {
      if (this.focusPlanetId) {
        this.focusPlanetId = null;
        this.resetView(1.4);
      }
    } else if (this.mode === "earth") {
      if (this.satFocus || this.moonFocus) {
        this.satFocus = null;
        this.moonFocus = false;
        this.focusPlanetId = null;
        this.resetView(1.4);
      }
    }
  }

  /* ------------ camera flight (straight-line warp, no orbit sweep) ------------ */

  private sphToVec(
    s: { theta: number; phi: number; radius: number },
    out = new THREE.Vector3()
  ) {
    return out.set(
      s.radius * Math.sin(s.phi) * Math.sin(s.theta),
      s.radius * Math.cos(s.phi),
      s.radius * Math.sin(s.phi) * Math.cos(s.theta)
    );
  }

  private startFlight(to: THREE.Vector3, lookTo: THREE.Vector3, dur: number, onDone?: () => void) {
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    this.flight = {
      from: this.camera.position.clone(),
      to: to.clone(),
      lookFrom: this.lookAt.clone(),
      lookTo: lookTo.clone(),
      t: 0,
      dur,
      onDone,
    };
  }

  private finishFlight() {
    if (!this.flight) return;
    const f = this.flight;
    this.camera.position.copy(f.to);
    this.lookAt.copy(f.lookTo);
    const done = f.onDone;
    this.flight = null;
    if (done) done();
  }

  /**
   * Fly directly to a planet, then enter a FREE local orbit around it:
   * drag = orbit the planet · wheel = distance · the camera follows the
   * planet automatically while it keeps travelling on its orbit.
   */
  focusPlanet(id: string) {
    const p = this.planets.find((x) => x.id === id);
    if (!p) return;
    this.focusPlanetId = id;
    for (const pe of this.planets) {
      gsap.to(pe.highlight.material, { opacity: pe.id === id ? 0.9 : 0, duration: 0.45 });
      gsap.to(pe.glow.material, { opacity: pe.id === id ? 0.85 : 0.42, duration: 0.45 });
    }
    /* approach from the camera's current side of the planet — shortest path */
    const dist = Math.max(2.1, p.radius * 1.9 + 1.1);
    const rel = this.camera.position.clone().sub(p.world);
    const az = rel.lengthSq() < 1e-4 ? this.sph.theta : Math.atan2(rel.x, rel.z);
    const to = this.sphToVec({ theta: az, phi: 1.32, radius: dist }).add(p.world);
    this.startFlight(to, p.world.clone(), 1.9, () => {
      /* init local orbit state from arrival position */
      const r2 = this.camera.position.clone().sub(p.world);
      const len = r2.length() || 1;
      this.local = {
        theta: Math.atan2(r2.x, r2.z),
        phi: Math.acos(THREE.MathUtils.clamp(r2.y / len, -1, 1)),
        radius: len,
      };
    });
    this.idleUntil = this.time + 2;
  }

  /** one-click galaxy restore — instantly cancels any doomsday in progress */
  restoreGalaxy() {
    if (this.annihilation) this.finishAnnihilation();
  }

  /* ------------ ufo lookup helper ------------ */

  private ufoEntry(id: string): UfoEntry | null {
    if (id === "ufo_near") return this.nearUfo;
    const i = id === "ufo_01" ? 0 : id === "ufo_02" ? 1 : -1;
    if (i >= 0 && this.ufos[i]) return this.ufos[i];
    return null;
  }

  /* ------------ interactive orbital facility matrix ------------ */

  /** lock first-person view onto a facility and follow it in its orbit */
  focusSatellite(id: string) {
    const unit = this.orbitals.find((o) => o.id === id && o.clickable);
    if (!unit) return;
    this.satFocus = unit;
    this.focusPlanetId = null;
    this.flight = null;
    gsap.killTweensOf(this.sph);
    this.idleUntil = this.time + 999;
  }

  clearSatFocus() {
    this.satFocus = null;
    this.resetView(1.2);
  }

  /* ------------ lighting modes: full day · dawn · night ------------ */

  setLightMode(mode: "full" | "dawn" | "night") {
    this.lightMode = mode;
    const cfg = {
      /* physically-sane lighting: sun always bright enough to read the day side,
         ambient always enough to see the night side — never a fully black globe */
      full: { sunI: 2.8, ambI: 1.15, sunColor: 0xffffff, ambColor: 0x33465e, sunPos: [6, 4, 8] as const, lights: 1.2, atmo: 0x00e5ff },
      dawn: { sunI: 2.1, ambI: 0.7, sunColor: 0xffc08a, ambColor: 0x3a2f52, sunPos: [0.5, 1.2, 7] as const, lights: 1.0, atmo: 0xff9a4a },
      night: { sunI: 0.85, ambI: 0.42, sunColor: 0x6d86c8, ambColor: 0x1a2440, sunPos: [-6, -3, 4] as const, lights: 1.9, atmo: 0x3344aa },
    }[mode];
    gsap.to(this.sunLight, { intensity: cfg.sunI, duration: 1.4, ease: "power2.inOut" });
    gsap.to(this.sunLight.color, {
      r: ((cfg.sunColor >> 16) & 255) / 255,
      g: ((cfg.sunColor >> 8) & 255) / 255,
      b: (cfg.sunColor & 255) / 255,
      duration: 1.4,
    });
    gsap.to(this.ambLight, { intensity: cfg.ambI, duration: 1.4 });
    gsap.to(this.ambLight.color, {
      r: ((cfg.ambColor >> 16) & 255) / 255,
      g: ((cfg.ambColor >> 8) & 255) / 255,
      b: (cfg.ambColor & 255) / 255,
      duration: 1.4,
    });
    gsap.to(this.sunLight.position, { x: cfg.sunPos[0], y: cfg.sunPos[1], z: cfg.sunPos[2], duration: 1.6, ease: "power2.inOut" });
    gsap.to(this.lightsU.uIntensity, { value: cfg.lights, duration: 1.4 });
    if (this.mode !== "system") {
      gsap.to(this.atmoU.uColor.value, {
        r: ((cfg.atmo >> 16) & 255) / 255,
        g: ((cfg.atmo >> 8) & 255) / 255,
        b: (cfg.atmo & 255) / 255,
        duration: 1.4,
      });
    }
    /* sun direction uniform for the night-lights shader */
    this.lightsU.uSunDir.value.set(cfg.sunPos[0], cfg.sunPos[1], cfg.sunPos[2]).normalize();
  }

  getLightMode() {
    return this.lightMode;
  }

  /* ------------ render lab: wireframe · cyber neon · glitch ------------ */

  setLabMode(mode: number) {
    this.labMode = mode;
    this.applyLab();
  }

  private applyLab() {
    if (!this.labMat) return;
    if (this.mode === "earth" && this.labMode > 0) {
      this.labMat.uniforms.uMode.value = this.labMode;
      this.labMat.uniforms.uTex.value = this.bodyTex.earth;
      this.globe.material = this.labMat;
      this.globeMat.needsUpdate = false;
    } else {
      this.globe.material = this.globeMat;
    }
    this.clouds.visible = this.mode === "earth" && this.labMode === 0 && !!(this.clouds.material as THREE.MeshPhongMaterial).map;
    this.syncLightsShell();
  }

  getLabMode() {
    return this.labMode;
  }

  /* ------------ space weather: aurora · solar wind · meteor shower ------------ */

  triggerWeather(type: "aurora" | "wind" | "shower") {
    if (type === "aurora") {
      if (this.mode !== "earth") return false;
      const colors = [0x39ffb0, 0x55ffd0, 0x8affd6];
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(1.4 + i * 0.5, 0.09 + i * 0.04, 8, 64),
          new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        mesh.position.set(0, BODY_R * 1.18, 0);
        mesh.rotation.x = Math.PI / 2 - 0.22 - i * 0.1;
        this.bodyGroup.add(mesh);
        this.auroras.push({ mesh, phase: i * 1.3, t: 0, dur: 14 });
      }
    } else if (type === "wind") {
      const origin = this.mode === "system"
        ? (this.planets.find((p) => p.id === "sol")?.world ?? new THREE.Vector3())
        : this.sunLight.position.clone().normalize().multiplyScalar(14);
      for (let i = 0; i < 260; i++) {
        const dir = origin.clone().normalize();
        dir.x += (Math.random() - 0.5) * 0.35;
        dir.y += (Math.random() - 0.5) * 0.35;
        dir.z += (Math.random() - 0.5) * 0.35;
        dir.normalize();
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.dotTex,
            color: 0xffe9b0,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
          })
        );
        sp.scale.setScalar(0.05 + Math.random() * 0.05);
        sp.position.copy(origin).addScaledVector(dir, Math.random() * 3);
        this.scene.add(sp);
        this.windParticles.push({
          sprite: sp,
          pos: sp.position.clone(),
          vel: dir.multiplyScalar(4 + Math.random() * 6),
          t: 0,
          life: 2.6 + Math.random() * 2.2,
        });
      }
    } else if (type === "shower") {
      for (let i = 0; i < 46; i++) {
        setTimeout(() => this.spawnShootingStar(), i * 70);
      }
    }
    return true;
  }

  /* ------------ ufo tracking gameplay ------------ */

  setUfoTrack(id: string | null) {
    this.ufoTrackId = id;
    if (id && this.nearUfo) this.lastUfoPos.copy(this.nearUfo.group.position);
    if (!id && this.onUfoTelemetry) {
      this.onUfoTelemetry({ id: "", dist: 0, speed: 0, size: 0 });
    }
  }

  /** send the rocket to the station (dock) or to the tracked UFO */
  rocketTarget(kind: "dock" | "observe" | "intercept") {
    const rk = this.rocket;
    if (!rk || !rk.active || rk.target) return false;
    if (kind === "dock") {
      rk.target = { type: "dock" };
      return true;
    }
    const ufo = this.ufoTrackId ? this.ufoEntry(this.ufoTrackId) : null;
    if (!ufo) return false;
    rk.target = { type: kind, ufo };
    return true;
  }

  /** leave the local planet orbit and glide back to the free system overview */
  clearPlanetFocus() {
    this.focusPlanetId = null;
    for (const pe of this.planets) {
      gsap.to(pe.highlight.material, { opacity: 0, duration: 0.4 });
      gsap.to(pe.glow.material, { opacity: 0.42, duration: 0.4 });
    }
    const to = this.sphToVec(this.homeSph);
    this.startFlight(to, new THREE.Vector3(0, 0, 0), 1.9, () => {
      /* sync spherical state so free-view drags continue smoothly */
      const s = cartesianToSph(this.camera.position);
      this.sph.theta = s.theta;
      this.sph.phi = s.phi;
      this.sph.radius = s.radius;
    });
  }

  /* ============================================================
   *  ☠ GALAXY ANNIHILATION PROTOCOL — four doomsday methods
   * ============================================================ */

  private makeBlackHole() {
    const g = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 40, 28),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    const disk = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 2.4, 72),
      new THREE.MeshBasicMaterial({
        color: 0x9a66ff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    disk.rotation.x = Math.PI / 2 - 0.25;
    const inner = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.1, 72),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    inner.rotation.x = Math.PI / 2;
    g.add(core, disk, inner);
    return g;
  }

  /** ignite one of the four apocalypse methods */
  annihilate(method: DoomMethod, onDone: () => void) {
    if (this.annihilation) return;
    this.focusPlanetId = null;
    this.flight = null;
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    this.idleUntil = this.time + 999;

    const state: DoomState = {
      method,
      t: 0,
      dur: 5,
      onDone,
      hits: [],
      flashT: [],
      dirs: [],
      assets: [],
    };
    const count = this.planets.length;
    for (let i = 0; i < count; i++) {
      state.hits.push(0);
      state.flashT.push(9);
    }
    for (const p of this.planets) {
      const ang = p.angle;
      state.dirs.push(
        new THREE.Vector3(Math.cos(ang) * p.dist, 0, Math.sin(ang) * p.dist).normalize()
      );
      const m = p.mesh.material as THREE.MeshPhongMaterial;
      m.transparent = true;
    }

    switch (method) {
      case "void": {
        const bh = this.makeBlackHole();
        this.systemGroup.add(bh);
        state.assets.push(bh);
        state.dur = 5;
        break;
      }
      case "supernova": {
        const shock = new THREE.Mesh(
          new THREE.RingGeometry(0.92, 1, 96),
          new THREE.MeshBasicMaterial({
            color: 0xfff2cc,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        shock.rotation.x = Math.PI / 2 - 0.35;
        const shock2 = new THREE.Mesh(
          new THREE.RingGeometry(0.9, 1.02, 96),
          new THREE.MeshBasicMaterial({
            color: 0xff8c2a,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        shock2.rotation.x = Math.PI / 2 - 0.2;
        this.systemGroup.add(shock, shock2);
        const light = new THREE.PointLight(0xfff4e0, 5, 90);
        this.systemGroup.add(light);
        state.assets.push(shock, shock2, light);
        state.dur = 4.2;
        break;
      }
      case "dissolve": {
        const bursts: DoomBurst[] = [];
        this.planets.forEach((p, idx) => {
          const n = p.id === "sol" ? 20 : 10;
          for (let b = 0; b < n; b++) {
            const sp = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: this.dotTex,
                color: p.color,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                opacity: 0.9,
              })
            );
            const dir = new THREE.Vector3(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            ).normalize();
            sp.position.set(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
            this.systemGroup.add(sp);
            bursts.push({ sprite: sp, dir, speed: 1.2 + Math.random() * 2.6, idx });
          }
        });
        state.bursts = bursts;
        state.assets.push(...bursts.map((b) => b.sprite));
        state.dur = 4.2;
        break;
      }
      case "meteor": {
        const meteors: DoomMeteor[] = [];
        for (let i = 0; i < 90; i++) {
          const sp = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: this.dotTex,
              color: 0xff8844,
              blending: THREE.AdditiveBlending,
              transparent: true,
              depthWrite: false,
              opacity: 0.95,
            })
          );
          sp.scale.setScalar(0.14 + Math.random() * 0.1);
          const theta = Math.random() * Math.PI * 2;
          const r = 40 + Math.random() * 16;
          const from = new THREE.Vector3(Math.cos(theta) * r, (Math.random() - 0.5) * 26, Math.sin(theta) * r);
          sp.position.copy(from);
          let target: THREE.Vector3;
          let idx = -1;
          if (Math.random() < 0.65) {
            const pi = Math.floor(Math.random() * this.planets.length);
            const p = this.planets[pi];
            idx = pi;
            target = new THREE.Vector3(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
          } else {
            const t2 = Math.random() * Math.PI * 2;
            const r2 = Math.random() * 20;
            target = new THREE.Vector3(Math.cos(t2) * r2, 0, Math.sin(t2) * r2);
          }
          this.systemGroup.add(sp);
          meteors.push({
            sprite: sp,
            from,
            target,
            speed: 16 + Math.random() * 18,
            t: Math.random() * 0.5,
            arrived: false,
            idx,
          });
        }
        state.meteors = meteors;
        state.assets.push(...meteors.map((m) => m.sprite));
        state.dur = 6;
        break;
      }
    }
    this.annihilation = state;
  }

  private updateAnnihilation(dt: number) {
    const a = this.annihilation;
    if (!a) return;
    a.t += dt;
    const k = Math.min(1, a.t / a.dur);

    if (a.method === "void") {
      /* everything spirals into the singularity */
      const kk = Math.pow(k, 1.7);
      this.planets.forEach((p) => {
        if (p.dist > 0.001) {
          const ang = p.angle;
          const f = 1 - 0.985 * kk;
          p.group.position.set(Math.cos(ang) * p.dist * f, 0, Math.sin(ang) * p.dist * f);
        }
        p.group.scale.setScalar(Math.max(0.001, 1 - 0.97 * kk));
      });
      for (const ast of this.asteroids) {
        const f = 1 - 0.985 * kk;
        ast.mesh.position.set(
          Math.cos(ast.angle) * ast.dist * f,
          Math.sin(ast.angle) * ast.dist * ast.inc * f,
          Math.sin(ast.angle) * ast.dist * f
        );
      }
      const bh = a.assets[0];
      bh.scale.setScalar(0.15 + kk * 2.4);
      bh.children.forEach((c) => (c.rotation.z += dt * (1 + kk * 4)));

    } else if (a.method === "supernova") {
      /* shockwave flings planets outward */
      const kk = k * k;
      this.planets.forEach((p, i) => {
        const ang = p.angle;
        const bx = Math.cos(ang) * p.dist;
        const bz = Math.sin(ang) * p.dist;
        p.group.position.set(bx + a.dirs[i].x * kk * 46, 0, bz + a.dirs[i].z * kk * 46);
      });
      const sun = this.planets.find((x) => x.id === "sol");
      if (sun) sun.group.scale.setScalar(1 + k * 3.2);
      const shock = a.assets[0] as THREE.Mesh;
      shock.scale.setScalar(0.2 + k * 58);
      (shock.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - k, 1.6);
      const shock2 = a.assets[1] as THREE.Mesh;
      shock2.scale.setScalar(0.2 + k * 50);
      (shock2.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - k, 1.6) * 0.8;
      (a.assets[2] as THREE.PointLight).intensity = Math.pow(1 - k, 2) * 5;
      if (k < 0.45) {
        const s = 1 - k / 0.45;
        this.camera.position.x += (Math.random() - 0.5) * 0.14 * s;
        this.camera.position.y += (Math.random() - 0.5) * 0.14 * s;
      }

    } else if (a.method === "dissolve") {
      /* quantum decoherence — bodies turn to stardust */
      this.planets.forEach((p) => {
        const m = p.mesh.material as THREE.MeshPhongMaterial;
        m.opacity = Math.pow(1 - k, 1.4);
        p.group.scale.setScalar(1 + k * 0.55);
        const ang = p.angle;
        p.group.position.set(Math.cos(ang) * p.dist, 0, Math.sin(ang) * p.dist);
      });
      for (const b of a.bursts ?? []) {
        const p = this.planets[b.idx];
        const ang = p.angle;
        b.sprite.position.set(
          Math.cos(ang) * p.dist + b.dir.x * k * b.speed,
          b.dir.y * k * b.speed,
          Math.sin(ang) * p.dist + b.dir.z * k * b.speed
        );
        (b.sprite.material as THREE.SpriteMaterial).opacity = Math.pow(1 - k, 2) * 0.9;
        b.sprite.scale.setScalar(0.08 + k * 0.42);
      }

    } else if (a.method === "meteor") {
      /* meteor storm — planets take hits and crumble */
      for (const m of a.meteors ?? []) {
        if (!m.sprite.visible) continue;
        const mm = m.sprite.material as THREE.SpriteMaterial;
        if (!m.arrived) {
          m.t += dt;
          const d = m.from.distanceTo(m.target);
          const f = Math.min(1, (m.t * m.speed) / Math.max(0.001, d));
          m.sprite.position.copy(m.from).lerp(m.target, f);
          if (f >= 1) {
            m.arrived = true;
            m.t = 0;
            if (m.idx >= 0) {
              a.hits[m.idx]++;
              a.flashT[m.idx] = 0;
            }
            mm.color.set(0xffffff);
            mm.opacity = 1;
            m.sprite.scale.setScalar(0.5);
          }
        } else {
          m.t += dt;
          mm.opacity = Math.max(0, 1 - m.t * 4);
          m.sprite.scale.setScalar(0.5 + m.t * 6);
          if (mm.opacity <= 0) m.sprite.visible = false;
        }
      }
      this.planets.forEach((p, i) => {
        p.group.scale.setScalar(Math.max(0.02, 1 - a.hits[i] * 0.11));
        a.flashT[i] += dt;
        const fl = Math.max(0, 1 - a.flashT[i] * 2.5);
        (p.glow.material as THREE.SpriteMaterial).opacity = 0.42 + fl * 1.3;
      });
    }

    if (a.t >= a.dur) this.finishAnnihilation();
  }

  private finishAnnihilation() {
    const a = this.annihilation;
    if (!a) return;
    for (const o of a.assets) {
      this.systemGroup.remove(o);
      o.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    }
    this.planets.forEach((p) => {
      const m = p.mesh.material as THREE.MeshPhongMaterial;
      m.opacity = 1;
      m.transparent = false;
      m.needsUpdate = true;
      p.group.scale.setScalar(1);
      const ang = p.angle;
      p.group.position.set(Math.cos(ang) * p.dist, 0, Math.sin(ang) * p.dist);
      (p.glow.material as THREE.SpriteMaterial).opacity = p.id === "sol" ? 0.5 : 0.42;
    });
    this.annihilation = null;
    this.idleUntil = this.time + 3;
    const cb = a.onDone;
    cb();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.onPointerDown);
    canvas.removeEventListener("pointermove", this.onPointerMove);
    canvas.removeEventListener("pointerup", this.onPointerUp);
    canvas.removeEventListener("pointerleave", this.onPointerLeave);
    canvas.removeEventListener("pointercancel", this.onPointerCancel);
    canvas.removeEventListener("wheel", this.onWheel);
    canvas.removeEventListener("dblclick", this.onDblClick);

    this.resizeObs.disconnect();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
    if (canvas.parentElement === this.container) this.container.removeChild(canvas);
  }

  /* ------------ events ------------ */

  private onPointerDown = (e: PointerEvent) => {
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.activePointers.size >= 2) {
      /* second finger → pinch-to-zoom gesture */
      this.pinched = true;
      this.dragging = false;
      const [a, b] = [...this.activePointers.values()];
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      return;
    }
    this.dragging = true;
    this.moved = false;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    /* middle button or right button = PAN (up/down/left/right) */
    this.panning = e.button === 1 || e.button === 2;
    /* touch/mouse tap — compute the hover target NOW so a tap can open the
       planet/star/galaxy on release. Desktop hover already updates this via
       pointermove, but touch only fires pointermove while dragging, so without
       this the hover* fields stay null and taps never register as clicks. */
    if (!this.panning) this.updateHover(e);
    /* interrupt any in-flight camera warp so the drag feels instant */
    this.finishFlight();
    gsap.killTweensOf(this.sph);
    gsap.killTweensOf(this.lookAt);
    this.idleUntil = this.time + 120;
    this.lookGoalOverride = 0; /* dragging returns the view to its natural target */
    this.renderer.domElement.setPointerCapture(e.pointerId);
  };

  /* while a celestial body is focused, the camera follows it EVERY frame —
     drag just rotates the orbit offset, wheel changes the distance */
  private followTarget(t: THREE.Vector3, orbit: { theta: number; phi: number; radius: number }, dt: number, idleRate = 0.06) {
    if (!this.dragging && this.time > this.idleUntil) orbit.theta += dt * idleRate;
    this.sphToVec(orbit, this.tmpV);
    this.camera.position.copy(t).add(this.tmpV);
    if (this.lookGoalOverride > 0) {
      this.lookGoalOverride -= dt;
      this.lookAt.lerp(this.lookAtGoal, Math.min(1, dt * 6));
    } else {
      this.lookAt.lerp(t, Math.min(1, dt * 6));
    }
  }

  private onPointerMove = (e: PointerEvent) => {
    const cur = this.activePointers.get(e.pointerId);
    if (cur) {
      cur.x = e.clientX;
      cur.y = e.clientY;
    }
    /* pinch-to-zoom with two fingers */
    if (this.activePointers.size >= 2) {
      const pts = [...this.activePointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      if (this.pinchDist > 0) {
        /* spread fingers OUT (dist grows) → zoom IN → radius shrinks;
           pinching IN (dist shrinks) → zoom OUT → radius grows.
           radius is the camera distance, so we invert the spread ratio. */
        const ratio = this.pinchDist / dist;
        this.setZoomRadius(this.clampZoomRadius(this.getZoomRadius() * ratio));
      }
      this.pinchDist = dist;
      this.moved = true;
      return;
    }
    if (this.dragging) {
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      if (this.panning) {
        /* PAN — translate the view horizontally/vertically in screen space */
        const d = this.camera.position.distanceTo(this.lookAt);
        const scale = d * 0.0019;
        const right = this.tmpV.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = this.tmpV2.set(0, 1, 0).applyQuaternion(this.camera.quaternion);
        const pan = right.multiplyScalar(-dx * scale).addScaledVector(up, dy * scale);
        this.lookAt.add(pan);
        this.lookAtGoal.add(pan);
        this.lookGoalOverride = 0.35;
      } else if ((this.galaxyFocusId || this.exoFocusId || this.starFocusId) && this.mode === "galaxy") {
        this.galaxyLocal.theta -= dx * 0.0042;
        this.galaxyLocal.phi = THREE.MathUtils.clamp(this.galaxyLocal.phi - dy * 0.0042, 0.2, Math.PI - 0.2);
      } else if (this.moonFocus && this.mode === "earth") {
        /* orbit the moon */
        this.moonLocal.theta -= dx * 0.0042;
        this.moonLocal.phi = THREE.MathUtils.clamp(this.moonLocal.phi - dy * 0.0042, 0.2, Math.PI - 0.2);
      } else if (this.mode === "system" && this.focusPlanetId) {
        /* free orbit around the locked planet */
        this.local.theta -= dx * 0.0042;
        this.local.phi = THREE.MathUtils.clamp(this.local.phi - dy * 0.0042, 0.2, Math.PI - 0.2);
      } else {
        this.sph.theta -= dx * 0.0042;
        this.sph.phi = THREE.MathUtils.clamp(this.sph.phi - dy * 0.0042, 0.16, Math.PI - 0.16);
      }
      /* generous tap threshold — a real tap on a phone often drifts a few px
         from the down point; only cross it when the finger is clearly dragging */
      if (Math.hypot(e.clientX - this.downX, e.clientY - this.downY) > 15) this.moved = true;
    } else {
      this.updateHover(e);
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size < 2) this.pinchDist = 0;
    const wasClick = !this.moved && !this.pinched;
    this.dragging = false;
    if (this.activePointers.size === 0) this.pinched = false;
    if (this.renderer.domElement.hasPointerCapture(e.pointerId)) {
      this.renderer.domElement.releasePointerCapture(e.pointerId);
    }
    /* recompute the hover target at the release point so a tap opens the
       object under the finger even if it drifted a few px since pointerdown */
    if (wasClick) this.updateHover(e);
    if (this.annihilation) return;
    /* click (not drag) → galaxy interior stars · galaxy interior planets · galaxy stars · UFO · node · celestial body */
    if (wasClick && this.mode === "galaxyInterior" && this.interiorSystemStarId && this.hoverInteriorSysPlanet && this.onGalaxyInteriorPlanetClick) {
      this.onGalaxyInteriorPlanetClick(this.hoverInteriorSysPlanet);
      return;
    }
    if (wasClick && this.mode === "galaxyInterior" && this.hoverGalaxyInteriorExo && this.onGalaxyInteriorPlanetClick) {
      this.onGalaxyInteriorPlanetClick(this.hoverGalaxyInteriorExo);
      return;
    }
    if (wasClick && this.mode === "galaxyInterior" && this.hoverGalaxyInterior && this.onGalaxyInteriorStarClick) {
      this.onGalaxyInteriorStarClick(this.hoverGalaxyInterior);
      return;
    }
    if (wasClick && this.mode === "galaxy" && this.hoverExo && this.onExoPlanetClick) {
      this.onExoPlanetClick(this.hoverExo);
      return;
    }
    if (wasClick && this.mode === "galaxy" && this.hoverGalaxy && this.onGalaxyClick) {
      this.onGalaxyClick(this.hoverGalaxy);
      return;
    }
    if (wasClick && this.mode === "galaxy" && this.hoverStar && this.onStarClick) {
      this.onStarClick(this.hoverStar);
      return;
    }
    if (wasClick && this.hoverUfo && this.onAlien) {
      this.onAlien(this.ufoHoverId);
      return;
    }
    if (wasClick && this.hoverSat && this.onSatelliteClick) {
      this.onSatelliteClick(this.hoverSat.id);
      return;
    }
    if (wasClick && this.hoverMoon && this.onMoonClick) {
      this.onMoonClick();
      return;
    }
    if (wasClick && this.mode === "system" && this.hoverPlanetId && this.onPlanetClick) {
      this.onPlanetClick(this.hoverPlanetId);
    } else if (wasClick && this.hoverId && this.onNodeClick) {
      this.onNodeClick(this.hoverId);
    } else if (wasClick) {
      /* tapped empty space → release any camera follow */
      this.clearFocus();
    }
  };

  private onPointerLeave = () => {
    this.dragging = false;
    if (this.onHover) this.onHover(null);
  };

  private onPointerCancel = () => {
    this.activePointers.clear();
    this.pinchDist = 0;
    this.pinched = false;
    this.dragging = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    gsap.killTweensOf(this.sph);
    /* capture the world pivot under the pointer BEFORE zooming */
    this.zoomCam0.copy(this.camera.position);
    this.zoomLook0.copy(this.lookAt);
    this.zoomPivot = this.pickPointerPivot(e);
    /* normalized delta — touchpads (small delta) zoom smoothly, wheels (100+) one notch */
    const nd = THREE.MathUtils.clamp(e.deltaY, -120, 120) / 120;
    this.beginZoom(this.getZoomRadius() * Math.pow(1.16, nd));
  };

  /** shared zoom driver: clamp to the current view's range + inertial easing */
  private beginZoom(targetRaw: number) {
    /* zoom is clamped to the current level — no automatic layer switching */
    this.zoomTarget = this.clampZoomRadius(targetRaw);
    this.zoomAnim = 0.3;
    this.lookGoalOverride = 0.4;
    this.idleUntil = this.time + 4;
  }

  /** keyboard zoom (settings-module friendly) */
  zoomBy(dir: number) {
    this.zoomCam0.copy(this.camera.position);
    this.zoomLook0.copy(this.lookAt);
    this.zoomPivot = null;
    this.beginZoom(this.getZoomRadius() * Math.pow(1.16, THREE.MathUtils.clamp(dir, -1, 1)));
  }

  private getZoomRadius(): number {
    if (this.mode === "galaxyInterior") {
      return this.interiorSystemStarId ? this.interiorSystemLocal.radius : this.galaxyInteriorLocal.radius;
    }
    if ((this.exoFocusId || this.galaxyFocusId || this.starFocusId) && this.mode === "galaxy") return this.galaxyLocal.radius;
    if (this.moonFocus && this.mode === "earth") return this.moonLocal.radius;
    if (this.mode === "system" && this.focusPlanetId) return this.local.radius;
    return this.sph.radius;
  }

  private setZoomRadius(r: number) {
    if (this.mode === "galaxyInterior") {
      if (this.interiorSystemStarId) this.interiorSystemLocal.radius = r;
      else this.galaxyInteriorLocal.radius = r;
    }
    else if ((this.exoFocusId || this.galaxyFocusId || this.starFocusId) && this.mode === "galaxy") this.galaxyLocal.radius = r;
    else if (this.moonFocus && this.mode === "earth") this.moonLocal.radius = r;
    else if (this.mode === "system" && this.focusPlanetId) this.local.radius = r;
    else this.sph.radius = r;
  }

  private clampZoomRadius(r: number): number {
    if (this.mode === "galaxyInterior") {
      if (this.interiorSystemStarId) {
        if (this.interiorSystemFocusPlanetId) {
          const p = this.interiorSystemPlanets.find((x) => x.def.id === this.interiorSystemFocusPlanetId);
          const minR = (p ? (p.mesh.geometry as THREE.SphereGeometry).parameters.radius : 0.5) * 1.8 + 0.4;
          return THREE.MathUtils.clamp(r, minR, 110);
        }
        return THREE.MathUtils.clamp(r, 4, 110);
      }
      /* panorama — keep the camera outside the galaxy disc (thin particle plane) */
      const cfg = this.galaxyInteriorCurrent ? GALAXY_INTERIOR_CONFIGS[this.galaxyInteriorCurrent] : null;
      const disc = cfg ? cfg.discRadius : 30;
      return THREE.MathUtils.clamp(r, disc * 0.9, disc * 5);
    }
    if (this.exoFocusId && this.mode === "galaxy") {
      const ex = this.exoPlanets.find((x) => x.def.id === this.exoFocusId);
      return THREE.MathUtils.clamp(r, ex ? ex.def.radius * 1.6 : 2, 40);
    }
    if (this.starFocusId && this.mode === "galaxy") {
      const sm = this.starMarkers.find((x) => x.id === this.starFocusId);
      const starR = sm ? (sm.mesh.geometry as THREE.SphereGeometry).parameters.radius : 0.7;
      return THREE.MathUtils.clamp(r, Math.max(starR * 3.4, 2.2), 30);
    }
    if (this.galaxyFocusId && this.mode === "galaxy") {
      const g = this.neighborGalaxies.find((x) => x.id === this.galaxyFocusId);
      /* keep the camera outside the disc — scaling inside the thin particle
         plane looks like nothing (black screen) */
      const min = Math.max(g ? g.scale * 1.4 : 14, 14);
      return THREE.MathUtils.clamp(r, min, 80);
    }
    if (this.mode === "galaxy") return THREE.MathUtils.clamp(r, 16, 330);
    if (this.moonFocus && this.mode === "earth") return THREE.MathUtils.clamp(r, 0.75, 7);
    if (this.mode === "system" && this.focusPlanetId) {
      const p = this.planets.find((x) => x.id === this.focusPlanetId);
      const minR = (p ? p.radius * 1.7 : 2) + 0.6;
      return THREE.MathUtils.clamp(r, minR, 40);
    }
    const [minR, maxR] = this.mode === "system" ? [4, 70] : [3.4, 15];
    return THREE.MathUtils.clamp(r, minR, maxR);
  }

  /** world point under the cursor (on the plane through the look target) */
  private pickPointerPivot(e: WheelEvent): THREE.Vector3 | null {
    const rect = this.container.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Vector3(ndcX, ndcY, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();
    const viewDir = this.lookAt.clone().sub(this.camera.position).normalize();
    const denom = ray.dot(viewDir);
    if (Math.abs(denom) < 1e-4) return null;
    const t = this.lookAt.distanceTo(this.camera.position) / denom;
    return this.camera.position.clone().addScaledVector(ray, t);
  }

  /** inertial zoom easing + continuous pointer anchoring — runs every frame */
  private updateZoomAnim(dt: number) {
    if (this.zoomAnim <= 0 || this.dragging) {
      if (this.zoomAnim > 0 && this.dragging) this.zoomAnim = 0;
      return;
    }
    this.zoomAnim -= dt;
    const cur = this.getZoomRadius();
    const k = Math.min(1, dt * 11);
    const next = cur + (this.zoomTarget - cur) * k;
    this.setZoomRadius(next);
    /* keep the pointer's scene point stationary THROUGHOUT the ease */
    if (this.zoomPivot) {
      const d0 = Math.max(this.zoomLook0.distanceTo(this.zoomCam0), 0.001);
      const d1 = Math.max(this.lookAt.distanceTo(this.camera.position), 0.001);
      const s = d1 / d0;
      const P = this.zoomPivot;
      const L0 = this.zoomLook0;
      this.lookAtGoal.copy(P).addScaledVector(L0.clone().sub(P), s);
      this.lookAt.lerp(this.lookAtGoal, Math.min(1, dt * 14));
      this.lookGoalOverride = 0.2;
    }
    if (Math.abs(this.getZoomRadius() - this.zoomTarget) < 0.002 || this.zoomAnim <= 0) {
      this.setZoomRadius(this.zoomTarget);
      this.zoomAnim = 0;
      this.zoomPivot = null;
    }
  }

  private onDblClick = () => {
    if (this.isInInteriorSystem()) {
      this.exitInteriorStarSystem();
      return;
    }
    if (this.starFocusId) this.clearStarFocus();
    else if (this.exoFocusId) this.clearExoFocus();
    else if (this.galaxyFocusId) this.clearGalaxyFocus();
    else if (this.moonFocus) this.clearMoonFocus();
    else if (this.mode === "system" && this.focusPlanetId) this.clearPlanetFocus();
    else this.resetView(1.4);
  };

  private updateHover(e: PointerEvent) {
    if (!this.onHover) return;
    if (this.annihilation) {
      this.onHover(null);
      return;
    }

    /* galaxy interior — hover the real stars (mirrors galaxy mode) */
    if (this.mode === "galaxyInterior") {
      const rect = this.container.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      /* star-system sub-level — hover the orbiting planets + the central star */
      if (this.interiorSystemStarId) {
        let bestSys: { id: string; name: string; color: string } | null = null;
        let bestSysD = 0.05;
        for (const p of this.interiorSystemPlanets) {
          p.mesh.updateWorldMatrix(true, false);
          p.mesh.getWorldPosition(this.tmpV);
          this.tmpV.project(this.camera);
          if (this.tmpV.z > 1) continue;
          const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
          if (d < bestSysD) {
            bestSysD = d;
            bestSys = { id: p.def.id, name: p.def.name, color: p.def.color };
          }
        }
        this.hoverInteriorSysPlanet = bestSys ? bestSys.id : null;
        if (bestSys) {
          this.renderer.domElement.style.cursor = "pointer";
          this.onHover({ id: bestSys.id, name: bestSys.name, color: bestSys.color, x: e.clientX, y: e.clientY });
        } else {
          this.renderer.domElement.style.cursor = "crosshair";
          this.onHover(null);
        }
        return;
      }
      /* check exoplanets first (smaller targets) */
      let bestExo: { id: string; name: string; color: string } | null = null;
      let bestExoD = 0.04;
      for (const ex of this.galaxyInteriorExoPlanets) {
        if (!ex.pivot.visible) continue;
        ex.mesh.updateWorldMatrix(true, false);
        ex.mesh.getWorldPosition(this.tmpV);
        this.tmpV.project(this.camera);
        if (this.tmpV.z > 1) continue;
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < bestExoD) {
          bestExoD = d;
          bestExo = { id: ex.def.id, name: ex.def.name, color: ex.def.color };
        }
      }
      this.hoverGalaxyInteriorExo = bestExo ? bestExo.id : null;
      if (bestExo) {
        this.renderer.domElement.style.cursor = "pointer";
        this.onHover({ id: bestExo.id, name: bestExo.name, color: bestExo.color, x: e.clientX, y: e.clientY });
        return;
      }
      /* then check stars */
      let best: { id: string; name: string; color: string } | null = null;
      let bestD = 0.06;
      for (const m of this.galaxyInteriorStarMarkers) {
        m.mesh.updateWorldMatrix(true, false);
        m.mesh.getWorldPosition(this.tmpV);
        this.tmpV.project(this.camera);
        if (this.tmpV.z > 1) continue;
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < bestD) {
          bestD = d;
          best = { id: m.id, name: m.name, color: m.color };
        }
      }
      this.hoverGalaxyInterior = best ? best.id : null;
      if (best) {
        this.renderer.domElement.style.cursor = "pointer";
        this.onHover({ id: best.id, name: best.name, color: best.color, x: e.clientX, y: e.clientY });
      } else {
        this.renderer.domElement.style.cursor = "crosshair";
        this.onHover(null);
      }
      return;
    }

    /* galaxy view — hover famous stars + the SOL marker */
    if (this.mode === "galaxy") {
      const rect = this.container.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      let best: { id: string; name: string; color: string } | null = null;
      let bestD = 0.07;
      for (const m of this.starMarkers) {
        /* always use the live world position (galaxyGroup rotates) */
        m.mesh.updateWorldMatrix(true, false);
        m.mesh.getWorldPosition(this.tmpV);
        this.tmpV.project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < bestD) {
          bestD = d;
          best = { id: m.id, name: m.name, color: m.color };
        }
      }
      if (this.solMarker) {
        this.tmpV.copy(this.solMarker.position).project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < bestD) best = { id: "sol", name: "SOL · HOME", color: "#FFD050" };
      }
      /* exoplanets — clickable once you focus the star OR galaxy they orbit */
      for (const ex of this.exoPlanets) {
        if (this.starFocusId === ex.parentGalaxyId) {
          /* star-system planets orbit the focused star */
          const star = this.starMarkers.find((s) => s.id === this.starFocusId);
          if (!star) continue;
          const angle = ex.angle ?? 0;
          ex.world.copy(star.world).add(
            new THREE.Vector3(
              Math.cos(angle) * ex.def.orbit,
              0,
              Math.sin(angle) * ex.def.orbit
            )
          );
        } else if (this.galaxyFocusId !== ex.parentGalaxyId) {
          continue;
        }
        this.tmpV.copy(ex.world).project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < 0.06) {
          bestD = d;
          best = { id: ex.def.id, name: ex.def.name, color: ex.def.color };
        }
      }
      /* neighbour galaxies — generous hit targets, but only when no star
         is closer. Stars always win at the same screen distance. */
      for (const g of this.neighborGalaxies) {
        g.group.getWorldPosition(this.tmpV);
        this.tmpV.project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        /* require the galaxy to be meaningfully closer than any star hit */
        if (d < 0.1 && (!best || d < bestD * 0.6)) {
          bestD = d;
          best = { id: g.id, name: g.name, color: g.color };
        }
      }
      this.hoverStar = best ? best.id : null;
      this.hoverGalaxy = best && this.neighborGalaxies.some((g) => g.id === best!.id) ? best.id : null;
      this.hoverExo = best && this.exoPlanets.some((p) => p.def.id === best!.id) ? best.id : null;
      if (best) {
        this.renderer.domElement.style.cursor = "pointer";
        this.onHover({ id: best.id, name: best.name, color: best.color, x: e.clientX, y: e.clientY });
      } else {
        this.renderer.domElement.style.cursor = "crosshair";
        this.onHover(null);
      }
      return;
    }

    /* solar system — hover celestial bodies */
    if (this.mode === "system") {
      const rect = this.container.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      let best: PlanetEntry | null = null;
      let bestD = Infinity;
      for (const p of this.planets) {
        this.tmpV.copy(p.world).project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        const thresh = THREE.MathUtils.clamp(
          (p.radius * 1.9) / Math.max(2.4, this.camera.position.distanceTo(p.world)),
          0.025,
          0.3
        );
        if (d < thresh && d < bestD) {
          bestD = d;
          best = p;
        }
      }
      /* wandering UFOs are also clickable */
      if (!best) {
        for (const u of this.ufos) {
          if (u.disabled) continue;
          this.tmpV.copy(u.group.position).project(this.camera);
          const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
          if (d < 0.06) {
            this.hoverUfo = true;
            this.ufoHoverId = u.id;
            this.renderer.domElement.style.cursor = "pointer";
            this.onHover({
              id: u.id,
              name: "UFO · ???",
              color: "#7CFF6B",
              x: e.clientX,
              y: e.clientY,
            });
            return;
          }
        }
      }
      this.hoverUfo = false;
      this.hoverPlanetId = best ? best.id : null;
      if (best) {
        this.renderer.domElement.style.cursor = "pointer";
        this.onHover({ id: best.id, name: best.name, color: best.color, x: e.clientX, y: e.clientY });
      } else {
        this.renderer.domElement.style.cursor = "crosshair";
        this.onHover(null);
      }
      return;
    }

    /* interactive orbital facilities + moon + near-earth UFO in terran view */
    if (this.mode === "earth") {
      const rect = this.container.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      /* satellites / station */
      for (const u of this.orbitals) {
        if (!u.clickable) continue;
        this.tmpV.copy(u.world).project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < 0.045) {
          this.hoverSat = u;
          this.renderer.domElement.style.cursor = "pointer";
          this.onHover({
            id: u.id,
            name:
              u.id === "tg-01"
                ? "TIANGONG"
                : u.id === "stn-01"
                  ? "ORBITAL STATION"
                  : `SAT · ${u.id.toUpperCase()}`,
            color: u.id === "tg-01" ? "#FF3344" : "#00F0FF",
            x: e.clientX,
            y: e.clientY,
          });
          return;
        }
      }
      this.hoverSat = null;

      /* orbiting moon */
      if (this.moonInEarth) {
        this.moonInEarth.mesh.getWorldPosition(this.tmpV);
        this.tmpV.project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < 0.05) {
          this.hoverMoon = true;
          this.renderer.domElement.style.cursor = "pointer";
          this.onHover({ id: "luna", name: "LUNA", color: "#CFD6E8", x: e.clientX, y: e.clientY });
          return;
        }
      }
      this.hoverMoon = false;

      /* near-earth UFO */
      if (this.nearUfo && !this.nearUfo.disabled) {
        this.tmpV.copy(this.nearUfo.group.position).project(this.camera);
        const d = Math.hypot(this.tmpV.x - ndcX, this.tmpV.y - ndcY);
        if (d < 0.07) {
          this.hoverUfo = true;
          this.ufoHoverId = "ufo_near";
          this.renderer.domElement.style.cursor = "pointer";
          this.onHover({
            id: "ufo_near",
            name: "UFO · ???",
            color: "#7CFF6B",
            x: e.clientX,
            y: e.clientY,
          });
          return;
        }
      }
      this.hoverUfo = false;
    }

    if (this.mode !== "earth" || this.nodes.length === 0) {
      this.onHover(null);
      return;
    }
    const rect = this.container.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    let best: NodeEntry | null = null;
    let bestD = 0.07;
    const v = new THREE.Vector3();
    for (const n of this.nodes) {
      v.copy(n.world).project(this.camera);
      const d = Math.hypot(v.x - ndcX, v.y - ndcY);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    this.hoverId = best ? best.id : null;
    if (best) {
      this.renderer.domElement.style.cursor = "pointer";
      this.onHover({ id: best.id, name: best.name, color: best.color, x: e.clientX, y: e.clientY });
    } else {
      this.renderer.domElement.style.cursor = "crosshair";
      this.onHover(null);
    }
    return;
  }

  private onResize() {
    const w = this.container.clientWidth;
    const h = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ------------ main loop ------------ */

  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;

    /* idle orbit (free views only — the focused-planet orbit has its own) */
    if (
      !this.dragging &&
      this.time > this.idleUntil &&
      !this.flight &&
      !this.moonFocus &&
      !(this.mode === "system" && this.focusPlanetId)
    ) {
      this.sph.theta += dt * 0.05;
    }

    /* texture scroll */
    if (this.mode !== "system" && this.mode !== "galaxy" && this.mode !== "galaxyInterior") {
      const spinTarget = this.activeId ? 0.0009 : BODY_CFG[this.mode].spin;
      const tex = this.bodyTex[this.mode];
      tex.offset.x -= dt * spinTarget;
      /* clouds drift faster than surface */
      const cloudMat = this.clouds.material as THREE.MeshPhongMaterial;
      if (this.clouds.visible && cloudMat.map) {
        this.cloudOffset += dt * 0.00055;
        cloudMat.map.offset.x = -this.cloudOffset;
      }
      /* night lights follow the rotating surface */
      this.lightsU.uOffset.value = tex.offset.x;
    }

    /* shooting stars — occasional streaks in every view */
    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && this.shootingStars.length < 3) {
      this.spawnShootingStar();
      this.shootTimer = 7 + Math.random() * 11;
    }
    this.updateShootingStars(dt);

    /* rocket — auto launch every so often while orbiting earth */
    if (this.mode === "earth" && !this.rocket) {
      this.rocketTimer -= dt;
      if (this.rocketTimer <= 0) {
        this.launchRocket();
        this.rocketTimer = 50 + Math.random() * 40;
      }
    }
    if (this.rocket) this.updateRocket(dt);

    /* near-earth UFO patrol */
    if (this.mode === "earth" && this.nearUfo) this.updateUfo(this.nearUfo, dt, false);

    /* moon landing program — scheduled launches from earth to the moon */
    if (this.mode === "earth" && !this.moonMission) {
      this.moonMissionTimer -= dt;
      if (this.moonMissionTimer <= 0) this.launchMoonMission();
    }
    if (this.moonMission) this.updateMoonMission(dt);

    /* solar system simulation — runs in EVERY mode so planets keep
       orbiting while you view the galaxy (the system stays alive) */
    if (this.annihilation) {
      this.updateAnnihilation(dt);
    } else {
      for (const p of this.planets) {
        p.angle += p.speed * dt;
        if (p.dist > 0.001) {
          p.group.position.set(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
        }
        if (p.moon) {
          p.moon.angle += p.moon.speed * dt;
          p.moon.pivot.rotation.y = p.moon.angle;
        }
        p.mesh.rotation.y += p.selfSpin * dt;
        p.group.updateWorldMatrix(true, false);
        p.mesh.getWorldPosition(p.world);
        if (this.focusPlanetId === p.id) {
          const s = 1 + Math.sin(this.time * 2.6) * 0.07;
          p.highlight.scale.setScalar(s);
        }
      }
    }
    this.belt.rotation.y += dt * 0.01;
    this.kuiperBelt.rotation.y += dt * 0.006;
    this.outerSystemRing.rotation.y -= dt * 0.008;
    /* comets + wandering UFOs + asteroids keep drifting in all modes */
    if (!this.annihilation) {
      this.updateComets(dt);
      for (const u of this.ufos) this.updateUfo(u, dt, true);
    }
    for (const a of this.asteroids) {
      a.angle += a.speed * dt;
      a.mesh.position.set(
        Math.cos(a.angle) * a.dist,
        Math.sin(a.angle) * a.dist * a.inc,
        Math.sin(a.angle) * a.dist
      );
      a.mesh.rotation.x += a.spin.x * dt;
      a.mesh.rotation.y += a.spin.y * dt;
      a.mesh.rotation.z += a.spin.z * dt;
    }

    /* constellation trains rotate on their orbit planes (Keplerian rates) */
    for (const t of this.constellationTrains) t.grp.rotation.y += t.speed * dt;

    /* 🇨🇳 the flags wave */
    if (this.tiangongFlag) {
      this.tiangongFlag.rotation.y = Math.sin(this.time * 2.6) * 0.3;
      this.tiangongFlag.rotation.z = -0.35 + Math.sin(this.time * 2.2) * 0.08;
    }
    if (this.moonFlagPole) {
      const moonFlag = this.moonFlagPole.children.find(
        (c) => (c.userData as { moonFlag?: boolean } | undefined)?.moonFlag
      ) as THREE.Mesh | undefined;
      if (moonFlag) {
        moonFlag.rotation.y = Math.sin(this.time * 3.1) * 0.22;
        moonFlag.position.x = 0.052 + Math.sin(this.time * 2.8) * 0.004;
      }
    }

    /* orbital units (satellites & stations) — orbit + blinking beacons */
    for (const u of this.orbitals) {
      u.angle += u.speed * dt;
      u.pivot.rotation.y = u.angle;
      for (const b of u.beacons) {
        const mat = b.sprite.material as THREE.SpriteMaterial;
        mat.opacity = Math.sin(this.time * 6 + b.phase) > 0 ? 0.95 : 0.1;
      }
      if (u.clickable) {
        u.carrier.updateWorldMatrix(true, false);
        u.carrier.getWorldPosition(u.world);
      }
    }

    /* moon orbiting earth in terran view — tidally locked (same face to earth).
       Slow majestic orbit (~84s period): fast enough to feel alive,
       slow enough for the lunar lander to intercept it. */
    if (this.moonInEarth) {
      this.moonInEarth.angle += dt * 0.075;
      this.moonInEarth.pivot.rotation.y = this.moonInEarth.angle;
      (this.moonInEarth.mesh.material as THREE.MeshPhongMaterial).map = this.bodyTex.moon;
    }

    /* aurora ribbons — fade in, wobble, fade out */
    for (let i = this.auroras.length - 1; i >= 0; i--) {
      const a = this.auroras[i];
      a.t += dt;
      const env = Math.min(1, Math.min(a.t / 2.5, (a.dur - a.t) / 2.5));
      (a.mesh.material as THREE.MeshBasicMaterial).opacity = env * 0.35;
      a.mesh.rotation.z = a.phase + this.time * 0.3 + Math.sin(this.time * 1.4 + a.phase) * 0.18;
      const wob = 1 + Math.sin(this.time * 2.1 + a.phase) * 0.07;
      a.mesh.scale.setScalar(wob);
      if (a.t >= a.dur) {
        this.bodyGroup.remove(a.mesh);
        (a.mesh.material as THREE.Material).dispose();
        a.mesh.geometry.dispose();
        this.auroras.splice(i, 1);
      }
    }

    /* solar wind particles */
    if (this.windParticles.length > 0) {
      for (let i = this.windParticles.length - 1; i >= 0; i--) {
        const w = this.windParticles[i];
        w.t += dt;
        w.pos.addScaledVector(w.vel, dt);
        w.sprite.position.copy(w.pos);
        (w.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - w.t / w.life);
        if (w.t >= w.life) {
          this.scene.remove(w.sprite);
          (w.sprite.material as THREE.Material).dispose();
          this.windParticles.splice(i, 1);
        }
      }
    }

    /* ufo telemetry stream while tracking */
    if (this.ufoTrackId && this.onUfoTelemetry) {
      this.ufoTelemetryAcc += dt;
      const ufo = this.ufoEntry(this.ufoTrackId);
      if (ufo && !ufo.disabled && this.ufoTelemetryAcc >= 0.4) {
        this.ufoTelemetryAcc = 0;
        const pos = ufo.group.position;
        const speed = this.lastUfoPos.distanceTo(pos) / 0.4;
        const base = this.mode === "system" ? 0 : BODY_R;
        const dist = Math.max(0, pos.length() - base);
        this.onUfoTelemetry({ id: this.ufoTrackId, dist, speed, size: ufo.system ? 1.8 : 0.9 });
        this.lastUfoPos.copy(pos);
      }
    }

    /* render lab clock */
    if (this.labMat) {
      this.labMat.uniforms.uTime.value = this.time;
      if (this.labMode > 0) this.labMat.uniforms.uTex.value = this.bodyTex.earth;
    }

    /* nodes */
    for (const n of this.nodes) {
      const boostTarget = this.activeId === n.id ? (n.locked ? 4.2 : 2.4) : 0;
      n.boost += (boostTarget - n.boost) * Math.min(1, dt * 2.5);
      n.spinA.rotation.z += dt * (0.9 + n.boost);
      n.spinB.rotation.z -= dt * (0.55 + n.boost * 0.7);

      n.pulseU.uTime.value = this.time;
      const t = (this.time * n.pulseU.uSpeed.value + n.pulseU.uPhase.value) % 1;
      const s = 0.55 + t * 1.75;
      n.pulse.scale.setScalar(s);

      if (this.activeId === n.id) {
        n.cross.material.rotation += dt * (n.locked ? 3.4 : 1.2);
      }
    }

    /* decor */
    this.decorA.rotation.z += dt * 0.055;
    this.decorB.rotation.z -= dt * 0.04;
    this.dashedRing.rotation.y += dt * 0.09;
    this.dust.rotation.y += dt * 0.021;
    this.stars.rotation.y -= dt * 0.0042;
    /* gentle starfield twinkle */
    (this.stars.material as THREE.PointsMaterial).opacity = 0.72 + Math.sin(this.time * 0.9) * 0.1;
    /* sun: subtle sheen + rising thermal shimmer */
    const sunP = this.planets.find((p) => p.id === "sol");
    if (sunP) {
      sunP.glow.scale.setScalar(4.8 + Math.sin(this.time * 0.6) * 0.15);
      (sunP.glow.material as THREE.SpriteMaterial).opacity = 0.14 + Math.sin(this.time * 0.6) * 0.02;
    }
    for (const hm of this.sunHeatMats) hm.uniforms.uTime.value = this.time;

    /* galaxy — slow majestic rotation + star twinkle + SOL beacon pulse */
    if (this.mode === "galaxy" && this.galaxyGroup.visible) {
      this.galaxyGroup.rotation.y += dt * 0.006;
      this.galaxyGroup.updateMatrixWorld(true);
      for (const m of this.starMarkers) {
        /* binary orbits + proper motion — real stellar kinematics */
        if (m.orbit) {
          const o = m.orbit;
          o.phase += o.rate * dt;
          const v = new THREE.Vector3(
            Math.cos(o.phase),
            Math.sin(o.phase) * 0.55,
            Math.sin(o.phase)
          )
            .normalize()
            .multiplyScalar(o.radius);
          /* rotate into the orbit plane */
          v.applyAxisAngle(o.axis, o.phase * 0.35);
          m.mesh.position.copy(o.center).add(v);
          m.glow.position.copy(o.center).add(v);
        } else {
          /* proper motion drift along the galactic plane */
          if (m.proper) {
            const cycle = 1 + 0.4 * Math.sin(this.time * 0.1 + m.properCycle);
            m.mesh.position.addScaledVector(m.proper, cycle * dt);
            m.glow.position.addScaledVector(m.proper, cycle * dt);
          }
        }
        /* CRITICAL: world position must account for the rotating galaxyGroup */
        m.mesh.updateWorldMatrix(true, false);
        m.mesh.getWorldPosition(m.world);
        /* star self-rotation */
        m.mesh.rotation.y += dt * 0.12;
        const gm = m.glow.material as THREE.SpriteMaterial;
        gm.opacity = 0.7 + Math.sin(this.time * 2.4 + m.world.x) * 0.25;
        /* interaction — reticle pulses + name plate appears on hover/focus */
        const active = m.id === this.hoverStar || m.id === this.starFocusId;
        if (m.reticle) {
          m.reticle.position.copy(m.mesh.position);
          const rm = m.reticle.material as THREE.SpriteMaterial;
          rm.opacity = active ? 0.4 + Math.sin(this.time * 4) * 0.18 : 0;
        }
        if (m.label) {
          m.label.position.copy(m.mesh.position);
          m.label.position.y += 2.4;
          m.label.visible = active;
        }
      }
      if (this.solMarker) {
        this.solMarker.scale.setScalar(1.4 + Math.sin(this.time * 2.8) * 0.3);
        (this.solMarker.material as THREE.SpriteMaterial).opacity =
          0.8 + Math.sin(this.time * 2.8) * 0.2;
      }
      /* exoplanets orbit their hosts + self-rotate; only visible when the
         host star/galaxy is focused */
      for (const ex of this.exoPlanets) {
        const hostIsStar = this.starMarkers.some((s) => s.id === ex.parentGalaxyId);
        const visible =
          this.starFocusId === ex.parentGalaxyId || this.galaxyFocusId === ex.parentGalaxyId;
        ex.pivot.visible = visible;
        if (!visible) continue;
        ex.angle += ex.def.speed * dt;
        /* star-hosted planets orbit the star; galaxy-hosted ones use their pivot */
        if (hostIsStar) {
          const star = this.starMarkers.find((s) => s.id === ex.parentGalaxyId);
          if (star) {
            ex.pivot.position.copy(star.world);
          }
        } else {
          const galaxy = this.neighborGalaxies.find((g) => g.id === ex.parentGalaxyId);
          if (galaxy) {
            galaxy.group.getWorldPosition(ex.pivot.position);
          }
        }
        ex.mesh.position.set(
          Math.cos(ex.angle) * ex.def.orbit,
          0,
          Math.sin(ex.angle) * ex.def.orbit
        );
        ex.mesh.rotation.y += dt * 0.1;
        ex.mesh.updateWorldMatrix(true, false);
        ex.mesh.getWorldPosition(ex.world);
      }
    }

    /* galaxy interior — real stars + planets + procedural backdrop (mirrors galaxy mode) */
    if (this.mode === "galaxyInterior" && this.galaxyInteriorGroup.visible) {
      this.galaxyInteriorGroup.rotation.y += dt * 0.005;
      this.galaxyInteriorGroup.updateMatrixWorld(true);
      for (const m of this.galaxyInteriorStarMarkers) {
        if (m.proper) {
          const cycle = 1 + 0.4 * Math.sin(this.time * 0.1 + m.properCycle);
          m.mesh.position.addScaledVector(m.proper, cycle * dt);
        }
        m.glow.position.copy(m.mesh.position);
        m.reticle.position.copy(m.mesh.position);
        m.mesh.updateWorldMatrix(true, false);
        m.mesh.getWorldPosition(m.world);
        m.mesh.rotation.y += dt * 0.12;
        const gm = m.glow.material as THREE.SpriteMaterial;
        gm.opacity = 0.7 + Math.sin(this.time * 2.4 + m.world.x) * 0.25;
        /* reticle pulse — draws the eye to clickable stars */
        const pulse = 1 + Math.sin(this.time * 3 + m.properCycle) * 0.14;
        m.reticle.scale.setScalar(m.reticle.userData.baseScale * pulse);
        const rm = m.reticle.material as THREE.SpriteMaterial;
        rm.opacity = this.galaxyInteriorFocusId === m.id ? 0.95 : 0.45 + Math.sin(this.time * 3 + m.properCycle) * 0.15;
      }
      /* exoplanets orbit their host stars — always visible */
      for (const ex of this.galaxyInteriorExoPlanets) {
        ex.pivot.visible = true;
        ex.angle += ex.def.speed * dt;
        const star = this.galaxyInteriorStarMarkers.find((s) => s.id === ex.parentStarId);
        if (star) ex.pivot.position.copy(star.mesh.position);
        ex.mesh.position.set(
          Math.cos(ex.angle) * ex.orbitDist,
          0,
          Math.sin(ex.angle) * ex.orbitDist
        );
        ex.mesh.rotation.y += dt * 0.1;
        ex.mesh.updateWorldMatrix(true, false);
        ex.mesh.getWorldPosition(ex.world);
      }
    }

    /* star-system sub-level — planets orbit the central star at system scale */
    if (this.mode === "galaxyInterior" && this.interiorSystemStarId && this.interiorSystemGroup.visible) {
      for (const p of this.interiorSystemPlanets) {
        p.angle += p.def.speed * 0.45 * dt;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitDist,
          0,
          Math.sin(p.angle) * p.orbitDist
        );
        p.mesh.rotation.y += dt * 0.15;
        p.mesh.updateWorldMatrix(true, false);
        p.mesh.getWorldPosition(p.world);
      }
    }

    /* camera — states: star focus · exoplanet focus · galaxy focus · flight · satellite · moon · planet · free */
    if (this.starFocusId && this.mode === "galaxy" && !this.flight) {
      const m = this.starMarkers.find((x) => x.id === this.starFocusId);
      if (m) {
        /* min distance keeps the whole star ball in frame */
        const starR = (m.mesh.geometry as THREE.SphereGeometry).parameters.radius;
        const minD = Math.max(starR * 3.4, 2.2);
        if (this.galaxyLocal.radius < minD) this.galaxyLocal.radius = minD;
        this.followTarget(m.world, this.galaxyLocal, dt, 0.06);
      } else {
        this.starFocusId = null;
      }
    } else if (this.exoFocusId && this.mode === "galaxy" && !this.flight) {
      const ex = this.exoPlanets.find((x) => x.def.id === this.exoFocusId);
      if (ex) {
        ex.mesh.getWorldPosition(ex.world);
        this.followTarget(ex.world, this.galaxyLocal, dt, 0.07);
      } else {
        this.exoFocusId = null;
      }
    } else if (this.galaxyFocusId && this.mode === "galaxy" && !this.flight) {
      const g = this.neighborGalaxies.find((x) => x.id === this.galaxyFocusId);
      if (g) {
        g.group.getWorldPosition(g.world);
        this.followTarget(g.world, this.galaxyLocal, dt, 0.06);
      } else {
        this.galaxyFocusId = null;
      }
    } else if (this.mode === "galaxyInterior" && this.interiorSystemFocusPlanetId && !this.flight) {
      /* camera rides the orbiting planet inside the star-system sub-level */
      const p = this.interiorSystemPlanets.find((x) => x.def.id === this.interiorSystemFocusPlanetId);
      if (p) {
        this.followTarget(p.world, this.interiorSystemLocal, dt, 0.06);
      } else {
        this.interiorSystemFocusPlanetId = null;
      }
    } else if (this.galaxyInteriorFocusId && this.mode === "galaxyInterior" && !this.flight) {
      const m = this.galaxyInteriorStarMarkers.find((x) => x.id === this.galaxyInteriorFocusId);
      if (m) {
        this.followTarget(m.world, this.galaxyInteriorLocal, dt, 0.06);
      } else {
        this.galaxyInteriorFocusId = null;
      }
    } else if (this.satFocus && this.mode === "earth" && !this.flight) {
      /* first-person view riding the facility */
      this.tmpV.copy(this.satFocus.world).normalize();
      this.camera.position.copy(this.satFocus.world).addScaledVector(this.tmpV, 0.42);
      this.lookAt.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 3));
      this.camera.lookAt(this.lookAt);
    } else if (this.moonFocus && this.moonInEarth && this.mode === "earth" && !this.flight) {
      /* free orbit around the real orbiting moon — camera follows it */
      const moonPos = this.moonWorldPos(this.tmpV);
      this.followTarget(moonPos, this.moonLocal, dt, 0.06);
    } else if (this.flight) {
      const f = this.flight;
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.camera.position.copy(f.from).lerp(f.to, e);
      this.lookAt.copy(f.lookFrom).lerp(f.lookTo, e);
      if (k >= 1) this.finishFlight();
    } else if (this.mode === "system" && this.focusPlanetId) {
      const p = this.planets.find((x) => x.id === this.focusPlanetId);
      if (p) {
        /* camera rides the orbiting planet — follows every frame */
        this.followTarget(p.world, this.local, dt, 0.06);
      } else {
        this.focusPlanetId = null;
      }
    } else {
      const local =
        this.mode === "galaxyInterior"
          ? this.interiorSystemStarId
            ? this.interiorSystemLocal
            : this.galaxyInteriorLocal
          : this.sph;
      const { theta, phi, radius } = local;
      this.camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
    }
    this.camera.lookAt(this.lookAt);
    /* smooth inertial zoom + pointer anchoring */
    this.updateZoomAnim(dt);

    /* fps + telemetry stats */
    this.fpsAcc++;
    this.fpsTime += dt;
    this.statsAcc += dt;
    if (this.fpsTime >= 0.5) {
      const fps = this.fpsAcc / this.fpsTime;
      if (this.onFps) this.onFps(Math.round(fps));
      this.adaptResolution(fps);
      this.fpsAcc = 0;
      this.fpsTime = 0;
    }
    if (this.statsAcc >= 0.5 && this.onStats) {
      this.statsAcc = 0;
      this.onStats({
        triangles: this.renderer.info.render.triangles,
        alt: this.sph.radius,
        nodes: this.orbitals.length + 56, // 5 facilities + 56 constellation satellites
      });
    }

    this.renderer.render(this.scene, this.camera);
  };
}
