"use client";

import { useEffect, useRef } from "react";

export default function BackgroundBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark base
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Large soft orb – center-right
      const grad1 = ctx.createRadialGradient(
        w * 0.62, h * 0.42, 0,
        w * 0.62, h * 0.42, w * 0.48
      );
      grad1.addColorStop(0, "rgba(180,180,180,0.55)");
      grad1.addColorStop(0.35, "rgba(110,110,110,0.25)");
      grad1.addColorStop(0.7, "rgba(40,40,40,0.08)");
      grad1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Secondary orb – upper left fade
      const grad2 = ctx.createRadialGradient(
        w * 0.15, h * 0.2, 0,
        w * 0.15, h * 0.2, w * 0.28
      );
      grad2.addColorStop(0, "rgba(80,80,80,0.12)");
      grad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Darken left edge harshly
      const grad3 = ctx.createLinearGradient(0, 0, w * 0.45, 0);
      grad3.addColorStop(0, "rgba(0,0,0,0.92)");
      grad3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);

      // Darken right edge
      const grad4 = ctx.createLinearGradient(w * 0.7, 0, w, 0);
      grad4.addColorStop(0, "rgba(0,0,0,0)");
      grad4.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = grad4;
      ctx.fillRect(0, 0, w, h);

      // Vignette top/bottom
      const grad5 = ctx.createLinearGradient(0, 0, 0, h);
      grad5.addColorStop(0, "rgba(0,0,0,0.7)");
      grad5.addColorStop(0.3, "rgba(0,0,0,0)");
      grad5.addColorStop(0.7, "rgba(0,0,0,0)");
      grad5.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = grad5;
      ctx.fillRect(0, 0, w, h);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
