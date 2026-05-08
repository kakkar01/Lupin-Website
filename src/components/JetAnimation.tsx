"use client";

import { useEffect, useRef } from "react";

// ─── Jet silhouette ─────────────────────────────────────────────────────────
// Top-down plan-view of a hypersonic delta-wing aircraft (SR-72/Darkstar-inspired).
// Origin = nose tip, aircraft pointing right (+x). s = scale unit (body ≈ 8s long).
function traceJetPath(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  sx: number = 1, // horizontal stretch (for motion-blur ghosts)
) {
  const X = (v: number) => ox - v * s * sx;
  const Y = (v: number) => oy + v * s;

  ctx.beginPath();
  // Nose → upper fuselage (bezier) → wing leading-edge → wing tip
  ctx.moveTo(X(0), Y(0));
  ctx.bezierCurveTo(X(0.7), Y(-0.05), X(2.0), Y(-0.18), X(2.9), Y(-0.24));
  ctx.lineTo(X(4.3), Y(-2.5));    // wing tip
  ctx.lineTo(X(5.8), Y(-0.95));   // wing trailing edge
  ctx.lineTo(X(6.2), Y(-0.30));   // engine nacelle
  ctx.lineTo(X(6.9), Y(-0.13));   // upper tail
  ctx.lineTo(X(7.6), Y(0));       // tail tip
  // Symmetric lower half
  ctx.lineTo(X(6.9), Y(0.13));
  ctx.lineTo(X(6.2), Y(0.30));
  ctx.lineTo(X(5.8), Y(0.95));
  ctx.lineTo(X(4.3), Y(2.5));
  ctx.bezierCurveTo(X(2.0), Y(0.18), X(0.7), Y(0.05), X(0), Y(0));
  ctx.closePath();
}

// ─── Draw full jet with trail + glow ─────────────────────────────────────────
function drawJet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  opacity: number,
) {
  ctx.save();

  // ── Motion-blur ghost trail ─────────────────────────────────────────────
  // Draw progressively-stretched + faded copies behind the jet nose.
  const GHOSTS = 14;
  for (let i = GHOSTS; i >= 1; i--) {
    const t   = i / GHOSTS;
    const gOp = opacity * t * t * 0.06;      // quad falloff
    const gSX = 1 + t * 0.55;               // stretch backward
    const gOX = x + t * s * 5.5;            // offset rearward (left)
    traceJetPath(ctx, gOX, y, s, gSX);
    ctx.fillStyle = `rgba(160,160,160,${gOp})`;
    ctx.fill();
  }

  // ── Air-compression cone (bow shock ahead of nose) ─────────────────────
  const coneGrad = ctx.createRadialGradient(x + s * 0.6, y, 0, x + s * 0.6, y, s * 2.0);
  coneGrad.addColorStop(0,   `rgba(220,220,220,${opacity * 0.14})`);
  coneGrad.addColorStop(0.4, `rgba(180,180,180,${opacity * 0.05})`);
  coneGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = coneGrad;
  ctx.ellipse(x + s * 0.4, y, s * 2.0, s * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Engine exhaust glow ─────────────────────────────────────────────────
  const engineX = x - 6.15 * s;
  for (const yOff of [-0.28, 0.28]) {
    const ey   = y + yOff * s;
    const glow = ctx.createRadialGradient(engineX, ey, 0, engineX, ey, s * 0.8);
    glow.addColorStop(0,   `rgba(255,255,255,${opacity * 0.70})`);
    glow.addColorStop(0.25,`rgba(220,220,220,${opacity * 0.30})`);
    glow.addColorStop(0.6, `rgba(160,160,160,${opacity * 0.08})`);
    glow.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(engineX, ey, s * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Jet body silhouette ─────────────────────────────────────────────────
  traceJetPath(ctx, x, y, s, 1);
  const bodyGrad = ctx.createLinearGradient(x, y - s * 3, x, y + s * 3);
  bodyGrad.addColorStop(0,    `rgba(40,40,40,${opacity * 0.35})`);
  bodyGrad.addColorStop(0.30, `rgba(120,120,120,${opacity * 0.72})`);
  bodyGrad.addColorStop(0.50, `rgba(210,210,210,${opacity})`);
  bodyGrad.addColorStop(0.70, `rgba(120,120,120,${opacity * 0.72})`);
  bodyGrad.addColorStop(1,    `rgba(40,40,40,${opacity * 0.35})`);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // ── Specular highlight along centreline ────────────────────────────────
  ctx.strokeStyle = `rgba(245,245,245,${opacity * 0.45})`;
  ctx.lineWidth   = 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - s * 1.2, y - 0.02 * s,
    x - s * 3.5, y - 0.03 * s,
    x - s * 6.8, y - 0.04 * s,
  );
  ctx.stroke();

  ctx.restore();
}

// ─── Shockwave ring state ────────────────────────────────────────────────────
interface Ring { x: number; y: number; rx: number; op: number }

// ─── Component ───────────────────────────────────────────────────────────────
export default function JetAnimation() {
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

    // ── Timing ──────────────────────────────────────────────────────────────
    const LOOP     = 34;   // seconds between jet appearances
    const FLIGHT   = 3.0;  // seconds to cross screen (cinematic fast)
    const JET_Y    = 0.44; // vertical position ratio (slightly above centre)

    const rings: Ring[] = [];
    const startTime = performance.now();

    // ── Render loop ──────────────────────────────────────────────────────────
    const render = () => {
      const now = performance.now();
      const t   = ((now - startTime) / 1000) % LOOP; // 0 .. LOOP
      ctx.clearRect(0, 0, cw, ch);

      // ── Volumetric centre bloom ────────────────────────────────────────
      const bloomPhase = (now / 1000) * 0.38;
      const bloomOp    = 0.016 + Math.sin(bloomPhase) * 0.004;
      const bloom = ctx.createRadialGradient(cw * 0.5, ch * 0.5, 0, cw * 0.5, ch * 0.5, cw * 0.40);
      bloom.addColorStop(0,   `rgba(255,255,255,${bloomOp * 3})`);
      bloom.addColorStop(0.4, `rgba(200,200,200,${bloomOp})`);
      bloom.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, cw, ch);

      // ── Moving fog / atmosphere bands ──────────────────────────────────
      const fogT = (now / 1000) * 0.18;
      for (let i = 0; i < 3; i++) {
        const fogY  = ch * (0.28 + i * 0.14) + Math.sin(fogT + i * 1.4) * ch * 0.018;
        const fogH  = ch * 0.13;
        const fogOp = 0.024 - i * 0.006;
        const fog   = ctx.createLinearGradient(0, fogY, 0, fogY + fogH);
        fog.addColorStop(0,   "rgba(100,100,100,0)");
        fog.addColorStop(0.35, `rgba(110,110,110,${fogOp})`);
        fog.addColorStop(0.65, `rgba(90,90,90,${fogOp})`);
        fog.addColorStop(1,   "rgba(80,80,80,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, fogY, cw, fogH);
      }

      // ── Jet pass ────────────────────────────────────────────────────────
      if (t < FLIGHT + 1.0) {
        const progress = t / FLIGHT;           // 0 → 1+ while flying
        const s        = cw * 0.038;           // scale unit  (body ≈ 304px @ 1920w)

        // Nose travels from offscreen-left to offscreen-right
        const overrun = 8 * s + cw * 0.06;
        const jetX    = -overrun + (cw + overrun * 2) * Math.min(progress, 1.0);
        const jetY    = ch * JET_Y;

        // Opacity envelope: emerge from / dissolve into darkness
        const fIn  = 0.14;
        const fOut = 0.80;
        let   jetOp = 1;
        if (progress < fIn)       jetOp = progress / fIn;
        else if (progress > fOut) jetOp = Math.max(0, 1 - (progress - fOut) / (1 - fOut));
        jetOp = Math.min(jetOp, 1) * 0.80;

        if (jetOp > 0.004) {
          drawJet(ctx, jetX, jetY, s, jetOp);

          // Spawn shockwave ring near engines in mid-flight
          if (progress > 0.08 && progress < 0.86 && Math.random() < 0.04) {
            rings.push({ x: jetX - 1.8 * s, y: jetY, rx: 0, op: 0.11 * jetOp });
          }
        }
      }

      // ── Shockwave / ripple rings ────────────────────────────────────────
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.rx += 4.2;                        // expand outward
        rg.op *= 0.958;                       // fade

        if (rg.op < 0.003 || rg.rx > cw * 0.22) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(200,200,200,${rg.op})`;
        ctx.lineWidth   = 1.1;
        ctx.filter      = "blur(2px)";
        ctx.beginPath();
        ctx.ellipse(rg.x, rg.y, rg.rx, rg.rx * 0.20, 0, 0, Math.PI * 2); // flat ellipse
        ctx.stroke();
        ctx.restore();
        // reset filter after save/restore so subsequent draws aren't affected
      }

      // ── Light streak along jet flight path (lingers briefly) ───────────
      if (t < FLIGHT * 1.6) {
        const streakAlpha = Math.max(0, 1 - t / (FLIGHT * 1.6)) * 0.018;
        const sy          = ch * JET_Y;
        const streak      = ctx.createLinearGradient(0, sy - 1, 0, sy + 1);
        streak.addColorStop(0,   "rgba(255,255,255,0)");
        streak.addColorStop(0.5, `rgba(255,255,255,${streakAlpha})`);
        streak.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.fillStyle = streak;
        ctx.fillRect(0, sy - 18, cw, 36);
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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
