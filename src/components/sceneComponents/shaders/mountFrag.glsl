varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uProgress;
uniform vec3 uColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = 1.0 - max(dot(normal,viewDir),0.0);
    fresnel = pow(fresnel,2.5);

    float scanline = sin(vUv.y * 120.0 - uTime * 25.0) * 0.5 + 0.5;
    float noise = fract(sin(dot(vUv + uTime * 0.1,vec2(12.9898,78.233))) * 43758.5453);

    float intensity = (fresnel * 0.8 + scanline * 0.4 + noise * 0.15) * uProgress;
    float wipe = smoothstep(0.0,0.2,uProgress - vUv.y * 0.5);
    intensity *= wipe;

    float edgeFade = smoothstep(0.0,0.15,vUv.y) * smoothstep(1.0,0.85,vUv.y);
    intensity *= edgeFade;

    gl_FragColor = vec4(uColor,intensity);
}