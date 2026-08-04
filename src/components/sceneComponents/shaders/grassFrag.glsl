// define uniforms
uniform vec3 uBaseColor;
uniform vec3 uTipColor;

// receive elevation from vertex shader
varying float vElevation;

void main() {
    // smoothly mix colors based on standard grass height
    float mixRatio = smoothstep(0.0,0.5,vElevation);
    vec3 finalColor = mix(uBaseColor,uTipColor,mixRatio);

    // output final pixel color
    gl_FragColor = vec4(finalColor,1.0);
}