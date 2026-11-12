import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import data from "./words3.json";
import { Cctv, FONT, Grain, Karaoke, MONO, NeonSfx, NeonTag, Rain, SepiaFilterDefs, flicker, neon } from "./fx";
import { Badge, BlankTag, Clerk, Clock, Counter, Courtyard, DarkStore, Defs, DoorInside, Fridge, Hiding, PhoneTime, Stairwell, StoreBack, Street, TagBack } from "./art";

export const SHIFT3_FPS = 30;
export const SHIFT3_FRAMES = Math.ceil((data.duration + 1.2) * SHIFT3_FPS);

type W = { t: string; s: number; e: number };
const groups = data.groups as { sent: number; words: W[] }[];
const allWords: W[] = groups.flatMap((g) => g.words);
const norm = (w: string) => w.toLowerCase().replace(/ё/g, "е").replace(/[^а-я]/g, "");
const wordTime = (needle: string, nth = 0) => {
  const hits = allWords.filter((w) => norm(w.t) === norm(needle));
  return hits[nth]?.s ?? -1;
};
const f = (sec: number) => Math.round(sec * SHIFT3_FPS);
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => 1 - Math.pow(1 - c01(p), 3);

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; style?: React.CSSProperties; filter?: string }> = ({ children, zoom = 1, cx = 540, cy = 960, dx = 0, dy = 0, style, filter }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, filter, ...style }}>
    <Defs />
    <SepiaFilterDefs />
    {children}
  </svg>
);

const Interior: React.FC<{ frame: number; belt?: number; children?: React.ReactNode; bell?: number; doorOpen?: number }> = ({ frame, belt = 0, children, bell = 0, doorOpen = 0 }) => {
  const L = flicker(frame, "tubes", 0.8);
  const Fz = flicker(frame, "fridge", 1.2);
  return (
    <g>
      <StoreBack light={L} fridge={Fz} />
      <Fridge light={Fz} />
      <DoorInside open={doorOpen} bell={bell} />
      <Counter belt={belt} />
      {children}
      <rect y={1200} width={1080} height={720} fill={neon.cyan} opacity={0.05 * L} />
    </g>
  );
};

type Shot = { key: string; nth?: number; id: string };
const SHOTS: Shot[] = [
  { key: "вы", id: "choice" },
  { key: "схватил", id: "grab" },
  { key: "лестница", id: "stairs" },
  { key: "бежал", nth: 0, id: "lookBack" },
  { key: "слышал", id: "stepsOnly" },
  { key: "двор", id: "yardRun" },
  { key: "бежал", nth: 1, id: "streetRun" },
  { key: "магазину", id: "storeFar" },
  { key: "заперся", id: "lockDoor" },
  { key: "сел", id: "sitDown" },
  { key: "отдышался", id: "breathe" },
  { key: "бейдж", nth: 1, id: "badgeHand" },
  { key: "перевернул", id: "flip" },
  { key: "обороте", id: "handwriting" },
  { key: "открывай", id: "handwritingRed" },
  { key: "никогда", id: "clerkShock" },
  { key: "телефон", id: "phone331" },
  { key: "выключил", id: "lightsOff" },
  { key: "спрятался", id: "hide" },
  { key: "три", nth: 3, id: "clock333" },
  { key: "колокольчик", id: "bell" },
  { key: "дверь", nth: 1, id: "doorLocked" },
  { key: "колокольчик", nth: 1, id: "bellAgain" },
  { key: "шаги", nth: 1, id: "steps" },
  { key: "остановились", id: "stopped" },
  { key: "легло", id: "placed" },
  { key: "досчитал", id: "count" },
  { key: "тишина", id: "silence" },
  { key: "выглянул", id: "peek" },
  { key: "ленте", nth: 0, id: "blankTag" },
  { key: "имени", id: "noName" },
  { key: "ручка", id: "pen" },
  { key: "экране", id: "screenWord" },
  { key: "утром", id: "morningCall" },
  { key: "камеры", id: "cctvEmpty" },
  { key: "записи", id: "cctvStatic" },
  { key: "руке", nth: 1, id: "inHand" },
  { key: "делать", id: "end" },
  { key: "вариант", nth: 0, id: "endA" },
  { key: "вариант", nth: 1, id: "endB" },
  { key: "пишите", id: "endCta" },
];
const shotStarts = SHOTS.map((s) => wordTime(s.key, s.nth ?? 0) - 0.15).map((v, i, arr) => (v < 0 ? (i > 0 ? arr[i - 1] + 1 : 0) : v));

export const Shift3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= shotStarts[i]) idx = i;
  const id = SHOTS[idx].id;
  const start = shotStarts[idx];
  const lT = Math.max(0, t - start);
  const g = groups.find((gr) => gr.words[0].s - 0.3 <= t && t < gr.words[gr.words.length - 1].e + 0.9);
  const tubes = flicker(frame, "tubes", 0.8);
  const bulb = flicker(frame, "bulb", 1.6);
  const runShake = (amt: number) => ({ dx: Math.sin(t * 18) * amt + (random(`rx${frame}`) - 0.5) * amt, dy: Math.abs(Math.sin(t * 9)) * amt * 1.2 });

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  let dark = 0;

  switch (id) {
    case "choice":
      visual = (
        <AbsoluteFill style={{ background: "#06070E", alignItems: "center", justifyContent: "center", transform: `scale(${1 + lT * 0.03})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: neon.cyan, lineHeight: 1, textShadow: `0 0 40px ${neon.cyan}` }}>А</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: neon.white, textTransform: "uppercase", marginTop: 20 }}>Схватить и бежать</div>
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.25em", color: neon.cyan, marginTop: 50, textShadow: `0 0 12px ${neon.cyan}` }}>НОЧНАЯ СМЕНА · СЕРИЯ 3</div>
        </AbsoluteFill>
      );
      break;
    case "grab": {
      const s = runShake(10);
      visual = (
        <Svg zoom={lerp(2.0, 1.4, ease(lT / 1.2))} cx={540} cy={1500} dx={s.dx} dy={s.dy}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <rect x={0} y={1120} width={1080} height={600} fill="#7A5A3C" />
          <g opacity={1 - c01((lT - 0.4) / 0.4)}><Badge x={540} y={1500} scale={1.6} /></g>
          <path d={`M${300 - c01(lT / 0.6) * 600} 1900 q200 -500 ${260 + c01(lT / 0.6) * 100} -400`} stroke="#F6D2B5" strokeWidth={70} fill="none" strokeLinecap="round" />
        </Svg>
      );
      break;
    }
    case "stairs": {
      const s = runShake(14);
      visual = (
        <Svg zoom={1.3} cx={540} cy={lerp(900, 1500, ease(lT / 2.5))} dx={s.dx} dy={s.dy}>
          <Stairwell bulb={bulb} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>4 ПРОЛЁТА</NeonTag>;
      break;
    }
    case "lookBack": {
      const s = runShake(8);
      visual = (
        <Svg zoom={1.15} cx={540} cy={700} dx={s.dx} dy={s.dy}>
          <Stairwell bulb={bulb * 0.5} />
          <rect width={1080} height={1920} fill="#000" opacity={0.3} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200}>никого</NeonTag>;
      break;
    }
    case "stepsOnly": {
      const s = runShake(12);
      visual = (
        <Svg zoom={1.6} cx={540} cy={1600} dx={s.dx} dy={s.dy}>
          <Stairwell bulb={bulb} />
        </Svg>
      );
      overlay = <NeonSfx text="ТОП-ТОП" startFrame={f(start + 0.2)} x={540} y={700} color={neon.amber} />;
      break;
    }
    case "yardRun": {
      const s = runShake(12);
      visual = (
        <Svg zoom={lerp(1.0, 1.25, ease(lT / 3))} cx={540} cy={1000} dx={s.dx} dy={s.dy}>
          <Courtyard light={bulb} />
          <Clerk x={540} y={1200} scale={0.6} look={0} worry={1} />
          <Rain count={180} opacity={0.45} />
        </Svg>
      );
      break;
    }
    case "streetRun": {
      const s = runShake(10);
      visual = (
        <>
          <Svg zoom={1.1} dx={-lT * 60 + s.dx} cx={540} cy={1100} dy={s.dy}>
            <Street lampFlicker={tubes} signFlicker={flicker(frame, "sign", 1.4)} />
          </Svg>
          <Svg zoom={1.1} dx={s.dx} dy={s.dy}>
            <Clerk x={420} y={1200} scale={0.65} look={0} worry={1} />
            <Rain count={180} opacity={0.45} />
          </Svg>
        </>
      );
      break;
    }
    case "storeFar":
      visual = (
        <Svg zoom={lerp(1.0, 1.5, ease(lT / 1.4))} cx={540} cy={1150}>
          <Street lampFlicker={tubes} signFlicker={flicker(frame, "sign", 1.4)} />
          <Rain count={160} opacity={0.4} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>СВЕТ</NeonTag>;
      break;
    case "lockDoor":
      visual = (
        <Svg zoom={lerp(2.0, 2.3, ease(lT / 1.5))} cx={200} cy={900}>
          <Interior frame={frame} doorOpen={1 - c01(lT / 0.5)} />
        </Svg>
      );
      overlay = <NeonSfx text="ЩЁЛК" startFrame={f(start + 0.6)} x={620} y={520} color="#fff" />;
      break;
    case "sitDown":
      visual = (
        <Svg zoom={1.3} cx={880} cy={1000}>
          <Interior frame={frame}><Clerk x={900} y={1080 + (1 - c01(lT / 0.8)) * 120} scale={0.9} look={0} worry={0.9} /></Interior>
        </Svg>
      );
      break;
    case "breathe": {
      const b = Math.sin(lT * 5) * 0.015;
      visual = (
        <Svg zoom={1.6 + b} cx={900} cy={1000}>
          <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} look={0} worry={0.8} mouth={0.4 + Math.abs(Math.sin(lT * 5)) * 0.3} badge={false} /></Interior>
        </Svg>
      );
      break;
    }
    case "badgeHand":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 3))}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <path d="M160 1920 q100 -500 420 -520 l300 -20 q160 60 60 240 l-40 300 Z" fill="#F6D2B5" />
          <Badge x={520} y={1120} scale={2.6} tagText="ЗАВТРА" />
        </Svg>
      );
      break;
    case "flip": {
      const p = ease(lT / 0.6);
      visual = (
        <Svg zoom={1.1}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <path d="M160 1920 q100 -500 420 -520 l300 -20 q160 60 60 240 l-40 300 Z" fill="#F6D2B5" />
          <g transform={`translate(540 1000) scale(${Math.abs(Math.cos(p * Math.PI))} 1) translate(-540 -1000)`}>
            {p < 0.5 ? <Badge x={520} y={1120} scale={2.6} tagText="ЗАВТРА" /> : <TagBack x={540} y={1000} scale={1.3} reveal={0} />}
          </g>
        </Svg>
      );
      break;
    }
    case "handwriting":
      visual = (
        <Svg zoom={lerp(1.1, 1.25, ease(lT / 3))} cx={540} cy={980}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <path d="M160 1920 q100 -500 420 -520 l300 -20 q160 60 60 240 l-40 300 Z" fill="#F6D2B5" />
          <TagBack x={540} y={1000} scale={1.3} reveal={c01((lT - 0.5) / 2.2)} />
        </Svg>
      );
      break;
    case "handwritingRed":
      visual = (
        <Svg zoom={lerp(1.6, 1.9, ease(lT / 2))} cx={540} cy={1050}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <TagBack x={540} y={1000} scale={1.3} reveal={1} />
          <rect width={1080} height={1920} fill={neon.magenta} opacity={0.06 + Math.abs(Math.sin(lT * 5)) * 0.05} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>МОЙ ПОЧЕРК</NeonTag>;
      break;
    case "clerkShock":
      visual = (
        <Svg zoom={1.9 + lT * 0.05} cx={900} cy={1000}>
          <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} look={0} worry={1} badge={false} /></Interior>
        </Svg>
      );
      break;
    case "phone331":
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(lT / 2))}>
          <PhoneTime time="03:31" />
        </Svg>
      );
      break;
    case "lightsOff": {
      const off = c01((lT - 0.6) / 0.15);
      visual = (
        <Svg zoom={1.05}>
          {off < 1 ? <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} badge={false} /></Interior> : <DarkStore screen={1} />}
        </Svg>
      );
      overlay = <NeonSfx text="ЩЁЛК" startFrame={f(start + 0.6)} x={400} y={500} color="#fff" />;
      break;
    }
    case "hide":
      visual = (
        <Svg zoom={lerp(1.2, 1.5, ease(lT / 2))} cx={600} cy={1250}>
          <DarkStore screen={1} />
          <Hiding x={600} y={1240} peek={1 - c01(lT / 0.8)} />
        </Svg>
      );
      break;
    case "clock333":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 1))} cx={540} cy={960}>
          <rect width={1080} height={1920} fill="#04060C" />
          <Clock x={540} y={960} text="03:33" scale={2.4} color={neon.magenta} />
        </Svg>
      );
      break;
    case "bell":
    case "bellAgain": {
      const b = Math.sin(lT * 22) * 28 * Math.exp(-lT * 1.5);
      visual = (
        <Svg zoom={2.2} cx={200} cy={560}>
          <DarkStore screen={0.6} />
          <g transform={`translate(200 530) rotate(${b})`}>
            <path d="M-22 0 q0 -34 22 -34 q22 0 22 34 Z" fill={neon.amber} stroke={neon.ink} strokeWidth={5} />
            <circle cx={0} cy={6} r={6} fill={neon.amber} />
          </g>
        </Svg>
      );
      overlay = <NeonSfx text="ДЗИНЬ" startFrame={f(start)} x={620} y={520} />;
      break;
    }
    case "doorLocked":
      visual = (
        <Svg zoom={1.8} cx={200} cy={900}>
          <DarkStore screen={0.6} />
          <rect x={60} y={560} width={300} height={700} fill="#000" opacity={0.3} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>ЗАПЕРТО</NeonTag>;
      break;
    case "steps": {
      const p = c01(lT / 2.4);
      visual = (
        <Svg zoom={1.4} cx={540} cy={1550}>
          <DarkStore screen={0.6} />
          <ellipse cx={lerp(260, 620, p)} cy={1650} rx={220} ry={50} fill="#000" opacity={0.6} />
        </Svg>
      );
      overlay = <NeonSfx text="ШАГИ" startFrame={f(start + 0.1)} x={540} y={700} color={neon.amber} />;
      break;
    }
    case "stopped":
      visual = (
        <Svg zoom={1.6 + lT * 0.03} cx={620} cy={1500}>
          <DarkStore screen={0.6} />
          <ellipse cx={620} cy={1650} rx={220} ry={50} fill="#000" opacity={0.6} />
          <Hiding x={600} y={1240} peek={0} />
        </Svg>
      );
      break;
    case "placed":
      visual = (
        <Svg zoom={2.4} cx={420} cy={1200}>
          <DarkStore screen={0.6} />
          <g opacity={c01((lT - 0.5) / 0.3)}><BlankTag x={420} y={1200} scale={0.8} pen={false} /></g>
        </Svg>
      );
      overlay = <NeonSfx text="ТУК" startFrame={f(start + 0.5)} x={700} y={800} color="#fff" />;
      break;
    case "count":
      visual = (
        <Svg zoom={1.5 + Math.sin(lT * 3) * 0.01} cx={600} cy={1250}>
          <DarkStore screen={0.6} />
          <Hiding x={600} y={1240} peek={0} />
        </Svg>
      );
      overlay = <NeonTag x={720} y={300}>{Math.min(100, Math.floor(lT * 45))} / 100</NeonTag>;
      break;
    case "silence":
      visual = (
        <Svg zoom={1.2} cx={540} cy={1000}>
          <DarkStore screen={0.6} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200}>тишина</NeonTag>;
      break;
    case "peek":
      visual = (
        <Svg zoom={1.6} cx={600} cy={1200}>
          <DarkStore screen={0.8} />
          <Hiding x={600} y={1240} peek={c01(lT / 0.9)} />
        </Svg>
      );
      break;
    case "blankTag":
      visual = (
        <Svg zoom={lerp(2.2, 2.6, ease(lT / 2.5))} cx={420} cy={1200}>
          <DarkStore screen={0.8} />
          <BlankTag x={420} y={1200} scale={0.8} pen={false} />
        </Svg>
      );
      break;
    case "noName":
      visual = (
        <Svg zoom={lerp(3.4, 3.8, ease(lT / 1.5))} cx={420} cy={1190}>
          <DarkStore screen={0.8} />
          <BlankTag x={420} y={1200} scale={0.8} pen={false} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>БЕЗ ИМЕНИ</NeonTag>;
      break;
    case "pen":
      visual = (
        <Svg zoom={lerp(2.6, 2.3, ease(lT / 2))} cx={460} cy={1230}>
          <DarkStore screen={0.8} />
          <BlankTag x={420} y={1200} scale={0.8} pen />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200}>МОЯ РУЧКА</NeonTag>;
      break;
    case "screenWord":
      visual = (
        <Svg zoom={lerp(2.6, 3.2, ease(lT / 2.5))} cx={920} cy={1100}>
          <DarkStore screen={1} word={lT > 1.4 ? "ВПИШИ" : ""} />
        </Svg>
      );
      break;
    case "morningCall":
      visual = (
        <Svg zoom={1.15} cx={880} cy={1000}>
          <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} look={0.4} worry={0.6} badge={false} /></Interior>
          <g transform="translate(1000 940)"><rect x={-22} y={-60} width={44} height={84} rx={8} fill="#1C1C24" /></g>
          {[0, 1, 2].map((k) => { const p = (lT * 0.9 + k / 3) % 1; return <circle key={k} cx={1000} cy={920} r={30 + p * 200} stroke="#FFD27A" strokeWidth={3} fill="none" opacity={(1 - p) * 0.5} />; })}
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>08:02 · хозяин</NeonTag>;
      break;
    case "cctvEmpty":
      visual = (
        <Svg zoom={1} style={{ filter: "saturate(0.1) contrast(1.2)" }}>
          <Interior frame={frame} />
        </Svg>
      );
      overlay = <Cctv label="CAM 02" time="03:32:58" />;
      break;
    case "cctvStatic":
      visual = (
        <Svg zoom={1} style={{ filter: "saturate(0.1) contrast(1.2)" }}>
          <Interior frame={frame} />
        </Svg>
      );
      overlay = <Cctv label="CAM 02" time="03:33:00" glitch={0.6 + Math.abs(Math.sin(lT * 9)) * 0.4} />;
      break;
    case "inHand":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 3))}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <path d="M160 1920 q100 -500 420 -520 l300 -20 q160 60 60 240 l-40 300 Z" fill="#F6D2B5" />
          <BlankTag x={540} y={1050} scale={1.5} pen />
        </Svg>
      );
      dark = c01((lT - 2.8) / 0.5);
      break;
    default: {
      const sA = shotStarts[SHOTS.findIndex((s) => s.id === "endA")];
      const sB = shotStarts[SHOTS.findIndex((s) => s.id === "endB")];
      const sC = shotStarts[SHOTS.findIndex((s) => s.id === "endCta")];
      const showQ = c01((t - shotStarts[SHOTS.findIndex((s) => s.id === "end")]) / 0.5);
      const showA = c01((t - sA) / 0.5);
      const showB = c01((t - sB) / 0.5);
      const showC = c01((t - sC) / 0.5);
      const card = (label: string, sub: string, color: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 18, padding: "56px 32px", borderRadius: 24, background: "rgba(63,224,240,0.04)", border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}55, inset 0 0 30px ${color}11`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color, textShadow: `0 0 20px ${color}`, lineHeight: 1 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: neon.white, marginTop: 24, lineHeight: 1.2 }}>{sub}</div>
        </div>
      );
      visual = (
        <AbsoluteFill style={{ background: "#06070E", justifyContent: "center", padding: "0 54px" }}>
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.3em", color: neon.cyan, textAlign: "center", opacity: showQ, textShadow: `0 0 12px ${neon.cyan}` }}>НОЧНАЯ СМЕНА · СЕРИЯ 3</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: neon.white, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, marginTop: 30, opacity: showQ }}>Что мне<br />делать?</div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Вписать чужое имя", neon.cyan, showA, -40)}
            {card("Б", "Сжечь бирку", neon.magenta, showB, 40)}
          </div>
          <div style={{ marginTop: 80, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: neon.white, textTransform: "uppercase", opacity: showC }}>
            Пишите в комментариях: <span style={{ color: neon.cyan }}>А</span> или <span style={{ color: neon.magenta }}>Б</span>
          </div>
        </AbsoluteFill>
      );
    }
  }

  const dip = lT < 0.08 ? 1 - lT / 0.08 : 0;
  const isEnd = id.startsWith("end");
  const at = (sid: string) => shotStarts[SHOTS.findIndex((s) => s.id === sid)];
  const rainy = ["yardRun", "streetRun", "storeFar"].includes(id);

  return (
    <AbsoluteFill style={{ background: neon.bg, overflow: "hidden" }}>
      {visual}
      {rainy && <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Rain count={50} opacity={0.12} /></svg>}
      <Grain amount={0.14} />
      {overlay}
      {!isEnd && g && <Karaoke words={g.words} t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dip * 0.9, dark) }} />

      <Audio src={staticFile("vo_shift3.mp3")} volume={1} />
      <Sequence from={0} durationInFrames={f(at("lockDoor"))}><Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_rain.mp3")} volume={0.45} /></Loop></Sequence>
      <Sequence from={f(at("lockDoor"))} durationInFrames={f(80)}><Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_hum.mp3")} volume={0.35} /></Loop></Sequence>
      <Sequence from={f(at("stairs"))} durationInFrames={f(6)}><Audio src={staticFile("sfx_steps.mp3")} volume={0.7} /></Sequence>
      {["bell", "bellAgain"].map((s) => <Sequence key={s} from={f(at(s))} durationInFrames={f(2)}><Audio src={staticFile("sfx_bell.mp3")} volume={0.9} /></Sequence>)}
      <Sequence from={f(at("steps"))} durationInFrames={f(4)}><Audio src={staticFile("sfx_steps.mp3")} volume={0.8} /></Sequence>
      <Sequence from={f(at("cctvStatic"))} durationInFrames={f(1)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.6} /></Sequence>
      {["handwritingRed", "screenWord", "inHand"].map((s) => <Sequence key={s} from={f(at(s) + (s === "screenWord" ? 1.3 : 0))} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.8} /></Sequence>)}
    </AbsoluteFill>
  );
};
