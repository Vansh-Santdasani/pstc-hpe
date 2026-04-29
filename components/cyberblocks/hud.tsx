"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  HelpCircle,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  Heart,
  Trophy,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { useGameStore } from "@/lib/store/game-store";
import { audio } from "@/lib/audio/manager";
import { loadAudioEnabled, saveAudioEnabled } from "@/lib/storage/game-storage";
import { SCENARIOS } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface HudProps {
  onShowHint: (hint: string | null, remaining: number) => void;
  onShowHelp: () => void;
  onShowScenarioPicker: () => void;
}

export function Hud({
  onShowHint,
  onShowHelp,
  onShowScenarioPicker,
}: HudProps) {
  const scenarioId = useGameStore((s) => s.scenarioId);
  const lives = useGameStore((s) => s.livesRemaining);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const bestScores = useGameStore((s) => s.bestScores);
  const useHint = useGameStore((s) => s.useHint);
  const status = useGameStore((s) => s.status);
  const hardReset = useGameStore((s) => s.hardReset);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const totalScore = Object.values(bestScores).reduce((a, b) => a + b, 0);

  const [audioOn, setAudioOn] = useState(true);
  useEffect(() => {
    const v = loadAudioEnabled();
    setAudioOn(v);
    audio.setEnabled(v);
  }, []);

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    audio.setEnabled(next);
    saveAudioEnabled(next);
    if (next) audio.click();
  };

  const handleHint = () => {
    const remainingBefore = 2 - hintsUsed;
    if (remainingBefore <= 0) {
      onShowHint(null, 0);
      return;
    }
    audio.click();
    const hint = useHint();
    const remainingAfter = remainingBefore - 1;
    onShowHint(hint, remainingAfter);
  };

  return (
    <header className="relative z-20 h-14 border-b border-obsidian-line bg-obsidian-2/95 backdrop-blur flex items-center px-4 gap-3">
      {/* Left: back to landing */}
      <Link
        href="/"
        className="flex items-center gap-2 text-fg-muted hover:text-hpe-bright transition group"
      >
        <ChevronLeft size={16} />
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest">
          Back
        </span>
      </Link>

      <div className="h-6 w-px bg-obsidian-line" />

      {/* Scenario picker */}
      <button
        onClick={onShowScenarioPicker}
        className="flex items-center gap-2 px-3 h-9 rounded border border-obsidian-line hover:border-hpe transition"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Scenario
        </span>
        <span className="font-display font-semibold text-sm text-fg">
          {scenario.name}
        </span>
        <span
          className={cn(
            "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded",
            scenario.difficulty === "Beginner" && "bg-hpe/15 text-hpe",
            scenario.difficulty === "Intermediate" && "bg-amber/15 text-amber",
            scenario.difficulty === "Advanced" && "bg-crimson/15 text-crimson"
          )}
        >
          {scenario.difficulty}
        </span>
      </button>

      <div className="flex-1" />

      {/* Lives */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded border bg-obsidian-3",
          lives === 1 ? "border-crimson/40" : "border-obsidian-line"
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Lives
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              size={14}
              className={cn(
                "transition-all",
                i < lives ? "text-crimson fill-crimson" : "text-obsidian-line"
              )}
            />
          ))}
        </div>
      </div>

      {/* Total score */}
      <div className="flex items-center gap-2 px-3 h-9 rounded border border-obsidian-line bg-obsidian-3">
        <Trophy size={14} className="text-amber" />
        <span className="font-mono font-bold text-sm text-fg tabular-nums">
          {totalScore}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          / 300
        </span>
      </div>

      <div className="h-6 w-px bg-obsidian-line" />

      {/* Hint */}
      <Button
        size="sm"
        variant="amber"
        onClick={handleHint}
        disabled={status !== "idle" || hintsUsed >= 2}
        title={`${2 - hintsUsed} hints left · −15 pts each`}
      >
        <Lightbulb size={14} />
        <span className="hidden md:inline">Hint</span>
        <span className="font-mono text-[10px]">{2 - hintsUsed}/2</span>
      </Button>

      {/* Compare gen11 vs gen12 */}
      <Link
        href="/cyberblocks/comparison"
        className="inline-flex items-center gap-2 px-3 h-8 rounded-md border border-cyan/40 text-cyan hover:bg-cyan/10 transition font-mono text-xs uppercase tracking-wider"
        title="Watch Gen11 vs Gen12 comparison"
      >
        <ArrowLeftRight size={14} />
        <span className="hidden lg:inline">Gen11 vs Gen12</span>
      </Link>

      {/* Help / tour */}
      <button
        onClick={onShowHelp}
        className="grid place-items-center w-9 h-9 rounded border border-obsidian-line text-fg-muted hover:border-hpe hover:text-hpe-bright transition"
        title="Replay onboarding tour"
        aria-label="Help"
      >
        <HelpCircle size={16} />
      </button>

      {/* Audio */}
      <button
        onClick={toggleAudio}
        className="grid place-items-center w-9 h-9 rounded border border-obsidian-line text-fg-muted hover:border-hpe hover:text-hpe-bright transition"
        title={audioOn ? "Mute audio" : "Enable audio"}
        aria-label="Toggle audio"
      >
        {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* Reset run */}
      <button
        onClick={() => {
          audio.click();
          hardReset();
        }}
        className="grid place-items-center w-9 h-9 rounded border border-obsidian-line text-fg-muted hover:border-amber hover:text-amber transition"
        title="Reset attempts (keeps best scores)"
        aria-label="Reset run"
      >
        <RefreshCw size={14} />
      </button>
    </header>
  );
}
