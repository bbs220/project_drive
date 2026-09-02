uniform float uTime;
uniform vec3 uPlayerPos;
uniform float uInteractRadius;
varying vec2 vUv;

#include <fog_pars_vertex>

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 instanceWorldPos = instanceMatrix * vec4(0.0,0.0,0.0,1.0);

    // billboarding (face the camera dynamically)
    vec3 toCamera = cameraPosition - instanceWorldPos.xyz;
    toCamera.y = 0.0; // restrict rotation purely to the Y-axis (yaw)
    toCamera = normalize(toCamera);

    // calculate the angle and apply a 2D rotation matrix
    float angle = atan(toCamera.x,toCamera.z);
    float c = cos(angle);
    float s = sin(angle);

    float rotatedX = pos.x * c - pos.z * s;
    float rotatedZ = pos.x * s + pos.z * c;
    pos.x = rotatedX;
    pos.z = rotatedZ;

    // wind sway
    float swayX = sin(instanceWorldPos.x * 0.1 + uTime * 2.0) * cos(instanceWorldPos.z * 0.15 + uTime * 1.5);
    float swayZ = cos(instanceWorldPos.x * 0.15 + uTime * 1.8) * sin(instanceWorldPos.z * 0.1 + uTime * 2.2);

    pos.x += swayX * vUv.y * 0.5;
    pos.z += swayZ * vUv.y * 0.5;

    // player interaction (bending)
    vec3 dir = instanceWorldPos.xyz - uPlayerPos;
    // only care about xz distance so jumping over grass still crushes it
    float dist = length(dir.xz); 

    // smooth gradient from 1.0 (player center) to 0.0 (edge of interact radius)
    float interaction = 1.0 - smoothstep(0.0,uInteractRadius,dist);
    vec2 pushDir = normalize(dir.xz);

    // push away on xz, crush downwards on y. multiply by vuv.y to anchor the roots
    float bendStrength = interaction * 2.0;
    pos.x += pushDir.x * bendStrength * vUv.y;
    pos.z += pushDir.y * bendStrength * vUv.y;
    pos.y -= interaction * 0.8 * vUv.y;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos,1.0);
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
}