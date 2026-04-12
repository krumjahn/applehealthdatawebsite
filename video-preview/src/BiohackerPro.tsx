import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

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

const goldGlow = (opacity = 1): React.CSSProperties => ({
  textShadow: `0 0 40px rgba(245,158,11,${0.8 * opacity}), 0 0 80px rgba(245,158,11,${0.35 * opacity})`,
});

// Simple ticker: counts from 0 to target over a frame window
const ticker = (frame: number, start: number, end: number, target: number) => {
  const t = interpolate(frame, [start, end], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(t);
};

export const BiohackerPro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene 1: Title (0–100) ────────────────────────────────────────────────
  const scene1Opacity = sceneOpacity(frame, 0, 98);
  const titleY = interpolate(frame, [0, 28], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Gold line width
  const lineWidth = interpolate(frame, [20, 75], [0, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Scene 2: Feature cards (100–220) ─────────────────────────────────────
  const scene2Opacity = sceneOpacity(frame, 100, 218);
  const features = [
    { icon: "📈", title: "Trend Analysis", sub: "Spot patterns across months" },
    { icon: "🧬", title: "Biomarker Tracking", sub: "Lab + wearable correlation" },
    { icon: "📋", title: "Clinical Reports", sub: "Physician-ready exports" },
  ];
  const cardSprings = features.map((_, i) => ({
    opacity: Math.min(
      spring({ frame: frame - (110 + i * 34), fps, config: { damping: 18, stiffness: 90 } }),
      1
    ),
    y: spring({
      frame: frame - (110 + i * 34),
      fps,
      config: { damping: 18, stiffness: 90 },
      from: 40,
      to: 0,
    }),
  }));

  // ── Scene 3: Dashboard mockup (220–360) ───────────────────────────────────
  const scene3Opacity = sceneOpacity(frame, 220, 358);

  // Ticking numbers
  const hrvVal = ticker(frame, 230, 340, 78);
  const vo2Val = ticker(frame, 230, 340, 52);
  const sleepVal = ticker(frame, 230, 340, 94);
  const bpSys = ticker(frame, 230, 320, 118);
  const bpDia = ticker(frame, 230, 320, 76);

  // Animated bar widths
  const bar1 = interpolate(frame, [235, 310], [0, 72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar2 = interpolate(frame, [245, 330], [0, 88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar3 = interpolate(frame, [255, 345], [0, 65], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Scene 4: Badge + Price (360–480) ─────────────────────────────────────
  const scene4Opacity = sceneOpacity(frame, 360, 478);
  const badgeScale = spring({
    frame: frame - 368,
    fps,
    config: { damping: 16, stiffness: 75 },
    from: 0.7,
    to: 1,
  });

  // ── Scene 5: Closing CTA (480–600) ────────────────────────────────────────
  const scene5Opacity = sceneOpacity(frame, 480, 598);
  const taglineOpacity = fadeIn(frame, 490, 22);
  const ctaOpacity = fadeIn(frame, 520, 22);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Dark radial background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(245,158,11,0.10) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(245,158,11,0.06) 0%, transparent 55%)",
        }}
      />

      {/* Fine dot grid */}
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
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
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#f59e0b",
              marginBottom: 24,
              transform: `translateY(${titleY}px)`,
              opacity: fadeIn(frame, 6, 14),
            }}
          >
            Biohacker Pro · Premium
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              transform: `translateY(${titleY}px)`,
              maxWidth: 1000,
            }}
          >
            Clinical-Grade
            <br />
            <span
              style={{
                color: "#f59e0b",
                ...goldGlow(scene1Opacity),
              }}
            >
              Health Intelligence
            </span>
          </div>
          <div
            style={{
              marginTop: 36,
              height: 3,
              width: lineWidth,
              background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
              borderRadius: 2,
              boxShadow: "0 0 20px rgba(245,158,11,0.6)",
            }}
          />
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "rgba(248,250,252,0.55)",
              opacity: fadeIn(frame, 40, 16),
              fontWeight: 400,
              transform: `translateY(${titleY}px)`,
            }}
          >
            Built for serious health optimizers
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 2: Feature cards ── */}
      {scene2Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene2Opacity,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(245,158,11,0.75)",
              marginBottom: 56,
              opacity: fadeIn(frame, 102, 12),
            }}
          >
            What you get
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 36,
              justifyContent: "center",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  opacity: cardSprings[i].opacity,
                  transform: `translateY(${cardSprings[i].y}px)`,
                  width: 300,
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.22)",
                  borderRadius: 20,
                  padding: "44px 36px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                  boxShadow: "0 0 40px rgba(245,158,11,0.08)",
                }}
              >
                <div style={{ fontSize: 56 }}>{f.icon}</div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#ffffff",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: "rgba(248,250,252,0.5)",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  {f.sub}
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 3: Dashboard mockup ── */}
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
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(245,158,11,0.7)",
              marginBottom: 36,
              opacity: fadeIn(frame, 222, 12),
            }}
          >
            Live Health Dashboard
          </div>

          {/* Dashboard card */}
          <div
            style={{
              width: 900,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 24,
              padding: "44px 52px",
              boxShadow: "0 0 60px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.1)",
            }}
          >
            {/* Top stat row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 0,
                justifyContent: "space-between",
                marginBottom: 44,
              }}
            >
              {[
                { label: "HRV", value: hrvVal, unit: "ms", color: "#f59e0b" },
                { label: "VO₂ Max", value: vo2Val, unit: "ml/kg", color: "#fbbf24" },
                { label: "Sleep Score", value: sleepVal, unit: "%", color: "#f59e0b" },
                { label: "Blood Pressure", value: `${bpSys}/${bpDia}`, unit: "mmHg", color: "#fbbf24" },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    flex: 1,
                    borderRight:
                      i < 3 ? "1px solid rgba(245,158,11,0.1)" : "none",
                    padding: "0 24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(248,250,252,0.4)",
                      marginBottom: 10,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      color: stat.color,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      ...goldGlow(0.6),
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(248,250,252,0.3)",
                      marginTop: 6,
                    }}
                  >
                    {stat.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(248,250,252,0.35)",
                  marginBottom: 8,
                }}
              >
                30-Day Trend
              </div>
              {[
                { label: "Recovery", width: bar1, color: "#f59e0b" },
                { label: "Readiness", width: bar2, color: "#fbbf24" },
                { label: "Resilience", width: bar3, color: "#f59e0b" },
              ].map((bar, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 20 }}
                >
                  <div
                    style={{
                      width: 110,
                      fontSize: 16,
                      color: "rgba(248,250,252,0.5)",
                      fontWeight: 500,
                      textAlign: "right",
                    }}
                  >
                    {bar.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${bar.width}%`,
                        background: `linear-gradient(90deg, ${bar.color}, #fde68a)`,
                        borderRadius: 5,
                        boxShadow: `0 0 12px ${bar.color}60`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 44,
                      fontSize: 16,
                      fontWeight: 700,
                      color: bar.color,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Math.round(bar.width)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 4: Badge + Price ── */}
      {scene4Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene4Opacity,
          }}
        >
          <div
            style={{
              transform: `scale(${badgeScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* Badge */}
            <div
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
                borderRadius: 24,
                padding: "52px 80px",
                textAlign: "center",
                boxShadow:
                  "0 0 60px rgba(245,158,11,0.4), 0 0 120px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                marginBottom: 44,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(2,6,23,0.7)",
                  marginBottom: 12,
                }}
              >
                Premium Access
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: "#020617",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                Biohacker Pro
              </div>
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  ...goldGlow(scene4Opacity * 0.7),
                }}
              >
                $199
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: "rgba(248,250,252,0.5)",
                  fontWeight: 500,
                }}
              >
                one-time
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 22,
                color: "rgba(245,158,11,0.7)",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              Lifetime access · No subscription
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── Scene 5: Closing CTA ── */}
      {scene5Opacity > 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene5Opacity,
            gap: 0,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              color: "rgba(248,250,252,0.65)",
              textAlign: "center",
              opacity: taglineOpacity,
              marginBottom: 28,
            }}
          >
            For serious health optimizers.
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#f59e0b",
              opacity: ctaOpacity,
              letterSpacing: "-0.01em",
              ...goldGlow(scene5Opacity),
            }}
          >
            applehealthdata.com
          </div>
          <div
            style={{
              marginTop: 28,
              height: 3,
              width: interpolate(frame, [520, 570], [0, 400], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              background:
                "linear-gradient(90deg, transparent, #f59e0b, transparent)",
              borderRadius: 2,
              opacity: ctaOpacity,
            }}
          />
          <div
            style={{
              marginTop: 32,
              fontSize: 22,
              color: "rgba(248,250,252,0.3)",
              opacity: fadeIn(frame, 545, 18),
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Start your 7-day free trial
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
