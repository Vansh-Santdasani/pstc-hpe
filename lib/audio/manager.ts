/* ============================================================
   AUDIO MANAGER
   Pure Web Audio API — no audio files needed. All sounds
   synthesized on demand. Single shared AudioContext. SSR-safe.
   ============================================================ */

class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private sirenStop: (() => void) | null = null;

  /** Lazy-init the AudioContext (must happen on user gesture in some browsers). */
  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stopSiren();
  }

  /** Quick UI click. */
  click() {
    if (!this.enabled) return;
    this.tone({ freq: 880, type: "sine", duration: 0.04, gain: 0.06 });
  }

  /** Block snap into chain. */
  snap() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.toneAt(ctx, now, { freq: 320, type: "square", duration: 0.05, gain: 0.08 });
    this.toneAt(ctx, now + 0.05, { freq: 180, type: "square", duration: 0.06, gain: 0.06 });
  }

  /** Soft tick for terminal lines / typing. */
  tick() {
    if (!this.enabled) return;
    this.tone({ freq: 1200, type: "sine", duration: 0.015, gain: 0.02 });
  }

  /** Successful execution — ascending arpeggio. */
  success() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.toneAt(ctx, now + i * 0.08, {
        freq: f,
        type: "triangle",
        duration: 0.18,
        gain: 0.12,
      });
    });
  }

  /** Single failure beep. */
  failBeep() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.toneAt(ctx, now, { freq: 220, type: "square", duration: 0.16, gain: 0.12 });
    this.toneAt(ctx, now + 0.18, { freq: 165, type: "square", duration: 0.22, gain: 0.12 });
  }

  /** Continuous siren until stopSiren() is called. */
  startSiren() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    this.stopSiren();

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 600;

    lfo.type = "sine";
    lfo.frequency.value = 4; // 4 Hz wail
    lfoGain.gain.value = 250;

    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(gain).connect(ctx.destination);

    gain.gain.value = 0.08; // keep it bearable

    osc.start();
    lfo.start();

    this.sirenStop = () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      setTimeout(() => {
        try {
          osc.stop();
          lfo.stop();
        } catch {
          /* already stopped */
        }
      }, 150);
    };
  }

  stopSiren() {
    if (this.sirenStop) {
      this.sirenStop();
      this.sirenStop = null;
    }
  }

  /** ----- internal helpers ----- */
  private tone(opts: { freq: number; type: OscillatorType; duration: number; gain: number }) {
    const ctx = this.getCtx();
    if (!ctx) return;
    this.toneAt(ctx, ctx.currentTime, opts);
  }

  private toneAt(
    ctx: AudioContext,
    when: number,
    opts: { freq: number; type: OscillatorType; duration: number; gain: number }
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.value = opts.freq;

    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(opts.gain, when + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + opts.duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + opts.duration + 0.02);
  }
}

export const audio = new AudioManager();
