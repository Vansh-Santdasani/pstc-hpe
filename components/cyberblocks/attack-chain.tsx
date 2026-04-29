"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Play, Trash2, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { getBlock } from "@/lib/blocks/library";
import { ChainBlock } from "./chain-block";
import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";
import { cn } from "@/lib/utils/cn";

export function AttackChain() {
  const chain = useGameStore((s) => s.chain);
  const status = useGameStore((s) => s.status);
  const lastResult = useGameStore((s) => s.lastResult);
  const currentStep = useGameStore((s) => s.currentStep);
  const removeBlockAt = useGameStore((s) => s.removeBlockAt);
  const clearChain = useGameStore((s) => s.clearChain);
  const executeAttack = useGameStore((s) => s.executeAttack);

  const { setNodeRef, isOver } = useDroppable({
    id: "chain-droppable",
  });

  const isExecuting = status === "executing";
  const isLocked = status !== "idle";

  const handleExecute = () => {
    audio.click();
    executeAttack();
  };

  return (
    <div
      id="tour-chain"
      className="relative h-full flex flex-col bg-obsidian-2 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-obsidian-line shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">
            ⚡ Attack Chain
          </span>
          <span className="font-mono text-[10px] text-fg-dim">
            {chain.length} block{chain.length === 1 ? "" : "s"}
          </span>
        </div>
        {chain.length > 0 && status === "idle" && (
          <button
            onClick={() => {
              audio.click();
              clearChain();
            }}
            className="text-fg-dim hover:text-crimson transition-colors flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider"
            title="Clear chain"
          >
            <Trash2 size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Drop zone / chain list */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-4 transition-colors",
          isOver && status === "idle" && "bg-hpe/5"
        )}
      >
        {chain.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <SortableContext
            items={chain.map((c) => c.instanceId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {chain.map((c, i) => {
                  const block = getBlock(c.blockId);
                  const stepResult = lastResult?.steps[i];

                  // Visual state mapping
                  let blockState:
                    | "idle"
                    | "pending"
                    | "running"
                    | "success"
                    | "fail" = "idle";

                  if (isExecuting && lastResult) {
                    if (i < currentStep) {
                      blockState = stepResult?.status === "fail" ? "fail" : "success";
                    } else if (i === currentStep) {
                      blockState = "running";
                    } else {
                      blockState = "pending";
                    }
                  } else if (status === "success" || status === "fail" || status === "gameover") {
                    if (stepResult) {
                      blockState = stepResult.status === "fail" ? "fail" : "success";
                    }
                  }

                  return (
                    <motion.div
                      key={c.instanceId}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChainBlock
                        instanceId={c.instanceId}
                        block={block}
                        index={i}
                        state={blockState}
                        onRemove={() => removeBlockAt(i)}
                        disabled={isLocked}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Drop indicator at end */}
              {isOver && status === "idle" && (
                <div className="h-12 border-2 border-dashed border-hpe/60 rounded-md grid place-items-center font-mono text-[10px] uppercase tracking-widest text-hpe">
                  + drop here
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Execute button bar */}
      <div className="border-t border-obsidian-line p-3 shrink-0 bg-obsidian-3/40">
        <Button
          id="tour-execute"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={chain.length === 0 || isLocked}
          onClick={handleExecute}
        >
          <Play size={16} fill="currentColor" />
          {isExecuting ? "Executing..." : "Execute Attack"}
        </Button>
        {status === "idle" && chain.length === 0 && (
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-fg-dim">
            Drag a block from the palette to begin
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={cn(
        "h-full min-h-[200px] grid place-items-center text-center border-2 border-dashed rounded-lg transition-colors",
        isOver
          ? "border-hpe/60 bg-hpe/5"
          : "border-obsidian-line/80 bg-obsidian/40"
      )}
    >
      <div className="px-6">
        <Inbox
          size={32}
          className={cn(
            "mx-auto mb-3 transition-colors",
            isOver ? "text-hpe" : "text-fg-dim"
          )}
          strokeWidth={1.5}
        />
        <p className="font-display font-semibold text-fg mb-1">
          Drop blocks here
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Sequence them into an attack path
        </p>
      </div>
    </div>
  );
}
