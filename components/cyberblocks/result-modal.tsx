"use client";

import { motion } from "framer-motion";
import { Trophy, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/game-store";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import { calculateScore } from "@/lib/engine/attack-engine";
import { audio } from "@/lib/audio/manager";

interface Props {
  open: boolean;
}

export function ResultModal({ open }: Props) {
  const scenarioId = useGameStore((s) => s.scenarioId);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const failedAttempts = useGameStore((s) => s.failedAttempts);
  const setScenario = useGameStore((s) => s.setScenario);
  const hardReset = useGameStore((s) => s.hardReset);

  const scenario = getScenario(scenarioId);
  const score = calculateScore({ hintsUsed, failedAttempts });

  // Find next scenario (if any)
  const currentIdx = SCENARIOS.findIndex((s) => s.id === scenarioId);
  const nextScenario =
    currentIdx >= 0 && currentIdx < SCENARIOS.length - 1
      ? SCENARIOS[currentIdx + 1]
      : null;

  const handleReplay = () => {
    audio.click();
    hardReset();
  };

  const handleNext = () => {
    if (!nextScenario) return;
    audio.click();
    setScenario(nextScenario.id);
  };

  return (
    <Modal open={open} dismissable={false} title="Attack Successful" size="lg">
      <div className="p-6 md:p-8">
        {/* Trophy + score */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 14,
              delay: 0.1,
            }}
            className="mx-auto w-20 h-20 rounded-full bg-hpe/15 border-2 border-hpe grid place-items-center mb-4 glow-hpe"
          >
            <Trophy size={36} className="text-hpe" />
          </motion.div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-hpe-bright mb-1">
            ◆ chain executed clean
          </div>
          <h2 className="font-display text-3xl font-bold text-fg mb-2">
            {scenario.name} — defeated
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <ScoreChip label="Score" value={`${score}/100`} accent="hpe" />
            <ScoreChip
              label="Hints"
              value={`${hintsUsed}/2`}
              accent={hintsUsed === 0 ? "hpe" : "amber"}
            />
            <ScoreChip
              label="Failed"
              value={String(failedAttempts)}
              accent={failedAttempts === 0 ? "hpe" : "amber"}
            />
          </div>
        </div>

        {/* Debrief */}
        <div className="space-y-4">
          <div className="bg-obsidian-3 border border-obsidian-line rounded-lg p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted mb-2">
              ▶ Attacker&apos;s Debrief
            </div>
            <p className="text-fg leading-relaxed">{scenario.debrief.summary}</p>
          </div>

          <div className="bg-hpe/5 border border-hpe/40 rounded-lg p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-hpe-bright mb-2 flex items-center gap-2">
              <ShieldCheck size={12} />
              Defender&apos;s Win Condition · HPE Gen12
            </div>
            <p className="text-fg leading-relaxed">
              {scenario.debrief.gen12Defense}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {nextScenario ? (
            <Button onClick={handleNext} className="flex-1" size="lg">
              Try Next: {nextScenario.name}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <div className="flex-1 text-center font-mono text-xs uppercase tracking-wider text-hpe-bright py-3">
              ◆ All scenarios complete · Total: {Object.values(useGameStore.getState().bestScores).reduce((a, b) => a + b, 0)}/300
            </div>
          )}
          <Button variant="secondary" onClick={handleReplay} size="lg">
            <RotateCcw size={14} />
            Replay
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ScoreChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "hpe" | "amber" | "crimson";
}) {
  const colorMap = {
    hpe: "border-hpe/40 text-hpe",
    amber: "border-amber/40 text-amber",
    crimson: "border-crimson/40 text-crimson",
  };
  return (
    <div className={`bg-obsidian-3 border rounded-md px-4 py-2 ${colorMap[accent]}`}>
      <div className="font-mono text-[9px] uppercase tracking-widest text-fg-muted">
        {label}
      </div>
      <div className="font-display font-bold text-lg">{value}</div>
    </div>
  );
}
