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

export const Scene8Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 60 } });
  const logoOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const novidadesOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const novidadesY = interpolate(spring({ frame: frame - 70, fps, config: { damping: 20, stiffness: 120 } }), [0, 1], [30, 0]);
  const glowOpacity = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.15, 0.4]);
  const urlOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #1a0a0a 0%, #0a0a0a 60%, #000000 100%)" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(198,40,40,0.2) 0%, transparent 70%)", transform: "translate(-50%, -50%)", opacity: glowOpacity }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 160, height: 160, borderRadius: "50%", overflow: "hidden", transform: `scale(${logoScale})`, opacity: logoOpacity, border: "3px solid rgba(198,40,40,0.5)", boxShadow: "0 0 80px rgba(198,40,40,0.3)" }}>
          <Img src={staticFile("images/logo-lostwind.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: oswald, fontSize: 80, fontWeight: 700, color: "#ffffff", letterSpacing: 10, marginTop: 20, opacity: titleOpacity, textShadow: "0 4px 40px rgba(198,40,40,0.25)" }}>LOST WIND</div>
        <div style={{ fontFamily: inter, fontSize: 22, fontWeight: 300, color: "#e53935", letterSpacing: 6, opacity: titleOpacity }}>CHURRASQUEIRA PORTUGUESA</div>
        <div style={{ marginTop: 50, opacity: novidadesOpacity, transform: `translateY(${novidadesY}px)`, textAlign: "center" }}>
          <div style={{ fontFamily: oswald, fontSize: 36, color: "#ffc107", letterSpacing: 6, padding: "12px 40px", border: "1px solid rgba(255,193,7,0.3)", borderRadius: 12, background: "rgba(255,193,7,0.06)" }}>EM BREVE NOVIDADES</div>
        </div>
        <div style={{ marginTop: 40, opacity: urlOpacity, fontFamily: inter, fontSize: 18, color: "rgba(255,255,255,0.3)", letterSpacing: 3, fontWeight: 300 }}>lostwind-portuguese-grill.lovable.app</div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, #c62828, #e53935, #ff5722, #e53935, #c62828)", opacity: interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
