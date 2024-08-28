// constansts for ground texture
export const tilingValue = 16; // for how many repeats of the texture within the plane

export const anisotrophicValue = 16; // this is max value dont go above 16

// origin axis length the bigger the long the axis visualization stretches
export const originAxisLength = 50;

// parameters for the 4 point lights
export const lightsParams = {
  y: 5, // y position of the spotlight origin
  x: 3, // x position of the spotlight origin
  z: 3, // z position of the spotlight origin
  intensity: 30, // total intensity dont take this above 1000
  enabled: false, // loads off by default
  helpers: false, // loads off by default
  color: "#ffffff", // color of the 4 lights
};

// for the base ground something to drive on
export const groundParams = {
  width: 100, // width of the ground
  height: 100, // height of the ground
  wSegment: 1, // detail in width 1 minimum for better performance
  hSegment: 1, // detail in height 1 minimum for better performance
};

// all the different headlights parameters
export const valueForHeadLights = {
  x: 0.6, // adjustable to liking dont go above 10
  y: 0, // keep this always zero
  z: 1.8, // relative to chassis model
  internalDistance: 10, // distance between the target of the headlights and the headlight origin points
  color: "#ffffff", // color of headlights
  distance: 10, // 0 is infinity other int number is finite
  penumbra: 0.5, // set ONLY between 0 and 1
  coneAngle: 0.5, // DONT go above 1.5
  downLookAngle: 0, // how down the headlight cones should be tilted ONLY go above 0 , DONT go below 0 thats into negative values
  intensity: 0, // intensity of the lights also setting it to 0 turns off the spotlight
};
