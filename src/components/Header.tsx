import { useEffect, useState } from "react";
import { PROFILE } from "../data/profile";
import { t, type Lang } from "../data/i18n";

interface Props {
  fps: number;
  missionCode: string | null;
  lang: Lang;
  stats: { triangles: number; alt: number; nodes: number };
  lightMode: "full" | "dawn" | "night";
  labMode: number;
  rocketActive: boolean;
  ufoTracked: boolean;
}

function pad(n: number, l = 2) {
  return String(n).padStart(l, "0");
}

export default function Header({ fps, missionCode, lang, stats, lightMode, labMode, rocketActive, ufoTracked }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [session, setSession] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 33);
    const start = Date.now();
    const sid = setInterval(() => setSession(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => {
      clearInterval(id);
      clearInterval(sid);
    };
  }, []);

  const clock = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} / ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}:${pad(now.getMilliseconds(), 3)}`;

  const fpsPct = Math.min(100, Math.round((fps / 60) * 100));

  return (
    <header className="relative z-20 h-16 shrink-0 border-b border-cyan-400/25 bg-[#04070f]/85 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

      <div className="flex h-full items-stretch justify-between px-4">
        {/* left: emblem + personal branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-10 w-10">
              <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="#00F0FF" strokeWidth="1.4" opacity="0.9" />
              <polygon points="20,8 31,14 31,26 20,32 9,26 9,14" fill="rgba(0,240,255,0.08)" stroke="#00F0FF" strokeWidth="0.8" />
              <circle cx="20" cy="20" r="3.4" fill="#00F0FF" opacity="0.9" />
              <path d="M20 6 V12 M20 28 V34 M6 20 H12 M28 20 H34" stroke="#FFB000" strokeWidth="1" />
            </svg>
            <span className="absolute inset-0 -z-10 rounded-full bg-cyan-400/10 blur-md" />
          </div>
          <div className="leading-tight">
            <div className="font-disp text-lg font-bold tracking-[0.22em] text-cyan-300 glow-cyan">
              {PROFILE.codename} <span className="text-cyan-200/60">//</span> {t(lang, "personalTerminal")}
            </div>
            <div className="text-[10px] tracking-[0.3em] text-cyan-200/50">
              {PROFILE.name} · {lang === "zh" ? PROFILE.roleCn : PROFILE.role}
            </div>
          </div>

          {/* system status — beside the personal terminal title */}
          <div className="hidden items-center gap-3 border-l border-cyan-400/20 pl-4 xl:flex">
            <div className="flex flex-col gap-[3px]">
              {[
                [t(lang, "commLink"), 84 + Math.round(Math.sin(Date.now() / 3000) * 8 + Math.random() * 3), "#00F0FF"],
                [t(lang, "power"), 82, "#FFB000"],
                [t(lang, "scan"), (Date.now() / 1400) % 100, "#B44CFF"],
              ].map(([label, val, color]) => (
                <div key={label as string} className="flex items-center gap-1.5">
                  <span className="w-[46px] text-[8px] tracking-[0.12em] text-cyan-200/45">{label}</span>
                  <div className="h-[4px] w-[52px] bg-cyan-950">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${(val as number) % 100}%`, background: color as string, boxShadow: `0 0 5px ${color}55` }}
                    />
                  </div>
                  <span className="w-[22px] text-right text-[8px] text-cyan-200/55 tabular-nums">
                    {Math.round(val as number) % 100}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-end gap-[3px] border-l border-cyan-400/15 pl-3">
              <span className="text-[8px] tracking-[0.14em] text-cyan-200/55">
                {stats.nodes} SATS · {(stats.triangles / 1000).toFixed(1)}K TRIS
              </span>
              <span className="text-[8px] tracking-[0.14em] text-cyan-200/55">
                {lightMode === "full" ? t(lang, "lightFull") : lightMode === "dawn" ? t(lang, "lightDawn") : t(lang, "lightNight")}
                {" · "}
                {labMode === 0 ? t(lang, "labReal") : labMode === 1 ? t(lang, "labWire") : labMode === 2 ? t(lang, "labNeon") : t(lang, "labGlitch")}
              </span>
              <span className="flex gap-2 text-[8px] tracking-[0.14em]">
                <span className={rocketActive ? "text-amber-300 blink" : "text-cyan-200/40"}>🚀{rocketActive ? "FLIGHT" : "RDY"}</span>
                <span className={ufoTracked ? "text-emerald-300 blink" : "text-cyan-200/40"}>👽{ufoTracked ? "TRK" : "---"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* center: clock */}
        <div className="hidden flex-col items-center justify-center md:flex">
          <div className="font-disp text-2xl font-bold tracking-[0.18em] text-cyan-100 tabular-nums glow-cyan">
            {clock}
          </div>
          <div className="mt-0.5 text-[10px] tracking-[0.35em] text-cyan-200/45">
            {missionCode
              ? `${t(lang, "liveOps")} // ${missionCode}`
              : `${lang === "zh" ? "上海 · 中国" : PROFILE.location} · T-SESSION`}{" "}
            {pad(Math.floor(session / 3600))}:{pad(Math.floor((session % 3600) / 60))}:
            {pad(session % 60)}
          </div>
        </div>

        {/* right: fps + commander */}
        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end lg:flex">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-cyan-200/50">{t(lang, "render")}</span>
              <span className={`font-disp text-lg font-bold tabular-nums ${fps >= 45 ? "glow-cyan" : "glow-amber"}`}>
                {pad(fps)}
              </span>
              <span className="text-[10px] text-cyan-200/50">FPS</span>
            </div>
            <div className="mt-1 h-1 w-24 bg-cyan-950">
              <div
                className={`h-full transition-all duration-500 ${fps >= 45 ? "bg-cyan-400" : "bg-amber-400"}`}
                style={{ width: `${fpsPct}%`, boxShadow: "0 0 8px rgba(0,240,255,0.7)" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-l border-cyan-400/20 pl-4">
            <div className="flex h-9 w-9 rotate-45 items-center justify-center border border-amber-400/60 bg-amber-400/10">
              <span className="-rotate-45 font-disp text-sm font-bold text-amber-300">Z7</span>
            </div>
            <div className="leading-tight">
              <div className="text-[11px] tracking-[0.2em] text-cyan-100">
                {PROFILE.nameEn} · {lang === "zh" ? "指挥官" : "CDR"}
              </div>
              <div className="text-[9px] tracking-[0.22em] text-amber-300/80">
                {lang === "zh" ? t(lang, "ownerAccess") : PROFILE.clearance}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
