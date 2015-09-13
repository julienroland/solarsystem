uniform sampler2D sunTexture;
varying vec2 vUV;

void main() {
  vec4 sunTexture = texture2D(sunTexture, vUV);
  gl_FragColor = vec4(sunTexture.xyz, 1.0);
}
