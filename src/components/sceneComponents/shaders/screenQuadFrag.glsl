uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uRadius;

varying vec2 vUv;

float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
    vec2 p = (vUv - 0.5) * uResolution;
    vec2 halfSize = 0.5 * uResolution;
    float dist = roundedBoxSDF(p, halfSize, uRadius);
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
    if (alpha <= 0.0)
        discard;
    vec4 col = texture2D(uTexture, vUv);
    gl_FragColor = vec4(col.rgb, col.a * alpha);
}
