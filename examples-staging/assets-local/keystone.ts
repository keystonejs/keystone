import { config } from '@keystone-6/core';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  storage: {
    images: { kind: 'local', type: 'image', baseUrl: '/extra-base-url' },
    files: { kind: 'local', type: 'file' },
  },
});
