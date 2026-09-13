uniform float uTime;
uniform float uHeight;
uniform float uDropSize;
attribute float aSpeed;
attribute float aOffset;
varying float vAlpha;

void main() {
    float y = position.y - (uTime * aSpeed) + aOffset;

    float modY = mod(y,uHeight) - 2.0;

    vec3 pos = vec3(position.x,modY,position.z);
    vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = clamp(uDropSize / -mvPosition.z,3.0,30.0);

    vAlpha = smoothstep(-2.0,5.0,modY);
}