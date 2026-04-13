import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { PhoneFrame } from "./PhoneFrame";

const { fontFamily: inter } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const SceneLogin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition: slide in
  const enterX = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1], [100, 0]
  );
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Typing animation for email
  const emailText = "loja.carregado@lostwind.pt";
  const typedChars = Math.min(Math.floor(interpolate(frame, [15, 50], [0, emailText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), emailText.length);
  const typedEmail = emailText.slice(0, typedChars);

  // Cursor blink
  const cursorVisible = Math.sin(frame * 0.3) > 0;

  // Password dots appear
  const pwDots = Math.min(Math.floor(interpolate(frame, [45, 58], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 6);

  // Button press
  const btnScale = frame > 62 && frame < 68 ? 0.95 : 1;
  const btnGlow = interpolate(frame, [62, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Loading spinner after press
  const showLoader = frame > 65;

  // Label
  const labelOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ transform: `translateX(${enterX}px)`, opacity }}>
        <PhoneFrame>
          {/* Login screen - recreated */}
          <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
            {/* Logo */}
            <Img
              src={staticFile("images/logo-gestao-red.png")}
              style={{ width: 70, height: 70, borderRadius: "50%", marginBottom: 16, border: "2px solid rgba(198,40,40,0.3)" }}
            />
            <div style={{ fontFamily: inter, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Gestão Lost Wind
            </div>
            <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
              Acesso ao sistema de gestão
            </div>

            {/* Form */}
            <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
              {/* Email field */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Email</div>
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", minHeight: 18 }}>
                  <span style={{ fontFamily: inter, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    {typedEmail}
                  </span>
                  {frame < 55 && cursorVisible && <span style={{ color: "#c62828", fontWeight: 300 }}>|</span>}
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: inter, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Password</div>
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", minHeight: 18 }}>
                  <span style={{ fontFamily: inter, fontSize: 12, color: "rgba(255,255,255,0.8)", letterSpacing: 4 }}>
                    {"●".repeat(pwDots)}
                  </span>
                </div>
              </div>

              {/* Button */}
              <div
                style={{
                  background: "linear-gradient(135deg, #c62828 0%, #ff6b35 100%)",
                  borderRadius: 8,
                  padding: "12px 0",
                  textAlign: "center",
                  transform: `scale(${btnScale})`,
                  boxShadow: btnGlow > 0 ? `0 0 20px rgba(198,40,40,${0.4 * btnGlow})` : "none",
                }}
              >
                <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {showLoader ? "⏳ A entrar..." : "🔥 Entrar"}
                </span>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: labelOpacity,
        }}
      >
        <div style={{ fontFamily: inter, fontSize: 14, color: "#c62828", letterSpacing: 3, fontWeight: 600, marginBottom: 6 }}>
          LOGIN SEGURO
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Cada loja com acesso individual
        </div>
      </div>
    </AbsoluteFill>
  );
};
