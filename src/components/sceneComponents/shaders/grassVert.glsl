// define uniforms
uniform float uTime;

// pass elevation to fragment shader for color mixing
varying float vElevation;

void main() {
    // extract world position from instance matrix
    vec3 instancePos = vec3(instanceMatrix [3] [0],instanceMatrix [3] [1],instanceMatrix [3] [2]);

    // calculate wind offset using time and world position
    float wind = sin(uTime * 2.0 + instancePos.x * 0.2 + instancePos.z * 0.2) * 0.15;

    // store local vertex position
    vec3 pos = position;

    // apply wind sway only to the top vertex
    if (pos.y > 0.0) {
        pos.x += wind;
        pos.z += wind;
    }

    // calculate cylindrical billboarding to strictly face camera
    vec3 cameraPos = cameraPosition;
    vec3 toCamera = normalize(vec3(cameraPos.x - instancePos.x,0.0,cameraPos.z - instancePos.z));
    vec3 right = cross(vec3(0.0,1.0,0.0),toCamera);

    // combine instance position with billboarded local position
    vec3 finalWorldPos = instancePos + (right * pos.x) + (vec3(0.0,1.0,0.0) * pos.y);

    // pass height to fragment shader
    vElevation = pos.y;

    // project to screen space
    gl_Position = projectionMatrix * viewMatrix * vec4(finalWorldPos,1.0);
}