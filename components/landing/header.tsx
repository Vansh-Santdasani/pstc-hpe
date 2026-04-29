"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 border-b border-obsidian-line/60 bg-obsidian/85 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo lockup — real PSTC mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/hpe-logo.png"
              alt="PSTC"
              fill
              className="object-contain object-left"
              sizes="40px"
              priority
            />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-fg-muted">
              PSTC × HPE
            </div>
            <div className="text-sm font-display font-semibold text-fg">
              Pune Site Tech Council
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
          <Link href="#mission" className="text-fg-muted hover:text-hpe-bright transition">
            Mission
          </Link>
          <Link href="#sessions" className="text-fg-muted hover:text-hpe-bright transition">
            Sessions
          </Link>
          <Link href="#cyberblocks" className="text-fg-muted hover:text-hpe-bright transition">
            CyberBlocks
          </Link>
          <Link
            href="#register"
            className="px-4 h-9 inline-flex items-center rounded-md bg-hpe text-obsidian font-bold hover:bg-hpe-bright transition-colors"
          >
            Register →
          </Link>
        </nav>

        <Link
          href="#register"
          className="md:hidden px-3 h-8 inline-flex items-center rounded-md bg-hpe text-obsidian font-mono text-xs font-bold uppercase tracking-wider"
        >
          Register
        </Link>
      </div>
    </motion.header>
  );
}
