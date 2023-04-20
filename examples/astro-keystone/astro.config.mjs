import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // WARNING: this is only needed for our monorepo examples, dont do this
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
