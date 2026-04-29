import type { Scenario } from "@/types";
import { HEALTHCARE_RANSOM } from "./healthcare-ransom";
import { SUPPLY_CHAIN } from "./supply-chain";
import { QUANTUM_HEIST } from "./quantum-heist";

export const SCENARIOS: Scenario[] = [
  HEALTHCARE_RANSOM,
  SUPPLY_CHAIN,
  QUANTUM_HEIST,
];

export const SCENARIOS_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s])
);

export function getScenario(id: string): Scenario {
  const s = SCENARIOS_BY_ID[id];
  if (!s) throw new Error(`Unknown scenario id: ${id}`);
  return s;
}
