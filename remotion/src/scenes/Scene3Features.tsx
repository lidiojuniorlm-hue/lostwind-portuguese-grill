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

const FEATURES = [
  { icon: "🛒", title: "Pedidos Digitais", desc: "Lojas fazem pedidos ao armazém em tempo real" },
  { icon: "📊", title: "Dashboard Inteligente", desc: "Visão completa de stock, pedidos e validades" },
  { icon: "🚚", title: "Logística Integrada", desc: "Separação e entrega com controlo total" },
  { icon: "📈", title: "Relatórios PDF", desc: "Análises financeiras e de produtos automáticas" },
  { icon: "👥", title: "Multi-Utilizador", desc: "Admin, armazém e funcionários com permissões" },
  { icon: "✅", title: "Controlo de Validades", desc: "Alertas automáticos para produtos a expirar" },
];

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)" }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: 52,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 4,
          }}
        >
          A <span style={{ color: "#e53935" }}>SOLUÇÃO</span>
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 300,
            color: "rgba(255,255,255,0.4)",
            marginTop: 8,
            letterSpacing: 3,
          }}
        >
          TUDO O QUE PRECISA NUMA SÓ PLATAFORMA
        </div>
      </div>

      {/* Feature grid - 3x2 */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 120,
          right: 120,
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {FEATURES.map((feature, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const delay = 20 + i * 12;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 150 } });
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const scale = interpolate(s, [0, 1], [0.85, 1]);
          const y = interpolate(s, [0, 1], [30, 0]);

          return (
            <div
              key={i}
              style={{
                width: 520,
                padding: "32px 28px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "rgba(198, 40, 40, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {feature.icon}
                </div>
                <div
                  style={{
                    fontFamily: oswald,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: 1,
                  }}
                >
                  {feature.title}
                </div>
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 17,
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.5,
                }}
              >
                {feature.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #c62828, transparent)",
          opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};
