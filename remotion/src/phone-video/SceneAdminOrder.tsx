import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { PhoneFrame } from "./PhoneFrame";

const { fontFamily: inter } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const SceneAdminOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // New order notification pulse
  const notifPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.7, 1]);
  const notifOpacity = interpolate(frame, [5, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Status change animation
  const statusChangeFrame = 45;
  const statusTransition = spring({ frame: frame - statusChangeFrame, fps, config: { damping: 12 } });
  const isChanged = frame > statusChangeFrame;

  // Touch on status button
  const tapOpacity = interpolate(frame, [statusChangeFrame - 3, statusChangeFrame, statusChangeFrame + 8], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Success notification
  const successOpacity = interpolate(frame, [statusChangeFrame + 5, statusChangeFrame + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ opacity }}>
        <PhoneFrame>
          <div style={{ width: "100%", height: "100%", background: "#0a0a0a", padding: "36px 14px 14px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ marginBottom: 12, paddingTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: inter, fontSize: 16, fontWeight: 700, color: "#fff" }}>Pedidos</div>
                  <div style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Armazém Central · Administrador</div>
                </div>
                {/* Notification badge */}
                <div style={{ position: "relative", opacity: notifOpacity }}>
                  <div style={{ fontSize: 18 }}>🔔</div>
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#c62828",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${notifPulse})`,
                    }}
                  >
                    <span style={{ fontFamily: inter, fontSize: 8, fontWeight: 700, color: "#fff" }}>1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* New order - highlighted */}
            <div
              style={{
                background: "rgba(198,40,40,0.08)",
                border: "1px solid rgba(198,40,40,0.25)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    🔥 Loja Carregado
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Agora mesmo · 5 itens
                  </div>
                </div>
                <div
                  style={{
                    background: isChanged ? "rgba(59,130,246,0.15)" : "rgba(234,179,8,0.15)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    transform: isChanged ? `scale(${interpolate(statusTransition, [0, 1], [1.2, 1])})` : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 9,
                      fontWeight: 600,
                      color: isChanged ? "#3b82f6" : "#eab308",
                    }}
                  >
                    {isChanged ? "Em Preparação" : "Pendente"}
                  </span>
                </div>
              </div>

              {/* Order items preview */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8, marginBottom: 8 }}>
                {["5x Frango Inteiro", "3x Costela de Porco", "8x Bife de Vaca", "4x Arroz Agulha", "2x Azeite 5L"].map((item, i) => (
                  <div key={i} style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Action button */}
              <div
                style={{
                  background: isChanged ? "rgba(59,130,246,0.15)" : "linear-gradient(135deg, #c62828 0%, #ff6b35 100%)",
                  borderRadius: 8,
                  padding: "8px 0",
                  textAlign: "center",
                  border: isChanged ? "1px solid rgba(59,130,246,0.3)" : "none",
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 10, fontWeight: 600, color: "#fff" }}>
                  {isChanged ? "✅ Pedido em Preparação" : "📦 Iniciar Preparação"}
                </span>
              </div>
            </div>

            {/* Other orders */}
            {[
              { store: "Loja A Lareira", time: "Há 2h", items: 12, status: "Em Preparação", color: "rgba(59,130,246,0.15)", textColor: "#3b82f6" },
              { store: "Loja Alenquer", time: "Ontem", items: 7, status: "Pronto", color: "rgba(34,197,94,0.15)", textColor: "#22c55e" },
              { store: "Loja Paredes", time: "Ontem", items: 9, status: "Entregue", color: "rgba(100,100,100,0.15)", textColor: "rgba(255,255,255,0.4)" },
            ].map((o, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: "#fff" }}>{o.store}</div>
                    <div style={{ fontFamily: inter, fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{o.time} · {o.items} itens</div>
                  </div>
                  <div style={{ background: o.color, padding: "3px 7px", borderRadius: 5 }}>
                    <span style={{ fontFamily: inter, fontSize: 8, fontWeight: 600, color: o.textColor }}>{o.status}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Touch cursor on action button */}
            {frame > statusChangeFrame - 4 && frame < statusChangeFrame + 6 && (
              <div
                style={{
                  position: "absolute",
                  left: "55%",
                  top: 310,
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                  zIndex: 50,
                  opacity: tapOpacity,
                }}
              />
            )}

            {/* Success toast */}
            {frame > statusChangeFrame + 5 && (
              <div
                style={{
                  position: "absolute",
                  top: 46,
                  left: 14,
                  right: 14,
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  opacity: successOpacity,
                  zIndex: 60,
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 10, color: "#3b82f6", fontWeight: 600 }}>
                  📦 Pedido em preparação!
                </span>
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>

      {/* Caption */}
      <div style={{ position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: labelOpacity }}>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#c62828", letterSpacing: 3, fontWeight: 600, marginBottom: 6 }}>
          CONTROLO DO ARMAZÉM
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Gestão e acompanhamento em tempo real
        </div>
      </div>
    </AbsoluteFill>
  );
};
