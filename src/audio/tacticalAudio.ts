/* ============================================================
 *  TACTICAL AUDIO CORE — Web Audio API synthesized sounds
 *  Volume buses: master → (sfx · ambient hum) — adjustable live.
 * ============================================================ */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let humStarted = false;
let lastTick = 0;
/* spaceship engine — live oscillators tied to the throttle */
let engineGain: GainNode | null = null;
let engineOscA: OscillatorNode | null = null;
let engineOscB: OscillatorNode | null = null;
let engineNoise: AudioBufferSourceNode | null = null;
let engineNoiseGain: GainNode | null = null;
let engineRunning = false;

export interface Volumes {
  master: number; // 0..1
  sfx: number; // 0..1
  ambient: number; // 0..1
}

const vols: Volumes = { master: 0.9, sfx: 1.0, ambient: 0.7 };

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = vols.master;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = vols.sfx;
    sfxBus.connect(master);
    ambBus = ctx.createGain();
    ambBus.gain.value = vols.ambient;
    ambBus.connect(master);
  }
  if (ctx.state === "suspended") ctx.resume();
  /* low-frequency orbital ambient hum — starts once, stays forever */
  if (!humStarted && ambBus) {
    humStarted = true;
    const oscA = ctx.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 52;
    const oscB = ctx.createOscillator();
    oscB.type = "triangle";
    oscB.frequency.value = 78.4;
    const gA = ctx.createGain();
    gA.gain.value = 0.03;
    const gB = ctx.createGain();
    gB.gain.value = 0.015;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.008;
    lfo.connect(lfoG);
    lfoG.connect(gA.gain);
    oscA.connect(gA);
    gA.connect(ambBus);
    oscB.connect(gB);
    gB.connect(ambBus);
    oscA.start();
    oscB.start();
    lfo.start();
  }
  return ctx;
}

/** live volume control from the settings module */
export function setVolumes(v: Partial<Volumes>) {
  Object.assign(vols, v);
  if (ctx && master && sfxBus && ambBus) {
    master.gain.setTargetAtTime(vols.master, ctx.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(vols.sfx, ctx.currentTime, 0.05);
    ambBus.gain.setTargetAtTime(vols.ambient, ctx.currentTime, 0.05);
  }
}

interface ToneOpts {
  freq: number;
  endFreq?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  curve?: "exp" | "lin";
}

function tone({ freq, endFreq, dur, type = "square", gain = 0.08, delay = 0, curve = "exp" }: ToneOpts) {
  const ac = ensure();
  if (!ac || !sfxBus) return;
  if (ac.state === "suspended") return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) {
    if (curve === "exp") osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t0 + dur);
    else osc.frequency.linearRampToValueAtTime(endFreq, t0 + dur);
  }
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(sfxBus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, gain: number, delay = 0, lowpass = 4000) {
  const ac = ensure();
  if (!ac || !sfxBus) return;
  if (ac.state === "suspended") return;
  const t0 = ac.currentTime + delay;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lowpass;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(sfxBus);
  src.start(t0);
}

export const audio = {
  unlock() {
    ensure();
  },

  setVolumes,

  /** subtle hover blip */
  hover() {
    tone({ freq: 1500, dur: 0.03, type: "sine", gain: 0.03 });
  },

  /** button press beep */
  click() {
    tone({ freq: 880, dur: 0.06, type: "square", gain: 0.07 });
    tone({ freq: 1320, dur: 0.055, type: "square", gain: 0.055, delay: 0.03 });
  },

  /** mission select / data commit */
  select() {
    tone({ freq: 620, endFreq: 980, dur: 0.1, type: "square", gain: 0.075 });
    tone({ freq: 1240, dur: 0.07, type: "sine", gain: 0.04, delay: 0.07 });
  },

  /** typewriter character tick — throttled */
  tick() {
    const now = performance.now();
    if (now - lastTick < 42) return;
    lastTick = now;
    tone({ freq: 2100 + Math.random() * 300, dur: 0.014, type: "sine", gain: 0.018 });
  },

  /** typing finished chime */
  typeDone() {
    tone({ freq: 1560, dur: 0.06, type: "sine", gain: 0.055 });
    tone({ freq: 2080, dur: 0.07, type: "sine", gain: 0.045, delay: 0.05 });
  },

  /** target lock acquisition sweep */
  lock() {
    tone({ freq: 180, endFreq: 1450, dur: 0.42, type: "sawtooth", gain: 0.065, curve: "exp" });
    noise(0.28, 0.05, 0.05, 2500);
    tone({ freq: 2200, dur: 0.07, type: "sine", gain: 0.055, delay: 0.34 });
    tone({ freq: 3300, dur: 0.09, type: "sine", gain: 0.04, delay: 0.42 });
  },

  /** denied / locked out */
  deny() {
    tone({ freq: 220, endFreq: 120, dur: 0.22, type: "sawtooth", gain: 0.08 });
    tone({ freq: 160, dur: 0.18, type: "square", gain: 0.055, delay: 0.18 });
  },

  /** body switch (earth/moon/sol) sweep */
  modeSwitch() {
    tone({ freq: 400, endFreq: 1600, dur: 0.16, type: "triangle", gain: 0.055 });
    noise(0.14, 0.04, 0.05, 6000);
  },

  /** power-up arpeggio */
  power() {
    [440, 660, 880, 1320].forEach((f, i) =>
      tone({ freq: f, dur: 0.09, type: "square", gain: 0.05, delay: i * 0.07 })
    );
  },

  /** doomsday countdown beeps (descending) */
  countdown() {
    tone({ freq: 660, dur: 0.08, type: "square", gain: 0.06 });
  },

  /** annihilation payload detonation */
  apocalypse() {
    tone({ freq: 120, endFreq: 22, dur: 1.7, type: "sawtooth", gain: 0.1 });
    tone({ freq: 55, dur: 1.9, type: "sine", gain: 0.12 });
    tone({ freq: 300, endFreq: 40, dur: 1.2, type: "triangle", gain: 0.08, delay: 0.15 });
    noise(1.9, 0.18, 0.1, 500);
  },

  /** impact boom */
  boom() {
    tone({ freq: 90, endFreq: 28, dur: 0.65, type: "triangle", gain: 0.12 });
    noise(0.5, 0.16, 0, 300);
  },

  /** restore chime */
  restore() {
    [330, 440, 660, 990].forEach((f, i) =>
      tone({ freq: f, dur: 0.1, type: "sine", gain: 0.045, delay: i * 0.09 })
    );
  },

  /* ================= ship engine (live, throttle-linked) ================= */

  startEngine() {
    const ac = ensure();
    if (!ac || !sfxBus || engineRunning) return;
    engineRunning = true;
    engineGain = ac.createGain();
    engineGain.gain.value = 0;
    engineGain.connect(sfxBus);
    engineOscA = ac.createOscillator();
    engineOscA.type = "sawtooth";
    engineOscA.frequency.value = 48;
    engineOscB = ac.createOscillator();
    engineOscB.type = "square";
    engineOscB.frequency.value = 97;
    const gB = ac.createGain();
    gB.gain.value = 0.35;
    engineOscA.connect(engineGain);
    engineOscB.connect(gB);
    gB.connect(engineGain);
    const len = Math.floor(ac.sampleRate * 2);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    engineNoise = ac.createBufferSource();
    engineNoise.buffer = buf;
    engineNoise.loop = true;
    const nf = ac.createBiquadFilter();
    nf.type = "lowpass";
    nf.frequency.value = 180;
    engineNoiseGain = ac.createGain();
    engineNoiseGain.gain.value = 0.04;
    engineNoise.connect(nf);
    nf.connect(engineNoiseGain);
    engineNoiseGain.connect(engineGain);
    engineOscA.start();
    engineOscB.start();
    engineNoise.start();
  },

  /** live engine sound — pitch & volume track the throttle */
  setEngine(throttle: number, speed01: number) {
    const ac = ctx;
    if (!ac || !engineGain) return;
    const t = Math.max(0, Math.min(1, throttle));
    engineGain.gain.setTargetAtTime(0.02 + t * 0.1 + speed01 * 0.02, ac.currentTime, 0.06);
    if (engineOscA) engineOscA.frequency.setTargetAtTime(46 + t * 58 + speed01 * 22, ac.currentTime, 0.08);
    if (engineOscB) engineOscB.frequency.setTargetAtTime(92 + t * 118, ac.currentTime, 0.08);
    if (engineNoiseGain) engineNoiseGain.gain.setTargetAtTime(0.03 + t * 0.05, ac.currentTime, 0.06);
  },

  stopEngine() {
    const ac = ctx;
    if (!ac || !engineGain) {
      engineRunning = false;
      return;
    }
    engineGain.gain.setTargetAtTime(0, ac.currentTime, 0.1);
    const kill = () => {
      engineOscA?.stop();
      engineOscB?.stop();
      engineNoise?.stop();
      engineOscA = null;
      engineOscB = null;
      engineNoise = null;
      engineNoiseGain = null;
      engineGain = null;
      engineRunning = false;
    };
    setTimeout(kill, 400);
  },

  /** alien contact — eerie wobble chirp */
  alien() {
    tone({ freq: 500, endFreq: 920, dur: 0.18, type: "sine", gain: 0.065 });
    tone({ freq: 380, endFreq: 740, dur: 0.18, type: "sine", gain: 0.055, delay: 0.07 });
    tone({ freq: 640, endFreq: 1150, dur: 0.24, type: "triangle", gain: 0.05, delay: 0.16 });
    tone({ freq: 2100, dur: 0.09, type: "sine", gain: 0.035, delay: 0.42 });
  },

  /** synthesized voice-like announcements for key operations */
  announce(kind: "launch" | "dock" | "observe" | "intercept" | "alert" | "ach" | "weather" | "moon") {
    switch (kind) {
      case "launch":
        [280, 340, 420, 560].forEach((f, i) =>
          tone({ freq: f, dur: 0.12, type: "sawtooth", gain: 0.05, delay: i * 0.1 })
        );
        noise(0.9, 0.08, 0, 900);
        break;
      case "dock":
        tone({ freq: 660, dur: 0.1, type: "sine", gain: 0.05 });
        tone({ freq: 990, dur: 0.14, type: "sine", gain: 0.05, delay: 0.12 });
        tone({ freq: 1320, dur: 0.18, type: "sine", gain: 0.045, delay: 0.26 });
        break;
      case "observe":
        tone({ freq: 880, dur: 0.08, type: "triangle", gain: 0.05 });
        tone({ freq: 1170, dur: 0.12, type: "triangle", gain: 0.04, delay: 0.1 });
        break;
      case "intercept":
        this.apocalypse();
        tone({ freq: 1500, dur: 0.2, type: "square", gain: 0.06, delay: 0.3 });
        break;
      case "alert":
        for (let i = 0; i < 3; i++) {
          tone({ freq: 520, endFreq: 680, dur: 0.22, type: "sawtooth", gain: 0.06, delay: i * 0.36 });
          tone({ freq: 680, endFreq: 520, dur: 0.22, type: "sawtooth", gain: 0.06, delay: i * 0.36 + 0.18 });
        }
        break;
      case "ach":
        [523, 659, 784, 1047].forEach((f, i) =>
          tone({ freq: f, dur: 0.14, type: "square", gain: 0.045, delay: i * 0.09 })
        );
        break;
      case "weather":
        tone({ freq: 240, endFreq: 1600, dur: 0.7, type: "sawtooth", gain: 0.05 });
        noise(0.8, 0.07, 0.1, 2500);
        break;
      case "moon":
        [220, 330, 440].forEach((f, i) =>
          tone({ freq: f, dur: 0.16, type: "triangle", gain: 0.05, delay: i * 0.12 })
        );
        noise(0.5, 0.05, 0.1, 1400);
        break;
    }
  },
};
