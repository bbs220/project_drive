import type CANNON from "cannon-es";

// speedometer div
export const speedElement = document.createElement("div");
speedElement.id = "kmph";

// calculates speed based on vehicle velocity
export function speedCalulation(vehicle: CANNON.RaycastVehicle) {
  const speed = vehicle.chassisBody.velocity.length();
  const speedKmH = Math.floor(speed * 3.6);
  const getSpeed = document.getElementById("kmph") as HTMLDivElement;
  if (getSpeed) {
    getSpeed.innerHTML = speedKmH + " km/h";
  }
}

// container for nos
export const nosContainer = document.createElement("div");
nosContainer.id = "nitros-container";
nosContainer.innerHTML = `<div id="nitros-bar"/>`;

// to be used in steeringControls.ts
// main thing is to keep the settimeout timer same as nLimit in steeringControls.ts
export function rechargeNitros() {
  const grabNitrosBar = document.getElementById("nitros-bar") as HTMLDivElement;

  grabNitrosBar.style.width = "0%";

  setTimeout(() => {
    grabNitrosBar.style.width = "100%";
  }, 1000);
}

// simple intructions for user
export const info = document.createElement("p");
info.id = "instructions";
info.innerHTML = `WASD for steering, Space is handbrake and Shift is boost`;

// again this needs to be a object for easier check box ui in the settings
export const uiToggle = {
  value: false,
};
