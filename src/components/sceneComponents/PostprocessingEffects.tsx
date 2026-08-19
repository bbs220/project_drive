import {
  Bloom,
  EffectComposer,
  DepthOfField,
  ChromaticAberration,
  Noise,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useTweakpane } from "../../hooks/useTweakpane";

const PostprocessingEffects = () => {
  const {
    enableBloom,
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    enableDoF,
    focusDistance,
    focalLength,
    bokehScale,
    enableCA,
    caOffsetX,
    caOffsetY,
    enableNoise,
    noiseOpacity,
    enableBC,
    brightness,
    contrast,
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
      enableDoF: { value: false, folder: "Depth of Field", label: "enable" },
      focusDistance: {
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.001,
        folder: "Depth of Field",
        label: "focus distance",
      },
      focalLength: {
        value: 0.02,
        min: 0.0,
        max: 1.0,
        step: 0.001,
        folder: "Depth of Field",
        label: "focal length",
      },
      bokehScale: {
        value: 2.0,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        folder: "Depth of Field",
        label: "bokeh scale",
      },
      enableCA: {
        value: false,
        folder: "Chromatic Aberration",
        label: "enable",
      },
      caOffsetX: {
        value: 0.002,
        min: -0.05,
        max: 0.05,
        step: 0.001,
        folder: "Chromatic Aberration",
        label: "offset X",
      },
      caOffsetY: {
        value: 0.002,
        min: -0.05,
        max: 0.05,
        step: 0.001,
        folder: "Chromatic Aberration",
        label: "offset Y",
      },
      enableNoise: { value: false, folder: "Noise", label: "enable" },
      noiseOpacity: {
        value: 0.03,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        folder: "Noise",
        label: "opacity",
      },
      enableBC: { value: false, folder: "Color Grade", label: "enable" },
      brightness: {
        value: 0.0,
        min: -1.0,
        max: 1.0,
        step: 0.05,
        folder: "Color Grade",
        label: "brightness",
      },
      contrast: {
        value: 0.2,
        min: -1.0,
        max: 1.0,
        step: 0.05,
        folder: "Color Grade",
        label: "contrast",
      },
    },
  );

  return (
    <EffectComposer enableNormalPass={false}>
      {enableBloom && (
        <Bloom
          mipmapBlur
          intensity={bloomIntensity as number}
          luminanceThreshold={luminanceThreshold as number}
          luminanceSmoothing={luminanceSmoothing as number}
        />
      )}

      {enableDoF && (
        <DepthOfField
          focusDistance={focusDistance as number}
          focalLength={focalLength as number}
          bokehScale={bokehScale as number}
        />
      )}

      {enableBC && (
        <BrightnessContrast
          brightness={brightness as number}
          contrast={contrast as number}
        />
      )}

      {enableCA && (
        <ChromaticAberration
          offset={new THREE.Vector2(caOffsetX as number, caOffsetY as number)}
        />
      )}

      {enableNoise && (
        <Noise
          opacity={noiseOpacity as number}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
    </EffectComposer>
  );
};

export default PostprocessingEffects;
