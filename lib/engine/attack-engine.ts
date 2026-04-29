import type {
  AttackBlock,
  ChainItem,
  ExecutionResult,
  BlockExecutionResult,
  Scenario,
  TargetEvent,
} from "@/types";
import { getBlock } from "@/lib/blocks/library";

/* ============================================================
   ATTACK ENGINE — pure function
   Takes a scenario + the user's chain, returns step-by-step
   results. Stops at the first wrong block (gives feedback).
   ============================================================ */

export function executeChain(
  scenario: Scenario,
  chain: ChainItem[]
): ExecutionResult {
  const steps: BlockExecutionResult[] = [];
  const solution = scenario.solution;

  // Empty chain — trivial fail
  if (chain.length === 0) {
    return {
      success: false,
      steps: [],
      failedAt: 0,
      failureReason: "Empty attack chain — drag some blocks first.",
    };
  }

  for (let i = 0; i < chain.length; i++) {
    const item = chain[i];
    const block = getBlock(item.blockId);

    // Past the end of the solution? Extra block — fail.
    if (i >= solution.length) {
      steps.push({
        block,
        status: "fail",
        lines: [
          ...block.failLines,
          `[!!!] chain over-extended — defenders flagged anomaly`,
        ],
        targetEvent: { type: "noop" },
      });
      return {
        success: false,
        steps,
        failedAt: i,
        failureReason:
          "Chain too long — extra blocks tipped off the defender's SIEM.",
      };
    }

    // Wrong block at this position
    if (item.blockId !== solution[i]) {
      steps.push({
        block,
        status: "fail",
        lines: block.failLines,
        targetEvent: { type: "noop" },
      });
      return {
        success: false,
        steps,
        failedAt: i,
        failureReason: `Wrong block at position ${i + 1}. The chain doesn't follow a valid attack path here.`,
      };
    }

    // Correct — push success
    steps.push({
      block,
      status: "success",
      lines: block.successLines,
      targetEvent: targetEventForBlock(scenario, block, i),
    });
  }

  // Chain too short
  if (chain.length < solution.length) {
    return {
      success: false,
      steps,
      failedAt: chain.length,
      failureReason: `Chain incomplete — ${
        solution.length - chain.length
      } more block(s) needed to actually compromise the target.`,
    };
  }

  // Full match
  return {
    success: true,
    steps,
    failedAt: null,
  };
}

/* ------------------------------------------------------------
   targetEventForBlock — maps execution to visual target events
   ------------------------------------------------------------ */
function targetEventForBlock(
  scenario: Scenario,
  block: AttackBlock,
  stepIndex: number
): TargetEvent {
  const totalSteps = scenario.solution.length;

  // Generic compromise progression (1/3, 2/3, full) for the visual ramp
  const compromiseLevel: 1 | 2 | 3 =
    stepIndex < totalSteps / 3 ? 1 : stepIndex < (2 * totalSteps) / 3 ? 2 : 3;

  // Scenario-specific finale events
  if (stepIndex === totalSteps - 1) {
    if (scenario.target === "website") return { type: "encrypt" };
    if (scenario.target === "firmware") return { type: "swap-firmware" };
    if (scenario.target === "vault") return { type: "open-vault" };
  }

  // Mid-chain narrative events
  if (block.id === "capture_tls") return { type: "capture-traffic" };
  if (block.id === "wait_quantum") return { type: "wait-quantum" };
  if (block.id === "shor_decrypt") return { type: "decrypt-vault" };

  return { type: "compromise", level: compromiseLevel };
}

/* ============================================================
   SCORING
   - 100 base
   - −15 per hint
   - −20 per failed attempt (capped at 60 total)
   ============================================================ */
export function calculateScore(opts: {
  hintsUsed: number;
  failedAttempts: number;
}): number {
  const base = 100;
  const hintPenalty = Math.min(opts.hintsUsed * 15, 30);
  const failPenalty = Math.min(opts.failedAttempts * 20, 60);
  return Math.max(0, base - hintPenalty - failPenalty);
}
