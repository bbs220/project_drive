import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { progressManager } from "../ui/loadingScreenUI";

export const envMapLoader = new RGBELoader(progressManager);

export const modelLoader = new GLTFLoader(progressManager);
