export interface LearningChapter {
  id: string;
  title: string;
}

export interface LearningProject {
  id: string;
  title: string;
  sub: string;
  status: string;
  chapters: LearningChapter[];
}

export const learningProjects: LearningProject[] = [
  {
    id: 'ota-upgrade',
    title: 'OTA 固件升级',
    sub: 'STM32F103ZET6 · 串口 IAP',
    status: '项目 01 · 第一轮',
    chapters: [
      { id: 'overview', title: '项目概况' },
      { id: 'memory', title: '内存与启动' },
      { id: 'split', title: 'Bootloader 与 APP' },
      { id: 'stage-01', title: '第一版串口收包' },
      { id: 'ymodem', title: 'YMODEM 协议' },
      { id: 'encryption', title: '加密与外部暂存' },
      { id: 'final-flow', title: '完整升级流程' },
      { id: 'demo', title: '流程动画' },
      { id: 'limits', title: '还没做到的事' },
      { id: 'quiz', title: '自测' },
      { id: 'files', title: '关键文件' },
    ],
  },
];
