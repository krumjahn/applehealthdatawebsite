import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fadeIn = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const slideUp = (frame: number, fps: number, start: number) =>
  spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 80 }, from: 32, to: 0 });

// ─── Scene 1: Title (0–150) ────────────────────────────────────────────────────

const Scene1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleOpacity = fadeIn(frame, 10, 24);
  const titleY = slideUp(frame, fps, 10);
  const subOpacity = fadeIn(frame, 40, 20);
  const subY = slideUp(frame, fps, 40);

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
      {/* Decorative top line */}
      <div
        style={{
          width: interpolate(frame, [5, 50], [0, 320], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: "linear-gradient(90deg, transparent, #f43f5e, transparent)",
          marginBottom: 36,
        }}
      />

      <p
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          color: "#f8fafc",
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          textAlign: "center",
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: "-1px",
        }}
      >
        Where does your{" "}
        <span style={{ color: "#f43f5e" }}>health data</span> go?
      </p>

      <p
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          color: "rgba(255,255,255,0.5)",
          fontSize: 30,
          fontWeight: 400,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          textAlign: "center",
          marginTop: 24,
          letterSpacing: "0.5px",
        }}
      >
        Cloud AI vs. local analysis
      </p>

      {/* Decorative bottom line */}
      <div
        style={{
          width: interpolate(frame, [5, 50], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.4), transparent)",
          marginTop: 36,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 2: Split screen (150–300) ──────────────────────────────────────────

const CloudIcon: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = "#f43f5e" }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 64 42" fill="none">
    <path
      d="M52 18.5C52 18.5 52 18 52 17.5C52 10.596 46.404 5 39.5 5C34.926 5 30.944 7.464 28.75 11.148C27.39 10.414 25.845 10 24.2 10C18.9 10 14.6 14.3 14.6 19.6C14.6 19.733 14.604 19.866 14.61 20C10.344 20.72 7 24.442 7 29C7 33.97 11.03 38 16 38H50C54.97 38 59 33.97 59 29C59 24.128 55.556 20.094 51 18.5Z"
      fill={color}
      opacity={0.9}
    />
  </svg>
);

const DeviceIcon: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = "#22c55e" }) => (
  <svg width={size * 0.55} height={size} viewBox="0 0 35 64" fill="none">
    <rect x="1" y="1" width="33" height="62" rx="6" stroke={color} strokeWidth="2.5" fill="none" opacity={0.9} />
    <rect x="13" y="4" width="9" height="2.5" rx="1.25" fill={color} opacity={0.6} />
    <rect x="4" y="10" width="27" height="44" rx="2" fill={color} opacity={0.12} />
    <circle cx="17.5" cy="57" r="2.5" fill={color} opacity={0.5} />
  </svg>
);

const Scene2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Panels slide in from sides
  const leftX = interpolate(frame, [0, 30], [-200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightX = interpolate(frame, [0, 30], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelOpacity = fadeIn(frame, 0, 25);

  // Icon bounce
  const iconScale = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 100 }, from: 0, to: 1 });

  // Badge items stagger
  const badge1Opacity = fadeIn(frame, 45, 15);
  const badge2Opacity = fadeIn(frame, 65, 15);
  const badge3Opacity = fadeIn(frame, 85, 15);

  const panelStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 36px",
    borderRadius: 20,
    gap: 20,
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        gap: 24,
      }}
    >
      {/* LEFT — Cloud / Bad */}
      <div
        style={{
          ...panelStyle,
          opacity: panelOpacity,
          transform: `translateX(${leftX}px)`,
          background: "rgba(244,63,94,0.06)",
          border: "1px solid rgba(244,63,94,0.25)",
        }}
      >
        <div style={{ transform: `scale(${iconScale})` }}>
          <CloudIcon size={72} color="#f43f5e" />
        </div>

        <p
          style={{
            color: "#f43f5e",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          ChatGPT Health
          <br />
          <span style={{ fontSize: 20, opacity: 0.7 }}>Claude Health</span>
        </p>

        {/* Badges */}
        {[
          { label: "Uploads to server", opacity: badge1Opacity },
          { label: "Data retained 30 days", opacity: badge2Opacity },
          { label: "Cloud processing", opacity: badge3Opacity },
        ].map(({ label, opacity }, i) => (
          <div
            key={i}
            style={{
              opacity,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.3)",
              borderRadius: 8,
              padding: "8px 16px",
              width: "100%",
            }}
          >
            <span style={{ color: "#f43f5e", fontSize: 18, fontWeight: 700 }}>✕</span>
            <span
              style={{
                color: "#fda4af",
                fontSize: 18,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 2,
          height: 320,
          background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)",
          flexShrink: 0,
        }}
      />

      {/* RIGHT — Local / Good */}
      <div
        style={{
          ...panelStyle,
          opacity: panelOpacity,
          transform: `translateX(${rightX}px)`,
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <div style={{ transform: `scale(${iconScale})` }}>
          <DeviceIcon size={72} color="#22c55e" />
        </div>

        <p
          style={{
            color: "#22c55e",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Local Analysis
          <br />
          <span style={{ fontSize: 20, opacity: 0.7 }}>On your device</span>
        </p>

        {[
          { label: "Stays on your device", opacity: badge1Opacity },
          { label: "Never leaves your Mac", opacity: badge2Opacity },
          { label: "Zero cloud uploads", opacity: badge3Opacity },
        ].map(({ label, opacity }, i) => (
          <div
            key={i}
            style={{
              opacity,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 8,
              padding: "8px 16px",
              width: "100%",
            }}
          >
            <span style={{ color: "#22c55e", fontSize: 18, fontWeight: 700 }}>✓</span>
            <span
              style={{
                color: "#86efac",
                fontSize: 18,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Key stats (300–450) ─────────────────────────────────────────────

const StatItem: React.FC<{
  frame: number;
  fps: number;
  delay: number;
  stat: string;
  label: string;
  accent: string;
}> = ({ frame, fps, delay, stat, label, accent }) => {
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90 },
    from: 0,
    to: 1,
  });
  const opacity = fadeIn(frame, delay, 12);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        flex: 1,
        padding: "32px 20px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
      }}
    >
      <p
        style={{
          color: accent,
          fontSize: 52,
          fontWeight: 800,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {stat}
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 20,
          fontWeight: 500,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          margin: 0,
          textAlign: "center",
        }}
      >
        {label}
      </p>
    </div>
  );
};

const Scene3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const headingOpacity = fadeIn(frame, 5, 20);
  const headingY = slideUp(frame, fps, 5);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        gap: 40,
      }}
    >
      <p
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          color: "#f8fafc",
          fontSize: 40,
          fontWeight: 700,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          margin: 0,
          textAlign: "center",
        }}
      >
        Why local analysis{" "}
        <span style={{ color: "#f43f5e" }}>wins</span>
      </p>

      <div style={{ display: "flex", gap: 20, width: "100%" }}>
        <StatItem frame={frame} fps={fps} delay={20} stat="100%" label="Private — guaranteed" accent="#22c55e" />
        <StatItem frame={frame} fps={fps} delay={45} stat="0" label="Cloud uploads" accent="#f43f5e" />
        <StatItem frame={frame} fps={fps} delay={70} stat="∞" label="Your data, your rules" accent="#f8fafc" />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: CTA (450–600) ───────────────────────────────────────────────────

const Scene4: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 85 },
    from: 0.6,
    to: 1,
  });
  const titleOpacity = fadeIn(frame, 10, 22);
  const titleY = slideUp(frame, fps, 10);
  const urlOpacity = fadeIn(frame, 50, 20);
  const urlScale = spring({ frame: frame - 50, fps, config: { damping: 14, stiffness: 80 }, from: 0.8, to: 1 });
  const taglineOpacity = fadeIn(frame, 75, 20);

  // Pulse glow on the URL pill
  const glowOpacity = interpolate(
    frame,
    [80, 100, 120, 140, 160],
    [0.4, 0.9, 0.4, 0.9, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "0 80px",
      }}
    >
      {/* Heart icon stand-in */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          width: 72,
          height: 72,
          background: "linear-gradient(135deg, #f43f5e, #fb7185)",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(244,63,94,0.4)",
        }}
      >
        <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
          <path
            d="M20 34C20 34 2 22 2 11C2 6.03 6.03 2 11 2C14.04 2 16.74 3.54 18.5 5.9C19.1 6.7 20.9 6.7 21.5 5.9C23.26 3.54 25.96 2 29 2C33.97 2 38 6.03 38 11C38 22 20 34 20 34Z"
            fill="white"
          />
        </svg>
      </div>

      <p
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          color: "#f8fafc",
          fontSize: 46,
          fontWeight: 800,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: "-0.5px",
        }}
      >
        Health Data Export
        <br />
        <span style={{ color: "#f43f5e" }}>&amp; Analyzer</span>
      </p>

      <p
        style={{
          opacity: taglineOpacity,
          color: "rgba(255,255,255,0.5)",
          fontSize: 22,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          textAlign: "center",
          margin: 0,
        }}
      >
        Private. Powerful. On your Mac.
      </p>

      <div
        style={{
          opacity: urlOpacity,
          transform: `scale(${urlScale})`,
          background: "rgba(244,63,94,0.12)",
          border: `1px solid rgba(244,63,94,${glowOpacity})`,
          borderRadius: 50,
          padding: "14px 36px",
          boxShadow: `0 0 30px rgba(244,63,94,${glowOpacity * 0.5})`,
        }}
      >
        <p
          style={{
            color: "#fb7185",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            margin: 0,
            letterSpacing: "0.5px",
          }}
        >
          applehealthdata.com
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const PrivacyComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      {/* Ambient gradient background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(244,63,94,0.08) 0%, transparent 60%), " +
            "radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Scene 1: Title */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1 frame={frame} fps={fps} />
      </Sequence>

      {/* Scene 2: Split comparison */}
      <Sequence from={150} durationInFrames={150}>
        <Scene2 frame={frame - 150} fps={fps} />
      </Sequence>

      {/* Scene 3: Stats */}
      <Sequence from={300} durationInFrames={150}>
        <Scene3 frame={frame - 300} fps={fps} />
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence from={450} durationInFrames={150}>
        <Scene4 frame={frame - 450} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
