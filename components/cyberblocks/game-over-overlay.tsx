"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldX, RotateCcw } from "lucide-react";
import { useGameStore } from "@/lib/store/game-store";
import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";

interface Props {
  open: boolean;
}

export function GameOverOverlay({ open }: Props) {
  const lastResult = useGameStore((s) => s.lastResult);
  const hardReset = useGameStore((s) => s.hardReset);

  useEffect(() => {
    if (open) {
      audio.startSiren();
      // auto-stop the siren after 3s — keep the visual but kill the noise
      const t = setTimeout(() => audio.stopSiren(), 3000);
      return () => {
        audio.stopSiren();
        clearTimeout(t);
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-obsidian/95 backdrop-blur-sm siren-active"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="text-center max-w-lg px-6"
      >
        <ShieldX
          size={72}
          className="mx-auto text-crimson mb-6"
          strokeWidth={1.25}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-crimson mb-3">
          ◆ blue team wins
        </div>
        <h2 className="font-display text-5xl font-bold text-fg mb-4">
          Defender 1 — Attacker 0
        </h2>
        <p className="text-fg-muted leading-relaxed">
          Three failed attempts means a real defender&apos;s SIEM lit up like a
          Christmas tree. Your chain triggered alerts, IR teams got paged, and
          someone above your pay grade is looking at the logs.
        </p>

        {lastResult?.failureReason && (
          <div className="mt-5 mx-auto max-w-md bg-crimson/10 border border-crimson/40 rounded-lg p-4 text-left">
            <div className="font-mono text-[10px] uppercase tracking-wider text-crimson mb-1">
              Last failure
            </div>
            <p className="text-sm text-fg">{lastResult.failureReason}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="mt-8"
          onClick={() => {
            audio.click();
            hardReset();
          }}
        >
          <RotateCcw size={16} />
          Try Again — Fresh Start
        </Button>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-fg-dim">
          Best scores are preserved · only this run resets
        </p>
      </motion.div>
    </motion.div>
  );
}
