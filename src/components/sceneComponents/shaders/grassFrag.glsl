varying vec2 vUv;
#include <fog_pars_fragment>

void main() {
    vec3 rootColor = vec3(0.12,0.09,0.07);
    vec3 tipColor = vec3(0.18,0.7,0.94) * 5.0;

    vec3 color = mix(rootColor,tipColor,vUv.y);

    gl_FragColor = vec4(color,1.0);

    #include <fog_fragment>
}