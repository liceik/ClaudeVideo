import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline3.json";
import {
  Bed, Corridor, CorridorDoor, Crawl, Door, Hug, KidFace, Knob, Mum, Nightlight, Ripples, Room, Shadow, SideFingers,
  Visitor, WarmArms, Window, pal,
} from "./art";
import { Caption, Sfx, Tag } from "./Captions";

export const STORY3_FPS = 30;
export const STORY3_FRAMES = Math.ceil((timeline.duration + 1.5) * STORY3_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * STORY3_FPS);
const C = (i: number) => chunks[i];
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const chunkAt = (t: number): Chunk => {
  let cur = chunks[0];
  for (const c of chunks) if (c.start <= t) cur = c;
  return cur;
};
const blinkLevel = (t: number, at: number[]) => {
  for (const a of at) if (t >= a && t < a + 0.13) return 0;
  return 1;
};

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; style?: React.CSSProperties }> = ({
  children, zoom = 1, cx = 540, cy = 960, style,
}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920}
    style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, ...style }}>
    {children}
  </svg>
);

const FONT = '"Inter Display", Inter, system-ui, sans-serif';

/** Camera move across a shot: zoom and focus point drift from `a` to `b` over `dur` seconds. */
type Cam = { z: number; x: number; y: number };
const cam = (sT: number, a: Cam, b: Cam, dur = 2.5): Cam => {
  const p = c01(sT / dur);
  const e = 1 - Math.pow(1 - p, 3);
  return { z: lerp(a.z, b.z, e), x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
};

export const Story3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const active = t >= chunks[0].start;
  const scene = active ? cur.scene : "choice";
  // Every caption line is its own shot, so timing is per line, not per scene run.
  const shotStart = active ? cur.start : 0;
  const sT = Math.max(0, t - shotStart);
  const shotLen = active ? Math.max(0.5, (chunks[cur.i + 1]?.start ?? timeline.duration) - cur.start) : 1;
  const half = sT > shotLen / 2; // second sub-shot of a long line
  const night = pal.night;

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;

  switch (scene) {
    case "choice": {
      const k = cam(sT, { z: 1.0, x: 540, y: 960 }, { z: 1.06, x: 540, y: 960 }, 2);
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", alignItems: "center", justifyContent: "center", transform: `scale(${k.z})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: pal.alert, lineHeight: 1 }}>Б</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: pal.text, textTransform: "uppercase", marginTop: 20 }}>Бежать</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, letterSpacing: "0.2em", color: "#8E8B84", marginTop: 50 }}>ЧАСТЬ 3 · ВЫБОР ЗРИТЕЛЕЙ</div>
        </AbsoluteFill>
      );
      break;
    }
    case "roll": {
      if (!half) {
        visual = (
          <Svg zoom={1 + sT * 0.08}>
            <rect width={1080} height={1920} fill={night.wallDark} />
            <KidFace eyesOpen={0} squeeze={1} />
            <SideFingers reach={1} />
          </Svg>
        );
      } else {
        const k = cam(sT - shotLen / 2, { z: 1.2, x: 420, y: 1300 }, { z: 1.05, x: 500, y: 1250 }, 1.5);
        visual = (
          <Svg zoom={k.z} cx={k.x} cy={k.y}>
            <Room>
              <Window />
              <Door />
              <Nightlight on={1} />
              <Bed tilt={-1} />
              <Visitor headTurn={-38} />
              <Crawl x={330} y={1560} phase={0} />
            </Room>
          </Svg>
        );
      }
      break;
    }
    case "cheekoff": {
      const reach = 1 - c01(sT / 0.8);
      visual = (
        <Svg zoom={1.1 - sT * 0.04}>
          <rect width={1080} height={1920} fill={night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
          <SideFingers reach={reach} />
        </Svg>
      );
      break;
    }
    case "sigh": {
      const k = cam(sT, { z: 1.6, x: 640, y: 1000 }, { z: 2.1, x: 640, y: 1000 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Room>
            <Nightlight on={1} />
            <Bed tilt={-1} />
            <Visitor headTurn={-60} />
            <Ripples t={sT * 0.4} x={640} y={1020} color="#8E8B84" />
          </Room>
        </Svg>
      );
      break;
    }
    case "crawl": {
      const k = cam(sT, { z: 1.3, x: 420, y: 1500 }, { z: 1.3, x: 300, y: 1450 }, 3);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Room>
            <Door />
            <Nightlight on={1} />
            <Shadow size={0.1} />
            <Crawl x={420 - sT * 40} y={1560} phase={sT * 1.4} />
          </Room>
        </Svg>
      );
      break;
    }
    case "voiceCorr": {
      const k = cam(sT, { z: 1.5, x: 230, y: 900 }, { z: 1.7, x: 220, y: 900 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Room>
            <Door open={0.1} light={0.6} />
            <Ripples t={sT} x={230} y={940} color="#FFD27A" />
          </Room>
        </Svg>
      );
      break;
    }
    case "stand": {
      const up = c01(sT / 1.2);
      visual = (
        <Svg zoom={1.25} cx={640} cy={1100 - up * 150}>
          <Room>
            <Window />
            <Nightlight on={1} />
            <Bed tilt={-1 + up} />
            <Visitor y={1180 - up * 260} headTurn={-20} />
          </Room>
        </Svg>
      );
      overlay = <Sfx text="СКРИП" startFrame={f(shotStart + 0.9)} x={300} y={900} />;
      break;
    }
    case "springs": {
      const tilt = interpolate(sT, [0, 0.15, 0.5], [1.4, -0.8, 0], { extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.5} cx={540} cy={1400}>
          <Room>
            <Nightlight on={1} />
            <Bed tilt={tilt} />
          </Room>
        </Svg>
      );
      overlay = <Sfx text="СКРИП" startFrame={f(shotStart + 0.05)} x={540} y={900} />;
      break;
    }
    case "steps": {
      if (!half) {
        visual = (
          <Svg zoom={1.4} cx={540} cy={1600}>
            <Room>
              <Door />
              <Shadow size={0.2 + sT * 0.25} />
              <Crawl x={300} y={1560} phase={0.3} />
            </Room>
          </Svg>
        );
        overlay = <Tag x={700} y={1180} tone="alert">ШАГИ</Tag>;
      } else {
        visual = (
          <Svg zoom={1.15 + (sT - shotLen / 2) * 0.1}>
            <rect width={1080} height={1920} fill={night.wallDark} />
            <KidFace eyesOpen={0} squeeze={1} />
          </Svg>
        );
      }
      break;
    }
    case "reach": {
      visual = <Svg zoom={1}><Knob reach={c01(sT / 1.2) * 0.7} /></Svg>;
      break;
    }
    case "knob": {
      visual = <Svg zoom={1.3 + sT * 0.1} cx={540} cy={980}><Knob reach={1} /></Svg>;
      overlay = <Tag x={620} y={700} tone="paper">холодная</Tag>;
      break;
    }
    case "stuck": {
      const j = Math.sin(sT * 40) * 8 * (sT < 1.2 ? 1 : 0);
      visual = <Svg zoom={1.1}><Knob reach={1} jitter={j} /></Svg>;
      break;
    }
    case "push": {
      const k = cam(sT, { z: 1.6, x: 230, y: 900 }, { z: 1.9, x: 230, y: 900 }, 1.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Room>
            <Door open={0.1} light={0.7} />
            <Ripples t={sT * 1.5} x={230} y={940} color="#FFD27A" />
          </Room>
        </Svg>
      );
      overlay = <Sfx text="ТОЛКАЙ!" startFrame={f(shotStart)} x={620} y={700} />;
      break;
    }
    case "behind": {
      visual = (
        <Svg zoom={1.7 + sT * 0.1} cx={640} cy={900}>
          <Room>
            <Nightlight on={1} />
            <Visitor y={920} headTurn={-45} />
            <Ripples t={sT} x={640} y={760} color="#C9D3FF" />
          </Room>
        </Svg>
      );
      break;
    }
    case "both": {
      visual = (
        <Svg zoom={1 + sT * 0.03}>
          <rect width={1080} height={1920} fill={night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
          <Ripples t={sT} x={60} y={900} color="#FFD27A" />
          <Ripples t={sT + 0.5} x={1020} y={900} color="#C9D3FF" />
        </Svg>
      );
      overlay = <Tag x={300} y={1180} tone="alert">ОБА — МАМИНЫ</Tag>;
      break;
    }
    case "closer": {
      visual = (
        <Svg zoom={1.4 + sT * 0.35} cx={540} cy={1650}>
          <Room>
            <Door />
            <Shadow size={0.5 + sT * 0.5} />
            <Crawl x={300} y={1560} phase={0.3} />
          </Room>
        </Svg>
      );
      break;
    }
    case "open": {
      const o = c01((sT - 0.3) / 0.6);
      visual = (
        <Svg zoom={1.3} cx={260} cy={900}>
          <Room>
            <Door open={o * 0.9} light={0.3 + o} />
            <Crawl x={300} y={1560} phase={0.5} />
          </Room>
          <rect width={1080} height={1920} fill="#FFE9B0" opacity={o * 0.6} />
        </Svg>
      );
      break;
    }
    case "light": {
      const fade = c01(sT / 1.2);
      visual = (
        <Svg zoom={1 + sT * 0.05}>
          <rect width={1080} height={1920} fill="#FFE9B0" />
          <rect width={1080} height={1920} fill="#F2B96B" opacity={fade * 0.5} />
          <g opacity={0.9}>
            <KidFace eyesOpen={0} squeeze={1} />
          </g>
        </Svg>
      );
      break;
    }
    case "grab": {
      const r = c01(sT / 0.9);
      visual = (
        <Svg zoom={1.05}>
          <rect width={1080} height={1920} fill="#F2B96B" />
          <KidFace eyesOpen={0} squeeze={1} />
          <WarmArms reach={r} />
          <rect width={1080} height={1920} fill="#FFE9B0" opacity={c01((sT - 1.2) * 2)} />
        </Svg>
      );
      break;
    }
    case "slam": {
      const closing = 1 - c01(sT / 0.25);
      visual = (
        <Svg zoom={1.2 + sT * 0.05} cx={540} cy={900}>
          <Corridor>
            <CorridorDoor open={closing * 0.9} />
          </Corridor>
        </Svg>
      );
      overlay = <Sfx text="ХЛОП" startFrame={f(shotStart + 0.25)} x={540} y={600} color="#fff" />;
      break;
    }
    case "hug": {
      const k = cam(sT, { z: 1.0, x: 540, y: 960 }, { z: 1.15, x: 540, y: 900 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor>
            <CorridorDoor x={720} />
            <Hug x={360} y={940} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "mum": {
      visual = (
        <Svg zoom={1 + sT * 0.03}>
          <Corridor>
            <Mum x={540} y={760} scale={2.4} smile={0.5} eyesOpen />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="paper">блины</Tag>;
      break;
    }
    case "hugClose": {
      visual = (
        <Svg zoom={2.2 + sT * 0.1} cx={360} cy={1230}>
          <Corridor>
            <Hug x={360} y={940} tight={0.5} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "silence": {
      const k = cam(sT, { z: 1.2, x: 850, y: 900 }, { z: 1.6, x: 850, y: 900 }, 3);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.25}>
            <CorridorDoor x={720} />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="paper">тишина</Tag>;
      break;
    }
    case "knock": {
      const pulse = sT < 0.15 ? 1 + (0.15 - sT) * 0.3 : 1;
      visual = (
        <Svg zoom={1.7 * pulse} cx={850} cy={900}>
          <Corridor dim={0.3}>
            <CorridorDoor x={720} shake={sT < 0.15 ? Math.sin(sT * 80) * 6 : 0} />
          </Corridor>
        </Svg>
      );
      overlay = <Sfx text="ТУК" startFrame={f(shotStart)} x={840} y={700} />;
      break;
    }
    case "voiceRoom": {
      const k = cam(sT, { z: 1.5, x: 850, y: 900 }, { z: 1.7, x: 850, y: 950 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.35}>
            <CorridorDoor x={720} />
            <Ripples t={sT} x={850} y={940} color="#C9D3FF" />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={560} y={520} tone="alert">ТВОЙ ГОЛОС</Tag>;
      break;
    }
    case "squeeze": {
      const tight = c01(sT / 0.8);
      visual = (
        <Svg zoom={1.9 + tight * 0.15} cx={360} cy={1200}>
          <Corridor dim={0.2}>
            <Hug x={360} y={940} tight={tight} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "whisper": {
      visual = (
        <Svg zoom={1.05 + sT * 0.03}>
          <Corridor dim={0.3}>
            <Mum x={540} y={760} scale={2.4} smile={0.2} eyesOpen />
            <Ripples t={sT * 0.6} x={540} y={840} color="#F4EEDC" />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="paper">шёпот</Tag>;
      break;
    }
    case "remember": {
      const flash = c01((sT - 0.6) / 0.3);
      visual = (
        <Svg zoom={1}>
          <rect width={1080} height={1920} fill="#07080F" />
          <KidFace eyesOpen={0} squeeze={1} />
          <g opacity={flash}>
            <rect width={1080} height={1920} fill="#07080F" opacity={0.8} />
            <Nightlight x={540} y={980} on={1} />
          </g>
        </Svg>
      );
      break;
    }
    case "nightlight": {
      const k = cam(sT, { z: 1.0, x: 540, y: 960 }, { z: 1.5, x: 900, y: 1200 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Room>
            <Window />
            <Door />
            <Nightlight on={1} />
            <Bed tilt={0} />
          </Room>
        </Svg>
      );
      break;
    }
    case "strip": {
      const k = cam(sT, { z: 1.8, x: 850, y: 1320 }, { z: 2.2, x: 850, y: 1320 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.4}>
            <CorridorDoor x={720} strip={1} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "stripBlink": {
      const lamp = blinkLevel(t, timeline.marks.blinks2);
      visual = (
        <Svg zoom={2.4} cx={850} cy={1320}>
          <Corridor dim={0.45}>
            <CorridorDoor x={720} strip={lamp} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "mumWhisper": {
      const smile = interpolate(sT, [0.5, 3.5], [0.3, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.1 + sT * 0.04}>
          <Corridor dim={0.35}>
            <Mum x={540} y={760} scale={2.4} smile={smile} eyesOpen={smile < 0.8} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "choice2": {
      const dark = c01(sT / 2);
      visual = (
        <Svg zoom={1.2 + sT * 0.05} cx={360} cy={1100}>
          <Corridor dim={0.2 + dark * 0.5}>
            <CorridorDoor x={720} strip={1} />
            <Hug x={360} y={940} tight={1} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "end": {
      const showA = c01((t - C(33).start) / 0.5);
      const showB = c01((t - C(34).start) / 0.5);
      const showCta = c01((t - C(35).start) / 0.5);
      const showP = c01((t - C(36).start) / 0.5);
      const card = (label: string, sub: string, color: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 18, padding: "60px 36px", borderRadius: 28, background: "rgba(255,255,255,0.05)", border: `3px solid ${color}`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: pal.text, marginTop: 24, lineHeight: 1.2 }}>{sub}</div>
        </div>
      );
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", justifyContent: "center", padding: "0 54px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: pal.text, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, opacity: showA }}>Что делать<br />дальше?</div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Открыть глаза и увидеть, кто держит", pal.accent, showA, -40)}
            {card("Б", "Ответить голосу из комнаты", pal.alert, showB, 40)}
          </div>
          <div style={{ marginTop: 80, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: pal.text, textTransform: "uppercase", opacity: showCta }}>
            Напиши в комментариях: <span style={{ color: pal.accent }}>А</span> или <span style={{ color: pal.alert }}>Б</span>
          </div>
          <div style={{ marginTop: 60, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', fontSize: 34, letterSpacing: "0.2em", color: "#8E8B84", textTransform: "uppercase", opacity: showP }}>Часть 4 — по вашему выбору</div>
        </AbsoluteFill>
      );
      break;
    }
  }

  const dip = sT < 0.1 ? 1 - sT / 0.1 : 0;

  return (
    <AbsoluteFill style={{ background: "#0A0A12", overflow: "hidden" }}>
      {visual}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {overlay}
      {scene !== "end" && active && <Caption key={cur.i} text={cur.text} startFrame={f(cur.start)} />}
      <AbsoluteFill style={{ background: "#000", opacity: dip * 0.85 }} />

      <Audio src={staticFile(timeline.audio)} volume={1} />
      <Audio src={staticFile("ambient3.wav")} volume={0.55} />
      <Sequence from={f(C(6).start + 0.9)} durationInFrames={20}><Audio src={staticFile("creak.wav")} volume={0.8} /></Sequence>
      <Sequence from={f(C(17).start + 0.25)} durationInFrames={40}><Audio src={staticFile("thud.wav")} volume={1} /></Sequence>
      {[22, 23, 24].map((i) => (
        <Sequence key={i} from={f(C(i).start)} durationInFrames={30}><Audio src={staticFile("thud.wav")} volume={0.6} /></Sequence>
      ))}
      <Sequence from={f(C(32).start)} durationInFrames={40}><Audio src={staticFile("thud.wav")} volume={0.9} /></Sequence>
    </AbsoluteFill>
  );
};
