uniform vec2 uResolution;
uniform vec2 uPlayerPos;
uniform float uAspect;
uniform float uMapZoom;
uniform float uPitch;
uniform float uLookAhead;
uniform float uActiveYaw;
uniform float uEdgeIconScale;

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
uniform sampler2D uPermTexture;

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

// reads from your exact JS perm array
float getPerm(float i) {
    return texture2D(uPermTexture,vec2((i + 0.5) / 512.0,0.5)).r * 255.0;
}

// maps exactly to your grad3 array logic
vec2 getGrad2(float hash) {
    int h = int(mod(hash,12.0));
    if (h == 0)
        return vec2(1.0,1.0);
    if (h == 1)
        return vec2(-1.0,1.0);
    if (h == 2)
        return vec2(1.0,-1.0);
    if (h == 3)
        return vec2(-1.0,-1.0);
    if (h == 4)
        return vec2(1.0,0.0);
    if (h == 5)
        return vec2(-1.0,0.0);
    if (h == 6)
        return vec2(1.0,0.0);
    if (h == 7)
        return vec2(-1.0,0.0);
    if (h == 8)
        return vec2(0.0,1.0);
    if (h == 9)
        return vec2(0.0,-1.0);
    if (h == 10)
        return vec2(0.0,1.0);
    if (h == 11)
        return vec2(0.0,-1.0);
    return vec2(0.0);
}

// 1:1 Port of your SimplexNoise.ts noise2D
float snoise(vec2 v) {
    float F2 = 0.366025403784439; // 0.5 * (sqrt(3.0) - 1.0)
    float G2 = 0.211324865405187; // (3.0 - sqrt(3.0)) / 6.0

    float xin = v.x;
    float yin = v.y;

    float s = (xin + yin) * F2;
    float i = floor(xin + s);
    float j = floor(yin + s);
    float t = (i + j) * G2;
    float X0 = i - t;
    float Y0 = j - t;
    float x0 = xin - X0;
    float y0 = yin - Y0;

    float i1,j1;
    if (x0 > y0) {
        i1 = 1.0;
        j1 = 0.0;
    } else {
        i1 = 0.0;
        j1 = 1.0;
    }

    float x1 = x0 - i1 + G2;
    float y1 = y0 - j1 + G2;
    float x2 = x0 - 1.0 + 2.0 * G2;
    float y2 = y0 - 1.0 + 2.0 * G2;

    float ii = mod(i,256.0);
    float jj = mod(j,256.0);

    float perm_jj = floor(getPerm(jj) + 0.5);
    float perm_jj_j1 = floor(getPerm(jj + j1) + 0.5);
    float perm_jj_1 = floor(getPerm(jj + 1.0) + 0.5);

    float gi0 = floor(getPerm(ii + perm_jj) + 0.5);
    float gi1 = floor(getPerm(ii + i1 + perm_jj_j1) + 0.5);
    float gi2 = floor(getPerm(ii + 1.0 + perm_jj_1) + 0.5);

    vec2 g0 = getGrad2(gi0);
    vec2 g1 = getGrad2(gi1);
    vec2 g2 = getGrad2(gi2);

    float t0 = 0.5 - x0 * x0 - y0 * y0;
    float n0 = 0.0;
    if (t0 >= 0.0) {
        t0 *= t0;
        n0 = t0 * t0 * dot(g0,vec2(x0,y0));
    }

    float t1 = 0.5 - x1 * x1 - y1 * y1;
    float n1 = 0.0;
    if (t1 >= 0.0) {
        t1 *= t1;
        n1 = t1 * t1 * dot(g1,vec2(x1,y1));
    }

    float t2 = 0.5 - x2 * x2 - y2 * y2;
    float n2 = 0.0;
    if (t2 >= 0.0) {
        t2 *= t2;
        n2 = t2 * t2 * dot(g2,vec2(x2,y2));
    }

    return 70.0 * (n0 + n1 + n2);
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

vec4 stampIcon(vec4 baseColor,vec2 uv,vec2 playerWorldPos,vec2 entityWorldPos,sampler2D tex,float mapZoom,float scale,float radius,float pitch,float aspect,float entityYaw,float cameraYaw,vec2 margin,float lookAhead,float edgeIconScale) {
    vec2 offsetWorld = entityWorldPos - playerWorldPos;
    vec2 unrotatedMapUv = offsetWorld / vec2(mapZoom,-mapZoom);
    vec2 mapUv = rotate2d(cameraYaw) * unrotatedMapUv;

    vec2 entityScreenUv;
    float denom = max(0.001,1.0 + mapUv.y * pitch);
    entityScreenUv.y = mapUv.y / denom;
    entityScreenUv.x = mapUv.x * (1.0 - entityScreenUv.y * pitch);
    entityScreenUv.x *= aspect;

    vec2 entityPhys = vec2(entityScreenUv.x,entityScreenUv.y - lookAhead);

    vec2 bounds = vec2((0.5 - margin.x) * aspect,0.5 - margin.y);
    vec2 absPhys = abs(entityPhys);
    float maxDist = max(absPhys.x / bounds.x,absPhys.y / bounds.y);
    float isClamped = step(1.0,maxDist);

    entityPhys = mix(entityPhys,entityPhys / maxDist,isClamped);

    float currentRadius = radius * mix(1.0,edgeIconScale,isClamped);
    float currentScale = scale * mix(1.0,edgeIconScale,isClamped);

    vec2 pixelPhys = uv - 0.5;
    pixelPhys.x *= aspect;

    vec2 diff = pixelPhys - entityPhys;
    float isBg = 1.0 - smoothstep(currentRadius - 0.005,currentRadius,length(diff));

    vec2 iconUv = (diff / currentScale);
    iconUv = rotate2d(entityYaw - cameraYaw) * iconUv;
    iconUv += 0.5;

    float inIconBounds = step(0.0,iconUv.x) * step(iconUv.x,1.0) * step(0.0,iconUv.y) * step(iconUv.y,1.0);
    vec4 iconTex = texture2D(tex,iconUv);

    float iconAlpha = max(isBg,iconTex.a * inIconBounds);
    vec3 iconRGB = mix(vec3(1.0),iconTex.rgb,iconTex.a * inIconBounds);

    vec3 blendedRGB = mix(baseColor.rgb,iconRGB,iconAlpha);
    float blendedAlpha = max(baseColor.a,iconAlpha);

    return vec4(blendedRGB,blendedAlpha);
}

void main() {
    vec2 margin = vec2(6.0) / uResolution;

    vec2 screenUv = vUv - 0.5;
    vec2 terrainUv = screenUv;
    terrainUv.y += uLookAhead;

    float perspectiveDepth = 1.0 - (terrainUv.y * uPitch);
    vec2 mapUv;
    mapUv.x = terrainUv.x / perspectiveDepth;
    mapUv.y = terrainUv.y / perspectiveDepth;
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

    float isInsideMap = step(margin.x,vUv.x) * step(vUv.x,1.0 - margin.x) *
        step(margin.y,vUv.y) * step(vUv.y,1.0 - margin.y);

    vec4 finalColor = vec4(mapColor,isInsideMap);

    float iconScale = 0.04 * (1500.0 / uMapZoom);
    float bgRadius = iconScale * 0.55;

    if (uActiveEntity != 0) {
        finalColor = stampIcon(finalColor,vUv,uPlayerPos,uCharPos,uPlayerTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uCharYaw,uActiveYaw,margin,uLookAhead,uEdgeIconScale);
    }
    if (uActiveEntity != 1) {
        finalColor = stampIcon(finalColor,vUv,uPlayerPos,uCarPos,uCarTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uCarYaw,uActiveYaw,margin,uLookAhead,uEdgeIconScale);
    }
    if (uActiveEntity != 2) {
        finalColor = stampIcon(finalColor,vUv,uPlayerPos,uPlanePos,uPlaneTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uPlaneYaw,uActiveYaw,margin,uLookAhead,uEdgeIconScale);
    }
    if (uActiveEntity != 3) {
        finalColor = stampIcon(finalColor,vUv,uPlayerPos,uHeliPos,uHeliTex,uMapZoom,iconScale,bgRadius,uPitch,uAspect,uHeliYaw,uActiveYaw,margin,uLookAhead,uEdgeIconScale);
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

    vec2 playerPhys = vec2(0.0,-uLookAhead);
    vec2 pixelPhys = vUv - 0.5;
    pixelPhys.x *= uAspect;

    vec2 diff = pixelPhys - playerPhys;
    float isCenterBg = 1.0 - smoothstep(bgRadius - 0.005,bgRadius,length(diff));

    vec2 centerIconUv = (diff / iconScale);
    centerIconUv = rotate2d(activeYaw - uActiveYaw) * centerIconUv;
    centerIconUv += 0.5;

    float inCenterBounds = step(0.0,centerIconUv.x) * step(centerIconUv.x,1.0) * step(0.0,centerIconUv.y) * step(centerIconUv.y,1.0);
    vec4 centerIconTex = texture2D(uIconTexture,centerIconUv);

    float centerAlpha = max(isCenterBg,centerIconTex.a * inCenterBounds);
    vec3 centerRGB = mix(vec3(1.0),centerIconTex.rgb,centerIconTex.a * inCenterBounds);

    finalColor.rgb = mix(finalColor.rgb,centerRGB,centerAlpha);
    finalColor.a = max(finalColor.a,centerAlpha);

    gl_FragColor = finalColor;
}