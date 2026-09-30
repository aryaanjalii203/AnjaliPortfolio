import * as THREE from 'three';

/**
 * LatentField — a 3D "embedding space".
 * Points are sampled as gaussian clusters on a loose shell (like a projected latent space).
 * A query point follows the cursor; its K nearest neighbours light up and get linked —
 * a literal KNN lookup running every frame.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPR;
  uniform float uSize;
  uniform vec3 uQuery;
  uniform float uRadius;
  attribute float aSeed;
  attribute float aScale;
  varying float vHeat;
  varying float vFade;

  vec3 drift(vec3 p, float s, float t) {
    return p + 0.035 * vec3(sin(t * 0.6 + s * 6.28), cos(t * 0.5 + s * 12.1), sin(t * 0.4 + s * 3.7));
  }

  void main() {
    vec3 p = drift(position, aSeed, uTime);
    float d = distance(p, uQuery);
    vHeat = 1.0 - smoothstep(0.0, uRadius, d);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vFade = smoothstep(-9.0, -2.5, mv.z) * (1.0 - smoothstep(-1.4, -0.4, mv.z));
    gl_PointSize = uSize * aScale * (1.0 + vHeat * 1.6) * uPR * (4.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  varying float vHeat;
  varying float vFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.15, r);
    vec3 col = mix(uInk, uAccent, smoothstep(0.15, 0.85, vHeat));
    gl_FragColor = vec4(col, a * (0.28 + vHeat * 0.72) * vFade);
  }
`;

function gauss() {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function createLatentField(container, { mobile = false, reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 6.2);

  const group = new THREE.Group();
  scene.add(group);

  // ---- sample clusters ----
  const CLUSTERS = mobile ? 9 : 14;
  const N = mobile ? 1100 : 2400;
  const centers = [];
  for (let i = 0; i < CLUSTERS; i++) {
    // Fibonacci-ish spread on an ellipsoid shell
    const t = (i + 0.5) / CLUSTERS;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 1.7 + Math.random() * 0.9;
    centers.push(new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * r * 1.5, Math.cos(phi) * r * 0.85, Math.sin(phi) * Math.sin(theta) * r));
  }

  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  const scale = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const noise = Math.random() < 0.12; // background "unclustered" samples
    const c = centers[i % CLUSTERS];
    const spread = noise ? 2.6 : 0.22 + Math.random() * 0.2;
    const base = noise ? new THREE.Vector3() : c;
    pos[i * 3] = base.x + gauss() * spread * (noise ? 1.3 : 1);
    pos[i * 3 + 1] = base.y + gauss() * spread * (noise ? 0.8 : 1);
    pos[i * 3 + 2] = base.z + gauss() * spread;
    seed[i] = Math.random();
    scale[i] = noise ? 0.6 + Math.random() * 0.4 : 0.7 + Math.random() * 0.9;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPR: { value: pr },
    uSize: { value: mobile ? 5.5 : 6.5 },
    uQuery: { value: new THREE.Vector3(9, 9, 9) },
    uRadius: { value: 0.95 },
    uInk: { value: new THREE.Color('#ece8e1') },
    uAccent: { value: new THREE.Color('#ff4d8d') },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  group.add(points);

  // ---- faint cluster "manifold" edges (static) ----
  const edgePos = [];
  for (let i = 0; i < CLUSTERS; i++) {
    const a = centers[i];
    const sorted = centers.map((b, j) => ({ j, d: a.distanceTo(b) })).filter((o) => o.j !== i).sort((x, y) => x.d - y.d);
    for (let k = 0; k < 2; k++) {
      const b = centers[sorted[k].j];
      if (sorted[k].j > i) edgePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xece8e1, transparent: true, opacity: 0.07 }));
  group.add(edges);

  // ---- KNN links from the query point ----
  const K = mobile ? 7 : 10;
  const linkPos = new Float32Array(K * 6);
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: 0xff4d8d, transparent: true, opacity: 0.0 }));
  group.add(links);

  // ---- state ----
  const pointer = new THREE.Vector2(0, 0);
  const smooth = new THREE.Vector2(0, 0);
  let hasPointer = false;
  let scrollP = 0;
  let pageP = 0;
  let running = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const qLocal = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  const best = new Array(K);

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the field framed on tall screens
    camera.position.z = (w / h < 0.8 ? 8.4 : 6.2);
    camera.updateProjectionMatrix();
  }

  function driftAt(i, t, out) {
    const s = seed[i];
    out.set(
      pos[i * 3] + 0.035 * Math.sin(t * 0.6 + s * 6.28),
      pos[i * 3 + 1] + 0.035 * Math.cos(t * 0.5 + s * 12.1),
      pos[i * 3 + 2] + 0.035 * Math.sin(t * 0.4 + s * 3.7)
    );
    return out;
  }

  function knn(q, t) {
    for (let k = 0; k < K; k++) best[k] = { i: -1, d: Infinity };
    for (let i = 0; i < N; i++) {
      const dx = pos[i * 3] - q.x;
      const dy = pos[i * 3 + 1] - q.y;
      const dz = pos[i * 3 + 2] - q.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < best[K - 1].d) {
        let j = K - 1;
        while (j > 0 && best[j - 1].d > d) { best[j] = best[j - 1]; j--; }
        best[j] = { i, d };
      }
    }
    for (let k = 0; k < K; k++) {
      const p = best[k].i >= 0 ? driftAt(best[k].i, t, tmp) : q;
      linkPos.set([q.x, q.y, q.z, p.x, p.y, p.z], k * 6);
    }
    linkGeo.attributes.position.needsUpdate = true;
  }

  function frame() {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    // idle: the query wanders on its own (also the touch-device behaviour)
    const target = hasPointer ? pointer : tmp.set(Math.sin(t * 0.23) * 0.55, Math.cos(t * 0.31) * 0.4, 0);
    smooth.x += (target.x - smooth.x) * 0.06;
    smooth.y += (target.y - smooth.y) * 0.06;

    // hero progress zooms in a little; page progress keeps the field turning site-wide
    group.rotation.y = t * 0.035 + smooth.x * 0.28 + scrollP * 0.8 + pageP * 2.6;
    group.rotation.x = -smooth.y * 0.16 + scrollP * 0.2 + Math.sin(pageP * Math.PI) * 0.35;
    camera.position.z = (camera.aspect < 0.8 ? 8.4 : 6.2) - scrollP * 1.4;

    group.updateMatrixWorld();
    ray.setFromCamera(smooth, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      inv.copy(group.matrixWorld).invert();
      qLocal.copy(hit).applyMatrix4(inv);
      uniforms.uQuery.value.copy(qLocal);
      knn(qLocal, t);
      const linkTarget = 0.55 * (1 - scrollP * 0.5);
      links.material.opacity += (linkTarget - links.material.opacity) * 0.04;
    }
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame();
    raf = requestAnimationFrame(loop);
  }

  const onMove = (e) => {
    const rect = container.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    hasPointer = true;
  };
  const onLeave = () => { hasPointer = false; };

  resize();
  window.addEventListener('resize', resize);
  if (!mobile) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
  }

  // render one frame immediately so reduced-motion users still see the field
  frame();

  return {
    start() {
      if (running || reduced) return;
      running = true;
      loop();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setScroll(p) {
      scrollP = p;
      if (reduced) frame();
    },
    setPage(p) {
      pageP = p;
    },
    dispose() {
      this.stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      geo.dispose(); mat.dispose(); edgeGeo.dispose(); edges.material.dispose(); linkGeo.dispose(); links.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
