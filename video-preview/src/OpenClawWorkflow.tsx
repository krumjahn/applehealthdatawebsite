import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ACCENT = "#f43f5e";
const BG = "#020617";
const CARD_BG = "rgba(15,23,42,0.85)";
const BORDER = "rgba(244,63,94,0.25)";

function fadeIn(frame: number, start: number, duration = 18): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function fadeInOut(
  frame: number,
  start: number,
  end: number,
  fadeDuration = 15
): number {
  return interpolate(
    frame,
    [start, start + fadeDuration, end - fadeDuration, end],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

function slideUp(frame: number, start: number, fps: number, delay = 0): number {
  return spring({
    frame: frame - start - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
    from: 40,
    to: 0,
  });
}

// ─── Scene 1: Title (0–100) ──────────────────────────────────────────────────

const SceneTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = fadeInOut(frame, 0, 100);
  const titleY = slideUp(frame, 0, fps);
  const subY = slideUp(frame, 0, fps, 8);

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
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,63,94,0.18) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* OpenClaw badge */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(244,63,94,0.12)",
          border: "1px solid rgba(244,63,94,0.4)",
          borderRadius: 999,
          padding: "6px 20px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: `0 0 8px ${ACCENT}`,
          }}
        />
        <span
          style={{
            color: ACCENT,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          OpenClaw
        </span>
      </div>

      <h1
        style={{
          transform: `translateY(${titleY}px)`,
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          fontSize: 72,
          fontWeight: 800,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          maxWidth: 900,
        }}
      >
        Automate Your{" "}
        <span style={{ color: ACCENT }}>Health Insights</span>
      </h1>

      <p
        style={{
          transform: `translateY(${subY}px)`,
          color: "rgba(255,255,255,0.55)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "20px 0 0",
          letterSpacing: "0.01em",
        }}
      >
        Daily health briefs on Mac — no cloud required
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Flow Diagram (100–220) ────────────────────────────────────────

const FlowArrow: React.FC<{ progress: number }> = ({ progress }) => {
  const len = 120;
  const drawn = progress * len;
  return (
    <svg width={160} height={60} style={{ overflow: "visible" }}>
      {/* Dashed track */}
      <line
        x1={20}
        y1={30}
        x2={140}
        y2={30}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      {/* Animated fill */}
      <line
        x1={20}
        y1={30}
        x2={20 + drawn}
        y2={30}
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      {progress > 0.85 && (
        <polygon
          points="136,24 148,30 136,36"
          fill={ACCENT}
          opacity={interpolate(progress, [0.85, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      )}
      {/* WiFi label */}
      <text
        x={80}
        y={22}
        textAnchor="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize={11}
        fontFamily="monospace"
        opacity={progress}
      >
        WiFi sync
      </text>
    </svg>
  );
};

const FlowNode: React.FC<{
  label: string;
  sublabel: string;
  icon: string;
  opacity: number;
  translateY: number;
}> = ({ label, sublabel, icon, opacity, translateY }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: "rgba(15,23,42,0.9)",
        border: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {icon}
    </div>
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          color: "#ffffff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: 13,
          marginTop: 2,
        }}
      >
        {sublabel}
      </div>
    </div>
  </div>
);

const SceneFlow: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const sceneFrame = frame - 100;
  const opacity = fadeInOut(frame, 100, 220);

  const node1Opacity = fadeIn(sceneFrame, 0);
  const node1Y = slideUp(frame, 100, fps, 0);

  const arrowProgress = interpolate(sceneFrame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const node2Opacity = fadeIn(sceneFrame, 45);
  const node2Y = slideUp(frame, 100, fps, 15);

  const labelOpacity = fadeIn(sceneFrame, 60);

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
      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 40px",
          opacity: labelOpacity,
        }}
      >
        How it works
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        <FlowNode
          label="iPhone"
          sublabel="Apple Health"
          icon=""
          opacity={node1Opacity}
          translateY={node1Y}
        />
        <div style={{ marginBottom: 20 }}>
          <FlowArrow progress={arrowProgress} />
        </div>
        <FlowNode
          label="Mac"
          sublabel="OpenClaw"
          icon=""
          opacity={node2Opacity}
          translateY={node2Y}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Terminal (220–360) ─────────────────────────────────────────────

const TERMINAL_LINES = [
  { text: "$ openclaw brief --today", type: "cmd" as const },
  { text: "", type: "blank" as const },
  { text: "Good morning, Keith.", type: "output" as const },
  { text: "", type: "blank" as const },
  {
    text: "HRV: 68ms  (+12% vs last week) ✓",
    type: "metric" as const,
    color: "#4ade80",
  },
  { text: "Sleep score: 84              ✓", type: "metric" as const, color: "#4ade80" },
  { text: "Resting HR: 54 bpm           ✓", type: "metric" as const, color: "#4ade80" },
  { text: "", type: "blank" as const },
  {
    text: "Recommended focus: recovery",
    type: "highlight" as const,
    color: ACCENT,
  },
];

const SceneTerminal: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const sceneFrame = frame - 220;
  const sceneDuration = 140; // 360 - 220
  const opacity = fadeInOut(frame, 220, 360);

  // Each line gets ~10 frames to appear, staggered
  const lineFrames = TERMINAL_LINES.map((_, i) => i * 12 + 8);

  // Cursor blink
  const cursorVisible = Math.floor(sceneFrame / 15) % 2 === 0;

  // Find last visible line index
  let lastVisibleLine = -1;
  for (let i = 0; i < TERMINAL_LINES.length; i++) {
    if (sceneFrame >= lineFrames[i]) lastVisibleLine = i;
  }

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
      {/* Terminal window */}
      <div
        style={{
          width: 720,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "#1e293b",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
          <span
            style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "monospace",
              fontSize: 13,
              marginLeft: 8,
            }}
          >
            openclaw — daily brief
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            background: "#0d1117",
            padding: "20px 24px",
            minHeight: 260,
            fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: 17,
            lineHeight: 1.7,
          }}
        >
          {TERMINAL_LINES.map((line, i) => {
            if (sceneFrame < lineFrames[i]) return null;
            const lineOpacity = interpolate(
              sceneFrame,
              [lineFrames[i], lineFrames[i] + 6],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            if (line.type === "blank") {
              return <div key={i} style={{ height: "0.4em" }} />;
            }

            let color = "rgba(255,255,255,0.75)";
            if (line.type === "cmd") color = "#7dd3fc";
            if (line.type === "metric" && line.color) color = line.color;
            if (line.type === "highlight" && line.color) color = line.color;
            if (line.type === "output") color = "rgba(255,255,255,0.9)";

            const isCurrent = i === lastVisibleLine;

            return (
              <div
                key={i}
                style={{
                  opacity: lineOpacity,
                  color,
                  fontWeight: line.type === "highlight" ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {line.type === "cmd" && (
                  <span style={{ color: ACCENT, marginRight: 4 }}>$</span>
                )}
                {line.type === "cmd"
                  ? line.text.replace(/^\$ /, "")
                  : line.text}
                {isCurrent && cursorVisible && sceneFrame < sceneDuration - 20 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: "1em",
                      background: "rgba(255,255,255,0.7)",
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Workflow Options (360–480) ─────────────────────────────────────

const WORKFLOW_OPTIONS = [
  {
    icon: "🤖",
    name: "Claude Code",
    desc: "AI-powered analysis",
    color: "#f97316",
  },
  {
    icon: "🔄",
    name: "n8n",
    desc: "Visual automation",
    color: "#7c3aed",
  },
  {
    icon: "⚡",
    name: "Custom Scripts",
    desc: "Python, Bash, Node.js",
    color: "#0ea5e9",
  },
];

const SceneWorkflows: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const sceneFrame = frame - 360;
  const opacity = fadeInOut(frame, 360, 480);

  const titleOpacity = fadeIn(sceneFrame, 0);

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
      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 36px",
          opacity: titleOpacity,
        }}
      >
        Trigger from anywhere
      </p>

      <div style={{ display: "flex", gap: 24 }}>
        {WORKFLOW_OPTIONS.map((opt, i) => {
          const delay = i * 10;
          const cardOpacity = fadeIn(sceneFrame, delay);
          const cardY = slideUp(frame, 360, fps, delay);

          return (
            <div
              key={opt.name}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                width: 200,
                borderRadius: 16,
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${opt.color}20`,
                  border: `1px solid ${opt.color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {opt.icon}
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "#ffffff",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {opt.name}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {opt.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Outro (480–600) ────────────────────────────────────────────────

const SceneOutro: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const sceneFrame = frame - 480;
  const opacity = fadeIn(frame, 480);

  const line1Y = slideUp(frame, 480, fps, 0);
  const line2Y = slideUp(frame, 480, fps, 10);
  const urlY = slideUp(frame, 480, fps, 22);
  const urlOpacity = fadeIn(sceneFrame, 22);

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
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,63,94,0.14) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <h2
        style={{
          transform: `translateY(${line1Y}px)`,
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          fontSize: 58,
          fontWeight: 800,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        Your health data.
      </h2>
      <h2
        style={{
          transform: `translateY(${line2Y}px)`,
          color: ACCENT,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          fontSize: 58,
          fontWeight: 800,
          textAlign: "center",
          margin: "4px 0 0",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        Your workflows.
      </h2>

      <div
        style={{
          transform: `translateY(${urlY}px)`,
          opacity: urlOpacity,
          marginTop: 36,
          padding: "12px 32px",
          background: "rgba(244,63,94,0.1)",
          border: `1px solid ${BORDER}`,
          borderRadius: 999,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.7)",
            fontFamily: "monospace",
            fontSize: 20,
            letterSpacing: "0.03em",
          }}
        >
          applehealthdata.com
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ────────────────────────────────────────────────────────

export const OpenClawWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Subtle grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scenes */}
      {frame < 110 && <SceneTitle frame={frame} fps={fps} />}
      {frame >= 90 && frame < 230 && <SceneFlow frame={frame} fps={fps} />}
      {frame >= 210 && frame < 370 && <SceneTerminal frame={frame} fps={fps} />}
      {frame >= 350 && frame < 490 && <SceneWorkflows frame={frame} fps={fps} />}
      {frame >= 470 && <SceneOutro frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};
