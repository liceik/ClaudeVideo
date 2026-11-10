import React from "react";
import { AbsoluteFill, Audio, Loop, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import data from "./words.json";
import { Cctv, FONT, Grain, Karaoke, MONO, NeonSfx, NeonTag, Rain, SepiaFilterDefs, flicker, neon } from "./fx";
import { Clerk, Clock, Counter, Defs, Dino, DoorInside, Fridge, Hooded, Key, Kitchen, KidRoom, Photo, StoreBack, Street, Village } from "./art";

export const SHIFT_FPS = 30;
export const SHIFT_FRAMES = Math.ceil((data.duration + 1.2) * SHIFT_FPS);

type W = { t: string; s: number; e: number };
const sentences = data.sentences as { i: number; s: number; e: number }[];
const groups = data.groups as { sent: number; words: W[] }[];
const allWords: W[] = groups.flatMap((g) => g.words);
const wordTime = (needle: string, nth = 0) => {
  const hits = allWords.filter((w) => w.t.toLowerCase().replace(/[^а-яё]/g, "") === needle);
  return hits[nth]?.s ?? 0;
};
const f = (sec: number) => Math.round(sec * SHIFT_FPS);
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

/** Full interior set with lights that flicker together. */
const Interior: React.FC<{ frame: number; belt?: number; receipt?: number; doorOpen?: number; bell?: number; children?: React.ReactNode; fridgeScale?: number }> = ({
  frame, belt = 0, receipt = 0, doorOpen = 0, bell = 0, children,
}) => {
  const L = flicker(frame, "tubes", 0.8);
  const Fz = flicker(frame, "fridge", 1.2);
  return (
    <g>
      <StoreBack light={L} fridge={Fz} />
      <Fridge light={Fz} />
      <DoorInside open={doorOpen} bell={bell} />
      <Counter belt={belt} receipt={receipt} />
      {children}
      {/* tube light sweep on the floor */}
      <rect y={1200} width={1080} height={720} fill={neon.cyan} opacity={0.05 * L} />
    </g>
  );
};

const Boots: React.FC<{ step: number }> = ({ step }) => {
  const a = Math.sin(step * Math.PI);
  return (
    <g>
      <rect x={380} y={1500 - a * 40} width={130} height={60} rx={20} fill="#12101F" stroke={neon.ink} strokeWidth={5} />
      <rect x={560} y={1540 - (1 - a) * 40} width={130} height={60} rx={20} fill="#12101F" stroke={neon.ink} strokeWidth={5} />
      <ellipse cx={445} cy={1570} rx={90} ry={10} fill="#000" opacity={0.4} />
      <ellipse cx={625} cy={1610} rx={90} ry={10} fill="#000" opacity={0.4} />
    </g>
  );
};

export const Shift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // which sentence/shot are we in
  let si = 0;
  for (const s of sentences) if (t >= s.s - 0.25) si = s.i;
  const S = sentences[si];
  const lT = Math.max(0, t - (S.s - 0.25));
  const L = (sentences[si + 1]?.s ?? data.duration) - (S.s - 0.25);
  const sub = lT > L / 2;
  const g = groups.find((gr) => gr.words[0].s - 0.3 <= t && t < (gr.words[gr.words.length - 1].e + 0.9));

  const tubes = flicker(frame, "tubes", 0.8);
  const sign = flicker(frame, "sign", 1.4);
  const beltPos = (t * 40) % 60;

  let visual: React.ReactNode = null;
  let overlay: React.ReactNode = null;
  let dark = 0; // black frames
  let rain = false;

  switch (si) {
    case 0: {
      const z = lerp(1, 1.14, ease(lT / 3.2));
      rain = true;
      visual = (
        <Svg zoom={z} cx={540} cy={1100}>
          <Street lampFlicker={tubes} signFlicker={sign} />
          <Rain count={180} opacity={0.4} />
        </Svg>
      );
      break;
    }
    case 1: {
      if (!sub) {
        visual = (
          <Svg zoom={1.05} dx={-lT * 18} cx={540} cy={1100}>
            <Interior frame={frame} belt={beltPos}><Clerk x={900} y={1080} scale={0.9} look={-0.4} /></Interior>
          </Svg>
        );
        overlay = <NeonTag x={70} y={200}>03:02</NeonTag>;
      } else {
        const z = lerp(1.9, 2.1, ease((lT - L / 2) / 2));
        visual = (
          <Svg zoom={z} cx={880} cy={880}>
            <Interior frame={frame} />
          </Svg>
        );
        overlay = <NeonSfx text="ЖЖЖ" startFrame={f(S.s - 0.25 + L / 2 + 0.2)} x={700} y={620} color={neon.cyan} />;
      }
      break;
    }
    case 2: {
      visual = (
        <Svg zoom={lerp(1.2, 1.3, ease(lT / 2.5))} cx={260} cy={900}>
          <Interior frame={frame} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200}>ЗА НОЧЬ: 3</NeonTag>;
      break;
    }
    case 3: {
      if (!sub) {
        visual = (
          <Svg zoom={1.3} cx={880} cy={1000}>
            <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} look={-1} worry={0.6} /></Interior>
          </Svg>
        );
      } else {
        const p = ease((lT - L / 2) / 1.8);
        visual = (
          <Svg zoom={1.3} cx={lerp(880, 260, p)} cy={1000}>
            <Interior frame={frame}><Clerk x={900} y={1080} scale={0.9} look={-1} worry={0.6} /></Interior>
          </Svg>
        );
      }
      break;
    }
    case 4: {
      const bellAt = wordTime("звенит");
      if (t < bellAt - 0.15) {
        const flip = t > wordTime("три") - 0.1;
        visual = (
          <Svg zoom={lerp(1.0, 1.15, ease(lT / 3))} cx={540} cy={960}>
            <rect width={1080} height={1920} fill="#07080F" />
            <Clock x={540} y={960} text={flip ? "03:33" : "03:32"} scale={2.4} color={flip ? neon.magenta : neon.cyan} />
          </Svg>
        );
      } else {
        const b = Math.sin((t - bellAt) * 22) * 28 * Math.exp(-(t - bellAt) * 1.5);
        visual = (
          <Svg zoom={2.2} cx={200} cy={560}>
            <Interior frame={frame} bell={b} doorOpen={c01((t - bellAt) / 0.5) * 0.5} />
          </Svg>
        );
        overlay = <NeonSfx text="ДЗИНЬ" startFrame={f(bellAt)} x={620} y={520} />;
      }
      break;
    }
    case 5: {
      visual = (
        <Svg zoom={lerp(1.1, 1.3, ease(lT / 1.2))} cx={200} cy={900}>
          <Interior frame={frame} doorOpen={1}>
            <rect x={60} y={560} width={300} height={700} fill={neon.magenta} opacity={0.35} />
            <Hooded x={200} y={720} scale={0.95} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 6: {
      visual = (
        <Svg zoom={lerp(2.4, 2.8, ease(lT / 1.2))} cx={200} cy={780}>
          <Interior frame={frame} doorOpen={1}>
            <rect x={60} y={560} width={300} height={700} fill={neon.magenta} opacity={0.35} />
            <Hooded x={200} y={720} scale={0.95} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 7: {
      const walk = lT * 0.9;
      visual = (
        <>
          <Svg zoom={1.25} dx={-lT * 40} cx={540} cy={900}>
            <StoreBack light={tubes} fridge={1} />
          </Svg>
          <Svg zoom={1.25} dx={-lT * 70} cx={540} cy={900}>
            <Fridge x={900} y={560} light={flicker(frame, "fridge", 1.2)} />
          </Svg>
          <Svg zoom={1.25} cx={540} cy={900}>
            <Hooded x={420 + lT * 30} y={760 + Math.abs(Math.sin(walk * Math.PI)) * 12} scale={1.05} />
          </Svg>
        </>
      );
      break;
    }
    case 8: {
      if (!sub) {
        const h = c01((lT - 0.4) / 1.2);
        visual = (
          <Svg zoom={1.25} cx={500} cy={1150}>
            <Interior frame={frame} belt={beltPos}>
              <Hooded x={300} y={700} scale={1} handOut={h} />
              <Clerk x={930} y={1070} scale={0.85} look={-1} worry={0.7} />
            </Interior>
          </Svg>
        );
      } else {
        visual = (
          <Svg zoom={2.6} cx={420} cy={1200}>
            <Interior frame={frame} belt={beltPos}>
              <Key x={420 - (lT - L / 2) * 30} y={1205} scale={0.9} />
            </Interior>
          </Svg>
        );
      }
      break;
    }
    case 9: {
      visual = (
        <Svg zoom={lerp(2.6, 3.0, ease(lT / 3))} cx={480} cy={1200}>
          <Interior frame={frame} belt={0}>
            <Key x={480} y={1205} scale={0.9} />
            <rect x={300} y={1100} width={360} height={200} fill={neon.magenta} opacity={0.12 + 0.05 * Math.sin(t * 9)} />
          </Interior>
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>НОЧЬ 1</NeonTag>;
      break;
    }
    case 10: {
      visual = (
        <Svg zoom={lerp(1.0, 1.25, ease(lT / 1.8))} cx={540} cy={900} filter="url(#sepia)">
          <KidRoom />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>8 ЛЕТ</NeonTag>;
      break;
    }
    case 11: {
      const d = Math.abs(Math.sin(lT * 3)) * 0.8;
      visual = (
        <Svg zoom={1.3} cx={400} cy={1100} dx={Math.sin(lT * 1.5) * 20} filter="url(#sepia)">
          <KidRoom keyFade={1 - c01(lT / 2.5)} drawer={d} />
        </Svg>
      );
      break;
    }
    case 12: {
      visual = (
        <Svg zoom={lerp(2.2, 2.5, ease(lT / 3.5))} cx={480} cy={1200}>
          <Interior frame={frame} belt={0}>
            <Dino x={480} y={1200} scale={0.55} />
            <rect x={300} y={1100} width={360} height={200} fill={neon.magenta} opacity={0.12 + 0.05 * Math.sin(t * 9)} />
          </Interior>
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>НОЧЬ 2</NeonTag>;
      break;
    }
    case 13: {
      if (!sub) {
        visual = (
          <Svg zoom={1.15} dx={-lT * 25} cx={540} cy={1100} filter="url(#sepia)">
            <Village />
          </Svg>
        );
      } else {
        visual = (
          <Svg zoom={1.6} cx={600} cy={1450} filter="url(#sepia)">
            <Village dinoDrop={c01((lT - L / 2) / 1.0)} />
          </Svg>
        );
      }
      overlay = <NeonTag x={70} y={200} color={neon.amber}>ДЕРЕВНЯ</NeonTag>;
      break;
    }
    case 14: {
      const m = 0.3 + Math.abs(Math.sin(lT * 12)) * 0.5;
      visual = (
        <Svg zoom={1.6} cx={880} cy={1000}>
          <Interior frame={frame}>
            <Hooded x={300} y={700} scale={1} />
            <Clerk x={930} y={1070} scale={0.85} look={-1} worry={0.5} mouth={m} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 15: {
      const r = c01((lT - 1.0) / 2.5);
      visual = (
        <Svg zoom={lerp(1.8, 1.6, ease(lT / 4))} cx={820} cy={1120}>
          <Interior frame={frame} belt={beltPos} receipt={r}>
            <Hooded x={300} y={700} scale={1} />
            <Clerk x={930} y={1070} scale={0.85} look={0.3} worry={0.3} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 16: {
      const blinkAt = wordTime("моргнул");
      const gone = t > blinkAt + 0.1;
      dark = t >= blinkAt && t < blinkAt + 0.1 ? 1 : 0;
      visual = (
        <Svg zoom={1.25} cx={500} cy={1150}>
          <Interior frame={frame}>
            {!gone && <Hooded x={300} y={700} scale={1} />}
            <Clerk x={930} y={1070} scale={0.85} look={-1} worry={gone ? 1 : 0.5} blink={t >= blinkAt - 0.1 && t < blinkAt + 0.15} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 17: {
      visual = (
        <Svg zoom={1.0} style={{ filter: "saturate(0.1) contrast(1.2)" }}>
          <Interior frame={frame}>
            <Clerk x={930} y={1070} scale={0.85} look={-1} />
          </Interior>
        </Svg>
      );
      overlay = <Cctv label="CAM 02" time="03:34:12" glitch={lT < 0.5 ? 1 - lT * 2 : 0} />;
      break;
    }
    case 18: {
      rain = true;
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(lT / 1.4))} cx={540} cy={1100}>
          <Interior frame={frame} belt={beltPos}><Clerk x={900} y={1080} scale={0.9} look={-0.6} worry={0.6} /></Interior>
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.magenta}>НОЧЬ 3</NeonTag>;
      break;
    }
    case 19: {
      visual = (
        <Svg zoom={lerp(1.0, 1.25, ease(lT / 1))} cx={540} cy={960}>
          <rect width={1080} height={1920} fill="#07080F" />
          <Clock x={540} y={960} text="03:33" scale={2.4} color={neon.magenta} />
        </Svg>
      );
      break;
    }
    case 20: {
      const b = Math.sin(lT * 22) * 28 * Math.exp(-lT * 1.5);
      visual = (
        <Svg zoom={2.2} cx={200} cy={560}>
          <Interior frame={frame} bell={b} doorOpen={c01(lT / 0.5) * 0.6} />
        </Svg>
      );
      overlay = <NeonSfx text="ДЗИНЬ" startFrame={f(S.s - 0.2)} x={620} y={520} />;
      break;
    }
    case 21: {
      visual = (
        <Svg zoom={1.4} cx={540} cy={1550}>
          <Interior frame={frame}>
            <Boots step={lT * 2} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 22: {
      const h = c01((lT - 0.2) / 1.0);
      visual = (
        <Svg zoom={1.35} cx={450} cy={1150}>
          <Interior frame={frame} belt={0}>
            <Hooded x={300} y={700} scale={1} handOut={h} />
            <g opacity={c01((lT - 1.0) / 0.3)}><Photo x={470} y={1190} scale={0.28} rotate={-10} /></g>
            <Clerk x={930} y={1070} scale={0.85} look={-1} worry={0.8} />
          </Interior>
        </Svg>
      );
      break;
    }
    case 23: {
      visual = (
        <Svg zoom={lerp(1.0, 1.1, ease(lT))} cx={540} cy={1000}>
          <Interior frame={frame} belt={0} />
          <Photo x={540} y={1000} scale={1.2} rotate={-6} />
        </Svg>
      );
      break;
    }
    case 24: {
      visual = (
        <Svg zoom={lerp(1.2, 1.7, ease(lT / 1.2))} cx={470} cy={1040}>
          <Interior frame={frame} belt={0} />
          <Photo x={540} y={1000} scale={1.2} rotate={-6} zoom={lerp(1, 1.3, ease(lT / 1.2))} />
        </Svg>
      );
      break;
    }
    case 25: {
      visual = (
        <Svg zoom={lerp(1.1, 1.3, ease(lT / 3.5))} cx={380} cy={800} filter="url(#sepia)">
          <Kitchen />
          <rect width={1080} height={1920} fill="#5A3A20" opacity={0.15} />
        </Svg>
      );
      overlay = <NeonTag x={70} y={200} color={neon.amber}>6 ЛЕТ</NeonTag>;
      break;
    }
    case 26: {
      const p = ease(lT / 1.6);
      rain = true;
      visual = (
        <>
          <Svg zoom={lerp(1.3, 0.75, p)} cx={380} cy={800} filter="url(#sepia)">
            <Kitchen />
          </Svg>
          {/* window frame + night outside, revealed as we pull back */}
          <Svg zoom={1} style={{ opacity: p }}>
            <rect x={160} y={360} width={760} height={1000} fill="none" stroke="#1A1A2A" strokeWidth={60} />
            <rect x={0} y={0} width={1080} height={360} fill="#07080F" />
            <rect x={0} y={1360} width={1080} height={560} fill="#07080F" />
            <rect x={0} y={0} width={160} height={1920} fill="#07080F" />
            <rect x={920} y={0} width={160} height={1920} fill="#07080F" />
            <Rain count={120} opacity={0.5} area={[160, 360, 760, 1000]} />
          </Svg>
        </>
      );
      break;
    }
    case 27: {
      const liftAt = wordTime("поднимает");
      if (t < liftAt - 0.3) {
        const j = (random(`j${frame}`) - 0.5) * 10;
        visual = (
          <Svg zoom={2.0} cx={900} cy={1250} dx={j} dy={j * 0.6}>
            <Interior frame={frame}>
              <Clerk x={930} y={1070} scale={0.85} look={-1} worry={1} />
            </Interior>
          </Svg>
        );
        overlay = <NeonTag x={70} y={200} color={neon.magenta}>РУКИ ТРЯСУТСЯ</NeonTag>;
      } else {
        const r = c01((t - liftAt + 0.3) / 1.4);
        const talking = t > wordTime("шепчет");
        visual = (
          <Svg zoom={lerp(2.2, 2.6, r)} cx={300} cy={800}>
            <Interior frame={frame}>
              <Hooded x={300} y={700} scale={1} reveal={r} mouth={talking ? 0.3 + Math.abs(Math.sin(t * 14)) * 0.5 : 0} />
            </Interior>
          </Svg>
        );
        overlay = talking && <NeonTag x={560} y={520} color={neon.white}>ШЁПОТ</NeonTag>;
      }
      break;
    }
    case 28: {
      visual = (
        <Svg zoom={lerp(2.8, 3.3, ease(lT / 1.2))} cx={300} cy={800}>
          <Interior frame={frame}>
            <Hooded x={300} y={700} scale={1} reveal={1} mouth={0.3 + Math.abs(Math.sin(t * 14)) * 0.5} />
          </Interior>
        </Svg>
      );
      dark = c01((lT - 1.1) / 0.3);
      break;
    }
    default: {
      // 29–32: end card
      const showQ = c01((t - sentences[29].s + 0.2) / 0.5);
      const showA = c01((t - sentences[30].s + 0.2) / 0.5);
      const showB = c01((t - sentences[31].s + 0.2) / 0.5);
      const showC = c01((t - sentences[32].s + 0.2) / 0.5);
      const card = (label: string, sub: string, color: string, show: number, dir: number) => (
        <div style={{ flex: 1, margin: 18, padding: "56px 32px", borderRadius: 24, background: "rgba(63,224,240,0.04)", border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}55, inset 0 0 30px ${color}11`, textAlign: "center", opacity: show, transform: `translateX(${(1 - show) * dir}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color, textShadow: `0 0 20px ${color}`, lineHeight: 1 }}>{label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: neon.white, marginTop: 24, lineHeight: 1.2 }}>{sub}</div>
        </div>
      );
      visual = (
        <AbsoluteFill style={{ background: "#06070E", justifyContent: "center", padding: "0 54px" }}>
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.3em", color: neon.cyan, textAlign: "center", opacity: showQ, textShadow: `0 0 12px ${neon.cyan}` }}>НОЧНАЯ СМЕНА · СЕРИЯ 1</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: neon.white, textTransform: "uppercase", textAlign: "center", lineHeight: 1.05, marginTop: 30, opacity: showQ }}>Что будет<br />дальше?</div>
          <div style={{ display: "flex", marginTop: 70 }}>
            {card("А", "Спросить, откуда у него мои вещи", neon.cyan, showA, -40)}
            {card("Б", "После смены пойти за ним", neon.magenta, showB, 40)}
          </div>
          <div style={{ marginTop: 80, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: neon.white, textTransform: "uppercase", opacity: showC }}>
            Пишите в комментариях: <span style={{ color: neon.cyan }}>А</span> или <span style={{ color: neon.magenta }}>Б</span>
          </div>
        </AbsoluteFill>
      );
      break;
    }
  }

  const dip = lT < 0.08 ? 1 - lT / 0.08 : 0;

  return (
    <AbsoluteFill style={{ background: neon.bg, overflow: "hidden" }}>
      {visual}
      {rain && si !== 0 && si !== 26 && (
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Rain count={60} opacity={0.15} /></svg>
      )}
      <Grain amount={0.14} />
      {overlay}
      {si < 29 && g && <Karaoke words={g.words} t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dip * 0.9, dark) }} />

      {/* audio */}
      <Audio src={staticFile("vo_shift1.mp3")} volume={1} />
      <Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_rain.mp3")} volume={0.35} /></Loop>
      <Loop durationInFrames={f(21.5)}><Audio src={staticFile("sfx_hum.mp3")} volume={0.45} /></Loop>
      {[wordTime("звенит"), sentences[20].s - 0.2].map((at, i) => (
        <Sequence key={`bell${i}`} from={f(at)} durationInFrames={f(2)}><Audio src={staticFile("sfx_bell.mp3")} volume={0.9} /></Sequence>
      ))}
      <Sequence from={f(sentences[21].s - 0.2)} durationInFrames={f(4)}><Audio src={staticFile("sfx_steps.mp3")} volume={0.8} /></Sequence>
      <Sequence from={f(sentences[7].s)} durationInFrames={f(4)}><Audio src={staticFile("sfx_steps.mp3")} volume={0.5} /></Sequence>
      <Sequence from={f(sentences[17].s - 0.2)} durationInFrames={f(1)}><Audio src={staticFile("sfx_glitch.mp3")} volume={0.6} /></Sequence>
      {[sentences[5].s - 0.3, wordTime("поднимает") - 0.3, sentences[28].s - 0.2].map((at, i) => (
        <Sequence key={`sting${i}`} from={f(at)} durationInFrames={f(3)}><Audio src={staticFile("sfx_sting.mp3")} volume={0.8} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
