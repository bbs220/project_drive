varying vec2 vUv;
varying float vRoadType;

// new dynamic uniforms
uniform vec3 uBgColor;
uniform vec3 uEdgeColor;
uniform vec3 uCenterColor;
uniform float uEdgeDist;
uniform float uCenterDist;

#include <fog_pars_fragment>

void main() {
    vec2 absUV = abs(vUv - 0.5);

    // 1. structural lines using our new dynamic distance uniforms
    float edgeX = 1.0 - smoothstep(0.01,0.03,abs(absUV.x - uEdgeDist));
    float edgeY = 1.0 - smoothstep(0.01,0.03,abs(absUV.y - uEdgeDist));

    float innerX = 1.0 - smoothstep(0.003,0.007,abs(absUV.x - uCenterDist));
    float innerY = 1.0 - smoothstep(0.003,0.007,abs(absUV.y - uCenterDist));

    // --- straight road logic ---
    float straightInnerX = innerX;

    vec3 straightColor = mix(uBgColor,uCenterColor,straightInnerX);
    straightColor = mix(straightColor,uEdgeColor,edgeX);

    // --- intersection logic ---
    float bracketX = edgeX * step(uEdgeDist,absUV.y);
    float bracketY = edgeY * step(uEdgeDist,absUV.x);
    float cornerBrackets = max(bracketX,bracketY);

    float intInnerX = innerX * step(uCenterDist,absUV.y);
    float intInnerY = innerY * step(uCenterDist,absUV.x);
    float innerBrackets = max(intInnerX,intInnerY);

    vec3 intersectColor = mix(uBgColor,uCenterColor,innerBrackets);
    intersectColor = mix(intersectColor,uEdgeColor,cornerBrackets);

    // --- final mix ---
    float isIntersection = step(0.5,vRoadType);
    vec3 finalColor = mix(straightColor,intersectColor,isIntersection);

    gl_FragColor = vec4(finalColor,1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
}