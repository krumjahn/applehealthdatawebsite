import React from "react";
import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";

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
    </>
  );
};
