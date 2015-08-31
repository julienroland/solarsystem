uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D normalMap;
uniform sampler2D specularMap;

uniform float sunLightIntensity;
uniform vec3 sunDirection;

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vNormal;
varying vec3 vLightVector;

void main( void ) {
    /** Transform texture coordinate of normal map to a range (-1, 1) */
    vec3 normalCoordinate = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;

    /** Transform the normal vector in the RGB channels to tangent space */
    vec3 normal = normalize(tbn * normalCoordinate.rgb);

    /** Lighting intensity is calculated as dot of normal vector and the vertex-to-light vector */
    float intensity = max(0.07, dot(normal, vLightVector * sunLightIntensity));
    vec4 lighting = vec4(intensity, intensity, intensity, 1.0);

    //Specular
    vec3 specularMap = texture2D(specularMap, vUv).xyz;
    vec3 specularColor  = vec3(0,0,0);
    float c = 0.35;
    float p = 3.0;
    vec4 specular = vec4(specularMap.xyz * pow(c  * max(dot(normalize(vNormal), vec3(0,0,0)), 0.5), p),1.0);

    vec4 dayTexture = texture2D(dayTexture, vUv) ; //* lighting + specular
    vec4 nightTexture = texture2D(nightTexture, vUv) ; //* lighting

    // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
    float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);

    // sharpen the edge between the transition
    float edgeCosineAngleSunToNormal = clamp(cosineAngleSunToNormal * 10.0, -0.7, 1.0);

    // convert to 0 to 1 for mixing
    float mixAmount = edgeCosineAngleSunToNormal * 0.5 + 0.5;

    // Select day or night texture based on mix.
    vec3 color = mix(nightTexture.xyz, dayTexture.xyz, mixAmount);
    gl_FragColor = vec4(color, 1.0);
}
