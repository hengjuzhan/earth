import { useEffect, useState } from "react";
import { audio } from "../audio/tacticalAudio";
import { t, type Lang } from "../data/i18n";
import { cn } from "../utils/cn";

export interface AppSettings {
  master: number; // 0..100
  sfx: number;
  ambient: number;
}

interface Props {
  lang: Lang;
  open: boolean;
  settings: AppSettings;
  quality: "low" | "med" | "high";
  fxOn: boolean;
  onChange: (s: Partial<AppSettings>) => void;
  onQuality: (q: "low" | "med" | "high") => void;
  onFx: (v: boolean) => void;
  onLang: () => void;
  onClose: () => void;
}

function Slider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] tracking-[0.25em] text-cyan-100/85">{label}</span>
        <span className="text-[9px] text-cyan-200/60 tabular-nums">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={() => audio.click()}
        className="hud-range w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export default function SettingsPanel({
  lang,
  open,
  settings,
  quality,
  fxOn,
  onChange,
  onQuality,
  onFx,
  onLang,
  onClose,
}: Props) {
  const [tmp, setTmp] = useState(settings);

  useEffect(() => {
    if (open) setTmp(settings);
  }, [open, settings]);

  if (!open) return null;

  const patch = (p: Partial<AppSettings>) => {
    setTmp((s) => ({ ...s, ...p }));
    onChange(p);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div className="hud-frame w-[380px] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <div className="hud-inner relative flex flex-col">
          <div className="sweep" />
          <div className="flex items-center justify-between border-b border-cyan-400/20 px-4 py-2.5">
            <span className="text-[11px] tracking-[0.3em] text-cyan-300 glow-cyan">⚙ {t(lang, "settings")}</span>
            <button onClick={onClose} className="hud-btn px-2 py-0.5 text-[10px] text-cyan-200/70">
              ✕
            </button>
          </div>

          <div className="px-4 py-3">
            {/* volumes */}
            <Slider label={t(lang, "masterVol")} value={tmp.master} color="#00F0FF" onChange={(v) => patch({ master: v })} />
            <Slider label={t(lang, "sfxVol")} value={tmp.sfx} color="#FFB000" onChange={(v) => patch({ sfx: v })} />
            <Slider label={t(lang, "ambVol")} value={tmp.ambient} color="#B44CFF" onChange={(v) => patch({ ambient: v })} />

            {/* render quality */}
            <div className="mb-2.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[9px] tracking-[0.25em] text-cyan-100/85">{t(lang, "quality")}</span>
                <span className="text-[8px] tracking-[0.2em] text-cyan-200/50">
                  {quality === "low" ? t(lang, "qualityLow") : quality === "med" ? t(lang, "qualityMed") : t(lang, "qualityHigh")}
                </span>
              </div>
              <div className="flex gap-1.5">
                {(["low", "med", "high"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onQuality(q);
                      audio.click();
                    }}
                    className={cn(
                      "hud-btn flex-1 px-2 py-1.5 text-[10px] tracking-[0.25em]",
                      quality === q ? "hud-btn-active text-cyan-100" : "text-cyan-200/50"
                    )}
                  >
                    {q === "low" ? t(lang, "qualityLow") : q === "med" ? t(lang, "qualityMed") : t(lang, "qualityHigh")}
                  </button>
                ))}
              </div>
            </div>

            {/* toggles */}
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  onFx(!fxOn);
                  audio.click();
                }}
                className={cn(
                  "hud-btn flex-1 px-2 py-1.5 text-[10px] tracking-[0.2em]",
                  fxOn ? "hud-btn-active text-cyan-100" : "text-cyan-200/50"
                )}
              >
                {t(lang, fxOn ? "fxOn" : "fxOff")}
              </button>
              <button
                onClick={() => {
                  onLang();
                  audio.modeSwitch();
                }}
                className="hud-btn flex-1 px-2 py-1.5 text-[10px] tracking-[0.2em] text-amber-200/85"
              >
                文 {lang === "zh" ? "中 ▸ EN" : "EN ▸ 中"}
              </button>
            </div>
          </div>

          <div className="border-t border-cyan-400/15 px-4 py-2 text-center">
            <span className="text-[8px] tracking-[0.22em] text-cyan-200/40">{t(lang, "settingsHint")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
