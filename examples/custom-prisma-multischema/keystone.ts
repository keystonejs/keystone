import { config } from '@keystone-6/core';

import { lists } from './schema';

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    extendPrismaSchema: schema => {
      require('fs').writeFileSync('schema.tmp', schema)
      return schema
        .replace(/(\ngenerator[^\n]+\{[^\}]+)\}/, '$1  previewFeatures = ["multiSchema"]\n}')
        .replace(/(datasource[^\n]+\{[^\}]+)\}/, '$1  schemas = ["Auth", "Content"]\n}')
    }
  },
  lists,
});
