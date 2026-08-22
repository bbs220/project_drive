varying vec3 vWorldPosition;
#include <fog_pars_vertex>

void main() {
  // calculate absolute world position
  vec4 worldPos = modelMatrix * vec4(position,1.0);
  vWorldPosition = worldPos.xyz;

  // calculate model-view position strictly into a variable named 'mvPosition'
  // the fog_vertex chunk secretly requires this exact variable to calculate depth!
  vec4 mvPosition = viewMatrix * worldPos;

  // project to screen space
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}