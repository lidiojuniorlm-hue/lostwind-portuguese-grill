import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { PhoneFrame } from "./PhoneFrame";

const { fontFamily: inter } = loadFont("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const SceneLanding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone enters from bottom
  const phoneY = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 80 } }),
    [0, 1],
    [400, 0]
  );
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Scroll the landing page image down
  const scrollY = interpolate(frame, [30, 70], [0, -200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Label
  const labelOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [15, 30], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Finger cursor dot
  const cursorOpacity = interpolate(frame, [35, 40, 65, 70], [0, 0.7, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [35, 65], [500, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ transform: `translateY(${phoneY}px)`, opacity: phoneOpacity }}>
        <PhoneFrame>
          <Img
            src={staticFile("images/mobile-landing.png")}
            style={{
              width: "100%",
              height: "auto",
              position: "absolute",
              top: 0,
              left: 0,
              transform: `translateY(${scrollY}px)`,
            }}
          />
          {/* Touch cursor */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: cursorY,
              transform: "translate(-50%, -50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)",
              opacity: cursorOpacity,
              zIndex: 50,
            }}
          />
        </PhoneFrame>
      </div>

      {/* Text label */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: `translateX(-50%) translateY(${labelY}px)`,
          opacity: labelOpacity,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 14, color: "#c62828", letterSpacing: 3, fontWeight: 600, marginBottom: 6 }}>
          LANDING PAGE
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
          lostwind-portuguese-grill.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
