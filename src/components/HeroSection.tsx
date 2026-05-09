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

// ── Eclipse orb ───────────────────────────────────────────────────────────────
function EclipseOrb() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 3 }}
      aria-hidden="true"
    >
      {/* Layer 1: Wide outer atmospheric haze */}
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          width:        "clamp(520px, 82vw, 1060px)",
          height:       "clamp(520px, 82vw, 1060px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, transparent 28%, rgba(255,255,255,0.035) 48%, rgba(255,255,255,0.075) 62%, rgba(255,255,255,0.025) 76%, transparent 88%)",
          filter: "blur(52px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 2: Secondary haze ring for depth */}
      <motion.div
        animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{
          position:     "absolute",
          width:        "clamp(400px, 64vw, 820px)",
          height:       "clamp(400px, 64vw, 820px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, transparent 36%, rgba(255,255,255,0.055) 54%, rgba(255,255,255,0.10) 64%, rgba(255,255,255,0.03) 78%, transparent 90%)",
          filter: "blur(28px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 3: Corona bloom — bright rim around the black core */}
      <motion.div
        animate={{ scale: [1, 1.025, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        style={{
          position:     "absolute",
          width:        "clamp(300px, 48vw, 640px)",
          height:       "clamp(300px, 48vw, 640px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 42%, rgba(255,255,255,0.28) 54%, rgba(255,255,255,0.13) 64%, rgba(255,255,255,0.04) 76%, transparent 88%)",
          filter: "blur(14px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 4: Solid black core */}
      <motion.div
        animate={{ scale: [1, 1.012, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          width:        "clamp(190px, 28vw, 380px)",
          height:       "clamp(190px, 28vw, 380px)",
          borderRadius: "50%",
          background:   "#000",
          boxShadow:
            "0 0 0 1.5px rgba(255,255,255,0.07), 0 0 36px 10px rgba(255,255,255,0.11), 0 0 80px 28px rgba(255,255,255,0.06), 0 0 160px 60px rgba(255,255,255,0.02)",
          willChange: "transform",
        }}
      />

      {/* Layer 5: Inner rim highlight on core edge */}
      <div
        style={{
          position:     "absolute",
          width:        "clamp(190px, 28vw, 380px)",
          height:       "clamp(190px, 28vw, 380px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, transparent 68%, rgba(255,255,255,0.09) 79%, rgba(255,255,255,0.16) 90%, rgba(255,255,255,0.04) 100%)",
        }}
      />

      {/* Layer 6: Grain texture over glow area */}
      <div
        style={{
          position:     "absolute",
          width:        "clamp(520px, 82vw, 1060px)",
          height:       "clamp(520px, 82vw, 1060px)",
          borderRadius: "50%",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          mixBlendMode:   "overlay",
          opacity:        0.065,
          maskImage:
            "radial-gradient(circle at 50% 50%, black 35%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 35%, transparent 68%)",
        }}
      />

      {/* Layer 7: Slow-rotating fog wisps */}
      <motion.div
        animate={{ rotate: [0, 360], opacity: [0.035, 0.07, 0.035] }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        style={{
          position:     "absolute",
          width:        "clamp(360px, 58vw, 780px)",
          height:       "clamp(360px, 58vw, 780px)",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.045) 35deg, transparent 72deg, transparent 152deg, rgba(255,255,255,0.032) 192deg, transparent 232deg, transparent 316deg, rgba(255,255,255,0.022) 356deg, transparent 360deg)",
          filter:     "blur(28px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Layer 8: Counter-rotating secondary fog for parallax depth */}
      <motion.div
        animate={{ rotate: [360, 0], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{
          position:     "absolute",
          width:        "clamp(300px, 48vw, 640px)",
          height:       "clamp(300px, 48vw, 640px)",
          borderRadius: "50%",
          background:
            "conic-gradient(from 120deg, transparent 0deg, rgba(255,255,255,0.035) 28deg, transparent 60deg, transparent 200deg, rgba(255,255,255,0.025) 230deg, transparent 268deg, transparent 360deg)",
          filter:     "blur(22px)",
          willChange: "transform, opacity",
        }}
      />
    </div>
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
        {/* ── Eclipse orb — cinematic visual anchor ── */}
        <EclipseOrb />

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
