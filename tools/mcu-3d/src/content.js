// STM32F103C8T6 系统结构 —— 场景数据
// 依据：《STM32中文参考手册V10》第 2 章（24–33 页）、第 6 章时钟树（56 页）
//       《STM32教程（HAL版）_讲义》第 9 页（C8T6 资源）、第 30 页（存储器映像）

export const BLOCKS = [
  {
    id: 'core',
    label: 'Cortex-M3',
    meta: '内核 · 72MHz',
    pos: [-5.2, 4.6, 0],
    size: [2.6, 1.4, 2.6],
    color: 0x6f7bff,
    group: 'core',
    desc: '取指、译码、执行都在这里完成，内部还有 NVIC 中断控制器。它通过 ICode、DCode 和系统总线三条通道接入总线矩阵。',
    tags: ['驱动单元', 'NVIC', '72MHz'],
  },
  {
    id: 'icode',
    label: 'ICode',
    meta: '指令总线',
    pos: [-3.15, 5.3, -0.95],
    size: [1.7, 0.22, 0.3],
    color: 0x38e8c8,
    group: 'bus',
    desc: '把 Cortex-M3 的指令总线接到 Flash 指令接口，指令预取在这条总线上完成。',
    tags: ['指令', 'Flash'],
  },
  {
    id: 'dcode',
    label: 'DCode',
    meta: '数据总线',
    pos: [-3.15, 5.0, 0],
    size: [1.7, 0.22, 0.3],
    color: 0x38e8c8,
    group: 'bus',
    desc: '把内核的 DCode 总线接到 Flash 数据接口，负责常量加载和调试访问。',
    tags: ['数据', 'Flash'],
  },
  {
    id: 'sysbus',
    label: '系统总线',
    meta: '外设访问',
    pos: [-3.15, 4.7, 0.95],
    size: [1.7, 0.22, 0.3],
    color: 0x38e8c8,
    group: 'bus',
    desc: '内核的外设总线，经总线矩阵访问 SRAM、Flash 和所有 APB 外设。',
    tags: ['外设', '总线矩阵'],
  },
  {
    id: 'matrix',
    label: '总线矩阵',
    meta: '4 主 · 4 从 · 轮换仲裁',
    pos: [0, 4.7, 0],
    size: [1.8, 1.9, 1.8],
    color: 0xffb347,
    group: 'bus',
    desc: '协调 Cortex-M3 与 DMA 的访问。4 个驱动端口：DCode、系统总线、DMA1、DMA2；4 个被动端口：Flash 接口、SRAM、FSMC、AHB2APB 桥。仲裁使用轮换算法。',
    tags: ['AHB', '仲裁', '4×4'],
  },
  {
    id: 'flashif',
    label: 'Flash 接口',
    meta: 'FLITF · 预取 2×64 位',
    pos: [2.5, 4.5, -1.9],
    size: [1.4, 0.8, 1.2],
    color: 0x22d3ee,
    group: 'mem',
    desc: 'Flash 存储器的读取接口，带两个 64 位预取缓冲。CPU 取指和 DMA 访问都要经过它。',
    tags: ['预取', 'FLITF'],
  },
  {
    id: 'flash',
    label: 'Flash',
    meta: '64KB · 0x0800 0000',
    pos: [5.0, 4.5, -1.9],
    size: [1.8, 0.7, 1.8],
    color: 0x4ade80,
    group: 'mem',
    desc: 'C8T6 内置 64KB Flash，存放程序。主存储块按 1KB 一页组织，另有系统存储器和选项字节；擦除按页进行。',
    tags: ['非易失', '0x0800 0000', '64KB'],
  },
  {
    id: 'sram',
    label: 'SRAM',
    meta: '20KB · 0x2000 0000',
    pos: [4.8, 4.5, 0.6],
    size: [1.8, 0.8, 1.4],
    color: 0x60a5fa,
    group: 'mem',
    desc: 'C8T6 内置 20KB SRAM，存放运行时变量和栈。CPU 可以 0 等待周期读写，DMA 也能直接访问。',
    tags: ['易失', '0x2000 0000', '20KB'],
  },
  {
    id: 'fsmc',
    label: 'FSMC',
    meta: '外部存储器 · 部分型号',
    pos: [3.2, 4.3, 2.3],
    size: [1.5, 0.6, 1.1],
    color: 0x35505c,
    ghost: true,
    group: 'mem',
    desc: '外部存储器控制器，把外部 SRAM、NOR、NAND 映射进 CPU 地址空间。C8T6 没有 FSMC，大容量型号才有。',
    tags: ['外部存储', '部分型号'],
  },
  {
    id: 'bridge',
    label: 'AHB2APB 桥',
    meta: 'APB2 72MHz / APB1 36MHz',
    pos: [0, 4.1, 2.6],
    size: [1.5, 0.7, 1.1],
    color: 0xc084fc,
    group: 'periph',
    desc: '两个同步桥，把 AHB 上的访问分到 APB2 和 APB1。APB2 可跑满 72MHz，APB1 最高 36MHz。',
    tags: ['同步桥', 'APB2', 'APB1'],
  },
  {
    id: 'apb2',
    label: 'APB2',
    meta: '72MHz · 高速外设',
    pos: [3.1, 3.5, 3.9],
    size: [2.6, 0.25, 1.2],
    color: 0x38bdf8,
    group: 'periph',
    desc: '高速外设总线：GPIOA–C、ADC1/2、TIM1、SPI1、USART1、EXTI/AFIO。',
    tags: ['72MHz', '高速'],
  },
  {
    id: 'apb1',
    label: 'APB1',
    meta: '36MHz · 低速外设',
    pos: [-0.5, 3.1, 4.35],
    size: [2.9, 0.25, 1.2],
    color: 0x818cf8,
    group: 'periph',
    desc: '低速外设总线：TIM2–4、USART2/3、I2C1/2、SPI2、CAN、USB、RTC、PWR、BKP、IWDG/WWDG。',
    tags: ['36MHz', '低速'],
  },
  {
    id: 'dma1',
    label: 'DMA1',
    meta: '7 通道 · 通用 DMA',
    pos: [-4.7, 4.0, 1.8],
    size: [2.0, 0.9, 1.2],
    color: 0xff9f43,
    group: 'dma',
    desc: '7 个独立通道，可在存储器与外设之间搬运数据，支持环形缓冲。每个通道有专门的请求逻辑，也可以软件触发。',
    tags: ['驱动单元', '7 通道'],
  },
  {
    id: 'dma2',
    label: 'DMA2',
    meta: '5 通道 · 部分型号 · C8T6 无',
    pos: [-4.9, 3.2, 3.7],
    size: [1.7, 0.8, 1.2],
    color: 0x6b4f33,
    ghost: true,
    group: 'dma',
    desc: '第二个 DMA 控制器，只有部分型号才有。C8T6 只有 DMA1，所以这里画成虚体。',
    tags: ['部分型号'],
  },
  {
    id: 'rcc',
    label: 'RCC',
    meta: '复位与时钟 · PLL → 72MHz',
    pos: [-2.6, 3.5, 1.4],
    size: [1.3, 0.7, 1.1],
    color: 0xfacc15,
    group: 'clock',
    desc: '复位和时钟控制。8MHz HSI 或 8MHz HSE 经 PLL 倍频到 72MHz，再分频出 HCLK、PCLK2、PCLK1。复位后外设时钟默认关闭，使用前要先开。',
    tags: ['PLL', '72MHz', '复位'],
  },
];

// —— APB2 / APB1 挂载的小外设 ——
const MINI_SIZE = [0.4, 0.3, 0.34];

function mini(id, label, pos, desc, tags) {
  return {
    id,
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

const apb2Row1 = ['gpioa', 'gpiob', 'gpioc', 'adc1', 'adc2'];
const apb2Row2 = ['tim1', 'spi1', 'usart1', 'exti'];

for (let i = 0; i < apb2Row1.length; i += 1) {
  const x = 2.02 + i * 0.54;
  const id = apb2Row1[i];
  if (id === 'gpioa') BLOCKS.push(mini(id, 'GPIOA', [x, 3.86, 3.62], '通用 I/O 端口 A，寄存器基地址 0x4001 0800。有 CRL/CRH/IDR/ODR/BSRR 等寄存器。', ['0x4001 0800', 'GPIO']));
  if (id === 'gpiob') BLOCKS.push(mini(id, 'GPIOB', [x, 3.86, 3.62], '通用 I/O 端口 B，寄存器基地址 0x4001 0C00。', ['0x4001 0C00', 'GPIO']));
  if (id === 'gpioc') BLOCKS.push(mini(id, 'GPIOC', [x, 3.86, 3.62], '通用 I/O 端口 C，寄存器基地址 0x4001 1000。', ['0x4001 1000', 'GPIO']));
  if (id === 'adc1') BLOCKS.push(mini(id, 'ADC1', [x, 3.86, 3.62], '12 位模数转换器，C8T6 有 ADC1 和 ADC2，共 12 路外部通道。', ['12 位', 'APB2']));
  if (id === 'adc2') BLOCKS.push(mini(id, 'ADC2', [x, 3.86, 3.62], '第二个 12 位 ADC，与 ADC1 共享部分通道。', ['12 位', 'APB2']));
}

for (let i = 0; i < apb2Row2.length; i += 1) {
  const x = 2.02 + i * 0.54;
  const id = apb2Row2[i];
  if (id === 'tim1') BLOCKS.push(mini(id, 'TIM1', [x, 3.34, 4.18], '高级控制定时器，16 位，带互补输出和死区插入，常用于 PWM 控制电机。', ['16 位', 'PWM']));
  if (id === 'spi1') BLOCKS.push(mini(id, 'SPI1', [x, 3.34, 4.18], 'SPI 主机/从机接口，SPI1 挂在 APB2 上。', ['SPI']));
  if (id === 'usart1') BLOCKS.push(mini(id, 'USART1', [x, 3.34, 4.18], '通用同步异步收发器，挂在 APB2 上，最高 72MHz。', ['串口']));
  if (id === 'exti') BLOCKS.push(mini(id, 'EXTI/AFIO', [x, 3.34, 4.18], '外部中断控制器与复用功能重映射（AFIO）。', ['中断', '重映射']));
}

const apb1Row1 = ['tim2', 'usart2', 'i2c', 'spi2'];
const apb1Row2 = ['can', 'usb', 'rtc', 'iwdg'];

for (let i = 0; i < apb1Row1.length; i += 1) {
  const x = -1.66 + i * 0.56;
  const id = apb1Row1[i];
  if (id === 'tim2') BLOCKS.push(mini(id, 'TIM2–4', [x, 3.46, 4.05], '三个通用 16 位定时器，可做输入捕获、输出比较和 PWM。', ['16 位', 'APB1']));
  if (id === 'usart2') BLOCKS.push(mini(id, 'USART2/3', [x, 3.46, 4.05], '两个通用串口，挂在 APB1 上。', ['串口', 'APB1']));
  if (id === 'i2c') BLOCKS.push(mini(id, 'I2C1/2', [x, 3.46, 4.05], 'I2C 总线接口，支持标准/快速模式，可使用 DMA。', ['I2C', 'APB1']));
  if (id === 'spi2') BLOCKS.push(mini(id, 'SPI2', [x, 3.46, 4.05], 'SPI2 挂在 APB1 上，可配合 DMA 收发。', ['SPI', 'APB1']));
}

for (let i = 0; i < apb1Row2.length; i += 1) {
  const x = -1.66 + i * 0.56;
  const id = apb1Row2[i];
  if (id === 'can') BLOCKS.push(mini(id, 'CAN', [x, 2.94, 4.62], 'bxCAN 控制器，支持 CAN 2.0A/B。', ['CAN', 'APB1']));
  if (id === 'usb') BLOCKS.push(mini(id, 'USB', [x, 2.94, 4.62], 'USB 全速设备接口。', ['USB', 'APB1']));
  if (id === 'rtc') BLOCKS.push(mini(id, 'RTC/PWR/BKP', [x, 2.94, 4.62], '实时时钟、电源控制和后备寄存器，可由 VBAT 供电。', ['RTC', '低功耗']));
  if (id === 'iwdg') BLOCKS.push(mini(id, 'IWDG/WWDG', [x, 2.94, 4.62], '独立看门狗与窗口看门狗。', ['看门狗']));
}

// —— 章节 ——
export const CHAPTERS = [
  {
    no: '01',
    title: '芯片剖面',
    narration: 'STM32F103C8T6：Cortex-M3 内核、总线矩阵、Flash、SRAM 与各种外设，全部通过 AHB 总线连成一张网。拖动旋转，滚轮缩放，点击任意模块看说明。',
    camera: [15, 13, 16],
    target: [0, 4, 0.5],
    flow: 'fetch',
    labels: 'all',
    focus: ['*'],
  },
  {
    no: '02',
    title: '内核与总线',
    narration: '四个驱动单元：Cortex-M3 的 DCode/系统总线、DMA1、DMA2；四个被动单元：Flash 接口、SRAM、FSMC、AHB2APB 桥。总线矩阵用轮换算法仲裁。',
    camera: [10, 12, 13],
    target: [-0.8, 4.5, 0],
    flow: 'fetch',
    labels: 'main',
    focus: ['core', 'icode', 'dcode', 'sysbus', 'matrix', 'dma1', 'dma2', 'flashif', 'sram', 'flash', 'fsmc', 'bridge'],
  },
  {
    no: '03',
    title: '存储映像',
    narration: '4GB 线性地址空间：Flash 从 0x0800 0000 开始，SRAM 从 0x2000 0000 开始，外设寄存器从 0x4000 0000 开始。C8T6 是 64KB Flash + 20KB SRAM。',
    camera: [12, 10, 10],
    target: [3.2, 4.5, -0.5],
    flow: 'data',
    labels: 'main',
    focus: ['flash', 'sram', 'flashif', 'matrix', 'core'],
  },
  {
    no: '04',
    title: '外设分工',
    narration: 'APB2 最高 72MHz，挂 GPIO、ADC、TIM1、SPI1、USART1；APB1 最高 36MHz，挂 TIM2–4、USART2/3、I2C、SPI2、CAN、USB 等。右侧索引可点选具体外设。',
    camera: [12, 11, 17],
    target: [0.9, 3.5, 3.2],
    flow: 'periph',
    labels: 'periph',
    focus: ['bridge', 'apb1', 'apb2', 'gpioa', 'gpiob', 'gpioc', 'adc1', 'adc2', 'tim1', 'spi1', 'usart1', 'exti', 'tim2', 'usart2', 'i2c', 'spi2', 'can', 'usb', 'rtc', 'iwdg'],
  },
  {
    no: '05',
    title: 'DMA 搬运',
    narration: 'DMA1 有 7 个通道，可在存储器与外设之间搬运数据，不占 CPU；它和 CPU 一起通过总线矩阵分时访问 SRAM、Flash 和外设。',
    camera: [-1, 10, 15],
    target: [-2.3, 3.8, 2.4],
    flow: 'dma',
    labels: 'main',
    focus: ['dma1', 'matrix', 'sram', 'flash', 'apb2', 'apb1', 'dma2'],
  },
  {
    no: '06',
    title: '时钟与复位',
    narration: 'RCC 产生 HSI/HSE，经 PLL 倍频到 72MHz，再分频出 HCLK、PCLK2（72MHz）、PCLK1（36MHz）。复位后外设时钟默认关闭，使用前要先开时钟。',
    camera: [-12, 12, 16],
    target: [-2.4, 3.6, 1.6],
    flow: 'clock',
    labels: 'main',
    focus: ['rcc', 'matrix', 'bridge', 'apb1', 'apb2', 'core'],
  },
];

// —— 数据流 ——
export const FLOWS = {
  fetch: {
    label: '取指',
    color: 0x38f0d0,
    speed: 0.26,
    count: 24,
    segments: [
      ['core', 'matrix'],
      ['matrix', 'flashif'],
      ['flashif', 'flash'],
    ],
  },
  data: {
    label: '取数',
    color: 0xffb347,
    speed: 0.24,
    count: 22,
    segments: [
      ['core', 'matrix'],
      ['matrix', 'sram'],
      ['matrix', 'flashif'],
    ],
  },
  periph: {
    label: '外设',
    color: 0xc084fc,
    speed: 0.22,
    count: 24,
    segments: [
      ['core', 'matrix'],
      ['matrix', 'bridge'],
      ['bridge', 'apb2'],
      ['bridge', 'apb1'],
    ],
  },
  dma: {
    label: 'DMA',
    color: 0x4ade80,
    speed: 0.2,
    count: 24,
    segments: [
      ['dma1', 'matrix'],
      ['matrix', 'sram'],
      ['apb2', 'dma1'],
      ['apb1', 'dma1'],
    ],
  },
  clock: {
    label: '时钟',
    color: 0xfacc15,
    speed: 0.14,
    count: 16,
    segments: [
      ['rcc', 'matrix'],
      ['rcc', 'bridge'],
      ['rcc', 'apb1'],
      ['rcc', 'apb2'],
      ['rcc', 'core'],
    ],
  },
};

export const BLOCK_MAP = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));
