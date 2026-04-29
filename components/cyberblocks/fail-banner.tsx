"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useGameStore } from "@/lib/store/game-store";
import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";

/**
 * FailBanner — shown across the top when status === 'fail' (not gameover).
 * Distinct from the game-over overlay; lighter, dismissable, retryable.
 */
export function FailBanner() {
  const status = useGameStore((s) => s.status);
  const lastResult = useGameStore((s) => s.lastResult);
  const lives = useGameStore((s) => s.livesRemaining);
  const resetRun = useGameStore((s) => s.resetRun);

  return (
    <AnimatePresence>
      {status === "fail" && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="absolute top-16 inset-x-4 z-30 mx-auto max-w-3xl bg-crimson/15 border border-crimson/50 backdrop-blur-md rounded-lg p-4 flex items-center gap-4 glow-crimson"
        >
          <AlertTriangle size={20} className="text-crimson shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-1">
              ◆ Chain broke · {lives} {lives === 1 ? "life" : "lives"} left
            </div>
            <p className="text-sm text-fg leading-snug">
              {lastResult?.failureReason ??
                "Your chain didn't match a valid attack path."}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              audio.click();
              resetRun();
            }}
          >
            <RotateCcw size={12} />
            Retry
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
