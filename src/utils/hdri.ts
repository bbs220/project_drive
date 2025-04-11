import * as THREE from "three";
import { envMapLoader } from "./assetLoader";
import { allHDRs } from "./assetPaths";
import { gui } from "../helpers/visualHelpers";

// one toggle to control them all
let textureToggle: THREE.Texture | null;

// some parameters
const hdrParams = {
  enabled: true,
  blurIntensity: 0,
};

// setting up gui
const hdriFolder = gui.addFolder("☀️ HDRI");
hdriFolder.close();

// environment map for better lightings but does not project shadows
export function addHDRI(scene: THREE.Scene) {
  envMapLoader.load(allHDRs.daySky, (texture: THREE.Texture) => {
    textureToggle = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    scene.backgroundBlurriness = 0;
  });

  // gui part
  hdriFolder.add(hdrParams, "enabled").name("Enable").onChange(toggleHDRI);
  hdriFolder
    .add(hdrParams, "blurIntensity", 0, 1, 0.01)
    .name("Blur")
    .onChange(updateBlur);

  // dont ask why isnt value passed when the function is called
  function toggleHDRI(value: boolean) {
    if (value === true) {
      scene.background = textureToggle;
      scene.environment = textureToggle;
    } else {
      scene.background = null;
      scene.environment = null;
    }
  }

  function updateBlur() {
    if (textureToggle) {
      scene.backgroundBlurriness = hdrParams.blurIntensity;
    }
  }
}
