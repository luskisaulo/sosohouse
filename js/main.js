import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CFG = window.GAME_CONFIG;
const $ = (id) => document.getElementById(id);
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('is-touch');

/* ============================================================
   RENDERER / SCENE / CAMERA
   ============================================================ */
const app = $('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const skyDay = new THREE.Color('#f6c98a');
const skyDusk = new THREE.Color('#3a2452');
scene.background = skyDay.clone();
scene.fog = new THREE.Fog(skyDay.getHex(), 30, 95);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(14, 13, 17);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 26;
controls.minPolarAngle = THREE.MathUtils.degToRad(38);
controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
controls.target.set(0, 1.2, 4);
controls.update();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   LIGHTING
   ============================================================ */
const hemi = new THREE.HemisphereLight('#fbe3b0', '#5a4a3a', 0.65);
scene.add(hemi);

const sun = new THREE.DirectionalLight('#ffb852', 1.15);
sun.position.set(-14, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -28; sun.shadow.camera.right = 28;
sun.shadow.camera.top = 28; sun.shadow.camera.bottom = -28;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0015;
scene.add(sun);

const fillLight = new THREE.DirectionalLight('#8fb6d6', 0.25);
fillLight.position.set(10, 10, -10);
scene.add(fillLight);

/* ============================================================
   PROCEDURAL TEXTURES
   ============================================================ */
function canvasTex(draw, w = 256, h = 256, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const woodTex = canvasTex((ctx, w, h) => {
  ctx.fillStyle = '#8a5a3c'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? '#7c4f34' : '#95643f';
    ctx.fillRect(0, i * (h / 9), w, h / 9 - 2);
  }
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
    ctx.fillRect(Math.random() * w, Math.random() * h, 20, 1);
  }
}, 256, 256, [6, 10]);

const deckTex = canvasTex((ctx, w, h) => {
  ctx.fillStyle = '#6b4530'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? '#5f3c29' : '#7a4f37';
    ctx.fillRect(0, i * (h / 7), w, h / 7 - 3);
  }
}, 256, 256, [8, 14]);

const azulejoTex = canvasTex((ctx, w, h) => {
  ctx.fillStyle = '#eef2ee'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1B4D6B'; ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.beginPath();
  ctx.moveTo(w / 2, 6); ctx.lineTo(w - 6, h / 2); ctx.lineTo(w / 2, h - 6); ctx.lineTo(6, h / 2); ctx.closePath();
  ctx.fillStyle = '#1B4D6B'; ctx.globalAlpha = 0.85; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#eef2ee';
  ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.14, 0, Math.PI * 2); ctx.fill();
}, 128, 128, [7, 11]);

const stoneTex = canvasTex((ctx, w, h) => {
  ctx.fillStyle = '#9a8f7c'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(${100 + Math.random() * 40},${90 + Math.random() * 40},${70 + Math.random() * 30},0.4)`;
    ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 8 + Math.random() * 14, 0, Math.PI * 2); ctx.fill();
  }
}, 200, 200, [5, 5]);

/* ============================================================
   MATERIALS (palette) - SUA CASA INTACTA
   ============================================================ */
const MAT = {
  ocre: new THREE.MeshStandardMaterial({ color: '#E2A83B', roughness: 0.85 }),
  turquesa: new THREE.MeshStandardMaterial({ color: '#1B4D6B', roughness: 0.6 }),
  terracota: new THREE.MeshStandardMaterial({ color: '#B85A3C', roughness: 0.8 }),
  esmeralda: new THREE.MeshStandardMaterial({ color: '#1E6B4F', roughness: 0.7 }),
  magenta: new THREE.MeshStandardMaterial({ color: '#D6488C', roughness: 0.6 }),
  dourado: new THREE.MeshStandardMaterial({ color: '#E8C468', roughness: 0.3, metalness: 0.6 }),
  branco: new THREE.MeshStandardMaterial({ color: '#f4ede0', roughness: 0.7 }),
  mostarda: new THREE.MeshStandardMaterial({ color: '#c98a2e', roughness: 0.9 }),
  ferro: new THREE.MeshStandardMaterial({ color: '#2b2f2c', roughness: 0.5, metalness: 0.4 }),
  vidro: new THREE.MeshPhysicalMaterial({ color: '#bfe3e8', roughness: 0.05, transmission: 0.85, thickness: 0.3, transparent: true, opacity: 0.55 }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 }),
  deck: new THREE.MeshStandardMaterial({ map: deckTex, roughness: 0.9 }),
  azulejo: new THREE.MeshStandardMaterial({ map: azulejoTex, roughness: 0.6 }),
  stone: new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#2e7d4f', roughness: 0.8 }),
  leafDark: new THREE.MeshStandardMaterial({ color: '#1f5a38', roughness: 0.8 }),
};

const world = new THREE.Group();
scene.add(world);
const colliders = [];
const interactables = [];

function addCollider(minX, maxX, minZ, maxZ) { colliders.push({ minX, maxX, minZ, maxZ }); }
function box(w, h, d, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true;
  world.add(m);
  return m;
}
function cyl(rt, rb, h, mat, x, y, z, radial = 12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, radial), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  world.add(m);
  return m;
}
function sph(r, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  world.add(m);
  return m;
}

const ZONE = {
  patio: { z0: 8.5, z1: 19, x0: -6.5, x1: 6.5 },
  sala: { z0: -1, z1: 8.5, x0: -6.5, x1: 6.5 },
  corredor: { z0: -10, z1: -1, x0: -2.5, x1: 2.5 },
  cozinha: { z0: -10, z1: -6.5, x0: 2.5, x1: 5.8 },
  varanda: { z0: -23.5, z1: -10, x0: -7.2, x1: 7.2 },
};

function floorSlab(zone, mat, y = 0) {
  const w = zone.x1 - zone.x0, d = zone.z1 - zone.z0;
  const m = box(w, 0.3, d, mat, (zone.x0 + zone.x1) / 2, y - 0.15, (zone.z0 + zone.z1) / 2);
  m.receiveShadow = true;
  return m;
}
function sideWalls(zone, mat, h = 2.6) {
  const d = zone.z1 - zone.z0;
  box(0.3, h, d, mat, zone.x0, h / 2, (zone.z0 + zone.z1) / 2);
  box(0.3, h, d, mat, zone.x1, h / 2, (zone.z0 + zone.z1) / 2);
  addCollider(zone.x0 - 0.4, zone.x0 + 0.1, zone.z0, zone.z1);
  addCollider(zone.x1 - 0.1, zone.x1 + 0.4, zone.z0, zone.z1);
}

/* ---------- PATIO (jardim de entrada) - INTACTO ---------- */
floorSlab(ZONE.patio, MAT.azulejo);
sideWalls(ZONE.patio, MAT.ocre, 2.8);
box(ZONE.patio.x1 - ZONE.patio.x0, 2.8, 0.3, MAT.ocre, 0, 1.4, ZONE.patio.z1);
addCollider(ZONE.patio.x0, ZONE.patio.x1, ZONE.patio.z1 - 0.2, ZONE.patio.z1 + 0.4);
for (let i = -5; i <= 5; i += 1.1) box(0.08, 2.1, 0.08, MAT.ferro, i, 1.3, ZONE.patio.z1 - 0.05);
box(2.6, 0.15, 0.15, MAT.ferro, 0, 2.3, ZONE.patio.z1 - 0.05);
cyl(1.5, 1.6, 0.5, MAT.stone, 0, 0.25, 14);
cyl(1.2, 1.2, 0.15, new THREE.MeshStandardMaterial({ color: '#3a7ea8', roughness: 0.15, metalness: 0.2 }), 0, 0.5, 14);
cyl(0.18, 0.22, 1.0, MAT.stone, 0, 0.85, 14);
sph(0.35, MAT.stone, 0, 1.5, 14);
function pottedPlant(x, z, scale = 1) {
  cyl(0.32 * scale, 0.26 * scale, 0.5 * scale, MAT.terracota, x, 0.25 * scale, z);
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.14 * scale, 0.9 * scale, 5), i % 2 ? MAT.leaf : MAT.leafDark);
    leaf.position.set((Math.random() - 0.5) * 0.3 * scale, 0.75 * scale, (Math.random() - 0.5) * 0.3 * scale);
    leaf.rotation.z = (Math.random() - 0.5) * 0.6;
    leaf.castShadow = true;
    g.add(leaf);
  }
  g.position.set(x, 0.4 * scale, z);
  world.add(g);
}
[[-5, 10], [5, 10], [-5, 17], [5, 17], [-3, 18.3], [3, 18.3]].forEach(([x, z]) => pottedPlant(x, z, 1 + Math.random() * 0.4));
for (let z = 9; z < 19; z += 1.6) {
  [ZONE.patio.x0, ZONE.patio.x1].forEach((x) => {
    sph(0.28 + Math.random() * 0.2, MAT.magenta, x + (x < 0 ? 0.3 : -0.3), 1.6 + Math.random() * 1.2, z);
  });
}

/* ---------- SALA DE ESTAR / ATELIÊ - INTACTO ---------- */
floorSlab(ZONE.sala, MAT.wood);
sideWalls(ZONE.sala, MAT.branco, 2.7);
for (let z = 0; z < 8; z += 3) {
  box(0.15, 2.1, 1.3, MAT.turquesa, ZONE.sala.x0 + 0.12, 1.3, z + 1);
  box(0.15, 2.1, 1.3, MAT.turquesa, ZONE.sala.x1 - 0.12, 1.3, z + 1);
}
box(2.6, 0.55, 1.0, MAT.mostarda, -3.6, 0.35, 6.5);
box(2.6, 0.6, 0.22, MAT.mostarda, -3.6, 0.75, 6.98);
box(0.22, 0.6, 1.0, MAT.mostarda, -4.85, 0.65, 6.5);
box(0.22, 0.6, 1.0, MAT.mostarda, -2.35, 0.65, 6.5);
[-4.1, -3.6, -3.1].forEach((x) => sph(0.24, MAT.terracota, x, 0.68, 6.35));
box(3.4, 0.03, 2.2, new THREE.MeshStandardMaterial({ color: '#a8433a', roughness: 0.9 }), -2, 0.02, 4.6);
box(1.8, 2.2, 0.4, MAT.wood, 5.4, 1.1, 6.8);
for (let i = 0; i < 4; i++) box(1.6, 0.06, 0.36, MAT.terracota, 5.4, 0.35 + i * 0.55, 6.8);
for (let i = 0; i < 10; i++) box(0.14, 0.4, 0.28, i % 3 === 0 ? MAT.turquesa : (i % 3 === 1 ? MAT.magenta : MAT.esmeralda), 4.75 + i * 0.15, 1.85, 6.78);
function easelLeg(x, z, rz) { const l = box(0.07, 1.5, 0.07, MAT.wood, x, 0.75, z); l.rotation.z = rz; return l; }
easelLeg(0, 0, 0.18); easelLeg(-0.55, 0.35, -0.22); easelLeg(0.55, 0.35, -0.22);
const canvasTexture = canvasTex((ctx, w, h) => {
  ctx.fillStyle = '#f4ede0'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#D6488C'; ctx.lineWidth = 6; ctx.beginPath();
  ctx.moveTo(20, h - 30); ctx.quadraticCurveTo(w / 2, 20, w - 20, h - 40); ctx.stroke();
  ctx.fillStyle = '#E2A83B'; ctx.beginPath(); ctx.arc(w * 0.7, h * 0.3, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1E6B4F'; ctx.fillRect(20, h - 26, w - 40, 10);
}, 128, 160);
const paintingMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.15), new THREE.MeshStandardMaterial({ map: canvasTexture }));
paintingMesh.position.set(0, 1.35, 0.02);
world.add(paintingMesh);

/* ---------- CORREDOR DAS MEMÓRIAS - INTACTO ---------- */
const ZONE_HALL_WIDE = { x0: ZONE.sala.x0, x1: ZONE.sala.x1, z0: ZONE.corredor.z0, z1: ZONE.corredor.z1 };
floorSlab(ZONE_HALL_WIDE, MAT.wood);
sideWalls(ZONE_HALL_WIDE, MAT.ocre, 2.6);
for (let z = -9; z <= -2; z += 3.5) {
  box(0.3, 2.5, 0.3, MAT.dourado, ZONE.corredor.x0, 1.25, z);
  box(0.3, 2.5, 0.3, MAT.dourado, ZONE.corredor.x1, 1.25, z);
}
for (let z = -9; z < -1; z += 2.5) {
  [ZONE.sala.x0, ZONE.sala.x1].forEach((x) => {
    const s = sph(0.1, new THREE.MeshStandardMaterial({ color: '#ffdca0', emissive: '#ffb852', emissiveIntensity: 1.4 }), x + (x < 0 ? 0.3 : -0.3), 2.1, z);
    const pl = new THREE.PointLight('#ffb852', 4, 5);
    pl.position.copy(s.position);
    world.add(pl);
  });
}

/* ---------- COZINHA - INTACTO ---------- */
box(2.6, 0.9, 0.7, MAT.wood, 4.1, 0.45, -8.2);
cyl(0.08, 0.08, 0.3, new THREE.MeshStandardMaterial({ color: '#3a2818' }), 3.6, 1.05, -8.2);
pottedPlant(5.3, -7, 0.7);

/* ---------- VARANDA - INTACTO ---------- */
floorSlab(ZONE.varanda, MAT.deck);
sideWalls(ZONE.varanda, MAT.ocre, 2.4);
const railGroup = new THREE.Group();
for (let x = ZONE.varanda.x0; x <= ZONE.varanda.x1; x += 0.55) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6), MAT.branco);
  bar.position.set(x, 0.55, ZONE.varanda.z0 + 0.15);
  railGroup.add(bar);
}
const railTop = new THREE.Mesh(new THREE.BoxGeometry(ZONE.varanda.x1 - ZONE.varanda.x0, 0.08, 0.1), MAT.branco);
railTop.position.set(0, 1.05, ZONE.varanda.z0 + 0.15);
railGroup.add(railTop);
railGroup.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
world.add(railGroup);
addCollider(ZONE.varanda.x0, ZONE.varanda.x1, ZONE.varanda.z0 - 0.3, ZONE.varanda.z0 + 0.1);
[[-6.6, -11.2], [6.6, -11.2], [-6.6, -21.8], [6.6, -21.8]].forEach(([x, z]) => cyl(0.12, 0.14, 2.6, MAT.wood, x, 1.3, z));
function stringLights(x0, z0, x1, z1, sag = 0.55, count = 9) {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = THREE.MathUtils.lerp(x0, x1, t), z = THREE.MathUtils.lerp(z0, z1, t);
    const y = 2.55 - Math.sin(t * Math.PI) * sag;
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 20, 0.012, 5, false);
  const wire = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#2a2018' }));
  world.add(wire);
  const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffb852', emissiveIntensity: 1.8 });
  for (let i = 1; i < count; i++) {
    const p = curve.getPoint(i / count);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), bulbMat);
    b.position.copy(p).y -= 0.05;
    world.add(b);
    if (i % 3 === 0) {
      const pl = new THREE.PointLight('#ffb852', 1.6, 4);
      pl.position.copy(b.position);
      world.add(pl);
    }
  }
}
stringLights(-6.6, -11.2, 6.6, -11.2, 0.35, 10);
stringLights(-6.6, -21.8, 6.6, -21.8, 0.35, 10);
stringLights(-6.6, -11.2, -6.6, -21.8, 0.9, 6);
stringLights(6.6, -11.2, 6.6, -21.8, 0.9, 6);
cyl(0.35, 0.35, 0.05, MAT.ferro, 0, 0.78, -19);
cyl(0.05, 0.05, 0.75, MAT.ferro, 0, 0.4, -19);
[[-0.7, -18.5], [0.7, -19.5]].forEach(([x, z]) => { cyl(0.22, 0.22, 0.05, MAT.ferro, x, 0.45, z); cyl(0.04, 0.04, 0.45, MAT.ferro, x, 0.22, z); });
[[-0.15, -19.1], [0.18, -18.85]].forEach(([x, z]) => {
  cyl(0.04, 0.04, 0.18, MAT.branco, x, 0.87, z);
  sph(0.03, new THREE.MeshStandardMaterial({ color: '#ffdca0', emissive: '#ffaa33', emissiveIntensity: 2 }), x, 0.98, z);
});
box(ZONE.sala.x1 - ZONE.sala.x0 - 3, 0.06, 0.5, MAT.dourado, 0, 0.02, ZONE.sala.z0 + 0.1);

/* ============================================================
   NOVO: CENÁRIO CARIOCA EXTRA (SEM APAGAR NADA) - PÃO DE AÇÚCAR, BONDINHO, RUA, SOL
   ============================================================ */
const rioGroup = new THREE.Group();
world.add(rioGroup);

// Chão gigante verde (mata atlântica)
const bigGround = new THREE.Mesh(new THREE.PlaneGeometry(400,400), new THREE.MeshStandardMaterial({color:'#1d4a2e', roughness:1}));
bigGround.rotation.x=-Math.PI/2; bigGround.position.y=-0.35; bigGround.receiveShadow=true;
rioGroup.add(bigGround);

// Rua de Santa Teresa descendo com trilhos
const streetMat = new THREE.MeshStandardMaterial({color:'#5a5a5a', roughness:0.9});
const street = new THREE.Mesh(new THREE.PlaneGeometry(9, 120), streetMat);
street.rotation.x=-Math.PI/2; street.position.set(0,-0.3,-45); rioGroup.add(street);
const railMat = new THREE.MeshStandardMaterial({color:'#2a2a2a', metalness:0.6, roughness:0.4});
for(let side of [-1.3,1.3]){
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,120), railMat);
  rail.position.set(side,-0.25,-45); rioGroup.add(rail);
}

// Pão de Açúcar - MELHORADO (2 morros icônicos)
const paoMat = new THREE.MeshStandardMaterial({color:'#3a4a5a', roughness:0.85});
const paoBase = new THREE.Mesh(new THREE.CylinderGeometry(3,4.5,4.5,12), paoMat);
paoBase.position.set(18, 2, -52); rioGroup.add(paoBase);
const paoTop = new THREE.Mesh(new THREE.SphereGeometry(3.2, 18, 14, 0, Math.PI*2, 0, Math.PI*0.58), paoMat);
paoTop.position.set(18, 5.2, -52); paoTop.scale.set(1,1.35,1); rioGroup.add(paoTop);
const urca = new THREE.Mesh(new THREE.ConeGeometry(2.8,4.2,10), paoMat);
urca.position.set(12.5, 1.8, -49); rioGroup.add(urca);

// Corcovado + Cristo
const greenHillMat = new THREE.MeshStandardMaterial({color:'#1e5a3a', roughness:0.9});
const corcovado = new THREE.Mesh(new THREE.ConeGeometry(7,9,8), greenHillMat);
corcovado.position.set(-20, 3, -68); rioGroup.add(corcovado);
const cristoBase = new THREE.Mesh(new THREE.BoxGeometry(0.35,1.3,0.35), new THREE.MeshStandardMaterial({color:'#e8e0d0'}));
cristoBase.position.set(-20, 9.8, -68); rioGroup.add(cristoBase);
const cristoBraco = new THREE.Mesh(new THREE.BoxGeometry(1.7,0.22,0.22), new THREE.MeshStandardMaterial({color:'#e8e0d0'}));
cristoBraco.position.set(-20, 10.5, -68); rioGroup.add(cristoBraco);

// Mar da Baía
const waterMat = new THREE.MeshStandardMaterial({color:'#1a5a7a', roughness:0.1, metalness:0.15, transparent:true, opacity:0.8});
const water = new THREE.Mesh(new THREE.PlaneGeometry(200,80), waterMat);
water.rotation.x=-Math.PI/2; water.position.set(5,-0.45,-75); rioGroup.add(water);

// Bondinho - cabo + 2 cabines animadas
const cableMat = new THREE.MeshStandardMaterial({color:'#1a1a1a'});
const cableCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,12,-23), new THREE.Vector3(7,19,-36), new THREE.Vector3(12,17,-49), new THREE.Vector3(18,9,-52)
]);
const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 0.025, 4, false);
const cable = new THREE.Mesh(cableGeo, cableMat); rioGroup.add(cable);
const bondinhoGeo = new THREE.BoxGeometry(0.7,0.55,0.9);
const bondinho1 = new THREE.Mesh(bondinhoGeo, new THREE.MeshStandardMaterial({color:'#ffcc00'})); bondinho1.name='bondinho1'; rioGroup.add(bondinho1);
const bondinho2 = new THREE.Mesh(bondinhoGeo, new THREE.MeshStandardMaterial({color:'#e63946'})); bondinho2.name='bondinho2'; rioGroup.add(bondinho2);
rioGroup.userData.cableCurve=cableCurve; rioGroup.userData.bondinho1=bondinho1; rioGroup.userData.bondinho2=bondinho2;

// Casinhas coloridas de Santa Teresa ao redor
const houseColors = ['#E2A83B','#D6488C','#1B4D6B','#B85A3C','#1E6B4F','#f4ede0'];
for(let i=0;i<18;i++){
  const col = houseColors[Math.floor(Math.random()*houseColors.length)];
  const mat = new THREE.MeshStandardMaterial({color:col, roughness:0.8});
  const w=1.5+Math.random()*1.5, h=1.2+Math.random()*1.2, d=1.2+Math.random();
  const ang=Math.random()*Math.PI*2, rad=14+Math.random()*16;
  const x=Math.cos(ang)*rad, z=Math.sin(ang)*rad -8;
  if (Math.abs(x)<8 && z>-12 && z<20) continue;
  const house=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  house.position.set(x,h/2-0.3,z); house.castShadow=true; rioGroup.add(house);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(w*0.7,0.6,4), new THREE.MeshStandardMaterial({color:'#8a4a3a'}));
  roof.position.set(x,h-0.05,z); roof.rotation.y=Math.PI/4; rioGroup.add(roof);
}

// Palmeiras
function palm(x,z,s=1){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08*s,0.12*s,2.5*s,8), new THREE.MeshStandardMaterial({color:'#5a3a2a'}));
  trunk.position.set(x,1.25*s-0.3,z); rioGroup.add(trunk);
  for(let i=0;i<5;i++){
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(0.15*s,1.2*s,4), new THREE.MeshStandardMaterial({color:'#2e7d4f'}));
    leaf.position.set(x,2.6*s-0.3,z); leaf.rotation.z=(i/5)*Math.PI*2; leaf.rotation.x=0.8; rioGroup.add(leaf);
  }
}
for(let i=0;i<12;i++){
  const ang=Math.random()*Math.PI*2, rad=10+Math.random()*20;
  palm(Math.cos(ang)*rad, Math.sin(ang)*rad-6, 0.8+Math.random()*0.5);
}

// Sol 3D
const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(2.2,16,12), new THREE.MeshBasicMaterial({color:'#ffaa33'}));
sunMesh.position.set(-22,24,-45); rioGroup.add(sunMesh);

// Luzes da cidade + estrelas (já existiam, mas reforçamos)
const cityLightsGeo = new THREE.BufferGeometry();
const cityPos = [];
for (let i = 0; i < 220; i++) cityPos.push((Math.random() - 0.5) * 60, Math.random() * 3, -40 - Math.random() * 20);
cityLightsGeo.setAttribute('position', new THREE.Float32BufferAttribute(cityPos, 3));
const cityLights = new THREE.Points(cityLightsGeo, new THREE.PointsMaterial({ color: '#ffdca0', size: 0.12, transparent: true, opacity: 0.85 }));
world.add(cityLights);
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 250; i++) starPos.push((Math.random() - 0.5) * 90, 12 + Math.random() * 30, -30 - Math.random() * 40);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.15, transparent: true, opacity: 0 });
const stars = new THREE.Points(starGeo, starMat);
world.add(stars);

// Silhueta antiga mantida (compatibilidade)
const silhMat = new THREE.MeshBasicMaterial({ color: '#241a3a', fog: true });
const paoDeAcucar = new THREE.Mesh(new THREE.SphereGeometry(4.2, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), silhMat);
paoDeAcucar.scale.set(1, 1.5, 1);
paoDeAcucar.position.set(14, 2.2, -46);
world.add(paoDeAcucar);

/* ============================================================
   BONECO MINECRAFT - SKIN TROCÁVEL - VOCÊ FAZ A SKIN
   ============================================================ */

// Cria textura de skin tipo Minecraft 64x64 - VOCÊ PODE TROCAR POR PNG DEPOIS
// Layout simples: cabeça 8x8, torso 8x12, braços 4x12, pernas 4x12
function createMinecraftSkin(type){
  const size=64;
  const c=document.createElement('canvas'); c.width=size; c.height=size;
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,size,size);
  
  if(type==='sofia_tropical'){
    // Face pele #f5c9a3
    ctx.fillStyle='#f5c9a3'; ctx.fillRect(8,8,8,8);
    // Cabelo castanho topo #8a4a2a + pontas loiras #e8c86a ombré
    ctx.fillStyle='#8a4a2a'; ctx.fillRect(8,0,8,8); ctx.fillRect(0,0,8,8); ctx.fillRect(16,0,8,8);
    ctx.fillStyle='#e8c86a'; ctx.fillRect(0,8,8,8); ctx.fillRect(16,8,8,8);
    // Torso top rosa #ff7eb0
    ctx.fillStyle='#ff7eb0'; ctx.fillRect(20,20,8,12);
    // Shorts jeans #6fa8dc
    ctx.fillStyle='#6fa8dc'; ctx.fillRect(20,32,8,4); ctx.fillRect(4,32,4,4); ctx.fillRect(12,32,4,4);
    // Braços e pernas pele
    ctx.fillStyle='#f5c9a3'; ctx.fillRect(44,20,4,12); ctx.fillRect(36,20,4,12); ctx.fillRect(4,20,4,12); ctx.fillRect(12,20,4,12);
  } else if(type==='sofia_princess'){
    ctx.fillStyle='#f5c9a3'; ctx.fillRect(8,8,8,8);
    ctx.fillStyle='#8a4a2a'; ctx.fillRect(8,0,8,8); ctx.fillRect(0,0,8,8); ctx.fillRect(16,0,8,8);
    ctx.fillStyle='#e8c86a'; ctx.fillRect(0,8,8,8); ctx.fillRect(16,8,8,8);
    ctx.fillStyle='#ffd700'; ctx.fillRect(8,0,8,2); // tiara
    // Vestido branco #fffaf0 + dourado #E8C468
    ctx.fillStyle='#fffaf0'; ctx.fillRect(20,20,8,20);
    ctx.fillStyle='#E8C468'; ctx.fillRect(20,36,8,2);
    ctx.fillStyle='#f5c9a3'; ctx.fillRect(44,20,4,6); ctx.fillRect(36,20,4,6);
  } else if(type==='lucas'){
    ctx.fillStyle='#c98a5e'; ctx.fillRect(8,8,8,8);
    ctx.fillStyle='#3a2818'; ctx.fillRect(8,0,8,8);
    ctx.fillStyle='#f4f0e6'; ctx.fillRect(20,20,8,12);
    ctx.fillStyle='#2b3550'; ctx.fillRect(4,20,12,12);
    ctx.fillStyle='#c98a5e'; ctx.fillRect(44,20,4,12); ctx.fillRect(36,20,4,12);
  }
  const tex=new THREE.CanvasTexture(c);
  tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter;
  tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

// Cria boneco estilo Minecraft com 6 cubos - SKIN TROCÁVEL
function createMinecraftCharacter(skinTex){
  const group=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({map:skinTex});
  mat.map.magFilter=THREE.NearestFilter;
  
  const headGeo=new THREE.BoxGeometry(0.4,0.4,0.4);
  const head=new THREE.Mesh(headGeo, mat); head.position.y=1.5; head.castShadow=true; group.add(head); group.userData.head=head;
  
  const bodyGeo=new THREE.BoxGeometry(0.4,0.6,0.2);
  const body=new THREE.Mesh(bodyGeo, mat); body.position.y=1.0; body.castShadow=true; group.add(body); group.userData.body=body;
  
  const armGeo=new THREE.BoxGeometry(0.13,0.6,0.13);
  const leftArm=new THREE.Mesh(armGeo, mat); leftArm.position.set(-0.27,1.0,0); leftArm.castShadow=true; group.add(leftArm);
  const rightArm=new THREE.Mesh(armGeo, mat); rightArm.position.set(0.27,1.0,0); rightArm.castShadow=true; group.add(rightArm);
  group.userData.leftArm=leftArm; group.userData.rightArm=rightArm;
  
  const legGeo=new THREE.BoxGeometry(0.15,0.6,0.15);
  const leftLeg=new THREE.Mesh(legGeo, mat); leftLeg.position.set(-0.1,0.4,0); leftLeg.castShadow=true; group.add(leftLeg);
  const rightLeg=new THREE.Mesh(legGeo, mat); rightLeg.position.set(0.1,0.4,0); rightLeg.castShadow=true; group.add(rightLeg);
  group.userData.leftLeg=leftLeg; group.userData.rightLeg=rightLeg;
  
  return group;
}

// SKINS - TROCA AQUI - igual Minecraft, só mudar PNG depois
// Pra usar PNG externo depois: const loader=new THREE.TextureLoader(); const tex=loader.load('assets/skins/sofia_tropical.png');
const skinSofiaTropical = createMinecraftSkin('sofia_tropical');
const skinSofiaPrincess = createMinecraftSkin('sofia_princess');
const skinLucas = createMinecraftSkin('lucas');

const sofiaTropical = createMinecraftCharacter(skinSofiaTropical);
const sofiaPrincess = createMinecraftCharacter(skinSofiaPrincess);
sofiaPrincess.visible=false;

const playerMesh = new THREE.Group();
playerMesh.add(sofiaTropical);
playerMesh.add(sofiaPrincess);
playerMesh.position.set(0,0,4);
world.add(playerMesh);

const blobShadow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.32 }));
blobShadow.rotation.x = -Math.PI/2;
blobShadow.position.set(0,0.02,4);
world.add(blobShadow);

/* ============================================================
   SUPER PODER - EFEITO DE FLORES / PÉTALAS
   ============================================================ */
const flowerPowerGroup = new THREE.Group();
world.add(flowerPowerGroup);

function spawnFlowerPower(origin, direction){
  // Cria 25 pétalas voando
  for(let i=0;i<25;i++){
    const petalMat = new THREE.MeshStandardMaterial({color: i%3===0 ? '#ff7eb0' : (i%3===1 ? '#E8C468' : '#2e7d4f'), side:THREE.DoubleSide});
    const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.08), petalMat);
    petal.position.copy(origin).add(new THREE.Vector3((Math.random()-0.5)*0.5, Math.random()*0.5, (Math.random()-0.5)*0.5));
    petal.lookAt(origin.clone().add(direction));
    petal.userData.vel = direction.clone().multiplyScalar(2.5 + Math.random()*2.5).add(new THREE.Vector3((Math.random()-0.5)*1.5, Math.random()*1.5, (Math.random()-0.5)*1.5));
    petal.userData.life = 1.0;
    petal.userData.spin = (Math.random()-0.5)*10;
    flowerPowerGroup.add(petal);
  }
  // Luz rápida
  const flash = new THREE.PointLight('#ff7eb0', 8, 6);
  flash.position.copy(origin);
  world.add(flash);
  setTimeout(()=>{ world.remove(flash); }, 300);
}

function updateFlowerPower(dt){
  for(let i=flowerPowerGroup.children.length-1;i>=0;i--){
    const p=flowerPowerGroup.children[i];
    p.position.add(p.userData.vel.clone().multiplyScalar(dt));
    p.userData.vel.y -= 1.5*dt; // gravidade
    p.rotation.z += p.userData.spin*dt;
    p.userData.life -= dt*0.9;
    p.material.opacity = p.userData.life;
    p.material.transparent=true;
    if(p.userData.life<=0) flowerPowerGroup.remove(p);
  }
}



const player = {
  pos: new THREE.Vector3(0,0,4),
  costume: 'tropical',
  animTimer: 0,
  moving: false,
  locked: false,
  speed: 3.2,
  currentMesh: sofiaTropical,
  moveDir: new THREE.Vector3()
};

function setPlayerAction(kind, duration){
  const mesh=player.currentMesh; if(!mesh) return;
  player.locked=true;
  if(kind==='attack'){ if(mesh.userData.leftArm) mesh.userData.leftArm.rotation.x=-1.2; if(mesh.userData.rightArm) mesh.userData.rightArm.rotation.x=-1.2; const origin = playerMesh.position.clone().add(new THREE.Vector3(0,1.2,0)); const dir = player.moveDir.length()>0.1 ? player.moveDir.clone() : new THREE.Vector3(0,0,-1); spawnFlowerPower(origin, dir); }
  else if(kind==='shock'){ playerMesh.scale.y=0.7; playerMesh.position.y=-0.15; }
  else if(kind==='celebrate'){ playerMesh.position.y=0.4; if(mesh.userData.leftArm) mesh.userData.leftArm.rotation.z=-2.0; if(mesh.userData.rightArm) mesh.userData.rightArm.rotation.z=2.0; }
  clearTimeout(setPlayerAction._t);
  setPlayerAction._t=setTimeout(()=>{ player.locked=false; playerMesh.position.y=0; playerMesh.scale.y=1; if(mesh.userData.leftArm){mesh.userData.leftArm.rotation.x=0; mesh.userData.leftArm.rotation.z=0;} if(mesh.userData.rightArm){mesh.userData.rightArm.rotation.x=0; mesh.userData.rightArm.rotation.z=0;} },duration);
}

/* ============================================================
   NPC "ELE" - SEU BONECO 3D MINECRAFT TAMBÉM COM SKIN
   ============================================================ */
/* ============================================================
   NPC "ELE" - SEU BONECO 3D (MANTIDO E MELHORADO)
   ============================================================ */
const eleGroup = new THREE.Group();
const skinMat = new THREE.MeshStandardMaterial({ color: '#c98a5e', roughness: 0.7 });
const shirtMat = new THREE.MeshStandardMaterial({ color: '#f4f0e6', roughness: 0.7 });
const pantsMat = new THREE.MeshStandardMaterial({ color: '#2b3550', roughness: 0.7 });
const hairMatEle = new THREE.MeshStandardMaterial({ color: '#3a2818', roughness: 0.6 });
function localMesh(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  eleGroup.add(m);
  return m;
}
localMesh(new THREE.CylinderGeometry(0.16, 0.19, 0.75, 10), pantsMat, 0, 0.375, 0);
localMesh(new THREE.CylinderGeometry(0.22, 0.26, 0.8, 10), shirtMat, 0, 1.05, 0);
localMesh(new THREE.SphereGeometry(0.22, 16, 12), skinMat, 0, 1.58, 0);
localMesh(new THREE.SphereGeometry(0.23, 16, 12), hairMatEle, 0, 1.66, -0.03);
localMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8), shirtMat, -0.28, 1.05, 0).rotation.z = 0.25;
localMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8), shirtMat, 0.28, 1.05, 0).rotation.z = -0.25;
eleGroup.position.set(1.1, 0, -21.2);
eleGroup.rotation.y = Math.PI * 0.15;
world.add(eleGroup);
const eleBoxShadow = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25 }));
eleBoxShadow.rotation.x = -Math.PI / 2;
eleBoxShadow.position.set(eleGroup.position.x, 0.02, eleGroup.position.z);
world.add(eleBoxShadow);

/* ============================================================
   INTERACTABLE OBJECTS - INTACTO
   ============================================================ */
function floatBob(mesh, speed = 2, amp = 0.12) {
  mesh.userData._bobBase = mesh.position.y;
  mesh.userData._bobSpeed = speed;
  mesh.userData._bobAmp = amp;
  bobbers.push(mesh);
}
const bobbers = [];
const vitrolaGroup = new THREE.Group();
const vBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.6), MAT.wood);
const vDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 24), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.3 }));
vDisc.position.set(0, 0.2, 0);
const vHorn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 12, 1, true), MAT.dourado);
vHorn.rotation.x = Math.PI * 0.65; vHorn.position.set(0.3, 0.35, 0);
vitrolaGroup.add(vBase, vDisc, vHorn);
vitrolaGroup.position.set(5.3, 0.53, 3.4);
vitrolaGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
world.add(vitrolaGroup);
box(1.0, 0.5, 0.65, MAT.wood, 5.3, 0.25, 3.4);
interactables.push({
  pos: new THREE.Vector3(5.3, 0, 3.4), radius: 1.6, id: 'vitrola',
  label: 'Tocar a vitrola', repeatable: true,
  onInteract: () => { toggleAmbientMusic(); toast(audioState.playing ? '🎵 Uma melodia familiar enche a sala de calor...' : 'A música parou.'); },
});
interactables.push({
  pos: new THREE.Vector3(0, 0, 0), radius: 1.6, id: 'quadro',
  label: 'Ver a pintura', repeatable: true,
  onInteract: () => showLines([{ falante: 'narrador', texto: 'Um projeto em andamento. Parece que alguém dedicou muitas noites nisso...' }]),
});
box(1.2, 0.4, 0.7, MAT.wood, -1.6, 0.2, 3.2);
const key1Mesh = new THREE.Group();
const key1Ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), MAT.dourado);
const key1Stem = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.05), MAT.dourado);
key1Stem.position.y = -0.15;
key1Mesh.add(key1Ring, key1Stem);
key1Mesh.rotation.z = Math.PI / 2;
key1Mesh.position.set(-1.6, 0.55, 3.2);
world.add(key1Mesh);
floatBob(key1Mesh, 1.6, 0.06);
interactables.push({
  pos: new THREE.Vector3(-1.6, 0, 3.2), radius: 1.3, id: 'key1', label: 'Pegar a chave de latão',
  onInteract: () => {
    collectKey(0);
    key1Mesh.visible = false;
    showNote(CFG.bilheteChave1);
    setObjective('Vá até o corredor e use seu poder para afastar os cipós.');
  },
});

const vineGroup = new THREE.Group();
for (let i = 0; i < 26; i++) {
  const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), i % 2 ? MAT.leaf : MAT.leafDark);
  seg.position.set((Math.random() - 0.5) * 12.4, 0.7 + Math.random() * 1.6, -5.5 + (Math.random() - 0.5) * 0.4);
  seg.rotation.z = (Math.random() - 0.5) * 1.4;
  seg.rotation.y = Math.random() * Math.PI;
  vineGroup.add(seg);
}
for (let i = 0; i < 34; i++) {
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 5), MAT.leaf);
  leaf.position.set((Math.random() - 0.5) * 12.6, 0.5 + Math.random() * 1.8, -5.5 + (Math.random() - 0.5) * 0.5);
  leaf.rotation.z = Math.random() * Math.PI;
  vineGroup.add(leaf);
}
vineGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
world.add(vineGroup);
addCollider(ZONE.sala.x0, ZONE.sala.x1, -5.75, -5.25);
interactables.push({
  pos: new THREE.Vector3(0, 0, -5.5), radius: 4.2, id: 'vinha', label: 'Usar o poder das flores',
  onInteract: () => {
    if (state.vineCleared) return;
    setPlayerAction('attack', 650);
    toast('🌸 Pétalas e folhas afastam o caminho!');
    setTimeout(() => {
      vineGroup.children.forEach((c) => { c.visible = false; });
      state.vineCleared = true;
      colliders.splice(colliders.findIndex((c) => c.minZ === -5.75), 1);
      setObjective('Explore o corredor e reúna a chave em forma de coração.');
    }, 500);
  },
});

const frameTex = [0, 1, 2].map((i) => canvasTex((ctx, w, h) => {
  const cols = ['#D6488C', '#1E6B4F', '#1B4D6B'];
  ctx.fillStyle = '#f4ede0'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, w * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#E8C468';
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, w * 0.09, 0, Math.PI * 2); ctx.fill();
}, 100, 130));
const memoryTriggers = [];
const hallLeftWall = ZONE.sala.x0 + 0.17, hallRightWall = ZONE.sala.x1 - 0.17;
[[hallLeftWall, -2.5, Math.PI / 2], [hallRightWall, -4.7, -Math.PI / 2], [hallLeftWall, -7.2, Math.PI / 2]].forEach(([x, z, ry], i) => {
  const frameBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.08), MAT.dourado);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.88), new THREE.MeshStandardMaterial({ map: frameTex[i], emissive: '#000000' }));
  art.position.z = 0.05;
  const g = new THREE.Group(); g.add(frameBox, art);
  g.position.set(x, 1.55, z);
  g.rotation.y = ry;
  world.add(g);
  memoryTriggers.push({ pos: new THREE.Vector3(x > 0 ? x - 2 : x + 2, 0, z), radius: 2.4, seen: false, art, text: CFG.memorias[i] });
});

const key2Mesh = new THREE.Group();
const key2Head = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 10, 16, Math.PI * 1.4), MAT.dourado);
const key2Stem = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.05), MAT.dourado);
key2Stem.position.y = -0.15;
key2Mesh.add(key2Head, key2Stem);
key2Mesh.position.set(0, 0.9, -9.2);
world.add(key2Mesh);
floatBob(key2Mesh, 1.8, 0.07);
interactables.push({
  pos: new THREE.Vector3(0, 0, -9.2), radius: 1.3, id: 'key2', label: 'Pegar a chave em forma de coração',
  onInteract: () => {
    collectKey(1);
    key2Mesh.visible = false;
    toast('💛 Uma chave em forma de coração. Falta uma porta para abrir...');
    setObjective('Vá até a grande porta de vidro no fim do corredor.');
  },
});

const glassDoorGroup = new THREE.Group();
const hallWidth = ZONE.sala.x1 - ZONE.sala.x0;
const glassPane = new THREE.Mesh(new THREE.BoxGeometry(hallWidth, 2.5, 0.08), MAT.vidro);
glassPane.position.set(0, 1.25, -9.9);
const glassFrame = new THREE.Mesh(new THREE.BoxGeometry(hallWidth + 0.15, 2.6, 0.12), new THREE.MeshStandardMaterial({ color: '#1B4D6B', roughness: 0.5 }));
glassFrame.position.set(0, 1.25, -9.9);
for (let x = ZONE.sala.x0 + 1; x < ZONE.sala.x1; x += 2) {
  const mull = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.5, 0.1), glassFrame.material);
  mull.position.set(x, 1.25, -9.9);
  glassDoorGroup.add(mull);
}
glassDoorGroup.add(glassFrame, glassPane);
world.add(glassDoorGroup);
addCollider(ZONE.sala.x0, ZONE.sala.x1, -10.05, -9.75);
interactables.push({
  pos: new THREE.Vector3(0, 0, -9.9), radius: 4.5, id: 'porta-vidro', label: 'Abrir a porta com as duas chaves',
  onInteract: () => {
    if (!(state.keys[0] && state.keys[1])) { toast('A porta está trancada. Faltam chaves de memória...'); return; }
    if (state.transformed) return;
    playTransformationCutscene();
  },
});

const giftGroup = new THREE.Group();
const giftBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), MAT.terracota);
const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.34), MAT.dourado);
const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.36), MAT.dourado);
const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(0.05, 0.02, 40, 6), MAT.dourado);
bow.position.y = 0.2;
giftGroup.add(giftBase, ribbon1, ribbon2, bow);
giftGroup.position.set(0, 0.92, -19);
giftGroup.traverse((o) => { if (o.isMesh) o.castShadow = true; });
world.add(giftGroup);
floatBob(giftGroup, 1.2, 0.05);
interactables.push({
  pos: new THREE.Vector3(0, 0, -19), radius: 1.6, id: 'presente', label: 'Abrir o presente', enabled: false,
  onInteract: () => openGift(),
});
interactables.push({
  pos: eleGroup.position.clone(), radius: 2.3, id: 'ele', label: 'Falar com ele',
  onInteract: () => { if (!state.dialogueDone) startVarandaDialogue(); },
});

/* ============================================================
   GAME STATE - INTACTO
   ============================================================ */
const state = {
  keys: [false, false, false],
  vineCleared: false,
  transformed: false,
  dialogueDone: false,
  giftOpened: false,
  stage: 'sala',
};

function collectKey(i) {
  state.keys[i] = true;
  $('keyDot' + i).classList.add('filled');
  chime();
}
function setObjective(text) { $('objectiveText').textContent = text; }
setObjective('Explore a sala e encontre a chave de latão sobre a mesa.');
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ============================================================
   DIALOGUE SYSTEM - INTACTO
   ============================================================ */
let dialogueQueue = [];
let dialogueActive = false;
let typeInterval = null;
function showLines(lines, onDone) {
  dialogueQueue = lines.slice();
  dialogueActive = true;
  player.locked = true;
  $('dialogueBox').classList.add('show');
  nextLine(onDone);
}
function nextLine(onDone) {
  if (!dialogueQueue.length) {
    $('dialogueBox').classList.remove('show');
    dialogueActive = false;
    player.locked = false;
    if (onDone) onDone();
    return;
  }
  const line = dialogueQueue.shift();
  const speakerLabel = line.falante === 'ele' ? CFG.nomeEle : (line.falante === 'ela' ? CFG.nomeEla : '');
  $('speakerName').textContent = speakerLabel;
  $('speakerName').style.opacity = speakerLabel ? 1 : 0;
  const textEl = $('dialogueText');
  textEl.textContent = '';
  clearInterval(typeInterval);
  let i = 0;
  typeInterval = setInterval(() => {
    textEl.textContent = line.texto.slice(0, i + 1);
    i++;
    if (i >= line.texto.length) clearInterval(typeInterval);
  }, 22);
  showLines._advance = () => { clearInterval(typeInterval); textEl.textContent = line.texto; nextLine(onDone); };
}
function advanceDialogue() {
  if (dialogueActive && showLines._advance) showLines._advance();
}
$('dialogueBox').addEventListener('click', advanceDialogue);
function showNote(text) {
  player.locked = true;
  $('noteText').textContent = text;
  $('noteOverlay').classList.add('show');
}
$('noteCloseBtn').addEventListener('click', () => { $('noteOverlay').classList.remove('show'); player.locked = false; });
function startVarandaDialogue() {
  setPlayerAction('shock', 600);
  showLines(CFG.dialogoVaranda, () => {
    state.dialogueDone = true;
    const giftInteractable = interactables.find((i) => i.id === 'presente');
    giftInteractable.enabled = true;
    setObjective('Abra o presente sobre a mesa do mirante.');
    toast('✨ O presente na mesa começa a brilhar...');
  });
}
function openGift() {
  if (state.giftOpened) return;
  state.giftOpened = true;
  collectKey(2);
  setPlayerAction('celebrate', 1400);
  $('giftText').innerHTML = CFG.mensagemPresente.map((p) => `<p>${p}</p>`).join('');
  $('giftOverlay').classList.add('show');
  player.locked = true;
}
$('giftCloseBtn').addEventListener('click', () => {
  $('giftOverlay').classList.remove('show');
  playEnding();
});

/* ============================================================
   TRANSFORMATION CUTSCENE - ATUALIZADO PRA 3D
   ============================================================ */
function playTransformationCutscene() {
  state.transformed = true;
  player.locked = true;
  setObjective('✦ A magia acontece... ✦');
  $('fadeOverlay').classList.add('show');
  chime();
  setTimeout(() => {
    player.costume = 'princess';
    sofiaTropical.visible = false;
    sofiaPrincess.visible = true;
    player.currentMesh = sofiaPrincess;
    glassDoorGroup.visible = false;
    colliders.splice(colliders.findIndex((c) => c.minZ === -10.05), 1);
    player.pos.z = -10.6;
    tweenSky(2600);
  }, 900);
  setTimeout(() => { $('fadeOverlay').classList.remove('show'); }, 1500);
  setTimeout(() => {
    player.locked = false;
    setObjective('Siga até o mirante e encontre quem te espera.');
  }, 1700);
}
function tweenSky(duration) {
  const startTime = performance.now();
  const startCol = scene.background.clone();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    scene.background.copy(startCol).lerp(skyDusk, t);
    scene.fog.color.copy(scene.background);
    sun.intensity = THREE.MathUtils.lerp(1.15, 0.55, t);
    sun.color.copy(new THREE.Color('#ffb852').lerp(new THREE.Color('#c97bd6'), t * 0.6));
    hemi.intensity = THREE.MathUtils.lerp(0.65, 0.35, t);
    starMat.opacity = t * 0.9;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============================================================
   ENDING
   ============================================================ */
function playEnding() {
  player.locked = true;
  $('endingTitle').textContent = CFG.textoFinal;
  $('endingSub1').textContent = CFG.textoFinal2.split(' para')[0];
  $('endingSub2').textContent = 'para' + CFG.textoFinal2.split(' para')[1];
  $('endingTbc').textContent = CFG.textoFinal3;
  const startDist = controls.getDistance();
  const t0 = performance.now();
  function pull(now) {
    const t = Math.min(1, (now - t0) / 3200);
    const ease = 1 - Math.pow(1 - t, 3);
    controls.minDistance = controls.maxDistance = THREE.MathUtils.lerp(startDist, startDist + 22, ease);
    controls.maxPolarAngle = controls.minPolarAngle = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(55), THREE.MathUtils.degToRad(28), ease);
    controls.update();
    if (t < 1) requestAnimationFrame(pull); else setTimeout(() => $('endingScreen').classList.add('show'), 600);
  }
  requestAnimationFrame(pull);
}
$('replayBtn').addEventListener('click', () => location.reload());

function checkMemories() {
  memoryTriggers.forEach((m) => {
    if (m.seen) return;
    if (player.pos.distanceTo(new THREE.Vector3(m.pos.x, 0, m.pos.z)) < m.radius) {
      m.seen = true;
      m.art.material.emissive = new THREE.Color('#886622');
      m.art.material.emissiveIntensity = 0.6;
      toast('💭 ' + m.text);
    }
  });
}

/* ============================================================
   INPUT - INTACTO
   ============================================================ */
const keysDown = {};
window.addEventListener('keydown', (e) => {
  keysDown[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e' || e.key === ' ') { e.preventDefault(); tryInteract(); }
  else if (dialogueActive && e.key === 'Enter') advanceDialogue();
});
window.addEventListener('keyup', (e) => { keysDown[e.key.toLowerCase()] = false; });

let joyVec = { x: 0, y: 0 };
(function setupJoystick() {
  const zone = $('joystickZone'), thumb = $('joystickThumb');
  let active = false, startX = 0, startY = 0;
  const maxR = 40;
  function handleMove(clientX, clientY) {
    const dx = clientX - startX, dy = clientY - startY;
    const dist = Math.min(maxR, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    const tx = Math.cos(ang) * dist, ty = Math.sin(ang) * dist;
    thumb.style.left = (33 + tx) + 'px';
    thumb.style.top = (33 + ty) + 'px';
    joyVec.x = tx / maxR; joyVec.y = ty / maxR;
  }
  zone.addEventListener('touchstart', (e) => {
    active = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    e.preventDefault();
  }, { passive: false });
  zone.addEventListener('touchmove', (e) => {
    if (!active) return;
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  zone.addEventListener('touchend', () => {
    active = false; joyVec.x = 0; joyVec.y = 0;
    thumb.style.left = '33px'; thumb.style.top = '33px';
  });
})();
$('actionBtn').addEventListener('click', () => tryInteract());

let nearestInteractable = null;
function tryInteract() {
  if (dialogueActive) { advanceDialogue(); return; }
  if (nearestInteractable && !player.locked) nearestInteractable.onInteract();
}

/* ============================================================
   MOVEMENT / COLLISION - ATUALIZADO PRA 3D
   ============================================================ */
const moveDir = new THREE.Vector3();
function computeInput() {
  let ix = 0, iy = 0;
  if (keysDown['w'] || keysDown['arrowup']) iy -= 1;
  if (keysDown['s'] || keysDown['arrowdown']) iy += 1;
  if (keysDown['a'] || keysDown['arrowleft']) ix -= 1;
  if (keysDown['d'] || keysDown['arrowright']) ix += 1;
  ix += joyVec.x; iy += joyVec.y;
  const len = Math.hypot(ix, iy);
  if (len > 1) { ix /= len; iy /= len; }
  return { ix, iy };
}
function collidesAt(x, z) {
  for (const c of colliders) {
    if (x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ) return true;
  }
  return false;
}
function updatePlayer(dt) {
  const { ix, iy } = computeInput();
  player.moving = false;
  if (!player.locked && (ix !== 0 || iy !== 0)) {
    const azimuth = controls.getAzimuthalAngle();
    const forward = new THREE.Vector3(Math.sin(azimuth), 0, Math.cos(azimuth));
    const right = new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth));
    moveDir.set(0, 0, 0).addScaledVector(right, ix).addScaledVector(forward, -iy).normalize();
    player.moveDir.copy(moveDir);
    const nx = player.pos.x + moveDir.x * player.speed * dt;
    const nz = player.pos.z + moveDir.z * player.speed * dt;
    if (!collidesAt(nx, player.pos.z)) player.pos.x = nx;
    if (!collidesAt(player.pos.x, nz)) player.pos.z = nz;
    player.moving = true;
  }
  // 3D REAL - vira o corpo pra direção que anda
  playerMesh.position.set(player.pos.x, 0, player.pos.z);
  if (player.moving && player.moveDir.length() > 0.1) {
    const desiredY = Math.atan2(player.moveDir.x, player.moveDir.z);
    let diff = desiredY - playerMesh.rotation.y;
    while (diff > Math.PI) diff -= Math.PI*2;
    while (diff < -Math.PI) diff += Math.PI*2;
    playerMesh.rotation.y += diff * 0.18;
  }
  blobShadow.position.set(player.pos.x, 0.02, player.pos.z);

  // Animação 3D - balanço de pernas/braços
  if (player.moving && !player.locked) {
    player.animTimer += dt * 8;
    const swing = Math.sin(player.animTimer) * 0.6;
    const mesh = player.currentMesh;
    if (mesh && mesh.userData.leftLeg) {
      mesh.userData.leftLeg.rotation.x = swing;
      mesh.userData.rightLeg.rotation.x = -swing;
    }
    if (mesh && mesh.userData.leftArm) {
      mesh.userData.leftArm.rotation.x = -swing * 0.4;
      mesh.userData.rightArm.rotation.x = swing * 0.4;
    }
  }

  controls.target.lerp(new THREE.Vector3(player.pos.x, 1.1, player.pos.z), 0.08);
  checkMemories();
  let best = null, bestD = Infinity;
  interactables.forEach((it) => {
    if (it.enabled === false) return;
    const d = Math.hypot(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
    if (d < it.radius && d < bestD) { bestD = d; best = it; }
  });
  nearestInteractable = best;
  const promptEl = $('interactPrompt');
  if (best && !player.locked) {
    $('interactLabel').textContent = best.label;
    promptEl.classList.add('show');
  } else {
    promptEl.classList.remove('show');
  }
}

function updateBobbers(t) {
  bobbers.forEach((m) => {
    if (!m.visible) return;
    m.position.y = m.userData._bobBase + Math.sin(t * m.userData._bobSpeed) * m.userData._bobAmp;
  });
}

/* ============================================================
   AUDIO
   ============================================================ */
const audioState = { ctx: null, playing: false, muted: false, master: null };
function ensureAudio() {
  if (audioState.ctx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioState.ctx = new Ctx();
  audioState.master = audioState.ctx.createGain();
  audioState.master.gain.value = audioState.muted ? 0 : 0.5;
  audioState.master.connect(audioState.ctx.destination);
}
function chime() {
  ensureAudio();
  const ctx = audioState.ctx;
  const t0 = ctx.currentTime;
  [880, 1108, 1318].forEach((f, i) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = f;
    g.gain.setValueAtTime(0, t0 + i * 0.09);
    g.gain.linearRampToValueAtTime(0.18, t0 + i * 0.09 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.09 + 0.7);
    osc.connect(g); g.connect(audioState.master);
    osc.start(t0 + i * 0.09); osc.stop(t0 + i * 0.09 + 0.75);
  });
}
let ambientNodes = [];
function toggleAmbientMusic() {
  ensureAudio();
  const ctx = audioState.ctx;
  if (audioState.playing) {
    ambientNodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    ambientNodes = []; audioState.playing = false; return;
  }
  audioState.playing = true;
  const notes = [261.6, 329.6, 392.0, 440.0, 523.3, 392.0, 329.6, 293.7];
  const noteLen = 0.85;
  const bassGain = ctx.createGain(); bassGain.gain.value = 0.09; bassGain.connect(audioState.master);
  const leadGain = ctx.createGain(); leadGain.gain.value = 0.06; leadGain.connect(audioState.master);
  let step = 0;
  function scheduleLoop() {
    if (!audioState.playing) return;
    const t = ctx.currentTime + 0.05;
    const bass = ctx.createOscillator(); bass.type = 'sine';
    bass.frequency.value = notes[step % notes.length] / 2;
    const bg = ctx.createGain(); bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.5, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.001, t + noteLen);
    bass.connect(bg); bg.connect(bassGain);
    bass.start(t); bass.stop(t + noteLen + 0.1);
    ambientNodes.push(bass);
    step++;
    setTimeout(scheduleLoop, noteLen * 1000);
  }
  scheduleLoop();
}
$('soundToggle').addEventListener('click', () => {
  ensureAudio();
  audioState.muted = !audioState.muted;
  audioState.master.gain.value = audioState.muted ? 0 : 0.5;
  $('soundToggle').textContent = audioState.muted ? '🔇' : '🔈';
});

/* ============================================================
   TITLE / LOADING FLOW - CORRIGIDO PRA NÃO FICAR CARREGANDO
   ============================================================ */
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (u, loaded, total) => { const el=$('loadbarFill'); if(el) el.style.width = (loaded / total * 100) + '%'; };
loadingManager.onLoad = () => {
  $('loading').classList.add('hidden');
  $('titleScreen').classList.remove('hidden');
};
// Fallback GARANTIDO - mesmo sem sprites carrega
setTimeout(() => {
  const loadEl=$('loading'); const titleEl=$('titleScreen');
  if (loadEl && !loadEl.classList.contains('hidden')) {
    loadEl.classList.add('hidden');
    if(titleEl) titleEl.classList.remove('hidden');
  }
  const bar=$('loadbarFill'); if(bar) bar.style.width='100%';
}, 1200);

$('startBtn').addEventListener('click', () => {
  $('titleScreen').classList.add('hidden');
  ensureAudio();
});
$('howToBtn').addEventListener('click', () => {
  toast('Use WASD/setas (ou o manete) para andar, e o botão / tecla E para interagir.');
});

/* ============================================================
   MAIN LOOP - COM BONDINHO ANIMADO
   ============================================================ */
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  updatePlayer(dt);
  updateBobbers(t);
  const eleBob = Math.sin(t * 1.3) * 0.02;
  eleGroup.position.y = eleBob;
  // Bondinho se movendo
  if (rioGroup && rioGroup.userData.cableCurve) {
    const c = rioGroup.userData.cableCurve;
    const p1 = c.getPoint((t*0.04)%1);
    const p2 = c.getPoint(((t*0.04)+0.5)%1);
    if(rioGroup.userData.bondinho1) rioGroup.userData.bondinho1.position.copy(p1);
    if(rioGroup.userData.bondinho2) rioGroup.userData.bondinho2.position.copy(p2);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
