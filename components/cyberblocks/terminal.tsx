"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { audio } from "@/lib/audio/manager";
import { cn } from "@/lib/utils/cn";
import type { ExecutionResult } from "@/types";

/* ============================================================
   CINEMATIC TERMINAL

   Reads each block's transcript lines, parses the prefix, and
   renders with appropriate styling. Supports:

     >>  shell prompt + command (instant, dim prompt + bold cmd)
     ##  section header (cyan bold, slow type)
     --  output (dim, fast type)
     ++  success (hpe-bright, fast)
     !!  warning/error (crimson/amber, fast)
     ~~  progress bar (animated fill)
     ==  divider/banner-style (cyan, instant)
     ""  blank line
     ... otherwise plain output (fg, normal)

   At the end of execution, renders a big ASCII art banner:
     SUCCESS: "PWNED" in green (with metadata)
     FAIL:    "DENIED" in red (with reason)
   ============================================================ */

type Tone =
  | "prompt-cmd"
  | "section"
  | "output"
  | "success"
  | "error"
  | "warn"
  | "divider"
  | "blank"
  | "banner-success"
  | "banner-fail"
  | "raw";

interface PrintedLine {
  tone: Tone;
  text: string;
  /** Already-typed length, for committed lines this is text.length. */
  progress: number;
  /** Optional secondary text — used for progress bars. */
  bar?: number; // 0..1
}

/** Char delays per tone — empty/prompt/divider render instantly. */
const CHAR_DELAY: Record<Tone, number> = {
  "prompt-cmd": 0, // instant — like a real shell echoing
  section: 5,
  output: 3,
  success: 4,
  error: 6,
  warn: 5,
  divider: 0,
  blank: 0,
  "banner-success": 0,
  "banner-fail": 0,
  raw: 3,
};

const LINE_PAUSE: Record<Tone, number> = {
  "prompt-cmd": 80, // brief breath before output starts
  section: 60,
  output: 12,
  success: 30,
  error: 60,
  warn: 50,
  divider: 100,
  blank: 30,
  "banner-success": 0,
  "banner-fail": 0,
  raw: 12,
};

const STEP_PAUSE_MS = 250;

/* ASCII banners — JetBrains Mono renders these box chars cleanly. */
const PWNED_BANNER = `
██████╗ ██╗    ██╗███╗   ██╗███████╗██████╗
██╔══██╗██║    ██║████╗  ██║██╔════╝██╔══██╗
██████╔╝██║ █╗ ██║██╔██╗ ██║█████╗  ██║  ██║
██╔═══╝ ██║███╗██║██║╚██╗██║██╔══╝  ██║  ██║
██║     ╚███╔███╔╝██║ ╚████║███████╗██████╔╝
╚═╝      ╚══╝╚══╝ ╚═╝  ╚═══╝╚══════╝╚═════╝`.trim();

const DENIED_BANNER = `
██████╗ ███████╗███╗   ██╗██╗███████╗██████╗
██╔══██╗██╔════╝████╗  ██║██║██╔════╝██╔══██╗
██║  ██║█████╗  ██╔██╗ ██║██║█████╗  ██║  ██║
██║  ██║██╔══╝  ██║╚██╗██║██║██╔══╝  ██║  ██║
██████╔╝███████╗██║ ╚████║██║███████╗██████╔╝
╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝╚═════╝`.trim();

/* ============================================================ */
export function Terminal() {
  const lastResult = useGameStore((s) => s.lastResult);
  const status = useGameStore((s) => s.status);
  const setCurrentStep = useGameStore((s) => s.setCurrentStep);
  const finishAttackAnimation = useGameStore((s) => s.finishAttackAnimation);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [committed, setCommitted] = useState<PrintedLine[]>([]);
  const [active, setActive] = useState<PrintedLine | null>(null);

  // Cancel in-flight animations on unmount or status change
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  /* Reset whenever a new run begins */
  useEffect(() => {
    if (status === "executing" && lastResult) {
      cancelRef.current.cancelled = false;
      const cancelToken = cancelRef.current;
      setCommitted(initialBootLines(lastResult));
      setActive(null);
      runAnimation(lastResult, cancelToken).then(() => {
        if (!cancelToken.cancelled) {
          finishAttackAnimation();
        }
      });
    } else if (status === "idle") {
      cancelRef.current.cancelled = true;
      setCommitted([]);
      setActive(null);
    }
    return () => {
      cancelRef.current.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult, status]);

  /* Auto-scroll on every change */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [committed, active]);

  /* ---------------- ANIMATION RUNNER ---------------- */
  const runAnimation = useCallback(
    async (result: ExecutionResult, token: { cancelled: boolean }) => {
      // Brief boot pause
      await sleep(300);
      if (token.cancelled) return;

      for (let i = 0; i < result.steps.length; i++) {
        const step = result.steps[i];
        setCurrentStep(i);

        // Step header
        await typeLine(
          {
            tone: "section",
            text: `## [step ${i + 1}/${result.steps.length}] ${step.block.name.toUpperCase()}${
              step.block.mitreId ? ` (${step.block.mitreId})` : ""
            }`,
          },
          token,
          setActive,
          setCommitted
        );
        if (token.cancelled) return;

        // Body lines
        for (const raw of step.lines) {
          if (token.cancelled) return;
          const parsed = parseLine(raw);
          await typeLine(parsed, token, setActive, setCommitted);
        }

        if (step.status === "fail") {
          if (result.failureReason) {
            await typeLine(
              { tone: "error", text: `!! reason: ${result.failureReason}` },
              token,
              setActive,
              setCommitted
            );
          }
          audio.failBeep();
          await sleep(STEP_PAUSE_MS);
          break; // fail short-circuits
        } else {
          await sleep(STEP_PAUSE_MS);
        }
      }

      if (token.cancelled) return;

      // FINAL BANNER
      await sleep(400);
      if (token.cancelled) return;

      if (result.success) {
        appendBanner(setCommitted, "banner-success", PWNED_BANNER);
        appendBanner(setCommitted, "blank", "");
        appendCommitted(setCommitted, {
          tone: "success",
          text: "[+] target: compromised",
        });
        appendCommitted(setCommitted, {
          tone: "success",
          text: `[+] chain executed: ${result.steps.length} stages clean`,
        });
        appendCommitted(setCommitted, {
          tone: "success",
          text: "[+] detections triggered: 0",
        });
        appendCommitted(setCommitted, {
          tone: "success",
          text: "[+] persistence: established",
        });
        appendBanner(setCommitted, "divider", "════════════════════════════════════════════════════");
        audio.success();
      } else {
        appendBanner(setCommitted, "banner-fail", DENIED_BANNER);
        appendBanner(setCommitted, "blank", "");
        appendCommitted(setCommitted, {
          tone: "error",
          text: "[!] chain broken — defender wins this round",
        });
        if (result.failureReason) {
          appendCommitted(setCommitted, {
            tone: "error",
            text: `[!] ${result.failureReason}`,
          });
        }
        appendCommitted(setCommitted, {
          tone: "warn",
          text: "[*] try again — re-sequence the blocks",
        });
        appendBanner(setCommitted, "divider", "════════════════════════════════════════════════════");
      }

      await sleep(700);
    },
    [setCurrentStep]
  );

  return (
    <div
      id="tour-terminal"
      className="relative h-full bg-[#020405] overflow-hidden flex flex-col"
    >
      {/* TERMINAL CHROME */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-obsidian-line bg-obsidian-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-crimson/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-hpe/70" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
            attacker@blackbox ─ ~/ops
          </span>
        </div>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            status === "executing" ? "text-amber animate-pulse" : "text-fg-dim"
          )}
        >
          {status === "executing" ? "● running" : "○ idle"}
        </span>
      </div>

      {/* TERMINAL BODY */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[11.5px] leading-[1.5] text-fg"
      >
        {committed.length === 0 && !active && status === "idle" && <IdleHint />}

        {committed.map((line, i) => (
          <RenderedLine key={i} line={line} done />
        ))}

        {active && <RenderedLine line={active} />}

        {!active && status !== "executing" && committed.length > 0 && (
          <div className="flex items-center text-fg-muted mt-1">
            <span className="text-hpe-bright">attacker@blackbox</span>
            <span className="text-fg-dim">:</span>
            <span className="text-cyan">~/ops</span>
            <span className="text-fg-dim">#</span>
            <span className="cursor-blink ml-1.5 text-hpe-bright">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   RENDER HELPERS
   ============================================================ */

function IdleHint() {
  return (
    <div className="text-fg-muted space-y-1">
      <div className="text-fg-dim">$ # CyberBlocks Engine v1.0</div>
      <div className="text-fg-dim">$ # Build a chain. Click Execute.</div>
      <div className="text-fg-dim">$ # Each block fires real-looking attacker tooling.</div>
      <div className="text-fg-dim">$ # Three lives. Two hints. One win.</div>
      <div className="mt-3 flex items-center text-fg-muted">
        <span className="text-hpe-bright">attacker@blackbox</span>
        <span className="text-fg-dim">:</span>
        <span className="text-cyan">~/ops</span>
        <span className="text-fg-dim">#</span>
        <span className="cursor-blink ml-1.5 text-hpe-bright">▌</span>
      </div>
    </div>
  );
}

function RenderedLine({ line, done }: { line: PrintedLine; done?: boolean }) {
  const visible = done ? line.text : line.text.slice(0, line.progress);

  if (line.tone === "blank") {
    return <div className="h-2" />;
  }

  if (line.tone === "banner-success") {
    return (
      <pre className="text-hpe-bright font-bold whitespace-pre leading-tight my-2 text-[9.5px] sm:text-[10px] md:text-[10.5px]">
        {line.text}
      </pre>
    );
  }
  if (line.tone === "banner-fail") {
    return (
      <pre className="text-crimson font-bold whitespace-pre leading-tight my-2 text-[9.5px] sm:text-[10px] md:text-[10.5px]">
        {line.text}
      </pre>
    );
  }

  if (line.tone === "divider") {
    return <div className="text-fg-dim whitespace-pre">{visible}</div>;
  }

  if (line.tone === "prompt-cmd") {
    // Format: "<command>" — render with prompt prefix
    const cmd = visible;
    return (
      <div className="whitespace-pre-wrap break-all">
        <span className="text-hpe-bright">attacker@blackbox</span>
        <span className="text-fg-dim">:</span>
        <span className="text-cyan">~/ops</span>
        <span className="text-fg-dim"># </span>
        <span className="text-fg font-bold">{cmd}</span>
        {!done && <span className="cursor-blink ml-0.5 text-hpe-bright">▌</span>}
      </div>
    );
  }

  if (line.tone === "section") {
    return (
      <div className="text-cyan font-bold whitespace-pre-wrap mt-2">
        {visible}
        {!done && <span className="cursor-blink ml-0.5 text-cyan">▌</span>}
      </div>
    );
  }

  if (line.tone === "success") {
    return (
      <div className="text-hpe-bright whitespace-pre-wrap break-all">
        {visible}
        {!done && <span className="cursor-blink ml-0.5 text-hpe-bright">▌</span>}
      </div>
    );
  }

  if (line.tone === "error") {
    return (
      <div className="text-crimson whitespace-pre-wrap break-all font-semibold">
        {visible}
        {!done && <span className="cursor-blink ml-0.5 text-crimson">▌</span>}
      </div>
    );
  }

  if (line.tone === "warn") {
    return (
      <div className="text-amber whitespace-pre-wrap break-all">
        {visible}
        {!done && <span className="cursor-blink ml-0.5 text-amber">▌</span>}
      </div>
    );
  }

  // raw / output / fallback
  return (
    <div className="text-fg-muted whitespace-pre-wrap break-all">
      {visible}
      {!done && <span className="cursor-blink ml-0.5 text-fg-muted">▌</span>}
    </div>
  );
}

/* ============================================================
   PARSER + ANIMATION
   ============================================================ */

function parseLine(raw: string): { tone: Tone; text: string } {
  if (raw === "") return { tone: "blank", text: "" };
  if (raw.startsWith(">> ")) return { tone: "prompt-cmd", text: raw.slice(3) };
  if (raw.startsWith("## ")) return { tone: "section", text: raw.slice(3) };
  if (raw.startsWith("-- ")) return { tone: "output", text: raw.slice(3) };
  if (raw.startsWith("++ ")) return { tone: "success", text: `[+] ${raw.slice(3)}` };
  if (raw.startsWith("!! ")) return { tone: "error", text: `[!] ${raw.slice(3)}` };
  if (raw.startsWith("~~ ")) return { tone: "raw", text: `... ${raw.slice(3)}` };
  if (raw.startsWith("== ")) return { tone: "divider", text: `── ${raw.slice(3)} ──` };
  if (raw.startsWith("$ ")) return { tone: "raw", text: raw }; // shell echo
  // Lines that already look formatted (start with [+], [-], [*], [!])
  return { tone: "output", text: raw };
}

function typeLine(
  line: { tone: Tone; text: string },
  token: { cancelled: boolean },
  setActive: (l: PrintedLine | null) => void,
  setCommitted: React.Dispatch<React.SetStateAction<PrintedLine[]>>
): Promise<void> {
  return new Promise((resolve) => {
    const delay = CHAR_DELAY[line.tone];
    const pause = LINE_PAUSE[line.tone];

    // Instant lines — commit immediately
    if (delay === 0) {
      setActive(null);
      setCommitted((prev) => [
        ...prev,
        { tone: line.tone, text: line.text, progress: line.text.length },
      ]);
      // Subtle audio cue
      if (line.tone === "prompt-cmd") audio.tick();
      setTimeout(resolve, pause);
      return;
    }

    // Typewriter
    let i = 0;
    setActive({ tone: line.tone, text: line.text, progress: 0 });
    const interval = setInterval(() => {
      if (token.cancelled) {
        clearInterval(interval);
        resolve();
        return;
      }
      i++;
      if (i % 4 === 0) audio.tick();
      if (i >= line.text.length) {
        clearInterval(interval);
        setActive(null);
        setCommitted((prev) => [
          ...prev,
          { tone: line.tone, text: line.text, progress: line.text.length },
        ]);
        setTimeout(resolve, pause);
      } else {
        setActive({ tone: line.tone, text: line.text, progress: i });
      }
    }, delay);
  });
}

function appendCommitted(
  setCommitted: React.Dispatch<React.SetStateAction<PrintedLine[]>>,
  line: { tone: Tone; text: string }
) {
  setCommitted((prev) => [
    ...prev,
    { tone: line.tone, text: line.text, progress: line.text.length },
  ]);
}

function appendBanner(
  setCommitted: React.Dispatch<React.SetStateAction<PrintedLine[]>>,
  tone: Tone,
  text: string
) {
  setCommitted((prev) => [...prev, { tone, text, progress: text.length }]);
}

function initialBootLines(result: ExecutionResult): PrintedLine[] {
  const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const lines: PrintedLine[] = [
    {
      tone: "raw",
      text: `[boot ${ts}] cyberblocks-engine v1.0 · loaded ${result.steps.length}-stage chain`,
      progress: 0,
    },
    {
      tone: "raw",
      text: `[boot ${ts}] target locked · session id: ${randomId()}`,
      progress: 0,
    },
    { tone: "blank", text: "", progress: 0 },
  ];
  return lines.map((l) => ({ ...l, progress: l.text.length }));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
