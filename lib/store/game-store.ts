"use client";

import { create } from "zustand";
import type { ChainItem, ExecutionResult, GameStatus } from "@/types";
import { executeChain, calculateScore } from "@/lib/engine/attack-engine";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import { recordBest, loadProgress } from "@/lib/storage/game-storage";

interface GameState {
  /* ---- Selection ---- */
  scenarioId: string;

  /* ---- Run state ---- */
  chain: ChainItem[];
  livesRemaining: number;
  hintsUsed: number;
  failedAttempts: number;
  status: GameStatus;

  /* ---- Last execution ---- */
  lastResult: ExecutionResult | null;
  /** Index of the step the terminal is currently animating (−1 = none). */
  currentStep: number;

  /* ---- Persistent (scoreboard) ---- */
  bestScores: Record<string, number>;

  /* ---- Actions ---- */
  setScenario: (id: string) => void;
  addBlock: (blockId: string) => void;
  removeBlockAt: (index: number) => void;
  reorderChain: (from: number, to: number) => void;
  clearChain: () => void;
  useHint: () => string | null;
  /** Kick off animation; the Terminal calls finishAttackAnimation when done. */
  executeAttack: () => void;
  /** Called by the Terminal once typewriting + banner has finished. */
  finishAttackAnimation: () => void;
  resetRun: () => void;
  hardReset: () => void;
  hydrateFromStorage: () => void;
  setCurrentStep: (n: number) => void;
}

const MAX_HINTS = 2;
const STARTING_LIVES = 3;

export const useGameStore = create<GameState>((set, get) => ({
  scenarioId: SCENARIOS[0].id,
  chain: [],
  livesRemaining: STARTING_LIVES,
  hintsUsed: 0,
  failedAttempts: 0,
  status: "idle",
  lastResult: null,
  currentStep: -1,
  bestScores: {},

  hydrateFromStorage: () => {
    const progress = loadProgress();
    const bestScores: Record<string, number> = {};
    for (const id in progress) {
      bestScores[id] = progress[id].bestScore;
    }
    set({ bestScores });
  },

  setScenario: (id) => {
    set({
      scenarioId: id,
      chain: [],
      livesRemaining: STARTING_LIVES,
      hintsUsed: 0,
      failedAttempts: 0,
      status: "idle",
      lastResult: null,
      currentStep: -1,
    });
  },

  addBlock: (blockId) => {
    if (get().status !== "idle") return;
    const instanceId = `${blockId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ chain: [...s.chain, { instanceId, blockId }] }));
  },

  removeBlockAt: (index) => {
    if (get().status !== "idle") return;
    set((s) => ({ chain: s.chain.filter((_, i) => i !== index) }));
  },

  reorderChain: (from, to) => {
    if (get().status !== "idle") return;
    set((s) => {
      const next = [...s.chain];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { chain: next };
    });
  },

  clearChain: () => {
    if (get().status !== "idle") return;
    set({ chain: [] });
  },

  useHint: () => {
    const { hintsUsed, scenarioId, status } = get();
    if (status !== "idle") return null;
    if (hintsUsed >= MAX_HINTS) return null;
    const scenario = getScenario(scenarioId);
    const hint = scenario.hints[hintsUsed];
    set({ hintsUsed: hintsUsed + 1 });
    return hint;
  },

  executeAttack: () => {
    const state = get();
    if (state.status !== "idle") return;
    if (state.chain.length === 0) return;

    const scenario = getScenario(state.scenarioId);
    const result = executeChain(scenario, state.chain);

    set({
      status: "executing",
      lastResult: result,
      currentStep: -1,
    });
    // The Terminal will animate, then call finishAttackAnimation()
  },

  finishAttackAnimation: () => {
    const state = get();
    if (state.status !== "executing") return;
    const result = state.lastResult;
    if (!result) return;

    if (result.success) {
      const score = calculateScore({
        hintsUsed: state.hintsUsed,
        failedAttempts: state.failedAttempts,
      });
      recordBest(state.scenarioId, score);
      set((s) => ({
        status: "success",
        bestScores: {
          ...s.bestScores,
          [state.scenarioId]: Math.max(
            s.bestScores[state.scenarioId] ?? 0,
            score
          ),
        },
      }));
    } else {
      const newLives = state.livesRemaining - 1;
      const newFailed = state.failedAttempts + 1;
      if (newLives <= 0) {
        set({
          status: "gameover",
          livesRemaining: 0,
          failedAttempts: newFailed,
        });
      } else {
        set({
          status: "fail",
          livesRemaining: newLives,
          failedAttempts: newFailed,
        });
      }
    }
  },

  resetRun: () => {
    set({
      chain: [],
      status: "idle",
      lastResult: null,
      currentStep: -1,
    });
  },

  hardReset: () => {
    set({
      chain: [],
      livesRemaining: STARTING_LIVES,
      hintsUsed: 0,
      failedAttempts: 0,
      status: "idle",
      lastResult: null,
      currentStep: -1,
    });
  },

  setCurrentStep: (n) => set({ currentStep: n }),
}));
