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

export const Scene5Cartaxo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big dramatic "EM BREVE" text
  const emBreveScale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 80 } });
  const emBreveOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cartaxo name
  const cartaxoY = interpolate(
    spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 120 } }),
    [0, 1], [60, 0]
  );
  const cartaxoOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Description
  const descOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulsing ring
  const ringScale = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.95, 1.05]);
  const ringOpacity = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 0.6]);

  // Badge
  const badgeOpacity = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0808 50%, #0d0d0d 100%)" }}>
      {/* Large pulsing ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "2px solid rgba(198,40,40,0.15)",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: "1px solid rgba(198,40,40,0.08)",
          transform: `translate(-50%, -50%) scale(${ringScale * 1.1})`,
          opacity: ringOpacity * 0.5,
        }}
      />

      {/* Center content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* EM BREVE label */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 22,
            fontWeight: 700,
            color: "#ffc107",
            letterSpacing: 10,
            opacity: emBreveOpacity,
            transform: `scale(${emBreveScale})`,
            padding: "8px 30px",
            borderRadius: 8,
            border: "1px solid rgba(255,193,7,0.3)",
            background: "rgba(255,193,7,0.08)",
          }}
        >
          🏗️  EM BREVE
        </div>

        {/* City name */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 130,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 8,
            marginTop: 20,
            transform: `translateY(${cartaxoY}px)`,
            opacity: cartaxoOpacity,
            textShadow: "0 4px 60px rgba(198,40,40,0.3)",
          }}
        >
          CARTAXO
        </div>

        {/* Description */}
        <div
          style={{
            maxWidth: 700,
            textAlign: "center",
            marginTop: 20,
            opacity: descOpacity,
          }}
        >
          <div style={{ fontFamily: inter, fontSize: 24, color: "rgba(255,255,255,0.6)", fontWeight: 300, lineHeight: 1.6 }}>
            A nova loja Lost Wind está a chegar ao Cartaxo.
          </div>
          <div style={{ fontFamily: inter, fontSize: 20, color: "rgba(255,255,255,0.35)", fontWeight: 300, marginTop: 10 }}>
            Mais uma localização para servir os nossos clientes com a qualidade de sempre.
          </div>
        </div>

        {/* Badge: "10ª Loja" */}
        <div
          style={{
            marginTop: 40,
            opacity: badgeOpacity,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 32px",
            borderRadius: 14,
            background: "rgba(198,40,40,0.1)",
            border: "1px solid rgba(198,40,40,0.25)",
          }}
        >
          <div style={{ fontFamily: oswald, fontSize: 48, color: "#e53935", fontWeight: 700 }}>10ª</div>
          <div>
            <div style={{ fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>LOJA</div>
            <div style={{ fontFamily: inter, fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>DA REDE LOST WIND</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
