import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * World — one persistent WebGL landscape behind the entire portfolio.
 *
 * The page scroll drives a camera along a spline through the same place:
 *   hero      moon, ridges, pine forest, the lit cabin, the great maple on the left
 *   ch.1      walk toward the cabin; grass and rocks rise into the foreground
 *   ch.2      the village opens up: stone path, lanterns, the main house far ahead
 *   ch.3      flowering trees crowd the path; petals and leaves thicken
 *   ch.4      the garden and pavilion to the left
 *   ch.5      closer to the house, more lanterns
 *   end       standing before the house, moon above, everything calm
 *
 * Objects are staged along the path, so they arrive and leave naturally as the
 * camera travels — nothing is faded in or swapped. The hero frame (t = 0) is
 * composed by screen position so it holds on every aspect ratio.
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
const smooth01 = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function canvasTexture(size, draw, h = size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = h;
  draw(c.getContext('2d'), size, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function radialTexture(stops) {
  return canvasTexture(128, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });
}
// maple-ish leaf silhouette (white, tinted per instance)
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
      const x = Math.cos(a - Math.PI / 2) * r; const y = Math.sin(a - Math.PI / 2) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.filter = 'none';
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, s * 0.3); g.lineTo(0, -s * 0.34); g.stroke();
  });
}
// five-petal blossom
function blossomTexture() {
  return canvasTexture(64, (g, s) => {
    g.translate(s / 2, s / 2);
    for (let i = 0; i < 5; i++) {
      g.rotate((Math.PI * 2) / 5);
      g.beginPath(); g.ellipse(0, -s * 0.2, s * 0.13, s * 0.2, 0, 0, Math.PI * 2);
      g.fillStyle = '#fff'; g.fill();
    }
    g.beginPath(); g.arc(0, 0, s * 0.07, 0, Math.PI * 2); g.fillStyle = 'rgba(120,40,60,0.9)'; g.fill();
  });
}
function mistTexture() {
  return canvasTexture(256, (g, s) => {
    const r = rng(7);
    for (let i = 0; i < 70; i++) {
      const x = r() * s; const y = s * (0.35 + r() * 0.3); const rad = s * (0.08 + r() * 0.18);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
    }
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, s, s);
  });
}
// warm paper screen with a wooden lattice
function shojiTexture() {
  return canvasTexture(64, (g, s, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#ffd08a'); gr.addColorStop(1, '#ffae55');
    g.fillStyle = gr; g.fillRect(0, 0, s, h);
    g.fillStyle = 'rgba(40,20,10,0.85)';
    for (let x = 0; x <= s; x += s / 4) g.fillRect(x - 1.5, 0, 3, h);
    for (let y = 0; y <= h; y += h / 6) g.fillRect(0, y - 1.5, s, 3);
  }, 96);
}
// roof tiles: dark courses with a soft highlight line
function tileTexture() {
  const t = canvasTexture(64, (g, s) => {
    g.fillStyle = '#1b1c22'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 8) {
      g.fillStyle = 'rgba(160,170,200,0.10)'; g.fillRect(0, y, s, 1.5);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, y + 5, s, 2);
    }
    for (let x = 0; x < s; x += 8) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, 0, 1, s); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// shared wind: injected into materials (branches, foliage, grass)
const WIND = { uTime: { value: 0 }, uWind: { value: 1 } };
function addWind(material, { flutter = 0 } = {}) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = WIND.uTime;
    shader.uniforms.uWind = WIND.uWind;
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
  material.customProgramCacheKey = () => `wind-${flutter}`;
  return material;
}

// ---------------------------------------------------------------- world
export function createWorld(container, { tier = 'high', reduced = false } = {}) {
  const low = tier === 'low';
  const renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: false, powerPreference: 'high-performance' });
  // a soft, partly-veiled backdrop: render a little under native resolution
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
  const CAM = new THREE.Vector3(0, 9, 12);       // hero pose — do not move: the hero is composed against it
  const LOOK = new THREE.Vector3(0, 9.4, -100);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  const R = rng(20260101);
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };
  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const v3 = new THREE.Vector3(); const s3 = new THREE.Vector3();
  const e = new THREE.Euler();
  const UP = new THREE.Vector3(0, 1, 0);

  // village layout (world units ≈ metres)
  const HOUSE = new THREE.Vector3(0, 0, -118);
  const PAVILION = new THREE.Vector3(-17, 0, -86);
  const pathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(9, 0, -22), new THREE.Vector3(5, 0, -44), new THREE.Vector3(-1, 0, -66),
    new THREE.Vector3(2, 0, -88), new THREE.Vector3(0, 0, -108),
  ]);
  const pathPts = pathCurve.getSpacedPoints(120);
  function distToPath(x, z) {
    let d = Infinity;
    for (let i = 0; i < pathPts.length; i += 2) { const p = pathPts[i]; d = Math.min(d, (p.x - x) ** 2 + (p.z - z) ** 2); }
    return Math.sqrt(d);
  }

  // ---------- terrain: rolling near the start, a flat village basin, hills rising behind
  function groundH(x, z) {
    const d = -z;
    const roll = (fbm1(x * 0.03 + 7) - 0.5) * 2.4 + (fbm1(z * 0.04 + 1) - 0.5) * 1.6;
    const basin = 1 - smooth01(26, 44, Math.abs(x)) * smooth01(20, 60, d); // flatten the village strip
    const rise = Math.max(0, d - 142) * 0.11 * (0.6 + fbm1(x * 0.02 + 5)) + Math.max(0, Math.abs(x) - 48) * 0.06 * smooth01(40, 90, d);
    return roll * Math.min(1, Math.max(0, (d - 18) / 30)) * (1 - 0.8 * basin * smooth01(30, 60, d)) + rise;
  }

  // ---------- sky
  const moonDir = new THREE.Vector3(0.4, 0.3, -1).normalize();
  const skyMat = track(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#02040b') }, uMid: { value: new THREE.Color('#070d1f') },
      uHorizon: { value: new THREE.Color('#0f1a38') }, uMoonDir: { value: moonDir }, uGlow: { value: new THREE.Color('#4f5f8c') },
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

  const STARS = low ? 700 : 1500;
  const sPos = new Float32Array(STARS * 3); const sSeed = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    const th = R() * Math.PI * 2; const y = Math.pow(0.04 + R() * 0.96, 0.8); const r = Math.sqrt(1 - y * y);
    sPos.set([Math.cos(th) * r * 560, y * 560, Math.sin(th) * r * 560 - 60], i * 3);
    sSeed[i] = R();
  }
  const starGeo = track(new THREE.BufferGeometry());
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const starMat = track(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: WIND.uTime, uPR: { value: dpr } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPR; varying float vA;
      void main(){ vA = (0.35 + 0.65 * fract(aSeed * 13.7)) * (0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0));
        vA *= smoothstep(0.0, 120.0, position.y);
        gl_PointSize = (0.8 + pow(fract(aSeed * 91.3), 6.0) * 2.4) * uPR;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), vA * smoothstep(0.5, 0.0, d)); }`,
  }));
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---------- moon (a real sphere in the sky — it shifts with perspective as you travel)
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
  const haloTex = track(radialTexture([[0, 'rgba(255,120,170,0.0)'], [0.3, 'rgba(255,120,170,0.035)'], [0.6, 'rgba(140,150,220,0.03)'], [1, 'rgba(0,0,0,0)']]));
  const moonHalo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })));
  scene.add(moon, moonGlow, moonHalo);

  const moonLight = new THREE.DirectionalLight('#b8c6ff', 1.5);
  moonLight.castShadow = !low;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.bias = -0.0006;
  const sc = moonLight.shadow.camera;
  sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 300;
  scene.add(moonLight, moonLight.target);
  const hemi = new THREE.HemisphereLight('#2a3a66', '#07080a', 0.55);
  scene.add(hemi);

  // soft shafts of moonlight
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

  // ---------- ridges
  function ridge({ z, base, amp, freq, seed, color, width = 1000, dip }) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -40);
    for (let i = 0; i <= 240; i++) {
      const x = -width / 2 + (i / 240) * width;
      let y = base + amp * (fbm1(x * freq + seed, 5) - 0.35);
      if (dip) y -= dip.depth * Math.exp(-Math.pow((x - dip.x) / dip.w, 2)); // keep the sky clear around the moon
      shape.lineTo(x, y);
    }
    shape.lineTo(width / 2, -40); shape.closePath();
    const mesh = new THREE.Mesh(track(new THREE.ShapeGeometry(shape)), track(new THREE.MeshLambertMaterial({ color })));
    mesh.position.z = z;
    scene.add(mesh);
  }
  ridge({ z: -360, base: 22, amp: 46, freq: 0.012, seed: 3, color: '#1a2748', dip: { x: 140, w: 90, depth: 14 } });
  ridge({ z: -260, base: 14, amp: 30, freq: 0.02, seed: 11, color: '#111b33', dip: { x: 100, w: 70, depth: 8 } });
  ridge({ z: -185, base: 8, amp: 18, freq: 0.03, seed: 23, color: '#0b1222' });

  // ---------- ground
  const gGeo = track(new THREE.PlaneGeometry(760, 300, low ? 100 : 180, low ? 50 : 90));
  gGeo.rotateX(-Math.PI / 2);
  gGeo.translate(0, 0, -135);
  const gp = gGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, groundH(gp.getX(i), gp.getZ(i)));
  gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, track(new THREE.MeshLambertMaterial({ color: '#0e1510' })));
  ground.receiveShadow = !low;
  scene.add(ground);

  // pine forest — on the hills and flanks, never on the village strip
  const PINES = low ? 90 : 200;
  const pineGeo = track(mergeGeometries([
    new THREE.ConeGeometry(1, 2.2, 6).translate(0, 2.4, 0),
    new THREE.ConeGeometry(0.8, 1.9, 6).translate(0, 3.3, 0),
    new THREE.ConeGeometry(0.55, 1.5, 6).translate(0, 4.1, 0),
    new THREE.CylinderGeometry(0.12, 0.16, 1.4, 5).translate(0, 0.7, 0),
  ]));
  const pines = new THREE.InstancedMesh(pineGeo, track(new THREE.MeshLambertMaterial({ color: '#0a1511' })), PINES);
  let pc = 0;
  while (pc < PINES) {
    const z = -60 - R() * 120; const x = (R() - 0.5) * 360;
    if (Math.abs(x) < 34 && z > -150) continue;
    const s = 1.4 + R() * 2.2;
    m4.compose(v3.set(x, groundH(x, z) - 0.2, z), q.setFromAxisAngle(UP, R() * 6), s3.set(s, s * (0.9 + R() * 0.5), s));
    pines.setMatrixAt(pc++, m4);
  }
  pines.frustumCulled = false;
  scene.add(pines);

  // distant mist
  const mistTex = track(mistTexture());
  const mists = [];
  (low ? [[-60, 7, 0.5, 0], [-200, 18, 0.4, 1]] : [[-60, 7, 0.5, 0], [-150, 11, 0.35, 1], [-200, 18, 0.4, 1]]).forEach(([z, y, o, keep], i) => {
    const t = mistTex.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); track(t);
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(760, 30)), track(new THREE.MeshBasicMaterial({
      map: t, color: '#9fb1dd', transparent: true, opacity: o, depthWrite: false,
    })));
    m.position.set(0, y, z);
    m.userData = { speed: 0.004 + i * 0.0025, base: o, keep }; // the near band thins out before the camera reaches it
    mists.push(m); scene.add(m);
  });

  // ---------- materials shared by the architecture
  const wood = track(new THREE.MeshLambertMaterial({ color: '#3a2a20' }));
  const darkWood = track(new THREE.MeshLambertMaterial({ color: '#1f1511' }));
  const trim = track(new THREE.MeshLambertMaterial({ color: '#1b130f' }));
  const stone = track(new THREE.MeshLambertMaterial({ color: '#3b3f47' }));
  const tileTex = track(tileTexture());
  const tiles = track(new THREE.MeshLambertMaterial({ map: tileTex, side: THREE.DoubleSide }));
  const warm = track(new THREE.MeshStandardMaterial({ color: '#ffb866', emissive: '#ff9a3c', emissiveIntensity: 2.6 }));
  const shoji = track(new THREE.MeshBasicMaterial({ map: track(shojiTexture()), color: '#ffffff' }));
  const warmGlowTex = track(radialTexture([[0, 'rgba(255,190,110,0.9)'], [0.25, 'rgba(255,150,70,0.35)'], [1, 'rgba(255,120,40,0)']]));
  const glowSprites = [];
  function glow(parent, pos, size, opacity = 0.8) {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: warmGlowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity })));
    s.position.copy(pos); s.scale.setScalar(size); s.userData.base = opacity;
    parent.add(s); glowSprites.push(s);
    return s;
  }

  // curved hip roof with lifted corners (the silhouette that makes the village read)
  function hipRoof(w, d, h, over, lift = 0.5) {
    const hw = w / 2 + over; const hd = d / 2 + over;
    const g = new THREE.PlaneGeometry(hw * 2, hd * 2, 28, 18);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const ridgeHalf = Math.max(0, hw - hd);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i); const z = p.getZ(i);
      const fx = Math.max(0, Math.abs(x) - ridgeHalf) / hd; const fz = Math.abs(z) / hd;
      const f = Math.min(1, Math.max(fx, fz));                   // 0 at the ridge, 1 at the eave
      let y = h * (1 - Math.pow(f, 0.62));                        // concave sweep
      y += lift * Math.pow(Math.abs(x) / hw, 8) + lift * 0.6 * Math.pow(fz, 10) * Math.pow(Math.abs(x) / hw, 2);
      p.setY(i, y);
    }
    g.computeVertexNormals();
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 0.8, uv.getY(i) * d * 0.8);
    return track(g);
  }

  // ---------- the cabin (hero)
  const cabin = new THREE.Group();
  const CW = 4.2; const CD = 3.4; const CH = 2.5;
  const body = new THREE.Mesh(track(new THREE.BoxGeometry(CW, CH, CD)), wood);
  body.position.y = CH / 2;
  for (let i = 0; i < 6; i++) {
    const log = new THREE.Mesh(track(new THREE.BoxGeometry(CW + 0.24, 0.06, CD + 0.24)), trim);
    log.position.y = 0.3 + i * 0.42; cabin.add(log);
  }
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-CD / 2 - 0.55, 0); roofShape.lineTo(0, 1.9); roofShape.lineTo(CD / 2 + 0.55, 0); roofShape.lineTo(-CD / 2 - 0.55, 0);
  const croof = new THREE.Mesh(track(new THREE.ExtrudeGeometry(roofShape, { depth: CW + 0.7, bevelEnabled: false })), track(new THREE.MeshLambertMaterial({ color: '#241a16' })));
  croof.rotation.y = Math.PI / 2; croof.position.set(-(CW + 0.7) / 2, CH - 0.05, 0);
  const gable = new THREE.Shape(); gable.moveTo(-CD / 2, 0); gable.lineTo(0, 1.6); gable.lineTo(CD / 2, 0);
  const gables = [-1, 1].map((sgn) => {
    const g = new THREE.Mesh(track(new THREE.ShapeGeometry(gable)), wood);
    g.rotation.y = (Math.PI / 2) * sgn; g.position.set((sgn * CW) / 2, CH, 0);
    return g;
  });
  const chimney = new THREE.Mesh(track(new THREE.BoxGeometry(0.5, 1.6, 0.5)), trim);
  chimney.position.set(CW / 2 - 0.9, CH + 1.3, -0.5);
  const winGeo = track(new THREE.PlaneGeometry(0.75, 0.7));
  const cwins = [-1.15, 1.15].map((x) => {
    const w = new THREE.Mesh(winGeo, warm); w.position.set(x, 1.35, CD / 2 + 0.02);
    const f1 = new THREE.Mesh(track(new THREE.PlaneGeometry(0.06, 0.7)), trim); f1.position.set(x, 1.35, CD / 2 + 0.03);
    const f2 = new THREE.Mesh(track(new THREE.PlaneGeometry(0.75, 0.06)), trim); f2.position.set(x, 1.35, CD / 2 + 0.03);
    cabin.add(f1, f2);
    return w;
  });
  const door = new THREE.Mesh(track(new THREE.PlaneGeometry(0.8, 1.55)), track(new THREE.MeshStandardMaterial({ color: '#1c1310', emissive: '#ff8a2a', emissiveIntensity: 0.22 })));
  door.position.set(0, 0.78, CD / 2 + 0.02);
  const sideWin = new THREE.Mesh(winGeo, warm);
  sideWin.rotation.y = Math.PI / 2; sideWin.position.set(CW / 2 + 0.02, 1.35, 0.2);
  const lanternC = new THREE.Mesh(track(new THREE.SphereGeometry(0.1, 10, 8)), warm);
  lanternC.position.set(0.7, 1.9, CD / 2 + 0.25);
  cabin.add(body, croof, ...gables, chimney, ...cwins, door, sideWin, lanternC);
  cabin.traverse((o) => { if (o.isMesh) { o.castShadow = !low; o.receiveShadow = !low; } });
  // (the cabin's spill light is the roaming warm light below — one point light for the whole world)
  const hutLightLocal = new THREE.Vector3(0, 1.6, CD / 2 + 1.4);
  [...cwins.map((w) => w.position), sideWin.position].forEach((p) => glow(cabin, p.clone().add(new THREE.Vector3(0, 0, 0.1)), 1.9, 0.85));
  glow(cabin, lanternC.position, 1.1, 0.85);
  const pool = glow(cabin, new THREE.Vector3(0, 0.6, CD / 2 + 2.2), 1, 0.35); pool.scale.set(9, 3, 1);
  scene.add(cabin);

  const smokeTex = track(radialTexture([[0, 'rgba(200,210,235,0.35)'], [0.5, 'rgba(160,170,200,0.12)'], [1, 'rgba(0,0,0,0)']]));
  const smoke = [];
  for (let i = 0; i < (low ? 5 : 9); i++) {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })));
    s.userData = { t: i / 9 }; smoke.push(s); cabin.add(s);
  }

  // fireflies (cabin + garden)
  function fireflies(parent, count, spread) {
    const pos = new Float32Array(count * 3); const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) { pos.set([(R() - 0.5) * spread, 0.4 + R() * 2.5, (R() - 0.5) * spread * 0.7], i * 3); seed[i] = R(); }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const mat = track(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: WIND.uTime, uPR: { value: dpr } },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPR; varying float vA;
        void main(){ vec3 p = position; float t = uTime * (0.25 + aSeed * 0.3) + aSeed * 50.0;
          p += vec3(sin(t) * 1.2, sin(t * 1.3) * 0.5, cos(t * 0.8) * 1.0);
          vA = pow(0.5 + 0.5 * sin(uTime * (1.2 + aSeed) + aSeed * 30.0), 3.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = min(5.0 * uPR * (30.0 / -mv.z), 9.0 * uPR);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        gl_FragColor = vec4(1.0, 0.78, 0.4, vA * smoothstep(0.5, 0.0, d)); }`,
    }));
    const pts = new THREE.Points(geo, mat);
    parent.add(pts);
  }
  fireflies(cabin, low ? 16 : 34, 16);

  // ---------- the main house (end of the journey)
  const house = new THREE.Group();
  const lanternLights = [];
  {
    const pw = 18; const pd = 12;
    const plinth = new THREE.Mesh(track(new THREE.BoxGeometry(pw, 1.2, pd)), stone);
    plinth.position.y = 0.6; house.add(plinth);
    for (let i = 0; i < 5; i++) { // front steps
      const st = new THREE.Mesh(track(new THREE.BoxGeometry(5.5, 0.24, 0.55)), stone);
      st.position.set(0, 0.12 + i * 0.24, pd / 2 + 2.6 - i * 0.55); house.add(st);
    }
    // ground floor
    const gw = 14; const gd = 8.5; const gh = 3.8;
    const g1 = new THREE.Mesh(track(new THREE.BoxGeometry(gw, gh, gd)), darkWood);
    g1.position.y = 1.2 + gh / 2; house.add(g1);
    // posts along the veranda
    const postGeo = track(new THREE.BoxGeometry(0.28, gh, 0.28));
    for (let i = 0; i <= 7; i++) {
      const p = new THREE.Mesh(postGeo, trim); p.position.set(-gw / 2 - 0.4 + (i / 7) * (gw + 0.8), 1.2 + gh / 2, gd / 2 + 1.1); house.add(p);
    }
    const veranda = new THREE.Mesh(track(new THREE.BoxGeometry(gw + 1.2, 0.2, 1.6)), wood);
    veranda.position.set(0, 1.3, gd / 2 + 0.7); house.add(veranda);
    // glowing screens across the front
    const scrGeo = track(new THREE.PlaneGeometry(1.35, 2.3));
    for (let i = 0; i < 8; i++) {
      const s = new THREE.Mesh(scrGeo, shoji);
      s.position.set(-gw / 2 + 0.95 + i * ((gw - 1.9) / 7), 1.2 + 1.55, gd / 2 + 0.02);
      house.add(s);
      if (i % 2 === 0) glow(house, s.position.clone().add(new THREE.Vector3(0.8, 0, 0.4)), 3.4, 0.35);
    }
    // lower roof
    const r1 = new THREE.Mesh(hipRoof(gw, gd, 2.1, 2.2, 0.7), tiles);
    r1.position.y = 1.2 + gh; house.add(r1);
    // upper storey
    const uw = 9; const ud = 5.4; const uh = 2.6;
    const g2 = new THREE.Mesh(track(new THREE.BoxGeometry(uw, uh, ud)), darkWood);
    g2.position.y = 1.2 + gh + 1.4 + uh / 2; house.add(g2);
    const scr2 = track(new THREE.PlaneGeometry(1.1, 1.5));
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(scr2, shoji);
      s.position.set(-uw / 2 + 1.0 + i * ((uw - 2) / 4), g2.position.y, ud / 2 + 0.02);
      house.add(s);
    }
    const r2 = new THREE.Mesh(hipRoof(uw, ud, 2.6, 1.9, 0.8), tiles);
    r2.position.y = g2.position.y + uh / 2; house.add(r2);
    // hanging paper lanterns under the eaves — the site's pink, as warm light
    const paper = track(new THREE.MeshStandardMaterial({ color: '#ff6b8f', emissive: '#ff4d7d', emissiveIntensity: 1.8 }));
    const lg = track(new THREE.SphereGeometry(0.34, 14, 10));
    [-5.2, -1.8, 1.8, 5.2].forEach((x) => {
      const l = new THREE.Mesh(lg, paper); l.scale.y = 1.3; l.position.set(x, 1.2 + gh - 0.7, gd / 2 + 1.7); house.add(l);
      const gs = glow(house, l.position, 2.2, 0.6); gs.material.color.set('#ff7aa0');
    });
    lanternLights.push(new THREE.Vector3(0, 3, gd / 2 + 4)); // warm-light anchor in front of the house (local)
  }
  house.traverse((o) => { if (o.isMesh) { o.castShadow = !low; o.receiveShadow = !low; } });
  house.position.copy(HOUSE); house.position.y = groundH(HOUSE.x, HOUSE.z) - 0.3;
  scene.add(house);

  // ---------- pavilion in the garden
  const pavilion = new THREE.Group();
  {
    const deck = new THREE.Mesh(track(new THREE.BoxGeometry(5.2, 0.5, 5.2)), stone); deck.position.y = 0.25; pavilion.add(deck);
    const post = track(new THREE.CylinderGeometry(0.14, 0.16, 3, 8));
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => { const p = new THREE.Mesh(post, trim); p.position.set(x, 2, z); pavilion.add(p); });
    const r = new THREE.Mesh(hipRoof(4.4, 4.4, 1.7, 1.1, 0.55), tiles); r.position.y = 3.5; pavilion.add(r);
    const lamp = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.5, 0.4)), warm); lamp.position.y = 2.7; pavilion.add(lamp);
    glow(pavilion, lamp.position, 3, 0.7);
  }
  pavilion.traverse((o) => { if (o.isMesh) { o.castShadow = !low; o.receiveShadow = !low; } });
  pavilion.position.set(PAVILION.x, groundH(PAVILION.x, PAVILION.z), PAVILION.z); pavilion.rotation.y = 0.5;
  scene.add(pavilion);
  fireflies(pavilion, low ? 10 : 22, 14);

  // ---------- stone lanterns along the path (instanced stone + instanced light boxes + glow sprites)
  const lanternStone = track(mergeGeometries([
    new THREE.CylinderGeometry(0.42, 0.5, 0.25, 8).translate(0, 0.12, 0),
    new THREE.CylinderGeometry(0.13, 0.16, 0.9, 8).translate(0, 0.7, 0),
    new THREE.CylinderGeometry(0.42, 0.34, 0.18, 6).translate(0, 1.2, 0),
    new THREE.ConeGeometry(0.62, 0.45, 6).translate(0, 1.85, 0),
    new THREE.SphereGeometry(0.1, 8, 6).translate(0, 2.12, 0),
  ]));
  const lanternBox = track(new THREE.BoxGeometry(0.4, 0.4, 0.4).translate(0, 1.45, 0));
  const lanternSpots = [];
  for (let i = 17, k = 0; i < pathPts.length - 6; i += 9, k++) {
    const p = pathPts[i]; const t = pathCurve.getTangentAt(i / (pathPts.length - 1));
    const side = k % 2 ? 1 : -1;
    const n = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(2.6 * side);
    lanternSpots.push(new THREE.Vector3(p.x + n.x, 0, p.z + n.z));
  }
  const lanStone = new THREE.InstancedMesh(lanternStone, stone, lanternSpots.length);
  const lanFire = new THREE.InstancedMesh(lanternBox, warm, lanternSpots.length);
  lanternSpots.forEach((p, i) => {
    p.y = groundH(p.x, p.z);
    m4.compose(p, q.setFromAxisAngle(UP, R()), s3.set(1.1, 1.1, 1.1));
    lanStone.setMatrixAt(i, m4); lanFire.setMatrixAt(i, m4);
    glow(scene, p.clone().add(new THREE.Vector3(0, 1.6, 0)), 2.6, 0.75);
  });
  lanStone.castShadow = !low; lanStone.frustumCulled = false; lanFire.frustumCulled = false;
  scene.add(lanStone, lanFire);
  // ONE warm point light for the whole world: it moves to whichever warm source (cabin, lantern, house)
  // is nearest ahead of the camera — every material pays per light, so this keeps the scene cheap
  const warmLight = new THREE.PointLight('#ffa552', 18, 24, 1.6);
  scene.add(warmLight);

  // ---------- stone path slabs
  const slabGeo = track(new THREE.BoxGeometry(1.25, 0.14, 0.95));
  const SLABS = Math.floor(pathPts.length * 1.3);
  const slabs = new THREE.InstancedMesh(slabGeo, stone, SLABS);
  for (let i = 0; i < SLABS; i++) {
    const u = i / SLABS; const p = pathCurve.getPointAt(u); const t = pathCurve.getTangentAt(u);
    const n = new THREE.Vector3(-t.z, 0, t.x).multiplyScalar((R() - 0.5) * 0.9);
    m4.compose(v3.set(p.x + n.x, groundH(p.x, p.z) + 0.04, p.z + n.z), q.setFromAxisAngle(UP, Math.atan2(t.x, t.z) + (R() - 0.5) * 0.4), s3.set(0.8 + R() * 0.5, 1, 0.8 + R() * 0.4));
    slabs.setMatrixAt(i, m4);
  }
  slabs.receiveShadow = !low; slabs.frustumCulled = false;
  scene.add(slabs);

  // ---------- rocks (garden + foreground)
  const rockGeo = new THREE.IcosahedronGeometry(1, 1);
  { const p = rockGeo.attributes.position; for (let i = 0; i < p.count; i++) { v3.fromBufferAttribute(p, i); v3.multiplyScalar(0.75 + hash1(i * 3.1 + v3.x) * 0.45); v3.y *= 0.62; p.setXYZ(i, v3.x, v3.y, v3.z); } rockGeo.computeVertexNormals(); }
  track(rockGeo);
  const rockSpots = [];
  for (let i = 0; i < (low ? 40 : 70); i++) {
    const u = 0.05 + R() * 0.93; const p = pathCurve.getPointAt(u); const side = R() < 0.5 ? -1 : 1;
    rockSpots.push([p.x + side * (3.5 + R() * 9), p.z + (R() - 0.5) * 6, 0.3 + R() * 0.9]);
  }
  for (let i = 0; i < 14; i++) rockSpots.push([PAVILION.x + (R() - 0.5) * 16, PAVILION.z + (R() - 0.5) * 14, 0.5 + R() * 1.3]); // garden
  const rocks = new THREE.InstancedMesh(rockGeo, track(new THREE.MeshLambertMaterial({ color: '#2d3139' })), rockSpots.length);
  rockSpots.forEach(([x, z, s], i) => { m4.compose(v3.set(x, groundH(x, z) + s * 0.15, z), q.setFromEuler(e.set(R() * 0.4, R() * 6, R() * 0.4)), s3.set(s * (1 + R() * 0.6), s, s)); rocks.setMatrixAt(i, m4); });
  rocks.castShadow = !low; rocks.receiveShadow = !low; rocks.frustumCulled = false;
  scene.add(rocks);

  // ---------- grass + reeds (wind-driven)
  function grassField(count, { h = 0.9, w = 0.07, colors, region }) {
    const blade = new THREE.BufferGeometry();
    blade.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, 0, h, 0], 3));
    blade.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    blade.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
    const sway = new Float32Array(count); const ph = new Float32Array(count);
    blade.setAttribute('aSway', new THREE.InstancedBufferAttribute(sway, 1));
    blade.setAttribute('aPhase', new THREE.InstancedBufferAttribute(ph, 1));
    track(blade);
    const mat = addWind(track(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide })));
    const mesh = new THREE.InstancedMesh(blade, mat, count);
    let n = 0;
    while (n < count) {
      const [x, z] = region();
      if (distToPath(x, z) < 1.4) continue;
      if (Math.abs(x - HOUSE.x) < 11 && Math.abs(z - HOUSE.z) < 9) continue;
      const s = 0.6 + R() * 0.9;
      m4.compose(v3.set(x, groundH(x, z), z), q.setFromEuler(e.set((R() - 0.5) * 0.4, R() * 6.28, (R() - 0.5) * 0.4)), s3.set(s, s * (0.7 + R() * 0.7), s));
      mesh.setMatrixAt(n, m4);
      mesh.setColorAt(n, new THREE.Color(colors[Math.floor(R() * colors.length)]).multiplyScalar(0.7 + R() * 0.5));
      sway[n] = 0.25 * s; ph[n] = R() * 6.28;
      n++;
    }
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }
  const along = () => { const p = pathCurve.getPointAt(R()); return [p.x + (R() - 0.5) * 34, p.z + (R() - 0.5) * 16]; };
  const nearStart = () => [(R() - 0.2) * 40, -8 - R() * 30];
  grassField(low ? 1100 : 2600, { colors: ['#1c2a18', '#23331b', '#2b3a1f', '#1a2416'], region: () => (R() < 0.35 ? nearStart() : along()) });
  grassField(low ? 120 : 320, { h: 2.1, w: 0.05, colors: ['#8a7b5c', '#6f6450', '#9a8a68'], region: () => { const p = pathCurve.getPointAt(0.35 + R() * 0.65); return [p.x + (R() < 0.5 ? -1 : 1) * (3 + R() * 10), p.z + (R() - 0.5) * 10]; } });

  // ---------- trees (procedural, merged branches + instanced foliage, all wind-driven)
  const leafTex = track(leafTexture());
  const blossomTex = track(blossomTexture());
  const MAPLE = ['#6b1426', '#7e1a2e', '#962532', '#a8342e', '#5a1020', '#b4472a', '#842238'].map((c) => new THREE.Color(c));
  const BLOSSOM = ['#f7a8c4', '#ff8fb3', '#ffc2d6', '#e86b98', '#fbe3ec'].map((c) => new THREE.Color(c));
  const barkMat = addWind(track(new THREE.MeshLambertMaterial({ color: '#221915', emissive: '#07080d' })));

  function buildTree({ seed, trunk, limbs, maxDepth, budget, palette, tex, leafSize, emissive }) {
    const rnd = rng(seed);
    const segs = []; const tips = [];
    let maxPath = 1;
    function seg(start, dir, len, rad, path, radial) {
      const end = start.clone().addScaledVector(dir, len);
      const g = new THREE.CylinderGeometry(rad * 0.72, rad, len, radial, 3, true);
      g.translate(0, len / 2, 0);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir));
      g.translate(start.x, start.y, start.z);
      const pos = g.attributes.position; const sw = new Float32Array(pos.count); const ph = new Float32Array(pos.count);
      const tmp = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) { tmp.fromBufferAttribute(pos, i).sub(start); sw[i] = path + THREE.MathUtils.clamp(tmp.dot(dir) / len, 0, 1) * len; }
      g.setAttribute('aSway', new THREE.BufferAttribute(sw, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
      segs.push(g); maxPath = Math.max(maxPath, path + len);
      return end;
    }
    function grow(start, dir, len, rad, depth, path) {
      const end = seg(start, dir, len, rad, path, depth < 2 ? 7 : 5);
      if (depth >= maxDepth) { tips.push({ p: end, path: path + len }); return; }
      const kids = rnd() < 0.3 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        const nd = dir.clone();
        nd.applyAxisAngle(new THREE.Vector3(rnd() - 0.5, rnd() * 0.3 - 0.15, rnd() - 0.5).normalize(), 0.3 + rnd() * 0.45);
        nd.x += 0.03; nd.y += depth < 2 ? 0.08 : -0.06; nd.normalize();
        grow(end, nd, len * (0.68 + rnd() * 0.12), rad * 0.6, depth + 1, path + len);
      }
      if (depth >= 2 && rnd() < 0.85) tips.push({ p: end, path: path + len });
    }
    let p0 = new THREE.Vector3(0, -0.5, 0); let path0 = 0;
    trunk.forEach(([x, y, z, l, r], i) => {
      const d = new THREE.Vector3(x, y, z).normalize();
      const e2 = seg(p0, d, l, r, path0, 9);
      if (i === 1 && trunk.length > 2) grow(p0.clone().lerp(e2, 0.55), new THREE.Vector3(-0.8, 0.6, 0.15).normalize(), l * 0.38, r * 0.25, maxDepth - 1, path0 + l * 0.55);
      path0 += l; p0 = e2;
    });
    limbs.forEach(([x, y, z, l, r]) => grow(p0, new THREE.Vector3(x, y, z).normalize(), l, r, 1, path0));
    segs.forEach((g) => { const a = g.attributes.aSway; for (let i = 0; i < a.count; i++) a.array[i] = Math.pow(a.array[i] / maxPath, 2.2) * 0.55; });
    const group = new THREE.Group();
    const bark = new THREE.Mesh(track(mergeGeometries(segs)), barkMat);
    segs.forEach((g) => g.dispose());
    bark.castShadow = !low;
    group.add(bark);

    const perTip = Math.max(5, Math.round(budget / tips.length));
    const COUNT = tips.length * perTip;
    const geo = new THREE.PlaneGeometry(leafSize, leafSize);
    const sway = new Float32Array(COUNT); const ph = new Float32Array(COUNT);
    geo.setAttribute('aSway', new THREE.InstancedBufferAttribute(sway, 1));
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(ph, 1));
    track(geo);
    const mat = addWind(track(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, emissive })), { flutter: 0.02 });
    const fol = new THREE.InstancedMesh(geo, mat, COUNT);
    const pts = [];
    let n = 0;
    tips.forEach((t) => {
      for (let i = 0; i < perTip; i++) {
        const p = t.p.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.4, (rnd() - 0.4) * 1.0, (rnd() - 0.5) * 1.4));
        const s = 0.7 + rnd() * 0.7;
        m4.compose(p, q.setFromEuler(e.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28)), s3.set(s, s, s));
        fol.setMatrixAt(n, m4);
        fol.setColorAt(n, palette[Math.floor(rnd() * palette.length)].clone().multiplyScalar(0.8 + rnd() * 0.4));
        sway[n] = Math.pow(t.path / maxPath, 2.2) * 0.55; ph[n] = rnd() * 6.28;
        pts.push(p); n++;
      }
    });
    group.add(fol);
    const canopyLow = pts.map((p) => p.y).sort((a, b) => a - b)[Math.floor(pts.length * 0.08)];
    return { group, pts, canopyLow };
  }

  // the great maple of the hero (tall trunk from below the frame, crown over the top-left)
  const heroTree = buildTree({
    seed: 11, maxDepth: low ? 4 : 5, budget: low ? 1400 : 2600, palette: MAPLE, tex: leafTex, leafSize: 0.3, emissive: '#2b0812',
    trunk: [[0.08, 1, 0.02, 3.8, 0.34], [-0.06, 1, 0, 3.4, 0.29], [0.1, 1, 0.03, 3.3, 0.25]],
    limbs: [[0.35, 1, 0.1, 2.5, 0.15], [0.85, 0.65, -0.12, 2.4, 0.15], [-0.45, 0.9, 0.15, 2.1, 0.15], [1, 0.2, -0.2, 2.1, 0.15]],
  });
  const tree = heroTree.group;
  tree.rotation.y = 0.15;
  scene.add(tree);

  // flowering trees staged along the path — they arrive as the camera walks in
  const FLOWERING = [
    { at: [-8.5, -46], rot: 0.4, s: 1.05, seed: 21, palette: BLOSSOM, tex: blossomTex, emissive: '#3a1020' },
    { at: [11, -64], rot: 2.6, s: 1.0, seed: 31, palette: MAPLE, tex: leafTex, emissive: '#2b0812' },
    { at: [-7.5, -92], rot: 0.9, s: 1.1, seed: 41, palette: BLOSSOM, tex: blossomTex, emissive: '#3a1020' },
    { at: [12.5, -100], rot: 3.4, s: 0.95, seed: 51, palette: BLOSSOM, tex: blossomTex, emissive: '#3a1020' },
  ].slice(0, low ? 3 : 4);
  const gardenTrees = FLOWERING.map((f) => {
    const t = buildTree({
      seed: f.seed, maxDepth: low ? 4 : 5, budget: low ? 700 : 1500, palette: f.palette, tex: f.tex, leafSize: f.tex === blossomTex ? 0.26 : 0.3, emissive: f.emissive,
      trunk: [[0.12, 1, 0.05, 2.2, 0.26], [-0.1, 1, 0, 1.8, 0.21]],
      limbs: [[0.8, 0.7, 0.2, 2.2, 0.12], [-0.8, 0.65, -0.1, 2.0, 0.12], [0.2, 1, -0.5, 1.8, 0.11], [-0.1, 0.8, 0.7, 1.7, 0.11]],
    });
    t.group.position.set(f.at[0], groundH(f.at[0], f.at[1]) - 0.2, f.at[1]);
    t.group.rotation.y = f.rot; t.group.scale.setScalar(f.s);
    scene.add(t.group);
    t.group.updateMatrixWorld(true);
    t.world = t.pts.map((p) => p.clone().applyMatrix4(t.group.matrixWorld));
    t.petal = f.tex === blossomTex;
    return t;
  });

  // distant hamlet: small lit houses on the far slopes
  {
    const hut = track(mergeGeometries([
      new THREE.BoxGeometry(3, 2, 2.4).translate(0, 1, 0),
      hipRoof(3, 2.4, 1.2, 0.6, 0.25).clone().translate(0, 2, 0),
    ]));
    const N = low ? 8 : 16;
    const huts = new THREE.InstancedMesh(hut, darkWood, N);
    const litPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const x = (R() < 0.5 ? -1 : 1) * (40 + R() * 90); const z = -150 - R() * 50;
      const y = groundH(x, z);
      m4.compose(v3.set(x, y, z), q.setFromAxisAngle(UP, R() * 6), s3.set(1.3, 1.3, 1.3)); huts.setMatrixAt(i, m4);
      litPos.set([x, y + 1.3, z + 1.7], i * 3);
    }
    huts.frustumCulled = false;
    scene.add(huts);
    const litGeo = track(new THREE.BufferGeometry()); litGeo.setAttribute('position', new THREE.BufferAttribute(litPos, 3));
    const lit = new THREE.Points(litGeo, track(new THREE.PointsMaterial({ color: '#ffb35c', size: 3.2 * dpr, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })));
    scene.add(lit);
  }

  // ---------- falling leaves + petals
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
      st.push({ p: new THREE.Vector3(), q: new THREE.Quaternion(), axis: new THREE.Vector3(), spin: 0, ph: 0, s: 1, fall: 1, sway: 1, src: 0 });
    }
    scene.add(mesh);
    return { mesh, st, near, count };
  }
  const leavesTree = makeFalling(reduced ? 20 : low ? 50 : 120, leafTex, false);          // from the hero maple
  const leavesAmbient = makeFalling(reduced ? 20 : low ? 70 : 180, leafTex, false);       // around the camera, all journey long
  const petals = makeFalling(reduced ? 10 : low ? 40 : 110, blossomTex, false);           // from the flowering trees
  const nearLeaves = makeFalling(reduced ? 0 : low ? 3 : 8, track(leafTexture(2.2)), true); // soft, close to the lens
  const heroTreeWorld = new THREE.Matrix4();
  const camF = new THREE.Vector3(); const camR = new THREE.Vector3(); const camU = new THREE.Vector3();

  function colorFor(L, i) {
    const pal = L === petals ? BLOSSOM : MAPLE;
    L.mesh.setColorAt(i, pal[Math.floor(R() * pal.length)].clone().multiplyScalar(L.near ? 0.7 : 0.95 + R() * 0.3));
  }
  function spawn(L, o, i, initial) {
    if (L === nearLeaves) {
      const d = 3 + R() * 4;
      o.p.copy(pointAtCam(-1.1 + R() * 1.6, initial ? R() * 2 - 1 : 1.15, d));
      o.s = 0.9 + R() * 0.6; o.fall = 0.35 + R() * 0.3;
    } else if (L === leavesTree) {
      o.p.copy(heroTree.pts[Math.floor(R() * heroTree.pts.length)]).applyMatrix4(heroTreeWorld);
      if (initial) { o.p.x += R() * 14; o.p.y -= R() * 10; }
      o.s = 0.8 + R() * 0.7; o.fall = 0.45 + R() * 0.55;
    } else if (L === petals) {
      const t = gardenTrees[Math.floor(R() * gardenTrees.length)];
      o.p.copy(t.world[Math.floor(R() * t.world.length)]);
      if (initial) { o.p.x += R() * 8; o.p.y -= R() * 5; }
      o.s = 0.7 + R() * 0.6; o.fall = 0.3 + R() * 0.4;
    } else {
      // ambient: somewhere ahead of the camera, above the view, drifting down through it
      const d = 5 + R() * 28;
      const side = (R() - 0.5) * d * 1.3;
      o.p.copy(camera.position).addScaledVector(camF, d).addScaledVector(camR, side).addScaledVector(camU, initial ? (R() - 0.3) * d * 0.8 : d * 0.45 + R() * 4);
      o.s = 0.8 + R() * 0.8; o.fall = 0.4 + R() * 0.6;
    }
    colorFor(L, i);
    o.axis.set(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
    o.spin = (R() - 0.5) * 4; o.ph = R() * 100; o.sway = 0.6 + R() * 1.1;
    o.q.setFromEuler(e.set(R() * 6.28, R() * 6.28, R() * 6.28));
  }
  const dq = new THREE.Quaternion();
  const toCam = new THREE.Vector3();
  function stepLeaves(L, dt, t, active) {
    const { mesh, st } = L;
    const n = Math.max(0, Math.min(st.length, Math.round(st.length * active)));
    mesh.count = n;
    for (let i = 0; i < n; i++) {
      const o = st[i];
      const wind = 1.1 + 0.6 * Math.sin(t * 0.3 + o.ph);
      o.p.x += (wind + Math.sin(t * 1.3 * o.sway + o.ph) * 0.9) * dt * (L.near ? 0.55 : 1);
      o.p.y -= o.fall * dt * (1 + 0.35 * Math.sin(t * 2.1 + o.ph));
      o.p.z += Math.cos(t * 0.9 * o.sway + o.ph) * 0.35 * dt;
      dq.setFromAxisAngle(o.axis, o.spin * dt); o.q.multiply(dq);
      let dead = o.p.y < (L.near ? camera.position.y - 6 : groundH(o.p.x, o.p.z) + 0.1);
      if (L === leavesAmbient) {
        toCam.copy(o.p).sub(camera.position);
        const f = toCam.dot(camF);
        if (f < 1 || f > 45 || Math.abs(toCam.dot(camR)) > f * 1.2) dead = true; // left the view volume
      }
      if (L !== nearLeaves && o.p.x > 140) dead = true;
      if (dead) spawn(L, o, i, false);
      m4.compose(o.p, o.q, s3.set(o.s, o.s, o.s));
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  // ---------- placement helpers (hero composition is solved at the hero camera pose)
  const ndcV = new THREE.Vector3();
  function pointAtCam(nx, ny, dist) {
    ndcV.set(nx, ny, 0.5).unproject(camera);
    return ndcV.sub(camera.position).normalize().multiplyScalar(dist).add(camera.position);
  }
  function groundAt(nx, ny) {
    ndcV.set(nx, ny, 0.5).unproject(camera);
    const dir = ndcV.sub(camera.position).normalize();
    let t = 2;
    for (let i = 0; i < 220; i++) {
      const p = camera.position.clone().addScaledVector(dir, t);
      if (p.y <= groundH(p.x, p.z)) return p;
      t += 0.6;
    }
    return camera.position.clone().addScaledVector(dir, 60);
  }

  // ---------- camera journey
  let posCurve = null; let lookCurve = null; let KEYS = 1;
  const CHAPTER = {
    fog: [0.0078, 0.0088, 0.0105, 0.012, 0.012, 0.0115, 0.0105],
    exposure: [1.05, 1.0, 1.02, 1.05, 1.0, 1.0, 1.05],
    ambient: [0.35, 0.7, 0.9, 1, 0.85, 0.75, 0.55],
    petals: [0, 0.15, 0.7, 1, 0.7, 0.8, 0.6],
    tree: [1, 0.6, 0.15, 0, 0, 0, 0],
  };
  function chapterValue(arr, u) {
    const x = u * (arr.length - 1); const i = Math.min(arr.length - 2, Math.floor(x)); const f = x - i;
    return arr[i] + (arr[i + 1] - arr[i]) * (f * f * (3 - 2 * f));
  }
  function buildJourney(portrait) {
    const c = cabin.position;
    const hx = HOUSE.x; const hz = HOUSE.z; const hy = house.position.y;
    const P = [
      CAM.clone(),
      new THREE.Vector3(c.x * 0.3 - 2, 5.4, c.z * 0.35 - 2),        // toward the cabin
      new THREE.Vector3(-2.5, 4.2, -36),                              // the village opens up
      new THREE.Vector3(4.5, 3.4, -55),                               // among the flowering trees
      new THREE.Vector3(-4.5, 3.3, -70),                              // garden + pavilion
      new THREE.Vector3(8, 3.5, -80),                                 // along the lanterns
      new THREE.Vector3(portrait ? 0 : 1.5, 3.3, hz + 38),           // before the house
    ];
    const L = [
      LOOK.clone(),
      new THREE.Vector3(c.x, 2.8, c.z - 10),
      new THREE.Vector3(3, 5.5, hz),
      new THREE.Vector3(-4, 5, hz - 4),
      new THREE.Vector3(PAVILION.x - 2, 3.6, PAVILION.z - 14),
      new THREE.Vector3(-2, hy + 5, hz),
      new THREE.Vector3(hx, hy + 6.8, hz),
    ];
    posCurve = new THREE.CatmullRomCurve3(P, false, 'centripetal', 0.5);
    lookCurve = new THREE.CatmullRomCurve3(L, false, 'centripetal', 0.5);
    KEYS = P.length;
  }
  // centripetal splines don't pass keys at uniform parameters; map key index → curve parameter
  let keyU = [];
  function computeKeyParams() {
    const pts = posCurve.points; const lens = posCurve.getLengths(400); const total = lens[lens.length - 1];
    keyU = pts.map((p, i) => {
      if (i === 0) return 0; if (i === pts.length - 1) return 1;
      let best = 0; let bd = Infinity;
      for (let k = 0; k <= 400; k++) { const d = posCurve.getPoint(k / 400).distanceToSquared(p); if (d < bd) { bd = d; best = k / 400; } }
      return best;
    });
    return total;
  }
  function paramFor(journey) { // journey in [0, KEYS-1]
    const i = Math.min(KEYS - 2, Math.floor(journey)); const f = journey - i;
    const ease = f * f * (3 - 2 * f); // settle at each chapter, travel between them
    return keyU[i] + (keyU[i + 1] - keyU[i]) * ease;
  }

  const warmSources = []; const warmTarget = new THREE.Vector3();
  let aspect = 1;
  function layout() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.position.copy(CAM); camera.lookAt(LOOK);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const portrait = aspect < 0.8;
    const tablet = aspect >= 0.8 && aspect < 1.25;

    // moon — upper right in the hero, clear of the nav and the right-hand statement
    const mN = portrait ? [0.5, 0.44] : tablet ? [0.72, 0.5] : [0.52, 0.56];
    const mDist = 420;
    const mp = pointAtCam(mN[0], mN[1], mDist);
    const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * mDist;
    const mr = halfH * 2 * (portrait ? 0.075 * 0.62 : 0.068);
    moon.position.copy(mp); moon.scale.setScalar(mr);
    moonGlow.position.copy(mp); moonGlow.scale.setScalar(mr * 7);
    moonHalo.position.copy(mp).addScaledVector(mp.clone().sub(camera.position).normalize(), 5); moonHalo.scale.setScalar(mr * 12);
    moonDir.copy(mp).sub(camera.position).normalize();
    shafts.children.forEach((s) => { s.userData.anchor = mp.clone(); s.scale.set(s.userData.w, 120, 1); });

    // cabin — lower right in the hero, below the statement
    const cN = portrait ? [-0.8, -0.18] : tablet ? [0.62, -0.55] : [0.68, -0.6];
    const cp = groundAt(cN[0], cN[1]);
    cabin.position.copy(cp);
    cabin.rotation.y = portrait ? 0.55 : -0.5;
    cabin.scale.setScalar(THREE.MathUtils.clamp(cp.distanceTo(camera.position) / 46, 0.6, 1.8) * (portrait ? 0.9 : 1));

    // hero maple — trunk on the left edge; crown above the headline
    const tDist = portrait ? 19 : tablet ? 13 : 11;
    const base = pointAtCam(portrait ? -1.05 : -0.97, -0.2, tDist);
    base.y = 0;
    tree.position.copy(base);
    const targetY = pointAtCam(0, portrait ? 0.84 : 0.64, tDist).y;
    tree.scale.setScalar(THREE.MathUtils.clamp(targetY / heroTree.canopyLow, 0.8, 1.6));
    tree.updateMatrixWorld(true);
    heroTreeWorld.copy(tree.matrixWorld);

    cabin.updateMatrixWorld(true); house.updateMatrixWorld(true);
    warmSources.length = 0;
    warmSources.push({ p: hutLightLocal.clone().applyMatrix4(cabin.matrixWorld), power: 18 });
    lanternSpots.forEach((p) => warmSources.push({ p: p.clone().add(new THREE.Vector3(0, 1.6, 0)), power: 12 }));
    warmSources.push({ p: lanternLights[0].clone().applyMatrix4(house.matrixWorld), power: 40 });
    warmTarget.copy(warmSources[0].p); warmLight.position.copy(warmTarget);

    buildJourney(portrait);
    computeKeyParams();
    placeCamera(journeyNow, 0);
    [leavesTree, leavesAmbient, petals, nearLeaves].forEach((L) => L.st.forEach((o, i) => spawn(L, o, i, true)));
  }

  // ---------- frame
  const pointer = new THREE.Vector2(); const smooth = new THREE.Vector2();
  let journeyTarget = 0; let journeyNow = 0;
  let running = false; let raf = 0; let last = performance.now();
  const clock = new THREE.Clock();
  const frameTimes = [];
  let quality = 0; let particleScale = 1; let odd = false;
  const lookAt = new THREE.Vector3();

  function placeCamera(j, t) {
    const u = paramFor(Math.min(KEYS - 1, Math.max(0, j)));
    posCurve.getPoint(u, camera.position);
    lookCurve.getPoint(u, lookAt);
    // gentle life: slow drift + mouse parallax (weaker once inside the village)
    const inside = Math.min(1, j);
    const drift = Math.sin(t * 0.07) * 0.25;
    camera.position.x += smooth.x * (0.9 - inside * 0.4) + drift;
    camera.position.y += smooth.y * (0.45 - inside * 0.2);
    camera.lookAt(lookAt.x + smooth.x * 1.5, lookAt.y, lookAt.z);
    camera.updateMatrixWorld();
    camera.matrixWorld.extractBasis(camR, camU, camF); camF.negate();
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = clock.getElapsedTime();
    WIND.uTime.value = t;
    WIND.uWind.value = 0.85 + 0.35 * Math.sin(t * 0.21);

    smooth.lerp(pointer, 0.025);
    journeyNow += (journeyTarget - journeyNow) * (reduced ? 1 : Math.min(1, dt * 2.6)); // cinematic lag behind the scroll
    placeCamera(journeyNow, t);
    const u = journeyNow / (KEYS - 1);

    scene.fog.density = chapterValue(CHAPTER.fog, u);
    renderer.toneMappingExposure = chapterValue(CHAPTER.exposure, u);

    shafts.children.forEach((s) => {
      s.position.copy(s.userData.anchor).lerp(camera.position, 0.72);
      s.lookAt(camera.position); s.rotateZ(s.userData.tilt);
      s.material.opacity = (0.03 + 0.025 * (0.5 + 0.5 * Math.sin(t * 0.18 + s.userData.phase))) * (1 - Math.min(1, journeyNow) * 0.5);
    });
    mists.forEach((m) => {
      m.material.map.offset.x = (t * m.userData.speed) % 1;
      if (!m.userData.keep) m.material.opacity = m.userData.base * (1 - smooth01(0.4, 1.2, journeyNow));
    });

    // warm life: candle flicker everywhere, cabin smoke
    const flick = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 13.1 + 1.3) + 0.04 * Math.sin(t * 23.7);
    warm.emissiveIntensity = 2.6 * flick;
    glowSprites.forEach((g, i) => { g.material.opacity = g.userData.base * (0.9 + 0.1 * Math.sin(t * 6.1 + i * 1.7)) * flick; });
    smoke.forEach((s) => {
      s.userData.t = (s.userData.t + dt * 0.06) % 1;
      const k = s.userData.t;
      s.position.set(chimney.position.x + k * 2.2 + Math.sin(k * 6 + t * 0.4) * 0.3, chimney.position.y + 0.8 + k * 5, chimney.position.z);
      s.scale.setScalar(0.8 + k * 3.2);
      s.material.opacity = Math.sin(k * Math.PI) * 0.22;
    });
    // the roaming warm light settles on the nearest warm source ahead of the camera
    let best = null; let bd = Infinity; let power = 14;
    for (const src of warmSources) {
      toCam.copy(src.p).sub(camera.position);
      if (toCam.dot(camF) < 2) continue;
      const d = toCam.lengthSq();
      if (d < bd) { bd = d; best = src; }
    }
    if (journeyNow < 0.7) best = warmSources[0]; // the hero belongs to the cabin
    if (best) { warmTarget.copy(best.p); power = best.power; }
    warmLight.position.lerp(warmTarget, Math.min(1, dt * 2));
    warmLight.intensity += (power * flick - warmLight.intensity) * Math.min(1, dt * 3);

    // shadows follow the part of the world in view
    const focus = v3.copy(camera.position).addScaledVector(camF, 30); focus.y = 0;
    moonLight.target.position.copy(focus);
    moonLight.position.copy(focus).addScaledVector(moonDir, 150);

    if (!reduced) {
      stepLeaves(leavesTree, dt, t, chapterValue(CHAPTER.tree, u) * particleScale);
      stepLeaves(leavesAmbient, dt, t, chapterValue(CHAPTER.ambient, u) * particleScale);
      stepLeaves(petals, dt, t, chapterValue(CHAPTER.petals, u) * particleScale);
      stepLeaves(nearLeaves, dt, t, 1);
    }
    renderer.render(scene, camera);

    // adaptive quality: if the device struggles, step down (resolution → shadows → resolution + particles)
    frameTimes.push(dt);
    if (frameTimes.length >= 70) {
      const avg = frameTimes.slice(20).reduce((a2, b2) => a2 + b2, 0) / (frameTimes.length - 20);
      frameTimes.length = 0;
      if (avg > (low ? 0.045 : 0.024) && quality < 3) {
        quality++;
        if (quality === 1) { dpr = Math.max(0.7, dpr * 0.8); renderer.setPixelRatio(dpr); layout(); }
        if (quality === 2 && renderer.shadowMap.enabled) {
          renderer.shadowMap.enabled = false;
          scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });
        }
        if (quality === 3) { dpr = Math.max(0.6, dpr * 0.8); renderer.setPixelRatio(dpr); particleScale = 0.55; layout(); }
      }
    }
  }
  function loop() {
    if (!running) return;
    odd = !odd;
    if (!low || odd) frame(); // phones / weak devices: ~30 fps is plenty for a slow world
    raf = requestAnimationFrame(loop);
  }

  const onMove = (ev) => { pointer.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1); };
  const onResize = () => { layout(); if (!running) frame(); };

  layout();
  if (!reduced) for (let i = 0; i < 40; i++) stepLeaves(leavesTree, 0.05, i * 0.05, 1);
  frame();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onMove, { passive: true });

  return {
    chapters: () => KEYS,
    start() { if (running) return; if (reduced) { frame(); return; } running = true; last = performance.now(); loop(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    /** journey position in chapters: 0 = hero … chapters()-1 = the house */
    setJourney(j) { journeyTarget = j; if (reduced || !running) { journeyNow = j; frame(); } },
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
