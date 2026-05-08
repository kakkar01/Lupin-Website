"use client";

import { useEffect, useRef } from "react";

// ── Wireframe market terrain parameters ──────────────────────────────────────
const COLS           = 30;
const ROWS           = 22;
const X_HALF         = 11;   // terrain X half-span in 3-D units
const Z_NEAR         = 2.4;
const Z_FAR          = 14.0;
const PARTICLE_COUNT = 65;

// Composite sine-wave height field — feels like a live price-action landscape
function terrainHeight(col: number, row: number, t: number): number {
  const x = (col / (COLS - 1)) * 2 - 1;  // −1 … +1
  const z = Z_NEAR + (row / (ROWS - 1)) * (Z_FAR - Z_NEAR);
  return (
    0.20 * Math.sin(x * 3.1 + t * 0.26) +
    0.26 * Math.sin(z * 0.50 - t * 0.18 + x * 1.7) +
    0.10 * Math.sin(x * 6.4 + z * 0.75 + t * 0.42) +
    0.07 * Math.sin(x * 2.0 - z * 0.32 + t * 0.14) +
    0.04 * Math.sin(x * 9.2 + t * 0.58)
  );
}

// Simple perspective projection (focal length = h * 0.55, horizon at h * 0.44)
function project(x3: number, y3: number, z3: number, w: number, h: number) {
  const focal = h * 0.55;
  const hy = h * 0.44;
  return {
    x: w * 0.5 + (x3 / z3) * focal,
    y: hy   - (y3 / z3) * focal,
    s: focal / z3,
  };
}

export default function BackgroundBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Scattered ambient data-particles
    interface Particle { x: number; y: number; z: number; baseOp: number; phase: number }
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:      (Math.random() - 0.5) * X_HALF * 2.4,
      y:      (Math.random() - 0.5) * 0.9,
      z:      Z_NEAR + Math.random() * (Z_FAR - Z_NEAR),
      baseOp: 0.025 + Math.random() * 0.07,
      phase:  Math.random() * Math.PI * 2,
    }));

    let startTime = 0;

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // ── Pre-compute all projected grid points ──
      const pts: Array<Array<{ x: number; y: number }>> = [];
      for (let row = 0; row < ROWS; row++) {
        pts[row] = [];
        for (let col = 0; col < COLS; col++) {
          const x3 = ((col / (COLS - 1)) - 0.5) * X_HALF * 2;
          const z3 = Z_NEAR + (row / (ROWS - 1)) * (Z_FAR - Z_NEAR);
          const y3 = terrainHeight(col, row, t * 0.001);
          pts[row][col] = project(x3, y3, z3, w, h);
        }
      }

      // ── Draw grid lines ──
      const drawSeg = (r1: number, c1: number, r2: number, c2: number) => {
        const p1 = pts[r1][c1];
        const p2 = pts[r2][c2];
        // Depth-based opacity: near rows are brighter
        const depth = ((r1 + r2) * 0.5) / (ROWS - 1);   // 0 = far, 1 = near
        const opacity = 0.022 + depth * 0.068;
        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth   = 0.3 + depth * 0.65;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      };

      // Horizontal lines across every row
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 1; col++) {
          drawSeg(row, col, row, col + 1);
        }
      }
      // Vertical lines every 3 columns (sparse cross-hatching)
      for (let col = 0; col < COLS; col += 3) {
        for (let row = 0; row < ROWS - 1; row++) {
          drawSeg(row, col, row + 1, col);
        }
      }

      // ── Draw particles ──
      particles.forEach((p) => {
        const pr = project(p.x, p.y, p.z, w, h);
        if (pr.x < -20 || pr.x > w + 20 || pr.y < -20 || pr.y > h + 20) return;
        const flicker = (Math.sin(t * 0.0012 + p.phase) + 1) * 0.5;
        const op = p.baseOp * (0.3 + flicker * 0.7);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        const r = Math.max(pr.s * 0.035 + 0.4, 0.6);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Soft horizon glow (breathing) ──
      const b = (Math.sin(t * 0.0007) + 1) * 0.5;
      const horizonY = h * 0.44;
      ctx.save();
      const hg = ctx.createRadialGradient(w * 0.5, horizonY, 0, w * 0.5, horizonY, w * 0.55);
      hg.addColorStop(0, `rgba(255,255,255,${0.018 + b * 0.012})`);
      hg.addColorStop(0.45, `rgba(255,255,255,0.005)`);
      hg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // ── Deep cinematic vignette ──
      ctx.save();
      const vL = ctx.createLinearGradient(0, 0, w * 0.36, 0);
      vL.addColorStop(0, "rgba(0,0,0,0.97)");
      vL.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = vL; ctx.fillRect(0, 0, w, h);

      const vR = ctx.createLinearGradient(w * 0.64, 0, w, 0);
      vR.addColorStop(0, "rgba(0,0,0,0)");
      vR.addColorStop(1, "rgba(0,0,0,0.97)");
      ctx.fillStyle = vR; ctx.fillRect(0, 0, w, h);

      const vTB = ctx.createLinearGradient(0, 0, 0, h);
      vTB.addColorStop(0,    "rgba(0,0,0,0.94)");
      vTB.addColorStop(0.22, "rgba(0,0,0,0)");
      vTB.addColorStop(0.74, "rgba(0,0,0,0)");
      vTB.addColorStop(1,    "rgba(0,0,0,0.94)");
      ctx.fillStyle = vTB; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    };

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      draw(time - startTime);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
