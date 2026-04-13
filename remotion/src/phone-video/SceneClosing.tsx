import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 80 } });
  const textOpacity = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glowing red line
  const lineWidth = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 60 } }),
    [0, 1], [0, 200]
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(198,40,40,0.08) 0%, transparent 60%), #080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      <Img
        src={staticFile("images/logo-gestao-red.png")}
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          transform: `scale(${logoScale})`,
          border: "3px solid rgba(198,40,40,0.3)",
          boxShadow: "0 0 40px rgba(198,40,40,0.2)",
          marginBottom: 20,
        }}
      />

      {/* Brand name */}
      <div
        style={{
          fontFamily: oswald,
          fontSize: 38,
          color: "#fff",
          letterSpacing: 4,
          opacity: textOpacity,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        LOST WIND
      </div>

      {/* Red line */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: "linear-gradient(90deg, transparent, #c62828, transparent)",
          margin: "14px 0",
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          opacity: subtitleOpacity,
          textAlign: "center",
          letterSpacing: 2,
        }}
      >
        SISTEMA DE GESTÃO
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          opacity: taglineOpacity,
          textAlign: "center",
          marginTop: 20,
          maxWidth: 300,
          lineHeight: 1.6,
        }}
      >
        Mais controlo. Mais organização.{"\n"}A logística que a sua marca merece.
      </div>

      {/* "Em breve novidades" */}
      <div
        style={{
          fontFamily: inter,
          fontSize: 12,
          color: "#c62828",
          fontWeight: 600,
          letterSpacing: 3,
          marginTop: 30,
          opacity: interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        EM BREVE NOVIDADES 🔥
      </div>
    </AbsoluteFill>
  );
};
