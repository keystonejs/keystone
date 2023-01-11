import { config } from '@keystone-6/core';

import { lists } from './schema';

// TODO -- Create a separate example for access control in the Admin UI
// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    extendPrismaSchema: schema =>
      schema
        .replace(/(\ngenerator[^\n]+\{[^\}]+)\}/, '$1  previewFeatures = ["multiSchema"]\n}')
        .replace(/(datasource[^\n]+\{[^\}]+)\}/, '$1  schemas = ["Auth", "Content"]\n}'),
  },
  lists,
});
