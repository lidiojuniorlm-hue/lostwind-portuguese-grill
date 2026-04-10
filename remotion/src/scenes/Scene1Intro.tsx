import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "300"], subsets: ["latin"] });

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic red line sweep
  const lineWidth = interpolate(frame, [0, 50], [0, 1920], { extrapolateRight: "clamp" });

  // Logo reveal
  const logoProgress = spring({ frame: frame - 15, fps, config: { damping: 12, stiffness: 60 } });
  const logoOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  // Title characters stagger
  const titleY = interpolate(
    spring({ frame: frame - 40, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1], [80, 0]
  );
  const titleOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subY = interpolate(frame, [65, 85], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline
  const tagOpacity = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "9 Lojas" counter
  const counterOpacity = interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const counterScale = spring({ frame: frame - 120, fps, config: { damping: 15, stiffness: 200 } });

  // Subtle camera drift
  const bgX = interpolate(frame, [0, 200], [0, -40]);
  const bgY = interpolate(frame, [0, 200], [0, -15]);

  // Pulsing glow
  const glowOpacity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.15, 0.35]);

  return (
    <AbsoluteFill>
      {/* Deep cinematic background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 50%, #2a0a0a 0%, #0d0d0d 50%, #000000 100%)`,
          transform: `translate(${bgX}px, ${bgY}px) scale(1.1)`,
        }}
      />

      {/* Animated glow behind logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,40,40,0.25) 0%, transparent 70%)",
          transform: "translate(-50%, -55%)",
          opacity: glowOpacity,
        }}
      />

      {/* Top red accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: lineWidth,
          height: 5,
          background: "linear-gradient(90deg, #c62828, #e53935, #ff5722)",
        }}
      />

      {/* Center content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Logo */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            border: "4px solid rgba(198, 40, 40, 0.6)",
            boxShadow: "0 0 100px rgba(198, 40, 40, 0.4), 0 0 200px rgba(198, 40, 40, 0.15)",
          }}
        >
          <Img src={staticFile("images/logo-lostwind.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 110,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 14,
            marginTop: 25,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textShadow: "0 4px 40px rgba(198,40,40,0.3)",
          }}
        >
          LOST WIND
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 30,
            fontWeight: 300,
            color: "#e53935",
            letterSpacing: 8,
            marginTop: 4,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          CHURRASQUEIRA PORTUGUESA
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
            marginTop: 20,
            opacity: tagOpacity,
            fontStyle: "italic",
            letterSpacing: 2,
          }}
        >
          A Arte do Bom Grelhado
        </div>

        {/* 9 Lojas badge */}
        <div
          style={{
            marginTop: 40,
            opacity: counterOpacity,
            transform: `scale(${counterScale})`,
            display: "flex",
            gap: 30,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e53935" }} />
            <div style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.5)", letterSpacing: 4 }}>
              9 LOJAS
            </div>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5722" }} />
            <div style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.5)", letterSpacing: 4 }}>
              1 ARMAZÉM
            </div>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffc107" }} />
            <div style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.5)", letterSpacing: 4 }}>
              DESDE 2018
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom red bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: lineWidth * 0.5,
          height: 3,
          background: "linear-gradient(270deg, #c62828, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
