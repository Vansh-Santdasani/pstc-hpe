"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  ChevronLeft,
  Cpu,
  Shield,
  Lock,
  HardDrive,
  Wifi,
  AlertTriangle,
  Check,
} from "lucide-react";
import { audio } from "@/lib/audio/manager";

/* ============================================================
   GEN11 vs GEN12 COMPARISON PAGE
   Cinematic auto-play. Hit play, watch a harvest-now-decrypt-later
   attack run on both server fleets simultaneously. Gen11 falls,
   Gen12 holds. Replay anytime.
   ============================================================ */

interface Stage {
  /** Time (ms) into the cinematic at which this stage begins. */
  at: number;
  /** Top-level callout text */
  callout: string;
  /** Detailed sub-text */
  detail: string;
  /** Tint for the callout */
  tone: "info" | "amber" | "crimson" | "hpe";
  /** Year shown on the timeline */
  year: string;
  /** State of each rack at this stage */
  gen11: RackState;
  gen12: RackState;
}

interface RackState {
  /** 0 = healthy, 1..5 = progressively compromised */
  rotMicro: number;
  /** Component-specific status (0 = ok, 1 = warning, 2 = breached) */
  components: {
    cpu: 0 | 1 | 2;
    enclave: 0 | 1 | 2;
    firmware: 0 | 1 | 2;
    storage: 0 | 1 | 2;
    network: 0 | 1 | 2;
  };
  /** Banner message (optional) */
  banner?: string;
  bannerTone?: "ok" | "warn" | "fail";
}

const HEALTHY: RackState = {
  rotMicro: 0,
  components: { cpu: 0, enclave: 0, firmware: 0, storage: 0, network: 0 },
};

const STAGES: Stage[] = [
  {
    at: 0,
    callout: "Two fleets · same attack",
    detail:
      "Both racks running. Both encrypting traffic with TLS. Both look secure today. Watch what happens when 2030 arrives.",
    tone: "info",
    year: "2025",
    gen11: HEALTHY,
    gen12: HEALTHY,
  },
  {
    at: 1500,
    callout: "Adversary taps the backbone",
    detail:
      "A state-level actor records every TLS handshake to and from both fleets. They can't read it yet — but they don't need to.",
    tone: "amber",
    year: "2025–2026",
    gen11: {
      ...HEALTHY,
      components: { ...HEALTHY.components, network: 1 },
    },
    gen12: {
      ...HEALTHY,
      components: { ...HEALTHY.components, network: 1 },
    },
  },
  {
    at: 4500,
    callout: "Time skip · 2025 → 2030",
    detail:
      "Five years of handshakes harvested into cold storage. Patience is the only weapon the attacker needed.",
    tone: "amber",
    year: "2026 → 2030",
    gen11: {
      ...HEALTHY,
      components: { ...HEALTHY.components, network: 1 },
    },
    gen12: {
      ...HEALTHY,
      components: { ...HEALTHY.components, network: 1 },
    },
  },
  {
    at: 7500,
    callout: "CRQC online · Shor's algorithm runs",
    detail:
      "A cryptographically relevant quantum computer comes online. Shor's algorithm factors RSA-2048 in polynomial time. The attacker queues every harvested handshake.",
    tone: "crimson",
    year: "2030",
    gen11: {
      rotMicro: 2,
      components: { cpu: 1, enclave: 1, firmware: 1, storage: 1, network: 2 },
      banner: "RSA-2048 falls",
      bannerTone: "warn",
    },
    gen12: {
      rotMicro: 0,
      components: { cpu: 0, enclave: 0, firmware: 0, storage: 0, network: 1 },
      banner: "Kyber holds · lattice problem unbroken",
      bannerTone: "ok",
    },
  },
  {
    at: 10500,
    callout: "Gen11 — every secret unsealed",
    detail:
      "RSA-2048 KEX broken. Session keys recovered. Five years of email, M&A, HR, source code — readable. Firmware signing keys (RSA-3072) also factored, so persistence on the server itself is trivial.",
    tone: "crimson",
    year: "2030",
    gen11: {
      rotMicro: 5,
      components: { cpu: 2, enclave: 2, firmware: 2, storage: 2, network: 2 },
      banner: "VAULT OPENED · historical privacy gone",
      bannerTone: "fail",
    },
    gen12: {
      rotMicro: 0,
      components: { cpu: 0, enclave: 0, firmware: 0, storage: 0, network: 1 },
      banner: "Kyber holds · lattice problem unbroken",
      bannerTone: "ok",
    },
  },
  {
    at: 13500,
    callout: "Gen12 — quantum-safe by default",
    detail:
      "iLO7 ships CRYSTALS-Kyber for KEX. Firmware signing uses LMS (hash-based, no quantum attack known). Keys live in a FIPS 140-3 Level 3 enclave — never extractable as a .pem file. Same attack, completely different outcome.",
    tone: "hpe",
    year: "2030",
    gen11: {
      rotMicro: 5,
      components: { cpu: 2, enclave: 2, firmware: 2, storage: 2, network: 2 },
      banner: "VAULT OPENED · historical privacy gone",
      bannerTone: "fail",
    },
    gen12: {
      rotMicro: 0,
      components: { cpu: 0, enclave: 0, firmware: 0, storage: 0, network: 0 },
      banner: "ATTACK REPELLED · post-quantum safe",
      bannerTone: "ok",
    },
  },
];

const TOTAL_DURATION = 16000; // ms — slightly past last stage

/* ============================================================ */
export default function ComparisonPage() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [t, setT] = useState(0); // current ms into cinematic
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const start = useCallback(() => {
    audio.click();
    setPhase("playing");
    setT(0);
    startRef.current = performance.now();
    audio.startSiren();
    setTimeout(() => audio.stopSiren(), 1500); // brief alarm at start

    const loop = (now: number) => {
      const elapsed = now - startRef.current;
      setT(elapsed);
      if (elapsed >= TOTAL_DURATION) {
        setPhase("done");
        audio.success();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const replay = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audio.stopSiren();
    setPhase("idle");
    setT(0);
    setTimeout(start, 100);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.stopSiren();
    };
  }, []);

  // Find the current stage based on t
  const currentStage = findCurrentStage(t);

  return (
    <div className="min-h-screen bg-obsidian text-fg">
      {/* Header */}
      <header className="sticky top-0 z-20 h-14 border-b border-obsidian-line bg-obsidian/90 backdrop-blur flex items-center px-4 gap-3">
        <Link
          href="/cyberblocks"
          className="flex items-center gap-2 text-fg-muted hover:text-hpe-bright transition"
        >
          <ChevronLeft size={16} />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Back to Sim
          </span>
        </Link>
        <div className="h-6 w-px bg-obsidian-line" />
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted">
          Comparison
        </div>
        <div className="font-display font-semibold text-sm text-fg">
          Gen11 vs Gen12 · The same attack, two outcomes
        </div>
        <div className="flex-1" />
        {phase === "done" && (
          <button
            onClick={replay}
            className="inline-flex items-center gap-2 px-3 h-8 rounded border border-obsidian-line text-fg-muted hover:border-hpe hover:text-hpe-bright transition font-mono text-xs uppercase tracking-wider"
          >
            <RotateCcw size={12} />
            Replay
          </button>
        )}
      </header>

      {/* Main cinematic area */}
      <div className="relative px-4 py-6 md:px-8 md:py-10 max-w-7xl mx-auto">
        {/* Top callout */}
        <div className="mb-8 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage?.callout ?? "idle"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-3xl mx-auto"
            >
              {phase === "idle" ? (
                <>
                  <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe mb-3">
                    Cinematic · 16 seconds
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-fg leading-tight">
                    Two HPE generations.
                    <br />
                    <span className="text-hpe italic">One quantum future.</span>
                  </h1>
                  <p className="mt-4 text-fg-muted leading-relaxed">
                    Press play. Watch the same harvest-now-decrypt-later attack
                    hit a Gen11 fleet and a Gen12 fleet at the same time.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className={`font-mono text-[10px] uppercase tracking-[0.4em] mb-2 ${
                      currentStage?.tone === "crimson"
                        ? "text-crimson"
                        : currentStage?.tone === "amber"
                          ? "text-amber"
                          : currentStage?.tone === "hpe"
                            ? "text-hpe-bright"
                            : "text-fg-muted"
                    }`}
                  >
                    [year {currentStage?.year}]
                  </div>
                  <h2 className="font-display text-2xl md:text-4xl font-bold text-fg leading-tight">
                    {currentStage?.callout}
                  </h2>
                  <p className="mt-3 text-fg-muted leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                    {currentStage?.detail}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Play button OR dual rack view */}
        {phase === "idle" ? (
          <div className="flex justify-center my-12">
            <button
              onClick={start}
              className="group relative w-32 h-32 rounded-full bg-hpe text-obsidian grid place-items-center hover:bg-hpe-bright transition-all shadow-[0_0_60px_var(--color-hpe-glow)] hover:shadow-[0_0_100px_var(--color-hpe-glow)]"
            >
              <Play size={48} fill="currentColor" className="ml-2" />
              <span className="absolute inset-0 rounded-full border-2 border-hpe-bright animate-ping opacity-30" />
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Rack
              label="Gen11 (legacy)"
              subtitle="RSA-2048 KEX · RSA-3072 firmware sig"
              state={currentStage?.gen11 ?? HEALTHY}
              isLegacy
            />
            <Rack
              label="Gen12 (quantum-safe)"
              subtitle="CRYSTALS-Kyber · LMS firmware · iLO7 enclave"
              state={currentStage?.gen12 ?? HEALTHY}
            />
          </div>
        )}

        {/* Timeline scrubber */}
        {phase !== "idle" && (
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="relative h-1 bg-obsidian-2 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min(100, (t / TOTAL_DURATION) * 100)}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-hpe via-amber to-crimson"
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-widest text-fg-dim">
              <span>2025</span>
              <span>2026</span>
              <span>2028</span>
              <span>2030 — CRQC</span>
            </div>
          </div>
        )}

        {/* Done — final summary card */}
        {phase === "done" && <FinalSummary onReplay={replay} />}
      </div>
    </div>
  );
}

/* ============================================================
   RACK component — visual server rack with 5 components
   ============================================================ */
function Rack({
  label,
  subtitle,
  state,
  isLegacy,
}: {
  label: string;
  subtitle: string;
  state: RackState;
  isLegacy?: boolean;
}) {
  const compromiseLevel = state.rotMicro;
  const isCompromised = compromiseLevel >= 4;

  return (
    <motion.div
      className={`relative bg-obsidian-2 border-2 rounded-lg overflow-hidden transition-colors duration-700 ${
        isCompromised
          ? "border-crimson glow-crimson"
          : state.banner && !isLegacy
            ? "border-hpe glow-hpe"
            : "border-obsidian-line"
      }`}
      animate={{
        x: compromiseLevel >= 3 ? [0, -1, 1, -1, 0] : 0,
      }}
      transition={{
        x: { duration: 0.2, repeat: Infinity, repeatDelay: 0.3 },
      }}
    >
      {/* Header */}
      <div
        className={`px-5 py-3 border-b ${
          isCompromised ? "border-crimson/40 bg-crimson/10" : "border-obsidian-line"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
                isLegacy ? "text-amber" : "text-hpe"
              }`}
            >
              ◆ {label}
            </div>
            <div className="font-mono text-[10px] text-fg-muted mt-0.5 truncate">
              {subtitle}
            </div>
          </div>
          {state.banner && (
            <BannerPill tone={state.bannerTone ?? "warn"} text={state.banner} />
          )}
        </div>
      </div>

      {/* Components stack */}
      <div className="p-5 space-y-2">
        <Component
          icon={Cpu}
          label="Silicon Root of Trust"
          spec={isLegacy ? "Static CRTM" : "PQ-anchored CRTM + LMS"}
          status={state.components.cpu}
        />
        <Component
          icon={Shield}
          label={isLegacy ? "iLO6 Enclave" : "iLO7 Secure Enclave"}
          spec={isLegacy ? "FIPS 140-2 L2" : "FIPS 140-3 L3 · key in HW"}
          status={state.components.enclave}
        />
        <Component
          icon={Lock}
          label="Firmware Signing"
          spec={isLegacy ? "RSA-3072 (factorable)" : "LMS hash-based (PQ-safe)"}
          status={state.components.firmware}
        />
        <Component
          icon={HardDrive}
          label="Self-Encrypting Drives"
          spec={isLegacy ? "Local key cache" : "iLO7-mediated KMIP · OBSE"}
          status={state.components.storage}
        />
        <Component
          icon={Wifi}
          label="Network KEX"
          spec={isLegacy ? "TLS 1.2 · RSA-2048 KEX" : "TLS 1.3 · CRYSTALS-Kyber"}
          status={state.components.network}
        />
      </div>

      {/* Compromise overlay (Gen11 only at full breach) */}
      <AnimatePresence>
        {isCompromised && isLegacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,0,60,0) 0%, rgba(255,0,60,0.1) 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Glitch overlay for mid-compromise */}
      {compromiseLevel >= 2 && compromiseLevel < 5 && isLegacy && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: `repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(255,0,60,${
              0.04 * compromiseLevel
            }) 4px, rgba(255,0,60,${0.04 * compromiseLevel}) 5px)`,
          }}
        />
      )}
    </motion.div>
  );
}

function Component({
  icon: Icon,
  label,
  spec,
  status,
}: {
  icon: React.ElementType;
  label: string;
  spec: string;
  status: 0 | 1 | 2;
}) {
  const colorMap = {
    0: { bg: "bg-hpe/10", border: "border-hpe/30", text: "text-hpe", icon: "text-hpe" },
    1: {
      bg: "bg-amber/10",
      border: "border-amber/40",
      text: "text-amber",
      icon: "text-amber",
    },
    2: {
      bg: "bg-crimson/15",
      border: "border-crimson/50",
      text: "text-crimson",
      icon: "text-crimson",
    },
  };
  const c = colorMap[status];

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-md border transition-colors duration-500 ${c.bg} ${c.border}`}
      animate={{
        scale: status === 2 ? [1, 1.02, 1] : 1,
      }}
      transition={{
        scale: { duration: 0.5, repeat: status === 2 ? Infinity : 0 },
      }}
    >
      <Icon size={18} className={c.icon} strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <div className={`font-display font-semibold text-sm ${c.text} truncate`}>
          {label}
        </div>
        <div className="font-mono text-[10px] text-fg-muted truncate">{spec}</div>
      </div>
      <StatusIcon status={status} />
    </motion.div>
  );
}

function StatusIcon({ status }: { status: 0 | 1 | 2 }) {
  if (status === 0)
    return (
      <div className="w-6 h-6 rounded-full bg-hpe/20 grid place-items-center">
        <Check size={12} className="text-hpe" strokeWidth={3} />
      </div>
    );
  if (status === 1)
    return (
      <div className="w-6 h-6 rounded-full bg-amber/20 grid place-items-center animate-pulse">
        <AlertTriangle size={11} className="text-amber" strokeWidth={2.5} />
      </div>
    );
  return (
    <div className="w-6 h-6 rounded-full bg-crimson/20 grid place-items-center">
      <AlertTriangle size={11} className="text-crimson" strokeWidth={2.5} />
    </div>
  );
}

function BannerPill({ tone, text }: { tone: "ok" | "warn" | "fail"; text: string }) {
  const cls =
    tone === "ok"
      ? "bg-hpe/15 text-hpe border-hpe/40"
      : tone === "warn"
        ? "bg-amber/15 text-amber border-amber/40"
        : "bg-crimson/15 text-crimson border-crimson/40";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-2.5 py-1 rounded border font-mono text-[9px] uppercase tracking-wider ${cls}`}
    >
      {text}
    </motion.div>
  );
}

/* ============================================================
   FINAL SUMMARY (post-cinematic)
   ============================================================ */
function FinalSummary({ onReplay }: { onReplay: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mt-12 max-w-4xl mx-auto bg-obsidian-2 border border-hpe/30 rounded-lg p-6 md:p-10"
    >
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-2">
            ◆ Gen11 outcome
          </div>
          <h3 className="font-display text-xl font-bold text-fg mb-3">
            Historical privacy: gone
          </h3>
          <ul className="space-y-1.5 text-sm text-fg-muted">
            <li>· 5 years of TLS handshakes — decrypted</li>
            <li>· RSA-3072 firmware signing key — factored</li>
            <li>· iLO6 enclave keys — extractable</li>
            <li>· No PQ-safe migration path baked in</li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-hpe-bright mb-2">
            ◆ Gen12 outcome
          </div>
          <h3 className="font-display text-xl font-bold text-fg mb-3">
            Quantum-safe by default
          </h3>
          <ul className="space-y-1.5 text-sm text-fg-muted">
            <li>· CRYSTALS-Kyber (ML-KEM) for key exchange</li>
            <li>· LMS hash-based firmware signatures</li>
            <li>· iLO7 enclave (FIPS 140-3 L3) — keys never leave HW</li>
            <li>· Hybrid mode for transitional safety</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-obsidian-line/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted text-center sm:text-left">
          The threat is harvest-now-decrypt-later. The answer is post-quantum hardware.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-obsidian-line text-fg-muted hover:border-hpe hover:text-hpe-bright transition font-mono text-xs uppercase tracking-wider"
          >
            <RotateCcw size={12} />
            Replay
          </button>
          <Link
            href="/cyberblocks"
            className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-hpe text-obsidian font-mono text-xs uppercase tracking-wider font-bold hover:bg-hpe-bright transition"
          >
            Try the Sim
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
function findCurrentStage(t: number): Stage | null {
  // Find the latest stage whose `at` ≤ t
  let current: Stage | null = null;
  for (const s of STAGES) {
    if (t >= s.at) current = s;
    else break;
  }
  return current ?? STAGES[0];
}
