import React from "react";
import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";
import { PrivacyComparison } from "./PrivacyComparison";
import { AIAnalysisWorkflow } from "./AIAnalysisWorkflow";
import { ExportToCSV } from "./ExportToCSV";
import { OpenClawWorkflow } from "./OpenClawWorkflow";
import { AppComparison } from "./AppComparison";
import { BackupGuide } from "./BackupGuide";
import { BiohackerPro } from "./BiohackerPro";

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
        defaultProps={{}}
      />
      <Composition
        id="PrivacyComparison"
        component={PrivacyComparison}
        durationInFrames={600}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="AIAnalysisWorkflow"
        component={AIAnalysisWorkflow}
        durationInFrames={600}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="ExportToCSV"
        component={ExportToCSV}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="OpenClawWorkflow"
        component={OpenClawWorkflow}
        durationInFrames={600}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="AppComparison"
        component={AppComparison}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="BackupGuide"
        component={BackupGuide}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="BiohackerPro"
        component={BiohackerPro}
        durationInFrames={600}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
    </>
  );
};
