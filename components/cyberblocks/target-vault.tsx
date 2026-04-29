"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { Lock, Unlock, Wifi, Hourglass, Atom } from "lucide-react";
import type { Scenario, TargetEvent } from "@/types";

/* ============================================================
   TARGET VAULT
   For the Quantum Heist scenario. Visualizes:
   - TLS handshakes piling up in an "untouchable" archive
   - Years passing as we wait for a CRQC
   - Shor running and the vault flipping open
   ============================================================ */

interface Props {
  scenario: Scenario;
}

export function TargetVault({ scenario }: Props) {
  const lastResult = useGameStore((s) => s.lastResult);
  const currentStep = useGameStore((s) => s.currentStep);
  const status = useGameStore((s) => s.status);

  const currentEvent: TargetEvent =
    lastResult && currentStep >= 0 && currentStep < lastResult.steps.length
      ? lastResult.steps[currentStep].targetEvent ?? { type: "noop" }
      : { type: "noop" };

  const lastSuccessfulEvent =
    lastResult && status !== "executing"
      ? lastResult.steps
          .filter((s) => s.status === "success")
          .map((s) => s.targetEvent)
          .pop() ?? { type: "noop" }
      : currentEvent;

  const event = status === "executing" ? currentEvent : lastSuccessfulEvent;

  const showCapture = ["capture-traffic", "wait-quantum", "decrypt-vault", "open-vault"].includes(
    event.type
  );
  const showWait = ["wait-quantum", "decrypt-vault", "open-vault"].includes(event.type);
  const showDecrypt = ["decrypt-vault", "open-vault"].includes(event.type);
  const isOpen = event.type === "open-vault";

  return (
    <div className="relative h-full bg-obsidian-3 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 h-9 border-b border-obsidian-line bg-obsidian-2 shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-400 flex items-center gap-2">
          <Lock size={12} />
          {scenario.targetMeta.title}
        </div>
        <div className="font-mono text-[10px] text-fg-dim">
          {scenario.targetMeta.subtitle}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden p-5 flex flex-col gap-4">
        {/* Vault visual at top */}
        <div className="grid place-items-center min-h-[140px]">
          <VaultVisual isOpen={isOpen} showDecrypt={showDecrypt} />
        </div>

        {/* Stages */}
        <div className="grid grid-cols-3 gap-3">
          <Stage
            icon={Wifi}
            label="Capture"
            year="2025–2026"
            status={
              event.type === "capture-traffic"
                ? "active"
                : showCapture
                  ? "done"
                  : "idle"
            }
            detail="41.7 GB pcap collected"
          />
          <Stage
            icon={Hourglass}
            label="Wait"
            year="2026 → 2030"
            status={
              event.type === "wait-quantum"
                ? "active"
                : showWait
                  ? "done"
                  : "idle"
            }
            detail="Patience. CRQC online 2030."
          />
          <Stage
            icon={Atom}
            label="Decrypt"
            year="2030"
            status={
              event.type === "decrypt-vault"
                ? "active"
                : showDecrypt
                  ? "done"
                  : "idle"
            }
            detail="Shor's algorithm · polynomial time"
          />
        </div>

        {/* Year ticker */}
        <YearTicker stage={event.type} />

        {/* Final overlay */}
        <AnimatePresence>{isOpen && <VaultOpenedOverlay />}</AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Vault visual — shifts from locked to open
   ------------------------------------------------------------ */
function VaultVisual({
  isOpen,
  showDecrypt,
}: {
  isOpen: boolean;
  showDecrypt: boolean;
}) {
  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isOpen ? 1.1 : 1,
          rotate: showDecrypt && !isOpen ? [0, 2, -2, 0] : 0,
        }}
        transition={{
          rotate: { duration: 0.3, repeat: Infinity, repeatDelay: 0.4 },
          scale: { duration: 0.6 },
        }}
        className="relative w-32 h-32 grid place-items-center"
      >
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 ${
            isOpen ? "border-hpe" : "border-fuchsia-500/60"
          } transition-colors`}
        />
        {/* Inner ring */}
        <div
          className={`absolute inset-3 rounded-full border-2 ${
            isOpen ? "border-hpe-bright" : "border-fuchsia-500/40"
          } transition-colors`}
        />
        {/* Lock icon */}
        <motion.div
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock size={40} className="text-fuchsia-400" strokeWidth={1.5} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.5 }}
          transition={{ delay: isOpen ? 0.3 : 0, duration: 0.4 }}
          className="absolute"
        >
          <Unlock size={40} className="text-hpe-bright" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
      <div
        className={`mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] transition-colors ${
          isOpen ? "text-hpe-bright" : "text-fuchsia-400"
        }`}
      >
        {isOpen ? "[ vault opened ]" : "[ rsa-2048 sealed ]"}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Stage card
   ------------------------------------------------------------ */
function Stage({
  icon: Icon,
  label,
  year,
  status,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  year: string;
  status: "idle" | "active" | "done";
  detail: string;
}) {
  return (
    <div
      className={`bg-obsidian-2 border rounded-md p-3 transition-all ${
        status === "active"
          ? "border-amber animate-pulse"
          : status === "done"
            ? "border-hpe/40"
            : "border-obsidian-line"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon
          size={16}
          className={
            status === "active"
              ? "text-amber"
              : status === "done"
                ? "text-hpe"
                : "text-fg-muted"
          }
        />
        <span className="font-mono text-[9px] text-fg-dim">{year}</span>
      </div>
      <div
        className={`font-display font-semibold text-sm ${
          status === "idle" ? "text-fg-muted" : "text-fg"
        }`}
      >
        {label}
      </div>
      <div className="font-mono text-[9px] text-fg-muted mt-1 leading-tight">
        {detail}
      </div>
    </div>
  );
}

function YearTicker({ stage }: { stage: TargetEvent["type"] }) {
  const yearProgress =
    stage === "capture-traffic"
      ? 0.05
      : stage === "wait-quantum"
        ? 0.65
        : stage === "decrypt-vault" || stage === "open-vault"
          ? 1.0
          : 0;

  return (
    <div className="bg-obsidian-2 border border-obsidian-line rounded-md p-3">
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-fg-muted mb-2">
        <span>2025</span>
        <span>2027</span>
        <span>2029</span>
        <span className="text-fuchsia-400">2030 — CRQC</span>
      </div>
      <div className="relative h-1 bg-obsidian rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${yearProgress * 100}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-hpe via-amber to-fuchsia-500"
        />
      </div>
    </div>
  );
}

function VaultOpenedOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm grid place-items-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15 }}
        className="max-w-md"
      >
        <Unlock
          size={56}
          className="mx-auto text-hpe-bright mb-4"
          strokeWidth={1.5}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe-bright mb-2">
          ◆ historical privacy: gone
        </div>
        <h3 className="font-display text-2xl font-bold text-fg mb-3">
          5 YEARS OF ENCRYPTED TRAFFIC NOW PLAINTEXT
        </h3>
        <p className="text-sm text-fg-muted leading-relaxed">
          2.1M customer records · 18K API tokens · the entire HR database · M&A
          documents. All recorded in 2025. All readable in 2030.
        </p>
        <div className="mt-5 p-4 bg-fuchsia-500/10 border border-fuchsia-500/40 rounded text-left">
          <div className="font-mono text-[10px] uppercase tracking-wider text-fuchsia-400 mb-2">
            ▶ harvest-now-decrypt-later
          </div>
          <p className="font-mono text-[11px] text-fg leading-relaxed">
            HPE Gen12&apos;s iLO7 supports CRYSTALS-Kyber today. Lattice
            problems aren&apos;t solved by Shor. This vault stays sealed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
