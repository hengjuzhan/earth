import { useEffect, useMemo, useRef, useState } from "react";
import type { GalaxyStar, NeighborGalaxy, Planet } from "../data/planets";
import { useTypewriter } from "../hooks/useTypewriter";
import { audio } from "../audio/tacticalAudio";
import { cn } from "../utils/cn";
import { PLANET_BRIEF_ZH, PLANET_ZH, t, type Lang } from "../data/i18n";

/* ============================================================
 *  INTEL PANEL — rebuilt. Clicking a STAR / GALAXY / PLANET
 *  shows its dossier here (bottom-left of the viewport).
 * ============================================================ */

interface Props {
  lang: Lang;
  star: GalaxyStar | null;
  galaxy: NeighborGalaxy | null;
  planet: Planet | null;
  onWide: () => void;
}

/* ---------------- star dossier ---------------- */

function StarDossier({
  lang,
  star,
  display,
  done,
  skip,
}: {
  lang: Lang;
  star: GalaxyStar;
  display: string;
  done: boolean;
  skip: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-3 gap-px border-b border-cyan-400/20 bg-cyan-400/10">
        {[
          [t(lang, "starType"), star.type],
          [t(lang, "starDist"), star.distance],
          [t(lang, "starMag"), star.mag],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#060d1a] px-2.5 py-1.5">
            <div className="text-[8px] tracking-[0.2em] text-cyan-200/45">{k}</div>
            <div className="font-disp text-[12px] font-bold text-cyan-100">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-cyan-400/20 px-3 py-1.5">
        <span className="text-[11px] tracking-[0.2em]" style={{ color: star.color, textShadow: `0 0 8px ${star.color}66` }}>
          ✦ {lang === "zh" ? star.zh : star.name}
        </span>
        <span className="text-[8px] text-amber-300/80 blink">● {t(lang, "starDossier")}</span>
      </div>
      <div className="hud-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-cyan-100/85">
          {display}
          {!done && <span className="tc-cursor" />}
        </p>
      </div>
      <div className="flex gap-2 border-t border-cyan-400/20 p-2.5">
        <button onClick={() => { audio.click(); skip(); }} className="hud-btn flex-1 px-2 py-2 text-[10px] tracking-[0.25em] text-cyan-200/70">
          {t(lang, "skip")} &gt;&gt;
        </button>
      </div>
    </div>
  );
}

/* ---------------- galaxy dossier ---------------- */

function GalaxyDossier({
  lang,
  galaxy,
  display,
  done,
  skip,
  onWide,
}: {
  lang: Lang;
  galaxy: NeighborGalaxy;
  display: string;
  done: boolean;
  skip: () => void;
  onWide: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-3 gap-px border-b border-cyan-400/20 bg-cyan-400/10">
        {[
          [t(lang, "galaxyType"), lang === "zh" ? galaxy.typeLabel[0] : galaxy.typeLabel[1]],
          [t(lang, "galaxyDistance"), galaxy.distance],
          [t(lang, "galaxySize"), galaxy.size],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#060d1a] px-2.5 py-1.5">
            <div className="text-[8px] tracking-[0.2em] text-cyan-200/45">{k}</div>
            <div className="font-disp text-[12px] font-bold text-cyan-100">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-cyan-400/20 px-3 py-1.5">
        <span className="text-[11px] tracking-[0.2em]" style={{ color: galaxy.color, textShadow: `0 0 8px ${galaxy.color}66` }}>
          🌌 {lang === "zh" ? galaxy.zh : galaxy.name}
        </span>
        <span className="text-[8px] text-amber-300/80 blink">● {t(lang, "galaxyDossier")}</span>
      </div>
      <div className="hud-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-cyan-100/85">
          {display}
          {!done && <span className="tc-cursor" />}
        </p>
        {done && (
          <div className="mt-3 border-t border-cyan-400/20 pt-2">
            <div className="mb-1.5 text-[9px] tracking-[0.3em] text-cyan-300/80">▸ {t(lang, "physicalData")}</div>
            {galaxy.data.map(([k, v], i) => (
              <div key={i} className="mb-1 flex gap-2 text-[10px] text-cyan-100/80">
                <span className="text-amber-300">{String(i + 1).padStart(2, "0")}.</span>
                <span className="text-cyan-200/50">{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-cyan-400/20 p-2.5">
        <button onClick={() => { audio.click(); skip(); }} className="hud-btn flex-1 px-2 py-2 text-[10px] tracking-[0.25em] text-cyan-200/70">
          {t(lang, "skip")} &gt;&gt;
        </button>
        <button onClick={() => { audio.modeSwitch(); onWide(); }} className="hud-btn flex-[1.4] px-2 py-2 text-[10px] tracking-[0.2em] text-cyan-200/90">
          ◈ {t(lang, "wideScan")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- planet / exoplanet dossier ---------------- */

function PlanetDossier({
  lang,
  planet,
  display,
  done,
  skip,
  showData,
}: {
  lang: Lang;
  planet: Planet;
  display: string;
  done: boolean;
  skip: () => void;
  showData: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-2 gap-px border-b border-cyan-400/20 bg-cyan-400/10">
        {[
          [t(lang, "diameter"), planet.diameter],
          [t(lang, "distance"), planet.distance],
          [t(lang, "orbit"), planet.orbit],
          [t(lang, "rotation"), planet.rotation],
        ].map(([k, v]) => (
          <div key={k} className="bg-[#060d1a] px-3 py-1.5">
            <div className="text-[8px] tracking-[0.3em] text-cyan-200/45">{k}</div>
            <div className="font-disp text-[13px] font-bold text-cyan-100 tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-cyan-400/20 px-3 py-1.5">
        <span className="text-[11px] tracking-[0.2em]" style={{ color: planet.color, textShadow: `0 0 8px ${planet.color}66` }}>
          ◈ {lang === "zh" && PLANET_ZH[planet.id]?.name ? PLANET_ZH[planet.id].name : planet.name} ·{" "}
          {lang === "zh" && PLANET_ZH[planet.id]?.type ? PLANET_ZH[planet.id].type : planet.type}
        </span>
        <span className="text-[9px] text-cyan-200/60">{t(lang, "moons")} {planet.moons}</span>
      </div>
      <div className="hud-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-1.5 text-[9px] tracking-[0.3em] text-amber-300/70">▸ {t(lang, "telemetryFeed")}</div>
        <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-cyan-100/85">
          {display}
          {!done && <span className="tc-cursor" />}
        </p>
        {showData && (
          <div className="mt-3 border-t border-cyan-400/20 pt-2">
            <div className="mb-1.5 text-[9px] tracking-[0.3em] text-cyan-300/80">▸ {t(lang, "physicalData")}</div>
            {planet.data.map(([k, v], i) => (
              <div key={i} className="mb-1 flex gap-2 text-[10px] text-cyan-100/80">
                <span className="text-amber-300">{String(i + 1).padStart(2, "0")}.</span>
                <span className="text-cyan-200/50">{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-cyan-400/20 p-2.5">
        <button onClick={() => { audio.click(); skip(); }} className="hud-btn flex-1 px-2 py-2 text-[10px] tracking-[0.25em] text-cyan-200/70">
          {t(lang, "skip")} &gt;&gt;
        </button>
      </div>
    </div>
  );
}

export default function IntelPanel({ lang, star, galaxy, planet, onWide }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  /* draggable position — default bottom-left, saved while you drag */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ down: boolean; sx: number; sy: number; px: number; py: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const briefText = useMemo(() => {
    if (galaxy) return lang === "zh" ? galaxy.briefing[0] : galaxy.briefing[1];
    if (planet) {
      return lang === "zh" && PLANET_BRIEF_ZH[planet.id]
        ? PLANET_BRIEF_ZH[planet.id].join("\n\n")
        : planet.briefing[0];
    }
    if (star) return lang === "zh" ? star.briefing[0] : star.briefing[1];
    return "";
  }, [galaxy, planet, star, lang]);

  const { display, done, skip } = useTypewriter(briefText, 13, !!briefText);
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    setShowData(false);
  }, [star?.id, galaxy?.id, planet?.id]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShowData(true), 350);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (collapsed) {
    return (
      <button
        onClick={() => { setCollapsed(false); audio.click(); }}
        className="hud-frame pointer-events-auto fixed z-30 hidden w-[42px] md:block"
        style={pos ? { left: pos.x, top: pos.y } : { left: 8, top: 136 }}
        title={lang === "zh" ? "展开情报面板" : "EXPAND"}
      >
        <span className="hud-inner block py-3 hover:bg-cyan-400/10">
          <span className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-200 glow-cyan">▼</span>
            <span className="text-[10px] tracking-[0.2em] text-cyan-300 glow-cyan" style={{ writingMode: "vertical-rl" }}>
              ▸ {lang === "zh" ? "情报面板" : "INTEL"}
            </span>
            <span className="text-[9px] font-bold text-cyan-200/70">▲</span>
          </span>
        </span>
      </button>
    );
  }

  const onDragStart = (e: React.PointerEvent) => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { down: true, sx: e.clientX, sy: e.clientY, px: rect.left, py: rect.top };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !d.down) return;
    setPos({
      x: Math.round(d.px + (e.clientX - d.sx)),
      y: Math.round(d.py + (e.clientY - d.sy)),
    });
  };
  const onDragEnd = () => {
    if (dragRef.current) dragRef.current.down = false;
  };

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto fixed z-30 hidden w-[330px] md:block"
      style={pos ? { left: pos.x, top: pos.y } : { left: 8, top: 136 }}
    >
      <div className="hud-frame">
        <div className="hud-inner flex max-h-[calc(100vh-250px)] flex-col">
          <div className="sweep" />
          {/* head — draggable handle */}
          <div
            className="flex cursor-grab items-center justify-between border-b border-cyan-400/20 px-3 py-2 active:cursor-grabbing select-none"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
          >
            <span className="text-[10px] tracking-[0.3em] text-cyan-300 glow-cyan">⠿ ▸ {t(lang, "intelFeed")}</span>
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "border px-1.5 py-[1px] text-[8px] tracking-[0.2em]",
                  star || galaxy || planet
                    ? "border-amber-400/50 text-amber-300"
                    : "border-cyan-400/30 text-cyan-200/60"
                )}
              >
                {galaxy ? t(lang, "galaxyDossier") : planet ? t(lang, "celestialBody") : star ? t(lang, "starDossier") : t(lang, "idle")}
              </span>
              <button
                onClick={() => { setCollapsed(true); audio.click(); }}
                title={lang === "zh" ? "收起面板" : "COLLAPSE"}
                className="hud-btn ml-1 flex items-center gap-1 border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold tracking-[0.15em] text-cyan-200"
              >
                {lang === "zh" ? "收起" : "HIDE"} ▼
              </button>
            </span>
          </div>

          {/* body — priority: galaxy > planet > star > idle */}
          {galaxy ? (
            <GalaxyDossier
              lang={lang}
              galaxy={galaxy}
              display={display}
              done={done}
              skip={skip}
              onWide={onWide}
            />
          ) : planet ? (
            <PlanetDossier
              lang={lang}
              planet={planet}
              display={display}
              done={done}
              skip={skip}
              showData={showData}
            />
          ) : star ? (
            <StarDossier
              lang={lang}
              star={star}
              display={display}
              done={done}
              skip={skip}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
              <div className="text-4xl opacity-40">◈</div>
              <div className="text-[11px] tracking-[0.3em] text-cyan-200/50">{t(lang, "awaitingOrders")}</div>
              <div className="whitespace-pre-wrap text-[9px] leading-relaxed text-cyan-200/30">
                {lang === "zh"
                  ? "点击恒星、星系或行星\n情报将在此显示"
                  : "CLICK A STAR, GALAXY OR PLANET\nINTEL APPEARS HERE"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
