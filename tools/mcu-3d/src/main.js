import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BLOCKS, BLOCK_MAP, CHAPTERS, FLOWS } from './content.js';

const viewport = document.getElementById('viewport');
const W = () => window.innerWidth;
const H = () => window.innerHeight;

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
viewport.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W(), H());
labelRenderer.domElement.className = 'label-layer';
labelRenderer.domElement.style.pointerEvents = 'none';
viewport.appendChild(labelRenderer.domElement);

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03080c);
scene.fog = new THREE.FogExp2(0x03080c, 0.012);

const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 260);
camera.position.set(15, 13, 16);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4, 0.5);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 7;
controls.maxDistance = 46;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotateSpeed = 0.55;
controls.update();

// ---------- 灯光 ----------
scene.add(new THREE.HemisphereLight(0x9ffbe5, 0x04131a, 0.85));
scene.add(new THREE.AmbientLight(0x4f7f8a, 0.5));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
keyLight.position.set(12, 20, 10);
scene.add(keyLight);

const tealLight = new THREE.PointLight(0x3ff0c8, 60, 28, 2);
tealLight.position.set(-8, 9, -5);
scene.add(tealLight);

const goldLight = new THREE.PointLight(0xffb347, 42, 24, 2);
goldLight.position.set(7, 7, 7);
scene.add(goldLight);

const rimLight = new THREE.PointLight(0x4f7bff, 30, 30, 2);
rimLight.position.set(0, 6, -10);
scene.add(rimLight);

// ---------- 地面 / 台面 ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(240, 240),
  new THREE.MeshStandardMaterial({ color: 0x040b0f, roughness: 1, metalness: 0 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
scene.add(floor);

const floorGrid = new THREE.GridHelper(80, 80, 0x0f4a40, 0x0a2a26);
floorGrid.position.y = 0.01;
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.35;
scene.add(floorGrid);

const board = new THREE.Mesh(
  new THREE.BoxGeometry(28, 0.6, 20),
  new THREE.MeshStandardMaterial({ color: 0x0a3226, roughness: 0.78, metalness: 0.18 }),
);
board.position.y = 0.3;
scene.add(board);

const boardEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(board.geometry),
  new THREE.LineBasicMaterial({ color: 0x2b8f72, transparent: true, opacity: 0.55 }),
);
boardEdges.position.copy(board.position);
scene.add(boardEdges);

const boardGrid = new THREE.GridHelper(26, 26, 0x1b6b55, 0x134a3d);
boardGrid.position.y = 0.62;
boardGrid.material.transparent = true;
boardGrid.material.opacity = 0.28;
scene.add(boardGrid);

// 扫描环
const scanRing = new THREE.Mesh(
  new THREE.TorusGeometry(8.4, 0.018, 6, 120),
  new THREE.MeshBasicMaterial({ color: 0x3ff0c8, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }),
);
scanRing.rotation.x = Math.PI / 2;
scanRing.position.y = 0.66;
scene.add(scanRing);

// ---------- LQFP-48 封装 ----------
const packageGroup = new THREE.Group();
const packageBody = new THREE.Mesh(
  new THREE.BoxGeometry(10.6, 0.9, 10.6),
  new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: 0.52, metalness: 0.5 }),
);
packageBody.position.y = 1.15;
packageGroup.add(packageBody);

const packageEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(packageBody.geometry),
  new THREE.LineBasicMaterial({ color: 0x37535c, transparent: true, opacity: 0.7 }),
);
packageEdges.position.copy(packageBody.position);
packageGroup.add(packageEdges);

const pinMat = new THREE.MeshStandardMaterial({ color: 0xb08a4a, metalness: 0.9, roughness: 0.35, emissive: 0x2a1b08, emissiveIntensity: 0.4 });
const pinGeoX = new THREE.BoxGeometry(0.34, 0.1, 0.52);
const pinGeoZ = new THREE.BoxGeometry(0.52, 0.1, 0.34);
for (let i = 0; i < 12; i += 1) {
  const t = -4.29 + i * 0.78;
  const a = new THREE.Mesh(pinGeoX, pinMat);
  a.position.set(t, 0.98, 5.62);
  packageGroup.add(a);
  const b = new THREE.Mesh(pinGeoX, pinMat);
  b.position.set(t, 0.98, -5.62);
  packageGroup.add(b);
  const c = new THREE.Mesh(pinGeoZ, pinMat);
  c.position.set(5.62, 0.98, t);
  packageGroup.add(c);
  const d = new THREE.Mesh(pinGeoZ, pinMat);
  d.position.set(-5.62, 0.98, t);
  packageGroup.add(d);
}
scene.add(packageGroup);

const dieBase = new THREE.Mesh(
  new THREE.BoxGeometry(9.2, 0.16, 9.2),
  new THREE.MeshStandardMaterial({ color: 0x0d2a33, metalness: 0.6, roughness: 0.4, emissive: 0x0a3f47, emissiveIntensity: 0.35 }),
);
dieBase.position.y = 1.68;
scene.add(dieBase);

// 玻璃罩
const glass = new THREE.Mesh(
  new THREE.BoxGeometry(12.8, 4.8, 12.8),
  new THREE.MeshBasicMaterial({ color: 0x3ff0c8, transparent: true, opacity: 0.028, side: THREE.DoubleSide, depthWrite: false }),
);
glass.position.y = 3.7;
scene.add(glass);

const glassEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(glass.geometry),
  new THREE.LineBasicMaterial({ color: 0x2fd9bd, transparent: true, opacity: 0.2 }),
);
glassEdges.position.copy(glass.position);
scene.add(glassEdges);

// ---------- 模块 ----------
const blockMeshes = new Map();
const edgeObjects = [];
const labelObjects = new Map();
const blockMeshList = [];

const APB2_IDS = ['gpioa', 'gpiob', 'gpioc', 'adc1', 'adc2', 'tim1', 'spi1', 'usart1', 'exti'];
const APB1_IDS = ['tim2', 'usart2', 'i2c', 'spi2', 'can', 'usb', 'rtc', 'iwdg'];

function addBlock(spec) {
  const geo = new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2]);
  const mat = new THREE.MeshStandardMaterial({
    color: spec.color,
    emissive: spec.color,
    emissiveIntensity: spec.ghost ? 0.05 : 0.22,
    metalness: 0.5,
    roughness: 0.34,
    transparent: true,
    opacity: spec.ghost ? 0.3 : 0.94,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
  mesh.userData.spec = spec;
  scene.add(mesh);
  blockMeshes.set(spec.id, mesh);
  blockMeshList.push(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({
      color: spec.ghost ? 0x48616b : 0xa5fff0,
      transparent: true,
      opacity: spec.ghost ? 0.4 : 0.45,
    }),
  );
  mesh.add(edges);
  edgeObjects.push(edges);

  const el = document.createElement('div');
  el.className = 'label' + (spec.mini ? ' mini' : '') + (spec.ghost ? ' ghost' : '');
  const title = document.createElement('span');
  title.className = 'label-title';
  title.textContent = spec.label;
  el.appendChild(title);
  if (spec.meta) {
    const meta = document.createElement('span');
    meta.className = 'label-meta';
    meta.textContent = spec.meta;
    el.appendChild(meta);
  }
  const obj = new CSS2DObject(el);
  const yOff = spec.size[1] / 2 + (spec.mini ? 0.3 : 0.55);
  obj.position.set(spec.pos[0], spec.pos[1] + yOff, spec.pos[2]);
  scene.add(obj);

  labelObjects.set(spec.id, { obj, el, spec });
}

BLOCKS.forEach(addBlock);

// ---------- 连接线 ----------
function pointOf(id) {
  const s = BLOCK_MAP[id];
  return new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]);
}

function makeCurve(fromId, toId) {
  const a = pointOf(fromId);
  const b = pointOf(toId);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += 0.55 + Math.abs(a.y - b.y) * 0.3;
  mid.x += (b.z - a.z) * 0.06;
  return new THREE.CatmullRomCurve3([a, mid, b]);
}

const CONNECTIONS = [
  ['core', 'matrix'],
  ['matrix', 'flashif'],
  ['flashif', 'flash'],
  ['matrix', 'sram'],
  ['matrix', 'fsmc'],
  ['matrix', 'bridge'],
  ['bridge', 'apb2'],
  ['bridge', 'apb1'],
  ['dma1', 'matrix'],
  ['dma2', 'matrix'],
];

const tubeMat = new THREE.MeshBasicMaterial({
  color: 0x1e8f7c,
  transparent: true,
  opacity: 0.22,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
CONNECTIONS.forEach(([a, b]) => {
  const curve = makeCurve(a, b);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 26, 0.032, 6, false), tubeMat);
  scene.add(tube);
});

// RCC 的时钟虚线
const CLOCK_LINKS = [
  ['rcc', 'core'],
  ['rcc', 'matrix'],
  ['rcc', 'bridge'],
  ['rcc', 'apb1'],
  ['rcc', 'apb2'],
];
const clockMat = new THREE.LineDashedMaterial({
  color: 0xfacc15,
  dashSize: 0.28,
  gapSize: 0.22,
  transparent: true,
  opacity: 0.2,
  depthWrite: false,
});
CLOCK_LINKS.forEach(([a, b]) => {
  const curve = makeCurve(a, b);
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
  const line = new THREE.Line(geo, clockMat);
  line.computeLineDistances();
  scene.add(line);
});

// ---------- 数据流粒子 ----------
function makeDotTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.28, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const dotTexture = makeDotTexture();
const flowObjects = new Map();

Object.entries(FLOWS).forEach(([mode, spec]) => {
  const group = new THREE.Group();
  group.visible = false;
  const streams = spec.segments.map(([a, b], index) => {
    const curve = makeCurve(a, b);
    const positions = new Float32Array(spec.count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: spec.color,
      size: 0.3,
      map: dotTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    return { curve, positions, attribute: geo.attributes.position, offset: index * 0.13 };
  });
  scene.add(group);
  flowObjects.set(mode, { group, streams, spec });
});

// ---------- 相机飞行 ----------
let camTween = null;

function flyTo(position, target, duration = 1.1) {
  camTween = {
    t: 0,
    dur: duration,
    fromPos: camera.position.clone(),
    toPos: new THREE.Vector3(position[0], position[1], position[2]),
    fromTarget: controls.target.clone(),
    toTarget: new THREE.Vector3(target[0], target[1], target[2]),
  };
  controls.enabled = false;
}

// ---------- 章节状态 ----------
let currentChapter = 0;
let activeFlow = 'fetch';
let manualFlow = null;
let selectedId = null;
let hoveredId = null;

const elTitle = document.getElementById('panel-title');
const elMeta = document.getElementById('panel-meta');
const elDesc = document.getElementById('panel-desc');
const elTags = document.getElementById('panel-tags');
const elChapterNo = document.getElementById('chapter-no');
const elChapterTitle = document.getElementById('chapter-title');
const elNarration = document.getElementById('narration');
const elChapters = document.getElementById('chapters');
const elFlows = document.getElementById('flows');
const elExtra = document.getElementById('panel-extra');

function showPanel(data) {
  elTitle.textContent = data.label;
  elMeta.textContent = data.meta || '';
  elDesc.textContent = data.desc || '';
  elTags.innerHTML = '';
  (data.tags || []).forEach((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    elTags.appendChild(span);
  });
}

function renderPeripheralIndex(chapter) {
  if (chapter.no !== '04') {
    elExtra.hidden = true;
    elExtra.innerHTML = '';
    return;
  }
  elExtra.hidden = false;
  elExtra.innerHTML = '';
  const groups = [
    ['APB2 · 72MHz', APB2_IDS],
    ['APB1 · 36MHz', APB1_IDS],
  ];
  groups.forEach(([title, ids]) => {
    const heading = document.createElement('div');
    heading.className = 'index-title';
    heading.textContent = title;
    elExtra.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'index-chips';
    ids.forEach((id) => {
      const spec = BLOCK_MAP[id];
      if (!spec) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'index-chip';
      btn.textContent = spec.label;
      btn.addEventListener('click', () => selectBlock(id));
      row.appendChild(btn);
    });
    elExtra.appendChild(row);
  });
}

function setFlow(mode) {
  activeFlow = mode;
  flowObjects.forEach((value, key) => {
    value.group.visible = key === mode;
  });
  document.querySelectorAll('.flow-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const autoChip = document.querySelector('.flow-chip:not([data-mode])');
  if (autoChip) autoChip.classList.toggle('active', manualFlow === null);
}

function applyBlockState() {
  const chapter = CHAPTERS[currentChapter];
  const focus = new Set(chapter.focus);
  const showAll = focus.has('*');

  BLOCKS.forEach((spec) => {
    const mesh = blockMeshes.get(spec.id);
    const dim = !showAll && !focus.has(spec.id);
    const opacity = spec.ghost ? 0.3 : dim ? 0.26 : 0.94;
    const emissive = spec.ghost ? 0.05 : dim ? 0.06 : 0.22;
    mesh.material.opacity = opacity;
    mesh.material.emissiveIntensity = emissive;

    const label = labelObjects.get(spec.id);
    if (!label) return;
    label.el.classList.toggle('dim', dim);

    let visible = true;
    if (spec.mini) visible = false;
    label.el.classList.toggle('hidden', !visible);
  });
}

function clearSelectedLabel() {
  labelObjects.forEach(({ el }) => el.classList.remove('selected'));
}

function selectBlock(id) {
  clearSelectedLabel();
  selectedId = id;
  const spec = BLOCK_MAP[id];
  if (!spec) return;
  const label = labelObjects.get(id);
  if (label) {
    label.el.classList.remove('hidden');
    label.el.classList.add('selected');
  }
  showPanel(spec);
}

function selectChapter(index, animate = true) {
  const count = CHAPTERS.length;
  currentChapter = (index + count) % count;
  const chapter = CHAPTERS[currentChapter];

  manualFlow = null;
  setFlow(chapter.flow);
  applyBlockState();
  selectedId = null;
  clearSelectedLabel();
  if (location.hash !== `#${chapter.no}`) {
    history.replaceState(null, '', `#${chapter.no}`);
  }

  if (animate) flyTo(chapter.camera, chapter.target);
  else {
    camera.position.set(chapter.camera[0], chapter.camera[1], chapter.camera[2]);
    controls.target.set(chapter.target[0], chapter.target[1], chapter.target[2]);
    controls.update();
  }

  elChapterNo.textContent = `CHAPTER ${chapter.no} / ${String(count).padStart(2, '0')}`;
  elChapterTitle.textContent = chapter.title;
  elNarration.textContent = chapter.narration;

  document.querySelectorAll('.chapter-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === currentChapter);
  });

  showPanel({
    label: chapter.title,
    meta: `CHAPTER ${chapter.no}`,
    desc: chapter.narration,
    tags: [],
  });

  renderPeripheralIndex(chapter);
}

// ---------- UI：章节 ----------
CHAPTERS.forEach((chapter, index) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chapter-tab';
  btn.innerHTML = `<span class="tab-no">${chapter.no}</span>${chapter.title}`;
  btn.addEventListener('click', () => selectChapter(index));
  elChapters.appendChild(btn);
});

// ---------- UI：数据流 ----------
const autoChip = document.createElement('button');
autoChip.type = 'button';
autoChip.className = 'flow-chip';
autoChip.textContent = '跟随章节';
autoChip.addEventListener('click', () => {
  manualFlow = null;
  setFlow(CHAPTERS[currentChapter].flow);
});
elFlows.appendChild(autoChip);

Object.entries(FLOWS).forEach(([mode, spec]) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'flow-chip';
  btn.dataset.mode = mode;
  btn.textContent = spec.label;
  btn.style.setProperty('--chip', `#${spec.color.toString(16).padStart(6, '0')}`);
  btn.addEventListener('click', () => {
    manualFlow = mode;
    setFlow(mode);
  });
  elFlows.appendChild(btn);
});

// ---------- UI：按钮 ----------
document.getElementById('prev').addEventListener('click', () => selectChapter(currentChapter - 1));
document.getElementById('next').addEventListener('click', () => selectChapter(currentChapter + 1));

const rail = document.getElementById('rail');
let labelsOn = true;
let edgesOn = true;
let bloomOn = true;

rail.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (!btn) return;

  if (btn.dataset.toggle === 'labels') {
    labelsOn = !labelsOn;
    document.body.classList.toggle('no-labels', !labelsOn);
    btn.classList.toggle('active', labelsOn);
  }
  if (btn.dataset.toggle === 'edges') {
    edgesOn = !edgesOn;
    edgeObjects.forEach((edge) => { edge.visible = edgesOn; });
    btn.classList.toggle('active', edgesOn);
  }
  if (btn.dataset.toggle === 'bloom') {
    bloomOn = !bloomOn;
    btn.classList.toggle('active', bloomOn);
  }
  if (btn.dataset.toggle === 'rotate') {
    controls.autoRotate = !controls.autoRotate;
    btn.classList.toggle('active', controls.autoRotate);
  }
  if (btn.dataset.action === 'reset') {
    const chapter = CHAPTERS[currentChapter];
    flyTo(chapter.camera, chapter.target, 0.8);
  }
});

// ---------- 交互：拾取 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

function pick(clientX, clientY) {
  pointer.x = (clientX / W()) * 2 - 1;
  pointer.y = -(clientY / H()) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(blockMeshList, false);
  return hits.length ? hits[0].object : null;
}

function setHover(id) {
  if (hoveredId === id) return;
  if (hoveredId) {
    const prev = labelObjects.get(hoveredId);
    if (prev) {
      prev.el.classList.remove('hot');
      if (prev.spec.mini) prev.el.classList.add('hidden');
    }
  }
  hoveredId = id;
  if (hoveredId) {
    const next = labelObjects.get(hoveredId);
    if (next) {
      next.el.classList.remove('hidden');
      next.el.classList.add('hot');
    }
    renderer.domElement.style.cursor = 'pointer';
  } else {
    renderer.domElement.style.cursor = 'grab';
  }
}

renderer.domElement.addEventListener('pointermove', (event) => {
  const hit = pick(event.clientX, event.clientY);
  setHover(hit ? hit.userData.spec.id : null);
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const dx = event.clientX - pointerDown.x;
  const dy = event.clientY - pointerDown.y;
  pointerDown = null;
  if (Math.hypot(dx, dy) > 6) return;

  const hit = pick(event.clientX, event.clientY);
  if (hit) {
    selectBlock(hit.userData.spec.id);
  } else {
    selectedId = null;
    clearSelectedLabel();
    applyBlockState();
    const chapter = CHAPTERS[currentChapter];
    showPanel({
      label: chapter.title,
      meta: `CHAPTER ${chapter.no}`,
      desc: chapter.narration,
      tags: [],
    });
  }
});

// ---------- 键盘 ----------
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') selectChapter(currentChapter + 1);
  if (event.key === 'ArrowLeft') selectChapter(currentChapter - 1);
});

// ---------- 后期 ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.75, 0.55, 0.32);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ---------- 尺寸 ----------
function onResize() {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
  labelRenderer.setSize(W(), H());
  composer.setSize(W(), H());
}
window.addEventListener('resize', onResize);

// ---------- 动画 ----------
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
    if (k >= 1) {
      camTween = null;
      controls.enabled = true;
    }
  }

  controls.update();

  // 扫描环缓慢旋转
  scanRing.rotation.z += dt * 0.12;
  scanRing.material.opacity = 0.2 + Math.sin(elapsed * 1.4) * 0.06;

  // 选中模块呼吸
  if (selectedId) {
    const mesh = blockMeshes.get(selectedId);
    if (mesh) {
      const spec = mesh.userData.spec;
      mesh.material.emissiveIntensity = 0.34 + Math.sin(elapsed * 4.2) * 0.14;
      if (spec.ghost) mesh.material.emissiveIntensity = 0.12 + Math.sin(elapsed * 4.2) * 0.06;
    }
  }

  // 数据流粒子
  flowObjects.forEach(({ group, streams, spec }) => {
    if (!group.visible) return;
    for (const stream of streams) {
      const n = spec.count;
      for (let i = 0; i < n; i += 1) {
        const u = (elapsed * spec.speed + stream.offset + i / n) % 1;
        const p = stream.curve.getPointAt(u);
        stream.positions[i * 3] = p.x;
        stream.positions[i * 3 + 1] = p.y;
        stream.positions[i * 3 + 2] = p.z;
      }
      stream.attribute.needsUpdate = true;
    }
  });

  if (bloomOn) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  labelRenderer.render(scene, camera);
}

// ---------- 启动 ----------
const hashNo = location.hash.replace('#', '');
const hashIndex = CHAPTERS.findIndex((chapter) => chapter.no === hashNo);
selectChapter(hashIndex >= 0 ? hashIndex : 0, false);
renderer.domElement.style.cursor = 'grab';
window.__MCU3D_READY = true;
animate();
