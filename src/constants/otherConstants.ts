export const sceneConstants = {
  isDev: import.meta.env.DEV,
  fov: 60,
};

export const respawnLimit = -50;

// unified spawn object using math pi for precise euler rotations
export const vehicleRespawnValues = {
  car: {
    position: [0, 5, 0] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
  },
  plane: {
    position: [20, 5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  helicopter: {
    position: [-20, 5, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
};

export const playerRespawnValues = {
  position: [0, 5, 10] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
};

export const playerConstants = {
  tuning: {
    // physical capsule dimensions and weight
    capsuleHalfHeight: {
      value: 0.3,
      min: 0.1,
      max: 2,
      label: "capsule half height",
    },
    capsuleRadius: { value: 0.2, min: 0.1, max: 1, label: "capsule radius" },
    playerMass: { value: 30, min: 10, max: 200, label: "player mass" },

    // movement physics
    walkSpeed: { value: 4, min: 1, max: 20, label: "walk speed" },
    sprintSpeed: { value: 8, min: 2, max: 40, label: "sprint speed" },
    jumpForce: { value: 5, min: 1, max: 20, label: "jump force" },
    gravityMultiplier: { value: 2, min: 0.5, max: 5, label: "gravity mult" },
  },
};

export const vehicleCarConstants = {
  tuning: {
    // chassis colliders & spatial anchors
    chassisWidth: { value: 2.8, min: 0.5, max: 10, label: "width" },
    chassisHeight: { value: 0.55, min: 0.2, max: 10, label: "height" },
    chassisLength: { value: 4.8, min: 2, max: 10, label: "length" },
    chassisBorderRadius: { value: 0.1, min: 0.1, max: 1, label: "edge radius" },
    mass: { value: 200, min: 100, max: 2000, label: "mass" },
    chassisPosX: { value: 0, min: -10, max: 10, label: "chassis pos x" },
    chassisPosY: { value: 0.4, min: -10, max: 10, label: "chassis pos y" },
    chassisPosZ: { value: 0, min: -10, max: 10, label: "chassis pos z" },
    // wheel spatial anchors
    wheelPosX: { value: 1.6, min: 0.1, max: 3, label: "wheel pos x" },
    wheelPosY: { value: 0.45, min: -2, max: 2, label: "wheel pos y" },
    frontWheelPosZ: { value: 2.03, min: 0.1, max: 5, label: "front wheel z" },
    rearWheelPosZ: { value: -1.95, min: -5, max: -0.1, label: "rear wheel z" },
    // wheel and suspension tuning
    wheelRadius: { value: 0.55, min: 0.1, max: 1, label: "wheel radius" },
    wheelWidth: { value: 0.7, min: 0.1, max: 1, label: "wheel width" },
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
    engineForce: { value: 40, min: 1, max: 500, label: "engine force" },
    maxSpeed: { value: 88, min: 10, max: 200, label: "max speed" },
    boostMultiplier: { value: 2.5, min: 1, max: 5, label: "boost multiplier" },
    brakeForce: { value: 2, min: 1, max: 500, label: "brake force" },
    steeringAngle: { value: 0.5, min: 0.1, max: 1, label: "steering angle" },
    flipImpulse: { value: 0.5, min: 0.1, max: 100, label: "flip impulse" },
    // debug wireframes toggle
    showWireframes: { value: false, label: "show debug wheels" },
  },
  physics: {
    friction: 0.5,
  },
};

export const vehiclePlaneConstants = {
  tuning: {
    // visuals
    planePosX: { value: 0, min: -20, max: 20, label: "plane pos x" },
    planePosY: { value: 0, min: -20, max: 20, label: "plane pos y" },
    planePosZ: { value: 2.7, min: -20, max: 20, label: "plane pos z" },
    cockpitPosX: { value: 0, min: -20, max: 20, label: "cockpit pos x" },
    cockpitPosY: { value: 0.68, min: -20, max: 20, label: "cockpit pos y" },
    cockpitPosZ: { value: -2.8, min: -20, max: 20, label: "cockpit pos z" },

    // physics colliders utilizing custom four point layout
    bearingRadius: { value: 1.75, min: 0.1, max: 5, label: "bearing radius" },
    bearingMass: { value: 25, min: 1, max: 200, label: "bearing mass" },
    wingOffset: { value: 10, min: 0.1, max: 20, label: "wing offset x" },
    noseOffsetZ: { value: -4, min: -20, max: 0, label: "nose offset z" },
    tailOffsetZ: { value: 14, min: 0, max: 20, label: "tail offset z" },
    bearingOffsetY: {
      value: -0.65,
      min: -10,
      max: 10,
      label: "bearing offset y",
    },
  },
  physics: {},
};

export const vehicleHelicopterConstants = {
  tuning: {
    // visuals
    cabinPosX: { value: 0, min: -20, max: 20, label: "cabin pos x" },
    cabinPosY: { value: 0, min: -20, max: 20, label: "cabin pos y" },
    cabinPosZ: { value: 1, min: -20, max: 20, label: "cabin pos z" },
    mainRotorPosX: { value: 0, min: -20, max: 20, label: "main rotor x" },
    mainRotorPosY: { value: 2.25, min: -20, max: 20, label: "main rotor y" },
    mainRotorPosZ: { value: -0.9, min: -20, max: 20, label: "main rotor z" },
    tailRotorPosX: { value: 0, min: -20, max: 20, label: "tail rotor x" },
    tailRotorPosY: { value: 0.1, min: -20, max: 20, label: "tail rotor y" },
    tailRotorPosZ: { value: 6.46, min: -20, max: 20, label: "tail rotor z" },

    // physics colliders utilizing custom six point layout
    centerRadius: { value: 2, min: 0.1, max: 5, label: "center radius" },
    centerMass: { value: 150, min: 10, max: 1000, label: "center mass" },
    skidRadius: { value: 0.8, min: 0.1, max: 5, label: "skid radius" },
    skidMass: { value: 15, min: 1, max: 100, label: "skid mass" },
    skidWidth: { value: 2, min: 0.1, max: 10, label: "skid width" },
    skidLength: { value: 2, min: 0.1, max: 10, label: "skid length" },
    skidHeight: { value: -2.4, min: -5, max: 5, label: "skid height" },
    tailRadius: { value: 0.6, min: 0.1, max: 5, label: "tail radius" },
    tailMass: { value: 0.1, min: 0.1, max: 100, label: "tail mass" },
    tailPosZ: { value: 7.4, min: 0, max: 20, label: "tail pos z" },
    tailPosY: { value: 0.7, min: -5, max: 10, label: "tail pos y" },

    // physics flight mechanics
    liftForce: { value: 2000, min: 1000, max: 5000, label: "lift force" },
    descendForce: { value: 2000, min: 500, max: 2000, label: "descend force" },
    pitchTorque: { value: 400, min: 10, max: 2000, label: "pitch torque" },
    rollTorque: { value: 400, min: 10, max: 2000, label: "roll torque" },
    yawTorque: { value: 400, min: 10, max: 2000, label: "yaw torque" },
    rotorSpeed: { value: 20, min: 1, max: 50, label: "rotor speed" },
    autoLevelStrength: {
      value: 1500,
      min: 10,
      max: 5000,
      label: "auto level str",
    },
    angularDamping: { value: 0.95, min: 0, max: 1, label: "angular damping" },

    // arcade limiters
    altitudeLimit: { value: 200, min: 50, max: 1000, label: "altitude limit" },
    maxLeanAngle: { value: 30, min: 5, max: 90, label: "max lean deg" },
  },
  physics: {},
};
