"use client";

import { useEffect, useRef } from "react";

// ── Configuration ─────────────────────────────────────────────────────────────
const BLUR_LAYERS    = 16;   // cheetah motion-blur ghost layers
const BLUR_EXTENT    = 270;  // px — how far the speed trail extends
const PARTICLE_COUNT = 110;  // atmospheric dust motes
const SNAKE_SEGS     = 110;  // resolution of snake body ribbon
const DUST_COUNT     = 60;   // ground dust near cheetah feet
const GOD_RAYS       = 8;    // volumetric light shafts

// ── Seeded deterministic PRNG ────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 4);
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Branch builder ────────────────────────────────────────────────────────────
interface BranchLine { x1: number; y1: number; x2: number; y2: number; w: number; op: number }

function buildBranches(cw: number, ch: number): BranchLine[] {
  const lines: BranchLine[] = [];
  const r = mkRng(7);

  const addBranch = (
    x: number, y: number, angle: number, len: number, depth: number, op: number,
  ) => {
    if (depth <= 0 || len < 8) return;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    lines.push({ x1: x, y1: y, x2: ex, y2: ey, w: depth * 0.46 + 0.22, op });
    const splits = depth > 3 ? 2 : r() > 0.30 ? 2 : 1;
    for (let b = 0; b < splits; b++) {
      const da = (r() - 0.5) * 1.1 + (b === 0 ? 0.42 : -0.42);
      addBranch(ex, ey, angle + da, len * (0.55 + r() * 0.20), depth - 1, op * 0.68);
    }
  };

  // Dense right cluster (snake habitat)
  addBranch(cw * 0.87, ch, -Math.PI / 2 + 0.08, ch * 0.32, 8, 0.18);
  addBranch(cw * 0.93, ch, -Math.PI / 2 - 0.20, ch * 0.36, 8, 0.15);
  addBranch(cw * 0.81, ch, -Math.PI / 2 + 0.30, ch * 0.26, 7, 0.13);
  addBranch(cw * 0.97, ch, -Math.PI / 2 - 0.06, ch * 0.30, 7, 0.12);

  // Left sparse branches
  addBranch(cw * 0.05, ch, -Math.PI / 2 - 0.08, ch * 0.26, 6, 0.09);
  addBranch(cw * 0.11, ch, -Math.PI / 2 + 0.24, ch * 0.20, 6, 0.07);

  // Top canopy drooping down (right cluster)
  addBranch(cw * 0.73, 0, Math.PI / 2 + 0.12, ch * 0.24, 7, 0.13);
  addBranch(cw * 0.82, 0, Math.PI / 2 - 0.16, ch * 0.20, 6, 0.11);
  addBranch(cw * 0.63, 0, Math.PI / 2 + 0.28, ch * 0.18, 6, 0.09);

  return lines;
}

function renderBranches(off: CanvasRenderingContext2D, cw: number, ch: number) {
  off.clearRect(0, 0, cw, ch);
  const branches = buildBranches(cw, ch);
  off.lineCap = "round";
  for (const b of branches) {
    off.strokeStyle = `rgba(255,255,255,${b.op})`;
    off.lineWidth = b.w;
    off.beginPath();
    off.moveTo(b.x1, b.y1);
    off.lineTo(b.x2, b.y2);
    off.stroke();
  }
}

// ── God rays (volumetric light shafts) ───────────────────────────────────────
function drawGodRays(ctx: CanvasRenderingContext2D, cw: number, ch: number, time: number) {
  const lx = cw * 0.46; // light source x (slightly left of center)
  const ly = -ch * 0.06; // light source just above screen

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < GOD_RAYS; i++) {
    const angle = (i / GOD_RAYS) * Math.PI * 0.72 - Math.PI * 0.36; // fan spread
    const rayLen = ch * (1.3 + i * 0.04);
    const halfWidth = (Math.PI / 180) * (6 + (i % 3) * 3.5);
    const pulse = Math.sin(time * 0.28 + i * 0.9) * 0.5 + 0.5;
    const op = (0.016 + (i % 3) * 0.006) * (0.65 + pulse * 0.35);

    const ex = lx + Math.sin(angle) * rayLen;
    const ey = ly + Math.cos(angle) * rayLen;

    const grad = ctx.createLinearGradient(lx, ly, ex, ey);
    grad.addColorStop(0,    `rgba(210,218,225,${op * 5})`);
    grad.addColorStop(0.18, `rgba(190,200,210,${op})`);
    grad.addColorStop(0.6,  `rgba(170,180,190,${op * 0.4})`);
    grad.addColorStop(1,    "rgba(150,160,168,0)");

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.arc(lx, ly, rayLen, angle - halfWidth, angle + halfWidth);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

// ── Snake (ribbon-style with scale texture) ───────────────────────────────────
function snakeSpine(s: number, t: number, cw: number, ch: number): { x: number; y: number } {
  // s: 0 = head … 1 = tail — coils through right-side branches
  const phase1 = t * 0.20 - s * Math.PI * 2.8;
  const phase2 = t * 0.35 - s * Math.PI * 1.6;
  const amp1   = cw * 0.042 * (1 - s * 0.28);
  const amp2   = cw * 0.018;
  return {
    x: cw * (0.74 + s * 0.20) + Math.sin(phase1 * 1.65) * amp1 + Math.sin(phase2) * amp2,
    y: ch * (0.34 + s * 0.26) + Math.cos(phase1 * 0.9) * (ch * 0.115 + s * ch * 0.028),
  };
}

function drawSnake(ctx: CanvasRenderingContext2D, t: number, cw: number, ch: number) {
  // Build spine
  const pts: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i <= SNAKE_SEGS; i++) {
    const s = i / SNAKE_SEGS;
    pts.push({ ...snakeSpine(s, t, cw, ch), s });
  }

  // Draw ribbon body from tail → head so head renders on top
  for (let i = pts.length - 2; i >= 0; i--) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const s  = p0.s;

    const dx  = p1.x - p0.x;
    const dy  = p1.y - p0.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) continue;

    const nx = -dy / len;
    const ny =  dx / len;

    // Smooth taper: thick in the middle, tapers at head and tail
    const taperHead = Math.min(s * 10, 1);
    const taperTail = Math.min((1 - s) * 5, 1);
    const r0 = (11.5 * (1 - s * 0.78) + 1.8) * taperHead * taperTail;
    const r1 = (11.5 * (1 - p1.s * 0.78) + 1.8)
      * Math.min(p1.s * 10, 1) * Math.min((1 - p1.s) * 5, 1);

    const edgeFade = Math.min(1, p0.x / (cw * 0.06), (cw - p0.x) / (cw * 0.06));
    const op = (0.72 - s * 0.45) * Math.max(0, edgeFade);
    if (op <= 0.01) continue;

    // Main body — near-black with very dark charcoal
    ctx.beginPath();
    ctx.moveTo(p0.x + nx * r0, p0.y + ny * r0);
    ctx.lineTo(p1.x + nx * r1, p1.y + ny * r1);
    ctx.lineTo(p1.x - nx * r1, p1.y - ny * r1);
    ctx.lineTo(p0.x - nx * r0, p0.y - ny * r0);
    ctx.closePath();
    ctx.fillStyle = `rgba(16,16,16,${op})`;
    ctx.fill();

    // Scale arcs — overlapping half-circles simulate reptile scales
    if (i % 2 === 0 && r0 > 2.8) {
      const ang = Math.atan2(dy, dx);
      ctx.strokeStyle = `rgba(68,68,68,${op * 0.40})`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.arc(p0.x, p0.y, r0 * 0.86, ang + Math.PI * 0.55, ang + Math.PI * 1.45);
      ctx.stroke();
    }

    // Ventral (belly) highlight — subtle silver sheen along the underside
    if (r0 > 3.5) {
      ctx.strokeStyle = `rgba(90,90,90,${op * 0.22})`;
      ctx.lineWidth = r0 * 0.35;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p0.x - nx * r0 * 0.45, p0.y - ny * r0 * 0.45);
      ctx.lineTo(p1.x - nx * r1 * 0.45, p1.y - ny * r1 * 0.45);
      ctx.stroke();
    }
  }

  // Dorsal ridge highlight
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const ef = Math.min(1, p.x / (cw * 0.06), (cw - p.x) / (cw * 0.06));
    if (ef > 0.08) {
      if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
    } else { started = false; }
  }
  ctx.strokeStyle = "rgba(130,130,130,0.11)";
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Snake head — triangular wedge
  const head = pts[0];
  const ef0  = Math.min(1, head.x / (cw * 0.06), (cw - head.x) / (cw * 0.06));
  if (ef0 > 0.1 && pts.length > 2) {
    const headDir = Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x);
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(headDir);

    // Wedge-shaped skull
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.bezierCurveTo(13, -7,  4, -9,  0, -9);
    ctx.bezierCurveTo(-5, -9, -8, -5, -9,  0);
    ctx.bezierCurveTo(-8,  5, -5,  9,  0,  9);
    ctx.bezierCurveTo( 4,  9, 13,  7, 16,  0);
    ctx.fillStyle = `rgba(20,20,20,${0.80 * ef0})`;
    ctx.fill();

    // Eye — amber vertical-slit (serpent eye)
    ctx.beginPath();
    ctx.ellipse(6, -3.5, 2.8, 2.2, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(195,168,28,${0.60 * ef0})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, -3.5, 0.7, 2.0, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(8,4,0,${0.92 * ef0})`;
    ctx.fill();

    ctx.restore();
  }
}

// ── Cheetah silhouette (bezier-curve anatomy) ─────────────────────────────────
function drawCheetahShape(ctx: CanvasRenderingContext2D, phase: number) {
  const bounce   = Math.sin(phase * 2) * 3.5;
  const stretchX = 1 + Math.abs(Math.sin(phase)) * 0.055; // gallop body-length stretch
  const g        = 182; // base grayscale

  ctx.save();
  ctx.translate(0, bounce);
  ctx.scale(stretchX, 1);

  // ── Main torso ──
  ctx.beginPath();
  ctx.moveTo(108, 2);
  ctx.bezierCurveTo(116, 10, 118, 30, 106, 46);
  ctx.bezierCurveTo( 80, 56,  28, 60, -22, 57);
  ctx.bezierCurveTo(-66, 54, -96, 47,-113, 37);
  ctx.bezierCurveTo(-123, 29,-128, 13,-130,  3);
  ctx.bezierCurveTo(-128, -10,-116,-23,-100,-25);
  ctx.bezierCurveTo(-74, -27, -38,-26,   0,-27);
  ctx.bezierCurveTo( 28, -28,  56,-33,  80,-41);
  ctx.bezierCurveTo( 90, -45,  99,-43, 102,-34);
  ctx.bezierCurveTo(105, -25, 107,-14, 108,  2);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-130, -55, 115, 65);
  bodyGrad.addColorStop(0.0, `rgba(${g-14},${g-14},${g-14},0.82)`);
  bodyGrad.addColorStop(0.3, `rgba(${g   },${g   },${g   },1.00)`);
  bodyGrad.addColorStop(0.7, `rgba(${g- 6},${g- 6},${g- 6},0.96)`);
  bodyGrad.addColorStop(1.0, `rgba(${g-30},${g-30},${g-30},0.70)`);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // ── Shoulder hump ──
  ctx.beginPath();
  ctx.ellipse(72, -38, 40, 24, -0.26, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${g+5},${g+5},${g+5},0.55)`;
  ctx.fill();

  // ── Neck ──
  ctx.beginPath();
  ctx.moveTo( 98, -30);
  ctx.bezierCurveTo(110, -37, 125, -41, 139, -37);
  ctx.bezierCurveTo(149, -33, 151, -20, 145, -10);
  ctx.bezierCurveTo(138,  -2, 122,   2, 110,   0);
  ctx.bezierCurveTo(100,  -2,  95, -16,  98, -30);
  ctx.fillStyle = `rgba(${g-4},${g-4},${g-4},0.90)`;
  ctx.fill();

  // ── Head skull ──
  ctx.beginPath();
  ctx.ellipse(151, -34, 27, 21, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${g},${g},${g},0.96)`;
  ctx.fill();

  // ── Muzzle/snout ──
  ctx.beginPath();
  ctx.ellipse(171, -26, 15, 10, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${g+8},${g+8},${g+8},0.84)`;
  ctx.fill();

  // ── Ear shell ──
  ctx.beginPath();
  ctx.moveTo(140, -51);
  ctx.bezierCurveTo(145, -63, 157, -65, 161, -54);
  ctx.bezierCurveTo(163, -47, 159, -40, 151, -38);
  ctx.bezierCurveTo(144, -36, 139, -42, 140, -51);
  ctx.fillStyle = `rgba(${g-14},${g-14},${g-14},0.96)`;
  ctx.fill();

  // Inner ear (dark recess)
  ctx.beginPath();
  ctx.moveTo(143, -51);
  ctx.bezierCurveTo(147, -59, 154, -60, 157, -54);
  ctx.bezierCurveTo(158, -48, 155, -43, 151, -41);
  ctx.closePath();
  ctx.fillStyle = `rgba(${g-50},${g-50},${g-50},0.50)`;
  ctx.fill();

  // ── Eye ──
  ctx.beginPath();
  ctx.ellipse(158, -36, 4.5, 3.5, 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(18,14,8,0.92)";
  ctx.fill();
  // highlight
  ctx.beginPath();
  ctx.ellipse(156, -37, 1.6, 1.2, 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(215,215,215,0.68)";
  ctx.fill();

  // ── Tear marks (cheetah's iconic facial lines) ──
  ctx.strokeStyle = "rgba(48,40,30,0.55)";
  ctx.lineWidth   = 1.4;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(154, -29);
  ctx.bezierCurveTo(152, -21, 150, -13, 148,  -7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(161, -29);
  ctx.bezierCurveTo(160, -22, 159, -15, 157,  -9);
  ctx.stroke();

  // ── Tail ──
  ctx.lineWidth   = 7;
  ctx.strokeStyle = `rgba(${g-18},${g-18},${g-18},0.90)`;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(-130, 3);
  ctx.bezierCurveTo(-155, -12, -176, -36, -163, -60);
  ctx.bezierCurveTo(-152, -72, -135, -68, -129, -55);
  ctx.stroke();
  // tail-tip puff
  ctx.beginPath();
  ctx.ellipse(-130, -58, 9, 7, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${g-10},${g-10},${g-10},0.70)`;
  ctx.fill();

  // ── Legs (thigh → shin → paw, 3-segment) ──
  const legAttach: [number, number][] = [[82, 28], [82, 28], [-80, 30], [-80, 30]];
  const legPhases = [0, Math.PI, Math.PI * 0.55, Math.PI * 1.55];
  const legLen = 72;
  ctx.lineCap = "round";

  for (let i = 0; i < 4; i++) {
    const [lx, ly] = legAttach[i];
    const lp        = phase + legPhases[i];
    const isBack    = i >= 2;
    const lw        = isBack ? 7.5 : 9.5;
    const lop       = isBack ? 0.55 : 0.88;

    const thighAng  = -Math.PI / 2 + 0.80 * Math.sin(lp);
    const kneeX     = lx + Math.cos(thighAng) * legLen * 0.46;
    const kneeY     = ly + Math.sin(thighAng) * legLen * 0.46;

    const shinAng   = thighAng + 0.62 + 0.42 * Math.sin(lp + 0.5);
    const ankleX    = kneeX + Math.cos(shinAng) * legLen * 0.38;
    const ankleY    = kneeY + Math.sin(shinAng) * legLen * 0.38;

    const pawAng    = shinAng - 0.52 + 0.28 * Math.sin(lp + 1.0);
    const pawX      = ankleX + Math.cos(pawAng) * legLen * 0.22;
    const pawY      = ankleY + Math.sin(pawAng) * legLen * 0.22;

    ctx.strokeStyle = `rgba(${g-20},${g-20},${g-20},${lop})`;
    ctx.lineWidth   = lw;
    ctx.beginPath(); ctx.moveTo(lx, ly);      ctx.lineTo(kneeX,  kneeY);  ctx.stroke();
    ctx.lineWidth   = lw * 0.74;
    ctx.beginPath(); ctx.moveTo(kneeX, kneeY); ctx.lineTo(ankleX, ankleY); ctx.stroke();
    ctx.lineWidth   = lw * 0.52;
    ctx.beginPath(); ctx.moveTo(ankleX, ankleY); ctx.lineTo(pawX, pawY);   ctx.stroke();
    // paw pad
    ctx.beginPath();
    ctx.ellipse(pawX, pawY, 5.5, 3.8, pawAng, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${g-25},${g-25},${g-25},${lop * 0.80})`;
    ctx.fill();
  }

  // ── Cheetah spots ──
  ctx.fillStyle = `rgba(${g-82},${g-82},${g-82},0.62)`;
  const spots: [number, number, number, number][] = [
    [  5, -18, 5.5, 4.0], [ 38, -22, 5.2, 3.8], [ 68, -15, 4.8, 3.6],
    [-14, -16, 5.2, 3.6], [-44, -13, 4.8, 3.5], [-70,  -9, 4.2, 3.0],
    [ 20,  14, 4.0, 3.0], [ -4,   8, 4.5, 3.5], [ 52,  10, 4.2, 3.2],
    [-34,   9, 4.2, 3.2], [-58,  14, 4.2, 3.2], [ 30,  -8, 4.0, 3.0],
    [-24,   2, 4.0, 2.8], [ 72, -26, 3.8, 3.0], [-88,  -4, 3.8, 2.8],
    [ 18,  27, 3.6, 2.6], [ 46,  25, 3.6, 2.6], [-50,  22, 3.6, 2.6],
    [-78,   8, 3.8, 3.0], [ 86, -20, 3.4, 2.8], [ 58,  -5, 3.2, 2.6],
    [ 94,  -6, 3.0, 2.4], [-10, -27, 3.2, 2.5], [ 42,  -4, 3.5, 2.8],
  ];
  for (const [sx, sy, srx, sry] of spots) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, srx, sry, Math.atan2(sy, sx) * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCheetah(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  scale: number,
  time: number,
) {
  const phase = time * 3.4;
  // Ghost layers trail to the LEFT — cheetah runs rightward
  for (let i = 0; i < BLUR_LAYERS; i++) {
    const t       = i / (BLUR_LAYERS - 1); // 0 = ghost … 1 = real
    const xOffset = (1 - t) * BLUR_EXTENT;
    const opacity = Math.pow(t, 1.75) * 0.40;
    if (opacity < 0.004) continue;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(cx - xOffset, cy); // subtract = trail goes LEFT
    // Ghosts squish horizontally (velocity distortion)
    ctx.scale(scale * (1 + (1 - t) * 0.12), scale);
    drawCheetahShape(ctx, phase + (1 - t) * 0.45);
    ctx.restore();
  }
}

// ── Ground dust cloud beneath cheetah ────────────────────────────────────────
interface DustMote {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  r: number;
}

function buildDust(cx: number, cy: number): DustMote[] {
  const rng = mkRng(42);
  return Array.from({ length: DUST_COUNT }, () => ({
    x:       cx + (rng() - 0.5) * 180,
    y:       cy + 38 + rng() * 28,
    vx:      -(0.6 + rng() * 2.2),
    vy:      -(0.15 + rng() * 0.70),
    life:    rng() * 90,
    maxLife: 65 + rng() * 75,
    r:       2.5 + rng() * 5.5,
  }));
}

function tickDust(
  ctx: CanvasRenderingContext2D,
  dust: DustMote[],
  cx: number, cy: number,
) {
  for (const d of dust) {
    d.x  += d.vx;
    d.y  += d.vy;
    d.life++;

    if (d.life > d.maxLife) {
      d.x    = cx + (Math.random() - 0.35) * 90;
      d.y    = cy + 35 + Math.random() * 22;
      d.life = 0;
    }

    const t      = d.life / d.maxLife;
    const fadeIn = Math.min(t * 9, 1);
    const fadeOut = t > 0.65 ? Math.max(0, 1 - (t - 0.65) / 0.35) : 1;
    const op     = 0.055 * fadeIn * fadeOut;

    if (op > 0.005) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * (1 + t * 1.8), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,210,210,${op})`;
      ctx.fill();
    }
  }
}

// ── Speed streaks ─────────────────────────────────────────────────────────────
interface Streak { yOff: number; len: number; speed: number; op: number; phase: number }

function buildStreaks(): Streak[] {
  const r = mkRng(99);
  return Array.from({ length: 30 }, () => ({
    yOff:  (r() - 0.5) * 195,
    len:   65  + r() * 290,
    speed: 0.4 + r() * 2.2,
    op:    0.013 + r() * 0.042,
    phase: r() * Math.PI * 2,
  }));
}

function drawStreaks(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  time: number,
  streaks: Streak[],
) {
  ctx.lineCap = "round";
  for (const s of streaks) {
    const vis = (Math.sin(time * s.speed + s.phase) + 1) * 0.5;
    if (vis < 0.04) continue;
    const op = s.op * vis;
    ctx.strokeStyle = `rgba(255,255,255,${op})`;
    ctx.lineWidth   = 0.3 + vis * 0.85;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s.yOff);
    ctx.lineTo(cx - s.len, cy + s.yOff); // streaks trail to the left
    ctx.stroke();
  }
}

// ── Atmospheric particles ─────────────────────────────────────────────────────
interface Mote { x: number; y: number; vx: number; vy: number; op: number; r: number; ph: number }

function buildParticles(cw: number, ch: number): Mote[] {
  const rng = mkRng(13);
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x:  rng() * cw,
    y:  rng() * ch,
    vx: (rng() - 0.5) * 0.26,
    vy: -(0.04 + rng() * 0.16),
    op: 0.020 + rng() * 0.065,
    r:  0.5 + rng() * 2.2,
    ph: rng() * Math.PI * 2,
  }));
}

function tickParticles(
  ctx: CanvasRenderingContext2D,
  motes: Mote[],
  time: number,
  cw: number, ch: number,
) {
  for (const p of motes) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -8)    { p.y = ch + 4; p.x = ((Math.sin(p.ph * 7.3) + 1) * 0.5) * cw; }
    if (p.x < -8)      p.x = cw + 4;
    if (p.x > cw + 8)  p.x = -4;
    const flicker = (Math.sin(time * 1.55 + p.ph) + 1) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${p.op * (0.35 + flicker * 0.65)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Layered cinematic fog ─────────────────────────────────────────────────────
function drawFog(ctx: CanvasRenderingContext2D, cw: number, ch: number, time: number) {
  const p1 = (Math.sin(time * 0.24) + 1) * 0.5;
  const p2 = (Math.sin(time * 0.16 + 1.2) + 1) * 0.5;
  const p3 = (Math.sin(time * 0.32 + 2.4) + 1) * 0.5;

  // Far atmospheric haze (wide, very soft)
  const fg0 = ctx.createRadialGradient(cw * 0.5, ch * 0.5, 0, cw * 0.5, ch * 0.5, cw * 0.7);
  fg0.addColorStop(0,   `rgba(22,22,22,${0.04 + p1 * 0.03})`);
  fg0.addColorStop(0.6, "rgba(10,10,10,0.015)");
  fg0.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = fg0;
  ctx.fillRect(0, 0, cw, ch);

  // Mid haze — slightly off-center, drifts
  const mx = cw * (0.44 + Math.sin(time * 0.09) * 0.06);
  const fg1 = ctx.createRadialGradient(mx, ch * 0.55, 0, mx, ch * 0.55, cw * 0.48);
  fg1.addColorStop(0,    `rgba(30,30,30,${0.06 + p2 * 0.04})`);
  fg1.addColorStop(0.50, "rgba(18,18,18,0.022)");
  fg1.addColorStop(1,    "rgba(0,0,0,0)");
  ctx.fillStyle = fg1;
  ctx.fillRect(0, 0, cw, ch);

  // Ground-level fog band
  const fg2 = ctx.createLinearGradient(0, ch * 0.60, 0, ch);
  fg2.addColorStop(0,   "rgba(0,0,0,0)");
  fg2.addColorStop(0.4, `rgba(12,12,12,${0.12 + p3 * 0.06})`);
  fg2.addColorStop(1,   "rgba(0,0,0,0.35)");
  ctx.fillStyle = fg2;
  ctx.fillRect(0, 0, cw, ch);

  // Dense low-ground smoke layer near bottom
  const fg3 = ctx.createLinearGradient(0, ch * 0.80, 0, ch);
  fg3.addColorStop(0,   "rgba(0,0,0,0)");
  fg3.addColorStop(0.6, `rgba(8,8,8,${0.08 + p1 * 0.04})`);
  fg3.addColorStop(1,   "rgba(0,0,0,0.22)");
  ctx.fillStyle = fg3;
  ctx.fillRect(0, 0, cw, ch);
}

// ── Vignette ──────────────────────────────────────────────────────────────────
function drawVignette(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const vL = ctx.createLinearGradient(0, 0, cw * 0.28, 0);
  vL.addColorStop(0, "rgba(0,0,0,0.97)");
  vL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vL; ctx.fillRect(0, 0, cw, ch);

  const vR = ctx.createLinearGradient(cw * 0.72, 0, cw, 0);
  vR.addColorStop(0, "rgba(0,0,0,0)");
  vR.addColorStop(1, "rgba(0,0,0,0.97)");
  ctx.fillStyle = vR; ctx.fillRect(0, 0, cw, ch);

  const vTB = ctx.createLinearGradient(0, 0, 0, ch);
  vTB.addColorStop(0,    "rgba(0,0,0,0.95)");
  vTB.addColorStop(0.18, "rgba(0,0,0,0)");
  vTB.addColorStop(0.78, "rgba(0,0,0,0)");
  vTB.addColorStop(1,    "rgba(0,0,0,0.95)");
  ctx.fillStyle = vTB; ctx.fillRect(0, 0, cw, ch);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BackgroundBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen canvas for static branch layer
    const offCanvas = document.createElement("canvas");
    const offCtx    = offCanvas.getContext("2d");

    let motes:   Mote[]    = [];
    const streaks: Streak[]  = buildStreaks();
    let dust:    DustMote[] = [];

    const resize = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      canvas.width  = cw;
      canvas.height = ch;
      offCanvas.width  = cw;
      offCanvas.height = ch;
      if (offCtx) renderBranches(offCtx, cw, ch);
      motes  = buildParticles(cw, ch);
      dust   = buildDust(cw * 0.30, ch * 0.52);
    };

    resize();
    window.addEventListener("resize", resize);

    let t0 = 0;

    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const time = (ts - t0) * 0.001;
      const cw   = canvas.width;
      const ch   = canvas.height;

      // ── 1 · solid black base ──
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);

      // ── 2 · static tree branches ──
      if (offCtx) ctx.drawImage(offCanvas, 0, 0);

      // ── 3 · volumetric god rays ──
      drawGodRays(ctx, cw, ch, time);

      // ── 4 · layered cinematic fog ──
      drawFog(ctx, cw, ch, time);

      // ── 5 · snake through right-side branches ──
      drawSnake(ctx, time, cw, ch);

      // ── 6 · speed streaks (left-trailing) ──
      const cx = cw * 0.30;
      const cy = ch * 0.52;
      drawStreaks(ctx, cx, cy, time, streaks);

      // ── 7 · cheetah with cinematic motion blur ──
      const scale = Math.min(cw, ch) * 0.00086;
      drawCheetah(ctx, cx, cy, scale, time);

      // ── 8 · ground dust at cheetah's feet ──
      tickDust(ctx, dust, cx, cy);

      // ── 9 · atmospheric dust motes ──
      tickParticles(ctx, motes, time, cw, ch);

      // ── 10 · deep edge vignette ──
      drawVignette(ctx, cw, ch);

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
