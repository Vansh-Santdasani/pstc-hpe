"use client";

import { motion } from "framer-motion";

const STATS = [
  {
    big: "03",
    label: "Sessions delivered + scheduled in our first quarter",
    accent: "text-hpe",
    border: "border-hpe/30",
  },
  {
    big: "ALL",
    label: "Teams welcome — engineers, sales, ops, managers, interns",
    accent: "text-amber",
    border: "border-amber/30",
  },
  {
    big: "60",
    label: "Minutes per session — hard stop, hands-on, every minute earns its place",
    accent: "text-cyan",
    border: "border-cyan/30",
  },
];

export function StatStrip() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.big}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative bg-obsidian-2 border ${s.border} rounded-lg p-8 md:p-10 hover:bg-obsidian-3 transition-colors`}
            >
              <div
                className={`font-display font-black text-6xl md:text-7xl leading-none ${s.accent}`}
              >
                {s.big}
              </div>
              <div className="mt-5 text-fg-muted text-sm leading-relaxed">
                {s.label}
              </div>
              <span className="absolute top-4 right-4 font-mono text-[10px] text-fg-dim">
                /0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
