# App Store Preview Video — Remotion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Remotion composition that wraps the raw iPhone screen recording in an App Store-style phone mockup with animated feature callout captions, producing a 1290×2796 (or 886×1920 portrait) MP4 suitable for App Store submission and marketing.

**Architecture:** Remotion React project scaffolded in `video-preview/` inside the website repo. The composition renders the source MP4 inside an SVG/CSS iPhone frame, overlays timed text callouts at key moments, and exports via `npx remotion render`. No custom server needed — pure static render.

**Tech Stack:** Node 23, Remotion 4.x, React 18, TypeScript, ffmpeg (for final encode)

---

### Task 1: Scaffold the Remotion project

**Files:**
- Create: `video-preview/` (new directory)

**Step 1: Initialize Remotion**

```bash
cd /Users/keithrumjahn/Desktop/Projects/AppleHealthData\ Website
npx create-remotion@latest video-preview --template hello-world
```

When prompted: choose "Hello World" template, TypeScript YES.

**Step 2: Verify it runs**

```bash
cd video-preview
npm install
npx remotion studio
```

Open browser preview — should see the default "Hello World" composition.

**Step 3: Copy source video into project**

```bash
cp "/Users/keithrumjahn/Downloads/ScreenRecording_04-11-2026 21-58-56_1.MP4" \
   /Users/keithrumjahn/Desktop/Projects/AppleHealthData\ Website/video-preview/public/recording.mp4
```

**Step 4: Commit**

```bash
cd /Users/keithrumjahn/Desktop/Projects/AppleHealthData\ Website
git add video-preview/
git commit -m "feat: scaffold Remotion project for App Store preview"
```

---

### Task 2: Create the iPhone frame component

**Files:**
- Create: `video-preview/src/IPhoneFrame.tsx`

**Step 1: Write the component**

```tsx
// video-preview/src/IPhoneFrame.tsx
import React from "react";

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

export const IPhoneFrame: React.FC<Props> = ({ width, height, children }) => {
  const borderRadius = width * 0.12;
  const bezelThickness = width * 0.04;
  const dynamicIslandW = width * 0.3;
  const dynamicIslandH = height * 0.018;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius,
        background: "#1a1a1a",
        boxShadow: `
          0 0 0 ${bezelThickness}px #2a2a2a,
          0 0 0 ${bezelThickness + 2}px #111,
          0 40px 80px rgba(0,0,0,0.6)
        `,
        overflow: "hidden",
      }}
    >
      {/* Screen content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: height * 0.018,
          left: "50%",
          transform: "translateX(-50%)",
          width: dynamicIslandW,
          height: dynamicIslandH,
          background: "#000",
          borderRadius: dynamicIslandH / 2,
          zIndex: 10,
        }}
      />
    </div>
  );
};
```

**Step 2: Commit**

```bash
cd /Users/keithrumjahn/Desktop/Projects/AppleHealthData\ Website
git add video-preview/src/IPhoneFrame.tsx
git commit -m "feat: add iPhone frame component with Dynamic Island"
```

---

### Task 3: Define caption data for the 28s recording

Watch the recording mentally — these are the approximate timestamps to place callouts. Adjust times after previewing in Remotion Studio.

**Files:**
- Create: `video-preview/src/captions.ts`

**Step 1: Write caption data**

```ts
// video-preview/src/captions.ts
export interface Caption {
  startFrame: number; // at 30fps
  endFrame: number;
  title: string;
  subtitle?: string;
}

// Video is 28.8s at 30fps = ~864 frames
// Adjust these after previewing:
export const CAPTIONS: Caption[] = [
  { startFrame: 0,   endFrame: 90,  title: "Your Health Data", subtitle: "Private. On-device. Yours." },
  { startFrame: 90,  endFrame: 210, title: "Export from Apple Health", subtitle: "One tap to back up everything" },
  { startFrame: 210, endFrame: 360, title: "Convert XML → CSV", subtitle: "Clean, structured data instantly" },
  { startFrame: 360, endFrame: 510, title: "Analyze with AI", subtitle: "Claude, ChatGPT, or local LLMs" },
  { startFrame: 510, endFrame: 660, title: "Sync to Mac", subtitle: "WiFi sync — no cloud required" },
  { startFrame: 660, endFrame: 864, title: "Your Health. Your Rules.", subtitle: "applehealthdata.com" },
];
```

**Step 2: Commit**

```bash
git add video-preview/src/captions.ts
git commit -m "feat: add caption timing data for preview video"
```

---

### Task 4: Build the Caption overlay component

**Files:**
- Create: `video-preview/src/CaptionOverlay.tsx`

**Step 1: Write the component**

```tsx
// video-preview/src/CaptionOverlay.tsx
import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "./captions";

interface Props {
  captions: Caption[];
}

export const CaptionOverlay: React.FC<Props> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = captions.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );

  if (!active) return null;

  const localFrame = frame - active.startFrame;
  const duration = active.endFrame - active.startFrame;

  const opacity = interpolate(
    localFrame,
    [0, 10, duration - 15, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    localFrame,
    [0, 12],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: "12%",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        padding: "0 40px",
        zIndex: 20,
      }}
    >
      {/* Frosted pill background */}
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: "18px 36px",
          border: "1px solid rgba(255,255,255,0.12)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontSize: 38,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          {active.title}
        </div>
        {active.subtitle && (
          <div
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontSize: 26,
              fontWeight: 400,
              color: "rgba(255,255,255,0.7)",
              marginTop: 6,
            }}
          >
            {active.subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add video-preview/src/CaptionOverlay.tsx
git commit -m "feat: add animated caption overlay with fade/slide transitions"
```

---

### Task 5: Build the main composition

**Files:**
- Modify: `video-preview/src/Root.tsx` (replace default content)
- Create: `video-preview/src/AppPreview.tsx`

**Step 1: Create the main composition component**

```tsx
// video-preview/src/AppPreview.tsx
import React from "react";
import { AbsoluteFill, Video, useVideoConfig } from "remotion";
import { IPhoneFrame } from "./IPhoneFrame";
import { CaptionOverlay } from "./CaptionOverlay";
import { CAPTIONS } from "./captions";

export const AppPreview: React.FC = () => {
  const { width, height } = useVideoConfig();

  // Phone sits centered, with some margin for dark background
  const phoneScale = 0.82;
  const phoneW = width * phoneScale;
  const phoneH = height * phoneScale;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f0f1a 0%, #0a0a14 50%, #050510 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient glow behind phone */}
      <div
        style={{
          position: "absolute",
          width: phoneW * 0.6,
          height: phoneH * 0.4,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.15)",
          filter: "blur(80px)",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <IPhoneFrame width={phoneW} height={phoneH}>
        <Video
          src={staticFile("recording.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <CaptionOverlay captions={CAPTIONS} />
      </IPhoneFrame>
    </AbsoluteFill>
  );
};
```

**Step 2: Register the composition in Root.tsx**

Replace the contents of `video-preview/src/Root.tsx` with:

```tsx
import React from "react";
import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";

// App Store accepted dimensions: 886x1920 (portrait 9:19.5) or 1290x2796
// We'll use 886x1920 as a safe App Store preview size at 30fps
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AppPreview"
        component={AppPreview}
        durationInFrames={864}
        fps={30}
        width={886}
        height={1920}
      />
    </>
  );
};
```

**Step 3: Add the staticFile import to AppPreview.tsx**

Add to the top import line in `AppPreview.tsx`:
```tsx
import { AbsoluteFill, Video, useVideoConfig, staticFile } from "remotion";
```

**Step 4: Preview in Remotion Studio**

```bash
cd video-preview
npx remotion studio
```

Open the composition, scrub through, adjust `captions.ts` timings if needed.

**Step 5: Commit**

```bash
git add video-preview/src/
git commit -m "feat: build main AppPreview composition with phone frame and captions"
```

---

### Task 6: Render the final video

**Step 1: Render**

```bash
cd video-preview
npx remotion render AppPreview ../images/AppStorePreview-new.mp4 \
  --codec=h264 \
  --crf=18 \
  --jpeg-quality=90
```

**Step 2: Verify output**

```bash
ffprobe -v quiet -show_format ../images/AppStorePreview-new.mp4 | grep duration
```

Expected: ~28.8 seconds, ~886×1920.

**Step 3: Commit**

```bash
git add images/AppStorePreview-new.mp4
git commit -m "feat: add rendered App Store preview video from Remotion"
```

---

## Timing Adjustment Guide

After Task 5 Step 4, watch each caption segment and update `captions.ts`:
- All times are in **frames at 30fps** (so 3 seconds = 90 frames)
- The recording is 28.8s = **864 frames** total
- Adjust `startFrame`/`endFrame` values to match what's on screen

## App Store Requirements Checklist

- [ ] Duration: 15–30 seconds (28.8s — passes)
- [ ] Portrait orientation (886×1920 — passes)  
- [ ] H.264 codec (set in render command)
- [ ] No letterboxing (phone frame sits on dark bg — intentional design, not letterboxing)
- [ ] File size under 500MB (should be ~50-100MB at CRF 18)
