import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4Stores } from "./scenes/Scene4Stores";
import { Scene5Closing } from "./scenes/Scene5Closing";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Persistent subtle grain overlay
  const grainOpacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.02, 0.05]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Stores />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          opacity: grainOpacity,
          background:
            "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%) 0 0 / 4px 4px",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
