uniform sampler2D displacementMap;
uniform float displacementLevel;
void main()
{
    vUv = uv;
    //Displacement
    vec3 displacementMap = texture2D(displacementMap, vUv).xyz;
    float displacementDiff = displacementMap.x * displacementLevel;
    vec3 positionDisplacement = position + normalize( normal ) * displacementDiff;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(positionDisplacement, 1.0);
}
