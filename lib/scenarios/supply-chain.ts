import type { Scenario } from "@/types";

export const SUPPLY_CHAIN: Scenario = {
  id: "supply-chain",
  name: "Trojan Horse Update",
  difficulty: "Intermediate",
  briefing:
    "Hardware vendor with 2,800 customer servers worldwide. They auto-update firmware over the air. If you can poison their update channel, you own every customer they sell to.",
  context:
    "Supply chain attacks like SolarWinds (2020) and the XZ backdoor (2024) showed how devastating this vector is. The defender's challenge: the malicious firmware looks PERFECTLY signed because it was — with a stolen key.",
  target: "firmware",
  targetMeta: {
    title: "VendorCo Firmware Distribution",
    subtitle: "update.vendorco.io",
  },
  paletteBlockIds: [
    "exploit_public",
    "steal_signing_key",
    "modify_firmware",
    "sign_with_stolen_key",
    "push_update",
    // distractors
    "phishing",
    "encrypt_ransom",
    "stage_data",
  ],
  solution: [
    "exploit_public",
    "steal_signing_key",
    "modify_firmware",
    "sign_with_stolen_key",
    "push_update",
  ],
  hints: [
    "Vendor portals running old Spring or Struts builds are a goldmine. Get a foothold first.",
    "Once inside, find what makes their firmware 'trusted'. It's usually one private key on one box.",
    "Now make your version. Take a real firmware image and slip your payload in.",
    "Sign it with what you stole. The customer fleet checks the signature, not the intent.",
    "Last step: ride their distribution system. Let them deliver your payload for you.",
  ],
  debrief: {
    summary:
      "You compromised a software supply chain — exactly the SolarWinds / XZ Utils playbook. The malicious firmware is mathematically indistinguishable from a real one because the signature is real.",
    gen12Defense:
      "HPE Gen12 uses LMS (Leighton-Micali Signatures) — a hash-based scheme — for firmware signing. Even if a quantum computer breaks RSA in the future, LMS stays secure. The iLO7 secure enclave (FIPS 140-3 Level 3) also stores keys in hardware that can't be exfiltrated like a .pem file on a build server.",
  },
};
