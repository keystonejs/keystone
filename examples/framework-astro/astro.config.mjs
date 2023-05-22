import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // WARNING: this is only needed for our monorepo examples, dont do this
  vite: {
    ssr: {
      external: ['@keystone-6/core/context', '@keystone-6/core', '@keystone-6/core/fields'],
    },
  },
});
