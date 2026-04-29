"use client";

import { useDraggable } from "@dnd-kit/core";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AttackBlock } from "@/types";
import { TACTIC_LABEL } from "@/types";
import { cn } from "@/lib/utils/cn";

interface PaletteBlockProps {
  block: AttackBlock;
  onClick?: () => void;
}

const TACTIC_ACCENT: Record<string, string> = {
  "initial-access": "border-crimson/50 hover:border-crimson text-crimson",
  execution: "border-amber/50 hover:border-amber text-amber",
  persistence: "border-amber/50 hover:border-amber text-amber",
  "privilege-escalation": "border-amber/50 hover:border-amber text-amber",
  "credential-access": "border-cyan/50 hover:border-cyan text-cyan",
  discovery: "border-cyan/50 hover:border-cyan text-cyan",
  "lateral-movement": "border-cyan/50 hover:border-cyan text-cyan",
  collection: "border-hpe/50 hover:border-hpe text-hpe",
  exfiltration: "border-hpe/50 hover:border-hpe text-hpe",
  impact: "border-crimson/50 hover:border-crimson text-crimson",
  quantum: "border-fuchsia-500/50 hover:border-fuchsia-400 text-fuchsia-400",
};

export function PaletteBlock({ block, onClick }: PaletteBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.id}`,
    data: { source: "palette", blockId: block.id },
  });

  const Icon: LucideIcon =
    (Icons[block.icon as keyof typeof Icons] as LucideIcon) || Icons.Box;

  const accent = TACTIC_ACCENT[block.tactic] ?? "border-obsidian-line text-fg";

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left bg-obsidian-2 border rounded-md p-3 cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:-translate-y-0.5 hover:bg-obsidian-3",
        "no-select touch-none",
        accent,
        isDragging && "opacity-30"
      )}
      title={block.description}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={18} strokeWidth={1.75} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-display font-semibold text-sm text-fg leading-tight truncate">
              {block.name}
            </span>
            {block.mitreId && (
              <span className="font-mono text-[9px] text-fg-dim shrink-0">
                {block.mitreId}
              </span>
            )}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider opacity-80">
            {TACTIC_LABEL[block.tactic]}
          </div>
        </div>
      </div>
    </button>
  );
}
