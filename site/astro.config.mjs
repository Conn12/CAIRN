import { defineConfig } from 'astro/config';

// 静态输出，零运行时。
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
