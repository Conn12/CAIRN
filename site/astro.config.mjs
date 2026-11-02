import { defineConfig } from 'astro/config';

// 静态输出，零运行时。
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  vite: {
    server: {
      fs: {
        // 允许读取 site 外面的 assets/，图片仍然只有一个家。
        allow: ['..'],
      },
    },
  },
});
