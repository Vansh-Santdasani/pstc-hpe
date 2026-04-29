/* ============================================================
   STORAGE
   Typed localStorage wrapper. SSR-safe: returns defaults during
   server render, hydrates on mount.
   ============================================================ */

import type { ScenarioProgress } from "@/types";

const STORAGE_KEYS = {
  scores: "ptc.cyberblocks.scores.v1",
  tour: "ptc.cyberblocks.tour.v1",
  audio: "ptc.cyberblocks.audio.v1",
} as const;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / disabled — fail silent */
  }
}

/* ---------- Scenario progress ---------- */
export function loadProgress(): Record<string, ScenarioProgress> {
  const raw = safeGet(STORAGE_KEYS.scores);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, ScenarioProgress>;
  } catch {
    return {};
  }
}

export function saveProgress(progress: Record<string, ScenarioProgress>) {
  safeSet(STORAGE_KEYS.scores, JSON.stringify(progress));
}

export function recordBest(scenarioId: string, score: number) {
  const all = loadProgress();
  const existing = all[scenarioId];
  const nextBest = Math.max(score, existing?.bestScore ?? 0);
  all[scenarioId] = { bestScore: nextBest, completed: true };
  saveProgress(all);
}

/* ---------- Onboarding tour ---------- */
export function loadTourCompleted(): boolean {
  return safeGet(STORAGE_KEYS.tour) === "1";
}

export function saveTourCompleted() {
  safeSet(STORAGE_KEYS.tour, "1");
}

/* ---------- Audio preference ---------- */
export function loadAudioEnabled(): boolean {
  // default to ON
  const v = safeGet(STORAGE_KEYS.audio);
  if (v === null) return true;
  return v === "1";
}

export function saveAudioEnabled(on: boolean) {
  safeSet(STORAGE_KEYS.audio, on ? "1" : "0");
}
