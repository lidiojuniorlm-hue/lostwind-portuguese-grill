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

export const Scene2Landing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Label reveal
  const labelOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Screenshot zoom-in (Ken Burns)
  const imgScale = interpolate(frame, [10, 180], [1.15, 1.0]);
  const imgX = interpolate(frame, [10, 180], [20, -10]);
  const imgY = interpolate(frame, [10, 180], [10, -5]);
  const imgOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Frame/border
  const borderProgress = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } });

  // Text callouts
  const callout1 = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const callout2 = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const callout3 = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0f0f 100%)" }}>
      {/* Title label */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 80,
          opacity: labelOpacity,
          zIndex: 10,
        }}
      >
        <div style={{ fontFamily: oswald, fontSize: 16, color: "#e53935", letterSpacing: 6, marginBottom: 8 }}>
          WEBSITE OFICIAL
        </div>
        <div style={{ fontFamily: oswald, fontSize: 48, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
          A NOSSA
        </div>
        <div style={{ fontFamily: oswald, fontSize: 48, color: "rgba(255,255,255,0.3)", letterSpacing: 2, lineHeight: 1 }}>
          PRESENÇA ONLINE
        </div>
      </div>

      {/* Screenshot with perspective */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 60,
          width: 1100,
          height: 650,
          borderRadius: 16,
          overflow: "hidden",
          border: `2px solid rgba(198,40,40,${0.3 * borderProgress})`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(198,40,40,${0.15 * borderProgress})`,
          opacity: imgOpacity,
          transform: `perspective(2000px) rotateY(-3deg) rotateX(1deg)`,
        }}
      >
        <Img
          src={staticFile("images/screenshot-hero.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale}) translate(${imgX}px, ${imgY}px)`,
          }}
        />
      </div>

      {/* Feature callouts at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          display: "flex",
          gap: 40,
        }}
      >
        {[
          { label: "Takeaway & Delivery", icon: "🔥", opacity: callout1 },
          { label: "Menu Completo Online", icon: "📋", opacity: callout2 },
          { label: "9 Lojas no Mapa", icon: "📍", opacity: callout3 },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              opacity: item.opacity,
              transform: `translateY(${interpolate(item.opacity, [0, 1], [20, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Narration text overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 80,
          maxWidth: 500,
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300 }}>
          "O nosso site apresenta todas as lojas, menu completo e sistema de entregas — tudo ao alcance do cliente."
        </div>
      </div>
    </AbsoluteFill>
  );
};
