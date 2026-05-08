"use client";

import { useEffect, useRef } from "react";

// ── Configuration ─────────────────────────────────────────────────────────────
const BLUR_LAYERS    = 12;   // cheetah motion-blur ghost layers
const BLUR_EXTENT    = 220;  // px — how far the speed trail extends
const PARTICLE_COUNT = 95;   // atmospheric dust motes
const SNAKE_SEGS     = 90;   // resolution of snake body curve

// ── Seeded deterministic PRNG ────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 4);
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Branch builder (called once per resize) ──────────────────────────────────
interface BranchLine { x1: number; y1: number; x2: number; y2: number; w: number; op: number }

function buildBranches(cw: number, ch: number): BranchLine[] {
  const lines: BranchLine[] = [];
  const r = mkRng(7);

  const addBranch = (
    x: number, y: number, angle: number, len: number, depth: number, op: number,
  ) => {
    if (depth <= 0 || len < 10) return;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    lines.push({ x1: x, y1: y, x2: ex, y2: ey, w: depth * 0.38 + 0.18, op });
    const splits = depth > 3 ? 2 : r() > 0.35 ? 2 : 1;
    for (let b = 0; b < splits; b++) {
      const da = (r() - 0.5) * 1.15 + (b === 0 ? 0.38 : -0.38);
      addBranch(ex, ey, angle + da, len * (0.55 + r() * 0.2), depth - 1, op * 0.68);
    }
  };

  // Left cluster
  addBranch(cw * 0.07, ch * 0.97, -Math.PI / 2 - 0.12, ch * 0.30, 7, 0.13);
  addBranch(cw * 0.13, ch * 0.93, -Math.PI / 2 + 0.22, ch * 0.24, 6, 0.10);
  addBranch(cw * 0.03, ch * 0.88, -Math.PI / 2 + 0.04, ch * 0.36, 7, 0.11);

  // Right cluster (snake background)
  addBranch(cw * 0.91, ch * 0.97, -Math.PI / 2 + 0.08, ch * 0.28, 7, 0.12);
  addBranch(cw * 0.96, ch * 0.92, -Math.PI / 2 - 0.22, ch * 0.32, 7, 0.10);
  addBranch(cw * 0.84, ch * 0.93, -Math.PI / 2 + 0.30, ch * 0.22, 6, 0.09);

  return lines;
}

function renderBranches(off: CanvasRenderingContext2D, cw: number, ch: number) {
  off.clearRect(0, 0, cw, ch);
  const branches = buildBranches(cw, ch);
  off.lineCap = "round";
  for (const b of branches) {
    off.strokeStyle = `rgba(255,255,255,${b.op})`;
    off.lineWidth = b.w;
    off.beginPath();
    off.moveTo(b.x1, b.y1);
    off.lineTo(b.x2, b.y2);
    off.stroke();
  }
}

// ── Snake ─────────────────────────────────────────────────────────────────────
function snakePt(s: number, t: number, cw: number, ch: number): { x: number; y: number } {
  // s: 0 = head … 1 = tail
  const phase = t * 0.22 - s * Math.PI * 2.4;
  const amp   = cw * 0.038 + s * cw * 0.018;
  return {
    x: cw * (0.72 + s * 0.16) + Math.sin(phase * 1.9) * amp,
    y: ch * (0.36 + s * 0.22) + Math.cos(phase) * (ch * 0.11 + s * ch * 0.035),
  };
}

function drawSnake(ctx: CanvasRenderingContext2D, t: number, cw: number, ch: number) {
  for (let i = 0; i <= SNAKE_SEGS; i++) {
    const s   = i / SNAKE_SEGS;
    const pt  = snakePt(s, t, cw, ch);
    const r   = 9.5 * (1 - s * 0.78) + 1.8;
    // fade tail + fade near edges
    const edgeFade = Math.min(1, Math.min(pt.x / (cw * 0.08), (cw - pt.x) / (cw * 0.08)));
    const op  = (0.48 - s * 0.28) * Math.max(0, edgeFade);
    ctx.fillStyle = `rgba(165,165,165,${op})`;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Cheetah silhouette ────────────────────────────────────────────────────────
function drawCheetahShape(ctx: CanvasRenderingContext2D, phase: number) {
  // running-cycle values
  const bounce = Math.sin(phase * 2) * 4;
  const lc     = phase;
  const g      = 195; // grayscale value

  ctx.fillStyle   = `rgb(${g},${g},${g})`;
  ctx.strokeStyle = `rgb(${g},${g},${g})`;
  ctx.lineCap     = "round";

  ctx.save();
  ctx.translate(0, bounce);

  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, 118, 36, 0.06, 0, Math.PI * 2);
  ctx.fill();
  // shoulder hump
  ctx.beginPath();
  ctx.ellipse(62, -10, 44, 27, -0.18, 0, Math.PI * 2);
  ctx.fill();
  // haunches
  ctx.beginPath();
  ctx.ellipse(-76, 7, 52, 33, 0.12, 0, Math.PI * 2);
  ctx.fill();
  // neck
  ctx.beginPath();
  ctx.ellipse(105, -14, 22, 14, -0.44, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.ellipse(134, -19, 28, 20, -0.24, 0, Math.PI * 2);
  ctx.fill();
  // snout
  ctx.beginPath();
  ctx.ellipse(156, -14, 12, 9, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // ear
  ctx.beginPath();
  ctx.moveTo(140, -34);
  ctx.lineTo(149, -47);
  ctx.lineTo(153, -33);
  ctx.closePath();
  ctx.fill();

  // tail
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-133, 6);
  ctx.bezierCurveTo(-156, -7, -172, -29, -157, -52);
  ctx.bezierCurveTo(-148, -65, -132, -61, -126, -50);
  ctx.stroke();

  // legs — [attachX, attachY, phaseOffset]
  ctx.lineWidth = 9;
  const legs: [number, number, number][] = [
    [83,  27, 0],
    [83,  27, Math.PI],
    [-78, 29, Math.PI * 0.65],
    [-78, 29, Math.PI * 1.65],
  ];
  const legLen = 72;
  for (const [lx, ly, po] of legs) {
    const angle  = -Math.PI / 2 + 0.72 * Math.sin(lc + po);
    const kneeX  = lx + Math.cos(angle) * legLen * 0.52;
    const kneeY  = ly + Math.sin(angle) * legLen * 0.52;
    const footX  = kneeX + Math.cos(angle + 0.52) * legLen * 0.48;
    const footY  = kneeY + Math.sin(angle + 0.52) * legLen * 0.48;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();
  }

  // spots
  ctx.fillStyle = `rgb(105,105,105)`;
  const spots: [number, number, number][] = [
    [18, -14, 5], [48, 9, 4], [-8, 13, 5], [-38, 6, 4],
    [28, -24, 3], [68, -4, 4], [-58, 9, 4], [8, 26, 3],
    [82, -11, 3], [-24, -17, 3], [43, 21, 3],
  ];
  for (const [sx, sy, sr] of spots) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCheetah(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  scale: number,
  time: number,
) {
  const phase = time * 3.6;
  for (let i = 0; i < BLUR_LAYERS; i++) {
    const t       = i / (BLUR_LAYERS - 1);         // 0 = ghost … 1 = real
    const xOffset = (1 - t) * BLUR_EXTENT;
    const opacity = Math.pow(t, 1.6) * 0.36;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(cx + xOffset, cy);
    ctx.scale(scale, scale);
    drawCheetahShape(ctx, phase);
    ctx.restore();
  }
}

// ── Speed streaks ─────────────────────────────────────────────────────────────
interface Streak { yOff: number; len: number; speed: number; op: number; phase: number }

function buildStreaks(): Streak[] {
  const r = mkRng(99);
  return Array.from({ length: 26 }, () => ({
    yOff:  (r() - 0.5) * 185,
    len:   55  + r() * 260,
    speed: 0.5 + r() * 2.5,
    op:    0.016 + r() * 0.052,
    phase: r() * Math.PI * 2,
  }));
}

function drawStreaks(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  time: number,
  streaks: Streak[],
) {
  ctx.lineCap = "round";
  for (const s of streaks) {
    const vis = (Math.sin(time * s.speed + s.phase) + 1) * 0.5;
    if (vis < 0.04) continue;
    const op  = s.op * vis;
    ctx.strokeStyle = `rgba(255,255,255,${op})`;
    ctx.lineWidth   = 0.4 + vis * 0.9;
    const startX    = cx + BLUR_EXTENT * 0.85;
    ctx.beginPath();
    ctx.moveTo(startX, cy + s.yOff);
    ctx.lineTo(startX - s.len, cy + s.yOff);
    ctx.stroke();
  }
}

// ── Atmospheric particles ─────────────────────────────────────────────────────
interface Mote { x: number; y: number; vx: number; vy: number; op: number; r: number; ph: number }

function buildParticles(cw: number, ch: number): Mote[] {
  const rng = mkRng(13);
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x:  rng() * cw,
    y:  rng() * ch,
    vx: (rng() - 0.5) * 0.28,
    vy: -(0.04 + rng() * 0.18),
    op: 0.022 + rng() * 0.075,
    r:  0.5 + rng() * 2.4,
    ph: rng() * Math.PI * 2,
  }));
}

function tickParticles(
  ctx: CanvasRenderingContext2D,
  motes: Mote[],
  time: number,
  cw: number, ch: number,
) {
  for (const p of motes) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -8)       { p.y = ch + 4; p.x = Math.random() * cw; }
    if (p.x < -8)         p.x = cw + 4;
    if (p.x > cw + 8)     p.x = -4;
    const flicker = (Math.sin(time * 1.6 + p.ph) + 1) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${p.op * (0.38 + flicker * 0.62)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Fog ───────────────────────────────────────────────────────────────────────
function drawFog(ctx: CanvasRenderingContext2D, cw: number, ch: number, time: number) {
  const pulse = (Math.sin(time * 0.28) + 1) * 0.5;
  // central atmospheric haze
  const fg1 = ctx.createRadialGradient(cw * 0.5, ch * 0.54, 0, cw * 0.5, ch * 0.54, cw * 0.52);
  fg1.addColorStop(0, `rgba(28,28,28,${0.055 + pulse * 0.038})`);
  fg1.addColorStop(0.55, "rgba(15,15,15,0.025)");
  fg1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fg1;
  ctx.fillRect(0, 0, cw, ch);
  // ground-level fog
  const fg2 = ctx.createLinearGradient(0, ch * 0.62, 0, ch);
  fg2.addColorStop(0, "rgba(0,0,0,0)");
  fg2.addColorStop(0.5, `rgba(14,14,14,${0.11 + pulse * 0.055})`);
  fg2.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = fg2;
  ctx.fillRect(0, 0, cw, ch);
}

// ── Vignette ──────────────────────────────────────────────────────────────────
function drawVignette(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const vL = ctx.createLinearGradient(0, 0, cw * 0.30, 0);
  vL.addColorStop(0, "rgba(0,0,0,0.97)");
  vL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vL; ctx.fillRect(0, 0, cw, ch);

  const vR = ctx.createLinearGradient(cw * 0.70, 0, cw, 0);
  vR.addColorStop(0, "rgba(0,0,0,0)");
  vR.addColorStop(1, "rgba(0,0,0,0.97)");
  ctx.fillStyle = vR; ctx.fillRect(0, 0, cw, ch);

  const vTB = ctx.createLinearGradient(0, 0, 0, ch);
  vTB.addColorStop(0,    "rgba(0,0,0,0.93)");
  vTB.addColorStop(0.20, "rgba(0,0,0,0)");
  vTB.addColorStop(0.76, "rgba(0,0,0,0)");
  vTB.addColorStop(1,    "rgba(0,0,0,0.93)");
  ctx.fillStyle = vTB; ctx.fillRect(0, 0, cw, ch);
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

    // Offscreen canvas for static branch layer
    const offCanvas = document.createElement("canvas");
    const offCtx    = offCanvas.getContext("2d");

    // Mutable scene data kept in refs so resize can rebuild them
    let motes:   Mote[]   = [];
    let streaks: Streak[]  = buildStreaks();

    const resize = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      canvas.width  = cw;
      canvas.height = ch;
      offCanvas.width  = cw;
      offCanvas.height = ch;
      if (offCtx) renderBranches(offCtx, cw, ch);
      motes   = buildParticles(cw, ch);
    };

    resize();
    window.addEventListener("resize", resize);

    let t0 = 0;

    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const time = (ts - t0) * 0.001;
      const cw   = canvas.width;
      const ch   = canvas.height;

      // ── 1 · solid black base ──
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);

      // ── 2 · static tree branches ──
      if (offCtx) ctx.drawImage(offCanvas, 0, 0);

      // ── 3 · volumetric fog ──
      drawFog(ctx, cw, ch, time);

      // ── 4 · snake weaving through right-side branches ──
      drawSnake(ctx, time, cw, ch);

      // ── 5 · speed streaks around cheetah ──
      const cx = cw * 0.38;
      const cy = ch * 0.52;
      drawStreaks(ctx, cx, cy, time, streaks);

      // ── 6 · ghosted cheetah with cinematic motion blur ──
      const scale = Math.min(cw, ch) * 0.00086;
      drawCheetah(ctx, cx, cy, scale, time);

      // ── 7 · atmospheric dust motes ──
      tickParticles(ctx, motes, time, cw, ch);

      // ── 8 · deep edge vignette ──
      drawVignette(ctx, cw, ch);

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
