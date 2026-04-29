"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { Server, AlertTriangle, ShieldX } from "lucide-react";
import type { Scenario, TargetEvent } from "@/types";

/* ============================================================
   TARGET FIRMWARE
   2,847 servers in a vendor's update fleet. As the chain runs,
   they progressively get the malicious firmware. Final state:
   wholesale supply chain compromise.
   ============================================================ */

interface Props {
  scenario: Scenario;
}

const TOTAL_SERVERS = 96; // 12 × 8 grid — visually represents 2,847

export function TargetFirmware({ scenario }: Props) {
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

  const compromiseLevel: 0 | 1 | 2 | 3 =
    event.type === "compromise"
      ? event.level
      : event.type === "swap-firmware"
        ? 3
        : 0;

  const isFirmwareSwapped = event.type === "swap-firmware";

  // How many servers turn red?
  const compromisedCount = isFirmwareSwapped
    ? TOTAL_SERVERS
    : Math.floor((compromiseLevel / 3) * 6); // gradual mid-attack

  return (
    <div className="relative h-full bg-obsidian-3 overflow-hidden flex flex-col">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-obsidian-line bg-obsidian-2 shrink-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan flex items-center gap-2">
          <Server size={12} />
          {scenario.targetMeta.title}
        </div>
        <div className="font-mono text-[10px] text-fg-dim">
          {scenario.targetMeta.subtitle}
        </div>
      </div>

      <div className="relative flex-1 p-5 flex flex-col gap-4 overflow-hidden">
        {/* Top stat */}
        <div className="grid grid-cols-3 gap-3">
          <Stat
            label="Fleet Size"
            value="2,847"
            unit="servers"
          />
          <Stat
            label="Firmware"
            value={isFirmwareSwapped ? "v4.22-x" : "v4.21"}
            unit={isFirmwareSwapped ? "trojanized" : "legit"}
            danger={isFirmwareSwapped}
          />
          <Stat
            label="Compromised"
            value={
              isFirmwareSwapped
                ? "100%"
                : `${Math.round((compromisedCount / TOTAL_SERVERS) * 100)}%`
            }
            unit="rolling out"
            danger={compromiseLevel > 0}
          />
        </div>

        {/* Server grid */}
        <div className="flex-1 bg-obsidian-2 border border-obsidian-line rounded-md p-3 overflow-hidden">
          <div className="font-mono text-[9px] uppercase tracking-widest text-fg-muted mb-2 flex items-center justify-between">
            <span>Fleet · live status</span>
            <span>showing 96 of 2,847</span>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: TOTAL_SERVERS }).map((_, i) => {
              const isCompromised = i < compromisedCount;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    backgroundColor: isCompromised
                      ? "rgba(255, 0, 60, 0.7)"
                      : "rgba(1, 169, 130, 0.5)",
                    boxShadow: isCompromised
                      ? "0 0 8px rgba(255, 0, 60, 0.5)"
                      : "none",
                  }}
                  transition={{
                    duration: 0.4,
                    delay: isCompromised ? (i * 0.008) % 0.6 : 0,
                  }}
                  className="aspect-square rounded-sm"
                />
              );
            })}
          </div>
        </div>

        {/* Update channel feed */}
        <div className="bg-obsidian-2 border border-obsidian-line rounded-md p-3 max-h-32 overflow-hidden font-mono text-[10px]">
          <div className="text-fg-muted uppercase tracking-widest text-[9px] mb-2">
            update.vendorco.io · feed
          </div>
          <FeedLines isFirmwareSwapped={isFirmwareSwapped} compromiseLevel={compromiseLevel} />
        </div>

        {/* Final overlay — supply chain compromised */}
        <AnimatePresence>
          {isFirmwareSwapped && <SupplyChainOverlay />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  danger,
}: {
  label: string;
  value: string;
  unit: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`bg-obsidian-2 border rounded-md p-3 ${
        danger ? "border-crimson/40" : "border-obsidian-line"
      }`}
    >
      <div className="font-mono text-[9px] uppercase tracking-widest text-fg-muted">
        {label}
      </div>
      <div
        className={`font-display text-xl font-bold ${
          danger ? "text-crimson" : "text-fg"
        }`}
      >
        {value}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-fg-dim">
        {unit}
      </div>
    </div>
  );
}

function FeedLines({
  isFirmwareSwapped,
  compromiseLevel,
}: {
  isFirmwareSwapped: boolean;
  compromiseLevel: number;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-fg-dim">[2026-04-28 04:12] auto-rollout: scheduled</div>
      <div className="text-fg-muted">[2026-04-28 04:14] manifest signed</div>
      {compromiseLevel >= 1 && (
        <div className="text-amber">[2026-04-28 04:15] anomaly: signature timing +6ms</div>
      )}
      {compromiseLevel >= 2 && (
        <div className="text-amber">[2026-04-28 04:16] checksum mismatch · IGNORED</div>
      )}
      {isFirmwareSwapped && (
        <>
          <div className="text-crimson">[2026-04-28 04:17] PUSH · 2,847 hosts</div>
          <div className="text-crimson">[2026-04-28 04:18] CONFIRMED · 100% delivery</div>
        </>
      )}
    </div>
  );
}

function SupplyChainOverlay() {
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
        <ShieldX
          size={56}
          className="mx-auto text-crimson mb-4"
          strokeWidth={1.5}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-crimson mb-2">
          ◆ supply chain owned
        </div>
        <h3 className="font-display text-2xl font-bold text-fg mb-3">
          2,847 SERVERS RUNNING TROJANIZED FIRMWARE
        </h3>
        <p className="text-sm text-fg-muted leading-relaxed">
          Every customer of VendorCo just received an update — perfectly signed,
          mathematically valid, and backdoored.
        </p>
        <div className="mt-5 p-4 bg-amber/10 border border-amber/40 rounded text-left">
          <div className="font-mono text-[10px] uppercase tracking-wider text-amber mb-2 flex items-center gap-2">
            <AlertTriangle size={12} /> Solar Winds × XZ Utils energy
          </div>
          <p className="font-mono text-[11px] text-fg leading-relaxed">
            HPE Gen12 stops this with LMS hash-based firmware signing — keys
            stored in the iLO7 enclave, never extractable as a .pem file.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
