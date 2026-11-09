import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Showcase, SHOWCASE_FRAMES } from "./showcase/Showcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
