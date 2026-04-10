import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Landing } from "./scenes/Scene2Landing";
import { Scene3Menu } from "./scenes/Scene3Menu";
import { Scene4Stores } from "./scenes/Scene4Stores";
import { Scene5Cartaxo } from "./scenes/Scene5Cartaxo";
import { Scene6Management } from "./scenes/Scene6Management";
import { Scene7Logistics } from "./scenes/Scene7Logistics";
import { Scene8Closing } from "./scenes/Scene8Closing";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const grainOpacity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.02, 0.04]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <TransitionSeries>
        {/* Scene 1: Brand intro */}
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 2: Landing page showcase */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene2Landing />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Menu & products */}
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene3Menu />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 4: Stores network */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene4Stores />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 5: Cartaxo announcement */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene5Cartaxo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6: Management system */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene6Management />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 7: Logistics flow */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene7Logistics />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 8: Closing */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene8Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          opacity: grainOpacity,
          background: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%) 0 0 / 4px 4px",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
