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

const STORES = [
  { name: "Loja Lareira", location: "Carregado", flagship: true },
  { name: "Carregado Centro", location: "Carregado", flagship: false },
  { name: "Alenquer", location: "Paredes – Alenquer", flagship: false },
  { name: "Arruda dos Vinhos", location: "Arruda dos Vinhos", flagship: false },
  { name: "Benavente", location: "Benavente", flagship: false },
  { name: "Castanheira", location: "Castanheira do Ribatejo", flagship: false },
  { name: "Povos - VFX", location: "Vila Franca de Xira", flagship: false },
  { name: "Win Burguer", location: "Carregado", flagship: false },
];

export const Scene4Stores: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Screenshot of stores section
  const screenshotOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const screenshotScale = interpolate(frame, [15, 180], [1.05, 1.0]);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg, #0d0d0d 0%, #1a0a0a 100%)" }}>
      {/* Left: Store list */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 60,
          width: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ opacity: titleOpacity }}>
          <div style={{ fontFamily: oswald, fontSize: 16, color: "#e53935", letterSpacing: 6, marginBottom: 10 }}>
            REDE DE LOJAS
          </div>
          <div style={{ fontFamily: oswald, fontSize: 64, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
            9 LOJAS
          </div>
          <div style={{ fontFamily: oswald, fontSize: 64, color: "rgba(255,255,255,0.2)", letterSpacing: 2, lineHeight: 1 }}>
            1 ARMAZÉM
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(255,255,255,0.4)",
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Todas as lojas conectadas em tempo real.
          </div>
        </div>

        {/* Store chips */}
        <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {STORES.map((store, i) => {
            const delay = 25 + i * 7;
            const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 200 } });
            return (
              <div
                key={store.name}
                style={{
                  opacity,
                  transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: store.flagship ? "rgba(198,40,40,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${store.flagship ? "rgba(198,40,40,0.4)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: store.flagship ? "#ff5722" : "#e53935",
                    boxShadow: `0 0 8px ${store.flagship ? "rgba(255,87,34,0.5)" : "rgba(229,57,53,0.4)"}`,
                  }}
                />
                <div style={{ fontFamily: inter, fontSize: 15, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
                  {store.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Logo */}
        <div
          style={{
            marginTop: 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(198,40,40,0.3)",
            opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Img src={staticFile("images/logo-lostwind.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Right: Real screenshot of stores */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 60,
          width: 1050,
          height: 680,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(198,40,40,0.15)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          opacity: screenshotOpacity,
        }}
      >
        <Img
          src={staticFile("images/screenshot-stores.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${screenshotScale})`,
          }}
        />
      </div>

      {/* Narration */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 70,
          maxWidth: 480,
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.6 }}>
          "De Carregado a Vila Franca de Xira, a Lost Wind está presente — e agora com gestão integrada."
        </div>
      </div>
    </AbsoluteFill>
  );
};
