export const sceneConstants = {
  isDev: import.meta.env.DEV,
  fov: 60,
};

export const vehicleRespawnLimit = -50;

export const vehicleRespawnPos = {
  car: [0, 5, 0] as [number, number, number],
  plane: [20, 5, 0] as [number, number, number],
  helicopter: [-20, 5, 0] as [number, number, number],
};

export const vehicleRespawnRot = {
  // 180 degrees on the y axis to flip the car forward
  car: { x: 0, y: 1, z: 0, w: 0 },
  // default identity quaternion (0 degrees)
  plane: { x: 0, y: 0, z: 0, w: 1 },
  // default identity quaternion (0 degrees)
  helicopter: { x: 0, y: 0, z: 0, w: 1 },
};

export const vehicleCarConstants = {
  tuning: {
    // chassis colliders & spatial anchors
    chassisWidth: { value: 1.6, min: 0.5, max: 3, label: "width" },
    chassisHeight: { value: 0.8, min: 0.2, max: 2, label: "height" },
    chassisLength: { value: 3, min: 2, max: 6, label: "length" },
    mass: { value: 200, min: 100, max: 2000, label: "mass" },
    chassisPosX: { value: 0, min: -5, max: 5, label: "chassis pos x" },
    chassisPosY: { value: 0.4, min: -5, max: 5, label: "chassis pos y" },
    chassisPosZ: { value: 0, min: -5, max: 5, label: "chassis pos z" },
    // wheel and suspension tuning
    wheelRadius: { value: 0.35, min: 0.1, max: 1, label: "wheel radius" },
    wheelWidth: { value: 0.25, min: 0.1, max: 1, label: "wheel width" },
    suspensionRestLength: {
      value: 0.125,
      min: 0.01,
      max: 1,
      label: "susp rest",
    },
    suspensionStiffness: {
      value: 24,
      min: 1,
      max: 100,
      label: "susp stiffness",
    },
    maxSuspensionTravel: { value: 1, min: 0.1, max: 2, label: "susp travel" },
    frictionSlip: { value: 1.5, min: 0.1, max: 5, label: "friction slip" },
    sideFrictionStiffness: {
      value: 3,
      min: 0.1,
      max: 10,
      label: "side friction",
    },
    // driving mechanics
    engineForce: { value: 5, min: 1, max: 500, label: "engine force" },
    maxSpeed: { value: 88, min: 10, max: 200, label: "max speed" },
    boostMultiplier: { value: 2.5, min: 1, max: 5, label: "boost multiplier" },
    brakeForce: { value: 2, min: 1, max: 500, label: "brake force" },
    steeringAngle: { value: 0.5, min: 0.1, max: 1, label: "steering angle" },
    flipImpulse: { value: 0.5, min: 0.1, max: 100, label: "flip impulse" },
  },
  physics: {
    friction: 0.5,
  },
};

export const vehiclePlaneConstants = {
  tuning: {
    // flight mechanics
    thrustPower: { value: 300, min: 50, max: 1000, label: "thrust power" },
    brakeForce: { value: 5, min: 1, max: 50, label: "brake force" },
    pitchTorque: { value: 10, min: 1, max: 100, label: "pitch torque" },
    rollTorque: { value: 10, min: 1, max: 100, label: "roll torque" },
    yawTorque: { value: 10, min: 1, max: 100, label: "yaw torque" },
    liftMultiplier: { value: 0.1, min: 0.01, max: 1, label: "lift multiplier" },
    maxSpeed: { value: 200, min: 50, max: 500, label: "max speed" },
    airborneThreshold: {
      value: 2.5,
      min: 1,
      max: 10,
      label: "airborne height",
    },
    // plane colliders
    planeMass: { value: 100, min: 50, max: 500, label: "plane mass" },
    planeWidth: { value: 8.5, min: 0.1, max: 20, label: "plane width" },
    planeHeight: { value: 3.5, min: 0.1, max: 20, label: "plane height" },
    planeLength: { value: 20, min: 0.1, max: 20, label: "plane length" },
    planePosX: { value: 0, min: -20, max: 20, label: "plane pos x" },
    planePosY: { value: 0, min: -20, max: 20, label: "plane pos y" },
    planePosZ: { value: 2.7, min: -20, max: 20, label: "plane pos z" },
    // visual anchors
    cockpitPosX: { value: 0, min: -20, max: 20, label: "cockpit pos x" },
    cockpitPosY: { value: 0.68, min: -20, max: 20, label: "cockpit pos y" },
    cockpitPosZ: { value: -2.8, min: -20, max: 20, label: "cockpit pos z" },
  },
  physics: {
    friction: 1.5,
  },
};

export const vehicleHelicopterConstants = {
  tuning: {
    // flight mechanics
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
    maxSpeed: { value: 82, min: 20, max: 200, label: "max speed" },
    airborneThreshold: {
      value: 3.5,
      min: 1,
      max: 10,
      label: "airborne height",
    },
    // cabin colliders representing the whole body including tail
    cabinMass: { value: 100, min: 50, max: 500, label: "cabin mass" },
    cabinWidth: { value: 3.5, min: 0.1, max: 20, label: "cabin width" },
    cabinHeight: { value: 5.5, min: 0.1, max: 20, label: "cabin height" },
    cabinLength: { value: 14, min: 0.1, max: 20, label: "cabin length" },
    cabinPosX: { value: 0, min: -20, max: 20, label: "cabin pos x" },
    cabinPosY: { value: 0, min: -20, max: 20, label: "cabin pos y" },
    cabinPosZ: { value: 1, min: -20, max: 20, label: "cabin pos z" },
    // rotor visual anchors
    mainRotorPosX: { value: 0, min: -20, max: 20, label: "main rotor x" },
    mainRotorPosY: { value: 2.25, min: -20, max: 20, label: "main rotor y" },
    mainRotorPosZ: { value: -0.9, min: -20, max: 20, label: "main rotor z" },
    tailRotorPosX: { value: 0, min: -20, max: 20, label: "tail rotor x" },
    tailRotorPosY: { value: 0.1, min: -20, max: 20, label: "tail rotor y" },
    tailRotorPosZ: { value: 6.46, min: -20, max: 20, label: "tail rotor z" },
  },
  rotations: {
    quarterTurn: Math.PI / 2,
  },
  physics: {
    friction: 1.5,
    zeroVector: 0,
  },
};
