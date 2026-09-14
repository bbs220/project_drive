uniform vec2 uPlayerPos;
uniform float uAspect;
uniform float uMapZoom;

uniform float uMacroFreq;
uniform float uUrbanFreq;
uniform float uUrbanSprawl;
uniform float uBlockSize;
uniform float uRoadWidth;

uniform sampler2D uIconTexture;

varying vec2 vUv;

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x,289.0);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i = floor(v + dot(v,C.yy));
    vec2 x0 = v - i + dot(i,C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i,289.0);
    vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m,g);
}

float fbm2D(vec2 p,int octaves,float frequency,float persistence,float lacunarity) {
    float total = 0.0;
    float currentFreq = frequency;
    float amplitude = 1.0;
    float maxValue = 0.0;

    for (int i = 0 ; i < octaves ; i++) {
        total += snoise(p * currentFreq) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        currentFreq *= lacunarity;
    }
    return total / maxValue;
}

void main() {
    vec2 centeredUv = vUv - 0.5;
    centeredUv.x *= uAspect;

    vec2 worldPos = uPlayerPos + centeredUv * vec2(uMapZoom,-uMapZoom);

    float rawBiome = fbm2D(worldPos,3,uMacroFreq,0.5,2.0);
    float biomeScore = (rawBiome + 1.0) / 2.0;
    float cityThreshold = 0.45;

    float isCity = step(cityThreshold,biomeScore);
    float cityMask = clamp((biomeScore - cityThreshold) * 5.0,0.0,1.0);

    vec3 emptyColor = mix(vec3(0.08,0.12,0.08),vec3(0.15,0.22,0.12),biomeScore);

    vec2 localPos = mod(worldPos,uBlockSize);
    vec2 blockOrigin = floor(worldPos / uBlockSize) * uBlockSize;

    float isRoadX = step(localPos.x,uRoadWidth);
    float isRoadZ = step(localPos.y,uRoadWidth);
    float isRoad = clamp(isRoadX + isRoadZ,0.0,1.0);

    isRoad *= isCity;
    vec3 roadColor = vec3(0.2,0.22,0.25);

    float rawUrban = fbm2D(blockOrigin,2,uUrbanFreq,0.5,2.0);
    float urbanScore = ((rawUrban + 1.0) / 2.0) * cityMask;

    float hasBuilding = step(uUrbanSprawl,urbanScore);
    float isBuilding = hasBuilding * (1.0 - isRoad) * isCity;

    vec3 buildingColor = mix(vec3(0.4,0.45,0.5),vec3(0.7,0.75,0.8),urbanScore);

    vec3 mapColor = mix(emptyColor,buildingColor,isBuilding);
    mapColor = mix(mapColor,roadColor,isRoad);

    float iconScale = 0.04 * (1500.0 / uMapZoom);

    float bgRadius = iconScale * 0.55;
    float isBg = 1.0 - smoothstep(bgRadius - 0.005,bgRadius,length(centeredUv));

    vec2 iconUv = (centeredUv / iconScale) + 0.5;
    float inIconBounds = step(0.0,iconUv.x) * step(iconUv.x,1.0) * step(0.0,iconUv.y) * step(iconUv.y,1.0);
    vec4 iconTex = texture2D(uIconTexture,iconUv);

    vec3 finalColor = mix(mapColor,vec3(1.0),isBg);
    finalColor = mix(finalColor,iconTex.rgb,iconTex.a * inIconBounds);

    gl_FragColor = vec4(finalColor,1.0);
}