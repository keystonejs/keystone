import { config } from '@keystone-6/core';
import { fixPrismaPath } from './../../sandbox/utils';
import { lists, extendGraphqlSchema } from './schemas';

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
