import { list, config } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { fixPrismaPath } from '../example-utils';
import type { TypeInfo } from '.keystone/types';

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: `file:./keystone.db`,

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  server: {
    port: 4000,
  },
  lists: {
    User: list({
      access: ({ session }) => !!session,
      fields: {
        name: text(),
        email: text({ isIndexed: 'unique' }),
        password: text(),
        about: text(),
      },
    }),
  },
});
