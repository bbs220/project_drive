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

export const vehiclePlaneConstants = {
  tuning: {
    thrustPower: { value: 60, min: 10, max: 200, label: "thrust power" },
    brakeForce: { value: 5, min: 1, max: 50, label: "brake force" },
    pitchTorque: { value: 5, min: 1, max: 50, label: "pitch torque" },
    rollTorque: { value: 5, min: 1, max: 50, label: "roll torque" },
    yawTorque: { value: 3, min: 1, max: 50, label: "yaw torque" },
    liftMultiplier: { value: 8, min: 1, max: 50, label: "lift multiplier" },
  },
  colliders: {
    fuselageArgs: [0.6, 0.6, 2.1] as [number, number, number],
    fuselagePos: [0, 0, 0] as [number, number, number],
    wingsArgs: [2.5, 0.1, 0.6] as [number, number, number],
    wingsPos: [0, -0.3, 0.2] as [number, number, number],
    wheelsArgs: [0.6, 0.3, 1.0] as [number, number, number],
    wheelsPos: [0, -0.9, -0.35] as [number, number, number],
  },
  visuals: {
    fuselageArgs: [0.6, 2.8, 4, 16] as [number, number, number, number],
    cockpitPos: [0, 0.4, -0.8] as [number, number, number],
    cockpitArgs: [0.55, 16, 16] as [number, number, number],
    wingPos: [0, -0.3, 0.2] as [number, number, number],
    wingArgs: [5, 0.1, 1.2] as [number, number, number],
    turbinePos: [0, 0.7, 1] as [number, number, number],
    turbineArgs: [0.4, 0.4, 1.2, 16] as [number, number, number, number],
    leftTailPos: [-0.5, 0.5, 2] as [number, number, number],
    rightTailPos: [0.5, 0.5, 2] as [number, number, number],
    tailArgs: [0.1, 1.5, 0.8] as [number, number, number],
    frontGearPos: [0, -0.6, -1.2] as [number, number, number],
    leftRearGearPos: [-0.4, -0.6, 0.5] as [number, number, number],
    rightRearGearPos: [0.4, -0.6, 0.5] as [number, number, number],
    strutPos: [0, -0.1, 0] as [number, number, number],
    strutArgs: [0.05, 0.05, 0.8] as [number, number, number],
    frontWheelPos: [0, -0.45, 0] as [number, number, number],
    frontWheelArgs: [0.15, 0.15, 0.1] as [number, number, number],
    rearWheelPos: [0, -0.4, 0] as [number, number, number],
    rearWheelArgs: [0.2, 0.2, 0.15] as [number, number, number],
  },
  rotations: {
    quarterTurn: Math.PI / 2,
    eighthTurn: Math.PI / 4,
  },
};

// define baseline physical constants for helicopter flight model and visuals
export const vehicleHelicopterConstants = {
  tuning: {
    liftForce: { value: 200, min: 50, max: 1000, label: "lift force" },
    descendForce: { value: 250, min: 50, max: 1000, label: "descend force" },
    hoverMultiplier: {
      value: 9.81,
      min: 0,
      max: 50,
      label: "hover multiplier",
    },
    pitchTorque: { value: 10, min: 1, max: 100, label: "pitch torque" },
    rollTorque: { value: 10, min: 1, max: 100, label: "roll torque" },
    yawTorque: { value: 10, min: 1, max: 100, label: "yaw torque" },
    rotorSpeed: { value: 50, min: 1, max: 100, label: "rotor speed" },
    altitudeLimit: { value: 12, min: 10, max: 100, label: "altitude limit" },
    cabinMass: { value: 100, min: 50, max: 500, label: "cabin mass" },
    tailMass: { value: 1, min: 0.1, max: 50, label: "tail mass" },
    cabinWidth: { value: 2, min: 1, max: 5, label: "cabin width" },
    cabinHeight: { value: 2, min: 1, max: 5, label: "cabin height" },
    cabinLength: { value: 3, min: 1, max: 5, label: "cabin length" },
  },
  colliders: {
    cabinPos: [0, 0, 0] as [number, number, number],
    tailPos: [0, 0.5, 2.5] as [number, number, number],
    tailArgs: [0.2, 0.2, 1.5] as [number, number, number],
    leftSkidPos: [-1, -1.2, 0] as [number, number, number],
    rightSkidPos: [1, -1.2, 0] as [number, number, number],
    skidArgs: [1.2, 0.2, 1.75] as [number, number, number],
    skidPos: [0, -1.2, 0] as [number, number, number],
  },
  visuals: {
    cabinRadius: 0.5,
    cabinSmoothness: 4,
    tailBoxArgs: [0.4, 0.4, 3] as [number, number, number],
    skidArgs: [0.2, 0.2, 3.5] as [number, number, number],
    mainRotorOffset: 0.2,
    rotorMastPos: [0, 0.1, 0] as [number, number, number],
    rotorMastArgs: [0.1, 0.1, 0.6] as [number, number, number],
    bladePos: [0, 0.4, 0] as [number, number, number],
    bladeArgs: [0.2, 0.05, 8] as [number, number, number],
    tailRotorGroupPos: [0.25, 0.5, 3.8] as [number, number, number],
    tailRotorMastArgs: [0.05, 0.05, 0.3] as [number, number, number],
    tailBladePos: [0.15, 0, 0] as [number, number, number],
    tailBladeArgs: [0.05, 1.5, 0.15] as [number, number, number],
  },
  rotations: {
    quarterTurn: Math.PI / 2,
  },
  physics: {
    friction: 0,
    zeroVector: 0,
  },
};
