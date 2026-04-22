uniform float u_time;
uniform vec2 u_mouse;
varying vec3 vNormal;
varying vec2 vUv;

float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f*f*(3.0-2.0*f);
  return mix(
    mix(mix(hash3(i), hash3(i+vec3(1,0,0)), u.x),
        mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), u.x), u.y),
    mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), u.x),
        mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), u.x), u.y), u.z
  );
}

void main() {
  vNormal = normalMatrix * normal;
  vUv = uv;
  vec3 pos = position;

  float n = noise3(pos * 2.0 + u_time * 0.3);
  float n2 = noise3(pos * 4.0 - u_time * 0.2);
  pos += normal * (n * 0.04 + n2 * 0.02);

  pos.x += u_mouse.x * 0.15;
  pos.y += u_mouse.y * 0.08;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

