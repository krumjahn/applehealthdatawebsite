import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AppPreview"
        component={AppPreview}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
