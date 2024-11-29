import * as THREE from "three";
import { envMapLoader } from "./assetLoader";
import { allHDRs } from "./assetPaths";
import { gui } from "../helpers/visualHelpers";

// one toggle to control them all
let textureToggle: THREE.Texture | null;

// some parameters
const hdrParams = {
  background: false,
  environment: true,
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
    scene.background = null;
  });

  // gui part
  hdriFolder
    .add(hdrParams, "environment")
    .name("Enabled")
    .onChange(toggleEnvironment);
  hdriFolder
    .add(hdrParams, "background")
    .name("Background")
    .onChange(toggleBackground);

  // dont ask why isnt value passed when the function is called
  function toggleBackground(value: boolean) {
    if (value === true) {
      scene.background = textureToggle;
    } else {
      scene.background = null;
    }
  }

  // same dont ask here too
  function toggleEnvironment(value: boolean) {
    if (value === true) {
      scene.environment = textureToggle;
    } else {
      scene.environment = null;
    }
  }
}
