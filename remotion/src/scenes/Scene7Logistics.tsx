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

const ORDER_FLOW = [
  { step: "01", title: "Loja faz pedido", desc: "Pelo sistema digital", color: "#e53935" },
  { step: "02", title: "Armazém recebe", desc: "Notificação em tempo real", color: "#ff5722" },
  { step: "03", title: "Separação", desc: "Produtos organizados por secção", color: "#ff9800" },
  { step: "04", title: "Conferência", desc: "Verificação com assinatura digital", color: "#ffc107" },
  { step: "05", title: "Entrega", desc: "Motorista confirma a entrega", color: "#4caf50" },
];

export const Scene7Logistics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Animated connecting line
  const lineProgress = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #0a0808 100%)" }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontFamily: oswald, fontSize: 16, color: "#e53935", letterSpacing: 6 }}>
          FLUXO DE PEDIDOS
        </div>
        <div style={{ fontFamily: oswald, fontSize: 52, color: "#fff", letterSpacing: 3, marginTop: 6 }}>
          DA LOJA AO <span style={{ color: "#e53935" }}>ARMAZÉM</span>
        </div>
      </div>

      {/* Order flow - horizontal */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {ORDER_FLOW.map((item, i) => {
          const delay = 25 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(s, [0, 1], [50, 0]);

          return (
            <div
              key={i}
              style={{
                width: 310,
                opacity,
                transform: `translateY(${y}px)`,
                textAlign: "center",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: `rgba(${i === 4 ? "76,175,80" : "198,40,40"},0.12)`,
                  border: `2px solid ${item.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: `0 0 30px ${item.color}33`,
                }}
              >
                <div style={{ fontFamily: oswald, fontSize: 28, color: item.color, fontWeight: 700 }}>
                  {item.step}
                </div>
              </div>

              {/* Connecting line to next */}
              {i < ORDER_FLOW.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 35,
                    left: `${(i + 0.5) * 20 + 2}%`,
                    width: `${14}%`,
                    height: 2,
                    background: `linear-gradient(90deg, ${item.color}40, ${ORDER_FLOW[i + 1].color}40)`,
                    opacity: interpolate(frame, [delay + 10, delay + 25], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                />
              )}

              <div style={{ fontFamily: oswald, fontSize: 20, color: "#fff", fontWeight: 700, letterSpacing: 1 }}>
                {item.title}
              </div>
              <div style={{ fontFamily: inter, fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 300, marginTop: 6 }}>
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {[
          { value: "Digital", label: "Pedidos 100% digitais" },
          { value: "PDF", label: "Relatórios automáticos" },
          { value: "IVA", label: "Cálculo automático" },
          { value: "Assinatura", label: "Conferência com assinatura" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: oswald, fontSize: 28, color: "#e53935", fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontFamily: inter, fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Narration */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.35)", fontWeight: 300, fontStyle: "italic" }}>
          "Cada pedido é rastreado do início ao fim — com controlo total na palma da mão."
        </div>
      </div>
    </AbsoluteFill>
  );
};
