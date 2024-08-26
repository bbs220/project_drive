// constansts for ground texture
export const tilingValue = 16; // for how many repeats of the texture within the plane

export const anisotrophicValue = 16; // this is max value dont go above 16

// origin axis length the bigger the long the axis visualization stretches
export const originAxisLength = 50;

// parameters for the 4 point lights
export const lightsParams = {
  y: 5,
  x: 3,
  z: 3,
  intensity: 30,
  enabled: false,
  helpers: false,
  color: "#ffffff",
};

// for the base ground something to drive on
export const groundWidth = 100;
export const groundHeight = 100;
export const groundWidthSegments = 1;
export const groundHeightSegments = 1;

// all the different headlights parameters
export const valueForHeadLights = {
  x: 0.6, // adjustable to liking dont go above 10
  y: 0, // keep this always zero
  z: 1.8, // relative to chassis model
  internalDistance: 10, // distance between the target of the headlights and the headlight origin points
  color: "#ffffff", // color of headlights
  distance: 10, // 0 is infinity other int number is finite
  penumbra: 0.5, // set only between 0 and 1
  coneAngle: 0.5, // dont go above 1.5
  downLookAngle: 0, // how down the headlight cones should be tilted dont go above 0 below 0 is acceptable
  intensity: 500, // intensity of the lights
};
