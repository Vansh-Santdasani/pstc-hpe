import type { Scenario } from "@/types";

export const QUANTUM_HEIST: Scenario = {
  id: "harvest-decrypt",
  name: "Harvest Now, Decrypt Later",
  difficulty: "Advanced",
  briefing:
    "You're a state-level adversary. You can't break RSA today — but you will, in five years. So start collecting now. Patience is your weapon.",
  context:
    "This is the threat that justified the entire NIST PQC effort. The data you encrypt with RSA today is decrypted retroactively the moment a CRQC (Cryptographically Relevant Quantum Computer) goes online. Medical records, M&A docs, government cables — anything that needs to stay secret for >5 years is at risk RIGHT NOW.",
  target: "vault",
  targetMeta: {
    title: "TargetCorp Secure Communications",
    subtitle: "Encrypted in 2025 — Opened in 2030",
  },
  paletteBlockIds: [
    "capture_tls",
    "store_ciphertext",
    "wait_quantum",
    "shor_decrypt",
    "open_vault",
    // distractors
    "phishing",
    "encrypt_ransom",
    "brute_force",
  ],
  solution: [
    "capture_tls",
    "store_ciphertext",
    "wait_quantum",
    "shor_decrypt",
    "open_vault",
  ],
  hints: [
    "You don't need to break encryption today. You just need to record it.",
    "Captured data is useless if it disappears. Where do you put 40 GB of pcap and never delete it?",
    "Time is the trick here. Skip ahead five years.",
    "The future weapon: an algorithm that finds the prime factors of your enemy's RSA modulus in polynomial time.",
    "Now everything you ever recorded becomes readable.",
  ],
  debrief: {
    summary:
      "You executed the threat model that NIST spent 8 years racing against: harvest-now-decrypt-later. Every email, banking session, VPN handshake, and stored backup encrypted with RSA/ECC TODAY is in your vault. In 2030, it's plaintext.",
    gen12Defense:
      "This is exactly what HPE Gen12 was built for. iLO7 already supports CRYSTALS-Kyber (ML-KEM) for key exchange — Shor's algorithm can't break lattice problems. LMS hash-based signatures protect firmware. Hybrid mode (RSA+Kyber) provides transitional safety for environments mid-migration. Your harvested 2030 vault would contain only post-quantum-encrypted noise.",
  },
};
