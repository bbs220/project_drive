// import required postprocessing components
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
// import our custom tweakpane hook
import { useTweakpane } from "../../hooks/useTweakpane";

const PostprocessingEffects = () => {
  // destructured state from our config with nested folders
  const {
    enableBloom,
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    enableVignette,
    vignetteOffset,
    vignetteDarkness,
  } = useTweakpane(
    { title: "🌟 Post-Processing", expanded: false },
    {
      enableBloom: { value: false, folder: "Bloom", label: "enable" },
      bloomIntensity: {
        value: 1.5,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        folder: "Bloom",
        label: "intensity",
      },
      luminanceThreshold: {
        value: 0.1,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Bloom",
        label: "threshold",
      },
      luminanceSmoothing: {
        value: 0.9,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Bloom",
        label: "smoothing",
      },
      enableVignette: { value: false, folder: "Vignette", label: "enable" },
      vignetteOffset: {
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Vignette",
        label: "offset",
      },
      vignetteDarkness: {
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Vignette",
        label: "darkness",
      },
    },
  );

  return (
    <EffectComposer enableNormalPass={false}>
      {/* conditional rendering for bloom effect */}
      {enableBloom && (
        <Bloom
          mipmapBlur
          intensity={bloomIntensity as number}
          luminanceThreshold={luminanceThreshold as number}
          luminanceSmoothing={luminanceSmoothing as number}
        />
      )}
      {/* conditional rendering for vignette effect */}
      {enableVignette && (
        <Vignette
          offset={vignetteOffset as number}
          darkness={vignetteDarkness as number}
        />
      )}
    </EffectComposer>
  );
};

export default PostprocessingEffects;
