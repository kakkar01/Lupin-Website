"use client";

import { motion } from "framer-motion";

// ── Micro-grid overlay ────────────────────────────────────────────────────────
function MicroGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 55%, black 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 55%, black 100%)",
      }}
      aria-hidden="true"
    />
  );
}

// ── Horizontal light streak ───────────────────────────────────────────────────
function LightStreak() {
  return (
    <motion.div
      className="absolute inset-x-0 pointer-events-none"
      style={{ top: "50%", translateY: "-50%" }}
      aria-hidden="true"
    >
      {/* Wide ambient smear */}
      <motion.div
        className="w-full"
        style={{
          height: 120,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.05) 75%, transparent 100%)",
          filter: "blur(18px)",
        }}
        animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.85, 1.08, 0.85] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Thin crisp streak */}
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: "50%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 70%, transparent 100%)",
          filter: "blur(1px)",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </motion.div>
  );
}

// ── LUPIN disintegration title ────────────────────────────────────────────────
const LETTERS = ["L", "U", "P", "I", "N"] as const;
const CYCLE   = 22; // seconds per full loop

// ── Shared typography constant ────────────────────────────────────────────────
const FONT_STACK = "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif";

const baseStyle: React.CSSProperties = {
  fontSize:      "clamp(5rem, 13.5vw, 13.5rem)",
  fontWeight:    300,
  fontFamily:    FONT_STACK,
  lineHeight:    1,
  display:       "inline-block",
  textShadow:
    "0 0 120px rgba(255,255,255,0.14), 0 0 48px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.04)",
};

function LupinDisintegrate() {
  return (
    <div
      className="relative select-none flex"
      style={{ letterSpacing: "0.06em", isolation: "isolate" }}
    >
      {/* Soft bloom behind text */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-50% -30%",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)",
          filter: "blur(24px)",
        }}
        aria-hidden="true"
      />

      {LETTERS.map((letter, i) => {
        // Staggered disintegration timing — each letter is 1.1 s apart
        const stagger    = i * 1.1;
        const t1 = (3.5 + stagger) / CYCLE; // start of disintegration
        const t2 = (5.5 + stagger) / CYCLE; // mid (blurring)
        const t3 = (8.0 + stagger) / CYCLE; // fully gone
        const t4 = 0.84;                     // still gone
        const t5 = 0.91;                     // reappear
        const t6 = 1.00;                     // stable / cycle end

        // Drift direction alternates per letter
        const dx = i % 2 === 0 ? 10 : -10;

        return (
          <motion.span
            key={i}
            className="text-white"
            style={baseStyle}
            initial={{ opacity: 0, filter: "blur(14px)", y: 12 }}
            animate={{
              opacity: [0, 1,    1,    0.75, 0,         0,    1,    1],
              filter:  [
                "blur(14px)",
                "blur(0px)",
                "blur(0px)",
                "blur(5px)",
                "blur(22px)",
                "blur(22px)",
                "blur(4px)",
                "blur(0px)",
              ],
              x: [0, 0, 0, dx * 0.4, dx, dx, 0, 0],
              y: [12, 0, 0, -3,       -9, -9, 0, 0],
            }}
            transition={{
              duration: CYCLE,
              times:    [0, 0.08, t1, t2, t3, t4, t5, t6],
              ease:     "easeInOut",
              repeat:   Infinity,
            }}
          >
            {letter}
          </motion.span>
        );
      })}
    </div>
  );
}

// ── Main hero section ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y:       0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const, delay },
  },
});

const fadeIn = (delay = 0) => ({
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.6, ease: "easeOut" as const, delay },
  },
});

export default function HeroSection() {
  return (
    <>
      <MicroGrid />

      <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden z-10">
        {/* ── Light streak behind text ── */}
        <LightStreak />

        {/* ── Central typography block ── */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
            style={{ gap: "clamp(0.5rem, 1.4vw, 1.1rem)" }}
          >
            <LupinDisintegrate />

            {/* Subtitle */}
            <motion.p
              variants={fadeUp(0.6)}
              initial="hidden"
              animate="visible"
              className="text-white text-center uppercase"
              style={{
                fontSize:      "clamp(0.52rem, 0.9vw, 0.78rem)",
                letterSpacing: "0.44em",
                opacity:       0.50,
                fontWeight:    300,
                fontFamily:    FONT_STACK,
              }}
            >
              2045 AGENT COMING SOON
            </motion.p>

            {/* Thin divider */}
            <motion.div
              variants={fadeIn(0.9)}
              initial="hidden"
              animate="visible"
              className="w-10 h-px bg-white"
              style={{ opacity: 0.12 }}
              aria-hidden="true"
            />
          </motion.div>
        </motion.div>

        {/* ── Corner brackets ── */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <motion.div
            key={pos}
            variants={fadeIn(1.3)}
            initial="hidden"
            animate="visible"
            className={[
              "absolute pointer-events-none",
              pos.startsWith("t") ? "top-8" : "bottom-8",
              pos.endsWith("l")  ? "left-8" : "right-8",
              pos === "tr" || pos === "br" ? "flex flex-col items-end" : "",
              pos === "bl" ? "flex flex-col justify-end" : "",
              pos === "br" ? "flex flex-col items-end justify-end" : "",
            ].join(" ")}
            style={{ opacity: 0.22 }}
            aria-hidden="true"
          >
            {pos === "tl" && (
              <>
                <div className="w-4 h-px bg-white" />
                <div className="w-px h-4 bg-white" />
              </>
            )}
            {pos === "tr" && (
              <>
                <div className="w-4 h-px bg-white" />
                <div className="w-px h-4 bg-white self-end" />
              </>
            )}
            {pos === "bl" && (
              <>
                <div className="w-px h-4 bg-white" />
                <div className="w-4 h-px bg-white" />
              </>
            )}
            {pos === "br" && (
              <>
                <div className="w-px h-4 bg-white self-end" />
                <div className="w-4 h-px bg-white" />
              </>
            )}
          </motion.div>
        ))}
      </section>
    </>
  );
}
