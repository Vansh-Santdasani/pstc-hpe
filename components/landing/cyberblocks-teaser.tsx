"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Cpu, Target, Trophy } from "lucide-react";

export function CyberBlocksTeaser() {
  return (
    <section id="cyberblocks" className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 30%, rgba(1,169,130,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-12 gap-8 items-end mb-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe">
              [04] Featured Module
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative grid md:grid-cols-12 gap-0 bg-obsidian-2 border border-hpe/40 rounded-2xl overflow-hidden"
        >
          {/* Left: pitch */}
          <div className="md:col-span-5 p-8 md:p-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe-bright mb-6">
              CyberBlocks™
            </div>
            <h3 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] text-fg">
              Build an attack.
              <br />
              <span className="text-hpe">Understand the defender.</span>
            </h3>
            <p className="mt-6 text-fg-muted leading-relaxed">
              A drag-and-drop cyber attack simulator inspired by Scratch — but for
              MITRE ATT&CK. Three scenarios, real-time terminal feedback, and a
              cinematic Gen11 vs Gen12 comparison that shows why post-quantum
              matters.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3">
              <Feature icon={Target} text="3 attack scenarios — beginner to advanced" />
              <Feature icon={Cpu} text="Live terminal + scenario-specific target" />
              <Feature icon={Trophy} text="Score, hints, lives — locally tracked" />
            </ul>

            <Link
              href="/cyberblocks"
              className="mt-10 group inline-flex items-center gap-3 px-6 h-12 rounded-md bg-hpe text-obsidian font-mono font-bold uppercase tracking-wider text-sm hover:bg-hpe-bright transition-all shadow-[0_0_24px_var(--color-hpe-glow)]"
            >
              Launch Simulator
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Right: animated preview */}
          <div className="md:col-span-7 relative bg-obsidian-3 border-l border-hpe/20 min-h-[420px] overflow-hidden">
            <BlockChainPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid place-items-center w-7 h-7 rounded border border-hpe/30 bg-hpe/10 text-hpe-bright">
        <Icon size={14} />
      </span>
      <span className="text-sm text-fg">{text}</span>
    </li>
  );
}

/* ------------------------------------------------------------
   BlockChainPreview — looping animation of blocks snapping
   ------------------------------------------------------------ */
function BlockChainPreview() {
  const BLOCKS = [
    { label: "Phishing", color: "bg-crimson/30 border-crimson/60", code: "T1566" },
    { label: "Execute", color: "bg-amber/30 border-amber/60", code: "T1204" },
    { label: "Dump Creds", color: "bg-cyan/30 border-cyan/60", code: "T1003" },
    { label: "Encrypt", color: "bg-hpe/30 border-hpe/60", code: "T1486" },
  ];

  return (
    <div className="absolute inset-0 p-8">
      {/* Backdrop grid */}
      <div aria-hidden className="absolute inset-0 bg-grid-fine opacity-50" />

      {/* Header strip */}
      <div className="relative font-mono text-[10px] text-fg-muted uppercase tracking-widest mb-6 flex items-center justify-between">
        <span>scenario_01.preview</span>
        <span className="text-hpe">● live</span>
      </div>

      {/* Blocks chain */}
      <div className="relative flex flex-wrap items-center gap-3 mt-6">
        {BLOCKS.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{
              delay: i * 0.6,
              duration: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 22,
            }}
            className={`relative w-32 h-20 rounded-md border-2 ${b.color} backdrop-blur-sm flex flex-col justify-between p-3`}
          >
            <span className="font-mono text-[9px] text-fg-dim">{b.code}</span>
            <span className="font-display text-sm text-fg font-semibold">
              {b.label}
            </span>
            {/* Connector tab */}
            {i < BLOCKS.length - 1 && (
              <span className="absolute top-1/2 -right-3 -translate-y-1/2 w-3 h-3 bg-hpe rounded-r-full" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mock terminal at bottom */}
      <div className="absolute left-8 right-8 bottom-8 bg-obsidian/90 border border-hpe/30 rounded-md p-4 font-mono text-[11px] leading-relaxed">
        <div className="text-fg-muted">$ ./execute_attack.sh scenario_01</div>
        <div className="text-hpe">[+] payload delivered to 47/47</div>
        <div className="text-hpe">[+] code execution achieved</div>
        <div className="text-amber">[+] credential hashes harvested</div>
        <div className="text-crimson">
          [!] IMPACT — system held for ransom <span className="cursor-blink">▌</span>
        </div>
      </div>
    </div>
  );
}
