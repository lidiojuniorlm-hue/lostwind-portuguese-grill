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

export const Scene3Menu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screenshot pan (scrolling effect)
  const panY = interpolate(frame, [0, 150], [0, -80]);
  const imgOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Right side content
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const PRODUCTS = [
    { name: "Frango Grelhado", price: "€5,50", section: "Carnes" },
    { name: "Picanha", price: "€12,90", section: "Carnes" },
    { name: "Costelas de Porco", price: "€5,50", section: "Carnes" },
    { name: "Dourada Grelhada", price: "€8,50", section: "Peixes" },
    { name: "Salmão", price: "€11,00", section: "Peixes" },
    { name: "Buffet Acompanhamentos", price: "€2,00", section: "Buffet" },
  ];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #0d0d0d 0%, #1a1010 100%)" }}>
      {/* Left: Screenshot with scroll effect */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 60,
          width: 900,
          height: 700,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(198,40,40,0.2)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          opacity: imgOpacity,
        }}
      >
        <Img
          src={staticFile("images/screenshot-menu.png")}
          style={{
            width: "100%",
            height: "auto",
            transform: `translateY(${panY}px)`,
          }}
        />
      </div>

      {/* Right: Product highlights */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 60,
          width: 850,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ opacity: titleOpacity }}>
          <div style={{ fontFamily: oswald, fontSize: 16, color: "#e53935", letterSpacing: 6, marginBottom: 10 }}>
            ESPECIALIDADES
          </div>
          <div style={{ fontFamily: oswald, fontSize: 52, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
            SABOR
          </div>
          <div style={{ fontFamily: oswald, fontSize: 52, color: "#e53935", letterSpacing: 2, lineHeight: 1 }}>
            NA BRASA
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          {PRODUCTS.map((p, i) => {
            const delay = 40 + i * 10;
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(
              spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 180 } }),
              [0, 1], [40, 0]
            );
            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e53935" }} />
                  <div style={{ fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
                    {p.section}
                  </div>
                </div>
                <div style={{ fontFamily: oswald, fontSize: 20, color: "#e53935", fontWeight: 700 }}>
                  {p.price}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: inter,
            fontSize: 16,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 300,
            fontStyle: "italic",
            opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          "Grelhados na brasa com carvão de qualidade — receita tradicional portuguesa desde 2018."
        </div>
      </div>
    </AbsoluteFill>
  );
};
