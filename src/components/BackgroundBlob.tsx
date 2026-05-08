"use client";

import { useEffect, useRef } from "react";

// ── Atmospheric blob config ───────────────────────────────────────────────────
const BLOBS = [
  { bx: 0.50, by: 0.47, rx: 0.46, ry: 0.40, op: 0.14, ox: 0.12, oy: 0.09, phase: 0.0 },
  { bx: 0.36, by: 0.60, rx: 0.32, ry: 0.26, op: 0.08, ox: -0.10, oy: 0.07, phase: 1.6 },
  { bx: 0.66, by: 0.34, rx: 0.28, ry: 0.32, op: 0.07, ox: 0.08, oy: -0.10, phase: 3.1 },
];

const PARTICLE_COUNT = 55;

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 4);
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BackgroundBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0, ch = 0;
    const resize = () => {
      cw = canvas.width  = window.innerWidth;
      ch = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build particles (deterministic, after resize so cw/ch are valid)
    const rng = mkRng(42);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  rng() * cw,
      y:  rng() * ch,
      vx: (rng() - 0.5) * 0.18,
      vy: (rng() - 0.5) * 0.12,
      r:  0.6 + rng() * 1.2,
      op: 0.025 + rng() * 0.05,
    }));

    let t = 0;

    const render = () => {
      t += 0.004;
      ctx.clearRect(0, 0, cw, ch);

      // ── Atmospheric blobs ──────────────────────────────────────────────────
      for (const b of BLOBS) {
        const bx = (b.bx + Math.sin(t * 0.55 + b.phase) * b.ox) * cw;
        const by = (b.by + Math.cos(t * 0.40 + b.phase) * b.oy) * ch;
        const rx = b.rx * cw;
        const ry = b.ry * ch;

        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(1, ry / rx);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        grad.addColorStop(0,    `rgba(200,200,200,${b.op})`);
        grad.addColorStop(0.35, `rgba(180,180,180,${b.op * 0.55})`);
        grad.addColorStop(0.65, `rgba(150,150,150,${b.op * 0.20})`);
        grad.addColorStop(1,    "rgba(100,100,100,0)");

        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // ── Horizontal light smear (cinematic) ───────────────────────────────
      const smearY = ch * (0.47 + Math.sin(t * 0.22) * 0.04);
      const smear  = ctx.createLinearGradient(0, smearY - 60, 0, smearY + 60);
      smear.addColorStop(0,    "rgba(255,255,255,0)");
      smear.addColorStop(0.45, `rgba(255,255,255,${0.022 + Math.sin(t * 0.38) * 0.008})`);
      smear.addColorStop(0.5,  `rgba(255,255,255,${0.032 + Math.sin(t * 0.38) * 0.010})`);
      smear.addColorStop(0.55, `rgba(255,255,255,${0.022 + Math.sin(t * 0.38) * 0.008})`);
      smear.addColorStop(1,    "rgba(255,255,255,0)");
      ctx.fillStyle = smear;
      ctx.fillRect(0, smearY - 60, cw, 120);

      // ── Floating particles ───────────────────────────────────────────────
      for (const p of particles) {
        p.x = (p.x + p.vx + cw) % cw;
        p.y = (p.y + p.vy + ch) % ch;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,200,${p.op})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: "blur(72px)", opacity: 0.92 }}
      aria-hidden="true"
    />
  );
}
