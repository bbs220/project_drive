uniform vec2 uPlayerPos;
uniform float uAspect;
uniform float uMapZoom;
uniform float uPitch;
uniform float uLookAhead;
uniform float uActiveYaw;

uniform float uMacroFreq;
uniform float uUrbanFreq;
uniform float uUrbanSprawl;
uniform float uBlockSize;
uniform float uRoadWidth;

uniform sampler2D uIconTexture;

uniform sampler2D uPlayerTex;
uniform sampler2D uCarTex;
uniform sampler2D uPlaneTex;
uniform sampler2D uHeliTex;

uniform vec2 uCharPos;
uniform vec2 uCarPos;
uniform vec2 uPlanePos;
uniform vec2 uHeliPos;

uniform float uCharYaw;
uniform float uCarYaw;
uniform float uPlaneYaw;
uniform float uHeliYaw;

uniform int uActiveEntity;

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

mat2 rotate2d(float angle) {
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

vec3 stampIcon(vec3 baseColor,vec2 flatUv,vec2 playerWorldPos,vec2 entityWorldPos,sampler2D tex,float mapZoom,float scale,float radius,float pitch,float aspect,float entityYaw,float cameraYaw) {
    vec2 offsetWorld = entityWorldPos - playerWorldPos;
    vec2 unrotatedMapUv = offsetWorld / vec2(mapZoom,-mapZoom);
    vec2 mapUv = rotate2d(cameraYaw) * unrotatedMapUv;

    vec2 entityScreenUv;
    entityScreenUv.y = mapUv.y / (1.0 + mapUv.y * pitch);
    entityScreenUv.x = mapUv.x * (1.0 - entityScreenUv.y * pitch);
    entityScreenUv.x *= aspect;

    vec2 diff = flatUv - entityScreenUv;
    float isBg = 1.0 - smoothstep(radius - 0.005,radius,length(diff));

    vec2 iconUv = (diff / scale);
    iconUv = rotate2d(-(entityYaw - cameraYaw)) * iconUv;
    iconUv += 0.5;

    float inIconBounds = step(0.0,iconUv.x) * step(iconUv.x,1.0) * step(0.0,iconUv.y) * step(iconUv.y,1.0);
    vec4 iconTex = texture2D(tex,iconUv);

    vec3 blended = mix(baseColor,vec3(1.0),isBg);
    return mix(blended,iconTex.rgb,iconTex.a * inIconBounds);
}

void main() {
    vec2 screenUv = vUv - 0.5;
    screenUv.y += uLookAhead;

    vec2 flatUv = screenUv;
    flatUv.x *= uAspect;

    float perspectiveDepth = 1.0 - (screenUv.y * uPitch);
    vec2 mapUv;
    mapUv.x = screenUv.x / perspectiveDepth;
    mapUv.y = screenUv.y / perspectiveDepth;
    mapUv.x *= uAspect;

    vec2 rotatedMapUv = rotate2d(-uActiveYaw) * mapUv;
    vec2 worldPos = uPlayerPos + rotatedMapUv * vec2(uMapZoom,-uMapZoom);

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
    vec3 finalColor = mapColor;

    if (uActiveEntity != 0) {
        finalColor = stampIcon(finalColor,flatUv,uPlayerPos,uCharPos,uPlayerTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uCharYaw,uActiveYaw);
    }
    if (uActiveEntity != 1) {
        finalColor = stampIcon(finalColor,flatUv,uPlayerPos,uCarPos,uCarTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uCarYaw,uActiveYaw);
    }
    if (uActiveEntity != 2) {
        finalColor = stampIcon(finalColor,flatUv,uPlayerPos,uPlanePos,uPlaneTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uPlaneYaw,uActiveYaw);
    }
    if (uActiveEntity != 3) {
        finalColor = stampIcon(finalColor,flatUv,uPlayerPos,uHeliPos,uHeliTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uHeliYaw,uActiveYaw);
    }

    float activeYaw = 0.0;
    if (uActiveEntity == 0)
        activeYaw = uCharYaw;
    if (uActiveEntity == 1)
        activeYaw = uCarYaw;
    if (uActiveEntity == 2)
        activeYaw = uPlaneYaw;
    if (uActiveEntity == 3)
        activeYaw = uHeliYaw;

    float isCenterBg = 1.0 - smoothstep(bgRadius - 0.005,bgRadius,length(flatUv));
    vec2 centerIconUv = (flatUv / iconScale);
    centerIconUv = rotate2d(-(activeYaw - uActiveYaw)) * centerIconUv;
    centerIconUv += 0.5;

    float inCenterBounds = step(0.0,centerIconUv.x) * step(centerIconUv.x,1.0) * step(0.0,centerIconUv.y) * step(centerIconUv.y,1.0);
    vec4 centerIconTex = texture2D(uIconTexture,centerIconUv);

    finalColor = mix(finalColor,vec3(1.0),isCenterBg);
    finalColor = mix(finalColor,centerIconTex.rgb,centerIconTex.a * inCenterBounds);

    gl_FragColor = vec4(finalColor,1.0);
}