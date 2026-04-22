import { loop } from '../webgl/core/loop.js';
import { createVisibilityGate } from '../webgl/core/visibility.js';

function clampDpr() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

export async function initMonolith({ reducedMotion }) {
  const canvas = document.getElementById('monolith-canvas');
  const section = document.getElementById('monolith');
  if (!canvas || !section || !window.THREE) return;

  async function loadText(url) {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return await res.text();
  }

  const renderer = new window.THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(clampDpr());
  renderer.setClearColor(0x0d0d0d);

  const scene = new window.THREE.Scene();
  const camera = new window.THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const light1 = new window.THREE.DirectionalLight(0x00b3b3, 1.5);
  light1.position.set(2, 3, 2);
  scene.add(light1);

  const light2 = new window.THREE.DirectionalLight(0xffffff, 0.8);
  light2.position.set(-3, -1, 1);
  scene.add(light2);

  const light3 = new window.THREE.PointLight(0x00b3b3, 2, 10);
  light3.position.set(0, 2, 3);
  scene.add(light3);

  const geo = new window.THREE.BoxGeometry(1.2, 3.5, 0.6, 32, 64, 8);

  let vertexShader = '';
  let fragmentShader = '';
  try {
    [vertexShader, fragmentShader] = await Promise.all([
      loadText('./scripts/webgl/shaders/monolith.vert.glsl'),
      loadText('./scripts/webgl/shaders/monolith.frag.glsl'),
    ]);
  } catch (e) {
    console.error('[MonolithShader]', e);
    return;
  }

  const mat = new window.THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_mouse: { value: new window.THREE.Vector2(0, 0) },
      u_color1: { value: new window.THREE.Color(0x111111) },
      u_color2: { value: new window.THREE.Color(0x00b3b3) },
    },
    vertexShader,
    fragmentShader,
  });

  const monolith = new window.THREE.Mesh(geo, mat);
  scene.add(monolith);

  const wireGeo = new window.THREE.BoxGeometry(1.22, 3.52, 0.62);
  const wireMat = new window.THREE.MeshBasicMaterial({
    color: 0x00b3b3,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const wire = new window.THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  let targetRotX = 0, targetRotY = 0;
  const onMove = (e) => {
    const rect = section.getBoundingClientRect();
    targetRotY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
    targetRotX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    mat.uniforms.u_mouse.value.set(
      (e.clientX - rect.left) / rect.width - 0.5,
      -(e.clientY - rect.top) / rect.height + 0.5
    );
  };
  section.addEventListener('mousemove', onMove, { passive: true });

  // ASCII overlay (optimized: single persistent read buffer)
  let asciiMode = false;
  const asciiBtn = document.getElementById('ascii-btn');
  const asciiOverlay = document.createElement('canvas');
  asciiOverlay.style.cssText =
    'position:absolute;inset:0;z-index:5;pointer-events:none;display:none;';
  section.appendChild(asciiOverlay);
  const asciiCtx = asciiOverlay.getContext('2d');

  const readCanvas = document.createElement('canvas');
  readCanvas.width = 160;
  readCanvas.height = 100;
  const readCtx = readCanvas.getContext('2d', { willReadFrequently: true });

  if (asciiBtn) {
    asciiBtn.addEventListener('click', () => {
      asciiMode = !asciiMode;
      asciiOverlay.style.display = asciiMode ? 'block' : 'none';
      asciiBtn.textContent = asciiMode ? '[ RENDER_MODE ]' : '[ ASCII_MODE ]';
    });
  }

  function resize() {
    const W = section.clientWidth;
    const H = section.clientHeight;
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(clampDpr());
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    if (asciiOverlay.width !== W || asciiOverlay.height !== H) {
      asciiOverlay.width = W;
      asciiOverlay.height = H;
    }
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const vis = createVisibilityGate(section, { threshold: 0.05 });

  let time = 0;
  loop.subscribe(() => {
    if (!vis.isActive()) return;
    if (reducedMotion) return;

    time += 0.008;
    mat.uniforms.u_time.value = time;

    monolith.rotation.y += (targetRotY - monolith.rotation.y) * 0.04;
    monolith.rotation.x += (targetRotX - monolith.rotation.x) * 0.04;
    monolith.rotation.y += 0.003;
    wire.rotation.copy(monolith.rotation);

    renderer.render(scene, camera);

    if (asciiMode && asciiCtx && readCtx) {
      // Read low-res frame from WebGL canvas via a persistent 2D buffer
      readCtx.clearRect(0, 0, readCanvas.width, readCanvas.height);
      readCtx.drawImage(canvas, 0, 0, readCanvas.width, readCanvas.height);
      const imageData = readCtx.getImageData(0, 0, readCanvas.width, readCanvas.height);

      const chars = ' .:-=+*#%@';
      const fontSize = 10;
      asciiCtx.fillStyle = '#0d0d0d';
      asciiCtx.fillRect(0, 0, asciiOverlay.width, asciiOverlay.height);
      asciiCtx.font = `${fontSize}px ${getComputedStyle(document.body).fontFamily || 'monospace'}`;

      const cols = Math.floor(asciiOverlay.width / fontSize);
      const rows = Math.floor(asciiOverlay.height / (fontSize * 1.6));
      const stepX = readCanvas.width / cols;
      const stepY = readCanvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = Math.floor(c * stepX);
          const py = Math.floor(r * stepY);
          const idx = (py * readCanvas.width + px) * 4;
          const br =
            (imageData.data[idx] * 0.3 +
              imageData.data[idx + 1] * 0.59 +
              imageData.data[idx + 2] * 0.11) /
            255;
          const charIdx = Math.floor(br * (chars.length - 1));
          const isCyan = imageData.data[idx + 1] > 100 && imageData.data[idx] < 80;
          asciiCtx.fillStyle = isCyan ? '#00b3b3' : `rgba(255,255,255,${br * 0.8 + 0.1})`;
          asciiCtx.fillText(chars[charIdx], c * fontSize, r * fontSize * 1.6);
        }
      }
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    vis.dispose();
    window.removeEventListener('resize', resize);
    section.removeEventListener('mousemove', onMove);
    geo.dispose();
    wireGeo.dispose();
    mat.dispose();
    wireMat.dispose();
    renderer.dispose();
  });
}

