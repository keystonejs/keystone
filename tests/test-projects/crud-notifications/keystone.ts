import { config } from '@keystone-next/keystone';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',
    onConnect: async context => {
      context.lists.Task.createMany({
        data: Array.from(Array(75).keys()).map(key => {
          if (key >= 50) {
            return {
              label: `delete me ${key - 50}`,
            };
          } else {
            console.log(key);
            return {
              label: `do not delete ${key}`,
            };
          }
        }),
      });
    },
  },
  lists,
});
