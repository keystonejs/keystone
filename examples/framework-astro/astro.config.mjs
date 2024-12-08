import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  // WARNING: this is only needed for our monorepo examples, dont do this
  vite: {
    ssr: {
      external: [
        '@keystone-6/core',
        '@keystone-6/core/context',
        '@keystone-6/core/fields',
        'myprisma'
      ],
    },
  },
})
