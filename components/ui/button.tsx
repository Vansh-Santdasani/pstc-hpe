"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "amber";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-hpe text-obsidian hover:bg-hpe-bright hover:shadow-[0_0_24px_var(--color-hpe-glow)] active:scale-[0.98]",
  secondary:
    "bg-obsidian-2 text-fg border border-obsidian-line hover:border-hpe hover:text-hpe-bright",
  ghost: "text-fg-muted hover:text-fg hover:bg-obsidian-2",
  danger:
    "bg-crimson/15 text-crimson border border-crimson/40 hover:bg-crimson/25 hover:border-crimson",
  amber:
    "bg-amber/15 text-amber border border-amber/40 hover:bg-amber/25 hover:border-amber",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium uppercase tracking-wider",
        "rounded-md transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-hpe-bright focus-visible:outline-offset-2",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-current",
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
