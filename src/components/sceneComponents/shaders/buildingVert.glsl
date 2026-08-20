varying vec2 vUv;
varying float vHeight;
varying vec3 vLocalPosition;
attribute float aHeight;

void main() {
    vUv = uv;
    vHeight = aHeight;
    vLocalPosition = position;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mvPosition;
}