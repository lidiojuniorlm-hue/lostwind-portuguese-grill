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
  "Amora", "Corroios", "Charneca da Caparica",
  "Costa da Caparica", "Feijó", "Laranjeiro",
  "Pragal", "Setúbal", "Sobreda",
];

export const Scene4Stores: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Map/grid reveal
  const gridOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg, #1a1a1a 0%, #1f1210 100%)" }}>
      {/* Left side - brand */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 0,
          bottom: 0,
          width: 600,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily: oswald,
              fontSize: 18,
              fontWeight: 700,
              color: "#e53935",
              letterSpacing: 6,
              marginBottom: 16,
            }}
          >
            REDE DE LOJAS
          </div>
          <div
            style={{
              fontFamily: oswald,
              fontSize: 72,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: 2,
            }}
          >
            9 LOJAS
          </div>
          <div
            style={{
              fontFamily: oswald,
              fontSize: 72,
              fontWeight: 700,
              color: "rgba(255,255,255,0.2)",
              lineHeight: 1,
              letterSpacing: 2,
            }}
          >
            1 ARMAZÉM
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 20,
              fontWeight: 300,
              color: "rgba(255,255,255,0.45)",
              marginTop: 24,
              lineHeight: 1.6,
            }}
          >
            Todas conectadas em tempo real.{"\n"}
            Pedidos, stock e entregas sincronizados.
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            marginTop: 50,
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(198,40,40,0.4)",
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Img src={staticFile("images/logo-lostwind.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Right side - store grid */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 160,
          width: 900,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          opacity: gridOpacity,
          justifyContent: "flex-end",
        }}
      >
        {STORES.map((store, i) => {
          const delay = 30 + i * 8;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 200 } });
          const cardOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const scale = interpolate(s, [0, 1], [0.9, 1]);

          // Floating effect
          const floatY = Math.sin((frame + i * 20) * 0.04) * 3;

          return (
            <div
              key={store}
              style={{
                width: 270,
                padding: "24px 20px",
                borderRadius: 14,
                background: "rgba(198, 40, 40, 0.06)",
                border: "1px solid rgba(198, 40, 40, 0.15)",
                opacity: cardOpacity,
                transform: `scale(${scale}) translateY(${floatY}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#e53935",
                  boxShadow: "0 0 12px rgba(229, 57, 53, 0.5)",
                }}
              />
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 18,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {store}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connecting lines decoration */}
      <svg
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
      >
        <line
          x1="680"
          y1="540"
          x2="960"
          y2="300"
          stroke="rgba(198,40,40,0.1)"
          strokeWidth="1"
          strokeDasharray="8 4"
          strokeDashoffset={-frame * 0.5}
        />
        <line
          x1="680"
          y1="540"
          x2="960"
          y2="540"
          stroke="rgba(198,40,40,0.1)"
          strokeWidth="1"
          strokeDasharray="8 4"
          strokeDashoffset={-frame * 0.5}
        />
        <line
          x1="680"
          y1="540"
          x2="960"
          y2="780"
          stroke="rgba(198,40,40,0.1)"
          strokeWidth="1"
          strokeDasharray="8 4"
          strokeDashoffset={-frame * 0.5}
        />
      </svg>
    </AbsoluteFill>
  );
};
