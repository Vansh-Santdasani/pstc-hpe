/* ============================================================
   CORE TYPES
   Used throughout the CyberBlocks engine + UI
   ============================================================ */

export type MitreTactic =
  | "initial-access"
  | "execution"
  | "persistence"
  | "privilege-escalation"
  | "credential-access"
  | "discovery"
  | "lateral-movement"
  | "collection"
  | "exfiltration"
  | "impact"
  | "quantum"; // custom for our PQC scenarios

export const TACTIC_LABEL: Record<MitreTactic, string> = {
  "initial-access": "Initial Access",
  execution: "Execution",
  persistence: "Persistence",
  "privilege-escalation": "Privilege Escalation",
  "credential-access": "Credential Access",
  discovery: "Discovery",
  "lateral-movement": "Lateral Movement",
  collection: "Collection",
  exfiltration: "Exfiltration",
  impact: "Impact",
  quantum: "Quantum",
};

/* ============================================================
   BLOCK — a single attack technique
   ============================================================ */
export interface AttackBlock {
  /** Stable id used in scenario solutions */
  id: string;
  /** Display name e.g. "Phishing Email" */
  name: string;
  /** MITRE ATT&CK ID e.g. "T1566" — empty string for custom */
  mitreId: string;
  /** Which tactic column it belongs to */
  tactic: MitreTactic;
  /** Short description shown in palette tooltip */
  description: string;
  /** lucide-react icon name (we map this in palette-block.tsx) */
  icon: string;
  /** Terminal lines printed when this block executes successfully */
  successLines: string[];
  /** Terminal lines printed when this block fails (wrong order) */
  failLines: string[];
}

/* ============================================================
   CHAIN ITEM — instance of a block placed in the workspace
   ============================================================ */
export interface ChainItem {
  /** Unique id for the dnd-kit instance */
  instanceId: string;
  /** References AttackBlock.id */
  blockId: string;
}

/* ============================================================
   SCENARIO — a full mission with target, solution, hints
   ============================================================ */
export type TargetKind = "website" | "firmware" | "vault";

export interface Scenario {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  briefing: string;
  /** Background context shown in onboarding */
  context: string;
  /** Target system kind — drives which target component renders */
  target: TargetKind;
  /** Target metadata (varies by kind) */
  targetMeta: {
    title: string;
    subtitle?: string;
  };
  /** Block IDs available in palette for this scenario (incl. distractors) */
  paletteBlockIds: string[];
  /** Correct solution — block IDs in order */
  solution: string[];
  /** Hint strings, revealed one at a time */
  hints: string[];
  /** Debrief shown after success — connects to HPE Gen12 defenses */
  debrief: {
    summary: string;
    gen12Defense: string;
  };
}

/* ============================================================
   ENGINE OUTPUT — what executeAttack returns
   ============================================================ */
export type ExecutionStatus = "success" | "fail";

export interface BlockExecutionResult {
  block: AttackBlock;
  status: ExecutionStatus;
  /** Terminal lines this step prints */
  lines: string[];
  /** What the target visualization should do at this step */
  targetEvent?: TargetEvent;
}

export type TargetEvent =
  | { type: "noop" }
  | { type: "highlight"; selector: string }
  | { type: "compromise"; level: 1 | 2 | 3 }
  | { type: "encrypt" }
  | { type: "exfiltrate" }
  | { type: "swap-firmware" }
  | { type: "open-vault" }
  | { type: "decrypt-vault" }
  | { type: "capture-traffic" }
  | { type: "wait-quantum" };

export interface ExecutionResult {
  /** Did the entire chain match the solution? */
  success: boolean;
  /** Per-block results (in order) — fails stop the loop */
  steps: BlockExecutionResult[];
  /** If failed, the index where it broke down */
  failedAt: number | null;
  /** Why it failed (human readable) */
  failureReason?: string;
}

/* ============================================================
   GAME STATE — top-level game store
   ============================================================ */
export type GameStatus =
  | "idle" // pre-execution, building chain
  | "executing" // animation in progress
  | "success" // last attempt succeeded
  | "fail" // last attempt failed (still has lives)
  | "gameover"; // 0 lives left

export interface ScenarioProgress {
  /** Best score achieved (0–100) */
  bestScore: number;
  /** Whether ever completed */
  completed: boolean;
}
