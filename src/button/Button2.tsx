import React from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline2.json";
import { Cabin, CamUi, Display, DoorsInside, FxDefs, Hallway, KitchenDouble, RoofView, Vhs, col } from "./art";

export const BTN2_FPS = 30;
export const BTN2_FRAMES = Math.ceil((timeline.duration + 1.0) * BTN2_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * BTN2_FPS);
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => 1 - Math.pow(1 - c01(p), 3);
const chunkAt = (t: number): Chunk => {
  let cur = chunks[0];
  for (const c of chunks) if (c.start <= t) cur = c;
  return cur;
};
const lineStart = (i: number) => chunks[i].start;
const lineEnd = (i: number) => chunks[i + 1]?.start ?? timeline.duration;
const byScene = (s: string) => chunks.find((c) => c.scene === s)?.start ?? -1;

const FONT = '"Inter Display", Inter, system-ui, sans-serif';
const KEYWORDS = ["одиннадцать", "вышел", "девятый", "номеров", "крыша", "снизу", "тридцать", "шестая", "свет", "остаться", "календарь", "третий", "открыта", "человек", "панели", "моей", "голосом", "опоздал", "шесть"];
const VOWELS = "аеёиоуыэюя";
const syl = (w: string) => Math.max(1, [...w.toLowerCase()].filter((ch) => VOWELS.includes(ch)).length);

const Caption: React.FC<{ text: string; start: number; end: number; t: number }> = ({ text, start, end, t }) => {
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + syl(w), 0);
  const speech = Math.max(0.6, end - start - 0.25);
  let acc = 0;
  const appear = c01((t - start + 0.1) / 0.12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 66, lineHeight: 1.12, textTransform: "uppercase", letterSpacing: "0.01em", opacity: appear }}>
      {words.map((w, i) => {
        const ws = start + (acc / total) * speech;
        acc += syl(w);
        const we = start + (acc / total) * speech;
        const clean = w.toLowerCase().replace(/[^а-яё]/g, "");
        const key = KEYWORDS.includes(clean);
        const active = t >= ws && t < we + 0.05;
        const past = t >= we + 0.05;
        const color = key && (active || past) ? col.yellow : past || active ? col.white : "rgba(242,245,243,0.55)";
        return (
          <span key={i} style={{ display: "inline-block", margin: "0 8px", color, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.6)", transform: `scale(${active ? 1.07 : 1})` }}>{w}</span>
        );
      })}
    </div>
  );
};

const Plate: React.FC<{ children: React.ReactNode; x: number; y: number; color?: string; big?: boolean }> = ({ children, x, y, color = col.yellow, big = false }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: big ? "16px 30px" : "10px 22px", background: color, color: col.black, fontFamily: FONT, fontWeight: 900, fontSize: big ? 52 : 36, textTransform: "uppercase", letterSpacing: "0.02em", transform: "rotate(-2deg)", boxShadow: "0 8px 0 rgba(0,0,0,0.6)" }}>{children}</div>
);

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; style?: React.CSSProperties }> = ({ children, zoom = 1, cx = 540, cy = 960, dx = 0, dy = 0, style }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, ...style }}>
    <FxDefs />
    {children}
  </svg>
);

export const Button2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const active = t >= chunks[0].start;
  const i = active ? cur.i : 0;
  const scene = active ? cur.scene : "choice";
  const sT = Math.max(0, t - lineStart(i));
  const len = lineEnd(i) - lineStart(i);

  const shakeX = Math.sin(t * 1.7) * 6 + Math.sin(t * 4.3) * 3 + (random(`jx${frame}`) - 0.5) * 2;
  const shakeY = Math.cos(t * 1.3) * 5 + Math.sin(t * 3.7) * 3 + (random(`jy${frame}`) - 0.5) * 2;
  const tube = 1 - (random(`fl${Math.floor(frame / 2)}`) > 0.93 ? 0.6 : 0) - random(`fl2${frame}`) * 0.05;

  const glitchA = byScene("below");
  const glitchB = byScene("myPanel");
  const g1 = glitchA >= 0 && t >= glitchA - 0.1 && t < glitchA + 0.6 ? 1 : 0;
  const g2 = glitchB >= 0 && t >= glitchB - 0.05 && t < glitchB + 0.7 ? 1 : 0;
  const glitching = g1 || g2;

  let visual: React.ReactNode = null;

  switch (scene) {
    case "choice":
      visual = (
        <AbsoluteFill style={{ background: col.bg, alignItems: "center", justifyContent: "center", transform: `scale(${1 + sT * 0.03})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: col.yellow, lineHeight: 1, WebkitTextStroke: "4px #050706", paintOrder: "stroke fill" }}>Б</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: col.white, textTransform: "uppercase", marginTop: 20 }}>Выйти</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, letterSpacing: "0.25em", color: col.steelLight, marginTop: 50 }}>ДЕСЯТАЯ КНОПКА · СЕРИЯ 2</div>
        </AbsoluteFill>
      );
      break;
    case "display": {
      const off = sT > len * 0.55;
      visual = (
        <Svg zoom={1.15} cx={540} cy={960} dx={shakeX} dy={shakeY}>
          <Display value="11" flicker={off ? 0.05 : 0.9 + random(`df${frame}`) * 0.1} />
        </Svg>
      );
      break;
    }
    case "doorsOpen": {
      const o = c01((sT - 0.2) / 1.2);
      visual = (
        <Svg zoom={1.0} cx={540} cy={960} dx={shakeX} dy={shakeY}>
          <DoorsInside ajar={0} />
          <rect x={540 - 540 * o} y={0} width={1080 * o} height={1920} fill="#1A201D" />
          <rect x={540 - 540 * o} y={0} width={1080 * o} height={1920} fill={col.light} opacity={0.08 * tube} />
        </Svg>
      );
      break;
    }
    case "stepOut":
      visual = (
        <Svg zoom={lerp(1.0, 1.3, ease(sT / 2.5))} cx={540} cy={900} dx={shakeX * 1.6} dy={shakeY * 1.6 + Math.abs(Math.sin(sT * 6)) * 8}>
          <Hallway tube={tube} />
        </Svg>
      );
      break;
    case "myFloor":
      visual = (
        <Svg zoom={1.15} cx={540} cy={900} dx={shakeX} dy={shakeY}>
          <Hallway tube={tube} />
        </Svg>
      );
      break;
    case "same":
      visual = (
        <Svg zoom={1.5} cx={lerp(200, 880, ease(sT / 3))} cy={900} dx={shakeX} dy={shakeY}>
          <Hallway tube={tube} />
        </Svg>
      );
      break;
    case "noNumbers":
      visual = (
        <Svg zoom={lerp(2.4, 3.2, ease(sT / 1.8))} cx={900} cy={500} dx={shakeX * 0.5} dy={shakeY * 0.5}>
          <Hallway tube={tube} />
        </Svg>
      );
      break;
    case "window":
      visual = (
        <Svg zoom={lerp(1.2, 2.4, ease(sT / 1.8))} cx={540} cy={830} dx={shakeX} dy={shakeY}>
          <Hallway tube={tube} />
        </Svg>
      );
      break;
    case "roofView":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(sT / 2))} cx={540} cy={1100} dx={shakeX} dy={shakeY}>
          <RoofView />
        </Svg>
      );
      break;
    case "below":
      visual = (
        <Svg zoom={lerp(1.3, 1.6, ease(sT / 1.2))} cx={540} cy={1000} dx={shakeX * 1.5} dy={shakeY * 1.5}>
          <RoofView />
        </Svg>
      );
      break;
    case "flat":
      visual = (
        <Svg zoom={lerp(1.3, 2.2, ease(sT / 2.5))} cx={900} cy={700} dx={shakeX} dy={shakeY}>
          <Hallway tube={tube} numbers />
        </Svg>
      );
      break;
    case "lightUnder":
      visual = (
        <Svg zoom={lerp(2.4, 2.8, ease(sT / 2))} cx={900} cy={1300} dx={shakeX * 0.6} dy={shakeY * 0.6}>
          <Hallway tube={tube} numbers lightUnder={0.6 + Math.sin(sT * 7) * 0.2} />
        </Svg>
      );
      break;
    case "liftCloses": {
      const o = 1 - c01((sT - 0.2) / 1.0);
      visual = (
        <Svg zoom={1.1} cx={540} cy={960} dx={shakeX * 1.3} dy={shakeY * 1.3}>
          <Cabin open={o} lit={10} dim={0.2} />
        </Svg>
      );
      break;
    }
    case "voice":
      visual = (
        <Svg zoom={1.5} cx={540} cy={800} dx={shakeX * 0.5} dy={shakeY * 0.5}>
          <Cabin open={0} lit={10} dim={0.3} />
          <g transform="translate(540 430)">
            <rect x={-120} y={-40} width={240} height={80} rx={10} fill={col.steelDark} />
            {Array.from({ length: 9 }).map((_, k) => <rect key={k} x={-100 + k * 24} y={-26} width={10} height={52} rx={4} fill="#000" />)}
            {[0, 1, 2].map((k) => {
              const p = (sT * 0.9 + k / 3) % 1;
              return <circle key={k} cx={0} cy={0} r={60 + p * 360} stroke={col.light} strokeWidth={3} fill="none" opacity={(1 - p) * 0.5} />;
            })}
          </g>
        </Svg>
      );
      break;
    case "calendar":
      visual = (
        <Svg zoom={lerp(2.0, 2.6, ease(sT / 2))} cx={260} cy={600} dx={shakeX * 0.6} dy={shakeY * 0.6}>
          <KitchenDouble />
        </Svg>
      );
      break;
    case "year":
      visual = (
        <Svg zoom={lerp(3.4, 3.8, ease(sT / 1.5))} cx={260} cy={530} dx={shakeX * 0.4} dy={shakeY * 0.4}>
          <KitchenDouble />
          <rect width={1080} height={1920} fill={col.red} opacity={0.05 + Math.abs(Math.sin(sT * 6)) * 0.05} />
        </Svg>
      );
      break;
    case "doorOpen":
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(sT / 2))} cx={540} cy={960} dx={shakeX} dy={shakeY}>
          <KitchenDouble />
        </Svg>
      );
      break;
    case "figure":
      visual = (
        <Svg zoom={lerp(1.3, 1.6, ease(sT / 2.5))} cx={540} cy={1000} dx={shakeX} dy={shakeY}>
          <KitchenDouble />
        </Svg>
      );
      break;
    case "phone":
      visual = (
        <Svg zoom={lerp(2.0, 3.2, ease(sT / 2.5))} cx={700} cy={1000} dx={shakeX * 0.5} dy={shakeY * 0.5}>
          <KitchenDouble />
        </Svg>
      );
      break;
    case "myPanel":
      visual = (
        <Svg zoom={lerp(5.0, 5.6, ease(sT / 1.5))} cx={700} cy={1000} dx={shakeX * 0.3} dy={shakeY * 0.3}>
          <KitchenDouble />
        </Svg>
      );
      break;
    case "speaks": {
      const turn = c01((sT - 0.4) / 1.6) * 0.35;
      visual = (
        <Svg zoom={lerp(1.6, 1.9, ease(sT / 2.5))} cx={540} cy={900} dx={shakeX * 0.7} dy={shakeY * 0.7}>
          <KitchenDouble turn={turn} />
          {[0, 1, 2].map((k) => {
            const p = (sT * 0.8 + k / 3) % 1;
            return <circle key={k} cx={540} cy={900} r={60 + p * 300} stroke={col.light} strokeWidth={3} fill="none" opacity={(1 - p) * 0.45} />;
          })}
        </Svg>
      );
      break;
    }
    case "line":
      visual = (
        <Svg zoom={lerp(2.2, 2.6, ease(sT / 2))} cx={540} cy={900} dx={shakeX * 0.4} dy={shakeY * 0.4}>
          <KitchenDouble turn={0.35} phoneGlow={0.4} />
          <rect width={1080} height={1920} fill="#000" opacity={0.25 + c01((sT - len + 0.5) / 0.5) * 0.7} />
        </Svg>
      );
      break;
    default: {
      const i0 = chunks.findIndex((c) => c.scene === "end");
      const showA = c01((t - lineStart(i0)) / 0.4);
      const showB = c01((t - lineStart(i0 + 1)) / 0.4);
      const showC = c01((t - lineStart(i0 + 2)) / 0.4);
      const card = (label: string, sub: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 16, padding: "54px 28px", background: "rgba(255,255,255,0.04)", border: `4px solid ${col.white}`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, color: col.yellow, lineHeight: 1, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill" }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: col.white, marginTop: 20, textTransform: "uppercase", lineHeight: 1.15 }}>{sub}</div>
        </div>
      );
      visual = (
        <>
          <Svg zoom={1.2} cx={540} cy={960} style={{ opacity: 0.45 }}><KitchenDouble turn={0.35} /></Svg>
          <AbsoluteFill style={{ background: "rgba(5,7,6,0.6)", justifyContent: "center", padding: "0 50px" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, color: col.white, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, opacity: showA, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill" }}>Что мне<br />делать?</div>
            <div style={{ display: "flex", marginTop: 60 }}>
              {card("А", "Вернуться к лифту", showA, -40)}
              {card("Б", "Войти в квартиру", showB, 40)}
            </div>
            <div style={{ marginTop: 70, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: col.yellow, textTransform: "uppercase", opacity: showC, WebkitTextStroke: "2px #050706", paintOrder: "stroke fill" }}>Голосуй в комментариях</div>
          </AbsoluteFill>
        </>
      );
    }
  }

  const split = glitching ? 10 + random(`gs${frame}`) * 18 : 0;
  const cutIn = sT < 0.08 ? 1 - sT / 0.08 : 0;
  const isEnd = scene === "end";
  const voiceAt = byScene("voice");
  const ambientVol = (fr: number) => {
    const tt = fr / fps;
    if (voiceAt >= 0 && tt >= voiceAt - 0.6 && tt < voiceAt + 0.3) return 0;
    const c = chunkAt(tt);
    return tt >= c.start && tt < c.end ? 0.22 : 0.4;
  };

  return (
    <AbsoluteFill style={{ background: col.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, filter: glitching ? "contrast(1.3) saturate(1.4)" : undefined }}>
        {split > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${-split}px)`, mixBlendMode: "screen", opacity: 0.8 }}>{visual}</div>}
        {visual}
        {split > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${split}px)`, mixBlendMode: "screen", opacity: 0.5 }}>{visual}</div>}
      </div>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Vhs strength={glitching ? 2 : 1} />
        {!isEnd && scene !== "choice" && <CamUi t={t} />}
      </svg>
      {t < 2.4 && (
        <>
          <Plate x={70} y={220}>Серия 2</Plate>
          <Plate x={70} y={310} color={col.white} big>Я вышел на десятом</Plate>
        </>
      )}
      {!isEnd && active && <Caption key={i} text={cur.text} start={cur.start} end={lineEnd(i)} t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: cutIn * 0.9 }} />

      <Audio src={staticFile(timeline.audio)} volume={1} />
      <Audio src={staticFile("btn_ambient.wav")} volume={ambientVol} />
      <Audio src={staticFile("btn_hum.wav")} volume={(fr) => (fr / fps < byScene("stepOut") ? 0.35 : 0.1)} />
      {byScene("doorsOpen") >= 0 && <Sequence from={f(byScene("doorsOpen") + 0.1)} durationInFrames={f(2.5)}><Audio src={staticFile("btn_ding.wav")} volume={0.9} /></Sequence>}
      {glitchA >= 0 && <Sequence from={f(glitchA - 0.1)} durationInFrames={f(0.7)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.7} /></Sequence>}
      {glitchB >= 0 && <Sequence from={f(glitchB - 0.05)} durationInFrames={f(0.8)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.8} /></Sequence>}
      {voiceAt >= 0 && <Sequence from={f(voiceAt + 0.2)} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.8} /></Sequence>}
      {byScene("line") >= 0 && <Sequence from={f(byScene("line"))} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.9} /></Sequence>}
    </AbsoluteFill>
  );
};
