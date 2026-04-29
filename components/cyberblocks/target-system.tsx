"use client";

import { useGameStore } from "@/lib/store/game-store";
import { getScenario } from "@/lib/scenarios";
import { TargetWebsite } from "./target-website";
import { TargetFirmware } from "./target-firmware";
import { TargetVault } from "./target-vault";

/**
 * TargetSystem — picks the right visualization for the active
 * scenario's `target` kind. Each target component is responsible
 * for reading game state and animating accordingly.
 */
export function TargetSystem() {
  const scenarioId = useGameStore((s) => s.scenarioId);
  const scenario = getScenario(scenarioId);

  if (scenario.target === "website") return <TargetWebsite scenario={scenario} />;
  if (scenario.target === "firmware") return <TargetFirmware scenario={scenario} />;
  if (scenario.target === "vault") return <TargetVault scenario={scenario} />;

  return null;
}
