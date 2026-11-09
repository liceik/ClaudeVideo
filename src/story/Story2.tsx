import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline2.json";
import { Bed, Door, DoorwayMum, KidFace, Mum, Nightlight, Phone, Ripples, Room, SideFingers, Visitor, Window, pal } from "./art";
import { Caption, Sfx, Tag } from "./Captions";

export const STORY2_FPS = 30;
export const STORY2_FRAMES = Math.ceil((timeline.duration + 1.5) * STORY2_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * STORY2_FPS);

const chunkAt = (t: number): Chunk => {
  let cur = chunks[0];
  for (const c of chunks) if (c.start <= t) cur = c;
  return cur;
};
const sceneStart = (scene: string, t: number) => {
  let start = chunks[0].start;
  let prev = "";
  for (const c of chunks) {
    if (c.start > t) break;
    if (c.scene !== prev) start = c.start;
    prev = c.scene;
  }
  return start;
};
const C = (i: number) => chunks[i];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const blinkLevel = (t: number, at: number[]) => {
  for (const a of at) if (t >= a && t < a + 0.13) return 0;
  return 1;
};

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; style?: React.CSSProperties }> = ({
  children,
  zoom = 1,
  cx = 540,
  cy = 960,
  style,
}) => (
  <svg
    viewBox="0 0 1080 1920"
    width={1080}
    height={1920}
    style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, ...style }}
  >
    {children}
  </svg>
);

const FONT = '"Inter Display", Inter, system-ui, sans-serif';

export const Story2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const scene = t < chunks[0].start ? "recap" : cur.scene;
  const sT = Math.max(0, t - sceneStart(scene, t));
  const push = 1 + Math.min(sT, 8) * 0.006;

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;

  switch (scene) {
    case "recap": {
      // Where part 1 ended: morning, mum with her back to the lamp, it blinks twice.
      const lamp = blinkLevel(t, timeline.marks.blinks2);
      visual = (
        <Svg zoom={1.25} cx={700} cy={1050}>
          <Room mode="morning">
            <Window mode="morning" />
            <Nightlight on={lamp} />
            <Mum x={560} y={900} smile={0.95} eyesOpen={false} />
          </Room>
          <rect width={1080} height={1920} fill="#0A0A14" opacity={0.45} />
        </Svg>
      );
      overlay = t < C(1).start && t > 0.2 && <Tag x={380} y={300} tone="alert">ЧАСТЬ 2</Tag>;
      break;
    }
    case "day": {
      visual = (
        <Svg zoom={push}>
          <Room mode="morning">
            <Window mode="morning" />
            <Door />
            <Nightlight on={0} />
            <Bed kidUp eyesOpen />
            <Mum x={760} y={940} smile={0.35} />
          </Room>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>12:10 · день</Tag>;
      break;
    }
    case "stare": {
      // Close-up: mum never blinks. The count climbs in a tag.
      const countStart = C(6).start;
      const n = t > countStart ? Math.min(100, Math.floor((t - countStart) * 45)) : 0;
      visual = (
        <Svg zoom={1 + Math.min(sT, 9) * 0.012}>
          <rect width={1080} height={1920} fill={pal.morning.wall} />
          <Mum x={540} y={760} scale={2.4} smile={0.35} eyesOpen />
        </Svg>
      );
      overlay = n > 0 && (
        <Tag x={720} y={300}>
          {n} / 100
        </Tag>
      );
      break;
    }
    case "phone": {
      const talking = t >= C(8).start;
      visual = (
        <Svg zoom={1.2} cx={420} cy={1300}>
          <Room mode="evening">
            <Window mode="evening" />
            <Door />
            <Nightlight on={1} />
            <Bed kidUp eyesOpen />
            <Phone x={300} y={1300} />
            {talking && <Ripples t={sT} x={300} y={1280} color="#FFD27A" />}
          </Room>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>19:40 · папа</Tag>;
      break;
    }
    case "doorway": {
      const turn = clamp01((sT - 0.2) / 0.8);
      const smile = t > C(10).start ? interpolate(t - C(10).start, [0.8, 2.0], [0.4, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.4;
      visual = (
        <Svg zoom={1.15 + turn * 0.25} cx={300} cy={1000}>
          <Room mode="evening">
            <Window mode="evening" />
            <Door open={0.75} light={0.9} x={90} />
            <DoorwayMum x={220} y={880} smile={smile} />
            <Nightlight on={1} />
            <Bed kidUp eyesOpen />
            <Phone x={300} y={1300} />
          </Room>
        </Svg>
      );
      break;
    }
    case "hangup": {
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.evening.wallDark} />
          <KidFace eyesOpen={1} />
        </Svg>
      );
      break;
    }
    case "clock": {
      visual = (
        <Svg zoom={1.1} cx={620} cy={1250}>
          <Room>
            <Window />
            <Door />
            <Nightlight on={1} />
            <Bed eyesOpen />
          </Room>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>23:58 · твоя комната</Tag>;
      break;
    }
    case "blink": {
      const lamp = blinkLevel(t, timeline.marks.blinks);
      visual = (
        <Svg zoom={1.55} cx={880} cy={1180}>
          <Room>
            <Window />
            <Nightlight on={lamp} />
            <Bed eyesOpen={t < C(15).start} />
          </Room>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="alert">00:00</Tag>;
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
      const appear = clamp01((sT - 0.2) / 1.2);
      const tilt = interpolate(sT, [0.3, 0.6, 1.2], [0, -1.6, -1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
      overlay = <Sfx text="СКРИП" startFrame={f(C(19).start + 0.3)} x={300} y={1000} />;
      break;
    }
    case "voice": {
      const turn = interpolate(sT, [0.3, 1.6], [0, -38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.5} cx={640} cy={1080}>
          <Room>
            <Window />
            <Nightlight on={1} />
            <Bed />
            <Visitor headTurn={turn} />
            <Ripples t={sT} x={640} y={1020} />
          </Room>
        </Svg>
      );
      break;
    }
    case "corridor": {
      const shout = t >= C(22).start;
      visual = (
        <Svg zoom={1.3} cx={260} cy={900}>
          <Room>
            <Window />
            <Door open={0.12} light={0.5} />
            <Nightlight on={1} />
            <Bed />
            <Visitor headTurn={-38} />
            <Ripples t={sT} x={240} y={940} color={shout ? pal.alert : "#FFD27A"} />
          </Room>
        </Svg>
      );
      overlay = shout && <Tag x={120} y={520} tone="alert">ИЗ КОРИДОРА</Tag>;
      break;
    }
    case "two": {
      // Split screen: the visitor on top, the door below.
      visual = (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden" }}>
            <Svg zoom={1.7} cx={640} cy={1000} style={{ top: -520 }}>
              <Room>
                <Window />
                <Nightlight on={1} />
                <Bed />
                <Visitor headTurn={-38} />
                <Ripples t={sT} x={640} y={1020} />
              </Room>
            </Svg>
          </div>
          <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden" }}>
            <Svg zoom={1.6} cx={220} cy={940} style={{ top: -460 }}>
              <Room>
                <Door open={0.12} light={0.5} />
                <Ripples t={sT + 0.4} x={240} y={940} color={pal.alert} />
              </Room>
            </Svg>
          </div>
          <div style={{ position: "absolute", left: 0, top: 952, width: 1080, height: 16, background: pal.text }} />
        </>
      );
      break;
    }
    case "cheek": {
      const reach = clamp01((sT - 0.3) / 1.3);
      visual = (
        <Svg zoom={push}>
          <rect width={1080} height={1920} fill={pal.night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
          <SideFingers reach={reach} />
        </Svg>
      );
      break;
    }
    case "second": {
      const pulse = 1 + Math.sin(sT * Math.PI * 2) * 0.03;
      visual = (
        <Svg zoom={pulse}>
          <rect width={1080} height={1920} fill="#120A0A" />
          <KidFace eyesOpen={0} squeeze={1} />
          <SideFingers reach={1} />
        </Svg>
      );
      overlay = <Tag x={330} y={300} tone="alert">00:00:01</Tag>;
      break;
    }
    case "end": {
      const showA = clamp01((t - C(27).start) / 0.5);
      const showB = clamp01((t - C(28).start) / 0.5);
      const showCta = clamp01((t - C(29).start) / 0.5);
      const showP3 = clamp01((t - C(30).start) / 0.5);
      const card = (label: string, sub: string, color: string, show: number, side: "left" | "right") => (
        <div
          style={{
            flex: 1,
            margin: 18,
            padding: "60px 36px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.05)",
            border: `3px solid ${color}`,
            textAlign: "center",
            opacity: show,
            transform: `translateX(${(1 - show) * (side === "left" ? -40 : 40)}px)`,
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: pal.text, marginTop: 24, lineHeight: 1.2 }}>{sub}</div>
        </div>
      );
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", justifyContent: "center", padding: "0 54px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: pal.text, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, opacity: showA }}>
            Что делать
            <br />
            дальше?
          </div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Открыть глаза и посмотреть", pal.accent, showA, "left")}
            {card("Б", "Бежать в коридор с закрытыми глазами", pal.alert, showB, "right")}
          </div>
          <div style={{ marginTop: 80, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: pal.text, textTransform: "uppercase", opacity: showCta }}>
            Напиши в комментариях: <span style={{ color: pal.accent }}>А</span> или <span style={{ color: pal.alert }}>Б</span>
          </div>
          <div style={{ marginTop: 60, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', fontSize: 34, letterSpacing: "0.2em", color: "#8E8B84", textTransform: "uppercase", opacity: showP3 }}>
            Часть 3 — по вашему выбору
          </div>
        </AbsoluteFill>
      );
      break;
    }
  }

  const dip = sT < 0.12 ? 1 - sT / 0.12 : 0;

  return (
    <AbsoluteFill style={{ background: "#0A0A12", overflow: "hidden" }}>
      {visual}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {overlay}
      {scene !== "end" && t >= cur.start && <Caption key={cur.i} text={cur.text} startFrame={f(cur.start)} />}
      <AbsoluteFill style={{ background: "#000", opacity: dip * 0.9 }} />

      <Audio src={staticFile(timeline.audio)} volume={1} />
      <Audio src={staticFile("ambient2.wav")} volume={0.55} />
      <Sequence from={f(C(19).start + 0.3)} durationInFrames={20}>
        <Audio src={staticFile("creak.wav")} volume={0.7} />
      </Sequence>
      <Sequence from={f(C(22).start)} durationInFrames={40}>
        <Audio src={staticFile("thud.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={f(C(26).start)} durationInFrames={40}>
        <Audio src={staticFile("thud.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
