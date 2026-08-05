export const sceneConstants = {
  fov: 60,
};

export const vehicleRespawnLimit = -50;

export const vehicleRespawnPos = {
  car: [0, 5, 0] as [number, number, number],
  plane: [10, 5, 0] as [number, number, number],
  helicopter: [-10, 5, 0] as [number, number, number],
};

export const vehicleCarConstants = {
  chassisWidth: { value: 1.6, min: 0.5, max: 3, label: "width" },
  chassisHeight: { value: 0.8, min: 0.2, max: 2, label: "height" },
  chassisLength: { value: 3, min: 2, max: 6, label: "length" },
  mass: { value: 200, min: 100, max: 2000, label: "mass" },
  wheelRadius: { value: 0.35, min: 0.1, max: 1, label: "wheel radius" },
  wheelWidth: { value: 0.25, min: 0.1, max: 1, label: "wheel width" },
  suspensionRestLength: { value: 0.125, min: 0.01, max: 1, label: "susp rest" },
  suspensionStiffness: { value: 24, min: 1, max: 100, label: "susp stiffness" },
  maxSuspensionTravel: { value: 1, min: 0.1, max: 2, label: "susp travel" },
  frictionSlip: { value: 1.5, min: 0.1, max: 5, label: "friction slip" },
  sideFrictionStiffness: {
    value: 3,
    min: 0.1,
    max: 10,
    label: "side friction",
  },
  engineForce: { value: 5, min: 1, max: 500, label: "engine force" },
  boostMultiplier: { value: 2.5, min: 1, max: 5, label: "boost multiplier" },
  brakeForce: { value: 2, min: 1, max: 500, label: "brake force" },
  steeringAngle: { value: 0.5, min: 0.1, max: 1, label: "steering angle" },
  flipImpulse: { value: 0.5, min: 0.1, max: 100, label: "flip impulse" },
};

export const vehiclePlaneConstants = {};

export const vehicleHelicopterConstants = {};
