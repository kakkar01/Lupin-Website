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
    transition: { duration: 1.2, ease: "easeOut" as const, delay } as Transition,
  },
});

// ── Left badge: A/ ●● 1 ──────────────────────────────────────────────────────
function LeftBadge({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-5 select-none"
    >
      <span
        className="text-white font-light tracking-widest"
        style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)", letterSpacing: "0.12em" }}
      >
        A/
      </span>
      <div className="flex items-center gap-[5px]">
        <div className="w-[9px] h-[9px] rounded-full bg-white opacity-90" />
        <div className="w-[9px] h-[9px] rounded-full bg-white opacity-90" />
      </div>
      <span
        className="text-white font-light"
        style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)", letterSpacing: "0.08em" }}
      >
        1
      </span>
    </motion.div>
  );
}

// ── Dot matrix ───────────────────────────────────────────────────────────────
function DotMatrix({ delay = 0 }: { delay?: number }) {
  const cols = 7;
  const rows = 3;
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="grid gap-[4px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 5px)`, gridTemplateRows: `repeat(${rows}, 5px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: "rgba(255,255,255,0.55)" }}
        />
      ))}
    </motion.div>
  );
}

// ── White rect + dot matrix cluster ─────────────────────────────────────────
function MarkerCluster({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-4"
    >
      {/* White rect */}
      <div
        className="bg-white opacity-80"
        style={{ width: "clamp(28px, 3.5vw, 42px)", height: "clamp(12px, 1.4vw, 16px)" }}
      />
      {/* Dot matrix */}
      <DotMatrix delay={delay + 0.12} />
    </motion.div>
  );
}

// ── Microtext column ─────────────────────────────────────────────────────────
function MicroInfo({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-[3px]"
    >
      <span className="microtext">LETTER &ldquo;A&rdquo;&nbsp;&nbsp;&nbsp;&nbsp;FORWARD</span>
      <span className="microtext">SLASH ZERO&nbsp;&nbsp;ZERO ONE</span>
    </motion.div>
  );
}

// ── Noise flicker on LUPIN ───────────────────────────────────────────────────
function LupinTitle() {
  const controls = useAnimationControls();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      // Initial fade-in
      await controls.start("visible");
      // Periodic flicker
      while (mounted) {
        await new Promise((r) => setTimeout(r, 3000 + Math.random() * 4000));
        if (!mounted) break;
        await controls.start({
          opacity: [1, 0.4, 1, 0.6, 1],
          transition: { duration: 0.18, ease: "linear" as const },
        });
      }
    };
    run();
    return () => { mounted = false; };
  }, [controls]);

  return (
    <motion.h1
      variants={fadeUp(0.3)}
      initial="hidden"
      animate={controls}
      className="text-white font-bold select-none leading-none"
      style={{
        fontSize: "clamp(5.5rem, 14vw, 14rem)",
        letterSpacing: "-0.02em",
        fontStretch: "condensed",
        textTransform: "uppercase",
        fontFamily: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 700,
      }}
    >
      LUPIN
    </motion.h1>
  );
}

// ── Main hero ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden z-10">
      {/* ── Horizontal mid-bar ── */}
      <div className="relative w-full flex items-center">
        {/* Thin full-width horizontal rule */}
        <motion.div
          variants={fadeIn(0.8)}
          initial="hidden"
          animate="visible"
          className="absolute left-0 right-0 h-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
          aria-hidden="true"
        />

        {/* Content row */}
        <div
          className="relative w-full flex items-center justify-between"
          style={{ padding: "0 clamp(1.5rem, 5vw, 5rem)" }}
        >
          {/* LEFT: A/ ●● 1 + microtext */}
          <div className="flex items-center gap-8">
            <LeftBadge delay={0.6} />
            <MicroInfo delay={0.75} />
          </div>

          {/* CENTER: marker cluster */}
          <MarkerCluster delay={0.9} />

          {/* RIGHT: A/ ●● 1 mirror */}
          <LeftBadge delay={0.6} />
        </div>
      </div>

      {/* ── Central typography block ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        style={{ gap: "clamp(0.5rem, 1.5vw, 1.2rem)" }}
      >
        {/* Floating wrapper */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
          style={{ gap: "clamp(0.4rem, 1.2vw, 1rem)" }}
        >
          <LupinTitle />

          <motion.p
            variants={fadeUp(0.55)}
            initial="hidden"
            animate="visible"
            className="text-white tracking-ultra uppercase text-center font-light"
            style={{
              fontSize: "clamp(0.6rem, 1.1vw, 0.9rem)",
              letterSpacing: "0.38em",
              opacity: 0.7,
            }}
          >
            2045 AGENT COMING SOON
          </motion.p>

          {/* Thin divider */}
          <motion.div
            variants={fadeIn(0.7)}
            initial="hidden"
            animate="visible"
            className="w-16 h-px bg-white opacity-20 mt-1"
            aria-hidden="true"
          />

          {/* Microtext pair */}
          <motion.div
            variants={fadeUp(0.85)}
            initial="hidden"
            animate="visible"
            className="flex gap-8 mt-1"
          >
            <span className="microtext">FORWARD</span>
            <span className="microtext">ZERO ZERO ONE</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scanline decorative corners ── */}
      {/* Top-left corner bracket */}
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute top-8 left-8 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.3 }}
      >
        <div className="w-5 h-px bg-white" />
        <div className="w-px h-5 bg-white" />
      </motion.div>
      {/* Top-right corner bracket */}
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute top-8 right-8 pointer-events-none flex flex-col items-end"
        aria-hidden="true"
        style={{ opacity: 0.3 }}
      >
        <div className="w-5 h-px bg-white" />
        <div className="w-px h-5 bg-white self-end" />
      </motion.div>
      {/* Bottom-left */}
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-8 pointer-events-none flex flex-col justify-end"
        aria-hidden="true"
        style={{ opacity: 0.3 }}
      >
        <div className="w-px h-5 bg-white" />
        <div className="w-5 h-px bg-white" />
      </motion.div>
      {/* Bottom-right */}
      <motion.div
        variants={fadeIn(1.1)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 right-8 pointer-events-none flex flex-col items-end justify-end"
        aria-hidden="true"
        style={{ opacity: 0.3 }}
      >
        <div className="w-px h-5 bg-white self-end" />
        <div className="w-5 h-px bg-white" />
      </motion.div>

      {/* ── Bottom status line ── */}
      <motion.div
        variants={fadeIn(1.3)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ opacity: 0.35 }}
      >
        <span className="microtext">SYSTEM ONLINE · INIT 001</span>
      </motion.div>
    </section>
  );
}
