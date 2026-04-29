"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   PSTC PARTICLES BACKGROUND
   Ported from the standalone HTML you provided. Particles
   converge into the PSTC hex+P mark, hold, scatter, repeat.
   8s loop. Lightweight: ~800 particles, single rAF, no deps.

   Tweaks vs. original:
   - Background colour matches our obsidian theme
   - Accent colour uses our HPE green (#01a982) and a deeper
     teal-blue accent (#2D3FE7) to match the brand mark
   - dpr-aware, debounced resize, cleanup on unmount
   ============================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  accent: boolean;
}

interface Props {
  /** Background colour. Default: obsidian. */
  bg?: string;
  /** Primary particle colour. Default: HPE green. */
  primary?: string;
  /** Accent particle colour for ~12% of particles. */
  accent?: string;
  /** How transparent the trail-fade rectangle is each frame (lower = longer trails). */
  trailAlpha?: number;
  /** Class name for the wrapper div. */
  className?: string;
}

export function PSTCParticles({
  bg = "#0a0e0f",
  primary = "#01a982",
  accent = "#2D3FE7",
  trailAlpha = 0.18,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    /** Build the target shape (hex + P) and sample its filled pixels. */
    function buildTargets(): [number, number][] {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d");
      if (!o) return [];
      o.translate(W / 2, H / 2);
      const S = Math.min(W, H) * 0.28;
      o.lineJoin = "round";
      o.lineCap = "round";
      o.strokeStyle = "#fff";

      // Hexagon
      o.lineWidth = S * 0.07;
      o.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        const x = Math.cos(a) * S;
        const y = Math.sin(a) * S;
        if (i === 0) o.moveTo(x, y);
        else o.lineTo(x, y);
      }
      o.closePath();
      o.stroke();

      // Inner P
      o.lineWidth = S * 0.16;
      o.beginPath();
      o.moveTo(-S * 0.32, -S * 0.55);
      o.lineTo(-S * 0.32, S * 0.55);
      o.moveTo(-S * 0.32, -S * 0.55);
      o.lineTo(S * 0.18, -S * 0.55);
      o.arc(S * 0.18, -S * 0.25, S * 0.3, -Math.PI / 2, Math.PI / 2);
      o.lineTo(-S * 0.32, S * 0.05);
      o.stroke();

      const img = o.getImageData(0, 0, W, H).data;
      const targets: [number, number][] = [];
      const step = 5;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (img[(y * W + x) * 4 + 3] > 128) targets.push([x, y]);
        }
      }
      return targets;
    }

    function init() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);

      // Paint background once so trail-fade reveals it correctly
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);

      const targets = buildTargets();
      const N = Math.min(800, targets.length);
      particles = Array.from({ length: N }, (_, i) => {
        const [tx, ty] = targets[Math.floor((i / N) * targets.length)];
        return {
          x: W / 2 + (Math.random() - 0.5) * W,
          y: H / 2 + (Math.random() - 0.5) * H,
          vx: 0,
          vy: 0,
          tx,
          ty,
          accent: Math.random() < 0.12,
        };
      });
    }

    const start = performance.now();
    function tick(now: number) {
      const t = (now - start) / 1000;
      // 8s loop: 0–3.5 converge, 3.5–5.5 hold, 5.5–8 scatter
      const cycle = t % 8;
      let attract: number;
      let chaos: number;
      if (cycle < 3.5) {
        attract = 0.04;
        chaos = 0.02;
      } else if (cycle < 5.5) {
        attract = 0.08;
        chaos = 0.05;
      } else {
        attract = 0.005;
        chaos = 0.6;
      }

      // motion trails
      // We draw a translucent bg rect every frame to fade prior frames.
      // Convert the bg hex to rgba with our trailAlpha.
      ctx!.fillStyle = hexToRgba(bg, trailAlpha);
      ctx!.fillRect(0, 0, W, H);

      for (const p of particles) {
        p.vx += (p.tx - p.x) * attract + (Math.random() - 0.5) * chaos;
        p.vy += (p.ty - p.y) * attract + (Math.random() - 0.5) * chaos;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx!.fillStyle = p.accent ? accent : primary;
        ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    init();
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [bg, primary, accent, trailAlpha]);

  return (
    <div className={className} aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}

/** Convert a hex color string + alpha into an rgba() string for canvas fillStyle. */
function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(0, 3).map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}
