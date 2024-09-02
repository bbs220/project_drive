import type CANNON from "cannon-es";

// speedometer div
const speedElement = document.createElement("div");
speedElement.id = "kmph";
document.body.appendChild(speedElement);

// calculates speed based on vehicle velocity
export function speedCalulation(vehicle: CANNON.RaycastVehicle) {
  const speed = vehicle.chassisBody.velocity.length();
  const speedKmH = Math.floor(speed * 3.6);
  const getSpeed = document.getElementById("kmph") as HTMLDivElement;
  getSpeed.innerHTML = speedKmH + " km/h";
}

// container for nos
const nosContainer = document.createElement("div");
nosContainer.id = "nitros-container";
nosContainer.innerHTML = `<div id="nitros-bar"/>`;
document.body.appendChild(nosContainer);

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
const info = document.createElement("p");
info.id = "instructions";
info.innerHTML = `WASD for driving<br />B for handbrake<br />N for nitrous`;
document.body.appendChild(info);
