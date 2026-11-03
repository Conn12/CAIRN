export interface ModelEntry {
  id: string;
  title: string;
  sub: string;
  kind: string;
  status: string;
  tech: string[];
  summary: string;
  href: string;
  accent: string;
}

export const models: ModelEntry[] = [
  {
    id: 'mcu-3d',
    title: 'STM32 系统结构',
    sub: 'Cortex-M3 · 总线 / 存储 / 外设',
    kind: '芯片',
    status: '已完成',
    tech: ['Three.js', 'WebGL2'],
    summary: '把 STM32F103C8T6 的内部结构剖开：总线矩阵、Flash、SRAM、APB 外设和 DMA。',
    href: '/models/mcu-3d/',
    accent: '#ffb347',
  },
  {
    id: 'ec-s100-watch',
    title: 'EC-S100 手表演示台',
    sub: 'STM32F411 · 扩展板 · 240×280 屏',
    kind: '板卡',
    status: '开发中',
    tech: ['Three.js', 'WebGL2', 'LVGL'],
    summary: '主控板、扩展板和可插拔的屏幕模块；还原 22 个界面、传感器和 OTA 升级链路。',
    href: '/models/ec-s100-watch/',
    accent: '#3ff0c8',
  },
];

export const modelCount = models.length;
