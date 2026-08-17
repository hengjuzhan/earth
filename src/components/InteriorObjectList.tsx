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
 *  INTERIOR OBJECT LIST — every real star & planet inside the
 *  currently open galaxy, clickable to fly the camera there.
 *  Mirrors the Solar System planet list UX.
 * ============================================================ */

interface Props {
  lang: Lang;
  galaxyId: string;
  activeStarId: string | null;
  activePlanetId: string | null;
  onStarClick: (id: string) => void;
  onPlanetClick: (id: string) => void;
}

export default function InteriorObjectList({
  lang,
  galaxyId,
  activeStarId,
  activePlanetId,
  onStarClick,
  onPlanetClick,
}: Props) {
  const stars: GalaxyInteriorStar[] = GALAXY_INTERIOR_STARS_BY_GALAXY[galaxyId] ?? [];
  const planets: GalaxyInteriorPlanet[] = GALAXY_INTERIOR_PLANETS_BY_GALAXY[galaxyId] ?? [];

  if (stars.length === 0 && planets.length === 0) return null;

  const starName = (s: GalaxyInteriorStar) => (lang === "zh" ? s.zh : s.name);
  const planetName = (p: GalaxyInteriorPlanet) => (lang === "zh" ? p.zh : p.name);

  return (
    <div className="pointer-events-auto absolute right-16 top-1/2 z-20 hidden w-44 -translate-y-1/2 flex-col gap-1 border border-cyan-400/30 bg-[#03060d]/90 p-1.5 backdrop-blur-[2px] max-lg:right-10 max-lg:w-32 md:flex">
      <div className="border-b border-cyan-400/20 px-1 pb-1 text-[8px] tracking-[0.25em] text-cyan-300/60">
        ▸ {lang === "zh" ? "已确认天体" : "CATALOGUED OBJECTS"}
      </div>

      {/* stars */}
      {stars.length > 0 && (
        <div className="text-[8px] tracking-[0.25em] text-cyan-200/40">
          {lang === "zh" ? "恒星 / 星团" : "STARS / CLUSTERS"}
        </div>
      )}
      {stars.map((s) => {
        const active = activeStarId === s.id;
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
              {starName(s)}
            </span>
            <span className="ml-auto shrink-0 text-[7px] text-amber-300/70">✦</span>
          </button>
        );
      })}

      {/* planets */}
      {planets.length > 0 && (
        <div className="mt-1 text-[8px] tracking-[0.25em] text-cyan-200/40">
          {lang === "zh" ? "河外行星" : "EXOPLANETS"}
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
              {planetName(p)}
            </span>
            <span className="ml-auto shrink-0 text-[7px] text-pink-300/70">◉</span>
          </button>
        );
      })}

      <div className="border-t border-cyan-400/20 px-1 pt-1 text-[7px] leading-relaxed text-cyan-300/40">
        {lang === "zh"
          ? "点击列表或场景中带 ◌ 环标记的天体即可飞行观测"
          : "Click a list item or any reticle-marked object in view"}
      </div>
    </div>
  );
}
