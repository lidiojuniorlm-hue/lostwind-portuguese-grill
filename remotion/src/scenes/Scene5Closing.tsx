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

export const Scene5Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo reveal with scale
  const logoS = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 60, mass: 2 } });
  const logoScale = interpolate(logoS, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Text reveals
  const brandOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brandY = interpolate(
    spring({ frame: frame - 40, fps, config: { damping: 20 } }),
    [0, 1],
    [30, 0]
  );

  const sloganOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = interpolate(
    spring({ frame: frame - 100, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1],
    [0.9, 1]
  );

  // Pulsing glow on logo
  const glowIntensity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.2, 0.5]);

  // Fade out at end
  const fadeOut = interpolate(frame, [145, 170], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #1a0d0d 100%)", opacity: fadeOut }}>
      {/* Radial glow behind logo */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(198,40,40,${glowIntensity}) 0%, transparent 70%)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Logo */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            border: "3px solid rgba(198, 40, 40, 0.5)",
            boxShadow: `0 0 60px rgba(198, 40, 40, ${glowIntensity})`,
          }}
        >
          <Img
            src={staticFile("images/logo-lostwind.jpeg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Brand */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 80,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 10,
            marginTop: 24,
            opacity: brandOpacity,
            transform: `translateY(${brandY}px)`,
          }}
        >
          LOST WIND
        </div>

        {/* Slogan */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 300,
            color: "#e53935",
            letterSpacing: 8,
            marginTop: 8,
            opacity: sloganOpacity,
            textTransform: "uppercase",
          }}
        >
          A Arte do Bom Grelhado
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 60,
            padding: "18px 48px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #c62828, #e53935)",
            fontFamily: oswald,
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 4,
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            boxShadow: "0 8px 32px rgba(198, 40, 40, 0.4)",
          }}
        >
          GESTÃO SIMPLIFICADA
        </div>
      </AbsoluteFill>

      {/* Red bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #c62828, transparent)",
          opacity: ctaOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #c62828, transparent)",
          opacity: ctaOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
