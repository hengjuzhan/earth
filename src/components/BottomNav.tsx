import { useState } from "react";
import { audio } from "../audio/tacticalAudio";
import { cn } from "../utils/cn";
import { TICKER, t, type Lang } from "../data/i18n";

export interface LogEntry {
  id: number;
  text: string;
  kind: "info" | "ok" | "warn" | "ach" | "alien";
  time: string;
}

interface Props {
  lang: Lang;
  fxOn: boolean;
  logs: LogEntry[];
  onClearLogs: () => void;
  onExit: () => void;
  onFx: () => void;
  onLang: () => void;
  onSettings: () => void;
}



export default function BottomNav({
  lang,
  fxOn,
  logs,
  onClearLogs,
  onExit,
  onFx,
  onLang,
  onSettings,
}: Props) {
  const [logOpen, setLogOpen] = useState(false);
  const latest = logs[0];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-cyan-400/25 bg-[#04070f]/95 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      {/* LIVE ticker row — merged into this bottom module */}
      <div className="flex h-6 items-center overflow-hidden border-b border-cyan-400/15">
        <div className="relative z-10 flex h-full items-center border-r border-amber-400/50 bg-amber-400/10 px-3">
          <span className="text-[9px] font-bold tracking-[0.3em] text-amber-300 glow-amber blink">◉ LIVE</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <span className="ticker-track text-[9px] tracking-[0.28em] text-cyan-200/55">
            {TICKER[lang]}
            {TICKER[lang]}
          </span>
        </div>
      </div>

      {/* buttons + operation log row */}
      <div className="flex h-14 items-center justify-between px-4">
        {/* center: integrated operation log (collapsed → latest line) */}
        <div className="pointer-events-auto flex min-w-0 flex-1 justify-center px-3">
          {logOpen ? (
            <div className="relative w-full max-w-[560px]">
              <div className="hud-frame absolute bottom-1 left-0 right-0">
                <div className="hud-inner flex h-[150px] flex-col">
                  <div className="flex items-center justify-between border-b border-cyan-400/15 px-2.5 py-1">
                    <span className="text-[9px] tracking-[0.3em] text-cyan-300/80">▸ {t(lang, "logTitle")}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[8px] text-cyan-200/40">{logs.length}</span>
                      <button onClick={onClearLogs} className="hud-btn px-1.5 py-0.5 text-[9px] font-bold text-red-400/80">✕</button>
                      <button onClick={() => setLogOpen(false)} className="hud-btn px-1.5 py-0.5 text-[9px] font-bold text-cyan-200/70">▼</button>
                    </span>
                  </div>
                  <div className="hud-scroll min-h-0 flex-1 overflow-y-auto px-2.5 py-1.5">
                    {logs.map((l) => (
                      <div key={l.id} className="mb-1 flex items-start gap-1.5 leading-snug">
                        <span className="text-[8px] text-cyan-200/35 tabular-nums">{l.time}</span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-[9px] tracking-[0.06em]",
                            l.kind === "ok" && "text-emerald-300/90",
                            l.kind === "warn" && "text-amber-300/90",
                            l.kind === "ach" && "text-amber-300",
                            l.kind === "alien" && "text-emerald-300",
                            l.kind === "info" && "text-cyan-200/75"
                          )}
                        >
                          {l.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setLogOpen(true)} className="hud-btn flex max-w-[460px] items-center gap-2 px-3 py-1.5">
              <span className="text-[8px] tracking-[0.25em] text-cyan-300/70">▸ LOG</span>
              {latest ? (
                <span className="min-w-0 truncate text-[9px] tracking-[0.08em] text-cyan-200/80">
                  {latest.time} · {latest.text}
                </span>
              ) : (
                <span className="text-[9px] tracking-[0.2em] text-cyan-200/35">
                  {lang === "zh" ? "等待指令…" : "AWAITING ORDERS…"}
                </span>
              )}
              <span className="text-[8px] text-cyan-200/40">▲</span>
            </button>
          )}
        </div>

        {/* right: settings + fx + lang + terminate */}
        <div className="flex items-center gap-1.5">
          {/* settings */}
          <button
            onClick={() => {
              onSettings();
              audio.click();
            }}
            onMouseEnter={() => audio.hover()}
            className="hud-btn flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-[0.2em] text-cyan-200/70"
          >
            <span className="text-[13px] leading-none">⚙</span>
            {t(lang, "settings")}
          </button>

          {/* fx toggle */}
          <button
            onClick={onFx}
            onMouseEnter={() => audio.hover()}
            className={cn(
              "hud-btn flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-[0.2em]",
              fxOn ? "hud-btn-active text-cyan-100" : "text-cyan-200/45"
            )}
            title={t(lang, fxOn ? "fxOn" : "fxOff")}
          >
            <span className="text-[12px] leading-none">{fxOn ? "✦" : "✧"}</span>
            {t(lang, fxOn ? "fxOn" : "fxOff")}
          </button>

          {/* language toggle */}
          <button
            onClick={onLang}
            onMouseEnter={() => audio.hover()}
            className="hud-btn flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-[0.2em] text-amber-200/85"
          >
            <span className="text-[12px] leading-none">文</span>
            {lang === "zh" ? "中 ▸ EN" : "EN ▸ 中"}
          </button>

          <button
            onClick={() => {
              audio.deny();
              onExit();
            }}
            onMouseEnter={() => audio.hover()}
            className="hud-frame hud-frame-red px-4 py-2"
          >
            <span className="hud-inner flex items-center gap-2 hover:bg-red-500/10">
              <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-red-400 glow-red">
                <svg viewBox="0 0 12 12" className="h-3 w-3">
                  <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="none" stroke="#FF3366" strokeWidth="1" />
                  <line x1="6" y1="3.5" x2="6" y2="7" stroke="#FF3366" strokeWidth="1.1" />
                  <circle cx="6" cy="8.4" r="0.7" fill="#FF3366" />
                </svg>
                {t(lang, "terminate")}
              </span>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
