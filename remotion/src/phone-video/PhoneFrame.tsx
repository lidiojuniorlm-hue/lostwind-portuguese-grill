import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, scale = 1 }) => {
  const frame = useCurrentFrame();

  // Subtle floating animation
  const floatY = interpolate(Math.sin(frame * 0.03), [-1, 1], [-4, 4]);

  const phoneW = 360;
  const phoneH = 780;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale}) translateY(${floatY}px)`,
        width: phoneW,
        height: phoneH,
        borderRadius: 44,
        background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)",
        padding: 8,
        overflow: "hidden",
      }}
    >
      {/* Inner screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 36,
          overflow: "hidden",
          position: "relative",
          background: "#0a0a0a",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 28,
            background: "#1a1a1a",
            borderRadius: "0 0 18px 18px",
            zIndex: 100,
          }}
        >
          <div style={{ position: "absolute", right: 20, top: 8, width: 10, height: 10, borderRadius: "50%", background: "#222", border: "1px solid #333" }} />
        </div>

        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            zIndex: 99,
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "sans-serif",
          }}
        >
          <span>14:32</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ fontSize: 9 }}>5G</div>
            <div style={{ width: 16, height: 10, border: "1px solid rgba(255,255,255,0.6)", borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: "70%", background: "rgba(255,255,255,0.7)", borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.3)",
            zIndex: 100,
          }}
        />
      </div>
    </div>
  );
};
