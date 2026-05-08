"use client";

import { useEffect, useRef } from "react";

// ─── High-quality jet silhouette ─────────────────────────────────────────────
// Plan-view of an SR-72/Darkstar-class hypersonic delta-wing aircraft.
// Origin = nose tip, aircraft pointing right (+x). s = scale unit.
// toX: nose is at ox; body extends leftward (ox - v*s) so tail is to the left.
function traceJetBody(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  sx: number = 1, // horizontal stretch factor (for ghost trail layers)
) {
  const X = (v: number) => ox - v * s * sx;
  const Y = (v: number) => oy + v * s;

  ctx.beginPath();

  // ── Upper half: nose → canard → main wing → tail ──────────────────────────
  ctx.moveTo(X(0),   Y(0));                         // nose tip
  // Nose cone with slight ridge
  ctx.bezierCurveTo(X(0.5), Y(-0.02), X(1.1), Y(-0.08), X(1.7), Y(-0.13));
  // Canard leading edge (small forward delta fin)
  ctx.lineTo(X(2.1),  Y(-0.58));                    // canard leading tip
  ctx.lineTo(X(2.75), Y(-0.60));                    // canard outer tip
  ctx.lineTo(X(3.05), Y(-0.23));                    // canard trailing root
  // Fuselage shoulder sweep to main wing root
  ctx.bezierCurveTo(X(3.45), Y(-0.25), X(3.95), Y(-0.28), X(4.35), Y(-0.30));
  // Main wing — highly swept cranked-arrow delta
  ctx.lineTo(X(5.75), Y(-2.95));                    // wing leading tip
  ctx.lineTo(X(6.30), Y(-2.80));                    // wing tip chamfer
  ctx.lineTo(X(6.50), Y(-1.05));                    // wing trailing tip
  // Engine nacelle profile
  ctx.lineTo(X(6.70), Y(-0.38));
  ctx.bezierCurveTo(X(6.88), Y(-0.31), X(7.08), Y(-0.19), X(7.32), Y(-0.12));
  ctx.lineTo(X(8.05), Y(0));                        // tail tip

  // ── Lower half (mirror) ────────────────────────────────────────────────────
  ctx.lineTo(X(7.32), Y(0.12));
  ctx.bezierCurveTo(X(7.08), Y(0.19), X(6.88), Y(0.31), X(6.70), Y(0.38));
  ctx.lineTo(X(6.50), Y(1.05));
  ctx.lineTo(X(6.30), Y(2.80));
  ctx.lineTo(X(5.75), Y(2.95));
  ctx.lineTo(X(4.35), Y(0.30));
  ctx.bezierCurveTo(X(3.95), Y(0.28), X(3.45), Y(0.25), X(3.05), Y(0.23));
  ctx.lineTo(X(2.75), Y(0.60));
  ctx.lineTo(X(2.1),  Y(0.58));
  ctx.lineTo(X(1.7),  Y(0.13));
  ctx.bezierCurveTo(X(1.1), Y(0.08), X(0.5), Y(0.02), X(0), Y(0));

  ctx.closePath();
}

// ─── Dorsal intake scoops ─────────────────────────────────────────────────────
// side: +1 = upper, -1 = lower (drawn as twin lozenges either side of centreline)
function traceIntake(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s:  number,
  side: 1 | -1,
) {
  const X = (v: number) => ox - v * s;
  const Y = (v: number) => oy + v * s * side;

  ctx.beginPath();
  ctx.moveTo(X(3.7),  Y(0.23));
  ctx.bezierCurveTo(X(3.9), Y(0.29), X(4.55), Y(0.32), X(5.0), Y(0.26));
  ctx.lineTo(X(5.0),  Y(0.16));
  ctx.bezierCurveTo(X(4.55), Y(0.20), X(3.9), Y(0.17), X(3.7), Y(0.13));
  ctx.closePath();
}

// ─── Full jet render (silhouette + glow + trail) ──────────────────────────────
function drawJet(
  ctx:     CanvasRenderingContext2D,
  x:       number,
  y:       number,
  s:       number,
  opacity: number,
  // optional: extra heat distortion intensity for sonic pass
  heat: number = 0,
) {
  ctx.save();

  // ── Motion-blur ghost trail ───────────────────────────────────────────────
  // 22 stretched, quad-faded copies extending rearward — more layers = blurrier
  const TRAIL_LAYERS = 22;
  for (let i = TRAIL_LAYERS; i >= 1; i--) {
    const layerT = i / TRAIL_LAYERS;
    const gOp   = opacity * layerT * layerT * 0.055; // quad falloff
    const gSX   = 1 + layerT * 1.4;                 // heavy horizontal stretch
    const gOX   = x + layerT * s * 9.5;             // long rearward offset
    traceJetBody(ctx, gOX, y, s, gSX);
    ctx.fillStyle = `rgba(180,180,180,${gOp})`;
    ctx.fill();
  }

  // ── Air-compression / bow-shock cone ahead of nose ───────────────────────
  const coneGrad = ctx.createRadialGradient(x + s * 0.8, y, 0, x + s * 0.8, y, s * 2.6);
  coneGrad.addColorStop(0,    `rgba(230,230,230,${opacity * 0.18})`);
  coneGrad.addColorStop(0.35, `rgba(190,190,190,${opacity * 0.07})`);
  coneGrad.addColorStop(1,    "rgba(0,0,0,0)");
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y, s * 2.6, s * 0.60, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Engine exhaust glow (twin nacelles) ──────────────────────────────────
  const ENGINE_VERTICAL_OFFSET = 0.34;
  const engineX = x - 6.65 * s;
  for (const yOff of [-ENGINE_VERTICAL_OFFSET, ENGINE_VERTICAL_OFFSET]) {
    const ey   = y + yOff * s;
    // Core white-hot exhaust
    const core = ctx.createRadialGradient(engineX, ey, 0, engineX, ey, s * 0.55);
    core.addColorStop(0,    `rgba(255,255,255,${opacity * 0.95})`);
    core.addColorStop(0.30, `rgba(230,230,230,${opacity * 0.45})`);
    core.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(engineX, ey, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Wide ambient halo
    const halo = ctx.createRadialGradient(engineX, ey, 0, engineX, ey, s * 1.4);
    halo.addColorStop(0,    `rgba(200,200,200,${opacity * 0.22})`);
    halo.addColorStop(0.5,  `rgba(150,150,150,${opacity * 0.08})`);
    halo.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(engineX, ey, s * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Intake scoops (dark-fill detail panels) ──────────────────────────────
  for (const side of [1, -1] as const) {
    traceIntake(ctx, x, y, s, side);
    ctx.fillStyle = `rgba(10,10,10,${opacity * 0.55})`;
    ctx.fill();
    // thin bright rim
    ctx.strokeStyle = `rgba(210,210,210,${opacity * 0.28})`;
    ctx.lineWidth   = 0.5;
    ctx.stroke();
  }

  // ── Main body silhouette with 3-tone gradient ────────────────────────────
  traceJetBody(ctx, x, y, s, 1);
  const bodyGrad = ctx.createLinearGradient(x, y - s * 3.2, x, y + s * 3.2);
  bodyGrad.addColorStop(0,    `rgba(20,20,20,${opacity * 0.30})`);
  bodyGrad.addColorStop(0.20, `rgba(100,100,100,${opacity * 0.68})`);
  bodyGrad.addColorStop(0.45, `rgba(220,220,220,${opacity})`);
  bodyGrad.addColorStop(0.55, `rgba(220,220,220,${opacity})`);
  bodyGrad.addColorStop(0.80, `rgba(100,100,100,${opacity * 0.68})`);
  bodyGrad.addColorStop(1,    `rgba(20,20,20,${opacity * 0.30})`);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // ── Specular centreline highlight ────────────────────────────────────────
  ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.55})`;
  ctx.lineWidth   = 0.9;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - s * 1.5, y - 0.015 * s,
    x - s * 4.0, y - 0.025 * s,
    x - s * 7.5, y - 0.035 * s,
  );
  ctx.stroke();

  // ── Canard highlight lines ────────────────────────────────────────────────
  ctx.strokeStyle = `rgba(240,240,240,${opacity * 0.30})`;
  ctx.lineWidth   = 0.6;
  for (const side of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(x - 1.7 * s, y + side * 0.13 * s);
    ctx.lineTo(x - 2.75 * s, y + side * 0.59 * s);
    ctx.stroke();
  }

  // ── Sonic-boom heat shimmer (only near screen centre) ─────────────────────
  if (heat > 0.01) {
    const shimmer = ctx.createRadialGradient(x, y, 0, x, y, s * 7);
    shimmer.addColorStop(0,   `rgba(255,255,255,${heat * 0.22})`);
    shimmer.addColorStop(0.3, `rgba(200,200,200,${heat * 0.10})`);
    shimmer.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = shimmer;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 7, s * 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── Shockwave ring ───────────────────────────────────────────────────────────
interface Ring { x: number; y: number; rx: number; op: number; speed: number }

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

    // ── Timing — synced to the LUPIN disintegration cycle (22 s) ────────────
    const LOOP              = 22;   // matches CYCLE in HeroSection
    const JET_OFFSET        = 3.0;  // jet launches at 3.0 s; visible by ~3.5 s (approx, varies with screen width)
    const FLIGHT            = 1.0;  // seconds to cross full screen (hypersonic fast)
    const JET_Y             = 0.44; // vertical position ratio (slightly above centre)
    // Scale / geometry constants
    const SCALE_FACTOR      = 0.044; // jet scale as fraction of canvas width
    const JET_LENGTH_SCALE  = 8.2;   // fuselage body length in scale units (determines overrun)
    const SCREEN_PADDING    = 0.05;  // extra offscreen margin so tail is fully hidden before entry
    // Fade envelope thresholds (as fraction of FLIGHT progress 0→1)
    const FADE_IN_THRESHOLD  = 0.08; // first 8% of flight: fade in
    const FADE_OUT_THRESHOLD = 0.85; // last 15% of flight: fade out

    const rings: Ring[] = [];
    const startTime = performance.now();
    let sonicFired  = false; // sonic-boom flash fires once per pass

    // ── Render loop ──────────────────────────────────────────────────────────
    const render = () => {
      const now      = performance.now();
      const loopTime = ((now - startTime) / 1000) % LOOP;
      ctx.clearRect(0, 0, cw, ch);

      // ── Volumetric centre bloom ──────────────────────────────────────────
      const bloomPhase = (now / 1000) * 0.38;
      const bloomOp    = 0.016 + Math.sin(bloomPhase) * 0.004;
      const bloom = ctx.createRadialGradient(cw * 0.5, ch * 0.5, 0, cw * 0.5, ch * 0.5, cw * 0.40);
      bloom.addColorStop(0,   `rgba(255,255,255,${bloomOp * 3})`);
      bloom.addColorStop(0.4, `rgba(200,200,200,${bloomOp})`);
      bloom.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, cw, ch);

      // ── Moving fog / atmosphere bands ────────────────────────────────────
      const fogT = (now / 1000) * 0.18;
      for (let i = 0; i < 3; i++) {
        const fogY  = ch * (0.28 + i * 0.14) + Math.sin(fogT + i * 1.4) * ch * 0.018;
        const fogH  = ch * 0.13;
        const fogOp = 0.024 - i * 0.006;
        const fog   = ctx.createLinearGradient(0, fogY, 0, fogY + fogH);
        fog.addColorStop(0,    "rgba(100,100,100,0)");
        fog.addColorStop(0.35, `rgba(110,110,110,${fogOp})`);
        fog.addColorStop(0.65, `rgba(90,90,90,${fogOp})`);
        fog.addColorStop(1,    "rgba(80,80,80,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, fogY, cw, fogH);
      }

      // ── Jet pass (active inside JET_OFFSET … JET_OFFSET+FLIGHT+0.6 s) ───
      const jetTime = loopTime - JET_OFFSET; // seconds since jet launched this loop

      // Reset sonic-boom flag for next loop
      if (loopTime < JET_OFFSET) sonicFired = false;

      if (jetTime >= 0 && jetTime < FLIGHT + 0.6) {
        const progress = jetTime / FLIGHT;           // 0 → 1+ across screen
        const s        = cw * SCALE_FACTOR;

        // Nose from offscreen-left to offscreen-right at high speed
        const overrun = JET_LENGTH_SCALE * s + cw * SCREEN_PADDING;
        const jetX    = -overrun + (cw + overrun * 2) * Math.min(progress, 1.0);
        const jetY    = ch * JET_Y;

        // Opacity: fade in quickly, visible, then dissolve
        const fIn  = FADE_IN_THRESHOLD;
        const fOut = FADE_OUT_THRESHOLD;
        let   jetOp = 1;
        if (progress < fIn)       jetOp = progress / fIn;
        else if (progress > fOut) jetOp = Math.max(0, 1 - (progress - fOut) / (1 - fOut));
        jetOp = Math.min(jetOp, 1) * 0.85;

        // Sonic-boom heat shimmer: peaks when jet crosses 45–55% (screen centre)
        const heat = Math.max(0, 1 - Math.abs(progress - 0.50) / 0.06) * jetOp;

        if (jetOp > 0.004) {
          drawJet(ctx, jetX, jetY, s, jetOp, heat);

          // Spawn shockwave rings at engine positions during mid-flight
          if (progress > 0.05 && progress < 0.90 && Math.random() < 0.09) {
            rings.push({
              x:     jetX - 2.0 * s,
              y:     jetY,
              rx:    0,
              op:    0.14 * jetOp,
              speed: 5.0 + Math.random() * 3.0,
            });
          }

          // Sonic boom: one large ring burst at screen centre
          if (!sonicFired && progress >= 0.45 && progress < 0.55) {
            sonicFired = true;
            for (let k = 0; k < 4; k++) {
              rings.push({
                x:     jetX,
                y:     jetY,
                rx:    k * s * 0.8,
                op:    0.20 * jetOp,
                speed: 7.0 + k * 2.5,
              });
            }
          }
        }
      }

      // ── Shockwave / ripple rings ─────────────────────────────────────────
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.rx += ring.speed;
        ring.op *= 0.952;

        if (ring.op < 0.003 || ring.rx > cw * 0.30) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(210,210,210,${ring.op})`;
        ctx.lineWidth   = 1.2;
        ctx.filter      = "blur(2px)";
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, ring.rx, ring.rx * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── Light streak lingers on the flight path after the pass ───────────
      const jetTimeForStreak = loopTime - JET_OFFSET;
      if (jetTimeForStreak >= 0 && jetTimeForStreak < FLIGHT * 1.8) {
        const streakAlpha = Math.max(0, 1 - jetTimeForStreak / (FLIGHT * 1.8)) * 0.022;
        const sy          = ch * JET_Y;
        const streak      = ctx.createLinearGradient(0, sy, 0, sy + 1);
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
