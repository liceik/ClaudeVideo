import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import data from "./words2.json";
import { FONT, Grain, Karaoke, MONO, NeonSfx, NeonTag, Rain, SepiaFilterDefs, flicker, neon } from "./fx";
import { Badge, Clerk, Clock, Courtyard, Defs, Dino, EmptyFlat, FlatDoor, Hooded, Key, LostTable, Photo, Stairwell, Street } from "./art";

export const SHIFT2_FPS = 30;
export const SHIFT2_FRAMES = Math.ceil((data.duration + 1.2) * SHIFT2_FPS);

type W = { t: string; s: number; e: number };
const groups = data.groups as { sent: number; words: W[] }[];
const allWords: W[] = groups.flatMap((g) => g.words);
const norm = (w: string) => w.toLowerCase().replace(/ё/g, "е").replace(/[^а-я]/g, "");
const wordTime = (needle: string, nth = 0) => {
  const hits = allWords.filter((w) => norm(w.t) === norm(needle));
  return hits[nth]?.s ?? -1;
};
const f = (sec: number) => Math.round(sec * SHIFT2_FPS);
const c01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => 1 - Math.pow(1 - c01(p), 3);

const Svg: React.FC<{ children: React.ReactNode; zoom?: number; cx?: number; cy?: number; dx?: number; dy?: number; style?: React.CSSProperties; filter?: string }> = ({
  children, zoom = 1, cx = 540, cy = 960, dx = 0, dy = 0, style, filter,
}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920}
    style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`, filter, ...style }}>
    <Defs />
    <SepiaFilterDefs />
    {children}
  </svg>
);

/* Shot list: each shot starts at the nth occurrence of a word. */
type Shot = { key: string; nth?: number; id: string };
const SHOTS: Shot[] = [
  { key: "вы", id: "choice" },
  { key: "пошёл", id: "exitStore" },
  { key: "шесть", id: "clock6" },
  { key: "закрываю", id: "lockUp" },
  { key: "идёт", id: "follow" },
  { key: "спешит", id: "backClose" },
  { key: "оборачивается", id: "clerkRain" },
  { key: "узнаю", id: "streetPan" },
  { key: "район", id: "myStreet" },
  { key: "сворачивает", id: "turnIn" },
  { key: "останавливаюсь", id: "stop" },
  { key: "двор", nth: 1, id: "yard" },
  { key: "качели", id: "yardPan" },
  { key: "переехали", id: "yardMemory" },
  { key: "подъезд", nth: 1, id: "entrance" },
  { key: "темно", id: "stairsDark" },
  { key: "лестнице", id: "stairsUp" },
  { key: "четвёртый", nth: 1, id: "floor4" },
  { key: "квартира", id: "door47" },
  { key: "наша", id: "door47close" },
  { key: "стучит", id: "noKnock" },
  { key: "открыта", id: "doorOpens" },
  { key: "пустая", id: "flatWide" },
  { key: "пыль", id: "dust" },
  { key: "мебели", id: "walls" },
  { key: "кухне", id: "kitchenTable" },
  { key: "ключик", id: "keyMacro" },
  { key: "динозавр", id: "dinoMacro" },
  { key: "фотография", id: "photoMacro" },
  { key: "сотни", id: "tableFull" },
  { key: "варежки", id: "tablePan" },
  { key: "бирка", id: "tagMacro" },
  { key: "имя", id: "tagText" },
  { key: "стоит", id: "figureWindow" },
  { key: "самого", id: "windowCompare" },
  { key: "говорит", id: "speaks" },
  { key: "возвращаю", id: "speaksClose" },
  { key: "чем", id: "clerkAsk" },
  { key: "кладёт", id: "placeBadge" },
  { key: "бейдж", id: "badgeMacro" },
  { key: "сейчас", id: "chestBadge" },
  { key: "опускаю", id: "lookDown" },
  { key: "пусто", id: "chestEmpty" },
  { key: "бирке", id: "tagName" },
  { key: "дата", nth: 1, id: "tagDate" },
  { key: "завтрашняя", id: "tagTomorrow" },
  { key: "поворачивается", id: "turnReveal" },
  { key: "делать", id: "end" },
  { key: "вариант", nth: 0, id: "endA" },
  { key: "вариант", nth: 1, id: "endB" },
  { key: "пишите", id: "endCta" },
];
const shotStarts = SHOTS.map((s) => wordTime(s.key, s.nth ?? 0) - 0.2).map((v, i, arr) => (v < 0 ? (i > 0 ? arr[i - 1] + 1 : 0) : v));

export const Shift2: React.FC = () => {
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
  const sign = flicker(frame, "sign", 1.4);
  const bulb = flicker(frame, "bulb", 1.6);

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  let dark = 0;
  let rain = false;

  const streetWalk = (z: number, hx: number, cxv = 540) => (
    <>
      <Svg zoom={z} dx={-lT * 30} cx={cxv} cy={1100}>
        <Street lampFlicker={tubes} signFlicker={0} />
      </Svg>
      <Svg zoom={z} cx={cxv} cy={1100}>
        <Hooded x={hx} y={1050 + Math.abs(Math.sin(lT * 2.4 * Math.PI)) * 6} scale={0.5} />
        <Clerk x={900 - lT * 10} y={1240} scale={0.55} look={-1} worry={0.6} />
        <Rain count={160} opacity={0.4} />
      </Svg>
    </>
  );

  switch (id) {
    case "choice":
      visual = (
        <AbsoluteFill style={{ background: "#06070E", alignItems: "center", justifyContent: "center", transform: `scale(${1 + lT * 0.03})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: neon.magenta, lineHeight: 1, textShadow: `0 0 40px ${neon.magenta}` }}>Б</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: neon.white, textTransform: "uppercase", marginTop: 20 }}>Пойти за ним</div>
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.25em", color: neon.cyan, marginTop: 50, textShadow: `0 0 12px ${neon.cyan}` }}>НОЧНАЯ СМЕНА · СЕРИЯ 2</div>
        </AbsoluteFill>
      );
      break;
    case "exitStore":
      rain = true;
      visual = (
        <Svg zoom={lerp(1.1, 1.2, ease(lT / 2))} cx={540} cy={1200}>
          <Street lampFlicker={tubes * 0.6} signFlicker={sign * 0.4} />
          <Clerk x={560} y={1200} scale={0.55} look={-0.5} />
          <Rain count={180} opacity={0.45} />
        </Svg>
      );
      break;
    case "clock6":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 1.2))}>
          <rect width={1080} height={1920} fill="#07080F" />
          <Clock x={540} y={960} text="06:00" scale={2.4} color={neon.cyan} />
        </Svg>
      );
      break;
    case "lockUp":
      rain = true;
      visual = (
        <Svg zoom={lerp(1.8, 2.0, ease(lT / 2.5))} cx={540} cy={1250}>
          <Street lampFlicker={0.3} signFlicker={0} />
          <Clerk x={600} y={1180} scale={0.6} look={1} />
          <Rain count={200} opacity={0.5} />
        </Svg>
      );
      overlay = <NeonSfx text="ЩЁЛК" startFrame={f(start + 0.8)} x={300} y={700} color={neon.cyan} />;
      break;
    case "follow":
      rain = true;
      visual = streetWalk(1.0, 300);
      overlay = <NeonTag x={70} y={200}>30 М</NeonTag>;
      break;
    case "backClose":
      rain = true;
      visual = (
        <Svg zoom={lerp(1.6, 1.8, ease(lT / 2))} cx={320} cy={1000}>
          <Street lampFlicker={tubes} signFlicker={0} />
          <Hooded x={320} y={700 + Math.abs(Math.sin(lT * 2.4 * Math.PI)) * 8} scale={1.0} />
          <Rain count={160} opacity={0.4} />
        </Svg>
      );
      break;
    case "clerkRain":
      rain = true;
      visual = (
        <Svg zoom={1.9} cx={880} cy={1200} dx={Math.sin(lT * 1.3) * 8}>
          <Street lampFlicker={tubes} signFlicker={0} />
          <Clerk x={900} y={1180} scale={0.8} look={-1} worry={0.8} />
          <Rain count={160} opacity={0.4} />
        </Svg>
      );
      break;
    case "streetPan":
      rain = true;
      visual = streetWalk(1.05, 280, lerp(540, 400, ease(lT / 3)));
      break;
    case "myStreet":
      rain = true;
      visual = streetWalk(1.05, 260);
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>МОЙ РАЙОН</NeonTag>;
      break;
    case "turnIn":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 2))} cx={540} cy={1000}>
          <Courtyard light={bulb} />
          <Hooded x={lerp(200, 540, ease(lT / 1.8))} y={1060} scale={0.45} />
          <Rain count={120} opacity={0.3} />
        </Svg>
      );
      break;
    case "stop":
      visual = (
        <Svg zoom={2.0} cx={880} cy={1200}>
          <Courtyard light={bulb} />
          <Clerk x={900} y={1180} scale={0.8} look={0} worry={1} />
          <Rain count={120} opacity={0.3} />
        </Svg>
      );
      break;
    case "yard":
      visual = (
        <Svg zoom={lerp(1.15, 1.0, ease(lT / 2))} cx={540} cy={1000}>
          <Courtyard light={bulb} />
          <Rain count={120} opacity={0.3} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>МОЙ ДВОР</NeonTag>;
      break;
    case "yardPan":
      visual = (
        <Svg zoom={1.6} cx={lerp(200, 880, ease(lT / 3.2))} cy={1250}>
          <Courtyard light={bulb} />
        </Svg>
      );
      break;
    case "yardMemory":
      visual = (
        <Svg zoom={lerp(1.1, 1.25, ease(lT / 2.5))} cx={200} cy={1250} filter="url(#sepia)">
          <Courtyard light={1} />
          <g transform="translate(180 1290)">
            <rect x={-30} y={-20} width={60} height={80} rx={14} fill="#F2C94C" stroke={neon.ink} strokeWidth={4} />
            <circle cx={0} cy={-50} r={30} fill="#F1C7A3" stroke={neon.ink} strokeWidth={4} />
          </g>
          <rect width={1080} height={1920} fill="#5A3A20" opacity={0.2} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>7 ЛЕТ</NeonTag>;
      break;
    case "entrance":
      visual = (
        <Svg zoom={lerp(2.2, 2.6, ease(lT / 1.6))} cx={540} cy={1200}>
          <Courtyard light={bulb} />
          <rect x={440} y={1110} width={200} height={190} fill="#020308" />
        </Svg>
      );
      break;
    case "stairsDark":
      visual = (
        <Svg zoom={1.1} cx={540} cy={1100}>
          <Stairwell bulb={bulb * 0.6} />
        </Svg>
      );
      overlay = <NeonSfx text="ЖЖЖ" startFrame={f(start + 0.3)} x={700} y={420} color={neon.amber} />;
      break;
    case "stairsUp":
      visual = (
        <Svg zoom={1.25} cx={540} cy={lerp(1300, 900, ease(lT / 3))}>
          <Stairwell bulb={bulb} />
          <path d="M380 0 L700 0 L640 420 L420 420 Z" fill="#000" opacity={0.6} />
        </Svg>
      );
      break;
    case "floor4":
      visual = (
        <Svg zoom={1.4} cx={540} cy={700}>
          <Stairwell bulb={bulb} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>4 ЭТАЖ</NeonTag>;
      break;
    case "door47":
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(lT / 2))} cx={540} cy={1000}>
          <rect width={1080} height={1920} fill="#0B0E18" />
          <rect width={1080} height={1920} fill="#17213A" />
          <circle cx={540} cy={150} r={360} fill={neon.amber} opacity={0.12 * bulb} style={{ filter: "url(#glowSoft)" }} />
          <FlatDoor open={0} />
        </Svg>
      );
      break;
    case "door47close":
      visual = (
        <Svg zoom={lerp(2.6, 3.0, ease(lT / 1.2))} cx={540} cy={540}>
          <rect width={1080} height={1920} fill="#17213A" />
          <FlatDoor open={0} />
        </Svg>
      );
      break;
    case "noKnock":
      visual = (
        <Svg zoom={1.3} cx={540} cy={1000}>
          <rect width={1080} height={1920} fill="#17213A" />
          <circle cx={540} cy={150} r={360} fill={neon.amber} opacity={0.12 * bulb} style={{ filter: "url(#glowSoft)" }} />
          <FlatDoor open={0} />
          <Hooded x={300} y={820} scale={0.9} />
        </Svg>
      );
      break;
    case "doorOpens": {
      const o = c01((lT - 0.3) / 1.0);
      visual = (
        <Svg zoom={lerp(1.3, 1.5, ease(lT / 1.8))} cx={540} cy={1000}>
          <rect width={1080} height={1920} fill="#17213A" />
          <FlatDoor open={o} />
          <Hooded x={300} y={820} scale={0.9} />
        </Svg>
      );
      overlay = <NeonSfx text="СКРИП" startFrame={f(start + 0.4)} x={760} y={600} color={neon.amber} />;
      break;
    }
    case "flatWide":
      visual = (
        <Svg zoom={lerp(1.0, 1.08, ease(lT / 2))} cx={540} cy={900}>
          <EmptyFlat />
        </Svg>
      );
      break;
    case "dust":
      visual = (
        <Svg zoom={2.2} cx={540} cy={1500} dx={-lT * 20}>
          <EmptyFlat />
        </Svg>
      );
      break;
    case "walls":
      visual = (
        <Svg zoom={1.5} cx={lerp(300, 800, ease(lT / 2.2))} cy={700}>
          <EmptyFlat />
        </Svg>
      );
      break;
    case "kitchenTable": {
      const r = c01((lT - 0.4) / 1.6);
      visual = (
        <Svg zoom={lerp(1.0, 1.4, ease(lT / 2.5))} cx={540} cy={1300}>
          <EmptyFlat><LostTable reveal={0.35 * r} /></EmptyFlat>
        </Svg>
      );
      break;
    }
    case "keyMacro":
      visual = (
        <Svg zoom={lerp(3.0, 3.4, ease(lT / 1.2))} cx={300} cy={1230}>
          <EmptyFlat><LostTable reveal={0.35} /></EmptyFlat>
          <rect x={200} y={1150} width={200} height={160} fill={neon.cyan} opacity={0.06} />
        </Svg>
      );
      break;
    case "dinoMacro":
      visual = (
        <Svg zoom={lerp(3.0, 3.4, ease(lT / 1.2))} cx={560} cy={1260}>
          <EmptyFlat><LostTable reveal={0.35} /></EmptyFlat>
        </Svg>
      );
      break;
    case "photoMacro":
      visual = (
        <Svg zoom={lerp(3.0, 3.4, ease(lT / 1.2))} cx={820} cy={1240}>
          <EmptyFlat><LostTable reveal={0.35} /></EmptyFlat>
        </Svg>
      );
      break;
    case "tableFull": {
      const r = c01(lT / 1.4);
      visual = (
        <Svg zoom={lerp(1.8, 1.25, ease(lT / 2))} cx={540} cy={1350}>
          <EmptyFlat><LostTable reveal={0.35 + 0.65 * r} /></EmptyFlat>
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>СОТНИ</NeonTag>;
      break;
    }
    case "tablePan":
      visual = (
        <Svg zoom={2.2} cx={lerp(200, 880, ease(lT / 3))} cy={1400}>
          <EmptyFlat><LostTable reveal={1} /></EmptyFlat>
        </Svg>
      );
      break;
    case "tagMacro":
      visual = (
        <Svg zoom={lerp(4.0, 4.6, ease(lT / 1.2))} cx={470} cy={1340}>
          <EmptyFlat><LostTable reveal={1} /></EmptyFlat>
        </Svg>
      );
      break;
    case "tagText":
      visual = (
        <Svg zoom={1}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <g transform="translate(540 900) rotate(-4) scale(3)">
            <rect x={-120} y={-50} width={240} height={100} fill="#F4EEE2" stroke={neon.ink} strokeWidth={3} />
            <text x={0} y={-8} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize={26} fill={neon.ink}>ИМЯ</text>
            <text x={0} y={30} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize={22} fill="#7A3B3B">ДАТА</text>
            <circle cx={-100} cy={-30} r={6} fill="none" stroke={neon.ink} strokeWidth={2} />
          </g>
        </Svg>
      );
      break;
    case "figureWindow":
      visual = (
        <Svg zoom={lerp(1.0, 1.3, ease(lT / 2))} cx={540} cy={600}>
          <EmptyFlat figure={c01(lT / 0.6)}><LostTable reveal={1} /></EmptyFlat>
        </Svg>
      );
      break;
    case "windowCompare":
      visual = (
        <>
          <Svg zoom={1.6} cx={540} cy={520}>
            <EmptyFlat figure={1} />
          </Svg>
          <Svg zoom={1} style={{ opacity: c01((lT - 0.4) / 0.5) }}>
            <Photo x={760} y={1500} scale={0.7} rotate={6} />
          </Svg>
        </>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>ТО САМОЕ ОКНО</NeonTag>;
      break;
    case "speaks":
      visual = (
        <Svg zoom={lerp(1.6, 1.8, ease(lT / 3))} cx={540} cy={520}>
          <EmptyFlat figure={1} />
          {[0, 1, 2].map((i) => {
            const p = (lT * 0.8 + i / 3) % 1;
            return <circle key={i} cx={540} cy={430} r={40 + p * 260} stroke="#C9D3FF" strokeWidth={4} fill="none" opacity={(1 - p) * 0.5} />;
          })}
        </Svg>
      );
      break;
    case "speaksClose":
      visual = (
        <Svg zoom={lerp(2.2, 2.5, ease(lT / 2))} cx={540} cy={450}>
          <EmptyFlat figure={1} />
        </Svg>
      );
      break;
    case "clerkAsk":
      visual = (
        <Svg zoom={1.8} cx={880} cy={1200}>
          <EmptyFlat />
          <Clerk x={900} y={1180} scale={0.8} look={0} worry={1} mouth={0.4 + Math.abs(Math.sin(lT * 12)) * 0.4} />
        </Svg>
      );
      break;
    case "placeBadge": {
      const h = c01((lT - 0.3) / 1.0);
      visual = (
        <Svg zoom={1.5} cx={540} cy={1300}>
          <EmptyFlat>
            <LostTable reveal={1} badge={c01((lT - 1.1) / 0.3)} />
            <Hooded x={200} y={620} scale={0.9} handOut={h} />
          </EmptyFlat>
        </Svg>
      );
      break;
    }
    case "badgeMacro":
      visual = (
        <Svg zoom={lerp(1.0, 1.15, ease(lT / 1.5))}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <rect x={0} y={700} width={1080} height={600} fill="#7A5A3C" />
          <Badge x={340} y={980} scale={3.2} tagText="" />
        </Svg>
      );
      break;
    case "chestBadge":
      visual = (
        <Svg zoom={2.4} cx={930} cy={1330}>
          <EmptyFlat />
          <Clerk x={930} y={1070} scale={0.85} look={0} worry={0.8} badge />
        </Svg>
      );
      break;
    case "lookDown":
      visual = (
        <Svg zoom={1.8} cx={930} cy={1150}>
          <EmptyFlat />
          <Clerk x={930} y={1070} scale={0.85} look={0} worry={1} badge down={c01(lT / 0.6)} />
        </Svg>
      );
      break;
    case "chestEmpty":
      visual = (
        <Svg zoom={lerp(2.4, 2.8, ease(lT / 1.2))} cx={930} cy={1330}>
          <EmptyFlat />
          <Clerk x={930} y={1070} scale={0.85} look={0} worry={1} badge={false} down={1} />
        </Svg>
      );
      overlay = <NeonTag x={560} y={1100} color={neon.magenta}>ПУСТО</NeonTag>;
      break;
    case "tagName":
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(lT / 1.5))}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <rect x={0} y={700} width={1080} height={600} fill="#7A5A3C" />
          <Badge x={340} y={980} scale={3.2} tagText="МОЁ ИМЯ" />
        </Svg>
      );
      break;
    case "tagDate":
    case "tagTomorrow": {
      const red = id === "tagTomorrow" ? 0.5 + Math.abs(Math.sin(lT * 6)) * 0.5 : 0;
      visual = (
        <Svg zoom={lerp(1.1, 1.3, ease(lT / 1.5))} cx={760} cy={720}>
          <rect width={1080} height={1920} fill="#0C1020" />
          <rect x={0} y={700} width={1080} height={600} fill="#7A5A3C" />
          <Badge x={340} y={980} scale={3.2} tagText="ЗАВТРА" />
          <rect width={1080} height={1920} fill={neon.magenta} opacity={0.12 * red} />
        </Svg>
      );
      if (id === "tagTomorrow") overlay = <NeonTag x={70} y={200} color={neon.magenta}>ЗАВТРА</NeonTag>;
      break;
    }
    case "turnReveal": {
      const r = c01((lT - 0.5) / 1.4);
      const talking = lT > 2.0;
      visual = (
        <Svg zoom={lerp(1.6, 2.4, ease(lT / 3))} cx={540} cy={560}>
          <EmptyFlat />
          <Hooded x={540} y={320} scale={1} reveal={r} mouth={talking ? 0.3 + Math.abs(Math.sin(t * 14)) * 0.5 : 0} />
        </Svg>
      );
      overlay = talking && <NeonTag x={560} y={1100} color={neon.white}>ШЁПОТ</NeonTag>;
      dark = c01((lT - 5.0) / 0.4);
      break;
    }
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
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.3em", color: neon.cyan, textAlign: "center", opacity: showQ, textShadow: `0 0 12px ${neon.cyan}` }}>НОЧНАЯ СМЕНА · СЕРИЯ 2</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: neon.white, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, marginTop: 30, opacity: showQ }}>Что мне<br />делать?</div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Схватить бейдж и бежать", neon.cyan, showA, -40)}
            {card("Б", "Спросить, что случится завтра", neon.magenta, showB, 40)}
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
  const stepsAt = [wordTime("лестнице"), wordTime("идёт")];
  const stingAt = [wordTime("сворачивает"), wordTime("открыта"), wordTime("пусто"), wordTime("поворачивается")];

  return (
    <AbsoluteFill style={{ background: neon.bg, overflow: "hidden" }}>
      {visual}
      {rain && <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Rain count={50} opacity={0.12} /></svg>}
      <Grain amount={0.14} />
      {overlay}
      {!isEnd && g && <Karaoke words={g.words} t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dip * 0.9, dark) }} />

      <Audio src={staticFile("vo_shift2.mp3")} volume={1} />
      <Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_rain.mp3")} volume={0.4} /></Loop>
      <Sequence from={f(wordTime("подъезд", 1))} durationInFrames={f(60)}><Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_hum.mp3")} volume={0.3} /></Loop></Sequence>
      {stepsAt.filter((a) => a >= 0).map((at, i) => (
        <Sequence key={`st${i}`} from={f(at)} durationInFrames={f(4)}><Audio src={staticFile("sfx_steps.mp3")} volume={0.7} /></Sequence>
      ))}
      {stingAt.filter((a) => a >= 0).map((at, i) => (
        <Sequence key={`sg${i}`} from={f(at - 0.2)} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.8} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
