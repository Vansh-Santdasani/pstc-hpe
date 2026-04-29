"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

interface Props {
  hint: string | null;
  hintsRemaining: number;
  onDismiss: () => void;
}

export function HintBanner({ hint, hintsRemaining, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="absolute top-16 inset-x-4 z-30 mx-auto max-w-2xl bg-amber/15 border border-amber/50 backdrop-blur-md rounded-lg p-4 flex items-start gap-3"
        >
          <div className="grid place-items-center w-8 h-8 rounded-full bg-amber/25 text-amber shrink-0">
            <Lightbulb size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber mb-1">
              ◆ Hint · {hintsRemaining} left
            </div>
            <p className="text-sm text-fg leading-snug">{hint}</p>
          </div>
          <button
            onClick={onDismiss}
            className="grid place-items-center w-7 h-7 rounded text-fg-muted hover:text-fg hover:bg-amber/10 transition shrink-0"
            aria-label="Dismiss hint"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
