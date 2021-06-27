import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';

export default config({
  db: { useMigrations: false, provider: 'mongodb', url: 'mongodb://localhost/keystone-json-mongo-prisma', },
  lists,
});
