"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SYMBOL_POOL = [
  "$", "€", "¥", "₹", "₿", "£", "₩",
  "24.7K", "−0.32%", "+1.87%", "0.0083",
  "XAU/USD", "ETH/BTC", "SPX", "NDX", "DXY",
  "INIT:001", "/2045", "SIG.DETECT",
  "NODE:443", "FORWARD", "ZERO.ONE",
  "01101001", "11001011", "10110100",
  "AI_EXEC", "NEURAL.SYS", "QUANT.ALGO",
  "47.29°N", "122.42°W", "UTC+0000",
  "ALPHA.3", "DELTA.7", "OMEGA.1",
  "−14.2bps", "+0.004σ", "VOL:0.18",
  "ACCESS /SYSTEM", "SIGNAL LOCKED", "LAYER::02",
];

interface FloatItem {
  id: number;
  text: string;
  startX: number;
  startY: number;
  opacity: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

// Seeded pseudo-random to avoid hydration mismatch — values are generated
// entirely on the client inside useEffect.
export default function FloatingSymbols() {
  const [items, setItems] = useState<FloatItem[]>([]);

  useEffect(() => {
    const seed = (n: number) => {
      // Simple LCG pseudo-random seeded per index so layout is stable
      const a = 1664525;
      const c = 1013904223;
      const m = 2 ** 32;
      let state = n * 1000003;
      const next = () => { state = (a * state + c) % m; return state / m; };
      return next;
    };

    setItems(
      Array.from({ length: 32 }, (_, i) => {
        const r = seed(i);
        return {
          id: i,
          text: SYMBOL_POOL[i % SYMBOL_POOL.length],
          startX: r() * 100,
          startY: r() * 100,
          opacity: 0.04 + r() * 0.08,   // 4 – 12 %
          size: 7 + r() * 6,             // 7 – 13 px
          duration: 22 + r() * 28,       // 22 – 50 s
          delay: -(r() * 40),            // start mid-cycle
          driftX: (r() - 0.5) * 55,
          driftY: (r() - 0.5) * 75,
        };
      })
    );
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute text-white select-none whitespace-nowrap"
          style={{
            left: `${item.startX}%`,
            top: `${item.startY}%`,
            fontSize: item.size,
            letterSpacing: "0.12em",
            fontFamily: "'Space Grotesk', 'Courier New', monospace",
            fontWeight: 300,
          }}
          animate={{
            x: [0, item.driftX, 0],
            y: [0, item.driftY, 0],
            opacity: [item.opacity, item.opacity * 0.45, item.opacity],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.text}
        </motion.span>
      ))}
    </div>
  );
}
