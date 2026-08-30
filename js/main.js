import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================================================
   CONFIG - EDITE SEUS ASSETS AQUI
   ============================================================ */
const CFG = window.GAME_CONFIG || {
  nomeEla: "Sofia",
  nomeEle: "Ele",
  bilheteChave1: "Uma chave de latão. Cheira a maresia e lembranças.",
  memorias: ["Lembra da primeira vez que vimos o Pão de Açúcar?", "Essa foto... foi no dia que você me ensinou a sambar.", "Você disse que um dia moraria numa casa assim."],
  dialogoVaranda: [
    { falante: "ele", texto: "Você veio..." },
    { falante: "ela", texto: "Eu sempre volto." },
  ],
  mensagemPresente: ["Para o meu amor,", "Cada flor que você espalha é um pedacinho da nossa história."],
  textoFinal: "Soso House",
  textoFinal2: "Feito para você, com amor",
  textoFinal3: "To be continued...",
};

/*
  ONDE COLOCAR LINKS:

  1. MÚSICAS:
  - Se for do Google Drive: pegue o link de compartilhamento ex: https://drive.google.com/file/d/SEU_ID/view
    Copie o SEU_ID e use assim: https://drive.google.com/uc?export=download&id=SEU_ID
    OU melhor, hospede no proprio repo em ./assets/audio/
  - Defina abaixo em AUDIO_SOURCES

  2. PINTURA / QUADROS:
  - Coloque as imagens grandes em ./assets/images/
  - Defina em PAINTING_SOURCES

  3. SPRITES:
  - Seu print mostra que estão em ./assets/sprites/ com nome tipo tropical_idle.png
  - Isso está corrigido abaixo em SPRITE_BASE
*/

const AUDIO_SOURCES = {
  // troque por seus links diretos. Ex: Drive: 'https://drive.google.com/uc?export=download&id=1abc...'
  ambient: './assets/audio/ambient.mp3', // musica de fundo da casa
  vitrola: './assets/audio/vitrola.mp3', // musica da vitrola
  chime: './assets/audio/chime.mp3', // som de pegar chave
};

const PAINTING_SOURCES = {
  grande: './assets/images/pintura-grande.jpg', // quando clicar no quadro da sala
  quadros: [
    './assets/images/quadro1.jpg',
    './assets/images/quadro2.jpg',
    './assets/images/quadro3.jpg',
  ],
  vinilCapa: './assets/images/vinil-capa.jpg',
};

const $ = (id) => document.getElementById(id);
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('is-touch');
else document.body.classList.add('is-pc');

/* ============================================================
   LOADING MANAGER
   ============================================================ */
const loadingManager = new THREE.LoadingManager();
const spriteTextureLoader = new THREE.TextureLoader(loadingManager);

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
   TEXTURES PROCEDURAIS
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
   MATERIAIS
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
  return box(w, 0.3, d, mat, (zone.x0 + zone.x1) / 2, y - 0.15, (zone.z0 + zone.z1) / 2);
}
function sideWalls(zone, mat, h = 2.6) {
  const d = zone.z1 - zone.z0;
  box(0.3, h, d, mat, zone.x0, h / 2, (zone.z0 + zone.z1) / 2);
  box(0.3, h, d, mat, zone.x1, h / 2, (zone.z0 + zone.z1) / 2);
  addCollider(zone.x0 - 0.4, zone.x0 + 0.1, zone.z0, zone.z1);
  addCollider(zone.x1 - 0.1, zone.x1 + 0.4, zone.z0, zone.z1);
}

/* ---------- PATIO ---------- */
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

/* ---------- SALA ---------- */
floorSlab(ZONE.sala, MAT.wood);
sideWalls(ZONE.sala, MAT.branco, 2.7);
box(2.6, 0.55, 1.0, MAT.mostarda, -3.6, 0.35, 6.5);
box(2.6, 0.6, 0.22, MAT.mostarda, -3.6, 0.75, 6.98);
box(0.22, 0.6, 1.0, MAT.mostarda, -4.85, 0.65, 6.5);
box(0.22, 0.6, 1.0, MAT.mostarda, -2.35, 0.65, 6.5);
box(3.4, 0.03, 2.2, new THREE.MeshStandardMaterial({ color: '#a8433a', roughness: 0.9 }), -2, 0.02, 4.6);
box(1.8, 2.2, 0.4, MAT.wood, 5.4, 1.1, 6.8);
for (let i = 0; i < 4; i++) box(1.6, 0.06, 0.36, MAT.terracota, 5.4, 0.35 + i * 0.55, 6.8);

/* ---------- CORREDOR ---------- */
const ZONE_HALL_WIDE = { x0: ZONE.sala.x0, x1: ZONE.sala.x1, z0: ZONE.corredor.z0, z1: ZONE.corredor.z1 };
floorSlab(ZONE_HALL_WIDE, MAT.wood);
sideWalls(ZONE_HALL_WIDE, MAT.ocre, 2.6);

/* ---------- VARANDA ---------- */
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
world.add(railGroup);
addCollider(ZONE.varanda.x0, ZONE.varanda.x1, ZONE.varanda.z0 - 0.3, ZONE.varanda.z0 + 0.1);

/* ============================================================
   CENÁRIO CARIOCA (mantido)
   ============================================================ */
const rioGroup = new THREE.Group();
world.add(rioGroup);
const bigGround = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: '#1d4a2e', roughness: 1 }));
bigGround.rotation.x = -Math.PI / 2; bigGround.position.y = -0.35; bigGround.receiveShadow = true;
rioGroup.add(bigGround);
const RUA_Z_CENTRO = -78, RUA_Z_METADE = 45;
const street = new THREE.Mesh(new THREE.PlaneGeometry(10, RUA_Z_METADE * 2), new THREE.MeshStandardMaterial({ color: '#6a6a6a', roughness: 0.95 }));
street.rotation.x = -Math.PI / 2; street.position.set(0, -0.28, RUA_Z_CENTRO); rioGroup.add(street);
const seagulls = [];
function seagull(x, y, z) {
  const g = new THREE.Group();
  const wing = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.06, 3), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const wing2 = wing.clone(); wing.position.x = -0.15; wing.rotation.z = 0.5; wing2.position.x = 0.15; wing2.rotation.z = -0.5; wing2.rotation.y = Math.PI;
  g.add(wing, wing2); g.position.set(x, y, z); rioGroup.add(g);
  seagulls.push({ mesh: g, radius: 8 + Math.random() * 10, speed: 0.15 + Math.random() * 0.1, phase: Math.random() * Math.PI * 2, baseY: y, cx: x, cz: z });
}
seagull(0, 14, -60); seagull(6, 16, -66);
rioGroup.userData.seagulls = seagulls;

/* ============================================================
   PERSONAGEM SPRITE SYSTEM - CORRIGIDO
   Baseado no seu GitHub: assets/sprites/tropical_idle.png etc
   ============================================================ */
const SPRITE_BASE = './assets/sprites/'; // <-- CORRIGIDO: seu print mostra flat aqui
const CHARACTER_TARGET_HEIGHT = 1.7;
const spriteCache = {};

function createPlaceholderTexture(label) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ff4da6'; ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText(label, 10, 30);
  ctx.fillText('PNG NAO ENCONTRADO', 10, 60);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function loadSpriteFile(costume, state) {
  // Arquivo real: tropical_idle.png, princess_walk1.png etc
  const fileName = `${costume}_${state}.png`;
  const key = fileName;
  if (spriteCache[key]) return spriteCache[key];
  const entry = { texture: null, aspect: 1, ready: false, pending: [], fileName };
  spriteCache[key] = entry;
  const url = SPRITE_BASE + fileName;
  console.log('[Sprite] carregando', url);
  spriteTextureLoader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      entry.texture = tex;
      entry.aspect = tex.image.width / tex.image.height;
      entry.ready = true;
      entry.pending.forEach(fn => fn());
      entry.pending.length = 0;
    },
    undefined,
    () => {
      console.warn(`[Sprite] Falhou ${url} - criando placeholder`);
      const fallback = createPlaceholderTexture(fileName);
      entry.texture = fallback;
      entry.aspect = 1;
      entry.ready = true;
      entry.pending.forEach(fn => fn());
      entry.pending.length = 0;
    }
  );
  return entry;
}

function applyFrameToSprite(group, entry) {
  const sprite = group.userData.sprite;
  if (!sprite || !entry.texture) return;
  sprite.material.map = entry.texture;
  sprite.material.needsUpdate = true;
  const h = CHARACTER_TARGET_HEIGHT;
  const w = h * entry.aspect;
  const facing = group.userData.facing || 1;
  sprite.scale.set(w * facing, h, 1);
  sprite.visible = true;
}

function setSpriteFrame(group, state) {
  if (!group) return;
  if (group.userData.currentState === state && group.userData.sprite?.visible) return;
  group.userData.currentState = state;
  const entry = loadSpriteFile(group.userData.costume, state);
  if (entry.ready) applyFrameToSprite(group, entry);
  else entry.pending.push(() => { if (group.userData.currentState === state) applyFrameToSprite(group, entry); });
}

function setSpriteFacing(group, facing) {
  if (!group) return;
  const newFacing = facing >= 0 ? 1 : -1;
  if (group.userData.facing === newFacing) return;
  group.userData.facing = newFacing;
  const sprite = group.userData.sprite;
  if (sprite) sprite.scale.x = Math.abs(sprite.scale.x) * newFacing;
}

function createSpriteCharacter(costume, states) {
  const group = new THREE.Group();
  const mat = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.02, color: 0xffffff, fog: true });
  const sprite = new THREE.Sprite(mat);
  sprite.center.set(0.5, 0.05); // pé no chão
  sprite.visible = false;
  sprite.renderOrder = 10;
  group.add(sprite);
  group.userData.sprite = sprite;
  group.userData.costume = costume;
  group.userData.currentState = null;
  group.userData.facing = 1;
  group.userData.lastInputX = 0;
  states.forEach(s => loadSpriteFile(costume, s));
  return group;
}

// Sofia - dois trajes
const sofiaTropical = createSpriteCharacter('tropical', ['idle', 'walk1', 'walk2', 'attack', 'shock']);
const sofiaPrincess = createSpriteCharacter('princess', ['idle', 'walk1', 'walk2', 'shock', 'celebrate']);
setSpriteFrame(sofiaTropical, 'idle');
setSpriteFrame(sofiaPrincess, 'idle');
sofiaPrincess.visible = false;

// NOVO: ELE como sprite também
const eleSprite = createSpriteCharacter('ele', ['idle', 'walk1', 'walk2', 'shock']);
// Se você ainda não tem os PNGs do ele, crie: ele_idle.png, ele_walk1.png, ele_walk2.png, ele_shock.png em assets/sprites/
setSpriteFrame(eleSprite, 'idle');

const playerMesh = new THREE.Group();
playerMesh.add(sofiaTropical);
playerMesh.add(sofiaPrincess);
playerMesh.position.set(0, 0, 4);
world.add(playerMesh);

const eleMesh = new THREE.Group();
eleMesh.add(eleSprite);
eleMesh.position.set(1.1, 0, -21.2);
world.add(eleMesh);

const blobShadow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.32 }));
blobShadow.rotation.x = -Math.PI / 2;
blobShadow.position.set(0, 0.02, 4);
world.add(blobShadow);
const eleShadow = blobShadow.clone(); eleShadow.scale.set(1.1,1.1,1.1); world.add(eleShadow);

/* ============================================================
   FLOWER POWER
   ============================================================ */
const flowerPowerGroup = new THREE.Group(); world.add(flowerPowerGroup);
function spawnFlowerPower(origin, direction) {
  for (let i = 0; i < 25; i++) {
    const petalMat = new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? '#ff7eb0' : (i % 3 === 1 ? '#E8C468' : '#2e7d4f'), side: THREE.DoubleSide });
    const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), petalMat);
    petal.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5));
    petal.lookAt(origin.clone().add(direction));
    petal.userData.vel = direction.clone().multiplyScalar(2.5 + Math.random() * 2.5).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5));
    petal.userData.life = 1.0; petal.userData.spin = (Math.random() - 0.5) * 10;
    flowerPowerGroup.add(petal);
  }
}
function updateFlowerPower(dt) {
  for (let i = flowerPowerGroup.children.length - 1; i >= 0; i--) {
    const p = flowerPowerGroup.children[i];
    p.position.add(p.userData.vel.clone().multiplyScalar(dt));
    p.userData.vel.y -= 1.5 * dt;
    p.rotation.z += p.userData.spin * dt;
    p.userData.life -= dt * 0.9;
    p.material.opacity = p.userData.life; p.material.transparent = true;
    if (p.userData.life <= 0) flowerPowerGroup.remove(p);
  }
}
const starGeo = new THREE.BufferGeometry();
const starCount = 260;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const ang = Math.random() * Math.PI * 2, radius = 90 + Math.random() * 60, height = 20 + Math.random() * 70;
  starPositions[i * 3] = Math.cos(ang) * radius; starPositions[i * 3 + 1] = height; starPositions[i * 3 + 2] = Math.sin(ang) * radius;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: '#fff6da', size: 0.9, transparent: true, opacity: 0, sizeAttenuation: true });
const starField = new THREE.Points(starGeo, starMat); world.add(starField);

const player = {
  pos: new THREE.Vector3(0, 0, 4),
  costume: 'tropical',
  animTimer: 0,
  moving: false,
  locked: false,
  speed: 3.2,
  currentMesh: sofiaTropical,
  moveDir: new THREE.Vector3(),
  lastInputX: 0,
  lastFacing: 1,
};
let flowerPowerCooldown = 0;

function triggerFlowerBurst() {
  if (player.locked || dialogueActive || flowerPowerCooldown > 0) return;
  flowerPowerCooldown = 0.7;
  setPlayerAction('attack', 650);
  toast('🌸 Rajada de flores!');
  const burstBtn = document.getElementById('flowerBtn');
  if (burstBtn) { burstBtn.classList.add('cooldown'); setTimeout(() => burstBtn.classList.remove('cooldown'), 700); }
  if (!state.vineCleared && player.pos.distanceTo(new THREE.Vector3(0, 0, -5.5)) < 4.2) {
    setTimeout(() => {
      vineGroup.children.forEach(c => c.visible = false);
      state.vineCleared = true;
      const idx = colliders.findIndex(c => c.minZ === -5.75);
      if (idx > -1) colliders.splice(idx, 1);
      setObjective('Explore o corredor e reúna a chave em forma de coração.');
    }, 500);
  }
}

function setPlayerAction(kind, duration) {
  const mesh = player.currentMesh; if (!mesh) return;
  player.locked = true;
  if (kind === 'attack') {
    setSpriteFrame(mesh, 'attack');
    const origin = playerMesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const dir = player.moveDir.length() > 0.1 ? player.moveDir.clone() : new THREE.Vector3(0, 0, -1);
    spawnFlowerPower(origin, dir);
  } else if (kind === 'shock') {
    setSpriteFrame(mesh, 'shock');
    playerMesh.scale.y = 0.9; playerMesh.position.y = -0.08;
  } else if (kind === 'celebrate') {
    setSpriteFrame(mesh, 'celebrate');
    playerMesh.position.y = 0.15;
  }
  clearTimeout(setPlayerAction._t);
  setPlayerAction._t = setTimeout(() => {
    player.locked = false;
    playerMesh.position.y = 0; playerMesh.scale.y = 1;
    setSpriteFrame(mesh, 'idle');
  }, duration);
}

/* ============================================================
   OBJETOS INTERATIVOS
   ============================================================ */
function floatBob(mesh, speed = 2, amp = 0.12) {
  mesh.userData._bobBase = mesh.position.y;
  mesh.userData._bobSpeed = speed; mesh.userData._bobAmp = amp;
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
world.add(vitrolaGroup);
box(1.0, 0.5, 0.65, MAT.wood, 5.3, 0.25, 3.4);

interactables.push({
  pos: new THREE.Vector3(5.3, 0, 3.4), radius: 1.6, id: 'vitrola',
  label: 'Tocar a vitrola', repeatable: true,
  onInteract: () => {
    toggleAmbientMusic();
    // Abre capa do vinil se tiver imagem
    if (PAINTING_SOURCES.vinilCapa) showImageOverlay(PAINTING_SOURCES.vinilCapa, "Vitrola - Soso House");
    toast(audioState.playing ? '🎵 Uma melodia familiar enche a sala de calor...' : 'A música parou.');
  },
});
interactables.push({
  pos: new THREE.Vector3(0, 0, 0), radius: 1.6, id: 'quadro',
  label: 'Ver a pintura', repeatable: true,
  onInteract: () => {
    // Mostra pintura grande clicável
    showImageOverlay(PAINTING_SOURCES.grande, "Pintura em progresso");
    showLines([{ falante: 'narrador', texto: 'Um projeto em andamento. Parece que alguém dedicou muitas noites nisso...' }]);
  },
});

box(1.2, 0.4, 0.7, MAT.wood, -1.6, 0.2, 3.2);
const key1Mesh = new THREE.Group();
const key1Ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), MAT.dourado);
const key1Stem = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.05), MAT.dourado);
key1Stem.position.y = -0.15; key1Mesh.add(key1Ring, key1Stem); key1Mesh.rotation.z = Math.PI / 2;
key1Mesh.position.set(-1.6, 0.55, 3.2); world.add(key1Mesh); floatBob(key1Mesh, 1.6, 0.06);
interactables.push({
  pos: new THREE.Vector3(-1.6, 0, 3.2), radius: 1.3, id: 'key1', label: 'Pegar a chave de latão',
  onInteract: () => {
    collectKey(0); key1Mesh.visible = false;
    showNote(CFG.bilheteChave1);
    setObjective('Vá até o corredor e use seu poder para afastar os cipós.');
  },
});

const vineGroup = new THREE.Group();
for (let i = 0; i < 26; i++) {
  const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), i % 2 ? MAT.leaf : MAT.leafDark);
  seg.position.set((Math.random() - 0.5) * 12.4, 0.7 + Math.random() * 1.6, -5.5 + (Math.random() - 0.5) * 0.4);
  seg.rotation.z = (Math.random() - 0.5) * 1.4; vineGroup.add(seg);
}
world.add(vineGroup);
addCollider(ZONE.sala.x0, ZONE.sala.x1, -5.75, -5.25);
interactables.push({
  pos: new THREE.Vector3(0, 0, -5.5), radius: 4.2, id: 'vinha', label: 'Usar o poder das flores [F ou 🌸]',
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
  art.position.z = 0.05; const g = new THREE.Group(); g.add(frameBox, art); g.position.set(x, 1.55, z); g.rotation.y = ry; world.add(g);
  memoryTriggers.push({
    pos: new THREE.Vector3(x > 0 ? x - 2 : x + 2, 0, z), radius: 2.4, seen: false, art,
    text: CFG.memorias[i],
    image: PAINTING_SOURCES.quadros[i]
  });
});

const key2Mesh = new THREE.Group();
const key2Head = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 10, 16, Math.PI * 1.4), MAT.dourado);
const key2Stem = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.05), MAT.dourado);
key2Stem.position.y = -0.15; key2Mesh.add(key2Head, key2Stem); key2Mesh.position.set(0, 0.9, -9.2);
world.add(key2Mesh); floatBob(key2Mesh, 1.8, 0.07);
interactables.push({
  pos: new THREE.Vector3(0, 0, -9.2), radius: 1.3, id: 'key2', label: 'Pegar a chave em forma de coração',
  onInteract: () => {
    collectKey(1); key2Mesh.visible = false;
    toast('💛 Uma chave em forma de coração. Falta uma porta para abrir...');
    setObjective('Vá até a grande porta de vidro no fim do corredor.');
  },
});

const glassDoorGroup = new THREE.Group();
const glassPane = new THREE.Mesh(new THREE.BoxGeometry(ZONE.sala.x1 - ZONE.sala.x0, 2.5, 0.08), MAT.vidro);
glassPane.position.set(0, 1.25, -9.9);
const glassFrame = new THREE.Mesh(new THREE.BoxGeometry(ZONE.sala.x1 - ZONE.sala.x0 + 0.15, 2.6, 0.12), new THREE.MeshStandardMaterial({ color: '#1B4D6B', roughness: 0.5 }));
glassFrame.position.set(0, 1.25, -9.9);
glassDoorGroup.add(glassFrame, glassPane); world.add(glassDoorGroup);
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
bow.position.y = 0.2; giftGroup.add(giftBase, ribbon1, ribbon2, bow);
giftGroup.position.set(0, 0.92, -19); world.add(giftGroup); floatBob(giftGroup, 1.2, 0.05);
interactables.push({
  pos: new THREE.Vector3(0, 0, -19), radius: 1.6, id: 'presente', label: 'Abrir o presente', enabled: false,
  onInteract: () => openGift(),
});
interactables.push({
  pos: new THREE.Vector3(1.1, 0, -21.2), radius: 2.3, id: 'ele', label: 'Falar com ele',
  onInteract: () => { if (!state.dialogueDone) startVarandaDialogue(); },
});

/* ============================================================
   STATE / UI
   ============================================================ */
const state = { keys: [false, false, false], vineCleared: false, transformed: false, dialogueDone: false, giftOpened: false, stage: 'sala' };
function collectKey(i) { state.keys[i] = true; const dot = $('keyDot' + i); if (dot) dot.classList.add('filled'); chime(); }
function setObjective(text) { const el = $('objectiveText'); if (el) el.textContent = text; }
setObjective('Explore a sala e encontre a chave de latão sobre a mesa.');
let toastTimer = null;
function toast(msg) {
  const t = $('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ============================================================
   DIALOGUE
   ============================================================ */
let dialogueQueue = [], dialogueActive = false, typeInterval = null;
function showLines(lines, onDone) {
  dialogueQueue = lines.slice(); dialogueActive = true; player.locked = true;
  const box = $('dialogueBox'); if (box) box.classList.add('show');
  nextLine(onDone);
}
function nextLine(onDone) {
  if (!dialogueQueue.length) {
    const box = $('dialogueBox'); if (box) box.classList.remove('show');
    dialogueActive = false; player.locked = false;
    if (onDone) onDone(); return;
  }
  const line = dialogueQueue.shift();
  const speakerLabel = line.falante === 'ele' ? CFG.nomeEle : (line.falante === 'ela' ? CFG.nomeEla : '');
  const nameEl = $('speakerName'); if (nameEl) { nameEl.textContent = speakerLabel; nameEl.style.opacity = speakerLabel ? 1 : 0; }
  const textEl = $('dialogueText'); if (!textEl) return; textEl.textContent = '';
  clearInterval(typeInterval);
  let i = 0;
  typeInterval = setInterval(() => {
    textEl.textContent = line.texto.slice(0, i + 1); i++;
    if (i >= line.texto.length) clearInterval(typeInterval);
  }, 22);
  showLines._advance = () => { clearInterval(typeInterval); textEl.textContent = line.texto; nextLine(onDone); };
}
function advanceDialogue() { if (dialogueActive && showLines._advance) showLines._advance(); }
const dlgBox = $('dialogueBox'); if (dlgBox) dlgBox.addEventListener('click', advanceDialogue);
function showNote(text) { player.locked = true; const nt = $('noteText'); if (nt) nt.textContent = text; const ov = $('noteOverlay'); if (ov) ov.classList.add('show'); }
const noteClose = $('noteCloseBtn'); if (noteClose) noteClose.addEventListener('click', () => { const ov = $('noteOverlay'); if (ov) ov.classList.remove('show'); player.locked = false; });

function showImageOverlay(src, title = "") {
  let overlay = document.getElementById('imageOverlay');
  if (!overlay) {
    overlay = document.createElement('div'); overlay.id = 'imageOverlay';
    overlay.innerHTML = `<div class="img-bg"></div><div class="img-content"><img id="imgOverlayPic"><p id="imgOverlayTitle"></p><button id="imgOverlayClose">Fechar ✕</button></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.img-bg').addEventListener('click', () => overlay.classList.remove('show'));
    document.getElementById('imgOverlayClose').addEventListener('click', () => overlay.classList.remove('show'));
  }
  document.getElementById('imgOverlayPic').src = src;
  document.getElementById('imgOverlayTitle').textContent = title;
  overlay.classList.add('show');
}

function startVarandaDialogue() {
  setPlayerAction('shock', 600);
  setSpriteFrame(eleSprite, 'shock');
  showLines(CFG.dialogoVaranda, () => {
    state.dialogueDone = true;
    setSpriteFrame(eleSprite, 'idle');
    const giftInteractable = interactables.find(i => i.id === 'presente');
    if (giftInteractable) giftInteractable.enabled = true;
    setObjective('Abra o presente sobre a mesa do mirante.');
    toast('✨ O presente na mesa começa a brilhar...');
  });
}
function openGift() {
  if (state.giftOpened) return;
  state.giftOpened = true;
  collectKey(2);
  setPlayerAction('celebrate', 1400);
  const gt = $('giftText'); if (gt) gt.innerHTML = CFG.mensagemPresente.map(p => `<p>${p}</p>`).join('');
  const go = $('giftOverlay'); if (go) go.classList.add('show');
  player.locked = true;
}
const giftCloseBtn = $('giftCloseBtn'); if (giftCloseBtn) giftCloseBtn.addEventListener('click', () => { const go = $('giftOverlay'); if (go) go.classList.remove('show'); playEnding(); });

function playTransformationCutscene() {
  state.transformed = true; player.locked = true;
  setObjective('✦ A magia acontece... ✦');
  const fade = $('fadeOverlay'); if (fade) fade.classList.add('show'); chime();
  setTimeout(() => {
    player.costume = 'princess';
    sofiaTropical.visible = false; sofiaPrincess.visible = true;
    player.currentMesh = sofiaPrincess;
    glassDoorGroup.visible = false;
    const idx = colliders.findIndex(c => c.minZ === -10.05); if (idx > -1) colliders.splice(idx, 1);
    player.pos.z = -10.6; tweenSky(2600);
  }, 900);
  setTimeout(() => { const f = $('fadeOverlay'); if (f) f.classList.remove('show'); }, 1500);
  setTimeout(() => { player.locked = false; setObjective('Siga até o mirante e encontre quem te espera.'); }, 1700);
}
function tweenSky(duration) {
  const startTime = performance.now(); const startCol = scene.background.clone();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    scene.background.copy(startCol).lerp(skyDusk, t); scene.fog.color.copy(scene.background);
    sun.intensity = THREE.MathUtils.lerp(1.15, 0.55, t);
    sun.color.copy(new THREE.Color('#ffb852').lerp(new THREE.Color('#c97bd6'), t * 0.6));
    hemi.intensity = THREE.MathUtils.lerp(0.65, 0.35, t); starMat.opacity = t * 0.9;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function playEnding() {
  player.locked = true;
  const et = $('endingTitle'); if (et) et.textContent = CFG.textoFinal;
  const es1 = $('endingSub1'); if (es1) es1.textContent = CFG.textoFinal2.split(' para')[0];
  const es2 = $('endingSub2'); if (es2) es2.textContent = 'para' + CFG.textoFinal2.split(' para')[1];
  const etbc = $('endingTbc'); if (etbc) etbc.textContent = CFG.textoFinal3;
  const startDist = controls.getDistance(); const t0 = performance.now();
  function pull(now) {
    const t = Math.min(1, (now - t0) / 3200); const ease = 1 - Math.pow(1 - t, 3);
    controls.minDistance = controls.maxDistance = THREE.MathUtils.lerp(startDist, startDist + 22, ease);
    controls.maxPolarAngle = controls.minPolarAngle = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(55), THREE.MathUtils.degToRad(28), ease);
    controls.update();
    if (t < 1) requestAnimationFrame(pull); else setTimeout(() => { const es = $('endingScreen'); if (es) es.classList.add('show'); }, 600);
  }
  requestAnimationFrame(pull);
}
const replayBtn = $('replayBtn'); if (replayBtn) replayBtn.addEventListener('click', () => location.reload());

function checkMemories() {
  memoryTriggers.forEach(m => {
    if (m.seen) return;
    if (player.pos.distanceTo(new THREE.Vector3(m.pos.x, 0, m.pos.z)) < m.radius) {
      m.seen = true;
      if (m.art) { m.art.material.emissive = new THREE.Color('#886622'); m.art.material.emissiveIntensity = 0.6; }
      toast('💭 ' + m.text);
      if (m.image) setTimeout(() => showImageOverlay(m.image, m.text), 400);
    }
  });
}

/* ============================================================
   INPUT - CORRIGIDO: facings sem jitter
   ============================================================ */
const keysDown = {};
window.addEventListener('keydown', (e) => {
  keysDown[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e' || e.key === ' ') { e.preventDefault(); tryInteract(); }
  else if (e.key.toLowerCase() === 'f') { e.preventDefault(); triggerFlowerBurst(); }
  else if (dialogueActive && e.key === 'Enter') advanceDialogue();
});
window.addEventListener('keyup', (e) => { keysDown[e.key.toLowerCase()] = false; });

let joyVec = { x: 0, y: 0, active: false };
(function setupJoystick() {
  const zone = $('joystickZone'), thumb = $('joystickThumb');
  if (!zone || !thumb) return;
  let startX = 0, startY = 0; const maxR = 46;
  function handleMove(clientX, clientY) {
    const dx = clientX - startX, dy = clientY - startY;
    const dist = Math.min(maxR, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    const tx = Math.cos(ang) * dist, ty = Math.sin(ang) * dist;
    thumb.style.left = (50 + tx) + 'px'; thumb.style.top = (50 + ty) + 'px';
    joyVec.x = tx / maxR; joyVec.y = ty / maxR;
    // deadzone
    if (Math.hypot(joyVec.x, joyVec.y) < 0.18) { joyVec.x = 0; joyVec.y = 0; }
  }
  zone.addEventListener('touchstart', (e) => {
    joyVec.active = true; const t = e.touches[0]; startX = t.clientX; startY = t.clientY;
    controls.enabled = false; // desativa orbit enquanto usa joystick
    e.preventDefault();
  }, { passive: false });
  zone.addEventListener('touchmove', (e) => {
    if (!joyVec.active) return; handleMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault();
  }, { passive: false });
  const end = () => {
    joyVec.active = false; joyVec.x = 0; joyVec.y = 0;
    thumb.style.left = '50px'; thumb.style.top = '50px';
    controls.enabled = true;
  };
  zone.addEventListener('touchend', end); zone.addEventListener('touchcancel', end);
})();
const actionBtn = $('actionBtn'); if (actionBtn) actionBtn.addEventListener('click', () => tryInteract());

let nearestInteractable = null;
function tryInteract() {
  if (dialogueActive) { advanceDialogue(); return; }
  if (nearestInteractable && !player.locked) nearestInteractable.onInteract();
}

/* ============================================================
   MOVEMENT / COLLISION - FACING CORRIGIDO
   ============================================================ */
const moveDir = new THREE.Vector3();
const camForward = new THREE.Vector3();
const camRight = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WALK_FRAME_TIME = 0.18;

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
  for (const c of colliders) { if (x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ) return true; }
  return false;
}
function updatePlayer(dt) {
  const { ix, iy } = computeInput();
  player.moving = false;

  if (!player.locked && (ix !== 0 || iy !== 0)) {
    camera.getWorldDirection(camForward); camForward.y = 0;
    if (camForward.lengthSq() < 1e-6) camForward.set(0, 0, -1); else camForward.normalize();
    camRight.crossVectors(camForward, WORLD_UP).normalize();
    moveDir.set(0, 0, 0).addScaledVector(camRight, ix).addScaledVector(camForward, -iy).normalize();
    player.moveDir.copy(moveDir);
    const nx = player.pos.x + moveDir.x * player.speed * dt;
    const nz = player.pos.z + moveDir.z * player.speed * dt;
    if (!collidesAt(nx, player.pos.z)) player.pos.x = nx;
    if (!collidesAt(player.pos.x, nz)) player.pos.z = nz;
    player.moving = true;

    // CORREÇÃO PRINCIPAL DO BUG DE FLIP: usa input X direto, não dot product com camera
    // Só flipa quando o input lateral é forte (>0.35) e com histerese
    if (Math.abs(ix) > 0.35) {
      const desiredFacing = ix > 0 ? 1 : -1;
      // só troca se for diferente e se o input se manteve por um tempo (evita tremida)
      if (desiredFacing !== player.lastFacing) {
        player.lastFacing = desiredFacing;
        setSpriteFacing(player.currentMesh, desiredFacing);
      }
    }
    // guarda ultimo input para idle não flipar
    player.lastInputX = ix;
  }

  playerMesh.position.set(player.pos.x, 0, player.pos.z);
  blobShadow.position.set(player.pos.x, 0.02, player.pos.z);
  eleShadow.position.set(eleMesh.position.x, 0.02, eleMesh.position.z);
  eleMesh.lookAt(camera.position.x, eleMesh.position.y, camera.position.z); // billboard suave do ele

  if (!player.locked) {
    if (player.moving) {
      player.animTimer += dt;
      const frame = Math.floor(player.animTimer / WALK_FRAME_TIME) % 2 === 0 ? 'walk1' : 'walk2';
      setSpriteFrame(player.currentMesh, frame);
      // anima ele se ele estiver perto? parado por enquanto
    } else {
      player.animTimer = 0;
      setSpriteFrame(player.currentMesh, 'idle');
    }
  }

  controls.target.lerp(new THREE.Vector3(player.pos.x, 1.1, player.pos.z), 0.08);
  checkMemories();
  let best = null, bestD = Infinity;
  interactables.forEach(it => {
    if (it.enabled === false) return;
    const d = Math.hypot(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
    if (d < it.radius && d < bestD) { bestD = d; best = it; }
  });
  nearestInteractable = best;
  const promptEl = $('interactPrompt');
  if (promptEl) {
    if (best && !player.locked) {
      const lbl = $('interactLabel'); if (lbl) lbl.textContent = best.label;
      promptEl.classList.add('show');
    } else promptEl.classList.remove('show');
  }
}
function updateBobbers(t) {
  bobbers.forEach(m => { if (!m.visible) return; m.position.y = m.userData._bobBase + Math.sin(t * m.userData._bobSpeed) * m.userData._bobAmp; });
}

/* ============================================================
   AUDIO - COM SUPORTE A ARQUIVO MP3 E DRIVE
   ============================================================ */
const audioState = { ctx: null, playing: false, muted: false, master: null, htmlAudio: null, vitrolaAudio: null };
function ensureAudio() {
  if (audioState.ctx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioState.ctx = new Ctx();
  audioState.master = audioState.ctx.createGain();
  audioState.master.gain.value = audioState.muted ? 0 : 0.5;
  audioState.master.connect(audioState.ctx.destination);
  // HTML audio para mp3s reais
  audioState.htmlAudio = new Audio(AUDIO_SOURCES.ambient);
  audioState.htmlAudio.loop = true; audioState.htmlAudio.volume = 0.55;
  audioState.vitrolaAudio = new Audio(AUDIO_SOURCES.vitrola);
  audioState.vitrolaAudio.loop = true; audioState.vitrolaAudio.volume = 0.7;
}
function chime() {
  ensureAudio();
  // tenta tocar mp3 de chime se existir, senão sintetiza
  if (AUDIO_SOURCES.chime && AUDIO_SOURCES.chime.endsWith('.mp3')) {
    const a = new Audio(AUDIO_SOURCES.chime); a.volume = 0.8; a.play().catch(() => synthChime());
  } else synthChime();
}
function synthChime() {
  const ctx = audioState.ctx; const t0 = ctx.currentTime;
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
  // Se tiver mp3 configurado, usa ele
  const hasMp3 = AUDIO_SOURCES.ambient && AUDIO_SOURCES.ambient.includes('.mp3');
  if (hasMp3) {
    if (audioState.playing) { audioState.htmlAudio.pause(); audioState.vitrolaAudio.pause(); audioState.playing = false; return; }
    audioState.htmlAudio.play().catch(() => {}); audioState.playing = true; return;
  }
  // fallback sintetizado
  const ctx = audioState.ctx;
  if (audioState.playing) { ambientNodes.forEach(n => { try { n.stop(); } catch {} }); ambientNodes = []; audioState.playing = false; return; }
  audioState.playing = true;
  const notes = [261.6, 329.6, 392.0, 440.0, 523.3, 392.0, 329.6, 293.7]; const noteLen = 0.85;
  const bassGain = ctx.createGain(); bassGain.gain.value = 0.09; bassGain.connect(audioState.master);
  let step = 0;
  function scheduleLoop() {
    if (!audioState.playing) return; const t = ctx.currentTime + 0.05;
    const bass = ctx.createOscillator(); bass.type = 'sine'; bass.frequency.value = notes[step % notes.length] / 2;
    const bg = ctx.createGain(); bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.5, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.001, t + noteLen);
    bass.connect(bg); bg.connect(bassGain); bass.start(t); bass.stop(t + noteLen + 0.1); ambientNodes.push(bass); step++; setTimeout(scheduleLoop, noteLen * 1000);
  }
  scheduleLoop();
}
const soundToggle = $('soundToggle');
if (soundToggle) soundToggle.addEventListener('click', () => {
  ensureAudio();
  audioState.muted = !audioState.muted;
  if (audioState.master) audioState.master.gain.value = audioState.muted ? 0 : 0.5;
  if (audioState.htmlAudio) audioState.htmlAudio.volume = audioState.muted ? 0 : 0.55;
  soundToggle.textContent = audioState.muted ? '🔇' : '🔈';
});

/* ============================================================
   CONTROLES ADAPTATIVOS - PC vs MOBILE TOTALMENTE SEPARADO
   ============================================================ */
(function setupAdaptiveControls() {
  const style = document.createElement('style');
  style.textContent = `
    /* GERAL */
    #interactPrompt { transition: transform .2s, opacity .2s; }
    #dialogueBox { max-width: 720px; margin: 0 auto; left: 0; right: 0; bottom: 18px; top: auto; width: calc(100% - 32px); border-radius: 18px; padding: 14px 18px; box-shadow: 0 10px 30px rgba(0,0,0,.35); line-height: 1.4; }
    #dialogueText { font-size: 15px; line-height: 1.45; }
    #toast { top: 16px; bottom: auto; left: 50%; transform: translateX(-50%); max-width: 86vw; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    /* MOBILE ONLY */
    body.is-touch #joystickZone { position: fixed; left: 14px; bottom: 14px; width: 110px; height: 110px; border-radius: 50%; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.25); z-index: 40; touch-action: none; backdrop-filter: blur(4px); }
    body.is-touch #joystickThumb { position: absolute; left: 50px; top: 50px; width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.85); box-shadow: 0 2px 8px rgba(0,0,0,.3); transform: translate(-50%,-50%); }
    #mcActionButtons { position: fixed; right: 14px; bottom: 14px; display: flex; flex-direction: column; gap: 14px; z-index: 45; }
    .mc-btn { width: 64px; height: 64px; border-radius: 18px; border: 2px solid rgba(255,255,255,0.7); background: linear-gradient(180deg, rgba(60,50,45,0.55), rgba(20,16,14,0.7)); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; user-select: none; box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3); }
    .mc-btn:active { transform: scale(0.94); }
    .mc-btn--flower { border-color: #ff9ec7; background: linear-gradient(180deg, rgba(255,120,180,0.45), rgba(120,30,60,0.7)); }
    .mc-btn.cooldown { opacity: 0.45; pointer-events: none; filter: grayscale(0.5); }
    #mcInteractBtn { border-color: #8be9ff; }
    body.is-touch #dialogueBox { bottom: 135px; width: calc(100% - 24px); max-height: 28vh; overflow-y: auto; background: rgba(20,14,10,0.82); backdrop-filter: blur(8px); }
    body.is-touch #interactPrompt { bottom: 148px; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); padding: 8px 14px; border-radius: 12px; font-size: 13px; }
    body.is-touch #objectiveText, body.is-touch #keyDots { font-size: 12px; }
    /* PC ONLY */
    body.is-pc #mcActionButtons { display: none !important; }
    body.is-pc #joystickZone { display: none !important; }
    body.is-touch #pcHint { display: none !important; }
    body.is-pc #pcHint { position: fixed; left: 18px; bottom: 18px; z-index: 40; font: 12px/1.4 system-ui, sans-serif; color: #fff; background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 8px; }
    /* Image overlay */
    #imageOverlay { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; }
    #imageOverlay.show { display: flex; }
    #imageOverlay .img-bg { position: absolute; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(6px); }
    #imageOverlay .img-content { position: relative; max-width: 90vw; max-height: 85vh; background: #f4ede0; border-radius: 16px; padding: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.5); display: flex; flex-direction: column; gap: 10px; }
    #imageOverlay img { max-width: 86vw; max-height: 68vh; object-fit: contain; border-radius: 10px; }
    #imageOverlay p { font: 600 14px system-ui; color: #3a2a1a; text-align: center; margin: 0; }
    #imageOverlay button { align-self: center; padding: 8px 16px; border-radius: 10px; border: 0; background: #1B4D6B; color: #fff; font-weight: 600; }
  `;
  document.head.appendChild(style);

  if (isTouch) {
    const legacyPrompt = $('interactPrompt'); if (legacyPrompt) legacyPrompt.classList.add('mobile-mode');
    let wrap = document.getElementById('mcActionButtons');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.id = 'mcActionButtons';
      wrap.innerHTML = `
        <div class="mc-btn mc-btn--flower" id="flowerBtn" aria-label="Rajada de flores">🌸</div>
        <div class="mc-btn" id="mcInteractBtn" aria-label="Interagir">✋</div>
      `;
      document.body.appendChild(wrap);
    }
    const flowerBtn = document.getElementById('flowerBtn');
    const interBtn = document.getElementById('mcInteractBtn');
    const fireFlower = (e) => { e.preventDefault(); triggerFlowerBurst(); };
    const fireInteract = (e) => { e.preventDefault(); tryInteract(); };
    flowerBtn.addEventListener('touchstart', fireFlower, { passive: false });
    flowerBtn.addEventListener('click', fireFlower);
    interBtn.addEventListener('touchstart', fireInteract, { passive: false });
    interBtn.addEventListener('click', fireInteract);
    const oldActionBtn = $('actionBtn'); if (oldActionBtn) oldActionBtn.style.display = 'none';
  } else {
    const hint = document.createElement('div'); hint.id = 'pcHint';
    hint.textContent = 'WASD / setas: mover • E ou espaço: interagir • F: rajada de flores • Mouse: girar câmera';
    document.body.appendChild(hint);
  }
})();

/* ============================================================
   TITLE / LOADING
   ============================================================ */
loadingManager.onProgress = (u, loaded, total) => { const el = $('loadbarFill'); if (el) el.style.width = (loaded / total * 100) + '%'; };
loadingManager.onLoad = () => {
  const l = $('loading'); if (l) l.classList.add('hidden');
  const ts = $('titleScreen'); if (ts) ts.classList.remove('hidden');
};
setTimeout(() => {
  const loadEl = $('loading'); const titleEl = $('titleScreen');
  if (loadEl && !loadEl.classList.contains('hidden')) {
    loadEl.classList.add('hidden'); if (titleEl) titleEl.classList.remove('hidden');
  }
  const bar = $('loadbarFill'); if (bar) bar.style.width = '100%';
}, 2200);

const startBtn = $('startBtn');
if (startBtn) startBtn.addEventListener('click', () => {
  const ts = $('titleScreen'); if (ts) ts.classList.add('hidden');
  ensureAudio();
});
const howToBtnEl = $('howToBtn');
if (howToBtnEl) {
  howToBtnEl.addEventListener('click', () => {
    toast(isTouch ? '👆 Use o manete pra andar. ✋ interagir • 🌸 rajada de flores' : '⌨ WASD mover • E interagir • F flores • Mouse câmera');
  });
}

/* ============================================================
   MAIN LOOP
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
  if (rioGroup && rioGroup.userData.seagulls) {
    rioGroup.userData.seagulls.forEach(s => {
      const ang = t * s.speed + s.phase;
      s.mesh.position.set(s.cx + Math.cos(ang) * s.radius, s.baseY + Math.sin(t * 0.8 + s.phase) * 0.6, s.cz + Math.sin(ang) * s.radius);
      s.mesh.rotation.y = -ang - Math.PI / 2;
    });
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
