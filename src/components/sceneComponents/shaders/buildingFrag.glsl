varying vec2 vUv;
varying float vHeight;

void main() {
    vec3 obsidian = vec3(0.005,0.01,0.015);
    vec3 neonCyan = vec3(0.0,1.0,1.0) * 3.0;

    float thicknessX = 0.008;
    float thicknessY = 0.008 / (vHeight / 8.0);

    float edgeX = step(1.0 - thicknessX,vUv.x) + step(vUv.x,thicknessX);
    float edgeY = step(1.0 - thicknessY,vUv.y) + step(vUv.y,thicknessY);
    float edges = clamp(edgeX + edgeY,0.0,1.0);

    float stripes = step(0.92,fract(vUv.x * 8.0));

    float windowFrequency = vHeight * 0.5;
    float dashes = step(0.7,fract(vUv.y * windowFrequency));

    float facadeGlow = stripes * dashes;

    float interiorMask = (1.0 - edgeX) * (1.0 - edgeY);
    facadeGlow *= interiorMask;

    float finalGlowIntensity = max(edges,facadeGlow * 0.15);

    vec3 finalColor = mix(obsidian,neonCyan,clamp(finalGlowIntensity,0.0,1.0));

    gl_FragColor = vec4(finalColor,1.0);
}