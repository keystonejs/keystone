import { config } from '@keystone-next/keystone/schema';

import { Post } from './schema';

export default config({
  db: { adapter: 'prisma_sqlite', url: 'file:./app.db' },
  experimental: {
    prismaSqlite: true,
    generateNextGraphqlAPI: true,
    generateNodeAPI: true,
  },
  lists: { Post },
});
