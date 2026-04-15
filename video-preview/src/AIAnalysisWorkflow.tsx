import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// ─── Shared helpers ──────────────────────────────────────────────────────────

const fadeIn = (frame: number, startFrame: number, duration = 20) =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideUp = (frame: number, fps: number, startFrame: number) =>
  spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 80 }, from: 40, to: 0 });

// ─── Design tokens ───────────────────────────────────────────────────────────

const BG = "#020617";
const ROSE = "#f43f5e";
const SLATE_400 = "#94a3b8";
const SLATE_700 = "#334155";
const WHITE = "#ffffff";

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Scene 1: Title */
const TitleScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = fadeIn(frame, 0, 25);
  const y = slideUp(frame, fps, 0);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      {/* Pill badge */}
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(244,63,94,0.12)",
          border: "1px solid rgba(244,63,94,0.3)",
          borderRadius: 999,
          padding: "6px 18px",
          marginBottom: 32,
        }}
      >
        <span style={{ fontSize: 18, color: ROSE, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
          AI Analysis Workflow
        </span>
      </div>

      <h1
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.1,
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-1px",
        }}
      >
        Analyze Your Health Data{" "}
        <span style={{ color: ROSE }}>with AI</span>
      </h1>

      <p
        style={{
          opacity: fadeIn(frame, 20, 25),
          transform: `translateY(${slideUp(frame, fps, 20)}px)`,
          fontSize: 28,
          color: SLATE_400,
          textAlign: "center",
          marginTop: 24,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          maxWidth: 700,
        }}
      >
        Export from iPhone · AirDrop to Mac · Ask any AI
      </p>
    </AbsoluteFill>
  );
};

/** Reusable step row: icon → label → arrow → icon */
const StepFlow: React.FC<{
  frame: number;
  fps: number;
  startFrame: number;
  stepNum: string;
  label: string;
  leftIcon: string;
  rightIcon: string;
  leftLabel: string;
  rightLabel: string;
}> = ({ frame, fps, startFrame, stepNum, label, leftIcon, rightIcon, leftLabel, rightLabel }) => {
  const elapsed = frame - startFrame;

  const containerOpacity = fadeIn(elapsed, 0, 18);
  const containerY = slideUp(elapsed, fps, 0);

  const leftOpacity = fadeIn(elapsed, 10, 18);
  const arrowOpacity = fadeIn(elapsed, 28, 18);
  const rightOpacity = fadeIn(elapsed, 46, 18);

  const arrowScale = interpolate(elapsed, [28, 46], [0.5, 1], {
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
        padding: "0 80px",
      }}
    >
      {/* Step number + label */}
      <div
        style={{
          opacity: containerOpacity,
          transform: `translateY(${containerY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: ROSE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {stepNum}
        </div>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {label}
        </span>
      </div>

      {/* Flow row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Left icon block */}
        <div
          style={{
            opacity: leftOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
            }}
          >
            {leftIcon}
          </div>
          <span
            style={{
              fontSize: 18,
              color: SLATE_400,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            {leftLabel}
          </span>
        </div>

        {/* Arrow */}
        <div
          style={{
            opacity: arrowOpacity,
            transform: `scale(${arrowScale})`,
            fontSize: 42,
            color: ROSE,
          }}
        >
          →
        </div>

        {/* Right icon block */}
        <div
          style={{
            opacity: rightOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
            }}
          >
            {rightIcon}
          </div>
          <span
            style={{
              fontSize: 18,
              color: SLATE_400,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            {rightLabel}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene 3: "Ask any AI" step with model logos text */
const AskAIScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const elapsed = frame;

  const containerOpacity = fadeIn(elapsed, 0, 18);
  const containerY = slideUp(elapsed, fps, 0);
  const leftOpacity = fadeIn(elapsed, 10, 18);
  const arrowOpacity = fadeIn(elapsed, 28, 18);
  const rightOpacity = fadeIn(elapsed, 46, 18);
  const logosOpacity = fadeIn(elapsed, 62, 20);

  const arrowScale = interpolate(elapsed, [28, 46], [0.5, 1], {
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
        padding: "0 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: containerOpacity,
          transform: `translateY(${containerY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: ROSE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          3
        </div>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Ask Any AI
        </span>
      </div>

      {/* Flow */}
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div
          style={{
            opacity: leftOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
            }}
          >
            💻
          </div>
          <span style={{ fontSize: 18, color: SLATE_400, fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
            Mac
          </span>
        </div>

        <div
          style={{
            opacity: arrowOpacity,
            transform: `scale(${arrowScale})`,
            fontSize: 42,
            color: ROSE,
          }}
        >
          →
        </div>

        <div
          style={{
            opacity: rightOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
            }}
          >
            🤖
          </div>
          <span style={{ fontSize: 18, color: SLATE_400, fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
            AI
          </span>
        </div>
      </div>

      {/* Model names */}
      <div
        style={{
          opacity: logosOpacity,
          marginTop: 40,
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        {["Claude", "ChatGPT", "Llama"].map((name, i) => (
          <React.Fragment key={name}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: i === 0 ? ROSE : SLATE_400,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {name}
            </span>
            {i < 2 && (
              <span style={{ fontSize: 20, color: SLATE_700 }}>•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Scene 4: Results */
const ResultsScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const elapsed = frame;

  const headerOpacity = fadeIn(elapsed, 0, 20);
  const headerY = slideUp(elapsed, fps, 0);

  const results = [
    { icon: "😴", label: "Sleep trends", delay: 18 },
    { icon: "❤️", label: "HRV insights", delay: 36 },
    { icon: "🏃", label: "Activity patterns", delay: 54 },
  ];

  const domainOpacity = fadeIn(elapsed, 90, 22);
  const domainY = slideUp(elapsed, fps, 90);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 52,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 22, color: ROSE, fontWeight: 600, margin: "0 0 12px", fontFamily: "system-ui, sans-serif" }}>
          Unlock insights like
        </p>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: WHITE,
            margin: 0,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          Your Personal Health Report
        </h2>
      </div>

      {/* Result cards */}
      <div style={{ display: "flex", gap: 28, marginBottom: 56 }}>
        {results.map(({ icon, label, delay }) => {
          const cardOpacity = fadeIn(elapsed, delay, 20);
          const cardY = slideUp(elapsed, fps, delay);
          return (
            <div
              key={label}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                padding: "36px 44px",
                minWidth: 200,
              }}
            >
              <span style={{ fontSize: 52 }}>{icon}</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: WHITE,
                  fontFamily: "system-ui, sans-serif",
                  textAlign: "center",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Domain callout */}
      <div
        style={{
          opacity: domainOpacity,
          transform: `translateY(${domainY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(244,63,94,0.1)",
          border: "1px solid rgba(244,63,94,0.3)",
          borderRadius: 999,
          padding: "14px 32px",
        }}
      >
        <span style={{ fontSize: 22, color: ROSE }}>❤️</span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.3px",
          }}
        >
          applehealthdata.com
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const AIAnalysisWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* Ambient gradient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, rgba(244,63,94,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(56,189,248,0.08) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Scene 1: Title (0–100) */}
      <Sequence from={0} durationInFrames={100}>
        <TitleScene frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Export from Apple Health (100–220) */}
      <Sequence from={100} durationInFrames={120}>
        <StepFlow
          frame={frame - 100}
          fps={fps}
          startFrame={0}
          stepNum="1"
          label="Export from Apple Health"
          leftIcon="📱"
          rightIcon="📄"
          leftLabel="iPhone"
          rightLabel="CSV File"
        />
      </Sequence>

      {/* Scene 3: AirDrop to Mac (220–340) */}
      <Sequence from={220} durationInFrames={120}>
        <StepFlow
          frame={frame - 220}
          fps={fps}
          startFrame={0}
          stepNum="2"
          label="AirDrop to Mac"
          leftIcon="📄"
          rightIcon="💻"
          leftLabel="CSV File"
          rightLabel="Mac"
        />
      </Sequence>

      {/* Scene 4: Ask any AI (340–460) */}
      <Sequence from={340} durationInFrames={120}>
        <AskAIScene frame={frame - 340} fps={fps} />
      </Sequence>

      {/* Scene 5: Results (460–600) */}
      <Sequence from={460} durationInFrames={140}>
        <ResultsScene frame={frame - 460} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
