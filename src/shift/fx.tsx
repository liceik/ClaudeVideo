import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

export const neon = {
  bg: "#070A14",
  ink: "#05060C",
  cyan: "#3FE0F0",
  cyanDeep: "#128FA3",
  magenta: "#FF3D9A",
  violet: "#7A4DFF",
  amber: "#FFB547",
  white: "#F2F6FF",
  dim: "#6E7A99",
  sepia: "#C89B5A",
};

export const FONT = '"Inter Display", Inter, system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

/** Deterministic flicker 0.75–1 with occasional drops, keyed by frame and a seed. */
export const flicker = (frame: number, seed: string, strength = 1) => {
  const r = random(`${seed}-${Math.floor(frame / 2)}`);
  const drop = r > 0.93 ? (r - 0.93) * 8 : 0; // rare dips
  return Math.max(0, 1 - drop * strength - random(`${seed}-f-${frame}`) * 0.06 * strength);
};

/** Rain: diagonal streaks, deterministic, scrolling with the frame. */
export const Rain: React.FC<{ count?: number; opacity?: number; speed?: number; color?: string; area?: [number, number, number, number] }> = ({
  count = 140, opacity = 0.35, speed = 38, color = "#BFE9FF", area = [0, 0, 1080, 1920],
}) => {
  const frame = useCurrentFrame();
  const [ax, ay, aw, ah] = area;
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }).map((_, i) => {
        const x0 = ax + random(`rx${i}`) * aw;
        const len = 40 + random(`rl${i}`) * 90;
        const sp = speed * (0.7 + random(`rs${i}`) * 0.6);
        const y = ay + ((random(`ry${i}`) * ah + frame * sp) % (ah + len)) - len;
        return <line key={i} x1={x0} y1={y} x2={x0 - 12} y2={y + len} stroke={color} strokeWidth={1.6 + random(`rw${i}`) * 1.4} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Film grain + vignette overlay. */
export const Grain: React.FC<{ amount?: number }> = ({ amount = 0.12 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: amount }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 200} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

/** CCTV look: scanlines, green cast, timestamp, static bursts. */
export const Cctv: React.FC<{ label: string; time: string; glitch?: number }> = ({ label, time, glitch = 0 }) => {
  const frame = useCurrentFrame();
  const jump = glitch > 0 ? (random(`g${frame}`) - 0.5) * 30 * glitch : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", transform: `translateY(${jump}px)` }}>
      <AbsoluteFill style={{ background: "rgba(80,255,160,0.10)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 5px)" }} />
      {glitch > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: glitch * 0.8 }}>
          <filter id="static"><feTurbulence type="fractalNoise" baseFrequency="0.6 0.05" numOctaves={1} seed={frame} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width={1080} height={1920} filter="url(#static)" style={{ mixBlendMode: "screen" }} />
        </svg>
      )}
      <div style={{ position: "absolute", left: 50, top: 60, fontFamily: MONO, fontSize: 34, color: "#B8FFD9", letterSpacing: "0.1em", textShadow: "0 0 8px #4f9" }}>
        ● REC &nbsp; {label}
      </div>
      <div style={{ position: "absolute", right: 50, top: 60, fontFamily: MONO, fontSize: 34, color: "#B8FFD9", letterSpacing: "0.1em", textShadow: "0 0 8px #4f9" }}>
        {time}
      </div>
      <div style={{ position: "absolute", left: 40, top: 40, width: 1000, height: 1840, border: "2px solid rgba(184,255,217,0.35)" }} />
    </AbsoluteFill>
  );
};

/** Sepia / memory treatment for flashbacks. */
export const SepiaFilterDefs: React.FC = () => (
  <defs>
    <filter id="sepia">
      <feColorMatrix type="matrix" values="0.45 0.45 0.25 0 0.05  0.32 0.42 0.18 0 0.02  0.18 0.22 0.12 0 0  0 0 0 1 0" />
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="1.2" /></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="14" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="glowSoft"><feGaussianBlur stdDeviation="30" /></filter>
  </defs>
);

/* ───────── Karaoke captions ───────── */
type Word = { t: string; s: number; e: number };

export const Karaoke: React.FC<{ words: Word[]; t: number; accent?: string }> = ({ words, t, accent = neon.magenta }) => {
  const first = words[0].s;
  const appear = Math.min(1, Math.max(0, (t - first + 0.15) / 0.18));
  return (
    <div
      style={{
        position: "absolute", left: 60, right: 60, top: 1380, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: "0.01em",
        opacity: appear, transform: `translateY(${(1 - appear) * 14}px)`,
      }}
    >
      {words.map((w, i) => {
        const active = t >= w.s - 0.04 && t < w.e + 0.08;
        const past = t >= w.e + 0.08;
        const color = active ? accent : past ? neon.white : "rgba(242,246,255,0.42)";
        const glow = active ? `0 0 18px ${accent}, 0 0 40px ${accent}66` : past ? "0 0 10px rgba(63,224,240,0.35)" : "none";
        return (
          <span key={i} style={{ display: "inline-block", color, textShadow: `${glow}, 0 4px 18px rgba(0,0,0,0.9)`, transform: `scale(${active ? 1.06 : 1})`, margin: "0 9px", transition: "none" }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

/** Neon label (clock, night counter). */
export const NeonTag: React.FC<{ children: React.ReactNode; x: number; y: number; color?: string; size?: number }> = ({ children, x, y, color = neon.cyan, size = 40 }) => (
  <div style={{
    position: "absolute", left: x, top: y, padding: "12px 22px", borderRadius: 10, border: `2px solid ${color}`, color,
    fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: "0.12em", background: "rgba(5,6,12,0.55)",
    boxShadow: `0 0 18px ${color}88, inset 0 0 18px ${color}22`, textShadow: `0 0 12px ${color}`,
  }}>{children}</div>
);

/** Big comic sound word in neon. */
export const NeonSfx: React.FC<{ text: string; startFrame: number; x: number; y: number; color?: string }> = ({ text, startFrame, x, y, color = neon.amber }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0 || local > 40) return null;
  const s = Math.min(1, local / 4);
  const fade = local > 26 ? 1 - (local - 26) / 14 : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 900, fontSize: 120, color, letterSpacing: "-0.02em", textShadow: `0 0 20px ${color}, 0 0 60px ${color}99`, opacity: fade, transform: `translate(-50%,-50%) rotate(-5deg) scale(${0.6 + s * 0.5})` }}>
      {text}
    </div>
  );
};
