import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, easeOut, fonts, ms, progress, rise, sceneExit } from "./theme";

const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontSize: 22,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: colors.muted,
      ...style,
    }}
  >
    {children}
  </div>
);

const Frame: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: 120, color: colors.text, ...sceneExit(frame, duration) }}>
      {children}
    </AbsoluteFill>
  );
};

/* ───────────────────────── Scene 1: Title ───────────────────────── */
export const SceneTitle: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const words = ["Claude", "Video"];
  // Lead: title words. Support: subtitle. Decoration: label (fade only).
  return (
    <Frame duration={duration}>
      <AbsoluteFill style={{ padding: 120, justifyContent: "center" }}>
        <Mono style={{ opacity: progress(frame, 0, ms(500)) }}>Remotion · HyperFrames · 28 skills</Mono>
        <div style={{ display: "flex", gap: 36, marginTop: 24, overflow: "hidden" }}>
          {words.map((w, i) => (
            <div
              key={w}
              style={{
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: 220,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: i === 1 ? colors.accent : colors.text,
                ...rise(frame, i * 120, 700, 140),
              }}
            >
              {w}
            </div>
          ))}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 48,
            fontWeight: 400,
            color: colors.muted,
            marginTop: 28,
            ...rise(frame, 320, 600, 24),
          }}
        >
          Видео, которое пишется кодом.
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

/* ───────────────────────── Scene 2: Stack cards ───────────────────────── */
const Counter: React.FC<{ to: number; startMs: number; durationMs: number }> = ({ to, startMs, durationMs }) => {
  const frame = useCurrentFrame();
  const v = Math.round(progress(frame, ms(startMs), ms(durationMs)) * to);
  return <>{v}</>;
};

export const SceneStack: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const cards = [
    { title: "HyperFrames", sub: "HTML + GSAP → MP4", accent: colors.accent3, delay: 0 },
    { title: "Remotion", sub: "React → MP4, этот ролик", accent: colors.accent2, delay: 110 },
    { title: null, sub: "дизайн- и motion-скилов", accent: colors.accent, delay: 190 },
  ];
  return (
    <Frame duration={duration}>
      <Mono style={{ opacity: progress(frame, 0, ms(400)) }}>01 — Стек</Mono>
      <h2
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 96,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          margin: "20px 0 64px",
          ...rise(frame, 0, 600, 40),
        }}
      >
        Что стоит в проекте
      </h2>
      <div style={{ display: "flex", gap: 32 }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 420,
              borderRadius: 28,
              background: colors.bgSoft,
              boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px rgba(0,0,0,0.35)",
              padding: 44,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...rise(frame, 150 + c.delay, 650, 60 - i * 10),
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: c.accent }} />
            <div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: c.title ? 64 : 150,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: c.title ? colors.text : c.accent,
                }}
              >
                {c.title ?? <Counter to={28} startMs={500} durationMs={1400} />}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 30, color: colors.muted, marginTop: 14 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

/* ───────────────────────── Scene 3: What I can make ───────────────────────── */
export const SceneList: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const items = [
    ["Промо продуктов и фич", colors.accent],
    ["Объясняющие ролики и туториалы", colors.accent2],
    ["Кинетическая типографика", colors.accent3],
    ["Инфографика и живые графики", colors.accent],
    ["Вертикальные 9:16 для соцсетей", colors.accent2],
    ["Титры, заставки, плашки", colors.accent3],
  ] as const;
  // Wave: delays shrink as the list goes on (not a metronome).
  const delays = [0, 130, 240, 330, 400, 450];
  return (
    <Frame duration={duration}>
      <Mono style={{ opacity: progress(frame, 0, ms(400)) }}>02 — Форматы</Mono>
      <h2
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 96,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          margin: "20px 0 56px",
          ...rise(frame, 0, 600, 40),
        }}
      >
        Какие ролики я теперь делаю
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 48px" }}>
        {items.map(([label, c], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "26px 32px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${colors.line}`,
              ...rise(frame, 200 + delays[i], 600, 36 - i * 3),
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: c,
                boxShadow: `0 0 24px ${c}`,
                flexShrink: 0,
              }}
            />
            <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 38, letterSpacing: "-0.01em" }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

/* ───────────────────────── Scene 4: Infographic ───────────────────────── */
export const SceneChart: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [34, 52, 41, 68, 77, 63, 92, 100];
  const big = spring({ frame: frame - ms(900), fps, config: { damping: 18, stiffness: 120, mass: 0.9 } });
  const pct = Math.round(interpolate(big, [0, 1], [0, 248]));
  return (
    <Frame duration={duration}>
      <Mono style={{ opacity: progress(frame, 0, ms(400)) }}>03 — Данные</Mono>
      <div style={{ display: "flex", gap: 80, alignItems: "flex-end", height: "100%", paddingBottom: 40 }}>
        <div style={{ flex: 1.3, display: "flex", alignItems: "flex-end", gap: 26, height: 560 }}>
          {bars.map((h, i) => {
            const p = progress(frame, ms(200 + i * 70), ms(700));
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h * p}%`,
                  borderRadius: 14,
                  background: i === bars.length - 1 ? colors.accent : `rgba(124,140,255,${0.35 + i * 0.07})`,
                  transformOrigin: "bottom",
                }}
              />
            );
          })}
        </div>
        <div style={{ flex: 1, ...rise(frame, 600, 600, 30) }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 230,
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              color: colors.text,
              transform: `scale(${0.9 + big * 0.1})`,
              transformOrigin: "left bottom",
            }}
          >
            +{pct}
            <span style={{ color: colors.accent }}>%</span>
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 40, color: colors.muted, marginTop: 20, lineHeight: 1.3 }}>
            Графики, счётчики и метрики анимируются прямо из данных. Без After Effects.
          </div>
        </div>
      </div>
    </Frame>
  );
};

/* ───────────────────────── Scene 5: Kinetic type + morph ───────────────────────── */
export const SceneKinetic: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = [
    { w: "Быстро.", bg: colors.text, fg: colors.bg },
    { w: "Точно.", bg: colors.accent2, fg: colors.text },
    { w: "Со вкусом.", bg: colors.accent, fg: colors.text },
  ];
  const beat = ms(1300);
  const idx = Math.min(words.length - 1, Math.floor(frame / beat));
  const local = frame - idx * beat;
  const s = spring({ frame: local, fps, config: { damping: 14, stiffness: 170, mass: 0.8 } });
  const cur = words[idx];

  // Shape morph: circle → rounded square → diamond, rotating with each word.
  const radius = interpolate(idx + s, [0, 1, 2, 3], [50, 22, 50, 22], { extrapolateRight: "clamp" });
  const rot = interpolate(idx + s, [0, 3], [0, 135]);

  return (
    <AbsoluteFill style={{ ...sceneExit(frame, duration) }}>
      <AbsoluteFill style={{ backgroundColor: cur.bg }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: `${radius}%`,
            border: `14px solid ${cur.fg}`,
            opacity: 0.18,
            transform: `rotate(${rot}deg) scale(${0.9 + s * 0.1})`,
          }}
        />
        <div
          key={idx}
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 260,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: cur.fg,
            opacity: Math.min(1, s * 1.6),
            transform: `translateY(${(1 - s) * 60}px) scale(${0.92 + s * 0.08})`,
          }}
        >
          {cur.w}
        </div>
        <Mono style={{ position: "absolute", bottom: 120, color: cur.fg, opacity: 0.6 }}>
          spring · damping 14 · stiffness 170
        </Mono>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── Scene 6: Outro ───────────────────────── */
export const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const line = progress(frame, ms(500), ms(900));
  return (
    <Frame duration={duration}>
      <AbsoluteFill style={{ padding: 120, justifyContent: "center", alignItems: "flex-start" }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 130,
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            maxWidth: 1500,
            ...rise(frame, 0, 700, 60),
          }}
        >
          Давайте снимем
          <br />
          <span style={{ color: colors.accent }}>первое видео.</span>
        </div>
        <div style={{ height: 4, width: `${line * 420}px`, background: colors.text, marginTop: 48, borderRadius: 2 }} />
        <Mono style={{ marginTop: 32, opacity: progress(frame, ms(300), ms(500)) }}>
          github.com/liceik/ClaudeVideo · generated with Claude Code
        </Mono>
      </AbsoluteFill>
    </Frame>
  );
};

export { easeOut };
