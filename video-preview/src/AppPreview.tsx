import React from "react";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from "remotion";

export const AppPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Caption data: [startFrame, endFrame, title, subtitle?]
  const captions: [number, number, string, string?][] = [
    [0,   120, "Your Health Data", "Private. On-device. Yours."],
    [120, 270, "Export from Apple Health", "One tap to back up everything"],
    [270, 420, "Convert XML → CSV", "Clean, structured data instantly"],
    [420, 570, "Analyze with AI", "Claude, ChatGPT, or local LLMs"],
    [570, 720, "Sync to Mac", "WiFi sync — no cloud required"],
    [720, 864, "Your Health. Your Rules.", "applehealthdata.com"],
  ];

  const activeCaption = captions.find(([start, end]) => frame >= start && frame <= end);

  const captionOpacity = activeCaption
    ? interpolate(
        frame,
        [activeCaption[0], activeCaption[0] + 12, activeCaption[1] - 12, activeCaption[1]],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const captionY = activeCaption
    ? interpolate(frame, [activeCaption[0], activeCaption[0] + 12], [20, 0], { extrapolateRight: "clamp" })
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
            src={staticFile("recording.mp4")}
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
            paddingBottom: 100,
            opacity: captionOpacity,
            transform: `translateY(${captionY}px)`,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              paddingTop: 18,
              paddingBottom: 18,
              paddingLeft: 36,
              paddingRight: 36,
              maxWidth: 820,
              border: "1px solid rgba(255,255,255,0.12)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#ffffff",
                fontSize: 46,
                fontWeight: 700,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {activeCaption[2]}
            </p>
            {activeCaption[3] && (
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 30,
                  fontWeight: 400,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  margin: "8px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {activeCaption[3]}
              </p>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
