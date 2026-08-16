import { useCallback, useEffect, useRef, useState } from "react";
import TacticalGlobe from "./components/TacticalGlobe";
import Header from "./components/Header";
import BottomNav, { type LogEntry } from "./components/BottomNav";
import Console from "./components/Console";
import SettingsPanel, { type AppSettings } from "./components/SettingsPanel";
import ModuleBar from "./components/ModuleBar";
import IntelPanel from "./components/IntelPanel";

import { setVolumes } from "./audio/tacticalAudio";
import { GlobeEngine, type BodyMode, type HoverInfo, type NodeSpec } from "./engine/globeEngine";
import { MISSIONS, missionById, factionById, type Mission } from "./data/missions";
import {
  exoPlanetById, neighborGalaxyById, planetById, starById,
  type GalaxyStar, type NeighborGalaxy, type Planet,
} from "./data/planets";
import { PROFILE } from "./data/profile";
import { ALIEN_MSGS, PLANET_ZH, t, type Lang } from "./data/i18n";
import { audio } from "./audio/tacticalAudio";



const LIGHT_ORDER = ["full", "dawn", "night"] as const;
const LAB_COUNT = 4;

const ACHIEVEMENTS: Record<string, { zh: string; en: string }> = {
  MOON_LAND: { zh: "登月计划完成", en: "MOON LANDING" },
  FIRST_LAUNCH: { zh: "首次火箭发射", en: "FIRST ROCKET LAUNCH" },
  FIRST_DOCK: { zh: "首次空间站对接", en: "FIRST STATION DOCK" },
  UFO_SPOT: { zh: "首次发现未知飞行物", en: "FIRST UFO CONTACT" },
  UFO_ALL: { zh: "找全所有 UFO", en: "SPOTTED ALL UFOS" },
  FIRST_INTERCEPT: { zh: "首次拦截成功", en: "FIRST INTERCEPTION" },
  WEATHER_ALL: { zh: "触发全部空间天气", en: "ALL SPACE WEATHER" },
  LIGHT_ALL: { zh: "体验全部光照模式", en: "ALL LIGHT MODES" },
  SHADER_ALL: { zh: "浏览全部渲染模式", en: "ALL RENDER MODES" },
  CONSOLE: { zh: "首次使用指令台", en: "CONSOLE OPERATOR" },
};

export default function App() {
  const engineRef = useRef<GlobeEngine | null>(null);
  const [fps, setFps] = useState(60);
  const [bodyMode, setBodyMode] = useState<BodyMode>("earth");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [galaxy, setGalaxy] = useState<NeighborGalaxy | null>(null);
  const [exoPlanet, setExoPlanet] = useState<Planet | null>(null);

  const [flash, setFlash] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [fxOn, setFxOn] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({ master: 90, sfx: 100, ambient: 70 });
  const [quality, setQuality] = useState<"low" | "med" | "high">("high");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [star, setStar] = useState<GalaxyStar | null>(null);
  const [lang, setLang] = useState<Lang>("zh");
  const [alienToast, setAlienToast] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [satId, setSatId] = useState<string | null>(null);
  const [ufoTrack, setUfoTrack] = useState<{ id: string; dist: number; speed: number; size: number } | null>(null);
  const [rocketActive, setRocketActive] = useState(false);
  const [docking, setDocking] = useState(false);
  const [lightMode, setLightMode] = useState<"full" | "dawn" | "night">("full");
  const [labMode, setLabMode] = useState(0);
  const [stats, setStats] = useState({ triangles: 0, alt: 0, nodes: 60 });
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [achToast, setAchToast] = useState<string | null>(null);
  const logId = useRef(0);
  const alienTimer = useRef<number | null>(null);
  const achTimer = useRef<number | null>(null);
  const rocketTimer = useRef<number | null>(null);
  const ufoSeen = useRef<Set<string>>(new Set());
  const lightSeen = useRef<Set<string>>(new Set());
  const shaderSeen = useRef<Set<string>>(new Set());
  const weatherSeen = useRef<Set<string>>(new Set());

  const mission: Mission | null = selectedId ? missionById(selectedId) : null;
  const planet =
    selectedPlanetId
      ? planetById(selectedPlanetId) ?? null
      : bodyMode === "moon"
        ? planetById("luna") ?? null
        : null;
  const heroVisible =
    !mission && !planet && !satId && !ufoTrack &&
    bodyMode !== "system" && bodyMode !== "galaxy";

  const nodeSpecs: NodeSpec[] = MISSIONS.filter((m) => m.status !== "LOCKED").map((m) => ({
    id: m.id,
    lat: m.lat,
    lon: m.lon,
    color: factionById(m.faction).color,
    name: m.name,
  }));

  /* ---------- helpers: log + achievements ---------- */

  const L = useCallback(
    (zh: string, en: string) => (lang === "zh" ? zh : en),
    [lang]
  );

  const pushLog = useCallback((text: string, kind: LogEntry["kind"] = "info") => {
    setLogs((prev) => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      return [{ id: ++logId.current, text, kind, time }, ...prev].slice(0, 60);
    });
  }, []);

  const unlock = useCallback(
    (id: string) => {
      if (achievements.has(id)) return;
      setAchievements((prev) => new Set(prev).add(id));
      const a = ACHIEVEMENTS[id];
      audio.announce("ach");
      pushLog(`${lang === "zh" ? "★ 成就解锁：" : "★ ACHIEVEMENT UNLOCKED: "}${lang === "zh" ? a.zh : a.en}`, "ach");
      setAchToast(`${lang === "zh" ? "★ 成就解锁" : "★ ACHIEVEMENT"} · ${lang === "zh" ? a.zh : a.en}`);
      if (achTimer.current) window.clearTimeout(achTimer.current);
      achTimer.current = window.setTimeout(() => setAchToast(null), 4200);
    },
    [achievements, lang, pushLog]
  );

  /* ---------- audio unlock + boot + persisted settings ---------- */

  useEffect(() => {
    const unlockAudio = () => audio.unlock();
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    /* restore saved settings */
    try {
      const raw = localStorage.getItem("mo-terminal-settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.master === "number" && typeof s.sfx === "number" && typeof s.ambient === "number") {
          setSettings({ master: s.master, sfx: s.sfx, ambient: s.ambient });
        }
        if (s.quality === "low" || s.quality === "med" || s.quality === "high") setQuality(s.quality);
        if (typeof s.fxOn === "boolean") setFxOn(s.fxOn);
        if (s.lang === "zh" || s.lang === "en") setLang(s.lang);
      }
    } catch {
      /* ignore corrupted storage */
    }
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, []);

  /* apply volumes live + persist */
  useEffect(() => {
    setVolumes({
      master: settings.master / 100,
      sfx: settings.sfx / 100,
      ambient: settings.ambient / 100,
    });
    try {
      localStorage.setItem(
        "mo-terminal-settings",
        JSON.stringify({ ...settings, quality, fxOn, lang })
      );
    } catch {
      /* storage unavailable */
    }
  }, [settings, quality, fxOn, lang]);

  /* apply render quality to the engine */
  useEffect(() => {
    engineRef.current?.setQuality(quality);
  }, [quality]);

  const handleReady = useCallback((engine: GlobeEngine) => {
    engineRef.current = engine;
    engine.setQuality(quality);
    audio.power();
    /* boot complete — no auto dossier; the intel feed stays clean */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* moon landing program — astronaut waved hello + camera auto-focus */
  const handleMoonLand = useCallback(() => {
    audio.announce("moon");
    pushLog(L("登月舱成功着陆 · 宇航员正在挥手致意", "LUNAR MODULE TOUCHDOWN · ASTRONAUT WAVING"), "ach");
    unlock("MOON_LAND");
    /* zoom the camera to the landing site so the astronaut is visible */
    if (bodyMode !== "moon") {
      engineRef.current?.switchBody("moon");
      setBodyMode("moon");
      setSelectedPlanetId(null);
      setSatId(null);
      setUfoTrack(null);
      engineRef.current?.setUfoTrack(null);
    }
  }, [L, pushLog, unlock, bodyMode]);

  /* ---------- mission / planet ---------- */

  const handleSelect = useCallback((m: Mission) => {
    audio.select();
    setSelectedId(m.id);
    setSelectedPlanetId(null);
    setSatId(null);
    setUfoTrack(null);
    engineRef.current?.setUfoTrack(null);
    if (engineRef.current) {
      if (engineRef.current.getMode() === "system") engineRef.current.switchBody("earth");
      engineRef.current.selectMission(m.id);
    }
    setBodyMode("earth");
  }, []);

  const handleNodeClick = useCallback((id: string) => {
    const m = missionById(id);
    if (!m) return;
    handleSelect(m);
  }, [handleSelect]);

  const handlePlanetClick = useCallback((id: string) => {
    const p = planetById(id);
    if (!p) return;
    audio.lock();
    setSelectedPlanetId(id);
    setGalaxy(null);
    setExoPlanet(null);
    setStar(null);
    engineRef.current?.focusPlanet(id);
    const zhName = PLANET_ZH[p.id]?.name ?? p.name;
    pushLog(
      L(`◈ 行星档案 · ${zhName}`, `◈ PLANET DOSSIER · ${p.name}`),
      "info"
    );
  }, [L, pushLog]);

  const handleBodyMode = useCallback((mode: BodyMode) => {
    const eng = engineRef.current;
    /* GALAXY — zoom out to the milky way */
    if (mode === "galaxy") {
      eng?.switchBody("galaxy");
      setBodyMode("galaxy");
      setSelectedPlanetId(null);
      setSatId(null);
      setUfoTrack(null);
      eng?.setUfoTrack(null);
      setStar(null);
      return;
    }
    if (bodyMode === "galaxy") {
      setStar(null);
    }
    /* LUNA = the real orbiting moon — fly to it (toggle to release) */
    if (mode === "moon") {
      if (bodyMode === "moon") {
        eng?.clearMoonFocus();
        setBodyMode("earth");
      } else {
        eng?.switchBody("moon");
        setBodyMode("moon");
        setSelectedPlanetId(null);
        setSatId(null);
        setUfoTrack(null);
        eng?.setUfoTrack(null);
      }
      return;
    }
    if (bodyMode === "moon") eng?.clearMoonFocus();
    setBodyMode(mode);
    eng?.switchBody(mode);
    setSatId(null);
    eng?.clearSatFocus();
    if (mode === "system") {
      setSelectedPlanetId(null);
      return;
    }
    if (mode === "earth" && eng && selectedId) {
      eng.selectMission(selectedId);
    }
  }, [bodyMode, selectedId]);

  /* ---------- galaxy stars ---------- */

  const handleStarClick = useCallback((id: string) => {
    if (id === "sol") {
      handleBodyMode("system");
      return;
    }
    const st = starById(id);
    if (!st) return;
    audio.lock();
    setStar(st);
    setGalaxy(null);
    setExoPlanet(null);
    setSelectedPlanetId(null);
    engineRef.current?.focusStar(id);
    pushLog(
      L(`✦ 恒星档案 · ${st.zh}（${st.distance}）`, `✦ STAR DOSSIER · ${st.name} (${st.distance})`),
      "info"
    );
  }, [handleBodyMode, L, pushLog]);

  /* ---------- neighbour galaxies ---------- */

  const handleGalaxyClick = useCallback((id: string) => {
    const g = neighborGalaxyById(id);
    if (!g) return;
    audio.lock();
    setGalaxy(g);
    setStar(null);
    setExoPlanet(null);
    setSelectedPlanetId(null);
    engineRef.current?.focusGalaxy(id);
    pushLog(
      L(`🌌 跃迁至 ${g.zh}（${g.distance}）`, `🌌 WARPING TO ${g.name} (${g.distance})`),
      "ok"
    );
  }, [L, pushLog]);

  /* ---------- exoplanets inside neighbour galaxies ---------- */

  const handleExoPlanetClick = useCallback((id: string) => {
    const ex = exoPlanetById(id);
    if (!ex) return;
    audio.lock();
    /* build a Planet-like object for the intel panel */
    const pseudo: Planet = {
      id: ex.id,
      name: ex.name,
      code: `EXO-${ex.id.slice(-2).toUpperCase()}`,
      type: lang === "zh" ? ex.type[0] : ex.type[1],
      color: ex.color,
      diameter: `${(ex.radius * 2600).toFixed(0)} KM`,
      distance: "邻近星系/恒星系统",
      orbit: ex.orbit.toFixed(1) + " U",
      rotation: "—",
      moons: "未知",
      temp: "—",
      briefing: [ex.briefing[0], ex.briefing[1]],
      data: ex.data,
    };
    setExoPlanet(pseudo);
    setGalaxy(null);
    setStar(null);
    setSelectedPlanetId(null);
    engineRef.current?.focusExoPlanet(id);
    pushLog(L(`◈ 系外行星 · ${ex.zh}`, `◈ EXOPLANET · ${ex.name}`), "info");
  }, [lang, L, pushLog]);

  /* release any focused celestial body */
  const handleWide = useCallback(() => {
    setGalaxy(null);
    setExoPlanet(null);
    setStar(null);
    setSelectedPlanetId(null);
    engineRef.current?.clearGalaxyFocus();
    engineRef.current?.clearPlanetFocus();
  }, []);

  const handleExit = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 650);
    engineRef.current?.clearMoonFocus();
    engineRef.current?.resetView(1.8);
    setSelectedId(null);
    setSelectedPlanetId(null);
    setSatId(null);
    setUfoTrack(null);
    engineRef.current?.clearSatFocus();
    engineRef.current?.selectMission(null);
    setBodyMode("earth");
  }, []);

  /* ---------- interactive orbital facilities ---------- */

  const handleSatelliteClick = useCallback((id: string) => {
    /* station while rocket in flight → initiate docking */
    if (id === "stn-01" && rocketActive && !docking) {
      handleDock();
      return;
    }
    audio.select();
    setSatId(id);
    setSelectedId(null);
    setSelectedPlanetId(null);
    engineRef.current?.focusSatellite(id);
    const label = id === "tg-01"
      ? L("天宫空间站", "TIANGONG STATION")
      : id === "stn-01"
        ? L("轨道空间站", "ORBITAL STATION")
        : id === "opt-01" ? L("光学观测站", "OPTICAL OBSERVATORY")
          : id === "com-01" ? L("通信中继星", "COMMS RELAY")
            : L("空间预警站", "EARLY WARNING");
    if (id === "tg-01") {
      audio.announce("dock");
      pushLog(L("🇨🇳 锁定天宫空间站 · 五星红旗在轨飘扬", "🇨🇳 TIANGONG LOCKED · RED FLAG IN ORBIT"), "ach");
    } else {
      pushLog(`${L("节点视角已锁定", "NODE VIEW LOCKED")} · ${label}`, "info");
    }
  }, [rocketActive, docking, L, pushLog]);

  const handleMoonClick = useCallback(() => {
    audio.modeSwitch();
    /* show the REAL Luna dossier in the intel panel */
    const luna = planetById("luna");
    if (luna) {
      setSelectedPlanetId("luna");
      setGalaxy(null);
      setExoPlanet(null);
      setStar(null);
    }
    pushLog(L("锁定月球 · 相机飞向绕地轨道上的真实月球", "LUNA LOCKED · CAMERA FLYING TO THE ORBITING MOON"), "info");
    handleBodyMode("moon");
  }, [handleBodyMode, L, pushLog]);

  /* ---------- rocket: launch · dock · ufo missions ---------- */

  const handleLaunch = useCallback(() => {
    const eng = engineRef.current;
    if (!eng || rocketActive) return;
    eng.launchRocket();
    setRocketActive(true);
    if (rocketTimer.current) window.clearTimeout(rocketTimer.current);
    rocketTimer.current = window.setTimeout(() => setRocketActive(false), 9000);
    audio.announce("launch");
    pushLog(L("火箭发射程序启动 · 推进器正常", "LAUNCH SEQUENCE INITIATED · THRUSTERS NOMINAL"), "ok");
    unlock("FIRST_LAUNCH");
  }, [L, pushLog, rocketActive, unlock]);

  const handleDock = useCallback(() => {
    const eng = engineRef.current;
    if (!eng || !rocketActive || docking) return;
    if (eng.rocketTarget("dock")) {
      setDocking(true);
      pushLog(L("对接指令已发送 · 火箭变轨靠港中…", "DOCK COMMAND SENT · ROCKET RE-TARGETING…"), "warn");
    }
  }, [rocketActive, docking, L, pushLog]);

  const handleRocketEvent = useCallback((k: "dock" | "observe" | "intercept") => {
    setRocketActive(false);
    if (rocketTimer.current) window.clearTimeout(rocketTimer.current);
    if (k === "dock") {
      setDocking(false);
      audio.announce("dock");
      pushLog(L("对接成功 · 气闸锁闭 · 欢迎登站", "DOCKING COMPLETE · AIRLOCK SEALED · WELCOME ABOARD"), "ok");
      unlock("FIRST_DOCK");
    } else if (k === "observe") {
      pushLog(L("抵近观测完成 · 目标数据已回收", "OBSERVATION COMPLETE · TARGET DATA RETRIEVED"), "info");
    } else {
      audio.announce("intercept");
      pushLog(L("命中目标 · 未知飞行物已被拦截", "DIRECT HIT · UNKNOWN CRAFT INTERCEPTED"), "warn");
      unlock("FIRST_INTERCEPT");
      if (ufoTrack) {
        setUfoTrack((prev) => (prev ? { ...prev, dist: 0, speed: 0 } : prev));
      }
    }
  }, [L, pushLog, ufoTrack, unlock]);

  /* ---------- UFO tracking gameplay ---------- */

  const handleAlien = useCallback((id: string) => {
    audio.alien();
    const msgs = ALIEN_MSGS[lang];
    setAlienToast(msgs[Math.floor(Math.random() * msgs.length)]);
    if (alienTimer.current) window.clearTimeout(alienTimer.current);
    alienTimer.current = window.setTimeout(() => setAlienToast(null), 5200);
    engineRef.current?.setUfoTrack(id);
    setUfoTrack({ id, dist: 0, speed: 0, size: 1 });
    setSatId(null);
    setSelectedId(null);
    pushLog(L(`检测到未知飞行物进入轨道 · 目标 ${id.toUpperCase()}`, `UNKNOWN CRAFT ON ORBIT · TARGET ${id.toUpperCase()}`), "alien");
    ufoSeen.current.add(id);
    if (ufoSeen.current.size >= 3) unlock("UFO_ALL");
    else unlock("UFO_SPOT");
  }, [lang, L, pushLog, unlock]);

  const handleUfoTelemetry = useCallback((d: { id: string; dist: number; speed: number; size: number }) => {
    if (!d.id) return;
    setUfoTrack((prev) => (prev && prev.id === d.id ? { ...d } : prev));
  }, []);



  /* ---------- lighting · render lab · weather ---------- */

  const applyLight = useCallback((mode: "full" | "dawn" | "night") => {
    setLightMode(mode);
    engineRef.current?.setLightMode(mode);
    const label = mode === "full" ? L("全日", "FULL DAY") : mode === "dawn" ? L("晨昏", "DAWN") : L("深夜", "NIGHT");
    pushLog(L(`光照模式切换 → ${label}`, `LIGHTING MODE → ${label}`), "info");
    lightSeen.current.add(mode);
    if (lightSeen.current.size >= 3) unlock("LIGHT_ALL");
  }, [L, pushLog, unlock]);

  const cycleLight = useCallback(() => {
    const next = LIGHT_ORDER[(LIGHT_ORDER.indexOf(lightMode) + 1) % 3];
    audio.click();
    applyLight(next);
  }, [lightMode, applyLight]);

  const applyLab = useCallback((mode: number) => {
    setLabMode(mode);
    engineRef.current?.setLabMode(mode);
    const key = mode === 0 ? "labReal" : mode === 1 ? "labWire" : mode === 2 ? "labNeon" : "labGlitch";
    pushLog(L(`渲染实验室 → ${t(lang, key)}`, `RENDER LAB → ${t(lang, key)}`), "info");
    shaderSeen.current.add(String(mode));
    if (shaderSeen.current.size >= LAB_COUNT) unlock("SHADER_ALL");
  }, [L, lang, pushLog, unlock]);

  const cycleLab = useCallback(() => {
    audio.modeSwitch();
    applyLab((labMode + 1) % LAB_COUNT);
  }, [labMode, applyLab]);

  const handleWeather = useCallback((type: "aurora" | "wind" | "shower") => {
    const ok = engineRef.current?.triggerWeather(type);
    const label = type === "aurora" ? L("极光", "AURORA") : type === "wind" ? L("太阳风粒子流", "SOLAR WIND") : L("流星雨", "METEOR SHOWER");
    if (!ok) {
      pushLog(L(`空间天气事件 ${label} 仅在地球视图可用`, `${label} EVENT REQUIRES TERRAN VIEW`), "warn");
      return;
    }
    audio.announce("weather");
    pushLog(L(`空间天气事件激活 → ${label}`, `SPACE WEATHER EVENT → ${label}`), "warn");
    weatherSeen.current.add(type);
    if (weatherSeen.current.size >= 3) unlock("WEATHER_ALL");
  }, [L, pushLog, unlock]);

  /* module bar dispatcher — every former hotkey is now a clickable module */
  /* three-level view path: earth → system → galaxy (and back down) */
  const handleModule = useCallback((id: string) => {
    switch (id) {
      case "earth":
        if (bodyMode !== "earth") {
          handleBodyMode("earth");
          pushLog(L("◈ 返回地球视图 · 战术节点就绪", "◈ BACK TO TERRAN VIEW · NODES READY"), "info");
        }
        break;
      case "system":
        if (bodyMode !== "system") {
          handleBodyMode("system");
          pushLog(L("◈ 升入太阳系视图 · 行星阵列可见", "◈ ASCENDING TO SYSTEM VIEW · PLANETS VISIBLE"), "info");
        }
        break;
      case "galaxy":
        if (bodyMode !== "galaxy") {
          handleBodyMode("galaxy");
          pushLog(L("◈ 跃迁至银河系视图 · 星海展开", "◈ WARPING TO GALACTIC VIEW · STARFIELDS UNFOLD"), "info");
        }
        break;
    }
  }, [bodyMode, handleBodyMode, pushLog, L]);

  /* ---------- command console ---------- */

  const handleCommand = useCallback((cmd: string): string | null => {
    setConsoleOpen(false);
    unlock("CONSOLE");
    const [head, ...rest] = cmd.toLowerCase().split(/\s+/);
    const arg = rest[0] ?? "";
    switch (head) {
      case "/launch":
        handleLaunch();
        return L("> 发射指令已执行 · 火箭升空", "> LAUNCH EXECUTED · ROCKET AWAY");
      case "/dock":
        if (rocketActive) {
          handleDock();
          return L("> 对接指令已发送", "> DOCK COMMAND SENT");
        }
        return L("> 错误：当前无在轨火箭，请先 /launch", "> ERROR: NO ROCKET IN FLIGHT — TRY /launch");
      case "/time":
        if (arg === "full" || arg === "dawn" || arg === "night") {
          applyLight(arg);
          return `> TIME = ${arg.toUpperCase()}`;
        }
        return L("> 用法：/time full | dawn | night", "> USAGE: /time full | dawn | night");
      case "/shader":
        if (["0", "1", "2", "3"].includes(arg)) {
          applyLab(Number(arg));
          return `> SHADER MODE = ${arg}`;
        }
        return L("> 用法：/shader 0-3（0写实 1线框 2霓虹 3故障）", "> USAGE: /shader 0-3");
      case "/weather":
        if (arg === "aurora" || arg === "wind" || arg === "shower") {
          handleWeather(arg);
          return `> WEATHER EVENT: ${arg.toUpperCase()}`;
        }
        return L("> 用法：/weather aurora | wind | shower", "> USAGE: /weather aurora | wind | shower");
      case "/track":
        if (ufoTrack) return L(`> 正在追踪目标 ${ufoTrack.id.toUpperCase()}`, `> TRACKING ${ufoTrack.id.toUpperCase()}`);
        return L("> 当前无追踪目标 — 点击 UFO 开始追踪", "> NO TARGET — CLICK A UFO TO TRACK");
      case "/sat": {
        const map: Record<string, string> = { opt: "opt-01", com: "com-01", wrn: "wrn-01", stn: "stn-01" };
        if (map[arg]) {
          handleSatelliteClick(map[arg]);
          return `> VIEW LOCKED: ${map[arg].toUpperCase()}`;
        }
        return L("> 用法：/sat opt | com | wrn | stn", "> USAGE: /sat opt | com | wrn | stn");
      }
      case "/reset":
        handleExit();
        return L("> 视角已复位", "> VIEW RESET");
      case "/galaxy":
        handleBodyMode("galaxy");
        return L("> 已跃迁至银河系视景", "> WARPING TO GALACTIC VIEW");
      case "/moon":
        if (engineRef.current?.launchMoonMission()) {
          pushLog(L("登月计划启动 · 月球登陆器从发射场升空", "MOON PROGRAM STARTED · LANDER LIFTING OFF"), "ok");
          return L("> 登月计划已启动 · 目标：月球静海基地", "> MOON PROGRAM STARTED · TARGET: SEA OF TRANQUILITY");
        }
        return L("> 错误：请切换至地球视图后再执行登月计划", "> ERROR: MOON PROGRAM REQUIRES TERRAN VIEW");
      case "/vol": {
        const v = parseInt(arg, 10);
        if (!Number.isNaN(v) && v >= 0 && v <= 100) {
          setSettings((s) => ({ ...s, master: v }));
          return `> MASTER VOL = ${v}%`;
        }
        return L("> 用法：/vol 0-100", "> USAGE: /vol 0-100");
      }
      case "/warp": {
        const ids = ["mars", "jupiter", "saturn", "neptune", "mercury"];
        const id = ids[Math.floor(Math.random() * ids.length)];
        if (engineRef.current?.getMode() !== "system") {
          engineRef.current?.switchBody("system");
          setBodyMode("system");
          setTimeout(() => engineRef.current?.focusPlanet(id), 900);
        } else engineRef.current?.focusPlanet(id);
        setSelectedPlanetId(id);
        return `> WARP ENGAGED → ${id.toUpperCase()}`;
      }
      case "/42":
        return L("> 宇宙、生命以及一切问题的答案。", "> THE ANSWER TO LIFE, THE UNIVERSE, AND EVERYTHING.");
      case "/konami":
        pushLog(L("↑↑↓↓←→←→BA — 秘技发动！+30 条命", "↑↑↓↓←→←→BA — CODE ACTIVATED! +30 LIVES"), "ach");
        return L("> 秘技已激活", "> CHEAT ACTIVATED");
      case "/mew":
        pushLog(L("『喵。』—— 一只猫从通风管道里走了出来。", "'Meow.' — A CAT WALKS OUT OF THE AIR VENT."), "ach");
        return L("> (｡•̀ᴗ-)✧", "> (｡•̀ᴗ-)✧");
      case "/zero":
        pushLog(L("ZERO-7 已上线。欢迎回来，指挥官。", "ZERO-7 ONLINE. WELCOME BACK, COMMANDER."), "ok");
        return L("> ZERO-7 STANDBY", "> ZERO-7 STANDBY");
      default:
        return L(`> 未知指令「${cmd}」· /help 查看全部`, `> UNKNOWN COMMAND "${cmd}" · /help FOR LIST`);
    }
  }, [L, handleLaunch, rocketActive, handleDock, applyLight, applyLab, handleWeather, ufoTrack, handleSatelliteClick, handleExit, pushLog, unlock]);

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (consoleOpen) {
        if (e.key === "Escape") setConsoleOpen(false);
        return;
      }
      if (e.key === "~" || e.key === "`") {
        e.preventDefault();
        setConsoleOpen(true);
        return;
      }
      if (e.key === "1") handleBodyMode("earth");
      else if (e.key === "2") handleBodyMode("moon");
      else if (e.key === "3") handleBodyMode("system");
      else if (e.key === "4") handleBodyMode("galaxy");
      else if (e.key === "+" || e.key === "=") engineRef.current?.zoomBy(1);
      else if (e.key === "-" || e.key === "_") engineRef.current?.zoomBy(-1);
      else if (e.key === "l" || e.key === "L") handleLaunch();
      else if (e.key === "d" || e.key === "D") cycleLight();
      else if (e.key === "g" || e.key === "G") cycleLab();
      else if (e.key === "a" || e.key === "A") handleWeather("aurora");
      else if (e.key === "w" || e.key === "W") handleWeather("wind");
      else if (e.key === "m" || e.key === "M") handleWeather("shower");
      else if (e.key === "Escape") handleExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [consoleOpen, handleBodyMode, handleLaunch, cycleLight, cycleLab, handleWeather, handleExit]);

  useEffect(() => {
    if (hover && tooltipRef.current) {
      tooltipRef.current.style.left = `${hover.x + 14}px`;
      tooltipRef.current.style.top = `${hover.y - 30}px`;
    }
  }, [hover]);

  const tooltipRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`relative flex h-full flex-col overflow-hidden pb-[80px] tactical-grid-bg ${fxOn ? "" : "fx-off"}`}>
      {/* 3D globe layer */}
      <div className="pointer-events-auto absolute inset-0 z-0">
        <TacticalGlobe
          missions={nodeSpecs}
          onReady={handleReady}
          onFps={setFps}
          onHover={setHover}
          onNodeClick={handleNodeClick}
          onPlanetClick={handlePlanetClick}
          onAlien={handleAlien}
          onSatelliteClick={handleSatelliteClick}
          onMoonClick={handleMoonClick}
          onUfoTelemetry={handleUfoTelemetry}
          onRocketEvent={handleRocketEvent}
          onStats={setStats}
          onMoonLand={handleMoonLand}
          onMoonMissionChange={(active) => {
            if (!active) {
              pushLog(
                lang === "zh" ? "登月舱已返回地球发射场 · 任务圆满" : "LANDER RETURNED TO EARTH · MISSION COMPLETE",
                "ok"
              );
            }
          }}
          onStarClick={handleStarClick}
          onGalaxyClick={handleGalaxyClick}
          onExoPlanetClick={handleExoPlanetClick}
        />
      </div>

      {/* view level modules — very top row */}
      <ModuleBar
        lang={lang}
        bodyMode={bodyMode}
        onModule={handleModule}
      />

      {/* top bar */}
      <Header
        fps={fps}
        missionCode={star ? star.name : planet ? planet.code : mission?.code ?? null}
        lang={lang}
        stats={stats}
        lightMode={lightMode}
        labMode={labMode}
        rocketActive={rocketActive}
        ufoTracked={!!ufoTrack}
      />

      {/* intel panel — fixed-position, independent of the header flow */}
      <IntelPanel
        lang={lang}
        star={star}
        galaxy={galaxy}
        planet={exoPlanet ?? planet}
        onWide={handleWide}
      />

      {/* HUD frame decoration */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="corner corner-tl left-4 top-[72px]" />
        <div className="corner corner-tr right-4 top-[72px]" />
        <div className="corner corner-bl bottom-[70px] left-4" />
        <div className="corner corner-br bottom-[70px] right-4" />
      </div>

      {/* hover tooltip */}
      {hover && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-30 border px-2 py-1 backdrop-blur-[2px] max-lg:hidden"
          style={{
            borderColor: hover.color,
            background: "rgba(4,10,20,0.85)",
            boxShadow: `0 0 12px ${hover.color}44`,
            left: hover.x + 14,
            top: hover.y - 30,
          }}
        >
          <span className="text-[9px] tracking-[0.22em]" style={{ color: hover.color }}>
            ◈ {hover.name}
          </span>
        </div>
      )}

      {/* personal hero overlay */}
      {heroVisible && (
        <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center px-4">
          <div className="flex max-h-full flex-col items-center justify-center text-center">
            <div className="mb-3 text-[10px] tracking-[0.6em] text-amber-300/80 glow-amber sm:text-[11px]">
              ◈ {t(lang, "welcome")} ◈
            </div>
            <h1 className="font-disp text-4xl font-bold tracking-[0.2em] text-cyan-100 glow-cyan sm:text-6xl lg:text-7xl">
              {PROFILE.codename}
            </h1>
            <div className="mt-2 text-[11px] tracking-[0.5em] text-cyan-300/80 sm:text-[13px]">
              {lang === "zh" ? PROFILE.roleCn : PROFILE.role}
            </div>
            <div className="mt-2 text-[10px] tracking-[0.35em] text-cyan-200/50 sm:text-[11px]">
              {PROFILE.name} · {lang === "zh" ? "上海 · 中国" : PROFILE.location}
            </div>
            <div className="pointer-events-auto mt-6 flex gap-3">
              <button
                onClick={() => handleBodyMode("system")}
                onMouseEnter={() => audio.hover()}
                className="hud-frame"
              >
                <span className="hud-inner flex items-center gap-2 px-6 py-2.5 hover:bg-cyan-400/10">
                  <span className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold tracking-[0.3em] text-cyan-300 glow-cyan">
                    ☉ {t(lang, "exploreSystem")}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* bottom nav — live ticker + op log + settings/fx/lang merged at the very bottom */}
      <BottomNav
        lang={lang}
        fxOn={fxOn}
        onExit={handleExit}
        onFx={() => {
          setFxOn((v) => !v);
          audio.click();
        }}
        onLang={() => {
          setLang((l) => (l === "zh" ? "en" : "zh"));
          audio.modeSwitch();
        }}
        onSettings={() => setSettingsOpen(true)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />

      {/* settings module */}
      <SettingsPanel
        lang={lang}
        open={settingsOpen}
        settings={settings}
        quality={quality}
        fxOn={fxOn}
        onChange={(p) => setSettings((s) => ({ ...s, ...p }))}
        onQuality={setQuality}
        onFx={setFxOn}
        onLang={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
        onClose={() => setSettingsOpen(false)}
      />

      {/* alien signal toast */}
      {alienToast && (
        <div className="pointer-events-none fixed left-1/2 top-[96px] z-30 -translate-x-1/2">
          <div className="border border-emerald-400/70 bg-[#04140c]/95 px-4 py-2 shadow-[0_0_24px_rgba(60,220,130,0.35)]">
            <span className="text-[10px] tracking-[0.22em] text-emerald-300" style={{ textShadow: "0 0 10px rgba(60,220,130,0.8)" }}>
              👽 {lang === "zh" ? "未知文明信号：" : "UNKNOWN CIVILIZATION SIGNAL: "}
              {alienToast}
            </span>
          </div>
        </div>
      )}

      {/* achievement toast */}
      {achToast && (
        <div className="pointer-events-none fixed left-1/2 top-[128px] z-30 -translate-x-1/2">
          <div className="hud-frame hud-frame-amber px-4 py-1.5">
            <div className="hud-inner hud-inner-live px-3 py-1">
              <span className="text-[10px] font-bold tracking-[0.25em] text-amber-300 glow-amber">
                {achToast}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* command console */}
      <Console lang={lang} open={consoleOpen} onClose={() => setConsoleOpen(false)} onCommand={handleCommand} />

      {/* CRT overlays (toggleable) */}
      {fxOn && (
        <>
          <div className="vignette" />
          <div className="crt-flicker" />
          <div className="scanlines" />
        </>
      )}

      {/* execute flash */}
      {flash && <div className="screen-flash" />}
    </div>
  );
}
