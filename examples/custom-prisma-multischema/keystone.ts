import { config } from '@keystone-6/core';

import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    extendPrismaSchema: schema => {
      require('fs').writeFileSync('schema.tmp', schema)
      return schema
        .replace(/(generator [^}]+)}/g, '$1binaryTargets = ["linux-musl"]\n}')
    }
  },
  lists,
});
