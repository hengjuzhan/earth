import { useEffect, useRef, useState } from "react";
import { audio } from "../audio/tacticalAudio";

/**
 * Military typewriter effect — prints text char by char,
 * firing synthesized tick sounds while typing.
 */
export function useTypewriter(text: string, speed = 14, enabled = true) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!enabled) return;
    let i = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const finish = () => {
      if (interval) clearInterval(interval);
      if (!cancelled) {
        setDisplay(text);
        setDone(true);
        audio.typeDone();
      }
    };

    skipRef.current = finish;
    setDisplay("");
    setDone(false);

    // slight delay before printing starts (let camera begin flying)
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplay(text.slice(0, i));
        if (i % 3 === 0) audio.tick();
        if (i >= text.length) {
          finish();
        }
      }, speed);
    }, 380);

    return () => {
      cancelled = true;
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, enabled]);

  return { display, done, skip: () => skipRef.current() };
}
