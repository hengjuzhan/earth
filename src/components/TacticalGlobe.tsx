import { useEffect, useRef } from "react";
import { GlobeEngine, type HoverInfo, type NodeSpec } from "../engine/globeEngine";

interface Props {
  missions: NodeSpec[];
  onReady: (engine: GlobeEngine) => void;
  onFps: (fps: number) => void;
  onHover: (h: HoverInfo | null) => void;
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
  onLocalGalaxyClick?: (id: string) => void;
  onGalaxyInteriorStarClick?: (id: string) => void;
  onGalaxyInteriorPlanetClick?: (id: string) => void;
}

export default function TacticalGlobe({
  missions,
  onReady,
  onFps,
  onHover,
  onNodeClick,
  onPlanetClick,
  onAlien,
  onSatelliteClick,
  onMoonClick,
  onUfoTelemetry,
  onRocketEvent,
  onStats,
  onMoonLand,
  onMoonMissionChange,
  onStarClick,
  onGalaxyClick,
  onExoPlanetClick,
  onLocalGalaxyClick,
  onGalaxyInteriorStarClick,
  onGalaxyInteriorPlanetClick,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef({
    onReady, onFps, onHover, onNodeClick, onPlanetClick, onAlien,
    onSatelliteClick, onMoonClick, onUfoTelemetry, onRocketEvent, onStats, onMoonLand,
    onMoonMissionChange, onStarClick, onGalaxyClick, onExoPlanetClick, onLocalGalaxyClick,
    onGalaxyInteriorStarClick, onGalaxyInteriorPlanetClick,
  });
  cbRef.current = {
    onReady, onFps, onHover, onNodeClick, onPlanetClick, onAlien,
    onSatelliteClick, onMoonClick, onUfoTelemetry, onRocketEvent, onStats, onMoonLand,
    onMoonMissionChange, onStarClick, onGalaxyClick, onExoPlanetClick, onLocalGalaxyClick,
    onGalaxyInteriorStarClick, onGalaxyInteriorPlanetClick,
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const engine = new GlobeEngine(mount, {
      onFps: (fps) => cbRef.current.onFps(fps),
      onHover: (h) => cbRef.current.onHover(h),
      onNodeClick: (id) => cbRef.current.onNodeClick?.(id),
      onPlanetClick: (id) => cbRef.current.onPlanetClick?.(id),
      onAlien: (id) => cbRef.current.onAlien?.(id),
      onSatelliteClick: (id) => cbRef.current.onSatelliteClick?.(id),
      onMoonClick: () => cbRef.current.onMoonClick?.(),
      onUfoTelemetry: (d) => cbRef.current.onUfoTelemetry?.(d),
      onRocketEvent: (k) => cbRef.current.onRocketEvent?.(k),
      onStats: (s) => cbRef.current.onStats?.(s),
      onMoonLand: () => cbRef.current.onMoonLand?.(),
      onMoonMissionChange: (a) => cbRef.current.onMoonMissionChange?.(a),
      onStarClick: (id) => cbRef.current.onStarClick?.(id),
      onGalaxyClick: (id) => cbRef.current.onGalaxyClick?.(id),
      onExoPlanetClick: (id) => cbRef.current.onExoPlanetClick?.(id),
      onLocalGalaxyClick: (id) => cbRef.current.onLocalGalaxyClick?.(id),
      onGalaxyInteriorStarClick: (id) => cbRef.current.onGalaxyInteriorStarClick?.(id),
      onGalaxyInteriorPlanetClick: (id) => cbRef.current.onGalaxyInteriorPlanetClick?.(id),
    });

    engine.setMissions(missions);
    cbRef.current.onReady(engine);

    return () => {
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, rgba(10,26,54,0.85) 0%, rgba(6,9,17,0.2) 45%, rgba(3,5,10,0.9) 100%)",
      }}
    />
  );
}
