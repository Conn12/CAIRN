import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BLOCKS, BLOCK_MAP, CHAPTERS, FLOWS, TRACES } from './content.js';
import { INFO, TRACE_INFO } from './info.js';
import { buildModule, buildTrace, PolylineCurve, createPcbTexture, createDieTexture } from './geometry.js';

const stage = document.getElementById('mcu-stage');
const viewport = document.getElementById('viewport');
const W = () => stage.clientWidth;
const H = () => stage.clientHeight;

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
viewport.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W(), H());
labelRenderer.domElement.className = 'label-layer';
labelRenderer.domElement.style.pointerEvents = 'none';
viewport.appendChild(labelRenderer.domElement);

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03080c);
scene.fog = new THREE.FogExp2(0x03080c, 0.01);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 300);
camera.position.set(18, 20, 24);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 9;
controls.maxDistance = 65;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotateSpeed = 0.5;
controls.update();

// ---------- 灯光 ----------
scene.add(new THREE.HemisphereLight(0xa8fff0, 0x051018, 0.9));
scene.add(new THREE.AmbientLight(0x5f8f9a, 0.35));

const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.2);
keyLight.position.set(14, 24, 12);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8fd8ff, 0.8);
fillLight.position.set(-16, 12, -10);
scene.add(fillLight);

const tealLight = new THREE.PointLight(0x3ff0c8, 30, 40, 2);
tealLight.position.set(-12, 10, -8);
scene.add(tealLight);

const goldLight = new THREE.PointLight(0xffb347, 22, 34, 2);
goldLight.position.set(10, 8, 10);
scene.add(goldLight);

const rimLight = new THREE.PointLight(0x4f7bff, 24, 42, 2);
rimLight.position.set(0, 8, -14);
scene.add(rimLight);

// ---------- 地面 / PCB ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 260),
  new THREE.MeshStandardMaterial({ color: 0x040b0f, roughness: 1, metalness: 0 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
scene.add(floor);

const floorGrid = new THREE.GridHelper(90, 90, 0x0f4a40, 0x0a2a26);
floorGrid.position.y = 0.01;
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.3;
scene.add(floorGrid);

const board = new THREE.Mesh(
  new THREE.BoxGeometry(30, 0.6, 21),
  new THREE.MeshStandardMaterial({ color: 0x092a20, roughness: 0.72, metalness: 0.18 }),
);
board.position.y = 0.3;
scene.add(board);

const boardEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(board.geometry),
  new THREE.LineBasicMaterial({ color: 0x2b8f72, transparent: true, opacity: 0.55 }),
);
boardEdges.position.copy(board.position);
scene.add(boardEdges);

const pcbTop = new THREE.Mesh(
  new THREE.PlaneGeometry(29.6, 20.6),
  new THREE.MeshStandardMaterial({ map: createPcbTexture(), roughness: 0.78, metalness: 0.12 }),
);
pcbTop.rotation.x = -Math.PI / 2;
pcbTop.position.y = 0.605;
scene.add(pcbTop);

// 固定螺丝
const screwMat = new THREE.MeshStandardMaterial({ color: 0xb08a4a, metalness: 0.95, roughness: 0.3 });
const slotMat = new THREE.MeshBasicMaterial({ color: 0x1a1408 });
for (const x of [-14.2, 14.2]) {
  for (const z of [-9.7, 9.7]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 20), screwMat);
    screw.position.set(x, 0.62, z);
    scene.add(screw);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.08), slotMat);
    slot.position.set(x, 0.675, z);
    slot.rotation.y = Math.PI / 4;
    scene.add(slot);
  }
}

// 扫描环
const scanRing = new THREE.Mesh(
  new THREE.TorusGeometry(13.6, 0.02, 6, 160),
  new THREE.MeshBasicMaterial({ color: 0x3ff0c8, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false }),
);
scanRing.rotation.x = Math.PI / 2;
scanRing.position.y = 0.66;
scene.add(scanRing);

// ---------- 封装 / 晶圆 ----------
const packageGroup = new THREE.Group();
const packageBody = new THREE.Mesh(
  new THREE.BoxGeometry(24, 0.8, 16.5),
  new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: 0.52, metalness: 0.55 }),
);
packageBody.position.y = 0.95;
packageGroup.add(packageBody);

const packageEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(packageBody.geometry),
  new THREE.LineBasicMaterial({ color: 0x37535c, transparent: true, opacity: 0.7 }),
);
packageEdges.position.copy(packageBody.position);
packageGroup.add(packageEdges);

const pinMat = new THREE.MeshStandardMaterial({ color: 0xc9973f, metalness: 0.95, roughness: 0.28 });
const pinGeoZ = new THREE.BoxGeometry(0.28, 0.08, 0.46);
const pinGeoX = new THREE.BoxGeometry(0.46, 0.08, 0.28);
for (let i = 0; i < 14; i += 1) {
  const t = -10.8 + i * 1.66;
  const a = new THREE.Mesh(pinGeoZ, pinMat);
  a.position.set(t, 0.95, 8.55);
  packageGroup.add(a);
  const b = new THREE.Mesh(pinGeoZ, pinMat);
  b.position.set(t, 0.95, -8.55);
  packageGroup.add(b);
}
for (let i = 0; i < 10; i += 1) {
  const t = -6.6 + i * 1.46;
  const c = new THREE.Mesh(pinGeoX, pinMat);
  c.position.set(12.3, 0.95, t);
  packageGroup.add(c);
  const d = new THREE.Mesh(pinGeoX, pinMat);
  d.position.set(-12.3, 0.95, t);
  packageGroup.add(d);
}
scene.add(packageGroup);

const dieBase = new THREE.Mesh(
  new THREE.BoxGeometry(21.5, 0.12, 14.5),
  new THREE.MeshStandardMaterial({ color: 0x0e2530, metalness: 0.65, roughness: 0.38, emissive: 0x0a2f38, emissiveIntensity: 0.35 }),
);
dieBase.position.y = 1.35;
scene.add(dieBase);

const dieTop = new THREE.Mesh(
  new THREE.PlaneGeometry(21.2, 14.2),
  new THREE.MeshBasicMaterial({ map: createDieTexture(), transparent: true, opacity: 0.9, depthWrite: false }),
);
dieTop.rotation.x = -Math.PI / 2;
dieTop.position.y = 1.416;
scene.add(dieTop);

const dieFrame = new THREE.LineSegments(
  new THREE.EdgesGeometry(dieBase.geometry),
  new THREE.LineBasicMaterial({ color: 0x2f8f78, transparent: true, opacity: 0.55 }),
);
dieFrame.position.copy(dieBase.position);
scene.add(dieFrame);

// 键合线：晶圆焊盘 → 封装引脚
const bondMat = new THREE.LineBasicMaterial({ color: 0xc9973f, transparent: true, opacity: 0.42 });
function addBond(from, to) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.y += 0.22;
  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(14)), bondMat);
  scene.add(line);
}
for (let i = 0; i < 14; i += 1) {
  const x = -10.8 + i * 1.66;
  const dieX = x * 0.9;
  addBond(new THREE.Vector3(dieX, 1.42, 6.9), new THREE.Vector3(x, 1.0, 8.55));
  addBond(new THREE.Vector3(dieX, 1.42, -6.9), new THREE.Vector3(x, 1.0, -8.55));
}
for (let i = 0; i < 10; i += 1) {
  const z = -6.6 + i * 1.46;
  const dieZ = z * 0.9;
  addBond(new THREE.Vector3(10.5, 1.42, dieZ), new THREE.Vector3(12.3, 1.0, z));
  addBond(new THREE.Vector3(-10.5, 1.42, dieZ), new THREE.Vector3(-12.3, 1.0, z));
}

// 晶圆边缘焊盘
for (let i = 0; i < 20; i += 1) {
  const x = -9.8 + (i / 19) * 19.6;
  for (const sign of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.36), pinMat);
    pad.position.set(x, 1.415, sign * 6.9);
    scene.add(pad);
  }
}
for (let i = 0; i < 12; i += 1) {
  const z = -6.1 + (i / 11) * 12.2;
  for (const sign of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.015, 0.2), pinMat);
    pad.position.set(sign * 10.5, 1.415, z);
    scene.add(pad);
  }
}

// 玻璃罩
const glass = new THREE.Mesh(
  new THREE.BoxGeometry(25.5, 5.2, 18),
  new THREE.MeshBasicMaterial({ color: 0x3ff0c8, transparent: true, opacity: 0.025, side: THREE.DoubleSide, depthWrite: false }),
);
glass.position.y = 4.2;
scene.add(glass);

const glassEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(glass.geometry),
  new THREE.LineBasicMaterial({ color: 0x2fd9bd, transparent: true, opacity: 0.18 }),
);
glassEdges.position.copy(glass.position);
scene.add(glassEdges);

// ---------- 模块 ----------
const blockHits = new Map();
const blockMeshList = [];
const moduleVisuals = new Map();
const edgeObjects = [];
const labelObjects = new Map();
const dimStates = new Map();
const traceMats = new Map();
const traceLabelEls = new Map();
const traceHitMeshes = [];
let selectedTraceId = null;

const APB2_IDS = ['gpioa', 'gpiob', 'gpioc', 'gpiod', 'adc1', 'adc2', 'tim1', 'spi1', 'usart1', 'exti'];
const APB1_IDS = ['tim2', 'usart2', 'i2c', 'spi2', 'can', 'usb', 'rtc', 'iwdg'];

function addBlock(spec) {
  const built = buildModule(spec);
  built.group.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
  scene.add(built.group);
  blockHits.set(spec.id, built.hit);
  blockMeshList.push(built.hit);
  moduleVisuals.set(spec.id, built.setState);
  built.edges.forEach((edge) => edgeObjects.push(edge));

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
  const yOff = spec.size[1] / 2 + (spec.mini ? 0.28 : 0.62);
  obj.position.set(spec.pos[0], spec.pos[1] + yOff, spec.pos[2]);
  scene.add(obj);
  labelObjects.set(spec.id, { obj, el, spec });

  el.style.pointerEvents = 'auto';
  el.style.cursor = 'pointer';
  el.addEventListener('click', (event) => {
    event.stopPropagation();
    selectBlock(spec.id);
  });
  el.addEventListener('mouseenter', () => setHover(spec.id));
  el.addEventListener('mouseleave', () => setHover(null));
}

BLOCKS.forEach(addBlock);

// ---------- 走线 ----------
Object.entries(TRACES).forEach(([id, trace]) => {
  const built = buildTrace(trace, id);
  built.group.userData.traceId = id;
  scene.add(built.group);
  traceMats.set(id, built.material);
  built.hits.forEach((hit) => traceHitMeshes.push(hit));

  if (trace.label) {
    const el = document.createElement('div');
    el.className = 'trace-label';
    el.textContent = trace.label;
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      selectTrace(id);
    });
    el.addEventListener('mouseenter', () => setHoverTrace(id));
    el.addEventListener('mouseleave', () => setHoverTrace(null));
    const obj = new CSS2DObject(el);
    obj.position.set(trace.labelPos[0], trace.labelPos[1], trace.labelPos[2]);
    scene.add(obj);
    traceLabelEls.set(id, el);
  }
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
  const streams = spec.segments.map((traceId, index) => {
    const trace = TRACES[traceId];
    const curve = new PolylineCurve(trace.points);
    const positions = new Float32Array(spec.count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: spec.color,
      size: 0.32,
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

function flyTo(position, target, duration = 1.2) {
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
let hoveredTraceId = null;

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
  elDesc.innerHTML = '';
  if (data.what || data.does || data.how) {
    [
      ['是什么', data.what],
      ['做什么', data.does],
      ['怎么用', data.how],
    ].forEach(([label, text]) => {
      if (!text) return;
      const section = document.createElement('div');
      section.className = 'panel-section';
      const heading = document.createElement('div');
      heading.className = 'panel-section-label';
      heading.textContent = label;
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      section.append(heading, paragraph);
      elDesc.appendChild(section);
    });
  } else {
    elDesc.textContent = data.desc || '';
  }
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
    const dim = !showAll && !focus.has(spec.id);
    dimStates.set(spec.id, dim);
    const setState = moduleVisuals.get(spec.id);
    if (setState) {
      setState({ dim, selected: spec.id === selectedId, time: 0 });
    }

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

function clearTraceSelection() {
  if (!selectedTraceId) return;
  const mat = traceMats.get(selectedTraceId);
  if (mat) mat.emissiveIntensity = 0.5;
  const el = traceLabelEls.get(selectedTraceId);
  if (el) el.classList.remove('selected');
  selectedTraceId = null;
}

function selectTrace(id) {
  clearTraceSelection();
  selectedId = null;
  clearSelectedLabel();
  applyBlockState();
  selectedTraceId = id;
  const mat = traceMats.get(id);
  if (mat) mat.emissiveIntensity = 1.4;
  const el = traceLabelEls.get(id);
  if (el) el.classList.add('selected');
  const trace = TRACES[id];
  showPanel({
    label: trace?.label || '总线',
    meta: 'BUS · 总线通路',
    ...(TRACE_INFO[id] || {
      what: '这是一条模块之间的总线通路。',
      does: '在模块之间传输地址、数据或控制信号。',
      how: '硬件自动工作，软件通过外设寄存器访问。',
    }),
    tags: ['总线'],
  });
}

function selectBlock(id) {
  clearTraceSelection();
  selectedId = null;
  clearSelectedLabel();
  applyBlockState();
  selectedId = id;
  const spec = BLOCK_MAP[id];
  if (!spec) return;
  const label = labelObjects.get(id);
  if (label) {
    label.el.classList.remove('hidden');
    label.el.classList.add('selected');
  }
  const setState = moduleVisuals.get(id);
  if (setState) setState({ dim: dimStates.get(id) ?? false, selected: true, time: 0 });
  showPanel({ ...spec, ...(INFO[id] || {}) });
}

function selectChapter(index, animate = true) {
  const count = CHAPTERS.length;
  currentChapter = (index + count) % count;
  const chapter = CHAPTERS[currentChapter];

  manualFlow = null;
  setFlow(chapter.flow);
  selectedId = null;
  clearSelectedLabel();
  clearTraceSelection();
  applyBlockState();
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
    stage.classList.toggle('no-labels', !labelsOn);
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
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(blockMeshList.concat(traceHitMeshes), false);
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

function setHoverTrace(id) {
  if (hoveredTraceId === id) return;
  if (hoveredTraceId) {
    const prev = traceLabelEls.get(hoveredTraceId);
    if (prev) prev.classList.remove('hot');
  }
  hoveredTraceId = id;
  if (hoveredTraceId) {
    const next = traceLabelEls.get(hoveredTraceId);
    if (next) next.classList.add('hot');
    renderer.domElement.style.cursor = 'pointer';
  } else {
    renderer.domElement.style.cursor = 'grab';
  }
}

renderer.domElement.addEventListener('pointermove', (event) => {
  const hit = pick(event.clientX, event.clientY);
  const traceId = hit?.userData.traceId ?? null;
  if (traceId) {
    setHover(null);
    setHoverTrace(traceId);
  } else {
    setHoverTrace(null);
    setHover(hit ? hit.userData.spec.id : null);
  }
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
    if (hit.userData.traceId) selectTrace(hit.userData.traceId);
    else selectBlock(hit.userData.spec.id);
  } else {
    selectedId = null;
    clearSelectedLabel();
    clearTraceSelection();
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
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.45, 0.4, 0.55);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ---------- 尺寸 ----------
function onResize() {
  const width = W();
  const height = H();
  if (width === 0 || height === 0) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
  composer.setSize(width, height);
}
const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(stage);

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

  scanRing.rotation.z += dt * 0.1;
  scanRing.material.opacity = 0.18 + Math.sin(elapsed * 1.3) * 0.05;

  if (selectedId) {
    const setState = moduleVisuals.get(selectedId);
    if (setState) {
      setState({ dim: dimStates.get(selectedId) ?? false, selected: true, time: elapsed });
    }
  }

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
window.__MCU3D_DEBUG = { THREE, renderer, scene, camera, stage, composer, bloomPass, selectBlock, selectTrace };
const hashNo = location.hash.replace('#', '');
const hashIndex = CHAPTERS.findIndex((chapter) => chapter.no === hashNo);
selectChapter(hashIndex >= 0 ? hashIndex : 0, false);
renderer.domElement.style.cursor = 'grab';
window.__MCU3D_READY = true;
animate();
