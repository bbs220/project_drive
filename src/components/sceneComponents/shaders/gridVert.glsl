// pass world position to fragment shader
varying vec3 vWorldPosition;

void main() {
  // calculate absolute world position
    vec4 worldPos = modelMatrix * vec4(position,1.0);
    vWorldPosition = worldPos.xyz;

  // project to screen space
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}