attribute vec4 tangent;

uniform vec2 uvScale;
uniform vec3 sunDirection;
varying vec2 vUv;
varying mat3 tbn;
varying vec3 vLightVector;
varying vec3 vNormal;
void main()
{
    vUv = uv;

    //Get the TBN (UVN) using normal (n) and tangent
    vNormal = normalize(normalMatrix * normal);
    vec3 vTangent = normalize(vNormal * tangent.xyz);
    vec3 vBinormal = normalize(cross(vNormal, vTangent.xyz) * tangent.w);

    //Create a 3 dimensions matrix (triangle) using UVN
    tbn = mat3(vTangent, vBinormal, vNormal);

    //LightVector using sunDirection
    vec4 lightVector = viewMatrix * vec4(sunDirection, 1.0);

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vLightVector = normalize(lightVector.xyz - modelViewPosition.xyz);

    gl_Position = projectionMatrix * modelViewPosition;
}

