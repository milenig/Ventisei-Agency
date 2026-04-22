uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
varying vec3 vNormal;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)),u.x), u.y);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(vec3(1.5, 2.0, 2.0));
  float diff = max(dot(normal, lightDir), 0.0);

  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

  float n = noise(vUv * 8.0 + u_time * 0.1);

  vec3 baseColor = mix(u_color1, vec3(0.18, 0.18, 0.18), n * 0.3);
  vec3 cyanAccent = u_color2 * spec * 2.0;

  float edgeFresnel = 1.0 - abs(dot(normal, viewDir));
  vec3 edgeGlow = u_color2 * pow(edgeFresnel, 3.0) * 0.8;

  vec3 finalColor = baseColor * (0.3 + diff * 0.7) + cyanAccent + edgeGlow;
  gl_FragColor = vec4(finalColor, 1.0);
}

