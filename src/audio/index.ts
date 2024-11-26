import * as THREE from "three";
import { progressManager } from "../ui/loadingScreenUI";

const sounds: THREE.Audio[] = [];

let engineReady: THREE.Audio;
let revving: THREE.Audio;
let burnout: THREE.Audio;
let brake: THREE.Audio;
let boost: THREE.Audio;

const audioLoader = new THREE.AudioLoader(progressManager);

const mp3s = ["engineReady", "revving", "burnout", "brake", "boost"];

const listener = new THREE.AudioListener();

export function soundManagerVehicle(camera: THREE.PerspectiveCamera) {
  camera.add(listener);

  mp3s.forEach((singleName) => {
    const sound = new THREE.Audio(listener);
    sound.name = singleName;

    if (singleName === "engineReady") {
      engineReady = sound;
    }

    if (singleName === "revving") {
      revving = sound;
    }

    if (singleName === "burnout") {
      burnout = sound;
    }

    if (singleName === "brake") {
      brake = sound;
    }

    if (singleName === "boost") {
      boost = sound;
    }

    sounds.push(sound);

    audioLoader.load(`sounds/${singleName}.mp3`, (buffer) => {
      sound.setBuffer(buffer);
    });
  });
}
