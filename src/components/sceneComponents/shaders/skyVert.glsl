uniform float uTime;
uniform float uSize;

attribute float aTwinkleOffset;
attribute vec3 aColor;

varying float vPulse;
varying vec3 vColor; 

#include <fog_pars_vertex>

void main() {
    vColor = aColor;

    // calculate a unique pulse for each star based on time and its random offset
    float pulse = sin(uTime * 2.0 + aTwinkleOffset) * 0.5 + 0.5;
    vPulse = pulse;

    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position,1.0);

    // dynamically change point size to create a blooming physical effect
    gl_PointSize = (uSize + pulse * 15.0) * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
}