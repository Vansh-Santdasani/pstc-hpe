import type { Scenario } from "@/types";

export const HEALTHCARE_RANSOM: Scenario = {
  id: "cold-email",
  name: "Cold Email",
  difficulty: "Beginner",
  briefing:
    "Mid-sized healthcare provider. 1,200 staff. Patient records sit on aging file servers. Your job: get inside, ride privileges, and lock everything for ransom.",
  context:
    "This is the classic ransomware kill chain — the same shape used in 80% of real-world incidents. You're learning the order: get in → run code → harvest creds → spread → collect → impact.",
  target: "website",
  targetMeta: {
    title: "Mercy General Hospital — Patient Portal",
    subtitle: "patient.mercygeneral.health",
  },
  paletteBlockIds: [
    "phishing",
    "exec_macro",
    "cred_dump",
    "stage_data",
    "encrypt_ransom",
    // distractors
    "brute_force",
    "exploit_public",
    "pass_the_hash",
  ],
  solution: ["phishing", "exec_macro", "cred_dump", "stage_data", "encrypt_ransom"],
  hints: [
    "Every chain needs an entry vector. Pick something the user has to interact with.",
    "Once delivered, the payload needs to actually run. The user has to take an action.",
    "After execution, you need elevated access. Where do passwords live in memory?",
    "Before impact, gather the goods in one place.",
    "Final step: do the bad thing. Encrypt everything in sight.",
  ],
  debrief: {
    summary:
      "You've built a textbook ransomware chain — initial access, execution, credential access, collection, impact. Five MITRE tactics, one bad afternoon for a hospital.",
    gen12Defense:
      "HPE Gen12's Silicon Root of Trust + iLO7 secure enclave wouldn't have stopped the phish itself, but it WOULD have prevented the persistence step from surviving a reboot — firmware-level tampering blocks the boot. SEDs with One-Button Secure Erase (NIST SP800-88) also nuke recoverable plaintext when a drive is suspected compromised.",
  },
};
