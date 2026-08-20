varying vec2 vUv;
varying float vRoadType;
#include <fog_pars_fragment>

void main() {
    vec3 asphaltColor = vec3(0.0);
    vec3 cyanCenterGlow = vec3(0.0,1.0,1.0) * 2.0;
    vec3 yellowEdgeGlow = vec3(1.0,0.8,0.0) * 3.0;

    float lineX = smoothstep(0.48,0.5,vUv.x) - smoothstep(0.5,0.52,vUv.x);
    float dashes = step(0.3,fract(vUv.y * 3.0));
    float straightCenter = lineX * dashes;

    float lineY = smoothstep(0.48,0.5,vUv.y) - smoothstep(0.5,0.52,vUv.y);
    float rawPlus = max(lineX,lineY);
    float distToCenter = length(vUv - vec2(0.5));
    float plusMask = 1.0 - step(0.2,distToCenter);
    float plusPattern = rawPlus * plusMask;

    float finalCenter = mix(straightCenter,plusPattern,step(0.5,vRoadType));

    float edgeX = smoothstep(0.38,0.39,abs(vUv.x - 0.5)) - smoothstep(0.39,0.40,abs(vUv.x - 0.5));
    float edgeY = smoothstep(0.38,0.39,abs(vUv.y - 0.5)) - smoothstep(0.39,0.40,abs(vUv.y - 0.5));

    float cutY = step(0.39,abs(vUv.y - 0.5));
    float cornerEdgeX = edgeX * cutY;

    float cutX = step(0.39,abs(vUv.x - 0.5));
    float cornerEdgeY = edgeY * cutX;

    float intersectionEdges = max(cornerEdgeX,cornerEdgeY);

    float finalEdges = mix(edgeX,intersectionEdges,step(0.5,vRoadType));

    vec3 finalColor = asphaltColor;

    finalColor = mix(finalColor,yellowEdgeGlow,finalEdges);

    finalColor = mix(finalColor,cyanCenterGlow,finalCenter);

    gl_FragColor = vec4(finalColor,1.0);
    #include <fog_fragment>
}