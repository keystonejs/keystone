import { config } from '@keystone-next/keystone';
import { KeystoneContext } from '../../packages/types/src';
import { lists } from './schema';
import { insertSeedData } from './seed-data';

type Context = KeystoneContext & { foo: string };

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    async onConnect(context) {
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(context);
      }
    },
  },
  lists,
  graphql: {
    // Example usage for RFC, will document/exemplify this elsewhere before merging.
    extendContext: _context => {
      // We need to return the same object, but we need to tell typescript its new type,
      // so we reassign the input and use an 'as' statement to set the type
      const context = _context as Context;
      context.foo = 'bar';
      return context;
    },
  },
});
