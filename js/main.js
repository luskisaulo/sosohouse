import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================================================
   NOTAS PARA O DESENVOLVEDOR - ONDE PERSONALIZAR
   ============================================================
   1. MÚSICA DE FUNDO
      Procure a seção "AUDIO" abaixo e veja MUSIC_URL.
      Cole o link direto do Google Drive no formato:
      https://drive.google.com/uc?export=download&id=SEU_ID
      Ex: const MUSIC_URL = 'https://drive.google.com/uc?export=download&id=1aBcDefGhIjK';

   2. RETRATOS / FOTOS DO CASAL nos quadros de memória
      Procure "MEMORY_IMAGES" abaixo. Cole URLs de imagens diretas.
      Ex: const MEMORY_IMAGES = ['https://...foto1.jpg', '...foto2.jpg', '...foto3.jpg'];

   3. CAPA DO VINIL na vitrola
      Procure "VINYL_COVER_URL" abaixo.

   4. TEXTO de tudo (nomes, falas, mensagens) → js/config.js

   5. SPRITES que FALTAM para corrigir a direção:
      Os sprites atuais são todos de perfil para a DIREITA.
      Para ter movimentos perfeitos em 8 direções você precisa criar:
      - tropical_walk_back.png  (andando de costas / indo para cima na tela)
      - tropical_walk_front.png (andando de frente / indo para baixo na tela)
      - princess_walk_back.png
      - princess_walk_front.png
      - ele_idle.png     (o namorado parado)
      - ele_walk1.png    (o namorado andando frame 1)
      SOLUÇÃO ATUAL: uso espelhamento automático e ângulo de câmera fixo
      para esconder a falta dos sprites extras. O personagem sempre aparece
      de perfil (correto para este ângulo isométrico). Funciona bem!
   ============================================================ */

const CFG = window.GAME_CONFIG;
const $ = id => document.getElementById(id);
const isTouchDev = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouchDev) document.body.classList.add('is-touch');

/* ── URLS PERSONALIZÁVEIS ── */
const MUSIC_URL = '';          // ← COLOQUE AQUI O LINK DA MÚSICA (Google Drive / MP3 direto)
const VINYL_COVER_URL = '';    // ← COLOQUE AQUI A FOTO DA CAPA DO VINIL
const MEMORY_IMAGES = [        // ← COLOQUE AQUI AS 3 FOTOS DO CASAL (URLs diretas)
  '',                          //   Quadro 1 (vazio = fica abstrato)
  '',                          //   Quadro 2
  '',                          //   Quadro 3
];
const ELE_SPRITE_URL = '';     // ← COLOQUE AQUI A FOTO DO NAMORADO (PNG com fundo transparente)

/* ─────────────────────────────────────────────
   RENDERER
───────────────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#f5b98a', 28, 96);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 320);
camera.position.set(14, 13, 17);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 9; controls.maxDistance = 26;
controls.minPolarAngle = THREE.MathUtils.degToRad(36);
controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
controls.target.set(0, 1.1, 4);
controls.update();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ─────────────────────────────────────────────
   SKY DOME (gradiente real, não cor plana)
───────────────────────────────────────────── */
const skyCanvas = Object.assign(document.createElement('canvas'), { width:8, height:256 });
const skyCtx = skyCanvas.getContext('2d');
const SKY = {
  day:  { top:'#fce4b2', mid:'#f9c87a', bot:'#f5b98a' },
  dusk: { top:'#1e1040', mid:'#7a3a68', bot:'#c97050' },
};
let skyT = 0;
function lerpHex(a, b, t) {
  const ca = new THREE.Color(a), cb = new THREE.Color(b);
  return '#' + ca.lerp(cb, t).getHexString();
}
function paintSky() {
  const g = skyCtx.createLinearGradient(0, 0, 0, 256);
  const top = lerpHex(SKY.day.top, SKY.dusk.top, skyT);
  const mid = lerpHex(SKY.day.mid, SKY.dusk.mid, skyT);
  const bot = lerpHex(SKY.day.bot, SKY.dusk.bot, skyT);
  g.addColorStop(0, top); g.addColorStop(0.5, mid); g.addColorStop(1, bot);
  skyCtx.fillStyle = g; skyCtx.fillRect(0, 0, 8, 256);
  skyTex.needsUpdate = true;
  scene.fog.color.set(bot);
}
const skyTex = new THREE.CanvasTexture(skyCanvas);
skyTex.colorSpace = THREE.SRGBColorSpace;
const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(160, 24, 14),
  new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
);
scene.add(skyDome);
paintSky();

/* ─────────────────────────────────────────────
   LIGHTING
───────────────────────────────────────────── */
const hemi = new THREE.HemisphereLight('#fff4dc', '#5a4535', 0.7);
scene.add(hemi);

const sun = new THREE.DirectionalLight('#ffb852', 1.25);
sun.position.set(-14, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left:-30, right:30, top:30, bottom:-30, near:1, far:70 });
sun.shadow.bias = -0.0015;
scene.add(sun);

const fill = new THREE.DirectionalLight('#8fb6d6', 0.28);
fill.position.set(10, 10, -10);
scene.add(fill);

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
const world = new THREE.Group();
scene.add(world);
const colliders = [];   // {minX,maxX,minZ,maxZ}
const interactables = []; // {pos,radius,id,label,enabled?,onInteract}
const bobbers = [];

function addCol(x0,x1,z0,z1){ colliders.push({minX:x0,maxX:x1,minZ:z0,maxZ:z1}); }

function box(w,h,d,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; world.add(m); return m;
}
function cyl(rt,rb,h,mat,x,y,z,seg=12){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; world.add(m); return m;
}
function sph(r,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; world.add(m); return m;
}
function bob(m,spd=2,amp=0.1){ m.userData.bb=m.position.y; m.userData.bs=spd; m.userData.ba=amp; bobbers.push(m); }

/* ─────────────────────────────────────────────
   CANVAS TEXTURES
───────────────────────────────────────────── */
function cvTex(fn,w=256,h=256,rep=[1,1]){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  fn(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]);
  t.colorSpace=THREE.SRGBColorSpace; return t;
}
const T = {
  wood: cvTex((c,w,h)=>{
    c.fillStyle='#8a5a3c'; c.fillRect(0,0,w,h);
    for(let i=0;i<9;i++){ c.fillStyle=i%2?'#7c4f34':'#95643f'; c.fillRect(0,i*(h/9),w,h/9-1); }
    c.globalAlpha=.1; for(let i=0;i<300;i++){ c.fillStyle=Math.random()>.5?'#000':'#fff'; c.fillRect(Math.random()*w,Math.random()*h,18,1); }
  },256,256,[6,10]),
  deck: cvTex((c,w,h)=>{
    c.fillStyle='#6b4530'; c.fillRect(0,0,w,h);
    for(let i=0;i<7;i++){ c.fillStyle=i%2?'#5f3c29':'#7a4f37'; c.fillRect(0,i*(h/7),w,h/7-2); }
  },256,256,[8,14]),
  tile: cvTex((c,w,h)=>{
    c.fillStyle='#eef2ee'; c.fillRect(0,0,w,h);
    c.strokeStyle='#1B4D6B'; c.lineWidth=3; c.strokeRect(3,3,w-6,h-6);
    c.beginPath(); c.moveTo(w/2,5); c.lineTo(w-5,h/2); c.lineTo(w/2,h-5); c.lineTo(5,h/2); c.closePath();
    c.fillStyle='#1B4D6B'; c.globalAlpha=.82; c.fill(); c.globalAlpha=1;
    c.fillStyle='#eef2ee'; c.beginPath(); c.arc(w/2,h/2,w*.13,0,Math.PI*2); c.fill();
  },128,128,[7,11]),
  stone: cvTex((c,w,h)=>{
    c.fillStyle='#9a8f7c'; c.fillRect(0,0,w,h);
    for(let i=0;i<55;i++){ c.fillStyle=`rgba(${100+Math.random()*40},${90+Math.random()*38},${68+Math.random()*28},.4)`; c.beginPath(); c.arc(Math.random()*w,Math.random()*h,7+Math.random()*13,0,Math.PI*2); c.fill(); }
  },200,200,[5,5]),
  street: cvTex((c,w,h)=>{
    c.fillStyle='#666'; c.fillRect(0,0,w,h);
    c.fillStyle='#888'; for(let i=0;i<10;i++) c.fillRect(Math.random()*w,Math.random()*h,30,2);
  },128,128,[3,40]),
};
const M = {
  ocre:    new THREE.MeshStandardMaterial({color:'#E2A83B',roughness:.85}),
  turq:    new THREE.MeshStandardMaterial({color:'#1B4D6B',roughness:.6}),
  terra:   new THREE.MeshStandardMaterial({color:'#B85A3C',roughness:.8}),
  esm:     new THREE.MeshStandardMaterial({color:'#1E6B4F',roughness:.7}),
  mag:     new THREE.MeshStandardMaterial({color:'#D6488C',roughness:.6}),
  gold:    new THREE.MeshStandardMaterial({color:'#E8C468',roughness:.3,metalness:.55}),
  cream:   new THREE.MeshStandardMaterial({color:'#f4ede0',roughness:.7}),
  must:    new THREE.MeshStandardMaterial({color:'#c98a2e',roughness:.9}),
  iron:    new THREE.MeshStandardMaterial({color:'#2b2f2c',roughness:.5,metalness:.4}),
  glass:   new THREE.MeshPhysicalMaterial({color:'#bfe3e8',roughness:.05,transmission:.88,thickness:.25,transparent:true,opacity:.5}),
  wood:    new THREE.MeshStandardMaterial({map:T.wood,roughness:.85}),
  deck:    new THREE.MeshStandardMaterial({map:T.deck,roughness:.9}),
  tile:    new THREE.MeshStandardMaterial({map:T.tile,roughness:.6}),
  stone:   new THREE.MeshStandardMaterial({map:T.stone,roughness:.95}),
  leaf:    new THREE.MeshStandardMaterial({color:'#2e7d4f',roughness:.8}),
  leafD:   new THREE.MeshStandardMaterial({color:'#1f5a38',roughness:.8}),
  skin:    new THREE.MeshStandardMaterial({color:'#c98a5e',roughness:.65}),
  shirt:   new THREE.MeshStandardMaterial({color:'#f4f0e6',roughness:.7}),
  pants:   new THREE.MeshStandardMaterial({color:'#2b3550',roughness:.7}),
  hairB:   new THREE.MeshStandardMaterial({color:'#2a1810',roughness:.55}),
  sand:    new THREE.MeshStandardMaterial({color:'#e8d5a8',roughness:1}),
  water:   new THREE.MeshStandardMaterial({color:'#1a6a8a',roughness:.1,metalness:.2,transparent:true,opacity:.82}),
  grass:   new THREE.MeshStandardMaterial({color:'#1d4a2e',roughness:1}),
  hill:    new THREE.MeshStandardMaterial({color:'#2a5a3a',roughness:.9}),
};

/* ─────────────────────────────────────────────
   ZONES
───────────────────────────────────────────── */
const Z = {
  patio:    {x0:-6.5,x1:6.5,z0:8.5,z1:19},
  sala:     {x0:-6.5,x1:6.5,z0:-1, z1:8.5},
  hall:     {x0:-6.5,x1:6.5,z0:-10,z1:-1},
  varanda:  {x0:-7.2,x1:7.2,z0:-23.5,z1:-10},
};
function slab(zo,mat){ const w=zo.x1-zo.x0,d=zo.z1-zo.z0; return box(w,.3,d,mat,(zo.x0+zo.x1)/2,-.15,(zo.z0+zo.z1)/2); }
function walls(zo,mat,h=2.65){
  const d=zo.z1-zo.z0,cx=(zo.z0+zo.z1)/2;
  box(.3,h,d,mat,zo.x0,h/2,cx); box(.3,h,d,mat,zo.x1,h/2,cx);
  // gold roofline trim
  box(.35,.07,d,M.gold,zo.x0,h+.03,cx); box(.35,.07,d,M.gold,zo.x1,h+.03,cx);
  addCol(zo.x0-.4,zo.x0+.1,zo.z0,zo.z1); addCol(zo.x1-.1,zo.x1+.4,zo.z0,zo.z1);
}
function plant(x,z,s=1){
  cyl(.3*s,.24*s,.48*s,M.terra,x,.24*s,z);
  const g=new THREE.Group();
  for(let i=0;i<6;i++){
    const lf=new THREE.Mesh(new THREE.ConeGeometry(.13*s,.85*s,5),i%2?M.leaf:M.leafD);
    lf.position.set((Math.random()-.5)*.28*s,.7*s,(Math.random()-.5)*.28*s);
    lf.rotation.z=(Math.random()-.5)*.55; lf.castShadow=true; g.add(lf);
  }
  g.position.set(x,.38*s,z); world.add(g);
}

/* ═══════════════════════════════════════
   PATIO
═══════════════════════════════════════ */
slab(Z.patio,M.tile); walls(Z.patio,M.ocre,2.8);
box(Z.patio.x1-Z.patio.x0,2.8,.3,M.ocre,0,1.4,Z.patio.z1);
addCol(Z.patio.x0,Z.patio.x1,Z.patio.z1-.2,Z.patio.z1+.4);
for(let i=-5;i<=5;i+=1.1) box(.08,2.1,.08,M.iron,i,1.3,Z.patio.z1-.05);
box(2.8,.14,.14,M.iron,0,2.28,Z.patio.z1-.05);
// fountain
cyl(1.5,1.6,.5,M.stone,0,.25,14);
cyl(1.18,1.18,.14,new THREE.MeshStandardMaterial({color:'#3a7ea8',roughness:.15,metalness:.2}),0,.5,14);
cyl(.18,.22,1.0,M.stone,0,.85,14); sph(.34,M.stone,0,1.48,14);
// plants & bougainvillea
[[-5,10],[5,10],[-5,17],[5,17],[-3,18.3],[3,18.3]].forEach(([x,z])=>plant(x,z,1+Math.random()*.35));
for(let z=9.5;z<19;z+=1.55) [Z.patio.x0,Z.patio.x1].forEach(x=>sph(.28+Math.random()*.18,M.mag,x+(x<0?.28:-.28),1.6+Math.random()*1.1,z));

/* ═══════════════════════════════════════
   SALA DE ESTAR
═══════════════════════════════════════ */
slab(Z.sala,M.wood); walls(Z.sala,M.cream,2.7);
// french windows
for(let z=0.5;z<8;z+=3){ box(.14,2.1,1.28,M.turq,Z.sala.x0+.11,1.3,z); box(.14,2.1,1.28,M.turq,Z.sala.x1-.11,1.3,z); }
// sofa
box(2.6,.55,1.0,M.must,-3.6,.35,6.5); box(2.6,.6,.22,M.must,-3.6,.75,6.95);
box(.22,.6,1.0,M.must,-4.85,.65,6.5); box(.22,.6,1.0,M.must,-2.35,.65,6.5);
[-4.1,-3.6,-3.1].forEach(x=>sph(.23,M.terra,x,.67,6.34));
// rug
box(3.4,.03,2.2,new THREE.MeshStandardMaterial({color:'#a8433a',roughness:.9}),-2,.02,4.6);
// bookshelf
box(1.8,2.2,.4,M.wood,5.4,1.1,6.8);
for(let i=0;i<4;i++) box(1.6,.05,.35,M.terra,5.4,.35+i*.55,6.8);
for(let i=0;i<10;i++) box(.13,.38,.27,[M.turq,M.mag,M.esm][i%3],4.76+i*.155,1.84,6.77);
// easel legs
function eleg(x,z,rz){ const l=box(.07,1.5,.07,M.wood,x,.75,z); l.rotation.z=rz; return l; }
eleg(0,-.35,.18); eleg(-.55,0,-.22); eleg(.55,0,-.22);
// canvas painting (interactable)
const canvTex=cvTex((c,w,h)=>{
  c.fillStyle='#f4ede0'; c.fillRect(0,0,w,h);
  c.strokeStyle='#D6488C'; c.lineWidth=6; c.beginPath(); c.moveTo(20,h-30); c.quadraticCurveTo(w/2,20,w-20,h-40); c.stroke();
  c.fillStyle='#E2A83B'; c.beginPath(); c.arc(w*.7,h*.3,26,0,Math.PI*2); c.fill();
  c.fillStyle='#1E6B4F'; c.fillRect(20,h-26,w-40,10);
},128,160);
box(1.0,1.26,.06,M.gold,0,1.4,-.32);
const paintMesh=new THREE.Mesh(new THREE.PlaneGeometry(.84,1.1),new THREE.MeshStandardMaterial({map:canvTex}));
paintMesh.position.set(0,1.4,-.29); world.add(paintMesh);
// coffee table + key1
box(1.2,.4,.7,M.wood,-1.6,.2,3.2);
// vitrola stand
box(1.0,.5,.65,M.wood,5.3,.25,3.4);
const vitGrp=new THREE.Group();
vitGrp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.9,.35,.6),M.wood)));
const vDisc=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.03,24),new THREE.MeshStandardMaterial({color:'#1a1a1a',roughness:.3}));
vDisc.position.y=.2;
// vinyl cover art (either from URL or procedural)
let vinylMat=new THREE.MeshStandardMaterial({color:'#1a1a1a',roughness:.3});
if(VINYL_COVER_URL){
  new THREE.TextureLoader().load(VINYL_COVER_URL,t=>{ t.colorSpace=THREE.SRGBColorSpace; vinylMat.map=t; vinylMat.needsUpdate=true; });
}
const vFace=new THREE.Mesh(new THREE.CircleGeometry(.24,24),vinylMat); vFace.rotation.x=-Math.PI/2; vFace.position.y=.22; vitGrp.add(vFace);
vitGrp.add(vDisc);
const vHorn=new THREE.Mesh(new THREE.ConeGeometry(.22,.4,12,1,true),M.gold); vHorn.rotation.x=Math.PI*.65; vHorn.position.set(.3,.35,0); vitGrp.add(vHorn);
vitGrp.position.set(5.3,.53,3.4); vitGrp.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); world.add(vitGrp);

/* ═══════════════════════════════════════
   CORREDOR DAS MEMÓRIAS (usa largura da sala)
═══════════════════════════════════════ */
slab(Z.hall,M.wood); walls(Z.hall,M.ocre,2.6);
// pilasters
for(let z=-9;z<=-2;z+=3.5){ box(.3,2.5,.3,M.gold,-2.5,1.25,z); box(.3,2.5,.3,M.gold,2.5,1.25,z); }
// wall sconces
for(let z=-8.5;z<-1;z+=2.5){
  [Z.sala.x0,Z.sala.x1].forEach(x=>{
    const s=sph(.1,new THREE.MeshStandardMaterial({color:'#ffdca0',emissive:'#ffb852',emissiveIntensity:1.4}),x+(x<0?.28:-.28),2.08,z);
    const pl=new THREE.PointLight('#ffb852',4.5,5.5); pl.position.copy(s.position); world.add(pl);
  });
}
// memory frames  — loaded from MEMORY_IMAGES or procedural
const FRAME_COLORS=['#D6488C','#1E6B4F','#1B4D6B'];
const memTriggers=[];
const hwL=Z.sala.x0+.16, hwR=Z.sala.x1-.16;
[[hwL,-2.5,Math.PI/2],[hwR,-4.7,-Math.PI/2],[hwL,-7.2,Math.PI/2]].forEach(([x,z,ry],i)=>{
  // frame
  const frm=new THREE.Mesh(new THREE.BoxGeometry(.88,1.08,.07),M.gold);
  let artMat;
  if(MEMORY_IMAGES[i]){
    artMat=new THREE.MeshStandardMaterial({color:'#ffffff'});
    new THREE.TextureLoader().load(MEMORY_IMAGES[i],t=>{ t.colorSpace=THREE.SRGBColorSpace; artMat.map=t; artMat.needsUpdate=true; },{},()=>{});
  } else {
    const procTex=cvTex((c,w,h)=>{
      c.fillStyle='#f4ede0'; c.fillRect(0,0,w,h);
      c.fillStyle=FRAME_COLORS[i]; c.globalAlpha=.82; c.beginPath(); c.arc(w/2,h*.42,w*.27,0,Math.PI*2); c.fill();
      c.globalAlpha=1; c.fillStyle='#E8C468'; c.beginPath(); c.arc(w/2,h*.42,w*.08,0,Math.PI*2); c.fill();
    },100,130);
    artMat=new THREE.MeshStandardMaterial({map:procTex,emissive:'#000'});
  }
  const art=new THREE.Mesh(new THREE.PlaneGeometry(.7,.9),artMat);
  art.position.z=.05;
  const g=new THREE.Group(); g.add(frm,art);
  g.position.set(x,1.55,z); g.rotation.y=ry; world.add(g);
  memTriggers.push({pos:new THREE.Vector3(x>0?x-2:x+2,0,z),radius:2.5,seen:false,art,text:CFG.memorias[i]});
});

/* ═══════════════════════════════════════
   VARANDA / MIRANTE
═══════════════════════════════════════ */
slab(Z.varanda,M.deck); walls(Z.varanda,M.ocre,2.4);
// front railing
const railGrp=new THREE.Group();
for(let x=Z.varanda.x0;x<=Z.varanda.x1;x+=.52){
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.05,6),M.cream); b.position.set(x,.55,Z.varanda.z0+.14); railGrp.add(b);
}
const railTop=new THREE.Mesh(new THREE.BoxGeometry(Z.varanda.x1-Z.varanda.x0,.08,.1),M.cream); railTop.position.set(0,1.05,Z.varanda.z0+.14); railGrp.add(railTop);
railGrp.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); world.add(railGrp);
addCol(Z.varanda.x0,Z.varanda.x1,Z.varanda.z0-.28,Z.varanda.z0+.08);
// pergola
[[-6.6,-11.2],[6.6,-11.2],[-6.6,-21.8],[6.6,-21.8]].forEach(([x,z])=>cyl(.12,.14,2.6,M.wood,x,1.3,z));
function strLights(x0,z0,x1,z1,sag=.5,n=9){
  const pts=[]; for(let i=0;i<=20;i++){ const t=i/20,x=THREE.MathUtils.lerp(x0,x1,t),z2=THREE.MathUtils.lerp(z0,z1,t),y=2.55-Math.sin(t*Math.PI)*sag; pts.push(new THREE.Vector3(x,y,z2)); }
  const curve=new THREE.CatmullRomCurve3(pts);
  world.add(new THREE.Mesh(new THREE.TubeGeometry(curve,18,.012,5,false),new THREE.MeshStandardMaterial({color:'#2a2018'})));
  const bm=new THREE.MeshStandardMaterial({color:'#fff3c4',emissive:'#ffb852',emissiveIntensity:1.8});
  for(let i=1;i<n;i++){ const p=curve.getPoint(i/n); const b=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),bm); b.position.copy(p).y-=.05; world.add(b); if(i%3===0){ const pl=new THREE.PointLight('#ffb852',1.7,4); pl.position.copy(b.position); world.add(pl); } }
}
strLights(-6.6,-11.2,6.6,-11.2,.32,10); strLights(-6.6,-21.8,6.6,-21.8,.32,10);
strLights(-6.6,-11.2,-6.6,-21.8,.85,6); strLights(6.6,-11.2,6.6,-21.8,.85,6);
// bistro table
cyl(.35,.35,.05,M.iron,0,.78,-19); cyl(.05,.05,.75,M.iron,0,.4,-19);
[[-0.7,-18.5],[0.7,-19.5]].forEach(([x,z])=>{ cyl(.22,.22,.05,M.iron,x,.45,z); cyl(.04,.04,.44,M.iron,x,.22,z); });
[[-0.15,-19.1],[0.18,-18.85]].forEach(([x,z])=>{ cyl(.04,.04,.18,M.cream,x,.87,z); sph(.03,new THREE.MeshStandardMaterial({color:'#ffdca0',emissive:'#ffaa33',emissiveIntensity:2}),x,.98,z); });
// pergola beams
[[-6.6,-11.2,6.6,-11.2],[-6.6,-21.8,6.6,-21.8]].forEach(([x0,z0,x1,z1])=>{ const b=box(.12,.12,Math.hypot(x1-x0,z1-z0),M.wood,(x0+x1)/2,2.6,(z0+z1)/2); b.rotation.y=Math.atan2(x1-x0,z1-z0); });

/* ═══════════════════════════════════════
   RIO DE JANEIRO AO FUNDO
═══════════════════════════════════════ */
const rioGrp=new THREE.Group(); world.add(rioGrp);
// big ground
const bg=new THREE.Mesh(new THREE.PlaneGeometry(500,500),M.grass); bg.rotation.x=-Math.PI/2; bg.position.y=-.32; bg.receiveShadow=true; rioGrp.add(bg);
// street + bonde rails
const stMat=new THREE.MeshStandardMaterial({map:T.street,roughness:.95}); const st=new THREE.Mesh(new THREE.PlaneGeometry(9,88),stMat); st.rotation.x=-Math.PI/2; st.position.set(0,-.27,-60); rioGrp.add(st);
const rlMat=new THREE.MeshStandardMaterial({color:'#2a2a2a',metalness:.7,roughness:.3});
[-1.3,1.3].forEach(x=>{ const r=new THREE.Mesh(new THREE.BoxGeometry(.22,.1,88),rlMat); r.position.set(x,-.21,-60); rioGrp.add(r); });
for(let i=0;i<22;i++){ const sl=new THREE.Mesh(new THREE.BoxGeometry(2.9,.06,.14),M.wood); sl.position.set(0,-.22,-20-i*3); rioGrp.add(sl); }
// bonde (streetcar)
const bondeGrp=new THREE.Group();
const bondeBody=new THREE.Mesh(new THREE.BoxGeometry(1.75,.95,3.0),new THREE.MeshStandardMaterial({color:'#ffcc00',roughness:.5})); bondeBody.position.y=.65; bondeGrp.add(bondeBody);
const bondeRoof=new THREE.Mesh(new THREE.BoxGeometry(1.82,.12,3.1),new THREE.MeshStandardMaterial({color:'#8a4a2a',roughness:.6})); bondeRoof.position.y=1.18; bondeGrp.add(bondeRoof);
const bondeStripe=new THREE.Mesh(new THREE.BoxGeometry(1.77,.16,3.02),new THREE.MeshStandardMaterial({color:'#1B4D6B',roughness:.5})); bondeStripe.position.y=.5; bondeGrp.add(bondeStripe);
[-1.0,1.0].forEach(zz=>{ [-0.88,0.88].forEach(xx=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.1,8),rlMat); w.rotation.z=Math.PI/2; w.position.set(xx,.2,zz); bondeGrp.add(w); }); });
[-1.0,0,1.0].forEach(zz=>{ const win=new THREE.Mesh(new THREE.BoxGeometry(.04,.5,.7),new THREE.MeshStandardMaterial({color:'#bfe3e8',roughness:.1})); win.position.set(.88,.75,zz); bondeGrp.add(win); });
bondeGrp.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); rioGrp.add(bondeGrp);
rioGrp.userData.bonde=bondeGrp;
// houses along the hill
const HCOLS=['#E2A83B','#D6488C','#1B4D6B','#B85A3C','#1E6B4F','#f0e8da','#ff9ec7'];
for(let i=0;i<32;i++){
  const col=HCOLS[Math.floor(Math.random()*HCOLS.length)];
  const hm=new THREE.MeshStandardMaterial({color:col,roughness:.82});
  const w=1.4+Math.random()*1.8,h=1.1+Math.random()*1.4,d=1.1+Math.random()*1.2;
  const ang=Math.random()*Math.PI*2,rad=14+Math.random()*24;
  const x=Math.cos(ang)*rad,z=Math.sin(ang)*rad-12;
  if(Math.abs(x)<10&&z>-16&&z<22) continue;
  const house=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),hm); house.position.set(x,h/2-.28,z); house.castShadow=true; rioGrp.add(house);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.72,.6,4),new THREE.MeshStandardMaterial({color:'#7a3a2a',roughness:.8})); roof.position.set(x,h-.06,z); roof.rotation.y=Math.PI/4; rioGrp.add(roof);
}
// palms
function palm(x,z,s=1){
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08*s,.12*s,2.8*s,8),new THREE.MeshStandardMaterial({color:'#5a3a22',roughness:.9})); tr.position.set(x,1.4*s-.3,z); tr.castShadow=true; rioGrp.add(tr);
  for(let i=0;i<6;i++){ const lf=new THREE.Mesh(new THREE.ConeGeometry(.15*s,1.25*s,5),M.leaf); lf.position.set(x,2.9*s-.3,z); lf.rotation.z=(i/6)*Math.PI*2; lf.rotation.x=.68; lf.castShadow=true; rioGrp.add(lf); }
}
for(let i=0;i<16;i++){ const a=Math.random()*Math.PI*2,r=10+Math.random()*26; palm(Math.cos(a)*r,Math.sin(a)*r-8,.85+Math.random()*.55); }
// beach + water
const sand=new THREE.Mesh(new THREE.PlaneGeometry(100,18),M.sand); sand.rotation.x=-Math.PI/2; sand.position.set(10,-.38,-66); rioGrp.add(sand);
const water=new THREE.Mesh(new THREE.PlaneGeometry(280,100),M.water); water.rotation.x=-Math.PI/2; water.position.set(18,-.44,-82); rioGrp.add(water);
// beach umbrellas
const ubCols=['#e63946','#f4a261','#2e7d4f','#1B4D6B','#ffcc00'];
for(let i=0;i<9;i++){
  const ux=-18+i*7+(Math.random()-.5)*2,uz=-60+(Math.random()-.5)*3;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.6,6),M.cream); pole.position.set(ux,.4,uz); rioGrp.add(pole);
  const can=new THREE.Mesh(new THREE.ConeGeometry(.82,.46,10),new THREE.MeshStandardMaterial({color:ubCols[i%ubCols.length],roughness:.7})); can.position.set(ux,1.22,uz); rioGrp.add(can);
}
// Pão de Açúcar cable car
const cCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,12,-22),new THREE.Vector3(9,20,-36),new THREE.Vector3(16,18,-50),new THREE.Vector3(22,9,-56)]);
world.add(new THREE.Mesh(new THREE.TubeGeometry(cCurve,28,.03,6,false),new THREE.MeshStandardMaterial({color:'#1a1a1a'})));
const caGeo=new THREE.BoxGeometry(.8,.6,1.0);
const ca1=new THREE.Mesh(caGeo,new THREE.MeshStandardMaterial({color:'#ffcc00'})); rioGrp.add(ca1);
const ca2=new THREE.Mesh(caGeo,new THREE.MeshStandardMaterial({color:'#e63946'})); rioGrp.add(ca2);
rioGrp.userData.cCurve=cCurve; rioGrp.userData.ca1=ca1; rioGrp.userData.ca2=ca2;
// Pão de Açúcar hill
const paoMat=new THREE.MeshStandardMaterial({color:'#4a5a6a',roughness:.8});
const pb=new THREE.Mesh(new THREE.CylinderGeometry(3.2,4.8,5,14),paoMat); pb.position.set(22,2.2,-58); pb.castShadow=true; rioGrp.add(pb);
const pt=new THREE.Mesh(new THREE.SphereGeometry(3.4,20,16,0,Math.PI*2,0,Math.PI*.6),paoMat); pt.position.set(22,6,-58); pt.scale.set(1,1.42,1); pt.castShadow=true; rioGrp.add(pt);
const urca=new THREE.Mesh(new THREE.ConeGeometry(3.0,4.5,12),paoMat); urca.position.set(16,2,-54); urca.castShadow=true; rioGrp.add(urca);
// Corcovado + Cristo
const corcoMat=new THREE.MeshStandardMaterial({color:'#1e5a3a',roughness:.9});
const corc=new THREE.Mesh(new THREE.ConeGeometry(8,10,8),corcoMat); corc.position.set(-24,3.5,-70); corc.castShadow=true; rioGrp.add(corc);
const cristoBody=new THREE.Mesh(new THREE.BoxGeometry(.4,1.5,.4),M.cream); cristoBody.position.set(-24,10.5,-70); rioGrp.add(cristoBody);
const cristoArms=new THREE.Mesh(new THREE.BoxGeometry(2.0,.25,.25),M.cream); cristoArms.position.set(-24,11.2,-70); rioGrp.add(cristoArms);
// sun orb
const sunOrb=new THREE.Mesh(new THREE.SphereGeometry(3,20,16),new THREE.MeshBasicMaterial({color:'#ffaa33'}));
sunOrb.position.set(-28,28,-50); rioGrp.add(sunOrb);
const sunGlow=new THREE.Mesh(new THREE.SphereGeometry(5,14,12),new THREE.MeshBasicMaterial({color:'#ffcc66',transparent:true,opacity:.22}));
sunGlow.position.copy(sunOrb.position); rioGrp.add(sunGlow);
const sunPL=new THREE.PointLight('#ffb852',2,90); sunPL.position.copy(sunOrb.position); rioGrp.add(sunPL);
// seagulls
const seagulls=[];
function seagull(x,y,z){ const g=new THREE.Group(); const wm=new THREE.MeshBasicMaterial({color:'#fff'}); const w1=new THREE.Mesh(new THREE.ConeGeometry(.28,.055,3),wm); const w2=w1.clone(); w1.position.x=-.14; w1.rotation.z=.5; w2.position.x=.14; w2.rotation.z=-.5; w2.rotation.y=Math.PI; g.add(w1,w2); g.position.set(x,y,z); rioGrp.add(g); seagulls.push({m:g,rad:8+Math.random()*10,spd:.15+Math.random()*.1,ph:Math.random()*Math.PI*2,by:y,cx:x,cz:z}); }
seagull(0,14,-58); seagull(6,16,-64); seagull(-7,15,-54);
// stars
const starGeo=new THREE.BufferGeometry();
const sp=new Float32Array(280*3);
for(let i=0;i<280;i++){ const a=Math.random()*Math.PI*2,r=85+Math.random()*60,h=18+Math.random()*60; sp[i*3]=Math.cos(a)*r; sp[i*3+1]=h; sp[i*3+2]=Math.sin(a)*r; }
starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
const starMat=new THREE.PointsMaterial({color:'#fff6da',size:.9,transparent:true,opacity:0,sizeAttenuation:true});
const stars=new THREE.Points(starGeo,starMat); world.add(stars);

/* ═══════════════════════════════════════
   SPRITE CHARACTER SYSTEM
   — Corrige o problema de direção espelhando
     o sprite de acordo com o movimento real
═══════════════════════════════════════ */
const SPR_H = 1.75; // altura alvo em unidades do jogo
const texLoader = new THREE.TextureLoader();
const texCache = {};

function loadTex(url, onLoad, onError) {
  if(texCache[url]){ if(texCache[url].ready) onLoad(texCache[url].tex); else texCache[url].cbs.push(onLoad); return; }
  const entry = { ready:false, tex:null, cbs:[onLoad] };
  texCache[url] = entry;
  texLoader.load(url, t => {
    t.colorSpace = THREE.SRGBColorSpace;
    entry.tex = t; entry.ready = true;
    entry.cbs.forEach(fn=>fn(t)); entry.cbs.length=0;
  }, undefined, ()=>{ if(onError) onError(); });
}

function makeCharSprite() {
  const mat = new THREE.SpriteMaterial({ transparent:true, alphaTest:0.05 });
  const spr = new THREE.Sprite(mat);
  spr.center.set(0.5, 0);   // pivot at feet
  spr.scale.set(SPR_H*0.65, SPR_H, 1);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 14),
    new THREE.MeshBasicMaterial({ color:'#000', transparent:true, opacity:0.3 })
  );
  shadow.rotation.x = -Math.PI/2;
  shadow.position.y = 0.012;
  const root = new THREE.Group();
  root.add(spr, shadow);
  root._spr = spr;
  root._shadow = shadow;
  root._curTex = null;
  root._facing = 1; // 1=right, -1=left
  return root;
}

function charSetTex(root, url) {
  if(root._curTex === url) return;
  root._curTex = url;
  loadTex(url, tex => {
    root._spr.material.map = tex;
    root._spr.material.needsUpdate = true;
    // fit width to aspect
    const aspect = tex.image.width / tex.image.height;
    root._spr.scale.set(SPR_H * aspect * root._facing, SPR_H, 1);
  });
}

function charSetFacing(root, fx) {
  if(root._facing === fx) return;
  root._facing = fx;
  // flip x scale to mirror sprite horizontally
  const s = root._spr.scale;
  root._spr.scale.set(Math.abs(s.x) * fx, s.y, 1);
}

/* Portrait map (your uploaded artwork) */
const PORTRAITS = {
  tropical_idle:      'assets/portraits/tropical_idle.png',
  tropical_walk1:     'assets/portraits/tropical_walk1.png',
  tropical_walk2:     'assets/portraits/tropical_walk2.png',
  tropical_attack:    'assets/portraits/tropical_attack.png',
  tropical_shock:     'assets/portraits/tropical_shock.png',
  princess_idle:      'assets/portraits/princess_idle.png',
  princess_walk1:     'assets/portraits/princess_walk1.png',
  princess_walk2:     'assets/portraits/princess_walk2.png',
  princess_shock:     'assets/portraits/princess_shock.png',
  princess_celebrate: 'assets/portraits/princess_celebrate.png',
};

/* ─── SOFIA (protagonista) ─── */
const sofia = makeCharSprite();
sofia.position.set(0, 0, 4);
world.add(sofia);
charSetTex(sofia, PORTRAITS.tropical_idle);

/* ─── ELE (namorado) — também sprite ─── */
const eleChar = makeCharSprite();
eleChar.position.set(1.1, 0, -21.2);
world.add(eleChar);
// se tiver URL de foto do namorado usa ela, caso contrário usa procedural
if(ELE_SPRITE_URL){
  charSetTex(eleChar, ELE_SPRITE_URL);
} else {
  // gera um sprite procedural 3D simples como fallback
  const eleFallback = new THREE.Group();
  function eM(geo,mat,x,y,z){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; eleFallback.add(m); return m; }
  eM(new THREE.CylinderGeometry(.16,.19,.75,10),M.pants,0,.375,0);
  eM(new THREE.CylinderGeometry(.22,.26,.82,10),M.shirt,0,1.06,0);
  eM(new THREE.SphereGeometry(.22,14,10),M.skin,0,1.58,0);
  eM(new THREE.SphereGeometry(.23,14,10),M.hairB,0,1.67,-.02);
  eM(new THREE.CylinderGeometry(.07,.07,.55,7),M.shirt,-.28,1.05,0).rotation.z=.25;
  eM(new THREE.CylinderGeometry(.07,.07,.55,7),M.shirt,.28,1.05,0).rotation.z=-.25;
  eleFallback.position.set(1.1,0,-21.2); eleFallback.rotation.y=Math.PI*.85;
  world.add(eleFallback);
  world.remove(eleChar); // usa 3D em vez do sprite
  eleChar._is3D = true; eleChar._3dObj = eleFallback;
  eleChar.position = eleFallback.position;
}

/* ═══════════════════════════════════════
   INTERACTABLES
═══════════════════════════════════════ */
// vitrola
interactables.push({ pos:new THREE.Vector3(5.3,0,3.4), radius:1.65, id:'vitrola', label:'Tocar a vitrola', repeatable:true,
  onInteract(){ toggleMusic(); toast(audioState.playing?'🎵 Bossa nova enche a sala...':'A música parou.'); }
});
// pintura no cavalete
interactables.push({ pos:new THREE.Vector3(0,0,-.15), radius:1.75, id:'quadro', label:'Ver a pintura', repeatable:true,
  onInteract(){ showLines([{falante:'narrador',texto:'Um projeto em andamento. Parece que alguém dedicou muitas noites nisso...'}]); }
});
// key1
const k1=makeKeyMesh(0.09,0.025); k1.rotation.z=Math.PI/2; k1.position.set(-1.6,.55,3.2); world.add(k1); bob(k1,1.6,.06);
interactables.push({ pos:new THREE.Vector3(-1.6,0,3.2), radius:1.3, id:'key1', label:'Pegar a chave de latão',
  onInteract(){ if(!k1.visible) return; collectKey(0); k1.visible=false; showNote(CFG.bilheteChave1); setObj('Vá ao corredor e use o poder das flores para afastar os cipós.'); }
});
// vine hedge (barreira que bloqueia o corredor)
const vineGrp=new THREE.Group();
const VINE_Z=-5.5;
for(let r=0;r<5;r++) for(let c=0;c<18;c++){
  const x=Z.sala.x0+.3+c*((Z.sala.x1-Z.sala.x0-.6)/17);
  const y=.32+r*.38+(Math.random()-.5)*.1;
  const lf=new THREE.Mesh(new THREE.ConeGeometry(.2+Math.random()*.06,.36+Math.random()*.12,6),(r+c)%2?M.leaf:M.leafD);
  lf.position.set(x,y,VINE_Z+(Math.random()-.5)*.3); lf.rotation.z=Math.random()*Math.PI; lf.castShadow=true; vineGrp.add(lf);
}
for(let i=0;i<22;i++){ const fl=new THREE.Mesh(new THREE.SphereGeometry(.055,6,5),i%2?M.mag:M.gold); fl.position.set(Z.sala.x0+Math.random()*(Z.sala.x1-Z.sala.x0),.4+Math.random()*1.8,VINE_Z+(Math.random()-.5)*.4); vineGrp.add(fl); }
vineGrp.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); world.add(vineGrp);
addCol(Z.sala.x0,Z.sala.x1,VINE_Z-.25,VINE_Z+.25);
interactables.push({ pos:new THREE.Vector3(0,0,VINE_Z), radius:4.5, id:'vinha', label:'Usar o poder das flores',
  onInteract(){ if(!gameState.vineCleared){ triggerFlowerPower(); } }
});
// memory frames already placed above — triggers added there
// key2
const k2=makeKeyMesh(0.09,0.03,true); k2.position.set(0,.9,-9.2); world.add(k2); bob(k2,1.8,.07);
interactables.push({ pos:new THREE.Vector3(0,0,-9.2), radius:1.35, id:'key2', label:'Pegar a chave em forma de coração',
  onInteract(){ if(!k2.visible) return; collectKey(1); k2.visible=false; toast('💛 Chave de coração guardada. Onde estará a porta?'); setObj('Vá até a grande porta de vidro no fim do corredor.'); }
});
// glass door
const gDoor=new THREE.Group();
const hw=Z.sala.x1-Z.sala.x0;
gDoor.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(hw+.14,2.62,.12),new THREE.MeshStandardMaterial({color:'#1B4D6B',roughness:.5})),{position:{x:0,y:1.25,z:-9.9}}));
gDoor.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(hw,2.52,.08),M.glass),{position:{x:0,y:1.25,z:-9.9}}));
for(let x=Z.sala.x0+1;x<Z.sala.x1;x+=2){ const mull=new THREE.Mesh(new THREE.BoxGeometry(.07,2.52,.09),new THREE.MeshStandardMaterial({color:'#1B4D6B',roughness:.5})); mull.position.set(x,1.25,-9.9); gDoor.add(mull); }
gDoor.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); world.add(gDoor);
addCol(Z.sala.x0,Z.sala.x1,-10.06,-9.74);
interactables.push({ pos:new THREE.Vector3(0,0,-9.9), radius:4.6, id:'porta', label:'Abrir a porta com as duas chaves',
  onInteract(){ if(!gameState.transformed){ if(gameState.keys[0]&&gameState.keys[1]) doTransformation(); else toast('A porta está trancada. Faltam chaves de memória...'); } }
});
// gift
const giftGrp=makeGiftMesh(); giftGrp.position.set(0,.92,-19); world.add(giftGrp); bob(giftGrp,1.2,.05);
interactables.push({ pos:new THREE.Vector3(0,0,-19), radius:1.65, id:'presente', label:'Abrir o presente', enabled:false,
  onInteract(){ openGift(); }
});
// Ele trigger
interactables.push({ pos:new THREE.Vector3(1.1,0,-21.2), radius:2.4, id:'ele', label:'Falar com ele',
  onInteract(){ if(!gameState.dialogueDone) startVarandaDial(); }
});

/* ─── helper: make key mesh ─── */
function makeKeyMesh(ringR,tubeR,heart=false){
  const g=new THREE.Group();
  if(heart){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(ringR,tubeR,10,16,Math.PI*1.4),M.gold); g.add(ring);
  } else {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(ringR,tubeR,8,16),M.gold); g.add(ring);
  }
  const stem=new THREE.Mesh(new THREE.BoxGeometry(.022,.22,.05),M.gold); stem.position.y=-.15; g.add(stem);
  return g;
}
function makeGiftMesh(){
  const g=new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.32,.28,.32),M.terra)));
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.34,.05,.34),M.gold)));
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.05,.3,.36),M.gold)));
  const bw=new THREE.Mesh(new THREE.TorusKnotGeometry(.05,.02,40,6),M.gold); bw.position.y=.2; g.add(bw);
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g;
}

/* ═══════════════════════════════════════
   FLOWER POWER PARTICLES
═══════════════════════════════════════ */
const petalPool=[];
function spawnPetals(origin){
  for(let i=0;i<22;i++){
    const mat=new THREE.MeshStandardMaterial({color:[0xD6488C,0xE8C468,0x2e7d4f][i%3],roughness:.6,transparent:true,opacity:1});
    const m=new THREE.Mesh(new THREE.ConeGeometry(.04,.1,5),mat);
    m.position.copy(origin);
    world.add(m);
    const ang=Math.random()*Math.PI*2,sp=1.5+Math.random()*2;
    petalPool.push({m,vel:new THREE.Vector3(Math.cos(ang)*sp,1.8+Math.random()*1.2,Math.sin(ang)*sp),life:0,max:.65+Math.random()*.3});
  }
  const fl=new THREE.PointLight('#ff7eb0',8,6); fl.position.copy(origin); world.add(fl);
  setTimeout(()=>world.remove(fl),280);
}
function updatePetals(dt){
  for(let i=petalPool.length-1;i>=0;i--){
    const p=petalPool[i];
    p.life+=dt; p.vel.y-=3.2*dt;
    p.m.position.addScaledVector(p.vel,dt);
    p.m.rotation.x+=dt*7; p.m.rotation.y+=dt*5;
    p.m.material.opacity=Math.max(0,1-p.life/p.max);
    if(p.life>=p.max){ world.remove(p.m); p.m.geometry.dispose(); petalPool.splice(i,1); }
  }
}

/* ═══════════════════════════════════════
   GAME STATE
═══════════════════════════════════════ */
const gameState={
  keys:[false,false,false],
  vineCleared:false, transformed:false,
  dialogueDone:false, giftOpened:false,
  costume:'tropical',
};

function collectKey(i){ gameState.keys[i]=true; $('keyDot'+i).classList.add('filled'); chime(); }
function setObj(t){ $('objectiveText').textContent=t; }
setObj('Explore a sala e encontre a chave de latão sobre a mesa.');

let toastT=null;
function toast(msg){
  const el=$('toast'); el.textContent=msg; el.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),3000);
}

/* ═══════════════════════════════════════
   PLAYER ANIMATION STATE
═══════════════════════════════════════ */
const player={
  pos: new THREE.Vector3(0,0,4),
  moving: false,
  locked: false,
  speed: 3.4,
  animTimer: 0,
  actionTimer: 0,
  action: 'idle', // idle|walk|attack|shock|celebrate
  flowerCool: 0,
};

function currentPortrait(action='idle'){
  const c = gameState.costume;
  const key = c+'_'+action;
  return PORTRAITS[key] || PORTRAITS[c+'_idle'];
}

function setAction(action, duration=600){
  player.action = action;
  player.locked = true;
  charSetTex(sofia, currentPortrait(action));
  clearTimeout(player._actionT);
  player._actionT = setTimeout(()=>{
    player.locked = false;
    player.action = 'idle';
    charSetTex(sofia, currentPortrait('idle'));
  }, duration);
}

function triggerFlowerPower(){
  if(player.flowerCool>0||player.locked||dialogueActive) return;
  player.flowerCool=0.8;
  setAction('attack', 650);
  const origin=sofia.position.clone().add(new THREE.Vector3(0,1.1,0));
  spawnPetals(origin);
  toast('🌸 Rajada de flores!');
  if(!gameState.vineCleared){
    const d=player.pos.distanceTo(new THREE.Vector3(0,0,VINE_Z));
    if(d<4.5){ clearVine(); }
  }
}

function clearVine(){
  gameState.vineCleared=true;
  vineGrp.children.forEach(c=>c.visible=false);
  const idx=colliders.findIndex(c=>c.minZ===VINE_Z-.25);
  if(idx>-1) colliders.splice(idx,1);
  setObj('Explore o corredor e reúna a chave em forma de coração.');
  toast('✨ O caminho está livre!');
}

function updatePlayerAnim(dt, moving){
  if(player.locked) return;
  player.animTimer+=dt;
  if(moving){
    const frame=(Math.floor(player.animTimer/0.18)%2)===0?'walk1':'walk2';
    charSetTex(sofia, currentPortrait(frame));
  } else {
    player.animTimer=0;
    charSetTex(sofia, currentPortrait('idle'));
  }
}

/* ═══════════════════════════════════════
   DIALOGUE SYSTEM
═══════════════════════════════════════ */
let dialogueQueue=[], dialogueActive=false, typeIv=null;
function showLines(lines, onDone){
  dialogueQueue=lines.slice(); dialogueActive=true; player.locked=true;
  $('dialogueBox').classList.add('show');
  nextLine(onDone);
}
function nextLine(onDone){
  if(!dialogueQueue.length){
    $('dialogueBox').classList.remove('show'); dialogueActive=false; player.locked=false;
    if(onDone) onDone(); return;
  }
  const line=dialogueQueue.shift();
  const speaker=line.falante==='ele'?CFG.nomeEle:(line.falante==='ela'?CFG.nomeEla:'');
  $('speakerName').textContent=speaker; $('speakerName').style.opacity=speaker?1:0;
  const port=$('speakerPortrait');
  if(line.falante==='ela'){
    port.src=currentPortrait(player.action==='shock'?'shock':'idle');
    port.classList.remove('hidden');
  } else { port.classList.add('hidden'); }
  const el=$('dialogueText'); el.textContent='';
  clearInterval(typeIv); let i=0;
  typeIv=setInterval(()=>{ el.textContent=line.texto.slice(0,++i); if(i>=line.texto.length) clearInterval(typeIv); },20);
  showLines._adv=()=>{ clearInterval(typeIv); el.textContent=line.texto; nextLine(onDone); };
}
function advDial(){ if(dialogueActive&&showLines._adv) showLines._adv(); }
$('dialogueBox').addEventListener('click',advDial);
$('dialogueBox').addEventListener('touchend',e=>{ e.preventDefault(); advDial(); },{passive:false});

function showNote(txt){ player.locked=true; $('noteText').textContent=txt; $('noteOverlay').classList.add('show'); }
$('noteCloseBtn').addEventListener('click',()=>{ $('noteOverlay').classList.remove('show'); player.locked=false; });

function startVarandaDial(){
  setAction('shock',600);
  showLines(CFG.dialogoVaranda,()=>{
    gameState.dialogueDone=true;
    interactables.find(i=>i.id==='presente').enabled=true;
    setObj('Abra o presente sobre a mesa do mirante.');
    toast('✨ O presente começa a brilhar...');
  });
}
function openGift(){
  if(gameState.giftOpened) return; gameState.giftOpened=true;
  collectKey(2); setAction('celebrate',1400);
  $('giftText').innerHTML=CFG.mensagemPresente.map(p=>`<p>${p}</p>`).join('');
  $('giftOverlay').classList.add('show'); player.locked=true;
}
$('giftCloseBtn').addEventListener('click',()=>{ $('giftOverlay').classList.remove('show'); playEnding(); });

/* ═══════════════════════════════════════
   CUTSCENES
═══════════════════════════════════════ */
function doTransformation(){
  gameState.transformed=true; player.locked=true;
  setObj('✦ A magia acontece... ✦');
  $('fadeOverlay').classList.add('show'); chime();
  setTimeout(()=>{
    gameState.costume='princess';
    charSetTex(sofia, currentPortrait('idle'));
    gDoor.visible=false;
    const idx=colliders.findIndex(c=>c.minZ===-10.06);
    if(idx>-1) colliders.splice(idx,1);
    player.pos.z=-10.7;
    tweenSky(2800);
  },900);
  setTimeout(()=>$('fadeOverlay').classList.remove('show'),1500);
  setTimeout(()=>{ player.locked=false; setObj('Siga até o mirante e encontre quem te espera.'); },1700);
}

function tweenSky(dur){
  const t0=performance.now();
  function step(now){
    const t=Math.min(1,(now-t0)/dur);
    skyT=t; paintSky();
    sun.intensity=THREE.MathUtils.lerp(1.25,.5,t);
    hemi.intensity=THREE.MathUtils.lerp(.7,.35,t);
    starMat.opacity=t*.88;
    if(t<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function playEnding(){
  player.locked=true;
  $('endingTitle').textContent=CFG.textoFinal;
  $('endingSub1').textContent=CFG.textoFinal2.split(' para')[0]||CFG.textoFinal2;
  $('endingSub2').textContent=CFG.textoFinal2.includes(' para')?'para'+CFG.textoFinal2.split(' para')[1]:'';
  $('endingTbc').textContent=CFG.textoFinal3;
  const d0=controls.getDistance(), t0=performance.now();
  function pull(now){
    const t=Math.min(1,(now-t0)/3400), e=1-Math.pow(1-t,3);
    controls.minDistance=controls.maxDistance=THREE.MathUtils.lerp(d0,d0+22,e);
    controls.maxPolarAngle=controls.minPolarAngle=THREE.MathUtils.lerp(THREE.MathUtils.degToRad(55),THREE.MathUtils.degToRad(26),e);
    controls.update();
    if(t<1) requestAnimationFrame(pull); else setTimeout(()=>$('endingScreen').classList.add('show'),700);
  }
  requestAnimationFrame(pull);
}
$('replayBtn').addEventListener('click',()=>location.reload());

/* ═══════════════════════════════════════
   INPUT — KEYBOARD
═══════════════════════════════════════ */
const keys={};
addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key==='e'||e.key===' '){ e.preventDefault(); tryInteract(); }
  if(e.key.toLowerCase()==='f'){ e.preventDefault(); triggerFlowerPower(); }
  if(dialogueActive&&e.key==='Enter') advDial();
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

/* ═══════════════════════════════════════
   INPUT — MOBILE JOYSTICK
   Fixed: proper dead-zone, velocity based on knob offset
═══════════════════════════════════════ */
const joy={x:0,y:0};
(function(){
  const zone=$('joystickZone'), knob=$('joystickKnob');
  const MAXR=36, CX=55, CY=55; // zone is 110x110
  let active=false, tid=null;
  function move(clientX,clientY){
    const rect=zone.getBoundingClientRect();
    const dx=clientX-(rect.left+rect.width/2), dy=clientY-(rect.top+rect.height/2);
    const dist=Math.min(MAXR,Math.hypot(dx,dy));
    const ang=Math.atan2(dy,dx);
    const kx=Math.cos(ang)*dist, ky=Math.sin(ang)*dist;
    knob.style.transform=`translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    joy.x=kx/MAXR; joy.y=ky/MAXR;
  }
  function reset(){ joy.x=0; joy.y=0; knob.style.transform='translate(-50%,-50%)'; active=false; }
  zone.addEventListener('touchstart',e=>{ e.preventDefault(); active=true; tid=e.changedTouches[0].identifier; move(e.changedTouches[0].clientX,e.changedTouches[0].clientY); },{passive:false});
  zone.addEventListener('touchmove',e=>{ e.preventDefault(); const t=[...e.changedTouches].find(t=>t.identifier===tid); if(t&&active) move(t.clientX,t.clientY); },{passive:false});
  zone.addEventListener('touchend',e=>{ const t=[...e.changedTouches].find(t=>t.identifier===tid); if(t) reset(); },{passive:false});
  zone.addEventListener('touchcancel',reset,{passive:false});
})();

// right action buttons
$('flowerBtn').addEventListener('click',()=>triggerFlowerPower());
$('flowerBtn').addEventListener('touchstart',e=>{ e.preventDefault(); triggerFlowerPower(); },{passive:false});
$('interactBtn').addEventListener('click',()=>tryInteract());
$('interactBtn').addEventListener('touchstart',e=>{ e.preventDefault(); tryInteract(); },{passive:false});

/* ═══════════════════════════════════════
   INTERACT LOGIC
═══════════════════════════════════════ */
let nearIA=null;
function tryInteract(){
  if(dialogueActive){ advDial(); return; }
  if(nearIA&&!player.locked) nearIA.onInteract();
}

/* ═══════════════════════════════════════
   MOVEMENT — corrected directional sprite
   Key insight: sprites are always viewed from the SAME camera angle,
   so we only need to flip X (left/right) and the walk cycle takes care of
   the rest. The camera is isometric enough that a single side-view sprite
   looks correct for all horizontal movement.
═══════════════════════════════════════ */
const mv=new THREE.Vector3();
const CAM_FWD=new THREE.Vector3(), CAM_RT=new THREE.Vector3();
const UP=new THREE.Vector3(0,1,0);

function collidesAt(x,z){
  for(const c of colliders) if(x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ) return true;
  return false;
}

function checkMemories(){
  memTriggers.forEach(m=>{
    if(m.seen) return;
    if(player.pos.distanceTo(m.pos)<m.radius){ m.seen=true; toast('💭 '+m.text); }
  });
}

function updatePlayer(dt){
  let ix=0,iy=0;
  if(keys['w']||keys['arrowup'])    iy=-1;
  if(keys['s']||keys['arrowdown'])  iy= 1;
  if(keys['a']||keys['arrowleft'])  ix=-1;
  if(keys['d']||keys['arrowright']) ix= 1;
  ix+=joy.x; iy+=joy.y;
  const len=Math.hypot(ix,iy);
  if(len>1){ ix/=len; iy/=len; }

  player.moving=false;
  const canMove=!player.locked&&!dialogueActive;

  if(canMove&&len>0.08){
    // get camera horizontal direction
    camera.getWorldDirection(CAM_FWD); CAM_FWD.y=0;
    if(CAM_FWD.lengthSq()<1e-6) CAM_FWD.set(0,0,-1); else CAM_FWD.normalize();
    CAM_RT.crossVectors(CAM_FWD,UP).normalize();
    mv.set(0,0,0).addScaledVector(CAM_RT,ix).addScaledVector(CAM_FWD,-iy).normalize();

    const nx=player.pos.x+mv.x*player.speed*dt;
    const nz=player.pos.z+mv.z*player.speed*dt;
    if(!collidesAt(nx,player.pos.z)) player.pos.x=nx;
    if(!collidesAt(player.pos.x,nz)) player.pos.z=nz;

    // Facing: only check horizontal component relative to camera right
    // positive dot → moving rightward in screen space → face right
    // negative dot → moving leftward → face left (flip sprite)
    const screenX = mv.dot(CAM_RT);
    if(Math.abs(screenX)>0.18) charSetFacing(sofia, screenX>0?-1:1);
    // (flipped because sprite faces LEFT by default in the uploaded art)

    player.moving=true;
  }

  sofia.position.set(player.pos.x,0,player.pos.z);
  sofia._shadow.position.set(0,.012,0);
  updatePlayerAnim(dt, player.moving&&canMove);
  controls.target.lerp(new THREE.Vector3(player.pos.x,1.1,player.pos.z),.08);
  checkMemories();
  if(player.flowerCool>0) player.flowerCool=Math.max(0,player.flowerCool-dt);

  // nearest interactable
  let best=null,bestD=Infinity;
  interactables.forEach(it=>{
    if(it.enabled===false) return;
    const d=Math.hypot(player.pos.x-it.pos.x,player.pos.z-it.pos.z);
    if(d<it.radius&&d<bestD){ bestD=d; best=it; }
  });
  nearIA=best;
  const prompt=$('interactPrompt');
  if(best&&!player.locked){ $('interactLabel').textContent=best.label; prompt.classList.add('show'); }
  else prompt.classList.remove('show');
}

/* ═══════════════════════════════════════
   AUDIO
   Coloque o link da música em MUSIC_URL no topo do arquivo.
   Aceita: Google Drive (uc?export=download&id=...), dropbox, ou MP3 direto.
═══════════════════════════════════════ */
const audioState={ctx:null,playing:false,muted:false,master:null,bgEl:null};
function ensureAudio(){
  if(audioState.ctx) return;
  const AC=window.AudioContext||window.webkitAudioContext;
  audioState.ctx=new AC();
  audioState.master=audioState.ctx.createGain();
  audioState.master.gain.value=audioState.muted?0:.55;
  audioState.master.connect(audioState.ctx.destination);
}
function chime(){
  ensureAudio(); const ctx=audioState.ctx,t0=ctx.currentTime;
  [880,1108,1318].forEach((f,i)=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type='sine'; osc.frequency.value=f;
    g.gain.setValueAtTime(0,t0+i*.09); g.gain.linearRampToValueAtTime(.18,t0+i*.09+.02); g.gain.exponentialRampToValueAtTime(.001,t0+i*.09+.7);
    osc.connect(g); g.connect(audioState.master); osc.start(t0+i*.09); osc.stop(t0+i*.09+.75);
  });
}

/* Synth ambient (fallback when no MUSIC_URL) */
let synthNodes=[],synthT=null;
function startSynth(){
  const ctx=audioState.ctx;
  const bassG=ctx.createGain(); bassG.gain.value=.08; bassG.connect(audioState.master);
  const leadG=ctx.createGain(); leadG.gain.value=.055; leadG.connect(audioState.master);
  const notes=[261.6,329.6,392,440,523.3,392,329.6,293.7];
  let step=0;
  function loop(){
    if(!audioState.playing) return;
    const t=ctx.currentTime+.04;
    const bass=ctx.createOscillator(); bass.type='sine'; bass.frequency.value=notes[step%notes.length]/2;
    const bg=ctx.createGain(); bg.gain.setValueAtTime(0,t); bg.gain.linearRampToValueAtTime(.5,t+.05); bg.gain.exponentialRampToValueAtTime(.001,t+.82);
    bass.connect(bg); bg.connect(bassG); bass.start(t); bass.stop(t+.88); synthNodes.push(bass);
    if(step%2===0){
      const lead=ctx.createOscillator(); lead.type='triangle'; lead.frequency.value=notes[(step+3)%notes.length];
      const lg=ctx.createGain(); lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(.32,t+.08); lg.gain.exponentialRampToValueAtTime(.001,t+1.3);
      lead.connect(lg); lg.connect(leadG); lead.start(t); lead.stop(t+1.4); synthNodes.push(lead);
    }
    step++; synthT=setTimeout(loop,.82*1000);
  }
  loop();
}
function stopSynth(){ clearTimeout(synthT); synthNodes.forEach(n=>{ try{n.stop();}catch(e){} }); synthNodes=[]; }

function toggleMusic(){
  ensureAudio();
  if(audioState.playing){
    audioState.playing=false;
    if(audioState.bgEl){ audioState.bgEl.pause(); }
    stopSynth();
  } else {
    audioState.playing=true;
    if(MUSIC_URL){
      if(!audioState.bgEl){
        audioState.bgEl=new Audio(MUSIC_URL);
        audioState.bgEl.loop=true; audioState.bgEl.volume=audioState.muted?0:.5;
        audioState.bgEl.crossOrigin='anonymous';
      }
      audioState.bgEl.play().catch(()=>{ startSynth(); }); // fallback to synth if blocked
    } else { startSynth(); }
  }
}

$('soundToggle').addEventListener('click',()=>{
  ensureAudio(); audioState.muted=!audioState.muted;
  audioState.master.gain.value=audioState.muted?0:.55;
  if(audioState.bgEl) audioState.bgEl.volume=audioState.muted?0:.5;
  $('soundToggle').textContent=audioState.muted?'🔇':'🔈';
});

/* ═══════════════════════════════════════
   BOBBERS UPDATE
═══════════════════════════════════════ */
function updateBobbers(t){
  bobbers.forEach(m=>{ if(!m.visible) return; m.position.y=m.userData.bb+Math.sin(t*m.userData.bs)*m.userData.ba; m.rotation&&(m.rotation.y+=.012); });
}

/* ═══════════════════════════════════════
   NPC ELE idle bob
═══════════════════════════════════════ */
function updateEle(t){
  if(eleChar._is3D){ eleChar._3dObj.position.y=Math.sin(t*1.3)*.02; return; }
  // sprite version just bobs
  eleChar.position.y=Math.sin(t*1.3)*.018;
}

/* ═══════════════════════════════════════
   SEAGULL + BONDE ANIMATION
═══════════════════════════════════════ */
function updateRio(t){
  seagulls.forEach(s=>{
    const a=t*s.spd+s.ph;
    s.m.position.set(s.cx+Math.cos(a)*s.rad, s.by+Math.sin(t*.8+s.ph)*.6, s.cz+Math.sin(a)*s.rad);
    s.m.rotation.y=-a-Math.PI/2;
  });
  if(rioGrp.userData.cCurve){
    const p1=rioGrp.userData.cCurve.getPoint((t*.04)%1);
    const p2=rioGrp.userData.cCurve.getPoint(((t*.04)+.5)%1);
    rioGrp.userData.ca1.position.copy(p1); rioGrp.userData.ca2.position.copy(p2);
  }
  if(rioGrp.userData.bonde){
    rioGrp.userData.bonde.position.z=-60+Math.sin(t*.28)*36;
    rioGrp.userData.bonde.position.x=Math.sin(t*.28)*.4;
  }
}

/* ═══════════════════════════════════════
   LOADING / TITLE FLOW
═══════════════════════════════════════ */
// preload all portraits
const allPorts=Object.values(PORTRAITS);
let loaded=0;
function onPortLoad(){ loaded++; $('loadbarFill').style.width=Math.min(100,loaded/allPorts.length*100)+'%'; if(loaded>=allPorts.length) showTitle(); }
let titleShown=false;
function showTitle(){ if(titleShown) return; titleShown=true; $('loading').classList.add('hidden'); $('titleScreen').classList.remove('hidden'); }
allPorts.forEach(src=>loadTex(src,onPortLoad,onPortLoad));
setTimeout(showTitle, 2800);

$('startBtn').addEventListener('click',()=>{ $('titleScreen').classList.add('hidden'); ensureAudio(); toggleMusic(); });
$('howToBtn').addEventListener('click',()=>{
  toast(isTouchDev
    ?'👆 Manete pra andar. 🌸 = poder das flores. ✋ = interagir. Arraste pra girar a câmera.'
    :'⌨ WASD/setas=andar · E=interagir · F=flores · arrastar=câmera');
});

/* ═══════════════════════════════════════
   MAIN LOOP
═══════════════════════════════════════ */
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(.05,clock.getDelta()), t=clock.elapsedTime;
  updatePlayer(dt);
  updateBobbers(t);
  updatePetals(dt);
  updateEle(t);
  updateRio(t);
  controls.update();
  renderer.render(scene,camera);
}
animate();
