import { Easing, interpolate } from "remotion";

export const FPS = 30;

export const colors = {
  bg: "#0A0A0C",
  bgSoft: "#141418",
  text: "#F4F1EA",
  muted: "#8E8B84",
  accent: "#FF5A1F",
  accent2: "#7C8CFF",
  accent3: "#2DD4A4",
  line: "rgba(244,241,234,0.12)",
};

export const fonts = {
  display: '"Inter Display", Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// Strong ease-out from the `animate` skill: cubic-bezier(0.23, 1, 0.32, 1)
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
// Softer in-out, only for ambient background drift (never on UI entrances)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const ms = (milliseconds: number) => Math.round((milliseconds / 1000) * FPS);

/** Progress 0→1 between `start` frame over `durationFrames`, eased, clamped. */
export const progress = (
  frame: number,
  start: number,
  durationFrames: number,
  easing: (t: number) => number = easeOut,
) =>
  interpolate(frame, [start, start + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Entrance: fade + rise. Distance in px. Returns inline style. */
export const rise = (
  frame: number,
  startMs: number,
  durationMs: number,
  distance: number,
): React.CSSProperties => {
  const p = progress(frame, ms(startMs), ms(durationMs));
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
  };
};

/** Exit for a whole scene: short, simultaneous, simpler than the entry. */
export const sceneExit = (frame: number, sceneDuration: number, exitMs = 300) => {
  const exitFrames = ms(exitMs);
  const p = progress(frame, sceneDuration - exitFrames, exitFrames, Easing.bezier(0.4, 0, 1, 1));
  return {
    opacity: 1 - p,
    transform: `translateY(${-p * 16}px)`,
  } as React.CSSProperties;
};
