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
        style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.9rem)", letterSpacing: "0.14em" }}
      >
        A/
      </span>
      <div className="flex items-center gap-[5px]">
        <div className="w-[7px] h-[7px] rounded-full bg-white opacity-80" />
        <div className="w-[7px] h-[7px] rounded-full bg-white opacity-80" />
      </div>
      <span
        className="text-white font-light"
        style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.9rem)", letterSpacing: "0.08em" }}
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
      style={{ gridTemplateColumns: `repeat(${cols}, 4px)`, gridTemplateRows: `repeat(${rows}, 4px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          className="w-[4px] h-[4px] rounded-full"
          style={{ background: "rgba(255,255,255,0.45)" }}
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
      <div
        className="bg-white opacity-70"
        style={{ width: "clamp(24px, 3vw, 38px)", height: "clamp(10px, 1.2vw, 14px)" }}
      />
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
      <span className="microtext" style={{ gap: "1.5rem", display: "inline-flex" }}>
        <span>LETTER &quot;A&quot;</span><span>FORWARD</span>
      </span>
      <span className="microtext" style={{ gap: "1.5rem", display: "inline-flex" }}>
        <span>SLASH ZERO</span><span>ZERO ONE</span>
      </span>
    </motion.div>
  );
}

// ── Noise flicker on LUPIN ───────────────────────────────────────────────────
function LupinTitle() {
  const controls = useAnimationControls();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      await controls.start("visible");
      while (mounted) {
        await new Promise((r) => setTimeout(r, 3500 + Math.random() * 5000));
        if (!mounted) break;
        await controls.start({
          opacity: [1, 0.35, 1, 0.55, 1],
          transition: { duration: 0.16, ease: "linear" as const },
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
      className="text-white select-none leading-none"
      style={{
        fontSize: "clamp(5rem, 13.5vw, 13.5rem)",
        letterSpacing: "0.06em",
        fontStretch: "condensed",
        textTransform: "uppercase",
        fontFamily: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 300,
      }}
    >
      LUPIN
    </motion.h1>
  );
}

// ── Edge coordinate panel (left) ─────────────────────────────────────────────
function LeftEdgePanel({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-[6px] pointer-events-none"
      aria-hidden="true"
    >
      <span className="microtext" style={{ opacity: 0.28 }}>47.2891°N</span>
      <span className="microtext" style={{ opacity: 0.28 }}>122.4194°W</span>
      <div className="w-px h-10 bg-white mt-2" style={{ opacity: 0.1 }} />
      <span className="microtext" style={{ opacity: 0.22 }}>LAYER::02</span>
      <span className="microtext" style={{ opacity: 0.22 }}>SIGNAL LOCKED</span>
    </motion.div>
  );
}

// ── Edge coordinate panel (right) ────────────────────────────────────────────
function RightEdgePanel({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={fadeIn(delay)}
      initial="hidden"
      animate="visible"
      className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end gap-[6px] pointer-events-none"
      aria-hidden="true"
    >
      <span className="microtext" style={{ opacity: 0.28 }}>UTC+0000</span>
      <span className="microtext" style={{ opacity: 0.28 }}>EPOCH:2045</span>
      <div className="w-px h-10 bg-white mt-2 self-end" style={{ opacity: 0.1 }} />
      <span className="microtext" style={{ opacity: 0.22 }}>NODE:443</span>
      <span className="microtext" style={{ opacity: 0.22 }}>ACCESS /SYS</span>
    </motion.div>
  );
}

// ── Main hero ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden z-10">
      {/* ── Horizontal mid-bar ── */}
      <div className="relative w-full flex items-center">
        <motion.div
          variants={fadeIn(0.8)}
          initial="hidden"
          animate="visible"
          className="absolute left-0 right-0 h-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-hidden="true"
        />

        <div
          className="relative w-full flex items-center justify-between"
          style={{ padding: "0 clamp(1.5rem, 5vw, 5rem)" }}
        >
          <div className="flex items-center gap-8">
            <LeftBadge delay={0.6} />
            <MicroInfo delay={0.75} />
          </div>
          <MarkerCluster delay={0.9} />
          <LeftBadge delay={0.6} />
        </div>
      </div>

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
            2045 AGENT COMING SOON
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

      {/* ── Left/Right edge panels ── */}
      <LeftEdgePanel delay={1.4} />
      <RightEdgePanel delay={1.4} />

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

      {/* ── Top status line ── */}
      <motion.div
        variants={fadeIn(1.5)}
        initial="hidden"
        animate="visible"
        className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ opacity: 0.28 }}
      >
        <span className="microtext">SYSTEM ONLINE — INIT 001</span>
      </motion.div>

      {/* ── Bottom status line ── */}
      <motion.div
        variants={fadeIn(1.3)}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ opacity: 0.3 }}
      >
        <span className="microtext">ACCESS NODE /2045 · SIGNAL DETECTED</span>
      </motion.div>
    </section>
  );
}
