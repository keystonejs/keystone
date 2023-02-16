import { list, config } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./app.db',
    useMigrations: true,
    prismaPath: 'node_modules/.fixturesprisma/client',
  },
  ui: { isDisabled: true },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {},
    }),
  },
});
