"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

import { Hud } from "@/components/cyberblocks/hud";
import { BlockPalette } from "@/components/cyberblocks/block-palette";
import { AttackChain } from "@/components/cyberblocks/attack-chain";
import { Terminal } from "@/components/cyberblocks/terminal";
import { TargetSystem } from "@/components/cyberblocks/target-system";
import { ScenarioSelector } from "@/components/cyberblocks/scenario-selector";
import { ResultModal } from "@/components/cyberblocks/result-modal";
import { GameOverOverlay } from "@/components/cyberblocks/game-over-overlay";
import { OnboardingTour } from "@/components/cyberblocks/onboarding-tour";
import { HintBanner } from "@/components/cyberblocks/hint-banner";
import { FailBanner } from "@/components/cyberblocks/fail-banner";

import { useGameStore } from "@/lib/store/game-store";
import { getBlock } from "@/lib/blocks/library";
import { audio } from "@/lib/audio/manager";
import {
  loadAudioEnabled,
  loadTourCompleted,
  saveTourCompleted,
} from "@/lib/storage/game-storage";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function CyberBlocksPage() {
  const chain = useGameStore((s) => s.chain);
  const status = useGameStore((s) => s.status);
  const addBlock = useGameStore((s) => s.addBlock);
  const reorderChain = useGameStore((s) => s.reorderChain);
  const hydrateFromStorage = useGameStore((s) => s.hydrateFromStorage);

  // Hydrate from storage on mount
  useEffect(() => {
    hydrateFromStorage();
    audio.setEnabled(loadAudioEnabled());
  }, [hydrateFromStorage]);

  // Onboarding tour
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    if (!loadTourCompleted()) {
      // Slight delay so the page can settle
      const t = setTimeout(() => setTourOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const completeTour = () => {
    saveTourCompleted();
    setTourOpen(false);
  };

  // Modal states
  const [scenarioPickerOpen, setScenarioPickerOpen] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState(2);

  // Drag overlay state
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.source === "palette") {
      setActiveBlockId(data.blockId as string);
    } else {
      // Sortable instance — find the block by instanceId
      const item = chain.find((c) => c.instanceId === e.active.id);
      if (item) setActiveBlockId(item.blockId);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveBlockId(null);
    const { active, over } = e;
    if (!over) return;

    const activeData = active.data.current;

    // Case 1: Palette → Chain (add new block)
    if (activeData?.source === "palette") {
      const blockId = activeData.blockId as string;
      if (
        over.id === "chain-droppable" ||
        chain.some((c) => c.instanceId === over.id)
      ) {
        audio.snap();
        addBlock(blockId);
      }
      return;
    }

    // Case 2: Chain → Chain (reorder)
    const fromIdx = chain.findIndex((c) => c.instanceId === active.id);
    const toIdx = chain.findIndex((c) => c.instanceId === over.id);
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      audio.snap();
      reorderChain(fromIdx, toIdx);
    }
  };

  // Map status → modal visibility
  const showResult = status === "success";
  const showGameOver = status === "gameover";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-obsidian text-fg overflow-hidden">
        <Hud
          onShowHint={(hint, remaining) => {
            setHintText(hint);
            setHintsRemaining(remaining);
          }}
          onShowHelp={() => setTourOpen(true)}
          onShowScenarioPicker={() => setScenarioPickerOpen(true)}
        />

        {/* Banners (positioned absolutely below HUD) */}
        <div className="relative">
          <HintBanner
            hint={hintText}
            hintsRemaining={hintsRemaining}
            onDismiss={() => setHintText(null)}
          />
          <FailBanner />
        </div>

        {/* Main work area */}
        <main className="flex-1 grid grid-cols-12 gap-px bg-obsidian-line overflow-hidden">
          {/* Palette */}
          <aside className="col-span-3 lg:col-span-3 bg-obsidian-2 overflow-hidden flex flex-col min-h-0">
            <BlockPalette />
          </aside>

          {/* Chain */}
          <section className="col-span-4 lg:col-span-3 bg-obsidian-2 overflow-hidden flex flex-col min-h-0">
            <AttackChain />
          </section>

          {/* Right side — terminal + target stacked */}
          <section className="col-span-5 lg:col-span-6 grid grid-rows-2 gap-px bg-obsidian-line overflow-hidden min-h-0">
            <div className="overflow-hidden min-h-0">
              <Terminal />
            </div>
            <div className="overflow-hidden min-h-0">
              <TargetSystem />
            </div>
          </section>
        </main>
      </div>

      {/* Drag overlay — what shows under the cursor while dragging */}
      <DragOverlay>
        {activeBlockId ? <DragGhost blockId={activeBlockId} /> : null}
      </DragOverlay>

      {/* Modals & overlays */}
      <ScenarioSelector
        open={scenarioPickerOpen}
        onClose={() => setScenarioPickerOpen(false)}
      />
      <ResultModal open={showResult} />
      <GameOverOverlay open={showGameOver} />
      <OnboardingTour open={tourOpen} onComplete={completeTour} />
    </DndContext>
  );
}

function DragGhost({ blockId }: { blockId: string }) {
  const block = getBlock(blockId);
  const Icon: LucideIcon =
    (Icons[block.icon as keyof typeof Icons] as LucideIcon) || Icons.Box;
  return (
    <div className="bg-obsidian-2 border-2 border-hpe rounded-md p-3 shadow-2xl glow-hpe min-w-[200px] cursor-grabbing">
      <div className="flex items-center gap-2.5">
        <Icon size={18} className="text-hpe" />
        <div>
          <div className="font-display font-semibold text-sm text-fg">
            {block.name}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-fg-muted">
            {block.mitreId || "custom"}
          </div>
        </div>
      </div>
    </div>
  );
}
