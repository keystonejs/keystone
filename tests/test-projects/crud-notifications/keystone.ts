import { config } from '@keystone-next/keystone';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',
    async onConnect(context) {
      await context.lists.Task.createMany({
        data: [...Array.from(Array(50).keys())].map(key => {
          return { label: `do not delete ${key}` };
        }),
      });

      await context.lists.Task.createMany({
        data: [...Array.from(Array(25).keys())].map(key => {
          return { label: `deletable ${key}` };
        }),
      });
    },
  },
  lists,
});
