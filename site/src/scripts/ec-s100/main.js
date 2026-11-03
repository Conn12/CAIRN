import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MODULES, MODULE_MAP, CHAPTERS } from './content.js';

const stage = document.getElementById('es100-stage');
const viewport = document.getElementById('es100-viewport');
const W = () => stage.clientWidth;
const H = () => stage.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
viewport.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W(), H());
labelRenderer.domElement.className = 'es100-label-layer';
labelRenderer.domElement.style.pointerEvents = 'none';
viewport.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04090c);
scene.fog = new THREE.FogExp2(0x04090c, 0.011);

const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 240);
camera.position.set(22, 17, 29);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(1.2, 2.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 9;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotateSpeed = 0.5;
controls.update();

scene.add(new THREE.HemisphereLight(0xa8fff0, 0x0a2020, 1.25));
scene.add(new THREE.AmbientLight(0x6fa7b0, 0.55));

const keyLight = new THREE.DirectionalLight(0xfff6e8, 3.2);
keyLight.position.set(16, 26, 14);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8fd8ff, 0.9);
fillLight.position.set(-18, 12, -12);
scene.add(fillLight);

const cyanLight = new THREE.PointLight(0x4fd1ff, 70, 40, 2);
cyanLight.position.set(-10, 10, -8);
scene.add(cyanLight);

const goldLight = new THREE.PointLight(0xffb347, 50, 34, 2);
goldLight.position.set(10, 8, 10);
scene.add(goldLight);

// ---------- 材质 ----------
const goldMat = new THREE.MeshStandardMaterial({ color: 0xb08238, metalness: 0.9, roughness: 0.36 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x12161c, metalness: 0.7, roughness: 0.34 });
const silverMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.95, roughness: 0.22 });

const shadowTex = (() => {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)'); grad.addColorStop(0.55, 'rgba(0,0,0,0.22)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

function addShadow(group, w, d, y) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.2, d * 1.2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  group.add(m);
}

function rounded(w, h, d, r = 0.04) {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2));
}

function makeBoardTexture(base, trace, title) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  let seed = 20261103;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.strokeStyle = 'rgba(255,255,255,0.045)'; g.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
  }
  for (let n = 0; n < 90; n += 1) {
    let x = rnd() * 1024, y = rnd() * 1024;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 3; s += 1) {
      if (rnd() > 0.5) x += rnd() > 0.5 ? 40 + rnd() * 140 : -(40 + rnd() * 140);
      else y += rnd() > 0.5 ? 40 + rnd() * 140 : -(40 + rnd() * 140);
      g.lineTo(x, y);
    }
    g.strokeStyle = trace; g.lineWidth = 1 + rnd() * 2; g.stroke();
  }
  for (let n = 0; n < 140; n += 1) {
    const x = rnd() * 1024, y = rnd() * 1024, r = 2 + rnd() * 4;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = 'rgba(201,151,63,0.16)'; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.45, 0, Math.PI * 2); g.fillStyle = 'rgba(4,16,12,0.8)'; g.fill();
  }
  g.fillStyle = 'rgba(190,240,220,0.22)';
  g.font = '600 24px "Cascadia Mono", Consolas, monospace';
  g.fillText(title, 40, 960);
  g.font = '500 15px "Cascadia Mono", Consolas, monospace';
  g.fillText('ZET6-STYLE MODULE CARRIER · 2.54mm HEADERS', 40, 990);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ---------- 底板 ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(240, 240),
  new THREE.MeshStandardMaterial({ color: 0x040b0f, roughness: 1, metalness: 0 }),
);
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.03; scene.add(floor);

const grid = new THREE.GridHelper(90, 90, 0x0f4a50, 0x0a2a30);
grid.position.y = 0.01; grid.material.transparent = true; grid.material.opacity = 0.28; scene.add(grid);

const baseBoard = new THREE.Group();
const basePcb = new THREE.Mesh(rounded(32, 0.6, 22, 0.08), new THREE.MeshStandardMaterial({ color: 0x17664a, roughness: 0.72, metalness: 0.16 }));
basePcb.position.y = 0.7;
baseBoard.add(basePcb);
const baseTop = new THREE.Mesh(
  new THREE.PlaneGeometry(31.4, 21.4),
  new THREE.MeshStandardMaterial({ map: makeBoardTexture('#14503a', 'rgba(63,240,200,0.22)', 'EC-S100 MODULE CARRIER · V2.6'), roughness: 0.8, metalness: 0.12 }),
);
baseTop.rotation.x = -Math.PI / 2; baseTop.position.y = 1.01; baseBoard.add(baseTop);
addShadow(baseBoard, 32, 22, 0.38);
scene.add(baseBoard);

const titleCanvas = document.createElement('canvas');
titleCanvas.width = 1024; titleCanvas.height = 128;
const tctx = titleCanvas.getContext('2d');
tctx.clearRect(0, 0, 1024, 128);
tctx.fillStyle = 'rgba(190,240,220,0.5)';
tctx.font = '600 54px "Cascadia Mono", Consolas, monospace';
tctx.fillText('EC-S100 · MODULE LAB', 24, 80);
const titleTex = new THREE.CanvasTexture(titleCanvas);
titleTex.colorSpace = THREE.SRGBColorSpace;
const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.25), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, opacity: 0.8, depthWrite: false }));
titlePlane.rotation.x = -Math.PI / 2;
titlePlane.position.set(-6, 1.02, -10.2);
baseBoard.add(titlePlane);

// ---------- 模块 ----------
const moduleGroups = new Map();
const pickables = [];
const labels = new Map();
const edgeObjects = [];
const pinLabelObjects = [];

function moduleHeaderPos(module) {
  const [w, , d] = module.size;
  switch (module.header?.side) {
    case 'right': return { axis: 'z', x: w / 2 - 0.28, z: 0, len: d * 0.8 };
    case 'left': return { axis: 'z', x: -w / 2 + 0.28, z: 0, len: d * 0.8 };
    case 'back': return { axis: 'x', x: 0, z: d / 2 - 0.28, len: w * 0.8 };
    case 'front': return { axis: 'x', x: 0, z: -d / 2 + 0.28, len: w * 0.8 };
    default: return { axis: 'x', x: 0, z: 0, len: w * 0.8 };
  }
}

function addHeader(group, module) {
  if (!module.header) return;
  const [w, h, d] = module.size;
  const hp = moduleHeaderPos(module);
  const count = module.header.count;
  const stripLen = count * 0.55;
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(hp.axis === 'x' ? stripLen : 0.55, 0.18, hp.axis === 'x' ? 0.55 : stripLen),
    darkMat,
  );
  strip.position.set(hp.x, -h / 2 - 0.05, hp.z);
  group.add(strip);

  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    for (let row = 0; row < (module.header.rows || 1); row += 1) {
      const offset = ((module.header.rows || 1) - 1) * 0.25;
      const rowOff = row * 0.5 - offset;
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.34, 0.13), goldMat);
      if (hp.axis === 'x') pin.position.set(t * stripLen * 0.88, -h / 2 - 0.18, hp.z + rowOff);
      else pin.position.set(hp.x + rowOff, -h / 2 - 0.18, t * stripLen * 0.88);
      group.add(pin);
    }
  }
}

function addSocket(module) {
  if (!module.header) return;
  const hp = moduleHeaderPos(module);
  const count = module.header.count;
  const stripLen = count * 0.55;
  const socket = new THREE.Mesh(
    new THREE.BoxGeometry(hp.axis === 'x' ? stripLen : 0.65, 0.28, hp.axis === 'x' ? 0.65 : stripLen),
    darkMat,
  );
  socket.position.set(module.pos[0] + hp.x, 0.92, module.pos[2] + hp.z);
  baseBoard.add(socket);
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    for (let row = 0; row < (module.header.rows || 1); row += 1) {
      const offset = ((module.header.rows || 1) - 1) * 0.25;
      const rowOff = row * 0.5 - offset;
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0x05080a }));
      if (hp.axis === 'x') hole.position.set(module.pos[0] + t * stripLen * 0.88, 1.07, module.pos[2] + hp.z + rowOff);
      else hole.position.set(module.pos[0] + hp.x + rowOff, 1.07, module.pos[2] + t * stripLen * 0.88);
      baseBoard.add(hole);
    }
  }
}

function pinTexture(module) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 384;
  const g = c.getContext('2d');
  g.fillStyle = '#15503a'; g.fillRect(0, 0, 512, 384);
  g.strokeStyle = 'rgba(63,240,200,0.12)'; g.lineWidth = 1;
  for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 384); g.stroke(); }
  g.fillStyle = 'rgba(210,255,240,0.85)';
  g.font = '600 22px "Microsoft YaHei", sans-serif';
  g.fillText(module.label, 20, 40);
  g.fillStyle = 'rgba(63,240,200,0.65)';
  g.font = '12px "Cascadia Mono", Consolas, monospace';
  g.fillText(module.meta.slice(0, 36), 20, 62);
  const hp = moduleHeaderPos(module);
  const count = module.header?.count || 0;
  const pinLabels = module.pins.slice(0, count);
  if (hp.axis === 'z') {
    const left = hp.x > 0;
    g.save();
    g.translate(left ? 500 : 12, 190);
    g.rotate(left ? -Math.PI / 2 : Math.PI / 2);
    g.font = '11px "Cascadia Mono", Consolas, monospace';
    pinLabels.forEach((p, i) => {
      g.fillStyle = i === 0 ? '#ff8a8a' : i === 1 ? '#d7d7d7' : '#6fe8c8';
      g.fillText(`${i + 1} ${p[0]}`, i * 42, 0);
    });
    g.restore();
  } else {
    g.font = '11px "Cascadia Mono", Consolas, monospace';
    pinLabels.forEach((p, i) => {
      g.fillStyle = i === 0 ? '#ff8a8a' : i === 1 ? '#d7d7d7' : '#6fe8c8';
      g.fillText(`${i + 1} ${p[0]}`, 20 + i * 42, 360);
    });
  }
  g.fillStyle = 'rgba(255,179,71,0.5)';
  g.font = '10px "Cascadia Mono", Consolas, monospace';
  g.fillText('2.54mm HEADER', 20, 92);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function addChip(group, x, y, z, w, h, d, color = 0x12161c, emissive = 0) {
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.34, emissive, emissiveIntensity: emissive ? 0.3 : 0 });
  const chip = new THREE.Mesh(rounded(w, h, d, 0.03), mat);
  chip.position.set(x, y, z);
  group.add(chip);
  for (let i = 0; i < 3; i += 1) {
    const px = x - w * 0.3 + i * w * 0.3;
    for (const sign of [-1, 1]) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.12), goldMat);
      pin.position.set(px, y + h / 2 + 0.02, z + sign * (d / 2 + 0.05));
      group.add(pin);
    }
  }
  return { mat };
}

function buildCore(module, group) {
  const [w, h, d] = module.size;
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f3c52, metalness: 0.2, roughness: 0.7 });
  group.add(new THREE.Mesh(rounded(w, h, d, 0.06), pcbMat));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), new THREE.MeshStandardMaterial({
    map: makeBoardTexture('#12405a', 'rgba(79,209,255,0.24)', 'STM32F411 CORE'), roughness: 0.8, metalness: 0.12,
  }));
  top.rotation.x = -Math.PI / 2; top.position.y = h / 2 + 0.01; group.add(top);

  addChip(group, -3, 0.55, 0, 2.0, 0.36, 2.0, 0x161b22, 0x4f8cff);
  const usb = new THREE.Mesh(rounded(1.3, 0.4, 1.5, 0.03), silverMat);
  usb.position.set(4.5, 0.45, 2.6); group.add(usb);
  for (const [x, z] of [[-4.2, 2.8], [3.2, 2.8]]) {
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.5), goldMat);
    key.position.set(x, 0.45, z); group.add(key);
  }
  for (const z of [-3.4, 3.4]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.22, 0.55), darkMat);
    strip.position.set(0, 0.38, z); group.add(strip);
    for (let i = 0; i < 20; i += 1) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.34, 0.13), goldMat);
      pin.position.set(-4.5 + i * 0.47, 0.52, z); group.add(pin);
    }
  }
  addShadow(group, w, d, -h / 2 - 0.01);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.5 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat);
  group.add(edges); edgeObjects.push(edges);
  return { pcbMat, setState: ({ dim = false } = {}) => { pcbMat.transparent = dim; pcbMat.opacity = dim ? 0.35 : 1; edgeMat.opacity = dim ? 0.1 : 0.5; } };
}

function buildFlat(module, group) {
  const [w, h, d] = module.size;
  const pcbMat = new THREE.MeshStandardMaterial({ color: module.kind === 'bt' ? 0x1a6488 : 0x1a7554, metalness: 0.18, roughness: 0.7 });
  group.add(new THREE.Mesh(rounded(w, h, d, 0.05), pcbMat));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.35, d - 0.35), new THREE.MeshStandardMaterial({
    map: pinTexture(module), roughness: 0.8, metalness: 0.1,
  }));
  top.rotation.x = -Math.PI / 2; top.position.y = h / 2 + 0.01; group.add(top);
  addHeader(group, module);
  addSocket(module);

  const chipColor = {
    touch: 0x3ff0c8, aht21: 0x3ff0c8, em7028: 0xff6b8a, spl06: 0x60a5fa,
    mpu6050: 0xffb347, lis2mdl: 0x818cf8, w25q: 0x4ade80, hp4570: 0xfacc15,
    wt588: 0xc084fc,
  };
  if (module.kind === 'battery') {
    const bat = new THREE.Mesh(rounded(1.6, 0.4, 0.8, 0.05), new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.7 }));
    bat.position.set(0, 0.48, 0); group.add(bat);
  } else if (module.kind === 'motor') {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.22, 20), new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.8, roughness: 0.3, emissive: 0xff9f43, emissiveIntensity: 0.25 }));
    motor.position.set(0, 0.5, 0); group.add(motor);
  } else if (module.kind === 'keys') {
    for (const x of [-0.8, 0.8]) {
      const key = new THREE.Mesh(rounded(0.65, 0.28, 0.65, 0.04), goldMat);
      key.position.set(x, 0.48, 0); group.add(key);
    }
  } else if (module.kind === 'led') {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff3b3b, emissiveIntensity: 0.9 }));
    led.position.set(0, 0.52, 0); group.add(led);
  } else if (module.kind === 'light') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfff2c0, metalness: 0.1, roughness: 0.25, transparent: true, opacity: 0.85, emissive: 0xffd166, emissiveIntensity: 0.25 }));
    dome.position.set(0, 0.5, 0); dome.scale.y = 0.6; group.add(dome);
  } else if (module.kind === 'bt') {
    const sub = new THREE.Mesh(rounded(2.6, 0.2, 1.6, 0.03), new THREE.MeshStandardMaterial({ color: 0x1a6488, roughness: 0.6 }));
    sub.position.y = 0.4; group.add(sub);
    const shield = new THREE.Mesh(rounded(1.3, 0.22, 0.9, 0.02), silverMat);
    shield.position.set(0, 0.55, 0); group.add(shield);
  } else {
    addChip(group, 0, 0.5, 0, 0.85, 0.26, 0.65, 0x141a20, chipColor[module.kind] || 0x3ff0c8);
  }
  addShadow(group, w, d, -h / 2 - 0.02);
  const edgeMat = new THREE.LineBasicMaterial({ color: module.color, transparent: true, opacity: 0.55 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat);
  group.add(edges); edgeObjects.push(edges);
  return { pcbMat, setState: ({ dim = false } = {}) => { pcbMat.transparent = dim; pcbMat.opacity = dim ? 0.3 : 1; edgeMat.opacity = dim ? 0.12 : 0.55; } };
}

function buildScreen(module, group) {
  const [w, h] = module.size;
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0a0e12, metalness: 0.5, roughness: 0.5 });
  group.add(new THREE.Mesh(rounded(w, h, module.size[2], 0.06), pcbMat));
  const bezel = new THREE.Mesh(rounded(w * 0.9, h * 0.9, 0.2, 0.04), new THREE.MeshStandardMaterial({ color: 0x020405, roughness: 0.35, metalness: 0.3 }));
  bezel.position.z = 0.3; group.add(bezel);
  const touch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.5), darkMat);
  touch.position.set(w * 0.32, -h * 0.32, 0.45); group.add(touch);
  addHeader(group, module);
  addSocket(module);
  addShadow(group, w, module.size[2], -h / 2 - 0.02);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.55 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, module.size[2])), edgeMat);
  group.add(edges); edgeObjects.push(edges);
  return { pcbMat, setState: ({ dim = false } = {}) => { pcbMat.transparent = dim; pcbMat.opacity = dim ? 0.4 : 1; edgeMat.opacity = dim ? 0.12 : 0.55; } };
}

const screenCanvas = document.createElement('canvas');
screenCanvas.width = 240; screenCanvas.height = 280;
const screenCtx = screenCanvas.getContext('2d');
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;

for (const module of MODULES) {
  const group = new THREE.Group();
  group.position.set(module.pos[0], module.pos[1], module.pos[2]);
  scene.add(group);

  let built;
  if (module.kind === 'core') built = buildCore(module, group);
  else if (module.kind === 'screen') built = buildScreen(module, group);
  else built = buildFlat(module, group);

  if (module.kind === 'screen') {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 7.9), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
    plane.position.z = 0.46; group.add(plane);
    moduleGroups.set(module.id, { group, module, baseY: module.pos[1], offset: 0, target: 0, ...built, screenPlane: plane });
  } else {
    moduleGroups.set(module.id, { group, module, baseY: module.pos[1], offset: 0, target: 0, ...built });
  }

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(module.size[0] * 1.05, module.size[1] + 0.3, module.size[2] * 1.05),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  );
  hit.position.set(module.pos[0], module.pos[1], module.pos[2]);
  hit.userData.moduleId = module.id;
  scene.add(hit);
  pickables.push(hit);

  const el = document.createElement('div');
  el.className = 'e-label' + (module.kind === 'core' || module.kind === 'screen' ? '' : ' small');
  el.innerHTML = `<span>${module.label}</span><span class="m">${module.meta}</span>`;
  el.addEventListener('click', () => selectModule(module.id));
  const obj = new CSS2DObject(el);
  const yOff = module.kind === 'screen' ? module.size[1] / 2 + 0.8 : module.size[1] / 2 + 0.7;
  let lx = module.pos[0];
  let lz = module.pos[2];
  if (module.pos[0] < -6) lx -= 2.4;
  else if (module.pos[0] > 6) lx += 2.4;
  if (module.pos[2] > 6) lz += 1.9;
  obj.position.set(lx, module.pos[1] + yOff, lz);
  scene.add(obj);
  labels.set(module.id, el);
}

// ---------- 状态 ----------
const state = {
  modules: Object.fromEntries(MODULES.map((m) => [m.id, true])),
  page: 'face',
  sensors: { temp: 26.5, humi: 55, pres: 1013, hr: 72, steps: 7200, bat: 86 },
  ota: { running: false, version: 'V2.6', progress: 0 },
  selected: null,
};

const powerOn = () => state.modules.hp4570 && state.modules.battery;
const screenOn = () => state.modules.screen && powerOn();
const touchOn = () => state.modules.touch && screenOn();
const tempOn = () => state.modules.aht21 && powerOn();
const hrOn = () => state.modules.em7028 && powerOn();
const presOn = () => state.modules.spl06 && powerOn();
const stepOn = () => state.modules.mpu6050 && powerOn();

const otaOn = () => state.modules.bt && state.modules.w25q && powerOn();

let currentChapter = 0;
let camTween = null;

function flyTo(position, target, duration = 1.2) {
  camTween = { t: 0, dur: duration, fromPos: camera.position.clone(), toPos: new THREE.Vector3(...position), fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(...target) };
  controls.enabled = false;
}

// ---------- 3D 屏纹理 ----------
function drawScreen() {
  const ctx = screenCtx;
  ctx.fillStyle = '#020608'; ctx.fillRect(0, 0, 240, 280);
  if (!screenOn()) {
    ctx.fillStyle = '#25424a'; ctx.font = '600 16px "Cascadia Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('NO SIGNAL', 120, 132);
    ctx.font = '10px "Cascadia Mono", monospace';
    ctx.fillText(state.modules.power ? 'SCREEN MODULE UNPLUGGED' : 'POWER MODULE UNPLUGGED', 120, 156);
    ctx.textAlign = 'left'; screenTex.needsUpdate = true; return;
  }
  const now = new Date();
  ctx.fillStyle = '#eafcff'; ctx.font = '600 46px "Cascadia Mono", monospace';
  ctx.fillText(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, 18, 66);
  ctx.fillStyle = '#7fa8b2'; ctx.font = '11px "Microsoft YaHei", sans-serif';
  ctx.fillText('EC-S100 · 演示台', 18, 88);
  const s = state.sensors;
  if (state.page === 'face') {
    ctx.fillStyle = '#4fd1ff'; ctx.font = '600 13px "Cascadia Mono", monospace';
    ctx.fillText(`HR ${hrOn() ? Math.round(s.hr) : '--'}`, 18, 132);
    ctx.fillText(`STEP ${stepOn() ? s.steps : '--'}`, 18, 156);
    ctx.fillText(`BAT ${powerOn() ? Math.round(s.bat) + '%' : '--'}`, 18, 180);
    ctx.fillStyle = '#3ff0c8'; ctx.fillRect(18, 200, powerOn() ? 204 * (s.bat / 100) : 4, 4);
  } else if (state.page === 'heart') {
    ctx.fillStyle = '#ff7b8a'; ctx.font = '600 40px "Cascadia Mono", monospace';
    ctx.fillText(hrOn() ? Math.round(s.hr) : '--', 18, 150);
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillText('BPM · 心率', 18, 170);
  } else if (state.page === 'ota') {
    ctx.fillStyle = '#ffb347'; ctx.font = '600 12px "Cascadia Mono", monospace';
    ctx.fillText(`OTA ${state.ota.progress}%`, 18, 132);
    ctx.fillStyle = 'rgba(79,209,255,0.15)'; ctx.fillRect(18, 148, 204, 8);
    ctx.fillStyle = '#4fd1ff'; ctx.fillRect(18, 148, 204 * (state.ota.progress / 100), 8);
  } else if (state.page === 'menu') {
    for (let i = 0; i < 9; i += 1) {
      const x = 18 + (i % 3) * 70, y = 112 + Math.floor(i / 3) * 54;
      ctx.strokeStyle = 'rgba(79,209,255,0.35)'; ctx.strokeRect(x, y, 56, 40);
    }
  } else {
    ctx.fillStyle = '#8fb7c0'; ctx.font = '13px "Microsoft YaHei", sans-serif';
    ctx.fillText('PAGE', 18, 132);
  }
  ctx.fillStyle = '#6f969f'; ctx.font = '9px "Cascadia Mono", monospace';
  ctx.fillText('STM32F411 · FREERTOS · LVGL', 18, 262);
  screenTex.needsUpdate = true;
}

// ---------- HTML 屏幕 ----------
const screenEl = document.getElementById('e-screen');
const pages = [...screenEl.querySelectorAll('.e-page')];

function showPage(page) {
  state.page = page;
  pages.forEach((el) => { el.hidden = el.dataset.page !== page; });
  drawScreen();
}

function updateOffText() {
  const el = screenEl.querySelector('.e-off span');
  if (el) el.textContent = powerOn() ? '屏幕模块未插入' : '电源模块未插入';
}

function bindSensors() {
  const s = state.sensors;
  const set = (key, value) => document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => { el.textContent = value; });
  const now = new Date();
  set('time', `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  set('date', `${now.getMonth() + 1}月${now.getDate()}日 ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]}`);
  const tOn = tempOn(), hOn = hrOn(), pOn = presOn(), stOn = stepOn(), pw = powerOn();
  set('temp-face', tOn ? `${s.temp.toFixed(1)}°C` : '--');
  set('hr-face', hOn ? String(Math.round(s.hr)) : '--');
  set('steps-face', stOn ? String(s.steps) : '--');
  set('bat-face', pw ? `${Math.round(s.bat)}%` : '--');
  set('hr-bpm', hOn ? String(Math.round(s.hr)) : '--');
  set('temp-msg', tOn ? `${s.temp.toFixed(1)}°C` : '--');
  set('hr-msg', hOn ? String(Math.round(s.hr)) : '--');
  set('steps-msg', stOn ? `${s.steps} ppm` : '--');
  set('pres-msg', pOn ? `${Math.round(s.pres)} hPa` : '--');
  set('ota-version', state.ota.version);
  document.getElementById('sim-temp').disabled = !tOn;
  document.getElementById('sim-humi').disabled = !tOn;
  document.getElementById('sim-pres').disabled = !pOn;
  document.getElementById('sim-hr').disabled = !hOn;
  document.getElementById('sim-steps').disabled = !stOn;
  document.getElementById('sim-bat').disabled = !pw;
  updateOffText();
  drawScreen();
}

screenEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-go]');
  if (!target || !screenOn() || !touchOn()) return;
  showPage(target.dataset.go);
});
document.querySelectorAll('[data-go]').forEach((btn) => {
  btn.addEventListener('click', (event) => { event.stopPropagation(); if (screenOn() && touchOn()) showPage(btn.dataset.go); });
});

const sims = [
  ['temp', 'sim-temp', 'out-temp', (v) => v.toFixed(1)],
  ['humi', 'sim-humi', 'out-humi', (v) => String(Math.round(v))],
  ['pres', 'sim-pres', 'out-pres', (v) => String(Math.round(v))],
  ['hr', 'sim-hr', 'out-hr', (v) => String(Math.round(v))],
  ['steps', 'sim-steps', 'out-steps', (v) => String(Math.round(v))],
  ['bat', 'sim-bat', 'out-bat', (v) => String(Math.round(v))],
];
sims.forEach(([key, inputId, outputId, fmt]) => {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);
  input.addEventListener('input', () => {
    state.sensors[key] = Number(input.value);
    output.textContent = fmt(Number(input.value));
    bindSensors();
  });
});

let heartTimer = null;
document.getElementById('e-start-heart')?.addEventListener('click', () => {
  if (!screenOn() || !hrOn() || heartTimer) return;
  const note = document.querySelector('[data-page="heart"] .e-note');
  if (note) note.textContent = '检测中… 请保持手指贴合';
  let ticks = 0;
  heartTimer = setInterval(() => {
    ticks += 1;
    state.sensors.hr = Math.max(45, Math.min(150, state.sensors.hr + 6 * Math.sin(ticks * 1.7) + (ticks % 2 ? 3 : -2)));
    bindSensors();
    if (ticks > 12) { clearInterval(heartTimer); heartTimer = null; if (note) note.textContent = 'EM7028 · 20ms 采样\n原始 ADC 右移 2 位后进入心跳算法'; }
  }, 220);
});

// ---------- 模块列表 / 插拔 ----------
const moduleList = document.getElementById('e-mod-list');
const modulePlugBtn = document.getElementById('e-mod-plug');

function statusText(id) {
  if (id === 'core') return '常驻';
  return state.modules[id] ? '已插入' : '未插入';
}

function renderModuleList() {
  moduleList.innerHTML = '';
  MODULES.forEach((module) => {
    const row = document.createElement('div');
    row.className = 'e-mod-row' + (state.selected === module.id ? ' active' : '') + (module.id !== 'core' && !state.modules[module.id] ? ' off' : '');
    row.dataset.module = module.id;
    row.innerHTML = `<div class="e-mod-name"><b>${module.label}</b><span>${module.meta}</span></div><span class="e-mod-status">${statusText(module.id)}</span>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'e-mod-toggle';
    btn.textContent = module.id === 'core' ? '—' : (state.modules[module.id] ? '拔出' : '插入');
    btn.disabled = module.id === 'core';
    btn.addEventListener('click', (event) => { event.stopPropagation(); toggleModule(module.id); });
    row.appendChild(btn);
    row.addEventListener('click', () => selectModule(module.id));
    moduleList.appendChild(row);
  });
}

function updateAllButton() {
  const ids = MODULES.filter((m) => m.id !== 'core').map((m) => m.id);
  const allOn = ids.every((id) => state.modules[id]);
  const btn = document.querySelector('[data-act="plug"]');
  if (btn) btn.textContent = allOn ? '全部拔出' : '全部插入';
}

function updatePinLabels(module) {
  while (pinLabelObjects.length) {
    const obj = pinLabelObjects.pop();
    obj.parent?.remove(obj);
  }
  if (!module || !module.header) return;
  const [w, , d] = module.size;
  const hp = moduleHeaderPos(module);
  const count = module.header.count;
  const group = moduleGroups.get(module.id)?.group;
  if (!group) return;
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    const el = document.createElement('div');
    el.className = 'e-pin-label';
    el.textContent = `${i + 1} ${module.pins[i]?.[0] ?? ''}`;
    const obj = new CSS2DObject(el);
    if (module.kind === 'screen') {
      obj.position.set(t * w * 0.8, -module.size[1] / 2 - 0.5, 0.7);
    } else {
      const spread = (i - (count - 1) / 2) * 0.95;
      if (hp.axis === 'x') {
        obj.position.set(spread, 0.55, hp.z >= 0 ? d / 2 + 1.1 : -d / 2 - 1.1);
      } else {
        obj.position.set(hp.x >= 0 ? w / 2 + 1.1 : -w / 2 - 1.1, 0.55, spread);
      }
    }
    group.add(obj);
    pinLabelObjects.push(obj);
  }
}

function selectModule(id) {
  state.selected = id;
  const module = MODULE_MAP[id];
  if (!module) return;
  switchTab('module');
  document.getElementById('e-mod-detail').hidden = false;
  document.getElementById('e-mod-title').textContent = module.label;
  document.getElementById('e-mod-meta').textContent = module.meta;
  document.getElementById('e-mod-desc').textContent = `${module.what} ${module.does} ${module.how}`;
  const table = document.getElementById('e-mod-pins');
  table.innerHTML = '<table><thead><tr><th>#</th><th>引脚</th><th>说明</th></tr></thead><tbody>' +
    module.pins.map((p, i) => `<tr><td>${i + 1}</td><td>${p[0]}</td><td>${p[1]}</td></tr>`).join('') +
    '</tbody></table>';
  modulePlugBtn.disabled = id === 'core';
  modulePlugBtn.textContent = id === 'core' ? '核心板常驻' : (state.modules[id] ? '拔出模块' : '插入模块');
  renderModuleList();
  moduleGroups.forEach((value, mid) => {
    value.setState?.({ dim: mid !== id });
    labels.get(mid)?.classList.toggle('hot', mid === id);
    labels.get(mid)?.classList.toggle('dim', mid !== id);
  });
  updatePinLabels(module);
}

function toggleModule(id) {
  if (id === 'core') return;
  state.modules[id] = !state.modules[id];
  const entry = moduleGroups.get(id);
  if (entry) entry.target = state.modules[id] ? 0 : 2.4;
  labels.get(id)?.classList.toggle('dim', !state.modules[id]);
  if (state.ota.running && !otaOn()) {
    state.ota.running = false;
    document.getElementById('e-ota-state').textContent = '缺少模块 · OTA 已中止';
  }
  bindSensors();
  screenEl.classList.toggle('is-off', !screenOn());
  updateOffText();
  drawScreen();
  renderModuleList();
  updateAllButton();
  if (state.selected === id) selectModule(id);
}

function toggleAll() {
  const ids = MODULES.filter((m) => m.id !== 'core').map((m) => m.id);
  const allOn = ids.every((id) => state.modules[id]);
  ids.forEach((id) => {
    state.modules[id] = !allOn;
    const entry = moduleGroups.get(id);
    if (entry) entry.target = allOn ? 2.4 : 0;
    labels.get(id)?.classList.toggle('dim', allOn);
  });
  state.ota.running = false;
  bindSensors();
  screenEl.classList.toggle('is-off', !screenOn());
  updateOffText();
  drawScreen();
  renderModuleList();
  updateAllButton();
  if (state.selected) selectModule(state.selected);
}

modulePlugBtn?.addEventListener('click', () => { if (state.selected) toggleModule(state.selected); });

// ---------- OTA ----------
const otaLog = [...document.querySelectorAll('#e-ota-log li')];
const otaBar = document.getElementById('e-ota-bar');
const otaBar2 = document.getElementById('e-ota-bar-2');
const otaState = document.getElementById('e-ota-state');
const otaText = document.querySelector('[data-bind="ota-text"]');

function setOtaProgress(v) {
  state.ota.progress = Math.round(v);
  if (otaBar) otaBar.style.width = `${state.ota.progress}%`;
  if (otaBar2) otaBar2.style.width = `${state.ota.progress}%`;
  drawScreen();
}
function setOtaStep(index) {
  otaLog.forEach((li, i) => { li.classList.toggle('done', i < index); li.classList.toggle('active', i === index); });
}

function runOta() {
  if (!otaOn()) { otaState.textContent = '缺少蓝牙 / 存储 / 电源模块'; return; }
  if (state.ota.running) return;
  state.ota.running = true;
  state.ota.version = 'V2.6';
  setOtaStep(0); setOtaProgress(0);
  otaState.textContent = '收到命令 · 等待确认';
  if (otaText) otaText.textContent = '收到 0x11 0x22 0x33，等待确认';
  bindSensors(); showPage('ota');

  setTimeout(() => {
    if (!state.ota.running) return;
    setOtaStep(1); otaState.textContent = 'USART1 · YMODEM 接收';
    let p = 0;
    const timer = setInterval(() => {
      if (!state.ota.running) { clearInterval(timer); return; }
      p = Math.min(100, p + 5); setOtaProgress(p);
      if (otaText) otaText.textContent = `YMODEM 接收 ${p}%`;
      if (p >= 100) {
        clearInterval(timer); setOtaStep(2); otaState.textContent = '写入 W25Q 外部 Flash';
        let q = 0;
        const t2 = setInterval(() => {
          if (!state.ota.running) { clearInterval(t2); return; }
          q = Math.min(100, q + 7); setOtaProgress(q);
          if (otaText) otaText.textContent = `写入 W25Q ${q}%`;
          if (q >= 100) {
            clearInterval(t2); setOtaStep(3); otaState.textContent = '写 App 标志区 0x08008000';
            setTimeout(() => {
              if (!state.ota.running) return;
              setOtaStep(4); otaState.textContent = '软复位 · Bootloader 搬运';
              setTimeout(() => {
                if (!state.ota.running) return;
                state.ota.running = false;
                state.ota.version = 'V2.7';
                setOtaProgress(100);
                otaLog.forEach((li) => { li.classList.remove('active'); li.classList.add('done'); });
                otaState.textContent = '完成 · 已升级到 V2.7';
                if (otaText) otaText.textContent = '升级完成，版本 V2.7';
                bindSensors();
              }, 800);
            }, 700);
          }
        }, 80);
      }
    }, 65);
  }, 800);
}
document.getElementById('e-ota-start')?.addEventListener('click', runOta);
document.getElementById('e-start-ota')?.addEventListener('click', runOta);

// ---------- 选项卡 ----------
function switchTab(tab) {
  document.querySelectorAll('#es100-tabs button').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.es100-tab').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
}
document.getElementById('es100-tabs')?.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (btn) switchTab(btn.dataset.tab);
});

// ---------- 章节 ----------
const chapterNav = document.getElementById('es100-chapters');
const chapterNo = document.getElementById('es100-chapter-no');
const chapterTitle = document.getElementById('es100-chapter-title');
const narration = document.getElementById('es100-narration');

CHAPTERS.forEach((chapter, index) => {
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'es100-tab-btn';
  btn.innerHTML = `<span class="no">${chapter.no}</span>${chapter.title}`;
  btn.addEventListener('click', () => selectChapter(index));
  chapterNav.appendChild(btn);
});

function applyFocus(chapter) {
  const focus = new Set(chapter.focus);
  const all = focus.has('*');
  MODULES.forEach((module) => {
    const dim = !all && !focus.has(module.id);
    moduleGroups.get(module.id)?.setState?.({ dim });
    labels.get(module.id)?.classList.toggle('dim', dim);
  });
}

function selectChapter(index) {
  currentChapter = (index + CHAPTERS.length) % CHAPTERS.length;
  const chapter = CHAPTERS[currentChapter];
  chapterNo.textContent = `CHAPTER ${chapter.no} / ${String(CHAPTERS.length).padStart(2, '0')}`;
  chapterTitle.textContent = chapter.title;
  narration.textContent = chapter.narration;
  document.querySelectorAll('.es100-tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === currentChapter));
  flyTo(chapter.camera, chapter.target);
  applyFocus(chapter);
}

document.getElementById('es100-prev')?.addEventListener('click', () => selectChapter(currentChapter - 1));
document.getElementById('es100-next')?.addEventListener('click', () => selectChapter(currentChapter + 1));

// ---------- 工具条 ----------
let labelsOn = true;
let edgesOn = true;
document.querySelector('.es100-rail')?.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === 'labels') { labelsOn = !labelsOn; stage.classList.toggle('no-labels', !labelsOn); btn.classList.toggle('active', labelsOn); }
  if (act === 'edges') { edgesOn = !edgesOn; edgeObjects.forEach((e) => { e.visible = edgesOn; }); btn.classList.toggle('active', edgesOn); }
  if (act === 'plug') toggleAll();
  if (act === 'rotate') { controls.autoRotate = !controls.autoRotate; btn.classList.toggle('active', controls.autoRotate); }
  if (act === 'reset') { const chapter = CHAPTERS[currentChapter]; flyTo(chapter.camera, chapter.target, 0.8); }
});

// ---------- 数据流 ----------
const flowMat = new THREE.PointsMaterial({ size: 0.15, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
function makeCurve(points) { return new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))); }
const flows = [
  { id: 'sensor', color: 0x3ff0c8, curve: makeCurve([[-11, 1.8, -5], [-6, 2.2, -2], [0, 1.8, 0]]), count: 12, deps: ['aht21'] },
  { id: 'storage', color: 0x4ade80, curve: makeCurve([[11, 1.8, -2.5], [6, 2.2, -1], [0, 1.8, 0]]), count: 10, deps: ['w25q'] },
  { id: 'bt', color: 0xffb347, curve: makeCurve([[11, 1.8, 5], [6, 2.2, 3], [0, 1.8, 0]]), count: 10, deps: ['bt'] },
  { id: 'screen', color: 0x4fd1ff, curve: makeCurve([[0, 1.8, 0], [0, 3.2, -4], [0, 5.0, -8], [0, 5.3, -9.2]]), count: 12, deps: ['screen'] },
];
flows.forEach((flow) => {
  const positions = new Float32Array(flow.count * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = flowMat.clone(); mat.color.setHex(flow.color);
  const points = new THREE.Points(geo, mat); scene.add(points);
  flow.points = points; flow.positions = positions; flow.attr = geo.attributes.position; flow.t = Math.random();
});
function updateFlows(dt) {
  flows.forEach((flow) => {
    const visible = powerOn() && flow.deps.every((id) => state.modules[id]);
    flow.points.visible = visible;
    if (!visible) return;
    flow.t = (flow.t + dt * 0.18) % 1;
    for (let i = 0; i < flow.count; i += 1) {
      const p = flow.curve.getPointAt((flow.t + i / flow.count) % 1);
      flow.positions[i * 3] = p.x; flow.positions[i * 3 + 1] = p.y; flow.positions[i * 3 + 2] = p.z;
    }
    flow.attr.needsUpdate = true;
  });
}

// ---------- 拾取 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

function pick(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  return hits.length ? hits[0].object : null;
}

function setHover(id) {
  pickables.forEach((hit) => labels.get(hit.userData.moduleId)?.classList.toggle('hot', hit.userData.moduleId === id));
  renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
}
renderer.domElement.addEventListener('pointermove', (event) => {
  const hit = pick(event.clientX, event.clientY);
  setHover(hit ? hit.userData.moduleId : null);
});
renderer.domElement.addEventListener('pointerdown', (event) => { pointerDown = { x: event.clientX, y: event.clientY }; });
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const dx = event.clientX - pointerDown.x, dy = event.clientY - pointerDown.y;
  pointerDown = null;
  if (Math.hypot(dx, dy) > 6) return;
  const hit = pick(event.clientX, event.clientY);
  if (hit) selectModule(hit.userData.moduleId);
});

// ---------- 尺寸 / 动画 ----------
function onResize() {
  const w = W(), h = H();
  if (!w || !h) return;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); labelRenderer.setSize(w, h);
}
const ro = new ResizeObserver(onResize); ro.observe(stage);

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (camTween) {
    camTween.t += dt;
    const k = Math.min(1, camTween.t / camTween.dur);
    const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, ease);
    controls.target.lerpVectors(camTween.fromTarget, camTween.toTarget, ease);
    if (k >= 1) { camTween = null; controls.enabled = true; }
  }

  moduleGroups.forEach((entry) => {
    if (!entry.module.header) return;
    entry.offset += (entry.target - entry.offset) * Math.min(1, dt * 6);
    entry.group.position.y = entry.baseY + entry.offset;
  });

  controls.update();
  updateFlows(dt);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ---------- 启动 ----------
renderModuleList();
updateAllButton();
bindSensors();
selectChapter(0);
drawScreen();
renderer.domElement.style.cursor = 'grab';
window.__ES100 = { state, showPage, drawScreen, toggleModule };
animate();
