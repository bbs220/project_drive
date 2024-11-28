import * as THREE from "three";
import { progressManager } from "../ui/loadingScreenUI";

const allSounds: THREE.Audio[] = [];

// these all are going to be conditionally called in steering controls
export let engineReady: THREE.Audio;
export let revving: THREE.Audio;
export let brake: THREE.Audio;
export let boost: THREE.Audio;

// please dont fuck me up with high volume on first page load
const audioLoader = new THREE.AudioLoader(progressManager);

const allSFX = ["engineReady", "revving", "brake", "boost"];

const listener = new THREE.AudioListener();

export function soundManagerVehicle(camera: THREE.PerspectiveCamera) {
  camera.add(listener);

  allSFX.forEach((singleName) => {
    const sound = new THREE.Audio(listener);
    sound.name = singleName;

    if (singleName === "engineReady") {
      engineReady = sound;
    }

    if (singleName === "revving") {
      revving = sound;
    }

    if (singleName === "brake") {
      brake = sound;
    }

    if (singleName === "boost") {
      boost = sound;
    }

    allSounds.push(sound);

    audioLoader.load(`sounds/${singleName}.mp3`, (buffer) => {
      sound.setBuffer(buffer);
    });
  });
}
