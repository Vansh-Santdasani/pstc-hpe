import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-obsidian-line/60 mt-20 pt-12 pb-10 bg-obsidian-2/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-8 items-start mb-10">
          {/* Brand */}
          <div>
            <div className="relative w-24 h-9 mb-3">
              <Image
                src="/pstc-mark.png"
                alt="Pune Site Tech Council"
                fill
                className="object-contain object-left"
                sizes="96px"
              />
            </div>
            <div className="font-display text-sm text-fg">
              Pune Site Tech Council
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted mt-1">
              HPE · Innovation · Engineering
            </div>
          </div>

          {/* Nav */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs uppercase tracking-wider text-fg-muted">
            <Link href="#mission" className="hover:text-hpe-bright transition">
              · Mission
            </Link>
            <Link href="#sessions" className="hover:text-hpe-bright transition">
              · Sessions
            </Link>
            <Link
              href="#cyberblocks"
              className="hover:text-hpe-bright transition"
            >
              · CyberBlocks
            </Link>
            <Link
              href="/cyberblocks"
              className="hover:text-hpe-bright transition"
            >
              · Launch Sim
            </Link>
            <Link
              href="/cyberblocks/comparison"
              className="hover:text-hpe-bright transition"
            >
              · Gen11 vs Gen12
            </Link>
            <Link href="#register" className="hover:text-hpe-bright transition">
              · Register
            </Link>
          </div>

          {/* Tagline */}
          <div className="md:text-right">
            <div className="font-display text-base text-fg italic">
              Ideas, assembled.
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim mt-2">
              est. 2026 · HPE Pune
            </div>
            <div className="font-mono text-[10px] text-fg-dim mt-1">
              Internal · HPE confidential
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-obsidian-line/60 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-fg-dim">
          <span>© 2026 Pune Site Tech Council</span>
          <span>Built by the council, for the council</span>
        </div>
      </div>
    </footer>
  );
}
