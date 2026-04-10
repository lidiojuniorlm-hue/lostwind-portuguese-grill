import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "300"], subsets: ["latin"] });

const PROBLEMS = [
  { icon: "📦", text: "Pedidos desorganizados" },
  { icon: "📋", text: "Controlo manual de stock" },
  { icon: "⏰", text: "Entregas atrasadas" },
  { icon: "💸", text: "Perdas por validade expirada" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleX = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1],
    [-80, 0]
  );

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #1a1a1a 0%, #121212 100%)" }}>
      {/* Red vertical accent */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, transparent, #c62828, transparent)",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 140,
          fontFamily: oswald,
          fontSize: 56,
          fontWeight: 700,
          color: "#fff",
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          letterSpacing: 3,
        }}
      >
        O DESAFIO
      </div>
      <div
        style={{
          position: "absolute",
          top: 185,
          left: 140,
          fontFamily: inter,
          fontSize: 20,
          fontWeight: 300,
          color: "rgba(255,255,255,0.4)",
          opacity: titleOpacity,
          letterSpacing: 2,
        }}
      >
        GERIR MÚLTIPLAS LOJAS É COMPLEXO
      </div>

      {/* Problem cards */}
      {PROBLEMS.map((problem, i) => {
        const delay = 30 + i * 20;
        const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
        const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const cardY = interpolate(s, [0, 1], [40, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 300 + i * 110,
              left: 140,
              right: 400,
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: cardOpacity,
              transform: `translateY(${cardY}px)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "rgba(198, 40, 40, 0.15)",
                border: "1px solid rgba(198, 40, 40, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              {problem.icon}
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 28,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 400,
              }}
            >
              {problem.text}
            </div>
          </div>
        );
      })}

      {/* Right side - big X mark */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 200 }}>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 300,
            fontWeight: 700,
            color: "rgba(198, 40, 40, 0.08)",
            transform: `rotate(${interpolate(frame, [0, 150], [-5, 5])}deg)`,
          }}
        >
          ✕
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
