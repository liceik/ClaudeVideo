import React from "react";
import { random, useCurrentFrame } from "remotion";

/**
 * "Десятая кнопка" — found-footage look: cold grey-green fluorescent light,
 * concrete and brushed steel, hard flat shapes, VHS artefacts.
 */
export const col = {
  bg: "#0B0F0E",
  wall: "#232A27",
  wallDark: "#161B19",
  steel: "#8E9994",
  steelDark: "#5C6662",
  steelLight: "#B7C1BC",
  light: "#C9F2D6",
  green: "#7CFFB0",
  red: "#FF3B30",
  yellow: "#FFD400",
  white: "#F2F5F3",
  black: "#050706",
};

/* ───────── Elevator panel ───────── */
export const Panel: React.FC<{ extra?: boolean; lit?: number | null; x?: number; y?: number; scale?: number }> = ({
  extra = false, lit = null, x = 540, y = 960, scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* steel plate with brushed lines */}
    <rect x={-220} y={-640} width={440} height={1280 + (extra ? 130 : 0)} rx={14} fill={col.steel} />
    {Array.from({ length: 90 }).map((_, i) => (
      <line key={i} x1={-220} y1={-640 + i * 15} x2={220} y2={-640 + i * 15} stroke="#000" strokeWidth={1} opacity={0.08 + random(`b${i}`) * 0.1} />
    ))}
    {Array.from({ length: 18 }).map((_, i) => (
      <line key={i} x1={-220 + random(`sx${i}`) * 440} y1={-640 + random(`sy${i}`) * 1280} x2={-220 + random(`sx${i}`) * 440 + 20 + random(`sl${i}`) * 90} y2={-640 + random(`sy${i}`) * 1280 + (random(`sa${i}`) - 0.5) * 40} stroke="#fff" strokeWidth={1.5} opacity={0.18} />
    ))}
    {/* screws */}
    {[[-190, -610], [190, -610], [-190, 610 + (extra ? 130 : 0)], [190, 610 + (extra ? 130 : 0)]].map(([sx, sy], i) => (
      <g key={i}><circle cx={sx} cy={sy} r={9} fill={col.steelDark} /><line x1={sx - 6} y1={sy} x2={sx + 6} y2={sy} stroke="#000" strokeWidth={2} /></g>
    ))}
    {/* buttons 9..1 top to bottom */}
    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => {
      const by = -520 + i * 130;
      const on = lit === n;
      return (
        <g key={n} transform={`translate(0 ${by})`}>
          <circle r={48} fill={col.steelDark} />
          <circle r={42} fill={on ? col.green : "#2B3330"} opacity={on ? 0.9 : 1} />
          <circle r={42} fill="url(#btnShade)" />
          {on && <circle r={70} fill={col.green} opacity={0.35} style={{ filter: "url(#glow2)" }} />}
          <text x={0} y={14} textAnchor="middle" fontFamily='"Inter Display", Inter, sans-serif' fontWeight={700} fontSize={40} fill={on ? col.black : col.steelLight}>{n}</text>
        </g>
      );
    })}
    {extra && (
      <g transform="translate(0 650)">
        <circle r={48} fill={col.steelDark} />
        <circle r={42} fill={lit === 10 ? col.green : col.black} />
        <circle r={42} fill="url(#btnShade)" />
        {lit === 10 && <circle r={70} fill={col.green} opacity={0.35} style={{ filter: "url(#glow2)" }} />}
        {/* the scratch */}
        <line x1={-26} y1={-14} x2={24} y2={18} stroke="#D7DEDA" strokeWidth={2.5} opacity={0.85} />
        {lit === 10 && <text x={0} y={14} textAnchor="middle" fontFamily='"Inter Display", Inter, sans-serif' fontWeight={700} fontSize={40} fill={col.black}>10</text>}
      </g>
    )}
  </g>
);

/* ───────── Cabin interior (doors open, seen from hallway) ───────── */
export const Cabin: React.FC<{ open?: number; lit?: number | null; dim?: number }> = ({ open = 1, lit = null, dim = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill={col.wallDark} />
    {/* hallway wall with tiles */}
    {Array.from({ length: 10 }).map((_, r) => (
      <rect key={r} x={0} y={r * 200} width={1080} height={2} fill="#000" opacity={0.3} />
    ))}
    {/* door frame */}
    <rect x={140} y={260} width={800} height={1400} fill={col.steelDark} />
    <rect x={170} y={290} width={740} height={1340} fill="#0E1412" />
    {/* cabin interior */}
    <rect x={170} y={290} width={740} height={1340} fill={col.wall} />
    <rect x={170} y={290} width={740} height={1340} fill={col.light} opacity={0.06 + (lit ? 0.04 : 0)} />
    <rect x={170} y={1500} width={740} height={130} fill="#101513" />
    <rect x={200} y={300} width={680} height={14} fill={col.light} opacity={0.5} />
    {/* back wall panel with tiny buttons */}
    <g transform="translate(780 960) scale(0.42)">
      <Panel x={0} y={0} extra lit={lit} />
    </g>
    {/* doors sliding */}
    <rect x={170} y={290} width={370 * (1 - open)} height={1340} fill={col.steel} />
    <rect x={910 - 370 * (1 - open)} y={290} width={370 * (1 - open)} height={1340} fill={col.steel} />
    <rect width={1080} height={1920} fill="#000" opacity={dim} />
  </g>
);

/* ───────── Doors from inside with a reflection ───────── */
export const DoorsInside: React.FC<{ ajar?: number }> = ({ ajar = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill={col.steelDark} />
    <rect x={0} y={0} width={538} height={1920} fill={col.steel} />
    <rect x={542} y={0} width={538} height={1920} fill={col.steel} />
    <rect x={538} y={0} width={4} height={1920} fill="#000" />
    {Array.from({ length: 120 }).map((_, i) => (
      <line key={i} x1={0} y1={i * 16} x2={1080} y2={i * 16} stroke="#000" strokeWidth={1} opacity={0.06 + random(`d${i}`) * 0.08} />
    ))}
    {/* blurred reflection of the narrator with a phone */}
    <g opacity={0.35} style={{ filter: "url(#blur6)" }}>
      <ellipse cx={540} cy={1500} rx={200} ry={420} fill="#0B0F0E" />
      <circle cx={540} cy={960} r={120} fill="#1A211E" />
      <rect x={600} y={880} width={70} height={130} rx={10} fill="#0B0F0E" />
      <rect x={606} y={888} width={58} height={100} fill={col.light} opacity={0.6} />
    </g>
    {/* the door ajar, behind the shoulder, in the reflection */}
    <g opacity={0.55} style={{ filter: "url(#blur3)" }}>
      <rect x={760} y={520} width={180} height={700} fill="#1A211E" />
      <rect x={760} y={520} width={180 * ajar} height={700} fill="#000" />
      <rect x={760 + 180 * ajar - 3} y={520} width={6} height={700} fill={col.light} opacity={0.5} />
    </g>
    {/* ceiling lamp reflection */}
    <rect x={200} y={40} width={680} height={20} rx={10} fill={col.light} opacity={0.5} />
  </g>
);

/* ───────── Floor display ───────── */
const SEG: Record<string, number[]> = {
  "0": [1, 1, 1, 1, 1, 1, 0], "1": [0, 1, 1, 0, 0, 0, 0], "9": [1, 1, 1, 1, 0, 1, 1], "-": [0, 0, 0, 0, 0, 0, 1],
};
const Digit: React.FC<{ d: string; x: number; on: number }> = ({ d, x, on }) => {
  const s = SEG[d] ?? SEG["-"];
  const w = 120, h = 220, t = 22;
  const segs = [
    [0, 0, w, t], [w - t, 0, t, h / 2], [w - t, h / 2, t, h / 2], [0, h - t, w, t], [0, h / 2, t, h / 2], [0, 0, t, h / 2], [0, h / 2 - t / 2, w, t],
  ];
  return (
    <g transform={`translate(${x} 0)`}>
      {segs.map(([sx, sy, sw, sh], i) => (
        <rect key={i} x={sx} y={sy} width={sw} height={sh} rx={6} fill={col.red} opacity={s[i] ? 0.95 * on : 0.08} style={s[i] ? { filter: "url(#glow2)" } : undefined} />
      ))}
    </g>
  );
};
export const Display: React.FC<{ value: string; flicker?: number }> = ({ value, flicker = 1 }) => (
  <g>
    <rect width={1080} height={1920} fill={col.steelDark} />
    {Array.from({ length: 120 }).map((_, i) => (
      <line key={i} x1={0} y1={i * 16} x2={1080} y2={i * 16} stroke="#000" strokeWidth={1} opacity={0.08} />
    ))}
    <rect x={190} y={760} width={700} height={400} rx={18} fill="#0A0C0B" />
    <rect x={210} y={780} width={660} height={360} rx={10} fill="#140606" />
    <g transform="translate(0 850)">
      {value.length === 1 ? <Digit d={value} x={480} on={flicker} /> : (
        <>
          <Digit d={value[0]} x={390} on={flicker} />
          <Digit d={value[1]} x={570} on={flicker} />
        </>
      )}
    </g>
    <rect x={210} y={780} width={660} height={360} fill={col.red} opacity={0.06 * flicker} />
  </g>
);

/* ───────── Phone shot ───────── */
export const PhoneShot: React.FC<{ glitch?: number }> = ({ glitch = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill={col.wallDark} />
    {/* corridor perspective */}
    <polygon points="0,0 1080,0 760,700 320,700" fill="#1D2422" />
    <polygon points="0,1920 1080,1920 760,1200 320,1200" fill="#141917" />
    <rect x={320} y={700} width={440} height={500} fill="#0E1210" />
    <rect x={400} y={300} width={280} height={16} fill={col.light} opacity={0.6} />
    {/* hand + phone */}
    <path d="M160 1920 q-40 -400 160 -520 l420 -40 q120 40 60 180 l-20 380 Z" fill="#2A2320" />
    <g transform="translate(540 1120) rotate(-6)">
      <rect x={-200} y={-380} width={400} height={760} rx={40} fill="#0A0A0A" />
      <rect x={-180} y={-350} width={360} height={700} rx={20} fill="#1E2623" />
      {/* photo of the panel on screen: buttons 1-9 only */}
      <g transform="translate(0 30) scale(0.42)">
        <Panel x={0} y={0} extra={false} />
      </g>
      {/* RGB glitch bands */}
      {glitch > 0 && (
        <g opacity={glitch}>
          <rect x={-180} y={-120} width={360} height={28} fill="#FF2A6D" opacity={0.6} transform="translate(18 0)" />
          <rect x={-180} y={40} width={360} height={18} fill="#2AF5FF" opacity={0.6} transform="translate(-24 0)" />
          <rect x={-180} y={200} width={360} height={40} fill="#D0FF2A" opacity={0.35} transform="translate(10 0)" />
        </g>
      )}
      <rect x={-180} y={-350} width={360} height={60} fill="#000" opacity={0.6} />
      <text x={-150} y={-312} fontFamily='"JetBrains Mono", monospace' fontSize={22} fill={col.white}>23:41</text>
      <circle cx={0} cy={-330} r={8} fill="#000" />
    </g>
  </g>
);

/* ───────── Concierge desk ───────── */
export const Desk: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#121614" />
    <rect width={1080} height={1200} fill="#1C2320" />
    {/* mailboxes */}
    {Array.from({ length: 24 }).map((_, i) => (
      <rect key={i} x={80 + (i % 6) * 150} y={300 + Math.floor(i / 6) * 110} width={130} height={90} fill={col.steelDark} stroke="#000" strokeWidth={2} />
    ))}
    {/* fluorescent tube */}
    <rect x={300} y={120} width={480} height={18} rx={9} fill={col.light} opacity={0.7} />
    <rect x={200} y={100} width={680} height={300} fill={col.light} opacity={0.08} style={{ filter: "url(#glow2)" }} />
    {/* desk */}
    <rect x={60} y={1200} width={960} height={60} fill="#3B2E24" />
    <rect x={80} y={1260} width={920} height={520} fill="#2C231B" />
    <rect x={80} y={1260} width={920} height={30} fill="#1A1410" />
    {/* warm lamp */}
    <g transform="translate(820 1120)">
      <polygon points="-90,0 90,0 50,-120 -50,-120" fill="#5C4A2E" />
      <rect x={-10} y={0} width={20} height={80} fill="#2A2118" />
      <circle cx={0} cy={60} r={260} fill="#FFB347" opacity={0.18} style={{ filter: "url(#glow2)" }} />
      <circle cx={0} cy={60} r={120} fill="#FFD27A" opacity={0.25} />
    </g>
    {/* empty chair */}
    <rect x={380} y={1040} width={200} height={160} rx={16} fill="#1A1E1C" />
    <rect x={380} y={1200} width={200} height={20} fill="#15181A" />
    {/* tiled floor */}
    <rect y={1780} width={1080} height={140} fill="#0E1210" />
    {/* sign */}
    <rect x={120} y={560} width={300} height={70} fill="#0B0F0E" />
    <text x={270} y={608} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize={30} fill={col.steelLight} letterSpacing={4}>КОНСЬЕРЖ</text>
  </g>
);

/* ───────── Effects ───────── */
export const FxDefs: React.FC = () => (
  <defs>
    <radialGradient id="btnShade" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#fff" stopOpacity={0.25} />
      <stop offset="0.6" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.5} />
    </radialGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="18" /></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>
);

/** VHS: scanlines, a wandering tracking band, grain, colour cast. */
export const Vhs: React.FC<{ strength?: number }> = ({ strength = 1 }) => {
  const frame = useCurrentFrame();
  const band = (frame * 9) % 2200 - 150;
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect width={1080} height={1920} fill="#8CFFB8" opacity={0.05 * strength} />
      {Array.from({ length: 160 }).map((_, i) => (
        <rect key={i} x={0} y={i * 12} width={1080} height={4} fill="#000" opacity={0.16 * strength} />
      ))}
      <rect x={0} y={band} width={1080} height={70} fill="#fff" opacity={0.05 * strength} />
      <rect x={0} y={band + 70} width={1080} height={6} fill="#000" opacity={0.3 * strength} />
      <filter id="grainF">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={frame % 300} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1080} height={1920} filter="url(#grainF)" opacity={0.16 * strength} style={{ mixBlendMode: "overlay" }} />
      <rect width={1080} height={1920} fill="url(#vig)" />
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.75} />
      </radialGradient>
    </g>
  );
};

/** Phone camera UI: REC dot, timecode, battery, frame corners. */
export const CamUi: React.FC<{ t: number; label?: string }> = ({ t, label = "REC" }) => {
  const frame = useCurrentFrame();
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(Math.floor(t % 60)).padStart(2, "0");
  const ff = String(frame % 30).padStart(2, "0");
  const mono = { fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fill: col.white, letterSpacing: 2 } as const;
  return (
    <g style={{ pointerEvents: "none" }}>
      {[[60, 60], [1020, 60], [60, 1860], [1020, 1860]].map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + (i % 2 ? -60 : 60)} y2={y} stroke={col.white} strokeWidth={4} opacity={0.8} />
          <line x1={x} y1={y} x2={x} y2={y + (i > 1 ? -60 : 60)} stroke={col.white} strokeWidth={4} opacity={0.8} />
        </g>
      ))}
      {Math.floor(frame / 15) % 2 === 0 && <circle cx={100} cy={130} r={12} fill={col.red} />}
      <text x={125} y={141} {...mono}>{label}</text>
      <text x={700} y={141} {...mono}>{`00:${mm}:${ss}:${ff}`}</text>
      <rect x={940} y={116} width={60} height={28} rx={5} fill="none" stroke={col.white} strokeWidth={3} opacity={0.8} />
      <rect x={944} y={120} width={14} height={20} fill={col.white} opacity={0.8} />
      <rect x={1001} y={124} width={5} height={12} fill={col.white} opacity={0.8} />
    </g>
  );
};
