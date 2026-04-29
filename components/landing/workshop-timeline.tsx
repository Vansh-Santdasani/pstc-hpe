"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Segment {
  id: string;
  start: number;
  end: number;
  title: string;
  detail: string;
  accent: "hpe" | "amber" | "cyan" | "crimson";
}

const SEGMENTS: Segment[] = [
  {
    id: "welcome",
    start: 0,
    end: 5,
    title: "Welcome & Context",
    detail: "Quantum threat teaser. Why today, why HPE Gen12.",
    accent: "hpe",
  },
  {
    id: "deep-dive",
    start: 5,
    end: 15,
    title: "Gen12 Deep-Dive",
    detail:
      "Silicon root-of-trust, iLO7 enclave, SPDM, PQ firmware signing.",
    accent: "cyan",
  },
  {
    id: "threat",
    start: 15,
    end: 25,
    title: "Quantum Threat + Live Demo",
    detail: "Shor's explained visually. Live code: Kyber KEM vs RSA.",
    accent: "amber",
  },
  {
    id: "lab",
    start: 25,
    end: 35,
    title: "Hands-On PQC Lab",
    detail:
      "Encrypt with Kyber, compare key sizes, watch RSA fail to attack.",
    accent: "crimson",
  },
  {
    id: "blocks",
    start: 35,
    end: 55,
    title: "CyberBlocks Simulator",
    detail:
      "Drag-and-drop attack path builder — the session's centerpiece.",
    accent: "hpe",
  },
  {
    id: "wrap",
    start: 55,
    end: 60,
    title: "Wrap & Takeaways",
    detail: "Key recap, resources, open Q&A.",
    accent: "cyan",
  },
];

const ACCENT_STYLES = {
  hpe: { bg: "bg-hpe", ring: "ring-hpe", text: "text-hpe" },
  amber: { bg: "bg-amber", ring: "ring-amber", text: "text-amber" },
  cyan: { bg: "bg-cyan", ring: "ring-cyan", text: "text-cyan" },
  crimson: { bg: "bg-crimson", ring: "ring-crimson", text: "text-crimson" },
};

export function WorkshopTimeline() {
  const [active, setActive] = useState<string>(SEGMENTS[0].id);
  const activeSeg = SEGMENTS.find((s) => s.id === active)!;

  return (
    <section id="workshop" className="relative py-24 md:py-32 border-t border-obsidian-line/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-12 gap-8 items-end mb-16">
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe">
              [03] Workshop
            </span>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-fg-dim">
              30 Apr · preview
            </div>
          </div>
          <div className="md:col-span-10">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-fg leading-[1.05]">
              60 minutes. <span className="text-hpe italic">Six chapters.</span>{" "}
              Every one of them you actually do something.
            </h2>
            <p className="mt-4 text-fg-muted max-w-2xl leading-relaxed">
              Here&apos;s exactly what the 30 April session looks like. Hover or
              tap any segment for the detail.
            </p>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="relative">
          {/* Track */}
          <div className="relative h-16 bg-obsidian-2 border border-obsidian-line rounded-lg overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-0 flex">
              {SEGMENTS.map((s) => {
                const width = ((s.end - s.start) / 60) * 100;
                const accent = ACCENT_STYLES[s.accent];
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    onMouseEnter={() => setActive(s.id)}
                    onClick={() => setActive(s.id)}
                    style={{ width: `${width}%` }}
                    className={`relative h-full border-r border-obsidian-line/60 last:border-r-0 transition-all group ${
                      isActive ? "" : "hover:bg-obsidian-3"
                    }`}
                  >
                    <span
                      className={`absolute inset-x-0 bottom-0 transition-all ${
                        accent.bg
                      } ${isActive ? "h-full opacity-30" : "h-1 opacity-100"}`}
                    />
                    <span
                      className={`relative z-10 block font-mono text-[10px] uppercase tracking-wider transition-colors ${
                        isActive ? accent.text : "text-fg-muted"
                      }`}
                    >
                      {s.start}–{s.end}m
                    </span>
                    <span className="relative z-10 block mt-1 px-2 font-display text-xs md:text-sm text-fg truncate">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-6 grid md:grid-cols-3 gap-6 bg-obsidian-2 border border-obsidian-line rounded-lg p-6"
            >
              <div>
                <div
                  className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
                    ACCENT_STYLES[activeSeg.accent].text
                  }`}
                >
                  Minute {activeSeg.start}–{activeSeg.end}
                </div>
                <div className="mt-2 font-display text-xl text-fg font-semibold">
                  {activeSeg.title}
                </div>
              </div>
              <div className="md:col-span-2 text-fg-muted leading-relaxed">
                {activeSeg.detail}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
