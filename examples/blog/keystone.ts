import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';
import { extendGraphqlSchema } from './extendGraphqlSchemas'


export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  prismaPreviewFeatures: ["orderByRelation"],
  lists,
  extendGraphqlSchema,
});
