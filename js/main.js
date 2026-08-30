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
   NOVO: CENÁRIO CARIOCA ULTRA COMPLETO - RUA, BONDINHO, PÃO, SOL, PRAIA
   ============================================================ */
const rioGroup = new THREE.Group();
world.add(rioGroup);

// Chão gigante mata atlântica
const bigGround = new THREE.Mesh(new THREE.PlaneGeometry(500,500), new THREE.MeshStandardMaterial({color:'#1d4a2e', roughness:1}));
bigGround.rotation.x=-Math.PI/2; bigGround.position.y=-0.35; bigGround.receiveShadow=true;
rioGroup.add(bigGround);

// Rua de Santa Teresa descendo - paralelepípedo bem visível
// IMPORTANTE: a casa ocupa x:[-7.2,7.2] e z:[-23.5,19] (varanda é o cômodo mais "de fora", com z0=-23.5).
// A rua/trilho/bondinho ficam TODOS além de z=-23.5 (visíveis a partir da varanda, sem cruzar dentro da casa).
const RUA_Z_CENTRO = -78; // centro da rua, bem além da varanda
const RUA_Z_METADE = 45;  // metade do comprimento da rua
const streetMat = new THREE.MeshStandardMaterial({color:'#6a6a6a', roughness:0.95});
const street = new THREE.Mesh(new THREE.PlaneGeometry(10, RUA_Z_METADE * 2), streetMat);
street.rotation.x=-Math.PI/2; street.position.set(0,-0.28,RUA_Z_CENTRO); street.receiveShadow=true;
rioGroup.add(street);
// Trilhos do bondinho de Santa Teresa (2 trilhos)
const railMat = new THREE.MeshStandardMaterial({color:'#2a2a2a', metalness:0.7, roughness:0.3});
for(let side of [-1.4,1.4]){
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.12,RUA_Z_METADE * 2), railMat);
  rail.position.set(side,-0.22,RUA_Z_CENTRO); rioGroup.add(rail);
}
// Bondinho de Santa Teresa - TRAM que anda na rua (não é o do Pão de Açúcar)
const tramGroup = new THREE.Group();
const tramBase = new THREE.Mesh(new THREE.BoxGeometry(1.8,1.0,3.2), new THREE.MeshStandardMaterial({color:'#ffcc00'}));
tramBase.position.y=0.6; tramGroup.add(tramBase);
const tramRoof = new THREE.Mesh(new THREE.BoxGeometry(1.9,0.15,3.3), new THREE.MeshStandardMaterial({color:'#8a4a2a'}));
tramRoof.position.y=1.2; tramGroup.add(tramRoof);
for(let i=0;i<4;i++){ const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.1,8), new THREE.MeshStandardMaterial({color:'#1a1a1a'})); wheel.rotation.z=Math.PI/2; wheel.position.set(i<2?-0.9:0.9,0.18, i%2==0 ? -1.0 : 1.0); tramGroup.add(wheel); }
tramGroup.position.set(0,0,RUA_Z_CENTRO);
tramGroup.castShadow=true;
rioGroup.add(tramGroup);
rioGroup.userData.tramGroup=tramGroup;
rioGroup.userData.tramZCentro = RUA_Z_CENTRO;
rioGroup.userData.tramAmplitude = RUA_Z_METADE - 5; // margem de segurança nas pontas dos trilhos

// Pão de Açúcar - 2 morros icônicos bem detalhados
const paoMat = new THREE.MeshStandardMaterial({color:'#4a5a6a', roughness:0.8});
const paoBase = new THREE.Mesh(new THREE.CylinderGeometry(3.2,4.8,5,14), paoMat); paoBase.position.set(22,2.2,-58); paoBase.castShadow=true; rioGroup.add(paoBase);
const paoTop = new THREE.Mesh(new THREE.SphereGeometry(3.4,20,16,0,Math.PI*2,0,Math.PI*0.6), paoMat); paoTop.position.set(22,6,-58); paoTop.scale.set(1,1.4,1); paoTop.castShadow=true; rioGroup.add(paoTop);
const urca = new THREE.Mesh(new THREE.ConeGeometry(3.0,4.5,12), paoMat); urca.position.set(16,2,-54); urca.castShadow=true; rioGroup.add(urca);
// Cabo do bondinho do Pão de Açúcar
const cableMat = new THREE.MeshStandardMaterial({color:'#1a1a1a'});
const cableCurve = new THREE.CatmullRomCurve3([ new THREE.Vector3(0,12,-23), new THREE.Vector3(8,20,-38), new THREE.Vector3(15,18,-52), new THREE.Vector3(22,10,-58) ]);
const cableGeo = new THREE.TubeGeometry(cableCurve, 28, 0.03, 6, false);
const cable = new THREE.Mesh(cableGeo, cableMat); rioGroup.add(cable);
const bondinhoGeo = new THREE.BoxGeometry(0.8,0.6,1.0);
const bondinho1 = new THREE.Mesh(bondinhoGeo, new THREE.MeshStandardMaterial({color:'#ffcc00'})); bondinho1.name='bondinho1'; rioGroup.add(bondinho1);
const bondinho2 = new THREE.Mesh(bondinhoGeo, new THREE.MeshStandardMaterial({color:'#e63946'})); bondinho2.name='bondinho2'; rioGroup.add(bondinho2);
rioGroup.userData.cableCurve=cableCurve; rioGroup.userData.bondinho1=bondinho1; rioGroup.userData.bondinho2=bondinho2;

// Corcovado + Cristo Redentor
const greenHillMat = new THREE.MeshStandardMaterial({color:'#1e5a3a', roughness:0.9});
const corcovado = new THREE.Mesh(new THREE.ConeGeometry(8,10,8), greenHillMat); corcovado.position.set(-24,3.5,-72); corcovado.castShadow=true; rioGroup.add(corcovado);
const cristoBase = new THREE.Mesh(new THREE.BoxGeometry(0.4,1.5,0.4), new THREE.MeshStandardMaterial({color:'#e8e0d0'})); cristoBase.position.set(-24,10.5,-72); rioGroup.add(cristoBase);
const cristoBraco = new THREE.Mesh(new THREE.BoxGeometry(2.0,0.25,0.25), new THREE.MeshStandardMaterial({color:'#e8e0d0'})); cristoBraco.position.set(-24,11.2,-72); rioGroup.add(cristoBraco);

// Praia + Areia + Mar da Baía de Guanabara
const sandMat = new THREE.MeshStandardMaterial({color:'#e8d5a8', roughness:1});
const sand = new THREE.Mesh(new THREE.PlaneGeometry(120,20), sandMat); sand.rotation.x=-Math.PI/2; sand.position.set(10,-0.4,-68); rioGroup.add(sand);
const waterMat = new THREE.MeshStandardMaterial({color:'#1a6a8a', roughness:0.1, metalness:0.2, transparent:true, opacity:0.85});
const water = new THREE.Mesh(new THREE.PlaneGeometry(300,120), waterMat); water.rotation.x=-Math.PI/2; water.position.set(20,-0.45,-85); rioGroup.add(water);

// Sol 3D bem visível + brilho
const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(3.0,20,16), new THREE.MeshBasicMaterial({color:'#ffaa33'}));
sunMesh.position.set(-28,28,-50); rioGroup.add(sunMesh);
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(5.0,16,12), new THREE.MeshBasicMaterial({color:'#ffcc66', transparent:true, opacity:0.25}));
sunGlow.position.copy(sunMesh.position); rioGroup.add(sunGlow);
const sunLight = new THREE.PointLight('#ffb852', 2, 80); sunLight.position.copy(sunMesh.position); rioGroup.add(sunLight);

// Casinhas coloridas de Santa Teresa ao redor (mais)
const houseColors = ['#E2A83B','#D6488C','#1B4D6B','#B85A3C','#1E6B4F','#f4ede0','#ff7eb0'];
for(let i=0;i<28;i++){
  const col = houseColors[Math.floor(Math.random()*houseColors.length)];
  const mat = new THREE.MeshStandardMaterial({color:col, roughness:0.8});
  const w=1.5+Math.random()*1.8, h=1.2+Math.random()*1.5, d=1.2+Math.random()*1.2;
  const ang=Math.random()*Math.PI*2, rad=16+Math.random()*22;
  const x=Math.cos(ang)*rad, z=Math.sin(ang)*rad -10;
  if (Math.abs(x)<9 && z>-14 && z<20) continue;
  const house=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); house.position.set(x,h/2-0.3,z); house.castShadow=true; rioGroup.add(house);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(w*0.7,0.6,4), new THREE.MeshStandardMaterial({color:'#8a4a3a'})); roof.position.set(x,h-0.05,z); roof.rotation.y=Math.PI/4; rioGroup.add(roof);
}

// Palmeiras tropicais
function palm(x,z,s=1){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08*s,0.12*s,2.8*s,8), new THREE.MeshStandardMaterial({color:'#5a3a2a'}));
  trunk.position.set(x,1.4*s-0.3,z); trunk.castShadow=true; rioGroup.add(trunk);
  for(let i=0;i<6;i++){
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(0.16*s,1.3*s,5), new THREE.MeshStandardMaterial({color:'#2e7d4f'}));
    leaf.position.set(x,2.9*s-0.3,z); leaf.rotation.z=(i/6)*Math.PI*2; leaf.rotation.x=0.7; leaf.castShadow=true; rioGroup.add(leaf);
  }
}
for(let i=0;i<18;i++){
  const ang=Math.random()*Math.PI*2, rad=12+Math.random()*28;
  palm(Math.cos(ang)*rad, Math.sin(ang)*rad-8, 0.9+Math.random()*0.6);
}

// Guarda-sóis coloridos na areia (estilo praia carioca)
const umbrellaColors = ['#e63946','#f4a261','#2e7d4f','#1B4D6B','#ffcc00'];
function beachUmbrella(x,z){
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,1.6,6), new THREE.MeshStandardMaterial({color:'#e8e0d0'}));
  pole.position.set(x,0.4,z); pole.castShadow=true; rioGroup.add(pole);
  const col = umbrellaColors[Math.floor(Math.random()*umbrellaColors.length)];
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.85,0.5,10), new THREE.MeshStandardMaterial({color:col, roughness:0.7}));
  canopy.position.set(x,1.25,z); canopy.castShadow=true; rioGroup.add(canopy);
}
for(let i=0;i<9;i++) beachUmbrella(-20+i*7+(Math.random()-0.5)*2, -62+(Math.random()-0.5)*4);

// Gaivotas simples sobrevoando o mar
const seagulls = [];
function seagull(x,y,z){
  const g=new THREE.Group();
  const wing=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.06,3), new THREE.MeshBasicMaterial({color:'#ffffff'}));
  const wing2=wing.clone();
  wing.position.x=-0.15; wing.rotation.z=0.5;
  wing2.position.x=0.15; wing2.rotation.z=-0.5; wing2.rotation.y=Math.PI;
  g.add(wing,wing2); g.position.set(x,y,z);
  rioGroup.add(g);
  seagulls.push({ mesh:g, radius: 8+Math.random()*10, speed: 0.15+Math.random()*0.1, phase: Math.random()*Math.PI*2, baseY:y, cx:x, cz:z });
}
seagull(0,14,-60); seagull(6,16,-66); seagull(-8,15,-56);
rioGroup.userData.seagulls = seagulls;

/* ============================================================
   PERSONAGEM (SOFIA) - SPRITE 2D SEMPRE DE FRENTE PRA CÂMERA
   ------------------------------------------------------------
   Em vez de um boneco 3D com cubos, a Sofia agora é um "cartão"
   2D (billboard) com a ilustração dela de verdade — ele gira
   sozinho pra sempre ficar de frente pra câmera (técnica clássica
   de jogos 2.5D, tipo Paper Mario), então nunca aparece torto ou
   esticado, não importa o ângulo que você gire a câmera. Ele troca
   de imagem conforme a ação (parada / andando / atacando / etc.)
   e espelha horizontalmente pro lado certo conforme ela anda.

   ARQUIVOS (assets/sprites/character/<figurino>/<estado>.png):
     tropical/idle.png, walk1.png, walk2.png, attack.png, shock.png
     princess/idle.png, walk1.png, walk2.png, shock.png, celebrate.png

   Cada imagem deve ser um PNG com fundo transparente, já recortado
   rente ao desenho (sem sobra de espaço em branco/transparente ao
   redor) — isso evita a personagem "pular" de tamanho ao trocar de
   frame. Se um arquivo não existir, o jogo não quebra: só mantém o
   último frame carregado com sucesso naquele estado.
   ============================================================ */
const CHARACTER_SPRITE_BASE = 'assets/sprites/character/';
const CHARACTER_TARGET_HEIGHT = 1.7; // altura em unidades do mundo (mesma escala do boneco antigo)
const spriteTextureLoader = new THREE.TextureLoader();
const spriteCache = {}; // 'costume/estado' -> { texture, aspect, ready, pending[] }
function loadCharacterFrame(costume, state) {
  const key = costume + '/' + state;
  if (spriteCache[key]) return spriteCache[key];
  const entry = { texture: null, aspect: 1, ready: false, pending: [] };
  spriteCache[key] = entry;
  spriteTextureLoader.load(
    CHARACTER_SPRITE_BASE + key + '.png',
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      entry.texture = tex;
      entry.aspect = tex.image.width / tex.image.height;
      entry.ready = true;
      entry.pending.forEach((fn) => fn());
      entry.pending.length = 0;
    },
    undefined,
    () => { console.warn(`[sprites] não encontrei ${CHARACTER_SPRITE_BASE}${key}.png`); }
  );
  return entry;
}
function applyFrameToSprite(group, entry) {
  const sprite = group.userData.sprite;
  sprite.material.map = entry.texture;
  sprite.material.needsUpdate = true;
  const h = CHARACTER_TARGET_HEIGHT;
  const w = h * entry.aspect;
  sprite.scale.set(w * group.userData.facing, h, 1);
}
// Troca o frame exibido (ex.: 'idle', 'walk1', 'attack'...) sem mexer no lado que ela está olhando
function setSpriteFrame(group, state) {
  if (group.userData.currentState === state) return;
  group.userData.currentState = state;
  const entry = loadCharacterFrame(group.userData.costume, state);
  if (entry.ready) applyFrameToSprite(group, entry);
  else entry.pending.push(() => { if (group.userData.currentState === state) applyFrameToSprite(group, entry); });
}
// Espelha o sprite pro lado certo (1 = olhando/andando pra direita, -1 = pra esquerda). As artes originais olham pra direita.
function setSpriteFacing(group, facing) {
  if (group.userData.facing === facing) return;
  group.userData.facing = facing;
  const sprite = group.userData.sprite;
  sprite.scale.x = Math.abs(sprite.scale.x) * facing;
}
function createSpriteCharacter(costume, states) {
  const group = new THREE.Group();
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
  sprite.center.set(0.5, 0); // ancora no chão (pé), não no meio do sprite
  group.add(sprite);
  group.userData.sprite = sprite;
  group.userData.costume = costume;
  group.userData.currentState = null;
  group.userData.facing = 1;
  states.forEach((s) => loadCharacterFrame(costume, s)); // pré-carrega todos os frames desse figurino
  return group;
}

const sofiaTropical = createSpriteCharacter('tropical', ['idle', 'walk1', 'walk2', 'attack', 'shock']);
const sofiaPrincess = createSpriteCharacter('princess', ['idle', 'walk1', 'walk2', 'shock', 'celebrate']);
setSpriteFrame(sofiaTropical, 'idle');
setSpriteFrame(sofiaPrincess, 'idle');
sofiaPrincess.visible = false;

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



// Campo de estrelas usado na transição pro entardecer (tweenSky) - some de dia, aparece ao anoitecer
const starGeo = new THREE.BufferGeometry();
const starCount = 260;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const ang = Math.random() * Math.PI * 2;
  const radius = 90 + Math.random() * 60;
  const height = 20 + Math.random() * 70;
  starPositions[i * 3] = Math.cos(ang) * radius;
  starPositions[i * 3 + 1] = height;
  starPositions[i * 3 + 2] = Math.sin(ang) * radius;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: '#fff6da', size: 0.9, transparent: true, opacity: 0, sizeAttenuation: true });
const starField = new THREE.Points(starGeo, starMat);
world.add(starField);

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

// Poder de flores: usável a qualquer momento pelo botão dedicado (mobile) ou tecla F (PC).
// Se o jogador estiver perto da vinha ainda não limpa, também libera a passagem.
let flowerPowerCooldown = 0;
function triggerFlowerBurst() {
  if (player.locked || dialogueActive || flowerPowerCooldown > 0) return;
  flowerPowerCooldown = 0.5;
  setPlayerAction('attack', 650);
  toast('🌸 Rajada de flores!');
  if (!state.vineCleared && player.pos.distanceTo(new THREE.Vector3(0, 0, -5.5)) < 4.2) {
    setTimeout(() => {
      vineGroup.children.forEach((c) => { c.visible = false; });
      state.vineCleared = true;
      const idx = colliders.findIndex((c) => c.minZ === -5.75);
      if (idx > -1) colliders.splice(idx, 1);
      setObjective('Explore o corredor e reúna a chave em forma de coração.');
    }, 500);
  }
}

function setPlayerAction(kind, duration){
  const mesh=player.currentMesh; if(!mesh) return;
  player.locked=true;
  if(kind==='attack'){
    setSpriteFrame(mesh, 'attack');
    const origin = playerMesh.position.clone().add(new THREE.Vector3(0,1.2,0));
    const dir = player.moveDir.length()>0.1 ? player.moveDir.clone() : new THREE.Vector3(0,0,-1);
    spawnFlowerPower(origin, dir);
  } else if(kind==='shock'){
    setSpriteFrame(mesh, 'shock');
    playerMesh.scale.y=0.9; playerMesh.position.y=-0.08; // pequeno "encolhida de susto"
  } else if(kind==='celebrate'){
    setSpriteFrame(mesh, 'celebrate');
    playerMesh.position.y=0.15;
  }
  clearTimeout(setPlayerAction._t);
  setPlayerAction._t=setTimeout(()=>{
    player.locked=false;
    playerMesh.position.y=0; playerMesh.scale.y=1;
    setSpriteFrame(mesh, 'idle'); // updatePlayer troca pra walk1/walk2 no próximo frame se ela estiver andando
  },duration);
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
  onInteract: () => { if (!state.vineCleared) triggerFlowerBurst(); },
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
  else if (e.key.toLowerCase() === 'f') { e.preventDefault(); triggerFlowerBurst(); }
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
const camForward = new THREE.Vector3();
const camRight = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WALK_FRAME_TIME = 0.18; // segundos entre a troca walk1 <-> walk2
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
    // Direção real da câmera (pra frente = pra "dentro da tela"), não o offset câmera->alvo (que apontava ao contrário e fazia andar pra trás)
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    if (camForward.lengthSq() < 1e-6) camForward.set(0, 0, -1); else camForward.normalize();
    camRight.crossVectors(camForward, WORLD_UP).normalize();
    moveDir.set(0, 0, 0).addScaledVector(camRight, ix).addScaledVector(camForward, -iy).normalize();
    player.moveDir.copy(moveDir);
    const nx = player.pos.x + moveDir.x * player.speed * dt;
    const nz = player.pos.z + moveDir.z * player.speed * dt;
    if (!collidesAt(nx, player.pos.z)) player.pos.x = nx;
    if (!collidesAt(player.pos.x, nz)) player.pos.z = nz;
    player.moving = true;

    // Sprite sempre olha pra câmera sozinho (billboard); só precisamos espelhar
    // pro lado certo, com base em pra onde ela está indo na TELA (não no mundo).
    const sideDot = moveDir.dot(camRight);
    if (Math.abs(sideDot) > 0.15) setSpriteFacing(player.currentMesh, sideDot >= 0 ? 1 : -1);
  }
  playerMesh.position.set(player.pos.x, 0, player.pos.z);
  blobShadow.position.set(player.pos.x, 0.02, player.pos.z);

  // Animação: troca entre os frames prontos (parada / passo 1 / passo 2) — sem precisar de esqueleto
  if (!player.locked) {
    if (player.moving) {
      player.animTimer += dt;
      const frame = Math.floor(player.animTimer / WALK_FRAME_TIME) % 2 === 0 ? 'walk1' : 'walk2';
      setSpriteFrame(player.currentMesh, frame);
    } else {
      player.animTimer = 0;
      setSpriteFrame(player.currentMesh, 'idle');
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
   CONTROLES ADAPTATIVOS - PC x CELULAR (Minecraft-style no touch)
   ============================================================ */
(function setupAdaptiveControls() {
  const style = document.createElement('style');
  style.textContent = `
    #mcActionButtons { position: fixed; right: 18px; bottom: 22px; display: flex; flex-direction: column; gap: 14px; z-index: 40; }
    .mc-btn { width: 62px; height: 62px; border-radius: 14px; border: 3px solid rgba(255,255,255,0.55);
      background: linear-gradient(180deg, rgba(60,50,45,0.55), rgba(20,16,14,0.65)); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff;
      -webkit-tap-highlight-color: transparent; user-select: none; touch-action: manipulation;
      box-shadow: 0 3px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
    .mc-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,0.35); background: rgba(0,0,0,0.55); }
    .mc-btn--flower { border-color: #ff9ec7; }
    #pcHint { position: fixed; left: 18px; bottom: 18px; z-index: 40; font: 12px/1.4 system-ui, sans-serif;
      color: #fff; background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 8px; letter-spacing: 0.2px; }
    body:not(.is-touch) #mcActionButtons { display: none !important; }
    body.is-touch #pcHint { display: none !important; }
  `;
  document.head.appendChild(style);

  if (isTouch) {
    // Some com qualquer texto/lembrete de tecla de PC que já exista na tela
    const legacyPrompt = $('interactPrompt');
    if (legacyPrompt) legacyPrompt.classList.add('mobile-mode');

    const wrap = document.createElement('div');
    wrap.id = 'mcActionButtons';
    wrap.innerHTML = `
      <div class="mc-btn mc-btn--flower" id="flowerBtn" aria-label="Rajada de flores">🌸</div>
      <div class="mc-btn" id="mcInteractBtn" aria-label="Interagir">✋</div>
    `;
    document.body.appendChild(wrap);
    $('flowerBtn').addEventListener('touchstart', (e) => { e.preventDefault(); triggerFlowerBurst(); }, { passive: false });
    $('flowerBtn').addEventListener('click', () => triggerFlowerBurst());
    $('mcInteractBtn').addEventListener('touchstart', (e) => { e.preventDefault(); tryInteract(); }, { passive: false });
    $('mcInteractBtn').addEventListener('click', () => tryInteract());
    // Se existir o botão antigo de interação, deixa ele visível também (compatibilidade), sem duplicar textos de tecla
    const oldActionBtn = $('actionBtn');
    if (oldActionBtn) oldActionBtn.style.display = 'none'; // substituído pelo mcInteractBtn
  } else {
    const hint = document.createElement('div');
    hint.id = 'pcHint';
    hint.textContent = 'WASD / setas: mover • E ou espaço: interagir • F: rajada de flores';
    document.body.appendChild(hint);
  }
})();

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
const howToBtnEl = $('howToBtn');
if (howToBtnEl) {
  howToBtnEl.addEventListener('click', () => {
    toast(isTouch
      ? '👆 Use o manete pra andar. Toque em ✋ para interagir e em 🌸 para a rajada de flores.'
      : '⌨️ Use WASD ou as setas pra andar. Pressione E (ou espaço) para interagir e F para a rajada de flores.');
  });
}

/* ============================================================
   MAIN LOOP - COM BONDINHO ANIMADO
   ============================================================ */
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  if (flowerPowerCooldown > 0) flowerPowerCooldown = Math.max(0, flowerPowerCooldown - dt);
  updatePlayer(dt);
  updateBobbers(t);
  updateFlowerPower(dt);
  const eleBob = Math.sin(t * 1.3) * 0.02;
  eleGroup.position.y = eleBob;
  // Anima bondinho Pão de Açúcar
  if(rioGroup && rioGroup.userData.cableCurve){
    const c=rioGroup.userData.cableCurve;
    const p1=c.getPoint((t*0.04)%1);
    const p2=c.getPoint(((t*0.04)+0.5)%1);
    if(rioGroup.userData.bondinho1) rioGroup.userData.bondinho1.position.copy(p1);
    if(rioGroup.userData.bondinho2) rioGroup.userData.bondinho2.position.copy(p2);
  }
  // Anima as gaivotas sobrevoando o mar em círculos suaves
  if (rioGroup && rioGroup.userData.seagulls) {
    rioGroup.userData.seagulls.forEach((s) => {
      const ang = t * s.speed + s.phase;
      s.mesh.position.set(s.cx + Math.cos(ang) * s.radius, s.baseY + Math.sin(t * 0.8 + s.phase) * 0.6, s.cz + Math.sin(ang) * s.radius);
      s.mesh.rotation.y = -ang - Math.PI / 2;
    });
  }
  // Anima bondinho de Santa Teresa na rua (fica sempre além da varanda, nunca cruza a casa)
  if(rioGroup && rioGroup.userData.tramGroup){
    const tram=rioGroup.userData.tramGroup;
    tram.position.z = rioGroup.userData.tramZCentro - Math.sin(t*0.3) * rioGroup.userData.tramAmplitude;
    tram.position.x = Math.sin(t*0.3)*0.5;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
