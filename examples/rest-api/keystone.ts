import { config } from '@keystone-6/core';
import { lists } from './schema';
import { insertSeedData } from './seed-data';
import { getTasks } from './routes/tasks';

/*
  A quick note on types: normally if you're adding custom properties to your
  express request you'd extend the global Express namespace, but we're not
  doing that here because we're in the keystone monorepo; so we're casting
  the request and keystone context with `as` instead to keep this local.
*/

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
  server: {
    /*
      This is the main part of this example. Here we include a function that
      takes the express app Keystone created, and does two things:
      - Adds a middleware function that will run on requests matching our REST
        API routes, to get a keystone context on `req`. This means we don't
        need to put our route handlers in a closure and repeat it for each.
      - Adds a GET handler for tasks, which will query for tasks in the
        Keystone schema and return the results as JSON
    */
    extendExpressApp: (app, createContext) => {
      app.use('/rest', async (req, res, next) => {
        (req as any).context = await createContext(req, res);
        next();
      });
      app.get('/rest/tasks', getTasks);
    },
  },
  lists,
});
