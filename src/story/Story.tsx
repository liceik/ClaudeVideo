import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline.json";
import { Bed, Door, Fingers, KidFace, Mum, Nightlight, Ripples, Room, Visitor, Window, pal } from "./art";
import { Caption, Sfx, Tag } from "./Captions";

export const STORY_FPS = 30;
export const STORY_FRAMES = Math.ceil((timeline.duration + 1.5) * STORY_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * STORY_FPS);

const chunkAt = (t: number): Chunk => {
  let cur = chunks[0];
  for (const c of chunks) if (c.start <= t) cur = c;
  return cur;
};
const sceneStart = (scene: string, t: number) => {
  // start time of the current contiguous run of this scene
  let start = chunks[0].start;
  let prev = "";
  for (const c of chunks) {
    if (c.start > t) break;
    if (c.scene !== prev) start = c.start;
    prev = c.scene;
  }
  return start;
};
const byIndex = (i: number) => chunks[i];

/** Three blinks of the nightlight within a window, each ~120ms dark. */
const blinkLevel = (t: number, at: number[]) => {
  for (const a of at) if (t >= a && t < a + 0.13) return 0;
  return 1;
};

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number }> = ({
  children,
  zoom = 1,
  cx = 540,
  cy = 960,
}) => (
  <svg
    viewBox="0 0 1080 1920"
    width={1080}
    height={1920}
    style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px` }}
  >
    {children}
  </svg>
);

export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const scene = t < chunks[0].start ? "rule" : cur.scene;
  const sT = Math.max(0, t - sceneStart(scene, t)); // seconds into the scene
  const push = 1 + Math.min(sT, 8) * 0.006; // slow push-in on every shot

  const C = (i: number) => byIndex(i);

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;

  switch (scene) {
    case "rule": {
      const lamp = blinkLevel(t, []);
      visual = (
        <Svg zoom={push}>
          <Room>
            <Window />
            <Door />
            <Nightlight on={lamp} />
            <Bed />
          </Room>
        </Svg>
      );
      overlay = t < C(1).start + 1.2 && t > 0.3 && <Tag x={360} y={300} tone="alert">ОДНО ПРАВИЛО</Tag>;
      break;
    }
    case "blink": {
      const b2 = C(5).start;
      const lamp = blinkLevel(t, [b2 + 0.15, b2 + 0.95, b2 + 1.75]);
      visual = (
        <Svg zoom={1.55} cx={880} cy={1180}>
          <Room>
            <Window />
            <Nightlight on={lamp} />
            <Bed />
          </Room>
        </Svg>
      );
      overlay = (
        <Tag x={90} y={260}>
          00:03 · твоя комната
        </Tag>
      );
      break;
    }
    case "eyes": {
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.night.wallDark} />
          <KidFace eyesOpen={0} squeeze={Math.min(1, sT * 2)} />
        </Svg>
      );
      break;
    }
    case "sit": {
      const appear = interpolate(sT, [0.2, 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const creakAt = C(8).start;
      const tilt = t > creakAt ? interpolate(t - creakAt, [0, 0.25, 0.8], [0, -1.6, -1.0], { extrapolateRight: "clamp" }) : 0;
      visual = (
        <Svg zoom={1.15} cx={560} cy={1250}>
          <Room>
            <Window />
            <Door />
            <Nightlight on={1} />
            <Bed tilt={tilt} />
            <Visitor opacity={appear} />
          </Room>
        </Svg>
      );
      overlay = <Sfx text="СКРИП" startFrame={f(creakAt + 0.05)} x={300} y={1000} />;
      break;
    }
    case "voice": {
      const turn = interpolate(sT, [0.3, 1.6], [0, -38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const talking = t < C(11).start;
      visual = (
        <Svg zoom={1.5} cx={640} cy={1080}>
          <Room>
            <Window />
            <Nightlight on={1} />
            <Bed />
            <Visitor headTurn={turn} />
            {talking && <Ripples t={sT} x={640} y={1020} />}
          </Room>
        </Svg>
      );
      break;
    }
    case "fingers": {
      const reach = interpolate(sT, [0.2, 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
          <Fingers reach={reach} />
        </Svg>
      );
      break;
    }
    case "click": {
      const open = interpolate(sT, [0.05, 0.5], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const leaveAt = C(15).start;
      const gone = interpolate(t - leaveAt, [0, 1.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const close = interpolate(t - leaveAt, [1.6, 2.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.1} cx={400} cy={1100}>
          <Room>
            <Window />
            <Door open={open * (1 - close)} light={open * (1 - close) * 1.3} />
            <Nightlight on={1} />
            <Bed />
            <Visitor opacity={gone} x={640 - (1 - gone) * 420} y={1180 - (1 - gone) * 140} />
          </Room>
        </Svg>
      );
      overlay = <Sfx text="ЩЁЛК" startFrame={f(C(14).start)} x={260} y={520} color="#fff" />;
      break;
    }
    case "open": {
      const openAt = C(17).start + 0.6;
      const o = interpolate(t - openAt, [0, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.night.wallDark} />
          <KidFace eyesOpen={o} squeeze={1 - o} />
        </Svg>
      );
      break;
    }
    case "empty": {
      visual = (
        <Svg zoom={push}>
          <Room>
            <Window />
            <Door />
            <Nightlight on={1} />
            <Bed eyesOpen />
          </Room>
        </Svg>
      );
      break;
    }
    case "pillow": {
      const dent = interpolate(sT, [0.2, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const warm = t > C(20).start ? interpolate(t - C(20).start, [0, 0.8], [0, 1], { extrapolateRight: "clamp" }) : 0;
      visual = (
        <Svg zoom={2.4} cx={720} cy={1360}>
          <Room>
            <Nightlight on={1} />
            <Bed dent={dent} eyesOpen />
            {/* heat shimmer */}
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${660 + i * 40} ${1330 - ((sT * 60 + i * 25) % 70)} q10 -20 0 -40 q-10 -20 0 -40`}
                stroke="#FF9B5C"
                strokeWidth={4}
                fill="none"
                opacity={warm * 0.8}
              />
            ))}
          </Room>
        </Svg>
      );
      overlay = warm > 0 && <Tag x={560} y={1060} tone="alert">ЕЩЁ ТЁПЛАЯ</Tag>;
      break;
    }
    case "morning": {
      visual = (
        <Svg zoom={push}>
          <Room mode="morning">
            <Window mode="morning" />
            <Door />
            <Nightlight on={0} />
            <Bed kidUp eyesOpen />
            <Mum x={760} y={940} smile={0.3} />
          </Room>
        </Svg>
      );
      overlay = sT < 2.2 && (
        <Tag x={90} y={260}>
          07:40 · утро
        </Tag>
      );
      break;
    }
    case "smile": {
      const smile = interpolate(sT, [0.3, 2.4, 4.5], [0.3, 0.5, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.morning.wall} />
          <Mum x={540} y={760} scale={2.4} smile={smile} eyesOpen={smile < 0.9} />
        </Svg>
      );
      break;
    }
    case "blink2": {
      const b = sceneStart("blink2", t);
      const lamp = blinkLevel(t, [b + 2.9, b + 3.8]);
      const dark = interpolate(sT, [0, 2.5], [0, 0.55], { extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.25} cx={700} cy={1050}>
          <Room mode="morning">
            <Window mode="morning" />
            <Nightlight on={lamp} />
            <Mum x={560} y={900} smile={0.95} eyesOpen={false} />
          </Room>
          <rect width={1080} height={1920} fill="#0A0A14" opacity={dark} />
        </Svg>
      );
      break;
    }
    case "end": {
      const show = interpolate(sT, [0, 0.6], [0, 1], { extrapolateRight: "clamp" });
      const part2 = t > C(26).start ? interpolate(t - C(26).start, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }) : 0;
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center" }}>
          <div
            style={{
              fontFamily: '"Inter Display", Inter, sans-serif',
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 1.05,
              color: pal.text,
              textTransform: "uppercase",
              opacity: show,
              transform: `translateY(${(1 - show) * 30}px)`,
            }}
          >
            Кто сидел
            <br />
            на <span style={{ color: pal.alert }}>кровати?</span>
          </div>
          <div
            style={{
              marginTop: 50,
              fontFamily: '"Inter Display", Inter, sans-serif',
              fontWeight: 800,
              fontSize: 56,
              color: pal.accent,
              textTransform: "uppercase",
              opacity: show,
            }}
          >
            Мама или <span style={{ color: pal.alert }}>оно</span>
          </div>
          <div
            style={{
              marginTop: 90,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 34,
              letterSpacing: "0.2em",
              color: "#8E8B84",
              textTransform: "uppercase",
              opacity: part2,
            }}
          >
            Часть 2 скоро
          </div>
        </AbsoluteFill>
      );
      break;
    }
  }

  // Cut-in flash between scenes: a 4-frame dip to black on every scene change.
  const sinceCut = sT;
  const dip = sinceCut < 0.12 ? 1 - sinceCut / 0.12 : 0;

  return (
    <AbsoluteFill style={{ background: "#0A0A12", overflow: "hidden" }}>
      {visual}
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {overlay}
      {scene !== "end" && t >= cur.start && <Caption key={cur.i} text={cur.text} startFrame={f(cur.start)} />}
      <AbsoluteFill style={{ background: "#000", opacity: dip * 0.9 }} />

      {/* audio */}
      <Audio src={staticFile("vo.wav")} volume={1} />
      <Audio src={staticFile("ambient.wav")} volume={0.55} />
      <Sequence from={f(C(8).start + 0.05)} durationInFrames={20}>
        <Audio src={staticFile("creak.wav")} volume={0.7} />
      </Sequence>
      <Sequence from={f(C(14).start)} durationInFrames={10}>
        <Audio src={staticFile("click.wav")} volume={0.9} />
      </Sequence>
      <Sequence from={f(C(20).start)} durationInFrames={40}>
        <Audio src={staticFile("thud.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={f(C(25).start - 0.3)} durationInFrames={40}>
        <Audio src={staticFile("thud.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
