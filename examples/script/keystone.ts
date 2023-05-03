import { config, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, timestamp } from '@keystone-6/core/fields';
import { fixNextConfig, fixPrismaPath } from '../example-utils';
import { TypeInfo } from '.keystone/types';

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // this is called by Keystone on start, or when connect() is called in script.ts
    onConnect: async context => {
      console.log('(keystone.ts)', 'onConnect');
      await context.db.Post.createOne({ data: { title: 'Created in onConnect' } });
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  ui: {
    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixNextConfig,
  },
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
        createdAt: timestamp({
          db: {
            isNullable: false,
          },
          defaultValue: { kind: 'now' },
        }),
      },
    }),
  },
});
