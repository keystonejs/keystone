import { config } from '@keystone-6/core';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    extendPrismaSchema: schema => {
      // we want to force binary to be linux-musl
      return schema
        .replace(/(generator [^}]+)}/g, '$1binaryTargets = ["linux-musl"]\n}');
    }
  },
  lists,
});
