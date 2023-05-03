import { config } from '@keystone-6/core';
import { fixNextConfig, fixPrismaPath } from '../example-utils';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    extendPrismaSchema: (schema: any) => {
      return schema.replace(
        /(generator [^}]+)}/g,
        ['$1binaryTargets = ["native", "linux-musl"]', '}'].join('\n')
      );
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  ui: {
    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixNextConfig,
  },
  lists,
});
