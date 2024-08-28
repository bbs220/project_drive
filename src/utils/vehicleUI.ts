import type CANNON from "cannon-es";

const speedElement = document.createElement("div");
speedElement.id = "kmph";
document.body.appendChild(speedElement);

export function speedCalulation(vehicle: CANNON.RaycastVehicle) {
  const speed = vehicle.chassisBody.velocity.length();
  const speedKmH = Math.floor(speed * 3.6);
  const getSpeed = document.getElementById("kmph") as HTMLDivElement;
  getSpeed.innerHTML = speedKmH + " km/h";
}

const nosContainer = document.createElement("div");
nosContainer.id = "nitros-container";
nosContainer.innerHTML = '<div id="nitros-bar"/>';
document.body.appendChild(nosContainer);

export function rechargeNitros() {
  const grabNitrosBar = document.getElementById("nitros-bar") as HTMLDivElement;

  grabNitrosBar.style.width = "0%";

  setTimeout(() => {
    grabNitrosBar.style.width = "100%";
  }, 1000);
}
