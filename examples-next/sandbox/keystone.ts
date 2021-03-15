import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';

export default config({
  db: process.env.DATABASE_URL?.startsWith('postgres')
    ? {
        adapter: 'prisma_postgresql',
        url: process.env.DATABASE_URL,
      }
    : {
        adapter: 'prisma_sqlite',
        url: process.env.DATABASE_URL || 'file:./dev.db',
      },
  experimental: { prismaSqlite: true },
  lists,
});
