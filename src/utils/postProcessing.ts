import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { gui } from "../helpers/visualHelpers";

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
  const pixelatedPass = new RenderPixelatedPass(6, scene, camera);
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
  const afterImgPass = new AfterimagePass(0.1);
  afterImgPass.enabled = false;
  composer.addPass(afterImgPass);
  // gui with subfolders phew!
  const postFolder = gui.addFolder("Post Processing");
  postFolder.close();

  const pixelSubFolder = postFolder.addFolder("Pixel");
  pixelSubFolder.close();
  pixelSubFolder.add(pixelatedPass, "enabled").name("Enabled");
  const pixelParams = {
    pixelSize: 6,
    normalEdgeStrength: 0.3,
    depthEdgeStrength: 0.4,
    pixelAlignedPanning: true,
  };
  pixelSubFolder
    .add(pixelParams, "pixelSize", 1, 16)
    .onChange(() => {
      pixelatedPass.setPixelSize(pixelParams.pixelSize);
    })
    .step(1)
    .name("Pixel Size");
  pixelSubFolder
    .add(pixelatedPass, "normalEdgeStrength", 0, 2)
    .name("Normal Strength");
  pixelSubFolder
    .add(pixelatedPass, "depthEdgeStrength", 0, 1)
    .name("Depth Strength");
  pixelSubFolder
    .add(pixelParams, "pixelAlignedPanning")
    .name("Aligned Panning");

  const bloomSubFolder = postFolder.addFolder("Bloom");
  bloomSubFolder.close();
  bloomSubFolder.add(bloomPass, "enabled").name("Enabled");
  bloomSubFolder
    .add(bloomParams, "strength", 0.0, 3.0)
    .onChange(function (value: number) {
      bloomPass.strength = Number(value);
    })
    .name("Strength");
  bloomSubFolder
    .add(bloomParams, "radius", 0.0, 1.0)
    .onChange(function (value: number) {
      bloomPass.radius = Number(value);
    })
    .name("Radius");
  bloomSubFolder
    .add(bloomParams, "threshold", 0.0, 1.0)
    .onChange(function (value: number) {
      bloomPass.threshold = Number(value);
    })
    .step(0.001)
    .name("Threshold");

  const afterImgSubFolder = postFolder.addFolder("After Image");
  afterImgSubFolder.close();
  afterImgSubFolder.add(afterImgPass, "enabled").name("Enabled");
  afterImgSubFolder
    .add(afterImgPass.uniforms["damp"], "value", 0.1, 1)
    .step(0.001)
    .name("Trail Length");

  // call this for each frame in main.ts else this shit does not work
  return () => {
    composer.render();
  };
}
