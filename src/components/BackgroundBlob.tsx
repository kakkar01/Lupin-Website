"use client";

import { useEffect, useRef } from "react";

export default function BackgroundBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;

      // Slow independent breathing oscillators
      const b1 = (Math.sin(t * 0.00075) + 1) / 2;   // ~8.4s period
      const b2 = (Math.sin(t * 0.00120 + 1.2) + 1) / 2; // ~5.2s period
      const drift = Math.sin(t * 0.00040) * 0.015;   // very slow lateral drift

      ctx.clearRect(0, 0, w, h);

      // === Base ===
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // === Cinematic silhouette — tall vertical backlit figure ===
      ctx.save();
      ctx.filter = "blur(88px)";
      const cx = w * (0.5 + drift);
      const cy = h * 0.44;
      const bodyRx = Math.min(w, h) * 0.11;
      const bodyRy = Math.min(w, h) * 0.36;
      const silOp = 0.24 + b1 * 0.10;

      // Body — vertical ellipse
      const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyRy);
      bodyGrad.addColorStop(0, `rgba(215,215,215,${silOp})`);
      bodyGrad.addColorStop(0.28, `rgba(130,130,130,${silOp * 0.55})`);
      bodyGrad.addColorStop(0.65, `rgba(50,50,50,${silOp * 0.18})`);
      bodyGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bodyRx, bodyRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head — smaller ellipse above
      const headY = cy - bodyRy * 0.62;
      const headR = bodyRx * 0.75;
      const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, headR * 2.2);
      headGrad.addColorStop(0, `rgba(230,230,230,${silOp * 0.8})`);
      headGrad.addColorStop(0.4, `rgba(120,120,120,${silOp * 0.35})`);
      headGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(cx, headY, headR, headR, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // === Wide ambient bloom (breathing) ===
      ctx.save();
      ctx.filter = "blur(130px)";
      const ambOp = 0.06 + b2 * 0.035;
      const ambGrad = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.65);
      ambGrad.addColorStop(0, `rgba(160,160,160,${ambOp})`);
      ambGrad.addColorStop(0.45, `rgba(65,65,65,${ambOp * 0.45})`);
      ambGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // === Subtle accent — lower-right glow ===
      ctx.save();
      ctx.filter = "blur(70px)";
      const accentGrad = ctx.createRadialGradient(w * 0.78, h * 0.72, 0, w * 0.78, h * 0.72, w * 0.22);
      accentGrad.addColorStop(0, "rgba(70,70,70,0.08)");
      accentGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = accentGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // === Upper-left secondary light ===
      ctx.save();
      ctx.filter = "blur(55px)";
      const ulGrad = ctx.createRadialGradient(w * 0.14, h * 0.16, 0, w * 0.14, h * 0.16, w * 0.2);
      ulGrad.addColorStop(0, "rgba(75,75,75,0.09)");
      ulGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ulGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // === Deep cinematic vignette (no blur) ===
      ctx.save();
      ctx.filter = "none";

      const vL = ctx.createLinearGradient(0, 0, w * 0.38, 0);
      vL.addColorStop(0, "rgba(0,0,0,0.97)");
      vL.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = vL;
      ctx.fillRect(0, 0, w, h);

      const vR = ctx.createLinearGradient(w * 0.62, 0, w, 0);
      vR.addColorStop(0, "rgba(0,0,0,0)");
      vR.addColorStop(1, "rgba(0,0,0,0.97)");
      ctx.fillStyle = vR;
      ctx.fillRect(0, 0, w, h);

      const vTB = ctx.createLinearGradient(0, 0, 0, h);
      vTB.addColorStop(0, "rgba(0,0,0,0.88)");
      vTB.addColorStop(0.18, "rgba(0,0,0,0)");
      vTB.addColorStop(0.80, "rgba(0,0,0,0)");
      vTB.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = vTB;
      ctx.fillRect(0, 0, w, h);

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
