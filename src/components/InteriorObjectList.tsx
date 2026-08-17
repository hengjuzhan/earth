import { audio } from "../audio/tacticalAudio";
import {
  GALAXY_INTERIOR_STARS_BY_GALAXY,
  GALAXY_INTERIOR_PLANETS_BY_GALAXY,
  type GalaxyInteriorStar,
  type GalaxyInteriorPlanet,
} from "../data/galaxyInteriors";
import type { Lang } from "../data/i18n";
import { cn } from "../utils/cn";

/* ============================================================
 *  INTERIOR OBJECT LIST — the object catalog of the open galaxy.
 *  Panorama mode: every real star & planet, click to fly.
 *  System mode (systemStar set): the star's own planetary
 *  system — click a planet to fly to it, back button returns.
 * ============================================================ */

interface Props {
  lang: Lang;
  galaxyId: string;
  systemStar: GalaxyInteriorStar | null;
  activeStarId: string | null;
  activePlanetId: string | null;
  onStarClick: (id: string) => void;
  onPlanetClick: (id: string) => void;
  onBack: () => void;
}

export default function InteriorObjectList({
  lang,
  galaxyId,
  systemStar,
  activeStarId,
  activePlanetId,
  onStarClick,
  onPlanetClick,
  onBack,
}: Props) {
  const stars: GalaxyInteriorStar[] = GALAXY_INTERIOR_STARS_BY_GALAXY[galaxyId] ?? [];
  const planets: GalaxyInteriorPlanet[] = GALAXY_INTERIOR_PLANETS_BY_GALAXY[galaxyId] ?? [];

  /* ---------- star-system sub-level ---------- */
  if (systemStar) {
    const sysPlanets = planets.filter((p) => p.parentStarId === systemStar.id);
    return (
      <div className="pointer-events-auto absolute right-16 top-1/2 z-20 hidden w-44 -translate-y-1/2 flex-col gap-1 border border-cyan-400/30 bg-[#03060d]/90 p-1.5 backdrop-blur-[2px] max-lg:right-10 max-lg:w-32 md:flex">
        <button
          onClick={() => {
            audio.click();
            onBack();
          }}
          className="flex items-center gap-1.5 border-b border-cyan-400/20 px-1 pb-1.5 text-[8px] tracking-[0.25em] text-cyan-300/70 hover:text-cyan-100"
        >
          ◂ {lang === "zh" ? "返回星系全景" : "BACK TO GALAXY"}
        </button>

        <div className="px-1 py-1 text-[8px] tracking-[0.25em] text-cyan-300/60">
          ▸ {lang === "zh" ? "恒星系统" : "STAR SYSTEM"}
        </div>

        {/* central star */}
        <div className="flex items-center gap-1.5 border border-cyan-400/40 bg-cyan-400/10 px-1.5 py-1">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: systemStar.color, boxShadow: `0 0 8px ${systemStar.color}` }}
          />
          <span className="truncate text-[9px] font-bold tracking-wider text-cyan-100">
            {lang === "zh" ? systemStar.zh : systemStar.name}
          </span>
          <span className="ml-auto shrink-0 text-[7px] text-amber-300">☉</span>
        </div>
        <div className="px-1 text-[7px] text-cyan-200/40">{systemStar.type}</div>

        {/* planets */}
        {sysPlanets.length > 0 ? (
          <>
            <div className="mt-1 text-[8px] tracking-[0.25em] text-cyan-200/40">
              {lang === "zh" ? "行星 / 伴星" : "PLANETS / COMPANIONS"}
            </div>
            {sysPlanets.map((p) => {
              const active = activePlanetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    audio.click();
                    onPlanetClick(p.id);
                  }}
                  className={cn(
                    "group flex items-center gap-1.5 border px-1.5 py-1 text-left transition-colors",
                    active
                      ? "border-pink-300/70 bg-pink-400/15"
                      : "border-transparent hover:border-pink-400/40 hover:bg-pink-400/10"
                  )}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                  />
                  <span
                    className={cn(
                      "truncate text-[9px] tracking-wider",
                      active ? "text-pink-100" : "text-pink-200/70 group-hover:text-pink-100"
                    )}
                  >
                    {lang === "zh" ? p.zh : p.name}
                  </span>
                  <span className="ml-auto shrink-0 text-[7px] text-pink-300/70">◉</span>
                </button>
              );
            })}
          </>
        ) : (
          <div className="mt-1 border border-cyan-400/15 bg-cyan-400/5 px-1.5 py-1.5 text-[7px] leading-relaxed text-cyan-200/50">
            {lang === "zh"
              ? "该恒星暂无已确认的行星记录（真实数据）"
              : "No confirmed planet on record for this star (real data)"}
          </div>
        )}

        <div className="border-t border-cyan-400/20 px-1 pt-1 text-[7px] leading-relaxed text-cyan-300/40">
          {lang === "zh" ? "点击行星飞行观测 · Esc 返回" : "Click a planet to fly · Esc to go back"}
        </div>
      </div>
    );
  }

  /* ---------- galaxy panorama ---------- */
  if (stars.length === 0 && planets.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute right-16 top-1/2 z-20 hidden w-44 -translate-y-1/2 flex-col gap-1 border border-cyan-400/30 bg-[#03060d]/90 p-1.5 backdrop-blur-[2px] max-lg:right-10 max-lg:w-32 md:flex">
      <div className="border-b border-cyan-400/20 px-1 pb-1 text-[8px] tracking-[0.25em] text-cyan-300/60">
        ▸ {lang === "zh" ? "已确认天体" : "CATALOGUED OBJECTS"}
      </div>

      {stars.length > 0 && (
        <div className="text-[8px] tracking-[0.25em] text-cyan-200/40">
          {lang === "zh" ? "恒星 / 星团" : "STARS / CLUSTERS"}
        </div>
      )}
      {stars.map((s) => {
        const active = activeStarId === s.id;
        const hasPlanets = planets.some((p) => p.parentStarId === s.id);
        return (
          <button
            key={s.id}
            onClick={() => {
              audio.click();
              onStarClick(s.id);
            }}
            className={cn(
              "group flex items-center gap-1.5 border px-1.5 py-1 text-left transition-colors",
              active
                ? "border-cyan-300/70 bg-cyan-400/15"
                : "border-transparent hover:border-cyan-400/40 hover:bg-cyan-400/10"
            )}
          >
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
            />
            <span
              className={cn(
                "truncate text-[9px] tracking-wider",
                active ? "text-cyan-100" : "text-cyan-200/70 group-hover:text-cyan-100"
              )}
            >
              {lang === "zh" ? s.zh : s.name}
            </span>
            {hasPlanets ? (
              <span className="ml-auto shrink-0 text-[7px] text-pink-300/80">◉行</span>
            ) : (
              <span className="ml-auto shrink-0 text-[7px] text-amber-300/70">✦</span>
            )}
          </button>
        );
      })}

      {planets.length > 0 && (
        <div className="mt-1 text-[8px] tracking-[0.25em] text-cyan-200/40">
          {lang === "zh" ? "行星 / 伴星（全景标记）" : "PLANETS / COMPANIONS (PANORAMA)"}
        </div>
      )}
      {planets.map((p) => {
        const active = activePlanetId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => {
              audio.click();
              onPlanetClick(p.id);
            }}
            className={cn(
              "group flex items-center gap-1.5 border px-1.5 py-1 text-left transition-colors",
              active
                ? "border-pink-300/70 bg-pink-400/15"
                : "border-transparent hover:border-pink-400/40 hover:bg-pink-400/10"
            )}
          >
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
            />
            <span
              className={cn(
                "truncate text-[9px] tracking-wider",
                active ? "text-pink-100" : "text-pink-200/70 group-hover:text-pink-100"
              )}
            >
              {lang === "zh" ? p.zh : p.name}
            </span>
            <span className="ml-auto shrink-0 text-[7px] text-pink-300/70">◉</span>
          </button>
        );
      })}

      <div className="border-t border-cyan-400/20 px-1 pt-1 text-[7px] leading-relaxed text-cyan-300/40">
        {lang === "zh"
          ? "点击恒星进入其行星系统 · 带 ◉行 者有行星"
          : "Click a star to open its system · ◉ = has planets"}
      </div>
    </div>
  );
}
