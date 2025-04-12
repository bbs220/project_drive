import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { pane } from "../helpers/visualHelpers";

// lets start the beginning this entire chunk will be called in main with a delta function in return
export function postProcessing(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  // the hierarchy of these matter so do not call them up or down
  // composer first
  const composer = new EffectComposer(renderer);

  // then base render pass
  const baseRenderPass = new RenderPass(scene, camera);
  composer.addPass(baseRenderPass);

  // then whatever the fuck i please
  const pixelatedPass = new RenderPixelatedPass(3, scene, camera);
  pixelatedPass.enabled = false;
  composer.addPass(pixelatedPass);

  // blooms pretty good but maybe selective bloom is better?
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0,
    0,
    0
  );
  bloomPass.enabled = false;
  const bloomParams = { strength: 0.2, radius: 0, threshold: 0 };
  bloomPass.strength = bloomParams.strength;
  bloomPass.radius = bloomParams.radius;
  bloomPass.threshold = bloomParams.threshold;
  composer.addPass(bloomPass);

  // this is just for shits and giggles i might remove this later on
  const afterImgPass = new AfterimagePass(0.92);
  afterImgPass.enabled = false;
  composer.addPass(afterImgPass);

  // gui with subfolders phew!
  // ...existing code...

  // gui with subfolders
  const postFolder = pane.addFolder({
    title: "✨ Post Processing",
    expanded: false,
  });

  const pixelSubFolder = postFolder.addFolder({
    title: "Pixel",
    expanded: false,
  });

  pixelSubFolder.addBinding(pixelatedPass, "enabled", {
    label: "Enabled",
  });

  const pixelParams = {
    pixelSize: 3,
    normalEdgeStrength: 0.3,
    depthEdgeStrength: 0.4,
    pixelAlignedPanning: true,
  };

  pixelSubFolder
    .addBinding(pixelParams, "pixelSize", {
      label: "Pixel Size",
      min: 1,
      max: 16,
      step: 1,
    })
    .on("change", () => {
      pixelatedPass.setPixelSize(pixelParams.pixelSize);
    });

  pixelSubFolder.addBinding(pixelatedPass, "normalEdgeStrength", {
    label: "Normal Strength",
    min: 0,
    max: 2,
  });

  pixelSubFolder.addBinding(pixelatedPass, "depthEdgeStrength", {
    label: "Depth Strength",
    min: 0,
    max: 1,
  });

  pixelSubFolder.addBinding(pixelParams, "pixelAlignedPanning", {
    label: "Aligned Panning",
  });

  const bloomSubFolder = postFolder.addFolder({
    title: "Bloom",
    expanded: false,
  });

  bloomSubFolder.addBinding(bloomPass, "enabled", {
    label: "Enabled",
  });

  bloomSubFolder
    .addBinding(bloomParams, "strength", {
      label: "Strength",
      min: 0.0,
      max: 3.0,
    })
    .on("change", ({ value }) => {
      bloomPass.strength = Number(value);
    });

  bloomSubFolder
    .addBinding(bloomParams, "radius", {
      label: "Radius",
      min: 0.0,
      max: 1.0,
    })
    .on("change", ({ value }) => {
      bloomPass.radius = Number(value);
    });

  bloomSubFolder
    .addBinding(bloomParams, "threshold", {
      label: "Threshold",
      min: 0.0,
      max: 1.0,
      step: 0.001,
    })
    .on("change", ({ value }) => {
      bloomPass.threshold = Number(value);
    });

  const afterImgSubFolder = postFolder.addFolder({
    title: "After Image",
    expanded: false,
  });

  afterImgSubFolder.addBinding(afterImgPass, "enabled", {
    label: "Enabled",
  });

  afterImgSubFolder.addBinding(afterImgPass.uniforms["damp"], "value", {
    label: "Trail Length",
    min: 0.1,
    max: 1,
    step: 0.01,
  });

  // call this for each frame in main.ts else this shit does not work
  return () => {
    composer.render();
  };
}
