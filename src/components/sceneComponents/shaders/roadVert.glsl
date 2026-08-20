varying vec2 vUv;
varying float vRoadType;

// This is our custom attribute that we will inject via React!
attribute float aRoadType;

void main() {
    vUv = uv;
    vRoadType = aRoadType; 

    // Standard InstancedMesh math
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mvPosition;
}