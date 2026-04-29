import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a terminal-style header bar with traffic lights */
  windowChrome?: boolean;
  /** Header text (only used with windowChrome) */
  windowTitle?: string;
  /** Border accent color */
  accent?: "default" | "hpe" | "amber" | "crimson";
}

const ACCENT: Record<NonNullable<CardProps["accent"]>, string> = {
  default: "border-obsidian-line",
  hpe: "border-hpe/50",
  amber: "border-amber/50",
  crimson: "border-crimson/50",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, windowChrome, windowTitle, accent = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative bg-obsidian-2 border rounded-lg overflow-hidden",
        ACCENT[accent],
        className
      )}
      {...props}
    >
      {windowChrome && (
        <div className="flex items-center gap-2 px-3 h-8 border-b border-obsidian-line bg-obsidian-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-hpe/70" />
          </div>
          {windowTitle && (
            <span className="ml-2 text-[11px] font-mono text-fg-muted uppercase tracking-widest">
              {windowTitle}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
);
Card.displayName = "Card";
