import { audio } from "../audio/tacticalAudio";
import type { Lang } from "../data/i18n";
import { cn } from "../utils/cn";

/* ============================================================
 *  VIEW MODULE BAR — a four-level zoom path:
 *  EARTH → SOLAR SYSTEM → GALAXY → LOCAL GROUP
 * ============================================================ */

interface Props {
  lang: Lang;
  bodyMode: string;
  onModule: (id: string) => void;
}

const MODULES: { id: string; icon: string; color: string; label: (l: Lang) => string }[] = [
  { id: "earth", icon: "🌍", color: "#00F0FF", label: (l) => (l === "zh" ? "地球" : "EARTH") },
  { id: "system", icon: "☉", color: "#FFB000", label: (l) => (l === "zh" ? "太阳系" : "SYSTEM") },
  { id: "galaxy", icon: "🌌", color: "#B44CFF", label: (l) => (l === "zh" ? "银河系" : "GALAXY") },
];

export default function ModuleBar({ lang, bodyMode, onModule }: Props) {
  return (
    <div className="relative z-20 flex h-9 shrink-0 items-center justify-center gap-1.5 border-b border-cyan-400/25 bg-[#03060d]/95 px-2">
      <span className="mr-1 text-[8px] tracking-[0.3em] text-cyan-300/60">
        ▸ {lang === "zh" ? "视角层级" : "VIEW LEVELS"}
      </span>
      {MODULES.map((m) => {
        const active = bodyMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => {
              audio.modeSwitch();
              onModule(m.id);
            }}
            onMouseEnter={() => audio.hover()}
            className={cn(
              "hud-btn flex items-center gap-1.5 whitespace-nowrap px-4 py-1 text-[9px] tracking-[0.2em]",
              active ? "hud-btn-active text-cyan-100" : "text-cyan-200/65"
            )}
          >
            <span className="text-[12px] leading-none" style={{ color: m.color, textShadow: `0 0 8px ${m.color}66` }}>
              {m.icon}
            </span>
            <span className="whitespace-nowrap">{m.label(lang)}</span>
            {active && <span className="blink-fast text-[8px] text-cyan-300">▮</span>}
          </button>
        );
      })}
    </div>
  );
}
