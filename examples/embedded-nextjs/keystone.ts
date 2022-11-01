import { config } from '@keystone-6/core';

import { Post } from './schema';

export default config({
  db: { provider: 'sqlite', url: 'file:./app.db' },
  experimental: {
    generateNextGraphqlAPI: true,
  },
  lists: { Post },
});
