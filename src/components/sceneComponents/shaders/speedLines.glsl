uniform float uSpeed;
uniform float uTime;
uniform float uRadius;

float rand(vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor) {
    vec2 centeredUv = uv - 0.5;
    float radius = length(centeredUv);
    float angle = atan(centeredUv.y,centeredUv.x);

    float numLines = 100.0;
    float discreteAngle = floor(angle * numLines);

    float noise = rand(vec2(discreteAngle,floor(uTime * 20.0)));
    float streak = step(0.95,noise);

    // mask: starts exactly at uRadius, and fades smoothly for the next 0.4 units
    float mask = smoothstep(uRadius,uRadius + 0.4,radius);

    float finalIntensity = streak * mask * uSpeed;

    outputColor = inputColor + vec4(vec3(finalIntensity),0.0);
}