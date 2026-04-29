import { cn } from "@/lib/utils/cn";

/**
 * CRT scanline overlay — sits absolutely positioned on top of a parent.
 * Pure CSS, no JS, ~0 perf cost.
 */
export function Scanlines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[2] mix-blend-overlay opacity-60",
        className
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,255,178,0.04) 2px, rgba(0,255,178,0.04) 3px)",
      }}
    />
  );
}
