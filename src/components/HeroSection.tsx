"use client";

import { motion, useAnimationControls, type Variants, type Transition } from "framer-motion";
import { useEffect } from "react";

// ── Shared motion variants ────────────────────────────────────────────────────
const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay } as Transition,
  },
});

const fadeIn = (delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.4, ease: "easeOut" as const, delay } as Transition,
  },
});

// ── Glitch LUPIN title ───────────────────────────────────────────────────────
function LupinTitle() {
  const controls       = useAnimationControls();
  const glitch1Ctrl    = useAnimationControls();
  const glitch2Ctrl    = useAnimationControls();
  const glitch3Ctrl    = useAnimationControls();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await controls.start("visible");

      while (mounted) {
        // Random quiet window between glitch bursts
        await new Promise((r) => setTimeout(r, 2800 + Math.random() * 4200));
        if (!mounted) break;

        const burstCount = 1 + Math.floor(Math.random() * 3);
        for (let g = 0; g < burstCount; g++) {
          const dur = 0.08 + Math.random() * 0.10;
          await Promise.all([
            controls.start({
              opacity: [1, 0.55, 1, 0.75, 1],
              transition: { duration: dur + 0.04, ease: "linear" as const },
            }),
            glitch1Ctrl.start({
              x:       [-5, 7, -3, 0],
              opacity: [0, 0.45, 0.22, 0],
              transition: { duration: dur, ease: "linear" as const },
            }),
            glitch2Ctrl.start({
              x:       [4, -8, 3, 0],
              opacity: [0, 0.35, 0.18, 0],
              transition: { duration: dur * 0.85, ease: "linear" as const },
            }),
            glitch3Ctrl.start({
              x:       [-2, 4, -1, 0],
              y:       [1, -2, 1, 0],
              opacity: [0, 0.20, 0.10, 0],
              transition: { duration: dur * 1.1, ease: "linear" as const },
            }),
          ]);
          if (g < burstCount - 1) {
            await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
          }
        }
      }
    };

    run();
    return () => { mounted = false; };
  }, [controls, glitch1Ctrl, glitch2Ctrl, glitch3Ctrl]);

  const baseStyle: React.CSSProperties = {
    fontSize:      "clamp(5rem, 13.5vw, 13.5rem)",
    letterSpacing: "0.06em",
    fontStretch:   "condensed",
    textTransform: "uppercase",
    fontFamily:    "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
    fontWeight:    300,
    lineHeight:    1,
    whiteSpace:    "nowrap",
    display:       "block",
  };

  return (
    <div className="relative select-none" style={{ isolation: "isolate" }}>

      {/* ── Smoky atmospheric bloom (outermost, softest) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-90% -70%",
          background:
            "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.045) 0%, transparent 68%)",
          filter: "blur(55px)",
        }}
        aria-hidden="true"
      />

      {/* ── Tight bloom — gradient diffusion directly behind text ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-45% -28%",
          background:
            "radial-gradient(ellipse 62% 52% at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 42%, transparent 72%)",
          filter: "blur(22px)",
        }}
        aria-hidden="true"
      />

      {/* ── Glitch layer 1 — top ~45% slice, drifts right ── */}
      <motion.div
        animate={glitch1Ctrl}
        initial={{ x: 0, opacity: 0 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ clipPath: "inset(0 0 56% 0)" }}
        aria-hidden="true"
      >
        <span className="text-white" style={baseStyle}>LUPIN</span>
      </motion.div>

      {/* ── Glitch layer 2 — bottom ~52% slice, drifts left ── */}
      <motion.div
        animate={glitch2Ctrl}
        initial={{ x: 0, opacity: 0 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ clipPath: "inset(46% 0 0 0)" }}
        aria-hidden="true"
      >
        <span className="text-white" style={baseStyle}>LUPIN</span>
      </motion.div>

      {/* ── Glitch layer 3 — thin mid-slice (35–65%), subtle diagonal drift ── */}
      <motion.div
        animate={glitch3Ctrl}
        initial={{ x: 0, y: 0, opacity: 0 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ clipPath: "inset(34% 0 34% 0)", filter: "blur(1px)" }}
        aria-hidden="true"
      >
        <span className="text-white" style={{ ...baseStyle, opacity: 0.7 }}>LUPIN</span>
      </motion.div>

      {/* ── Base text (the visible layer) ── */}
      <motion.h1
        variants={fadeUp(0.3)}
        initial="hidden"
        animate={controls}
        className="text-white relative"
        style={{
          ...baseStyle,
          textShadow:
            "0 0 120px rgba(255,255,255,0.14), 0 0 48px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.04)",
          zIndex: 1,
        }}
      >
        LUPIN
      </motion.h1>
    </div>
  );
}

// ── Main hero ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden z-10">
      {/* ── Central typography block ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        style={{ gap: "clamp(0.5rem, 1.5vw, 1.2rem)" }}
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
          style={{ gap: "clamp(0.4rem, 1.2vw, 1rem)" }}
        >
          <LupinTitle />

          <motion.p
            variants={fadeUp(0.55)}
            initial="hidden"
            animate="visible"
            className="text-white tracking-ultra uppercase text-center"
            style={{
              fontSize: "clamp(0.55rem, 1vw, 0.82rem)",
              letterSpacing: "0.42em",
              opacity: 0.55,
              fontWeight: 300,
            }}
          >
            2045 // INSTINCT ACTIVE
          </motion.p>

          {/* Thin divider */}
          <motion.div
            variants={fadeIn(0.7)}
            initial="hidden"
            animate="visible"
            className="w-12 h-px bg-white mt-1"
            style={{ opacity: 0.15 }}
            aria-hidden="true"
          />

          {/* Microtext pair */}
          <motion.div
            variants={fadeUp(0.85)}
            initial="hidden"
            animate="visible"
            className="flex gap-8 mt-1"
          >
            <span className="microtext" style={{ opacity: 0.4 }}>FORWARD</span>
            <span className="microtext" style={{ opacity: 0.4 }}>ZERO ZERO ONE</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Corner brackets ── */}
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute top-8 left-8 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.25 }}
      >
        <div className="w-5 h-px bg-white" />
        <div className="w-px h-5 bg-white" />
      </motion.div>
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute top-8 right-8 pointer-events-none flex flex-col items-end"
        aria-hidden="true"
        style={{ opacity: 0.25 }}
      >
        <div className="w-5 h-px bg-white" />
        <div className="w-px h-5 bg-white self-end" />
      </motion.div>
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-8 pointer-events-none flex flex-col justify-end"
        aria-hidden="true"
        style={{ opacity: 0.25 }}
      >
        <div className="w-px h-5 bg-white" />
        <div className="w-5 h-px bg-white" />
      </motion.div>
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 right-8 pointer-events-none flex flex-col items-end justify-end"
        aria-hidden="true"
        style={{ opacity: 0.25 }}
      >
        <div className="w-px h-5 bg-white self-end" />
        <div className="w-5 h-px bg-white" />
      </motion.div>
    </section>
  );
}
