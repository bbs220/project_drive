uniform float uTime;
uniform float uHeight;
uniform float uDropSize;
uniform float uSway;
uniform vec2 uWind;

attribute float aSpeed;
attribute float aOffset;
varying float vAlpha;

#include <fog_pars_vertex>

void main() {
    float y = position.y - (uTime * aSpeed) + aOffset;
    float modY = mod(y,uHeight) - 2.0;

    float swayX = sin(uTime * 3.0 + aOffset * 5.0 + modY * 0.1) * uSway;
    float swayZ = cos(uTime * 2.5 - aOffset * 3.0 + modY * 0.12) * uSway;

    float fallDistance = uHeight - modY;
    float slantX = fallDistance * (uWind.x * 0.05);
    float slantZ = fallDistance * (uWind.y * 0.05);

    vec3 pos = vec3(position.x + swayX + slantX,modY,position.z + swayZ + slantZ);

    vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = clamp(uDropSize / -mvPosition.z,3.0,30.0);

    vAlpha = smoothstep(-2.0,5.0,modY);

    #include <fog_vertex>
}