import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',
    async onConnect(context) {
      await context.lists.Task.createMany({
        data: [
          {
            label: 'do not delete',
          },
          {
            label: 'delete',
          },
          {
            label: 'do not destroy',
          },
          {
            label: 'destroy',
          },
          {
            label: 'do not kill',
          },
          {
            label: 'gently lay to rest',
          },
        ],
      });
    },
  },
  lists,
});
