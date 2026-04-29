"use client";

import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SCENARIOS } from "@/lib/scenarios";
import { useGameStore } from "@/lib/store/game-store";
import { audio } from "@/lib/audio/manager";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ScenarioSelector({ open, onClose }: Props) {
  const scenarioId = useGameStore((s) => s.scenarioId);
  const setScenario = useGameStore((s) => s.setScenario);
  const bestScores = useGameStore((s) => s.bestScores);

  const handlePick = (id: string) => {
    audio.click();
    setScenario(id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Choose a Scenario" size="lg">
      <div className="p-6">
        <p className="text-fg-muted text-sm leading-relaxed mb-6">
          Each scenario teaches a different attack pattern. Beginner is the
          textbook ransomware kill chain. Advanced is the threat model that NIST
          spent eight years racing against.
        </p>

        <div className="space-y-3">
          {SCENARIOS.map((s, i) => {
            const isCurrent = s.id === scenarioId;
            const best = bestScores[s.id] ?? 0;
            const completed = best > 0;
            return (
              <button
                key={s.id}
                onClick={() => handlePick(s.id)}
                className={cn(
                  "w-full text-left bg-obsidian-3 border rounded-lg p-5 transition-all",
                  "hover:-translate-y-0.5 hover:bg-obsidian-2",
                  isCurrent
                    ? "border-hpe glow-hpe"
                    : "border-obsidian-line hover:border-fg-muted"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-fg-dim">
                        Scenario {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                          s.difficulty === "Beginner" && "bg-hpe/15 text-hpe",
                          s.difficulty === "Intermediate" &&
                            "bg-amber/15 text-amber",
                          s.difficulty === "Advanced" &&
                            "bg-crimson/15 text-crimson"
                        )}
                      >
                        {s.difficulty}
                      </span>
                      {isCurrent && (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-hpe-bright">
                          ◆ Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold text-fg leading-tight mb-1.5">
                      {s.name}
                    </h3>
                    <p className="text-sm text-fg-muted leading-relaxed">
                      {s.briefing}
                    </p>
                  </div>

                  {/* Score chip */}
                  <div className="shrink-0 text-right">
                    {completed ? (
                      <>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                          Best
                        </div>
                        <div className="font-display font-bold text-2xl text-hpe">
                          {best}
                        </div>
                        <div className="font-mono text-[9px] text-fg-dim">
                          / 100
                        </div>
                      </>
                    ) : (
                      <Lock size={20} className="text-fg-dim" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-fg-dim">
          Switching scenarios resets your current chain
        </p>
      </div>
    </Modal>
  );
}
