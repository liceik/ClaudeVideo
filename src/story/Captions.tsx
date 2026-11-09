import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { pal } from "./art";

const FONT = '"Inter Display", Inter, system-ui, sans-serif';

/** Parse `*accent*` and `**alert**` markup into coloured spans. */
const parse = (text: string): { t: string; c: string }[] => {
  const out: { t: string; c: string }[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|[^*]+)/g;
  for (const m of text.match(re) ?? []) {
    if (m.startsWith("**")) out.push({ t: m.slice(2, -2), c: pal.alert });
    else if (m.startsWith("*")) out.push({ t: m.slice(1, -1), c: pal.accent });
    else out.push({ t: m, c: pal.text });
  }
  return out;
};

export const Caption: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 16, stiffness: 220, mass: 0.7 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        top: 1390,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: text.replace(/\*/g, "").length > 38 ? 50 : 60,
        lineHeight: 1.12,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        color: pal.text,
        textShadow: "0 4px 24px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)",
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 18}px) scale(${0.96 + s * 0.04})`,
      }}
    >
      {parse(text).map((p, i) => (
        <span key={i} style={{ color: p.c }}>
          {p.t}
        </span>
      ))}
    </div>
  );
};

/** Small rounded label (timestamps, place names). */
export const Tag: React.FC<{ children: React.ReactNode; x: number; y: number; tone?: "paper" | "alert" }> = ({
  children,
  x,
  y,
  tone = "paper",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      padding: "14px 24px",
      borderRadius: 12,
      background: tone === "paper" ? "#F4EEDC" : pal.alert,
      color: tone === "paper" ? "#2A2A2A" : "#fff",
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: "0.04em",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      transform: "rotate(-2deg)",
    }}
  >
    {children}
  </div>
);

/** Big comic sound-effect word that pops and fades. */
export const Sfx: React.FC<{ text: string; startFrame: number; x: number; y: number; color?: string }> = ({
  text,
  startFrame,
  x,
  y,
  color = pal.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0 || local > fps * 1.6) return null;
  const s = spring({ frame: local, fps, config: { damping: 9, stiffness: 260, mass: 0.6 } });
  const fade = Math.max(0, 1 - Math.max(0, local - fps * 1.0) / (fps * 0.6));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 112,
        letterSpacing: "-0.02em",
        color,
        textShadow: "0 6px 0 rgba(0,0,0,0.5)",
        opacity: fade,
        transform: `translate(-50%, -50%) rotate(-6deg) scale(${s})`,
      }}
    >
      {text}
    </div>
  );
};
