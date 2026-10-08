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
      folder: "Player",
    },
    capsuleRadius: {
      value: 0.3,
      min: 0.1,
      max: 1,
      label: "capsule radius",
      folder: "Player",
    },
    playerMass: {
      value: 30,
      min: 10,
      max: 200,
      label: "player mass",
      folder: "Player",
    },

    // movement physics
    walkSpeed: {
      value: 2,
      min: 1,
      max: 20,
      label: "walk speed",
      folder: "Player",
    },
    sprintSpeed: {
      value: 8,
      min: 2,
      max: 40,
      label: "sprint speed",
      folder: "Player",
    },
    jumpForce: {
      value: 5,
      min: 1,
      max: 20,
      label: "jump force",
      folder: "Player",
    },
    gravityMultiplier: {
      value: 2,
      min: 0.5,
      max: 5,
      label: "gravity mult",
      folder: "Player",
    },

    // bloom
    emissionColor: {
      value: "#ffffff",
      label: "emission color",
      folder: "Player",
    },
    emissionStrength: {
      value: 1,
      min: 0,
      max: 10,
      label: "emission strength",
      folder: "Player",
    },

    // debug tools
    debugBones: { value: false, label: "bones", folder: "Player" },
    debugMesh: { value: false, label: "wireframe", folder: "Player" },
  },
};

export const vehicleCarConstants = {
  tuning: {
    // chassis colliders & spatial anchors
    chassisWidth: {
      value: 2.8,
      min: 0.5,
      max: 10,
      label: "width",
      folder: "Car",
    },
    chassisHeight: {
      value: 0.55,
      min: 0.2,
      max: 10,
      label: "height",
      folder: "Car",
    },
    chassisLength: {
      value: 4.8,
      min: 2,
      max: 10,
      label: "length",
      folder: "Car",
    },
    chassisBorderRadius: {
      value: 0.1,
      min: 0.1,
      max: 1,
      label: "edge radius",
      folder: "Car",
    },
    mass: { value: 200, min: 100, max: 2000, label: "mass", folder: "Car" },
    chassisPosX: {
      value: 0,
      min: -10,
      max: 10,
      label: "chassis pos x",
      folder: "Car",
    },
    chassisPosY: {
      value: 0.4,
      min: -10,
      max: 10,
      label: "chassis pos y",
      folder: "Car",
    },
    chassisPosZ: {
      value: 0,
      min: -10,
      max: 10,
      label: "chassis pos z",
      folder: "Car",
    },
    // wheel spatial anchors
    wheelPosX: {
      value: 1.6,
      min: 0.1,
      max: 3,
      label: "wheel pos x",
      folder: "Car",
    },
    wheelPosY: {
      value: 0.45,
      min: -2,
      max: 2,
      label: "wheel pos y",
      folder: "Car",
    },
    frontWheelPosZ: {
      value: 2.03,
      min: 0.1,
      max: 5,
      label: "front wheel z",
      folder: "Car",
    },
    rearWheelPosZ: {
      value: -1.95,
      min: -5,
      max: -0.1,
      label: "rear wheel z",
      folder: "Car",
    },
    // wheel and suspension tuning
    wheelRadius: {
      value: 0.55,
      min: 0.1,
      max: 1,
      label: "wheel radius",
      folder: "Car",
    },
    wheelWidth: {
      value: 0.7,
      min: 0.1,
      max: 1,
      label: "wheel width",
      folder: "Car",
    },
    suspensionRestLength: {
      value: 0.125,
      min: 0.01,
      max: 1,
      label: "susp rest",
      folder: "Car",
    },
    suspensionStiffness: {
      value: 24,
      min: 1,
      max: 100,
      label: "susp stiffness",
      folder: "Car",
    },
    maxSuspensionTravel: {
      value: 1,
      min: 0.1,
      max: 2,
      label: "susp travel",
      folder: "Car",
    },
    frictionSlip: {
      value: 1.5,
      min: 0.1,
      max: 5,
      label: "friction slip",
      folder: "Car",
    },
    sideFrictionStiffness: {
      value: 3,
      min: 0.1,
      max: 10,
      label: "side friction",
      folder: "Car",
    },
    // driving mechanics
    engineForce: {
      value: 40,
      min: 1,
      max: 500,
      label: "engine force",
      folder: "Car",
    },
    maxSpeed: {
      value: 88,
      min: 10,
      max: 200,
      label: "max speed",
      folder: "Car",
    },
    maxReverseSpeed: {
      value: 10,
      min: 1,
      max: 100,
      label: "max reverse speed",
      folder: "Car",
    },
    boostMultiplier: {
      value: 2.5,
      min: 1,
      max: 5,
      label: "boost multiplier",
      folder: "Car",
    },
    brakeForce: {
      value: 2,
      min: 1,
      max: 500,
      label: "brake force",
      folder: "Car",
    },
    steeringAngle: {
      value: 0.5,
      min: 0.1,
      max: 1,
      label: "steering angle",
      folder: "Car",
    },
    flipImpulse: {
      value: 0.5,
      min: 0.1,
      max: 100,
      label: "flip impulse",
      folder: "Car",
    },
    // debug wireframes toggle
    debugMesh: { value: false, label: "wireframe", folder: "Car" },
  },
  physics: {
    friction: { value: 0.5, label: "friction", folder: "Car" },
  },
};

export const vehiclePlaneConstants = {
  tuning: {
    // visuals
    planePosX: {
      value: 0,
      min: -20,
      max: 20,
      label: "plane pos x",
      folder: "Plane",
    },
    planePosY: {
      value: 0,
      min: -20,
      max: 20,
      label: "plane pos y",
      folder: "Plane",
    },
    planePosZ: {
      value: -3,
      min: -20,
      max: 20,
      label: "plane pos z",
      folder: "Plane",
    },
    cockpitPosX: {
      value: 0,
      min: -20,
      max: 20,
      label: "cockpit pos x",
      folder: "Plane",
    },
    cockpitPosY: {
      value: 0.68,
      min: -20,
      max: 20,
      label: "cockpit pos y",
      folder: "Plane",
    },
    cockpitPosZ: {
      value: -2.8,
      min: -20,
      max: 20,
      label: "cockpit pos z",
      folder: "Plane",
    },

    // physics colliders - single centralized mass for arcade forgiveness
    chassisWidth: {
      value: 3.8,
      min: 0.1,
      max: 20,
      label: "chassis width",
      folder: "Plane",
    },
    chassisHeight: {
      value: 0.6,
      min: 0.1,
      max: 20,
      label: "chassis height",
      folder: "Plane",
    },
    chassisLength: {
      value: 10,
      min: 0.1,
      max: 20,
      label: "chassis length",
      folder: "Plane",
    },
    chassisRadius: {
      value: 1.4,
      min: 0,
      max: 2,
      label: "chassis radius",
      folder: "Plane",
    },
    chassisMass: {
      value: 500,
      min: 10,
      max: 2000,
      label: "chassis mass",
      folder: "Plane",
    },

    // unity airplane extracted movement speeds
    defaultSpeed: {
      value: 30,
      min: 5,
      max: 100,
      label: "default speed",
      folder: "Plane",
    },
    turboSpeed: {
      value: 60,
      min: 10,
      max: 200,
      label: "turbo speed",
      folder: "Plane",
    },
    accelerating: {
      value: 10,
      min: 0.1,
      max: 50,
      label: "accelerating",
      folder: "Plane",
    },
    deaccelerating: {
      value: 5,
      min: 0.1,
      max: 50,
      label: "deaccelerating",
      folder: "Plane",
    },

    // unity airplane extracted rotating speeds
    yawSpeed: {
      value: 50,
      min: 5,
      max: 200,
      label: "yaw speed",
      folder: "Plane",
    },
    pitchSpeed: {
      value: 100,
      min: 5,
      max: 300,
      label: "pitch speed",
      folder: "Plane",
    },
    rollSpeed: {
      value: 200,
      min: 5,
      max: 500,
      label: "roll speed",
      folder: "Plane",
    },

    // unity turbo multipliers
    yawTurboMultiplier: {
      value: 0.3,
      min: 0.1,
      max: 5,
      label: "yaw turbo mult",
      folder: "Plane",
    },
    pitchTurboMultiplier: {
      value: 0.5,
      min: 0.1,
      max: 5,
      label: "pitch turbo mult",
      folder: "Plane",
    },
    rollTurboMultiplier: {
      value: 1,
      min: 0.1,
      max: 5,
      label: "roll turbo mult",
      folder: "Plane",
    },

    // unity sideways forces for banking and artificial lift drop
    sidewaysMovement: {
      value: 15,
      min: 0.1,
      max: 50,
      label: "sideways move",
      folder: "Plane",
    },
    sidewaysMovementXRot: {
      value: 0.012,
      min: 0.001,
      max: 0.1,
      label: "sideways x rot",
      folder: "Plane",
    },
    sidewaysMovementYRot: {
      value: 1.5,
      min: 0.1,
      max: 5,
      label: "sideways y rot",
      folder: "Plane",
    },
    sidewaysMovementYPos: {
      value: 0.1,
      min: 0,
      max: 1,
      label: "sideways y pos",
      folder: "Plane",
    },
    // strict angle limits
    maxPitchAngle: {
      value: 30,
      min: 5,
      max: 90,
      label: "max pitch angle",
      folder: "Plane",
    },
    maxRollAngle: {
      value: 30,
      min: 5,
      max: 90,
      label: "max roll angle",
      folder: "Plane",
    },
    altitudeLimit: {
      value: 200,
      min: 100,
      max: 1000,
      label: "altitude limit",
      folder: "Plane",
    },
    debugMesh: { value: false, label: "wireframe", folder: "Plane" },
  },
  physics: {},
};

export const vehicleHelicopterConstants = {
  tuning: {
    // visuals
    cabinPosX: {
      value: 0,
      min: -20,
      max: 20,
      label: "cabin pos x",
      folder: "Helicopter",
    },
    cabinPosY: {
      value: 0,
      min: -20,
      max: 20,
      label: "cabin pos y",
      folder: "Helicopter",
    },
    cabinPosZ: {
      value: -0.35,
      min: -20,
      max: 20,
      label: "cabin pos z",
      folder: "Helicopter",
    },
    mainRotorPosX: {
      value: 0,
      min: -20,
      max: 20,
      label: "main rotor x",
      folder: "Helicopter",
    },
    mainRotorPosY: {
      value: 2.25,
      min: -20,
      max: 20,
      label: "main rotor y",
      folder: "Helicopter",
    },
    mainRotorPosZ: {
      value: -0.9,
      min: -20,
      max: 20,
      label: "main rotor z",
      folder: "Helicopter",
    },
    tailRotorPosX: {
      value: 0,
      min: -20,
      max: 20,
      label: "tail rotor x",
      folder: "Helicopter",
    },
    tailRotorPosY: {
      value: 0.1,
      min: -20,
      max: 20,
      label: "tail rotor y",
      folder: "Helicopter",
    },
    tailRotorPosZ: {
      value: 6.46,
      min: -20,
      max: 20,
      label: "tail rotor z",
      folder: "Helicopter",
    },

    // physics colliders
    chassisWidth: {
      value: 1.75,
      min: 0.1,
      max: 5,
      label: "chassis width",
      folder: "Helicopter",
    },
    chassisHeight: {
      value: 1.2,
      min: 0.1,
      max: 5,
      label: "chassis height",
      folder: "Helicopter",
    },
    chassisLength: {
      value: 6.3,
      min: 0.1,
      max: 10,
      label: "chassis length",
      folder: "Helicopter",
    },
    chassisRadius: {
      value: 1.4,
      min: 0,
      max: 2,
      label: "chassis radius",
      folder: "Helicopter",
    },
    chassisMass: {
      value: 300,
      min: 10,
      max: 2000,
      label: "chassis mass",
      folder: "Helicopter",
    },

    // arcade velocity override mechanics
    verticalSpeed: {
      value: 15,
      min: 5,
      max: 100,
      label: "vertical speed",
      folder: "Helicopter",
    },
    forwardSpeed: {
      value: 40,
      min: 10,
      max: 100,
      label: "forward speed",
      folder: "Helicopter",
    },
    strafeSpeed: {
      value: 25,
      min: 5,
      max: 100,
      label: "strafe speed",
      folder: "Helicopter",
    },
    yawSpeed: {
      value: 15,
      min: 0.5,
      max: 100,
      label: "yaw speed",
      folder: "Helicopter",
    },
    maxPitch: {
      value: 25,
      min: 10,
      max: 60,
      label: "max pitch deg",
      folder: "Helicopter",
    },
    maxRoll: {
      value: 25,
      min: 10,
      max: 60,
      label: "max roll deg",
      folder: "Helicopter",
    },
    smoothing: {
      value: 5,
      min: 1,
      max: 20,
      label: "visual smoothing",
      folder: "Helicopter",
    },
    rotorSpeed: {
      value: 20,
      min: 5,
      max: 50,
      label: "rotor speed",
      folder: "Helicopter",
    },
    altitudeLimit: {
      value: 200,
      min: 100,
      max: 1000,
      label: "altitude limit",
      folder: "Helicopter",
    },
    debugMesh: { value: false, label: "wireframe", folder: "Helicopter" },
  },
  physics: {},
};
