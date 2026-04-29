"use client";

import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";

interface Step {
  /** Element id to anchor on */
  anchor: string | null;
  title: string;
  body: string;
  /** Where to place the popover relative to the anchor */
  placement?: "bottom" | "top" | "left" | "right" | "center";
}

const STEPS: Step[] = [
  {
    anchor: null,
    title: "Welcome to CyberBlocks",
    body:
      "Build a real attacker's chain. Drag blocks, sequence them, hit Execute, watch the target compromise. Every block maps to a MITRE ATT&CK technique.",
    placement: "center",
  },
  {
    anchor: "tour-palette",
    title: "1 · The Palette",
    body:
      "These are your attack blocks. Each one is a real MITRE technique. Drag a block — or click it — to add it to your chain.",
    placement: "right",
  },
  {
    anchor: "tour-chain",
    title: "2 · The Chain",
    body:
      "Drop blocks here. Reorder them by dragging. The order matters — phishing has to come before execute, etc. Get it wrong and it fails.",
    placement: "right",
  },
  {
    anchor: "tour-execute",
    title: "3 · Execute",
    body:
      "Hit this when you're ready. The terminal animates each step. The target above visualizes the damage.",
    placement: "top",
  },
  {
    anchor: "tour-terminal",
    title: "4 · Terminal + Target",
    body:
      "Right side splits in two — terminal shows what an attacker sees, target shows what a defender sees. Three lives, two hints, one win.",
    placement: "left",
  },
];

interface Props {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ open, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first step when tour opens
  useEffect(() => {
    if (open) setStepIdx(0);
  }, [open]);

  const step = STEPS[stepIdx];

  // Track the anchor's position
  useLayoutEffect(() => {
    if (!open || !step.anchor) {
      setRect(null);
      return;
    }
    const updateRect = () => {
      const el = document.getElementById(step.anchor!);
      if (el) setRect(el.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const t = setInterval(updateRect, 300); // soft re-check
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(t);
    };
  }, [open, step.anchor]);

  const next = () => {
    audio.click();
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else finish();
  };

  const finish = () => {
    audio.click();
    onComplete();
  };

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-obsidian/75 backdrop-blur-sm pointer-events-auto" />

          {/* Spotlight cutout (border around anchor) */}
          {rect && (
            <motion.div
              key={step.anchor}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="absolute pointer-events-none rounded-lg border-2 border-hpe glow-hpe"
              style={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow:
                  "0 0 0 9999px rgba(10, 14, 15, 0.85), 0 0 32px var(--color-hpe-glow)",
              }}
            />
          )}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute pointer-events-auto"
            style={tooltipPosition(rect, step.placement, tooltipRef.current)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={stepIdx}
              transition={{ duration: 0.25 }}
              className="bg-obsidian-2 border border-hpe/40 rounded-lg p-5 max-w-sm shadow-2xl glow-hpe"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-hpe-bright">
                  Tour · {stepIdx + 1}/{STEPS.length}
                </span>
                <button
                  onClick={finish}
                  className="text-fg-muted hover:text-fg transition"
                  aria-label="Skip tour"
                >
                  <X size={14} />
                </button>
              </div>
              <h3 className="font-display font-bold text-lg text-fg mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed mb-5">
                {step.body}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded transition-all ${
                        i === stepIdx ? "w-6 bg-hpe" : "w-3 bg-obsidian-line"
                      }`}
                    />
                  ))}
                </div>
                <Button size="sm" onClick={next}>
                  {stepIdx < STEPS.length - 1 ? "Next" : "Got it"}
                  <ChevronRight size={12} />
                </Button>
              </div>

              {stepIdx === 0 && (
                <button
                  onClick={finish}
                  className="block w-full mt-3 font-mono text-[10px] uppercase tracking-widest text-fg-dim hover:text-fg transition"
                >
                  Skip tour →
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Compute the tooltip's CSS position based on anchor + placement. */
function tooltipPosition(
  rect: DOMRect | null,
  placement: Step["placement"] = "bottom",
  tooltipEl: HTMLDivElement | null
): React.CSSProperties {
  // No anchor — center on screen
  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const tt = tooltipEl?.getBoundingClientRect();
  const ttW = tt?.width ?? 380;
  const ttH = tt?.height ?? 220;
  const margin = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  let top = 0;
  let left = 0;

  switch (placement) {
    case "right":
      top = rect.top + rect.height / 2 - ttH / 2;
      left = rect.right + margin;
      break;
    case "left":
      top = rect.top + rect.height / 2 - ttH / 2;
      left = rect.left - ttW - margin;
      break;
    case "top":
      top = rect.top - ttH - margin;
      left = rect.left + rect.width / 2 - ttW / 2;
      break;
    case "bottom":
    default:
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - ttW / 2;
      break;
    case "center":
      top = vh / 2 - ttH / 2;
      left = vw / 2 - ttW / 2;
      break;
  }

  // Keep on screen
  top = Math.max(margin, Math.min(top, vh - ttH - margin));
  left = Math.max(margin, Math.min(left, vw - ttW - margin));

  return { top, left };
}
