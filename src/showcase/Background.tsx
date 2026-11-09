import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "./theme";

/**
 * Ambient background: two soft blobs drifting slowly plus a faint grid.
 * Decoration role — it never competes with the lead; it only breathes.
 */
export const Background: React.FC<{ hue?: "orange" | "blue" | "green" }> = ({ hue = "orange" }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const a = hue === "orange" ? colors.accent : hue === "blue" ? colors.accent2 : colors.accent3;

  const x1 = 25 + Math.sin(t * 0.25) * 6;
  const y1 = 30 + Math.cos(t * 0.21) * 6;
  const x2 = 75 + Math.cos(t * 0.19) * 7;
  const y2 = 70 + Math.sin(t * 0.23) * 6;

  const gridShift = interpolate(frame, [0, 900], [0, 120]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(600px 600px at ${x1}% ${y1}%, ${a}33 0%, transparent 70%),
                       radial-gradient(700px 700px at ${x2}% ${y2}%, ${colors.accent2}22 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.line} 1px, transparent 1px),
                            linear-gradient(90deg, ${colors.line} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${gridShift}px ${gridShift * 0.6}px`,
          opacity: 0.35,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 85%)",
        }}
      />
    </AbsoluteFill>
  );
};
