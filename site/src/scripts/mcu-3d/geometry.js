import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------- 共享材质 / 纹理 ----------

const goldMat = new THREE.MeshStandardMaterial({
  color: 0xb08238,
  metalness: 0.9,
  roughness: 0.36,
});

function shadowTexture() {
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
}

const SHADOW_TEX = shadowTexture();
const PIN_Z = new THREE.BoxGeometry(0.14, 0.07, 0.28);
const PIN_X = new THREE.BoxGeometry(0.28, 0.07, 0.14);
const PIN_SMALL = new THREE.BoxGeometry(0.1, 0.05, 0.18);

function addShadow(group, w, d, h) {
  const mat = new THREE.MeshBasicMaterial({
    map: SHADOW_TEX,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.35, d * 1.35), mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -h / 2 - 0.015;
  group.add(plane);
}

function addPins(group, w, d, h, count, sides = 'all') {
  const y = -h / 2 + 0.04;
  const spreadX = w * 0.36;
  const spreadZ = d * 0.34;
  if (sides === 'all' || sides === 'z') {
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -spreadX + t * spreadX * 2;
      for (const sign of [-1, 1]) {
        const pin = new THREE.Mesh(PIN_Z, goldMat);
        pin.position.set(x, y, sign * (d / 2 + 0.1));
        group.add(pin);
      }
    }
  }
  if (sides === 'all' || sides === 'x') {
    const countX = Math.max(4, Math.round(count * 0.7));
    for (let i = 0; i < countX; i += 1) {
      const t = countX === 1 ? 0.5 : i / (countX - 1);
      const z = -spreadZ + t * spreadZ * 2;
      for (const sign of [-1, 1]) {
        const pin = new THREE.Mesh(PIN_X, goldMat);
        pin.position.set(sign * (w / 2 + 0.1), y, z);
        group.add(pin);
      }
    }
  }
}

function addEdgeLine(group, w, h, d, color) {
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.42 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), mat);
  group.add(edges);
  return { edges, mat };
}

function makeHit(w, h, d, spec) {
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  );
  hit.userData.spec = spec;
  return hit;
}

function makeState(parts) {
  return ({ dim = false, selected = false, time = 0 } = {}) => {
    if (parts.body) {
      parts.body.transparent = dim;
      parts.body.opacity = dim ? 0.3 : 1;
    }
    if (parts.lid) {
      parts.lid.transparent = dim;
      parts.lid.opacity = dim ? 0.38 : 1;
      parts.lid.emissiveIntensity = selected
        ? 0.55 + Math.sin(time * 4.2) * 0.18
        : dim
          ? 0.07
          : 0.34;
    }
    if (parts.accent) {
      parts.accent.transparent = true;
      parts.accent.opacity = dim ? 0.22 : 0.92;
      parts.accent.emissiveIntensity = selected ? 1.1 : 0.65;
    }
    if (parts.edge) {
      parts.edge.transparent = true;
      parts.edge.opacity = dim ? 0.1 : 0.42;
    }
    if (parts.copper) {
      parts.copper.opacity = dim ? 0.28 : 1;
      parts.copper.transparent = dim;
      parts.copper.emissiveIntensity = selected ? 0.75 : 0.3;
    }
  };
}

// ---------- 芯片封装 ----------
function buildChip(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x12161c,
    metalness: 0.72,
    roughness: 0.34,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(0.09, h / 2)), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d11,
    metalness: 0.86,
    roughness: 0.22,
    emissive: spec.color,
    emissiveIntensity: 0.26,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.8, 0.05, d * 0.78, 2, 0.02), lidMat);
  lid.position.y = h / 2 + 0.02;
  group.add(lid);

  const accentMat = new THREE.MeshStandardMaterial({
    color: spec.color,
    metalness: 0.55,
    roughness: 0.3,
    emissive: spec.color,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.92,
  });
  const accent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.34, 0.012, d * 0.1), accentMat);
  accent.position.y = h / 2 + 0.052;
  group.add(accent);

  const dot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.012, 16),
    new THREE.MeshStandardMaterial({ color: 0xd9e8e2, roughness: 0.7 }),
  );
  dot.position.set(-w * 0.31, h / 2 + 0.055, -d * 0.3);
  group.add(dot);

  addPins(group, w, d, h, Math.max(4, Math.round(w / 0.45)));
  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.06, h + 0.2, d * 1.06, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: bodyMat, lid: lidMat, accent: accentMat, edge: edge.mat }),
  };
}

// ---------- Cortex-M3 内核 ----------
function buildCore(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x11151b, metalness: 0.75, roughness: 0.3 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.08), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0c1016,
    metalness: 0.9,
    roughness: 0.2,
    emissive: spec.color,
    emissiveIntensity: 0.3,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.72, 0.06, d * 0.72, 2, 0.02), lidMat);
  lid.position.y = h / 2 + 0.025;
  group.add(lid);

  const coreDie = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.34, 0.015, d * 0.34),
    new THREE.MeshStandardMaterial({
      color: 0x2a3a6a,
      metalness: 0.65,
      roughness: 0.25,
      emissive: spec.color,
      emissiveIntensity: 0.85,
    }),
  );
  coreDie.position.y = h / 2 + 0.06;
  group.add(coreDie);

  // 内核四周的焊盘
  for (let i = 0; i < 10; i += 1) {
    const t = -0.4 + (i / 9) * 0.8;
    for (const sign of [-1, 1]) {
      const padZ = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.16), goldMat);
      padZ.position.set(t * w, h / 2 + 0.055, sign * d * 0.42);
      group.add(padZ);
      const padX = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.1), goldMat);
      padX.position.set(sign * w * 0.42, h / 2 + 0.055, t * d);
      group.add(padX);
    }
  }

  addPins(group, w, d, h, 10);
  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.06, h + 0.2, d * 1.06, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: bodyMat, lid: lidMat, accent: null, edge: edge.mat }),
  };
}

// ---------- 总线矩阵：交叉开关 ----------
function buildMatrix(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0d1a1a, metalness: 0.6, roughness: 0.42 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(w, h * 0.5, d, 2, 0.05), baseMat);
  base.position.y = -h * 0.18;
  group.add(base);

  const copper = new THREE.MeshStandardMaterial({
    color: 0xc07a3a,
    metalness: 0.92,
    roughness: 0.26,
    emissive: 0x2f1505,
    emissiveIntensity: 0.3,
    transparent: false,
    opacity: 1,
  });

  const barGeoH = new THREE.BoxGeometry(w * 0.86, 0.08, 0.12);
  const barGeoV = new THREE.BoxGeometry(0.12, 0.08, d * 0.84);
  const offsets = [-1.2, -0.4, 0.4, 1.2];

  offsets.forEach((offset) => {
    const barH = new THREE.Mesh(barGeoH, copper);
    barH.position.set(0, h * 0.22, offset);
    group.add(barH);
    const barV = new THREE.Mesh(barGeoV, copper);
    barV.position.set(offset, h * 0.34, 0);
    group.add(barV);
  });

  const junctionMat = new THREE.MeshStandardMaterial({
    color: spec.color,
    metalness: 0.7,
    roughness: 0.28,
    emissive: spec.color,
    emissiveIntensity: 0.9,
  });
  offsets.forEach((x) => {
    offsets.forEach((z) => {
      const node = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 12), junctionMat);
      node.position.set(x, h * 0.42, z);
      group.add(node);
    });
  });

  // 左右端口焊盘
  for (let i = 0; i < 4; i += 1) {
    const z = offsets[i];
    for (const sign of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.18), goldMat);
      pad.position.set(sign * (w / 2 + 0.12), h * 0.18, z);
      group.add(pad);
    }
  }

  addShadow(group, w, d, h * 0.5);
  const edge = addEdgeLine(group, w, h * 0.5, d, spec.color);
  edge.edges.position.y = -h * 0.18;
  const hit = makeHit(w * 1.08, h, d * 1.08, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: baseMat, lid: null, accent: junctionMat, edge: edge.mat, copper }),
  };
}

// ---------- AHB2APB 桥 ----------
function buildBridge(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x16121f, metalness: 0.7, roughness: 0.34 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.05), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0d0a14,
    metalness: 0.82,
    roughness: 0.26,
    emissive: spec.color,
    emissiveIntensity: 0.35,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.78, 0.04, d * 0.78, 2, 0.02), lidMat);
  lid.position.y = h / 2 + 0.02;
  group.add(lid);

  // 两排桥接引脚
  for (let i = 0; i < 4; i += 1) {
    const x = -w * 0.3 + (i / 3) * w * 0.6;
    for (const sign of [-1, 1]) {
      const pin = new THREE.Mesh(PIN_SMALL, goldMat);
      pin.position.set(x, -h / 2 + 0.03, sign * (d / 2 + 0.06));
      group.add(pin);
    }
  }

  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.08, h + 0.15, d * 1.08, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: bodyMat, lid: lidMat, accent: null, edge: edge.mat }),
  };
}

// ---------- 外设小板 ----------
function buildBoard(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0c3326, metalness: 0.2, roughness: 0.72 });
  const board = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.04), pcbMat);
  group.add(board);

  // 板边金手指
  const padCount = Math.floor(w / 0.42);
  for (let i = 0; i < padCount; i += 1) {
    const x = -w * 0.44 + (i / (padCount - 1)) * w * 0.88;
    for (const sign of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.14), goldMat);
      pad.position.set(x, h / 2 + 0.012, sign * (d / 2 - 0.16));
      group.add(pad);
    }
  }

  // 板面丝印框
  const silkMat = new THREE.LineBasicMaterial({ color: 0x7fe3c4, transparent: true, opacity: 0.35 });
  const silk = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(w * 0.92, h, d * 0.82)),
    silkMat,
  );
  silk.position.y = h / 2 + 0.005;
  group.add(silk);

  addShadow(group, w, d, h);
  const hit = makeHit(w * 1.02, h + 0.12, d * 1.02, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [silk],
    setState: makeState({ body: pcbMat, lid: null, accent: null, edge: silkMat }),
  };
}

// ---------- 小外设芯片 ----------
function buildMini(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x101419, metalness: 0.65, roughness: 0.38 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.04), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0b0e12,
    metalness: 0.8,
    roughness: 0.26,
    emissive: spec.color,
    emissiveIntensity: 0.3,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.7, 0.03, d * 0.68, 2, 0.015), lidMat);
  lid.position.y = h / 2 + 0.015;
  group.add(lid);

  for (let i = 0; i < 2; i += 1) {
    const x = -w * 0.25 + i * w * 0.5;
    for (const sign of [-1, 1]) {
      const pin = new THREE.Mesh(PIN_SMALL, goldMat);
      pin.position.set(x, -h / 2 + 0.025, sign * (d / 2 + 0.05));
      group.add(pin);
    }
  }

  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.15, h + 0.1, d * 1.15, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: bodyMat, lid: lidMat, accent: null, edge: edge.mat }),
  };
}

// ---------- DMA 控制器 ----------
function buildDma(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, metalness: 0.72, roughness: 0.32 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.07), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x100c07,
    metalness: 0.85,
    roughness: 0.24,
    emissive: spec.color,
    emissiveIntensity: 0.3,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.78, 0.05, d * 0.78, 2, 0.02), lidMat);
  lid.position.y = h / 2 + 0.02;
  group.add(lid);

  // 通道引脚：右侧一排
  for (let i = 0; i < 7; i += 1) {
    const z = -d * 0.36 + (i / 6) * d * 0.72;
    const pin = new THREE.Mesh(PIN_X, goldMat);
    pin.position.set(w / 2 + 0.12, -h / 2 + 0.05, z);
    group.add(pin);
  }
  for (let i = 0; i < 6; i += 1) {
    const x = -w * 0.34 + (i / 5) * w * 0.68;
    for (const sign of [-1, 1]) {
      const pin = new THREE.Mesh(PIN_Z, goldMat);
      pin.position.set(x, -h / 2 + 0.05, sign * (d / 2 + 0.1));
      group.add(pin);
    }
  }

  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.06, h + 0.2, d * 1.06, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edge.edges],
    setState: makeState({ body: bodyMat, lid: lidMat, accent: null, edge: edge.mat }),
  };
}

// ---------- 时钟模块 ----------
function buildRcc(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x141410, metalness: 0.72, roughness: 0.32 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.06), bodyMat);
  group.add(body);

  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d08,
    metalness: 0.85,
    roughness: 0.24,
    emissive: spec.color,
    emissiveIntensity: 0.3,
  });
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w * 0.78, 0.05, d * 0.7, 2, 0.02), lidMat);
  lid.position.set(-w * 0.05, h / 2 + 0.02, 0);
  group.add(lid);

  // 晶振金属壳
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.95, roughness: 0.2 });
  const crystal = new THREE.Mesh(new RoundedBoxGeometry(w * 0.28, h * 0.55, d * 0.5, 2, 0.05), crystalMat);
  crystal.position.set(w * 0.33, h * 0.32, 0);
  group.add(crystal);

  // 时钟光环
  const ringMat = new THREE.MeshBasicMaterial({
    color: spec.color,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.34, 0.02, 6, 64), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = h / 2 + 0.09;
  group.add(ring);

  addPins(group, w, d, h, 5);
  addShadow(group, w, d, h);
  const edge = addEdgeLine(group, w, h, d, spec.color);
  const hit = makeHit(w * 1.1, h + 0.2, d * 1.1, spec);
  group.add(hit);

  const state = makeState({ body: bodyMat, lid: lidMat, accent: null, edge: edge.mat });
  return {
    group,
    hit,
    edges: [edge.edges],
    setState: (opts = {}) => {
      state(opts);
      ringMat.opacity = opts.dim ? 0.15 : opts.selected ? 0.9 : 0.55;
    },
  };
}

// ---------- 虚体（部分型号） ----------
function buildGhost(spec) {
  const [w, h, d] = spec.size;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshBasicMaterial({
    color: spec.color,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
  group.add(body);

  const edgeMat = new THREE.LineDashedMaterial({
    color: spec.color,
    transparent: true,
    opacity: 0.55,
    dashSize: 0.16,
    gapSize: 0.12,
  });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat);
  edges.computeLineDistances();
  group.add(edges);

  const hit = makeHit(w * 1.1, h + 0.2, d * 1.1, spec);
  group.add(hit);

  return {
    group,
    hit,
    edges: [edges],
    setState: ({ dim = false } = {}) => {
      bodyMat.opacity = dim ? 0.05 : 0.1;
      edgeMat.opacity = dim ? 0.2 : 0.55;
    },
  };
}

export function buildModule(spec) {
  switch (spec.kind) {
    case 'core':
      return buildCore(spec);
    case 'matrix':
      return buildMatrix(spec);
    case 'bridge':
      return buildBridge(spec);
    case 'board':
      return buildBoard(spec);
    case 'mini':
      return buildMini(spec);
    case 'dma':
      return buildDma(spec);
    case 'rcc':
      return buildRcc(spec);
    case 'ghost':
      return buildGhost(spec);
    default:
      return buildChip(spec);
  }
}

// ---------- 走线 ----------
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function cylinderBetween(a, b, radius, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.001) return null;
  const geo = new THREE.CylinderGeometry(radius, radius, len, 10);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, dir.clone().normalize());
  return mesh;
}

function addDashedLine(group, a, b, radius, mat, dash = 0.3, gap = 0.2) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 0.001) return;
  dir.normalize();
  let t = 0;
  while (t < len) {
    const end = Math.min(t + dash, len);
    const p1 = a.clone().addScaledVector(dir, t);
    const p2 = a.clone().addScaledVector(dir, end);
    const seg = cylinderBetween(p1, p2, radius, mat);
    if (seg) group.add(seg);
    t = end + gap;
  }
}

function addVia(group, pos, radius) {
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 2.2, radius * 2.2, 0.05, 14),
    goldMat,
  );
  ring.position.copy(pos);
  group.add(ring);
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.06, 12),
    new THREE.MeshBasicMaterial({ color: 0x061210 }),
  );
  hole.position.copy(pos).add(new THREE.Vector3(0, 0.005, 0));
  group.add(hole);
}

function addArrow(group, from, to, color, radius) {
  const dir = new THREE.Vector3().subVectors(to, from).normalize();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 2.0, radius * 4.6, 10),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.5,
      roughness: 0.35,
      emissive: color,
      emissiveIntensity: 0.35,
    }),
  );
  cone.position.copy(to).addScaledVector(dir, -radius * 2.4);
  cone.quaternion.setFromUnitVectors(Y_AXIS, dir);
  group.add(cone);
}

export function buildTrace(trace) {
  const group = new THREE.Group();
  const radius = (trace.width ?? 0.1) * 1.3;
  const mat = new THREE.MeshStandardMaterial({
    color: 0xd08a4a,
    metalness: 0.9,
    roughness: 0.3,
    emissive: 0x4a2008,
    emissiveIntensity: 0.5,
  });

  const points = trace.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));

  for (let i = 0; i < points.length - 1; i += 1) {
    if (trace.dashed) {
      addDashedLine(group, points[i], points[i + 1], radius, mat);
    } else {
      const seg = cylinderBetween(points[i], points[i + 1], radius, mat);
      if (seg) group.add(seg);
    }
  }

  if (!trace.dashed) {
    for (let i = 1; i < points.length - 1; i += 1) {
      addVia(group, points[i], radius);
    }
  }

  if (points.length > 1) {
    addArrow(group, points[points.length - 2], points[points.length - 1], trace.color ?? 0x38f0d0, radius);
  }

  return { group, material: mat };
}

export class PolylineCurve extends THREE.Curve {
  constructor(points) {
    super();
    this.points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    this.segments = [];
    this.total = 0;
    for (let i = 0; i < this.points.length - 1; i += 1) {
      const a = this.points[i];
      const b = this.points[i + 1];
      const len = a.distanceTo(b);
      this.segments.push({ a, b, len, start: this.total });
      this.total += len;
    }
  }

  getPoint(t, target = new THREE.Vector3()) {
    const distance = THREE.MathUtils.clamp(t, 0, 1) * this.total;
    for (const seg of this.segments) {
      if (distance <= seg.start + seg.len || seg === this.segments[this.segments.length - 1]) {
        const local = seg.len === 0 ? 0 : (distance - seg.start) / seg.len;
        return target.copy(seg.a).lerp(seg.b, THREE.MathUtils.clamp(local, 0, 1));
      }
    }
    return target.copy(this.points[this.points.length - 1]);
  }
}

// ---------- PCB 纹理 ----------
export function createPcbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#082018';
  ctx.fillRect(0, 0, 1024, 1024);

  let seed = 20261103;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // 底层网格
  ctx.strokeStyle = 'rgba(31, 107, 82, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // 随机走线
  for (let n = 0; n < 90; n += 1) {
    let x = Math.floor(random() * 1024);
    let y = Math.floor(random() * 1024);
    const steps = 2 + Math.floor(random() * 4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < steps; s += 1) {
      const horizontal = random() > 0.5;
      const len = 30 + random() * 140;
      if (horizontal) x += random() > 0.5 ? len : -len;
      else y += random() > 0.5 ? len : -len;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(46, 140, 105, ${0.12 + random() * 0.16})`;
    ctx.lineWidth = 1 + random() * 2.5;
    ctx.stroke();
  }

  // 焊盘
  for (let n = 0; n < 150; n += 1) {
    const x = random() * 1024;
    const y = random() * 1024;
    const r = 2 + random() * 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(201, 151, 63, 0.18)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(4, 16, 12, 0.8)';
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createDieTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a161d';
  ctx.fillRect(0, 0, 1024, 1024);

  let seed = 424242;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // 细网格
  ctx.strokeStyle = 'rgba(70, 140, 170, 0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // 金属层走线
  for (let n = 0; n < 160; n += 1) {
    let x = Math.floor(random() * 1024);
    let y = Math.floor(random() * 1024);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 2; s += 1) {
      if (random() > 0.5) x += random() > 0.5 ? 20 + random() * 90 : -(20 + random() * 90);
      else y += random() > 0.5 ? 20 + random() * 90 : -(20 + random() * 90);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(150, 110, 60, ${0.08 + random() * 0.12})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 标准单元块
  for (let n = 0; n < 40; n += 1) {
    const x = random() * 960;
    const y = random() * 960;
    const w = 20 + random() * 70;
    const h = 12 + random() * 50;
    ctx.strokeStyle = 'rgba(63, 240, 200, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }

  // 焊点
  for (let n = 0; n < 220; n += 1) {
    const x = random() * 1024;
    const y = random() * 1024;
    ctx.beginPath();
    ctx.arc(x, y, 1 + random() * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190, 150, 90, 0.22)';
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
