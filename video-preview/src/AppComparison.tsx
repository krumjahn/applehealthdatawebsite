import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fadeIn = (frame: number, startFrame: number, duration = 18) =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideUp = (frame: number, startFrame: number, distance = 30, duration = 18) =>
  interpolate(frame, [startFrame, startFrame + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ─── Constants ───────────────────────────────────────────────────────────────

const BG = "#020617";
const ROSE = "#f43f5e";
const SLATE_400 = "#94a3b8";
const SLATE_700 = "#334155";
const SLATE_800 = "#1e293b";
const WHITE = "#ffffff";

const FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Sub-components ──────────────────────────────────────────────────────────

const GradientBg: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 80% 50% at 10% 0%, rgba(244,63,94,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(168,85,247,0.10) 0%, transparent 60%)",
    }}
  />
);

// ─── Scene 1: Title (frames 0–90) ────────────────────────────────────────────

const SceneTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = fadeIn(frame, 8);
  const y = slideUp(frame, 8, 40);

  const tagOpacity = fadeIn(frame, 24);
  const tagY = slideUp(frame, 24, 20);

  const subtitleOpacity = fadeIn(frame, 38);
  const subtitleY = slideUp(frame, 38, 20);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 80,
        textAlign: "center",
      }}
    >
      {/* Tag */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 18px",
          borderRadius: 100,
          border: `1px solid rgba(244,63,94,0.35)`,
          background: "rgba(244,63,94,0.08)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: ROSE,
          }}
        />
        <span
          style={{
            color: ROSE,
            fontSize: 20,
            fontWeight: 600,
            fontFamily: FONT,
            letterSpacing: "0.02em",
          }}
        >
          App Comparison 2026
        </span>
      </div>

      {/* Main title */}
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <h1
          style={{
            color: WHITE,
            fontSize: 72,
            fontWeight: 800,
            fontFamily: FONT,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          The Best Way to{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, #a855f7 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Export
          </span>
          <br />
          Apple Health Data
        </h1>
      </div>

      {/* Subtitle */}
      <p
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          color: SLATE_400,
          fontSize: 28,
          fontWeight: 400,
          fontFamily: FONT,
          marginTop: 20,
          lineHeight: 1.4,
        }}
      >
        Not all export tools are created equal.
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Comparison Table (frames 90–220) ───────────────────────────────

interface ComparisonRow {
  app: string;
  verdict: string;
  isWinner: boolean;
  startFrame: number;
}

const rows: ComparisonRow[] = [
  {
    app: "Apple's Built-in Export",
    verdict: "❌ Raw XML, hard to use",
    isWinner: false,
    startFrame: 100,
  },
  {
    app: "Third-party cloud apps",
    verdict: "❌ Uploads your data",
    isWinner: false,
    startFrame: 140,
  },
  {
    app: "Health Data Export",
    verdict: "✅ Clean CSV, 100% private",
    isWinner: true,
    startFrame: 178,
  },
];

const TableRow: React.FC<{ row: ComparisonRow; frame: number }> = ({
  row,
  frame,
}) => {
  const opacity = interpolate(frame, [row.startFrame, row.startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [row.startFrame, row.startFrame + 22], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 32px",
        borderRadius: 14,
        border: row.isWinner
          ? `1.5px solid rgba(244,63,94,0.5)`
          : `1px solid rgba(255,255,255,0.07)`,
        background: row.isWinner
          ? "linear-gradient(135deg, rgba(244,63,94,0.10) 0%, rgba(168,85,247,0.06) 100%)"
          : "rgba(255,255,255,0.02)",
        marginBottom: 14,
      }}
    >
      <span
        style={{
          color: row.isWinner ? WHITE : SLATE_400,
          fontSize: 28,
          fontWeight: row.isWinner ? 700 : 500,
          fontFamily: FONT,
        }}
      >
        {row.app}
      </span>
      <span
        style={{
          color: row.isWinner ? "#4ade80" : "#f87171",
          fontSize: 26,
          fontWeight: 600,
          fontFamily: FONT,
        }}
      >
        {row.verdict}
      </span>
    </div>
  );
};

const SceneComparison: React.FC<{ frame: number }> = ({ frame }) => {
  const headerOpacity = fadeIn(frame, 92);
  const headerY = slideUp(frame, 92, 20);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 36,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 48,
            fontWeight: 800,
            fontFamily: FONT,
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          How Do They Compare?
        </h2>
      </div>

      <div style={{ width: "100%" }}>
        {rows.map((row) => (
          <TableRow key={row.app} row={row} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Key Differentiators (frames 220–360) ───────────────────────────

interface Differentiator {
  icon: string;
  headline: string;
  sub: string;
  startFrame: number;
  color: string;
}

const diffs: Differentiator[] = [
  {
    icon: "⚡",
    headline: "60 seconds",
    sub: "From export to clean CSV",
    startFrame: 232,
    color: "#fbbf24",
  },
  {
    icon: "🔒",
    headline: "Stays local",
    sub: "Zero cloud uploads, ever",
    startFrame: 272,
    color: "#4ade80",
  },
  {
    icon: "📊",
    headline: "Analysis-ready",
    sub: "Works with any AI or spreadsheet",
    startFrame: 312,
    color: "#60a5fa",
  },
];

const DiffCard: React.FC<{ diff: Differentiator; frame: number }> = ({
  diff,
  frame,
}) => {
  const opacity = interpolate(
    frame,
    [diff.startFrame, diff.startFrame + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = interpolate(
    frame,
    [diff.startFrame, diff.startFrame + 20],
    [0.85, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "36px 24px",
        borderRadius: 20,
        border: `1px solid rgba(255,255,255,0.08)`,
        background: "rgba(255,255,255,0.025)",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 56, marginBottom: 16 }}>{diff.icon}</span>
      <span
        style={{
          color: diff.color,
          fontSize: 36,
          fontWeight: 800,
          fontFamily: FONT,
          lineHeight: 1.1,
          marginBottom: 8,
        }}
      >
        {diff.headline}
      </span>
      <span
        style={{
          color: SLATE_400,
          fontSize: 22,
          fontFamily: FONT,
          lineHeight: 1.3,
        }}
      >
        {diff.sub}
      </span>
    </div>
  );
};

const SceneDifferentiators: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = fadeIn(frame, 222);
  const titleY = slideUp(frame, 222, 20);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 44,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 50,
            fontWeight: 800,
            fontFamily: FONT,
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          Why{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, #a855f7 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Health Data Export
          </span>{" "}
          Wins
        </h2>
      </div>

      <div style={{ display: "flex", gap: 20, width: "100%", alignItems: "stretch" }}>
        {diffs.map((d) => (
          <DiffCard key={d.headline} diff={d} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Social Proof (frames 360–450) ──────────────────────────────────

const SceneSocialProof: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = fadeIn(frame, 368, 24);
  const y = slideUp(frame, 368, 30, 24);

  const starOpacity = fadeIn(frame, 390, 20);
  const reviewOpacity = fadeIn(frame, 408, 20);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 58,
            fontWeight: 800,
            fontFamily: FONT,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Trusted by health data{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, #a855f7 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            enthusiasts
          </span>
        </h2>
      </div>

      {/* Stars */}
      <div
        style={{
          opacity: starOpacity,
          display: "flex",
          gap: 10,
          marginTop: 32,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ fontSize: 44, color: "#fbbf24" }}>
            ★
          </span>
        ))}
      </div>

      <p
        style={{
          opacity: reviewOpacity,
          color: SLATE_400,
          fontSize: 26,
          fontFamily: FONT,
          marginTop: 16,
          fontStyle: "italic",
        }}
      >
        "Finally, my health data in a format I can actually use."
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA (frames 450–540) ───────────────────────────────────────────

const SceneCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const urlOpacity = fadeIn(frame, 458, 20);
  const urlY = slideUp(frame, 458, 30, 20);

  const subOpacity = fadeIn(frame, 478, 20);
  const subY = slideUp(frame, 478, 20, 20);

  const badgeScale = spring({
    frame: frame - 492,
    fps,
    config: { damping: 18, stiffness: 100 },
    from: 0.6,
    to: 1,
  });
  const badgeOpacity = interpolate(frame, [492, 510], [0, 1], {
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
        paddingLeft: 80,
        paddingRight: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        <h2
          style={{
            color: WHITE,
            fontSize: 68,
            fontWeight: 800,
            fontFamily: FONT,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, #a855f7 60%, #60a5fa 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            applehealthdata.com
          </span>
        </h2>
      </div>

      <p
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          color: SLATE_400,
          fontSize: 28,
          fontFamily: FONT,
          marginTop: 18,
        }}
      >
        Free on the App Store
      </p>

      {/* App Store badge shape */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          marginTop: 36,
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 36px",
          borderRadius: 100,
          background: `linear-gradient(135deg, ${ROSE} 0%, #a855f7 100%)`,
          boxShadow: `0 0 40px rgba(244,63,94,0.35)`,
        }}
      >
        <span style={{ fontSize: 32 }}>🍎</span>
        <span
          style={{
            color: WHITE,
            fontSize: 28,
            fontWeight: 700,
            fontFamily: FONT,
          }}
        >
          Download Free
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const AppComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene visibility helpers — cross-fade between scenes
  const scene1Opacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene2Opacity = interpolate(frame, [88, 100, 208, 222], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene3Opacity = interpolate(frame, [218, 232, 348, 362], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene4Opacity = interpolate(frame, [358, 370, 438, 452], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene5Opacity = interpolate(frame, [448, 462], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <GradientBg />

      {/* Scene 1 — Title */}
      {frame < 92 && (
        <AbsoluteFill style={{ opacity: scene1Opacity }}>
          <SceneTitle frame={frame} fps={fps} />
        </AbsoluteFill>
      )}

      {/* Scene 2 — Comparison */}
      {frame >= 88 && frame < 224 && (
        <AbsoluteFill style={{ opacity: scene2Opacity }}>
          <SceneComparison frame={frame} />
        </AbsoluteFill>
      )}

      {/* Scene 3 — Differentiators */}
      {frame >= 218 && frame < 364 && (
        <AbsoluteFill style={{ opacity: scene3Opacity }}>
          <SceneDifferentiators frame={frame} />
        </AbsoluteFill>
      )}

      {/* Scene 4 — Social Proof */}
      {frame >= 358 && frame < 454 && (
        <AbsoluteFill style={{ opacity: scene4Opacity }}>
          <SceneSocialProof frame={frame} />
        </AbsoluteFill>
      )}

      {/* Scene 5 — CTA */}
      {frame >= 448 && (
        <AbsoluteFill style={{ opacity: scene5Opacity }}>
          <SceneCTA frame={frame} fps={fps} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
