import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // This vite config is only required to make astro work within the Keystone Monorepo, you should not need these settings in your own project
  vite: {
    ssr: {
      external: [
        '@apollo/cache-control-types',
        '@aws-crypto/crc32',
        '@aws-crypto/crc32c',
        '@sindresorhus/slugify',
        'bcryptjs',
        'cuid',
        'dataloader',
        'dumb-passwords',
        'entities',
        'fast-xml-parser',
        'filenamify',
        'fs-extra',
        'image-size',
        'inflection',
        'p-limit',
        'pluralize',
      ],
    },
  },
});
