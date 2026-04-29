"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { X, GripVertical, Check, Loader2, AlertTriangle } from "lucide-react";
import type { AttackBlock } from "@/types";
import { TACTIC_LABEL } from "@/types";
import { cn } from "@/lib/utils/cn";
import { audio } from "@/lib/audio/manager";

interface ChainBlockProps {
  instanceId: string;
  block: AttackBlock;
  index: number;
  /** Visual state during execution */
  state: "pending" | "running" | "success" | "fail" | "idle";
  onRemove: () => void;
  disabled?: boolean;
}

const TACTIC_ACCENT: Record<string, { border: string; glow: string }> = {
  "initial-access": { border: "border-crimson/60", glow: "shadow-[0_0_24px_rgba(255,0,60,0.2)]" },
  execution: { border: "border-amber/60", glow: "shadow-[0_0_24px_rgba(255,176,0,0.2)]" },
  persistence: { border: "border-amber/60", glow: "shadow-[0_0_24px_rgba(255,176,0,0.2)]" },
  "privilege-escalation": { border: "border-amber/60", glow: "shadow-[0_0_24px_rgba(255,176,0,0.2)]" },
  "credential-access": { border: "border-cyan/60", glow: "shadow-[0_0_24px_rgba(0,212,255,0.2)]" },
  discovery: { border: "border-cyan/60", glow: "shadow-[0_0_24px_rgba(0,212,255,0.2)]" },
  "lateral-movement": { border: "border-cyan/60", glow: "shadow-[0_0_24px_rgba(0,212,255,0.2)]" },
  collection: { border: "border-hpe/60", glow: "shadow-[0_0_24px_var(--color-hpe-glow)]" },
  exfiltration: { border: "border-hpe/60", glow: "shadow-[0_0_24px_var(--color-hpe-glow)]" },
  impact: { border: "border-crimson/60", glow: "shadow-[0_0_24px_rgba(255,0,60,0.25)]" },
  quantum: { border: "border-fuchsia-500/60", glow: "shadow-[0_0_24px_rgba(217,70,239,0.25)]" },
};

export function ChainBlock({
  instanceId,
  block,
  index,
  state,
  onRemove,
  disabled,
}: ChainBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instanceId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon: LucideIcon =
    (Icons[block.icon as keyof typeof Icons] as LucideIcon) || Icons.Box;

  const accent = TACTIC_ACCENT[block.tactic] ?? {
    border: "border-obsidian-line",
    glow: "",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-obsidian-2 border-2 rounded-md transition-all",
        accent.border,
        state === "running" && `${accent.glow} scale-[1.02]`,
        state === "success" && "border-hpe glow-hpe",
        state === "fail" && "border-crimson glow-crimson",
        isDragging && "opacity-50 z-50",
        disabled ? "" : "cursor-grab active:cursor-grabbing"
      )}
    >
      {/* Position badge */}
      <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-obsidian border-2 border-current grid place-items-center font-mono text-[10px] font-bold text-fg z-10">
        {index + 1}
      </div>

      {/* Status indicator (top-right) */}
      <div className="absolute -right-2 -top-2 z-10">
        {state === "running" && (
          <div className="w-6 h-6 rounded-full bg-obsidian border-2 border-amber grid place-items-center">
            <Loader2 size={11} className="text-amber animate-spin" />
          </div>
        )}
        {state === "success" && (
          <div className="w-6 h-6 rounded-full bg-hpe border-2 border-hpe-bright grid place-items-center">
            <Check size={12} className="text-obsidian" strokeWidth={3} />
          </div>
        )}
        {state === "fail" && (
          <div className="w-6 h-6 rounded-full bg-crimson border-2 border-crimson grid place-items-center">
            <AlertTriangle size={11} className="text-obsidian" strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="flex items-stretch">
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="grid place-items-center px-2 text-fg-dim hover:text-fg-muted cursor-grab active:cursor-grabbing border-r border-obsidian-line/60"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        {/* Block body */}
        <div className="flex-1 flex items-center gap-3 p-3 min-w-0">
          <Icon size={20} strokeWidth={1.75} className="shrink-0 text-fg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display font-semibold text-sm text-fg truncate">
                {block.name}
              </span>
              {block.mitreId && (
                <span className="font-mono text-[9px] text-fg-dim shrink-0">
                  {block.mitreId}
                </span>
              )}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-fg-muted">
              {TACTIC_LABEL[block.tactic]}
            </div>
          </div>
        </div>

        {/* Remove */}
        {!disabled && (
          <button
            onClick={() => {
              audio.click();
              onRemove();
            }}
            className="grid place-items-center px-2.5 text-fg-dim hover:text-crimson hover:bg-crimson/10 border-l border-obsidian-line/60 transition-colors"
            aria-label="Remove block"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
