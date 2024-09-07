import * as THREE from "three";
import { envMapLoader } from "./assetLoader";
import { allHDRs } from "./assetPaths";
import { gui } from "../helpers/visualHelpers";

let textureToggle: THREE.Texture | null;

// environment map for better lightings but does not project shadows
export function addHDRI(scene: THREE.Scene) {
  envMapLoader.load(allHDRs.city, (texture: THREE.Texture) => {
    textureToggle = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = null;
    scene.background = null;
  });
}

const hdriFolder = gui.addFolder("HDRI");
hdriFolder.close();
