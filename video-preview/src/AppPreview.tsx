import React from "react";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const AppPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Caption data: [startFrame, endFrame, text]
  const captions: [number, number, string][] = [
    [0, 90, "Track your Apple Health data"],
    [100, 200, "Visualize trends over time"],
    [210, 320, "Export and share easily"],
  ];

  const activeCaption = captions.find(([start, end]) => frame >= start && frame <= end);

  const captionOpacity = activeCaption
    ? interpolate(frame, [activeCaption[0], activeCaption[0] + 15], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  const phoneScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    from: 0.85,
    to: 1,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Gradient background */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      {/* Phone mockup frame */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${phoneScale})`,
            position: "relative",
            width: 390,
            height: 844,
            borderRadius: 55,
            boxShadow: "0 0 0 12px #2a2a2a, 0 0 0 14px #1a1a1a, 0 40px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 34,
              backgroundColor: "#000",
              borderRadius: 20,
              zIndex: 10,
            }}
          />

          {/* Screen recording */}
          <Video
            src={`/recording.mp4`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Caption overlay */}
      {activeCaption && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 120,
            opacity: captionOpacity,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              borderRadius: 16,
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 32,
              paddingRight: 32,
              maxWidth: 800,
            }}
          >
            <p
              style={{
                color: "#ffffff",
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {activeCaption[2]}
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
