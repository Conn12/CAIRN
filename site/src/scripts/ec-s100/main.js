import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PARTS, PART_MAP, CHAPTERS } from './content.js';

const stage = document.getElementById('es100-stage');
const viewport = document.getElementById('es100-viewport');
const W = () => stage.clientWidth;
const H = () => stage.clientHeight;

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
viewport.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W(), H());
labelRenderer.domElement.className = 'es100-label-layer';
labelRenderer.domElement.style.pointerEvents = 'none';
viewport.appendChild(labelRenderer.domElement);

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04090c);
scene.fog = new THREE.FogExp2(0x04090c, 0.012);

const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 220);
camera.position.set(18, 16, 22);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 52;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotateSpeed = 0.5;
controls.update();

// ---------- 灯光 ----------
scene.add(new THREE.HemisphereLight(0xa8fff0, 0x051018, 1.12));
scene.add(new THREE.AmbientLight(0x5f8f9a, 0.45));

const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.9);
keyLight.position.set(14, 24, 12);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8fd8ff, 0.9);
fillLight.position.set(-16, 12, -10);
scene.add(fillLight);

const cyanLight = new THREE.PointLight(0x4fd1ff, 55, 40, 2);
cyanLight.position.set(-10, 10, -8);
scene.add(cyanLight);

const goldLight = new THREE.PointLight(0xffb347, 38, 34, 2);
goldLight.position.set(10, 8, 10);
scene.add(goldLight);

// ---------- 材质 / 工具 ----------
const goldMat = new THREE.MeshStandardMaterial({ color: 0xb08238, metalness: 0.9, roughness: 0.36 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x12161c, metalness: 0.7, roughness: 0.34 });
const silverMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.95, roughness: 0.22 });

const shadowTex = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

function addShadow(group, w, d, y, z = 0) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.2, d * 1.2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, y, z);
  group.add(plane);
}

function boardTexture(base, trace, silk) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 1024);
  let seed = 20261103;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }
  for (let n = 0; n < 70; n += 1) {
    let x = rnd() * 1024;
    let y = rnd() * 1024;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 3; s += 1) {
      if (rnd() > 0.5) x += rnd() > 0.5 ? 40 + rnd() * 120 : -(40 + rnd() * 120);
      else y += rnd() > 0.5 ? 40 + rnd() * 120 : -(40 + rnd() * 120);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = trace;
    ctx.lineWidth = 1 + rnd() * 2;
    ctx.stroke();
  }
  for (let n = 0; n < 120; n += 1) {
    const x = rnd() * 1024;
    const y = rnd() * 1024;
    const r = 2 + rnd() * 4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(201,151,63,0.16)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(4,16,12,0.8)'; ctx.fill();
  }
  ctx.fillStyle = silk;
  ctx.font = '600 24px "Cascadia Mono", Consolas, monospace';
  ctx.fillText('EC-S100 · STM32F411CEU6', 40, 956);
  ctx.font = '500 16px "Cascadia Mono", Consolas, monospace';
  ctx.fillText('EXPANSION BOARD · REV 2.6', 40, 986);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------- 场景骨架 ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 220),
  new THREE.MeshStandardMaterial({ color: 0x040b0f, roughness: 1, metalness: 0 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.03;
scene.add(floor);

const floorGrid = new THREE.GridHelper(80, 80, 0x0f4a50, 0x0a2a30);
floorGrid.position.y = 0.01;
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.3;
scene.add(floorGrid);

const mat = new THREE.Mesh(
  new THREE.BoxGeometry(34, 0.3, 26),
  new THREE.MeshStandardMaterial({ color: 0x071014, roughness: 0.9, metalness: 0.1 }),
);
mat.position.y = 0.15;
scene.add(mat);

// 主控板
const mainBoard = new THREE.Group();
const mainPcb = new THREE.Mesh(
  new RoundedBoxGeometry(30, 0.6, 18, 2, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x0f3c52, roughness: 0.72, metalness: 0.18 }),
);
mainPcb.position.y = 0.7;
mainBoard.add(mainPcb);
mainPcb.material.color.setHex(0x0f3c52);
const mainTop = new THREE.Mesh(
  new THREE.PlaneGeometry(29.4, 17.4),
  new THREE.MeshStandardMaterial({ map: boardTexture('#0c2b3d', 'rgba(79,209,255,0.22)', 'rgba(160,220,240,0.2)'), roughness: 0.8, metalness: 0.12 }),
);
mainTop.rotation.x = -Math.PI / 2;
mainTop.position.y = 1.005;
mainBoard.add(mainTop);
addShadow(mainBoard, 30, 18, 0.38);
scene.add(mainBoard);

// 四根排针
for (const x of [-9, 9]) {
  for (const z of [-4.5, 4.0]) {
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.1, 0.9), darkMat);
    header.position.set(x, 1.95, z);
    scene.add(header);
    for (let i = 0; i < 6; i += 1) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.12), goldMat);
      pin.position.set(x - 0.3 + (i % 3) * 0.3, 3.02, z - 0.3 + Math.floor(i / 3) * 0.3);
      scene.add(pin);
    }
  }
}

// 扩展板 + 屏幕（可插拔）
const RIG_BASE = 0.35;
const rig = new THREE.Group();
rig.position.y = RIG_BASE;
scene.add(rig);

const expPcb = new THREE.Mesh(
  new RoundedBoxGeometry(24, 0.5, 13, 2, 0.07),
  new THREE.MeshStandardMaterial({ color: 0x115039, roughness: 0.72, metalness: 0.18 }),
);
expPcb.position.set(0, 2.9, -1);
rig.add(expPcb);
const expTop = new THREE.Mesh(
  new THREE.PlaneGeometry(23.4, 12.4),
  new THREE.MeshStandardMaterial({ map: boardTexture('#0e3a2b', 'rgba(63,240,200,0.22)', 'rgba(160,240,210,0.2)'), roughness: 0.8, metalness: 0.12 }),
);
expTop.rotation.x = -Math.PI / 2;
expTop.position.set(0, 3.155, -1);
rig.add(expTop);
addShadow(rig, 24, 13, 2.6, -1);

// 屏幕模块
const screenGroup = new THREE.Group();
screenGroup.position.set(0, 7.7, -6.8);
const screenPcb = new THREE.Mesh(new RoundedBoxGeometry(7.0, 9.0, 0.5, 2, 0.06), new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: 0.5, metalness: 0.5 }));
screenGroup.add(screenPcb);
const bezel = new THREE.Mesh(new RoundedBoxGeometry(6.6, 7.6, 0.28, 2, 0.04), new THREE.MeshStandardMaterial({ color: 0x020405, roughness: 0.35, metalness: 0.3 }));
bezel.position.z = 0.3;
screenGroup.add(bezel);

const screenCanvas = document.createElement('canvas');
screenCanvas.width = 240;
screenCanvas.height = 280;
const screenCtx = screenCanvas.getContext('2d');
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = 8;
const screenPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(6.0, 7.0),
  new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
);
screenPlane.position.z = 0.46;
screenGroup.add(screenPlane);

// 屏幕排线
const ribbon = new THREE.Mesh(
  new THREE.BoxGeometry(2.6, 0.08, 0.06),
  new THREE.MeshStandardMaterial({ color: 0xb06a2a, metalness: 0.3, roughness: 0.6 }),
);
ribbon.position.set(0, -4.5, 0.2);
screenGroup.add(ribbon);
rig.add(screenGroup);

// 屏幕模块的立座
const stand = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 1.2), darkMat);
stand.position.set(0, 3.25, -6.8);
rig.add(stand);

// ---------- 器件 ----------
const pickables = [];
const partVisuals = new Map();
const labelEls = new Map();
const edgeObjects = [];
const dimStates = new Map();

function rounded(w, h, d, r = 0.04) {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2));
}

function makeChip(part) {
  const [w, h, d] = part.size;
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x11151b, metalness: 0.7, roughness: 0.34 });
  const body = new THREE.Mesh(rounded(w, h, d, 0.05), bodyMat);
  group.add(body);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x0b0e12, metalness: 0.85, roughness: 0.24, emissive: part.color, emissiveIntensity: 0.28 });
  const lid = new THREE.Mesh(rounded(w * 0.8, 0.03, d * 0.78, 0.015), lidMat);
  lid.position.y = h / 2 + 0.015;
  group.add(lid);
  for (let i = 0; i < 3; i += 1) {
    const x = -w * 0.3 + i * w * 0.3;
    for (const sign of [-1, 1]) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.16), goldMat);
      pin.position.set(x, -h / 2 + 0.02, sign * (d / 2 + 0.05));
      group.add(pin);
    }
  }
  addShadow(group, w, d, -h / 2 - 0.012);
  const edgeMat = new THREE.LineBasicMaterial({ color: part.color, transparent: true, opacity: 0.45 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat);
  group.add(edges);
  edgeObjects.push(edges);
  return { group, bodyMat, lidMat, edgeMat };
}

function buildPart(part) {
  if (part.id === 'screen') {
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2] + 0.4),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    );
    hit.position.set(part.pos[0], part.pos[1], part.pos[2]);
    hit.userData.partId = part.id;
    rig.add(hit);
    pickables.push(hit);
    partVisuals.set(part.id, {
      setState: ({ dim = false, selected = false } = {}) => {
        screenPlane.material.opacity = dim ? 0.5 : 1;
        screenPlane.material.transparent = true;
        screenGroup.scale.setScalar(selected ? 1.03 : 1);
      },
    });
    return;
  }

  const built = part.id === 'motor'
    ? (() => {
        const g = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.8, roughness: 0.3, emissive: part.color, emissiveIntensity: 0.15 });
        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(part.size[0] / 2, part.size[0] / 2, part.size[1], 24), mat);
        g.add(cylinder);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(part.size[0] / 2.4, part.size[0] / 2.4, 0.04, 24), goldMat);
        cap.position.y = part.size[1] / 2 + 0.02;
        g.add(cap);
        return { group: g, bodyMat: mat, lidMat: mat, edgeMat: null };
      })()
    : part.id === 'bt'
      ? (() => {
          const g = new THREE.Group();
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0b2a3a, metalness: 0.3, roughness: 0.6 });
          const pcb = new THREE.Mesh(rounded(part.size[0], part.size[1], part.size[2], 0.04), pcbMat);
          g.add(pcb);
          const shield = new THREE.Mesh(rounded(part.size[0] * 0.62, part.size[1] * 0.55, part.size[2] * 0.66, 0.03), silverMat);
          shield.position.y = part.size[1] / 2 * 0.3;
          g.add(shield);
          return { group: g, bodyMat: pcbMat, lidMat: silverMat, edgeMat: null };
        })()
      : part.id === 'usb'
        ? (() => {
            const g = new THREE.Group();
            const body = new THREE.Mesh(rounded(part.size[0], part.size[1], part.size[2], 0.03), silverMat);
            g.add(body);
            return { group: g, bodyMat: silverMat, lidMat: silverMat, edgeMat: null };
          })()
        : part.id === 'battery'
          ? (() => {
              const g = new THREE.Group();
              const body = new THREE.Mesh(rounded(part.size[0], part.size[1], part.size[2], 0.05), new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 0.2, roughness: 0.7 }));
              g.add(body);
              return { group: g, bodyMat: body.material, lidMat: body.material, edgeMat: null };
            })()
          : makeChip(part);

  const { group } = built;
  group.position.set(part.pos[0], part.pos[1], part.pos[2]);
  const parent = part.group === 'main' ? mainBoard : rig;
  parent.add(group);

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(part.size[0] * 1.1, part.size[1] + 0.2, part.size[2] * 1.1),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  );
  hit.position.set(part.pos[0], part.pos[1], part.pos[2]);
  hit.userData.partId = part.id;
  parent.add(hit);
  pickables.push(hit);

  partVisuals.set(part.id, {
    setState: ({ dim = false, selected = false, time = 0 } = {}) => {
      if (built.bodyMat) {
        built.bodyMat.transparent = dim;
        built.bodyMat.opacity = dim ? 0.3 : 1;
      }
      if (built.lidMat && built.lidMat !== built.bodyMat) {
        built.lidMat.transparent = dim;
        built.lidMat.opacity = dim ? 0.4 : 1;
        built.lidMat.emissiveIntensity = selected ? 0.6 + Math.sin(time * 4) * 0.2 : dim ? 0.08 : 0.28;
      }
      if (built.edgeMat) built.edgeMat.opacity = dim ? 0.1 : 0.45;
      group.scale.setScalar(selected ? 1.06 : 1);
    },
  });
}

const LABEL_OFFSET = {
  mcu: 0.65, usb: 0.55, key1: 0.45, swd: 0.45,
  aht21: 0.25, em7028: 1.35, spl06: 0.25, mpu6050: 1.35, lis2mdl: 0.25,
  w25q: 0.6, hp4570: 0.5, bt: 0.55, wt588: 0.55, motor: 0.55,
  battery: 1.0, screen: 0.7, touch: 0.4,
};

PARTS.forEach((part) => {
  buildPart(part);

  const el = document.createElement('div');
  el.className = 'e-label';
  el.innerHTML = `<span>${part.label}</span><span class="m">${part.meta}</span>`;
  el.addEventListener('click', () => selectPart(part.id));
  const obj = new CSS2DObject(el);
  const yOff = part.size[1] / 2 + (LABEL_OFFSET[part.id] ?? 0.5);
  obj.position.set(part.pos[0], part.pos[1] + yOff, part.pos[2]);
  (part.group === 'main' ? mainBoard : rig).add(obj);
  labelEls.set(part.id, el);
});

// ---------- 数据流 ----------
const flowMat = new THREE.PointsMaterial({
  size: 0.16,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true,
});

function polygonCurve(points) {
  return new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
}

const flows = [
  {
    id: 'sensor',
    color: 0x3ff0c8,
    curve: polygonCurve([[0, 3.5, 2], [-3, 3.0, 1], [-6, 1.4, 0]]),
    count: 16,
    offset: 0,
  },
  {
    id: 'screen',
    color: 0x4fd1ff,
    curve: polygonCurve([[-6, 1.4, 0], [-4, 4.5, -2], [0, 6.5, -5.4], [0, 7.5, -5.9]]),
    count: 16,
    offset: 0.25,
  },
  {
    id: 'ota-bt',
    color: 0xffb347,
    curve: polygonCurve([[-9.5, 3.6, -4], [-8, 2.6, -2], [-6, 1.4, 0]]),
    count: 12,
    offset: 0.1,
  },
  {
    id: 'ota-flash',
    color: 0x4ade80,
    curve: polygonCurve([[-6, 1.4, 0], [1, 2.4, -1.6], [8.5, 3.6, -2.5]]),
    count: 12,
    offset: 0.4,
  },
];

flows.forEach((flow) => {
  const positions = new Float32Array(flow.count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = flowMat.clone();
  mat.color.setHex(flow.color);
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  flow.points = points;
  flow.positions = positions;
  flow.attr = geo.attributes.position;
});

function updateFlows(t) {
  flows.forEach((flow) => {
    const visible = state.plugged && (flow.id.startsWith('ota') ? state.ota.running : true);
    flow.points.visible = visible;
    if (!visible) return;
    for (let i = 0; i < flow.count; i += 1) {
      const u = (t * 0.16 + flow.offset + i / flow.count) % 1;
      const p = flow.curve.getPointAt(u);
      flow.positions[i * 3] = p.x;
      flow.positions[i * 3 + 1] = p.y;
      flow.positions[i * 3 + 2] = p.z;
    }
    flow.attr.needsUpdate = true;
  });
}

// ---------- 状态 ----------
const state = {
  plugged: true,
  page: 'face',
  sensors: { temp: 26.5, humi: 55, pres: 1013, hr: 72, steps: 7200, bat: 86 },
  ota: { running: false, version: 'V2.6', progress: 0, step: -1 },
  selected: null,
};

let currentChapter = 0;
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

// ---------- 屏幕纹理 ----------
function drawScreen() {
  const ctx = screenCtx;
  ctx.fillStyle = '#020608';
  ctx.fillRect(0, 0, 240, 280);

  if (!state.plugged) {
    ctx.fillStyle = '#25424a';
    ctx.font = '600 16px "Cascadia Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NO SIGNAL', 120, 136);
    ctx.font = '10px "Cascadia Mono", Consolas, monospace';
    ctx.fillText('EXPANSION BOARD UNPLUGGED', 120, 158);
    ctx.textAlign = 'left';
    screenTex.needsUpdate = true;
    return;
  }

  ctx.fillStyle = '#eafcff';
  ctx.font = '600 46px "Cascadia Mono", Consolas, monospace';
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  ctx.fillText(time, 18, 66);

  ctx.fillStyle = '#7fa8b2';
  ctx.font = '11px "Microsoft YaHei", sans-serif';
  ctx.fillText('EC-S100 · 演示台', 18, 88);

  if (state.page === 'face') {
    const s = state.sensors;
    ctx.fillStyle = '#4fd1ff';
    ctx.font = '600 13px "Cascadia Mono", Consolas, monospace';
    ctx.fillText(`HR ${Math.round(s.hr)}`, 18, 132);
    ctx.fillText(`STEP ${s.steps}`, 18, 156);
    ctx.fillText(`BAT ${Math.round(s.bat)}%`, 18, 180);
    ctx.fillStyle = '#3ff0c8';
    ctx.fillRect(18, 200, 204 - (100 - s.bat) * 1.2, 4);
  } else if (state.page === 'menu') {
    for (let i = 0; i < 9; i += 1) {
      const x = 18 + (i % 3) * 70;
      const y = 112 + Math.floor(i / 3) * 54;
      ctx.strokeStyle = 'rgba(79,209,255,0.35)';
      ctx.strokeRect(x, y, 56, 40);
    }
  } else if (state.page === 'heart') {
    ctx.fillStyle = '#ff7b8a';
    ctx.font = '600 40px "Cascadia Mono", Consolas, monospace';
    ctx.fillText(`${Math.round(state.sensors.hr)}`, 18, 150);
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillText('BPM · 心率', 18, 170);
  } else if (state.page === 'ota') {
    ctx.fillStyle = '#ffb347';
    ctx.font = '600 12px "Cascadia Mono", Consolas, monospace';
    ctx.fillText(`OTA ${state.ota.progress}%`, 18, 132);
    ctx.fillStyle = 'rgba(79,209,255,0.15)';
    ctx.fillRect(18, 148, 204, 8);
    ctx.fillStyle = '#4fd1ff';
    ctx.fillRect(18, 148, 204 * (state.ota.progress / 100), 8);
  } else {
    ctx.fillStyle = '#8fb7c0';
    ctx.font = '13px "Microsoft YaHei", sans-serif';
    ctx.fillText(PART_MAP[state.page]?.label ?? '页面', 18, 132);
  }

  ctx.fillStyle = '#6f969f';
  ctx.font = '9px "Cascadia Mono", Consolas, monospace';
  ctx.fillText('STM32F411 · FREERTOS · LVGL', 18, 262);
  screenTex.needsUpdate = true;
}

// ---------- HTML 屏幕镜像 ----------
const screenEl = document.getElementById('e-screen');
const pages = [...screenEl.querySelectorAll('.e-page')];

function showPage(page) {
  state.page = page;
  pages.forEach((el) => { el.hidden = el.dataset.page !== page; });
  drawScreen();
}

function bindSensors() {
  const s = state.sensors;
  const set = (key, value) => {
    const els = document.querySelectorAll(`[data-bind="${key}"]`);
    els.forEach((el) => { el.textContent = value; });
  };
  set('time', `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const now = new Date();
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
  set('date', `${now.getMonth() + 1}月${now.getDate()}日 ${week}`);
  set('temp-face', `${s.temp.toFixed(1)}°C`);
  set('hr-face', String(Math.round(s.hr)));
  set('steps-face', String(s.steps));
  set('bat-face', `${Math.round(s.bat)}%`);
  set('hr-bpm', String(Math.round(s.hr)));
  set('temp-msg', `${s.temp.toFixed(1)}°C`);
  set('hr-msg', String(Math.round(s.hr)));
  set('steps-msg', `${s.steps} ppm`);
  set('pres-msg', `${Math.round(s.pres)} hPa`);
  set('ota-version', state.ota.version);
  drawScreen();
}

screenEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-go]');
  if (!target || !state.plugged) return;
  showPage(target.dataset.go);
});

document.querySelectorAll('[data-go]').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state.plugged) showPage(btn.dataset.go);
  });
});

// 传感器滑块
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

// 心率测量
let heartTimer = null;
document.getElementById('e-start-heart')?.addEventListener('click', () => {
  if (!state.plugged || heartTimer) return;
  const note = document.querySelector('[data-page="heart"] .e-note');
  if (note) note.textContent = '检测中… 请保持手指贴合';
  let ticks = 0;
  heartTimer = setInterval(() => {
    ticks += 1;
    const wobble = 6 * Math.sin(ticks * 1.7) + (ticks % 2 ? 3 : -2);
    state.sensors.hr = Math.max(45, Math.min(150, state.sensors.hr + wobble));
    bindSensors();
    if (ticks > 12) {
      clearInterval(heartTimer);
      heartTimer = null;
      if (note) note.textContent = 'EM7028 · 20ms 采样\n原始 ADC 右移 2 位后进入心跳算法';
    }
  }, 220);
});

// ---------- 插拔 ----------
let rigTargetY = RIG_BASE;
const plugBtn = document.querySelector('[data-act="plug"]');

function setPlugged(plugged) {
  state.plugged = plugged;
  rigTargetY = plugged ? RIG_BASE : RIG_BASE + 4.6;
  plugBtn.textContent = plugged ? '拔出扩展板' : '插入扩展板';
  plugBtn.classList.toggle('active', !plugged);
  screenEl.classList.toggle('is-off', !plugged);
  if (!plugged) {
    state.ota.running = false;
    document.getElementById('e-ota-state').textContent = '扩展板未连接';
    drawScreen();
  } else {
    document.getElementById('e-ota-state').textContent = '空闲 · 等待 0x11 0x22 0x33';
    bindSensors();
  }
}


// ---------- OTA ----------
const otaLog = [...document.querySelectorAll('#e-ota-log li')];
const otaBar = document.getElementById('e-ota-bar');
const otaBar2 = document.getElementById('e-ota-bar-2');
const otaState = document.getElementById('e-ota-state');
const otaText = document.querySelector('[data-bind="ota-text"]');

function setOtaProgress(value) {
  state.ota.progress = Math.round(value);
  if (otaBar) otaBar.style.width = `${state.ota.progress}%`;
  if (otaBar2) otaBar2.style.width = `${state.ota.progress}%`;
  drawScreen();
}

function setOtaStep(index) {
  otaLog.forEach((li, i) => {
    li.classList.toggle('done', i < index);
    li.classList.toggle('active', i === index);
  });
}

function runOta() {
  if (!state.plugged || state.ota.running) return;
  state.ota.running = true;
  state.ota.version = 'V2.6';
  setOtaStep(0);
  setOtaProgress(0);
  otaState.textContent = '收到命令 · 等待确认';
  if (otaText) otaText.textContent = '收到 0x11 0x22 0x33，等待确认';
  bindSensors();
  showPage('ota');

  setTimeout(() => {
    if (!state.ota.running) return;
    setOtaStep(1);
    otaState.textContent = 'USART1 · YMODEM 接收';
    let p = 0;
    const timer = setInterval(() => {
      if (!state.ota.running) { clearInterval(timer); return; }
      p = Math.min(100, p + 4);
      setOtaProgress(p);
      if (otaText) otaText.textContent = `YMODEM 接收 ${p}%`;
      if (p >= 100) {
        clearInterval(timer);
        setOtaStep(2);
        otaState.textContent = '写入 W25Q 外部 Flash';
        let q = 0;
        const timer2 = setInterval(() => {
          if (!state.ota.running) { clearInterval(timer2); return; }
          q = Math.min(100, q + 6);
          setOtaProgress(q);
          if (otaText) otaText.textContent = `写入 W25Q ${q}%`;
          if (q >= 100) {
            clearInterval(timer2);
            setOtaStep(3);
            otaState.textContent = '写 App 标志区 0x08008000';
            setTimeout(() => {
              if (!state.ota.running) return;
              setOtaStep(4);
              otaState.textContent = '软复位 · Bootloader 搬运';
              setTimeout(() => {
                if (!state.ota.running) return;
                state.ota.running = false;
                state.ota.version = 'V2.7';
                setOtaProgress(100);
                otaLog.forEach((li) => { li.classList.remove('active'); li.classList.add('done'); });
                otaState.textContent = '完成 · 已升级到 V2.7';
                if (otaText) otaText.textContent = '升级完成，版本 V2.7';
                bindSensors();
              }, 900);
            }, 800);
          }
        }, 90);
      }
    }, 70);
  }, 900);
}

document.getElementById('e-ota-start')?.addEventListener('click', runOta);
document.getElementById('e-start-ota')?.addEventListener('click', runOta);

// ---------- 面板 / 选项卡 ----------
function switchTab(tab) {
  document.querySelectorAll('#es100-tabs button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.es100-tab').forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
}

document.getElementById('es100-tabs')?.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (btn) switchTab(btn.dataset.tab);
});

// ---------- 器件选择 ----------
function selectPart(id) {
  const part = PART_MAP[id];
  if (!part) return;
  state.selected = id;
  document.getElementById('e-part-empty').hidden = true;
  const info = document.getElementById('e-part-info');
  info.hidden = false;
  document.getElementById('e-part-title').textContent = part.label;
  document.getElementById('e-part-meta').textContent = part.meta;
  document.getElementById('e-part-desc').textContent = `${part.what} ${part.does} ${part.how}`;
  const tags = document.getElementById('e-part-tags');
  tags.innerHTML = '';
  (part.tags || []).forEach((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    tags.appendChild(span);
  });
  switchTab('part');

  partVisuals.forEach((visual, pid) => {
    visual.setState({ dim: dimStates.get(pid) ?? false, selected: pid === id, time: 0 });
    labelEls.get(pid)?.classList.toggle('hot', pid === id);
  });
}

// ---------- 章节 ----------
const chapterNav = document.getElementById('es100-chapters');
const chapterNo = document.getElementById('es100-chapter-no');
const chapterTitle = document.getElementById('es100-chapter-title');
const narration = document.getElementById('es100-narration');

CHAPTERS.forEach((chapter, index) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'es100-tab-btn';
  btn.innerHTML = `<span class="no">${chapter.no}</span>${chapter.title}`;
  btn.addEventListener('click', () => selectChapter(index));
  chapterNav.appendChild(btn);
});

function applyFocus(chapter) {
  const focus = new Set(chapter.focus);
  const all = focus.has('*');
  PARTS.forEach((part) => {
    const dim = !all && !focus.has(part.id);
    dimStates.set(part.id, dim);
    partVisuals.get(part.id)?.setState({ dim, selected: part.id === state.selected, time: 0 });
    const el = labelEls.get(part.id);
    if (el) el.classList.toggle('dim', dim);
  });
}

function selectChapter(index) {
  currentChapter = (index + CHAPTERS.length) % CHAPTERS.length;
  const chapter = CHAPTERS[currentChapter];
  chapterNo.textContent = `CHAPTER ${chapter.no} / ${String(CHAPTERS.length).padStart(2, '0')}`;
  chapterTitle.textContent = chapter.title;
  narration.textContent = chapter.narration;
  document.querySelectorAll('.es100-tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === currentChapter);
  });
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
  if (act === 'labels') {
    labelsOn = !labelsOn;
    stage.classList.toggle('no-labels', !labelsOn);
    btn.classList.toggle('active', labelsOn);
  }
  if (act === 'edges') {
    edgesOn = !edgesOn;
    edgeObjects.forEach((edge) => { edge.visible = edgesOn; });
    btn.classList.toggle('active', edgesOn);
  }
  if (act === 'plug') setPlugged(!state.plugged);
  if (act === 'rotate') {
    controls.autoRotate = !controls.autoRotate;
    btn.classList.toggle('active', controls.autoRotate);
  }
  if (act === 'reset') {
    const chapter = CHAPTERS[currentChapter];
    flyTo(chapter.camera, chapter.target, 0.8);
  }
});

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
  pickables.forEach((hit) => {
    const el = labelEls.get(hit.userData.partId);
    if (el) el.classList.toggle('hot', hit.userData.partId === id);
  });
  renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
}

renderer.domElement.addEventListener('pointermove', (event) => {
  const hit = pick(event.clientX, event.clientY);
  setHover(hit ? hit.userData.partId : null);
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
  if (hit) selectPart(hit.userData.partId);
});

// ---------- 尺寸 ----------
function onResize() {
  const width = W();
  const height = H();
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
}
const ro = new ResizeObserver(onResize);
ro.observe(stage);

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

  rig.position.y += (rigTargetY - rig.position.y) * Math.min(1, dt * 5);
  controls.update();
  updateFlows(elapsed);

  if (state.selected) {
    partVisuals.get(state.selected)?.setState({
      dim: dimStates.get(state.selected) ?? false,
      selected: true,
      time: elapsed,
    });
  }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ---------- 启动 ----------
setInterval(() => {
  bindSensors();
}, 1000);

bindSensors();
selectChapter(0);
drawScreen();
renderer.domElement.style.cursor = 'grab';
window.__ES100 = { state, showPage, drawScreen };
animate();
