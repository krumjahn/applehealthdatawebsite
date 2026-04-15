import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Utility: fade opacity over a frame range
const fadeIn = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fadeOut = (frame: number, end: number, duration = 15) =>
  interpolate(frame, [end - duration, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const sceneOpacity = (frame: number, start: number, end: number) =>
  Math.min(fadeIn(frame, start), fadeOut(frame, end));

// Rose glow text style
const glowStyle = (opacity = 1): React.CSSProperties => ({
  textShadow: `0 0 40px rgba(244,63,94,${0.7 * opacity}), 0 0 80px rgba(244,63,94,${0.3 * opacity})`,
});

export const BackupGuide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene 1: Title (0–90) ──────────────────────────────────────────────────
  const scene1Opacity = sceneOpacity(frame, 0, 88);
  const titleY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Scene 2: Risk (90–210) ────────────────────────────────────────────────
  const scene2Opacity = sceneOpacity(frame, 90, 208);
  const riskWords = ["😱", "New iPhone?", "Data loss?", "App corruption?"];
  const riskWordOpacities = riskWords.map((_, i) =>
    fadeIn(frame, 100 + i * 20, 16)
  );

  // ── Scene 3: Steps (210–360) ──────────────────────────────────────────────
  const scene3Opacity = sceneOpacity(frame, 210, 358);
  const steps = [
    { label: "1. Export", icon: "📤" },
    { label: "2. Store locally", icon: "💾" },
    { label: "3. Sleep easy", icon: "😴" },
  ];
  const stepOpacities = steps.map((_, i) => {
    const s = spring({
      frame: frame - (220 + i * 38),
      fps,
      config: { damping: 18, stiffness: 100 },
    });
    return Math.min(s, 1);
  });
  const stepY = steps.map((_, i) => {
    const s = spring({
      frame: frame - (220 + i * 38),
      fps,
      config: { damping: 18, stiffness: 100 },
      from: 30,
      to: 0,
    });
    return s;
  });

  // ── Scene 4: Safety statement (360–450) ───────────────────────────────────
  const scene4Opacity = sceneOpacity(frame, 360, 448);
  const scene4Y = interpolate(frame, [360, 385], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Scene 5: CTA (450–540) ────────────────────────────────────────────────
  const scene5Opacity = sceneOpacity(frame, 450, 538);
  const ctaScale = spring({
    frame: frame - 455,
    fps,
    config: { damping: 20, stiffness: 80 },
    from: 0.85,
    to: 1,
  });

  // Subtle animated background particle dots
  const particleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(244,63,94,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(244,63,94,0.08) 0%, transparent 55%)",
        }}
      />

      {/* Subtle grid overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.06 * particleOpacity,
          backgroundImage:
            "linear-gradient(rgba(244,63,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Scene 1: Title ── */}
      {scene1Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene1Opacity,
          }}
        >
          {/* Top eyebrow */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#f43f5e",
              marginBottom: 28,
              transform: `translateY(${titleY}px)`,
              opacity: fadeIn(frame, 8, 14),
            }}
          >
            Apple Health Backup
          </div>
          {/* Main headline */}
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              transform: `translateY(${titleY}px)`,
              ...glowStyle(scene1Opacity * 0.5),
            }}
          >
            Never Lose Your
            <br />
            <span style={{ color: "#f43f5e", ...glowStyle(scene1Opacity) }}>
              Health Data
            </span>
          </div>
          {/* Underline accent */}
          <div
            style={{
              marginTop: 32,
              height: 4,
              width: interpolate(frame, [15, 60], [0, 320], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              background: "linear-gradient(90deg, #f43f5e, #fb7185)",
              borderRadius: 2,
              boxShadow: "0 0 20px rgba(244,63,94,0.6)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* ── Scene 2: Risk words ── */}
      {scene2Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene2Opacity,
            gap: 0,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(244,63,94,0.8)",
              marginBottom: 48,
            }}
          >
            The Risks Are Real
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 36,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 1100,
            }}
          >
            {riskWords.map((word, i) => (
              <div
                key={i}
                style={{
                  opacity: riskWordOpacities[i],
                  transform: `translateY(${interpolate(
                    frame,
                    [100 + i * 20, 100 + i * 20 + 16],
                    [20, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  )}px)`,
                  fontSize: i === 0 ? 80 : 52,
                  fontWeight: 700,
                  color: i === 0 ? "#ffffff" : "#f43f5e",
                  textShadow:
                    i > 0
                      ? "0 0 30px rgba(244,63,94,0.5), 0 0 60px rgba(244,63,94,0.2)"
                      : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 52,
              fontSize: 26,
              color: "rgba(248,250,252,0.5)",
              opacity: fadeIn(frame, 162, 18),
              fontWeight: 400,
            }}
          >
            Years of history — gone in an instant.
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 3: Solution steps ── */}
      {scene3Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene3Opacity,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(244,63,94,0.8)",
              marginBottom: 60,
              opacity: fadeIn(frame, 212, 14),
            }}
          >
            The Solution
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 40,
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  opacity: stepOpacities[i],
                  transform: `translateY(${stepY[i]}px)`,
                  width: 280,
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  borderRadius: 20,
                  padding: "40px 36px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  boxShadow: "0 0 40px rgba(244,63,94,0.1)",
                }}
              >
                <div style={{ fontSize: 56 }}>{step.icon}</div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#ffffff",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </div>
                {/* connector arrow — not for last item */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: -28,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(244,63,94,0.5)",
                      fontSize: 32,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Connecting arrows between cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 0,
              alignItems: "center",
              marginTop: 28,
              opacity: Math.min(stepOpacities[2], 1),
            }}
          >
            {[0, 1].map((i) => (
              <React.Fragment key={i}>
                <div style={{ width: 280 + 40, textAlign: "center" }} />
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 4: Safety statement ── */}
      {scene4Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene4Opacity,
            transform: `translateY(${scene4Y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(244,63,94,0.75)",
              marginBottom: 32,
            }}
          >
            Peace of Mind
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            Years of health history,
            <br />
            <span
              style={{
                color: "#f43f5e",
                ...glowStyle(scene4Opacity),
              }}
            >
              always safe.
            </span>
          </div>
          {/* Shield icon via CSS */}
          <div
            style={{
              marginTop: 48,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(244,63,94,0.12)",
              border: "2px solid rgba(244,63,94,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              boxShadow: "0 0 30px rgba(244,63,94,0.2)",
            }}
          >
            🛡️
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 5: CTA ── */}
      {scene5Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene5Opacity,
          }}
        >
          <div
            style={{
              transform: `scale(${ctaScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "rgba(248,250,252,0.6)",
                letterSpacing: "0.1em",
              }}
            >
              Start protecting your data today
            </div>
            <div
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: "#f43f5e",
                letterSpacing: "-0.01em",
                ...glowStyle(scene5Opacity),
              }}
            >
              applehealthdata.com
            </div>
            {/* Bottom bar */}
            <div
              style={{
                marginTop: 16,
                height: 3,
                width: 400,
                background: "linear-gradient(90deg, transparent, #f43f5e, transparent)",
                borderRadius: 2,
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
