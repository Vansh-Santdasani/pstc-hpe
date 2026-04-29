"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Zap,
  HardDrive,
  Atom,
  Calendar,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Session {
  id: string;
  status: "past" | "upcoming";
  date: string;
  isoDate: string;
  title: string;
  speakers: string;
  blurb: string;
  icon: LucideIcon;
  /** Visible registration / details link — only on upcoming */
  cta?: { label: string; href: string };
  highlight?: boolean;
}

const SESSIONS: Session[] = [
  {
    id: "techxcelerate",
    status: "past",
    date: "25 Feb 2026",
    isoDate: "2026-02-25",
    title: "TechXcelerate",
    speakers: "Patchirajan & Yasmeen",
    blurb:
      "The inaugural session — a kick-off on engineering velocity, technical excellence, and the council's charter for the year ahead.",
    icon: Zap,
  },
  {
    id: "storage-portfolio",
    status: "past",
    date: "12 Mar 2026",
    isoDate: "2026-03-12",
    title: "HPE Storage Product Portfolio Review",
    speakers: "Srinivas Bhat",
    blurb:
      "An end-to-end walkthrough of HPE's storage stack — Alletra, Primera, Nimble, and how the product lines fit into modern data architectures.",
    icon: HardDrive,
  },
  {
    id: "cyber-quantum",
    status: "upcoming",
    date: "30 Apr 2026",
    isoDate: "2026-04-30",
    title: "Quantum-Safe Security & Next-Gen Cybersecurity",
    speakers: "Workshop · 60 min · All Teams",
    blurb:
      "Hands-on workshop on HPE Gen12 quantum-safe security. Run real post-quantum encryption code, build attack chains in CyberBlocks, and map every step to MITRE ATT&CK.",
    icon: Atom,
    cta: { label: "Register Now", href: "#register" },
    highlight: true,
  },
];

export function SessionsTimeline() {
  return (
    <section
      id="sessions"
      className="relative py-24 md:py-32 border-t border-obsidian-line/60"
    >
      {/* Subtle grid */}
      <div aria-hidden className="absolute inset-0 bg-grid-fine opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-12 gap-8 items-end mb-16"
        >
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe">
              [02] Sessions
            </span>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-fg leading-[1.05]">
              The council in motion.{" "}
              <span className="text-hpe italic">Past, present, next.</span>
            </h2>
          </div>
          <div className="md:col-span-2 md:text-right font-mono text-[10px] uppercase tracking-[0.3em] text-fg-muted">
            <Calendar size={14} className="inline mr-2" />
            2026 · ongoing
          </div>
        </motion.div>

        {/* Vertical timeline */}
        <ol className="relative space-y-6 ml-2 md:ml-6">
          {/* Vertical rail */}
          <div
            aria-hidden
            className="absolute left-3 md:left-5 top-2 bottom-2 w-px bg-gradient-to-b from-hpe/60 via-obsidian-line to-obsidian-line"
          />

          {SESSIONS.map((s, i) => (
            <SessionItem key={s.id} session={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function SessionItem({ session, index }: { session: Session; index: number }) {
  const Icon = session.icon;
  const isPast = session.status === "past";

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative pl-12 md:pl-16"
    >
      {/* Timeline node */}
      <div
        className={`absolute left-0 md:left-2 top-3 w-7 h-7 rounded-full grid place-items-center border-2 ${
          isPast
            ? "border-fg-dim bg-obsidian-2 text-fg-dim"
            : session.highlight
              ? "border-hpe bg-hpe text-obsidian glow-hpe"
              : "border-amber bg-amber/20 text-amber"
        }`}
      >
        {isPast ? (
          <CheckCircle2 size={14} strokeWidth={2.5} />
        ) : (
          <span className="block w-2 h-2 rounded-full bg-current animate-pulse" />
        )}
      </div>

      {/* Card */}
      <div
        id={session.id === "cyber-quantum" ? "register" : undefined}
        className={`relative bg-obsidian-2 border rounded-lg overflow-hidden transition-all hover:-translate-y-0.5 ${
          session.highlight
            ? "border-hpe/40 shadow-[0_0_32px_rgba(1,169,130,0.12)]"
            : "border-obsidian-line hover:border-fg-muted"
        }`}
      >
        {/* Optional spotlight ribbon for the upcoming session */}
        {session.highlight && (
          <div className="px-5 py-2 border-b border-hpe/30 bg-hpe/10 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-hpe-bright">
              ◆ Next session · open for registration
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-hpe">
              60 min
            </span>
          </div>
        )}

        <div className="p-6 md:p-7 grid md:grid-cols-12 gap-6 items-start">
          {/* Date column */}
          <div className="md:col-span-3">
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider ${
                isPast
                  ? "border border-obsidian-line text-fg-muted"
                  : "bg-hpe/15 text-hpe border border-hpe/30"
              }`}
            >
              {isPast ? "Completed" : "Upcoming"}
            </div>
            <time
              dateTime={session.isoDate}
              className="block mt-3 font-display text-2xl md:text-3xl font-bold text-fg"
            >
              {session.date}
            </time>
          </div>

          {/* Title + body */}
          <div className="md:col-span-7">
            <div className="flex items-start gap-3 mb-2">
              <Icon
                size={20}
                strokeWidth={1.75}
                className={
                  session.highlight
                    ? "text-hpe shrink-0 mt-0.5"
                    : isPast
                      ? "text-fg-muted shrink-0 mt-0.5"
                      : "text-amber shrink-0 mt-0.5"
                }
              />
              <h3 className="font-display text-xl md:text-2xl font-semibold text-fg leading-tight">
                {session.title}
              </h3>
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-fg-muted ml-8">
              {session.speakers}
            </div>
            <p className="mt-4 ml-8 text-sm text-fg-muted leading-relaxed max-w-xl">
              {session.blurb}
            </p>
          </div>

          {/* CTA column */}
          <div className="md:col-span-2 md:text-right">
            {session.cta ? (
              <Link
                href={session.cta.href}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-hpe text-obsidian font-mono font-bold uppercase tracking-wider text-xs hover:bg-hpe-bright transition shadow-[0_0_20px_var(--color-hpe-glow)]"
              >
                {session.cta.label}
                <ArrowRight size={14} />
              </Link>
            ) : (
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-fg-dim">
                Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
