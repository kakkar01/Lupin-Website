"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const dotX = useMotionValue(-9999);
  const dotY = useMotionValue(-9999);

  const glowX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const cursorX = useSpring(dotX, { stiffness: 400, damping: 30 });
  const cursorY = useSpring(dotY, { stiffness: 400, damping: 30 });

  const isVisible = useRef(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      isVisible.current = true;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [rawX, rawY, dotX, dotY]);

  return (
    <>
      {/* Large ambient glow */}
      <motion.div
        className="fixed pointer-events-none z-[50] rounded-full"
        style={{
          width: 500,
          height: 500,
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      {/* Sharp cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[101]"
        style={{
          width: 6,
          height: 6,
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          background: "#fff",
          borderRadius: "50%",
          mixBlendMode: "difference",
        }}
        aria-hidden="true"
      />
    </>
  );
}
