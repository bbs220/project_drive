uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

void main() {
    // vUv.x is 0.0 at the vehicle and 1.0 at the end of the trail. 
    // smoothstep(0.2, 1.0, vUv.x) creates a smooth transition starting 20% down the trail.
    float tailFade = 1.0 - smoothstep(0.2,1.0,vUv.x);

    gl_FragColor = vec4(uColor,uOpacity * tailFade);
}