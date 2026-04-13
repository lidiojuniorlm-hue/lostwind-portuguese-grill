import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { PhoneVideo } from "./phone-video/PhoneVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="phone-demo"
      component={PhoneVideo}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
