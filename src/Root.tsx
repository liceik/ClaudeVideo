import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Showcase, SHOWCASE_FRAMES } from "./showcase/Showcase";
import { Story, STORY_FPS, STORY_FRAMES } from "./story/Story";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Nightlight" component={Story} durationInFrames={STORY_FRAMES} fps={STORY_FPS} width={1080} height={1920} />
      <Composition
        id="Showcase"
        component={Showcase}
        durationInFrames={SHOWCASE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
