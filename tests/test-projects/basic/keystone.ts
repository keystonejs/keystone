import { config } from '@keystone-6/keystone';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',
  },
  lists,
});
