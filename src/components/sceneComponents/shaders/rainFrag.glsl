uniform vec3 uColor;
uniform float uThickness;
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;
    float dist = length(vec2(uv.x * uThickness,uv.y));

    if (dist > 0.5)
        discard;

    float alpha = (0.5 - dist) * 2.0 * vAlpha;
    gl_FragColor = vec4(uColor,alpha * 0.9);
}