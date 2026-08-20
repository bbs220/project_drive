varying vec2 vUv;
varying float vRoadType;
attribute float aRoadType;

void main() {
    vUv = uv;
    vRoadType = aRoadType;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mvPosition;
}