varying vec2 vUv;
varying float vHeight;
varying vec3 vLocalPosition;
varying vec3 vNormal;
attribute float aHeight;
#include <fog_pars_vertex>

void main() {
    vUv = uv;
    vHeight = aHeight;
    vLocalPosition = position;
    vNormal = normal;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
}