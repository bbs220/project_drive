// pass world position to fragment
varying vec3 vWorldPosition;

// uniforms injected from react
uniform vec3 uBgColor;
uniform vec3 uGridColor;
uniform float uGridSize;
uniform float uSubGridSize;
uniform float uCrossSize;
uniform float uCrossOpacity;
uniform float uGridThickness;
uniform float uFadeDistance;

void main() {
  // calculate main outer grid cells
  vec2 mainCoord = vWorldPosition.xz / uGridSize;
  vec2 mainGrid = abs(fract(mainCoord - 0.5) - 0.5) / fwidth(mainCoord);
  float mainLine = min(mainGrid.x,mainGrid.y);
  float mainAlpha = 1.0 - smoothstep(uGridThickness - 1.0,uGridThickness + 1.0,mainLine);

  // calculate inner sub grid for the crosses
  vec2 subCoord = vWorldPosition.xz / uSubGridSize;

  // lock coordinates to exact integer intersections
  vec2 subLocal = fract(subCoord - 0.5) - 0.5;
  vec2 subPixelDist = abs(subLocal) / fwidth(subCoord);

  // create masks to chop the infinite lines into short arms
  float maskX = 1.0 - step(uCrossSize,abs(subLocal.x));
  float maskY = 1.0 - step(uCrossSize,abs(subLocal.y));

  // horizontal bar of the cross
  float horizBar = (1.0 - smoothstep(uGridThickness - 1.0,uGridThickness + 1.0,subPixelDist.y)) * maskX;

  // vertical bar of the cross
  float vertBar = (1.0 - smoothstep(uGridThickness - 1.0,uGridThickness + 1.0,subPixelDist.x)) * maskY;

  // combine horizontal and vertical to form the plus symbol and apply dimming opacity
  float crossAlpha = max(horizBar,vertBar) * uCrossOpacity;

  // combine main large grid with inner crosses
  float finalAlpha = max(mainAlpha,crossAlpha);

  // calculate distance from center for the radial fade
  float dist = length(vWorldPosition.xz);

  // apply smooth radial fade to blend into the void
  float fade = 1.0 - smoothstep(0.0,uFadeDistance,dist);
  finalAlpha *= fade;

  // mix the background and neon color based on alpha
  vec3 finalColor = mix(uBgColor,uGridColor,finalAlpha);

  gl_FragColor = vec4(finalColor,1.0);

  // inject native tone mapping chunks
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}