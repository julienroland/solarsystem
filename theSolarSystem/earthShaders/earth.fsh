uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D normalMap;

uniform float sunLightIntensity;
uniform vec3 sunDirection;

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vNormal;
varying vec3 vLightVector;

void main( void ) {
    // Transform texture coordinate of normal map to a range (-1, 1)
    vec3 normalCoordinate = 2.0 * texture2D(normalMap, vUv).xyz - 1.0;

    //Matrix3 into texture uv as RGB
    vec3 normal = normalize(tbn * normalCoordinate.xyz);

    // Lighting intensity is calculated as dot of normal vector and the vertex-to-light vector
    float intensity = max(0.07, dot(normal, vLightVector * sunLightIntensity));
    vec4 lighting = vec4(intensity, intensity, intensity, 1.0);

    vec4 dayTexture = texture2D(dayTexture, vUv) * lighting;
    vec4 nightTexture = texture2D(nightTexture, vUv) * (lighting * 10.0);

    // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
    float cosineAngleSunToNormal = dot(normalize(vNormal), vLightVector);

    // sharpen the edge between the transition
    float edgeCosineAngleSunToNormal = clamp(cosineAngleSunToNormal * 3.0, -1.0, 1.0);

    // convert to 0 to 1 for mixing
    float mixAmount = edgeCosineAngleSunToNormal * 0.5 + 0.5;

    // Select day or night texture based on mix.
    vec3 color = mix(nightTexture.xyz, dayTexture.xyz, mixAmount);
    gl_FragColor = vec4(color, 1.0);
}
