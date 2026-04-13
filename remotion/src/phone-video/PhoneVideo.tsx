import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SceneLanding } from "./SceneLanding";
import { SceneLogin } from "./SceneLogin";
import { SceneOrders } from "./SceneOrders";
import { SceneNewOrder } from "./SceneNewOrder";
import { SceneAdminOrder } from "./SceneAdminOrder";
import { SceneClosing } from "./SceneClosing";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700", "400"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const PhoneVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Background ambient glow
  const glowX = interpolate(Math.sin(frame * 0.015), [-1, 1], [30, 70]);
  const glowY = interpolate(Math.cos(frame * 0.012), [-1, 1], [20, 80]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${glowX}% ${glowY}%, rgba(198,40,40,0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(255,100,50,0.06) 0%, transparent 50%),
          linear-gradient(180deg, #080808 0%, #0d0808 50%, #080808 100%)
        `,
      }}
    >
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => {
        const x = interpolate(Math.sin(frame * 0.008 + i * 1.2), [-1, 1], [5, 95]);
        const y = interpolate(Math.cos(frame * 0.006 + i * 0.9), [-1, 1], [5, 95]);
        const opacity = interpolate(Math.sin(frame * 0.02 + i), [-1, 1], [0.02, 0.08]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 3 + i * 0.5,
              height: 3 + i * 0.5,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#c62828" : "#ff6b35",
              opacity,
              filter: "blur(1px)",
            }}
          />
        );
      })}

      {/* Scene 1: Landing page with scroll (0-80) */}
      <Sequence from={0} durationInFrames={80}>
        <SceneLanding />
      </Sequence>

      {/* Scene 2: Login (80-160) */}
      <Sequence from={80} durationInFrames={80}>
        <SceneLogin />
      </Sequence>

      {/* Scene 3: Employee orders page (160-220) */}
      <Sequence from={160} durationInFrames={60}>
        <SceneOrders />
      </Sequence>

      {/* Scene 4: Creating new order (220-310) */}
      <Sequence from={220} durationInFrames={90}>
        <SceneNewOrder />
      </Sequence>

      {/* Scene 5: Admin sees order, changes status (310-390) */}
      <Sequence from={310} durationInFrames={80}>
        <SceneAdminOrder />
      </Sequence>

      {/* Scene 6: Closing brand (390-450) */}
      <Sequence from={390} durationInFrames={60}>
        <SceneClosing />
      </Sequence>

      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
