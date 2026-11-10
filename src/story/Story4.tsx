import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline4.json";
import { Bed, Corridor, CorridorDoor, Double, Fallen, Hug, KidFace, Mum, Nightlight, Ripples, Room, Shadow, Window, pal } from "./art";
import { Caption, Sfx, Tag } from "./Captions";

export const STORY4_FPS = 30;
export const STORY4_FRAMES = Math.ceil((timeline.duration + 1.5) * STORY4_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * STORY4_FPS);
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
const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; style?: React.CSSProperties }> = ({ children, zoom = 1, cx = 540, cy = 960, style }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, ...style }}>
    {children}
  </svg>
);
const FONT = '"Inter Display", Inter, system-ui, sans-serif';
type Cam = { z: number; x: number; y: number };
const cam = (sT: number, a: Cam, b: Cam, dur = 2.5): Cam => {
  const p = c01(sT / dur);
  const e = 1 - Math.pow(1 - p, 3);
  return { z: lerp(a.z, b.z, e), x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) };
};

const RuleCard: React.FC<{ n: string; text: string; show: number }> = ({ n, text, show }) => (
  <AbsoluteFill style={{ background: "#0B0B12", alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center", opacity: show }}>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 34, letterSpacing: "0.3em", color: "#8E8B84" }}>ПРАВИЛО {n}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, lineHeight: 1.05, color: pal.alert, textTransform: "uppercase", marginTop: 30 }}>{text}</div>
  </AbsoluteFill>
);

export const Story4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const active = t >= chunks[0].start;
  const scene = active ? cur.scene : "choice";
  const shotStart = active ? cur.start : 0;
  const sT = Math.max(0, t - shotStart);
  const shotLen = active ? Math.max(0.5, (chunks[cur.i + 1]?.start ?? timeline.duration) - cur.start) : 1;
  const half = sT > shotLen / 2;
  const night = pal.night;

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;

  switch (scene) {
    case "choice":
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", alignItems: "center", justifyContent: "center", transform: `scale(${1 + sT * 0.03})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: pal.alert, lineHeight: 1 }}>Б</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: pal.text, textTransform: "uppercase", marginTop: 20 }}>Ответить</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, letterSpacing: "0.2em", color: "#8E8B84", marginTop: 50 }}>ЧАСТЬ 4 · ВЫБОР ЗРИТЕЛЕЙ</div>
        </AbsoluteFill>
      );
      break;
    case "answer":
      visual = (
        <Svg zoom={1.05 + sT * 0.04}>
          <rect width={1080} height={1920} fill={night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
          <Ripples t={sT} x={540} y={1100} color="#F4EEDC" />
        </Svg>
      );
      break;
    case "silence": {
      const k = cam(sT, { z: 1.3, x: 850, y: 900 }, { z: 1.6, x: 850, y: 900 }, 3);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.35}><CorridorDoor x={720} strip={0.6} /></Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>тишина</Tag>;
      break;
    }
    case "freeze":
      visual = (
        <Svg zoom={2.0} cx={360} cy={1200}>
          <Corridor dim={0.25}><Hug x={360} y={940} tight={0.2} /></Corridor>
        </Svg>
      );
      break;
    case "squeeze": {
      const tight = c01(sT / 0.9);
      const pulse = 1 + Math.sin(sT * 10) * 0.012 * tight;
      visual = (
        <Svg zoom={(2.1 + tight * 0.3) * pulse} cx={360} cy={1200}>
          <Corridor dim={0.3}><Hug x={360} y={940} tight={tight} /></Corridor>
        </Svg>
      );
      overlay = <Tag x={560} y={520} tone="alert">СЛИШКОМ СИЛЬНО</Tag>;
      break;
    }
    case "notMum":
      visual = (
        <Svg zoom={1.1 + sT * 0.05}>
          <Corridor dim={0.5}><Mum x={540} y={760} scale={2.4} smile={0.95} eyesOpen={false} /></Corridor>
          <Ripples t={sT} x={540} y={860} color={pal.alert} />
        </Svg>
      );
      break;
    case "rule1":
      visual = <RuleCard n="1" text="Не отвечай" show={c01(sT / 0.3)} />;
      break;
    case "found": {
      const flash = sT < 0.2 ? 1 - sT / 0.2 : 0;
      visual = (
        <Svg zoom={1.6 + sT * 0.1} cx={540} cy={800}>
          <Corridor dim={0.55}><Mum x={540} y={760} scale={2.4} smile={0.95} eyesOpen={false} /></Corridor>
          <rect width={1080} height={1920} fill={pal.alert} opacity={0.35 * flash} />
        </Svg>
      );
      overlay = <Tag x={330} y={300} tone="alert">ТЕБЯ НАШЛО</Tag>;
      break;
    }
    case "fall": {
      const j = sT < 0.4 ? Math.sin(sT * 60) * 14 * (1 - sT / 0.4) : 0;
      visual = (
        <Svg zoom={1.3} cx={420 + j} cy={1150}>
          <Corridor dim={0.3}>
            <CorridorDoor x={720} strip={0.6} />
            <Fallen x={420} y={1240} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "eyesShut":
      visual = (
        <Svg zoom={1.1 + sT * 0.05}>
          <rect width={1080} height={1920} fill={night.wallDark} />
          <KidFace eyesOpen={0} squeeze={1} />
        </Svg>
      );
      break;
    case "lock":
      visual = (
        <Svg zoom={2.6} cx={760} cy={940}>
          <Corridor dim={0.3}><CorridorDoor x={720} strip={0.6} /></Corridor>
        </Svg>
      );
      overlay = <Sfx text="ЩЁЛК" startFrame={f(shotStart + 0.05)} x={540} y={600} color="#fff" />;
      break;
    case "doorOpens": {
      const o = c01((sT - 0.2) / 1.2);
      visual = (
        <Svg zoom={1.5} cx={850} cy={900}>
          <Corridor dim={0.3}>
            <CorridorDoor x={720} strip={1} open={o * 0.85} />
            <rect x={720} y={540} width={260 * o * 0.85} height={760} fill="#FFD27A" opacity={0.5} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "lightDoor": {
      const k = cam(sT, { z: 1.5, x: 850, y: 900 }, { z: 1.2, x: 700, y: 950 }, 2.5);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.3}>
            <CorridorDoor x={720} strip={1} open={0.85} />
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <polygon points="720,1300 980,1300 1080,1920 400,1920" fill="#FFD27A" opacity={0.25} />
          </Corridor>
        </Svg>
      );
      break;
    }
    case "steps":
      visual = (
        <Svg zoom={1.5} cx={700} cy={1600}>
          <Corridor dim={0.3}>
            <CorridorDoor x={720} strip={1} open={0.85} />
            <polygon points="720,1300 980,1300 1080,1920 400,1920" fill="#FFD27A" opacity={0.25} />
            <Shadow size={0.15 + sT * 0.1} />
          </Corridor>
        </Svg>
      );
      overlay = <Sfx text="ТОП" startFrame={f(shotStart + 0.1)} x={400} y={1100} />;
      break;
    case "someone": {
      const a = c01((sT - 0.2) / 1.2);
      visual = (
        <Svg zoom={1.4} cx={800} cy={950}>
          <Corridor dim={0.35}>
            <CorridorDoor x={720} strip={1} open={0.85} />
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <g opacity={a}><Double x={830} y={880} scale={0.8} lamp={0.8} /></g>
          </Corridor>
        </Svg>
      );
      break;
    }
    case "voice":
      visual = (
        <Svg zoom={1.9} cx={830} cy={900}>
          <Corridor dim={0.35}>
            <CorridorDoor x={720} strip={1} open={0.85} />
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <Double x={830} y={880} scale={0.8} lamp={0.8} />
            <Ripples t={sT} x={830} y={900} color="#C9D3FF" />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="alert">ТВОЙ ГОЛОС</Tag>;
      break;
    case "rule2":
      visual = <RuleCard n="2" text="Если ответил — смотри" show={c01(sT / 0.3)} />;
      break;
    case "behind":
      visual = (
        <Svg zoom={1.3 + sT * 0.08}>
          <Corridor dim={0.55}><Mum x={540} y={760} scale={2.4} smile={0.95} eyesOpen={false} /></Corridor>
          <Ripples t={sT * 1.4} x={540} y={860} color={pal.alert} />
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="alert">НЕ СМОТРИ</Tag>;
      break;
    case "front":
      visual = (
        <Svg zoom={2.6 + sT * 0.1} cx={830} cy={850}>
          <Corridor dim={0.35}>
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <Double x={830} y={880} scale={0.8} lamp={0.8} />
            <Ripples t={sT} x={830} y={900} color="#C9D3FF" />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>СМОТРИ</Tag>;
      break;
    case "hum":
    case "blink": {
      const lamp = scene === "blink" ? blinkLevel(t, timeline.marks.blinks) : 1;
      const hum = 1 + Math.sin(sT * 50) * 0.01;
      visual = (
        <Svg zoom={(3.4 + sT * 0.05) * hum} cx={830} cy={1130}>
          <Corridor dim={0.4}>
            <Double x={830} y={880} scale={0.8} lamp={lamp} />
          </Corridor>
        </Svg>
      );
      if (scene === "hum") overlay = <Sfx text="ЖЖЖ" startFrame={f(shotStart + 0.3)} x={300} y={700} color="#FFD27A" />;
      break;
    }
    case "open": {
      const o = c01((sT - 0.5) / 0.9);
      visual = (
        <Svg zoom={1.1 - o * 0.05}>
          <rect width={1080} height={1920} fill={night.wallDark} />
          <KidFace eyesOpen={o} squeeze={1 - o} />
          <rect width={1080} height={1920} fill="#FFD27A" opacity={o * 0.15} />
        </Svg>
      );
      break;
    }
    case "double": {
      const k = cam(sT, { z: 1.0, x: 700, y: 1000 }, { z: 1.25, x: 800, y: 950 }, 3);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.2}>
            <CorridorDoor x={720} strip={1} open={0.85} />
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <Double x={830} y={880} scale={0.8} lamp={1} />
          </Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260} tone="alert">ЭТО ТЫ</Tag>;
      break;
    }
    case "eyesClosed":
      visual = (
        <Svg zoom={3.2 + sT * 0.1} cx={830} cy={870}>
          <Corridor dim={0.2}>
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <Double x={830} y={880} scale={0.8} lamp={1} />
          </Corridor>
        </Svg>
      );
      break;
    case "emptyCorridor": {
      const k = cam(sT, { z: 1.0, x: 540, y: 960 }, { z: 1.1, x: 300, y: 960 }, 3);
      visual = (
        <Svg zoom={k.z} cx={k.x} cy={k.y}>
          <Corridor dim={0.3}><CorridorDoor x={720} strip={1} open={0.85} /></Corridor>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>никого</Tag>;
      break;
    }
    case "offer":
    case "ruleToo": {
      const o = scene === "offer" ? c01((sT - 0.3) / 1.0) : 1;
      visual = (
        <Svg zoom={1.8 + sT * 0.03} cx={760} cy={1000}>
          <Corridor dim={0.2}>
            <rect x={720} y={540} width={222} height={760} fill="#FFD27A" opacity={0.6} />
            <Double x={830} y={880} scale={0.8} lamp={1} offer={o} />
          </Corridor>
        </Svg>
      );
      if (scene === "ruleToo") overlay = <Tag x={90} y={260} tone="alert">ПРАВИЛО ТВОЁ</Tag>;
      break;
    }
    case "take": {
      const warm = 0.6 + Math.sin(sT * 3) * 0.2;
      visual = (
        <Svg zoom={1.0 + sT * 0.03}>
          <rect width={1080} height={1920} fill="#120E0A" />
          <circle cx={540} cy={960} r={500} fill="#FFB347" opacity={0.18 * warm} />
          <Nightlight x={540} y={1000} on={1} />
          <path d="M300 1180 q-60 120 40 180" stroke={pal.skin} strokeWidth={56} fill="none" strokeLinecap="round" />
          <path d="M780 1180 q60 120 -40 180" stroke={pal.skin} strokeWidth={56} fill="none" strokeLinecap="round" />
        </Svg>
      );
      overlay = <Tag x={90} y={260}>тёплый</Tag>;
      break;
    }
    case "morning":
      visual = (
        <Svg zoom={1 + sT * 0.03}>
          <Room mode="morning">
            <Window mode="morning" />
            <Nightlight on={0} />
            <Bed kidUp eyesOpen />
            <Mum x={760} y={940} smile={0.35} />
          </Room>
        </Svg>
      );
      overlay = <Tag x={90} y={260}>08:10 · утро</Tag>;
      break;
    case "realMum": {
      const blink = (sT > 0.8 && sT < 0.95) || (sT > 1.9 && sT < 2.05);
      visual = (
        <Svg zoom={1.05 + sT * 0.03}>
          <rect width={1080} height={1920} fill={pal.morning.wall} />
          <Mum x={540} y={760} scale={2.4} smile={0.35} eyesOpen={!blink} />
        </Svg>
      );
      overlay = <Tag x={90} y={260}>моргает</Tag>;
      break;
    }
    case "lampOff":
      visual = (
        <Svg zoom={2.4 + sT * 0.1} cx={940} cy={1230}>
          <Room mode="morning"><Nightlight on={0} /></Room>
        </Svg>
      );
      break;
    case "mumSays":
      visual = (
        <Svg zoom={1.3} cx={760} cy={1000}>
          <Room mode="morning">
            <Window mode="morning" />
            <Bed kidUp eyesOpen />
            <Mum x={760} y={940} smile={0.35} />
          </Room>
        </Svg>
      );
      break;
    case "mumRule": {
      const smile = interpolate(sT, [0.4, 2.8], [0.35, 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      visual = (
        <Svg zoom={1.1 + sT * 0.05}>
          <rect width={1080} height={1920} fill={pal.morning.wall} />
          <Mum x={540} y={760} scale={2.4} smile={smile} eyesOpen />
        </Svg>
      );
      break;
    }
    case "blink1": {
      const lamp = blinkLevel(t, timeline.marks.blinks2);
      visual = (
        <Svg zoom={2.4} cx={940} cy={1230}>
          <Room mode="morning"><Nightlight on={lamp} /></Room>
        </Svg>
      );
      break;
    }
    default: {
      const i0 = chunks.findIndex((c) => c.scene === "end");
      const showA = c01((t - C(i0).start) / 0.5);
      const showB = c01((t - C(i0 + 1).start) / 0.5);
      const showCta = c01((t - C(i0 + 2).start) / 0.5);
      const showP = c01((t - C(i0 + 3).start) / 0.5);
      const card = (label: string, sub: string, color: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 18, padding: "60px 36px", borderRadius: 28, background: "rgba(255,255,255,0.05)", border: `3px solid ${color}`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color, lineHeight: 1 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: pal.text, marginTop: 24, lineHeight: 1.2 }}>{sub}</div>
        </div>
      );
      visual = (
        <AbsoluteFill style={{ background: "#0B0B12", justifyContent: "center", padding: "0 54px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: pal.text, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, opacity: showA }}>Что делать<br />с ночником?</div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Выбросить", pal.accent, showA, -40)}
            {card("Б", "Оставить и передать правило", pal.alert, showB, 40)}
          </div>
          <div style={{ marginTop: 80, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: pal.text, textTransform: "uppercase", opacity: showCta }}>
            Напиши в комментариях: <span style={{ color: pal.accent }}>А</span> или <span style={{ color: pal.alert }}>Б</span>
          </div>
          <div style={{ marginTop: 60, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', fontSize: 34, letterSpacing: "0.2em", color: "#8E8B84", textTransform: "uppercase", opacity: showP }}>Часть 5 — по вашему выбору</div>
        </AbsoluteFill>
      );
    }
  }

  const dip = sT < 0.1 ? 1 - sT / 0.1 : 0;
  const idx = (s: string) => chunks.find((c) => c.scene === s)?.start ?? -1;
  const thuds = [idx("found"), idx("fall"), idx("rule2"), idx("open"), idx("blink1")].filter((v) => v >= 0);

  return (
    <AbsoluteFill style={{ background: "#0A0A12", overflow: "hidden" }}>
      {visual}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {overlay}
      {scene !== "end" && active && <Caption key={cur.i} text={cur.text} startFrame={f(cur.start)} />}
      <AbsoluteFill style={{ background: "#000", opacity: dip * 0.85 }} />

      <Audio src={staticFile(timeline.audio)} volume={1} />
      <Audio src={staticFile("ambient3.wav")} volume={0.55} />
      {idx("lock") >= 0 && <Sequence from={f(idx("lock"))} durationInFrames={10}><Audio src={staticFile("click.wav")} volume={0.9} /></Sequence>}
      {idx("doorOpens") >= 0 && <Sequence from={f(idx("doorOpens") + 0.2)} durationInFrames={20}><Audio src={staticFile("creak.wav")} volume={0.8} /></Sequence>}
      {thuds.map((at, i) => (
        <Sequence key={i} from={f(at)} durationInFrames={40}><Audio src={staticFile("thud.wav")} volume={0.9} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
