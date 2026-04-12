import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─── helpers ────────────────────────────────────────────────────────────────

const fadeIn = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fadeInOut = (frame: number, start: number, end: number, fadeDur = 12) =>
  interpolate(
    frame,
    [start, start + fadeDur, end - fadeDur, end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

// ─── Scene 1: Title (0–90) ───────────────────────────────────────────────────

const SceneTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = fadeInOut(frame, 0, 90, 14);
  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [10, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* accent line */}
      <div
        style={{
          width: interpolate(frame, [5, 40], [0, 180], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 4,
          backgroundColor: "#f43f5e",
          borderRadius: 2,
          marginBottom: 28,
        }}
      />
      <p
        style={{
          color: "#ffffff",
          fontSize: 60,
          fontWeight: 800,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.15,
          transform: `translateY(${titleY}px)`,
          maxWidth: 900,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        Export Your Apple Health Data to CSV
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 28,
          fontWeight: 400,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          margin: "18px 0 0",
          transform: `translateY(${subY}px)`,
        }}
      >
        Sleep · HRV · Workouts
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 2: iPhone Export Flow (90–200) ────────────────────────────────────

const SceneExport: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 90;
  const opacity = fadeInOut(frame, 90, 200, 14);

  // phone entrance spring
  const phoneY = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
    from: 60,
    to: 0,
  });

  // progress bar fill 0→1 from sceneFrame 30–90
  const progress = interpolate(sceneFrame, [30, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tapOpacity = interpolate(sceneFrame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* phone mockup */}
      <div
        style={{
          position: "relative",
          width: 240,
          height: 480,
          backgroundColor: "#1a1a1a",
          borderRadius: 36,
          boxShadow: "0 0 0 8px #2e2e2e, 0 0 0 10px #111, 0 30px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          transform: `translateY(${phoneY}px)`,
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 26,
            backgroundColor: "#000",
            borderRadius: 13,
            zIndex: 10,
          }}
        />
        {/* Screen content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#f2f2f7",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 56,
          }}
        >
          {/* Health app header */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              padding: "10px 16px",
              borderBottom: "1px solid #e5e5ea",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #ff6b6b 0%, #f43f5e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ❤️
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#000",
                fontFamily: "-apple-system, sans-serif",
              }}
            >
              Health
            </span>
          </div>

          {/* Profile section */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#fff",
              marginTop: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#8e8e93",
                  fontFamily: "-apple-system, sans-serif",
                  marginBottom: 2,
                }}
              >
                HEALTH DETAILS
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#007aff",
                  fontFamily: "-apple-system, sans-serif",
                }}
              >
                Export All Health Data
              </div>
            </div>
            <span style={{ fontSize: 14, color: "#c7c7cc" }}>›</span>
          </div>

          {/* Tap indicator */}
          <div
            style={{
              marginTop: 16,
              opacity: tapOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "rgba(244,63,94,0.2)",
                border: "2px solid #f43f5e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              👆
            </div>
            <span
              style={{
                fontSize: 10,
                color: "#f43f5e",
                fontFamily: "-apple-system, sans-serif",
                fontWeight: 600,
              }}
            >
              TAP
            </span>
          </div>

          {/* Progress bar area */}
          {sceneFrame >= 30 && (
            <div
              style={{
                marginTop: 20,
                width: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#8e8e93",
                  fontFamily: "-apple-system, sans-serif",
                }}
              >
                Exporting…
              </span>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "#e5e5ea",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress * 100}%`,
                    background: "linear-gradient(90deg, #f43f5e, #fb7185)",
                    borderRadius: 3,
                    transition: "width 0.1s",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "#f43f5e",
                  fontFamily: "-apple-system, sans-serif",
                  fontWeight: 600,
                }}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 24,
          fontFamily: "-apple-system, sans-serif",
          marginTop: 24,
          opacity: interpolate(sceneFrame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Apple Health → Export All Health Data
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Data Types (200–310) ───────────────────────────────────────────

const DATA_TYPES = [
  { icon: "😴", label: "Sleep Data", delay: 0 },
  { icon: "❤️", label: "HRV Data", delay: 25 },
  { icon: "🏃", label: "Workout Data", delay: 50 },
];

const SceneDataTypes: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 200;
  const opacity = fadeInOut(frame, 200, 310, 14);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        gap: 24,
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 26,
          fontFamily: "-apple-system, sans-serif",
          margin: "0 0 8px",
          opacity: interpolate(sceneFrame, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Choose Your Data Type
      </p>

      {DATA_TYPES.map(({ icon, label, delay }) => {
        const itemOpacity = interpolate(sceneFrame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const itemX = interpolate(sceneFrame, [delay, delay + 18], [-40, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(244,63,94,0.3)",
              borderRadius: 16,
              padding: "18px 36px",
              width: 420,
              opacity: itemOpacity,
              transform: `translateX(${itemX}px)`,
            }}
          >
            <span style={{ fontSize: 40 }}>{icon}</span>
            <span
              style={{
                color: "#ffffff",
                fontSize: 30,
                fontWeight: 600,
                fontFamily: "-apple-system, sans-serif",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Scene 4: CSV Preview (310–420) ──────────────────────────────────────────

const CSV_HEADERS = ["date", "value", "unit", "source", "device"];

const SceneCSV: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 310;
  const opacity = fadeInOut(frame, 310, 420, 14);

  const iconScale = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 18, stiffness: 100 },
    from: 0,
    to: 1,
  });

  const CSV_ROWS = [
    ["2024-01-15", "7.5", "hr", "Apple Watch Series 9", "iPhone 15 Pro"],
    ["2024-01-15", "42.3", "ms", "Apple Watch Series 9", "iPhone 15 Pro"],
    ["2024-01-14", "8.2", "hr", "Apple Watch Series 9", "iPhone 15 Pro"],
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        gap: 28,
      }}
    >
      {/* CSV file icon */}
      <div
        style={{
          transform: `scale(${iconScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 80,
            height: 96,
            backgroundColor: "rgba(244,63,94,0.15)",
            border: "2px solid #f43f5e",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 28 }}>📄</span>
          <span
            style={{
              fontSize: 11,
              color: "#f43f5e",
              fontWeight: 700,
              fontFamily: "-apple-system, sans-serif",
              letterSpacing: 1,
            }}
          >
            .CSV
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          width: 800,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(244,63,94,0.4)",
            backgroundColor: "rgba(244,63,94,0.1)",
          }}
        >
          {CSV_HEADERS.map((h, i) => {
            const colOpacity = interpolate(sceneFrame, [i * 10, i * 10 + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={h}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  color: "#f43f5e",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  opacity: colOpacity,
                  borderRight: i < CSV_HEADERS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {h}
              </div>
            );
          })}
        </div>

        {/* Data rows */}
        {CSV_ROWS.map((row, ri) => {
          const rowOpacity = interpolate(
            sceneFrame,
            [55 + ri * 12, 55 + ri * 12 + 16],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={ri}
              style={{
                display: "flex",
                borderBottom: ri < CSV_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                opacity: rowOpacity,
                backgroundColor: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
              }}
            >
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontFamily: "monospace",
                    borderRight: ci < row.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA (420–540) ──────────────────────────────────────────────────

const TAGLINES = ["Clean.", "Structured.", "Analysis-ready."];

const SceneCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 420;
  const opacity = interpolate(frame, [420, 435, 525, 540], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(sceneFrame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlScale = spring({
    frame: sceneFrame - 50,
    fps,
    config: { damping: 20, stiffness: 90 },
    from: 0.8,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        gap: 16,
      }}
    >
      {/* accent bar */}
      <div
        style={{
          width: interpolate(sceneFrame, [0, 30], [0, 120], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 4,
          background: "linear-gradient(90deg, #f43f5e, #fb7185)",
          borderRadius: 2,
          marginBottom: 16,
        }}
      />

      <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
        {TAGLINES.map((word, i) => {
          const wOpacity = interpolate(sceneFrame, [i * 14, i * 14 + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wY = interpolate(sceneFrame, [i * 14, i * 14 + 16], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={word}
              style={{
                color: "#ffffff",
                fontSize: 54,
                fontWeight: 800,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                opacity: wOpacity,
                transform: `translateY(${wY}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          opacity: urlOpacity,
          transform: `scale(${urlScale})`,
          backgroundColor: "rgba(244,63,94,0.12)",
          border: "1px solid rgba(244,63,94,0.4)",
          borderRadius: 14,
          padding: "14px 40px",
        }}
      >
        <span
          style={{
            color: "#f43f5e",
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            letterSpacing: 0.5,
          }}
        >
          applehealthdata.com
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const ExportToCSV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #020617 0%, #0d1527 55%, #020617 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Subtle grid pattern overlay */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(244,63,94,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.8,
        }}
      />

      {/* Scenes render at all times; each handles its own opacity */}
      <SceneTitle frame={frame} fps={fps} />
      <SceneExport frame={frame} fps={fps} />
      <SceneDataTypes frame={frame} fps={fps} />
      <SceneCSV frame={frame} fps={fps} />
      <SceneCTA frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
