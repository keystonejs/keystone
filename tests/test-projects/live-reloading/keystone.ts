import { config } from '@keystone-6/core';
import { lists, extendGraphqlSchema } from './schema';
import { fixPrismaPath } from './../../sandbox/utils';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',

    // WARNING: this is only needed for examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  extendGraphqlSchema,
  ui: {
    getAdditionalFiles: [
      () => [
        {
          mode: 'write',
          src: "export default function(req,res) {res.send('something')}",
          outputPath: 'pages/api/blah/[...rest].js',
        },
      ],
    ],
  },
});
