import React from "react";

/**
 * Flat vector art for the Nightlight story. Everything is plain SVG in a
 * 1080×1920 viewBox so scenes compose by stacking groups.
 */

export const pal = {
  night: { wall: "#1A2140", wallDark: "#121832", floor: "#5A3E2B", floorLine: "#4A3222", trim: "#2B2F5C" },
  morning: { wall: "#C9D6EA", wallDark: "#B3C2DA", floor: "#B07A4E", floorLine: "#9A6840", trim: "#8FA3C8" },
  evening: { wall: "#3A2F55", wallDark: "#2C2342", floor: "#7A5236", floorLine: "#64422B", trim: "#4A3F6E" },
  skin: "#F6D2B5",
  hair: "#3B2A22",
  blanket: "#6A4FBF",
  blanketDark: "#5A41A6",
  pillow: "#F2EDE4",
  pillowShade: "#D9D2C6",
  bedWood: "#8A5A3A",
  bedWoodDark: "#6E4529",
  lamp: "#FFD27A",
  lampGlow: "#FFB347",
  figure: "#07080F",
  mum: { dress: "#7A5CA8", dressDark: "#654A90", hair: "#E9E4DA", skin: "#F3D7C2" },
  moon: "#F2EEDC",
  text: "#F4F1EA",
  accent: "#FFD23F",
  alert: "#FF4D4D",
};

export type Mode = "night" | "morning" | "evening";

export const Room: React.FC<{ mode?: Mode; children?: React.ReactNode }> = ({ mode = "night", children }) => {
  const p = pal[mode];
  return (
    <g>
      <rect width={1080} height={1920} fill={p.wall} />
      {/* subtle wallpaper dots */}
      {mode === "night" &&
        Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={(i * 173) % 1080} cy={(i * 271) % 1300} r={1.6} fill="#ffffff" opacity={0.18} />
        ))}
      {/* skirting + floor */}
      <rect y={1320} width={1080} height={600} fill={p.floor} />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} y={1320 + i * 68} width={1080} height={3} fill={p.floorLine} />
      ))}
      <rect y={1300} width={1080} height={26} fill={p.trim} />
      {children}
    </g>
  );
};

export const Window: React.FC<{ mode?: Mode; x?: number; y?: number }> = ({ mode = "night", x = 620, y = 360 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-18} y={-18} width={356} height={396} rx={10} fill={mode === "night" ? "#2E3568" : mode === "evening" ? "#5A4A80" : "#F2F5FA"} />
    <rect width={320} height={360} fill={mode === "night" ? "#0E1430" : mode === "evening" ? "#E07A4A" : "#9FD4F5"} />
    {mode === "evening" && <rect width={320} height={180} fill="#6B3F7A" opacity={0.7} />}
    {mode === "night" ? (
      <>
        <circle cx={230} cy={100} r={44} fill={pal.moon} />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={(i * 97) % 320} cy={(i * 131) % 360} r={2} fill="#fff" opacity={0.7} />
        ))}
      </>
    ) : mode === "evening" ? (
      <circle cx={80} cy={200} r={40} fill="#FFC27A" />
    ) : (
      <>
        <circle cx={240} cy={90} r={56} fill="#FFE98A" />
        <rect x={0} y={250} width={320} height={110} fill="#B9E3FF" opacity={0.6} />
      </>
    )}
    <rect x={156} width={10} height={360} fill={mode === "night" ? "#2E3568" : mode === "evening" ? "#5A4A80" : "#F2F5FA"} />
    <rect y={176} width={320} height={10} fill={mode === "night" ? "#2E3568" : mode === "evening" ? "#5A4A80" : "#F2F5FA"} />
  </g>
);

export const Door: React.FC<{ open?: number; light?: number; x?: number }> = ({ open = 0, light = 0, x = 90 }) => (
  <g transform={`translate(${x} 560)`}>
    <rect x={-14} y={-14} width={288} height={774} rx={8} fill="#3A2B4A" />
    <rect width={260} height={760} fill="#0A0C18" />
    {light > 0 && (
      <g opacity={light}>
        <polygon points="0,0 260,0 260,760 0,760" fill="#FFD98A" />
        <polygon points="260,0 760,760 260,760" fill="#FFD98A" opacity={0.45} />
      </g>
    )}
    <rect width={260 * (1 - open)} height={760} fill="#4E3A2B" />
    <rect x={24} y={30} width={212 * (1 - open)} height={300} fill="#5E4736" />
    <rect x={24} y={400} width={212 * (1 - open)} height={320} fill="#5E4736" />
    {open < 0.6 && <circle cx={230 * (1 - open)} cy={400} r={12} fill="#E3B341" />}
  </g>
);

export const Bed: React.FC<{ kidUp?: boolean; eyesOpen?: boolean; dent?: number; tilt?: number }> = ({
  kidUp = false,
  eyesOpen = false,
  dent = 0,
  tilt = 0,
}) => (
  <g transform={`translate(180 1120) rotate(${tilt} 360 300)`}>
    {/* headboard */}
    <rect x={0} y={0} width={720} height={160} rx={24} fill={pal.bedWood} />
    <rect x={0} y={120} width={720} height={40} fill={pal.bedWoodDark} />
    {/* mattress */}
    <rect x={20} y={150} width={680} height={420} rx={28} fill="#E8E1D4" />
    {/* pillow */}
    <g>
      <rect x={60} y={170} width={280} height={120} rx={40} fill={pal.pillow} />
    </g>
    {/* second pillow — where the visitor sat */}
    <rect x={380} y={170} width={280} height={120} rx={40} fill={pal.pillow} opacity={0.95} />
    {dent > 0 && <ellipse cx={520} cy={236} rx={90 * dent} ry={28 * dent} fill={pal.pillowShade} />}
    {/* blanket */}
    <path d="M20 330 H700 V540 a28 28 0 0 1 -28 28 H48 a28 28 0 0 1 -28 -28 Z" fill={pal.blanket} />
    <path d="M20 330 H700 V360 H20 Z" fill={pal.blanketDark} />
    {/* kid */}
    {kidUp ? (
      <g transform="translate(200 200)">
        <rect x={-50} y={60} width={100} height={110} rx={30} fill="#5EC2E8" />
        <circle cx={0} cy={0} r={70} fill={pal.skin} />
        <path d="M-70 -10 a70 70 0 0 1 140 0 a90 60 0 0 0 -140 0" fill={pal.hair} />
        <Eyes open={eyesOpen} scale={0.55} />
      </g>
    ) : (
      <g transform="translate(200 240)">
        <circle cx={0} cy={0} r={62} fill={pal.skin} />
        <path d="M-62 -10 a62 62 0 0 1 124 0 a80 50 0 0 0 -124 0" fill={pal.hair} />
        <Eyes open={eyesOpen} scale={0.5} />
      </g>
    )}
    {/* legs */}
    <rect x={40} y={560} width={40} height={90} fill={pal.bedWoodDark} />
    <rect x={640} y={560} width={40} height={90} fill={pal.bedWoodDark} />
  </g>
);

export const Eyes: React.FC<{ open?: boolean | number; scale?: number; squeeze?: number }> = ({
  open = false,
  scale = 1,
  squeeze = 0,
}) => {
  const o = typeof open === "number" ? open : open ? 1 : 0;
  return (
    <g transform={`scale(${scale})`}>
      {[-36, 36].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          {o > 0.05 ? (
            <>
              <ellipse cx={0} cy={0} rx={22} ry={22 * o} fill="#fff" />
              <circle cx={0} cy={0} r={10 * o} fill="#1A1A1A" />
            </>
          ) : (
            <path
              d={`M-24 ${squeeze * 4} q24 ${14 + squeeze * 10} 48 0`}
              stroke="#1A1A1A"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </g>
  );
};

export const Nightlight: React.FC<{ on?: number; x?: number; y?: number }> = ({ on = 1, x = 940, y = 1250 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={-30} r={320} fill={pal.lampGlow} opacity={0.09 * on} />
    <circle cx={0} cy={-30} r={160} fill={pal.lampGlow} opacity={0.16 * on} />
    <rect x={-60} y={40} width={120} height={60} rx={8} fill="#3B2F4F" />
    <rect x={-90} y={94} width={180} height={14} rx={4} fill="#2C2440" />
    <rect x={-16} y={-10} width={32} height={60} fill="#5C5176" />
    <path d="M-60 -10 L-36 -90 H36 L60 -10 Z" fill={on > 0.3 ? pal.lamp : "#6B6250"} />
    <circle cx={0} cy={-70} r={14} fill={on > 0.3 ? "#FFF4CC" : "#4A4430"} />
  </g>
);

/** Tall dark visitor sitting on the bed edge, back to the camera. */
export const Visitor: React.FC<{ opacity?: number; headTurn?: number; x?: number; y?: number }> = ({
  opacity = 1,
  headTurn = 0,
  x = 640,
  y = 1180,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-90} y={0} width={180} height={300} rx={40} fill={pal.figure} />
    {/* long arms resting on knees */}
    <path d="M-80 60 q-120 160 -60 320" stroke={pal.figure} strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M80 60 q120 160 60 320" stroke={pal.figure} strokeWidth={34} fill="none" strokeLinecap="round" />
    {/* neck + head */}
    <rect x={-22} y={-120} width={44} height={130} fill={pal.figure} />
    <g transform={`translate(0 -160) rotate(${headTurn})`}>
      <ellipse cx={0} cy={0} rx={70} ry={86} fill={pal.figure} />
      {headTurn !== 0 && (
        <>
          <circle cx={30} cy={-10} r={6} fill="#C9D3FF" opacity={0.9} />
          <circle cx={54} cy={-14} r={6} fill="#C9D3FF" opacity={0.9} />
        </>
      )}
    </g>
  </g>
);

export const Mum: React.FC<{ smile?: number; x?: number; y?: number; scale?: number; eyesOpen?: boolean }> = ({
  smile = 0.3,
  x = 760,
  y = 980,
  scale = 1,
  eyesOpen = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-120 420 q0 -300 120 -300 q120 0 120 300 Z" fill={pal.mum.dress} />
    <rect x={-120} y={400} width={240} height={260} fill={pal.mum.dress} />
    <rect x={-120} y={400} width={240} height={30} fill={pal.mum.dressDark} />
    {/* arms */}
    <path d="M-110 200 q-60 120 -10 200" stroke={pal.mum.skin} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M110 200 q60 120 10 200" stroke={pal.mum.skin} strokeWidth={30} fill="none" strokeLinecap="round" />
    {/* head */}
    <circle cx={0} cy={0} r={96} fill={pal.mum.skin} />
    <path d="M-96 -16 a96 96 0 0 1 192 0 a120 70 0 0 0 -192 0" fill={pal.mum.hair} />
    <circle cx={0} cy={-110} r={34} fill={pal.mum.hair} />
    <g transform="translate(0 -6)">
      <Eyes open={eyesOpen} scale={0.8} />
    </g>
    {/* mouth: smile grows with `smile` */}
    <path
      d={`M${-26 - smile * 30} 40 q${26 + smile * 30} ${30 + smile * 50} ${52 + smile * 60} 0`}
      stroke="#8A3B3B"
      strokeWidth={6}
      fill={smile > 0.6 ? "#3A0F0F" : "none"}
      strokeLinecap="round"
    />
    {smile > 0.6 && (
      <g opacity={(smile - 0.6) / 0.4}>
        {Array.from({ length: 7 }).map((_, i) => (
          <polygon key={i} points={`${-42 + i * 14},44 ${-35 + i * 14},44 ${-38.5 + i * 14},62`} fill="#fff" />
        ))}
      </g>
    )}
    <circle cx={-60} cy={20} r={10} fill="#F0A8A0" opacity={0.6} />
    <circle cx={60} cy={20} r={10} fill="#F0A8A0" opacity={0.6} />
  </g>
);

/** Close-up of the kid's face filling the frame. */
export const KidFace: React.FC<{ eyesOpen?: number; squeeze?: number }> = ({ eyesOpen = 0, squeeze = 0 }) => (
  <g transform="translate(540 900)">
    <circle cx={0} cy={0} r={380} fill={pal.skin} />
    <path d="M-380 -60 a380 380 0 0 1 760 0 a470 300 0 0 0 -760 0" fill={pal.hair} />
    <g transform="translate(0 30)">
      <Eyes open={eyesOpen} scale={3.2} squeeze={squeeze} />
    </g>
    <path d="M-40 200 q40 30 80 0" stroke="#A86A5A" strokeWidth={10} fill="none" strokeLinecap="round" />
    <circle cx={-200} cy={120} r={40} fill="#F0A8A0" opacity={0.5} />
    <circle cx={200} cy={120} r={40} fill="#F0A8A0" opacity={0.5} />
  </g>
);

/** Long dark fingers reaching down onto the eyelids. */
export const Fingers: React.FC<{ reach: number }> = ({ reach }) => {
  const y = -900 + reach * 1310;
  return (
    <g transform={`translate(540 ${y})`}>
      <rect x={-60} y={-600} width={120} height={700} fill={pal.figure} />
      {[-150, -75, 0, 75, 150].map((x, i) => (
        <path
          key={i}
          d={`M${x * 0.5} 80 Q${x} 300 ${x} ${540 + (i === 2 ? 40 : 0)}`}
          stroke={pal.figure}
          strokeWidth={34}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

/** Sound ripples (like a voice) centred at a point. */
export const Ripples: React.FC<{ t: number; x: number; y: number; color?: string }> = ({ t, x, y, color = "#C9D3FF" }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.8 + i / 3) % 1;
      return <circle key={i} cx={x} cy={y} r={40 + p * 260} stroke={color} strokeWidth={4} fill="none" opacity={(1 - p) * 0.5} />;
    })}
  </g>
);


/** Kid sitting up holding a phone; ripples mark the voice on the line. */
export const Phone: React.FC<{ x?: number; y?: number }> = ({ x = 300, y = 1290 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-22} y={-60} width={44} height={84} rx={8} fill="#1C1C24" />
    <rect x={-16} y={-52} width={32} height={60} rx={4} fill="#9FD4F5" opacity={0.9} />
  </g>
);

/** Fingers reaching in from the side to the cheek. */
export const SideFingers: React.FC<{ reach: number }> = ({ reach }) => {
  const x = 1500 - reach * 700;
  return (
    <g transform={`translate(${x} 980)`}>
      <rect x={0} y={-60} width={700} height={120} fill={pal.figure} />
      {[-110, -55, 0, 55, 110].map((yy, i) => (
        <path key={i} d={`M60 ${yy * 0.5} Q-200 ${yy} -${440 + (i === 2 ? 40 : 0)} ${yy}`} stroke={pal.figure} strokeWidth={34} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

/** Mum as a dark silhouette in the doorway, lit from behind. */
export const DoorwayMum: React.FC<{ x?: number; y?: number; smile?: number }> = ({ x = 220, y = 900, smile = 0.4 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-100 420 q0 -300 100 -300 q100 0 100 300 Z" fill="#241A33" />
    <rect x={-100} y={400} width={200} height={240} fill="#241A33" />
    <circle cx={0} cy={0} r={82} fill="#2E2240" />
    <circle cx={0} cy={-96} r={30} fill="#2E2240" />
    <path d={`M${-22 - smile * 26} 30 q${22 + smile * 26} ${26 + smile * 40} ${44 + smile * 52} 0`} stroke="#F4EEDC" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
  </g>
);

/* ───────── Part 3 props ───────── */

/** Corridor seen from inside: warm walls, the bedroom door on the right, a lamp glow. */
export const Corridor: React.FC<{ children?: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill="#5A4636" />
    <rect y={1320} width={1080} height={600} fill="#3E2C20" />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} y={1320 + i * 68} width={1080} height={3} fill="#33241A" />
    ))}
    <rect y={1300} width={1080} height={26} fill="#6E5848" />
    {/* ceiling lamp glow */}
    <circle cx={540} cy={200} r={520} fill="#FFD27A" opacity={0.18} />
    <circle cx={540} cy={200} r={220} fill="#FFE9B0" opacity={0.25} />
    {children}
    <rect width={1080} height={1920} fill="#07080F" opacity={dim} />
  </g>
);

/** The bedroom door seen from the corridor (closed, wood), with an optional light strip underneath. */
export const CorridorDoor: React.FC<{ x?: number; strip?: number; shake?: number; open?: number }> = ({
  x = 410,
  strip = 0,
  shake = 0,
  open = 0,
}) => (
  <g transform={`translate(${x + shake} 540)`}>
    <rect x={-16} y={-16} width={292} height={790} rx={8} fill="#3B2A1E" />
    <rect width={260} height={760} fill="#0B0D1A" />
    <rect width={260 * (1 - open)} height={760} fill="#7A5A3C" />
    <rect x={24} y={30} width={212 * (1 - open)} height={300} fill="#8A6A48" />
    <rect x={24} y={400} width={212 * (1 - open)} height={320} fill="#8A6A48" />
    {open < 0.6 && <circle cx={34} cy={400} r={12} fill="#E3B341" />}
    {strip > 0 && (
      <>
        <rect x={0} y={756} width={260} height={10} fill="#FFD27A" opacity={strip} />
        <rect x={-40} y={760} width={340} height={70} fill="#FFD27A" opacity={strip * 0.25} />
      </>
    )}
  </g>
);

/** Mum holding the kid against her; the kid's eyes stay shut. */
export const Hug: React.FC<{ x?: number; y?: number; tight?: number; scale?: number }> = ({
  x = 540,
  y = 980,
  tight = 0,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* mum body */}
    <path d="M-150 460 q0 -340 150 -340 q150 0 150 340 Z" fill={pal.mum.dress} />
    <rect x={-150} y={440} width={300} height={300} fill={pal.mum.dress} />
    <circle cx={0} cy={0} r={100} fill={pal.mum.skin} />
    <path d="M-100 -16 a100 100 0 0 1 200 0 a125 70 0 0 0 -200 0" fill={pal.mum.hair} />
    <circle cx={0} cy={-114} r={36} fill={pal.mum.hair} />
    <Eyes open={false} scale={0.8} />
    {/* kid, face to her chest */}
    <g transform={`translate(0 ${300 - tight * 10})`}>
      <rect x={-60} y={40} width={120} height={120} rx={36} fill="#5EC2E8" />
      <circle cx={0} cy={0} r={78} fill={pal.skin} />
      <path d="M-78 -10 a78 78 0 0 1 156 0 a100 60 0 0 0 -156 0" fill={pal.hair} />
      <g transform="translate(0 10)">
        <Eyes open={false} scale={0.62} squeeze={1} />
      </g>
    </g>
    {/* mum arms around the kid */}
    <path d={`M-150 240 q-${60 + tight * 30} 180 120 ${200 - tight * 20}`} stroke={pal.mum.skin} strokeWidth={38} fill="none" strokeLinecap="round" />
    <path d={`M150 240 q${60 + tight * 30} 180 -120 ${200 - tight * 20}`} stroke={pal.mum.skin} strokeWidth={38} fill="none" strokeLinecap="round" />
  </g>
);

/** Kid crawling on the floor, eyes shut, seen from the side. */
export const Crawl: React.FC<{ x?: number; y?: number; phase?: number }> = ({ x = 420, y = 1380, phase = 0 }) => {
  const a = Math.sin(phase * Math.PI * 2) * 12;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-140} y={-10} width={220} height={90} rx={40} fill="#5EC2E8" />
      <path d={`M-120 70 q-30 60 ${-60 + a} 80`} stroke="#5EC2E8" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M40 70 q10 60 ${60 - a} 80`} stroke={pal.skin} strokeWidth={30} fill="none" strokeLinecap="round" />
      <g transform="translate(110 -10)">
        <circle cx={0} cy={0} r={64} fill={pal.skin} />
        <path d="M-64 -10 a64 64 0 0 1 128 0 a82 50 0 0 0 -128 0" fill={pal.hair} />
        <g transform="translate(10 6)">
          <Eyes open={false} scale={0.5} squeeze={1} />
        </g>
      </g>
    </g>
  );
};

/** A small hand reaching for a door knob; close-up. */
export const Knob: React.FC<{ reach: number; jitter?: number }> = ({ reach, jitter = 0 }) => (
  <g transform={`translate(${jitter} 0)`}>
    <rect width={1080} height={1920} fill="#5A4030" />
    <rect x={0} y={0} width={1080} height={1920} fill="#6E4F3A" />
    <rect x={120} y={120} width={840} height={1680} rx={24} fill="#7E5C42" />
    <circle cx={540} cy={960} r={120} fill="#E3B341" />
    <circle cx={540} cy={960} r={80} fill="#C9972C" />
    {/* hand from the left */}
    <g transform={`translate(${-420 + reach * 760} 1010)`}>
      <rect x={-600} y={-70} width={620} height={150} rx={60} fill={pal.skin} />
      {[-50, -15, 20, 55].map((yy, i) => (
        <path key={i} d={`M0 ${yy} q110 ${-10 + i * 4} ${150 + (i === 1 ? 30 : 0)} ${yy + 10}`} stroke={pal.skin} strokeWidth={40} fill="none" strokeLinecap="round" />
      ))}
    </g>
  </g>
);

/** Dark shadow on the floor creeping toward the camera. */
export const Shadow: React.FC<{ size: number }> = ({ size }) => (
  <ellipse cx={540} cy={1700} rx={200 + size * 500} ry={60 + size * 200} fill="#000" opacity={0.65} />
);

/** Warm arms reaching in from the light to pull the kid through. */
export const WarmArms: React.FC<{ reach: number }> = ({ reach }) => {
  const x = -700 + reach * 700;
  return (
    <g transform={`translate(${x} 0)`}>
      {[880, 1040].map((yy, i) => (
        <path key={i} d={`M-100 ${yy} q400 ${i ? 60 : -60} 760 ${yy + (i ? -40 : 40)}`} stroke={pal.mum.skin} strokeWidth={70} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

/* ───────── Part 4 props ───────── */

/** The double: the kid standing in pyjamas, eyes shut, holding the nightlight. */
export const Double: React.FC<{ x?: number; y?: number; scale?: number; lamp?: number; offer?: number }> = ({
  x = 540, y = 1000, scale = 1, lamp = 1, offer = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-70} y={60} width={140} height={220} rx={34} fill="#5EC2E8" />
    <rect x={-50} y={280} width={40} height={120} rx={12} fill="#4A9CC0" />
    <rect x={10} y={280} width={40} height={120} rx={12} fill="#4A9CC0" />
    <circle cx={0} cy={0} r={78} fill={pal.skin} />
    <path d="M-78 -10 a78 78 0 0 1 156 0 a100 60 0 0 0 -156 0" fill={pal.hair} />
    <g transform="translate(0 10)"><Eyes open={false} scale={0.62} /></g>
    {/* arms holding the lamp out */}
    <path d={`M-60 110 q-20 ${80 + offer * 40} ${40 + offer * 90} ${150 - offer * 60}`} stroke={pal.skin} strokeWidth={28} fill="none" strokeLinecap="round" />
    <path d={`M60 110 q20 ${80 + offer * 40} ${-40 + offer * 90} ${150 - offer * 60}`} stroke={pal.skin} strokeWidth={28} fill="none" strokeLinecap="round" />
    <g transform={`translate(${offer * 90} ${250 - offer * 60}) scale(0.55)`}>
      <Nightlight x={0} y={0} on={lamp} />
    </g>
  </g>
);

/** Kid on the corridor floor, propped on one arm, eyes shut. */
export const Fallen: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 420, y = 1500, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-150} y={-40} width={240} height={100} rx={44} fill="#5EC2E8" />
    <path d="M-120 50 q-40 50 -70 90" stroke="#5EC2E8" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M60 40 q20 60 50 110" stroke={pal.skin} strokeWidth={28} fill="none" strokeLinecap="round" />
    <g transform="translate(120 -70)">
      <circle cx={0} cy={0} r={66} fill={pal.skin} />
      <path d="M-66 -10 a66 66 0 0 1 132 0 a84 50 0 0 0 -132 0" fill={pal.hair} />
      <g transform="translate(6 8)"><Eyes open={false} scale={0.52} squeeze={1} /></g>
    </g>
  </g>
);
