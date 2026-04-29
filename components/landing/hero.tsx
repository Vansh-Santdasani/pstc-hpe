"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PSTCParticles } from "./pstc-particles";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Particle animation backdrop */}
      <div className="absolute inset-0">
        <PSTCParticles
          bg="#0a0e0f"
          primary="#01a982"
          accent="#2D3FE7"
          trailAlpha={0.16}
          className="absolute inset-0"
        />
      </div>

      {/* Vignette + bottom fade for text legibility */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(10,14,15,0.55) 100%), linear-gradient(180deg, transparent 60%, var(--color-obsidian) 100%)",
        }}
      />

      <div className="relative w-full mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-32 md:pb-44">
        {/* Top kicker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="w-2 h-2 bg-hpe block" />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-fg-muted">
            Pune Site Tech Council · HPE
          </span>
        </motion.div>

        {/* Headline + body block */}
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
              className="font-display font-bold tracking-tight text-fg leading-[0.98]"
            >
              <span className="block text-5xl md:text-7xl lg:text-8xl">
                Ideas,
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl text-hpe italic">
                assembled.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 max-w-2xl text-fg-muted text-base md:text-lg leading-relaxed"
            >
              A vibrant community of HPE Pune technologists who collectively
              champion innovation and technical excellence — sparking curiosity,
              broadening strategic thinking, and tackling problems too big for
              one team alone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#sessions"
                className="group inline-flex items-center gap-2 px-6 h-12 rounded-md bg-hpe text-obsidian font-mono font-bold uppercase tracking-wider text-sm hover:bg-hpe-bright transition-all shadow-[0_0_24px_var(--color-hpe-glow)] hover:shadow-[0_0_40px_var(--color-hpe-glow)]"
              >
                Upcoming sessions
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/cyberblocks"
                className="group inline-flex items-center gap-2 px-6 h-12 rounded-md border border-hpe/40 text-fg font-mono font-medium uppercase tracking-wider text-sm hover:border-hpe-bright hover:text-hpe-bright transition"
              >
                <Sparkles size={14} />
                Try CyberBlocks
              </Link>
            </motion.div>
          </div>

          {/* Logo lockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="lg:col-span-4 hidden lg:flex items-end justify-end"
          >
            <div className="bg-obsidian/60 backdrop-blur-sm border border-hpe/20 rounded-lg p-5 max-w-xs">
              <div className="relative w-full aspect-[24/10]">
                <Image
                  src="/pstc-logo.png"
                  alt="Pune Site Tech Council"
                  fill
                  priority
                  className="object-contain object-left"
                  sizes="(max-width: 1024px) 0vw, 320px"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-obsidian-line/60 font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim">
                est. 2026 · HPE Pune
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-6 right-6 mx-auto max-w-7xl flex justify-between items-end font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim"
        >
          <span>Hero · Generative</span>
          <span className="hidden md:inline">▼ Scroll for more</span>
        </motion.div>
      </div>
    </section>
  );
}
