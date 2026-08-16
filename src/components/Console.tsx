import { useEffect, useRef, useState } from "react";
import { audio } from "../audio/tacticalAudio";
import { t, type Lang } from "../data/i18n";

interface Props {
  lang: Lang;
  open: boolean;
  onClose: () => void;
  onCommand: (cmd: string) => string | null;
}

export default function Console({ lang, open, onClose, onCommand }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setInput("");
      setOutput(null);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const cmd = input.trim();
    if (!cmd) return;
    setInput("");
    audio.click();
    if (cmd === "/help") {
      setOutput(
        lang === "zh"
          ? "/launch 发射火箭 · /dock 对接空间站\n/time full|dawn|night 光照模式\n/weather aurora|wind|shower 空间天气\n/shader 0-3 渲染风格 · /track ufo 追踪目标\n/sat opt|com|wrn|stn 卫星视角 · /reset 复位视角\n/help 帮助 · 隐藏指令请自行探索 ★"
          : "/launch ROCKET · /dock STATION\n/time full|dawn|night LIGHTING\n/weather aurora|wind|shower SPACE WEATHER\n/shader 0-3 RENDER STYLE · /track ufo TRACKING\n/sat opt|com|wrn|stn SATELLITE VIEW · /reset RESET\n/help HELP · hidden commands await ★"
      );
      return;
    }
    const res = onCommand(cmd);
    if (res !== null) setOutput(res);
  };

  return (
    <div className="fixed bottom-[84px] left-1/2 z-40 w-[560px] max-w-[92vw] -translate-x-1/2">
      <div className="hud-frame">
        <div className="hud-inner relative flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-400/20 px-3 py-1.5">
            <span className="text-[9px] tracking-[0.3em] text-cyan-300 glow-cyan">
              ▸ {lang === "zh" ? "指令控制台" : "COMMAND CONSOLE"}
            </span>
            <span className="text-[8px] tracking-[0.2em] text-cyan-200/40">
              [~] {lang === "zh" ? "呼出 · ESC 关闭" : "TOGGLE · ESC CLOSE"}
            </span>
          </div>
          {output && (
            <div className="whitespace-pre-wrap px-3 py-2 text-[10px] leading-relaxed tracking-[0.08em] text-amber-200/85">
              {output}
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-cyan-400/15 px-3 py-2">
            <span className="text-cyan-300">&gt;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") submit();
                if (e.key === "Escape") onClose();
              }}
              placeholder={t(lang, "consolePlaceholder")}
              className="flex-1 bg-transparent text-[11px] tracking-[0.12em] text-cyan-100 outline-none placeholder:text-cyan-200/30"
            />
            <button onClick={submit} className="hud-btn px-3 py-1 text-[9px] tracking-[0.25em] text-cyan-200/80">
              RUN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
