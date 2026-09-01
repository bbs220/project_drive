uniform float uIntensity;

varying float vPulse;
varying vec3 vColor;

#include <fog_pars_fragment>

void main() {
    // calculate distance from the center of the point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5)
        discard; 

    // smoothstep creates a soft glowing radial gradient
    float alpha = smoothstep(0.5,0.0,dist);

    // boost the core brightness based on the pulse using the unique star color
    vec3 bloomColor = vColor * (1.0 + vPulse * uIntensity);

    gl_FragColor = vec4(bloomColor,alpha * (0.4 + vPulse * 0.6));

    #include <fog_fragment>
}