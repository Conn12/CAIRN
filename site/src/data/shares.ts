export interface ShareItem {
  id: string;
  title: string;
  sub: string;
}

export interface ShareCategory {
  title: string;
  items: ShareItem[];
}

export const shareCategories: ShareCategory[] = [
  {
    title: '图片分享',
    items: [
      { id: 'pelican-bike', title: '鹈鹕骑自行车', sub: '矢量插画' },
      { id: 'elephant-piano', title: '大象弹钢琴', sub: '矢量插画' },
    ],
  },
  {
    title: '工具分享',
    items: [{ id: 'calculator', title: '在线计算器', sub: '可直接使用' }],
  },
  {
    title: '建模分享',
    items: [{ id: 'solar-system', title: '太阳系', sub: 'Three.js 3D' }],
  },
];

export const shareCount = shareCategories.reduce(
  (total, category) => total + category.items.length,
  0,
);
