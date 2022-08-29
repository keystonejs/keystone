import { config } from '@keystone-6/core';
import { models } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',
  },
  models,
});
