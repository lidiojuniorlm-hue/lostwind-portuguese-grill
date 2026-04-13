import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { PhoneFrame } from "./PhoneFrame";

const { fontFamily: inter } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const SceneOrders: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Stagger order items
  const item1 = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  const item2 = spring({ frame: frame - 16, fps, config: { damping: 15 } });
  const item3 = spring({ frame: frame - 22, fps, config: { damping: 15 } });

  // Tap on "Novo Pedido" button
  const tapFrame = 42;
  const btnScale = frame > tapFrame && frame < tapFrame + 5 ? 0.92 : 1;
  const btnGlow = interpolate(frame, [tapFrame, tapFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const orders = [
    { store: "Loja Carregado", date: "13 Abr", items: 8, status: "Entregue", color: "rgba(100,100,100,0.3)", textColor: "rgba(255,255,255,0.4)" },
    { store: "Loja Barrada", date: "12 Abr", items: 12, status: "Pronto", color: "rgba(34,197,94,0.15)", textColor: "#22c55e" },
    { store: "Loja Alenquer", date: "11 Abr", items: 6, status: "Pendente", color: "rgba(234,179,8,0.15)", textColor: "#eab308" },
  ];

  return (
    <AbsoluteFill>
      <div style={{ opacity }}>
        <PhoneFrame>
          <div style={{ width: "100%", height: "100%", background: "#0a0a0a", padding: "36px 16px 16px" }}>
            {/* Header */}
            <div style={{ marginBottom: 16, paddingTop: 4 }}>
              <div style={{ fontFamily: inter, fontSize: 18, fontWeight: 700, color: "#fff" }}>Pedidos</div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Loja Carregado · Funcionário</div>
            </div>

            {/* New order button */}
            <div
              style={{
                background: "linear-gradient(135deg, #c62828 0%, #ff6b35 100%)",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transform: `scale(${btnScale})`,
                boxShadow: btnGlow > 0.5 ? `0 0 25px rgba(198,40,40,0.5)` : "none",
              }}
            >
              <span style={{ fontSize: 16 }}>➕</span>
              <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: "#fff" }}>Novo Pedido</span>
            </div>

            {/* Order list */}
            {orders.map((order, i) => {
              const s = [item1, item2, item3][i];
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 8,
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [15, 0])}px)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: "#fff" }}>{order.store}</div>
                      <div style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{order.date} · {order.items} itens</div>
                    </div>
                    <div style={{ background: order.color, padding: "3px 8px", borderRadius: 6 }}>
                      <span style={{ fontFamily: inter, fontSize: 9, fontWeight: 600, color: order.textColor }}>{order.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Touch cursor on button */}
            {frame > tapFrame - 3 && frame < tapFrame + 10 && (
              <div
                style={{
                  position: "absolute",
                  left: "60%",
                  top: 120,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
                  zIndex: 50,
                  opacity: interpolate(frame, [tapFrame - 3, tapFrame, tapFrame + 10], [0, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              />
            )}
          </div>
        </PhoneFrame>
      </div>

      {/* Caption */}
      <div style={{ position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: labelOpacity }}>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#c62828", letterSpacing: 3, fontWeight: 600, marginBottom: 6 }}>
          PEDIDOS DA LOJA
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Histórico e novos pedidos ao armazém
        </div>
      </div>
    </AbsoluteFill>
  );
};
