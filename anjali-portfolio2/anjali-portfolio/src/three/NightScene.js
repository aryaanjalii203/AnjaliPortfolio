import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * NightScene — the hero's environment: a real layered WebGL landscape.
 *
 *   sky dome + stars  →  moon (+ glow, light shafts)  →  far / mid / near ridges + pines
 *   →  ground + mist  →  lit cabin (warm windows, chimney smoke, fireflies)
 *   →  large tree (wind-driven branches + foliage)  →  falling leaves (far + near/blurred)
 *
 * Objects are placed by *screen position at a given depth*, so the composition
 * holds on every aspect ratio: tree on the left edge, moon upper-right, cabin lower-right,
 * all clear of the hero text and portrait that sit on top of this canvas.
 */

// ---------------------------------------------------------------- utils
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash1(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
function noise1(x) {
  const i = Math.floor(x); const f = x - i; const u = f * f * (3 - 2 * f);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
}
function fbm1(x, oct = 4) {
  let a = 0.5; let v = 0; let f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise1(x * f); f *= 2.03; a *= 0.5; }
  return v;
}

function canvasTexture(size, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(stops) {
  return canvasTexture(128, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  });
}

// maple-ish leaf silhouette (white; tinted per instance)
function leafTexture(blur = 0) {
  return canvasTexture(64, (g, s) => {
    g.translate(s / 2, s / 2);
    if (blur) g.filter = `blur(${blur}px)`;
    g.beginPath();
    const N = 90;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const lobes = Math.pow(Math.abs(Math.sin(a * 2.5 + Math.PI / 2)), 0.7);
      const r = s * (0.2 + 0.24 * lobes) * (a > Math.PI * 0.35 && a < Math.PI * 0.65 ? 0.55 : 1);
      const x = Math.cos(a - Math.PI / 2) * r;
      const y = Math.sin(a - Math.PI / 2) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fillStyle = '#fff';
    g.fill();
    g.filter = 'none';
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, s * 0.3); g.lineTo(0, -s * 0.34); g.stroke();
  });
}

function mistTexture() {
  return canvasTexture(256, (g, s) => {
    const r = rng(7);
    g.clearRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) {
      const x = r() * s; const y = s * (0.35 + r() * 0.3); const rad = s * (0.08 + r() * 0.18);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, s, s);
    }
    // soft vertical falloff
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = v; g.fillRect(0, 0, s, s);
  });
}

// shared wind: injected into standard materials (branches, foliage, grass)
const WIND_UNIFORMS = { uTime: { value: 0 }, uWind: { value: 1 } };
function addWind(material, { instanced = false, flutter = 0 } = {}) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = WIND_UNIFORMS.uTime;
    shader.uniforms.uWind = WIND_UNIFORMS.uWind;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uWind;
        attribute float aSway; attribute float aPhase;`)
      .replace('#include <project_vertex>', `
        vec4 mvPosition = vec4( transformed, 1.0 );
        ${flutter ? `mvPosition.xyz += normal * sin(uTime * 7.0 + aPhase * 30.0) * ${flutter.toFixed(3)};` : ''}
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        float w = aSway * uWind;
        float gust = 0.6 + 0.4 * sin(uTime * 0.37 + aPhase * 2.0);
        mvPosition.x += w * gust * (sin(uTime * 0.9 + mvPosition.y * 0.18 + aPhase) * 0.9 + sin(uTime * 2.3 + aPhase * 5.0) * 0.18);
        mvPosition.z += w * gust * sin(uTime * 0.7 + mvPosition.x * 0.2 + aPhase * 1.7) * 0.5;
        mvPosition.y += w * gust * sin(uTime * 1.1 + aPhase * 3.0) * 0.12;
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`);
  };
  material.customProgramCacheKey = () => `wind-${instanced}-${flutter}`;
  return material;
}

// ---------------------------------------------------------------- scene
export function createNightScene(container, { tier = 'high', reduced = false } = {}) {
  const low = tier === 'low';
  const renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: false, powerPreference: 'high-performance' });
  // it's a soft, partly-covered backdrop: render it a little under native resolution
  let dpr = Math.min(window.devicePixelRatio || 1, low ? 0.85 : 1.25);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const FOG = new THREE.Color('#0d1730');
  scene.fog = new THREE.FogExp2(FOG, 0.0078);

  const FOV = 40;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 900);
  const CAM = new THREE.Vector3(0, 9, 12);
  camera.position.copy(CAM);
  const LOOK = new THREE.Vector3(0, 9.4, -100);
  camera.lookAt(LOOK);

  const R = rng(20260101);
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  // ---------- sky dome
  const moonDir = new THREE.Vector3(0.4, 0.3, -1).normalize();
  const skyMat = track(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#02040b') },
      uMid: { value: new THREE.Color('#070d1f') },
      uHorizon: { value: new THREE.Color('#0f1a38') },
      uMoonDir: { value: moonDir },
      uGlow: { value: new THREE.Color('#4f5f8c') },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 uTop, uMid, uHorizon, uGlow; uniform vec3 uMoonDir; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 c = mix(uHorizon, uMid, smoothstep(-0.02, 0.18, h));
        c = mix(c, uTop, smoothstep(0.18, 0.75, h));
        float m = max(dot(normalize(vDir), normalize(uMoonDir)), 0.0);
        c += uGlow * (pow(m, 60.0) * 0.55 + pow(m, 8.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  const sky = new THREE.Mesh(track(new THREE.SphereGeometry(600, 32, 16)), skyMat);
  scene.add(sky);

  // ---------- stars
  const STARS = low ? 700 : 1500;
  const sPos = new Float32Array(STARS * 3);
  const sSeed = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    const u = R(); const v = 0.04 + R() * 0.96;
    const th = u * Math.PI * 2; const y = Math.pow(v, 0.8);
    const r = Math.sqrt(1 - y * y);
    sPos.set([Math.cos(th) * r * 560, y * 560, Math.sin(th) * r * 560 - 60], i * 3);
    sSeed[i] = R();
  }
  const starGeo = track(new THREE.BufferGeometry());
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const starMat = track(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: WIND_UNIFORMS.uTime, uPR: { value: dpr } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPR; varying float vA;
      void main(){ vA = (0.35 + 0.65 * fract(aSeed * 13.7)) * (0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0));
        vA *= smoothstep(0.0, 120.0, position.y);
        gl_PointSize = (0.8 + pow(fract(aSeed * 91.3), 6.0) * 2.4) * uPR;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), vA * smoothstep(0.5, 0.0, d)); }`,
  }));
  scene.add(new THREE.Points(starGeo, starMat));

  // ---------- moon
  const moonMat = track(new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uLight: { value: new THREE.Vector3(-0.35, 0.25, 1).normalize() } },
    vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vN; varying vec3 vP; uniform vec3 uLight;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      float n3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
      float fbm(vec3 p){ float a=0.5, v=0.0; for(int i=0;i<5;i++){ v+=a*n3(p); p*=2.1; a*=0.5; } return v; }
      void main(){
        vec3 p = normalize(vP);
        float maria = smoothstep(0.45, 0.7, fbm(p * 2.2 + 3.0));
        float craters = smoothstep(0.62, 0.8, fbm(p * 9.0));
        vec3 base = mix(vec3(0.96, 0.92, 0.84), vec3(0.62, 0.62, 0.66), maria * 0.75);
        base *= 1.0 - craters * 0.18;
        float lit = clamp(dot(normalize(vN), uLight) * 0.9 + 0.35, 0.0, 1.0);
        float limb = pow(clamp(dot(normalize(vN), vec3(0,0,1)), 0.0, 1.0), 0.35);
        gl_FragColor = vec4(base * (0.28 + 1.1 * lit) * (0.55 + 0.45 * limb), 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  const moon = new THREE.Mesh(track(new THREE.SphereGeometry(1, 48, 32)), moonMat);
  const glowTex = track(radialTexture([[0, 'rgba(210,220,255,0.55)'], [0.18, 'rgba(170,185,235,0.22)'], [0.45, 'rgba(120,130,190,0.07)'], [1, 'rgba(0,0,0,0)']]));
  const moonGlow = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })));
  const halo2Tex = track(radialTexture([[0, 'rgba(255,120,170,0.0)'], [0.3, 'rgba(255,120,170,0.035)'], [0.6, 'rgba(140,150,220,0.03)'], [1, 'rgba(0,0,0,0)']]));
  const moonHalo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: halo2Tex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })));
  scene.add(moon, moonGlow, moonHalo);

  // moonlight + ambience
  const moonLight = new THREE.DirectionalLight('#b8c6ff', 1.5);
  moonLight.castShadow = !low;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.bias = -0.0006;
  moonLight.shadow.radius = 6;
  const sc = moonLight.shadow.camera;
  sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 260;
  scene.add(moonLight, moonLight.target);
  scene.add(new THREE.HemisphereLight('#2a3a66', '#07080a', 0.55));

  // soft light shafts from the moon (volumetric feel)
  const shaftTex = track(canvasTexture(64, (g, s) => {
    const gr = g.createLinearGradient(0, 0, s, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.25, 'rgba(0,0,0,0.2)'); v.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, s, s);
  }));
  const shafts = new THREE.Group();
  for (let i = 0; i < (low ? 1 : 2); i++) {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), track(new THREE.MeshBasicMaterial({
      map: shaftTex, color: new THREE.Color('#8fa3e0'), transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    })));
    m.userData = { w: 14 + i * 9, phase: i * 1.7, tilt: -0.38 - i * 0.07 };
    shafts.add(m);
  }
  scene.add(shafts);

  // ---------- ridges (far → near), each a silhouette shape
  const ridgeMats = [];
  function ridge({ z, base, amp, freq, seed, color, width = 900, dip }) {
    const shape = new THREE.Shape();
    const steps = 220;
    shape.moveTo(-width / 2, -40);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; const x = -width / 2 + t * width;
      let y = base + amp * (fbm1(x * freq + seed, 5) - 0.35);
      if (dip) y -= dip.depth * Math.exp(-Math.pow((x - dip.x) / dip.w, 2)); // keep the sky clear near the moon
      shape.lineTo(x, y);
    }
    shape.lineTo(width / 2, -40);
    shape.closePath();
    const mat = track(new THREE.MeshLambertMaterial({ color }));
    ridgeMats.push(mat);
    const mesh = new THREE.Mesh(track(new THREE.ShapeGeometry(shape)), mat);
    mesh.position.z = z;
    mesh.receiveShadow = false;
    scene.add(mesh);
    return mesh;
  }
  ridge({ z: -330, base: 22, amp: 46, freq: 0.012, seed: 3, color: '#1a2748', dip: { x: 140, w: 90, depth: 14 } });
  ridge({ z: -230, base: 14, amp: 30, freq: 0.02, seed: 11, color: '#111b33', dip: { x: 100, w: 70, depth: 8 } });
  ridge({ z: -150, base: 6, amp: 18, freq: 0.03, seed: 23, color: '#0b1222' });

  // pines on the near ridge / far ground for scale
  const PINES = low ? 60 : 140;
  const pineGeo = track(mergeGeometries([
    new THREE.ConeGeometry(1, 2.2, 6).translate(0, 2.4, 0),
    new THREE.ConeGeometry(0.8, 1.9, 6).translate(0, 3.3, 0),
    new THREE.ConeGeometry(0.55, 1.5, 6).translate(0, 4.1, 0),
    new THREE.CylinderGeometry(0.12, 0.16, 1.4, 5).translate(0, 0.7, 0),
  ]));
  const pineMat = track(new THREE.MeshLambertMaterial({ color: '#0a1511' }));
  const pines = new THREE.InstancedMesh(pineGeo, pineMat, PINES);
  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const v3 = new THREE.Vector3(); const s3 = new THREE.Vector3();
  for (let i = 0; i < PINES; i++) {
    const z = -70 - R() * 80; const x = (R() - 0.5) * 320;
    const sc2 = 1.4 + R() * 2.2;
    m4.compose(v3.set(x, groundH(x, z) - 0.2, z), q.setFromAxisAngle(v3.clone().set(0, 1, 0), R() * 6), s3.set(sc2, sc2 * (0.9 + R() * 0.5), sc2));
    pines.setMatrixAt(i, m4);
  }
  scene.add(pines);

  // ---------- ground
  function groundH(x, z) {
    const d = -z; // distance into scene
    const roll = (fbm1(x * 0.03 + 7) - 0.5) * 2.4 + (fbm1(z * 0.04 + 1) - 0.5) * 1.6;
    const rise = Math.max(0, d - 70) * 0.09 * (0.6 + fbm1(x * 0.02 + 5));
    return roll * Math.min(1, Math.max(0, (d - 18) / 30)) + rise;
  }
  const gGeo = track(new THREE.PlaneGeometry(700, 260, low ? 90 : 160, low ? 40 : 70));
  gGeo.rotateX(-Math.PI / 2);
  gGeo.translate(0, 0, -120);
  const gp = gGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, groundH(gp.getX(i), gp.getZ(i)));
  gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, track(new THREE.MeshLambertMaterial({ color: '#0e1510' })));
  ground.receiveShadow = !low;
  scene.add(ground);

  // ---------- mist bands
  const mistTex = track(mistTexture());
  mistTex.wrapS = THREE.RepeatWrapping;
  const mists = [];
  (low ? [[-60, 7, 0.55], [-190, 16, 0.4]] : [[-60, 7, 0.55], [-105, 10, 0.45], [-190, 16, 0.4]]).forEach(([z, y, o], i) => {
    const t = mistTex.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); track(t);
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(700, 30)), track(new THREE.MeshBasicMaterial({
      map: t, color: '#9fb1dd', transparent: true, opacity: o, depthWrite: false, fog: true,
    })));
    m.position.set(0, y, z);
    m.userData = { speed: 0.004 + i * 0.0025 };
    mists.push(m);
    scene.add(m);
  });

  // ---------- cabin
  const cabin = new THREE.Group();
  const wood = track(new THREE.MeshLambertMaterial({ color: '#3a2a20' }));
  const roofM = track(new THREE.MeshLambertMaterial({ color: '#241a16' }));
  const trim = track(new THREE.MeshLambertMaterial({ color: '#1b130f' }));
  const warm = track(new THREE.MeshStandardMaterial({ color: '#ffb866', emissive: '#ff9a3c', emissiveIntensity: 2.6 }));
  const W = 4.2; const D = 3.4; const H = 2.5;
  const body = new THREE.Mesh(track(new THREE.BoxGeometry(W, H, D)), wood);
  body.position.y = H / 2;
  // log courses
  for (let i = 0; i < 6; i++) {
    const log = new THREE.Mesh(track(new THREE.BoxGeometry(W + 0.24, 0.06, D + 0.24)), trim);
    log.position.y = 0.3 + i * 0.42;
    cabin.add(log);
  }
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-D / 2 - 0.55, 0); roofShape.lineTo(0, 1.9); roofShape.lineTo(D / 2 + 0.55, 0); roofShape.lineTo(-D / 2 - 0.55, 0);
  const roof = new THREE.Mesh(track(new THREE.ExtrudeGeometry(roofShape, { depth: W + 0.7, bevelEnabled: false })), roofM);
  roof.rotation.y = Math.PI / 2;
  roof.position.set(-(W + 0.7) / 2, H - 0.05, 0);
  const gable = new THREE.Shape();
  gable.moveTo(-D / 2, 0); gable.lineTo(0, 1.6); gable.lineTo(D / 2, 0);
  const gables = [-1, 1].map((sgn) => {
    const g = new THREE.Mesh(track(new THREE.ShapeGeometry(gable)), wood);
    g.rotation.y = Math.PI / 2 * sgn; g.position.set(sgn * W / 2, H, 0);
    return g;
  });
  const chimney = new THREE.Mesh(track(new THREE.BoxGeometry(0.5, 1.6, 0.5)), trim);
  chimney.position.set(W / 2 - 0.9, H + 1.3, -0.5);
  // windows + door on the front (+z)
  const winGeo = track(new THREE.PlaneGeometry(0.75, 0.7));
  const windows = [-1.15, 1.15].map((x) => {
    const w = new THREE.Mesh(winGeo, warm);
    w.position.set(x, 1.35, D / 2 + 0.02);
    const frame = new THREE.Mesh(track(new THREE.PlaneGeometry(0.06, 0.7)), trim);
    frame.position.set(x, 1.35, D / 2 + 0.03);
    const frame2 = new THREE.Mesh(track(new THREE.PlaneGeometry(0.75, 0.06)), trim);
    frame2.position.set(x, 1.35, D / 2 + 0.03);
    cabin.add(frame, frame2);
    return w;
  });
  const door = new THREE.Mesh(track(new THREE.PlaneGeometry(0.8, 1.55)), track(new THREE.MeshStandardMaterial({ color: '#1c1310', emissive: '#ff8a2a', emissiveIntensity: 0.22 })));
  door.position.set(0, 0.78, D / 2 + 0.02);
  const sideWin = new THREE.Mesh(winGeo, warm);
  sideWin.rotation.y = Math.PI / 2; sideWin.position.set(W / 2 + 0.02, 1.35, 0.2);
  cabin.add(body, roof, ...gables, chimney, ...windows, door, sideWin);
  // porch lantern
  const lantern = new THREE.Mesh(track(new THREE.SphereGeometry(0.1, 10, 8)), warm);
  lantern.position.set(0.7, 1.9, D / 2 + 0.25);
  cabin.add(lantern);
  cabin.traverse((o) => { if (o.isMesh) { o.castShadow = !low; o.receiveShadow = !low; } });
  // warm light spilling onto the ground
  const hutLight = new THREE.PointLight('#ff9d47', 18, 22, 1.6);
  hutLight.position.set(0, 1.6, D / 2 + 1.4);
  cabin.add(hutLight);
  const warmGlowTex = track(radialTexture([[0, 'rgba(255,190,110,0.9)'], [0.25, 'rgba(255,150,70,0.35)'], [1, 'rgba(255,120,40,0)']]));
  const glows = [...windows.map((w) => w.position), sideWin.position, lantern.position].map((p, i) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: warmGlowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 })));
    s.position.copy(p).add(new THREE.Vector3(0, 0, 0.1));
    s.scale.setScalar(i === 3 ? 1.1 : 1.9);
    cabin.add(s);
    return s;
  });
  const pool = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: warmGlowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 })));
  pool.position.set(0, 0.6, D / 2 + 2.2); pool.scale.set(9, 3, 1);
  cabin.add(pool);
  scene.add(cabin);

  // chimney smoke
  const smokeTex = track(radialTexture([[0, 'rgba(200,210,235,0.35)'], [0.5, 'rgba(160,170,200,0.12)'], [1, 'rgba(0,0,0,0)']]));
  const smoke = [];
  for (let i = 0; i < (low ? 5 : 9); i++) {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })));
    s.userData = { t: i / 9 };
    smoke.push(s);
    cabin.add(s);
  }

  // fireflies around the cabin
  const FF = low ? 16 : 34;
  const ffPos = new Float32Array(FF * 3); const ffSeed = new Float32Array(FF);
  for (let i = 0; i < FF; i++) { ffPos.set([(R() - 0.5) * 16, 0.4 + R() * 2.5, (R() - 0.3) * 10], i * 3); ffSeed[i] = R(); }
  const ffGeo = track(new THREE.BufferGeometry());
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  ffGeo.setAttribute('aSeed', new THREE.BufferAttribute(ffSeed, 1));
  const ffMat = track(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: WIND_UNIFORMS.uTime, uPR: { value: dpr } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPR; varying float vA;
      void main(){ vec3 p = position; float t = uTime * (0.25 + aSeed * 0.3) + aSeed * 50.0;
        p += vec3(sin(t) * 1.2, sin(t * 1.3) * 0.5, cos(t * 0.8) * 1.0);
        vA = pow(0.5 + 0.5 * sin(uTime * (1.2 + aSeed) + aSeed * 30.0), 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 5.0 * uPR * (30.0 / -mv.z);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(1.0, 0.78, 0.4, vA * smoothstep(0.5, 0.0, d)); }`,
  }));
  const fireflies = new THREE.Points(ffGeo, ffMat);
  cabin.add(fireflies);

  // ---------- tree (branches merged; wind in the vertex shader)
  const tree = new THREE.Group();
  const barkMat = addWind(track(new THREE.MeshLambertMaterial({ color: '#221915', emissive: '#07080d' })));
  const segs = []; const tips = [];
  const MAXD = low ? 4 : 5;
  let maxPath = 1;
  // one tapered segment; sway weight = distance along the path from the root (continuous at joints)
  function seg(start, dir, len, rad, path, radial) {
    const end = start.clone().addScaledVector(dir, len);
    const g = new THREE.CylinderGeometry(rad * 0.72, rad, len, radial, 3, true);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    g.translate(start.x, start.y, start.z);
    const pos = g.attributes.position; const sw = new Float32Array(pos.count); const ph = new Float32Array(pos.count);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(start);
      sw[i] = path + THREE.MathUtils.clamp(tmp.dot(dir) / len, 0, 1) * len;
    }
    g.setAttribute('aSway', new THREE.BufferAttribute(sw, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    segs.push(g);
    maxPath = Math.max(maxPath, path + len);
    return end;
  }
  function grow(start, dir, len, rad, depth, path) {
    const end = seg(start, dir, len, rad, path, depth < 2 ? 7 : 5);
    if (depth >= MAXD) { tips.push({ p: end, path: path + len }); return; }
    const kids = R() < 0.3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const nd = dir.clone();
      const axis = new THREE.Vector3(R() - 0.5, R() * 0.3 - 0.15, R() - 0.5).normalize();
      nd.applyAxisAngle(axis, 0.3 + R() * 0.45);
      nd.x += 0.03;                       // lean slightly toward the open sky on the right
      nd.y += depth < 2 ? 0.08 : -0.06;   // outer twigs droop a little
      nd.normalize();
      grow(end, nd, len * (0.68 + R() * 0.12), rad * 0.6, depth + 1, path + len);
    }
    if (depth >= 2 && R() < 0.85) tips.push({ p: end, path: path + len }); // leaves along the limbs, not just at the ends
  }
  // tall trunk rising from below the frame, gently kinked
  let p0 = new THREE.Vector3(0, -0.5, 0); let path0 = 0;
  [[0.08, 1, 0.02, 3.8, 0.34], [-0.06, 1, 0, 3.4, 0.29], [0.1, 1, 0.03, 3.3, 0.25]].forEach(([x, y, z, l, r], i) => {
    const d = new THREE.Vector3(x, y, z).normalize();
    const e2 = seg(p0, d, l, r, path0, 9);
    if (i === 1) grow(p0.clone().lerp(e2, 0.55), new THREE.Vector3(-0.8, 0.6, 0.15).normalize(), 1.3, 0.07, MAXD - 1, path0 + l * 0.55);
    path0 += l; p0 = e2;
  });
  // crown: limbs reaching up and out to the right, over the top of the frame
  [[0.35, 1, 0.1, 2.5], [0.85, 0.65, -0.12, 2.4], [-0.45, 0.9, 0.15, 2.1], [1, 0.2, -0.2, 2.1]].forEach(([x, y, z, l]) => {
    grow(p0, new THREE.Vector3(x, y, z).normalize(), l, 0.15, 1, path0);
  });
  // normalise sway weights: roots still, outer twigs move
  segs.forEach((g) => { const a = g.attributes.aSway; for (let i = 0; i < a.count; i++) a.array[i] = Math.pow(a.array[i] / maxPath, 2.2) * 0.55; });
  const barkGeo = track(mergeGeometries(segs));
  segs.forEach((g) => g.dispose());
  const bark = new THREE.Mesh(barkGeo, barkMat);
  bark.castShadow = !low;
  tree.add(bark);

  // foliage — instanced leaves clustered at branch tips
  const leafTex = track(leafTexture());
  const PALETTE = ['#6b1426', '#7e1a2e', '#962532', '#a8342e', '#5a1020', '#b4472a', '#842238'].map((c) => new THREE.Color(c));
  // budget the canopy: fewer, slightly larger leaves keeps overdraw sane on laptops
  const perTip = Math.max(6, Math.round((low ? 1400 : 2600) / tips.length));
  const FOL = tips.length * perTip;
  const folGeo = new THREE.PlaneGeometry(0.3, 0.3);
  const folSway = new Float32Array(FOL); const folPh = new Float32Array(FOL);
  folGeo.setAttribute('aSway', new THREE.InstancedBufferAttribute(folSway, 1));
  folGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(folPh, 1));
  track(folGeo);
  const folMat = addWind(track(new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, emissive: '#2b0812' })), { instanced: true, flutter: 0.02 });
  const foliage = new THREE.InstancedMesh(folGeo, folMat, FOL);
  const folPositions = [];
  let n = 0;
  const e = new THREE.Euler();
  tips.forEach((t) => {
    for (let i = 0; i < perTip; i++) {
      const p = t.p.clone().add(new THREE.Vector3((R() - 0.5) * 1.4, (R() - 0.4) * 1.0, (R() - 0.5) * 1.4));
      const s = 0.7 + R() * 0.7;
      q.setFromEuler(e.set(R() * 6.28, R() * 6.28, R() * 6.28));
      m4.compose(p, q, s3.set(s, s, s));
      foliage.setMatrixAt(n, m4);
      foliage.setColorAt(n, PALETTE[Math.floor(R() * PALETTE.length)].clone().multiplyScalar(0.8 + R() * 0.4));
      folSway[n] = Math.pow(t.path / maxPath, 2.2) * 0.55; folPh[n] = R() * 6.28;
      folPositions.push(p);
      n++;
    }
  });
  foliage.castShadow = !low;
  tree.add(foliage);
  scene.add(tree);
  // lower edge of the canopy in tree-local space (used to frame the crown above the headline)
  const canopyLow = folPositions.map((p) => p.y).sort((a, b) => a - b)[Math.floor(folPositions.length * 0.08)];

  // ---------- falling leaves (far: crisp, near: soft and larger — cheap depth of field)
  function makeFalling(count, tex, near) {
    const geo = track(new THREE.PlaneGeometry(0.2, 0.2));
    const mat = track(new THREE.MeshLambertMaterial({
      map: tex, side: THREE.DoubleSide, emissive: near ? '#3a0c16' : '#2b0812',
      ...(near ? { transparent: true, opacity: 0.45, depthWrite: false } : { alphaTest: 0.5 }),
    }));
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.frustumCulled = false;
    const st = [];
    for (let i = 0; i < count; i++) {
      st.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), q: new THREE.Quaternion(), axis: new THREE.Vector3(), spin: 0, ph: 0, s: 1, fall: 1, sway: 1 });
      mesh.setColorAt(i, PALETTE[Math.floor(R() * PALETTE.length)].clone().multiplyScalar(near ? 0.7 : 0.95 + R() * 0.3));
    }
    scene.add(mesh);
    return { mesh, st, near };
  }
  const farLeaves = makeFalling(reduced ? 18 : low ? 46 : 120, leafTex, false);
  const nearLeaves = makeFalling(reduced ? 0 : low ? 3 : 7, track(leafTexture(2.2)), true);
  const treeWorld = new THREE.Matrix4();

  function spawn(L, o, initial) {
    if (L.near) {
      // inside the frustum, 3–7 m from the camera, entering from the top-left
      const d = 3 + R() * 4;
      const ndc = new THREE.Vector3(-1.1 + R() * 1.6, initial ? R() * 2 - 1 : 1.15, 0.5);
      o.p.copy(pointAt(ndc.x, ndc.y, d));
      o.s = 0.9 + R() * 0.6; o.fall = 0.35 + R() * 0.3;
    } else {
      const src = folPositions[Math.floor(R() * folPositions.length)].clone().applyMatrix4(treeWorld);
      o.p.copy(src);
      if (initial) { o.p.x += R() * 14; o.p.y -= R() * 10; }
      o.s = 0.8 + R() * 0.7;
      o.fall = 0.45 + R() * 0.55;
    }
    o.axis.set(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
    o.spin = (R() - 0.5) * 4;
    o.ph = R() * 100;
    o.sway = 0.6 + R() * 1.1;
    o.q.setFromEuler(e.set(R() * 6.28, R() * 6.28, R() * 6.28));
  }
  const dq = new THREE.Quaternion();
  function stepLeaves(L, dt, t) {
    const { mesh, st } = L;
    for (let i = 0; i < st.length; i++) {
      const o = st[i];
      const wind = 1.1 + 0.6 * Math.sin(t * 0.3 + o.ph);
      o.p.x += (wind + Math.sin(t * 1.3 * o.sway + o.ph) * 0.9) * dt * (L.near ? 0.55 : 1);
      o.p.y -= o.fall * dt * (1 + 0.35 * Math.sin(t * 2.1 + o.ph));
      o.p.z += Math.cos(t * 0.9 * o.sway + o.ph) * 0.35 * dt;
      dq.setFromAxisAngle(o.axis, o.spin * dt);
      o.q.multiply(dq);
      const floor = L.near ? CAM.y - 6 : groundH(o.p.x, o.p.z) + 0.1;
      if (o.p.y < floor || o.p.x > 90) spawn(L, o, false);
      m4.compose(o.p, o.q, s3.set(o.s, o.s, o.s));
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- placement helpers
  const ndcV = new THREE.Vector3();
  function pointAt(nx, ny, dist) {
    ndcV.set(nx, ny, 0.5).unproject(camera);
    return ndcV.sub(camera.position).normalize().multiplyScalar(dist).add(camera.position);
  }
  function groundAt(nx, ny) {
    ndcV.set(nx, ny, 0.5).unproject(camera);
    const dir = ndcV.sub(camera.position).normalize();
    // march to the terrain
    let t = 2;
    for (let i = 0; i < 200; i++) {
      const p = camera.position.clone().addScaledVector(dir, t);
      if (p.y <= groundH(p.x, p.z)) return p;
      t += 0.6;
    }
    return camera.position.clone().addScaledVector(dir, 60);
  }

  let aspect = 1;
  function layout() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.position.copy(CAM);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const portrait = aspect < 0.8;
    const tablet = aspect >= 0.8 && aspect < 1.25;

    // moon — upper right, clear of the nav and the right-hand statement
    const mN = portrait ? [0.5, 0.44] : tablet ? [0.72, 0.5] : [0.52, 0.56];
    const mDist = 420;
    const mp = pointAt(mN[0], mN[1], mDist);
    const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * mDist;
    const px = portrait ? 0.075 : 0.068; // radius as a fraction of viewport height
    const mr = halfH * 2 * px * (portrait ? 0.62 : 1);
    moon.position.copy(mp); moon.scale.setScalar(mr);
    moon.lookAt(camera.position);
    moonGlow.position.copy(mp); moonGlow.scale.setScalar(mr * 7);
    moonHalo.position.copy(mp).addScaledVector(mp.clone().sub(camera.position).normalize(), 5); moonHalo.scale.setScalar(mr * 12);
    moonDir.copy(mp).sub(camera.position).normalize();
    moonLight.position.copy(moonDir).multiplyScalar(120).add(new THREE.Vector3(0, 30, -30));
    moonLight.target.position.set(0, 0, -30);
    shafts.children.forEach((s) => {
      s.position.copy(mp).lerp(camera.position, 0.72);
      s.userData.base = s.position.clone();
      s.scale.set(s.userData.w, 120, 1);
    });

    // cabin — lower right, below the statement; smaller and deeper than the tree
    const cN = portrait ? [-0.8, -0.18] : tablet ? [0.62, -0.55] : [0.68, -0.6];
    const cp = groundAt(cN[0], cN[1]);
    cabin.position.copy(cp);
    cabin.rotation.y = portrait ? 0.55 : -0.5;
    const cDist = cp.distanceTo(camera.position);
    cabin.scale.setScalar(THREE.MathUtils.clamp(cDist / 46, 0.6, 1.8) * (portrait ? 0.9 : 1));

    // tree — trunk on the left edge; canopy fills the top-left above the headline
    const tDist = portrait ? 19 : tablet ? 13 : 11;
    const base = pointAt(portrait ? -1.05 : -0.97, -0.2, tDist);
    base.y = 0;
    tree.position.copy(base);
    const canopyTargetNdc = portrait ? 0.84 : 0.64;
    const targetY = pointAt(0, canopyTargetNdc, tDist).y;
    const sTree = THREE.MathUtils.clamp(targetY / canopyLow, 0.8, 1.6);
    tree.scale.setScalar(sTree);
    tree.rotation.y = 0.15;
    tree.updateMatrixWorld(true);
    treeWorld.copy(tree.matrixWorld);
    const shadowCam = moonLight.shadow.camera;
    shadowCam.updateProjectionMatrix();
    // leaves: re-seed so they start in the new frame
    farLeaves.st.forEach((o) => spawn(farLeaves, o, true));
    nearLeaves.st.forEach((o) => spawn(nearLeaves, o, true));
  }

  // ---------- interaction + loop
  const pointer = new THREE.Vector2(); const smooth = new THREE.Vector2();
  let scrollP = 0; let running = false; let raf = 0; let last = performance.now();
  const clock = new THREE.Clock();
  const frameTimes = [];

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = clock.getElapsedTime();
    WIND_UNIFORMS.uTime.value = t;
    WIND_UNIFORMS.uWind.value = 0.85 + 0.35 * Math.sin(t * 0.21);

    // cinematic camera: slow drift, gentle mouse parallax, scroll rises + pushes in
    smooth.lerp(pointer, 0.025);
    const drift = Math.sin(t * 0.07) * 0.25;
    camera.position.set(
      CAM.x + smooth.x * 0.9 + drift,
      CAM.y + smooth.y * 0.45 + scrollP * 2.2,
      CAM.z - scrollP * 6,
    );
    camera.lookAt(LOOK.x + smooth.x * 1.5, LOOK.y + scrollP * 8, LOOK.z);
    renderer.toneMappingExposure = 1.05 - scrollP * 0.45;

    // moon: barely moves
    moon.rotation.z = t * 0.004;
    shafts.children.forEach((s, i) => {
      s.lookAt(camera.position);
      s.rotateZ(s.userData.tilt);
      s.material.opacity = 0.03 + 0.025 * (0.5 + 0.5 * Math.sin(t * 0.18 + s.userData.phase));
    });
    mists.forEach((m) => { m.material.map.offset.x = (t * m.userData.speed) % 1; });

    // cabin life: candle flicker + smoke
    const flick = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 13.1 + 1.3) + 0.04 * Math.sin(t * 23.7);
    hutLight.intensity = 18 * flick;
    warm.emissiveIntensity = 2.6 * flick;
    glows.forEach((g) => { g.material.opacity = 0.75 * flick; });
    smoke.forEach((s) => {
      s.userData.t = (s.userData.t + dt * 0.06) % 1;
      const k = s.userData.t;
      s.position.set(chimney.position.x + k * 2.2 + Math.sin(k * 6 + t * 0.4) * 0.3, chimney.position.y + 0.8 + k * 5, chimney.position.z);
      s.scale.setScalar(0.8 + k * 3.2);
      s.material.opacity = Math.sin(k * Math.PI) * 0.22;
    });

    if (!reduced) {
      stepLeaves(farLeaves, dt, t);
      stepLeaves(nearLeaves, dt, t);
    }
    renderer.render(scene, camera);

    // adaptive resolution: if the device struggles, drop the pixel ratio once
    if (frameTimes.length < 90) {
      frameTimes.push(dt);
      if (frameTimes.length === 90) {
        const avg = frameTimes.slice(30).reduce((a, b) => a + b, 0) / 60;
        if (avg > 0.024 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); layout(); }
      }
    }
  }
  function loop() { if (!running) return; frame(); raf = requestAnimationFrame(loop); }

  const onMove = (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  };
  const onResize = () => { layout(); if (!running) frame(); };

  layout();
  // pre-roll so leaves are already mid-air on first paint
  if (!reduced) for (let i = 0; i < 40; i++) { stepLeaves(farLeaves, 0.05, i * 0.05); }
  frame();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onMove, { passive: true });

  return {
    start() { if (running || reduced) return; running = true; last = performance.now(); loop(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    setScroll(p) { scrollP = p; if (reduced || !running) frame(); },
    dispose() {
      this.stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
