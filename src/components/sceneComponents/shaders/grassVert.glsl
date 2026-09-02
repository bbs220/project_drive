uniform float uTime;
varying vec2 vUv;

#include <fog_pars_vertex>

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 instanceWorldPos = instanceMatrix * vec4(0.0,0.0,0.0,1.0);

    float swayX = sin(instanceWorldPos.x * 0.1 + uTime * 2.0) * cos(instanceWorldPos.z * 0.15 + uTime * 1.5);
    float swayZ = cos(instanceWorldPos.x * 0.15 + uTime * 1.8) * sin(instanceWorldPos.z * 0.1 + uTime * 2.2);

    pos.x += swayX * vUv.y * 0.5;
    pos.z += swayZ * vUv.y * 0.5;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos,1.0);
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
}