varying vec2 vUv;
#include <fog_pars_fragment>

void main() {
    vec3 rootColor = vec3(0.0,0.2,0.2);
    vec3 tipColor = vec3(0.0,1.0,0.4);

    vec3 color = mix(rootColor,tipColor,vUv.y);

    gl_FragColor = vec4(color,1.0);

    #include <fog_fragment>
}