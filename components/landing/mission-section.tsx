"use client";

import { motion } from "framer-motion";
import { Compass, Users, BrainCircuit, Network } from "lucide-react";

const PILLARS = [
  {
    icon: Compass,
    label: "Stimulate Curiosity",
    text: "Workshops, talks, and tools that pull engineers out of their lane and into someone else's stack.",
    accent: "hpe",
  },
  {
    icon: BrainCircuit,
    label: "Spark Ideas",
    text: "Cross-pollinate. The best ideas come from the seam between two teams, not the middle of one.",
    accent: "amber",
  },
  {
    icon: Users,
    label: "Broaden Thinking",
    text: "Junior to principal, engineer to manager — every voice in the room makes the council smarter.",
    accent: "cyan",
  },
  {
    icon: Network,
    label: "Solve Big Problems",
    text: "Quantum-safe security. AI-assisted ops. Storage at exabyte scale. The kind that don't fit in a sprint.",
    accent: "hpe",
  },
];

const ACCENT_RING = {
  hpe: "border-hpe/40 hover:border-hpe text-hpe",
  amber: "border-amber/40 hover:border-amber text-amber",
  cyan: "border-cyan/40 hover:border-cyan text-cyan",
} as const;

export function MissionSection() {
  return (
    <section id="mission" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-12 gap-8 items-end mb-16"
        >
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe">
              [01] Mission
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-fg leading-[1.05]">
              We exist to{" "}
              <span className="text-hpe italic">enable our teams</span> to solve
              large and meaningful problems through collaborative insight and
              shared expertise.
            </h2>
          </div>
          <div className="md:col-span-3 md:pl-8 border-l border-hpe/30">
            <p className="text-sm text-fg-muted leading-relaxed">
              The Pune Site Tech Council is a community of passionate
              technologists championing innovation and technical excellence
              across the enterprise.
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`group relative bg-obsidian-2 border rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 ${
                  ACCENT_RING[p.accent as keyof typeof ACCENT_RING]
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon size={28} strokeWidth={1.5} />
                  <span className="font-mono text-xs text-fg-dim">
                    /0{i + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg text-fg mb-2">
                  {p.label}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed">{p.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
