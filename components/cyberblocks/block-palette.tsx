"use client";

import { useMemo } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { getScenario } from "@/lib/scenarios";
import { getBlock } from "@/lib/blocks/library";
import { PaletteBlock } from "./palette-block";
import { TACTIC_LABEL, type MitreTactic } from "@/types";
import { audio } from "@/lib/audio/manager";

export function BlockPalette() {
  const scenarioId = useGameStore((s) => s.scenarioId);
  const addBlock = useGameStore((s) => s.addBlock);

  const grouped = useMemo(() => {
    const scenario = getScenario(scenarioId);
    const blocks = scenario.paletteBlockIds.map(getBlock);

    const groups: Partial<Record<MitreTactic, typeof blocks>> = {};
    for (const b of blocks) {
      if (!groups[b.tactic]) groups[b.tactic] = [];
      groups[b.tactic]!.push(b);
    }

    // Sort blocks alphabetically inside each tactic to randomize visual order
    Object.values(groups).forEach((g) => g!.sort((a, b) => a.name.localeCompare(b.name)));

    return groups;
  }, [scenarioId]);

  const tacticOrder: MitreTactic[] = [
    "initial-access",
    "execution",
    "persistence",
    "privilege-escalation",
    "credential-access",
    "discovery",
    "lateral-movement",
    "collection",
    "exfiltration",
    "quantum",
    "impact",
  ];

  return (
    <div
      id="tour-palette"
      className="h-full flex flex-col bg-obsidian-2 border-b border-obsidian-line overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 h-10 border-b border-obsidian-line shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-hpe">
          ◇ Block Palette
        </span>
        <span className="font-mono text-[10px] text-fg-dim">
          drag → chain ↓
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {tacticOrder.map((t) =>
          grouped[t] ? (
            <div key={t}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-muted mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-obsidian-line" />
                <span>{TACTIC_LABEL[t]}</span>
                <span className="h-px flex-1 bg-obsidian-line" />
              </div>
              <div className="grid gap-2">
                {grouped[t]!.map((b) => (
                  <PaletteBlock
                    key={b.id}
                    block={b}
                    onClick={() => {
                      audio.snap();
                      addBlock(b.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
