import React from "react";
import { random } from "remotion";
import { neon } from "./fx";

/**
 * Night Shift art: ink-outlined shapes, neon light, lots of small detail.
 * All in a 1080×1920 viewBox.
 */
const INK = neon.ink;
const O = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const };

/* ───────── Exterior ───────── */
export const Street: React.FC<{ lampFlicker?: number; signFlicker?: number }> = ({ lampFlicker = 1, signFlicker = 1 }) => (
  <g>
    <rect width={1080} height={1920} fill="#060812" />
    {/* far buildings */}
    {[0, 220, 460, 700, 900].map((x, i) => (
      <g key={i}>
        <rect x={x} y={380 - (i % 2) * 120} width={200} height={900} fill="#0B1020" />
        {Array.from({ length: 10 }).map((_, j) => (
          <rect key={j} x={x + 24 + (j % 3) * 60} y={420 + Math.floor(j / 3) * 110 - (i % 2) * 120} width={28} height={40} fill={random(`w${i}${j}`) > 0.6 ? "#F3D37A" : "#101827"} opacity={0.8} />
        ))}
      </g>
    ))}
    {/* store facade */}
    <rect x={60} y={900} width={960} height={520} fill="#121A2E" {...O} />
    <rect x={120} y={980} width={840} height={400} fill="#0E2A36" {...O} />
    {/* window glow + interior hint */}
    <rect x={130} y={990} width={820} height={380} fill={neon.cyan} opacity={0.12 * lampFlicker} />
    {[0, 1, 2].map((i) => <rect key={i} x={160 + i * 270} y={1030 + (i % 2) * 20} width={200} height={14} fill={neon.cyan} opacity={0.5 * lampFlicker} />)}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={180 + i * 200} y={1120} width={120} height={200} fill="#1B4C5C" opacity={0.7} />)}
    {/* neon sign */}
    <g transform="translate(540 760)" opacity={signFlicker}>
      <rect x={-260} y={-70} width={520} height={140} rx={18} fill="#0A0C18" {...O} />
      <text x={0} y={30} textAnchor="middle" fontFamily='"Inter Display", Inter, sans-serif' fontWeight={900} fontSize={96} fill={neon.magenta} style={{ filter: "url(#glow)" }}>24 ЧАСА</text>
    </g>
    {/* door */}
    <rect x={460} y={1180} width={160} height={240} fill="#0C3440" {...O} />
    <rect x={470} y={1190} width={140} height={220} fill={neon.cyan} opacity={0.18 * lampFlicker} />
    {/* wet asphalt */}
    <rect y={1420} width={1080} height={500} fill="#0A0D1A" />
    <rect x={130} y={1420} width={820} height={500} fill={neon.cyan} opacity={0.06 * lampFlicker} />
    <rect x={400} y={1420} width={280} height={500} fill={neon.magenta} opacity={0.08 * signFlicker} />
    {Array.from({ length: 14 }).map((_, i) => <ellipse key={i} cx={100 + i * 70} cy={1500 + random(`p${i}`) * 380} rx={30 + random(`q${i}`) * 50} ry={4} fill="#E6F7FF" opacity={0.08} />)}
    {/* street lamp */}
    <rect x={960} y={520} width={14} height={900} fill="#0B0F1C" {...O} />
    <rect x={880} y={500} width={100} height={30} rx={8} fill="#0B0F1C" {...O} />
    <polygon points="880,530 980,530 1080,1420 700,1420" fill={neon.amber} opacity={0.10 * lampFlicker} />
  </g>
);

/* ───────── Interior ───────── */
export const StoreBack: React.FC<{ light?: number; fridge?: number }> = ({ light = 1, fridge = 1 }) => (
  <g>
    <rect width={1080} height={1920} fill="#0A0E1C" />
    {/* ceiling + tubes */}
    <rect width={1080} height={300} fill="#0C1222" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={120 + i * 320} y={120} width={240} height={26} rx={10} fill="#DDF7FF" opacity={0.9 * light} {...O} />
        <rect x={60 + i * 320} y={100} width={360} height={260} fill={neon.cyan} opacity={0.10 * light} style={{ filter: "url(#glowSoft)" }} />
      </g>
    ))}
    {/* back wall shelves with products */}
    <rect y={300} width={1080} height={900} fill="#111A2E" />
    {[0, 1, 2, 3].map((row) => (
      <g key={row}>
        <rect x={40} y={420 + row * 190} width={1000} height={16} fill="#1C2A45" {...O} />
        {Array.from({ length: 16 }).map((_, k) => {
          const h = 70 + random(`ph${row}${k}`) * 70;
          const w = 36 + random(`pw${row}${k}`) * 24;
          const c = ["#E24B4B", "#F2C14E", "#3F8CFF", "#59D98E", "#FF8A3D", "#B98CFF"][Math.floor(random(`pc${row}${k}`) * 6)];
          return <rect key={k} x={60 + k * 61} y={420 + row * 190 - h} width={w} height={h} rx={6} fill={c} opacity={0.75} stroke={INK} strokeWidth={3} />;
        })}
      </g>
    ))}
    {/* floor */}
    <rect y={1200} width={1080} height={720} fill="#0D1326" />
    {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={0} y1={1200 + i * 95} x2={1080} y2={1200 + i * 95} stroke="#172038" strokeWidth={3} />)}
    {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={i * 120} y1={1200} x2={i * 120 - 160} y2={1920} stroke="#172038" strokeWidth={3} />)}
    <rect y={1200} width={1080} height={720} fill={neon.cyan} opacity={0.06 * fridge} />
  </g>
);

export const Fridge: React.FC<{ x?: number; y?: number; light?: number; scale?: number }> = ({ x = 720, y = 560, light = 1, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={0} y={0} width={320} height={640} rx={14} fill="#0E1A2A" {...O} />
    <rect x={14} y={14} width={292} height={612} rx={10} fill="#0B2E3C" />
    <rect x={14} y={14} width={292} height={612} rx={10} fill={neon.cyan} opacity={0.22 * light} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={20} y={150 + r * 120} width={280} height={8} fill="#1D4B5A" />
        {Array.from({ length: 6 }).map((_, k) => (
          <rect key={k} x={28 + k * 46} y={80 + r * 120} width={32} height={70} rx={8} fill={["#E24B4B", "#F2C14E", "#3F8CFF", "#59D98E"][(r + k) % 4]} opacity={0.85} stroke={INK} strokeWidth={2} />
        ))}
      </g>
    ))}
    <rect x={150} y={14} width={6} height={612} fill="#0E1A2A" />
    <rect x={14} y={14} width={292} height={612} rx={10} fill="url(#fridgeGlass)" opacity={0.25} />
    <rect x={-60} y={-40} width={440} height={760} fill={neon.cyan} opacity={0.12 * light} style={{ filter: "url(#glowSoft)" }} />
  </g>
);

export const Counter: React.FC<{ belt?: number; receipt?: number }> = ({ belt = 0, receipt = 0 }) => (
  <g>
    {/* counter body */}
    <rect x={-20} y={1240} width={1120} height={420} fill="#17213A" {...O} />
    <rect x={-20} y={1240} width={1120} height={40} fill="#22304F" />
    {/* conveyor belt */}
    <rect x={60} y={1150} width={700} height={110} rx={16} fill="#0A0C14" {...O} />
    {Array.from({ length: 12 }).map((_, i) => {
      const x = 70 + ((i * 60 + belt) % 700);
      return <rect key={i} x={x} y={1160} width={6} height={90} fill="#1E2436" />;
    })}
    {/* register */}
    <rect x={790} y={1030} width={260} height={230} rx={12} fill="#1E2A48" {...O} />
    <rect x={810} y={1050} width={220} height={110} rx={8} fill="#0C1B2A" />
    <rect x={820} y={1060} width={200} height={90} fill={neon.cyan} opacity={0.35} />
    <text x={920} y={1120} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize={44} fill={neon.cyan} fontWeight={700}>0.00</text>
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={815 + (i % 4) * 52} y={1175 + Math.floor(i / 4) * 26} width={40} height={18} rx={4} fill="#2A3A60" />)}
    {receipt > 0 && <rect x={840} y={1030 - receipt * 120} width={120} height={receipt * 120} fill="#F2F6FF" stroke={INK} strokeWidth={3} />}
    {/* scanner light */}
    <rect x={400} y={1255} width={160} height={6} fill={neon.magenta} opacity={0.8} />
  </g>
);

export const DoorInside: React.FC<{ x?: number; open?: number; bell?: number; glow?: number }> = ({ x = 60, open = 0, bell = 0, glow = 1 }) => (
  <g transform={`translate(${x} 560)`}>
    <rect x={-10} y={-10} width={300} height={720} fill="#101A2C" {...O} />
    <rect width={280} height={700} fill="#0C2230" />
    <rect x={10} y={10} width={260 * (1 - open * 0.8)} height={680} fill={neon.magenta} opacity={0.10 * glow} />
    <rect x={10} y={10} width={260 * (1 - open * 0.8)} height={680} fill="#0E3442" opacity={0.6} stroke={INK} strokeWidth={4} />
    {open > 0 && <rect x={10 + 260 * (1 - open * 0.8)} y={10} width={260 * open * 0.8} height={680} fill="#1A0C22" />}
    {/* bell */}
    <g transform={`translate(140 -30) rotate(${bell})`}>
      <path d="M-22 0 q0 -34 22 -34 q22 0 22 34 Z" fill={neon.amber} {...O} />
      <circle cx={0} cy={6} r={6} fill={neon.amber} {...O} />
      <line x1={0} y1={-34} x2={0} y2={-50} stroke={INK} strokeWidth={4} />
    </g>
  </g>
);

export const Clock: React.FC<{ x?: number; y?: number; text: string; scale?: number; color?: string }> = ({ x = 540, y = 200, text, scale = 1, color = neon.magenta }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-170} y={-60} width={340} height={120} rx={14} fill="#0A0C18" {...O} />
    <text x={0} y={30} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontWeight={700} fontSize={84} fill={color} style={{ filter: "url(#glow)" }} letterSpacing={6}>{text}</text>
  </g>
);

/* ───────── Characters ───────── */
export const Clerk: React.FC<{ x?: number; y?: number; scale?: number; look?: number; mouth?: number; worry?: number; blink?: boolean }> = ({
  x = 900, y = 1100, scale = 1, look = 0, mouth = 0, worry = 0, blink = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* torso: vest */}
    <path d="M-120 420 q0 -230 120 -230 q120 0 120 230 Z" fill="#2C5F8A" {...O} />
    <path d="M-50 200 L0 330 L50 200 Z" fill="#F2F6FF" {...O} />
    <rect x={30} y={250} width={60} height={24} rx={4} fill={neon.amber} {...O} />
    {/* neck + head */}
    <rect x={-26} y={70} width={52} height={60} fill="#E8B892" {...O} />
    <circle cx={0} cy={0} r={96} fill="#F1C7A3" {...O} />
    {/* cap */}
    <path d="M-100 -20 a100 100 0 0 1 200 0 Z" fill="#1E3B5C" {...O} />
    <rect x={-120} y={-28} width={240} height={22} rx={8} fill="#1E3B5C" {...O} />
    {/* eyes */}
    {[-34, 34].map((ex) => (
      <g key={ex} transform={`translate(${ex} 10)`}>
        {blink ? <line x1={-16} y1={0} x2={16} y2={0} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : (
          <>
            <ellipse cx={0} cy={0} rx={18} ry={16 + worry * 6} fill="#fff" stroke={INK} strokeWidth={4} />
            <circle cx={look * 8} cy={2} r={8} fill={INK} />
            <circle cx={look * 8 + 3} cy={-1} r={2.5} fill="#fff" />
          </>
        )}
        <path d={`M-20 ${-26 - worry * 4} q20 ${-10 + worry * 14} 40 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    ))}
    {/* mouth */}
    <path d={`M-20 56 q20 ${10 + mouth * 20} 40 0`} stroke={INK} strokeWidth={5} fill={mouth > 0.3 ? "#5A1E2A" : "none"} strokeLinecap="round" />
    {/* stubble shade */}
    <path d="M-50 40 q50 70 100 0" fill="#000" opacity={0.08} />
  </g>
);

export const Hooded: React.FC<{ x?: number; y?: number; scale?: number; reveal?: number; handOut?: number; mouth?: number }> = ({
  x = 420, y = 820, scale = 1, reveal = 0, handOut = 0, mouth = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* body */}
    <path d="M-150 560 q-10 -360 150 -360 q160 0 150 360 Z" fill="#1A1630" {...O} />
    <path d="M-40 260 L0 560 L40 260 Z" fill="#120F22" />
    {/* hood */}
    <path d="M-130 180 q-30 -260 130 -260 q160 0 130 260 q-60 -40 -130 -40 q-70 0 -130 40 Z" fill="#1F1A3A" {...O} />
    <ellipse cx={0} cy={60} rx={92} ry={112} fill="#040409" />
    {/* reveal: chin + mouth */}
    {reveal > 0 && (
      <g opacity={reveal}>
        <path d="M-50 110 q50 60 100 0 L70 140 q-70 60 -140 0 Z" fill="#D9C3B0" />
        <path d={`M-28 118 q28 ${6 + mouth * 14} 56 0`} stroke="#3A1E2A" strokeWidth={5} fill={mouth > 0.4 ? "#2A0F18" : "none"} strokeLinecap="round" />
      </g>
    )}
    {/* arm reaching to the belt */}
    <path d={`M120 300 q${80 + handOut * 60} 60 ${60 + handOut * 220} ${150 + handOut * 60}`} stroke="#1A1630" strokeWidth={56} fill="none" strokeLinecap="round" />
    <path d={`M120 300 q${80 + handOut * 60} 60 ${60 + handOut * 220} ${150 + handOut * 60}`} stroke={INK} strokeWidth={66} fill="none" strokeLinecap="round" opacity={0.0} />
    <circle cx={180 + handOut * 220} cy={450 + handOut * 60} r={30} fill="#D9C3B0" {...O} />
  </g>
);

/* ───────── Items ───────── */
export const Key: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 540, y = 1200, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(-20)`}>
    <circle cx={-60} cy={0} r={34} fill="none" stroke="#C9A25A" strokeWidth={16} />
    <rect x={-30} y={-9} width={120} height={18} rx={6} fill="#C9A25A" />
    <rect x={60} y={0} width={14} height={30} fill="#C9A25A" />
    <rect x={84} y={0} width={14} height={22} fill="#C9A25A" />
    <circle cx={-60} cy={0} r={34} fill="none" stroke={INK} strokeWidth={4} />
  </g>
);

export const Dino: React.FC<{ x?: number; y?: number; scale?: number; broken?: boolean }> = ({ x = 540, y = 1200, scale = 1, broken = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={110} ry={62} fill="#4FBF7A" {...O} />
    <path d="M70 -30 q70 -90 120 -60 q-10 50 -60 70 Z" fill="#4FBF7A" {...O} />
    <circle cx={150} cy={-70} r={10} fill="#fff" stroke={INK} strokeWidth={3} />
    <circle cx={152} cy={-70} r={4} fill={INK} />
    {broken ? <path d="M-100 -10 L-150 -4 L-140 20 Z" fill="#2E8A52" {...O} /> : <path d="M-100 -10 q-120 10 -170 70" stroke="#4FBF7A" strokeWidth={30} fill="none" strokeLinecap="round" />}
    {[-50, 10].map((lx) => <rect key={lx} x={lx} y={40} width={34} height={50} rx={10} fill="#3FA868" {...O} />)}
    {[-40, -10, 20, 50].map((sx) => <polygon key={sx} points={`${sx},-55 ${sx + 14},-85 ${sx + 28},-55`} fill="#2E8A52" {...O} />)}
  </g>
);

export const Photo: React.FC<{ x?: number; y?: number; scale?: number; rotate?: number; zoom?: number }> = ({ x = 540, y = 1100, scale = 1, rotate = -6, zoom = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-220} y={-260} width={440} height={520} fill="#F4EEE2" {...O} />
    <clipPath id="photoClip"><rect x={-196} y={-236} width={392} height={400} /></clipPath>
    <g clipPath="url(#photoClip)" transform={`scale(${zoom})`} style={{ filter: "url(#sepia)" }}>
      <g transform="translate(-196 -236) scale(0.363)">
        <Kitchen />
      </g>
    </g>
    <rect x={-196} y={-236} width={392} height={400} fill="none" stroke={INK} strokeWidth={3} />
  </g>
);

/* ───────── Flashbacks (sepia) ───────── */
export const Kitchen: React.FC<{ boyScale?: number }> = ({ boyScale = 1 }) => (
  <g>
    <rect width={1080} height={1100} fill="#C9A77A" />
    <rect y={700} width={1080} height={400} fill="#8A6A48" />
    {/* window with light */}
    <rect x={140} y={120} width={420} height={400} fill="#F6E7B8" {...O} />
    <rect x={345} y={120} width={10} height={400} fill="#7A5A3A" />
    <rect x={140} y={315} width={420} height={10} fill="#7A5A3A" />
    <rect x={620} y={160} width={360} height={60} fill="#7A5A3A" {...O} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={640 + i * 85} y={90} width={40} height={70} rx={8} fill={["#D9553F", "#F2C14E", "#5F9E6E", "#3F7FBF"][i]} {...O} />)}
    {/* table */}
    <rect x={560} y={620} width={460} height={40} fill="#6B4A2C" {...O} />
    <rect x={590} y={660} width={30} height={240} fill="#6B4A2C" />
    <rect x={960} y={660} width={30} height={240} fill="#6B4A2C" />
    <circle cx={760} cy={600} r={60} fill="#F2E3C4" {...O} />
    {/* boy in yellow T-shirt */}
    <g transform={`translate(360 760) scale(${boyScale})`}>
      <rect x={-70} y={-40} width={140} height={200} rx={30} fill="#F2C94C" {...O} />
      <rect x={-30} y={150} width={24} height={110} fill="#4A6FA5" {...O} />
      <rect x={10} y={150} width={24} height={110} fill="#4A6FA5" {...O} />
      <circle cx={0} cy={-110} r={70} fill="#F1C7A3" {...O} />
      <path d="M-70 -120 a70 70 0 0 1 140 0 a90 50 0 0 0 -140 0" fill="#3B2A22" {...O} />
      <circle cx={-24} cy={-100} r={7} fill={INK} /><circle cx={24} cy={-100} r={7} fill={INK} />
      <path d="M-18 -70 q18 16 36 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

export const Village: React.FC<{ dinoDrop?: number }> = ({ dinoDrop = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill="#E9D6A8" />
    <circle cx={820} cy={380} r={120} fill="#F6E27A" />
    <rect y={1000} width={1080} height={920} fill="#8FB36A" />
    {Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M${i * 28} 1920 q10 -${60 + random(`g${i}`) * 80} 20 0`} stroke="#6F9A4C" strokeWidth={6} fill="none" />)}
    {/* house */}
    <rect x={120} y={640} width={520} height={380} fill="#B9825A" {...O} />
    <polygon points="90,640 380,420 670,640" fill="#7B4A2E" {...O} />
    <rect x={180} y={720} width={120} height={120} fill="#F6E7B8" {...O} />
    <rect x={440} y={720} width={120} height={120} fill="#F6E7B8" {...O} />
    <rect x={320} y={840} width={120} height={180} fill="#5A3A22" {...O} />
    {/* fence */}
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={700 + i * 34} y={900} width={16} height={120} fill="#D9C39A" {...O} />)}
    <rect x={700} y={930} width={400} height={12} fill="#D9C39A" {...O} />
    {/* boy + dino */}
    <g transform="translate(780 1300)">
      <rect x={-60} y={-30} width={120} height={170} rx={26} fill="#F2C94C" {...O} />
      <circle cx={0} cy={-90} r={60} fill="#F1C7A3" {...O} />
      <path d="M-60 -100 a60 60 0 0 1 120 0 a80 45 0 0 0 -120 0" fill="#3B2A22" {...O} />
    </g>
    <g transform={`translate(${560 + dinoDrop * 40} ${1240 + dinoDrop * 420}) rotate(${dinoDrop * 80})`}>
      <Dino scale={0.5} broken={dinoDrop > 0.9} />
    </g>
  </g>
);

export const KidRoom: React.FC<{ keyFade?: number; drawer?: number }> = ({ keyFade = 1, drawer = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill="#D8C19A" />
    <rect y={1100} width={1080} height={820} fill="#9A7A52" />
    <rect x={120} y={1000} width={840} height={60} fill="#7A5A3A" {...O} />
    <rect x={160} y={1060} width={760} height={300} fill="#8A6A48" {...O} />
    <rect x={200} y={1100 + drawer * 60} width={320} height={100} fill="#A7845C" {...O} />
    <rect x={560} y={1100} width={320} height={100} fill="#A7845C" {...O} />
    {/* diary */}
    <g transform="translate(540 880) rotate(-8)">
      <rect x={-140} y={-100} width={280} height={200} rx={12} fill="#7A3B3B" {...O} />
      <rect x={100} y={-40} width={40} height={80} rx={8} fill="#C9A25A" {...O} />
      <circle cx={120} cy={0} r={10} fill={INK} />
    </g>
    <g opacity={keyFade}>
      <Key x={720} y={930} scale={0.5} />
    </g>
  </g>
);

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="fridgeGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.6} />
      <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#fff" stopOpacity={0.3} />
    </linearGradient>
  </defs>
);
