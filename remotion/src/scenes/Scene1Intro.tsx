import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
  Img,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "300"], subsets: ["latin"] });

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red accent bar slides in
  const barWidth = interpolate(frame, [0, 40], [0, 1920], { extrapolateRight: "clamp" });

  // Logo appears
  const logoScale = spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Brand name
  const nameY = interpolate(
    spring({ frame: frame - 50, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1],
    [60, 0]
  );
  const nameOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline
  const tagOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [80, 100], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle bg movement
  const bgX = interpolate(frame, [0, 180], [0, -30]);

  return (
    <AbsoluteFill>
      {/* Dark gradient bg */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 40%, #2a1a1a 100%)`,
          transform: `translateX(${bgX}px)`,
        }}
      />

      {/* Red accent bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: barWidth,
          height: 6,
          background: "linear-gradient(90deg, #c62828, #e53935)",
        }}
      />

      {/* Center content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Logo circle */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            border: "4px solid rgba(198, 40, 40, 0.5)",
            boxShadow: "0 0 80px rgba(198, 40, 40, 0.3)",
          }}
        >
          <Img
            src={staticFile("images/logo-lostwind.jpeg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Brand name */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 12,
            marginTop: 30,
            transform: `translateY(${nameY}px)`,
            opacity: nameOpacity,
            textTransform: "uppercase",
          }}
        >
          LOST WIND
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 300,
            color: "#e53935",
            letterSpacing: 6,
            marginTop: 8,
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            textTransform: "uppercase",
          }}
        >
          Churrasqueira Portuguesa
        </div>

        {/* Subtitle */}
        <Sequence from={110}>
          <div
            style={{
              position: "absolute",
              bottom: 140,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: inter,
              fontSize: 22,
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
              opacity: subOpacity,
              letterSpacing: 3,
            }}
          >
            SISTEMA DE GESTÃO INTELIGENTE
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Bottom red bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: barWidth * 0.6,
          height: 4,
          background: "linear-gradient(270deg, #c62828, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
