// STM32F103C8T6 系统结构 —— 场景数据
// 依据：《STM32中文参考手册V10》第 2 章（24–33 页）、第 6 章时钟树（56 页）
//       《STM32教程（HAL版）_讲义》第 9 页（C8T6 资源）、第 30 页（存储器映像）
//
// 布局严格对应参考手册图1《系统结构》：
//   左上 Cortex-M3；中央总线矩阵；右上 Flash 接口 / Flash；右侧 SRAM / FSMC；
//   右下 AHB2APB 桥接 2 / 桥接 1；APB2、APB1 外设板；
//   左下 DMA1 / DMA2；中下 RCC；DMA 请求沿底部回路。

const Y = 1.78; // 模块中心高度（坐在晶圆表面）
const Y_BOARD = 1.56;
const Y_MINI = 1.84;

export const BLOCKS = [
  {
    id: 'core',
    kind: 'core',
    label: 'Cortex-M3',
    meta: '内核 · 72MHz',
    pos: [-7.8, Y, -3.2],
    size: [4.2, 0.72, 3.0],
    color: 0x6f7bff,
    group: 'core',
    desc: '取指、译码、执行都在这里完成，内部还有 NVIC 中断控制器。ICode 直接连 Flash 接口；DCode 和系统总线接入总线矩阵。',
    tags: ['驱动单元', 'NVIC', '72MHz'],
  },
  {
    id: 'matrix',
    kind: 'matrix',
    label: '总线矩阵',
    meta: '4 主 · 4 从 · 轮换仲裁',
    pos: [-2.0, Y, -3.2],
    size: [4.0, 0.55, 3.6],
    color: 0xffb347,
    group: 'bus',
    desc: '交叉开关（Crossbar）。4 个驱动端口：DCode、系统总线、DMA1、DMA2；4 个被动端口：Flash 接口、SRAM、FSMC、AHB2APB 桥。仲裁使用轮换算法。',
    tags: ['AHB', '仲裁', '4×4'],
  },
  {
    id: 'flashif',
    kind: 'chip',
    label: 'Flash 接口',
    meta: 'FLITF · 预取 2×64 位',
    pos: [2.0, Y, -5.2],
    size: [2.2, 0.6, 1.7],
    color: 0x22d3ee,
    group: 'mem',
    desc: 'Flash 存储器的读取接口，带两个 64 位预取缓冲。CPU 取指和 DMA 访问都要经过它。',
    tags: ['预取', 'FLITF'],
  },
  {
    id: 'flash',
    kind: 'chip',
    label: 'Flash',
    meta: '64KB · 0x0800 0000',
    pos: [5.8, Y, -5.2],
    size: [2.8, 0.72, 1.9],
    color: 0x4ade80,
    group: 'mem',
    desc: 'C8T6 内置 64KB Flash，存放程序。主存储块按 1KB 一页组织，另有系统存储器和选项字节；擦除按页进行。',
    tags: ['非易失', '0x0800 0000', '64KB'],
  },
  {
    id: 'sram',
    kind: 'chip',
    label: 'SRAM',
    meta: '20KB · 0x2000 0000',
    pos: [5.8, Y, -2.4],
    size: [2.8, 0.72, 1.9],
    color: 0x60a5fa,
    group: 'mem',
    desc: 'C8T6 内置 20KB SRAM，存放运行时变量和栈。CPU 可以 0 等待周期读写，DMA 也能直接访问。',
    tags: ['易失', '0x2000 0000', '20KB'],
  },
  {
    id: 'fsmc',
    kind: 'chip',
    label: 'FSMC',
    meta: '外部存储器 · C8T6 无',
    pos: [1.9, 1.78, -1.6],
    size: [2.1, 0.6, 1.4],
    color: 0x9a7b4f,
    group: 'mem',
    desc: '外部存储器控制器，把外部 SRAM、NOR、NAND 映射进 CPU 地址空间。C8T6 没有 FSMC，大容量型号才有。',
    tags: ['外部存储', '部分型号'],
  },
  {
    id: 'bridge2',
    kind: 'bridge',
    label: 'AHB2APB 桥 2',
    meta: 'APB2 · 72MHz',
    pos: [2.4, Y, 0.7],
    size: [1.3, 0.5, 1.0],
    color: 0xc084fc,
    group: 'periph',
    desc: '桥接 2：把 AHB 上的访问同步到 APB2。APB2 可以跑满 72MHz，挂 GPIO、ADC、TIM1、SPI1、USART1 等高速外设。',
    tags: ['APB2', '72MHz', '同步桥'],
  },
  {
    id: 'bridge1',
    kind: 'bridge',
    label: 'AHB2APB 桥 1',
    meta: 'APB1 · 36MHz',
    pos: [2.4, Y, 2.4],
    size: [1.3, 0.5, 1.0],
    color: 0xc084fc,
    group: 'periph',
    desc: '桥接 1：把 AHB 上的访问同步到 APB1。APB1 最高 36MHz，挂 TIM2–4、USART2/3、I2C、SPI2、CAN、USB 等低速外设。',
    tags: ['APB1', '36MHz', '同步桥'],
  },
  {
    id: 'apb2',
    kind: 'board',
    label: 'APB2 外设板',
    meta: '72MHz · 高速外设',
    pos: [7.6, Y_BOARD, 1.4],
    size: [5.4, 0.28, 2.8],
    color: 0x38bdf8,
    group: 'periph',
    desc: '高速外设总线板：GPIOA–D、ADC1/2、TIM1、SPI1、USART1、EXTI/AFIO。',
    tags: ['72MHz', '外设板'],
  },
  {
    id: 'apb1',
    kind: 'board',
    label: 'APB1 外设板',
    meta: '36MHz · 低速外设',
    pos: [7.9, Y_BOARD, 4.5],
    size: [6.0, 0.28, 2.8],
    color: 0x818cf8,
    group: 'periph',
    desc: '低速外设总线板：TIM2–4、USART2/3、I2C1/2、SPI2、CAN、USB、RTC、PWR、BKP、IWDG/WWDG。',
    tags: ['36MHz', '外设板'],
  },
  {
    id: 'dma1',
    kind: 'dma',
    label: 'DMA1',
    meta: '7 通道 · 通用 DMA',
    pos: [-8.6, Y, 1.9],
    size: [3.0, 0.7, 2.2],
    color: 0xff9f43,
    group: 'dma',
    desc: '7 个独立通道，可在存储器与外设之间搬运数据，支持环形缓冲。每个通道有专门的请求逻辑，也可以软件触发。',
    tags: ['驱动单元', '7 通道'],
  },
  {
    id: 'dma2',
    kind: 'ghost',
    label: 'DMA2',
    meta: '5 通道 · 部分型号 · C8T6 无',
    pos: [-8.4, 1.65, 4.9],
    size: [2.7, 0.6, 2.0],
    color: 0x6b4f33,
    ghost: true,
    group: 'dma',
    desc: '第二个 DMA 控制器，只有部分型号才有。C8T6 只有 DMA1，所以这里画成虚体。',
    tags: ['部分型号'],
  },
  {
    id: 'rcc',
    kind: 'rcc',
    label: 'RCC',
    meta: '复位与时钟 · PLL → 72MHz',
    pos: [-2.2, Y, 2.3],
    size: [1.9, 0.6, 1.4],
    color: 0xfacc15,
    group: 'clock',
    desc: '复位和时钟控制。8MHz HSI 或 8MHz HSE 经 PLL 倍频到 72MHz，再分频出 HCLK、PCLK2、PCLK1。复位后外设时钟默认关闭，使用前要先开。',
    tags: ['PLL', '72MHz', '复位'],
  },
];

// —— APB2 / APB1 外设小板 ——
const MINI_SIZE = [0.55, 0.26, 0.45];

function mini(id, label, pos, desc, tags) {
  return {
    id,
    kind: 'mini',
    label,
    meta: '',
    pos,
    size: MINI_SIZE,
    color: 0x2dd4bf,
    group: 'mini',
    mini: true,
    desc,
    tags,
  };
}

const apb2Row1 = [
  ['gpioa', 'GPIOA', '通用 I/O 端口 A，寄存器基地址 0x4001 0800。有 CRL/CRH/IDR/ODR/BSRR 等寄存器。', ['0x4001 0800', 'GPIO']],
  ['gpiob', 'GPIOB', '通用 I/O 端口 B，寄存器基地址 0x4001 0C00。', ['0x4001 0C00', 'GPIO']],
  ['gpioc', 'GPIOC', '通用 I/O 端口 C，寄存器基地址 0x4001 1000。', ['0x4001 1000', 'GPIO']],
  ['adc1', 'ADC1', '12 位模数转换器，C8T6 有 ADC1 和 ADC2，共 12 路外部通道。', ['12 位', 'APB2']],
  ['adc2', 'ADC2', '第二个 12 位 ADC，与 ADC1 共享部分通道。', ['12 位', 'APB2']],
];

const apb2Row2 = [
  ['tim1', 'TIM1', '高级控制定时器，16 位，带互补输出和死区插入，常用于 PWM 控制电机。', ['16 位', 'PWM']],
  ['spi1', 'SPI1', 'SPI 主机/从机接口，SPI1 挂在 APB2 上。', ['SPI']],
  ['usart1', 'USART1', '通用同步异步收发器，挂在 APB2 上，最高 72MHz。', ['串口']],
  ['exti', 'EXTI/AFIO', '外部中断控制器与复用功能重映射（AFIO）。', ['中断', '重映射']],
  ['gpiod', 'GPIOD', '通用 I/O 端口 D，C8T6 只有 PD0/PD1 两个引脚。', ['0x4001 1400', 'GPIO']],
];

const apb1Row1 = [
  ['tim2', 'TIM2–4', '三个通用 16 位定时器，可做输入捕获、输出比较和 PWM。', ['16 位', 'APB1']],
  ['usart2', 'USART2/3', '两个通用串口，挂在 APB1 上。', ['串口', 'APB1']],
  ['i2c', 'I2C1/2', 'I2C 总线接口，支持标准/快速模式，可使用 DMA。', ['I2C', 'APB1']],
  ['spi2', 'SPI2', 'SPI2 挂在 APB1 上，可配合 DMA 收发。', ['SPI', 'APB1']],
];

const apb1Row2 = [
  ['can', 'CAN', 'bxCAN 控制器，支持 CAN 2.0A/B。', ['CAN', 'APB1']],
  ['usb', 'USB', 'USB 全速设备接口。', ['USB', 'APB1']],
  ['rtc', 'RTC/PWR/BKP', '实时时钟、电源控制和后备寄存器，可由 VBAT 供电。', ['RTC', '低功耗']],
  ['iwdg', 'IWDG/WWDG', '独立看门狗与窗口看门狗。', ['看门狗']],
];

apb2Row1.forEach(([id, label, desc, tags], index) => {
  BLOCKS.push(mini(id, label, [5.2 + index * 0.85, Y_MINI, 0.85], desc, tags));
});
apb2Row2.forEach(([id, label, desc, tags], index) => {
  BLOCKS.push(mini(id, label, [5.2 + index * 0.85, Y_MINI, 1.95], desc, tags));
});
apb1Row1.forEach(([id, label, desc, tags], index) => {
  BLOCKS.push(mini(id, label, [5.2 + index * 0.9, Y_MINI, 3.75], desc, tags));
});
apb1Row2.forEach(([id, label, desc, tags], index) => {
  BLOCKS.push(mini(id, label, [5.2 + index * 0.9, Y_MINI, 5.15], desc, tags));
});

// —— 总线走线 ——
// points 按“信号方向”排列；y 固定在晶圆表面上方。
const ty = 1.47;

export const TRACES = {
  icode: {
    points: [[-5.7, ty, -4.4], [-4.6, ty, -4.4], [-4.6, ty, -6.2], [0.9, ty, -6.2], [0.9, ty, -5.2]],
    width: 0.12,
    color: 0x38e8c8,
    label: 'ICode · 指令 → Flash 接口',
    labelPos: [-2.4, 1.95, -6.2],
  },
  dcode: {
    points: [[-5.7, ty, -3.2], [-4.0, ty, -3.2]],
    width: 0.10,
    color: 0x38e8c8,
    label: 'DCode → Flash/SRAM',
    labelPos: [-5.2, 2.15, -3.2],
  },
  system: {
    points: [[-5.7, ty, -2.0], [-4.6, ty, -2.0], [-4.0, ty, -2.0]],
    width: 0.10,
    color: 0x38e8c8,
    label: '系统总线 → 外设',
    labelPos: [-4.8, 2.3, -2.0],
  },
  'matrix-flashif': {
    points: [[0.0, ty, -4.2], [0.6, ty, -4.2], [0.6, ty, -5.2], [0.9, ty, -5.2]],
    width: 0.13,
    color: 0x22d3ee,
    label: '',
  },
  'flashif-flash': {
    points: [[3.1, ty, -5.2], [4.4, ty, -5.2]],
    width: 0.13,
    color: 0x4ade80,
    label: '',
  },
  'matrix-sram': {
    points: [[0.0, ty, -2.4], [4.4, ty, -2.4]],
    width: 0.13,
    color: 0x60a5fa,
    label: '',
  },
  'matrix-fsmc': {
    points: [[0.0, ty, -2.0], [0.6, ty, -2.0], [0.6, ty, -1.6], [0.85, ty, -1.6]],
    width: 0.10,
    color: 0x35505c,
    label: '',
  },
  'matrix-ahb': {
    points: [[-2.0, ty, -1.4], [-2.0, ty, 1.5], [1.7, ty, 1.5]],
    width: 0.16,
    color: 0xffb347,
    label: 'AHB 系统总线',
    labelPos: [0.0, 1.72, 1.2],
  },
  'ahb-b2': {
    points: [[1.7, ty, 1.5], [1.7, ty, 0.7], [1.75, ty, 0.7]],
    width: 0.12,
    color: 0xc084fc,
    label: '',
  },
  'ahb-b1': {
    points: [[1.7, ty, 1.5], [1.7, ty, 2.4], [1.75, ty, 2.4]],
    width: 0.12,
    color: 0xc084fc,
    label: '',
  },
  'b2-apb2': {
    points: [[3.05, ty, 0.7], [4.0, ty, 0.7], [4.0, ty, 1.4], [4.9, ty, 1.4]],
    width: 0.14,
    color: 0x38bdf8,
    label: 'APB2 · 72MHz',
    labelPos: [4.6, 1.70, 0.55],
  },
  'b1-apb1': {
    points: [[3.05, ty, 2.4], [4.2, ty, 2.4], [4.2, ty, 4.5], [4.9, ty, 4.5]],
    width: 0.14,
    color: 0x818cf8,
    label: 'APB1 · 36MHz',
    labelPos: [4.2, 1.76, 4.2],
  },
  'dma1-matrix': {
    points: [[-7.1, ty, 1.9], [-6.4, ty, 1.9], [-6.4, ty, -0.8], [-3.2, ty, -0.8], [-3.2, ty, -1.4]],
    width: 0.14,
    color: 0xff9f43,
    label: 'DMA 总线',
    labelPos: [-6.2, 1.76, 0.6],
  },
  'dma2-matrix': {
    points: [[-7.05, ty, 4.9], [-6.4, ty, 4.9], [-6.4, ty, 1.9]],
    width: 0.08,
    color: 0x6b4f33,
    dashed: true,
    label: '',
  },
  'dma-request': {
    points: [[8.0, ty, 5.9], [8.0, ty, 6.9], [-6.4, ty, 6.9], [-6.4, ty, 5.4], [-7.0, ty, 5.4]],
    width: 0.07,
    color: 0xffd166,
    dashed: true,
    label: 'DMA 请求 · 外设 → DMA',
    labelPos: [2.0, 1.76, 6.9],
  },
  'rcc-matrix': {
    points: [[-2.2, ty, 1.6], [-2.2, ty, -1.4]],
    width: 0.07,
    color: 0xfacc15,
    dashed: true,
    label: '',
    labelPos: [-2.2, 1.92, 0.3],
  },
  'rcc-bridge': {
    points: [[-1.4, ty, 2.3], [1.0, ty, 2.3], [1.0, ty, 2.9], [1.75, ty, 2.9]],
    width: 0.07,
    color: 0xfacc15,
    dashed: true,
    label: '',
  },
};

// —— 章节 ——
export const CHAPTERS = [
  {
    no: '01',
    title: '芯片剖面',
    narration: '严格按参考手册图1布置：左上 Cortex-M3，中央总线矩阵，右上 Flash，右侧 SRAM/FSMC，右下 AHB2APB 桥，APB2/APB1 两块外设板，左下 DMA，底部 RCC。拖动旋转，滚轮缩放，点击任意模块看说明。',
    camera: [0, 24, 20],
    target: [0, 1.6, 0],
    flow: 'fetch',
    labels: 'all',
    focus: ['*'],
  },
  {
    no: '02',
    title: '内核与总线',
    narration: '四个驱动单元：Cortex-M3 的 DCode/系统总线、DMA1、DMA2；四个被动单元：Flash 接口、SRAM、FSMC、AHB2APB 桥。总线矩阵用轮换算法仲裁。',
    camera: [4, 18, 14],
    target: [-3.5, 1.6, -2.8],
    flow: 'fetch',
    labels: 'main',
    focus: ['core', 'icode', 'dcode', 'matrix', 'dma1', 'dma2', 'flashif', 'sram', 'flash', 'fsmc', 'bridge1', 'bridge2'],
  },
  {
    no: '03',
    title: '存储映像',
    narration: '4GB 线性地址空间：Flash 从 0x0800 0000 开始，SRAM 从 0x2000 0000 开始，外设寄存器从 0x4000 0000 开始。C8T6 是 64KB Flash + 20KB SRAM。',
    camera: [10, 18, 12],
    target: [3.5, 1.6, -4.2],
    flow: 'data',
    labels: 'main',
    focus: ['flash', 'sram', 'flashif', 'matrix', 'core'],
  },
  {
    no: '04',
    title: '外设分工',
    narration: 'APB2 最高 72MHz，挂 GPIO、ADC、TIM1、SPI1、USART1；APB1 最高 36MHz，挂 TIM2–4、USART2/3、I2C、SPI2、CAN、USB 等。右侧索引可点选具体外设。',
    camera: [12, 18, 18],
    target: [5.5, 1.5, 3.2],
    flow: 'periph',
    labels: 'periph',
    focus: ['bridge1', 'bridge2', 'apb1', 'apb2', 'gpioa', 'gpiob', 'gpioc', 'adc1', 'adc2', 'tim1', 'spi1', 'usart1', 'exti', 'tim2', 'usart2', 'i2c', 'spi2', 'can', 'usb', 'rtc', 'iwdg'],
  },
  {
    no: '05',
    title: 'DMA 搬运',
    narration: 'DMA1 有 7 个通道，可在存储器与外设之间搬运数据，不占 CPU；它和 CPU 一起通过总线矩阵分时访问 SRAM、Flash 和外设。底部虚线是外设发给 DMA 的请求。',
    camera: [-2, 18, 20],
    target: [-4.5, 1.5, 3.0],
    flow: 'dma',
    labels: 'main',
    focus: ['dma1', 'dma2', 'matrix', 'sram', 'flash', 'apb1', 'apb2'],
  },
  {
    no: '06',
    title: '时钟与复位',
    narration: 'RCC 产生 HSI/HSE，经 PLL 倍频到 72MHz，再分频出 HCLK、PCLK2（72MHz）、PCLK1（36MHz）。复位后外设时钟默认关闭，使用前要先开时钟。',
    camera: [-12, 18, 16],
    target: [-2.0, 1.5, 2.0],
    flow: 'clock',
    labels: 'main',
    focus: ['rcc', 'matrix', 'bridge1', 'bridge2', 'apb1', 'apb2', 'core'],
  },
];

// —— 数据流（引用 TRACES 的 id） ——
export const FLOWS = {
  fetch: {
    label: '取指',
    color: 0x38f0d0,
    speed: 0.22,
    count: 24,
    segments: ['icode', 'flashif-flash'],
  },
  data: {
    label: '取数',
    color: 0xffb347,
    speed: 0.2,
    count: 22,
    segments: ['dcode', 'matrix-sram', 'matrix-flashif'],
  },
  periph: {
    label: '外设',
    color: 0xc084fc,
    speed: 0.19,
    count: 24,
    segments: ['system', 'matrix-ahb', 'ahb-b2', 'b2-apb2'],
  },
  dma: {
    label: 'DMA',
    color: 0x4ade80,
    speed: 0.18,
    count: 24,
    segments: ['dma1-matrix', 'matrix-sram', 'dma-request'],
  },
  clock: {
    label: '时钟',
    color: 0xfacc15,
    speed: 0.13,
    count: 18,
    segments: ['rcc-matrix', 'rcc-bridge', 'b2-apb2', 'b1-apb1'],
  },
};

export const BLOCK_MAP = Object.fromEntries(BLOCKS.map((block) => [block.id, block]));
