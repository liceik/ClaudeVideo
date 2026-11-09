import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./Background";
import { SceneChart, SceneKinetic, SceneList, SceneOutro, SceneStack, SceneTitle } from "./scenes";

// 30 s @ 30 fps = 900 frames. Scene lengths in frames; they sum to 900.
export const SHOWCASE_FRAMES = 900;

const scenes: { dur: number; hue: "orange" | "blue" | "green"; C: React.FC<{ duration: number }> }[] = [
  { dur: 105, hue: "orange", C: SceneTitle }, // 3.5 s
  { dur: 165, hue: "green", C: SceneStack }, // 5.5 s
  { dur: 210, hue: "blue", C: SceneList }, // 7.0 s
  { dur: 180, hue: "blue", C: SceneChart }, // 6.0 s
  { dur: 150, hue: "orange", C: SceneKinetic }, // 5.0 s
  { dur: 90, hue: "orange", C: SceneOutro }, // 3.0 s
];

export const Showcase: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {scenes.map(({ dur, hue, C }, i) => {
        const start = from;
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            {C !== SceneKinetic && <Background hue={hue} />}
            <C duration={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
