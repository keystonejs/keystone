import { config } from '@keystone-6/core';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'undici';
import { fixPrismaPath } from '../example-utils';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    prismaAdapter: () => {
      neonConfig.webSocketConstructor = WebSocket;

      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      return new PrismaNeon(pool);
    },

    extendPrismaSchema: (schema: any) => {
      return schema.replace(
        /(generator [^}]+)}/g,
        ['$1previewFeatures = ["driverAdapters"]', '}'].join('\n')
      );
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
});
