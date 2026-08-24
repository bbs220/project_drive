varying vec2 vUv;
varying float vRoadType;
#include <fog_pars_fragment>

void main() {
    vec3 asphaltColor = vec3(0.0);
    // glow for the side lines
    vec3 yellowEdgeGlow = vec3(1.0,0.8,0.0) * 2.0;

    // 1. Calculate solid continuous edges
    float edgeX = smoothstep(0.38,0.39,abs(vUv.x - 0.5)) - smoothstep(0.39,0.40,abs(vUv.x - 0.5));
    float edgeY = smoothstep(0.38,0.39,abs(vUv.y - 0.5)) - smoothstep(0.39,0.40,abs(vUv.y - 0.5));

    // generate dash patterns based on the opposite axes
    // adjust the '4.0' to change how many dashes appear per tile
    float dashY = step(0.3,fract(vUv.y * 4.0));
    float dashX = step(0.3,fract(vUv.x * 4.0));

    // apply dashes to the edges
    float dashedEdgeX = edgeX * dashY;
    float dashedEdgeY = edgeY * dashX;

    // calculate intersection corner cuts so the lines don't cross in the middle of a 4-way stop
    float cutY = step(0.39,abs(vUv.y - 0.5));
    float cornerEdgeX = dashedEdgeX * cutY;

    float cutX = step(0.39,abs(vUv.x - 0.5));
    float cornerEdgeY = dashedEdgeY * cutX;

    float intersectionEdges = max(cornerEdgeX,cornerEdgeY);

    // mix straight roads vs intersection roads based on vRoadType
    float finalEdges = mix(dashedEdgeX,intersectionEdges,step(0.5,vRoadType));

    // apply final colors
    vec3 finalColor = asphaltColor;
    finalColor = mix(finalColor,yellowEdgeGlow,finalEdges);

    gl_FragColor = vec4(finalColor,1.0);
    #include <fog_fragment>
}