import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: inter } = loadInter("normal", { weights: ["400", "300"], subsets: ["latin"] });

const FEATURES = [
  { icon: "🛒", title: "Pedidos Digitais", desc: "Lojas fazem pedidos ao armazém em tempo real", stat: "100%" },
  { icon: "📊", title: "Dashboard", desc: "Visão completa de stock, pedidos e validades", stat: "Real-time" },
  { icon: "🚚", title: "Logística", desc: "Separação e entrega com controlo total", stat: "9 lojas" },
  { icon: "📈", title: "Relatórios PDF", desc: "Análises financeiras automáticas", stat: "Auto" },
  { icon: "👥", title: "Multi-Utilizador", desc: "Admin, armazém e funcionários", stat: "3 níveis" },
  { icon: "✅", title: "Validades", desc: "Alertas automáticos para produtos a expirar", stat: "Alertas" },
  { icon: "📦", title: "Inventário", desc: "Controlo de stock por loja e armazém", stat: "Central" },
  { icon: "💰", title: "Financeiro", desc: "Controlo de custos e faturação com IVA", stat: "€€€" },
];

export const Scene6Management: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg, #0d0d0d 0%, #0f0a0a 100%)" }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontFamily: oswald, fontSize: 16, color: "#e53935", letterSpacing: 6 }}>
          SISTEMA DE GESTÃO
        </div>
        <div style={{ fontFamily: oswald, fontSize: 56, color: "#fff", letterSpacing: 3, marginTop: 6 }}>
          O <span style={{ color: "#e53935" }}>PODER</span> DE GERIR TUDO
        </div>
        <div style={{ fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.35)", marginTop: 8, fontWeight: 300 }}>
          Uma plataforma completa para armazém e todas as lojas
        </div>
      </div>

      {/* 4x2 grid */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 100,
          right: 100,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {FEATURES.map((f, i) => {
          const delay = 15 + i * 8;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 150 } });
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(s, [0, 1], [40, 0]);
          const scale = interpolate(s, [0, 1], [0.9, 1]);

          return (
            <div
              key={i}
              style={{
                width: 400,
                padding: "28px 24px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                opacity,
                transform: `translateY(${y}px) scale(${scale})`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(198,40,40,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: oswald, fontSize: 20, color: "#fff", fontWeight: 700, letterSpacing: 1 }}>
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: 12,
                      color: "#e53935",
                      background: "rgba(198,40,40,0.1)",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontWeight: 400,
                    }}
                  >
                    {f.stat}
                  </div>
                </div>
                <div style={{ fontFamily: inter, fontSize: 15, color: "rgba(255,255,255,0.45)", fontWeight: 300, marginTop: 6, lineHeight: 1.4 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Narration */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.4)", fontWeight: 300, fontStyle: "italic" }}>
          "O novo sistema de gestão vai transformar a logística, separação e organização dos pedidos — fortalecendo ainda mais a marca Lost Wind."
        </div>
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
