export const sceneConstants = {
  isDev: import.meta.env.DEV,
  fov: 60,
};

export const vehicleRespawnLimit = -50;

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

export const vehicleCarConstants = {
  tuning: {
    // chassis colliders & spatial anchors
    chassisWidth: { value: 2.8, min: 0.5, max: 10, label: "width" },
    chassisHeight: { value: 0.6, min: 0.2, max: 10, label: "height" },
    chassisLength: { value: 4.8, min: 2, max: 10, label: "length" },
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
  },
  physics: {},
};

export const vehicleHelicopterConstants = {
  tuning: {
    // cabin colliders representing the whole body including tail
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
  rotations: {},
  physics: {},
};
