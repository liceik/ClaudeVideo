import React from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "./timeline.json";
import { Cabin, CamUi, Desk, Display, DoorsInside, FxDefs, Panel, PhoneShot, Vhs, col } from "./art";

export const BTN_FPS = 30;
export const BTN_FRAMES = Math.ceil((timeline.duration + 1.0) * BTN_FPS);

type Chunk = (typeof timeline.chunks)[number];
const chunks: Chunk[] = timeline.chunks;
const f = (sec: number) => Math.round(sec * BTN_FPS);
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

const FONT = '"Inter Display", Inter, system-ui, sans-serif';
const KEYWORDS = ["десятую", "кнопку", "кнопки", "десятая", "десятый", "ждут", "одиннадцать", "десять", "царапиной", "сам", "заговорил", "крышу", "стоп", "выйти"];
const VOWELS = "аеёиоуыэюя";
const syl = (w: string) => Math.max(1, [...w.toLowerCase()].filter((ch) => VOWELS.includes(ch)).length);

/** Line caption with per-word highlight: word times estimated from syllables within the line's speech window. */
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
          <span key={i} style={{ display: "inline-block", margin: "0 8px", color, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.6)", transform: `scale(${active ? 1.07 : 1})` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Plate: React.FC<{ children: React.ReactNode; x: number; y: number; color?: string; big?: boolean }> = ({ children, x, y, color = col.yellow, big = false }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: big ? "16px 30px" : "10px 22px", background: color, color: col.black, fontFamily: FONT, fontWeight: 900, fontSize: big ? 52 : 36, textTransform: "uppercase", letterSpacing: "0.02em", transform: "rotate(-2deg)", boxShadow: "0 8px 0 rgba(0,0,0,0.6)" }}>
    {children}
  </div>
);

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; style?: React.CSSProperties }> = ({ children, zoom = 1, cx = 540, cy = 960, dx = 0, dy = 0, style }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, ...style }}>
    <FxDefs />
    {children}
  </svg>
);

export const Button: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = chunkAt(t);
  const active = t >= chunks[0].start;
  const i = active ? cur.i : 0;
  const scene = active ? cur.scene : "panel";
  const sT = Math.max(0, t - lineStart(i));
  const len = lineEnd(i) - lineStart(i);

  // handheld shake: low-frequency drift + tiny jitter
  const shakeX = Math.sin(t * 1.7) * 6 + Math.sin(t * 4.3) * 3 + (random(`jx${frame}`) - 0.5) * 2;
  const shakeY = Math.cos(t * 1.3) * 5 + Math.sin(t * 3.7) * 3 + (random(`jy${frame}`) - 0.5) * 2;
  const tubeFlicker = 1 - (random(`fl${Math.floor(frame / 2)}`) > 0.94 ? 0.5 : 0) - random(`fl2${frame}`) * 0.05;

  // key moments
  const glitch1 = lineStart(8); // «На фото кнопки не было»
  const ding = lineStart(15) + 0.2; // «Двери открылись…»
  const waitAt = lineStart(20); // «Десятый этаж. Вас ждут»
  const glitch2 = lineStart(23); // «одиннадцать»
  const g1 = t >= glitch1 - 0.1 && t < glitch1 + 0.6 ? 1 : 0;
  const g2 = t >= glitch2 - 0.05 && t < glitch2 + 0.7 ? 1 : 0;
  const glitching = g1 || g2;

  let visual: React.ReactNode = null;

  switch (scene) {
    case "panel": {
      const z = lerp(1.0, 1.25, ease(t / 5.5));
      visual = (
        <Svg zoom={z} cx={540} cy={lerp(1150, 700, ease(t / 5.5))} dx={shakeX} dy={shakeY}>
          <rect width={1080} height={1920} fill={col.wallDark} />
          <rect x={0} y={0} width={1080} height={1920} fill={col.light} opacity={0.05 * tubeFlicker} />
          <Panel />
        </Svg>
      );
      break;
    }
    case "lift": {
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(sT / 2.5))} cx={540} cy={960} dx={shakeX * 1.5} dy={shakeY * 1.5}>
          <Cabin open={1} />
        </Svg>
      );
      break;
    }
    case "button": {
      const z = i === 3 ? lerp(1.4, 2.6, ease(sT / 1.2)) : i === 4 ? 2.6 : i === 5 ? lerp(3.4, 3.9, ease(sT / 2)) : lerp(3.0, 3.3, ease(sT / 3));
      visual = (
        <Svg zoom={z} cx={540} cy={1900} dx={shakeX * 0.6} dy={shakeY * 0.6}>
          <rect width={1080} height={1920} fill={col.wallDark} />
          <rect width={1080} height={1920} fill={col.light} opacity={0.05 * tubeFlicker} />
          <Panel extra />
        </Svg>
      );
      break;
    }
    case "phone": {
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(sT / 3))} cx={540} cy={1100} dx={shakeX} dy={shakeY}>
          <PhoneShot glitch={g1} />
        </Svg>
      );
      break;
    }
    case "desk": {
      const cx = i === 9 ? 540 : i === 10 ? lerp(540, 760, ease(sT / 2)) : 760;
      const z = i >= 11 ? lerp(1.3, 1.5, ease(sT / 2.5)) : 1.1;
      visual = (
        <Svg zoom={z} cx={cx} cy={1100} dx={shakeX} dy={shakeY}>
          <Desk />
        </Svg>
      );
      break;
    }
    case "night": {
      visual = (
        <Svg zoom={lerp(1.0, 1.08, ease(sT / 2))} cx={540} cy={960} dx={shakeX * 1.4} dy={shakeY * 1.4}>
          <Cabin open={i === 14 ? c01((sT - 0.3) / 1.2) : 0} dim={0.25} />
        </Svg>
      );
      break;
    }
    case "cabin": {
      const open = i === 15 ? c01((sT - 0.1) / 0.9) : 1;
      const z = i === 17 ? lerp(2.2, 2.8, ease(sT / 1.2)) : i === 16 ? lerp(1.4, 2.0, ease(sT / 2)) : lerp(1.0, 1.2, ease(sT / 3));
      const cx = i >= 16 ? 780 : 540;
      const cy = i >= 16 ? 1500 : 960;
      visual = (
        <Svg zoom={z} cx={cx} cy={cy} dx={shakeX} dy={shakeY}>
          <Cabin open={open} lit={10} dim={0.15} />
        </Svg>
      );
      break;
    }
    case "voice": {
      const pulse = i === 20 ? 1 + Math.sin(sT * 8) * 0.01 : 1;
      visual = (
        <Svg zoom={(i === 20 ? 1.5 : 1.25) * pulse} cx={540} cy={800} dx={shakeX * 0.5} dy={shakeY * 0.5}>
          <Cabin open={1} lit={10} dim={0.3} />
          {/* speaker grille */}
          <g transform="translate(540 430)">
            <rect x={-120} y={-40} width={240} height={80} rx={10} fill={col.steelDark} />
            {Array.from({ length: 9 }).map((_, k) => <rect key={k} x={-100 + k * 24} y={-26} width={10} height={52} rx={4} fill="#000" />)}
            {i >= 19 && [0, 1, 2].map((k) => {
              const p = (sT * 0.9 + k / 3) % 1;
              return <circle key={k} cx={0} cy={0} r={60 + p * 360} stroke={col.light} strokeWidth={3} fill="none" opacity={(1 - p) * 0.5} />;
            })}
          </g>
        </Svg>
      );
      break;
    }
    case "display": {
      const value = i === 21 ? (sT > len * 0.6 ? "9" : "-") : i === 22 ? "10" : "11";
      const fl = i === 23 ? 0.6 + Math.abs(Math.sin(sT * 30)) * 0.4 : 0.9 + random(`df${frame}`) * 0.1;
      visual = (
        <Svg zoom={lerp(1.0, 1.2, ease(sT / 1.5))} cx={540} cy={960} dx={shakeX * 1.2} dy={shakeY * 1.2}>
          <Display value={value} flicker={fl} />
        </Svg>
      );
      break;
    }
    case "doors": {
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(sT / 1.5))} cx={700} cy={900} dx={shakeX} dy={shakeY}>
          <DoorsInside ajar={c01((sT - 0.3) / 1.0) * 0.35} />
        </Svg>
      );
      break;
    }
    default: {
      const i0 = chunks.findIndex((c) => c.scene === "end");
      const showA = c01((t - lineStart(i0)) / 0.4);
      const showB = c01((t - lineStart(i0 + 1)) / 0.4);
      const showC = c01((t - lineStart(i0 + 2)) / 0.4);
      const card = (label: string, sub: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 16, padding: "54px 28px", background: "rgba(255,255,255,0.04)", border: `4px solid ${col.white}`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, color: col.yellow, lineHeight: 1, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill" }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: col.white, marginTop: 20, textTransform: "uppercase", lineHeight: 1.15 }}>{sub}</div>
        </div>
      );
      visual = (
        <>
          <Svg zoom={1.1} cx={540} cy={960} dx={shakeX * 0.5} dy={shakeY * 0.5} style={{ opacity: 0.5 }}>
            <DoorsInside ajar={0.35} />
          </Svg>
          <AbsoluteFill style={{ background: "rgba(5,7,6,0.6)", justifyContent: "center", padding: "0 50px" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, color: col.white, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, opacity: showA, WebkitTextStroke: "3px #050706", paintOrder: "stroke fill" }}>Что мне<br />делать?</div>
            <div style={{ display: "flex", marginTop: 60 }}>
              {card("А", "Остаться", showA, -40)}
              {card("Б", "Выйти", showB, 40)}
            </div>
            <div style={{ marginTop: 70, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: col.yellow, textTransform: "uppercase", opacity: showC, WebkitTextStroke: "2px #050706", paintOrder: "stroke fill" }}>Голосуй в комментариях</div>
          </AbsoluteFill>
        </>
      );
    }
  }

  // RGB-split glitch on the whole frame
  const split = glitching ? 10 + random(`gs${frame}`) * 18 : 0;
  const cutIn = sT < 0.08 ? 1 - sT / 0.08 : 0;
  const isEnd = scene === "end";

  // audio ducking: ambient quieter while voice speaks, silent just before «Вас ждут»
  const ambientVol = (fr: number) => {
    const tt = fr / fps;
    if (tt >= waitAt - 0.9 && tt < waitAt + 0.3) return 0;
    const c = chunkAt(tt);
    const speaking = tt >= c.start && tt < c.end;
    return speaking ? 0.22 : 0.4;
  };

  return (
    <AbsoluteFill style={{ background: col.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, filter: glitching ? "contrast(1.3) saturate(1.4)" : undefined }}>
        {split > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${-split}px)`, mixBlendMode: "screen", opacity: 0.8, filter: "url(#none)" }}>{visual}</div>}
        {visual}
        {split > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${split}px)`, mixBlendMode: "screen", opacity: 0.5 }}>{visual}</div>}
      </div>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Vhs strength={glitching ? 2 : 1} />
        {!isEnd && <CamUi t={t} />}
      </svg>
      {t < 2.2 && (
        <>
          <Plate x={70} y={220}>Серия 1</Plate>
          <Plate x={70} y={310} color={col.white} big>В лифте появилась 10-я кнопка</Plate>
        </>
      )}
      {!isEnd && active && <Caption key={i} text={cur.text} start={cur.start} end={lineEnd(i)} t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: cutIn * 0.9 }} />

      <Audio src={staticFile(timeline.audio)} volume={1} />
      <Audio src={staticFile("btn_ambient.wav")} volume={ambientVol} />
      <Audio src={staticFile("btn_hum.wav")} volume={(fr) => (fr / fps >= lineStart(13) ? 0.35 : 0.12)} />
      <Sequence from={f(ding)} durationInFrames={f(2.5)}><Audio src={staticFile("btn_ding.wav")} volume={0.9} /></Sequence>
      <Sequence from={f(glitch1 - 0.1)} durationInFrames={f(0.7)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.7} /></Sequence>
      <Sequence from={f(glitch2 - 0.05)} durationInFrames={f(0.8)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.8} /></Sequence>
      <Sequence from={f(waitAt + 0.25)} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.9} /></Sequence>
    </AbsoluteFill>
  );
};
