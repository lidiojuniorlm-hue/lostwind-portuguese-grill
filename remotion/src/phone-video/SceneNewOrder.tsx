import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { PhoneFrame } from "./PhoneFrame";

const { fontFamily: inter } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const SceneNewOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Products appearing
  const products = [
    { name: "Frango Inteiro", section: "Carnes", unit: "kg" },
    { name: "Costela de Porco", section: "Carnes", unit: "kg" },
    { name: "Bife de Vaca", section: "Carnes", unit: "kg" },
    { name: "Arroz Agulha", section: "Secos e Molhados", unit: "un" },
    { name: "Azeite 5L", section: "Secos e Molhados", unit: "un" },
  ];

  // Sequentially add items to cart
  const addTimings = [15, 28, 40, 52, 60];
  const cartItems: { name: string; qty: number }[] = [];
  addTimings.forEach((t, i) => {
    if (frame > t) cartItems.push({ name: products[i].name, qty: i === 0 ? 5 : i === 1 ? 3 : i === 2 ? 8 : i === 3 ? 4 : 2 });
  });

  // Send button press at end
  const sendFrame = 75;
  const sendScale = frame > sendFrame && frame < sendFrame + 5 ? 0.93 : 1;
  const sendGlow = interpolate(frame, [sendFrame, sendFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Success toast
  const toastOpacity = interpolate(frame, [80, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toastY = interpolate(frame, [80, 85], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ opacity }}>
        <PhoneFrame>
          <div style={{ width: "100%", height: "100%", background: "#0a0a0a", padding: "36px 14px 14px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ marginBottom: 10, paddingTop: 4 }}>
              <div style={{ fontFamily: inter, fontSize: 16, fontWeight: 700, color: "#fff" }}>Novo Pedido</div>
              <div style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Loja Carregado · Entrega: amanhã</div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              {["Carnes", "Secos", "Peixes", "Bebidas"].map((s, i) => (
                <div
                  key={s}
                  style={{
                    fontSize: 8,
                    fontFamily: inter,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${i === 0 ? "rgba(198,40,40,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: i === 0 ? "#c62828" : "rgba(255,255,255,0.4)",
                    background: i === 0 ? "rgba(198,40,40,0.1)" : "transparent",
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Product list */}
            <div style={{ flex: 1 }}>
              {products.map((p, i) => {
                const isAdded = frame > addTimings[i];
                const addAnim = spring({ frame: frame - addTimings[i], fps, config: { damping: 12 } });
                const qty = cartItems.find(c => c.name === p.name)?.qty || 0;

                return (
                  <div
                    key={i}
                    style={{
                      background: isAdded ? "rgba(198,40,40,0.05)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isAdded ? "rgba(198,40,40,0.2)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                      <div style={{ fontFamily: inter, fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{p.unit} · {p.section}</div>
                    </div>
                    {isAdded ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: addAnim }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>−</span>
                        </div>
                        <div style={{ fontFamily: inter, fontSize: 11, fontWeight: 700, color: "#c62828", width: 24, textAlign: "center" }}>{qty}</div>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>+</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>+</span>
                      </div>
                    )}

                    {/* Touch indicator when adding */}
                    {frame > addTimings[i] - 2 && frame < addTimings[i] + 4 && (
                      <div
                        style={{
                          position: "absolute",
                          right: 30,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                          zIndex: 50,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cart summary */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px", marginTop: 6 }}>
              <div style={{ fontFamily: inter, fontSize: 10, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
                🛒 Resumo ({cartItems.length})
              </div>
              {cartItems.slice(0, 3).map((item, i) => (
                <div key={i} style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>
                  {item.qty}x {item.name}
                </div>
              ))}
              {cartItems.length > 3 && (
                <div style={{ fontFamily: inter, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>+{cartItems.length - 3} mais...</div>
              )}

              {/* Send button */}
              <div
                style={{
                  background: cartItems.length > 0 ? "linear-gradient(135deg, #c62828 0%, #ff6b35 100%)" : "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  padding: "10px 0",
                  textAlign: "center",
                  marginTop: 8,
                  transform: `scale(${sendScale})`,
                  boxShadow: sendGlow > 0.5 ? "0 0 20px rgba(198,40,40,0.4)" : "none",
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  📨 Enviar Pedido
                </span>
              </div>
            </div>

            {/* Success toast */}
            {frame > 80 && (
              <div
                style={{
                  position: "absolute",
                  top: 50,
                  left: 16,
                  right: 16,
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  opacity: toastOpacity,
                  transform: `translateY(${toastY}px)`,
                  zIndex: 60,
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                  ✅ Pedido enviado ao armazém!
                </span>
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>

      {/* Caption */}
      <div style={{ position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: labelOpacity }}>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#c62828", letterSpacing: 3, fontWeight: 600, marginBottom: 6 }}>
          CRIAR PEDIDO
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Seleção rápida de produtos por secção
        </div>
      </div>
    </AbsoluteFill>
  );
};
