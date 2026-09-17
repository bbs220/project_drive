export const sceneConstants = {
  isDev: import.meta.env.DEV,
  fov: 60,
};

// unified spawn object split by game mode
export const respawnValues = {
  drive: {
    player: {
      position: [0, 5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    },
    car: {
      position: [0, 5, -100] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    },
    plane: {
      position: [100, 5, -100] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    },
    helicopter: {
      position: [-100, 5, -100] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    },
  },
  garage: {
    player: {
      position: [0, 2, 5] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    },
    car: {
      position: [0, 2, 0] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    },
    plane: {
      position: [0, 2, 0] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    },
    helicopter: {
      position: [0, 2, 0] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    },
  },
  universalRespawnLimit: -50,
};

export const playerConstants = {
  tuning: {
    // physical capsule dimensions and weight
    capsuleHalfHeight: {
      value: 0.7,
      min: 0.1,
      max: 2,
      label: "capsule half height",
    },
    capsuleRadius: { value: 0.3, min: 0.1, max: 1, label: "capsule radius" },
    playerMass: { value: 30, min: 10, max: 200, label: "player mass" },

    // movement physics
    walkSpeed: { value: 2, min: 1, max: 20, label: "walk speed" },
    sprintSpeed: { value: 8, min: 2, max: 40, label: "sprint speed" },
    jumpForce: { value: 5, min: 1, max: 20, label: "jump force" },
    gravityMultiplier: { value: 2, min: 0.5, max: 5, label: "gravity mult" },

    // bloom
    emissionColor: { value: "#ffffff", label: "emission color" },
    emissionStrength: { value: 1, min: 0, max: 10, label: "emission strength" },

    // debug tools
    debugBones: { value: false, label: "bones" },
    debugMesh: { value: false, label: "wireframe" },
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
    maxReverseSpeed: {
      value: 10,
      min: 1,
      max: 100,
      label: "max reverse speed",
    },
    boostMultiplier: { value: 2.5, min: 1, max: 5, label: "boost multiplier" },
    brakeForce: { value: 2, min: 1, max: 500, label: "brake force" },
    steeringAngle: { value: 0.5, min: 0.1, max: 1, label: "steering angle" },
    flipImpulse: { value: 0.5, min: 0.1, max: 100, label: "flip impulse" },
    // debug wireframes toggle
    debugMesh: { value: false, label: "wireframe" },
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
    planePosZ: { value: -3, min: -20, max: 20, label: "plane pos z" },
    cockpitPosX: { value: 0, min: -20, max: 20, label: "cockpit pos x" },
    cockpitPosY: { value: 0.68, min: -20, max: 20, label: "cockpit pos y" },
    cockpitPosZ: { value: -2.8, min: -20, max: 20, label: "cockpit pos z" },

    // physics colliders - single centralized mass for arcade forgiveness
    chassisWidth: { value: 3.8, min: 0.1, max: 20, label: "chassis width" },
    chassisHeight: { value: 0.6, min: 0.1, max: 20, label: "chassis height" },
    chassisLength: { value: 10, min: 0.1, max: 20, label: "chassis length" },
    chassisRadius: { value: 1.4, min: 0, max: 2, label: "chassis radius" },
    chassisMass: { value: 500, min: 10, max: 2000, label: "chassis mass" },

    // unity airplane extracted movement speeds
    defaultSpeed: { value: 30, min: 5, max: 100, label: "default speed" },
    turboSpeed: { value: 60, min: 10, max: 200, label: "turbo speed" },
    accelerating: { value: 10, min: 0.1, max: 50, label: "accelerating" },
    deaccelerating: { value: 5, min: 0.1, max: 50, label: "deaccelerating" },

    // unity airplane extracted rotating speeds
    yawSpeed: { value: 50, min: 5, max: 200, label: "yaw speed" },
    pitchSpeed: { value: 100, min: 5, max: 300, label: "pitch speed" },
    rollSpeed: { value: 200, min: 5, max: 500, label: "roll speed" },

    // unity turbo multipliers
    yawTurboMultiplier: {
      value: 0.3,
      min: 0.1,
      max: 5,
      label: "yaw turbo mult",
    },
    pitchTurboMultiplier: {
      value: 0.5,
      min: 0.1,
      max: 5,
      label: "pitch turbo mult",
    },
    rollTurboMultiplier: {
      value: 1,
      min: 0.1,
      max: 5,
      label: "roll turbo mult",
    },

    // unity sideways forces for banking and artificial lift drop
    sidewaysMovement: { value: 15, min: 0.1, max: 50, label: "sideways move" },
    sidewaysMovementXRot: {
      value: 0.012,
      min: 0.001,
      max: 0.1,
      label: "sideways x rot",
    },
    sidewaysMovementYRot: {
      value: 1.5,
      min: 0.1,
      max: 5,
      label: "sideways y rot",
    },
    sidewaysMovementYPos: {
      value: 0.1,
      min: 0,
      max: 1,
      label: "sideways y pos",
    },
    // strict angle limits
    maxPitchAngle: { value: 30, min: 5, max: 90, label: "max pitch angle" },
    maxRollAngle: { value: 30, min: 5, max: 90, label: "max roll angle" },
    altitudeLimit: { value: 200, min: 100, max: 1000, label: "altitude limit" },
    debugMesh: { value: false, label: "wireframe" },
  },
  physics: {},
};

export const vehicleHelicopterConstants = {
  tuning: {
    // visuals
    cabinPosX: { value: 0, min: -20, max: 20, label: "cabin pos x" },
    cabinPosY: { value: 0, min: -20, max: 20, label: "cabin pos y" },
    cabinPosZ: { value: -0.35, min: -20, max: 20, label: "cabin pos z" },
    mainRotorPosX: { value: 0, min: -20, max: 20, label: "main rotor x" },
    mainRotorPosY: { value: 2.25, min: -20, max: 20, label: "main rotor y" },
    mainRotorPosZ: { value: -0.9, min: -20, max: 20, label: "main rotor z" },
    tailRotorPosX: { value: 0, min: -20, max: 20, label: "tail rotor x" },
    tailRotorPosY: { value: 0.1, min: -20, max: 20, label: "tail rotor y" },
    tailRotorPosZ: { value: 6.46, min: -20, max: 20, label: "tail rotor z" },

    // physics colliders
    chassisWidth: { value: 1.75, min: 0.1, max: 5, label: "chassis width" },
    chassisHeight: { value: 1.2, min: 0.1, max: 5, label: "chassis height" },
    chassisLength: { value: 6.3, min: 0.1, max: 10, label: "chassis length" },
    chassisRadius: { value: 1.4, min: 0, max: 2, label: "chassis radius" },
    chassisMass: { value: 300, min: 10, max: 2000, label: "chassis mass" },

    // arcade velocity override mechanics
    verticalSpeed: { value: 15, min: 5, max: 100, label: "vertical speed" },
    forwardSpeed: { value: 40, min: 10, max: 100, label: "forward speed" },
    strafeSpeed: { value: 25, min: 5, max: 100, label: "strafe speed" },
    yawSpeed: { value: 15, min: 0.5, max: 100, label: "yaw speed" },
    maxPitch: { value: 25, min: 10, max: 60, label: "max pitch deg" },
    maxRoll: { value: 25, min: 10, max: 60, label: "max roll deg" },
    smoothing: { value: 5, min: 1, max: 20, label: "visual smoothing" },
    rotorSpeed: { value: 20, min: 5, max: 50, label: "rotor speed" },
    altitudeLimit: { value: 200, min: 100, max: 1000, label: "altitude limit" },
    debugMesh: { value: false, label: "wireframe" },
  },
  physics: {},
};
