import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
});
