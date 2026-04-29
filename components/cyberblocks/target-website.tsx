"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { Heart, Lock, AlertTriangle } from "lucide-react";
import type { Scenario, TargetEvent } from "@/types";

/* ============================================================
   TARGET WEBSITE
   Mocked hospital patient portal. As the attack progresses, the
   page glitches, then on encrypt it locks down with ransom note.
   ============================================================ */

interface Props {
  scenario: Scenario;
}

export function TargetWebsite({ scenario }: Props) {
  const lastResult = useGameStore((s) => s.lastResult);
  const currentStep = useGameStore((s) => s.currentStep);
  const status = useGameStore((s) => s.status);

  // Determine current target event
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

  // Compromise level (0-3 based on event)
  const compromiseLevel =
    event.type === "compromise"
      ? event.level
      : event.type === "encrypt"
        ? 3
        : 0;

  const isEncrypted = event.type === "encrypt";

  return (
    <div className="relative h-full bg-obsidian-3 overflow-hidden flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 h-8 border-b border-obsidian-line bg-obsidian-2 shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-crimson/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-hpe/70" />
        </div>
        <div className="flex-1 mx-3 h-5 bg-obsidian rounded text-[10px] font-mono text-fg-dim flex items-center px-2 truncate">
          🔒 https://{scenario.targetMeta.subtitle}
        </div>
      </div>

      {/* Site body */}
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          animate={{
            filter:
              compromiseLevel === 1
                ? "hue-rotate(15deg) saturate(0.9)"
                : compromiseLevel === 2
                  ? "hue-rotate(40deg) saturate(0.7) brightness(0.85)"
                  : compromiseLevel === 3
                    ? "hue-rotate(0deg) saturate(0.3) brightness(0.4)"
                    : "none",
          }}
          transition={{ duration: 0.6 }}
          className="h-full"
        >
          <FakeHospitalSite />
        </motion.div>

        {/* Glitch overlay */}
        {compromiseLevel >= 1 && !isEncrypted && (
          <GlitchOverlay intensity={compromiseLevel} />
        )}

        {/* Ransom note overlay */}
        <AnimatePresence>
          {isEncrypted && <RansomOverlay />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Fake Hospital Site — looks legit, gets encrypted
   ------------------------------------------------------------ */
function FakeHospitalSite() {
  return (
    <div className="bg-white text-slate-800 h-full overflow-y-auto">
      {/* Top bar */}
      <div className="bg-blue-700 text-white px-5 py-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <Heart size={12} fill="currentColor" />
          <span className="font-semibold">Mercy General Hospital</span>
        </div>
        <span>24/7 Patient Portal</span>
      </div>

      {/* Hero */}
      <div className="px-5 py-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">
          Welcome back, Sarah
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Last login: 2 hours ago · 3 unread messages from your care team
        </p>
      </div>

      {/* Tile grid */}
      <div className="p-5 grid grid-cols-2 gap-3">
        <Tile title="Upcoming Appointments" body="Dr. Patel · Apr 24 · 2pm" color="bg-blue-50" />
        <Tile title="Lab Results" body="3 new — last week" color="bg-emerald-50" />
        <Tile title="Prescriptions" body="2 active · 1 needs refill" color="bg-amber-50" />
        <Tile title="Billing" body="$0.00 due · all clear" color="bg-rose-50" />
      </div>

      {/* Records section */}
      <div className="px-5 pb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Recent Records
        </h3>
        <div className="space-y-1.5">
          <RecordRow date="Apr 18" title="Annual physical exam — Dr. Reyes" />
          <RecordRow date="Mar 02" title="Blood panel results" />
          <RecordRow date="Feb 14" title="MRI · cervical spine" />
          <RecordRow date="Jan 22" title="Lipid + thyroid screening" />
        </div>
      </div>

      <div className="px-5 pb-5 text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
        © Mercy General · HIPAA compliant · Patient data encrypted at rest
      </div>
    </div>
  );
}

function Tile({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded p-3 border border-slate-200`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {title}
      </div>
      <div className="text-xs text-slate-700 mt-1">{body}</div>
    </div>
  );
}

function RecordRow({ date, title }: { date: string; title: string }) {
  return (
    <div className="flex items-center justify-between text-xs border-b border-slate-100 py-1.5">
      <span className="text-slate-400 font-mono w-16">{date}</span>
      <span className="flex-1 text-slate-700">{title}</span>
      <span className="text-blue-600 font-medium">View</span>
    </div>
  );
}

function GlitchOverlay({ intensity }: { intensity: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        background: `repeating-linear-gradient(0deg, transparent 0, transparent ${
          6 - intensity
        }px, rgba(255,0,60,${0.05 * intensity}) ${6 - intensity}px, rgba(255,0,60,${
          0.05 * intensity
        }) ${7 - intensity}px)`,
      }}
    />
  );
}

function RansomOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-black/85 backdrop-blur-sm grid place-items-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md"
      >
        <Lock
          size={56}
          className="mx-auto text-crimson mb-4"
          strokeWidth={1.5}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-crimson mb-2">
          ◆ all files encrypted
        </div>
        <h3 className="font-display text-2xl font-bold text-fg mb-3">
          YOUR PATIENT RECORDS HAVE BEEN ENCRYPTED
        </h3>
        <p className="text-sm text-fg-muted leading-relaxed">
          14,231 documents — patient histories, prescriptions, lab results, and
          billing records — locked with AES-256.
        </p>
        <div className="mt-5 p-4 bg-crimson/10 border border-crimson/40 rounded text-left">
          <div className="font-mono text-[10px] uppercase tracking-wider text-crimson mb-2 flex items-center gap-2">
            <AlertTriangle size={12} /> README_DECRYPT.txt
          </div>
          <p className="font-mono text-[11px] text-fg leading-relaxed">
            Pay 50 BTC within 72 hours. Otherwise everything goes to{" "}
            <span className="text-crimson">darknet auction</span>.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
